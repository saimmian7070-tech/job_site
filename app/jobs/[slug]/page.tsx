import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IJob {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  jobType?: string;
  description?: string;
  content?: string;
  applyUrl?: string;
  postedAt?: string | Date;
  updatedAt?: string | Date;
  company?: { name?: string };
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    await connectMongo();
    const job = (await Job.findOne({ slug }).lean()) as IJob | null;
    if (!job) return { title: "Job Not Found | Jobs Home Online" };

    return {
      title: `${job.title}${job.company?.name ? ` at ${job.company.name}` : ""} | Jobs Home Online`,
      description: job.description?.slice(0, 160),
    };
  } catch {
    return { title: "Jobs Home Online" };
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

  const postedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Schema.org JobPosting — use jobType from DB, not a hardcoded "Full-time"
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? "",
    ...(job.jobType && { employmentType: job.jobType }),
    ...(job.company?.name && {
      hiringOrganization: {
        "@type": "Organization",
        name: job.company.name,
      },
    }),
    ...(job.location && {
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: job.location,
        },
      },
    }),
    ...(job.postedAt && {
      datePosted: new Date(job.postedAt).toISOString(),
    }),
    ...(job.applyUrl && { url: job.applyUrl }),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-gray-600 transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{job.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_280px] gap-8">

          {/* ── Main ── */}
          <div>

            {/* Job header card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 block">
                {job.jobType ?? "Job Opening"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-sm text-gray-500">
                {job.company?.name && <span className="font-medium text-gray-700">{job.company.name}</span>}
                {job.location && (
                  <>
                    <span aria-hidden>·</span>
                    <span>📍 {job.location}</span>
                  </>
                )}
                {postedDate && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Posted {postedDate}</span>
                  </>
                )}
              </div>

              {job.description && (
                <p className="mt-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-5">
                  {job.description}
                </p>
              )}
            </div>

            {/* Job content */}
            {job.content ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
                <div
                  className="prose prose-gray prose-sm sm:prose-base max-w-none
                    prose-headings:font-bold prose-headings:text-gray-900
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900
                    prose-li:text-gray-600"
                  dangerouslySetInnerHTML={{ __html: job.content }}
                />
              </div>
            ) : null}

            {/* Back link */}
            <div className="mt-8">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Jobs
              </Link>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-5">

            {/* Apply CTA */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
                Ready to Apply?
              </p>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Review the job details carefully before applying. Make sure your
                resume reflects the skills mentioned in this role.
              </p>
              {job.applyUrl ? (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold text-sm rounded-lg px-5 py-3"
                >
                  Apply for This Role →
                </a>
              ) : (
                <p className="text-xs text-gray-400 text-center">
                  Application link not available.
                </p>
              )}

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5 text-xs text-gray-500">
                {job.jobType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Job Type</span>
                    <span className="font-medium text-gray-700">{job.jobType}</span>
                  </div>
                )}
                {job.location && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span className="font-medium text-gray-700">{job.location}</span>
                  </div>
                )}
                {job.company?.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Company</span>
                    <span className="font-medium text-gray-700">{job.company.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ad slot */}
            <div className="w-full h-[250px] bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Advertisement</span>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}