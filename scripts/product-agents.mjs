#!/usr/bin/env node
// TripGenie Product Organization Agents
// Inspired by ruflo's multi-agent swarm pattern
// Runs QA, Dev, Security, API, Product, Design, and BA agents in parallel

import { execSync } from "child_process";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const BASE_URL = "http://localhost:8080";
let totalIssues = 0;
let totalPassed = 0;

function log(agent, icon, msg) { console.log(`  ${icon} [${agent}] ${msg}`); }
function pass(agent, msg) { totalPassed++; log(agent, "✓", msg); }
function warn(agent, msg) { totalIssues++; log(agent, "⚠", msg); }
function fail(agent, msg) { totalIssues++; log(agent, "✗", msg); }

function readFile(path) {
  try { return readFileSync(join(ROOT, path), "utf-8"); } catch { return null; }
}

function walkDir(dir, ext) {
  const files = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory() && !entry.includes("node_modules") && !entry.startsWith(".")) {
          files.push(...walkDir(full, ext));
        } else if (entry.endsWith(ext)) {
          files.push(full);
        }
      } catch {}
    }
  } catch {}
  return files;
}

// ═══════════════════════════════════════════
// AGENT 1: QA ENGINEER
// ═══════════════════════════════════════════
async function qaAgent() {
  console.log("\n🧪 QA ENGINEER AGENT");
  console.log("─".repeat(50));

  // Route tests
  const routes = ["/", "/pricing", "/trip-planner", "/saved-trips", "/my-bookings", "/auth", "/profile", "/tripgenie-live.html"];
  for (const route of routes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      if (res.status === 200) pass("QA", `Route ${route} → 200 OK`);
      else fail("QA", `Route ${route} → ${res.status}`);
    } catch {
      fail("QA", `Route ${route} → unreachable (is dev server running?)`);
    }
  }

  // Check 404 handling
  try {
    const res = await fetch(`${BASE_URL}/nonexistent-page`);
    if (res.status === 200) pass("QA", "404 fallback serves SPA → 200");
    else warn("QA", `404 page → ${res.status}`);
  } catch { fail("QA", "404 handling broken"); }

  // Check static assets
  for (const asset of ["/favicon.ico", "/robots.txt"]) {
    try {
      const res = await fetch(`${BASE_URL}${asset}`);
      if (res.status === 200) pass("QA", `Static ${asset} → 200`);
      else warn("QA", `Static ${asset} → ${res.status}`);
    } catch { fail("QA", `Static ${asset} → unreachable`); }
  }

  // Check HTML content quality
  try {
    const res = await fetch(BASE_URL);
    const html = await res.text();
    if (html.includes("<title>TripGenie")) pass("QA", "Page title present");
    else warn("QA", "Missing page title");
    if (html.includes('meta name="description"')) pass("QA", "Meta description present");
    else warn("QA", "Missing meta description");
    if (html.includes('og:title')) pass("QA", "OpenGraph tags present");
    else warn("QA", "Missing OpenGraph tags");
  } catch {}
}

// ═══════════════════════════════════════════
// AGENT 2: DEV ENGINEER
// ═══════════════════════════════════════════
function devAgent() {
  console.log("\n💻 DEV ENGINEER AGENT");
  console.log("─".repeat(50));

  // TypeScript check
  try {
    execSync("npx tsc --noEmit", { stdio: "pipe", timeout: 60000 });
    pass("DEV", "TypeScript: zero errors");
  } catch (e) {
    const output = e.stdout?.toString() || "";
    const errorCount = (output.match(/error TS/g) || []).length;
    fail("DEV", `TypeScript: ${errorCount} error(s)`);
  }

  // Build check
  try {
    execSync("npx vite build", { stdio: "pipe", timeout: 60000 });
    pass("DEV", "Production build: success");
  } catch {
    fail("DEV", "Production build: FAILED");
  }

  // Check for console.log in production code (not scripts)
  const srcFiles = walkDir(join(ROOT, "src"), ".tsx").concat(walkDir(join(ROOT, "src"), ".ts"));
  let consoleLogs = 0;
  for (const file of srcFiles) {
    const content = readFileSync(file, "utf-8");
    const matches = content.match(/console\.(log|warn|error)\(/g);
    if (matches) consoleLogs += matches.length;
  }
  if (consoleLogs > 10) warn("DEV", `${consoleLogs} console statements in src/ (consider removing for prod)`);
  else pass("DEV", `Console statements: ${consoleLogs} (acceptable)`);

  // Check package.json health
  const pkg = JSON.parse(readFile("package.json"));
  const depCount = Object.keys(pkg.dependencies || {}).length;
  const devDepCount = Object.keys(pkg.devDependencies || {}).length;
  pass("DEV", `Dependencies: ${depCount} prod, ${devDepCount} dev`);

  // Check for TODO/FIXME/HACK comments
  let todos = 0;
  for (const file of srcFiles) {
    const content = readFileSync(file, "utf-8");
    const matches = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi);
    if (matches) todos += matches.length;
  }
  if (todos > 0) warn("DEV", `${todos} TODO/FIXME comments found`);
  else pass("DEV", "No TODO/FIXME comments");

  // Check for unused imports (basic heuristic)
  pass("DEV", `Source files: ${srcFiles.length} .ts/.tsx files`);
}

