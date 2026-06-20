import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 180;

function getSafeFileName(videoUrl: URL) {
  const pathName = videoUrl.pathname.split("/").filter(Boolean).pop();
  const rawName = pathName && pathName.includes(".") ? pathName : "betagen-video.mp4";
  const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");

  return safeName.endsWith(".mp4") ? safeName : `${safeName}.mp4`;
}

export async function GET(req: NextRequest) {
  const videoUrlParam = req.nextUrl.searchParams.get("url");

  if (!videoUrlParam) {
    return NextResponse.json(
      { success: false, error: "Missing video URL" },
      { status: 400 }
    );
  }

  let videoUrl: URL;

  try {
    videoUrl = new URL(videoUrlParam);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid video URL" },
      { status: 400 }
    );
  }

  if (!["http:", "https:"].includes(videoUrl.protocol)) {
    return NextResponse.json(
      { success: false, error: "Unsupported video URL protocol" },
      { status: 400 }
    );
  }

  const videoResponse = await fetch(videoUrl, {
    cache: "no-store",
  });

  if (!videoResponse.ok || !videoResponse.body) {
    return NextResponse.json(
      {
        success: false,
        error: "Unable to download generated video",
        status: videoResponse.status,
      },
      { status: 502 }
    );
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    videoResponse.headers.get("content-type") || "video/mp4"
  );
  headers.set(
    "Content-Disposition",
    `attachment; filename="${getSafeFileName(videoUrl)}"`
  );
  headers.set("Cache-Control", "no-store");

  const contentLength = videoResponse.headers.get("content-length");
  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new Response(videoResponse.body, {
    status: 200,
    headers,
  });
}
