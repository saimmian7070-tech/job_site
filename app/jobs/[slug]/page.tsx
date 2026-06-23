import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Link from "next/link";
import { notFound } from "next/navigation";
import CompanyAvatar from "@/components/CompanyAvatar";

interface IJob {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  jobType?: string;
  description?: string;
  content?: string;
  applyUrl?: string;
  salary?: string;
  postedAt?: string | Date;
  updatedAt?: string | Date;
  company?: { name?: string; logo?: string };
}

function cleanText(str?: string): string {
  if (!str) return "";
  try {
    const fixed = decodeURIComponent(escape(str));
    str = fixed;
  } catch {
    // not double-encoded, leave as-is
  }
  return str
    .replace(/\u00e2\u0080\u0099/g, "\u2019")
    .replace(/\u00e2\u0080\u0098/g, "\u2018")
    .replace(/\u00e2\u0080\u009c/g, "\u201c")
    .replace(/\u00e2\u0080\u009d/g, "\u201d")
    .replace(/\u00e2\u0080\u0093/g, "\u2013")
    .replace(/\u00e2\u0080\u0094/g, "\u2014")
    .replace(/\u00e2\u0080\u00a6/g, "...")
    .replace(/\u00e2\u0080\u008b/g, "")
    .replace(/\u00c2\u00a0/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function cleanLocation(loc?: string): string {
  return loc?.replace(/,\s*$/, "").trim() ?? "";
}

function initials(name?: string) {
  if (!name) return "J";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600", "bg-emerald-600",
  "bg-rose-600", "bg-amber-600", "bg-sky-600",
];

function avatarColor(str: string) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

const JOB_TYPE_COLORS: Record<string, string> = {
  "remote":     "bg-blue-50 text-blue-700 border-blue-200",
  "full-time":  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "part-time":  "bg-amber-50 text-amber-700 border-amber-200",
  "contract":   "bg-violet-50 text-violet-700 border-violet-200",
  "freelance":  "bg-rose-50 text-rose-700 border-rose-200",
  "internship": "bg-sky-50 text-sky-700 border-sky-200",
};

function jobTypeBadge(type?: string) {
  const key = (type ?? "").toLowerCase();
  return JOB_TYPE_COLORS[key] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    await connectMongo();
    const job = (await Job.findOne({ slug }).lean()) as IJob | null;
    if (!job) return { title: "Job Not Found | Jobs Home Online" };
    return {
      title: `${job.title}${job.company?.name ? ` at ${job.company.name}` : ""} | Jobs Home Online`,
      description: cleanText(job.description)?.slice(0, 160),
    };
  } catch {
    return { title: "Jobs Home Online" };
  }
}

export default async function JobPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let job: IJob | null = null;

  try {
    await connectMongo();
    const raw = (await Job.findOne({ slug }).lean()) as any;
    if (!raw) notFound();
    job = { ...raw, _id: raw._id.toString() };
  } catch {
    notFound();
  }

  if (!job) notFound();

  const cleanedDescription = cleanText(job.description);
  const cleanedLocation = cleanLocation(job.location);
  const companyName = job.company?.name;
  const companyLogo = job.company?.logo;
  const avatar = initials(companyName);
  const color = avatarColor(job._id);

  const isJunkDescription =
    !cleanedDescription ||
    /^posted\s+\d+:\d+/i.test(cleanedDescription) ||
    cleanedDescription.length < 30;

  const postedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: cleanedDescription ?? "",
    ...(job.jobType && { employmentType: job.jobType }),
    ...(companyName && { hiringOrganization: { "@type": "Organization", name: companyName } }),
    ...(cleanedLocation && { jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: cleanedLocation } } }),
    ...(job.postedAt && { datePosted: new Date(job.postedAt).toISOString() }),
    ...(job.applyUrl && { url: job.applyUrl }),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── HERO BANNER ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-7 font-medium">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-gray-600 transition-colors">Jobs</Link>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[180px] sm:max-w-xs">{job.title}</span>
          </nav>

          <div className="flex items-start gap-5">
            {/* Company Avatar / Logo */}
            <CompanyAvatar
              logoUrl={companyLogo}
              initials={avatar}
              colorClass={color}
              size={64}
            />

            <div className="flex-1 min-w-0">
              {/* Job Type Badge */}
              {job.jobType && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${jobTypeBadge(job.jobType)}`}>
                  {job.jobType}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {job.title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-500">
                {companyName && (
                  <span className="font-semibold text-gray-800">{companyName}</span>
                )}
                {cleanedLocation && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {cleanedLocation}
                  </span>
                )}
                {postedDate && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Posted {postedDate}
                  </span>
                )}
              </div>

              {/* Short description */}
              {!isJunkDescription && (
                <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-2xl">
                  {cleanedDescription}
                </p>
              )}
            </div>
          </div>

          {/* Hero Actions */}
<div className="mt-7 flex flex-wrap gap-3">
  <Link
    href="/jobs"
    className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl transition-all"
  >
    ← Back to Jobs
  </Link>
</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left: Job Content */}
          <div className="flex-1 min-w-0">
            {job.content ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div
                  className="prose prose-gray max-w-none overflow-hidden break-words    
                    prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                    prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3 prose-h3:pb-2 prose-h3:border-b prose-h3:border-gray-100
                    prose-p:text-gray-600 prose-p:leading-relaxed prose-p:my-3
                    prose-ul:my-3 prose-li:text-gray-600 prose-li:my-1
                    prose-strong:text-gray-800
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: job.content }}
                />
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
                No detailed description available for this role.
              </div>
            )}

            {/* Bottom apply CTA */}
            {job.applyUrl && (
              <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-white font-bold text-base">Interested in this role?</p>
                  <p className="text-blue-100 text-sm mt-0.5">Take the next step and submit your application today.</p>
                </div>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm rounded-xl shadow-sm transition-all"
                >
                  Apply Now →
                </a>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-5 lg:sticky lg:top-24">

            {/* Job Details Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">Job Details</p>
              <div className="space-y-3">
                {job.jobType && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Job Type</span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${jobTypeBadge(job.jobType)}`}>{job.jobType}</span>
                  </div>
                )}
                {cleanedLocation && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Location</span>
                    <span className="text-xs font-semibold text-gray-700 text-right max-w-[150px]">{cleanedLocation}</span>
                  </div>
                )}
                {companyName && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Company</span>
                    <span className="text-xs font-semibold text-gray-700 text-right max-w-[150px]">{companyName}</span>
                  </div>
                )}
                {postedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Posted</span>
                    <span className="text-xs font-semibold text-gray-700">{postedDate}</span>
                  </div>
                )}
                {job.salary && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">Salary</span>
                    <span className="text-xs font-semibold text-emerald-600">{job.salary}</span>
                  </div>
                )}
              </div>

              {job.applyUrl && (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 block w-full text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold text-sm rounded-xl px-5 py-3"
                >
                  Apply for This Role →
                </a>
              )}
            </div>

            {/* Browse more */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Browse More</p>
              <div className="space-y-2">
                <Link href="/jobs" className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  All Jobs <span className="text-gray-300">→</span>
                </Link>
                <Link href="/jobs?type=remote" className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Remote Jobs <span className="text-gray-300">→</span>
                </Link>
                <Link href="/jobs?type=full-time" className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Full-Time Jobs <span className="text-gray-300">→</span>
                </Link>
                <Link href="/jobs?type=contract" className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Contract Jobs <span className="text-gray-300">→</span>
                </Link>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}