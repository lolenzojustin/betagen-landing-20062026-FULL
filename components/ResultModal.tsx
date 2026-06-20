"use client";

interface ResultModalProps {
  videoUrl: string;
  onClose: () => void;
}

export default function ResultModal({ videoUrl, onClose }: ResultModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="mb-2 text-xl font-black text-[#354A93]">
          Video đã sẵn sàng!
        </h3>
        <p className="mb-6 text-sm text-[#354A93]/70">
          Video cá nhân hóa của bạn đã được tạo thành công.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-[#EA0029] py-3 text-center text-base font-bold text-white transition-colors hover:bg-[#c90024]"
          >
            Tải video
          </a>
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
