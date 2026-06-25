import { NextRequest, NextResponse } from "next/server";
import { releaseVideoLock } from "@/lib/video-lock.server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { lock_id?: unknown };

    if (typeof body.lock_id !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing lock_id" },
        { status: 400 }
      );
    }

    await releaseVideoLock(body.lock_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error releasing video lock:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
