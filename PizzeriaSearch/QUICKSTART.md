# Quick Start Guide

Get the Pizzeria Search system up and running in minutes!

## Prerequisites

Choose one of the following setup methods:

### Option 1: Docker (Recommended)
- Docker Desktop or Docker Engine
- Docker Compose

### Option 2: Local Development
- Node.js >= 18.x
- PostgreSQL >= 14.x with PostGIS extension
- Redis >= 6.x

---

## Setup with Docker (Easiest)

### 1. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
GOOGLE_PLACES_API_KEY=your_google_key_here
YELP_API_KEY=your_yelp_key_here
```

### 2. Start Everything

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL with PostGIS
- Start Redis
- Build and start the application
- Automatically run database migrations

### 3. Verify

```bash
# Check that all services are running
docker-compose ps

# Check logs
docker-compose logs -f app

# Test the API
curl http://localhost:3000/health
```

### 4. Access the Application

Open your browser to: **http://localhost:3000**

That's it! The system is now running.

---

## Setup for Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

```bash
# Install PostgreSQL with PostGIS
# macOS:
brew install postgresql postgis

# Ubuntu:
sudo apt-get install postgresql postgresql-contrib postgis

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Ubuntu

# Create database
createdb pizzeria_search

# Enable PostGIS extension
psql pizzeria_search -c "CREATE EXTENSION postgis;"
```

### 3. Set up Redis

```bash
# macOS:
brew install redis
brew services start redis

# Ubuntu:
sudo apt-get install redis-server
sudo service redis-server start
```

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=pizzeria_search
DB_USER=postgres
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379

GOOGLE_PLACES_API_KEY=your_google_key
YELP_API_KEY=your_yelp_key
```

### 5. Run Database Migrations

```bash
npm run migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

---

## Getting API Keys

### Google Places API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Places API"
4. Create credentials (API Key)
5. Restrict key to "Places API" for security

### Yelp Fusion API

1. Go to [Yelp Fusion](https://www.yelp.com/developers)
2. Create a new app
3. Copy your API Key

---

## Testing the System

### 1. Web Interface

Open browser to: **http://localhost:3000**

Enter a zipcode (e.g., "10001" for NYC) and search!

### 2. API Testing

```bash
# Search for pizzerias
curl -X POST http://localhost:3000/api/search/zipcode \
  -H "Content-Type: application/json" \
  -d '{"zipcode": "10001", "radius": 5}'

# Get specific pizzeria
curl http://localhost:3000/api/pizzerias/YOUR_ID_HERE

# List all pizzerias
curl http://localhost:3000/api/pizzerias?limit=10
```

### 3. Import Sample Data

Create a file `sample_data.json`:
```json
{
  "pizzerias": [
    {
      "name": "Sample Pizza Place",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipcode": "10001",
      "lat": 40.7506,
      "lng": -73.9971,
      "phone": "(212) 555-0100",
      "is_dedicated_pizzeria": true,
      "has_delivery": true,
      "rating": 4.5,
      "source": "manual"
    }
  ]
}
```

Import:
```bash
curl -X POST http://localhost:3000/api/pizzerias/batch \
  -H "Content-Type: application/json" \
  -d @sample_data.json
```

---

## Common Issues

### Database Connection Failed

**Error:** `ECONNREFUSED` or `database "pizzeria_search" does not exist`

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Create database if missing
createdb pizzeria_search

# Enable PostGIS
psql pizzeria_search -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run migrations
npm run migrate
```

### Redis Connection Failed

**Error:** `Redis connection refused`

**Solution:**
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# If not running, start it:
brew services start redis    # macOS
sudo service redis start     # Ubuntu
```

### No Results from APIs

**Issue:** Getting results from database only, not external APIs

**Check:**
1. API keys are correctly set in `.env`
2. No typos in environment variable names
3. Restart server after changing `.env`
4. Check API quotas/limits on provider dashboards

### PostGIS Extension Error

**Error:** `type "geography" does not exist`

**Solution:**
```bash
psql pizzeria_search -c "CREATE EXTENSION IF NOT EXISTS postgis;"
npm run migrate
```

---

## Next Steps

1. **Configure API Keys**: Get Google Places and Yelp API keys for complete data coverage
2. **Customize Search**: Adjust default radius and cache TTL in `.env`
3. **Add More Sources**: Implement Foursquare integration (template provided)
4. **Monitor Usage**: Check `logs/combined.log` for API performance
5. **Scale Up**: Use Docker Compose to deploy to production

---

## Production Deployment

### Deploy to Cloud

The system includes Docker support for easy deployment:

```bash
# Build for production
docker build -t pizzeria-search .

# Deploy to your cloud provider
# - AWS ECS
# - Google Cloud Run
# - Azure Container Instances
# - DigitalOcean App Platform
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000

# Use managed PostgreSQL
DB_HOST=your-postgres-host.cloud.com
DB_NAME=pizzeria_search
DB_USER=postgres
DB_PASSWORD=strong_password_here

# Use managed Redis
REDIS_HOST=your-redis-host.cloud.com
REDIS_PASSWORD=redis_password_here

# API Keys
GOOGLE_PLACES_API_KEY=prod_key
YELP_API_KEY=prod_key

# Security
RATE_LIMIT_MAX_REQUESTS=1000
CACHE_TTL_SECONDS=3600
```

---

## Support

- **Documentation**: See `README.md` and `API_DOCS.md`
- **Issues**: Report at GitHub Issues
- **Email**: support@noonewillpay.com

Happy pizza prospecting! 🍕
