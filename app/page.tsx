import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import Blog from "@/models/Blog";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  let jobs: any[] = [];
  let blogs: any[] = [];

  try {
    await connectMongo();
    const rawJobs = await Job.find({ isActive: true }).sort({ score: -1, createdAt: -1 }).limit(6).lean();
    const rawBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(9).lean();
    jobs  = rawJobs.map((j: any)  => ({ ...j, _id: j._id.toString() }));
    blogs = rawBlogs.map((b: any) => ({ ...b, _id: b._id.toString() }));
  } catch (err) {
    console.error("HomePage DB error:", err);
  }

  return <HomePageClient jobs={jobs} blogs={blogs} />;
}