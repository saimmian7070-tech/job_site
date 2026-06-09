import connectMongo from "./mongodb";
import Job from "@/models/Job";

export async function getJobs() {
  await connectMongo();
  return Job.find({}).sort({ createdAt: -1 });
}

export async function getJobBySlug(slug: string) {
  await connectMongo();
  return Job.findOne({ slug, isActive: true });
}