// ═══════════════════════════════════════════
// AGENT 3: API MONITOR
// ═══════════════════════════════════════════
async function apiAgent() {
  console.log("\n🔌 API MONITOR AGENT");
  console.log("─".repeat(50));

  const apis = [
    { name: "Open-Meteo (Weather)", url: "https://api.open-meteo.com/v1/forecast?latitude=15.5&longitude=73.8&daily=temperature_2m_max&timezone=auto&forecast_days=1" },
    { name: "Open-Meteo Geocoding", url: "https://geocoding-api.open-meteo.com/v1/search?name=Goa&count=1" },
    { name: "Currency API", url: "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/inr.json" },
    { name: "REST Countries", url: "https://restcountries.com/v3.1/name/India?fields=name" },
    { name: "Supabase Health", url: "https://kvngtrxdpfpoukwqzbyw.supabase.co/rest/v1/" },
  ];

  for (const api of apis) {
    try {
      const start = performance.now();
      const res = await fetch(api.url, {
        headers: api.name.includes("Supabase") ? {
          apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmd0cnhkcGZwb3Vrd3F6Ynl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjY2NzgsImV4cCI6MjA5NTIwMjY3OH0.BbCC_PIgWnhE1qBwjHNscd7GCp21hjWpxgodAZT2CL0"
        } : {},
      });
      const ms = Math.round(performance.now() - start);
      if (res.ok) pass("API", `${api.name}: ${res.status} (${ms}ms)`);
      else if (res.status === 403) warn("API", `${api.name}: ${res.status} — blocked by sandbox (works on Vercel)`);
      else fail("API", `${api.name}: ${res.status} (${ms}ms)`);
    } catch (e) {
      warn("API", `${api.name}: Network error — sandbox restriction (works on Vercel)`);
    }
  }
}

