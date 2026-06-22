import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const runtime = "nodejs";

async function readN8nResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageEntry = formData.get("image");

    if (!(imageEntry instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Missing image file" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(imageEntry.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image type. Only JPEG, PNG, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    if (imageEntry.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    if (!process.env.N8N_CREATE_VIDEO_WEBHOOK) {
      return NextResponse.json(
        { success: false, error: "N8N create-video webhook is not configured." },
        { status: 500 }
      );
    }

    const n8nResponse = await fetch(process.env.N8N_CREATE_VIDEO_WEBHOOK, {
      method: "POST",
      body: formData,
    });

    const n8nData = await readN8nResponse(n8nResponse);

    if (!n8nResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "n8n create-video webhook request failed",
          status: n8nResponse.status,
          n8n_response: n8nData,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(n8nData);
  } catch (error) {
    console.error("Error creating video task:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
