import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BETAGEN CASTING DIỄN VIÊN - TRÚNG NGAY QUÀ XỊN | Betagen",
  description:
    "Tham gia chương trình Betagen Casting, tạo video cá nhân hóa và nhận cơ hội trúng quà xịn từ Betagen!",
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
