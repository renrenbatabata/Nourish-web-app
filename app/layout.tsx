"use client";

import "./globals.css";
import { TabNavigation } from "./components/TabNavigation"; // ⭕ 追加

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      {/* ⭕ pb-16 を足して、メニューバーに文字が被らないように底上げします */}
      <body className="min-h-full flex flex-col bg-[#FDF6F0] pb-16">

        {/* メインコンテンツ */}
        <main className="flex-1">{children}</main>

        {/* ⭕ 画面下ナビゲーションを配置！ */}
        <TabNavigation />

      </body>
    </html>
  );
}