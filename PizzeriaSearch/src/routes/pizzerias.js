const express = require('express');
const router = express.Router();
const db = require('../database/connection');
const logger = require('../utils/logger');

/**
 * GET /api/pizzerias/:id
 * Get detailed information for a specific pizzeria
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT * FROM pizzerias WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pizzeria not found',
      });
    }

    res.json({
      success: true,
      pizzeria: result.rows[0],
    });

  } catch (error) {
    logger.error('Get pizzeria error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/pizzerias/batch
 * Batch import pizzerias
 */
router.post('/batch', async (req, res) => {
  try {
    const { pizzerias } = req.body;

    if (!Array.isArray(pizzerias) || pizzerias.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pizzerias array is required',
      });
    }

    const imported = [];
    const errors = [];

    for (const place of pizzerias) {
      try {
        const result = await db.query(
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
            last_updated = NOW()
          RETURNING id`,
          [
            place.name,
            place.address,
            place.city || null,
            place.state || null,
            place.zipcode,
            place.coordinates?.lng || place.lng,
            place.coordinates?.lat || place.lat,
            place.phone || null,
            place.website || null,
            place.is_dedicated_pizzeria || false,
            place.has_delivery || false,
            place.has_pizza_menu !== false,
            place.rating || null,
            place.review_count || 0,
            place.price_level || null,
            place.source || 'manual',
            place.external_id || null,
            JSON.stringify(place.metadata || {}),
          ]
        );

        imported.push({ id: result.rows[0].id, name: place.name });
      } catch (error) {
        errors.push({ name: place.name, error: error.message });
      }
    }

    res.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      details: { imported, errors },
    });

  } catch (error) {
    logger.error('Batch import error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/pizzerias
 * List pizzerias with pagination
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;

    const result = await db.query(
      `SELECT * FROM pizzerias
       ORDER BY rating DESC NULLS LAST, review_count DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await db.query('SELECT COUNT(*) FROM pizzerias');

    res.json({
      success: true,
      pizzerias: result.rows,
      pagination: {
        limit,
        offset,
        total: parseInt(countResult.rows[0].count),
      },
    });

  } catch (error) {
    logger.error('List pizzerias error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

module.exports = router;
