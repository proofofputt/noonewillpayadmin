const googlePlaces = require('./googlePlaces');
const yelp = require('./yelp');
const { deduplicatePizzerias } = require('./deduplication');
const { zipcodeToCoordinates } = require('../utils/zipcode');
const cache = require('./cache');
const db = require('../database/connection');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Main search function - orchestrates multi-source search
 * @param {string} zipcode
 * @param {number} radiusMiles
 * @param {Object} options
 * @returns {Promise<Object>}
 */
async function searchByZipcode(zipcode, radiusMiles = config.search.defaultRadiusMiles, options = {}) {
  const startTime = Date.now();

  try {
    // 1. Validate and convert zipcode to coordinates
    const location = zipcodeToCoordinates(zipcode);
    if (!location) {
      return {
        success: false,
        error: 'Invalid zipcode',
        results: [],
      };
    }

    const { lat, lng, city, state } = location;

    // 2. Check cache first
    const cacheKey = cache.generateSearchKey(zipcode, radiusMiles);
    const cachedResults = await cache.get(cacheKey);

    if (cachedResults) {
      logger.info(`Cache hit for ${zipcode}`);
      return {
        success: true,
        cached: true,
        location: { zipcode, city, state, lat, lng },
        radius_miles: radiusMiles,
        results: cachedResults,
        count: cachedResults.length,
        response_time_ms: Date.now() - startTime,
      };
    }

    // 3. Search local database first
    const dbResults = await searchDatabase(lat, lng, radiusMiles);
    logger.info(`Found ${dbResults.length} results in local database`);

    // 4. Search external APIs in parallel
    const apiPromises = [];

    if (config.apis.google.enabled) {
      apiPromises.push(
        googlePlaces.searchPizzerias(lat, lng, radiusMiles)
          .catch(err => {
            logger.error('Google Places search failed:', err);
            return [];
          })
      );
    }

    if (config.apis.yelp.enabled) {
      apiPromises.push(
        yelp.searchPizzerias(lat, lng, radiusMiles)
          .catch(err => {
            logger.error('Yelp search failed:', err);
            return [];
          })
      );
    }

    const apiResults = await Promise.all(apiPromises);
    const allExternalResults = apiResults.flat();

    logger.info(`Found ${allExternalResults.length} results from external APIs`);

    // 5. Combine and deduplicate results
    const allResults = [...dbResults, ...allExternalResults];
    const deduplicatedResults = deduplicatePizzerias(allResults);

    // 6. Enrich and score results
    const enrichedResults = await enrichResults(deduplicatedResults, lat, lng);

    // 7. Sort by distance and rating
    enrichedResults.sort((a, b) => {
      if (a.distance_miles !== b.distance_miles) {
        return a.distance_miles - b.distance_miles;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    // 8. Store new results in database (async, don't wait)
    storeNewResults(allExternalResults, zipcode).catch(err =>
      logger.error('Error storing results:', err)
    );

    // 9. Cache results
    await cache.set(cacheKey, enrichedResults);

    // 10. Log search for analytics
    await logSearch(zipcode, lat, lng, radiusMiles, enrichedResults.length, Date.now() - startTime);

    return {
      success: true,
      cached: false,
      location: { zipcode, city, state, lat, lng },
      radius_miles: radiusMiles,
      results: enrichedResults,
      count: enrichedResults.length,
      sources: {
        database: dbResults.length,
        google: config.apis.google.enabled ? apiResults[0]?.length || 0 : 0,
        yelp: config.apis.yelp.enabled ? apiResults[1]?.length || 0 : 0,
      },
      response_time_ms: Date.now() - startTime,
    };
  } catch (error) {
    logger.error('Search error:', error);
    return {
      success: false,
      error: error.message,
      results: [],
      response_time_ms: Date.now() - startTime,
    };
  }
}

/**
 * Search local database using PostGIS
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusMiles
 * @returns {Promise<Array>}
 */
async function searchDatabase(lat, lng, radiusMiles) {
  try {
    const result = await db.query(
      'SELECT * FROM search_pizzerias_by_radius($1, $2, $3)',
      [lat, lng, radiusMiles]
    );

    return result.rows.map(row => ({
      ...row,
      coordinates: { lat: row.latitude, lng: row.longitude },
      source: 'database',
    }));
  } catch (error) {
    logger.error('Database search error:', error);
    return [];
  }
}

/**
 * Enrich results with additional calculated data
 * @param {Array} results
 * @param {number} searchLat
 * @param {number} searchLng
 * @returns {Promise<Array>}
 */
async function enrichResults(results, searchLat, searchLng) {
  return results.map(place => {
    // Calculate distance if not already present
    if (!place.distance_miles && place.coordinates) {
      const { getDistance } = require('geolib');
      const distanceMeters = getDistance(
        { latitude: searchLat, longitude: searchLng },
        { latitude: place.coordinates.lat, longitude: place.coordinates.lng }
      );
      place.distance_miles = Math.round(distanceMeters * 0.000621371 * 100) / 100;
    }

    // Add display score (for ranking)
    place.display_score = calculateDisplayScore(place);

    return place;
  });
}

/**
 * Calculate display/ranking score
 * @param {Object} place
 * @returns {number}
 */
function calculateDisplayScore(place) {
  let score = 0;

  // Distance factor (closer is better)
  if (place.distance_miles) {
    score += Math.max(0, 50 - place.distance_miles * 2);
  }

  // Rating factor
  if (place.rating) {
    score += place.rating * 10;
  }

  // Review count factor (logarithmic)
  if (place.review_count) {
    score += Math.log10(place.review_count + 1) * 5;
  }

  // Delivery bonus
  if (place.has_delivery) {
    score += 10;
  }

  // Dedicated pizzeria bonus
  if (place.is_dedicated_pizzeria) {
    score += 5;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Store new results from external APIs to database
 * @param {Array} results
 * @param {string} zipcode
 */
async function storeNewResults(results, zipcode) {
  if (!results || results.length === 0) return;

  for (const place of results) {
    try {
      await db.query(
        `INSERT INTO pizzerias (
          name, address, city, state, zipcode, coordinates,
          phone, website, is_dedicated_pizzeria, has_delivery,
          has_pizza_menu, rating, review_count, price_level,
          source, external_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (source, external_id) DO UPDATE SET
          name = EXCLUDED.name,
          rating = EXCLUDED.rating,
          review_count = EXCLUDED.review_count,
          has_delivery = EXCLUDED.has_delivery,
          last_updated = NOW()`,
        [
          place.name,
          place.address,
          place.city || null,
          place.state || null,
          place.zipcode || zipcode,
          place.coordinates?.lng,
          place.coordinates?.lat,
          place.phone,
          place.website,
          place.is_dedicated_pizzeria,
          place.has_delivery,
          place.has_pizza_menu,
          place.rating,
          place.review_count,
          place.price_level,
          place.source,
          place.external_id,
          JSON.stringify(place.metadata || {}),
        ]
      );
    } catch (error) {
      logger.error(`Error storing place ${place.name}:`, error.message);
    }
  }

  logger.info(`Stored ${results.length} new results to database`);
}

/**
 * Log search for analytics
 * @param {string} zipcode
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusMiles
 * @param {number} resultCount
 * @param {number} responseTime
 */
async function logSearch(zipcode, lat, lng, radiusMiles, resultCount, responseTime) {
  try {
    await db.query(
      `INSERT INTO search_history (zipcode, search_coordinates, radius_miles, results_count, response_time_ms)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6)`,
      [zipcode, lng, lat, radiusMiles, resultCount, responseTime]
    );
  } catch (error) {
    logger.error('Error logging search:', error);
  }
}

module.exports = {
  searchByZipcode,
  searchDatabase,
  enrichResults,
};
