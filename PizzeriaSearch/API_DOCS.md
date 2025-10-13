# Pizzeria Search API Documentation

## Overview

The Pizzeria Search API provides endpoints for discovering pizza delivery restaurants by zipcode. It aggregates data from multiple sources (Google Places, Yelp, Foursquare) and uses intelligent deduplication to provide comprehensive results.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required for read operations. Future versions may implement API keys for rate limiting.

---

## Endpoints

### 1. Search by Zipcode (POST)

Search for pizzerias near a specific US zipcode.

**Endpoint:** `POST /api/search/zipcode`

**Request Body:**
```json
{
  "zipcode": "10001",
  "radius": 10,
  "includeNonDedicated": true
}
```

**Parameters:**
- `zipcode` (string, required): Valid 5-digit US zipcode
- `radius` (number, optional): Search radius in miles (default: 10, max: 50)
- `includeNonDedicated` (boolean, optional): Include restaurants that aren't dedicated pizzerias but have pizza on menu (default: true)

**Response:**
```json
{
  "success": true,
  "cached": false,
  "location": {
    "zipcode": "10001",
    "city": "New York",
    "state": "NY",
    "lat": 40.7506,
    "lng": -73.9971
  },
  "radius_miles": 10,
  "results": [
    {
      "name": "Joe's Pizza",
      "address": "7 Carmine St, New York, NY",
      "city": "New York",
      "state": "NY",
      "zipcode": "10014",
      "coordinates": {
        "lat": 40.7306,
        "lng": -74.0028
      },
      "phone": "(212) 555-0100",
      "website": "https://joespizza.com",
      "is_dedicated_pizzeria": true,
      "has_delivery": true,
      "has_pizza_menu": true,
      "rating": 4.5,
      "review_count": 1250,
      "price_level": 2,
      "source": "google",
      "distance_miles": 1.2,
      "display_score": 89.5
    }
  ],
  "count": 1,
  "sources": {
    "database": 5,
    "google": 15,
    "yelp": 12
  },
  "response_time_ms": 450
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/search/zipcode \
  -H "Content-Type: application/json" \
  -d '{
    "zipcode": "94102",
    "radius": 5
  }'
```

---

### 2. Search by Zipcode (GET)

Alternative GET method for searching by zipcode.

**Endpoint:** `GET /api/search/zipcode/:zipcode`

**Parameters:**
- `zipcode` (path parameter, required): 5-digit US zipcode
- `radius` (query parameter, optional): Search radius in miles
- `includeNonDedicated` (query parameter, optional): Include non-dedicated pizzerias

**Example:**
```bash
curl "http://localhost:3000/api/search/zipcode/94102?radius=5"
```

---

### 3. Get Pizzeria Details

Get detailed information for a specific pizzeria by ID.

**Endpoint:** `GET /api/pizzerias/:id`

**Response:**
```json
{
  "success": true,
  "pizzeria": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Tony's Pizzeria",
    "address": "123 Main St",
    "rating": 4.7,
    ...
  }
}
```

**Example:**
```bash
curl http://localhost:3000/api/pizzerias/550e8400-e29b-41d4-a716-446655440000
```

---

### 4. List Pizzerias

Get a paginated list of all pizzerias in the database.

**Endpoint:** `GET /api/pizzerias`

**Query Parameters:**
- `limit` (number, optional): Results per page (default: 50, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "pizzerias": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1250
  }
}
```

**Example:**
```bash
curl "http://localhost:3000/api/pizzerias?limit=20&offset=40"
```

---

### 5. Batch Import Pizzerias

Import multiple pizzerias at once (useful for data seeding).

**Endpoint:** `POST /api/pizzerias/batch`

**Request Body:**
```json
{
  "pizzerias": [
    {
      "name": "Luigi's Pizza",
      "address": "456 Oak Ave",
      "city": "San Francisco",
      "state": "CA",
      "zipcode": "94102",
      "lat": 37.7749,
      "lng": -122.4194,
      "phone": "(415) 555-0200",
      "website": "https://luigispizza.com",
      "is_dedicated_pizzeria": true,
      "has_delivery": true,
      "rating": 4.3,
      "review_count": 89,
      "price_level": 2,
      "source": "manual"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "imported": 1,
  "errors": 0,
  "details": {
    "imported": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "name": "Luigi's Pizza"
      }
    ],
    "errors": []
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/pizzerias/batch \
  -H "Content-Type: application/json" \
  -d @pizzerias.json
```

---

### 6. Health Check

Check API health status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-13T12:00:00.000Z",
  "uptime": 3600.5
}
```

---

## Data Models

### Pizzeria Object

```typescript
{
  id: string (UUID)
  name: string
  address: string
  city: string | null
  state: string | null
  zipcode: string
  coordinates: {
    lat: number
    lng: number
  }
  phone: string | null
  website: string | null
  is_dedicated_pizzeria: boolean
  has_delivery: boolean
  has_pizza_menu: boolean
  rating: number | null (0-5)
  review_count: number
  price_level: number | null (1-4, where 4 is most expensive)
  source: 'google' | 'yelp' | 'foursquare' | 'manual' | 'database'
  external_id: string | null
  distance_miles: number (only in search results)
  display_score: number (only in search results)
  metadata: object
  created_at: timestamp
  last_updated: timestamp
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**
- `400 Bad Request`: Invalid input parameters
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window:** 15 minutes
- **Max Requests:** 100 requests per window per IP

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

---

## Caching

Search results are cached for **1 hour** by default. Cached responses include:

```json
{
  "cached": true,
  ...
}
```

To bypass cache, you can flush the cache by restarting the Redis service.

---

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function searchPizzarias(zipcode, radius = 10) {
  try {
    const response = await axios.post('http://localhost:3000/api/search/zipcode', {
      zipcode,
      radius,
      includeNonDedicated: true
    });

    return response.data;
  } catch (error) {
    console.error('Search failed:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
searchPizzarias('94102', 5)
  .then(data => console.log(`Found ${data.count} pizzerias`))
  .catch(err => console.error(err));
```

### Python

```python
import requests

def search_pizzerias(zipcode, radius=10):
    url = 'http://localhost:3000/api/search/zipcode'
    payload = {
        'zipcode': zipcode,
        'radius': radius,
        'includeNonDedicated': True
    }

    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()

# Usage
data = search_pizzerias('94102', 5)
print(f"Found {data['count']} pizzerias")
```

### cURL

```bash
# Search by zipcode
curl -X POST http://localhost:3000/api/search/zipcode \
  -H "Content-Type: application/json" \
  -d '{"zipcode": "94102", "radius": 10}'

# Get pizzeria details
curl http://localhost:3000/api/pizzerias/550e8400-e29b-41d4-a716-446655440000

# List pizzerias with pagination
curl "http://localhost:3000/api/pizzerias?limit=20&offset=0"
```

---

## Best Practices

1. **Cache Results Locally**: If you're making repeated queries for the same zipcode, cache results on your end to reduce API calls.

2. **Handle Rate Limits**: Implement exponential backoff when you receive 429 responses.

3. **Use Appropriate Radius**: Start with smaller radius (5-10 miles) and expand only if needed.

4. **Filter Results Client-Side**: Use `includeNonDedicated: true` and filter on your end for maximum flexibility.

5. **Monitor Response Times**: The `response_time_ms` field helps you track API performance.

---

## Support

For issues or questions:
- GitHub: https://github.com/noonewillpay/pizzeria-search
- Email: support@noonewillpay.com
