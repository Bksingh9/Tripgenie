// Amadeus self-service API helper. Used by serverless functions only —
// never imported from the browser bundle.

const BASE = "https://test.api.amadeus.com";

// Convert ISO 8601 duration (e.g. "PT2H15M") to "2h 15m". Handles missing
// hours or minutes; returns the input unchanged if it doesn't match.
export function durationFromIso(iso: string | undefined): string {
  if (!iso) return "—";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  const h = m[1] ?? "0";
  const min = m[2] ?? "0";
  return `${h}h ${min}m`;
}

// Extract HH:MM from an ISO datetime ("2026-05-15T06:30:00") → "06:30".
export function timeOfDay(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const t = iso.split("T")[1];
  return t?.slice(0, 5);
}

export const IATA: Record<string, string> = {
  mumbai: "BOM",
  delhi: "DEL",
  newdelhi: "DEL",
  bangalore: "BLR",
  bengaluru: "BLR",
  chennai: "MAA",
  kolkata: "CCU",
  hyderabad: "HYD",
  goa: "GOI",
  jaipur: "JAI",
  kochi: "COK",
  cochin: "COK",
  ahmedabad: "AMD",
  pune: "PNQ",
  lucknow: "LKO",
  manali: "KUU",
  srinagar: "SXR",
  leh: "IXL",
  varanasi: "VNS",
  trivandrum: "TRV",
  kerala: "COK",
  dubai: "DXB",
  singapore: "SIN",
  london: "LHR",
  newyork: "JFK",
  bangkok: "BKK",
  paris: "CDG",
  tokyo: "HND",
};

export function resolveIata(input: string): string | null {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, "");
  if (!cleaned) return null;
  // Check the city map first so 3-letter city names ("Goa") map to their
  // airport ("GOI") rather than passing through as a fake code ("GOA").
  if (IATA[cleaned]) return IATA[cleaned];
  if (/^[a-z]{3}$/.test(cleaned)) return cleaned.toUpperCase();
  return null;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}
let cached: CachedToken | null = null;

export async function getAccessToken(key: string, secret: string): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt > now + 60_000) return cached.token;
  const res = await fetch(`${BASE}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: key,
      client_secret: secret,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Amadeus auth failed (${res.status})`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return cached.token;
}

export interface AmadeusFlightDictionaries {
  carriers?: Record<string, string>;
}

export interface AmadeusFlightOffer {
  price: { grandTotal: string; currency: string };
  validatingAirlineCodes: string[];
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }>;
  }>;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  currency?: string;
  max?: number;
}

export async function searchFlights(
  token: string,
  params: FlightSearchParams,
): Promise<{ data: AmadeusFlightOffer[]; dictionaries: AmadeusFlightDictionaries }> {
  const qs = new URLSearchParams({
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departureDate,
    adults: String(params.adults),
    currencyCode: params.currency ?? "INR",
    max: String(params.max ?? 10),
  });
  if (params.returnDate) qs.set("returnDate", params.returnDate);

  const res = await fetch(`${BASE}/v2/shopping/flight-offers?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Flight search failed (${res.status})`);
  }
  return (await res.json()) as {
    data: AmadeusFlightOffer[];
    dictionaries: AmadeusFlightDictionaries;
  };
}

export interface AmadeusHotelOffer {
  hotel: { name: string; hotelId: string; cityCode: string };
  offers: Array<{ price: { total: string; currency: string } }>;
}

export async function listHotelIds(token: string, cityCode: string): Promise<string[]> {
  const res = await fetch(
    `${BASE}/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) return [];
  const json = (await res.json()) as { data: Array<{ hotelId: string }> };
  return json.data.slice(0, 30).map((h) => h.hotelId);
}

export interface HotelSearchParams {
  hotelIds: string[];
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  currency?: string;
}

export async function searchHotels(
  token: string,
  params: HotelSearchParams,
): Promise<AmadeusHotelOffer[]> {
  if (params.hotelIds.length === 0) return [];
  const qs = new URLSearchParams({
    hotelIds: params.hotelIds.join(","),
    checkInDate: params.checkInDate,
    checkOutDate: params.checkOutDate,
    adults: String(params.adults),
    currency: params.currency ?? "INR",
  });
  const res = await fetch(`${BASE}/v3/shopping/hotel-offers?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: AmadeusHotelOffer[] };
  return json.data ?? [];
}
