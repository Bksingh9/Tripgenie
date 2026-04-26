# Tripgenie Setup Guide

Three integrations make this app go from demo to production:

1. **Supabase** — auth + per-user persistence for saved trips and bookings.
2. **Amadeus self-service API** — live flight + hotel inventory.
3. **Vercel** — hosts the SPA and the `/api/search` serverless function.

The app **runs without any of these** (localStorage auth + mock results), so you
can develop locally before signing up for anything. Each integration lights up
the moment its env vars are set.

---

## 1. Supabase (auth + database)

1. Create a free Supabase project at <https://supabase.com>.
2. From **Project Settings → API**, copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public** key → `VITE_SUPABASE_ANON_KEY`
3. Run the migration in **SQL Editor**:
   ```sql
   -- Paste the contents of supabase/migrations/0001_init.sql
   ```
   This creates `saved_trips` and `bookings` tables with row-level security so
   each user only ever sees their own rows.
4. Optional: in **Authentication → Providers**, disable "Confirm email" if you
   want sign-up to work without an inbox round-trip during testing.

Once the env vars are set, `src/lib/auth.tsx` automatically routes through
Supabase Auth and `src/lib/useTripStore.ts` reads/writes the tables. With the
vars unset, both fall back to `localStorage` (single-device, demo-only).

---

## 2. Amadeus (live travel search)

1. Sign up at <https://developers.amadeus.com>.
2. Create a **Self-Service** app. Copy:
   - **API Key** → `AMADEUS_API_KEY`
   - **API Secret** → `AMADEUS_API_SECRET`
3. The serverless function at `api/search.ts` uses these to call Amadeus's
   flight-offers and hotel-offers endpoints.

Notes on the test environment:
- 10 calls/sec, 10K calls/month — plenty for development.
- Inventory is sparse on some routes/dates. If Amadeus returns zero offers,
  the function falls back to deterministic mock results so the UI never breaks.
- Free-text city names (`Mumbai`, `Delhi`, `Goa`, etc.) are mapped to IATA
  codes in `api/_amadeus.ts`. Add to that map for new destinations.

---

## 3. Vercel (deploy)

1. Push the repo to GitHub.
2. Go to <https://vercel.com>, **Add New → Project**, import the GitHub repo.
3. Vercel auto-detects Vite — leave the build command (`vite build`) and
   output dir (`dist`) as-is.
4. **Project Settings → Environment Variables** — add the four vars from
   `.env.example`:
   - `VITE_SUPABASE_URL` (Production, Preview, Development)
   - `VITE_SUPABASE_ANON_KEY` (Production, Preview, Development)
   - `AMADEUS_API_KEY` (Production, Preview)
   - `AMADEUS_API_SECRET` (Production, Preview)
5. Click **Deploy**. Vercel will compile `api/search.ts` to a Node serverless
   function automatically — no extra config needed beyond the `vercel.json`
   already in this repo.

---

## Local development

```sh
# 1. Copy env template (optional — works without it)
cp .env.example .env.local

# 2. Install deps and run
npm install
npm run dev
```

Without `.env.local`, you get the localStorage + mock-data demo mode.
With `VITE_SUPABASE_*` set, auth and persistence go through Supabase.
Amadeus calls only work when the dev server proxies `/api/*` — use
`vercel dev` instead of `vite` for that:

```sh
npm i -g vercel
vercel dev
```

---

## What ships in each mode

| Feature       | No env       | Supabase only | Amadeus only | Both set      |
|---------------|--------------|---------------|--------------|---------------|
| Sign in       | localStorage | Supabase Auth | localStorage | Supabase Auth |
| Saved trips   | localStorage | Supabase DB   | localStorage | Supabase DB   |
| Bookings      | localStorage | Supabase DB   | localStorage | Supabase DB   |
| Search        | Mock         | Mock          | Live Amadeus | Live Amadeus  |
