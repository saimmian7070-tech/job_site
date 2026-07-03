import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Settings from "@/models/Settings";

// ════════════════════════════════════════════════════════════════════
// PERFORMANCE CONSTANTS
// ════════════════════════════════════════════════════════════════════
const JOBS_PER_COMPANY         = 15;
const BATCH_SIZE               = 254;
const PARALLEL_JOBS            = 1;
const INTER_JOB_DELAY_MS       = 0;
const INTER_COMPANY_DELAY_MS   = 0;
const CIRCUIT_OPEN_DURATION_MS = 60 * 60 * 1000;
const CIRCUIT_FAILURE_THRESHOLD = 2;
const PAUSE_DURATION_MS        = 23 * 60 * 60 * 1000;
const AI_TIMEOUT_MS            = 25_000;
const MAX_JOB_AGE_MS           = 180 * 24 * 60 * 60 * 1000; // 6 months

// ════════════════════════════════════════════════════════════════════
// MODEL POOL
// ════════════════════════════════════════════════════════════════════
const MODEL_POOL: { provider: string; model: string; envKey: string }[] = [
  // Gemini account 1
  { provider: "gemini", model: "gemini-2.5-flash", envKey: "GEMINI_API_KEY" },
  { provider: "gemini", model: "gemini-2.0-flash", envKey: "GEMINI_API_KEY" },
  { provider: "gemini", model: "gemini-2.0-flash-lite", envKey: "GEMINI_API_KEY" },
  { provider: "gemini", model: "gemini-3.1-flash-lite", envKey: "GEMINI_API_KEY" },
  { provider: "gemini", model: "gemma-4-26b", envKey: "GEMINI_API_KEY" },
  { provider: "gemini", model: "gemma-4-31b", envKey: "GEMINI_API_KEY" },
  // Gemini account 2
  { provider: "gemini", model: "gemini-2.5-flash", envKey: "GEMINI_API_KEY_2" },
  { provider: "gemini", model: "gemini-2.0-flash", envKey: "GEMINI_API_KEY_2" },
  { provider: "gemini", model: "gemini-2.0-flash-lite", envKey: "GEMINI_API_KEY_2" },
  { provider: "gemini", model: "gemini-3.1-flash-lite", envKey: "GEMINI_API_KEY_2" },
  { provider: "gemini", model: "gemma-4-26b", envKey: "GEMINI_API_KEY_2" },
  { provider: "gemini", model: "gemma-4-31b", envKey: "GEMINI_API_KEY_2" },
  // Groq account 1
  { provider: "groq", model: "llama-3.3-70b-versatile", envKey: "GROQ_API_KEY" },
  { provider: "groq", model: "llama-3.1-8b-instant", envKey: "GROQ_API_KEY" },
  // Groq account 2
  { provider: "groq", model: "llama-3.3-70b-versatile", envKey: "GROQ_API_KEY_2" },
  { provider: "groq", model: "llama-3.1-8b-instant", envKey: "GROQ_API_KEY_2" },
  // OpenRouter account 1
  { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct:free", envKey: "OPENROUTER_API_KEY" },
  // OpenRouter account 2
  { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct:free", envKey: "OPENROUTER_API_KEY_2" },
  // Cohere account 1
  { provider: "cohere", model: "command-r-plus-08-2024", envKey: "COHERE_API_KEY" },
  { provider: "cohere", model: "command-r-08-2024", envKey: "COHERE_API_KEY" },
  // Cohere account 2
  { provider: "cohere", model: "command-r-plus-08-2024", envKey: "COHERE_API_KEY_2" },
  { provider: "cohere", model: "command-r-08-2024", envKey: "COHERE_API_KEY_2" },
  // Gemini account 3
  { provider: "gemini", model: "gemini-2.5-flash", envKey: "GEMINI_API_KEY_3" },
  { provider: "gemini", model: "gemini-2.0-flash", envKey: "GEMINI_API_KEY_3" },
  { provider: "gemini", model: "gemini-3.1-flash-lite", envKey: "GEMINI_API_KEY_3" },
  { provider: "gemini", model: "gemma-4-26b", envKey: "GEMINI_API_KEY_3" },
  // Gemini account 4
  { provider: "gemini", model: "gemini-2.5-flash", envKey: "GEMINI_API_KEY_4" },
  { provider: "gemini", model: "gemini-2.0-flash", envKey: "GEMINI_API_KEY_4" },
  { provider: "gemini", model: "gemini-3.1-flash-lite", envKey: "GEMINI_API_KEY_4" },
  { provider: "gemini", model: "gemma-4-26b", envKey: "GEMINI_API_KEY_4" },
  // OpenRouter account 3
  { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct:free", envKey: "OPENROUTER_API_KEY_3" },
  // Cohere account 3
  { provider: "cohere", model: "command-r-plus-08-2024", envKey: "COHERE_API_KEY_3" },
  { provider: "cohere", model: "command-r-08-2024", envKey: "COHERE_API_KEY_3" },
  // Cerebras account 1
  { provider: "cerebras", model: "llama-3.3-70b", envKey: "CEREBRAS_API_KEY" },
];

// ════════════════════════════════════════════════════════════════════
// IN-PROCESS CIRCUIT BREAKER
// ════════════════════════════════════════════════════════════════════
interface CircuitState { failures: number; openUntil: number; }
const circuits = new Map<string, CircuitState>();
const circuitKey = (p: string, m: string) => `${p}::${m}`;

function isCircuitOpen(provider: string, model: string): boolean {
  const s = circuits.get(circuitKey(provider, model));
  if (!s || s.openUntil === 0) return false;
  if (Date.now() < s.openUntil) return true;
  circuits.set(circuitKey(provider, model), { failures: 0, openUntil: 0 });
  return false;
}

function recordSuccess(provider: string, model: string) {
  circuits.set(circuitKey(provider, model), { failures: 0, openUntil: 0 });
}

function recordFailure(provider: string, model: string) {
  const key = circuitKey(provider, model);
  const s = circuits.get(key) ?? { failures: 0, openUntil: 0 };
  s.failures += 1;
  if (s.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    s.openUntil = Date.now() + CIRCUIT_OPEN_DURATION_MS;
    log(`🔴 Circuit OPEN: ${provider}/${model} — cooling 1 hr`);
  }
  circuits.set(key, s);
}

// ════════════════════════════════════════════════════════════════════
// TIMING INSTRUMENTATION
// ════════════════════════════════════════════════════════════════════
const timings: Record<string, number[]> = { db_fetch: [], db_write: [], ai_call: [], ats_fetch: [] };
const recordTiming = (k: string, ms: number) => (timings[k] ??= []).push(ms);
const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
const timingSummary = () => Object.entries(timings).map(([k, v]) => `${k}:avg=${avg(v)}ms(n=${v.length})`).join(" ");

// ════════════════════════════════════════════════════════════════════
// LOGGING
// ════════════════════════════════════════════════════════════════════
const log = (msg: string) => process.stdout.write(`[${new Date().toISOString()}] ${msg}\n`);

// ════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ════════════════════════════════════════════════════════════════════
const TONE_VARIANTS = [
  "Professional and formal, ideal for corporate audiences.",
  "Friendly and approachable, speaking directly to the candidate.",
  "Energetic and motivating, exciting candidates about the opportunity.",
  "Concise and direct, focusing on clarity and impact.",
  "Warm and inclusive, emphasizing company culture and belonging.",
];
let toneIndex = 0;

function buildPrompt(title: string, company: string, location: string, jobType: string, rawText: string): string {
  const tone = TONE_VARIANTS[toneIndex % TONE_VARIANTS.length];
  const sections = [
    { resp: "Key Responsibilities",        req: "Requirements & Qualifications", offer: "What We Offer" },
    { resp: "What You'll Do",              req: "What You'll Bring",             offer: "Why Join Us" },
    { resp: "Your Role",                   req: "About You",                     offer: "Perks & Benefits" },
    { resp: "Day-to-Day Responsibilities", req: "Skills & Experience",           offer: "Benefits" },
    { resp: "Core Duties",                req: "Who We're Looking For",          offer: "What's In It For You" },
  ];
  const s = sections[toneIndex % sections.length];
  const closings = [
    "Start the closing by describing what the candidate will actually do day-to-day.",
    "Start the closing by naming the team or department.",
    "Start the closing with a direct line about next steps after applying.",
    "Start the closing addressing what type of person fits this role.",
    "Start the closing with a question connecting to the role's core challenge.",
  ];
  const closing = closings[toneIndex % closings.length];
  toneIndex++;

  return `You are a professional job listing writer for "Jobs Home Online". Rewrite this job into clean HTML. Tone: ${tone}. Target: 500-700 words.

Job: ${title} at ${company}, ${location} (${jobType})
Description: ${rawText.slice(0, 2000)}

Output ONLY HTML starting with <p>. Use <h3>, <p>, <ul>, <li>.
Sections: intro (3-4 sentences) | <h3>${s.resp}</h3> (6-8 bullets) | <h3>${s.req}</h3> (6-8 bullets) | <h3>${s.offer}</h3> (5-6 bullets) | closing (2-3 sentences, ${closing}).
Rules: use real details from description; no verbatim copy; no "dynamic team/fast-paced/cutting-edge/game-changer/take your career to the next level".`;
}

// ════════════════════════════════════════════════════════════════════
// TIMEOUT WRAPPER
// ════════════════════════════════════════════════════════════════════
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`Timeout(${ms}ms): ${label}`)), ms))]);
}

