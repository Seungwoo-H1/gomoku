# Deployment Guide

## Local Development

```bash
# 1. Clone and setup
git clone <repo-url>
cd gomoku

# 2. Start with Docker (easiest)
docker compose up -d

# 3. Open browser
open http://localhost:5173
```

### Manual Setup (without Docker)

```bash
# 1. PostgreSQL (local or Neon)
# Create database: gomoku

# 2. Backend
cd backend
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET
npm ci
npx prisma migrate dev
npm run dev

# 3. Frontend
cd ../frontend
npm ci
npm run dev
```

## Production Deployment

### 1. Database — Neon PostgreSQL

1. Go to [neon.tech](https://neon.tech)
2. Create project → get connection string
3. Set `DATABASE_URL` in Railway/Vercel

### 2. Backend — Railway

1. Go to [railway.app](https://railway.app)
2. New project → Connect GitHub repo
3. Set build command: `cd backend && npm ci && npx prisma generate && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `DATABASE_URL` (from Neon)
   - `JWT_SECRET` (random 32+ chars)
   - `CORS_ORIGIN` (your frontend URL)
6. Deploy → get URL

### 3. Frontend — Vercel

1. Go to [vercel.com](https://vercel.com)
2. New project → Connect GitHub repo
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable:
   - `VITE_API_URL` (Railway backend URL)
7. Deploy → get URL

### 4. Update CORS

After both are deployed:
1. Update Railway `CORS_ORIGIN` to Vercel URL
2. Update Vercel `VITE_API_URL` to Railway URL
3. Redeploy both

## Domain Setup (Optional)

- Vercel: Custom domain in settings
- Railway: Custom domain in settings (paid plan)

## Environment Variables Summary

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection |
| `JWT_SECRET` | Backend | Token signing |
| `CORS_ORIGIN` | Backend | Allowed frontend origins |
| `PORT` | Backend | HTTP port |
| `VITE_API_URL` | Frontend | Backend API URL |
