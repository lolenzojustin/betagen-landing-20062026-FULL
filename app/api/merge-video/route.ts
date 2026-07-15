import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import ffmpegPath from "ffmpeg-static";

export const runtime = "nodejs";
export const maxDuration = 300;

const OUTRO_VIDEO_URL =
  "https://pub-1952482ddc0e4ce780169f9161b582bb.r2.dev/videopublic/new%20-2.mp4";
const DOWNLOAD_TIMEOUT_MS = 90_000;
const FFMPEG_TIMEOUT_MS = 240_000;

type MergeVideoRequestBody = {
  video_url?: unknown;
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createTimeoutSignal(ms: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
  };
}

async function downloadVideo(videoUrl: string, destinationPath: string) {
  const timeout = createTimeoutSignal(DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(videoUrl, {
      cache: "no-store",
      signal: timeout.signal,
    });

    if (!response.ok) {
      throw new Error(`Unable to download video: ${response.status}`);
    }

    const videoBuffer = Buffer.from(await response.arrayBuffer());
    await writeFile(destinationPath, videoBuffer);
  } finally {
    timeout.clear();
  }
}

function toConcatPath(filePath: string) {
  return filePath.replace(/\\/g, "/").replace(/'/g, "'\\''");
}

async function runFfmpeg(args: string[]) {
  if (!ffmpegPath) {
    throw new Error("FFmpeg binary is not available.");
  }

  const executablePath = ffmpegPath;

  return new Promise<void>((resolve, reject) => {
    const child = spawn(executablePath, args, {
      windowsHide: true,
    });
    const stderrChunks: Buffer[] = [];
    const timeoutId = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("FFmpeg timed out."));
    }, FFMPEG_TIMEOUT_MS);

    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeoutId);

      if (code === 0) {
        resolve();
        return;
      }

      const stderr = Buffer.concat(stderrChunks).toString("utf8");
      reject(new Error(stderr || `FFmpeg exited with code ${code}.`));
    });
  });
}

async function mergeVideos({
  firstVideoPath,
  secondVideoPath,
  listPath,
  outputPath,
}: {
  firstVideoPath: string;
  secondVideoPath: string;
  listPath: string;
  outputPath: string;
}) {
  await writeFile(
    listPath,
    [
      `file '${toConcatPath(firstVideoPath)}'`,
      `file '${toConcatPath(secondVideoPath)}'`,
    ].join("\n")
  );

  try {
    await runFfmpeg([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c",
      "copy",
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ]);
  } catch (copyError) {
    console.warn(
      "[Merge Video] Stream copy failed, retrying with encode:",
      copyError
    );
    await runFfmpeg([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      listPath,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      "-y",
      outputPath,
    ]);
  }
}

export async function POST(req: NextRequest) {
  let tempDir = "";

  try {
    const body = (await req.json()) as MergeVideoRequestBody;
    const firstVideoUrl =
      typeof body.video_url === "string" ? body.video_url : undefined;

    if (!firstVideoUrl || !isHttpUrl(firstVideoUrl)) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid video_url" },
        { status: 400 }
      );
    }

    if (!ffmpegPath) {
      return NextResponse.json(
        { success: false, error: "FFmpeg is not available on this server." },
        { status: 500 }
      );
    }

    tempDir = path.join(tmpdir(), `betagen-merge-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });

    const firstVideoPath = path.join(tempDir, "video-1.mp4");
    const secondVideoPath = path.join(tempDir, "video-2.mp4");
    const listPath = path.join(tempDir, "list.txt");
    const outputPath = path.join(tempDir, "output.mp4");

    await Promise.all([
      downloadVideo(firstVideoUrl, firstVideoPath),
      downloadVideo(OUTRO_VIDEO_URL, secondVideoPath),
    ]);

    await mergeVideos({
      firstVideoPath,
      secondVideoPath,
      listPath,
      outputPath,
    });

    const mergedVideo = await readFile(outputPath);

    return new Response(mergedVideo, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="betagen-video.mp4"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[Merge Video] Unable to merge video:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Không thể ghép video kết quả. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  }
}
