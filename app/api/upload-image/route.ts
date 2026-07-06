import { NextRequest, NextResponse } from "next/server";

const FREEIMAGE_UPLOAD_URL = "https://freeimage.host/api/1/upload";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const MAX_SERVER_UPLOAD_BYTES = 4 * 1024 * 1024;
const FREEIMAGE_UPLOAD_ATTEMPTS = 2;
const FREEIMAGE_UPLOAD_STRATEGIES = ["base64", "file"] as const;
const IMGBB_UPLOAD_ATTEMPTS = 2;
const SERVER_ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
]);

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
  } | string;
  status_txt?: string;
  status_code?: number;
  [key: string]: unknown;
}

interface ImgbbUploadResponse {
  data?: {
    url?: string;
    display_url?: string;
    image?: {
      url?: string;
    };
  };
  success?: boolean;
  error?: {
    code?: number;
    message?: string;
  } | string;
  status?: number;
  status_code?: number;
  status_txt?: string;
  [key: string]: unknown;
}

async function readFreeImageResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function readUploadProviderResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function uploadToFreeImage(source: File) {
  const imageBuffer = Buffer.from(await source.arrayBuffer());
  const base64Image = imageBuffer.toString("base64");

  let lastResponse: Response | null = null;
  let lastData: unknown = null;

  for (const strategy of FREEIMAGE_UPLOAD_STRATEGIES) {
    for (let attempt = 1; attempt <= FREEIMAGE_UPLOAD_ATTEMPTS; attempt += 1) {
      const freeImageFormData = new FormData();
      freeImageFormData.append("key", process.env.FREEIMAGE_API_KEY || "");
      freeImageFormData.append("action", "upload");
      freeImageFormData.append("format", "json");

      if (strategy === "base64") {
        freeImageFormData.append("source", base64Image);
      } else {
        freeImageFormData.append(
          "source",
          new Blob([imageBuffer], { type: source.type || "image/jpeg" }),
          source.name || "betagen-upload.jpg"
        );
      }

      lastResponse = await fetch(FREEIMAGE_UPLOAD_URL, {
        method: "POST",
        body: freeImageFormData,
      });
      lastData = await readFreeImageResponse(lastResponse);

      if (
        typeof lastData === "object" &&
        lastData !== null &&
        lastResponse.ok &&
        getUploadedImageUrl(lastData as FreeImageUploadResponse)
      ) {
        return { response: lastResponse, data: lastData };
      }

      const errorMessage = getFreeImageErrorMessage(lastData);

      const shouldRetry =
        attempt < FREEIMAGE_UPLOAD_ATTEMPTS &&
        (!lastResponse.ok || /internal|temporary|try again/i.test(errorMessage));

      if (!shouldRetry) {
        break;
      }
    }

    if (
      typeof lastData === "object" &&
      lastData !== null &&
      lastResponse?.ok &&
      getUploadedImageUrl(lastData as FreeImageUploadResponse)
    ) {
      break;
    }
  }

  if (!lastResponse) {
    throw new Error("FreeImage upload did not run.");
  }

  return { response: lastResponse, data: lastData };
}

async function uploadToImgbb(source: File) {
  const imageBuffer = Buffer.from(await source.arrayBuffer());
  const base64Image = imageBuffer.toString("base64");
  const uploadUrl = `${IMGBB_UPLOAD_URL}?key=${encodeURIComponent(
    process.env.IMGBB_API_KEY || ""
  )}`;
  let lastResponse: Response | null = null;
  let lastData: unknown = null;

  for (let attempt = 1; attempt <= IMGBB_UPLOAD_ATTEMPTS; attempt += 1) {
    const imgbbFormData = new FormData();
    imgbbFormData.append("image", base64Image);
    imgbbFormData.append("name", getUploadBaseName(source.name));

    lastResponse = await fetch(uploadUrl, {
      method: "POST",
      body: imgbbFormData,
    });
    lastData = await readUploadProviderResponse(lastResponse);

    if (
      typeof lastData === "object" &&
      lastData !== null &&
      lastResponse.ok &&
      getImgbbImageUrl(lastData as ImgbbUploadResponse)
    ) {
      return { response: lastResponse, data: lastData };
    }

    const errorMessage = getImgbbErrorMessage(lastData);
    const shouldRetry =
      attempt < IMGBB_UPLOAD_ATTEMPTS &&
      (!lastResponse.ok || /internal|temporary|try again|rate/i.test(errorMessage));

    if (!shouldRetry) {
      break;
    }
  }

  if (!lastResponse) {
    throw new Error("ImgBB upload did not run.");
  }

  return { response: lastResponse, data: lastData };
}

