import "./globals.css";
import { TabNavigation } from "./components/TabNavigation";

export const metadata = {
  title: "Nourish 🌸",
  description: "食べることは、自分を大切にすること",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <body className="min-h-full flex flex-col bg-[#FDF6F0] pb-16">
        {/* メインコンテンツ */}
        <main className="flex-1">{children}</main>

        {/* 画面下ナビゲーション */}
        <TabNavigation />
      </body>
    </html>
  );
}
