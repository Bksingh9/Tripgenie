# Tripgenie

An all-in-one AI-powered travel platform — plan trips, book flights and hotels, and document your journeys.

## Features

- **AI Travel Assistant** — Chat-based trip planning with personalized recommendations and itinerary generation
- **Trip Planning** — Interactive itinerary builder with budget tracking, maps, and collaborative editing
- **Booking Engine** — Search and book flights, hotels, activities, and car rentals with price comparison
- **Travel Journal** — Document trips with photos, share stories, and track travel stats

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: tRPC, Prisma, PostgreSQL (Supabase)
- **AI**: OpenAI GPT-4
- **Auth**: NextAuth.js
- **Maps**: Mapbox GL JS
- **Booking APIs**: Amadeus (flights), Booking.com (hotels), Viator (activities)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or Supabase account)

### Setup

```bash
# Clone the repository
git clone https://github.com/Bksingh9/Tripgenie.git
cd Tripgenie

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up the database
npx prisma db push

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/          # Next.js pages and API routes
├── components/   # React components
├── lib/          # Utilities, API clients, AI integration
├── server/       # tRPC routers and business logic
├── stores/       # Zustand state management
└── types/        # TypeScript types
```

See [PROJECT_SCOPE.md](./PROJECT_SCOPE.md) for the full project scope, roadmap, and architecture details.

## License

MIT
