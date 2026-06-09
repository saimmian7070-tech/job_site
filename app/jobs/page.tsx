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

export default async function JobsPage() {
  let jobs: IJob[] = [];

  try {
    await connectMongo();
    const raw = await Job.find({}).sort({ createdAt: -1 }).limit(50).lean();
    jobs = raw.map((j: any) => ({ ...j, _id: j._id.toString() }));
  } catch (err) {
    console.error("JobsPage DB error:", err);
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Job Listings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            Latest Job Openings
          </h1>
          <p className="mt-3 text-gray-500 text-sm max-w-xl leading-relaxed">
            Remote and global opportunities across every industry — updated daily.
          </p>
        </div>

        {/* Job list */}
        {jobs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-2xl mb-3">📭</p>
            <p className="text-sm font-semibold text-gray-700 mb-1">No listings right now</p>
            <p className="text-sm text-gray-500">New roles are added daily — check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-16">
            {jobs.map((job) => (
              <Link
                key={job._id}
                href={`/jobs/${job.slug ?? "#"}`}
                className="group block bg-white border border-gray-200 rounded-xl px-6 py-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                  {/* Left: icon + text */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base leading-snug">
                        {job.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 font-medium">
                        {job.company?.name ?? "Company not listed"}
                      </p>
                      {job.description && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: badges + CTA */}
                  <div className="flex flex-col items-start sm:items-end justify-between gap-3 shrink-0 pl-16 sm:pl-0">
                    <div className="flex flex-wrap gap-2">
                      {job.location && (
                        <span className="px-2.5 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-md whitespace-nowrap">
                          📍 {job.location}
                        </span>
                      )}
                      {job.jobType && (
                        <span className="px-2.5 py-1 bg-blue-50 text-xs font-semibold text-blue-700 rounded-md whitespace-nowrap">
                          {job.jobType}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:gap-2.5 transition-all">
                      View & Apply
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>

                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
      <NewsletterSection />
    </div>
  );
}