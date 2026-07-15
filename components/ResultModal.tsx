"use client";

import { useState } from "react";

interface ResultModalProps {
  videoUrl: string;
  onClose: () => void;
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

function isPhoneDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent || "";

  return /iPhone|Windows Phone|BlackBerry|IEMobile|Opera Mini|Android.+Mobile/i.test(
    userAgent
  );
}

function isAppleDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

function createTimeoutSignal(ms: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ms);

  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeoutId),
  };
}

export default function ResultModal({ videoUrl, onClose }: ResultModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedVideo, setHasSavedVideo] = useState(false);
  const [isPhone] = useState(() => isPhoneDevice());
  const [isApple] = useState(() => isAppleDevice());
  const [saveError, setSaveError] = useState<string | null>(null);
  const downloadUrl = `/api/download-video?url=${encodeURIComponent(videoUrl)}`;
  const mobileVideoPageUrl = `/video?url=${encodeURIComponent(videoUrl)}`;
  const fileName = getVideoFileName(videoUrl);

  const fallbackDownload = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setHasSavedVideo(true);
  };

  const openVideoInNewTab = () => {
    const openedWindow = window.open(
      mobileVideoPageUrl,
      "_blank",
      "noopener,noreferrer"
    );

    if (!openedWindow) {
      window.location.href = mobileVideoPageUrl;
    }

    setHasSavedVideo(true);
  };

  const handleSaveVideo = async () => {
    setSaveError(null);

    if (!isPhone) {
      setIsSaving(true);
      fallbackDownload();
      window.setTimeout(() => setIsSaving(false), 800);
      return;
    }

    setIsSaving(true);

    try {
      const timeout = createTimeoutSignal(45_000);
      let response: Response;

      try {
        response = await fetch(downloadUrl, {
          cache: "no-store",
          signal: timeout.signal,
        });
      } finally {
        timeout.clear();
      }

      if (!response.ok) {
        throw new Error("Unable to download video.");
      }

      const blob = await response.blob();
      const file = new File([blob], fileName, {
        type: blob.type || "video/mp4",
      });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Video Betagen",
            text: "Video Betagen của bạn đã sẵn sàng.",
          });
        } catch (shareError) {
          if (
            shareError instanceof DOMException &&
            shareError.name === "AbortError"
          ) {
            return;
          }

          throw shareError;
        }

        setHasSavedVideo(true);
        setSaveError(
          "Nếu bảng chia sẻ có mục Lưu video/Save Video, hãy chọn mục đó để lưu vào thư viện ảnh."
        );
        return;
      }

      setSaveError(
        "Trình duyệt này chưa cho lưu trực tiếp. Đang mở trang lưu video dự phòng."
      );
      openVideoInNewTab();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setSaveError(
          "Chuẩn bị file quá lâu. Đang mở trang lưu video dự phòng."
        );
      } else {
        console.error("[Save Video] Unable to save video directly:", error);
        setSaveError(
          "Trình duyệt này chưa cho lưu trực tiếp. Đang mở trang lưu video dự phòng."
        );
      }

      openVideoInNewTab();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="betagen-heading mb-2 text-xl text-[#354A93]">
          Video đã sẵn sàng!
        </h3>
        <p className="mb-6 text-sm text-[#354A93]/70">
          Video cá nhân hóa của bạn đã được tạo thành công.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSaveVideo}
            disabled={isSaving}
            className="block w-full rounded-full bg-[#EA0029] py-3 text-center text-base font-bold text-white transition-colors hover:bg-[#c90024] disabled:cursor-wait disabled:opacity-75"
          >
            {isSaving
              ? "Đang chuẩn bị file video..."
              : isPhone
                ? "Lưu video vào máy"
                : "Tải video"}
          </button>
          {isPhone && (
            <p className="text-xs leading-snug text-[#354A93]/65">
              {isApple
                ? "Bấm nút trên để mở bảng lưu video. Nếu không hiện mục Lưu video, hãy mở bằng Safari rồi thử lại."
                : "Bấm nút trên để mở bảng lưu video, sau đó chọn Lưu video/Save Video nếu có."}
            </p>
          )}
          {hasSavedVideo && (
            <a
              href={isPhone ? mobileVideoPageUrl : videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-full bg-[#354A93] py-3 text-center text-base font-bold text-white transition-colors hover:bg-[#2b3d7d]"
            >
              Bấm để xem video
            </a>
          )}
          {isPhone && (
            <button
              onClick={openVideoInNewTab}
              className="w-full rounded-full border border-[#354A93]/35 py-3 text-base font-bold text-[#354A93] transition-colors hover:bg-[#354A93]/5"
            >
              Mở lại link video
            </button>
          )}
          {saveError && (
            <p className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold leading-snug text-[#EA0029]">
              {saveError}
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-full border border-[#354A93] py-3 text-base font-bold text-[#354A93] transition-colors hover:bg-[#354A93]/5"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
