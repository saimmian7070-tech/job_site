import { Fragment } from "react";
import Link from "next/link";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";
import BookmarkButton from "./BookmarkButton";

interface IJob {
  _id: string;
  title: string;
  slug: string;
  location?: string;
  jobType?: string;
  description?: string;
  salary?: string;
  postedAt?: string | Date;
  category?: string;
  company?: { name?: string };
}

export const metadata = {
  title: "Browse Jobs | JobsHome",
  description:
    "Browse the latest remote and global job listings across tech, marketing, design, finance, and more.",
};

const JOB_TYPES = [
  "All types",
  "Remote",
  "Full-Time",
  "Part-Time",
  "Contract",
  "Freelance",
  "Internship",
  "Entry Level",
];

function initials(name?: string) {
  if (!name) return "J";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_BG = [
  "#2563EB",
  "#7C3AED",
  "#0F766E",
  "#B45309",
  "#BE185D",
  "#0369A1",
];

function avatarBg(str: string) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return AVATAR_BG[sum % AVATAR_BG.length];
}

function jobTypePillStyle(type: string): {
  bg: string;
  color: string;
  border: string;
} {
  const t = type.toLowerCase();
  if (t.includes("remote"))
    return { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" };
  if (t.includes("full"))
    return { bg: "#F0FDF4", color: "#166534", border: "#BBF7D0" };
  if (t.includes("part"))
    return { bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" };
  if (t.includes("contract"))
    return { bg: "#F5F3FF", color: "#5B21B6", border: "#DDD6FE" };
  if (t.includes("freelance"))
    return { bg: "#FFF1F2", color: "#9F1239", border: "#FECDD3" };
  if (t.includes("internship"))
    return { bg: "#F0F9FF", color: "#0C4A6E", border: "#BAE6FD" };
  if (t.includes("entry"))
    return { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" };
  return { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0" };
}

function timeAgo(date: string | Date) {
  const diff = Math.floor(
    (Date.now() - new Date(date).getTime()) / 86400000
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 14) return "1 week ago";
  return `${Math.floor(diff / 7)} weeks ago`;
}

export default async function JobsPage({ searchParams }: any) {
  const params = await searchParams;
const page = Math.max(1, Number(params.page || 1));
const keyword = (params.q ?? "").trim();
const location = (params.loc ?? "").trim();
const jobType = (params.type ?? "").toLowerCase().trim();
const category = (params.cat ?? "").trim();
const limit = 20;

let jobs: IJob[] = [];
let totalJobs = 0;
let remoteCount = 0;
let engineeringCount = 0;
let todayCount = 0;
let typeCountMap: Record<string, number> = {};
let categoryCountMap: Record<string, number> = {};

try {
  await connectMongo();

  const typeCounts = await Job.aggregate([
    { $group: { _id: { $toLower: "$jobType" }, count: { $sum: 1 } } }
  ]);
  typeCounts.forEach((t: any) => { typeCountMap[t._id] = t.count; });

  const categoryCounts = await Job.aggregate([
  { $match: { category: { $exists: true, $ne: null } } },
  { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  categoryCounts.forEach((c: any) => {
    if (c._id != null) categoryCountMap[String(c._id)] = c.count;
  });

  remoteCount = await Job.countDocuments({ jobType: { $regex: "remote", $options: "i" } });
  engineeringCount = await Job.countDocuments({ category: { $regex: "engineer", $options: "i" } });
  todayCount = await Job.countDocuments({ postedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } });

  const andClauses: any[] = [];

  if (keyword) {
    andClauses.push({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { "company.name": { $regex: keyword, $options: "i" } },
      ],
    });
  }

  if (location) {
    andClauses.push({
      $or: [
        { location: { $regex: location, $options: "i" } },
        { jobType: { $regex: location, $options: "i" } },
      ],
    });
  }

  if (jobType) {
    andClauses.push({ jobType: { $regex: jobType, $options: "i" } });
  }

  if (category) {
    andClauses.push({ category: { $regex: category, $options: "i" } });
  }

  const query: any = andClauses.length > 0 ? { $and: andClauses } : {};

  totalJobs = await Job.countDocuments(query);
  const raw = await Job.find(query)
    .sort({ score: -1, postedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  jobs = raw.map((j: any) => ({ ...j, _id: j._id.toString() }));
} catch (err) {
  console.error("JobsPage DB error:", err);
}

  const totalPages = Math.max(1, Math.ceil(totalJobs / limit));
  const from = totalJobs === 0 ? 0 : (page - 1) * limit + 1;
  const to = from + jobs.length - 1;

  const activeFilters: { label: string; removeKey: string }[] = [];
if (keyword) activeFilters.push({ label: `"${keyword}"`, removeKey: "q" });
if (location) activeFilters.push({ label: location, removeKey: "loc" });
if (jobType) activeFilters.push({ label: jobType.charAt(0).toUpperCase() + jobType.slice(1), removeKey: "type" });
if (category) activeFilters.push({ label: category, removeKey: "cat" });
  function removeFilterHref(key: string) {
  const p = new URLSearchParams();
  if (key !== "q" && keyword) p.set("q", keyword);
  if (key !== "loc" && location) p.set("loc", location);
  if (key !== "type" && jobType) p.set("type", jobType);
  if (key !== "cat" && category) p.set("cat", category);
  const qs = p.toString();
  return `/jobs${qs ? `?${qs}` : ""}`;
}

function pageHref(p: number) {
  const pr = new URLSearchParams();
  if (keyword) pr.set("q", keyword);
  if (location) pr.set("loc", location);
  if (jobType) pr.set("type", jobType);
  if (category) pr.set("cat", category);
  if (p > 1) pr.set("page", String(p));
  const qs = pr.toString();
  return `/jobs${qs ? `?${qs}` : ""}`;
}

  function typeHref(t: string) {
    const p = new URLSearchParams();
    if (keyword) p.set("q", keyword);
    if (location) p.set("loc", location);
    if (t !== "All types") {
      const lc = t.toLowerCase();
      if (lc !== jobType) p.set("type", lc);
    }
    const qs = p.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  }

  const pageNums: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1);
    if (page > 3) pageNums.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pageNums.push(i);
    if (page < totalPages - 2) pageNums.push("…");
    pageNums.push(totalPages);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F2F5",
        fontFamily:
          '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Global hover styles for job cards — no client JS needed */}
      <style>{`
        .job-card:hover { border-color: #BFDBFE !important; box-shadow: 0 2px 8px rgba(37,99,235,0.07) !important; }
        .job-card--featured:hover { border-color: #93C5FD !important; }
        summary { list-style: none; }
        summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* ── HERO / SEARCH BAR ───────────────────────────────────────── */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "36px 24px 0",
          }}
        >
          {/* Top row: heading + KPI stats */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
              marginBottom: 20,
              flexWrap: "wrap",
            }}
          >
            {/* Heading block */}
            <div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: "#111827",
                  letterSpacing: "-0.5px",
                  margin: "0 0 6px",
                  lineHeight: 1.2,
                }}
              >
                Find your next role.
              </h1>
              <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
                {totalJobs > 0
                  ? `${(Math.floor(totalJobs / 100) * 100).toLocaleString()}+ open positions across tech, design, marketing, finance and more.`
                  : "Remote and global opportunities across every industry — apply in one click."}
                  

              </p>
            </div>

            {/* KPI stats */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexShrink: 0,
              }}
            >
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#111827",
                    margin: "0 0 2px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  
                  {remoteCount} 
                
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#9CA3AF",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Remote roles
                </p>
              </div>
              <div
                style={{
                  width: 1,
                  height: 32,
                  background: "#E5E7EB",
                }}
              />
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#111827",
                    margin: "0 0 2px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {engineeringCount}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#9CA3AF",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Engineering
                </p>
              </div>
              <div
                style={{
                  width: 1,
                  height: 32,
                  background: "#E5E7EB",
                }}
              />
              <div style={{ textAlign: "right" }}>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#16A34A",
                    margin: "0 0 2px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  +{todayCount}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#9CA3AF",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Added today
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <form
            method="GET"
            action="/jobs"
            style={{
              display: "flex",
              border: "1.5px solid #E5E7EB",
              borderRadius: 10,
              overflow: "hidden",
              background: "#FFFFFF",
            }}
          >
            {/* Keyword input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
                padding: "0 16px",
                borderRight: "1px solid #E5E7EB",
              }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#9CA3AF"
                strokeWidth={2}
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={keyword}
                placeholder="Job title, keyword, or company"
                aria-label="Search by job title, keyword, or company"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "#111827",
                  background: "transparent",
                  padding: "14px 0",
                }}
              />
              {keyword && (
                <a
                  href={removeFilterHref("q")}
                  aria-label="Clear keyword filter"
                  style={{ color: "#D1D5DB", textDecoration: "none" }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </a>
              )}
            </div>

            {/* Location input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flex: 1,
                padding: "0 16px",
                borderRight: "1px solid #E5E7EB",
              }}
            >
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#9CA3AF"
                strokeWidth={2}
                style={{ flexShrink: 0 }}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="text"
                name="loc"
                defaultValue={location}
                placeholder="City, country, or Remote"
                aria-label="Search by location"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: 13,
                  color: "#111827",
                  background: "transparent",
                  padding: "14px 0",
                }}
              />
              {location && (
                <a
                  href={removeFilterHref("loc")}
                  aria-label="Clear location filter"
                  style={{ color: "#D1D5DB", textDecoration: "none" }}
                >
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </a>
              )}
            </div>

            {jobType && <input type="hidden" name="type" value={jobType} />}

            <button
              type="submit"
              style={{
                padding: "0 28px",
                background: "#2563EB",
                color: "#FFFFFF",
                border: "none",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 7,
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              Search
            </button>
          </form>

          {/* Filter tab bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid #E5E7EB",
              overflowX: "auto",
              flexWrap: "nowrap",
            }}
            role="tablist"
            aria-label="Filter by job type"
          >
            {JOB_TYPES.map((t) => {
              const isAll = t === "All types";
              const isActive = isAll
                ? !jobType
                : t.toLowerCase() === jobType;
              return (
                <Link
                  key={t}
                  href={typeHref(t)}
                  role="tab"
                  aria-selected={isActive}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px 8px 0 0",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#2563EB" : "#6B7280",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    borderBottom: isActive
                      ? "2px solid #2563EB"
                      : "2px solid transparent",
                    marginBottom: -1,
                    transition: "color 0.15s",
                  }}
                >
                  {t}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "28px 24px",
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        {/* ── SIDEBAR ─────────────────────────────────────────────── */}
        <aside
          aria-label="Job filters"
          style={{
            width: 212,
            flexShrink: 0,
            position: "sticky",
            top: 76,
            display: "none",
          }}
          className="lg-sidebar"
        >
          <style>{`
            @media (min-width: 1024px) { .lg-sidebar { display: block !important; } }
          `}</style>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {/* Job Type */}
            <details open>
              <summary
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #F3F4F6",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  userSelect: "none",
                }}
              >
                Job Type
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#9CA3AF"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div style={{ padding: "10px 16px 14px" }}>
                {[
                  { label: "Full-Time",  count: typeCountMap["full-time"]  ?? 0 },
                  { label: "Remote",     count: typeCountMap["remote"]     ?? 0 },
                  { label: "Part-Time",  count: typeCountMap["part-time"]  ?? 0 },
                  { label: "Contract",   count: typeCountMap["contract"]   ?? 0 },
                  { label: "Internship", count: typeCountMap["internship"] ?? 0 },
                ].map((item) => {
                  const isChecked = item.label.toLowerCase() === jobType;
                  return (
                    <Link
                      key={item.label}
                      href={typeHref(item.label)}
                      aria-pressed={isChecked}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <div
                          aria-hidden="true"
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 4,
                            border: isChecked
                              ? "1.5px solid #2563EB"
                              : "1.5px solid #D1D5DB",
                            background: isChecked ? "#2563EB" : "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {isChecked && (
                            <svg
                              width="9"
                              height="9"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="#FFFFFF"
                              strokeWidth={3}
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: 13,
                            color: isChecked ? "#1D4ED8" : "#4B5563",
                            fontWeight: isChecked ? 600 : 400,
                          }}
                        >
                          {item.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#9CA3AF",
                          background: "#F9FAFB",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                      >
                        {item.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </details>

            {/* Category */}
            <details open style={{ borderTop: "1px solid #F3F4F6" }}>
              <summary
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #F3F4F6",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  cursor: "pointer",
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  userSelect: "none",
                }}
              >
                Category
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#9CA3AF"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div style={{ padding: "10px 16px 14px" }}>
                {[
                  { label: "Engineering", count: Object.entries(categoryCountMap).filter(([k]) => k != null && /engineer/i.test(k)).reduce((s,[,v]) => s+v, 0) },
                  { label: "Sales",       count: Object.entries(categoryCountMap).filter(([k]) => k != null && /sales/i.test(k)).reduce((s,[,v]) => s+v, 0) },
                  { label: "Design",      count: Object.entries(categoryCountMap).filter(([k]) => k != null && /design/i.test(k)).reduce((s,[,v]) => s+v, 0) },
                  { label: "Marketing",   count: Object.entries(categoryCountMap).filter(([k]) => k != null && /market/i.test(k)).reduce((s,[,v]) => s+v, 0) },
                  { label: "Finance",     count: Object.entries(categoryCountMap).filter(([k]) => k != null && /financ|account/i.test(k)).reduce((s,[,v]) => s+v, 0) },
                  { label: "Customer",    count: Object.entries(categoryCountMap).filter(([k]) => k != null && /customer|support/i.test(k)).reduce((s,[,v]) => s+v, 0) },
                    ].map((item) => {
                  const isChecked = item.label.toLowerCase() === category.toLowerCase();
                  const href = (() => {
                    const p = new URLSearchParams();
                    if (keyword) p.set("q", keyword);
                    if (location) p.set("loc", location);
                    if (jobType) p.set("type", jobType);
                    if (!isChecked) p.set("cat", item.label);
                    return `/jobs${p.toString() ? `?${p.toString()}` : ""}`;
                  })();
                  return (
                    <Link key={item.label} href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0", textDecoration: "none", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                        <div aria-hidden="true" style={{ width: 15, height: 15, borderRadius: 4, border: isChecked ? "1.5px solid #2563EB" : "1.5px solid #D1D5DB", background: isChecked ? "#2563EB" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isChecked && (
                            <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: 13, color: isChecked ? "#1D4ED8" : "#4B5563", fontWeight: isChecked ? 600 : 400 }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "#9CA3AF", background: "#F9FAFB", padding: "2px 6px", borderRadius: 4 }}>{item.count}</span>
                    </Link>
                  );
                })}
                </div>
                </details>
              </div>
            </aside>

        {/* ── MAIN FEED ──────────────────────────────────────────────── */}
        <main aria-label="Job listings" style={{ flex: 1, minWidth: 0 }}>
          {process.env.NODE_ENV === "development" && (
          <div style={{
            marginBottom: 16,
            padding: "12px 16px",
            background: "#0F172A",
            borderRadius: 10,
            border: "1px solid #334155",
            fontFamily: "monospace",
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              🛠 Dev — categoryCountMap keys
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(categoryCountMap).map(([k, v]) => (
                <span key={k} style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  background: "#1E293B",
                  color: "#7DD3FC",
                  border: "1px solid #334155",
                  borderRadius: 5,
                  padding: "3px 8px",
                }}>
                  {k} <span style={{ color: "#64748B" }}>·</span> <span style={{ color: "#86EFAC" }}>{v}</span>
                </span>
              ))}
            </div>
          </div>
        )}
          {/* Result count + sort + active filters */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {totalJobs > 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "#6B7280",
                    margin: 0,
                  }}
                >
                  {/* <span style={{ fontSize: 15, fontWeight: 700, color: "#2563EB" }}>
                    {(Math.floor(totalJobs / 100) * 100).toLocaleString()}+
                  </span>{" "}
                  jobs found */}

                  <span style={{ fontSize: 15, fontWeight: 700, color: "#2563EB" }}>
                {(Math.floor(totalJobs / 100) * 100).toLocaleString()}+
                </span>{" "}
                jobs found


                  {totalPages > 1 && (
                    <span style={{ color: "#9CA3AF", marginLeft: 6 }}>
                      · showing {from}–{to}
                    </span>
                  )}
                </p>
              ) : (
                <p
                  style={{ fontSize: 13, color: "#6B7280", margin: 0 }}
                >
                  No jobs found
                </p>
              )}

              {activeFilters.map((f) => (
                <Link
                  key={f.removeKey}
                  href={removeFilterHref(f.removeKey)}
                  aria-label={`Remove filter ${f.label}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 20,
                    textDecoration: "none",
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    color: "#1D4ED8",
                  }}
                >
                  {f.label}
                  <svg
                    width="10"
                    height="10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Link>
              ))}

              {activeFilters.length > 1 && (
                <Link
                  href="/jobs"
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    textDecoration: "underline",
                    fontWeight: 600,
                  }}
                >
                  Clear all
                </Link>
              )}
            </div>

            {/* Sort */}
            <select
              aria-label="Sort jobs by"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                border: "1px solid #E5E7EB",
                borderRadius: 7,
                padding: "6px 10px",
                background: "#FFFFFF",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option>Most recent</option>
              <option>Most relevant</option>
              <option>Salary: high to low</option>
            </select>
          </div>

          {/* Empty state */}
          {jobs.length === 0 ? (
            <div
              style={{
                padding: "80px 24px",
                textAlign: "center",
                background: "#FFFFFF",
                borderRadius: 10,
                border: "1px solid #E5E7EB",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 10,
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                }}
                aria-hidden="true"
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#D1D5DB"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
                  />
                </svg>
              </div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#374151",
                  margin: "0 0 6px",
                }}
              >
                No matching jobs found
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "#9CA3AF",
                  margin: "0 0 20px",
                  maxWidth: 280,
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: 1.6,
                }}
              >
                {activeFilters.length > 0
                  ? "Try adjusting your search terms or removing some filters."
                  : "New roles are added daily — check back soon."}
              </p>
              {activeFilters.length > 0 && (
                <Link
                  href="/jobs"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 18px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#FFFFFF",
                    textDecoration: "none",
                    background: "#2563EB",
                  }}
                >
                  Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {jobs.map((job, index) => {
                const name = job.company?.name;
                const avatar = initials(name);
                const bg = avatarBg(job._id);
                const pill = job.jobType
                  ? jobTypePillStyle(job.jobType)
                  : null;
                const daysSincePosted = job.postedAt
                  ? Math.floor(
                      (Date.now() - new Date(job.postedAt).getTime()) /
                        86400000
                    )
                  : 999;
                const isNew = daysSincePosted === 0;
                const isFeatured = index % 7 === 3; // Example: every 7th card is "featured"

                return (
                  <Fragment key={job._id}>
                    <article
                      aria-label={`${job.title} at ${name ?? "unknown company"}`}
                      style={{ position: "relative" }}
                    >
                      <Link
                        href={`/jobs/${job.slug ?? "#"}`}
                        className={isFeatured ? "job-card job-card--featured" : "job-card"}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 14,
                          background: isFeatured ? "#FAFBFF" : "#FFFFFF",
                          borderRadius: 10,
                          padding: "16px 18px",
                          border: `1px solid ${isFeatured ? "#DBEAFE" : "#E5E7EB"}`,
                          textDecoration: "none",
                          transition:
                            "border-color 0.15s, box-shadow 0.15s",
                        }}
                      >
                        {/* Company logo / initials */}
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${(name ?? "company").toLowerCase().replace(/\s+/g, "")}.com&sz=64`}
                          alt={name ?? ""}
                          style={{
                            width: 40,
                            height: 40,
                            objectFit: "contain",
                            borderRadius: 8,
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        />                        
                        
                        {/* Card body */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Top row */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              justifyContent: "space-between",
                              gap: 10,
                              marginBottom: 10,
                              flexWrap: "wrap",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 7,
                                  flexWrap: "wrap",
                                  marginBottom: 2,
                                }}
                              >
                                <h2
                                  style={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "#111827",
                                    margin: 0,
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {job.title}
                                </h2>
                                {isFeatured && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.06em",
                                      color: "#92400E",
                                      background: "#FEF3C7",
                                      border: "1px solid #FDE68A",
                                      padding: "2px 7px",
                                      borderRadius: 4,
                                    }}
                                  >
                                    Featured
                                  </span>
                                )}
                                {isNew && !isFeatured && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 700,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.06em",
                                      color: "#166534",
                                      background: "#DCFCE7",
                                      border: "1px solid #BBF7D0",
                                      padding: "2px 7px",
                                      borderRadius: 4,
                                    }}
                                  >
                                    New today
                                  </span>
                                )}
                              </div>
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#6B7280",
                                  margin: 0,
                                  fontWeight: 500,
                                }}
                              >
                                {name ?? "Company not listed"}
                              </p>
                            </div>

                            {/* Location + type badges */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                                flexWrap: "wrap",
                                flexShrink: 1,
                                minWidth: 0,
                              }}
                            >
                              {job.location && (
                                <span style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                  padding: "4px 9px",
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 500,
                                  color: "#6B7280",
                                  background: "#F9FAFB",
                                  border: "1px solid #E5E7EB",
                                  whiteSpace: "nowrap",
                                }}>
                                  <svg
                                    width="10"
                                    height="10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="#9CA3AF"
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  {job.location}
                                </span>
                              )}
                              {job.jobType && pill && (
                                <span
                                  style={{
                                    padding: "4px 9px",
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    whiteSpace: "nowrap",
                                    background: pill.bg,
                                    color: pill.color,
                                    border: `1px solid ${pill.border}`,
                                  }}
                                >
                                  {job.jobType}
                                </span>
                              )}
                              {job.salary && (
                              <span style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 9px",
                                borderRadius: 6,
                                fontSize: 11,
                                fontWeight: 700,
                                background: "#F0FDF4",
                                color: "#166534",
                                border: "1px solid #BBF7D0",
                                whiteSpace: "nowrap",
                                flexShrink: 1,
                              }}>
                                💰 {job.salary.replace(/\s*(per year|\/yr|\/year|annually)/gi, "").trim()}
                              </span>
                            )}
                            </div>
                          </div>

                          {/* Footer row */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 8,
                              paddingTop: 10,
                              borderTop: "1px solid #F3F4F6",
                              flexWrap: "wrap",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              {job.postedAt && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    fontSize: 11,
                                    color: "#9CA3AF",
                                  }}
                                >
                                  <svg
                                    width="11"
                                    height="11"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  {timeAgo(job.postedAt)}
                                </span>
                              )}
                              {job.category && (
                                <>
                                  <span
                                    style={{
                                      color: "#E5E7EB",
                                      fontSize: 12,
                                    }}
                                    aria-hidden="true"
                                  >
                                    ·
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "#9CA3AF",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {job.category}
                                  </span>
                                </>
                              )}
                            </div>

                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#2563EB",
                              }}
                            >
                              Apply →
                            </span>
                          </div>
                        </div>

                        {/* Bookmark icon — toggle handled by BookmarkButton client component */}
                        <BookmarkButton jobId={job._id} title={job.title} />
                      </Link>
                    </article>
                  </Fragment>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                marginTop: 36,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <nav
                aria-label="Pagination"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {page > 1 ? (
                  <Link
                    href={pageHref(page - 1)}
                    aria-label="Previous page"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 13px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#4B5563",
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Prev
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 13px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#D1D5DB",
                      background: "#FAFAFA",
                      border: "1px solid #F3F4F6",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Prev
                  </span>
                )}

                {pageNums.map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`ellipsis-${i}`}
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "#9CA3AF",
                        userSelect: "none",
                      }}
                    >
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={pageHref(p as number)}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? "page" : undefined}
                      style={{
                        width: 34,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: "none",
                        background:
                          p === page ? "#2563EB" : "#FFFFFF",
                        color: p === page ? "#FFFFFF" : "#4B5563",
                        border:
                          p === page
                            ? "1px solid #2563EB"
                            : "1px solid #E5E7EB",
                      }}
                    >
                      {p}
                    </Link>
                  )
                )}

                {page < totalPages ? (
                  <Link
                    href={pageHref(page + 1)}
                    aria-label="Next page"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 13px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#4B5563",
                      background: "#FFFFFF",
                      border: "1px solid #E5E7EB",
                      textDecoration: "none",
                    }}
                  >
                    Next
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                ) : (
                  <span
                    aria-disabled="true"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "7px 13px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#D1D5DB",
                      background: "#FAFAFA",
                      border: "1px solid #F3F4F6",
                    }}
                  >
                    Next
                    <svg
                      width="12"
                      height="12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                )}
              </nav>

              <p
                style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}
                aria-live="polite"
              >
                Page{" "}
                <span style={{ fontWeight: 600, color: "#4B5563" }}>
                  {page}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: 600, color: "#4B5563" }}>
                  {totalPages}
                </span>
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}