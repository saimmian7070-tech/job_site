import { getJobs } from "@/lib/jobs";

export default async function sitemap() {
  const jobs = await getJobs();

  const jobUrls = jobs.map((job: any) => ({
    url: `http://localhost:3000/jobs/${job.slug}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "http://localhost:3000",
      lastModified: new Date(),
    },
    {
      url: "http://localhost:3000/jobs",
      lastModified: new Date(),
    },
    {
      url: "http://localhost:3000/categories",
      lastModified: new Date(),
    },
    {
      url: "http://localhost:3000/companies",
      lastModified: new Date(),
    },
    {
      url: "http://localhost:3000/blog",
      lastModified: new Date(),
    },
    ...jobUrls,
  ];
}