"use client";

export default function NoteSection() {
  const notes = [
    "Hình ảnh tải lên là hình ảnh chân dung, rõ nét",
    "Mỗi user chỉ được tối đa 2 lần tải lên hình ảnh",
    "Để video có hình ảnh đẹp, hình ảnh chân dung vui lòng mặc trang phục lịch sự, màu sắc phù hợp với video ban đầu",
  ];

  return (
    <div className="relative w-full">
      <h3
        className="font-black leading-none text-[#354A93]"
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
          padding: "22px 28px",
        }}
      >
        <div className="flex flex-col gap-1.5">
          {notes.map((note) => (
            <p
              key={note}
              className="text-[#354A93]"
              style={{ fontSize: "19px", lineHeight: 1.32 }}
            >
              *{note}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
