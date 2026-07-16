import { after, NextRequest, NextResponse } from "next/server";
import { runVideoPollingStep } from "@/lib/video-result.server";

export const runtime = "nodejs";
export const maxDuration = 60;

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getOptionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const taskId = getOptionalString(body.task_id);
  const lockId = getOptionalString(body.lock_id);
  const createdAt = getOptionalNumber(body.created_at);
  const attempts = getOptionalNumber(body.attempts) ?? 0;
  const delayMs = getOptionalNumber(body.delay_ms) ?? 20_000;

  if (!taskId || !createdAt) {
    return NextResponse.json(
      { success: false, error: "Missing task_id or created_at" },
      { status: 400 }
    );
  }

  const origin = req.nextUrl.origin;

  after(async () => {
    await runVideoPollingStep({
      taskId,
      lockId,
      origin,
      createdAt,
      attempts,
      delayMs,
    });
  });

  return NextResponse.json({ success: true });
}
