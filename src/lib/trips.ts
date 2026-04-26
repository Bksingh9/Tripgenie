export type TripLabelType = "budget" | "value" | "comfort" | "luxury";

export type TripSegmentType = "flight" | "hotel" | "train" | "bus" | "cab";

export interface TripSegment {
  type: TripSegmentType;
  title: string;
  subtitle: string;
  time?: string;
  price: number;
}

export interface SearchInput {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  travelers: number;
}

export interface TripOption {
  id: string;
  label: string;
  labelType: TripLabelType;
  totalPrice: number;
  totalDuration: string;
  carbonOffset: string;
  segments: TripSegment[];
  savings?: number;
}

export interface SavedTrip {
  id: string;
  search: SearchInput;
  option: TripOption;
  savedAt: string;
  originalPrice: number;
  alertActive: boolean;
}

export type BookingStatus = "confirmed" | "completed" | "pending" | "cancelled";

export interface Booking {
  id: string;
  code: string;
  search: SearchInput;
  option: TripOption;
  status: BookingStatus;
  totalAmount: number;
  bookedAt: string;
}

const FLIGHT_CARRIERS = [
  { code: "6E", name: "IndiGo" },
  { code: "AI", name: "Air India" },
  { code: "UK", name: "Vistara" },
  { code: "SG", name: "SpiceJet" },
];

const HOTEL_BRANDS = {
  budget: ["Backpacker Inn", "City Hostel", "Stay Express"],
  value: ["Holiday Inn", "Lemon Tree", "Novotel"],
  comfort: ["Marriott Resort", "Hyatt Regency", "Radisson Blu"],
  luxury: ["Taj Exotica", "The Oberoi", "Four Seasons"],
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function nightsBetween(depart: string, ret?: string): number {
  if (!depart || !ret) return 2;
  const d1 = new Date(depart).getTime();
  const d2 = new Date(ret).getTime();
  if (Number.isNaN(d1) || Number.isNaN(d2) || d2 <= d1) return 2;
  return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

function airportCode(city: string): string {
  const trimmed = city.trim().toUpperCase();
  if (!trimmed) return "XXX";
  const letters = trimmed.replace(/[^A-Z]/g, "");
  return (letters.slice(0, 3) || "XXX").padEnd(3, "X");
}

function makeSegments(
  input: SearchInput,
  tier: TripLabelType,
  seed: number,
  flightMultiplier: number,
  hotelMultiplier: number,
): TripSegment[] {
  const nights = nightsBetween(input.departDate, input.returnDate);
  const carrier = pick(FLIGHT_CARRIERS, seed);
  const flightNumber = `${carrier.code}-${1000 + (seed % 8999)}`;
  const flightPrice = Math.round(
    (3500 + (hash(input.to) % 4000)) * flightMultiplier * input.travelers,
  );
  const hotel = pick(HOTEL_BRANDS[tier], seed >> 2);
  const hotelNightly = Math.round(
    (1500 + (hash(input.to + tier) % 3500)) * hotelMultiplier,
  );
  const hotelPrice = hotelNightly * nights;
  const cabPrice = tier === "luxury" ? 4000 : tier === "comfort" ? 2500 : 1500;

  const departHour = ((seed % 12) + 6).toString().padStart(2, "0");
  const departTime = `${departHour}:${(seed % 6) * 10 || "00"}`;
  const flightDuration = `1h ${10 + (seed % 50)}m`;

  return [
    {
      type: "flight",
      title: `${carrier.name} ${flightNumber}`,
      subtitle: `${airportCode(input.from)} → ${airportCode(input.to)} • ${flightDuration}`,
      time: departTime,
      price: flightPrice,
    },
    {
      type: "hotel",
      title: `${input.to.trim() || "Destination"} ${hotel}`,
      subtitle: `${nights} ${nights === 1 ? "night" : "nights"} • ${input.travelers} ${input.travelers === 1 ? "guest" : "guests"}`,
      price: hotelPrice,
    },
    {
      type: "cab",
      title: tier === "luxury" ? "Premium Transfer" : "Airport Transfer",
      subtitle: tier === "luxury" ? "Mercedes E-Class" : "Sedan / SUV",
      price: cabPrice,
    },
  ];
}

const TIER_CONFIG: Record<
  TripLabelType,
  { label: string; flight: number; hotel: number; duration: string; carbon: string }
> = {
  budget: { label: "Budget Banger", flight: 0.7, hotel: 0.6, duration: "8h 30m", carbon: "12kg CO₂" },
  value: { label: "Best Value", flight: 1.0, hotel: 1.0, duration: "6h 45m", carbon: "14kg CO₂" },
  comfort: { label: "Comfort", flight: 1.4, hotel: 1.6, duration: "5h 30m", carbon: "16kg CO₂" },
  luxury: { label: "Luxury", flight: 2.4, hotel: 2.8, duration: "4h 45m", carbon: "18kg CO₂" },
};

export function generateOptions(input: SearchInput): TripOption[] {
  const baseSeed = hash(`${input.from}|${input.to}|${input.departDate}|${input.travelers}`);
  const tiers: TripLabelType[] = ["budget", "value", "comfort", "luxury"];

  return tiers.map((tier, idx) => {
    const cfg = TIER_CONFIG[tier];
    const segments = makeSegments(input, tier, baseSeed + idx * 17, cfg.flight, cfg.hotel);
    const totalPrice = segments.reduce((sum, s) => sum + s.price, 0);
    const fullPrice = Math.round(totalPrice * (tier === "budget" ? 1.3 : tier === "value" ? 1.15 : 1));
    const savings = fullPrice > totalPrice ? fullPrice - totalPrice : undefined;

    return {
      id: `${baseSeed.toString(36)}-${tier}`,
      label: cfg.label,
      labelType: tier,
      totalPrice,
      totalDuration: cfg.duration,
      carbonOffset: cfg.carbon,
      segments,
      savings,
    };
  });
}

export function describeSearch(s: SearchInput): string {
  const where = [s.from, s.to].filter(Boolean).join(" → ") || "Your trip";
  const when = s.departDate
    ? new Date(s.departDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "";
  const back = s.returnDate
    ? new Date(s.returnDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "";
  const date = when && back ? `${when} – ${back}` : when || back;
  return [where, date].filter(Boolean).join(" • ");
}

// Human-readable booking reference, e.g. "TG-2026-A3K9PX". Not used as a
// primary key — the PK is a uuid — so collisions are recoverable: we just
// regenerate. The 6-char alphanumeric suffix gives 36^6 ≈ 2.1B values per
// year, so collisions in practice approach zero.
export function makeBookingCode(): string {
  const yr = new Date().getFullYear();
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1
  const buf = new Uint32Array(6);
  crypto.getRandomValues(buf);
  const suffix = Array.from(buf, (n) => alphabet[n % alphabet.length]).join("");
  return `TG-${yr}-${suffix}`;
}
