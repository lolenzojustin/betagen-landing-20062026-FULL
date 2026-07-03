import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIVU TỐT BỤNG - TRÚNG QUÀ CỰC MÊ | Betagen",
  description: "Tham gia chương trình VIVU Tốt Bụng của Betagen, tạo video cá nhân hóa và trúng quà cực mê!",
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
