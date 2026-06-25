"use client";

import Image from "next/image";

interface HeroSectionProps {
  onCreateVideo?: () => void;
}

export default function HeroSection({ onCreateVideo }: HeroSectionProps) {
  return (
    <section id="hero-section" className="design-section">
      <div className="design-stage">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 620px 460px at 40% 42%, #F7FDFF 0%, #BEEBFD 42%, #84D9FB 100%)",
          }}
        />

        <div className="absolute z-20" style={{ left: "107px", top: "42px" }}>
          <Image
            src="/images/logo/logo-betagen.png"
            alt="Betagen Logo"
            width={151}
            height={44}
            className="h-auto"
            style={{ width: "151px", height: "auto" }}
            priority
          />
        </div>

        <div
          className="absolute z-20 flex items-center"
          style={{ left: "865px", top: "44px", gap: "26px" }}
        >
          <button className="h-[42px] rounded-full bg-[#EA0029] px-5 text-[17px] font-bold leading-none text-white transition-colors hover:bg-[#c90024]">
            Tạo video &amp; Thể lệ
          </button>
          <button className="h-[42px] rounded-full bg-[#EA0029] px-5 text-[17px] font-bold leading-none text-white transition-colors hover:bg-[#c90024]">
            Giải thưởng
          </button>
          <button className="h-[42px] rounded-full bg-[#EA0029] px-5 text-[17px] font-bold leading-none text-white transition-colors hover:bg-[#c90024]">
            Lưu ý
          </button>
        </div>

        <Image
          src="/images/01-section-hero/hero-main-visual.png"
          alt="Betagen campaign visual"
          width={1440}
          height={838}
          className="hero-main-visual absolute z-10 object-contain"
          style={{
            left: "0",
            top: "0",
            width: "1440px",
            height: "auto",
          }}
          priority
        />

        <div
          className="absolute z-20 flex flex-col items-center"
          style={{ left: "810px", top: "183px", width: "575px" }}
        >
          <h1
            className="text-center font-black leading-[1.16] text-white"
            style={{
              fontSize: "43px",
              textShadow: "0 2px 16px rgba(0,0,0,0.1)",
              whiteSpace: "nowrap",
            }}
          >
            VIVU TỐT BỤNG
            <br />
            TRÚNG QUÀ CỰC MÊ
          </h1>

          <p
            className="mt-6 text-center leading-[1.45]"
            style={{
              fontSize: "16px",
              color: "#354A93",
              maxWidth: "535px",
            }}
          >
            Tải ảnh chân dung, tạo video VIVU Tốt Bụng của riêng bạn và tham
            gia chương trình nhận quà hấp dẫn từ Betagen trong năm 2026.
          </p>

          <button
            onClick={onCreateVideo}
            className="mt-9 flex h-[42px] w-[198px] items-center justify-center gap-2 rounded-full bg-[#EA0029] font-black text-white transition-transform hover:scale-105 active:scale-95"
            style={{ fontSize: "14px" }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path
                d="M12 8V16M8 12H16"
                stroke="white"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            TẠO VIDEO NGAY
          </button>
        </div>
      </div>
    </section>
  );
}
