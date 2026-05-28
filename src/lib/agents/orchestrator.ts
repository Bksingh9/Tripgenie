import type { TripQuery, TripPlan, AgentResult, AgentStatus } from "./types";
import { runWeatherAgent } from "./WeatherAgent";
import { runCurrencyAgent } from "./CurrencyAgent";
import { runDestinationAgent } from "./DestinationAgent";
import { runPhotoAgent } from "./PhotoAgent";
import { runHolidayAgent } from "./HolidayAgent";
import { runSunAgent } from "./SunAgent";
import { runGeoAgent } from "./GeoAgent";
import { runTranslationAgent } from "./TranslationAgent";

type EventHandler = (event: AgentEvent) => void;
interface AgentEvent { type: string; payload: Record<string, unknown>; timestamp: number; }

class RufloEventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  subscribe(pattern: string, handler: EventHandler) {
    if (!this.handlers.has(pattern)) this.handlers.set(pattern, new Set());
    this.handlers.get(pattern)!.add(handler);
    return () => this.handlers.get(pattern)?.delete(handler);
  }
  publish(event: AgentEvent) {
    this.handlers.forEach((handlers, pattern) => {
      const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
      if (regex.test(event.type)) handlers.forEach((h) => h(event));
    });
  }
}

export const eventBus = new RufloEventBus();

if (import.meta.env.DEV) {
  eventBus.subscribe("agent.*", (e) => console.log(`[ruflo] ${e.type}`, e.payload));
  eventBus.subscribe("task.*", (e) => console.log(`[ruflo] ${e.type}`, e.payload));
  eventBus.subscribe("swarm.*", (e) => console.log(`[ruflo] ${e.type}`, e.payload));
}

function emit(type: string, payload: Record<string, unknown>) {
  eventBus.publish({ type, payload, timestamp: Date.now() });
}

export async function runTripAgents(query: TripQuery): Promise<TripPlan> {
  const taskId = `trip-${Date.now()}`;
  const agents = ["weather", "currency", "destination", "photos", "holidays", "sun", "geo", "translation"] as const;

  emit("swarm.initialized", { taskId, topology: "parallel", agentCount: agents.length });
  emit("task.created", { taskId, title: `${query.origin} → ${query.destination}`, priority: 1 });
  agents.forEach((id) => emit("agent.started", { agentId: id, taskId }));

  const results = await Promise.allSettled([
    runWeatherAgent(query),
    runCurrencyAgent(query),
    runDestinationAgent(query),
    runPhotoAgent(query),
    runHolidayAgent(query),
    runSunAgent(query),
    runGeoAgent(query),
    runTranslationAgent(query),
  ]);

  let succeeded = 0;
  let failed = 0;
  results.forEach((result, i) => {
    const agentId = agents[i];
    if (result.status === "fulfilled" && result.value.status === "success") {
      emit("agent.stopped", { agentId, reason: "completed", ms: result.value.ms });
      succeeded++;
    } else {
      const error = result.status === "rejected" ? String(result.reason) : (result.value as AgentResult<unknown>).error || "Unknown";
      emit("agent.failed", { agentId, error, recoverable: true });
      failed++;
    }
  });

  const unwrap = <T>(r: PromiseSettledResult<AgentResult<T>>, name: string): AgentResult<T> =>
    r.status === "fulfilled" ? r.value : { agent: name, status: "error" as AgentStatus, error: "Agent crashed", ms: 0 };

  const plan: TripPlan = {
    weather: unwrap(results[0], "Weather"),
    currency: unwrap(results[1], "Currency"),
    destination: unwrap(results[2], "Destination"),
    photos: unwrap(results[3], "Photos"),
    holidays: unwrap(results[4], "Holidays"),
    sun: unwrap(results[5], "Sun"),
    geo: unwrap(results[6], "Geo"),
    translation: unwrap(results[7], "Translation"),
    timestamp: Date.now(),
  };

  emit("task.completed", { taskId, succeeded, failed, total: agents.length });
  emit("swarm.terminated", { taskId, reason: "all_agents_complete" });

  return plan;
}
