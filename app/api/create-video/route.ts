import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface CreateVideoRequestBody {
  image_url?: unknown;
  [key: string]: unknown;
}

async function readN8nResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export async function POST(req: NextRequest) {
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

    const n8nResponse = await fetch(process.env.N8N_CREATE_VIDEO_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl }),
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
