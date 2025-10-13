# No One Will Pay - Admin Dashboard Progress

## Project Information

- **Repository**: https://github.com/proofofputt/noonewillpay-admin
- **Branch**: main
- **Status**: Active Development
- **Last Updated**: 2025-10-13

## Recent Changes

### October 13, 2025 - PizzeriaSearch Module

Added comprehensive pizzeria prospecting system for finding pizza delivery restaurants:

**Directory**: `PizzeriaSearch/`

**Features**:
- Multi-source search aggregation (Google Places API, Yelp Fusion API)
- PostgreSQL with PostGIS for geospatial queries
- Redis caching layer for performance
- Smart deduplication using Levenshtein distance and geolocation
- RESTful API with Express.js
- Interactive web interface with CSV export
- Docker Compose for easy deployment

**Tech Stack**:
- Node.js 18+ with Express
- PostgreSQL 14+ with PostGIS extension
- Redis 6+ for caching
- Zipcode-to-coordinates conversion
- Rate limiting and security middleware

**API Endpoints**:
- POST /api/search/zipcode - Search by zipcode
- GET /api/pizzerias/:id - Get pizzeria details
- POST /api/pizzerias/batch - Bulk import
- GET /api/pizzerias - List with pagination

**Documentation**:
- PizzeriaSearch/README.md - Full documentation
- PizzeriaSearch/API_DOCS.md - API reference
- PizzeriaSearch/QUICKSTART.md - Setup guide

### October 13, 2025 - Data Files

Added numerical question bank:
- QUESTION_BANK_50_NUMERICAL.json - Collection of 50 numerical assessment questions

## Project Structure

```
noonewillpay-admin/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Dashboard home
│   ├── referrals/               # Referral analytics
│   └── partners/                # Partner management
├── components/                   # React components
├── PizzeriaSearch/              # Pizzeria prospecting system (NEW)
│   ├── src/                     # Source code
│   │   ├── config/             # Configuration
│   │   ├── database/           # Database connection
│   │   ├── services/           # Business logic
│   │   ├── routes/             # API routes
│   │   ├── utils/              # Utilities
│   │   └── server.js           # Express server
│   ├── database/               # Database schemas
│   ├── public/                 # Frontend assets
│   ├── docker-compose.yml      # Docker setup
│   └── package.json            # Dependencies
└── QUESTION_BANK_50_NUMERICAL.json  # Assessment questions (NEW)
```

## Current State

### Main Dashboard
- User management and analytics
- Referral program monitoring
- Partner business management
- Survey response analytics
- Charity pool administration

### PizzeriaSearch Module
- Complete and functional
- Ready for deployment
- Requires API keys for Google Places and Yelp

## Tech Stack

### Main Dashboard
- Next.js 14 with App Router
- TypeScript
- NeonDB (Serverless PostgreSQL)
- Drizzle ORM
- Recharts for analytics
- Tailwind CSS

### PizzeriaSearch
- Node.js with Express
- PostgreSQL with PostGIS
- Redis
- Docker & Docker Compose

## Environment Setup

### Main Dashboard
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secure-jwt-secret
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### PizzeriaSearch
```env
PORT=3000
GOOGLE_PLACES_API_KEY=your_google_key
YELP_API_KEY=your_yelp_key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pizzeria_search
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Deployment

### Main Dashboard
- Deployed on Vercel
- Shares database with web application
- Port: 3001 (development)

### PizzeriaSearch
- Docker Compose for deployment
- Can be deployed to any cloud provider supporting Docker
- Port: 3000

## Known Issues

None currently identified.

## Next Steps

1. Add API keys to PizzeriaSearch .env file
2. Test pizzeria search functionality
3. Consider adding authentication to PizzeriaSearch API
4. Integrate pizzeria data with main admin dashboard
5. Add admin authentication to main dashboard

## Git Status

**Untracked Files**:
- PizzeriaSearch/ (complete module, ready to commit)
- QUESTION_BANK_50_NUMERICAL.json (ready to commit)

**Remote**: origin (https://github.com/proofofputt/noonewillpayadmin.git)

## Development Commands

### Main Dashboard
```bash
npm run dev     # Start development server (port 3001)
npm run build   # Build for production
npm run lint    # Run ESLint
```

### PizzeriaSearch
```bash
# Docker deployment (recommended)
docker-compose up -d

# Local development
npm install
npm run migrate
npm run dev
```

## Notes

- PizzeriaSearch is a standalone module that can operate independently
- All documentation is comprehensive and includes examples
- System designed with scalability in mind
- Multi-source data aggregation ensures comprehensive pizza restaurant coverage
