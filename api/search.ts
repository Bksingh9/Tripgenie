import {
  durationFromIso,
  getAccessToken,
  listHotelIds,
  resolveIata,
  searchFlights,
  searchHotels,
  timeOfDay,
  type AmadeusFlightOffer,
  type AmadeusHotelOffer,
} from "./_amadeus";
import { generateOptions, type TripOption } from "../src/lib/trips";

// Vercel serverless function. Returns trip options in the shape the frontend
// already expects (matches TripOption in src/lib/trips.ts) so no client-side
// adapter is needed. Falls back to the deterministic mock generator from
// src/lib/trips when keys are missing or upstream returns nothing.

interface RequestBody {
  from?: string;
  to?: string;
  departDate?: string;
  returnDate?: string;
  travelers?: number;
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

function tierLabel(index: number): TripOption["labelType"] {
  return (["budget", "value", "comfort", "luxury"] as const)[Math.min(index, 3)];
}

export function buildOptionsFromAmadeus(
  flights: AmadeusFlightOffer[],
  hotels: AmadeusHotelOffer[],
  carriers: Record<string, string>,
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string | undefined,
  travelers: number,
  expectedCurrency = "INR",
): TripOption[] {
  const sortedFlights = [...flights].sort(
    (a, b) => Number(a.price.grandTotal) - Number(b.price.grandTotal),
  );
  const sortedHotels = [...hotels].sort((a, b) => {
    const ap = Number(a.offers[0]?.price.total ?? 0);
    const bp = Number(b.offers[0]?.price.total ?? 0);
    return ap - bp;
  });

  if (sortedFlights.length === 0 || sortedHotels.length === 0) return [];

  const flightStep = Math.max(1, Math.floor(sortedFlights.length / 4));
  const hotelStep = Math.max(1, Math.floor(sortedHotels.length / 4));

  const options: TripOption[] = [];
  for (let i = 0; i < 4; i++) {
    const flight = sortedFlights[Math.min(i * flightStep, sortedFlights.length - 1)];
    const hotel = sortedHotels[Math.min(i * hotelStep, sortedHotels.length - 1)];
    if (!flight || !hotel) break;

    // Skip when Amadeus didn't honor the requested currency — mixing INR
    // cab prices with a USD flight would silently produce a wrong total.
    if (
      flight.price.currency !== expectedCurrency ||
      hotel.offers[0]?.price.currency !== expectedCurrency
    ) {
      continue;
    }

    const seg = flight.itineraries[0]?.segments[0];
    const carrierCode = flight.validatingAirlineCodes[0] ?? seg?.carrierCode ?? "";
    const carrierName = carriers[carrierCode] ?? carrierCode;
    const flightPrice = Math.round(Number(flight.price.grandTotal));
    const hotelPrice = Math.round(Number(hotel.offers[0]?.price.total ?? 0));
    const cabPrice = i >= 2 ? 2500 : 1500;
    const totalPrice = flightPrice + hotelPrice + cabPrice;

    const labelType = tierLabel(i);
    options.push({
      id: `live-${labelType}-${flight.validatingAirlineCodes[0] ?? i}-${hotel.hotel.hotelId}`,
      label: TIER_LABELS[labelType],
      labelType,
      totalPrice,
      totalDuration: durationFromIso(flight.itineraries[0]?.duration),
      carbonOffset: `${Math.round(totalPrice / 1000) * 2}kg CO₂`,
      segments: [
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
      ],
    });
  }
  return options;
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
  const search = { from, to, departDate, returnDate, travelers };

  if (!key || !secret || !origin || !destination) {
    const response: SearchResponse = { source: "mock", options: generateOptions(search) };
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
      const response: SearchResponse = { source: "mock", options: generateOptions(search) };
      res.status(200).json(response);
      return;
    }
    const response: SearchResponse = { source: "amadeus", options };
    res.status(200).json(response);
  } catch (err) {
    console.error("Amadeus search failed:", err);
    const response: SearchResponse = { source: "mock", options: generateOptions(search) };
    res.status(200).json(response);
  }
}
