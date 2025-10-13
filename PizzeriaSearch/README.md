# Pizzeria Search - Scalable Prospecting System

A comprehensive, scalable system for discovering pizza delivery restaurants by zipcode. Integrates multiple data sources to provide complete coverage of both dedicated pizzerias and restaurants with pizza on the menu.

## Features

- **Multi-Source Data Aggregation**: Integrates Google Places API, Yelp Fusion API, and Foursquare
- **Geospatial Search**: Radius-based search with PostGIS integration
- **Smart Deduplication**: Merges results from multiple sources intelligently
- **High Performance**: Redis caching layer with configurable TTL
- **Scalable Architecture**: Microservices-ready design with background job processing
- **Rate Limiting**: Built-in API rate limiting for production use

## Architecture

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐     ┌──────────────┐
│   Express API   │────▶│    Redis     │
│     Server      │     │    Cache     │
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│   PostgreSQL    │────▶│   Bull Queue │
│   + PostGIS     │     │  (Background)│
└─────────────────┘     └──────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  External APIs                  │
│  - Google Places                │
│  - Yelp Fusion                  │
│  - Foursquare                   │
└─────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x with PostGIS extension
- Redis >= 6.x

### Installation

1. Clone and navigate to directory:
```bash
cd PizzeriaSearch
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration and API keys
```

4. Set up database:
```bash
npm run migrate
npm run seed  # Optional: load sample data
```

5. Start development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Search by Zipcode
```bash
POST /api/search/zipcode
Content-Type: application/json

{
  "zipcode": "10001",
  "radius": 5,
  "includeNonDedicated": true
}
```

### Get Pizzeria Details
```bash
GET /api/pizzerias/:id
```

### Batch Import
```bash
POST /api/pizzerias/batch
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

[
  {
    "name": "Joe's Pizza",
    "address": "123 Main St",
    "zipcode": "10001",
    ...
  }
]
```

## Database Schema

### pizzerias table
- `id` (UUID, primary key)
- `name` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `zipcode` (VARCHAR)
- `coordinates` (GEOGRAPHY POINT)
- `phone` (VARCHAR)
- `website` (VARCHAR)
- `is_dedicated_pizzeria` (BOOLEAN)
- `has_delivery` (BOOLEAN)
- `has_pizza_menu` (BOOLEAN)
- `rating` (DECIMAL)
- `price_level` (INTEGER)
- `source` (VARCHAR) - google/yelp/foursquare/manual
- `external_id` (VARCHAR) - ID from external API
- `last_updated` (TIMESTAMP)
- `metadata` (JSONB) - Additional flexible data

## Configuration

Key environment variables:

- `GOOGLE_PLACES_API_KEY`: Required for Google Places integration
- `YELP_API_KEY`: Required for Yelp Fusion integration
- `DEFAULT_SEARCH_RADIUS_MILES`: Default search radius (default: 10)
- `CACHE_TTL_SECONDS`: Cache duration (default: 3600)

## Scalability Features

1. **Horizontal Scaling**: Stateless API design allows multiple instances
2. **Database Indexing**: Optimized indexes on zipcode and geospatial coordinates
3. **Caching Layer**: Redis-backed response caching
4. **Background Processing**: Async data enrichment via Bull queues
5. **Rate Limiting**: Per-IP rate limiting to prevent abuse

## Development

```bash
# Run tests
npm test

# Run with hot reload
npm run dev

# Lint code
npm run lint
```

## License

MIT License - No One Will Pay
