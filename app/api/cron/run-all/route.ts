import { NextResponse } from "next/server";
import { COMPANIES } from "@/app/api/cron/import-jobs/route";

const BATCH_SIZE = 254;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const base = `${url.protocol}//${url.host}`;
  const totalBatches = Math.ceil(COMPANIES.length / BATCH_SIZE);

  console.log(`[run-all] 🚀 Starting single run, ${totalBatches} batches...`);

  for (let i = 0; i < totalBatches; i++) {
    console.log(`[run-all] Batch ${i + 1}/${totalBatches}`);
    try {
      const res = await fetch(`${base}/api/cron/import-jobs?batch=${i}`, {
        signal: AbortSignal.timeout(600000),
      });
      const data = await res.json();

      if (data.paused) {
        console.log(`[run-all] ⏸ All models exhausted — waiting 60 minutes...`);
        for (let mins = 60; mins > 0; mins--) {
          console.log(`[run-all] ⏳ Resuming in ${mins} minute${mins !== 1 ? "s" : ""}...`);
          await new Promise((r) => setTimeout(r, 60000));
        }
        await fetch(`${base}/api/cron/set-model?model=gemini-2.5-flash`);
        i--;
        continue;
      }

      console.log(`[run-all] Batch ${i + 1} done — imported: ${data.imported}, updated: ${data.updated}`);
    } catch (err) {
      console.error(`[run-all] Batch ${i + 1} failed, continuing...`, err);
    }
  }

  console.log(`[run-all] ✅ All done!`);
  return NextResponse.json({ message: "All done!", totalBatches });
}