import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function readN8nResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function GET(req: NextRequest) {
  const taskId =
    req.nextUrl.searchParams.get("task_id") ||
    req.nextUrl.searchParams.get("request_id");

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

    return NextResponse.json(n8nData);
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
