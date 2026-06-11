import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Link from "next/link";
import { notFound } from "next/navigation";

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

function cleanText(str?: string): string {
  if (!str) return "";

  // Fix Arabic/UTF-8 double-encoding: Ø§ÙÙ -> proper Arabic
  // These are UTF-8 bytes misread as Latin-1
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
      description: cleanText(job.description)?.slice(0, 160),
    };
  } catch {
    return { title: "Jobs Home Online" };
  }
}

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

  const cleanedDescription = cleanText(job.description);
  const cleanedLocation = cleanLocation(job.location);

  const isJunkDescription =
    !cleanedDescription ||
    /^posted\s+\d+:\d+/i.test(cleanedDescription) ||
    cleanedDescription.length < 30;

  const postedDate = job.postedAt
    ? new Date(job.postedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: cleanedDescription ?? "",
    ...(job.jobType && { employmentType: job.jobType }),
    ...(job.company?.name && {
      hiringOrganization: { "@type": "Organization", name: job.company.name },
    }),
    ...(cleanedLocation && {
      jobLocation: {
        "@type": "Place",
        address: { "@type": "PostalAddress", addressLocality: cleanedLocation },
      },
    }),
    ...(job.postedAt && { datePosted: new Date(job.postedAt).toISOString() }),
    ...(job.applyUrl && { url: job.applyUrl }),
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/jobs" className="hover:text-gray-600 transition-colors">Jobs</Link>
          <span>/</span>
          <span className="text-gray-600 truncate max-w-[200px]">{job.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-start gap-8">

          <div className="flex-1 min-w-0">

            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 block">
                {job.jobType ?? "Job Opening"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-sm text-gray-500">
                {job.company?.name && (
                  <span className="font-medium text-gray-700">{job.company.name}</span>
                )}
                {cleanedLocation && (
                  <>
                    <span aria-hidden>·</span>
                    <span>📍 {cleanedLocation}</span>
                  </>
                )}
                {postedDate && (
                  <>
                    <span aria-hidden>·</span>
                    <span>Posted {postedDate}</span>
                  </>
                )}
              </div>

              {!isJunkDescription && (
                <p className="mt-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-5">
                  {cleanedDescription}
                </p>
              )}
            </div>

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

          <aside className="w-full lg:w-72 shrink-0 space-y-5">

            <div className="bg-white border border-gray-200 rounded-xl p-6 lg:sticky lg:top-24">
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
                {cleanedLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location</span>
                    <span className="font-medium text-gray-700">{cleanedLocation}</span>
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

            <div className="w-full h-[250px] bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Advertisement</span>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}