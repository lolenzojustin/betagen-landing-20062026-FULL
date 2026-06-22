import { NextRequest, NextResponse } from "next/server";

const FREEIMAGE_UPLOAD_URL = "https://freeimage.host/api/1/upload";

export const runtime = "nodejs";

interface FreeImageUploadResponse {
  data?: {
    image?: {
      url?: string;
      display_url?: string;
      url_viewer?: string;
    };
  };
  image?: {
    url?: string;
    display_url?: string;
    url_viewer?: string;
  };
  error?: {
    code?: number;
    message?: string;
  };
  [key: string]: unknown;
}

async function readFreeImageResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getUploadedImageUrl(response: FreeImageUploadResponse) {
  return (
    response.data?.image?.url ||
    response.data?.image?.display_url ||
    response.data?.image?.url_viewer ||
    response.image?.url ||
    response.image?.display_url ||
    response.image?.url_viewer ||
    null
  );
}

export async function POST(req: NextRequest) {
  try {
    const sourceFormData = await req.formData();
    const source = sourceFormData.get("source");

    if (!(source instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Missing image file" },
        { status: 400 }
      );
    }

    if (!process.env.FREEIMAGE_API_KEY) {
      return NextResponse.json(
        { success: false, error: "FreeImage API key is not configured." },
        { status: 500 }
      );
    }

    const freeImageFormData = new FormData();
    freeImageFormData.append("key", process.env.FREEIMAGE_API_KEY);
    freeImageFormData.append("action", "upload");
    freeImageFormData.append("format", "json");
    freeImageFormData.append("source", source);

    const freeImageResponse = await fetch(FREEIMAGE_UPLOAD_URL, {
      method: "POST",
      body: freeImageFormData,
    });
    const freeImageData = await readFreeImageResponse(freeImageResponse);

    if (typeof freeImageData !== "object" || freeImageData === null) {
      return NextResponse.json(
        {
          success: false,
          error: "FreeImage returned an invalid response.",
          freeimage_response: freeImageData,
        },
        { status: 502 }
      );
    }

    const imageUrl = getUploadedImageUrl(
      freeImageData as FreeImageUploadResponse
    );

    if (!freeImageResponse.ok || !imageUrl) {
      const errorMessage =
        (freeImageData as FreeImageUploadResponse).error?.message ||
        "Unable to upload image.";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          freeimage_response: freeImageData,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      image_url: imageUrl,
      freeimage_response: freeImageData,
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
