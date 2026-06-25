"use client";

export default function NoteSection() {
  return (
    <div className="relative w-full">
      <h3
        className="font-black leading-none text-[#354A93]"
        style={{ fontSize: "34px" }}
      >
        LƯU Ý
      </h3>

      <div
        style={{
          marginTop: "34px",
          width: "870px",
          minHeight: "194px",
          backgroundColor: "rgba(255, 255, 255, 0.42)",
          border: "1px solid rgba(255, 255, 255, 0.52)",
          borderRadius: "16px",
          padding: "24px 20px",
        }}
      >
        <p
          className="leading-[1.12] text-[#354A93]"
          style={{ fontSize: "24px" }}
        >
          *Hình ảnh tải lên là hình ảnh chân dung, rõ nét
          <br />
          *Mỗi user chỉ được tối đa 2 lần tải lên hình ảnh
          <br />
          *Để video có hình ảnh đẹp, hình ảnh chân dung vui lòng
          <br />
          mặc trang phục lịch sự, màu sắc phù hợp với video ban đầu
        </p>
      </div>
    </div>
  );
}
