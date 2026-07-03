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

export default function VideoPage() {
  const [videoUrl] = useState(() =>
    typeof window === "undefined" ? "" : getVideoUrlFromLocation()
  );

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

            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-[#EA0029] px-6 py-4 text-base font-black text-white shadow-[0_12px_28px_rgba(234,0,41,0.2)]"
            >
              Mở link video gốc
            </a>
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
