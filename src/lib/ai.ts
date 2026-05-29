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

const SYSTEM_PROMPT = `You are TripGenie, an AI travel planning assistant. Given a user query, generate exactly 4 trip options as a JSON array.

CRITICAL RULES:
1. If the user specifies a budget (e.g. "under 15k"), ALL 4 options MUST be within that budget. Do NOT exceed it.
2. If origin and destination are the same city, return an error message.
3. Use realistic current prices in INR.
4. Use real airlines (IndiGo, Air India, Vistara, SpiceJet, Akasa Air) and real hotels (Taj, Oberoi, ITC, Marriott, OYO, Treebo, FabHotel).
5. Each option must have 2-3 segments (transport + accommodation + optional transfer).

Each option in the JSON array:
{"id":"1","label":"tier name","labelType":"budget"|"value"|"comfort"|"luxury","totalPrice":number,"totalDuration":"Xh Ym","carbonOffset":"Xkg CO₂","savings":number|null,"segments":[{"type":"flight"|"hotel"|"train"|"bus"|"cab","title":"carrier","subtitle":"route • duration","time":"HH:MM","price":number}]}

Respond ONLY with a valid JSON array. No markdown, no explanation.`;

export async function planTrip(query: string): Promise<GeneratedTripOption[]> {
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Try Supabase Edge Function first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke("plan-trip", {
        body: { query },
      });
      if (!error && data?.options) return data.options;
    } catch {
      // Fall through to direct API call
    }
  }

  // Direct OpenAI call (client-side fallback)
  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content ?? "";
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch {
      // Fall through to smart fallback
    }
  }

  // Smart fallback: generate contextual demo data based on the query
  return generateSmartFallback(query);
}

function generateSmartFallback(query: string): GeneratedTripOption[] {
  const q = query.toLowerCase();

  // Extract destination from query
  const destinations: Record<string, { city: string; code: string }> = {
    goa: { city: "Goa", code: "GOI" },
    manali: { city: "Manali", code: "KUU" },
    jaipur: { city: "Jaipur", code: "JAI" },
    kerala: { city: "Kerala", code: "COK" },
    delhi: { city: "Delhi", code: "DEL" },
    mumbai: { city: "Mumbai", code: "BOM" },
    bangalore: { city: "Bangalore", code: "BLR" },
    udaipur: { city: "Udaipur", code: "UDR" },
    shimla: { city: "Shimla", code: "SLV" },
    rishikesh: { city: "Rishikesh", code: "DED" },
    varanasi: { city: "Varanasi", code: "VNS" },
    ladakh: { city: "Ladakh", code: "IXL" },
    andaman: { city: "Andaman", code: "IXZ" },
    darjeeling: { city: "Darjeeling", code: "IXB" },
    ooty: { city: "Ooty", code: "CJB" },
  };

  let dest = destinations.goa;
  for (const [key, val] of Object.entries(destinations)) {
    if (q.includes(key)) {
      dest = val;
      break;
    }
  }

  const originCode = q.includes("delhi") && dest.code !== "DEL" ? "DEL"
    : q.includes("bangalore") && dest.code !== "BLR" ? "BLR"
    : q.includes("chennai") ? "MAA"
    : "BOM";

  const budgetMultiplier = q.includes("luxury") ? 1.5 : q.includes("budget") || q.includes("cheap") ? 0.7 : 1;

  const base = (price: number) => Math.round(price * budgetMultiplier);

  return [
    {
      id: "gen-1",
      label: "Budget Banger",
      labelType: "budget",
      totalPrice: base(8499),
      totalDuration: "8h 30m",
      carbonOffset: "12kg CO₂",
      savings: base(3500),
      segments: [
        { type: "flight", title: "IndiGo 6E-2341", subtitle: `${originCode} → ${dest.code} • 1h 15m`, time: "06:00", price: base(3999) },
        { type: "hotel", title: `OYO ${dest.city} Stay`, subtitle: `${dest.city} • 2 nights`, price: base(2500) },
        { type: "cab", title: "Airport Transfer", subtitle: "Shared cab", price: base(2000) },
      ],
    },
    {
      id: "gen-2",
      label: "Best Value",
      labelType: "value",
      totalPrice: base(12999),
      totalDuration: "6h 45m",
      carbonOffset: "14kg CO₂",
      savings: base(2000),
      segments: [
        { type: "flight", title: "Air India AI-881", subtitle: `${originCode} → ${dest.code} • 1h 10m`, time: "09:30", price: base(5499) },
        { type: "hotel", title: `Marriott ${dest.city}`, subtitle: `${dest.city} • 2 nights`, price: base(5500) },
        { type: "cab", title: "Private Car", subtitle: "Airport pickup & drop", price: base(2000) },
      ],
    },
    {
      id: "gen-3",
      label: "Comfort",
      labelType: "comfort",
      totalPrice: base(18500),
      totalDuration: "5h 30m",
      carbonOffset: "16kg CO₂",
      segments: [
        { type: "flight", title: "Vistara UK-871", subtitle: `${originCode} → ${dest.code} • 1h 5m`, time: "11:00", price: base(7500) },
        { type: "hotel", title: `ITC ${dest.city}`, subtitle: `${dest.city} • 2 nights`, price: base(9000) },
        { type: "cab", title: "Luxury Transfer", subtitle: "Innova Crysta", price: base(2000) },
      ],
    },
    {
      id: "gen-4",
      label: "Luxury",
      labelType: "luxury",
      totalPrice: base(35000),
      totalDuration: "4h 45m",
      carbonOffset: "18kg CO₂",
      segments: [
        { type: "flight", title: "Vistara Business", subtitle: `${originCode} → ${dest.code} • 1h 5m`, time: "10:00", price: base(15000) },
        { type: "hotel", title: `Taj ${dest.city}`, subtitle: `${dest.city} • 2 nights`, price: base(16000) },
        { type: "cab", title: "Mercedes Transfer", subtitle: "Premium pickup", price: base(4000) },
      ],
    },
  ];
}
