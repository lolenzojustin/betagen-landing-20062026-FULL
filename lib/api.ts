const FREEIMAGE_UPLOAD_URL = "https://freeimage.host/api/1/upload";

export type VideoTaskStatus = "processing" | "done" | "error";

export interface VideoTaskResponse {
  success: boolean;
  task_id?: string;
  status?: VideoTaskStatus;
  video_url?: string;
  error?: string;
  n8n_response?: unknown;
  [key: string]: unknown;
}

export interface CreateVideoPayload {
  image_url: string;
  original_file_name?: string;
  template_id?: string;
  template_video_url?: string;
}

interface FreeImageUploadResponse {
  status_code?: number;
  success?: {
    code?: number;
    message?: string;
  };
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

function getFreeImageUrl(response: FreeImageUploadResponse) {
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

export async function uploadImageToFreeImage(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FREEIMAGE_API_KEY;

  if (!apiKey) {
    throw new Error("FreeImage API key is not configured.");
  }

  const formData = new FormData();
  formData.append("key", apiKey);
  formData.append("action", "upload");
  formData.append("format", "json");
  formData.append("source", file);

  const res = await fetch(FREEIMAGE_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as FreeImageUploadResponse;
  const imageUrl = getFreeImageUrl(data);

  if (!res.ok || !imageUrl) {
    throw new Error(data.error?.message || "Unable to upload image.");
  }

  return imageUrl;
}

export async function createVideo(
  payload: CreateVideoPayload
): Promise<VideoTaskResponse> {
  const res = await fetch("/api/create-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function checkVideo(
  taskId: string,
  signal?: AbortSignal
): Promise<VideoTaskResponse> {
  const res = await fetch(
    `/api/check-video?task_id=${encodeURIComponent(taskId)}`,
    { signal }
  );

  return res.json();
}
