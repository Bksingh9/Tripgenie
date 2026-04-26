import {
  getAccessToken,
  listHotelIds,
  resolveIata,
  searchFlights,
  searchHotels,
  type AmadeusFlightOffer,
  type AmadeusHotelOffer,
} from "./_amadeus";

// Vercel Edge/Node function. Returns trip options in the shape the frontend
// already expects (matches TripOption in src/lib/trips.ts) so no client-side
// adapter is needed.

interface RequestBody {
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
  travelers?: number;
}

interface TripSegment {
  type: "flight" | "hotel" | "cab";
  title: string;
  subtitle: string;
  time?: string;
  price: number;
}

interface TripOption {
  id: string;
  label: string;
  labelType: "budget" | "value" | "comfort" | "luxury";
  totalPrice: number;
  totalDuration: string;
  carbonOffset: string;
  segments: TripSegment[];
  savings?: number;
}

interface SearchResponse {
  source: "amadeus" | "mock";
  options: TripOption[];
}

const TIER_LABELS: Record<TripOption["labelType"], string> = {
  budget: "Budget Banger",
  value: "Best Value",
  comfort: "Comfort",
  luxury: "Luxury",
};

function durationFromIso(iso: string | undefined): string {
  if (!iso) return "—";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] ?? "0";
  const min = m[2] ?? "0";
  return `${h}h ${min}m`;
}

function timeOfDay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const t = iso.split("T")[1];
  return t?.slice(0, 5);
}

function tierLabel(index: number): TripOption["labelType"] {
  return (["budget", "value", "comfort", "luxury"] as const)[Math.min(index, 3)];
}

function buildOptionsFromAmadeus(
  flights: AmadeusFlightOffer[],
  hotels: AmadeusHotelOffer[],
  carriers: Record<string, string>,
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string | undefined,
  travelers: number,
): TripOption[] {
  const sortedFlights = [...flights].sort(
    (a, b) => Number(a.price.grandTotal) - Number(b.price.grandTotal),
  );
  const sortedHotels = [...hotels].sort((a, b) => {
    const ap = Number(a.offers[0]?.price.total ?? 0);
    const bp = Number(b.offers[0]?.price.total ?? 0);
    return ap - bp;
  });

  const tiers = Math.min(4, sortedFlights.length || 0, sortedHotels.length || 0) || 0;
  if (tiers === 0) return [];

  const flightStep = Math.max(1, Math.floor(sortedFlights.length / 4));
  const hotelStep = Math.max(1, Math.floor(sortedHotels.length / 4));

  const options: TripOption[] = [];
  for (let i = 0; i < 4; i++) {
    const flight = sortedFlights[Math.min(i * flightStep, sortedFlights.length - 1)];
    const hotel = sortedHotels[Math.min(i * hotelStep, sortedHotels.length - 1)];
    if (!flight || !hotel) break;

    const seg = flight.itineraries[0]?.segments[0];
    const carrierCode = flight.validatingAirlineCodes[0] ?? seg?.carrierCode ?? "";
    const carrierName = carriers[carrierCode] ?? carrierCode;
    const flightPrice = Math.round(Number(flight.price.grandTotal));
    const hotelPrice = Math.round(Number(hotel.offers[0]?.price.total ?? 0));
    const cabPrice = i >= 2 ? 2500 : 1500;
    const totalPrice = flightPrice + hotelPrice + cabPrice;

    const segments: TripSegment[] = [
      {
        type: "flight",
        title: `${carrierName} ${seg?.number ?? ""}`.trim(),
        subtitle: `${origin} → ${destination} • ${durationFromIso(flight.itineraries[0]?.duration)}`,
        time: timeOfDay(seg?.departure.at),
        price: flightPrice,
      },
      {
        type: "hotel",
        title: hotel.hotel.name,
        subtitle: `${departDate}${returnDate ? ` → ${returnDate}` : ""} • ${travelers} ${
          travelers === 1 ? "guest" : "guests"
        }`,
        price: hotelPrice,
      },
      {
        type: "cab",
        title: i >= 2 ? "Premium Transfer" : "Airport Transfer",
        subtitle: i >= 2 ? "Mercedes E-Class" : "Sedan / SUV",
        price: cabPrice,
      },
    ];

    const labelType = tierLabel(i);
    options.push({
      id: `live-${labelType}-${flight.validatingAirlineCodes[0] ?? i}-${hotel.hotel.hotelId}`,
      label: TIER_LABELS[labelType],
      labelType,
      totalPrice,
      totalDuration: durationFromIso(flight.itineraries[0]?.duration),
      carbonOffset: `${Math.round(totalPrice / 1000) * 2}kg CO₂`,
      segments,
    });
  }
  return options;
}

