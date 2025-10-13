const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const GOOGLE_PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Search for pizza places using Google Places API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMiles - Search radius in miles
 * @returns {Promise<Array>} - Array of pizzeria results
 */
async function searchPizzerias(lat, lng, radiusMiles) {
  if (!config.apis.google.enabled) {
    logger.warn('Google Places API is not enabled');
    return [];
  }

  try {
    const radiusMeters = radiusMiles * 1609.34;

    // Search for pizza restaurants
    const searchUrl = `${GOOGLE_PLACES_API_URL}/nearbysearch/json`;
    const response = await axios.get(searchUrl, {
      params: {
        location: `${lat},${lng}`,
        radius: Math.min(radiusMeters, 50000), // Max 50km for Google
        keyword: 'pizza',
        type: 'restaurant',
        key: config.apis.google.key,
      },
    });

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      logger.error('Google Places API error:', response.data.status);
      return [];
    }

    const results = response.data.results || [];
    logger.info(`Google Places found ${results.length} results`);

    // Transform to our standard format
    return results.map(place => transformGooglePlace(place));
  } catch (error) {
    logger.error('Error fetching from Google Places:', error.message);
    return [];
  }
}

/**
 * Get detailed information for a specific place
 * @param {string} placeId - Google Place ID
 * @returns {Promise<Object>}
 */
async function getPlaceDetails(placeId) {
  if (!config.apis.google.enabled) {
    return null;
  }

  try {
    const detailsUrl = `${GOOGLE_PLACES_API_URL}/details/json`;
    const response = await axios.get(detailsUrl, {
      params: {
        place_id: placeId,
        fields: 'name,formatted_address,geometry,formatted_phone_number,website,rating,user_ratings_total,price_level,opening_hours,types',
        key: config.apis.google.key,
      },
    });

    if (response.data.status === 'OK') {
      return response.data.result;
    }

    return null;
  } catch (error) {
    logger.error('Error fetching place details:', error.message);
    return null;
  }
}

/**
 * Transform Google Place data to our standard format
 * @param {Object} place - Google Place object
 * @returns {Object}
 */
function transformGooglePlace(place) {
  const isPizzaInName = place.name.toLowerCase().includes('pizza');
  const isPizzaRestaurant = place.types?.includes('pizza_restaurant');

  return {
    name: place.name,
    address: place.vicinity || place.formatted_address,
    coordinates: {
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
    },
    phone: place.formatted_phone_number || null,
    website: place.website || null,
    is_dedicated_pizzeria: isPizzaInName || isPizzaRestaurant,
    has_delivery: place.opening_hours?.open_now !== false, // Assume delivery if open
    has_pizza_menu: true,
    rating: place.rating || null,
    review_count: place.user_ratings_total || 0,
    price_level: place.price_level || null,
    source: 'google',
    external_id: place.place_id,
    metadata: {
      types: place.types,
      business_status: place.business_status,
      place_id: place.place_id,
    },
  };
}

/**
 * Check if a place delivers (uses Places API details)
 * @param {string} placeId
 * @returns {Promise<boolean>}
 */
async function checkDeliveryAvailable(placeId) {
  const details = await getPlaceDetails(placeId);
  // Google doesn't directly provide delivery info, so we infer from being open
  return details?.opening_hours?.open_now || false;
}

module.exports = {
  searchPizzerias,
  getPlaceDetails,
  transformGooglePlace,
  checkDeliveryAvailable,
};
