import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Job Categories | Browse by Industry & Type",
  description:
    "Browse job listings by category — tech, design, marketing, finance, remote, part-time, and more. Find the role that fits your skills and career stage.",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const icons: Record<string, React.ReactNode> = {
  tech: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  design: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  marketing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ),
  finance: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  support: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  remote: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  parttime: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  entry: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
};

// ─── Static config ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "Tech & Engineering", iconKey: "tech",      description: "Software, infrastructure, data, and engineering roles.", href: "/categories/tech",        color: "bg-violet-50 border-violet-100 text-violet-700" },
  { label: "Design & Creative",  iconKey: "design",    description: "UI/UX, graphic design, brand, and creative direction.",  href: "/categories/design",      color: "bg-amber-50 border-amber-100 text-amber-700" },
  { label: "Marketing",          iconKey: "marketing", description: "Growth, content, SEO, paid media, and communications.", href: "/categories/marketing",   color: "bg-rose-50 border-rose-100 text-rose-700" },
  { label: "Finance",            iconKey: "finance",   description: "Accounting, analysis, banking, and financial planning.", href: "/categories/finance",     color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  { label: "Customer Support",   iconKey: "support",   description: "Support, success, account management, and CX roles.",   href: "/categories/support",     color: "bg-sky-50 border-sky-100 text-sky-700" },
  { label: "Remote Jobs",        iconKey: "remote",    description: "Fully remote positions across all industries.",          href: "/categories/remote",      color: "bg-blue-50 border-blue-100 text-blue-700" },
  { label: "Part-Time",          iconKey: "parttime",  description: "Flexible part-time roles for every career stage.",      href: "/categories/part-time",   color: "bg-orange-50 border-orange-100 text-orange-700" },
  { label: "Entry Level",        iconKey: "entry",     description: "Roles open to candidates early in their careers.",      href: "/categories/entry-level", color: "bg-teal-50 border-teal-100 text-teal-700" },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="py-12 md:py-16 border-b border-gray-100">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 mb-3">
            Browse Jobs
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
            Job Categories
          </h1>
          <p className="mt-4 text-gray-500 text-base max-w-xl leading-relaxed">
            Browse curated job listings by industry, work type, or career level.
            Find the type of role that fits where you are — and where you're going.
          </p>
        </div>

        {/* Category grid */}
        <div className="py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Icon badge */}
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-4 ${cat.color}`}>
                  {icons[cat.iconKey]}
                </div>

                <h2 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors leading-snug">
                  {cat.label}
                </h2>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed flex-1">
                  {cat.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-1.5 transition-all">
                  Browse Jobs
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Browse all CTA */}
        <div className="py-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Don't see your field?{" "}
            <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Browse all jobs →
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}