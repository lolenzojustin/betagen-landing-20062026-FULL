import { NextRequest, NextResponse } from "next/server";
import { refreshVideoLock, releaseVideoLock } from "@/lib/video-lock.server";
import {
  checkN8nVideoStatus,
  getStoredVideoResult,
  isTerminalVideoResult,
  normalizeN8nResponse,
  saveStoredVideoResult,
  type StoredVideoResult,
} from "@/lib/video-result.server";

export const runtime = "nodejs";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(req: NextRequest) {
  const taskId =
    req.nextUrl.searchParams.get("task_id") ||
    req.nextUrl.searchParams.get("request_id");
  const lockId = req.nextUrl.searchParams.get("lock_id");

  if (!taskId) {
    return NextResponse.json(
      { success: false, error: "Missing task_id" },
      { status: 400 }
    );
  }

  if (!process.env.N8N_CHECK_VIDEO_WEBHOOK) {
    return NextResponse.json(
      { success: false, error: "N8N check-video webhook is not configured." },
      { status: 500 }
    );
  }

  try {
    const storedResult = await getStoredVideoResult(taskId);

    if (storedResult && isTerminalVideoResult(storedResult)) {
      return NextResponse.json(storedResult);
    }

    if (lockId) {
      try {
        await refreshVideoLock(lockId);
      } catch (error) {
        console.warn("Unable to refresh video lock before checking:", error);
      }
    }

    const n8nData = await checkN8nVideoStatus(taskId);
    const normalizedResult = normalizeN8nResponse(n8nData);
    const responseResult = isRecord(normalizedResult)
      ? (() => {
          const normalizedVideoUrl =
            typeof normalizedResult.video_url === "string"
              ? normalizedResult.video_url
              : undefined;
          const normalizedStatus =
            typeof normalizedResult.status === "string"
              ? normalizedResult.status.toUpperCase()
              : normalizedVideoUrl
                ? "COMPLETED"
                : "PROCESSING";

          return {
            ...normalizedResult,
            success: normalizedResult.success !== false,
            task_id: taskId,
            ...(lockId ? { lock_id: lockId } : {}),
            status: normalizedStatus,
            updated_at: Date.now(),
            n8n_response: n8nData,
          } satisfies StoredVideoResult;
        })()
      : normalizedResult;

    if (isRecord(responseResult)) {
      const storedVideoResult = responseResult as StoredVideoResult;
      await saveStoredVideoResult(storedVideoResult);

      if (lockId && isTerminalVideoResult(storedVideoResult)) {
        await releaseVideoLock(lockId);
      }
    }

    return NextResponse.json(responseResult);
  } catch (error) {
    console.error("Error checking video task:", error);

    return NextResponse.json(
      {
        success: false,
        task_id: taskId,
        status: "error",
        video_url: "",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
