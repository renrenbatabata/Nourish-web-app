"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

type Profile = {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
};

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    age: "",
    gender: "",
    height: "",
    weight: "",
    activityLevel: "normal",
  });
  const [saving, setSaving] = useState(false);

  const canSave =
    profile.age && profile.gender && profile.height && profile.weight;

  const handleSave = async () => {
    if (!user || !canSave) return;
    setSaving(true);
    await setDoc(doc(db, "users", user.uid), profile);
    router.replace("/");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#FDF6F0] flex flex-col items-center justify-center px-4 font-sans">
      <div className="max-w-sm w-full space-y-5">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-extrabold text-[#7a3545]">
            🌸 はじめまして！
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            あなたに合った栄養バランスを分析するために、少し教えてね
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border-[1.5px] border-[#F9C6D0] shadow-sm space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#7a3545]">年齢</p>
            <input
              type="number"
              placeholder="例：25"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: e.target.value })}
              className="w-full bg-[#FFF5F7] rounded-xl p-2.5 text-xs border border-[#F9C6D0] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-[#7a3545]">性別</p>
            <div className="flex gap-2">
              {[
                { value: "female", label: "女性" },
                { value: "male", label: "男性" },
                { value: "other", label: "その他" },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setProfile({ ...profile, gender: g.value })}
                  className={`flex-1 rounded-xl p-2 text-xs font-bold transition ${profile.gender === g.value ? "bg-[#F9C6D0] text-[#7a3545]" : "bg-gray-100 text-gray-400"}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-[#7a3545]">身長 (cm)</p>
            <input
              type="number"
              placeholder="例：158"
              value={profile.height}
              onChange={(e) =>
                setProfile({ ...profile, height: e.target.value })
              }
              className="w-full bg-[#FFF5F7] rounded-xl p-2.5 text-xs border border-[#F9C6D0] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-[#7a3545]">体重 (kg)</p>
            <input
              type="number"
              placeholder="例：52"
              value={profile.weight}
              onChange={(e) =>
                setProfile({ ...profile, weight: e.target.value })
              }
              className="w-full bg-[#FFF5F7] rounded-xl p-2.5 text-xs border border-[#F9C6D0] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-[#7a3545]">活動レベル</p>
            <div className="flex gap-2">
              {[
                { value: "low", label: "低め" },
                { value: "normal", label: "普通" },
                { value: "high", label: "高め" },
              ].map((a) => (
                <button
                  key={a.value}
                  onClick={() =>
                    setProfile({ ...profile, activityLevel: a.value })
                  }
                  className={`flex-1 rounded-xl p-2 text-xs font-bold transition ${profile.activityLevel === a.value ? "bg-[#F9C6D0] text-[#7a3545]" : "bg-gray-100 text-gray-400"}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className={`w-full rounded-2xl py-3.5 text-sm font-bold transition ${canSave ? "bg-[#F9C6D0] text-white hover:opacity-90" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          {saving ? "保存中..." : "はじめる 🌸"}
        </button>

        <button
          onClick={() => router.replace("/")}
          className="w-full text-center text-[10px] text-gray-400 hover:text-gray-600"
        >
          あとで設定する
        </button>
      </div>
    </div>
  );
}
