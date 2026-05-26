import type { TripQuery, TripPlan } from "./types";
import { runWeatherAgent } from "./WeatherAgent";
import { runCurrencyAgent } from "./CurrencyAgent";
import { runDestinationAgent } from "./DestinationAgent";
import { runPhotoAgent } from "./PhotoAgent";

export async function runTripAgents(query: TripQuery): Promise<TripPlan> {
  const [weather, currency, destination, photos] = await Promise.all([
    runWeatherAgent(query),
    runCurrencyAgent(query),
    runDestinationAgent(query),
    runPhotoAgent(query),
  ]);

  return {
    weather,
    currency,
    destination,
    photos,
    timestamp: Date.now(),
  };
}
