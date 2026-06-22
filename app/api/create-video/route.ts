import { NextRequest, NextResponse } from "next/server";

const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;

interface ImageFormat {
  extension: "jpg" | "png" | "webp";
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}

export const runtime = "nodejs";

async function readN8nResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();

  return extension && extension !== fileName.toLowerCase() ? extension : "";
}

function getImageFormatFromTypeOrName(file: File): ImageFormat | null {
  const fileType = file.type.toLowerCase();
  const extension = getFileExtension(file.name);

  if (["image/jpeg", "image/jpg", "image/pjpeg"].includes(fileType)) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  if (["image/png", "image/x-png"].includes(fileType)) {
    return { extension: "png", mimeType: "image/png" };
  }

  if (fileType === "image/webp") {
    return { extension: "webp", mimeType: "image/webp" };
  }

  if (["jpg", "jpeg", "jfif"].includes(extension)) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  if (extension === "png") {
    return { extension: "png", mimeType: "image/png" };
  }

  if (extension === "webp") {
    return { extension: "webp", mimeType: "image/webp" };
  }

  return null;
}

async function getImageFormat(file: File): Promise<ImageFormat | null> {
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return { extension: "jpg", mimeType: "image/jpeg" };
  }

  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return { extension: "png", mimeType: "image/png" };
  }

  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return { extension: "webp", mimeType: "image/webp" };
  }

  return getImageFormatFromTypeOrName(file);
}

async function buildN8nFormData(
  formData: FormData,
  image: File,
  imageFormat: ImageFormat
) {
  const n8nFormData = new FormData();
  let hasAppendedImage = false;
  const appendNormalizedImage = async () => {
    const baseFileName =
      image.name
        .replace(/(\.(?:jpe?g|jfif|png|webp))+$/i, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-") || "upload";
    const normalizedFileName = `${baseFileName}.${imageFormat.extension}`;
    const normalizedImage = new Blob([await image.arrayBuffer()], {
      type: imageFormat.mimeType,
    });

    n8nFormData.append("image", normalizedImage, normalizedFileName);
    n8nFormData.append("original_image_name", image.name);
    n8nFormData.append("original_image_type", image.type || "");
    n8nFormData.append("normalized_image_name", normalizedFileName);
    n8nFormData.append("normalized_image_type", imageFormat.mimeType);
    hasAppendedImage = true;
  };

  for (const [key, value] of formData.entries()) {
    if (key === "image") {
      if (!hasAppendedImage) {
        await appendNormalizedImage();
      }
      continue;
    }

    n8nFormData.append(key, value);
  }

  if (!hasAppendedImage) {
    await appendNormalizedImage();
  }

  return n8nFormData;
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

    const imageFormat = await getImageFormat(imageEntry);

    if (!imageFormat) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image type. Only JPG, JPEG, PNG, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    if (imageEntry.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Image size exceeds 25MB limit." },
        { status: 400 }
      );
    }

    if (!process.env.N8N_CREATE_VIDEO_WEBHOOK) {
      return NextResponse.json(
        { success: false, error: "N8N create-video webhook is not configured." },
        { status: 500 }
      );
    }

    const n8nFormData = await buildN8nFormData(
      formData,
      imageEntry,
      imageFormat
    );

    const n8nResponse = await fetch(process.env.N8N_CREATE_VIDEO_WEBHOOK, {
      method: "POST",
      body: n8nFormData,
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
