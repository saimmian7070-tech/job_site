import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
async function typeLog(msg: string) {
  for (const char of msg) {
    process.stdout.write(char);
    await new Promise((r) => setTimeout(r, 18));
  }
  process.stdout.write("\n");
}

// ── COMPANY LIST ─────────────────────────────────────────────────────────────
// Add or remove companies freely. Format: { slug, ats }
// slug = the company's ATS board slug (find it from their jobs page URL)
const COMPANIES: { slug: string; ats: "greenhouse" | "lever" }[] = [
  // Greenhouse
  { slug: "stripe", ats: "greenhouse" },
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
  { slug: "plaid", ats: "greenhouse" },
  { slug: "rippling", ats: "greenhouse" },
  { slug: "hubspot", ats: "greenhouse" },
  { slug: "pagerduty", ats: "greenhouse" },
  { slug: "amplitude", ats: "greenhouse" },
  { slug: "mixpanel", ats: "greenhouse" },
  { slug: "intercom", ats: "greenhouse" },
  { slug: "okta", ats: "greenhouse" },
  { slug: "confluent", ats: "greenhouse" },
  { slug: "hashicorp", ats: "greenhouse" },
  { slug: "fastly", ats: "greenhouse" },
  { slug: "fivetran", ats: "greenhouse" },
  { slug: "airbyte", ats: "greenhouse" },
  { slug: "dbtlabs", ats: "greenhouse" },
  { slug: "astronomer", ats: "greenhouse" },
  { slug: "prefect", ats: "greenhouse" },
  { slug: "cohere", ats: "greenhouse" },
  { slug: "scaleai", ats: "greenhouse" },
  { slug: "replit", ats: "greenhouse" },
  { slug: "retool", ats: "greenhouse" },
  { slug: "airtable", ats: "greenhouse" },
  { slug: "asana", ats: "greenhouse" },
  { slug: "clickup", ats: "greenhouse" },
  { slug: "anthropic", ats: "greenhouse" },
  { slug: "databricks", ats: "greenhouse" },
  { slug: "lyft", ats: "greenhouse" },
  { slug: "marqeta", ats: "greenhouse" },
  { slug: "chime", ats: "greenhouse" },
  { slug: "ramp", ats: "greenhouse" },
  { slug: "segment", ats: "greenhouse" },
  { slug: "newrelic", ats: "greenhouse" },
  { slug: "netlify", ats: "greenhouse" },
  { slug: "render", ats: "greenhouse" },
  { slug: "sourcegraph", ats: "greenhouse" },
  { slug: "postman", ats: "greenhouse" },
  { slug: "starburst", ats: "greenhouse" },
  { slug: "weights-biases", ats: "greenhouse" },
  { slug: "coda", ats: "greenhouse" },
  { slug: "monday", ats: "greenhouse" },
  { slug: "notion", ats: "greenhouse" },
{ slug: "linear", ats: "greenhouse" },
{ slug: "vercel", ats: "greenhouse" },
{ slug: "supabase", ats: "greenhouse" },
{ slug: "planetscale", ats: "greenhouse" },
{ slug: "neon", ats: "greenhouse" },
{ slug: "turso", ats: "greenhouse" },
{ slug: "railway", ats: "greenhouse" },
{ slug: "fly", ats: "greenhouse" },
{ slug: "cloudsmith", ats: "greenhouse" },
{ slug: "snyk", ats: "greenhouse" },
{ slug: "lacework", ats: "greenhouse" },
{ slug: "wiz", ats: "greenhouse" },
{ slug: "orca", ats: "greenhouse" },
{ slug: "abnormalsecurity", ats: "greenhouse" },
{ slug: "crowdstrike", ats: "greenhouse" },
{ slug: "sentinelone", ats: "greenhouse" },
{ slug: "cybereason", ats: "greenhouse" },
{ slug: "darktrace", ats: "greenhouse" },
{ slug: "vectra", ats: "greenhouse" },
{ slug: "mongodb", ats: "greenhouse" },
{ slug: "elastic", ats: "greenhouse" },
{ slug: "cockroachlabs", ats: "greenhouse" },
{ slug: "fauna", ats: "greenhouse" },
{ slug: "timescale", ats: "greenhouse" },
{ slug: "clickhouse", ats: "greenhouse" },
{ slug: "pinecone", ats: "greenhouse" },
{ slug: "weaviate", ats: "greenhouse" },
{ slug: "qdrant", ats: "greenhouse" },
{ slug: "chroma", ats: "greenhouse" },
{ slug: "huggingface", ats: "greenhouse" },
{ slug: "mistral", ats: "greenhouse" },
{ slug: "together", ats: "greenhouse" },
{ slug: "anyscale", ats: "greenhouse" },
{ slug: "modal", ats: "greenhouse" },
{ slug: "replicate", ats: "greenhouse" },
{ slug: "runway", ats: "greenhouse" },
{ slug: "midjourney", ats: "greenhouse" },
{ slug: "stability", ats: "greenhouse" },
{ slug: "jasper", ats: "greenhouse" },
{ slug: "copy", ats: "greenhouse" },
{ slug: "writesonic", ats: "greenhouse" },
{ slug: "typeface", ats: "greenhouse" },
{ slug: "glean", ats: "greenhouse" },
{ slug: "guru", ats: "greenhouse" },
{ slug: "notion", ats: "greenhouse" },
{ slug: "coda", ats: "greenhouse" },
{ slug: "craft", ats: "greenhouse" },
{ slug: "slite", ats: "greenhouse" },
{ slug: "swimm", ats: "greenhouse" },
  { slug: "reddit", ats: "lever" },
  { slug: "discord", ats: "lever" },
  { slug: "canva", ats: "lever" },
  { slug: "miro", ats: "lever" },
  { slug: "grammarly", ats: "lever" },
  { slug: "duolingo", ats: "lever" },
  { slug: "coursera", ats: "lever" },
  { slug: "udemy", ats: "lever" },
  { slug: "doordash", ats: "lever" },
  { slug: "instacart", ats: "lever" },
  { slug: "gopuff", ats: "lever" },
  { slug: "calm", ats: "lever" },
  { slug: "headspace", ats: "lever" },
  { slug: "strava", ats: "lever" },
  { slug: "alltrails", ats: "lever" },
  { slug: "webflow", ats: "lever" },
  { slug: "loom", ats: "lever" },
  { slug: "descript", ats: "lever" },
  { slug: "hotjar", ats: "lever" },
  { slug: "fullstory", ats: "lever" },
  { slug: "launchdarkly", ats: "lever" },
  { slug: "optimizely", ats: "lever" },
  { slug: "contentsquare", ats: "lever" },
  { slug: "heap", ats: "lever" },
  { slug: "statsig", ats: "lever" },
  { slug: "maze", ats: "lever" },
  { slug: "rivian", ats: "lever" },
  { slug: "lucidmotors", ats: "lever" },
  { slug: "waymo", ats: "lever" },
  { slug: "lime", ats: "lever" },
  { slug: "squarespace", ats: "lever" },
  { slug: "masterclass", ats: "lever" },
  { slug: "peloton", ats: "lever" },
  { slug: "box", ats: "lever" },
  { slug: "dropbox", ats: "lever" },
  { slug: "figma", ats: "lever" },
{ slug: "notion", ats: "lever" },
{ slug: "linear", ats: "lever" },
{ slug: "superhuman", ats: "lever" },
{ slug: "pitch", ats: "lever" },
{ slug: "framer", ats: "lever" },
{ slug: "readcv", ats: "lever" },
{ slug: "contra", ats: "lever" },
{ slug: "arc", ats: "lever" },
{ slug: "remote", ats: "lever" },
{ slug: "deel", ats: "lever" },
{ slug: "rippling", ats: "lever" },
{ slug: "gusto", ats: "lever" },
{ slug: "lattice", ats: "lever" },
{ slug: "leapsome", ats: "lever" },
{ slug: "culture-amp", ats: "lever" },
{ slug: "betterworks", ats: "lever" },
{ slug: "15five", ats: "lever" },
{ slug: "hibob", ats: "lever" },
{ slug: "personio", ats: "lever" },
{ slug: "workable", ats: "lever" },
{ slug: "greenhouse", ats: "lever" },
{ slug: "ashbyhq", ats: "lever" },
{ slug: "lever", ats: "lever" },
{ slug: "recruitee", ats: "lever" },
{ slug: "teamtailor", ats: "lever" },
{ slug: "pinpoint", ats: "lever" },
{ slug: "dover", ats: "lever" },
{ slug: "gem", ats: "lever" },
{ slug: "findem", ats: "lever" },
{ slug: "seekout", ats: "lever" },
{ slug: "eightfold", ats: "lever" },
{ slug: "beamery", ats: "lever" },
{ slug: "phenom", ats: "lever" },
{ slug: "paradox", ats: "lever" },
{ slug: "humanly", ats: "lever" },
{ slug: "metaview", ats: "lever" },
{ slug: "karat", ats: "lever" },
{ slug: "interviewing", ats: "lever" },
{ slug: "codility", ats: "lever" },
{ slug: "hackerrank", ats: "lever" },
{ slug: "codesignal", ats: "lever" },
{ slug: "qualified", ats: "lever" },
{ slug: "andela", ats: "lever" },
{ slug: "toptal", ats: "lever" },
{ slug: "turing", ats: "lever" },
{ slug: "arc", ats: "lever" },
{ slug: "lemon", ats: "lever" },
{ slug: "braintrust", ats: "lever" },
{ slug: "worksome", ats: "lever" },
  
];

