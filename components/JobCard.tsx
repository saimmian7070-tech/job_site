import Link from "next/link";

export default function JobCard({ job }: any) {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "15px"
    }}>
      <h3>{job.title}</h3>

      <p style={{ color: "gray" }}>
        {job.company?.name} • {job.location}
      </p>

      <Link href={`/jobs/${job.slug}`}>
        View Details →
      </Link>
    </div>
  );
}