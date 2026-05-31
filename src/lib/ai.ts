import { supabase, isSupabaseConfigured } from "./supabase";

export interface TripSegment {
  type: "flight" | "hotel" | "train" | "bus" | "cab";
  title: string;
  subtitle: string;
  time?: string;
  price: number;
}

export interface GeneratedTripOption {
  id: string;
  label: string;
  labelType: "budget" | "value" | "comfort" | "luxury";
  totalPrice: number;
  totalDuration: string;
  carbonOffset: string;
  segments: TripSegment[];
  savings?: number;
}

export async function planTrip(query: string): Promise<GeneratedTripOption[]> {
  // Try Supabase Edge Function (server-side, key is safe)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke("plan-trip", {
        body: { query },
      });
      if (!error && data?.options) return data.options;
    } catch {
      // Fall through to smart fallback
    }
  }

  // Smart fallback — no API key in client, no external call
  return generateSmartFallback(query);
}

function generateSmartFallback(query: string): GeneratedTripOption[] {
  const q = query.toLowerCase();

  const destinations: Record<string, { city: string; code: string }> = {
    goa: { city: "Goa", code: "GOI" }, manali: { city: "Manali", code: "KUU" },
    jaipur: { city: "Jaipur", code: "JAI" }, kerala: { city: "Kerala", code: "COK" },
    delhi: { city: "Delhi", code: "DEL" }, mumbai: { city: "Mumbai", code: "BOM" },
    bangalore: { city: "Bangalore", code: "BLR" }, udaipur: { city: "Udaipur", code: "UDR" },
    shimla: { city: "Shimla", code: "SLV" }, rishikesh: { city: "Rishikesh", code: "DED" },
    varanasi: { city: "Varanasi", code: "VNS" }, ladakh: { city: "Ladakh", code: "IXL" },
    andaman: { city: "Andaman", code: "IXZ" }, ooty: { city: "Ooty", code: "CJB" },
    paris: { city: "Paris", code: "CDG" }, dubai: { city: "Dubai", code: "DXB" },
    singapore: { city: "Singapore", code: "SIN" }, tokyo: { city: "Tokyo", code: "NRT" },
    bali: { city: "Bali", code: "DPS" }, london: { city: "London", code: "LHR" },
    maldives: { city: "Maldives", code: "MLE" }, bangkok: { city: "Bangkok", code: "BKK" },
  };

  let dest = destinations.goa;
  for (const [key, val] of Object.entries(destinations)) {
    if (q.includes(key)) { dest = val; break; }
  }

  const originCode = q.includes("delhi") && dest.code !== "DEL" ? "DEL"
    : q.includes("bangalore") && dest.code !== "BLR" ? "BLR"
    : q.includes("chennai") ? "MAA" : "BOM";

  // Parse budget from query
  const budgetMatch = q.match(/(?:under|below|within|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+)\s*k?/i);
  let maxBudget = Infinity;
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1]);
    if (maxBudget < 1000) maxBudget *= 1000;
  }

  const cap = (price: number) => Math.min(price, maxBudget * 0.95);

  const isInternational = !["GOI","KUU","JAI","COK","DEL","BOM","BLR","UDR","SLV","DED","VNS","IXL","IXZ","CJB"].includes(dest.code);
  const mult = isInternational ? 3 : 1;

  return [
    {
      id: "gen-1", label: "Budget Banger", labelType: "budget",
      totalPrice: cap(8499 * mult), totalDuration: "8h 30m", carbonOffset: "12kg CO₂", savings: 3500 * mult,
      segments: [
        { type: "flight", title: "IndiGo 6E-2341", subtitle: `${originCode} → ${dest.code} • 1h 15m`, time: "06:00", price: cap(3999 * mult) },
        { type: "hotel", title: `OYO ${dest.city} Stay`, subtitle: `${dest.city} • 2 nights`, price: cap(2500 * mult) },
        { type: "cab", title: "Airport Transfer", subtitle: "Shared cab", price: cap(2000 * mult) },
      ],
    },
    {
      id: "gen-2", label: "Best Value", labelType: "value",
      totalPrice: cap(12999 * mult), totalDuration: "6h 45m", carbonOffset: "14kg CO₂", savings: 2000 * mult,
      segments: [
        { type: "flight", title: "Air India AI-881", subtitle: `${originCode} → ${dest.code} • 1h 10m`, time: "09:30", price: cap(5499 * mult) },
        { type: "hotel", title: `Marriott ${dest.city}`, subtitle: `${dest.city} • 2 nights`, price: cap(5500 * mult) },
        { type: "cab", title: "Private Car", subtitle: "Airport pickup & drop", price: cap(2000 * mult) },
      ],
    },
    {
      id: "gen-3", label: "Comfort", labelType: "comfort",
      totalPrice: cap(18500 * mult), totalDuration: "5h 30m", carbonOffset: "16kg CO₂",
      segments: [
        { type: "flight", title: "Vistara UK-871", subtitle: `${originCode} → ${dest.code} • 1h 5m`, time: "11:00", price: cap(7500 * mult) },
        { type: "hotel", title: `ITC ${dest.city}`, subtitle: `${dest.city} • 2 nights`, price: cap(9000 * mult) },
        { type: "cab", title: "Luxury Transfer", subtitle: "Innova Crysta", price: cap(2000 * mult) },
      ],
    },
    {
      id: "gen-4", label: "Luxury", labelType: "luxury",
      totalPrice: cap(35000 * mult), totalDuration: "4h 45m", carbonOffset: "18kg CO₂",
      segments: [
        { type: "flight", title: "Vistara Business", subtitle: `${originCode} → ${dest.code} • 1h 5m`, time: "10:00", price: cap(15000 * mult) },
        { type: "hotel", title: `Taj ${dest.city}`, subtitle: `${dest.city} • 2 nights`, price: cap(16000 * mult) },
        { type: "cab", title: "Mercedes Transfer", subtitle: "Premium pickup", price: cap(4000 * mult) },
      ],
    },
  ];
}
