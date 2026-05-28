import type { TripQuery, AgentResult } from "./types";

export interface HolidayInfo {
  date: string;
  name: string;
  countryCode: string;
}

export async function runHolidayAgent(query: TripQuery): Promise<AgentResult<HolidayInfo[]>> {
  const start = performance.now();
  try {
    const year = query.departDate ? new Date(query.departDate).getFullYear() : new Date().getFullYear();
    const countryCode = getCountryCode(query.destination);

    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!res.ok) throw new Error(`Holiday API returned ${res.status}`);

    const text = await res.text();
    if (!text || text.length < 2) throw new Error("Empty response from Holiday API");

    const data = JSON.parse(text);

    const holidays: HolidayInfo[] = data.slice(0, 10).map((h: { date: string; localName: string; countryCode: string }) => ({
      date: h.date,
      name: h.localName,
      countryCode: h.countryCode,
    }));

    return { agent: "Holidays", status: "success", data: holidays, ms: performance.now() - start };
  } catch (e) {
    return { agent: "Holidays", status: "error", error: String(e), ms: performance.now() - start };
  }
}

function getCountryCode(destination: string): string {
  const map: Record<string, string> = {
    india: "IN", goa: "IN", delhi: "IN", mumbai: "IN", jaipur: "IN", kerala: "IN", manali: "IN",
    bangalore: "IN", chennai: "IN", kolkata: "IN", hyderabad: "IN", varanasi: "IN",
    thailand: "TH", bangkok: "TH", dubai: "AE", singapore: "SG", japan: "JP", tokyo: "JP",
    france: "FR", paris: "FR", usa: "US", uk: "GB", london: "GB", germany: "DE", italy: "IT",
    spain: "ES", australia: "AU", canada: "CA", nepal: "NP", srilanka: "LK", maldives: "MV",
    indonesia: "ID", bali: "ID", vietnam: "VN", malaysia: "MY",
  };
  return map[destination.toLowerCase()] || "IN";
}
