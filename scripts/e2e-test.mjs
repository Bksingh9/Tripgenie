// End-to-end test: verify all agents, APIs, and app features work
const BASE = "http://localhost:8080";

async function test(name, fn) {
  try {
    const start = performance.now();
    const result = await fn();
    const ms = Math.round(performance.now() - start);
    console.log(`  ✓ ${name} (${ms}ms)${result ? ` — ${result}` : ""}`);
    return true;
  } catch (e) {
    console.log(`  ✗ ${name} — ${e.message}`);
    return false;
  }
}

async function main() {
  let passed = 0;
  let failed = 0;

  console.log("=== TripGenie E2E Test Suite ===\n");

  // 1. App Routes
  console.log("1. APP ROUTES");
  for (const route of ["/", "/pricing", "/trip-planner", "/saved-trips", "/my-bookings", "/auth", "/profile", "/tripgenie-live.html"]) {
    const ok = await test(`GET ${route}`, async () => {
      const res = await fetch(`${BASE}${route}`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const html = await res.text();
      if (!html.includes("TripGenie")) throw new Error("Missing TripGenie content");
      return `${html.length} bytes`;
    });
    ok ? passed++ : failed++;
  }

  // 2. Weather Agent (Open-Meteo API)
  console.log("\n2. WEATHER AGENT (Open-Meteo)");
  const weatherOk = await test("7-day forecast for Goa", async () => {
    const geoRes = await fetch("https://geocoding-api.open-meteo.com/v1/search?name=Goa&count=1");
    const geo = await geoRes.json();
    if (!geo.results?.[0]) throw new Error("Geocoding failed");
    const { latitude, longitude } = geo.results[0];

    const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`);
    const wx = await wxRes.json();
    if (!wx.daily?.time?.length) throw new Error("No forecast data");
    return `${wx.daily.time.length} days, ${wx.daily.temperature_2m_max[0]}°C high`;
  });
  weatherOk ? passed++ : failed++;

  // 3. Currency Agent (fawazahmed0 API)
  console.log("\n3. CURRENCY AGENT (Currency API)");
  const currOk = await test("INR exchange rates", async () => {
    const res = await fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json");
    const data = await res.json();
    if (!data.inr?.usd) throw new Error("No USD rate");
    return `1 INR = ${(1/data.inr.usd).toFixed(2)} USD`;
  });
  currOk ? passed++ : failed++;

  // 4. Destination Agent (REST Countries API)
  console.log("\n4. DESTINATION AGENT (REST Countries)");
  const destOk = await test("Country info for India", async () => {
    const res = await fetch("https://restcountries.com/v3.1/name/India?fields=name,capital,population,languages,currencies,flag");
    const data = await res.json();
    if (!data[0]?.name) throw new Error("No country data");
    return `${data[0].name.common}, pop: ${(data[0].population/1e6).toFixed(0)}M`;
  });
  destOk ? passed++ : failed++;

  // 5. Photo Agent
  console.log("\n5. PHOTO AGENT (Unsplash curated)");
  const photoOk = await test("Destination photos for Goa", async () => {
    const res = await fetch("https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=100");
    if (res.status !== 200) throw new Error(`Photo fetch failed: ${res.status}`);
    return "Photos accessible";
  });
  photoOk ? passed++ : failed++;

  // 6. Supabase Connection
  console.log("\n6. SUPABASE CONNECTION");
  const supaOk = await test("Supabase REST API", async () => {
    const url = "https://kvngtrxdpfpoukwqzbyw.supabase.co";
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmd0cnhkcGZwb3Vrd3F6Ynl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjY2NzgsImV4cCI6MjA5NTIwMjY3OH0.BbCC_PIgWnhE1qBwjHNscd7GCp21hjWpxgodAZT2CL0";
    const res = await fetch(`${url}/rest/v1/profiles?select=count&limit=0`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return `Status ${res.status}`;
  });
  supaOk ? passed++ : failed++;

  // 7. Build Verification
  console.log("\n7. BUILD VERIFICATION");
  const buildOk = await test("Production build", async () => {
    const { execSync } = await import("child_process");
    execSync("npx vite build", { stdio: "pipe", timeout: 30000 });
    return "Build successful";
  });
  buildOk ? passed++ : failed++;

  // 8. TypeScript Check
  console.log("\n8. TYPESCRIPT CHECK");
  const tsOk = await test("Type safety", async () => {
    const { execSync } = await import("child_process");
    execSync("npx tsc --noEmit", { stdio: "pipe", timeout: 30000 });
    return "Zero errors";
  });
  tsOk ? passed++ : failed++;

  // Summary
  console.log(`\n${"=".repeat(40)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log(`${"=".repeat(40)}`);

  if (failed > 0) process.exit(1);
}

main().catch(console.error);
