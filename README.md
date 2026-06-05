# PlayStation.lk Rebuild

React + Vite + TypeScript reconstruction of the PlayStation.lk production site.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Required Environment Variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY` for AI repair diagnosis
- `VITE_GEMINI_MODEL` optional, defaults to `gemini-2.5-flash`

If env vars are missing, the app runs in local fallback mode using seeded data and `localStorage`.
The AI diagnosis panel shows a clear configuration error until `VITE_GEMINI_API_KEY` is set.

## Supabase Database Setup

Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor to create the catalog
tables, landing-page assignment table, RLS policies, indexes, and seed data.

## Admin Access

The admin panel uses Supabase Auth at `/admin/login`. Any authenticated Supabase user can access
the admin area.

## Build

```bash
npm run build
npm run preview
```