function getFreeImageErrorMessage(response: unknown) {
  if (typeof response !== "object" || response === null) {
    return "";
  }

  const uploadResponse = response as FreeImageUploadResponse;

  if (typeof uploadResponse.error === "string") {
    return uploadResponse.error;
  }

  return uploadResponse.error?.message || uploadResponse.status_txt || "";
}

function getImgbbErrorMessage(response: unknown) {
  if (typeof response !== "object" || response === null) {
    return "";
  }

  const uploadResponse = response as ImgbbUploadResponse;

  if (typeof uploadResponse.error === "string") {
    return uploadResponse.error;
  }

  return uploadResponse.error?.message || uploadResponse.status_txt || "";
}

function getUploadBaseName(fileName: string) {
  return (fileName.replace(/\.[^/.]+$/, "") || "betagen-upload").replace(
    /[^a-zA-Z0-9_-]/g,
    "-"
  );
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

function getImgbbImageUrl(response: ImgbbUploadResponse) {
  return (
    response.data?.url ||
    response.data?.display_url ||
    response.data?.image?.url ||
    null
  );
}

function getUserUploadError(errorMessage?: string) {
  if (!errorMessage) {
    return "Không upload được ảnh, vui lòng thử lại bằng ảnh JPG rõ nét.";
  }

  const normalizedError = errorMessage.toLowerCase();

  if (
    normalizedError.includes("internal") ||
    normalizedError.includes("temporary") ||
    normalizedError.includes("try again")
  ) {
    return "Hệ thống upload ảnh đang bận. Vui lòng bấm tạo video lại hoặc chọn ảnh JPG rõ nét khác.";
  }

  if (
    normalizedError.includes("invalid") ||
    normalizedError.includes("unsupported") ||
    normalizedError.includes("format")
  ) {
    return "Định dạng ảnh chưa được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WEBP rõ nét.";
  }

  return errorMessage;
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

    if (source.size > MAX_SERVER_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Ảnh quá nặng. Vui lòng chọn ảnh nhẹ hơn hoặc thử lại bằng ảnh JPG rõ nét.",
        },
        { status: 413 }
      );
    }

    if (!SERVER_ACCEPTED_IMAGE_TYPES.has(source.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Định dạng ảnh chưa được hỗ trợ. Vui lòng chọn ảnh JPG, PNG hoặc WEBP.",
        },
        { status: 400 }
      );
    }

    if (!process.env.FREEIMAGE_API_KEY && !process.env.IMGBB_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Image upload API key is not configured." },
        { status: 500 }
      );
    }

    let freeImageData: unknown = null;
    let freeImageError = "";

    if (process.env.FREEIMAGE_API_KEY) {
      const { response: freeImageResponse, data } =
        await uploadToFreeImage(source);
      freeImageData = data;

      if (typeof freeImageData === "object" && freeImageData !== null) {
        const freeImageUrl = getUploadedImageUrl(
          freeImageData as FreeImageUploadResponse
        );

        if (freeImageResponse.ok && freeImageUrl) {
          return NextResponse.json({
            success: true,
            image_url: freeImageUrl,
            provider: "freeimage",
            freeimage_response: freeImageData,
          });
        }
      }

      freeImageError =
        getFreeImageErrorMessage(freeImageData) || "Unable to upload image.";
    }

    if (process.env.IMGBB_API_KEY) {
      const { response: imgbbResponse, data: imgbbData } =
        await uploadToImgbb(source);

      if (typeof imgbbData === "object" && imgbbData !== null) {
        const imgbbUrl = getImgbbImageUrl(imgbbData as ImgbbUploadResponse);

        if (imgbbResponse.ok && imgbbUrl) {
          return NextResponse.json({
            success: true,
            image_url: imgbbUrl,
            provider: "imgbb",
            freeimage_response: freeImageData,
            imgbb_response: imgbbData,
          });
        }
      }

      const imgbbError =
        getImgbbErrorMessage(imgbbData) || "Unable to upload image.";

      return NextResponse.json(
        {
          success: false,
          error: getUserUploadError(imgbbError || freeImageError),
          freeimage_response: freeImageData,
          imgbb_response: imgbbData,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: getUserUploadError(freeImageError),
        freeimage_response: freeImageData,
      },
      { status: 502 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Không upload được ảnh, vui lòng thử lại bằng ảnh JPG rõ nét.",
      },
      { status: 500 }
    );
  }
}
