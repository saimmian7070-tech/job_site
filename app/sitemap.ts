import { getJobs } from "@/lib/jobs";
import connectMongo from "@/lib/mongodb";
import Blog from "@/models/Blog";

export default async function sitemap() {
  const jobs = await getJobs();

  await connectMongo();
  const blogs = await Blog.find({}).lean();

  const baseUrl = "https://jobshomeonline.com";

  const jobUrls = jobs.map((job: any) => ({
    url: `${baseUrl}/jobs/${job.slug}`,
    lastModified: job.updatedAt || job.postedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const blogUrls = blogs.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categories = ["it", "design", "marketing", "finance"];
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/categories/${cat}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // ✅ Static pages
  const staticPages = [
    { url: `${baseUrl}`, priority: 1.0, changeFrequency: "daily" as const },
    { url: `${baseUrl}/jobs`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${baseUrl}/blog`, priority: 0.9, changeFrequency: "daily" as const },
    { url: `${baseUrl}/categories`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/companies`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/locations`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/about`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/privacy`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/terms`, priority: 0.5, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/faq`, priority: 0.5, changeFrequency: "monthly" as const },
  ].map((page) => ({
    ...page,
    lastModified: new Date(),
  }));

  return [
    ...staticPages,
    ...categoryUrls,
    ...jobUrls,
    ...blogUrls,
  ];
}