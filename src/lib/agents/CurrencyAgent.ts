import type { TripQuery, AgentResult, CurrencyRate } from "./types";

const TRAVELER_CURRENCIES = ["USD", "EUR", "GBP", "THB", "JPY", "AED", "SGD", "MYR", "LKR", "NPR"];

export async function runCurrencyAgent(query: TripQuery): Promise<AgentResult<CurrencyRate[]>> {
  const start = performance.now();

  try {
    const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json");
    const data = await res.json();
    const rates = data.inr;

    if (!rates) throw new Error("Currency data unavailable");

    const currencyNames: Record<string, string> = {
      usd: "US Dollar", eur: "Euro", gbp: "British Pound", thb: "Thai Baht",
      jpy: "Japanese Yen", aed: "UAE Dirham", sgd: "Singapore Dollar",
      myr: "Malaysian Ringgit", lkr: "Sri Lankan Rupee", npr: "Nepalese Rupee",
    };

    const result: CurrencyRate[] = TRAVELER_CURRENCIES.map((code) => ({
      code,
      name: currencyNames[code.toLowerCase()] || code,
      rate: Math.round((1 / (rates[code.toLowerCase()] || 1)) * 100) / 100,
    }));

    return { agent: "Currency", status: "success", data: result, ms: performance.now() - start };
  } catch (e) {
    return { agent: "Currency", status: "error", error: String(e), ms: performance.now() - start };
  }
}
