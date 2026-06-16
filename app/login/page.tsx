"use client";

import { auth } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Login() {
  // WEB用の超シンプルなGoogleログイン処理✨
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // ポップアップウィンドウで使い慣れたGoogleログイン画面が開きます
      await signInWithPopup(auth, provider);

      // 💡 ログイン成功後の処理を入れる場合はここに書きます（例: 画面遷移など）
      // window.location.href = "/";
    } catch (error) {
      console.error("Googleログインエラー:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6F0] flex flex-col items-center justify-center gap-4 text-center px-4 font-sans antialiased">
      {/* ふんわり浮き出るような優しい雰囲気のカードデザイン */}
      <div className="bg-white/40 p-8 rounded-3xl border border-pink-100/60 shadow-xs max-w-sm w-full space-y-4">
        <h1 className="text-4xl font-extrabold text-[#7a3545] tracking-wide animate-pulse">
          🌸 Nourish
        </h1>

        <p className="text-xs text-[#9a8a84] font-medium leading-relaxed">
          食べることは、自分を大切にすること
        </p>

        {/* Googleログインボタン */}
        <button
          onClick={signInWithGoogle}
          className="w-full bg-[#F9C6D0] text-[#D9768A] rounded-2xl py-3.5 px-6 text-sm font-bold shadow-xs transition-all duration-200 mt-6 hover:bg-[#fa375c]/10 hover:shadow-md active:scale-[0.98]"
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
}
