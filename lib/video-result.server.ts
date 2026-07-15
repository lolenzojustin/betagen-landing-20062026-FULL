import { releaseVideoLock } from "@/lib/video-lock.server";

const VIDEO_RESULT_KEY_PREFIX = "betagen:video-result:";
const VIDEO_RESULT_TTL_SECONDS = 60 * 60;
const BACKGROUND_INITIAL_DELAY_MS = 30_000;
const BACKGROUND_POLL_INTERVAL_MS = 15_000;
const BACKGROUND_MAX_ATTEMPTS = 58;

type RedisCommandResult = {
  result?: unknown;
  error?: string;
};

export type StoredVideoResult = {
  success: boolean;
  task_id: string;
  lock_id?: string;
  status?: string;
  video_url?: string;
  error?: string;
  updated_at: number;
  n8n_response?: unknown;
  [key: string]: unknown;
};

type LocalVideoResult = {
  value: StoredVideoResult;
  expiresAt: number;
};

const globalForVideoResult = globalThis as typeof globalThis & {
  __betagenVideoResults?: Map<string, LocalVideoResult>;
};

function getRedisConfig() {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return undefined;
  }

  return { url, token };
}

function shouldUseLocalResultStore() {
  return process.env.NODE_ENV !== "production" && !getRedisConfig();
}

function getLocalVideoResults() {
  globalForVideoResult.__betagenVideoResults ??= new Map();

  return globalForVideoResult.__betagenVideoResults;
}

async function redisCommand(args: unknown[]) {
  const config = getRedisConfig();

  if (!config) {
    throw new Error("Video result storage is not configured.");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });

  const data = (await response.json()) as RedisCommandResult;

  if (!response.ok || data.error) {
    throw new Error(data.error || "Video result storage request failed.");
  }

  return data.result;
}

function getResultKey(taskId: string) {
  return `${VIDEO_RESULT_KEY_PREFIX}${taskId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getNestedVideoUrl(value: Record<string, unknown>) {
  const videoUrl =
    getOptionalString(value.video_url) ||
    getOptionalString(value.videoUrl) ||
    getOptionalString(value.url);
  if (videoUrl) {
    return videoUrl;
  }

  const video = value.video;
  if (!isRecord(video)) {
    return undefined;
  }

  return (
    getOptionalString(video.url) ||
    getOptionalString(video.video_url) ||
    getOptionalString(video.videoUrl)
  );
}

function normalizeStatus(value: unknown) {
  return typeof value === "string" ? value.toUpperCase() : "";
}

function normalizeVideoResult(value: Record<string, unknown>, raw?: unknown) {
  const videoUrl = getNestedVideoUrl(value);

  return {
    ...value,
    ...(videoUrl ? { video_url: videoUrl } : {}),
    ...(raw ? { n8n_response: raw } : {}),
  };
}

export function normalizeN8nResponse(value: unknown) {
  if (isRecord(value)) {
    return normalizeVideoResult(value);
  }

  if (Array.isArray(value)) {
    const firstItem = value[0];
    return isRecord(firstItem) ? normalizeVideoResult(firstItem, value) : value;
  }

  return value;
}

function toStoredVideoResult(
  taskId: string,
  result: unknown,
  lockId?: string
): StoredVideoResult {
  const normalized = normalizeN8nResponse(result);
  const base = isRecord(normalized) ? normalized : {};
  const videoUrl = getOptionalString(base.video_url);
  const status =
    normalizeStatus(base.status) || (videoUrl ? "COMPLETED" : "PROCESSING");

  return {
    ...base,
    success: base.success !== false,
    task_id: taskId,
    ...(lockId ? { lock_id: lockId } : {}),
    status,
    ...(videoUrl ? { video_url: videoUrl } : {}),
    updated_at: Date.now(),
    n8n_response: result,
  };
}

export function isCompletedVideoResult(result: {
  status?: string;
  video_url?: string;
}) {
  const status = normalizeStatus(result.status);

  return Boolean(
    result.video_url &&
      (!status || ["COMPLETED", "SUCCESS", "DONE"].includes(status))
  );
}

export function isTerminalVideoResult(result: {
  status?: string;
  video_url?: string;
}) {
  const status = normalizeStatus(result.status);

  return (
    isCompletedVideoResult(result) ||
    status === "ERROR" ||
    status === "TIMEOUT"
  );
}

export async function saveStoredVideoResult(result: StoredVideoResult) {
  if (shouldUseLocalResultStore()) {
    getLocalVideoResults().set(result.task_id, {
      value: result,
      expiresAt: Date.now() + VIDEO_RESULT_TTL_SECONDS * 1000,
    });
    return;
  }

  await redisCommand([
    "SET",
    getResultKey(result.task_id),
    JSON.stringify(result),
    "EX",
    VIDEO_RESULT_TTL_SECONDS,
  ]);
}

export async function getStoredVideoResult(taskId: string) {
  if (shouldUseLocalResultStore()) {
    const localResult = getLocalVideoResults().get(taskId);

    if (!localResult) {
      return null;
    }

    if (localResult.expiresAt <= Date.now()) {
      getLocalVideoResults().delete(taskId);
      return null;
    }

    return localResult.value;
  }

  const rawResult = await redisCommand(["GET", getResultKey(taskId)]);

  if (typeof rawResult !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(rawResult) as unknown;

    return isRecord(parsed) ? (parsed as StoredVideoResult) : null;
  } catch {
    return null;
  }
}

async function readN8nResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const responseText = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

export async function checkN8nVideoStatus(taskId: string) {
  if (!process.env.N8N_CHECK_VIDEO_WEBHOOK) {
    throw new Error("N8N check-video webhook is not configured.");
  }

  const n8nResponse = await fetch(process.env.N8N_CHECK_VIDEO_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ request_id: taskId }),
    cache: "no-store",
  });
  const n8nData = await readN8nResponse(n8nResponse);

  if (!n8nResponse.ok) {
    throw new Error("n8n check-video webhook request failed");
  }

  return n8nData;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function pollVideoResultInBackground({
  taskId,
  lockId,
}: {
  taskId: string;
  lockId?: string;
}) {
  await saveStoredVideoResult({
    success: true,
    task_id: taskId,
    ...(lockId ? { lock_id: lockId } : {}),
    status: "PROCESSING",
    updated_at: Date.now(),
  });

  await wait(BACKGROUND_INITIAL_DELAY_MS);

  for (let attempt = 0; attempt < BACKGROUND_MAX_ATTEMPTS; attempt += 1) {
    try {
      const n8nData = await checkN8nVideoStatus(taskId);
      const storedResult = toStoredVideoResult(taskId, n8nData, lockId);

      await saveStoredVideoResult(storedResult);

      if (isTerminalVideoResult(storedResult)) {
        if (lockId) {
          await releaseVideoLock(lockId);
        }
        return;
      }
    } catch (error) {
      console.warn("[Background Video Poll] Retrying after error:", error);
    }

    await wait(BACKGROUND_POLL_INTERVAL_MS);
  }

  await saveStoredVideoResult({
    success: false,
    task_id: taskId,
    ...(lockId ? { lock_id: lockId } : {}),
    status: "TIMEOUT",
    error: "Video đang xử lý lâu hơn dự kiến. Bạn vui lòng thử lại sau.",
    updated_at: Date.now(),
  });

  if (lockId) {
    await releaseVideoLock(lockId);
  }
}
