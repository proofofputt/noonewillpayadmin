const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const YELP_API_URL = 'https://api.yelp.com/v3';

/**
 * Search for pizza places using Yelp Fusion API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMiles - Search radius in miles
 * @returns {Promise<Array>} - Array of pizzeria results
 */
async function searchPizzerias(lat, lng, radiusMiles) {
  if (!config.apis.yelp.enabled) {
    logger.warn('Yelp API is not enabled');
    return [];
  }

  try {
    const radiusMeters = Math.min(radiusMiles * 1609.34, 40000); // Yelp max 40km

    const response = await axios.get(`${YELP_API_URL}/businesses/search`, {
      headers: {
        Authorization: `Bearer ${config.apis.yelp.key}`,
      },
      params: {
        latitude: lat,
        longitude: lng,
        radius: Math.round(radiusMeters),
        categories: 'pizza,italian,restaurants',
        term: 'pizza',
        limit: 50,
      },
    });

    const results = response.data.businesses || [];
    logger.info(`Yelp found ${results.length} results`);

    // Transform to our standard format
    return results.map(business => transformYelpBusiness(business));
  } catch (error) {
    logger.error('Error fetching from Yelp:', error.message);
    return [];
  }
}

/**
 * Get detailed information for a specific business
 * @param {string} businessId - Yelp Business ID
 * @returns {Promise<Object>}
 */
async function getBusinessDetails(businessId) {
  if (!config.apis.yelp.enabled) {
    return null;
  }

  try {
    const response = await axios.get(`${YELP_API_URL}/businesses/${businessId}`, {
      headers: {
        Authorization: `Bearer ${config.apis.yelp.key}`,
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Error fetching business details:', error.message);
    return null;
  }
}

/**
 * Transform Yelp business data to our standard format
 * @param {Object} business - Yelp business object
 * @returns {Object}
 */
function transformYelpBusiness(business) {
  const isPizzaInName = business.name.toLowerCase().includes('pizza');
  const isPizzaCategory = business.categories?.some(
    cat => cat.alias === 'pizza' || cat.alias === 'pizzeria'
  );

  // Extract address
  const location = business.location || {};
  const address = location.address1 || '';
  const city = location.city || '';
  const state = location.state || '';
  const zipcode = location.zip_code || '';

  // Check for delivery from transactions
  const hasDelivery = business.transactions?.includes('delivery') || false;

  return {
    name: business.name,
    address: `${address}${city ? ', ' + city : ''}${state ? ', ' + state : ''}`,
    city,
    state,
    zipcode,
    coordinates: {
      lat: business.coordinates?.latitude,
      lng: business.coordinates?.longitude,
    },
    phone: business.phone || business.display_phone || null,
    website: business.url || null,
    is_dedicated_pizzeria: isPizzaInName || isPizzaCategory,
    has_delivery: hasDelivery,
    has_pizza_menu: true,
    rating: business.rating || null,
    review_count: business.review_count || 0,
    price_level: business.price ? business.price.length : null, // $ = 1, $$ = 2, etc.
    source: 'yelp',
    external_id: business.id,
    metadata: {
      categories: business.categories,
      image_url: business.image_url,
      yelp_url: business.url,
      transactions: business.transactions,
      is_closed: business.is_closed,
    },
  };
}

module.exports = {
  searchPizzerias,
  getBusinessDetails,
  transformYelpBusiness,
};
