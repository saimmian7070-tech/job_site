import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RemoteOKJob {
  id: string | number;
  position?: string;
  company?: string;
  logo?: string;
  description?: string;
  location?: string;
  url?: string;
  date?: string;
  tags?: string[];
  /** Some listings expose this field */
  position_type?: string;
}

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  updated: number;
  error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Minimal, dependency-free slugify so we don't need an extra package.
 * Converts "Senior Dev 12345" → "senior-dev-12345"
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // strip non-word chars (except spaces/hyphens)
    .replace(/[\s_]+/g, "-")    // spaces/underscores → hyphens
    .replace(/-+/g, "-")        // collapse consecutive hyphens
    .replace(/^-|-$/g, "");     // trim leading/trailing hyphens
}

/**
 * Strip all HTML tags and return the raw text.
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Build a one-line, plain-text description (max ~160 chars).
 * Takes the first sentence of the stripped HTML.
 */
function buildDescription(raw?: string): string {
  if (!raw) return "";

  const clean = stripHtml(raw);
  // First sentence (ends with . ! ?)
  const firstSentence = clean.split(/(?<=[.!?])\s+/)[0] ?? clean;
  // Hard-cap at 160 chars to be safe
  return firstSentence.length > 160
    ? firstSentence.slice(0, 157).trimEnd() + "..."
    : firstSentence;
}

/**
 * Build structured HTML content from RemoteOK's raw HTML description.
 * If the source already contains block-level tags we keep them; otherwise
 * we wrap every paragraph in <p> tags.
 */
function buildContent(job: RemoteOKJob): string {
  const title    = job.position ?? "Job Opportunity";
  const company  = job.company  ?? "Unknown Company";
  const location = job.location ?? "Remote";
  const raw      = job.description ?? "";

  // Decide whether RemoteOK already gave us block-level HTML
  const hasBlockHtml = /<(p|ul|ol|li|h[1-6]|div|br)\b/i.test(raw);

  let bodyHtml: string;

  if (hasBlockHtml) {
    // Trust RemoteOK's HTML; just ensure it's wrapped in a container
    bodyHtml = raw.trim();
  } else {
    // Plain text or inline-only HTML — convert line-breaks to paragraphs
    const text = stripHtml(raw);
    bodyHtml = text
      .split(/\n{2,}/)
      .map((para) => para.trim())
      .filter(Boolean)
      .map((para) => `<p>${para}</p>`)
      .join("\n");
  }

  // Build tag pills for the footer (e.g. React, Node.js …)
  const tags = (job.tags ?? [])
    .map((t) => `<span style="margin-right:8px;">${t}</span>`)
    .join("");
  const tagsSection = tags
    ? `\n<h3>Skills &amp; Tags</h3>\n<p>${tags}</p>`
    : "";

  return `<h2>${title}</h2>
<p><strong>Company:</strong> ${company} &nbsp;|&nbsp; <strong>Location:</strong> ${location}</p>

<h3>About the Role</h3>
${bodyHtml}
${tagsSection}`;   // ← backtick BEFORE semicolon, then close }
}

/**
 * Detect jobType from position_type field or tags array.
 * Falls back to "Remote" when nothing useful is found.
 */
// ✅ New function
function detectJobType(job: RemoteOKJob): string {
  const tags = (job.tags ?? []).map((t) => t.toLowerCase());
  if (tags.includes("contract"))   return "Contract";
  if (tags.includes("freelance"))  return "Freelance";
  if (tags.includes("part-time"))  return "Part-time";
  if (tags.includes("full-time"))  return "Full-time";
  if (tags.includes("internship")) return "Internship";
  return "Full-time";
}

/**
 * Ensure the generated slug is unique in the DB.
 * Appends "-2", "-3", … until a free slot is found.
 */
async function uniqueSlug(base: string, externalId: string): Promise<string> {
  let slug      = base;
  let candidate = 1;

  while (true) {
    // A slug is acceptable if no OTHER job (different externalId) uses it
    const conflict = await Job.findOne({ slug, externalId: { $ne: externalId } }).lean();
    if (!conflict) return slug;
    candidate += 1;
    slug = `${base}-${candidate}`;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse<ImportResult>> {
  try {
    // 1. Fetch from RemoteOK
    const res = await fetch("https://remoteok.com/api", {
      headers: {
        // RemoteOK requires a User-Agent; bare Node fetch is sometimes blocked
        "User-Agent": "Mozilla/5.0 (compatible; JobImporter/1.0)",
      },
      // Disable Next.js cache so every cron run gets fresh data
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`RemoteOK responded with HTTP ${res.status}`);
    }

    const data: unknown[] = await res.json();

    // 2. Skip the first element (API metadata object)
    const jobs = data.slice(1) as RemoteOKJob[];

    if (!jobs.length) {
      return NextResponse.json({ success: true, total: 0, imported: 0, updated: 0 });
    }

    // 3. Connect to MongoDB
    await connectMongo();

    let imported = 0;
    let updated  = 0;

    // 4. Upsert each job
    for (const job of jobs) {
      try {
        // Skip malformed entries
        if (!job.id || !job.position) continue;

        const externalId = String(job.id);
        const title      = job.position;
        const baseSlug   = slugify(`${title}-${job.id}`);
        const slug       = await uniqueSlug(baseSlug, externalId);

        const mappedJob = {
          externalId,
          title,
          slug,
          description : buildDescription(job.description),
          content     : buildContent(job),
          company: {
            name: job.company || "Unknown",
            logo: job.logo   || "",
          },
          location  : job.location || "Remote",
          jobType   : detectJobType(job),
          applyUrl  : job.url  || "",
          source    : "remoteok",
          isActive  : true,
          postedAt  : job.date ? new Date(job.date) : new Date(),
          updatedAt : new Date(),
        };

        const result = await Job.updateOne(
          { externalId },
          { $set: mappedJob },
          { upsert: true }
        );

        // upsertedCount > 0 → new document; modifiedCount > 0 → existing updated
        if (result.upsertedCount > 0) {
          imported += 1;
        } else if (result.modifiedCount > 0) {
          updated += 1;
        }
      } catch (jobErr) {
        // Log per-job errors but continue processing the rest
        console.error(`[import-jobs] Failed to upsert job id=${job.id}:`, jobErr);
      }
    }

    console.log(
      `[import-jobs] Done — total: ${jobs.length}, imported: ${imported}, updated: ${updated}`
    );

    return NextResponse.json({
      success : true,
      total   : jobs.length,
      imported,
      updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[import-jobs] Fatal error:", err);

    return NextResponse.json(
      { success: false, total: 0, imported: 0, updated: 0, error: message },
      { status: 500 }
    );
  }
}