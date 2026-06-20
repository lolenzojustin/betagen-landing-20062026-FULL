import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIVU TỐT BỤNG - TRÚNG QUÀ CỰC MÊ | Betagen",
  description: "Tham gia chương trình VIVU Tốt Bụng của Betagen, tạo video cá nhân hóa và trúng quà cực mê!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={geistSans.variable}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
