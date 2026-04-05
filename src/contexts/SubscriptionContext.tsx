import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type SubscriptionTier = "free" | "pro" | "premium";

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPro: boolean;
  isPremium: boolean;
  savedTripsLimit: number;
  showAds: boolean;
  upgradeTo: (tier: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY = "tripgenie_subscription_tier";

const TIER_LIMITS: Record<SubscriptionTier, { savedTrips: number; showAds: boolean }> = {
  free: { savedTrips: 3, showAds: true },
  pro: { savedTrips: Infinity, showAds: false },
  premium: { savedTrips: Infinity, showAds: false },
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "pro" || stored === "premium") return stored;
    return "free";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, tier);
  }, [tier]);

  // Check URL params for Stripe redirect success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const plan = params.get("plan");
    if (success === "true" && (plan === "pro" || plan === "premium")) {
      setTier(plan);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const limits = TIER_LIMITS[tier];

  const value: SubscriptionContextType = {
    tier,
    isPro: tier === "pro" || tier === "premium",
    isPremium: tier === "premium",
    savedTripsLimit: limits.savedTrips,
    showAds: limits.showAds,
    upgradeTo: setTier,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
