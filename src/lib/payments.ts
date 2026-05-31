import { supabase, isSupabaseConfigured } from "./supabase";

export type PlanId = "pro" | "premium" | "starter" | "growth" | "enterprise";

const PLAN_DETAILS: Record<PlanId, { amount: number; name: string }> = {
  pro: { amount: 799, name: "TripGenie Pro" },
  premium: { amount: 1599, name: "TripGenie Premium" },
  starter: { amount: 4999, name: "Agency Starter" },
  growth: { amount: 14999, name: "Agency Growth" },
  enterprise: { amount: 49999, name: "Agency Enterprise" },
};

export async function initiatePayment(
  plan: PlanId,
  user?: { email?: string; name?: string; phone?: string }
): Promise<{ success: boolean; error?: string }> {

  // 1. Check for direct checkout URLs (any PG — Razorpay, Stripe, LemonSqueezy, etc.)
  const directUrl = getDirectCheckoutUrl(plan);
  if (directUrl) {
    window.open(directUrl, "_blank", "noopener");
    return { success: true };
  }

  // 2. Try Cashfree via Supabase Edge Function (server-side order creation)
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          plan,
          customerEmail: user?.email || "",
          customerName: user?.name || "",
          customerPhone: user?.phone || "",
        },
      });

      if (!error && data?.paymentSessionId) {
        // Load Cashfree checkout
        await loadCashfreeSDK();
        const cashfree = (window as unknown as { Cashfree: { PG: { init: (opts: { mode: string }) => { redirect: (opts: { paymentSessionId: string }) => void } } } }).Cashfree.PG.init({
          mode: import.meta.env.VITE_CASHFREE_MODE === "production" ? "production" : "sandbox",
        });
        cashfree.redirect({ paymentSessionId: data.paymentSessionId });
        return { success: true };
      }

      if (error || data?.error) {
        return { success: false, error: data?.error || "Payment service unavailable" };
      }
    } catch {
      // Fall through
    }
  }

  // 3. No PG configured
  return { success: false, error: "not_configured" };
}

function getDirectCheckoutUrl(plan: PlanId): string {
  const envKeys: Record<PlanId, string[]> = {
    pro: ["VITE_PRO_CHECKOUT_URL", "VITE_STRIPE_PRO_LINK"],
    premium: ["VITE_PREMIUM_CHECKOUT_URL", "VITE_STRIPE_PREMIUM_LINK"],
    starter: ["VITE_STARTER_CHECKOUT_URL"],
    growth: ["VITE_GROWTH_CHECKOUT_URL"],
    enterprise: ["VITE_ENTERPRISE_CHECKOUT_URL"],
  };

  for (const key of envKeys[plan] || []) {
    const url = import.meta.env[key];
    if (url) return url;
  }
  return "";
}

function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="cashfree"]')) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK"));
    document.head.appendChild(script);
  });
}

export function getPlanDetails(plan: PlanId) {
  return PLAN_DETAILS[plan];
}

export function isPaymentConfigured(): boolean {
  return !!(
    import.meta.env.VITE_PRO_CHECKOUT_URL ||
    import.meta.env.VITE_STRIPE_PRO_LINK ||
    isSupabaseConfigured()
  );
}
