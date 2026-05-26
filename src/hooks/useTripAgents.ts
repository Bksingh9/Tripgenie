import { useState, useCallback } from "react";
import type { TripQuery, TripPlan } from "@/lib/agents/types";
import { runTripAgents } from "@/lib/agents/orchestrator";

export function useTripAgents() {
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: TripQuery) => {
    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const result = await runTripAgents(query);
      setPlan(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Agent orchestration failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { plan, loading, error, search };
}