// ════════════════════════════════════════════════════════════════════
// ERRORS
// ════════════════════════════════════════════════════════════════════
class RateLimitError extends Error { constructor(public provider: string, public model: string) { super(); } }
class ModelError extends Error { constructor(public provider: string, public model: string, reason: string) { super(reason); } }

// ════════════════════════════════════════════════════════════════════
// AI CALLER
// ════════════════════════════════════════════════════════════════════
async function callModel(entry: typeof MODEL_POOL[number], prompt: string): Promise<string> {
  const { provider, model, envKey } = entry;
  const apiKey = process.env[envKey];
  if (!apiKey) throw new ModelError(provider, model, `Missing ${envKey}`);
  let raw = "";

  if (["groq", "cerebras", "openrouter"].includes(provider)) {
    const urls: Record<string, string> = {
      groq: "https://api.groq.com/openai/v1/chat/completions",
      cerebras: "https://api.cerebras.ai/v1/chat/completions",
      openrouter: "https://openrouter.ai/api/v1/chat/completions",
    };
    const res = await withTimeout(fetch(urls[provider], {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens: 2048, messages: [
        { role: "system", content: "Output ONLY valid HTML with <h3><p><ul><li> tags. No plain text." },
        { role: "user", content: prompt },
      ]}),
    }), AI_TIMEOUT_MS, `${provider}/${model}`);
    const data = await res.json();
    const err: string = data?.error?.message ?? "";
    if (res.status === 429 || err.toLowerCase().includes("rate limit")) throw new RateLimitError(provider, model);
    if (err) throw new ModelError(provider, model, err);
    raw = data?.choices?.[0]?.message?.content ?? "";

  } else if (provider === "cohere") {
    const res = await withTimeout(fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 2048 }),
    }), AI_TIMEOUT_MS, `cohere/${model}`);
    const data = await res.json();
    if (res.status === 429) throw new RateLimitError(provider, model);
    if (typeof data?.message === "string" && data.message.includes("error")) throw new ModelError(provider, model, data.message);
    raw = data?.message?.content?.[0]?.text ?? "";

  } else if (provider === "gemini") {
    const res = await withTimeout(fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 2048 } }) }
    ), AI_TIMEOUT_MS, `gemini/${model}`);
    const data = await res.json();
    if (res.status === 429) throw new RateLimitError(provider, model);
    if (data?.error) throw new ModelError(provider, model, data.error.message ?? "unknown");
    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  return raw
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^[\s\S]*?(?=<[ph])/i, "")
    .replace(/```html|```/g, "")
    .replace(/<!DOCTYPE[^>]*>|<\/?html[^>]*>|<head>[\s\S]*?<\/head>|<\/?body[^>]*>/gi, "")
    .trim();
}

