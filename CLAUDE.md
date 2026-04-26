# CLAUDE.md

Single source of truth for Claude Code on this repo. Drop this file at the repo root.
Loaded automatically at the start of every Claude Code session.

---

## 1. Stack

- **Frontend / hosting:** Next.js on Vercel
- **Database & auth:** Supabase (Postgres + Auth + Storage)
- **Travel data API:** Amadeus Self-Service APIs (flights, hotels, locations)

## 2. Conventions Claude must follow in this repo

- Server-only secrets (anything **without** the `NEXT_PUBLIC_` prefix) must never be
  imported into a `"use client"` component or anything reachable from a client tree.
- All Supabase queries from the server use the service-role client from
  `lib/supabase/server.ts`. Browser queries use `lib/supabase/client.ts`.
- Amadeus calls go through the wrapper in `lib/amadeus/client.ts` — token refresh
  lives there. Never call `api.amadeus.com` directly from a route handler.
- Vercel: every PR gets a preview deploy; `main` is production. Never commit
  secrets — use `vercel env` or the dashboard.

## 3. Useful commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run typecheck` | Strict TypeScript pass |
| `npm run db:types` | Regenerate Supabase types from the live schema |
| `vercel env pull .env.local` | Sync local env from Vercel |
| `vercel --prod` | Deploy to production |

---

## 4. Required environment variables

Production values live in Vercel project settings; local values go in `.env.local`
(gitignored). The full template is in section 7 below — copy it to `.env.example`
and to `.env.local` before doing anything else.

| Var | Source | Used by |
|-----|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | **Server only — never expose** |
| `AMADEUS_CLIENT_ID` | developers.amadeus.com → My Self-Service Workspace | Server only |
| `AMADEUS_CLIENT_SECRET` | developers.amadeus.com → My Self-Service Workspace | Server only |
| `AMADEUS_HOSTNAME` | `test` (sandbox) or `production` | Server only |
| `VERCEL_URL` | Injected by Vercel at build time | Server only |

---

## 5. The `/setup` workflow (Claude Code follows these steps)

When the user asks to set up, configure, or "wire up" the project — or runs the
slash command `/setup` — execute the steps below in order. If the user passes
`--check`, skip prompts and jump to Step 5.5 (verification only).

### 5.1 Bootstrap local files

1. If `.env.local` does not exist, copy `.env.example` to `.env.local`.
2. Confirm `.env.local` is in `.gitignore`. If not, add it.

### 5.2 Supabase

Ask the user to either:

- **(a)** Open https://supabase.com/dashboard, create or select a project, then go to
  **Project Settings → API** and copy the three values, OR
- **(b)** If the `supabase` CLI is installed, run `supabase status` and paste the output.

Write into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Then regenerate types:

```bash
npm run db:types
```

If `supabase/migrations/` exists, ask before running `supabase db push` (it writes
to the user's database).

### 5.3 Amadeus

Direct the user to https://developers.amadeus.com → **My Self-Service Workspace** →
create or open an app. Collect:

- Client ID
- Client Secret
- Environment: `test` (sandbox) or `production`

Write into `.env.local`:

```
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
AMADEUS_HOSTNAME=test
```

Sanity-check the credentials:

```bash
curl -s -X POST "https://${AMADEUS_HOSTNAME}.api.amadeus.com/v1/security/oauth2/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=${AMADEUS_CLIENT_ID}&client_secret=${AMADEUS_CLIENT_SECRET}" \
  | jq .access_token
```

Pass: response contains an `access_token`.
Fail with `invalid_client`: the Client ID/Secret pair is wrong.

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

1. `.env.local` exists and contains every key from `.env.example` (no empty values).
2. `npm run typecheck` exits 0.
3. The Amadeus OAuth curl returns an `access_token`.
4. `curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/?apikey=$NEXT_PUBLIC_SUPABASE_ANON_KEY"` returns HTTP 200.
5. `vercel env ls production` lists every expected key.

Print this summary at the end:

```
| Check               | Status     |
|---------------------|------------|
| .env.local complete | OK / FAIL  |
| typecheck           | OK / FAIL  |
| Amadeus auth        | OK / FAIL  |
| Supabase reachable  | OK / FAIL  |
| Vercel env synced   | OK / FAIL  |
```

For any FAIL, give the user the exact remediation command — never just say "this failed".

---

## 6. Common gotchas (mention these proactively when relevant)

- **`SUPABASE_SERVICE_ROLE_KEY` leaked into the client bundle.** Anything imported
  by a client component ends up in the browser. Keep service-role usage inside
  route handlers or server components only.
- **Amadeus 401 in production but works in test.** Production uses a separate set
  of credentials. Request production access, add a billing method, then create a
  *new* app inside the production workspace.
- **Vercel preview deploys missing env vars.** `vercel env add` defaults to one
  environment at a time. The loop in 5.4 covers all three.
- **CORS on Supabase Storage.** Add the Vercel domain under Supabase dashboard →
  Storage → Settings → Allowed origins.

---

## 7. `.env.example` template (also save this as `.env.example` in the repo)

```dotenv
# Copy this file to .env.local and fill in real values.
# .env.local is gitignored — never commit secrets.

# ---- Supabase ---------------------------------------------------------
# Project Settings → API in the Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ---- Amadeus ----------------------------------------------------------
# developers.amadeus.com → My Self-Service Workspace → your app
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
# 'test' for sandbox, 'production' once you've upgraded
AMADEUS_HOSTNAME=test

# ---- Vercel -----------------------------------------------------------
# VERCEL_URL is injected automatically at build time on Vercel.
# Set this only for local dev if you need to mimic the deployed URL.
# VERCEL_URL=
```

---

## 8. Optional: register `/setup` as a slash command

If you want `/setup` to appear as a real slash command inside Claude Code, create
`.claude/commands/setup.md` with this front-matter and a one-line body that points
back to section 5 of this file:

```md
---
description: Walk through Supabase + Amadeus + Vercel setup for production use
allowed-tools: Bash, Read, Write, Edit
argument-hint: "[--check] to only verify env vars without prompting"
---

Follow section 5 of CLAUDE.md. If $ARGUMENTS contains --check, skip to 5.5.
```

That's it — Claude Code now has everything it needs in one file.
