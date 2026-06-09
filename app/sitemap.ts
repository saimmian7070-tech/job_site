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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...categoryUrls,
    ...jobUrls,
    ...blogUrls,
  ];
}