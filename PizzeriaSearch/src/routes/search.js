const express = require('express');
const router = express.Router();
const searchService = require('../services/search');
const { isValidZipcode } = require('../utils/zipcode');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * POST /api/search/zipcode
 * Search for pizzerias by zipcode
 */
router.post('/zipcode', async (req, res) => {
  try {
    const { zipcode, radius, includeNonDedicated = true } = req.body;

    // Validate zipcode
    if (!zipcode || !isValidZipcode(zipcode)) {
      return res.status(400).json({
        success: false,
        error: 'Valid US zipcode is required',
      });
    }

    // Validate radius
    let searchRadius = radius || config.search.defaultRadiusMiles;
    if (searchRadius < 1 || searchRadius > config.search.maxRadiusMiles) {
      return res.status(400).json({
        success: false,
        error: `Radius must be between 1 and ${config.search.maxRadiusMiles} miles`,
      });
    }

    // Perform search
    const results = await searchService.searchByZipcode(zipcode, searchRadius);

    // Filter out non-dedicated pizzerias if requested
    if (!includeNonDedicated && results.results) {
      results.results = results.results.filter(p => p.is_dedicated_pizzeria);
      results.count = results.results.length;
    }

    // Return results
    res.json(results);

  } catch (error) {
    logger.error('Search endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/search/zipcode/:zipcode
 * Search for pizzerias by zipcode (GET method)
 */
router.get('/zipcode/:zipcode', async (req, res) => {
  try {
    const { zipcode } = req.params;
    const radius = parseInt(req.query.radius) || config.search.defaultRadiusMiles;
    const includeNonDedicated = req.query.includeNonDedicated !== 'false';

    // Validate zipcode
    if (!isValidZipcode(zipcode)) {
      return res.status(400).json({
        success: false,
        error: 'Valid US zipcode is required',
      });
    }

    // Perform search
    const results = await searchService.searchByZipcode(zipcode, radius);

    // Filter if needed
    if (!includeNonDedicated && results.results) {
      results.results = results.results.filter(p => p.is_dedicated_pizzeria);
      results.count = results.results.length;
    }

    res.json(results);

  } catch (error) {
    logger.error('Search endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

module.exports = router;
