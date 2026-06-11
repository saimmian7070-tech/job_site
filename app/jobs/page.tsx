import Link from "next/link";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import NewsletterSection from "@/app/components/NewsletterSection";

interface IJob {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  jobType?: string;
  description?: string;
  company?: { name?: string };
}

export const metadata = {
  title: "Browse Jobs | Jobs Home Online",
  description: "Browse the latest remote and global job listings across tech, marketing, design, finance, and more.",
};

const JOB_TYPES = [
  "Remote", "Full-Time", "Part-Time", "Contract", "Freelance", "Internship", "Entry Level",
];

const JOB_TYPE_COLORS: Record<string, string> = {
  "remote":      "bg-blue-50 text-blue-700 border-blue-100",
  "full-time":   "bg-emerald-50 text-emerald-700 border-emerald-100",
  "part-time":   "bg-amber-50 text-amber-700 border-amber-100",
  "contract":    "bg-violet-50 text-violet-700 border-violet-100",
  "freelance":   "bg-rose-50 text-rose-700 border-rose-100",
  "internship":  "bg-sky-50 text-sky-700 border-sky-100",
  "entry level": "bg-orange-50 text-orange-700 border-orange-100",
};

function jobTypeBadge(type: string) {
  const key = type.toLowerCase();
  return JOB_TYPE_COLORS[key] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

function initials(name?: string) {
  if (!name) return "J";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600", "bg-emerald-600",
  "bg-rose-600",  "bg-amber-600",  "bg-sky-600",
];

function avatarColor(str: string) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default async function JobsPage({ searchParams }: any) {
  const params     = await searchParams;
  const page       = Math.max(1, Number(params.page || 1));
  const keyword    = (params.q    ?? "").trim();
  const location   = (params.loc  ?? "").trim();
  const jobType    = (params.type ?? "").toLowerCase().trim();
  const limit      = 20;

  let jobs: IJob[] = [];
  let totalJobs    = 0;

  try {
    await connectMongo();

    // Build a compound query — all active filters must match (AND logic)
    const query: any = {};
    const andClauses: any[] = [];

    // 1. Keyword: matches title, company name, or description
    if (keyword) {
      andClauses.push({
        $or: [
          { title:             { $regex: keyword,  $options: "i" } },
          { description:       { $regex: keyword,  $options: "i" } },
          { "company.name":    { $regex: keyword,  $options: "i" } },
        ],
      });
    }

    // 2. Location: matches location field or "remote" in jobType when user types remote
    if (location) {
      andClauses.push({
        $or: [
          { location: { $regex: location, $options: "i" } },
          { jobType:  { $regex: location, $options: "i" } },
        ],
      });
    }

    // 3. Job type filter pill
    if (jobType) {
      andClauses.push({ jobType: { $regex: jobType, $options: "i" } });
    }

    if (andClauses.length > 0) query.$and = andClauses;

    totalJobs = await Job.countDocuments(query);

    const raw = await Job.find(query)
      .sort({ postedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    jobs = raw.map((j: any) => ({ ...j, _id: j._id.toString() }));
  } catch (err) {
    console.error("JobsPage DB error:", err);
  }

  const totalPages = Math.max(1, Math.ceil(totalJobs / limit));
  const showing    = jobs.length;
  const from       = totalJobs === 0 ? 0 : (page - 1) * limit + 1;
  const to         = from + showing - 1;

  // Active filters (for dismissible chips)
  const activeFilters: { label: string; removeKey: string }[] = [];
  if (keyword)  activeFilters.push({ label: `"${keyword}"`,          removeKey: "q"    });
  if (location) activeFilters.push({ label: `📍 ${location}`,        removeKey: "loc"  });
  if (jobType)  activeFilters.push({ label: jobType.charAt(0).toUpperCase() + jobType.slice(1), removeKey: "type" });

  function removeFilterHref(key: string) {
    const p = new URLSearchParams();
    if (key !== "q"    && keyword)  p.set("q",    keyword);
    if (key !== "loc"  && location) p.set("loc",  location);
    if (key !== "type" && jobType)  p.set("type", jobType);
    const qs = p.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  }

  function pageHref(p: number) {
    const pr = new URLSearchParams();
    if (keyword)  pr.set("q",    keyword);
    if (location) pr.set("loc",  location);
    if (jobType)  pr.set("type", jobType);
    if (p > 1)    pr.set("page", String(p));
    const qs = pr.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  }

  function typeHref(t: string) {
    const p = new URLSearchParams();
    if (keyword)  p.set("q",    keyword);
    if (location) p.set("loc",  location);
    const lc = t.toLowerCase();
    if (lc !== jobType) p.set("type", lc);   // toggle off if already active
    const qs = p.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  }

  const pageNums: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1);
    if (page > 3) pageNums.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pageNums.push(i);
    if (page < totalPages - 2) pageNums.push("…");
    pageNums.push(totalPages);
  }

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── TOP SEARCH HERO ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-0 md:pt-12">

          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-2">
            Job Listings
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight mb-1">
            Find Your Next Role
          </h1>
          <p className="text-sm text-gray-500 mb-6 max-w-md leading-relaxed">
            Remote and global opportunities across every industry — updated daily.
          </p>

          {/* ── SEARCH BAR (like Indeed) ─────────────────────────────── */}
          <form method="GET" action="/jobs" className="flex flex-col sm:flex-row gap-0 sm:gap-0 rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">

            {/* What / keyword */}
            <div className="flex items-center gap-2 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={keyword}
                placeholder="Job title, keyword, or company"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              {keyword && (
                <a href={removeFilterHref("q")} className="text-gray-300 hover:text-gray-500 transition-colors ml-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </a>
              )}
            </div>

            {/* Where / location */}
            <div className="flex items-center gap-2 flex-1 px-4 py-3 border-b sm:border-b-0 sm:border-r border-gray-200">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                name="loc"
                defaultValue={location}
                placeholder="City, country, or Remote"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              />
              {location && (
                <a href={removeFilterHref("loc")} className="text-gray-300 hover:text-gray-500 transition-colors ml-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </a>
              )}
            </div>

            {/* Hidden: preserve type */}
            {jobType && <input type="hidden" name="type" value={jobType} />}

            {/* Search button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>

          {/* ── JOB TYPE FILTER PILLS ────────────────────────────────── */}
          <div className="flex items-center gap-2 mt-4 pb-4 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mr-1">Type:</span>
            {JOB_TYPES.map((t) => {
              const isActive = t.toLowerCase() === jobType;
              return (
                <Link
                  key={t}
                  href={typeHref(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {isActive && (
                    <span className="mr-1 opacity-80">✕</span>
                  )}
                  {t}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── ACTIVE FILTER CHIPS + RESULT COUNT ──────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {totalJobs > 0 ? (
              <p className="text-sm font-semibold text-gray-700">
                <span className="text-blue-600">{totalJobs.toLocaleString()}</span> job{totalJobs !== 1 ? "s" : ""} found
                {totalPages > 1 && (
                  <span className="text-gray-400 font-normal ml-1">
                    · showing {from}–{to}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm font-semibold text-gray-500">No jobs found</p>
            )}
          </div>

          {/* Active filter chips (dismissible) */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilters.map((f) => (
                <Link
                  key={f.removeKey}
                  href={removeFilterHref(f.removeKey)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all group"
                  title={`Remove filter: ${f.label}`}
                >
                  {f.label}
                  <svg className="w-3 h-3 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              ))}
              {activeFilters.length > 1 && (
                <Link
                  href="/jobs"
                  className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors underline underline-offset-2"
                >
                  Clear all
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── JOB LIST ────────────────────────────────────────────────── */}
        {jobs.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">No matching jobs found</p>
            <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
              {activeFilters.length > 0
                ? "Try adjusting your search terms, location, or job type filters."
                : "New roles are added daily — check back soon."}
            </p>
            {activeFilters.length > 0 && (
              <Link href="/jobs" className="text-sm font-semibold text-blue-600 hover:underline">
                Clear all filters →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const name   = job.company?.name;
              const avatar = initials(name);
              const color  = avatarColor(job._id);

              return (
                <Link
                  key={job._id}
                  href={`/jobs/${job.slug ?? "#"}`}
                  className="group flex items-start gap-4 bg-white border border-gray-200 rounded-2xl px-5 py-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <span className="text-xs font-black text-white select-none">{avatar}</span>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-sm leading-snug">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                          {name ?? "Company not listed"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        {job.location && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-[11px] font-medium text-gray-600 rounded-md whitespace-nowrap">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                        )}
                        {job.jobType && (
                          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border whitespace-nowrap ${jobTypeBadge(job.jobType)}`}>
                            {job.jobType}
                          </span>
                        )}
                      </div>
                    </div>
                    {job.description && (
                      <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                      View & Apply
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ──────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1.5 flex-wrap">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs font-semibold text-gray-300 cursor-not-allowed">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Prev
              </span>
            )}

            {pageNums.map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-xs font-semibold select-none">…</span>
              ) : (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold border transition-all ${
                    p === page
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {p}
                </Link>
              )
            )}

            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all">
                Next
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs font-semibold text-gray-300 cursor-not-allowed">
                Next
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Page <span className="font-semibold text-gray-600">{page}</span> of{" "}
            <span className="font-semibold text-gray-600">{totalPages}</span>
          </p>
        )}

      </div>

      <NewsletterSection />
    </div>
  );
}