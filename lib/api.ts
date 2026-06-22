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
  success: boolean;
  image_url?: string;
  error?: string;
  [key: string]: unknown;
}

export async function uploadImageToFreeImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("source", file);

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as FreeImageUploadResponse;

  if (!res.ok || !data.success || !data.image_url) {
    throw new Error(data.error || "Unable to upload image.");
  }

  return data.image_url;
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