const JOBS_PER_COMPANY = 12;

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface GreenhouseJob {
  id: number;
  title: string;
  location: { name: string };
  absolute_url: string;
  content: string;
  updated_at: string;
  metadata: any[];
  departments: { name: string }[];
}

interface LeverJob {
  id: string;
  text: string;
  categories: { location: string; team: string; commitment: string };
  hostedUrl: string;
  descriptionPlain: string;
  createdAt: number;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u2019/g, "'").replace(/\u2018/g, "'")
    .replace(/\u201C/g, '"').replace(/\u201D/g, '"')
    .replace(/[^\x00-\x7F\u00C0-\u024F\u0600-\u06FF]/g, "")
    .replace(/\s{2,}/g, " ").trim();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function slugify(text: string): string {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string, externalId: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (true) {
    const conflict = await Job.findOne({ slug, externalId: { $ne: externalId } }).lean();
    if (!conflict) return slug;
    slug = `${base}-${++n}`;
  }
}

function isEnglishTitle(title: string): boolean {
  return /^[\u0000-\u007F\u00C0-\u024F\s]+$/.test(title);
}

function buildDescription(raw?: string): string {
  if (!raw) return "";
  // const decoded = raw.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");
  const decoded = decodeHtmlEntities(raw);
  const stripped = stripHtml(decoded);
  const clean = cleanText(stripped);
  const first = clean.split(/(?<=[.!?])\s+/)[0] ?? clean;
  const isJunk = /^[A-Z0-9]{5,}\s|^\d+|[A-Z]{2,}\d{3,}/.test(first) || first.split(" ").length < 6;
if (isJunk) return "";
  return first.length > 160 ? first.slice(0, 157).trimEnd() + "..." : first;
}

