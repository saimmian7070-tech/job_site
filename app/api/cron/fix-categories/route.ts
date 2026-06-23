import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import { NextResponse } from "next/server";

const CATEGORY_MAP: Record<string, string> = {
  // Engineering
  "software engineer": "Engineering",
  "engineering": "Engineering",
  "dev eng": "Engineering",
  "solutions engineering": "Engineering",
  "systems engineering": "Engineering",
  "data engineering": "Engineering",
  "cloud engineering": "Engineering",
  "frontend": "Engineering",
  "backend": "Engineering",
  "fullstack": "Engineering",
  
  // Sales
  "sales": "Sales",
  "account executive": "Sales",
  "account executives": "Sales",
  "bdr": "Sales",
  "field sales": "Sales",
  "enterprise sales": "Sales",
  "mid market": "Sales",
  
  // Marketing
  "marketing": "Marketing",
  "field marketing": "Marketing",
  "corporate marketing": "Marketing",
  "growth": "Marketing",
  "gtm enablement": "Marketing",
  
  // Finance
  "finance": "Finance",
  "accounting": "Finance",
  "financial planning": "Finance",
  "finance & bizops": "Finance",
  "bizops": "Finance",
  
  // Customer
  "customer success": "Customer",
  "customer support": "Customer",
  "customer experience": "Customer",
  "support": "Customer",
  
  // Design
  "design": "Design",
  "product design": "Design",
  "ux": "Design",
  
  // Product
  "product management": "Product",
  "product": "Product",
  
  // HR
  "human resources": "HR",
  "talent acquisition": "HR",
  "people": "HR",
  
  // Legal
  "legal": "Legal",
  "compliance": "Legal",
  "legal & compliance": "Legal",
};

const JOBTYPE_MAP: Record<string, string> = {
  "full-time": "Full-Time",
  "fulltime": "Full-Time",
  "full time": "Full-Time",
  "part-time": "Part-Time",
  "contract": "Contract",
  "internship": "Internship",
  "freelance": "Freelance",
  "remote": "Remote",
};

function normalizeCategory(raw?: string): string {
  if (!raw) return "Other";
  const lower = raw.toLowerCase().trim();
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "Other";
}

function normalizeJobType(raw?: string): string {
  if (!raw) return "Full-Time";
  const lower = raw.toLowerCase().trim();
  for (const [key, value] of Object.entries(JOBTYPE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "Full-Time";
}

export async function GET() {
  const { NextResponse } = await import("next/server");
  await connectMongo();
  const jobs = await Job.find({}).lean();
  let fixed = 0;

  for (const job of jobs) {
    const category = normalizeCategory((job as any).category);
    const jobType = normalizeJobType((job as any).jobType);
    await Job.updateOne(
      { _id: job._id },
      { $set: { category, jobType } }
    );
    fixed++;
  }

  return NextResponse.json({ success: true, fixed });
}