// Supabase Edge Function for AI Trip Planning
// Deploy with: supabase functions deploy plan-trip
// Set secret: supabase secrets set OPENAI_API_KEY=sk-...

const SYSTEM_PROMPT = `You are TripGenie, an AI travel planning assistant for India. Given a user query about a trip, generate exactly 4 trip options in JSON format. Each option should have a different price tier: budget, value, comfort, and luxury.

Respond ONLY with a valid JSON array. Each option:
{
  "id": "unique-id",
  "label": "tier name",
  "labelType": "budget" | "value" | "comfort" | "luxury",
  "totalPrice": number (INR),
  "totalDuration": "Xh Ym",
  "carbonOffset": "Xkg CO₂",
  "savings": number or null,
  "segments": [
    {"type": "flight"|"hotel"|"train"|"bus"|"cab", "title": "carrier/name", "subtitle": "route details", "time": "HH:MM", "price": number}
  ]
}

Use real Indian airlines (IndiGo, Air India, Vistara, SpiceJet, Akasa), real hotel chains (Taj, Oberoi, ITC, Marriott, OYO, Treebo), and realistic prices in INR. Include 2-3 segments per option (transport + accommodation + transfer).`;

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
    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'query' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: "OpenAI API error", details: err }),
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

    const options = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ options }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
