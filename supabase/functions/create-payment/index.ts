// Supabase Edge Function for Cashfree Payment Order Creation
// Deploy: supabase functions deploy create-payment
// Secrets: supabase secrets set CASHFREE_APP_ID=... CASHFREE_SECRET_KEY=...

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { plan, customerEmail, customerName, customerPhone } = await req.json();

    const validPlans: Record<string, { amount: number; name: string }> = {
      pro: { amount: 799, name: "TripGenie Pro - Monthly" },
      premium: { amount: 1599, name: "TripGenie Premium - Monthly" },
      starter: { amount: 4999, name: "TripGenie Agency Starter - Monthly" },
      growth: { amount: 14999, name: "TripGenie Agency Growth - Monthly" },
      enterprise: { amount: 49999, name: "TripGenie Agency Enterprise - Monthly" },
    };

    if (!plan || !validPlans[plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appId = Deno.env.get("CASHFREE_APP_ID");
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY");

    if (!appId || !secretKey) {
      return new Response(
        JSON.stringify({ error: "Payment not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mode = Deno.env.get("CASHFREE_MODE") || "sandbox";
    const baseUrl = mode === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    const orderId = `TG_${plan}_${Date.now()}`;
    const selectedPlan = validPlans[plan];

    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: selectedPlan.amount,
        order_currency: "INR",
        order_note: selectedPlan.name,
        customer_details: {
          customer_id: `cust_${Date.now()}`,
          customer_name: customerName || "TripGenie User",
          customer_email: customerEmail || "user@tripgenie.app",
          customer_phone: customerPhone || "9999999999",
        },
        order_meta: {
          return_url: `${req.headers.get("origin") || "https://tripgenie-iota.vercel.app"}/pricing?success=true&plan=${plan}&order_id=${orderId}`,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: "Payment creation failed", details: err }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({
        orderId: data.order_id,
        paymentSessionId: data.payment_session_id,
        orderAmount: selectedPlan.amount,
        planName: selectedPlan.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
