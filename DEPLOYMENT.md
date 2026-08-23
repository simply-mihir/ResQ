# HEALTH Platform — Deployment Guide

## Architecture Overview

- **Frontend apps** (Next.js) → deployed on **Vercel**
  - `apps/web-app` — patient-facing SOS app
  - `apps/hospital-dashboard` — hospital staff dashboard
- **Backend services** (NestJS) → deployed on **Render**
  - `services/emergency-service` — port 4001 (trigger, triage, QR scan)
  - `services/dispatch-service` — port 4003 (hospital matching, ambulance dispatch)
  - `services/records-service` — port 3003 (OCR upload, review queue)
- **Database** — Supabase PostgreSQL

## Prerequisites

1. A Supabase project with PostgreSQL database
2. Run Prisma migrations against the database:
   ```bash
   npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma
   ```
3. Seed the database (optional, for demo data):
   ```bash
   node packages/db/seed.js
   ```

## Render Deployment (Backend Services)

### 1. Connect your GitHub repo to Render

Render will use `render.yaml` (Blueprint) to create all three services automatically.

### 2. Set Environment Variables on each service

| Variable       | Value                                                                 |
| -------------- | --------------------------------------------------------------------- |
| `DATABASE_URL` | Your Supabase **pooled** connection string (port 6543, pgbouncer)     |
| `DIRECT_URL`   | Your Supabase **direct** connection string (port 5432, no pgbouncer)  |
| `PORT`         | Already set in render.yaml (4001 / 4003 / 3003)                      |

**Important**: The `DATABASE_URL` should use the pooler/pgbouncer URL for connection pooling in production. The `DIRECT_URL` is used by Prisma for migrations.

### 3. Note your Render service URLs

After deployment, note the URLs for each service:
- `https://emergency-service-xxxx.onrender.com`
- `https://dispatch-service-xxxx.onrender.com`
- `https://records-service-xxxx.onrender.com`

## Vercel Deployment (Frontend Apps)

### 1. Import the monorepo to Vercel

Create two Vercel projects, one for each app:
- **web-app**: Set root directory to `apps/web-app`
- **hospital-dashboard**: Set root directory to `apps/hospital-dashboard`

### 2. Set Environment Variables on each Vercel project

| Variable                           | Value                                                  |
| ---------------------------------- | ------------------------------------------------------ |
| `DATABASE_URL`                     | Supabase pooled connection string (for server components) |
| `DIRECT_URL`                       | Supabase direct connection string                       |
| `NEXT_PUBLIC_EMERGENCY_API_URL`    | `https://emergency-service-xxxx.onrender.com`          |
| `NEXT_PUBLIC_DISPATCH_API_URL`     | `https://dispatch-service-xxxx.onrender.com`           |
| `NEXT_PUBLIC_RECORDS_API_URL`      | `https://records-service-xxxx.onrender.com`            |

### 3. Build Settings

- **Framework**: Next.js
- **Build Command**: `cd ../.. && npm install && npx prisma generate --schema=packages/db/prisma/schema.prisma && npm run build -w apps/web-app` (adjust workspace name per app)
- **Output Directory**: `.next`
- **Install Command**: `npm install` (at monorepo root)

Alternatively, set the **Root Directory** to the monorepo root and use:
- **Build Command**: `npx prisma generate --schema=packages/db/prisma/schema.prisma && turbo run build --filter=web-app`

## How Proxy Rewrites Work

The Next.js apps proxy API requests to the backend services via `next.config.mjs` rewrites:

| Frontend Path                     | Backend Destination                        |
| --------------------------------- | ------------------------------------------ |
| `/api/proxy/emergency/:path*`     | `NEXT_PUBLIC_EMERGENCY_API_URL/:path*`     |
| `/api/proxy/dispatch/:path*`      | `NEXT_PUBLIC_DISPATCH_API_URL/:path*`      |
| `/api/proxy/records/:path*`       | `NEXT_PUBLIC_RECORDS_API_URL/:path*`       |

This means the frontend never calls backend URLs directly from the browser — all traffic goes through Next.js rewrites, avoiding CORS issues.

## Troubleshooting

### Render services fail to start
- Check that `DATABASE_URL` is set correctly with `?sslmode=require` for Supabase
- Verify the Prisma generate step ran during build (check build logs for "Generated Prisma Client")
- Ensure Node version is 20+ (`NODE_VERSION=20.11.0` is set in render.yaml)

### Vercel build fails
- Make sure all env vars are set, especially `DATABASE_URL`
- The build uses `ignoreBuildErrors: true` for TypeScript, but missing dependencies will still fail
- Check that the root `package.json` workspaces include the app being built

### API calls return 500 or connection errors
- Verify Render services are running (they spin down on free tier after inactivity)
- Check that `NEXT_PUBLIC_*_API_URL` env vars point to the correct Render URLs
- The proxy rewrites require these URLs at build time, so redeploy Vercel after setting them

### Database connection issues
- Use the **pooled** (port 6543) URL for `DATABASE_URL`
- Use the **direct** (port 5432) URL for `DIRECT_URL`
- Make sure `?sslmode=require` is appended
