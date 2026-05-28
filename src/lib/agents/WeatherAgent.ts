import type { TripQuery, AgentResult, WeatherDay } from "./types";

const INDIAN_CITIES = new Set(["goa", "manali", "jaipur", "kerala", "delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "varanasi", "udaipur", "shimla", "rishikesh", "ladakh", "andaman", "darjeeling", "ooty", "pune", "agra", "lucknow", "amritsar", "jodhpur", "mysore", "kochi", "coorg", "pondicherry"]);

function resolveSearchName(destination: string): string {
  const lower = destination.toLowerCase().trim();
  if (INDIAN_CITIES.has(lower)) return `${destination}, India`;
  return destination;
}

export async function runWeatherAgent(query: TripQuery): Promise<AgentResult<WeatherDay[]>> {
  const start = performance.now();

  try {
    const searchName = resolveSearchName(query.destination);
    const geocodeRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=1`
    );
    const geo = await geocodeRes.json();
    const loc = geo.results?.[0];

    if (!loc) throw new Error(`Location not found: ${query.destination}`);

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`
    );
    const weather = await weatherRes.json();

    const conditions: Record<number, { text: string; icon: string }> = {
      0: { text: "Clear sky", icon: "☀️" },
      1: { text: "Mainly clear", icon: "🌤️" },
      2: { text: "Partly cloudy", icon: "⛅" },
      3: { text: "Overcast", icon: "☁️" },
      45: { text: "Foggy", icon: "🌫️" },
      51: { text: "Light drizzle", icon: "🌦️" },
      61: { text: "Light rain", icon: "🌧️" },
      63: { text: "Moderate rain", icon: "🌧️" },
      65: { text: "Heavy rain", icon: "⛈️" },
      71: { text: "Light snow", icon: "🌨️" },
      80: { text: "Rain showers", icon: "🌦️" },
      95: { text: "Thunderstorm", icon: "⛈️" },
    };

    const days: WeatherDay[] = weather.daily.time.map((date: string, i: number) => {
      const code = weather.daily.weathercode[i];
      const cond = conditions[code] || { text: "Variable", icon: "🌤️" };
      return {
        date,
        tempHigh: Math.round(weather.daily.temperature_2m_max[i]),
        tempLow: Math.round(weather.daily.temperature_2m_min[i]),
        condition: cond.text,
        icon: cond.icon,
        precipitation: Math.round(weather.daily.precipitation_sum[i] * 10) / 10,
      };
    });

    return { agent: "Weather", status: "success", data: days, ms: performance.now() - start };
  } catch (e) {
    return { agent: "Weather", status: "error", error: String(e), ms: performance.now() - start };
  }
}
