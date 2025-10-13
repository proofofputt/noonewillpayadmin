const zipcodes = require('zipcodes');
const logger = require('./logger');

/**
 * Convert zipcode to coordinates (lat/lng)
 * @param {string} zipcode - US zipcode
 * @returns {Object|null} - {lat, lng} or null if invalid
 */
function zipcodeToCoordinates(zipcode) {
  try {
    const cleanZipcode = zipcode.toString().trim().substring(0, 5);
    const location = zipcodes.lookup(cleanZipcode);

    if (location && location.latitude && location.longitude) {
      return {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
        city: location.city,
        state: location.state,
      };
    }

    logger.warn(`Invalid zipcode: ${zipcode}`);
    return null;
  } catch (error) {
    logger.error('Error converting zipcode:', error);
    return null;
  }
}

/**
 * Validate US zipcode format
 * @param {string} zipcode
 * @returns {boolean}
 */
function isValidZipcode(zipcode) {
  const zipcodeRegex = /^\d{5}(-\d{4})?$/;
  return zipcodeRegex.test(zipcode.toString().trim());
}

/**
 * Get location info from zipcode
 * @param {string} zipcode
 * @returns {Object|null}
 */
function getZipcodeInfo(zipcode) {
  try {
    const cleanZipcode = zipcode.toString().trim().substring(0, 5);
    return zipcodes.lookup(cleanZipcode);
  } catch (error) {
    logger.error('Error looking up zipcode:', error);
    return null;
  }
}

module.exports = {
  zipcodeToCoordinates,
  isValidZipcode,
  getZipcodeInfo,
};