// Deterministic mock used when env vars are missing or upstream returns nothing.
function generateMockOptions(
  from: string,
  to: string,
  departDate: string,
  returnDate: string | undefined,
  travelers: number,
): TripOption[] {
  let h = 0;
  for (const ch of `${from}|${to}|${departDate}|${travelers}`) {
    h = (h << 5) - h + ch.charCodeAt(0);
    h |= 0;
  }
  const seed = Math.abs(h);

  const nights = (() => {
    if (!returnDate) return 2;
    const d1 = new Date(departDate).getTime();
    const d2 = new Date(returnDate).getTime();
    if (Number.isNaN(d1) || Number.isNaN(d2) || d2 <= d1) return 2;
    return Math.max(1, Math.round((d2 - d1) / 86_400_000));
  })();

  const tiers = [
    { type: "budget" as const, fmul: 0.7, hmul: 0.6 },
    { type: "value" as const, fmul: 1.0, hmul: 1.0 },
    { type: "comfort" as const, fmul: 1.4, hmul: 1.6 },
    { type: "luxury" as const, fmul: 2.4, hmul: 2.8 },
  ];

  return tiers.map((t, idx) => {
    const carrier = ["IndiGo", "Air India", "Vistara", "SpiceJet"][(seed + idx) % 4];
    const flightNumber = `${1000 + ((seed + idx * 17) % 8999)}`;
    const flightPrice = Math.round((3500 + (seed % 4000)) * t.fmul * travelers);
    const hotelNightly = Math.round((1500 + (seed % 3500)) * t.hmul);
    const hotelPrice = hotelNightly * nights;
    const cabPrice = idx >= 2 ? 2500 : 1500;
    const totalPrice = flightPrice + hotelPrice + cabPrice;
    const departHour = ((seed + idx) % 12) + 6;
    return {
      id: `mock-${seed.toString(36)}-${t.type}`,
      label: TIER_LABELS[t.type],
      labelType: t.type,
      totalPrice,
      totalDuration: ["8h 30m", "6h 45m", "5h 30m", "4h 45m"][idx],
      carbonOffset: ["12kg CO₂", "14kg CO₂", "16kg CO₂", "18kg CO₂"][idx],
      segments: [
        {
          type: "flight",
          title: `${carrier} ${flightNumber}`,
          subtitle: `${from} → ${to}`,
          time: `${departHour.toString().padStart(2, "0")}:00`,
          price: flightPrice,
        },
        {
          type: "hotel",
          title: `${to} ${["Inn", "Holiday Inn", "Marriott", "Taj"][idx]}`,
          subtitle: `${nights} ${nights === 1 ? "night" : "nights"} • ${travelers} ${
            travelers === 1 ? "guest" : "guests"
          }`,
          price: hotelPrice,
        },
        {
          type: "cab",
          title: idx >= 2 ? "Premium Transfer" : "Airport Transfer",
          subtitle: idx >= 2 ? "Mercedes E-Class" : "Sedan / SUV",
          price: cabPrice,
        },
      ],
    };
  });
}

interface MinimalRequest {
  method?: string;
  body?: unknown;
}

interface MinimalResponse {
  status: (code: number) => MinimalResponse;
  json: (body: unknown) => void;
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const body = (req.body ?? {}) as RequestBody;
  const from = body.from?.trim() ?? "";
  const to = body.to?.trim() ?? "";
  const departDate = body.departDate ?? "";
  const returnDate = body.returnDate;
  const travelers = Math.max(1, Number(body.travelers ?? 1));

  if (!from || !to || !departDate) {
    res.status(400).json({ error: "from, to, and departDate are required" });
    return;
  }

  const origin = resolveIata(from);
  const destination = resolveIata(to);
  const key = process.env.AMADEUS_API_KEY;
  const secret = process.env.AMADEUS_API_SECRET;

  // Fall back to mock when keys are missing or when we can't resolve cities.
  if (!key || !secret || !origin || !destination) {
    const options = generateMockOptions(from, to, departDate, returnDate, travelers);
    const response: SearchResponse = { source: "mock", options };
    res.status(200).json(response);
    return;
  }

  try {
    const token = await getAccessToken(key, secret);
    const [flightResp, hotelIds] = await Promise.all([
      searchFlights(token, {
        origin,
        destination,
        departureDate: departDate,
        returnDate,
        adults: travelers,
      }),
      listHotelIds(token, destination),
    ]);
    const hotels = await searchHotels(token, {
      hotelIds,
      checkInDate: departDate,
      checkOutDate: returnDate ?? departDate,
      adults: travelers,
    });

    const options = buildOptionsFromAmadeus(
      flightResp.data,
      hotels,
      flightResp.dictionaries.carriers ?? {},
      origin,
      destination,
      departDate,
      returnDate,
      travelers,
    );

    if (options.length === 0) {
      const fallback = generateMockOptions(from, to, departDate, returnDate, travelers);
      const response: SearchResponse = { source: "mock", options: fallback };
      res.status(200).json(response);
      return;
    }
    const response: SearchResponse = { source: "amadeus", options };
    res.status(200).json(response);
  } catch (err) {
    console.error("Amadeus search failed:", err);
    const fallback = generateMockOptions(from, to, departDate, returnDate, travelers);
    const response: SearchResponse = { source: "mock", options: fallback };
    res.status(200).json(response);
  }
}
