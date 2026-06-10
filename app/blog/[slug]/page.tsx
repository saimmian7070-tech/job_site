import connectMongo from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  updatedAt?: string | Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
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
    const post = (await Blog.findOne({ slug }).lean()) as IBlogPost | null;

    if (!post) return { title: "Article Not Found | Career Blog" };

    const description = post.description?.slice(0, 160) ?? "";

    return {
      title: `${post.title} | Career Blog`,
      description,
      openGraph: {
        title: post.title,
        description,
        type: "article",
        url: `https://jobshomeonline.com/blog/${slug}`,
        siteName: "Jobs Home Online",
        ...(post.updatedAt && {
          modifiedTime: new Date(post.updatedAt).toISOString(),
        }),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
      },
    };
  } catch {
    return { title: "Career Blog" };
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: IBlogPost | null = null;
  let relatedPosts: IBlogPost[] = [];

  try {
    await connectMongo();

    const rawPost = (await Blog.findOne({ slug }).lean()) as any;
    if (!rawPost) notFound();

    post = { ...rawPost, _id: rawPost._id.toString() };

    const rawRelated = await Blog.find({ slug: { $ne: slug } })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    relatedPosts = rawRelated.map((r: any) => ({
      ...r,
      _id: r._id.toString(),
    }));
  } catch {
    notFound();
  }

  if (!post) notFound();

// Auto-refresh updatedAt once per calendar day
const today = new Date().toISOString().slice(0, 10);
const lastUpdated = post.updatedAt
  ? new Date(post.updatedAt as string).toISOString().slice(0, 10)
  : null;

if (lastUpdated !== today) {
  await Blog.updateOne({ slug }, { $set: { updatedAt: new Date() } });
  post.updatedAt = new Date();
}

  const formattedDate = post.updatedAt ? formatDate(post.updatedAt) : null;
  const readTime = post.content ? getReadTime(post.content) : null;

  // ── JSON-LD structured data ────────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description ?? "",
    url: `https://jobshomeonline.com/blog/${slug}`,
    ...(post.updatedAt && {
      dateModified: new Date(post.updatedAt).toISOString(),
      datePublished: new Date(post.updatedAt).toISOString(),
    }),
    author: {
      "@type": "Organization",
      name: "Jobs Home Online",
      url: "https://jobshomeonline.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Jobs Home Online",
      url: "https://jobshomeonline.com",
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-medium"
          >
            <Link href="/" className="hover:text-gray-600 transition-colors">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link
              href="/blog"
              className="hover:text-gray-600 transition-colors"
            >
              Career Blog
            </Link>
            <span aria-hidden>/</span>
            <span className="text-gray-600 truncate max-w-[180px]">
              {post.title}
            </span>
          </nav>

          {/* Article header */}
          <header className="pb-8 border-b border-gray-200 mb-8">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 mb-4 block">
              Career Guide
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              {post.title}
            </h1>

            {post.description && (
              <p className="mt-4 text-gray-500 text-base leading-relaxed">
                {post.description}
              </p>
            )}

            {/* Byline */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-6">
              {/* Author avatar */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-white select-none">
                    JHO
                  </span>
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  Jobs Home Online Editorial Team
                </span>
              </div>

              <span aria-hidden className="text-gray-300 text-xs">·</span>

              {formattedDate && (
                <>
                  <time
                    dateTime={new Date(post.updatedAt!).toISOString()}
                    className="text-xs text-gray-400"
                  >
                    Updated {formattedDate}
                  </time>
                  <span aria-hidden className="text-gray-300 text-xs">·</span>
                </>
              )}

              {readTime && (
                <span className="text-xs text-gray-400">
                  {readTime} min read
                </span>
              )}
            </div>
          </header>

          {/* Article body */}
          {post.content ? (
            <div
              className="prose prose-gray prose-sm sm:prose-base max-w-none
                prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-lg prose-h3:mt-7 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-li:text-gray-600 prose-li:leading-relaxed
                prose-ul:my-4 prose-ol:my-4
                prose-blockquote:border-blue-500 prose-blockquote:text-gray-500"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-gray-400 text-sm italic">
              Content not available.
            </p>
          )}

          {/* Author box */}
          <div className="mt-12 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white select-none">JHO</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                Jobs Home Online Editorial Team
              </p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                We publish practical career guides, job search strategies, and
                hiring insights for professionals at every level. Our goal is to
                give you the information you need to move forward — clearly and
                without the fluff.
              </p>
            </div>
          </div>

          {/* Continue Reading */}
          {relatedPosts.length > 0 && (
  <div className="mt-14 pt-10 border-t border-gray-200">
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 mb-1">
          Keep Going
        </p>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Continue Reading
        </h2>
      </div>
      <Link
        href="/blog"
        className="text-xs font-semibold text-gray-400 hover:text-blue-600 transition-colors"
      >
        All articles →
      </Link>
    </div>

    <div className="grid gap-4">
      {relatedPosts.map((item, i) => (
        <Link
          key={item._id}
          href={`/blog/${item.slug ?? "#"}`}
          className="group flex items-start gap-5 p-5 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl transition-all"
        >
          <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center transition-colors">
            <span className="text-xs font-bold text-blue-600 group-hover:text-white transition-colors">
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1 block">
              Career Guide
            </span>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 leading-snug transition-colors">
              {item.title}
            </p>
            {item.description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-1 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  </div>
)}

          {/* Back to blog */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Career Blog
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}