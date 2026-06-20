import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const N8N_TIMEOUT_MS = 290_000;

export const runtime = "nodejs";
export const maxDuration = 300;

function findVideoUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = findVideoUrl(item);
      if (url) return url;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  const resultUrls = record.resultUrls;

  if (Array.isArray(resultUrls)) {
    const videoUrl = resultUrls.find(
      (item): item is string => typeof item === "string" && item.length > 0
    );
    if (videoUrl) return videoUrl;
  }

  for (const child of Object.values(record)) {
    const url = findVideoUrl(child);
    if (url) return url;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageEntry = formData.get("image");
    const templateId = formData.get("template_id");
    const templateVideoUrl = formData.get("template_video_url");

    if (!(imageEntry instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Missing image file" },
        { status: 400 }
      );
    }

    const image = imageEntry;

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image type. Only JPEG, PNG, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    if (!process.env.N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { success: false, error: "N8N webhook URL is not configured." },
        { status: 500 }
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const mimeType = image.type || "image/jpeg";

    const ext =
      mimeType === "image/png"
        ? "png"
        : mimeType === "image/webp"
        ? "webp"
        : "jpg";

    const safeFileName = `upload-${Date.now()}.${ext}`;

    const imageBlob = new Blob([arrayBuffer], {
      type: mimeType,
    });

    const n8nFormData = new FormData();
    n8nFormData.append("image", imageBlob, safeFileName);
    n8nFormData.append("template_id", String(templateId || ""));
    n8nFormData.append("template_video_url", String(templateVideoUrl || ""));

    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      body: n8nFormData,
      signal: AbortSignal.timeout(N8N_TIMEOUT_MS),
    });

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "n8n webhook request failed",
          status: n8nResponse.status,
        },
        { status: 502 }
      );
    }

    const n8nContentType = n8nResponse.headers.get("content-type") || "";
    const n8nData = n8nContentType.includes("application/json")
      ? await n8nResponse.json()
      : await n8nResponse.text();
    const videoUrl = findVideoUrl(n8nData);

    if (!videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "n8n response is missing resultUrls[0]",
          n8n_response: n8nData,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video created successfully",
      video_url: videoUrl,
      n8n_response: n8nData,
    });
  } catch (error) {
    console.error("Error creating video:", error);
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return NextResponse.json(
        { success: false, error: "n8n webhook request timed out" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
