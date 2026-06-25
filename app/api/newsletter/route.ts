import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber";
import { headers } from "next/headers";

const rateLimitMap = new Map<string, number>();

export async function POST(req: Request) {
  try {
    // ✅ FIX 3: Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") ?? "unknown";
    const attempts = rateLimitMap.get(ip) ?? 0;
    if (attempts >= 3) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    rateLimitMap.set(ip, attempts + 1);
    setTimeout(() => rateLimitMap.delete(ip), 60_000);

    const { email } = await req.json();

    // ✅ FIX 2: Strong email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await connectMongo();
    await Subscriber.findOneAndUpdate(
      { email: email.trim().toLowerCase() },
      { email: email.trim().toLowerCase() },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    // ✅ FIX 4: Log errors instead of silently swallowing
    console.error("[newsletter] subscription error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}