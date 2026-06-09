import Link from "next/link";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IJob {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  jobType?: string;
  company?: { name?: string };
}

// ─── Category display map ─────────────────────────────────────────────────────
// Maps the URL param (e.g. "tech") to a human-readable label and description.
// Add entries here as you add new categories.

const CATEGORY_META: Record<string, { label: string; description: string; icon: string }> = {
  tech:      { label: "Tech & Engineering", icon: "💻", description: "Software, infrastructure, data, and engineering roles." },
  design:    { label: "Design & Creative",  icon: "🎨", description: "UI/UX, graphic design, brand, and creative direction." },
  marketing: { label: "Marketing",          icon: "📣", description: "Growth, content, SEO, paid media, and communications." },
  finance:   { label: "Finance",            icon: "📊", description: "Accounting, analysis, banking, and financial planning." },
  support:   { label: "Customer Support",   icon: "🤝", description: "Support, success, account management, and CX roles." },
};

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = CATEGORY_META[category.toLowerCase()];
  const label = meta?.label ?? `${category} Jobs`;

  return {
    title: `${label} | Jobs Home Online`,
    description: meta?.description ?? `Browse the latest ${label} on Jobs Home Online.`,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryKey = category.toLowerCase();
  const meta = CATEGORY_META[categoryKey];

  // Unknown category slug → 404 rather than an empty page with no explanation
  if (!meta) notFound();

  let jobs: IJob[] = [];

  try {
    await connectMongo();
    const raw = await Job.find({ category: categoryKey })
      .sort({ createdAt: -1 })
      .lean();
    jobs = raw.map((j: any) => ({ ...j, _id: j._id.toString() }));
  } catch (err) {
    console.error("CategoryPage DB error:", err);
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 pt-8 mb-6 font-medium">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-gray-600 transition-colors">Categories</Link>
          <span>/</span>
          <span className="text-gray-600">{meta.label}</span>
        </nav>

        {/* Header */}
        <div className="pb-8 border-b border-gray-200 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{meta.icon}</span>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Job Category
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {meta.label}
          </h1>
          <p className="mt-3 text-gray-500 text-sm max-w-xl leading-relaxed">
            {meta.description}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {jobs.length} {jobs.length === 1 ? "listing" : "listings"} found
          </p>
        </div>

        {/* Job list */}
        {jobs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-2xl mb-3">📭</p>
            <p className="text-sm font-semibold text-gray-700 mb-1">No listings right now</p>
            <p className="text-sm text-gray-500 mb-6">
              New {meta.label} roles are added daily. Check back soon.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors px-5 py-2.5 text-sm font-semibold text-white"
            >
              Browse All Jobs
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 mb-10">
            {jobs.map((job) => (
              <Link
                key={job._id}
                href={`/jobs/${job.slug ?? "#"}`}
                className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-5 first:pt-0 hover:opacity-100 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm truncate">
                      {job.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.company?.name ?? "Company not listed"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-12 sm:pl-0 flex-wrap shrink-0">
                  {job.location && (
                    <span className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-md">
                      {job.location}
                    </span>
                  )}
                  {job.jobType && (
                    <span className="px-2.5 py-1 bg-blue-50 text-xs font-medium text-blue-700 rounded-md">
                      {job.jobType}
                    </span>
                  )}
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom nav */}
        <div className="py-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Categories
          </Link>
          <Link
            href="/jobs"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Browse All Jobs →
          </Link>
        </div>

      </div>
    </div>
  );
}