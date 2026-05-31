import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { updateSubscriptionTier } from "@/lib/api";

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
  const { user, profile } = useAuth();

  // DB profile is source of truth; localStorage is only a cache for unauthenticated users
  const [tier, setTier] = useState<SubscriptionTier>("free");

  useEffect(() => {
    if (profile?.subscription_tier) {
      setTier(profile.subscription_tier as SubscriptionTier);
    } else if (!user) {
      // Only trust localStorage when not logged in (unauthenticated demo)
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "pro" || stored === "premium") setTier(stored);
    }
  }, [profile, user]);

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
      // Persist to database if logged in
      if (user) {
        updateSubscriptionTier(user.id, plan).catch(() => {});
      }
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [user]);

  const handleUpgrade = (newTier: SubscriptionTier) => {
    setTier(newTier);
    if (user) {
      updateSubscriptionTier(user.id, newTier).catch(() => {});
    }
  };

  const limits = TIER_LIMITS[tier];

  const value: SubscriptionContextType = {
    tier,
    isPro: tier === "pro" || tier === "premium",
    isPremium: tier === "premium",
    savedTripsLimit: limits.savedTrips,
    showAds: limits.showAds,
    upgradeTo: handleUpgrade,
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
