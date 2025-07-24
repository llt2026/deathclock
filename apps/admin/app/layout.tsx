import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "More Minutes 管理后台",
  description: "More Minutes 应用管理控制台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-100 text-gray-900">{children}</body>
    </html>
  );
} 