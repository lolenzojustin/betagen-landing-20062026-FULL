const LOCK_KEY = "betagen:video-generation-lock";
const START_COOLDOWN_SECONDS = 90;

type RedisCommandResult = {
  result?: unknown;
  error?: string;
};

type LocalLock = {
  ownerId: string;
  expiresAt: number;
};

type ReleaseVideoLockOptions = {
  clearCooldown?: boolean;
};

const globalForVideoLock = globalThis as typeof globalThis & {
  __betagenVideoLock?: LocalLock;
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

async function redisCommand(args: unknown[]) {
  const config = getRedisConfig();

  if (!config) {
    throw new Error("Video lock storage is not configured.");
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
    throw new Error(data.error || "Video lock storage request failed.");
  }

  return data.result;
}

function shouldUseLocalLock() {
  return process.env.NODE_ENV !== "production" && !getRedisConfig();
}

function pruneLocalLock() {
  if (
    globalForVideoLock.__betagenVideoLock &&
    globalForVideoLock.__betagenVideoLock.expiresAt <= Date.now()
  ) {
    globalForVideoLock.__betagenVideoLock = undefined;
  }
}

export function isVideoLockConfigured() {
  return Boolean(getRedisConfig()) || shouldUseLocalLock();
}

export async function acquireVideoLock() {
  const ownerId = crypto.randomUUID();

  if (shouldUseLocalLock()) {
    pruneLocalLock();

    if (globalForVideoLock.__betagenVideoLock) {
      return { acquired: false as const };
    }

    globalForVideoLock.__betagenVideoLock = {
      ownerId,
      expiresAt: Date.now() + START_COOLDOWN_SECONDS * 1000,
    };

    return { acquired: true as const, ownerId };
  }

  const result = await redisCommand([
    "SET",
    LOCK_KEY,
    ownerId,
    "EX",
    START_COOLDOWN_SECONDS,
    "NX",
  ]);

  return result === "OK"
    ? { acquired: true as const, ownerId }
    : { acquired: false as const };
}

export async function refreshVideoLock(ownerId: string) {
  if (shouldUseLocalLock()) {
    pruneLocalLock();
    return globalForVideoLock.__betagenVideoLock?.ownerId === ownerId;
  }

  return true;
}

export async function releaseVideoLock(
  ownerId: string,
  options: ReleaseVideoLockOptions = {}
) {
  if (shouldUseLocalLock()) {
    pruneLocalLock();

    if (!options.clearCooldown) {
      return true;
    }

    if (globalForVideoLock.__betagenVideoLock?.ownerId === ownerId) {
      globalForVideoLock.__betagenVideoLock = undefined;
      return true;
    }

    return false;
  }

  if (!options.clearCooldown) {
    return true;
  }

  const result = await redisCommand([
    "EVAL",
    "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
    1,
    LOCK_KEY,
    ownerId,
  ]);

  return result === 1;
}
