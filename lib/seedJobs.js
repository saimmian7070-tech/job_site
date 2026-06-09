const { connectDB } = require("./mongodb.js");
require("ts-node/register");
const Job = require("../models/Job");

async function seedJobs() {
  await connectDB();

  await Job.deleteMany({});

  await Job.insertMany([
    {
  title: "Frontend Developer",
  slug: "frontend-developer-remote-europe",
  company: { name: "TechNova" },
  location: "Remote",
  jobType: "Full-time",
  category: "it",   // ✅ ADD THIS LINE
  description: "React job",
  requirements: ["React"],
  applyUrl: "#",
  isActive: true,   // (optional but recommended)
},
  ]);

  console.log("Seeding complete");
}

module.exports = { seedJobs };