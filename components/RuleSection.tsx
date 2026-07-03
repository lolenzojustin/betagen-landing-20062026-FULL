"use client";

const rules = [
  {
    step: "BƯỚC 1",
    text: (
      <>
        Nhấn chọn <strong>&quot;Tải lên hình ảnh của bạn&quot;</strong> &amp; tải
        lên hình chân dung cá nhân phù hợp với yêu cầu.
      </>
    ),
  },
  {
    step: "BƯỚC 3",
    text: (
      <>
        Đăng video có sự xuất hiện của bạn lên Facebook cá nhân, kèm{" "}
        <strong>#Betagen #MenTaMeLaBetagen</strong>
      </>
    ),
  },
  {
    step: "BƯỚC 2",
    text: (
      <>
        Sau khi có video,
        <br />
        bấm chọn <strong>&quot;Tải xuống&quot;</strong>
      </>
    ),
  },
  {
    step: "BƯỚC 4",
    text: (
      <>
        Bình luận link video tại bài đăng{" "}
        <strong>Minigame trên Fanpage Betagen</strong>
      </>
    ),
  },
];

export default function RuleSection() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: "246px",
        background:
          "radial-gradient(ellipse at 48% 0%, rgba(255, 255, 255, 0.96) 0%, rgba(220, 246, 255, 0.94) 42%, rgba(132, 217, 251, 0.96) 100%)",
        boxShadow:
          "0 18px 48px rgba(53, 74, 147, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.72)",
        border: "1px solid rgba(255, 255, 255, 0.68)",
        borderRadius: "30px",
        padding: "34px 38px 28px",
      }}
    >
      <h3
        className="betagen-heading leading-none text-[#354A93]"
        style={{ fontSize: "39px", marginBottom: "27px" }}
      >
        THỂ LỆ
      </h3>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "1fr 1fr",
          columnGap: "20px",
          rowGap: "20px",
        }}
      >
        {rules.map((rule) => (
          <div
            key={rule.step}
            className="flex items-center"
            style={{
              height: "52px",
              background:
                "linear-gradient(90deg, rgba(255, 255, 255, 0.92) 0%, rgba(190, 235, 253, 0.92) 100%)",
              borderRadius: "12px",
              boxShadow: "0 8px 18px rgba(53, 74, 147, 0.08)",
              padding: "6px 18px 6px 0",
            }}
          >
            <div
              className="flex h-full shrink-0 items-center justify-center bg-white"
              style={{
                width: "128px",
                borderRadius: "12px 0 0 12px",
                boxShadow: "8px 0 18px rgba(53, 74, 147, 0.06)",
              }}
            >
              <span
                className="betagen-strong flex items-center justify-center rounded-full bg-[#EA0029] leading-none text-white"
                style={{
                  width: "96px",
                  height: "29px",
                  fontSize: "14px",
                }}
              >
                {rule.step}
              </span>
            </div>

            <p
              className="leading-[1.2] text-black"
              style={{
                fontSize: "15px",
                marginLeft: "23px",
              }}
            >
              {rule.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
