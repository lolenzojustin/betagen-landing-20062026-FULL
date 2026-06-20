export interface CreateVideoResponse {
  success: boolean;
  video_url?: string;
  message?: string;
  status?: number;
  data?: unknown;
  error?: string;
  n8n_response?: unknown;
}

export async function createVideo(formData: FormData): Promise<CreateVideoResponse> {
  const res = await fetch("/api/create-video", {
    method: "POST",
    body: formData,
  });
  return res.json();
}
