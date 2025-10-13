const { getDistance } = require('geolib');
const logger = require('../utils/logger');

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
function stringSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);

  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(s1, s2);
  return 1 - distance / maxLen;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Check if two pizzerias are duplicates
 * @param {Object} place1
 * @param {Object} place2
 * @returns {Object} - {isDuplicate: boolean, confidence: number}
 */
function areDuplicates(place1, place2) {
  // If from same source with same external_id, definitely duplicates
  if (place1.source === place2.source && place1.external_id === place2.external_id) {
    return { isDuplicate: true, confidence: 1.0 };
  }

  let confidenceScore = 0;
  let matchCount = 0;

  // 1. Name similarity (weight: 0.4)
  const nameSimilarity = stringSimilarity(place1.name, place2.name);
  confidenceScore += nameSimilarity * 0.4;
  if (nameSimilarity > 0.8) matchCount++;

  // 2. Distance between coordinates (weight: 0.3)
  if (place1.coordinates?.lat && place2.coordinates?.lat) {
    const distanceMeters = getDistance(
      { latitude: place1.coordinates.lat, longitude: place1.coordinates.lng },
      { latitude: place2.coordinates.lat, longitude: place2.coordinates.lng }
    );

    // If within 50 meters, likely same place
    const distanceScore = Math.max(0, 1 - distanceMeters / 200);
    confidenceScore += distanceScore * 0.3;
    if (distanceMeters < 50) matchCount++;
  }

  // 3. Phone number match (weight: 0.2)
  if (place1.phone && place2.phone) {
    const phone1 = place1.phone.replace(/\D/g, '');
    const phone2 = place2.phone.replace(/\D/g, '');
    if (phone1 === phone2) {
      confidenceScore += 0.2;
      matchCount++;
    }
  }

  // 4. Address similarity (weight: 0.1)
  if (place1.address && place2.address) {
    const addressSimilarity = stringSimilarity(place1.address, place2.address);
    confidenceScore += addressSimilarity * 0.1;
    if (addressSimilarity > 0.8) matchCount++;
  }

  // Consider duplicate if confidence > 0.7 or at least 2 strong matches
  const isDuplicate = confidenceScore > 0.7 || matchCount >= 2;

  return {
    isDuplicate,
    confidence: Math.round(confidenceScore * 100) / 100,
  };
}

/**
 * Merge duplicate pizzeria data, keeping best information from each
 * @param {Object} primary - Primary pizzeria record
 * @param {Object} duplicate - Duplicate pizzeria record
 * @returns {Object} - Merged pizzeria data
 */
function mergePizzerias(primary, duplicate) {
  return {
    ...primary,
    // Keep better rating
    rating: primary.rating || duplicate.rating
      ? Math.max(primary.rating || 0, duplicate.rating || 0)
      : null,
    // Sum review counts
    review_count: (primary.review_count || 0) + (duplicate.review_count || 0),
    // Fill in missing fields
    phone: primary.phone || duplicate.phone,
    website: primary.website || duplicate.website,
    // Merge metadata
    metadata: {
      ...primary.metadata,
      duplicate_sources: [
        ...(primary.metadata?.duplicate_sources || []),
        duplicate.source,
      ],
      merged_ids: [
        ...(primary.metadata?.merged_ids || []),
        duplicate.external_id,
      ],
    },
  };
}

/**
 * Deduplicate array of pizzerias from multiple sources
 * @param {Array} pizzerias - Array of pizzeria objects
 * @returns {Array} - Deduplicated array
 */
function deduplicatePizzerias(pizzerias) {
  if (!pizzerias || pizzerias.length === 0) return [];

  const unique = [];
  const duplicateMap = new Map();

  for (const place of pizzerias) {
    let foundDuplicate = false;

    for (let i = 0; i < unique.length; i++) {
      const { isDuplicate, confidence } = areDuplicates(unique[i], place);

      if (isDuplicate) {
        // Merge with existing entry
        unique[i] = mergePizzerias(unique[i], place);
        duplicateMap.set(place.external_id, {
          primaryId: unique[i].external_id,
          confidence,
        });
        foundDuplicate = true;
        logger.debug(`Merged duplicate: ${place.name} (confidence: ${confidence})`);
        break;
      }
    }

    if (!foundDuplicate) {
      unique.push(place);
    }
  }

  logger.info(`Deduplication: ${pizzerias.length} -> ${unique.length} (removed ${pizzerias.length - unique.length} duplicates)`);

  return unique;
}

module.exports = {
  areDuplicates,
  mergePizzerias,
  deduplicatePizzerias,
  stringSimilarity,
};
