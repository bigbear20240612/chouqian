import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "多功能抽签系统 - 让课堂更有趣",
  description: "一个功能完善、界面活泼可爱的抽签系统，专为课堂教学活动设计",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
          {children}
        </div>
      </body>
    </html>
  );
}
