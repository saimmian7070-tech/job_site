import Link from "next/link";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import { notFound } from "next/navigation";

interface IJob {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  jobType?: string;
  company?: { name?: string };
}

function unslugify(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: { params: Promise<{ location: string }> }) {
  const { location } = await params;
  const label = unslugify(location);
  return {
    title: `${label} Jobs | Jobs Home Online`,
    description: `Browse the latest job listings in ${label}. Find remote and local opportunities across tech, marketing, design, finance and more.`,
    alternates: {
      canonical: `https://jobshomeonline.com/locations/${location}`,
    },
    openGraph: {
      title: `${label} Jobs | Jobs Home Online`,
      description: `Browse the latest job listings in ${label}.`,
      url: `https://jobshomeonline.com/locations/${location}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ location: string }> }) {
  const { location } = await params;
  const label = unslugify(location);

  let jobs: IJob[] = [];

  try {
    await connectMongo();
    const raw = await Job.find({
      location: { $regex: location.replace(/-/g, " "), $options: "i" },
    })
      .sort({ postedAt: -1 })
      .limit(20)
      .lean();
    jobs = raw.map((j: any) => ({ ...j, _id: j._id.toString() }));
  } catch (err) {
    console.error("LocationPage DB error:", err);
  }

  if (jobs.length === 0) notFound();

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 pt-8 mb-6 font-medium">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-gray-600 transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-gray-600">{label}</span>
        </nav>

        {/* Header */}
        <div className="pb-8 border-b border-gray-200 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📍</span>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Location
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Jobs in {label}
          </h1>
          <p className="mt-3 text-gray-500 text-sm max-w-xl leading-relaxed">
            Browse the latest job openings in {label} across tech, marketing, design, finance and more.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {jobs.length} {jobs.length === 1 ? "listing" : "listings"} found
          </p>
        </div>

        {/* Job list */}
        <div className="divide-y divide-gray-100 mb-10">
          {jobs.map((job) => (
            <Link
              key={job._id}
              href={`/jobs/${job.slug ?? "#"}`}
              className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-5 first:pt-0 transition"
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

        {/* Bottom nav */}
        <div className="py-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Jobs
          </Link>
          <Link href="/categories" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Browse Categories →
          </Link>
        </div>

      </div>
    </div>
  );
}