import connectMongo from "./mongodb";
import Job from "@/models/Job";

// ─── Get jobs (paginated, active only) ────────────────────────────────────
export async function getJobs({
  page = 1,
  limit = 20,
}: { page?: number; limit?: number } = {}) {
  try {
    await connectMongo();
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find({})
        .sort({ score: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments({ isActive: true }),
    ]);
    return { jobs, total, page, limit };
  } catch (err) {
    console.error("[getJobs] error:", err);
    return { jobs: [], total: 0, page, limit };
  }
}

// ─── Get single job by slug ────────────────────────────────────────────────
export async function getJobBySlug(slug: string) {
  try {
    await connectMongo();
    return Job.findOne({ slug }).lean();
  } catch (err) {
    console.error("[getJobBySlug] error:", err);
    return null;
  }
}