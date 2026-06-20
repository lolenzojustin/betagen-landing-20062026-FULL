"use client";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative mb-6 h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/20 border-t-[#EA0029]" />
        <div className="absolute inset-2 animate-spin rounded-full border-4 border-white/20 border-t-[#84D9FB]" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
      <p className="text-lg font-bold text-white">Đang tạo video của bạn...</p>
      <p className="mt-2 text-sm text-white/70">Quá trình có thể mất khoảng 2-3 phút</p>
    </div>
  );
}
