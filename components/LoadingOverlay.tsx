"use client";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 px-5 backdrop-blur-sm">
      <div className="relative mb-6 h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/20 border-t-[#EA0029]" />
        <div
          className="absolute inset-2 animate-spin rounded-full border-4 border-white/20 border-t-[#84D9FB]"
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        />
      </div>
      <p className="text-center text-lg font-bold text-white">
        Đang tạo video, xin vui lòng chờ từ 3 phút đến 6 phút
      </p>
      <p className="mt-4 max-w-[340px] text-center text-sm font-medium leading-6 text-white/85">
        Trong lúc chờ, bạn có thể chuyển sang tab khác, mở ứng dụng khác hoặc
        khóa màn hình. Video vẫn sẽ tiếp tục được tạo bình thường.
      </p>
    </div>
  );
}
