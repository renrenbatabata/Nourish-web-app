"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";
import { auth } from "../../firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getProviderLabel = (providerId: string) => {
    if (providerId === "google.com") return "🔵 Google";
    if (providerId === "password") return "📧 メール";
    return providerId;
  };

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#4a3f3a] font-sans pb-20">
      <div className="max-w-md mx-auto">
        <ScreenHeader source="/header.png" height={100} />
        <div className="p-4 space-y-4">
          <h1 className="text-sm font-extrabold text-[#7a3545]">⚙️ 設定</h1>

          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#F9C6D0] shadow-sm space-y-3">
            <h2 className="text-xs font-extrabold text-[#D9768A]">👤 アカウント情報</h2>

            {loading && (
              <p className="text-xs text-gray-400">読み込み中...</p>
            )}

            {!loading && user && (
              <div className="space-y-2">
                <div className="bg-[#FFF5F7] rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-gray-400">メールアドレス</p>
                  <p className="text-xs font-bold">{user.email ? user.email : "未設定"}</p>
                </div>
                <div className="bg-[#FFF5F7] rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-gray-400">ユーザーID</p>
                  <p className="text-[10px] text-gray-500 break-all">{user.uid}</p>
                </div>
                <div className="bg-[#FFF5F7] rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-gray-400">ログイン方法</p>
                  <p className="text-xs font-bold">
                    {user.providerData[0] ? getProviderLabel(user.providerData[0].providerId) : "不明"}
                  </p>
                </div>
              </div>
            )}

            {!loading && !user && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">ログインしていません</p>

                <a
                  href="/login"
                  className="block w-full text-center bg-[#F9C6D0] text-[#7a3545] rounded-xl p-2.5 text-xs font-bold hover:opacity-80 transition"
                >
                  ログインする
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}