import type { TripQuery, AgentResult, WeatherDay } from "./types";

const INDIAN_COORDS: Record<string, { lat: number; lng: number }> = {
  goa: { lat: 15.2993, lng: 74.124 },
  manali: { lat: 32.2396, lng: 77.1887 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  ladakh: { lat: 34.1526, lng: 77.5771 },
  agra: { lat: 27.1767, lng: 78.0081 },
  pune: { lat: 18.5204, lng: 73.8567 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  ooty: { lat: 11.4102, lng: 76.695 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  darjeeling: { lat: 27.041, lng: 88.2663 },
  andaman: { lat: 11.7401, lng: 92.6586 },
  pondicherry: { lat: 11.9416, lng: 79.8083 },
  coorg: { lat: 12.3375, lng: 75.8069 },
};

async function getCoords(destination: string): Promise<{ lat: number; lng: number }> {
  const lower = destination.toLowerCase().trim();
  if (INDIAN_COORDS[lower]) return INDIAN_COORDS[lower];

  // Try geocoding API with country hint
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

export async function runWeatherAgent(query: TripQuery): Promise<AgentResult<WeatherDay[]>> {
  const start = performance.now();

  try {
    const coords = await getCoords(query.destination);

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`
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
