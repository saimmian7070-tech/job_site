import connectMongo from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Link from "next/link";
import NewsletterSection from "@/app/components/NewsletterSection";

interface IBlog {
  _id: string;
  title: string;
  slug: string;
  description?: string;
}

const TOPICS = [
  { label: "Resume Writing",       href: "/blog?topic=resume" },
  { label: "Interview Tips",       href: "/blog?topic=interview" },
  { label: "Salary & Negotiation", href: "/blog?topic=salary" },
  { label: "Career Change",        href: "/blog?topic=change" },
  { label: "Remote Work",          href: "/blog?topic=remote" },
  { label: "Industry Trends",      href: "/blog?topic=trends" },
] as const;

export const metadata = {
  title: "Career Blog | Jobs Home Online",
  description: "Career advice, resume tips, interview preparation, and hiring insights for working professionals.",
};

export default async function BlogPage() {
  let blogs: IBlog[] = [];

  try {
    await connectMongo();
    const raw = await Blog.find({}).sort({ createdAt: -1 }).lean();
    blogs = raw.map((b: any) => ({ ...b, _id: b._id.toString() }));
  } catch (err) {
    console.error("BlogPage DB error:", err);
  }

  const featured = blogs[0] ?? null;
  const secondary = blogs.slice(1, 3);   // 2 highlight cards below featured
  const rest = blogs.slice(3);            // remaining articles in list

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="py-12 md:py-16 border-b border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Career Blog
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight max-w-xl">
            Insights to move your career forward.
          </h1>
          <div className="flex flex-wrap gap-2 mt-6">
            {TOPICS.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-gray-500">No articles yet. Check back soon.</p>
          </div>
        ) : (
          <div className="py-10 space-y-10">

            {/* ── Featured ───────────────────────────────────────────────── */}
            {featured && (
              <Link
                href={`/blog/${featured.slug ?? "#"}`}
                className="group block bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all"
              >
                {/* Coloured top bar */}
                <div className="h-1.5 w-full bg-blue-600" />
                <div className="p-7 md:p-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-4 block">
                    Editor's Pick
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug max-w-3xl">
                    {featured.title}
                  </h2>
                  {featured.description && (
                    <p className="mt-4 text-gray-500 text-sm leading-relaxed max-w-2xl line-clamp-3">
                      {featured.description}
                    </p>
                  )}
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-3 transition-all">
                    Read Article
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            )}

            {/* ── Two highlight cards ─────────────────────────────────────── */}
            {secondary.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-5">
                {secondary.map((post) => (
                  <Link
                    key={post._id}
                    href={`/blog/${post.slug ?? "#"}`}
                    className="group flex flex-col bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-3">
                      Career Guide
                    </span>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug text-base flex-1 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.description && (
                      <p className="mt-2.5 text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {post.description}
                      </p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:gap-2.5 transition-all">
                      Read Article
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* ── Rest: two-column grid ───────────────────────────────────── */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">More Articles</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((post) => (
                    <Link
                      key={post._id}
                      href={`/blog/${post.slug ?? "#"}`}
                      className="group flex flex-col bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-2 block">
                        Career Guide
                      </span>
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
                          {post.description}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                        Read
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}

          </div>
        )}

      </div>
      <NewsletterSection />
    </div>
  );
}