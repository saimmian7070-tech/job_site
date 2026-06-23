import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import Settings from "@/models/Settings";

export async function GET(request: Request) {
  try {
    await connectMongo();

    const url = new URL(request.url);
    const model = url.searchParams.get("model");

    if (!model) {
      return NextResponse.json(
        { success: false, error: "Missing ?model= query param" },
        { status: 400 }
      );
    }

    const updated = await Settings.findOneAndUpdate(
      { key: "groqConfig" },
      {
        $set: {
          model,
          modelIndex: 0,
          paused: false,
          pausedReason: "",
          pausedAt: null,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Model switched to "${model}". Import will resume on the next run.`,
      settings: updated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}