# No One Will Pay - Admin Dashboard

Admin dashboard for managing the Bitcoin education platform.

## Overview

This is the admin dashboard for No One Will Pay, featuring:
- User management and analytics
- Referral program monitoring
- Partner business management
- Survey response analytics
- Charity pool administration

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: NeonDB (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- NeonDB account (same database as web app)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/proofofputt/noonewillpay-admin.git
cd noonewillpay-admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your values:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-secure-jwt-secret-at-least-64-characters
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run start` - Start production server (port 3001)
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                # Next.js App Router
│   ├── page.tsx       # Dashboard home
│   ├── referrals/     # Referral analytics
│   └── partners/      # Partner management
├── components/        # React components
└── public/           # Static assets
```

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - NeonDB connection string (same as web app)
- `JWT_SECRET` - Secret for JWT token signing (same as web app)
- `NEXT_PUBLIC_ADMIN_URL` - Admin dashboard URL

## Features

### Dashboard Overview
- Total users count
- Active referrals tracking
- Partner businesses overview
- Survey completion rate

### Referral Analytics
- Referral trend charts
- Top referrers leaderboard
- Conversion rate tracking
- Points distribution analysis

### Partner Management
- Business listings
- Redemption tracking
- Performance metrics

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables (same DATABASE_URL as web app)
4. Deploy

**Important**: The admin dashboard shares the same database as the web app. Use the same `DATABASE_URL` for both deployments.

## Security

- Admin authentication (to be implemented)
- IP whitelisting (recommended for production)
- Secure database connections

See [SECURITY.md](./SECURITY.md) for security policy.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Related Repositories

- [Web Application](https://github.com/proofofputt/noonewillpay-web) - Main web application

## Support

- [Documentation](https://docs.noonewillpay.com)
- [GitHub Discussions](https://github.com/proofofputt/noonewillpay-admin/discussions)
- [Issue Tracker](https://github.com/proofofputt/noonewillpay-admin/issues)

---

Built with ⚡ by [Proof of Putt](https://github.com/proofofputt)
