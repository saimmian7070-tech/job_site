import Link from "next/link";

// ─── Static config ────────────────────────────────────────────────────────────
// Extend this list as your DB grows. The `href` uses the same query params
// already established on the homepage category tiles (/jobs?cat=...).

const CATEGORIES = [
  { label: "Tech & Engineering", icon: "💻", description: "Software, infrastructure, data, and engineering roles.", href: "/categories/tech" },
  { label: "Design & Creative",  icon: "🎨", description: "UI/UX, graphic design, brand, and creative direction.",  href: "/categories/design" },
  { label: "Marketing",          icon: "📣", description: "Growth, content, SEO, paid media, and communications.", href: "/jobs?cat=marketing" },
  { label: "Finance",            icon: "📊", description: "Accounting, analysis, banking, and financial planning.", href: "/jobs?cat=finance" },
  { label: "Customer Support",   icon: "🤝", description: "Support, success, account management, and CX roles.",   href: "/jobs?cat=support" },
  { label: "Remote Jobs",        icon: "🌍", description: "Fully remote positions across all industries.",          href: "/jobs?type=remote" },
  { label: "Part-Time",          icon: "⏱️", description: "Flexible part-time roles for every career stage.",      href: "/jobs?type=part-time" },
  { label: "Entry Level",        icon: "🚀", description: "Roles open to candidates early in their careers.",      href: "/jobs?level=entry" },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="py-12 md:py-16 border-b border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Browse Jobs
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Job Categories
          </h1>
          <p className="mt-4 text-gray-500 text-sm max-w-xl leading-relaxed">
            Find the type of role that fits you. Browse curated job listings
            by industry, work type, or career level.
          </p>
        </div>

        {/* Category grid */}
        <div className="py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <span className="text-2xl mb-3">{cat.icon}</span>
                <h2 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {cat.label}
                </h2>
                <p className="mt-1.5 text-xs text-gray-500 leading-relaxed flex-1">
                  {cat.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
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
        <div className="py-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-gray-500">
            Don't see your field?{" "}
            <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Browse all jobs →
            </Link>
          </p>
          <Link
            href="/jobs/post"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors px-5 py-2.5 text-sm font-semibold text-gray-700"
          >
            Post a Job
          </Link>
        </div>

      </div>
    </div>
  );
}