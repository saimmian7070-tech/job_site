import  connectMongo  from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET() {
  await connectMongo();
  const jobs = await Job.find().sort({ createdAt: -1 });
  return Response.json(jobs);
}

export async function POST(req: Request) {
  await connectMongo();
  const data = await req.json();

  const job = await Job.create(data);
  return Response.json(job);
}