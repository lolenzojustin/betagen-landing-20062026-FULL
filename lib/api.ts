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

export async function createVideo(
  formData: FormData
): Promise<VideoTaskResponse> {
  const res = await fetch("/api/create-video", {
    method: "POST",
    body: formData,
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
