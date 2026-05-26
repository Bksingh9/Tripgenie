import type { TripQuery, TripPlan, AgentResult, AgentStatus } from "./types";
import { runWeatherAgent } from "./WeatherAgent";
import { runCurrencyAgent } from "./CurrencyAgent";
import { runDestinationAgent } from "./DestinationAgent";
import { runPhotoAgent } from "./PhotoAgent";

// Ruflo-inspired event bus (browser-safe implementation)
// Based on @claude-flow/shared EventBus pattern but without Node.js dependencies

type EventHandler = (event: AgentEvent) => void;

interface AgentEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

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
      if (regex.test(event.type)) {
        handlers.forEach((h) => h(event));
      }
    });
  }
}

export const eventBus = new RufloEventBus();

// Log events in dev mode (ruflo-style agent telemetry)
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
  const agents = ["weather", "currency", "destination", "photos"] as const;

  // Ruflo swarm lifecycle events
  emit("swarm.initialized", { taskId, topology: "parallel", agentCount: agents.length });
  emit("task.created", { taskId, title: `${query.origin} → ${query.destination}`, priority: 1 });

  agents.forEach((id) => emit("agent.started", { agentId: id, taskId }));

  // Run all agents in parallel (ruflo parallel swarm pattern)
  const results = await Promise.allSettled([
    runWeatherAgent(query),
    runCurrencyAgent(query),
    runDestinationAgent(query),
    runPhotoAgent(query),
  ]);

  // Emit completion events per agent
  const succeeded: string[] = [];
  const failed: string[] = [];

  results.forEach((result, i) => {
    const agentId = agents[i];
    if (result.status === "fulfilled" && result.value.status === "success") {
      emit("agent.stopped", { agentId, reason: "completed", ms: result.value.ms });
      succeeded.push(agentId);
    } else {
      const error = result.status === "rejected" ? String(result.reason) : (result.value as AgentResult<unknown>).error || "Unknown";
      emit("agent.failed", { agentId, error, recoverable: true });
      failed.push(agentId);
    }
  });

  const unwrap = <T>(r: PromiseSettledResult<AgentResult<T>>, fallbackAgent: string): AgentResult<T> =>
    r.status === "fulfilled" ? r.value : { agent: fallbackAgent, status: "error" as AgentStatus, error: "Agent crashed", ms: 0 };

  const plan: TripPlan = {
    weather: unwrap(results[0], "Weather"),
    currency: unwrap(results[1], "Currency"),
    destination: unwrap(results[2], "Destination"),
    photos: unwrap(results[3], "Photos"),
    timestamp: Date.now(),
  };

  emit("task.completed", { taskId, succeeded: succeeded.length, failed: failed.length, total: agents.length });
  emit("swarm.terminated", { taskId, reason: "all_agents_complete" });

  return plan;
}
