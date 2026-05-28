import type { TripQuery, AgentResult } from "./types";

export interface SunTimes {
  sunrise: string;
  sunset: string;
  dayLength: string;
  solarNoon: string;
}

export async function runSunAgent(query: TripQuery): Promise<AgentResult<SunTimes>> {
  const start = performance.now();
  try {
    const INDIAN_CITIES = new Set(["goa", "manali", "jaipur", "kerala", "delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "varanasi", "udaipur", "shimla", "rishikesh", "ladakh"]);
    const searchName = INDIAN_CITIES.has(query.destination.toLowerCase()) ? `${query.destination}, India` : query.destination;
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=1`
    );
    const geo = await geoRes.json();
    const loc = geo.results?.[0];
    if (!loc) throw new Error("Location not found");

    const date = query.departDate || new Date().toISOString().split("T")[0];
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${loc.latitude}&lng=${loc.longitude}&date=${date}&formatted=0`
    );
    const data = await res.json();
    if (data.status !== "OK") throw new Error("Sun API error");

    const sunrise = new Date(data.results.sunrise).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const sunset = new Date(data.results.sunset).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const seconds = data.results.day_length;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    return {
      agent: "Sun",
      status: "success",
      data: {
        sunrise,
        sunset,
        dayLength: `${hours}h ${mins}m`,
        solarNoon: new Date(data.results.solar_noon).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      },
      ms: performance.now() - start,
    };
  } catch (e) {
    return { agent: "Sun", status: "error", error: String(e), ms: performance.now() - start };
  }
}
