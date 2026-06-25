"use client";

import Image from "next/image";

/* Header is no longer used as a standalone component.
   The logo and nav buttons are part of HeroSection per Figma design.
   Keeping this file for potential future use. */

interface HeaderProps {
  onNavigate?: (section: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  return (
    <header
      className="absolute left-0 top-0 z-20 flex w-full items-center justify-between"
      style={{ padding: "30px 60px" }}
    >
      <Image
        src="/images/logo/logo-betagen.png"
        alt="Betagen Logo"
        width={160}
        height={80}
        className="h-auto object-contain"
        style={{ width: "150px" }}
        priority
      />
      <nav className="flex items-center gap-3">
        <button
          onClick={() => onNavigate?.("video")}
          className="rounded-full bg-[#EA0029] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c90024]"
        >
          Tạo video &amp; Thể lệ
        </button>
        <button
          onClick={() => onNavigate?.("prize")}
          className="rounded-full bg-[#EA0029] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c90024]"
        >
          Giải thưởng
        </button>
        <button
          onClick={() => onNavigate?.("note")}
          className="rounded-full bg-[#EA0029] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#c90024]"
        >
          Lưu ý
        </button>
      </nav>
    </header>
  );
}