// ════════════════════════════════════════════════════════════════════
// SMART FALLBACK — skips open circuits
// ════════════════════════════════════════════════════════════════════
const availableModels = () => MODEL_POOL.filter(({ provider, model }) => !isCircuitOpen(provider, model));

async function generateWithFallback(prompt: string): Promise<string> {
  const pool = availableModels();
  if (!pool.length) return "";

  for (const entry of pool) {
    const t0 = Date.now();
    try {
      log(`  ↳ ${entry.provider}/${entry.model}`);
      const content = await callModel(entry, prompt);
      recordTiming("ai_call", Date.now() - t0);
      if (content?.includes("<")) {
        recordSuccess(entry.provider, entry.model);
        if (["gemini", "groq"].includes(entry.provider)) {
          await new Promise((r) => setTimeout(r, 4000));
        }
        return content;
      }
      log(`  ⚠️  empty response`);
      recordFailure(entry.provider, entry.model);
    } catch (err) {
      recordTiming("ai_call", Date.now() - t0);
      if (err instanceof RateLimitError) { log(`  ⏱ rate limit`); recordFailure(err.provider, err.model); }
      else if (err instanceof ModelError) { log(`  ❌ model error: ${err.message}`); recordFailure(err.provider, err.model); }
      else { log(`  💥 ${(err as Error).message}`); recordFailure(entry.provider, entry.model); }
    }
  }
  return "";
}

