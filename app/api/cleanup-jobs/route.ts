import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Job from "@/models/Job";

function cleanText(text: string): string {
  if (!text) return text;
  return text
    .replace(/\u2019/g, "'")   // right single quotation mark ' 
    .replace(/\u2018/g, "'")   // left single quotation mark '
    .replace(/\u201C/g, '"')   // left double quotation mark "
    .replace(/\u201D/g, '"')   // right double quotation mark "
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')  // remove emojis
    .replace(/[^\x00-\x7F\u00C0-\u024F\u0600-\u06FF]/g, '')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g,  '"')
    .replace(/â€¦/g, '…')
    .replace(/â€"/g, '–')
    .replace(/â€"/g, '—')
    .replace(/Ã©/g,  'é')
    .replace(/Ã¨/g,  'è')
    .replace(/Ã /g,  'à')
    .replace(/Ã¼/g,  'ü')
    .replace(/Ã¶/g,  'ö')
    .replace(/Ã¤/g,  'ä')
    .replace(/Ã/g,   'À')
    .replace(/â/g, "'")
    .replace(/#[A-Za-z0-9+/=]{10,}/g, '')
    .replace(/Please mention the word[\s\S]*?see they're human\./g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function GET() {
  try {
    await connectMongo();

    const jobs = await Job.find({ source: "remoteok" }).lean();
    let fixed = 0;

    for (const job of jobs) {
      const cleanedDescription = cleanText((job as any).description ?? "");
      const cleanedContent     = cleanText((job as any).content ?? "");

      await Job.updateOne(
        { _id: (job as any)._id },
        { $set: { description: cleanedDescription, content: cleanedContent } }
      );
      fixed++;
    }

    return NextResponse.json({ success: true, fixed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}