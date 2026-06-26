import Link from "next/link";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";

export const metadata = {
  title: "Browse Jobs by Location | JobsHome",
  description:
    "Browse jobs by location. Find remote and local jobs across countries and cities.",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default async function LocationsPage() {
  await connectMongo();

  const jobs = await Job.find(
    { location: { $exists: true, $ne: "" } },
    { location: 1 }
  ).lean();

  const counts: Record<string, number> = {};

  jobs.forEach((job: any) => {
    if (!job.location) return;

    job.location
      .split(";")
      .map((l: string) => l.trim())
      .filter(Boolean)
      .forEach((loc: string) => {
        counts[loc] = (counts[loc] || 0) + 1;
      });
  });

  const locations = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Browse Jobs by Location
        </h1>

        <p className="text-gray-600 mb-10">
          Explore jobs available in different cities, countries and remote
          locations.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map(([location, count]) => (
            <Link
              key={location}
              href={`/locations/${slugify(location)}`}
              className="border rounded-xl p-5 hover:border-blue-500 hover:shadow transition"
            >
              <div className="font-semibold text-gray-900">{location}</div>

              <div className="text-sm text-gray-500 mt-1">
                {count} {count === 1 ? "job" : "jobs"}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}