// ════════════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════════════
const CATEGORY_MAP: Record<string, string> = {
  "software engineer":"Engineering","engineering":"Engineering","dev eng":"Engineering",
  "solutions engineering":"Engineering","systems engineering":"Engineering","data engineering":"Engineering",
  "cloud engineering":"Engineering","frontend":"Engineering","backend":"Engineering",
  "sales":"Sales","account executive":"Sales","bdr":"Sales","field sales":"Sales","enterprise sales":"Sales","mid market":"Sales",
  "marketing":"Marketing","field marketing":"Marketing","corporate marketing":"Marketing","growth":"Marketing","gtm enablement":"Marketing",
  "finance":"Finance","accounting":"Finance","financial planning":"Finance","finance & bizops":"Finance",
  "customer success":"Customer","customer support":"Customer","customer experience":"Customer","support":"Customer",
  "design":"Design","product design":"Design","product management":"Product","product":"Product",
  "human resources":"HR","talent acquisition":"HR","legal":"Legal","compliance":"Legal",
};
const JOBTYPE_MAP: Record<string, string> = {
  "full-time":"Full-Time","fulltime":"Full-Time","full time":"Full-Time",
  "part-time":"Part-Time","contract":"Contract","internship":"Internship","freelance":"Freelance","remote":"Remote",
};
const normalizeCategory = (raw = "") => { const l = raw.toLowerCase().trim(); for (const [k,v] of Object.entries(CATEGORY_MAP)) if (l.includes(k)) return v; return "Other"; };
const normalizeJobType = (raw = "", location = "") => { const l = raw.toLowerCase().trim(); const loc = location.toLowerCase(); if (loc.includes("remote") && !l.includes("part") && !l.includes("contract")) return "Remote"; for (const [k,v] of Object.entries(JOBTYPE_MAP)) if (l.includes(k)) return v; return "Full-Time"; };
const cleanText = (t: string) => t ? t.replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/[^\x00-\x7F\u00C0-\u024F\u0600-\u06FF]/g,"").replace(/\s{2,}/g," ").trim() : "";
const stripHtml = (h: string) => h ? h.replace(/&quot;/g,'"').replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ").replace(/&#39;/g,"'").replace(/\{["\d:,\s.a-zA-Z_-]{20,}\}/g,"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim() : "";
const decodeHtml = (t: string) => t.replace(/&#39;/g,"'").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ");
const slugify = (t: string) => t.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
const getCompanyLogo = (s: string) => `https://www.google.com/s2/favicons?domain=${s.replace(/[^a-z0-9-]/g,"")}.com&sz=128`;
const isEnglishTitle = (t: string) => /^[\u0000-\u007F\u00C0-\u024F\s]+$/.test(t);
const extractSalary = (t: string) => { const m = t.match(/(\$|£|€|USD|GBP|EUR)\s?[\d,]+\s?(k|K)?\s?[-–to]+\s?(\$|£|€)?\s?[\d,]+\s?(k|K)?(\s?(per year|\/yr|\/year|annually))?/i); return m ? m[0].trim() : ""; };
function buildDescription(raw = "") { const clean = cleanText(stripHtml(decodeHtml(raw))); const first = clean.split(/(?<=[.!?])\s+/)[0]??clean; if (/^[A-Z0-9]{5,}\s|^\d+|[A-Z]{2,}\d{3,}/.test(first)||first.split(" ").length<6) return ""; return first.length>160?first.slice(0,157).trimEnd()+"...":first; }
async function uniqueSlug(base: string, externalId: string): Promise<string> { let slug=base,n=1; while(true){const t0=Date.now();const c=await Job.findOne({slug,externalId:{$ne:externalId}}).lean();recordTiming("db_fetch",Date.now()-t0);if(!c)return slug;slug=`${base}-${++n}`;} }

// ════════════════════════════════════════════════════════════════════
// EMAIL
// ════════════════════════════════════════════════════════════════════
async function sendEmail(subject: string, html: string) {
  try { await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.RESEND_API_KEY}`},body:JSON.stringify({from:"onboarding@resend.dev",to:"saimmian505@gmail.com",subject,html})}); }
  catch(e){log(`email failed: ${(e as Error).message}`);}
}

// ════════════════════════════════════════════════════════════════════
// ATS FETCHERS
// ════════════════════════════════════════════════════════════════════
async function fetchGreenhouse(slug: string): Promise<any[]> {
  try {
    const t0 = Date.now();
    const res = await withTimeout(fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,{cache:"no-store"}),10_000,`gh/${slug}`);
    recordTiming("ats_fetch",Date.now()-t0);
    if(!res.ok){ log(`  ❌ ${slug}: no jobs`); return[]; }
    const json=await res.json();
    const sixMonthsAgo = Date.now() - MAX_JOB_AGE_MS;
    const result = (json?.jobs??[])
      .filter((j:any) => j.title?.trim().length > 3)
      .filter((j:any) => {
        const posted = j.updated_at ? new Date(j.updated_at).getTime() : Date.now();
        return posted > sixMonthsAgo;
      })
      .slice(0, JOBS_PER_COMPANY)
      .map((j:any)=>({
        externalId:`greenhouse-${slug}-${j.id}`,title:j.title,company:slug,location:j.location?.name??"",
        jobType:"Full-time",applyUrl:j.absolute_url,rawContent:j.content??"",
        postedAt:j.updated_at?new Date(j.updated_at):new Date(),category:j.departments?.[0]?.name??"",
      }));
    log(`  ${result.length > 0 ? "✅" : "❌"} ${slug}: ${result.length} jobs`);
    return result;
  } catch{ log(`  ❌ ${slug}: fetch error`); return[]; }
}

async function fetchLever(slug: string): Promise<any[]> {
  try {
    const t0=Date.now();
    const res=await withTimeout(fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`,{cache:"no-store"}),10_000,`lever/${slug}`);
    recordTiming("ats_fetch",Date.now()-t0);
    if(!res.ok){ log(`  ❌ ${slug}: no jobs`); return[]; }
    const jobs:any[]=await res.json();
    const sixMonthsAgo = Date.now() - MAX_JOB_AGE_MS;
    const result = jobs
      .filter((j:any) => {
        const posted = j.createdAt ? new Date(j.createdAt).getTime() : Date.now();
        return posted > sixMonthsAgo;
      })
      .slice(0, JOBS_PER_COMPANY)
      .map((j)=>({
        externalId:`lever-${slug}-${j.id}`,title:j.text,company:slug,
        location:j.categories?.location??"",jobType:j.categories?.commitment??"Full-time",
        applyUrl:j.hostedUrl,rawContent:j.descriptionPlain??"",postedAt:j.createdAt?new Date(j.createdAt):new Date(),
      }));
    log(`  ${result.length > 0 ? "✅" : "❌"} ${slug}: ${result.length} jobs`);
    return result;
  } catch{ log(`  ❌ ${slug}: fetch error`); return[]; }
}

