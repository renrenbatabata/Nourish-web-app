"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabNavigation() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  // メニューの項目設定（アイコン、ラベル、リンク先）
  const navItems = [
    { icon: "🏠", label: "ホーム", path: "/" },
    { icon: "📅", label: "記録", path: "/history" },
    { icon: "📖", label: "食材図鑑", path: "/foodbook" },
    { icon: "🥦", label: "栄養素", path: "/nutrition" },
    { icon: "⚙️", label: "設定", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#F5F0E8] py-2 px-4 flex justify-around items-center z-50 max-w-md mx-auto rounded-t-2xl shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center gap-0.5 flex-1 group transition-all"
          >
            <span
              className={`text-xl transition-transform group-active:scale-90 ${isActive ? "scale-110" : "opacity-60"}`}
            >
              {item.icon}
            </span>
            {/* 文字部分 */}
            <span
              className={`text-[10px] font-bold tracking-wider transition-colors ${
                isActive ? "text-[#D9768A]" : "text-[#9a8a84]"
              }`}
            >
              {item.label}
            </span>
            {/* 選ばれているときの下の可愛いピンクのポチ */}
            {isActive && (
              <div className="w-1 h-1 bg-[#D9768A] rounded-full mt-0.5 animate-pulse" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
