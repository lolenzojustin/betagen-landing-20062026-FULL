"use client";

export default function NoteSection() {
  return (
    <div className="relative w-full">
      <h3
        className="betagen-heading leading-none text-[#354A93]"
        style={{ fontSize: "30px" }}
      >
        LƯU Ý
      </h3>

      <div
        style={{
          marginTop: "28px",
          width: "780px",
          minHeight: "150px",
          backgroundColor: "rgba(255, 255, 255, 0.36)",
          border: "1px solid rgba(255, 255, 255, 0.52)",
          borderRadius: "16px",
          padding: "18px 28px",
        }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-black" style={{ fontSize: "18px", lineHeight: 1.26 }}>
            * Hình ảnh tải lên là ảnh chân dung cá nhân, rõ nét
            <br />
            <span className="font-semibold text-[#354A93]">
              (Không dùng ảnh có nhiều người hoặc nhiều khuôn mặt, ảnh mờ hoặc không rõ ràng)
            </span>
          </p>
          <p className="text-black" style={{ fontSize: "18px", lineHeight: 1.26 }}>
            * Nên dùng hình toàn thân hoặc nửa thân trên để gen video được chính xác nhất
            <br />
            <span className="font-semibold text-[#354A93]">
              (Không nên gửi hình ảnh chỉ thấy mỗi khuôn mặt)
            </span>
          </p>
          <p className="text-black" style={{ fontSize: "18px", lineHeight: 1.26 }}>
            * Mỗi user chỉ được <strong>tối đa 2 lần</strong> tải lên hình ảnh
          </p>
        </div>
      </div>
    </div>
  );
}
