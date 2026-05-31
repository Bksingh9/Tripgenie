// Supabase Edge Function for AI Trip Planning
// Deploy: supabase functions deploy plan-trip
// Set secret: supabase secrets set OPENAI_API_KEY=sk-...

const SYSTEM_PROMPT = `You are TripGenie, an AI travel planning assistant. Generate exactly 4 trip options as a JSON array.

CRITICAL RULES:
1. If the user specifies a budget (e.g. "under 15k"), ALL 4 options MUST be within that budget.
2. Use realistic current prices in INR.
3. Use real airlines (IndiGo, Air India, Vistara, SpiceJet, Akasa Air) and real hotels (Taj, Oberoi, ITC, Marriott, OYO, Treebo).
4. Each option must have 2-3 segments (transport + accommodation + optional transfer).
5. Match the destination to the query — "Trip to Paris" means Paris flights, not Indian domestic.

Each option: {"id":"1","label":"tier name","labelType":"budget"|"value"|"comfort"|"luxury","totalPrice":number,"totalDuration":"Xh Ym","carbonOffset":"Xkg CO₂","savings":number|null,"segments":[{"type":"flight"|"hotel"|"train"|"bus"|"cab","title":"carrier","subtitle":"route • duration","time":"HH:MM","price":number}]}

Respond ONLY with a valid JSON array. No markdown, no explanation.`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.length > 500) {
      return new Response(
        JSON.stringify({ error: "Invalid query" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: query },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: "AI service error" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        return new Response(
          JSON.stringify({ error: "Failed to parse AI response" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ options: JSON.parse(jsonMatch[0]) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (e) {
      clearTimeout(timeout);
      const isTimeout = e instanceof DOMException && e.name === "AbortError";
      return new Response(
        JSON.stringify({ error: isTimeout ? "AI request timed out (15s)" : "AI service unavailable" }),
        { status: isTimeout ? 504 : 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
