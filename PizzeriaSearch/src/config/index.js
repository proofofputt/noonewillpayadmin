require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'pizzeria_search',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  apis: {
    google: {
      key: process.env.GOOGLE_PLACES_API_KEY,
      enabled: !!process.env.GOOGLE_PLACES_API_KEY,
    },
    yelp: {
      key: process.env.YELP_API_KEY,
      enabled: !!process.env.YELP_API_KEY,
    },
    foursquare: {
      key: process.env.FOURSQUARE_API_KEY,
      enabled: !!process.env.FOURSQUARE_API_KEY,
    },
  },

  search: {
    defaultRadiusMiles: parseInt(process.env.DEFAULT_SEARCH_RADIUS_MILES) || 10,
    maxRadiusMiles: parseInt(process.env.MAX_SEARCH_RADIUS_MILES) || 50,
    cacheTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },
};
