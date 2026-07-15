import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import {
  acquireVideoLock,
  isVideoLockConfigured,
  releaseVideoLock,
} from "@/lib/video-lock.server";
import { pollVideoResultInBackground } from "@/lib/video-result.server";

export const runtime = "nodejs";
export const maxDuration = 300;
const CREATE_VIDEO_SYSTEM_ERROR =
  "Hệ thống đang nâng cấp, xin vui lòng thử lại sau";
const VIDEO_START_COOLDOWN_MESSAGE =
  "Hệ thống đang tạo video cho một khách khác. Bạn vui lòng chờ khoảng 1 phút rồi bấm tạo lại nhé.";

interface CreateVideoRequestBody {
  image_url?: unknown;
  [key: string]: unknown;
}

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

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getCreateVideoResult(value: unknown) {
  if (isRecord(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    const firstItem = value[0];
    return isRecord(firstItem) ? firstItem : undefined;
  }

  return undefined;
}

export async function POST(req: NextRequest) {
  let lockOwnerId: string | undefined;

  try {
    const body = (await req.json()) as CreateVideoRequestBody;
    const imageUrl = getOptionalString(body.image_url);

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "Missing image_url" },
        { status: 400 }
      );
    }

    if (!process.env.N8N_CREATE_VIDEO_WEBHOOK) {
      return NextResponse.json(
        { success: false, error: "N8N create-video webhook is not configured." },
        { status: 500 }
      );
    }

    if (!isVideoLockConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Video lock storage is not configured.",
        },
        { status: 500 }
      );
    }

    const lock = await acquireVideoLock();

    if (!lock.acquired) {
      return NextResponse.json(
        {
          success: false,
          status: "busy",
          error: VIDEO_START_COOLDOWN_MESSAGE,
        },
        { status: 409 }
      );
    }

    lockOwnerId = lock.ownerId;

    const n8nResponse = await fetch(process.env.N8N_CREATE_VIDEO_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...body, image_url: imageUrl }),
    });

    const n8nData = await readN8nResponse(n8nResponse);

    if (!n8nResponse.ok) {
      if (lockOwnerId) {
        await releaseVideoLock(lockOwnerId, { clearCooldown: true });
        lockOwnerId = undefined;
      }

      return NextResponse.json(
        {
          success: false,
          error: CREATE_VIDEO_SYSTEM_ERROR,
          code: "create_video_system_error",
          status: n8nResponse.status,
          n8n_response: n8nData,
        },
        { status: 502 }
      );
    }

    const createVideoResult = getCreateVideoResult(n8nData);

    if (createVideoResult) {
      const requestId = getOptionalString(createVideoResult.request_id);

      if (requestId) {
        after(async () => {
          await pollVideoResultInBackground({
            taskId: requestId,
            lockId: lockOwnerId,
          });
        });

        return NextResponse.json({
          ...createVideoResult,
          success: true,
          task_id: requestId,
          lock_id: lockOwnerId,
          status: getOptionalString(createVideoResult.status) || "processing",
          n8n_response: n8nData,
        });
      }
    }

    if (lockOwnerId) {
      await releaseVideoLock(lockOwnerId, { clearCooldown: true });
      lockOwnerId = undefined;
    }

    return NextResponse.json(n8nData);
  } catch (error) {
    console.error("Error creating video task:", error);

    if (lockOwnerId) {
      await releaseVideoLock(lockOwnerId, { clearCooldown: true });
    }

    return NextResponse.json(
      {
        success: false,
        error: CREATE_VIDEO_SYSTEM_ERROR,
        code: "create_video_system_error",
      },
      { status: 500 }
    );
  }
}