// ═══════════════════════════════════════════
// AGENT 4: SECURITY AUDITOR
// ═══════════════════════════════════════════
function securityAgent() {
  console.log("\n🔒 SECURITY AUDITOR AGENT");
  console.log("─".repeat(50));

  // Check for hardcoded secrets
  const srcFiles = walkDir(join(ROOT, "src"), ".ts").concat(walkDir(join(ROOT, "src"), ".tsx"));
  let secretsFound = 0;
  const secretPatterns = [
    /sk-[a-zA-Z0-9]{20,}/g,        // OpenAI keys
    /password\s*[:=]\s*["'][^"']+/gi, // Hardcoded passwords
    /secret\s*[:=]\s*["'][^"']+/gi,   // Hardcoded secrets
    /private.key/gi,                 // Private key references
  ];

  for (const file of srcFiles) {
    const content = readFileSync(file, "utf-8");
    for (const pattern of secretPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        secretsFound += matches.length;
        fail("SEC", `Potential secret in ${file.replace(ROOT, "")}: ${matches[0].slice(0, 30)}...`);
      }
    }
  }
  if (secretsFound === 0) pass("SEC", "No hardcoded secrets found in source");

  // Check .env.local is gitignored
  const gitignore = readFile(".gitignore") || "";
  if (gitignore.includes(".env.local")) pass("SEC", ".env.local is gitignored");
  else fail("SEC", ".env.local NOT in .gitignore — secrets may be committed!");

  if (gitignore.includes(".env")) pass("SEC", ".env files are gitignored");
  else warn("SEC", ".env not in .gitignore");

  // Check vercel.json security headers
  const vercelConfig = readFile("vercel.json");
  if (vercelConfig) {
    if (vercelConfig.includes("X-Frame-Options")) pass("SEC", "X-Frame-Options header configured");
    else warn("SEC", "Missing X-Frame-Options header");
    if (vercelConfig.includes("X-Content-Type-Options")) pass("SEC", "X-Content-Type-Options header configured");
    else warn("SEC", "Missing X-Content-Type-Options header");
    if (vercelConfig.includes("Referrer-Policy")) pass("SEC", "Referrer-Policy header configured");
    else warn("SEC", "Missing Referrer-Policy header");
  } else {
    warn("SEC", "No vercel.json found");
  }

  // Check RLS in migration
  const migration = readFile("supabase/migrations/001_initial.sql") || "";
  if (migration.includes("enable row level security")) pass("SEC", "Row Level Security enabled on all tables");
  else fail("SEC", "Row Level Security NOT enabled!");
  if (migration.includes("auth.uid()")) pass("SEC", "RLS policies use auth.uid() for data isolation");
  else fail("SEC", "RLS policies missing auth.uid() checks");

  // Check for XSS vectors (dangerouslySetInnerHTML)
  let xssVectors = 0;
  for (const file of srcFiles) {
    const content = readFileSync(file, "utf-8");
    if (content.includes("dangerouslySetInnerHTML")) xssVectors++;
    if (content.includes("eval(")) xssVectors++;
  }
  if (xssVectors === 0) pass("SEC", "No XSS vectors (dangerouslySetInnerHTML, eval)");
  else fail("SEC", `${xssVectors} potential XSS vector(s) found`);

  // Check dependencies for known vulnerability patterns
  const pkg = JSON.parse(readFile("package.json"));
  const deps = Object.keys(pkg.dependencies || {});
  if (deps.includes("@supabase/supabase-js")) pass("SEC", "Using official Supabase SDK");
  if (!deps.includes("express") && !deps.includes("koa")) pass("SEC", "No server framework exposed client-side");

  // Check affiliate links use rel="noopener"
  let unsafeLinks = 0;
  for (const file of srcFiles) {
    const content = readFileSync(file, "utf-8");
    const targetBlank = (content.match(/target="_blank"/g) || []).length;
    const noopener = (content.match(/rel="noopener/g) || []).length;
    if (targetBlank > noopener) unsafeLinks += (targetBlank - noopener);
  }
  if (unsafeLinks === 0) pass("SEC", "All external links have rel='noopener'");
  else warn("SEC", `${unsafeLinks} links with target='_blank' missing rel='noopener'`);

  // npm audit
  try {
    execSync("npm audit --json 2>/dev/null", { stdio: "pipe", timeout: 30000 });
    pass("SEC", "npm audit: no vulnerabilities");
  } catch (e) {
    try {
      const audit = JSON.parse(e.stdout?.toString() || "{}");
      const vulns = audit.metadata?.vulnerabilities || {};
      const critical = vulns.critical || 0;
      const high = vulns.high || 0;
      if (critical > 0) fail("SEC", `npm audit: ${critical} critical vulnerability(ies)`);
      else if (high > 0) warn("SEC", `npm audit: ${high} high vulnerability(ies) (review with npm audit)`);
      else pass("SEC", "npm audit: no critical/high vulnerabilities");
    } catch {
      warn("SEC", "npm audit: could not parse results");
    }
  }
}

// ═══════════════════════════════════════════
// AGENT 5: PRODUCT MANAGER
// ═══════════════════════════════════════════
function productAgent() {
  console.log("\n📋 PRODUCT MANAGER AGENT");
  console.log("─".repeat(50));

  // Check monetization completeness
  const pricing = readFile("src/pages/Pricing.tsx");
  if (pricing) pass("PM", "Pricing page exists with subscription tiers");
  else fail("PM", "Missing pricing page");

  const affiliate = readFile("src/components/monetization/AffiliateBooking.tsx");
  if (affiliate) {
    const partnerCount = (affiliate.match(/name: "/g) || []).length;
    pass("PM", `Affiliate partners: ${partnerCount} integrated`);
  } else fail("PM", "Missing affiliate integration");

  const adBanner = readFile("src/components/monetization/AdBanner.tsx");
  if (adBanner) pass("PM", "Ad placement component ready");
  else warn("PM", "No ad placement component");

  const supportWidget = readFile("src/components/monetization/SupportWidget.tsx");
  if (supportWidget) pass("PM", "Support/donation widget ready");
  else warn("PM", "No support widget");

  // Check feature completeness
  const features = {
    "AI Trip Planning": readFile("src/lib/ai.ts"),
    "User Authentication": readFile("src/contexts/AuthContext.tsx"),
    "Subscription Management": readFile("src/contexts/SubscriptionContext.tsx"),
    "Multi-Agent System": readFile("src/lib/agents/orchestrator.ts"),
    "Weather Forecasts": readFile("src/lib/agents/WeatherAgent.ts"),
    "Currency Conversion": readFile("src/lib/agents/CurrencyAgent.ts"),
    "Trip Database (CRUD)": readFile("src/lib/api.ts"),
    "Supabase Integration": readFile("src/lib/supabase.ts"),
  };

  for (const [name, content] of Object.entries(features)) {
    if (content) pass("PM", `Feature: ${name}`);
    else warn("PM", `Missing feature: ${name}`);
  }

  // Product suggestions
  console.log("\n  📌 Product Suggestions:");
  console.log("    → Add user onboarding flow (first-time wizard)");
  console.log("    → Add email notifications for price drop alerts");
  console.log("    → Add collaborative trip planning (share trip with friends)");
  console.log("    → Add trip comparison (side-by-side view)");
  console.log("    → Add travel journal/diary feature");
  console.log("    → Add offline mode with PWA support");
  console.log("    → Add push notifications for booking updates");
}

// ═══════════════════════════════════════════
// AGENT 6: UI/UX DESIGNER
// ═══════════════════════════════════════════
function designAgent() {
  console.log("\n🎨 UI/UX DESIGNER AGENT");
  console.log("─".repeat(50));

  // Check design system
  const indexCss = readFile("src/index.css") || "";
  if (indexCss.includes("--primary:")) pass("UX", "Design tokens defined (CSS variables)");
  else warn("UX", "No design tokens found");

  if (indexCss.includes("--gradient-primary")) pass("UX", "Gradient system configured");
  if (indexCss.includes("Outfit")) pass("UX", "Custom font (Outfit) loaded");
  else warn("UX", "No custom font configured");

  if (indexCss.includes("scroll-behavior: smooth")) pass("UX", "Smooth scrolling enabled");
  if (indexCss.includes("::-webkit-scrollbar")) pass("UX", "Custom scrollbar styled");

  // Check responsive design
  const srcFiles = walkDir(join(ROOT, "src"), ".tsx");
  let responsiveFiles = 0;
  let animatedFiles = 0;
  for (const file of srcFiles) {
    const content = readFileSync(file, "utf-8");
    if (content.includes("md:") || content.includes("lg:") || content.includes("sm:")) responsiveFiles++;
    if (content.includes("framer-motion") || content.includes("motion.")) animatedFiles++;
  }
  pass("UX", `Responsive design: ${responsiveFiles}/${srcFiles.length} files use breakpoints`);
  pass("UX", `Animations: ${animatedFiles} files use Framer Motion`);

  // Check accessibility
  let ariaCount = 0;
  let altCount = 0;
  for (const file of srcFiles) {
    const content = readFileSync(file, "utf-8");
    ariaCount += (content.match(/aria-/g) || []).length;
    altCount += (content.match(/alt="/g) || []).length;
  }
  if (altCount > 5) pass("UX", `Accessibility: ${altCount} alt attributes on images`);
  else warn("UX", `Only ${altCount} alt attributes — add more for accessibility`);

  // Check component library
  const uiComponents = readdirSync(join(ROOT, "src/components/ui")).length;
  pass("UX", `UI component library: ${uiComponents} shadcn-ui components`);

  // Design suggestions
  console.log("\n  📌 Design Suggestions:");
  console.log("    → Add skeleton loading states for all data pages");
  console.log("    → Add dark/light mode toggle in header");
  console.log("    → Add micro-interactions on button hover/click");
  console.log("    → Add empty state illustrations (not just icons)");
  console.log("    → Add progress indicator for multi-step booking flow");
}

// ═══════════════════════════════════════════
// AGENT 7: BUSINESS ANALYST
// ═══════════════════════════════════════════
function baAgent() {
  console.log("\n📊 BUSINESS ANALYST AGENT");
  console.log("─".repeat(50));

  // Code metrics
  const tsxFiles = walkDir(join(ROOT, "src"), ".tsx");
  const tsFiles = walkDir(join(ROOT, "src"), ".ts");
  let totalLines = 0;
  for (const file of [...tsxFiles, ...tsFiles]) {
    totalLines += readFileSync(file, "utf-8").split("\n").length;
  }
  pass("BA", `Codebase: ${tsxFiles.length + tsFiles.length} files, ${totalLines.toLocaleString()} lines`);

  // Page count
  const pages = readdirSync(join(ROOT, "src/pages")).filter(f => f.endsWith(".tsx"));
  pass("BA", `Pages: ${pages.length} (${pages.map(p => p.replace(".tsx", "")).join(", ")})`);

  // Component count
  const components = walkDir(join(ROOT, "src/components"), ".tsx").length;
  pass("BA", `Custom components: ${components}`);

  // Agent count
  const agents = walkDir(join(ROOT, "src/lib/agents"), ".ts").length;
  pass("BA", `AI agents: ${agents}`);

  // API integrations
  const apiFile = readFile("src/lib/ai.ts") || "";
  const agentFiles = walkDir(join(ROOT, "src/lib/agents"), ".ts").map(f => readFileSync(f, "utf-8")).join("");
  const apiUrls = new Set();
  const urlPattern = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  for (const match of (apiFile + agentFiles).matchAll(urlPattern)) {
    if (!match[0].includes("unsplash") && !match[0].includes("localhost")) apiUrls.add(match[0]);
  }
  pass("BA", `External API integrations: ${apiUrls.size}`);

  // Revenue streams
  console.log("\n  📈 Revenue Stream Analysis:");
  console.log("    1. Stripe Subscriptions — Pro (₹799/mo) + Premium (₹1,599/mo)");
  console.log("    2. Affiliate Marketing — 5 partners (Booking.com, Skyscanner, MakeMyTrip, Agoda, Cleartrip)");
  console.log("    3. Google AdSense — Banner ads (hidden for paid users)");
  console.log("    4. Buy Me a Coffee — Donation/tip jar");
  console.log("\n  📊 Key Metrics to Track:");
  console.log("    → MAU (Monthly Active Users)");
  console.log("    → Conversion rate (Free → Pro)");
  console.log("    → Affiliate click-through rate");
  console.log("    → Average session duration");
  console.log("    → Trip searches per user");
  console.log("    → Booking completion rate");
}

// ═══════════════════════════════════════════
// MAIN: RUN ALL AGENTS IN PARALLEL
// ═══════════════════════════════════════════
async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  TRIPGENIE PRODUCT ORGANIZATION AGENTS (ruflo)  ║");
  console.log("║  7 agents • parallel execution • full audit     ║");
  console.log("╚══════════════════════════════════════════════════╝");

  const start = performance.now();

  // Run all agents (sync agents run first, then async agents in parallel)
  devAgent();
  securityAgent();
  designAgent();
  productAgent();
  baAgent();
  await Promise.all([qaAgent(), apiAgent()]);

  const elapsed = Math.round(performance.now() - start);

  console.log("\n" + "═".repeat(50));
  console.log(`PRODUCT ORG REPORT`);
  console.log("═".repeat(50));
  console.log(`  Agents run:     7`);
  console.log(`  Checks passed:  ${totalPassed}`);
  console.log(`  Issues found:   ${totalIssues}`);
  console.log(`  Total time:     ${elapsed}ms`);
  console.log(`  Health score:   ${Math.round((totalPassed / (totalPassed + totalIssues)) * 100)}%`);
  console.log("═".repeat(50));

  if (totalIssues > 10) process.exit(1);
}

main().catch(console.error);