async function rewriteWithGroq(title: string, company: string, location: string, jobType: string, rawText: string): Promise<string> {
  const prompt = `You are a professional job listing writer for a job portal called "Jobs Home Online".

Rewrite the following job listing into clean, well-structured, engaging HTML.
Make it unique, professional, and AdSense-friendly with rich original content.

Job Details:
- Title: ${title}
- Company: ${company}
- Location: ${location}
- Job Type: ${jobType}
- Original Description: ${rawText.slice(0, 2000)}

Write clean HTML with these sections using <h3> and <p>, <ul>, <li> tags:
1. A compelling 2-3 sentence intro about the role
2. Key Responsibilities (5-7 bullet points)
3. Requirements & Qualifications (5-6 bullet points)
4. What We Offer (4-5 bullet points)
5. A short closing paragraph encouraging candidates to apply

Rules:
- Do NOT copy original text word for word
- Do NOT include spam, base64, or "please mention the word" text
- Output ONLY the HTML, no markdown, no backticks
- Do NOT include job title, company, or location as headings
- Start directly with the intro paragraph`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (content) {
      return cleanText(
        content.replace(/```html/g, "").replace(/```/g, "")
          .replace(/<!DOCTYPE[^>]*>/gi, "").replace(/<html[^>]*>/gi, "")
          .replace(/<\/html>/gi, "").replace(/<head>[\s\S]*?<\/head>/gi, "")
          .replace(/<body[^>]*>/gi, "").replace(/<\/body>/gi, "").trim()
      );
    }
    return rawText;
  } catch (err) {
    console.error("[import-jobs] Groq rewrite failed:", err);
    return rawText;
  }
}

