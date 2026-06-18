"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

type Profile = {
  age: string;
  gender: string;
  height: string;
  weight: string;
  activityLevel: string;
};

type NutrientTarget = {
  label: string;
  unit: string;
  value: number;
};

const calcTargets = (profile: Profile): NutrientTarget[] => {
  const age = parseInt(profile.age) || 25;
  const height = parseFloat(profile.height) || 160;
  const weight = parseFloat(profile.weight) || 55;
  const isFemale = profile.gender === "female";
  const activity = profile.activityLevel;

  const bmr = isFemale
    ? 655 + 9.6 * weight + 1.8 * height - 4.7 * age
    : 66 + 13.7 * weight + 5 * height - 6.8 * age;

  const activityMultiplier =
    activity === "low" ? 1.4 : activity === "high" ? 1.75 : 1.55;
  const energy = Math.round(bmr * activityMultiplier);

  const protein = isFemale ? (age >= 50 ? 50 : 50) : age >= 50 ? 60 : 65;
  const fat = Math.round((energy * 0.25) / 9);
  const carbs = Math.round((energy * 0.55) / 4);
  const vitaminC = 100;
  const calcium = isFemale ? 650 : 750;
  const iron = isFemale && age < 50 ? 10.5 : 7.5;

  return [
    { label: "エネルギー", unit: "kcal/日", value: energy },
    { label: "タンパク質", unit: "g/日", value: protein },
    { label: "脂質", unit: "g/日", value: fat },
    { label: "炭水化物", unit: "g/日", value: carbs },
    { label: "ビタミンC", unit: "mg/日", value: vitaminC },
    { label: "カルシウム", unit: "mg/日", value: calcium },
    { label: "鉄", unit: "mg/日", value: iron },
  ];
};

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setProfile(snap.data() as Profile);
    };
    if (user) fetchProfile();
  }, [user]);

  if (loading) return null;

  const genderLabel =
    profile?.gender === "female"
      ? "女性"
      : profile?.gender === "male"
        ? "男性"
        : "その他";

  const activityLabel =
    profile?.activityLevel === "low"
      ? "低め"
      : profile?.activityLevel === "high"
        ? "高め"
        : "普通";

  const targets = profile ? calcTargets(profile) : [];

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-green-400 font-mono p-6 pb-20">
      <h1 className="text-lg font-bold mb-1">🛠 DEBUG MODE</h1>
      <p className="text-[10px] text-green-600 mb-4">
        taberu-web / nutrition engine v0.1
      </p>

      {!profile ? (
        <p className="text-yellow-400 text-xs">⚠ プロフィール未設定</p>
      ) : (
        <>
          {/* ユーザープロフィール */}
          <div className="bg-[#0d0d1a] rounded-xl p-4 mb-4 space-y-1 border border-green-900">
            <p className="text-[10px] text-green-600 mb-2">
              {"// USER PROFILE"}
            </p>
            <p className="text-xs">
              年齢: <span className="text-white">{profile.age}歳</span>
            </p>
            <p className="text-xs">
              性別: <span className="text-white">{genderLabel}</span>
            </p>
            <p className="text-xs">
              身長:{" "}
              <span className="text-white">
                {profile.height || "未設定"}
                {profile.height ? "cm" : ""}
              </span>
            </p>
            <p className="text-xs">
              体重:{" "}
              <span className="text-white">
                {profile.weight || "未設定"}
                {profile.weight ? "kg" : ""}
              </span>
            </p>
            <p className="text-xs">
              活動量: <span className="text-white">{activityLabel}</span>
            </p>
          </div>

          {/* 基礎代謝の計算式 */}
          <div className="bg-[#0d0d1a] rounded-xl p-4 mb-4 border border-green-900">
            <p className="text-[10px] text-green-600 mb-2">
              {"// BMR CALCULATION (Harris-Benedict)"}
            </p>
            <p className="text-[10px] text-green-400 leading-relaxed">
              {profile.gender === "female"
                ? `655 + 9.6×${profile.weight} + 1.8×${profile.height} - 4.7×${profile.age}`
                : `66 + 13.7×${profile.weight} + 5×${profile.height} - 6.8×${profile.age}`}
            </p>
            <p className="text-xs text-white mt-1">
              基礎代謝:{" "}
              <span className="text-yellow-400 font-bold">
                {Math.round(
                  profile.gender === "female"
                    ? 655 +
                        9.6 * parseFloat(profile.weight || "55") +
                        1.8 * parseFloat(profile.height || "160") -
                        4.7 * parseInt(profile.age || "25")
                    : 66 +
                        13.7 * parseFloat(profile.weight || "55") +
                        5 * parseFloat(profile.height || "160") -
                        6.8 * parseInt(profile.age || "25"),
                )}{" "}
                kcal
              </span>
            </p>
          </div>

          {/* 一日の栄養素目標値 */}
          <div className="bg-[#0d0d1a] rounded-xl p-4 space-y-2 border border-green-900">
            <p className="text-[10px] text-green-600">
              {"// DAILY NUTRIENT TARGETS"}
            </p>
            <p className="text-[9px] text-green-700 mb-2">
              参考: 日本人の食事摂取基準2020
            </p>
            {targets.map((t) => (
              <div
                key={t.label}
                className="flex justify-between items-center border-b border-green-900 pb-1"
              >
                <span className="text-xs text-green-300">{t.label}</span>
                <span className="text-xs text-white font-bold">
                  {t.value} <span className="text-green-600">{t.unit}</span>
                </span>
              </div>
            ))}
          </div>

          {/* AIスコアリング方法 */}
          <div className="bg-[#0d0d1a] rounded-xl p-4 mt-4 border border-green-900">
            <p className="text-[10px] text-green-600 mb-2">
              {"// AI SCORING METHOD"}
            </p>
            <p className="text-[10px] text-green-400 leading-relaxed">
              食事写真 → Claude Vision API (PUT /api/analyze){"\n"}→
              プロフィール情報をプロンプトに含める{"\n"}→
              各栄養素の達成率(0-100%)をJSONで返す{"\n"}→ 複数食の合計をMin(100,
              sum)でゲージに反映
            </p>
          </div>
        </>
      )}

      <p className="text-[9px] text-green-900 mt-6 text-center">
        /debug — internal use only
      </p>
    </div>
  );
}