// ════════════════════════════════════════════════════════════════════
// COMPANIES
// ════════════════════════════════════════════════════════════════════
export const COMPANIES: { slug: string; ats: "greenhouse" | "lever" | "workday" | "ashby" | "icims" |
   "taleo" | "usajobs" | "crossover" | "toptal" | "shortcut" | "zendesk" }[] = [
  { slug: "airbnb", ats: "greenhouse" },
  { slug: "figma", ats: "greenhouse" },
  { slug: "twilio", ats: "greenhouse" },
  { slug: "datadog", ats: "greenhouse" },
  { slug: "cloudflare", ats: "greenhouse" },
  { slug: "coinbase", ats: "greenhouse" },
  { slug: "brex", ats: "greenhouse" },
  { slug: "gusto", ats: "greenhouse" },
  { slug: "lattice", ats: "greenhouse" },
  { slug: "robinhood", ats: "greenhouse" },
  { slug: "pagerduty", ats: "greenhouse" },
  { slug: "intercom", ats: "greenhouse" },
  { slug: "okta", ats: "greenhouse" },
  { slug: "fastly", ats: "greenhouse" },
  { slug: "fivetran", ats: "greenhouse" },
  { slug: "scaleai", ats: "greenhouse" },
  { slug: "airtable", ats: "greenhouse" },
  { slug: "asana", ats: "greenhouse" },
  { slug: "anthropic", ats: "greenhouse" },
  { slug: "databricks", ats: "greenhouse" },
  { slug: "lyft", ats: "greenhouse" },
  { slug: "marqeta", ats: "greenhouse" },
  { slug: "chime", ats: "greenhouse" },
  { slug: "newrelic", ats: "greenhouse" },
  { slug: "netlify", ats: "greenhouse" },
  { slug: "postman", ats: "greenhouse" },
  { slug: "starburst", ats: "greenhouse" },
  { slug: "vercel", ats: "greenhouse" },
  { slug: "planetscale", ats: "greenhouse" },
  { slug: "orca", ats: "greenhouse" },
  { slug: "abnormalsecurity", ats: "greenhouse" },
  { slug: "cybereason", ats: "greenhouse" },
  { slug: "mongodb", ats: "greenhouse" },
  { slug: "elastic", ats: "greenhouse" },
  { slug: "cockroachlabs", ats: "greenhouse" },
  { slug: "clickhouse", ats: "greenhouse" },
  { slug: "typeface", ats: "greenhouse" },
  { slug: "gitlab", ats: "greenhouse" },
  { slug: "jetbrains", ats: "greenhouse" },
  { slug: "circleci", ats: "greenhouse" },
  { slug: "buildkite", ats: "greenhouse" },
  { slug: "honeycomb", ats: "greenhouse" },
  { slug: "hightouch", ats: "greenhouse" },
  { slug: "tailscale", ats: "greenhouse" },
  { slug: "cortex", ats: "greenhouse" },
  { slug: "deepmind", ats: "greenhouse" },
  { slug: "affirm", ats: "greenhouse" },
  { slug: "mercury", ats: "greenhouse" },
  { slug: "lithic", ats: "greenhouse" },
  { slug: "celigo", ats: "greenhouse" },
  { slug: "nintex", ats: "greenhouse" },
  { slug: "workato", ats: "greenhouse" },
  { slug: "saucelabs", ats: "greenhouse" },
  { slug: "mabl", ats: "greenhouse" },
  { slug: "adyen", ats: "greenhouse" },
  { slug: "payoneer", ats: "greenhouse" },
  { slug: "flexport", ats: "greenhouse" },
  { slug: "project44", ats: "greenhouse" },
  { slug: "fourkites", ats: "greenhouse" },
  { slug: "knock", ats: "greenhouse" },
  { slug: "orchard", ats: "greenhouse" },
  { slug: "homeward", ats: "greenhouse" },
  { slug: "vacasa", ats: "greenhouse" },
  { slug: "watershed", ats: "greenhouse" },
  { slug: "patch", ats: "greenhouse" },
  { slug: "oscar", ats: "greenhouse" },
  { slug: "collectivehealth", ats: "greenhouse" },
  { slug: "healthjoy", ats: "greenhouse" },
  { slug: "transcarent", ats: "greenhouse" },
  { slug: "suki", ats: "greenhouse" },
  { slug: "consensys", ats: "greenhouse" },
  { slug: "collibra", ats: "greenhouse" },
  { slug: "jfrog", ats: "greenhouse" },
  { slug: "axonius", ats: "greenhouse" },
  { slug: "bitwarden", ats: "greenhouse" },
  { slug: "onetrust", ats: "greenhouse" },
  { slug: "dremio", ats: "greenhouse" },
  { slug: "sisense", ats: "greenhouse" },
  { slug: "brandwatch", ats: "greenhouse" },
  { slug: "cerebral", ats: "greenhouse" },
  { slug: "alma", ats: "greenhouse" },
  { slug: "blend", ats: "greenhouse" },
  { slug: "rubrik", ats: "greenhouse" },
  { slug: "druva", ats: "greenhouse" },
  { slug: "commvault", ats: "greenhouse" },
  { slug: "zuora", ats: "greenhouse" },
  { slug: "qualtrics", ats: "greenhouse" },
  { slug: "hootsuite", ats: "greenhouse" },
  { slug: "appsflyer", ats: "greenhouse" },
  { slug: "branch", ats: "greenhouse" },
  { slug: "airship", ats: "greenhouse" },
  { slug: "taboola", ats: "greenhouse" },
  { slug: "pubmatic", ats: "greenhouse" },
  { slug: "doubleverify", ats: "greenhouse" },
  { slug: "similarweb", ats: "greenhouse" },
  { slug: "alltrails", ats: "lever" },
  { slug: "contentsquare", ats: "lever" },
  { slug: "kabam", ats: "lever" },
  { slug: "whoop", ats: "lever" },
  { slug: "ro", ats: "lever" },
  { slug: "brilliant", ats: "lever" },
  { slug: "sure", ats: "lever" },
  { slug: "findem", ats: "lever" },
  { slug: "toptal", ats: "toptal" },
  { slug: "pipedrive", ats: "lever" },
  { slug: "mindtickle", ats: "lever" },
  { slug: "acquia", ats: "greenhouse" },
  { slug: "aha", ats: "greenhouse" },
  { slug: "alphasights", ats: "greenhouse" },
  { slug: "appinio", ats: "greenhouse" },
  { slug: "arctouch", ats: "greenhouse" },
  { slug: "ark", ats: "greenhouse" },
  { slug: "axios", ats: "greenhouse" },
  { slug: "c6bank", ats: "greenhouse" },
  { slug: "cabify", ats: "greenhouse" },
  { slug: "canonical", ats: "greenhouse" },
  { slug: "civicactions", ats: "greenhouse" },
  { slug: "coursera", ats: "greenhouse" },
  { slug: "dashlane", ats: "greenhouse" },
  { slug: "datacamp", ats: "greenhouse" },
  { slug: "dropbox", ats: "greenhouse" },
  { slug: "flip", ats: "greenhouse" },
  { slug: "godaddy", ats: "greenhouse" },
  { slug: "gohiring", ats: "greenhouse" },
  { slug: "gremlin", ats: "greenhouse" },
  { slug: "gympass", ats: "greenhouse" },
  { slug: "hudl", ats: "greenhouse" },
  { slug: "ifit", ats: "greenhouse" },
  { slug: "juno", ats: "greenhouse" },
  { slug: "jusbrasil", ats: "greenhouse" },
  { slug: "kentik", ats: "greenhouse" },
  { slug: "klaviyo", ats: "greenhouse" },
  { slug: "knack", ats: "greenhouse" },
  { slug: "labelbox", ats: "greenhouse" },
  { slug: "liveperson", ats: "greenhouse" },
  { slug: "mercari", ats: "greenhouse" },
  { slug: "metalab", ats: "greenhouse" },
  { slug: "mixmax", ats: "greenhouse" },
  { slug: "mozilla", ats: "greenhouse" },
  { slug: "oddball", ats: "greenhouse" },
  { slug: "openzeppelin", ats: "greenhouse" },
  { slug: "praxent", ats: "greenhouse" },
  { slug: "quintoandar", ats: "greenhouse" },
  { slug: "raft", ats: "greenhouse" },
  { slug: "reddit", ats: "greenhouse" },
  { slug: "scandit", ats: "greenhouse" },
  { slug: "securityscorecard", ats: "greenhouse" },
  { slug: "squad", ats: "greenhouse" },
  { slug: "thorn", ats: "greenhouse" },
  { slug: "toast", ats: "greenhouse" },
  { slug: "turing", ats: "greenhouse" },
  { slug: "udacity", ats: "greenhouse" },
  { slug: "upwork", ats: "greenhouse" },
  { slug: "valtech", ats: "greenhouse" },
  { slug: "vtex", ats: "greenhouse" },
  { slug: "wizeline", ats: "greenhouse" },
  { slug: "zenrows", ats: "greenhouse" },
  { slug: "amplitude", ats: "greenhouse" },
  { slug: "carta", ats: "greenhouse" },
  { slug: "checkr", ats: "greenhouse" },
  { slug: "contentful", ats: "greenhouse" },
  { slug: "coreweave", ats: "greenhouse" },
  { slug: "cribl", ats: "greenhouse" },
  { slug: "dialpad", ats: "greenhouse" },
  { slug: "duolingo", ats: "greenhouse" },
  { slug: "expel", ats: "greenhouse" },
  { slug: "hive", ats: "greenhouse" },
  { slug: "imply", ats: "greenhouse" },
  { slug: "instabase", ats: "greenhouse" },
  { slug: "karat", ats: "greenhouse" },
  { slug: "launchdarkly", ats: "greenhouse" },
  { slug: "liftoff", ats: "greenhouse" },
  { slug: "lob", ats: "greenhouse" },
  { slug: "lokalise", ats: "greenhouse" },
  { slug: "mattermost", ats: "greenhouse" },
  { slug: "mixpanel", ats: "greenhouse" },
  { slug: "nextdoor", ats: "greenhouse" },
  { slug: "orkes", ats: "greenhouse" },
  { slug: "osano", ats: "greenhouse" },
  { slug: "prophet", ats: "greenhouse" },
  { slug: "reachdesk", ats: "greenhouse" },
  { slug: "ridgeline", ats: "greenhouse" },
  { slug: "sendbird", ats: "greenhouse" },
  { slug: "slice", ats: "greenhouse" },
  { slug: "smartsheet", ats: "greenhouse" },
  { slug: "tines", ats: "greenhouse" },
  { slug: "typeform", ats: "greenhouse" },
  { slug: "unqork", ats: "greenhouse" },
  { slug: "verkada", ats: "greenhouse" },
  { slug: "warp", ats: "greenhouse" },
  { slug: "webflow", ats: "greenhouse" },
  { slug: "yotpo", ats: "greenhouse" },
  { slug: "zscaler", ats: "greenhouse" },
  { slug: "alloy", ats: "greenhouse" },
  { slug: "archera", ats: "greenhouse" },
  { slug: "attentive", ats: "greenhouse" },
  { slug: "automox", ats: "greenhouse" },
  { slug: "axiom", ats: "greenhouse" },
  { slug: "beam", ats: "greenhouse" },
  { slug: "bloomreach", ats: "greenhouse" },
  { slug: "later", ats: "greenhouse" },
  { slug: "planable", ats: "greenhouse" },
  { slug: "calendly", ats: "greenhouse" },
  { slug: "pandadoc", ats: "greenhouse" },
  { slug: "five9", ats: "greenhouse" },
  { slug: "nice", ats: "greenhouse" },
  { slug: "salesloft", ats: "greenhouse" },
  { slug: "pendo", ats: "greenhouse" },
  { slug: "make", ats: "greenhouse" },
  { slug: "squarespace", ats: "greenhouse" },
  { slug: "justworks", ats: "greenhouse" },
  { slug: "betterment", ats: "greenhouse" },
  { slug: "sofi", ats: "greenhouse" },
  { slug: "current", ats: "greenhouse" },
  { slug: "upgrade", ats: "greenhouse" },
  { slug: "instacart", ats: "greenhouse" },
  { slug: "masterclass", ats: "greenhouse" },
  { slug: "udemy", ats: "greenhouse" },
  { slug: "outschool", ats: "greenhouse" },
  { slug: "wrike", ats: "greenhouse" },
  { slug: "roku", ats: "greenhouse" },
  { slug: "calm", ats: "greenhouse" },
  { slug: "myfitnesspal", ats: "greenhouse" },
  { slug: "classpass", ats: "greenhouse" },
  { slug: "mindbody", ats: "greenhouse" },
  { slug: "peloton", ats: "greenhouse" },
  { slug: "tripadvisor", ats: "greenhouse" },
  { slug: "getyourguide", ats: "greenhouse" },
  // ADD YOUR COMPANIES ARRAY HERE
];

