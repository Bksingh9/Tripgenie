# Tripgenie

An AI-powered travel platform for discovering destinations, planning trips, booking travel services, and documenting journeys.

See [`PROJECT_SCOPE.md`](./PROJECT_SCOPE.md) for the full product vision, feature list, and roadmap.

## Tech Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** with shadcn/ui components (Radix UI primitives)
- **React Router** for client-side routing
- **TanStack Query** for server state
- **Framer Motion** for animations

## Getting Started

Requires Node.js 18+ and npm.

```sh
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

## Project Structure

```
src/
├── components/      # UI components (layout, ui, chat, trips, home, auth)
├── hooks/           # Custom React hooks
├── lib/             # Shared utilities and the auth context
├── pages/           # Route components (Index, TripPlanner, SavedTrips, ...)
├── App.tsx          # Router and providers
└── main.tsx         # App entry
```

## Authentication

The current build ships with a client-side auth stub backed by `localStorage`
so the protected routes (`/saved-trips`, `/my-bookings`, `/profile`) are usable
in the demo. It is intentionally not a substitute for a real backend; replace
`src/lib/auth.tsx` with a server-backed implementation (e.g. NextAuth or
Supabase Auth) before shipping to production.

## Deployment

The repo includes a `vercel.json` for deployment to Vercel. Pushing to the
default branch will trigger a deploy if the project is linked to Vercel.
