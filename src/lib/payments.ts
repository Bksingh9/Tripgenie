const CASHFREE_APP_ID = import.meta.env.VITE_CASHFREE_APP_ID || "";
const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE || "sandbox";

export interface PaymentConfig {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  planName: string;
  returnUrl: string;
}

export function getCashfreeCheckoutUrl(plan: "pro" | "premium"): string {
  const prices = { pro: 799, premium: 1599 };
  const names = { pro: "TripGenie Pro", premium: "TripGenie Premium" };

  // If custom checkout URLs are set, use them (works with any PG)
  const customUrl = plan === "pro"
    ? import.meta.env.VITE_PRO_CHECKOUT_URL
    : import.meta.env.VITE_PREMIUM_CHECKOUT_URL;
  if (customUrl) return customUrl;

  // Fallback: Cashfree payment link format
  if (CASHFREE_APP_ID) {
    const baseUrl = CASHFREE_MODE === "production"
      ? "https://payments.cashfree.com/forms"
      : "https://payments-test.cashfree.com/forms";
    return `${baseUrl}/${names[plan].replace(/\s/g, "-").toLowerCase()}`;
  }

  return "";
}

export function getPaymentLink(plan: "pro" | "premium" | "starter" | "growth" | "enterprise"): string {
  const agencyPrices: Record<string, number> = {
    starter: 4999, growth: 14999, enterprise: 49999,
  };
  const consumerPrices: Record<string, number> = {
    pro: 799, premium: 1599,
  };

  // Check for any configured PG checkout URL
  const envKey = `VITE_${plan.toUpperCase()}_CHECKOUT_URL`;
  const url = import.meta.env[envKey];
  if (url) return url;

  // Fallback Stripe links
  if (plan === "pro" && import.meta.env.VITE_STRIPE_PRO_LINK) return import.meta.env.VITE_STRIPE_PRO_LINK;
  if (plan === "premium" && import.meta.env.VITE_STRIPE_PREMIUM_LINK) return import.meta.env.VITE_STRIPE_PREMIUM_LINK;

  return "";
}

export function isPaymentConfigured(): boolean {
  return !!(
    import.meta.env.VITE_PRO_CHECKOUT_URL ||
    import.meta.env.VITE_STRIPE_PRO_LINK ||
    import.meta.env.VITE_CASHFREE_APP_ID
  );
}
