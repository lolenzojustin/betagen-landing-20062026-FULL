import { NextRequest, NextResponse } from "next/server";
import { refreshVideoLock } from "@/lib/video-lock.server";

export const runtime = "nodejs";

async function readN8nResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNestedVideoUrl(value: Record<string, unknown>) {
  const videoUrl = value.video_url;
  if (typeof videoUrl === "string") {
    return videoUrl;
  }

  const video = value.video;
  if (!isRecord(video)) {
    return undefined;
  }

  const url = video.url;
  return typeof url === "string" ? url : undefined;
}

function normalizeVideoResult(value: Record<string, unknown>, raw?: unknown) {
  const videoUrl = getNestedVideoUrl(value);

  return {
    ...value,
    ...(videoUrl ? { video_url: videoUrl } : {}),
    ...(raw ? { n8n_response: raw } : {}),
  };
}

function normalizeN8nResponse(value: unknown) {
  if (isRecord(value)) {
    return normalizeVideoResult(value);
  }

  if (Array.isArray(value)) {
    const firstItem = value[0];
    return isRecord(firstItem) ? normalizeVideoResult(firstItem, value) : value;
  }

  return value;
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
    if (lockId) {
      try {
        await refreshVideoLock(lockId);
      } catch (error) {
        console.warn("Unable to refresh video lock before checking:", error);
      }
    }

    const n8nResponse = await fetch(process.env.N8N_CHECK_VIDEO_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ request_id: taskId }),
      cache: "no-store",
    });
    const n8nData = await readN8nResponse(n8nResponse);

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          task_id: taskId,
          status: "error",
          video_url: "",
          error: "n8n check-video webhook request failed",
          n8n_status: n8nResponse.status,
          n8n_response: n8nData,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(normalizeN8nResponse(n8nData));
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
