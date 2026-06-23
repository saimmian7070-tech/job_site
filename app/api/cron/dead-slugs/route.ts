import { NextResponse } from "next/server";
import { COMPANIES } from "@/app/api/cron/import-jobs/route";

async function checkCompany(company: typeof COMPANIES[number]): Promise<string | null> {
  let url: string;

  switch (company.ats) {
    case "greenhouse":
      url = `https://boards-api.greenhouse.io/v1/boards/${company.slug}/jobs`;
      break;
    case "lever":
      url = `https://api.lever.co/v0/postings/${company.slug}?mode=json`;
      break;
    case "ashby":
      url = `https://api.ashbyhq.com/posting-api/job-board/${company.slug}`;
      break;
    default:
      // workday, icims, taleo, usajobs, crossover, toptal, shortcut, zendesk
      // have no free public API — skip dead-slug check
      return null;
  }

  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    let count = 0;
    if (company.ats === "greenhouse") count = data?.jobs?.length ?? 0;
    else if (company.ats === "lever") count = Array.isArray(data) ? data.length : 0;
    else if (company.ats === "ashby") count = data?.results?.length ?? 0;
    return count === 0 ? company.slug : null;
  } catch {
    return company.slug;
  }
}

export async function GET() {
  const BATCH_SIZE = 10;
  const dead: string[] = [];

  for (let i = 0; i < COMPANIES.length; i += BATCH_SIZE) {
    const batch = COMPANIES.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(checkCompany));
    dead.push(...results.filter(Boolean) as string[]);
  }

  return NextResponse.json({ dead, count: dead.length });
}