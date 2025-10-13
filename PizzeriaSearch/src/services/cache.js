const redis = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

let redisClient = null;
let isRedisAvailable = false;

// Initialize Redis client
async function initializeRedis() {
  try {
    redisClient = redis.createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password,
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
      isRedisAvailable = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    isRedisAvailable = false;
    return null;
  }
}

/**
 * Get cached data
 * @param {string} key
 * @returns {Promise<any>}
 */
async function get(key) {
  if (!isRedisAvailable || !redisClient) {
    return null;
  }

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached data with TTL
 * @param {string} key
 * @param {any} value
 * @param {number} ttl - Time to live in seconds
 */
async function set(key, value, ttl = config.search.cacheTTL) {
  if (!isRedisAvailable || !redisClient) {
    return false;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Cache set error:', error);
    return false;
  }
}

/**
 * Delete cached data
 * @param {string} key
 */
async function del(key) {
  if (!isRedisAvailable || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Clear all cache
 */
async function flush() {
  if (!isRedisAvailable || !redisClient) {
    return false;
  }

  try {
    await redisClient.flushAll();
    logger.info('Cache flushed');
    return true;
  } catch (error) {
    logger.error('Cache flush error:', error);
    return false;
  }
}

/**
 * Generate cache key for search
 * @param {string} zipcode
 * @param {number} radius
 * @returns {string}
 */
function generateSearchKey(zipcode, radius) {
  return `search:${zipcode}:${radius}`;
}

module.exports = {
  initializeRedis,
  get,
  set,
  del,
  flush,
  generateSearchKey,
};