// ── FETCH FROM GREENHOUSE ─────────────────────────────────────────────────────
async function fetchGreenhouse(companySlug: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${companySlug}/jobs?content=true`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const jobs: GreenhouseJob[] = json?.jobs ?? [];
    console.log("[debug] first job departments:", jobs[0]?.departments);
    return jobs.filter((j) => j.title && j.title.trim().length > 3).slice(0, JOBS_PER_COMPANY).map((j) => ({
      externalId: `greenhouse-${companySlug}-${j.id}`,
      title: j.title,
      company: companySlug,
      location: j.location?.name ?? "",
      jobType: "Full-time",
      applyUrl: j.absolute_url,        // ← direct employer page
      rawContent: j.content ?? "",
      postedAt: j.updated_at ? new Date(j.updated_at) : new Date(),
      category: j.departments?.[0]?.name ?? "",
    }));
  } catch {
    return [];
  }
}

// ── FETCH FROM LEVER ──────────────────────────────────────────────────────────
async function fetchLever(companySlug: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${companySlug}?mode=json`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const jobs: LeverJob[] = await res.json();
    return jobs.slice(0, JOBS_PER_COMPANY).map((j) => ({
      externalId: `lever-${companySlug}-${j.id}`,
      title: j.text,
      company: companySlug,
      location: j.categories?.location ?? "",
      jobType: j.categories?.commitment ?? "Full-time",
      applyUrl: j.hostedUrl,           // ← direct employer page
      rawContent: j.descriptionPlain ?? "",
      postedAt: j.createdAt ? new Date(j.createdAt) : new Date(),
    }));
  } catch {
    return [];
  }
}

// ── MAIN HANDLER ──────────────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectMongo();

    let imported = 0;
    let updated = 0;
    let total = 0;

    for (const company of COMPANIES) {
      const jobs =
        company.ats === "greenhouse"
          ? await fetchGreenhouse(company.slug)
          : await fetchLever(company.slug);

      // ── CLEANUP: delete DB jobs for this company that are no longer live ──
      const liveIds = jobs.map((j) => j.externalId);
      const prefix = `${company.ats}-${company.slug}-`;
      const deleted = await Job.deleteMany({
        externalId: { $regex: `^${prefix}`, $nin: liveIds },
      });
      if (deleted.deletedCount > 0)
        await typeLog(`[import-jobs] Removed ${deleted.deletedCount} closed jobs from ${company.slug}`);

      for (const job of jobs) {
        try {
          total++;

          // ── English-only guard ──
          if (!isEnglishTitle(job.title)) {
            await typeLog(`[import-jobs] Skipping non-English: ${job.title}`);
            continue;
          }
          await typeLog(`[import-jobs] Processing: ${job.title} (${job.externalId})`);

          const baseSlug = slugify(`${job.title}-${job.company}`);
          const slug = await uniqueSlug(baseSlug, job.externalId);

          const aiContent = await rewriteWithGroq(
            job.title,
            job.company,
            job.location,
            job.jobType,
            stripHtml(job.rawContent)
          );
          await new Promise((r) => setTimeout(r, 12000)); // Groq rate limit
          await typeLog(`[groq] ${job.title} → ${aiContent.slice(0, 200)}`);

          console.log("[debug] job.category:", (job as any).category);
          const mapped = {
            externalId: job.externalId,
            title: cleanText(job.title),
            slug,
            description: buildDescription(stripHtml(job.rawContent)),
            content: aiContent,
            company: { name: job.company, logo: "" },
            location: cleanText(job.location),
            jobType: cleanText(job.jobType),
            applyUrl: job.applyUrl,   // ← always direct employer URL
            source: company.ats,
            isActive: true,
            postedAt: job.postedAt,
            updatedAt: new Date(),
            category: (job as any).category ?? "",
            score: Math.random(),
          };

          const result = await Job.updateOne(
            { externalId: job.externalId },
            { $set: mapped },
            { upsert: true }
          );

          if (result.upsertedCount > 0) imported++;
          else if (result.modifiedCount > 0) updated++;
        } catch (err) {
          console.error(`[import-jobs] Failed: ${job.externalId}`, err);
        }
      }

      await new Promise((r) => setTimeout(r, 500)); // be polite between companies
    }

    await typeLog(`[import-jobs] total: ${total}, imported: ${imported}, updated: ${updated}`);
    return NextResponse.json({ success: true, total, imported, updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, total: 0, imported: 0, updated: 0, error: message },
      { status: 500 }
    );
  }
}