// ════════════════════════════════════════════════════════════════════
// PER-JOB PROCESSOR
// ════════════════════════════════════════════════════════════════════
async function processJob(job: any, ats: "greenhouse" | "lever" | "workday" | "ashby" | "icims" | "taleo" | "usajobs" | "crossover" | "toptal" | "shortcut" | "zendesk"): Promise<"imported"|"updated"|"skipped"|"failed"> {
  if (!isEnglishTitle(job.title)) { log(`  ⏭  non-English: ${job.title}`); return "skipped"; }

  const t0 = Date.now();
  const existing = await Job.findOne({ externalId: job.externalId }, { content: 1, rawHash: 1, slug: 1 }).lean() as any;
  recordTiming("db_fetch", Date.now() - t0);

  const rawText = stripHtml(job.rawContent);
  const rawHash = `${rawText.length}:${rawText.slice(0, 100)}`;
  if (existing?.content && existing?.rawHash === rawHash) {
    log(`  ⏭  unchanged: ${job.title}`);
    return "skipped";
  }

  log(`  ▶  ${job.title}`);
  const prompt = buildPrompt(job.title, job.company, job.location, job.jobType, rawText);
  const aiContent = await generateWithFallback(prompt);
  if (!aiContent?.includes("<")) { log(`  ✗  no AI content`); return "failed"; }

  // Reuse existing slug if job already exists, only generate new one for new jobs
  const slug = existing?.slug ?? await uniqueSlug(slugify(`${job.title}-${job.company}`), job.externalId);

  const mapped = {
    externalId: job.externalId,
    title: cleanText(job.title),
    slug,
    description: buildDescription(job.rawContent),
    content: aiContent,
    rawHash,
    company: { name: job.company.charAt(0).toUpperCase() + job.company.slice(1), logo: getCompanyLogo(job.company) },
    location: cleanText(job.location),
    jobType: normalizeJobType(cleanText(job.jobType), cleanText(job.location)),
    applyUrl: job.applyUrl,
    source: ats,
    isActive: true,
    postedAt: job.postedAt,
    updatedAt: new Date(),
    category: normalizeCategory(((job as any).category ?? "").replace(/^\d+\s+/, "").trim()),
    score: job.postedAt ? new Date(job.postedAt).getTime() : Date.now(),
    salary: extractSalary(rawText),
  };

  const t1 = Date.now();
  const result = await Job.updateOne({ externalId: job.externalId }, { $set: mapped }, { upsert: true });
  recordTiming("db_write", Date.now() - t1);
  return result.upsertedCount > 0 ? "imported" : "updated";
}

