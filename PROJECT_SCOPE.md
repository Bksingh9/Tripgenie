# Tripgenie — Project Scope

## Vision

Tripgenie is an all-in-one AI-powered travel platform that helps users discover destinations, plan trips, book travel services, and document their journeys — all in one place.

## Core Features

### 1. AI Travel Assistant
- Conversational interface for trip planning ("Plan me a 5-day trip to Tokyo on a $2000 budget")
- Personalized destination recommendations based on user preferences, travel history, and budget
- Smart itinerary generation with day-by-day schedules
- Real-time suggestions for activities, restaurants, and hidden gems
- Natural language search ("beach vacation in March under $1500")

### 2. Trip Planning
- Interactive itinerary builder with drag-and-drop scheduling
- Budget tracker with currency conversion
- Packing list generator based on destination and weather
- Collaborative planning — invite friends/family to co-plan trips
- Map view with pinned locations and route optimization
- Weather forecasts for planned travel dates

### 3. Booking Engine
- Flight search and booking (integration with flight APIs)
- Hotel and accommodation search and booking
- Activity and experience booking (tours, attractions, excursions)
- Car rental booking
- Price comparison across providers
- Price alerts and deal notifications
- Booking management dashboard (view, modify, cancel)

### 4. Travel Journal
- Trip diary with rich text, photos, and location tagging
- Automatic timeline generation from trip data
- Shareable trip stories (public profile or link sharing)
- Ratings and reviews for places visited
- Travel statistics and maps (countries visited, distance traveled)

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Maps**: Mapbox GL JS
- **UI Components**: Radix UI primitives + custom components

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes + tRPC for type-safe API layer
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Google, GitHub, email/password)
- **AI**: OpenAI API (GPT-4) for travel assistant
- **File Storage**: Supabase Storage (photos, documents)

### External APIs
- **Flights**: Amadeus API
- **Hotels**: Booking.com API / Hotels.com API
- **Activities**: Viator API / GetYourGuide API
- **Maps & Places**: Mapbox / Google Places API
- **Weather**: OpenWeatherMap API
- **Currency**: Exchange Rates API

### Infrastructure
- **Hosting**: Vercel
- **Database Hosting**: Supabase
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics + Sentry

## Data Models (High-Level)

### User
- Profile info, preferences, travel history
- Saved destinations, wishlists

### Trip
- Destination(s), dates, budget, status
- Linked itinerary, bookings, journal entries

### Itinerary
- Day-by-day plan with time slots
- Activities, transport, meals

### Booking
- Type (flight, hotel, activity, car)
- Provider, confirmation, status, price

### JournalEntry
- Text content, photos, location
- Linked trip, date, visibility (public/private)

## Project Structure

```
tripgenie/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (dashboard)/        # Dashboard layout
│   │   │   ├── trips/          # Trip management pages
│   │   │   ├── bookings/       # Booking pages
│   │   │   ├── journal/        # Journal pages
│   │   │   └── explore/        # Explore/discover destinations
│   │   ├── api/                # API routes
│   │   │   ├── trpc/           # tRPC handler
│   │   │   ├── auth/           # NextAuth routes
│   │   │   └── webhooks/       # Webhook handlers
│   │   ├── layout.tsx
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── trip/               # Trip-related components
│   │   ├── booking/            # Booking components
│   │   ├── journal/            # Journal components
│   │   ├── ai/                 # AI assistant components
│   │   └── map/                # Map components
│   ├── lib/
│   │   ├── ai/                 # AI/LLM integration
│   │   ├── api/                # External API clients
│   │   ├── db/                 # Database utilities
│   │   └── utils/              # Shared utilities
│   ├── server/
│   │   ├── routers/            # tRPC routers
│   │   └── services/           # Business logic
│   ├── stores/                 # Zustand stores
│   └── types/                  # TypeScript type definitions
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── tests/                      # Test files
├── .env.example                # Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## MVP Scope (Phase 1)

The MVP focuses on the core loop: **AI-powered trip planning + itinerary management**.

1. User authentication (sign up, login)
2. AI chat interface for trip recommendations and itinerary generation
3. Trip creation and itinerary builder
4. Basic destination search and exploration
5. Map view for itinerary visualization
6. Responsive design (mobile-first)

## Phase 2 — Booking Integration

1. Flight search and booking
2. Hotel search and booking
3. Activity/experience booking
4. Booking management dashboard
5. Price comparison

## Phase 3 — Travel Journal & Social

1. Trip journal with photos and location tagging
2. Shareable trip stories
3. Travel statistics dashboard
4. Community features (public profiles, following travelers)

## Phase 4 — Advanced Features

1. Collaborative trip planning (real-time)
2. Offline mode for travel documents and itineraries
3. Push notifications (price alerts, trip reminders)
4. Multi-language support
5. Budget optimization suggestions via AI
