import type { TripQuery, AgentResult, DestinationInfo } from "./types";

export async function runDestinationAgent(query: TripQuery): Promise<AgentResult<DestinationInfo>> {
  const start = performance.now();

  try {
    const res = await fetch(`https://restcountries.com/v3.1/capital/${encodeURIComponent(query.destination)}`);
    let data;

    if (res.ok) {
      data = await res.json();
    } else {
      const res2 = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query.destination)}`);
      if (!res2.ok) throw new Error("Destination not found");
      data = await res2.json();
    }

    const country = data[0];
    if (!country) throw new Error("No country data found");

    const info: DestinationInfo = {
      name: query.destination,
      country: country.name?.common || "",
      capital: country.capital?.[0] || "",
      population: country.population || 0,
      languages: Object.values(country.languages || {}),
      currency: Object.keys(country.currencies || {})[0] || "INR",
      flag: country.flag || "",
      region: country.subregion || country.region || "",
      timezones: country.timezones || [],
    };

    return { agent: "Destination", status: "success", data: info, ms: performance.now() - start };
  } catch (e) {
    // Fallback for Indian cities
    const indianCities: Record<string, DestinationInfo> = {
      goa: { name: "Goa", country: "India", capital: "Panaji", population: 1458545, languages: ["Konkani", "English", "Hindi"], currency: "INR", flag: "🇮🇳", region: "South Asia", timezones: ["UTC+05:30"] },
      manali: { name: "Manali", country: "India", capital: "Shimla", population: 8500, languages: ["Hindi", "English"], currency: "INR", flag: "🇮🇳", region: "South Asia", timezones: ["UTC+05:30"] },
      jaipur: { name: "Jaipur", country: "India", capital: "Jaipur", population: 3073350, languages: ["Hindi", "English", "Rajasthani"], currency: "INR", flag: "🇮🇳", region: "South Asia", timezones: ["UTC+05:30"] },
      kerala: { name: "Kerala", country: "India", capital: "Thiruvananthapuram", population: 34530000, languages: ["Malayalam", "English", "Hindi"], currency: "INR", flag: "🇮🇳", region: "South Asia", timezones: ["UTC+05:30"] },
      delhi: { name: "Delhi", country: "India", capital: "New Delhi", population: 19000000, languages: ["Hindi", "English", "Urdu", "Punjabi"], currency: "INR", flag: "🇮🇳", region: "South Asia", timezones: ["UTC+05:30"] },
      mumbai: { name: "Mumbai", country: "India", capital: "Mumbai", population: 20400000, languages: ["Hindi", "Marathi", "English"], currency: "INR", flag: "🇮🇳", region: "South Asia", timezones: ["UTC+05:30"] },
    };

    const fallback = indianCities[query.destination.toLowerCase()];
    if (fallback) {
      return { agent: "Destination", status: "success", data: fallback, ms: performance.now() - start };
    }

    return { agent: "Destination", status: "error", error: String(e), ms: performance.now() - start };
  }
}
