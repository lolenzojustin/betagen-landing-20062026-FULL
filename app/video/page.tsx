"use client";

import { useState } from "react";

function getVideoUrlFromLocation() {
  try {
    const params = new URLSearchParams(window.location.search);
    const videoUrl = params.get("url");

    if (!videoUrl) {
      return "";
    }

    const parsedUrl = new URL(videoUrl);

    return ["http:", "https:"].includes(parsedUrl.protocol) ? videoUrl : "";
  } catch {
    return "";
  }
}

function getVideoFileName(videoUrl: string) {
  try {
    const url = new URL(videoUrl);
    const fileName = url.pathname.split("/").filter(Boolean).pop();

    if (fileName?.includes(".")) {
      return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    }
  } catch {
    // Use the default file name below.
  }

  return "betagen-video.mp4";
}

function downloadFromUrl(downloadUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function downloadBlob(blob: Blob, fileName: string) {
  const blobUrl = URL.createObjectURL(blob);

  downloadFromUrl(blobUrl, fileName);
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
}

export default function VideoPage() {
  const [videoUrl] = useState(() =>
    typeof window === "undefined" ? "" : getVideoUrlFromLocation()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const fileName = videoUrl ? getVideoFileName(videoUrl) : "betagen-video.mp4";
  const downloadUrl = videoUrl
    ? `/api/download-video?url=${encodeURIComponent(videoUrl)}`
    : "";

  const handleSaveVideo = async () => {
    if (!videoUrl || !downloadUrl || isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch(downloadUrl, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to download video.");
      }

      const blob = await response.blob();
      const file = new File([blob], fileName, {
        type: blob.type || "video/mp4",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Video Betagen",
          text: "Video Betagen của bạn đã sẵn sàng.",
        });
        setSaveMessage("Nếu bảng chia sẻ có mục Lưu video/Save Video, hãy chọn mục đó để lưu vào thư viện ảnh.");
        return;
      }

      downloadBlob(blob, fileName);
      setSaveMessage("Nếu trình duyệt hỏi vị trí lưu, hãy chọn Tệp/Files. Với iPhone, mở bằng Safari sẽ tải ổn định hơn.");
    } catch (error) {
      console.error("[Video Page] Unable to save video:", error);
      downloadFromUrl(downloadUrl, fileName);
      setSaveMessage("Trình duyệt hiện tại không hỗ trợ lưu trực tiếp. Hãy chọn Mở bằng Safari rồi bấm Lưu video vào máy lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#BEEBFD] px-5 py-8 text-center text-[#354A93]">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-xl flex-col justify-center gap-5">
        <div className="text-left">
          <h1 className="text-2xl font-black leading-tight">Video đã sẵn sàng</h1>
          <p className="mt-2 text-sm font-semibold leading-snug text-[#354A93]/75">
            Bấm phát video, sau đó dùng nút chia sẻ hoặc dấu ba chấm của trình duyệt để lưu video vào điện thoại.
          </p>
        </div>

        {videoUrl ? (
          <>
            <video
              src={videoUrl}
              controls
              playsInline
              className="aspect-video w-full rounded-2xl bg-black object-contain shadow-[0_18px_44px_rgba(53,74,147,0.18)]"
            />

            <button
              type="button"
              onClick={handleSaveVideo}
              disabled={isSaving}
              className="rounded-full bg-[#EA0029] px-6 py-4 text-base font-black text-white shadow-[0_12px_28px_rgba(234,0,41,0.2)] disabled:cursor-wait disabled:opacity-75"
            >
              {isSaving ? "Đang chuẩn bị file video..." : "Lưu video vào máy"}
            </button>

            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/70 px-6 py-4 text-base font-black text-[#354A93] shadow-[0_10px_24px_rgba(53,74,147,0.1)]"
            >
              Tải bằng trình duyệt
            </a>

            {saveMessage && (
              <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold leading-snug text-[#354A93]">
                {saveMessage}
              </p>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white/80 px-5 py-6 text-sm font-bold text-[#EA0029]">
            Không tìm thấy link video. Vui lòng quay lại trang trước và thử lại.
          </div>
        )}

        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-full border border-[#354A93] px-6 py-4 text-base font-black text-[#354A93]"
        >
          Quay lại
        </button>
      </div>
    </main>
  );
}
