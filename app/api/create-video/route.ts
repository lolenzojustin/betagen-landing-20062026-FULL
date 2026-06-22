import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/x-png",
  "image/webp",
];
const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "jfif", "png", "webp"];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

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

function getNormalizedImageMimeType(file: File) {
  const fileType = file.type.toLowerCase();
  const extension = getFileExtension(file.name);

  if (["image/jpeg", "image/jpg", "image/pjpeg"].includes(fileType)) {
    return "image/jpeg";
  }

  if (["image/png", "image/x-png"].includes(fileType)) {
    return "image/png";
  }

  if (fileType === "image/webp") {
    return "image/webp";
  }

  if (["jpg", "jpeg", "jfif"].includes(extension)) {
    return "image/jpeg";
  }

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  return null;
}

async function buildN8nFormData(formData: FormData, image: File) {
  const n8nFormData = new FormData();
  const normalizedMimeType = getNormalizedImageMimeType(image);
  let hasAppendedImage = false;
  const appendNormalizedImage = async () => {
    const extension = getFileExtension(image.name);
    const safeExtension = ALLOWED_IMAGE_EXTENSIONS.includes(extension)
      ? extension
      : normalizedMimeType === "image/png"
      ? "png"
      : normalizedMimeType === "image/webp"
      ? "webp"
      : "jpg";
    const safeFileName =
      image.name.replace(/[^a-zA-Z0-9._-]/g, "-") || `upload.${safeExtension}`;
    const normalizedFileName = safeFileName.includes(".")
      ? safeFileName
      : `${safeFileName}.${safeExtension}`;

    const normalizedImage = new File(
      [await image.arrayBuffer()],
      normalizedFileName,
      {
        type: normalizedMimeType || image.type || "image/jpeg",
      }
    );

    n8nFormData.append("image", normalizedImage);
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

    const normalizedMimeType = getNormalizedImageMimeType(imageEntry);

    if (
      !normalizedMimeType ||
      (imageEntry.type &&
        !ALLOWED_IMAGE_TYPES.includes(imageEntry.type.toLowerCase()))
    ) {
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

    const n8nFormData = await buildN8nFormData(formData, imageEntry);

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
