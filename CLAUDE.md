# CLAUDE.md

Single source of truth for Claude Code on this repo. Loaded automatically at the
start of every Claude Code session.

---

## 1. Stack

- **Frontend:** Vite + React 18 + TypeScript (SPA)
- **Hosting:** Vercel — static `dist/` plus serverless functions in `api/`
- **Database & auth:** Supabase (Postgres + Auth) — gracefully degrades to
  localStorage when env vars are missing, so dev works zero-config
- **Travel data API:** Amadeus Self-Service (flights + hotels) — also degrades
  to a deterministic mock when keys are missing
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives), Outfit + Space Grotesk
- **Tests:** Vitest + @testing-library/react, jsdom env

This is **not** a Next.js project. There are no route handlers, server
components, or `"use client"` directives. The `api/` directory holds plain
Vercel serverless functions that import from `../src/lib` for shared logic.

## 2. Conventions

- Browser code uses Vite's `import.meta.env.VITE_*` for env vars. The `VITE_`
  prefix is required for anything to be exposed to the browser bundle.
- Server-only secrets (anything **without** the `VITE_` prefix, like
  `AMADEUS_API_KEY`) are read via `process.env` inside `api/` only. They must
  never be imported from `src/` — Vite would fail at runtime and even if it
  didn't, the value would land in the browser bundle.
- Supabase client lives at `src/lib/supabase.ts` (browser, anon key). There is
  no service-role client today; RLS handles authorization. If a server-side
  query is ever needed, create one inside `api/` and read the service-role key
  from `process.env`.
- Amadeus calls go through `api/_amadeus.ts` (token refresh + endpoint
  wrappers). Never call `api.amadeus.com` directly from a function — use the
  helper.
- `/api/search` is rate-limited per IP via `api/_rateLimit.ts` (in-memory,
  per-instance). Don't bypass it.
- Vercel: `main` is production. PRs get preview deploys automatically. Never
  commit secrets — use `vercel env` or the dashboard.

## 3. Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (Vite, port 5173 by default) |
| `vercel dev` | Local dev with `/api/*` functions wired up |
| `npm run typecheck` | TypeScript build across all three project refs |
| `npm run lint` | ESLint (must be 0 errors) |
| `npm test` | Vitest run, all suites |
| `npm run build` | Production build to `dist/` |
| `vercel env pull .env.local` | Sync env from Vercel project to local file |
| `vercel --prod` | Deploy to production |

## 4. Environment variables

Production values live in Vercel project settings; local values go in `.env.local`
(gitignored). Template is `.env.example`. The full app runs with **none** set
(localStorage auth, mock search) — each integration lights up when its keys
are added.

| Var | Source | Used by |
|-----|--------|---------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API | Browser |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Browser |
| `AMADEUS_API_KEY` | developers.amadeus.com → My Self-Service Workspace | `api/` only |
| `AMADEUS_API_SECRET` | developers.amadeus.com → My Self-Service Workspace | `api/` only |

## 5. The `/setup` workflow

When the user asks to set up, configure, or "wire up" the project — or runs
`/setup` — execute the steps below. With `--check`, skip prompts and jump to
Step 5.5 (verification only).

### 5.1 Bootstrap local files

1. If `.env.local` does not exist, copy `.env.example` to `.env.local`.
2. Confirm `.env.local` is in `.gitignore` (it already is).

### 5.2 Supabase

Ask the user to either:

- **(a)** Open https://supabase.com/dashboard, create or select a project, go to
  **Project Settings → API** and copy the values, OR
- **(b)** If the `supabase` CLI is installed, run `supabase status` and paste
  the output.

Write into `.env.local`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Run the migration once per project:

- Open the SQL Editor in the Supabase dashboard
- Paste the contents of `supabase/migrations/0001_init.sql`
- Run it. The migration is idempotent (uses `if not exists` / `drop policy if exists`).

### 5.3 Amadeus

Direct the user to https://developers.amadeus.com → **My Self-Service Workspace**
→ create or open an app. Collect the API Key and API Secret.

Write into `.env.local`:

```
AMADEUS_API_KEY=...
AMADEUS_API_SECRET=...
```

Sanity-check:

```bash
curl -s -X POST "https://test.api.amadeus.com/v1/security/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=${AMADEUS_API_KEY}&client_secret=${AMADEUS_API_SECRET}" \
  | jq .access_token
```

Pass: response contains an `access_token`.
Fail with `invalid_client`: the key/secret pair is wrong.

### 5.4 Vercel

```bash
npm i -g vercel    # if not already installed
vercel login
vercel link        # attach this dir to a Vercel project
```

Push every var from `.env.local` into all three Vercel environments:

```bash
for env in production preview development; do
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" == \#* ]] && continue
    echo "$value" | vercel env add "$key" "$env" --force
  done < .env.local
done
```

Deploy:

```bash
vercel --prod
```

### 5.5 Verification (always runs, including with `--check`)

Run these and report pass/fail per row:

1. `.env.local` exists and contains every key from `.env.example` (warn but
   don't fail if `VITE_SUPABASE_*` or `AMADEUS_*` are empty — those are
   optional, the app still runs in degraded mode).
2. `npm run typecheck` exits 0.
3. `npm run lint` exits 0.
4. `npm test` exits 0.
5. The Amadeus OAuth curl above returns an `access_token` (skip if `AMADEUS_*`
   not set).
6. `curl -s "$VITE_SUPABASE_URL/rest/v1/?apikey=$VITE_SUPABASE_ANON_KEY"`
   returns HTTP 200 (skip if `VITE_SUPABASE_*` not set).
7. `vercel env ls production` lists every expected key.

Print this summary at the end:

```
| Check               | Status     |
|---------------------|------------|
| .env.local present  | OK / WARN  |
| typecheck           | OK / FAIL  |
| lint                | OK / FAIL  |
| tests               | OK / FAIL  |
| Amadeus auth        | OK / SKIP  |
| Supabase reachable  | OK / SKIP  |
| Vercel env synced   | OK / FAIL  |
```

For any FAIL, give the exact remediation command — never just say "this failed".

## 6. Common gotchas

- **Browser leaks of server secrets.** Anything imported transitively from
  `src/main.tsx` ends up in the browser bundle. Never import from `api/` into
  `src/` — only the other way around (`api/` may import from `../src/lib/*`
  for pure helpers).
- **Vite env var prefix.** `process.env.SUPABASE_URL` will be `undefined` in
  the browser. Use `import.meta.env.VITE_SUPABASE_URL`.
- **Amadeus 401 in production but works in test.** Production credentials are
  separate. Request production access, add billing, create a new app in the
  production workspace.
- **Vercel preview deploys missing env vars.** `vercel env add` defaults to
  one environment. Loop covers all three (see 5.4).
- **Rate limiting (`api/_rateLimit.ts`)** is per-Vercel-instance, not global.
  Fine for the free Amadeus quota (10/sec, 10K/month). For higher scale, swap
  for an edge KV like Upstash.
- **Tree-shaking by env.** Vite removes the Supabase / live-search branches at
  build time when env vars are unset. Setting envs in Vercel triggers a fresh
  build that includes those branches.

## 7. `.env.example` template

The current template lives at `.env.example` in the repo root. Reproduced
here for reference:

```dotenv
# Frontend (browser-exposed — VITE_ prefix)
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""

# Server-only (api/ functions, never browser)
AMADEUS_API_KEY=""
AMADEUS_API_SECRET=""
```
