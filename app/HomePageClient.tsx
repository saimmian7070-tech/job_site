"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NewsletterSection from "./components/NewsletterSection";

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const JOB_CATEGORIES = [
  { label: "Remote",      href: "/jobs?type=remote",    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  { label: "Tech",        href: "/categories/tech",     color: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100" },
  { label: "Marketing",   href: "/jobs?cat=marketing",  color: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" },
  { label: "Design",      href: "/categories/design",   color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
  { label: "Finance",     href: "/jobs?cat=finance",    color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
  { label: "Support",     href: "/jobs?cat=support",    color: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100" },
  { label: "Part-Time",   href: "/jobs?type=part-time", color: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" },
  { label: "Entry Level", href: "/jobs?level=entry",    color: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100" },
] as const;

const CAREER_TOPICS = [
  { label: "Resume Writing",       href: "/blog?topic=resume" },
  { label: "Interview Prep",       href: "/blog?topic=interview" },
  { label: "Salary & Negotiation", href: "/blog?topic=salary" },
  { label: "Career Change",        href: "/blog?topic=change" },
  { label: "Work From Home",       href: "/blog?topic=remote" },
  { label: "LinkedIn Tips",        href: "/blog?topic=linkedin" },
] as const;

// Fallback Unsplash images (used only when a blog post has no coverImage field)
const BLOG_IMAGES = [
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
  "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&q=80",
];

// ── INTERFACES ───────────────────────────────────────────────────────────────

interface IJob {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  jobType?: string;
  company?: { name?: string; logo?: string };
}

interface IBlog {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  category?: string;
}

// ── ANIMATED COUNTER HOOK ────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── STAT ITEM ────────────────────────────────────────────────────────────────

function StatItem({
  value,
  label,
  started,
  delay,
}: {
  value: string;
  label: string;
  started: boolean;
  delay: number;
}) {
  const numMatch = value.match(/^(\d+)(\+?)$/);
  const isNumeric = !!numMatch;
  const numTarget = numMatch ? parseInt(numMatch[1]) : 0;
  const suffix = numMatch ? numMatch[2] : "";
  const count = useCountUp(numTarget, 1600 + delay, started && isNumeric);

  return (
    <div>
      <div className="text-3xl font-black text-white tracking-tight tabular-nums">
        {isNumeric ? `${count}${suffix}` : value}
      </div>
      <div className="text-xs text-slate-500 mt-1.5 font-medium uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

// ── MAIN PAGE ────────────────────────────────────────────────────────────────

interface HomePageClientProps {
  jobs: IJob[];
  blogs: IBlog[];
}

export default function HomePageClient({ jobs = [], blogs = [] }: HomePageClientProps) {
  const [statsStarted, setStatsStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStatsStarted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const featured    = blogs[0] ?? null;
  const latestBlogs = blogs.slice(1);

  const STATS = [
    { value: "500+",   label: "Active Listings" },
    { value: "100+",   label: "Career Articles" },
    { value: "Global", label: "Reach" },
    { value: "Free",   label: "Always Free" },
  ];

  return (
    <div className="bg-white text-gray-900 antialiased">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white relative overflow-hidden">
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Soft radial glow — top-right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 65%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-[0.12em]">Listings updated daily</span>
            </div>

            <h1 className="text-[2.6rem] sm:text-5xl md:text-[3.5rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-white">
              Find the job that fits<br />
              <span className="text-blue-400">your next chapter.</span>
            </h1>

            <p className="mt-5 text-[1.05rem] text-slate-400 max-w-lg leading-[1.75]">
              Curated listings, expert career guides, and hiring insights —
              everything you need to move forward.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/30"
              >
                Browse All Jobs
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 transition-colors px-7 py-3.5 text-sm font-semibold text-slate-200"
              >
                Career Advice
              </Link>
            </div>
          </div>

          {/* ── Animated Stats row ── */}
          <div className="mt-16 pt-10 border-t border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <StatItem
                key={s.label}
                value={s.value}
                label={s.label}
                started={statsStarted}
                delay={i * 120}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP LEADERBOARD AD ───────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-center">
          <div className="w-full max-w-[728px] h-[90px] bg-white border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Advertisement</span>
          </div>
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Browse by Category</h2>
            <Link href="/jobs" className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              All Jobs →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {JOB_CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${cat.color}`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-[1fr_288px] gap-10 xl:gap-16">

          {/* ── PRIMARY COLUMN ─────────────────────────────────────────── */}
          <div className="min-w-0 space-y-16">

            {/* FEATURED ARTICLE */}
            {featured && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Featured Article</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Editor's pick</p>
                  </div>
                </div>
                <Link
                  href={`/blog/${featured.slug ?? "#"}`}
                  className="group block rounded-2xl border border-gray-200 bg-white hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Cover image */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-800">
                    <img
                      src={featured.coverImage ?? BLOG_IMAGES[0]}
                      alt={featured.title}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    {/* Accent badge over image */}
                    <div className="absolute bottom-0 left-0 right-0 px-6 md:px-8 py-3.5 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/80">Editor's Pick</span>
                      <svg className="w-4 h-4 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug tracking-tight">
                      {featured.title}
                    </h3>
                    {featured.description && (
                      <p className="mt-3 text-gray-500 leading-relaxed text-sm line-clamp-3">
                        {featured.description}
                      </p>
                    )}
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-700">
                      Read Article
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </section>
            )}

            {/* LATEST JOB OPENINGS */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Latest Job Openings</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Updated daily across all categories</p>
                </div>
                <Link href="/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  View All →
                </Link>
              </div>

              {jobs.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-14 text-center">
                  <p className="text-sm text-gray-500">No listings right now. Check back soon.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100 shadow-sm">
                  {jobs.map((job) => (
                    <Link
                      key={job._id}
                      href={`/jobs/${job.slug ?? "#"}`}
                      className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-5 hover:bg-slate-50 transition-colors"
                    >
                      {/* Left indicator bar */}
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-center gap-4 min-w-0">
                        {/* Company avatar — uses logo if available, else colored initial */}
                        <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {job.company?.logo ? (
                            <img
                              src={job.company.logo}
                              alt={job.company.name}
                              className="w-full h-full object-contain p-1"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <span className="font-black text-gray-500 text-sm select-none">
                              {job.company?.name?.[0]?.toUpperCase() ?? "J"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm truncate leading-tight">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 font-medium">
                            {job.company?.name ?? "Company not listed"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:shrink-0 flex-wrap pl-14 sm:pl-0">
                        {job.location && (
                          <span className="px-2.5 py-1 bg-gray-100 text-[11px] font-medium text-gray-600 rounded-md">
                            {job.location}
                          </span>
                        )}
                        {job.jobType && (
                          <span className="px-2.5 py-1 bg-blue-50 text-[11px] font-semibold text-blue-700 rounded-md border border-blue-100">
                            {job.jobType}
                          </span>
                        )}
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors hidden sm:block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 border border-blue-200 hover:border-blue-500 hover:bg-blue-50 px-6 py-2.5 rounded-lg transition-all"
                >
                  See All Job Listings →
                </Link>
              </div>
            </section>

            {/* CAREER TOPICS */}
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Explore Career Topics</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Guides for every stage of your career</p>
                </div>
                <Link href="/blog" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  All Articles →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CAREER_TOPICS.map((t) => (
                  <Link
                    key={t.label}
                    href={t.href}
                    className="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                      {t.label}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </section>

            {/* TRENDING ARTICLES */}
            {latestBlogs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Trending Career Advice</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Most-read articles this week</p>
                  </div>
                  <Link href="/blog" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    View All →
                  </Link>
                </div>

                {/* Top 2 — card grid WITH images */}
                {latestBlogs.slice(0, 2).length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    {latestBlogs.slice(0, 2).map((post, i) => (
                      <Link
                        key={post._id}
                        href={`/blog/${post.slug ?? "#"}`}
                        className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
                      >
                        {/* Image strip */}
                        <div className="relative h-36 overflow-hidden bg-gray-100">
                          <img
                            src={post.coverImage ?? BLOG_IMAGES[(i + 1) % BLOG_IMAGES.length]}
                            alt={post.title}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600 mb-3 block">
                            Career Advice
                          </span>
                          <h3 className="font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-2 text-sm flex-1">
                            {post.title}
                          </h3>
                          {post.description && (
                            <p className="mt-2.5 text-xs text-gray-500 leading-relaxed line-clamp-3">
                              {post.description}
                            </p>
                          )}
                          <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700">
                            Read Article →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Articles 3–6 — ranked list (original style, unchanged) */}
                {latestBlogs.slice(2, 6).length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
                    {latestBlogs.slice(2, 6).map((post, i) => (
                      <Link
                        key={post._id}
                        href={`/blog/${post.slug ?? "#"}`}
                        className="group flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg font-black text-gray-200 group-hover:text-blue-200 transition-colors tabular-nums shrink-0 leading-tight pt-0.5 w-6 select-none">
                          {i + 3}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm leading-snug line-clamp-2">
                            {post.title}
                          </h4>
                          {post.description && (
                            <p className="mt-1 text-xs text-gray-400 line-clamp-1">{post.description}</p>
                          )}
                        </div>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* MID BANNER AD */}
            <div className="flex justify-center">
              <div className="w-full h-[90px] bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Advertisement</span>
              </div>
            </div>

            {/* LATEST ARTICLES GRID */}
            {latestBlogs.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Latest Articles</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Fresh career insights published regularly</p>
                  </div>
                  <Link href="/blog" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    View All →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {latestBlogs.map((post, i) => (
                    <Link
                      key={post._id}
                      href={`/blog/${post.slug ?? "#"}`}
                      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-sm transition-all block"
                    >
                      {/* Small image on each card */}
                      <div className="relative h-28 overflow-hidden bg-gray-100">
                        <img
                          src={post.coverImage ?? BLOG_IMAGES[(i + 3) % BLOG_IMAGES.length]}
                          alt={post.title}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-600 mb-2.5 block">
                          Career Guide
                        </span>
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {post.title}
                        </h3>
                        {post.description && (
                          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {post.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* NEWSLETTER */}
            <div className="relative">
              <NewsletterSection />
            </div>

            {/* WHY US */}
            <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-10 overflow-hidden relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="relative">
                <h2 className="text-lg font-bold text-white tracking-tight mb-1">Why Jobs Home Online</h2>
                <p className="text-sm text-slate-400 mb-10 leading-relaxed">Built for job seekers who are serious about their next move.</p>
                <div className="grid sm:grid-cols-3 gap-8">
                  {[
                    { title: "Career Growth",  body: "Actionable strategies that help professionals advance — not generic recycled advice." },
                    { title: "Quality Roles",  body: "Remote, hybrid, and on-site positions updated daily across multiple industries." },
                    { title: "Real Insights",  body: "Hiring trends and market shifts from people who actually follow the industry." },
                  ].map((item, i) => (
                    <div key={item.title} className="flex flex-col gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-xs font-black text-blue-400 tabular-nums">0{i + 1}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <aside className="space-y-6 min-w-0">

            <div className="w-full h-[250px] bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Advertisement</span>
            </div>

            {/* Browse job types */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-4">Browse Job Types</p>
              <div className="space-y-0.5">
                {[
                  { label: "Remote Jobs",         href: "/jobs?type=remote" },
                  { label: "Full-Time Positions",  href: "/jobs?type=full-time" },
                  { label: "Part-Time Roles",      href: "/jobs?type=part-time" },
                  { label: "Entry Level",          href: "/jobs?level=entry" },
                  { label: "Tech & Engineering",   href: "/categories/tech" },
                  { label: "Marketing Roles",      href: "/jobs?cat=marketing" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group font-medium"
                  >
                    {item.label}
                    <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* More articles — sidebar WITH thumbnails */}
            {latestBlogs.slice(4, 8).length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-400">More Articles</p>
                  <Link href="/blog" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">
                    All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {latestBlogs.slice(4, 8).map((post, i) => (
                    <Link
                      key={post._id}
                      href={`/blog/${post.slug ?? "#"}`}
                      className="group flex gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      {/* Tiny thumbnail */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={post.coverImage ?? BLOG_IMAGES[(i + 4) % BLOG_IMAGES.length]}
                          alt={post.title}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h4>
                        {post.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                            {post.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full h-[250px] bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Advertisement</span>
            </div>

          </aside>
        </div>
      </div>

      {/* ── BOTTOM LEADERBOARD AD ────────────────────────────────────────── */}
      <div className="border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
          <div className="w-full max-w-[728px] h-[90px] bg-white border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Advertisement</span>
          </div>
        </div>
      </div>

    </div>
  );
}