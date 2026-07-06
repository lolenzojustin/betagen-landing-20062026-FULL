import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BETAGEN CASTING DIỄN VIÊN - TRÚNG NGAY QUÀ XỊN | Betagen",
  description:
    "Betagen mở buổi thử vai: gửi ảnh chân dung, bước vào TVC cùng Quang Hùng MasterD và Khoai Lang Thang, nhận cơ hội trúng quà xịn.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
