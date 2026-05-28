import type { TripQuery, AgentResult } from "./types";

export interface GeoLocation {
  lat: number;
  lng: number;
  displayName: string;
  type: string;
  country: string;
  state: string;
}

export async function runGeoAgent(query: TripQuery): Promise<AgentResult<GeoLocation>> {
  const start = performance.now();
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.destination)}&format=json&limit=1&addressdetails=1`,
      { headers: { "User-Agent": "TripGenie/1.0 (travel-planning-app)" } }
    );
    if (!res.ok) throw new Error(`Nominatim returned ${res.status}`);
    const data = await res.json();

    if (!data[0]) throw new Error("Location not found");
    const loc = data[0];

    return {
      agent: "Geo",
      status: "success",
      data: {
        lat: parseFloat(loc.lat),
        lng: parseFloat(loc.lon),
        displayName: loc.display_name,
        type: loc.type,
        country: loc.address?.country || "",
        state: loc.address?.state || "",
      },
      ms: performance.now() - start,
    };
  } catch (e) {
    return { agent: "Geo", status: "error", error: String(e), ms: performance.now() - start };
  }
}
