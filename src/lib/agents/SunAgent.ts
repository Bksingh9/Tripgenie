import type { TripQuery, AgentResult } from "./types";

export interface SunTimes {
  sunrise: string;
  sunset: string;
  dayLength: string;
  solarNoon: string;
}

const INDIAN_COORDS: Record<string, { lat: number; lng: number }> = {
  goa: { lat: 15.2993, lng: 74.124 }, manali: { lat: 32.2396, lng: 77.1887 },
  jaipur: { lat: 26.9124, lng: 75.7873 }, kerala: { lat: 10.8505, lng: 76.2711 },
  delhi: { lat: 28.6139, lng: 77.209 }, mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 }, chennai: { lat: 13.0827, lng: 80.2707 },
  varanasi: { lat: 25.3176, lng: 82.9739 }, udaipur: { lat: 24.5854, lng: 73.7125 },
};

async function getCoords(destination: string): Promise<{ lat: number; lng: number }> {
  const lower = destination.toLowerCase().trim();
  if (INDIAN_COORDS[lower]) return INDIAN_COORDS[lower];

  const searchTerms = [`${destination}, India`, destination];
  for (const term of searchTerms) {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(term)}&count=1`);
      const data = await res.json();
      if (data.results?.[0]) return { lat: data.results[0].latitude, lng: data.results[0].longitude };
    } catch { /* try next */ }
  }
  throw new Error(`Location not found: ${destination}`);
}

export async function runSunAgent(query: TripQuery): Promise<AgentResult<SunTimes>> {
  const start = performance.now();
  try {
    const coords = await getCoords(query.destination);
    const date = query.departDate || new Date().toISOString().split("T")[0];

    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${coords.lat}&lng=${coords.lng}&date=${date}&formatted=0`
    );
    const data = await res.json();
    if (data.status !== "OK") throw new Error("Sun API error");

    const sunrise = new Date(data.results.sunrise).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(data.results.sunset).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const seconds = data.results.day_length;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    return {
      agent: "Sun", status: "success",
      data: { sunrise, sunset, dayLength: `${hours}h ${mins}m`, solarNoon: new Date(data.results.solar_noon).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
      ms: performance.now() - start,
    };
  } catch (e) {
    return { agent: "Sun", status: "error", error: String(e), ms: performance.now() - start };
  }
}
