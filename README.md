# MovieRecApp (rec-app)

A Next.js 15 application that recommends movies based on user preferences and mood, powered by TMDB. The app includes authentication (JWT cookie), protected routes via middleware, server routes under `src/app/api/*`, TMDB data fetching with optional Upstash Redis caching, and a modern UI with Tailwind CSS v4.

## Table of Contents
- Overview
- Features
- Tech Stack
- Project Structure
- Getting Started
- Environment Variables
- Available Scripts
- Running & Building
- Testing
- API Routes
- Authentication Flow
- Caching Strategy
- Images & Security
- Deployment
- Troubleshooting
- Acknowledgements

## Overview
Users can sign up/log in, set preferences (genre, mood, age-appropriate, etc.), and browse recommended, popular, and top-rated movies. You can view details for a movie and see similar titles.

Key configs:
- `next.config.ts` restricts remote images to TMDB and adjusts optimizer for development.
- `middleware.ts` protects `/home`, `/preferences`, etc., and redirects unauthenticated users.
- TMDB requests read from `NEXT_PUBLIC_TMDB_*` env vars in `src/lib/tmdb.ts`.
- Optional Redis caching via Upstash in `src/lib/redis.ts` and `src/lib/tmdb-cached.ts`.

## Features
- Authentication with JWT httpOnly cookie (`/api/auth/*`)
- Protected routes via Next.js middleware
- Movie recommendations, search, and details from TMDB
- Preferences and mood-based filters
- Optional server-side caching with Upstash Redis
- Component-driven UI with Tailwind CSS (PostCSS plugin)
- Vitest + Testing Library setup

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Axios for HTTP
- jsonwebtoken for JWT
- Upstash Redis (optional caching)
- Vitest, @testing-library/*, jsdom

## Project Structure
```
rec-app/
  data/
    users.json                 # Demo user data for auth
  public/                      # Static images/icons
  src/
    app/
      api/auth/login/route.ts  # Login route
      api/auth/logout/route.ts # Logout route
      api/auth/me/route.ts     # Current user route
      api/auth/signup/route.ts # Signup route
      ... pages (home, login, signup, preferences, recommendations, movie/[id])
    components/                # UI components
    lib/
      auth.ts                  # Client helpers for auth
      jwt.ts                   # JWT sign/verify helpers
      redis.ts                 # Upstash Redis client and helpers
      storage.ts               # SSR-safe storage helpers
      tmdb.ts                  # TMDB API functions
      tmdb-cached.ts           # Cached wrappers (optional)
      types.ts                 # Shared types
    test/
      setupTests.ts            # Vitest/JSDOM setup
  middleware.ts                # Route protection & redirects
  next.config.ts               # Images and CSP for SVG
  postcss.config.mjs           # Tailwind v4 via PostCSS
  vitest.config.ts             # Test config & path alias '@'
```

## Getting Started
1) Install dependencies
```bash
npm install
```

2) Create `.env.local`
See Environment Variables below for the full list. A quick template:
```bash
# TMDB
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_key
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3

# JWT
JWT_SECRET=change-me-in-production

# Upstash Redis 
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

3) Run the dev server
```bash
npm run dev
```
Open http://localhost:3000

4) Demo login data (optional)
- See `data/users.json` for a seeded user during development.

## Environment Variables
Defined/used in:
- `src/lib/tmdb.ts`
  - `NEXT_PUBLIC_TMDB_API_KEY` (required)
  - `NEXT_PUBLIC_TMDB_BASE_URL` (default: set to `https://api.themoviedb.org/3`)
- `src/lib/jwt.ts`
  - `JWT_SECRET` (required in production; default fallback exists for dev)
- `src/lib/redis.ts` (optional caching)
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

Note: `NEXT_PUBLIC_*` vars are exposed to the browser. Keep secrets server-side only.

## Available Scripts
Defined in `package.json`:
- `dev` — Start Next.js dev server (Turbopack)
- `build` — Create production build
- `start` — Start production server
- `lint` — Run Next.js lint
- `test` — Run Vitest once
- `test:watch` — Watch mode
- `coverage` — Run tests with coverage (text, html, lcov)

## Running & Building
- Development:
```bash
npm run dev
```
- Production build:
```bash
npm run build && npm run start
```

## Testing
Vitest is configured with JSDOM and Testing Library.
- Config: `vitest.config.ts`
- Setup: `src/test/setupTests.ts`
- Example test: `src/lib/storage.test.ts`

Commands:
```bash
npm run test
npm run test:watch
npm run coverage
```

## API Routes
Located under `src/app/api/auth/*`:
- `POST /api/auth/signup` — Create a new user (demo uses in-memory/local storage and `data/users.json` pattern)
- `POST /api/auth/login` — Validate credentials, set `token` cookie (httpOnly)
- `POST /api/auth/logout` — Clear `token` cookie
- `GET  /api/auth/me` — Return current user by verifying JWT

See `src/lib/auth.ts` for client helpers that call these routes.

## Authentication Flow
- On login, a JWT is created via `generateToken()` in `src/lib/jwt.ts` and stored in an httpOnly cookie named `token`.
- `middleware.ts` reads the cookie, decodes it via `getUserFromToken()`, and:
  - Redirects authenticated users away from `/login` and `/signup` to `/home`.
  - Redirects unauthenticated users from protected pages (`/home`, `/preferences`, `/profile`) to `/login`.

## Caching Strategy (Optional)
- Upstash Redis client configured in `src/lib/redis.ts`.
- Wrap TMDB calls with `withCache()` via `src/lib/tmdb-cached.ts`.
- Cache keys are generated with `generateCacheKey()` and use expirations tuned per data type in `CACHE_DURATIONS`.
- If Redis is not configured, you can call the non-cached functions in `src/lib/tmdb.ts` directly.

## Images & Security
- `next.config.ts` allows images from `https://image.tmdb.org/t/p/**`.
- `dangerouslyAllowSVG` is enabled for SVG and a restrictive `contentSecurityPolicy` is set for images.
- In development, `images.unoptimized` is true to avoid fetch timeouts to TMDB.

## Deployment
- Vercel is recommended for Next.js apps.
- Ensure production env vars are set (TMDB keys, JWT_SECRET, and optionally Upstash credentials).
- Consider enabling image optimization in production (default) and updating caching as needed.

## Troubleshooting
- Missing TMDB vars: `src/lib/tmdb.ts` logs warnings if `NEXT_PUBLIC_TMDB_*` are not set.
- Auth issues: verify `JWT_SECRET` and browser cookies; check `middleware.ts` redirects.
- Redis failures: `withCache()` catches and falls back to live API; verify `UPSTASH_*` envs.
- Image errors: confirm `next.config.ts` `remotePatterns` and that URLs use `image.tmdb.org`.

## Acknowledgements
- Movie data provided by The Movie Database (TMDB). This product uses the TMDB API but is not endorsed or certified by TMDB.
