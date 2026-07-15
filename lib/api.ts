export interface VideoTaskResponse {
  success: boolean;
  task_id?: string;
  lock_id?: string;
  status?: string;
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

async function readUploadResponse(res: Response) {
  try {
    return (await res.json()) as FreeImageUploadResponse;
  } catch {
    return {
      success: false,
      error:
        res.status === 413
          ? "Ảnh quá nặng. Vui lòng chọn ảnh nhẹ hơn hoặc thử lại bằng ảnh JPG rõ nét."
          : "Không upload được ảnh. Vui lòng thử lại bằng ảnh JPG/PNG rõ nét.",
    };
  }
}

function getUploadErrorMessage(error?: string) {
  if (!error) {
    return "Không upload được ảnh. Vui lòng thử lại bằng ảnh JPG/PNG rõ nét.";
  }

  if (/internal upload error|internal server error|unable to upload/i.test(error)) {
    return "Hệ thống upload ảnh đang bận. Vui lòng bấm tạo video lại hoặc chọn ảnh JPG rõ nét khác.";
  }

  return error;
}

export async function uploadImageToFreeImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("source", file);

  const res = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  const data = await readUploadResponse(res);

  if (!res.ok || !data.success || !data.image_url) {
    throw new Error(getUploadErrorMessage(data.error));
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
  lockId?: string,
  signal?: AbortSignal
): Promise<VideoTaskResponse> {
  const params = new URLSearchParams({
    task_id: taskId,
  });

  if (lockId) {
    params.set("lock_id", lockId);
  }

  const res = await fetch(
    `/api/check-video?${params.toString()}`,
    { signal }
  );

  return res.json();
}

export async function mergeVideo(
  videoUrl: string,
  signal?: AbortSignal
): Promise<Blob> {
  const res = await fetch("/api/merge-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_url: videoUrl }),
    cache: "no-store",
    signal,
  });

  if (!res.ok) {
    throw new Error("Unable to merge video.");
  }

  return res.blob();
}

export async function releaseVideoLock(lockId: string) {
  await fetch("/api/video-lock/release", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ lock_id: lockId }),
  });
}