// ════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ════════════════════════════════════════════════════════════════════
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const runStart = Date.now();
  try {
    await connectMongo();

      let settings = await Settings.findOne({ key: "groqConfig" });
      if (!settings) settings = await Settings.create({ key: "groqConfig", modelIndex: 0 });
      circuits.clear();
        settings.paused = false;
        settings.pausedAt = null;
      await settings.save();

    const url = new URL(request.url);
    const startIndex = settings.lastCompanyIndex ?? 0;
    const slice = COMPANIES.slice(startIndex, Math.min(startIndex + BATCH_SIZE, COMPANIES.length));

    let imported = 0, updated = 0, skipped = 0, failed = 0, total = 0;
    let pausedThisRun = false;
    const totalCompanies = slice.length;
    let processedJobs = 0;

    // Also clean up jobs older than 6 months from DB
    const sixMonthsAgo = new Date(Date.now() - MAX_JOB_AGE_MS);
    const oldDeleted = await Job.deleteMany({ postedAt: { $lt: sixMonthsAgo } });
    if (oldDeleted.deletedCount > 0) log(`🗑  removed ${oldDeleted.deletedCount} jobs older than 6 months`);

    for (const company of slice) {
      if (pausedThisRun) break;
      log(`\n[company] ${company.slug}`);

      const jobs = company.ats === "greenhouse"
        ? await fetchGreenhouse(company.slug)
        : company.ats === "lever"
        ? await fetchLever(company.slug)
        : [];

      const liveIds = jobs.map((j) => j.externalId);
      const prefix = `${company.ats}-${company.slug}-`;
      const deleted = await Job.deleteMany({ externalId: { $regex: `^${prefix}`, $nin: liveIds } });
      if (deleted.deletedCount > 0) log(`  🗑  removed ${deleted.deletedCount} closed`);

      total += jobs.length;
      processedJobs++;
      const pct = Math.round((processedJobs / totalCompanies) * 100);
      log(`  📊 Overall: ${processedJobs}/${totalCompanies} companies (${pct}%) — ETA: ~${Math.round((totalCompanies - processedJobs) * 15 / 60)} min`);

      for (let i = 0; i < jobs.length; i += PARALLEL_JOBS) {
        if (availableModels().length === 0) {
          log(`🚫 All models circuit-broken — pausing 60 min`);
          settings.paused = true;
          settings.pausedAt = new Date();
          await settings.save();
          await sendEmail(
            "⏸ All AI models circuit-broken",
            `<p>All ${MODEL_POOL.length} models exceeded failure threshold. Auto-resumes in 60 min.</p>
             <p>Circuit states: <pre>${JSON.stringify(Object.fromEntries(circuits), null, 2)}</pre></p>`
          );
          pausedThisRun = true;
          break;
        }

        const chunk = jobs.slice(i, i + PARALLEL_JOBS);
        const results = await Promise.allSettled(chunk.map((job) => processJob(job, company.ats)));
        for (const r of results) {
          if (r.status === "fulfilled") {
            if (r.value === "imported") imported++;
            else if (r.value === "updated") updated++;
            else if (r.value === "skipped") skipped++;
            else failed++;
          } else { failed++; log(`  💥 ${r.reason}`); }
        }
        if (i + PARALLEL_JOBS < jobs.length) await new Promise((r) => setTimeout(r, INTER_JOB_DELAY_MS));
      }

      if (!pausedThisRun) await new Promise((r) => setTimeout(r, INTER_COMPANY_DELAY_MS));
    }

    settings.lastCompanyIndex = startIndex + slice.length >= COMPANIES.length ? 0 : startIndex + slice.length;
    await settings.save();

    const elapsed = ((Date.now() - runStart) / 1000).toFixed(1);
    log(`\n✅ total=${total} imported=${imported} updated=${updated} skipped=${skipped} failed=${failed} time=${elapsed}s`);
    log(`📊 ${timingSummary()}`);
    log(`🔌 circuits: ${MODEL_POOL.map(({ provider, model }) => {
      const s = circuits.get(circuitKey(provider, model));
      return `${provider}/${model.split("/").pop()}:${s?.openUntil && Date.now() < s.openUntil ? "OPEN" : "ok"}`;
    }).join(" | ")}`);

      return NextResponse.json({ success: true, paused: pausedThisRun, total, imported, updated, skipped, failed, elapsedSeconds: elapsed });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : "Unknown" }, { status: 500 });
  }
}