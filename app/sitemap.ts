import { getJobs } from "@/lib/jobs";
import connectMongo from "@/lib/mongodb";
import Blog from "@/models/Blog";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default async function sitemap() {
  const allJobs = await getJobs();

  // ✅ Only include active jobs
  const jobs = allJobs.filter((job: any) => job.isActive === true);

  await connectMongo();
  const blogs = await Blog.find({}).lean();

  const baseUrl = "https://jobshomeonline.com";

  // ✅ Static pages
  const staticPages = [
    { url: `${baseUrl}`,             priority: 1.0, changeFrequency: "daily"   as const },
    { url: `${baseUrl}/jobs`,        priority: 0.9, changeFrequency: "daily"   as const },
    { url: `${baseUrl}/blog`,        priority: 0.9, changeFrequency: "daily"   as const },
    { url: `${baseUrl}/categories`,  priority: 0.8, changeFrequency: "weekly"  as const },
    { url: `${baseUrl}/companies`,   priority: 0.8, changeFrequency: "weekly"  as const },
    { url: `${baseUrl}/locations`,   priority: 0.8, changeFrequency: "weekly"  as const },
    { url: `${baseUrl}/about`,       priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`,     priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/privacy`,     priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/terms`,       priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/faq`,         priority: 0.5, changeFrequency: "monthly" as const },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
  }));

  // ✅ Active job detail pages
  // ✅ new
const jobUrls = jobs.filter((job: any) => typeof job.slug === "string").map((job: any) => ({
  url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.updatedAt || job.postedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ✅ Blog post pages
  // ✅ new
const blogUrls = (blogs as any[]).filter((post) => typeof post.slug === "string").map((post) => ({
  url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ✅ Dynamic categories — unique values from active jobs
  const uniqueCategories = [
    ...new Set(
      jobs
        .map((job: any) => job.category)
        .filter(Boolean)
        .map((cat: string) => slugify(cat))
    ),
  ] as string[];

  const categoryUrls = uniqueCategories.map((cat) => ({
    url: `${baseUrl}/categories/${cat}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ✅ Dynamic companies — unique slugified company names from active jobs
  const uniqueCompanies = [
    ...new Set(
      jobs
        .map((job: any) => job.company)
        .filter(Boolean)
        .map((co: string) => slugify(co))
    ),
  ] as string[];

  const companyUrls = uniqueCompanies.map((co) => ({
    url: `${baseUrl}/companies/${co}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ✅ Dynamic locations — unique slugified locations from active jobs
  const uniqueLocations = [
    ...new Set(
      jobs
        .map((job: any) => job.location)
        .filter(Boolean)
        .map((loc: string) => slugify(loc))
    ),
  ] as string[];

  const locationUrls = uniqueLocations.map((loc) => ({
    url: `${baseUrl}/locations/${loc}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ✅ Merge all and remove duplicate URLs
  const allUrls = [
    ...staticPages,
    ...jobUrls,
    ...blogUrls,
    ...categoryUrls,
    ...companyUrls,
    ...locationUrls,
  ];

  const seen = new Set<string>();
  return allUrls.filter(({ url }) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}