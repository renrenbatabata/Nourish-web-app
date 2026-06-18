"use client";

import { useEffect, useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Profile = {
  age: string;
  gender: string;
  activityLevel: string;
  height: string;
  weight: string;
};

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile>({
    age: "",
    gender: "",
    activityLevel: "normal",
    height: "",
    weight: "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfile(snap.data() as Profile);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProfileLoading(false);
      }
    };
    if (user) fetchProfile();
    else setTimeout(() => setProfileLoading(false), 0);
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const getProviderLabel = (providerId: string) => {
    if (providerId === "google.com") return "🔵 Google";
    if (providerId === "password") return "📧 メール";
    return providerId;
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#4a3f3a] font-sans pb-20">
      <div className="max-w-md mx-auto">
        <ScreenHeader source="/header.png" height={100} />
        <div className="p-4 space-y-4">
          <h1 className="text-sm font-extrabold text-[#7a3545]">⚙️ 設定</h1>

          {/* プロフィール */}
          {!loading && user && (
            <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#C5E8D8] shadow-sm space-y-3">
              <h2 className="text-xs font-extrabold text-[#2a6649]">
                🌿 プロフィール
              </h2>
              {profileLoading ? (
                <p className="text-xs text-gray-400">読み込み中...</p>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400">年齢</p>
                    <input
                      type="number"
                      placeholder="例：25"
                      value={profile.age}
                      onChange={(e) =>
                        setProfile({ ...profile, age: e.target.value })
                      }
                      className="w-full bg-[#F5FBF7] rounded-xl p-2.5 text-xs border border-[#C5E8D8] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400">身長 (cm)</p>
                    <input
                      type="number"
                      placeholder="例：158"
                      value={profile.height}
                      onChange={(e) =>
                        setProfile({ ...profile, height: e.target.value })
                      }
                      className="w-full bg-[#F5FBF7] rounded-xl p-2.5 text-xs border border-[#C5E8D8] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400">体重 (kg)</p>
                    <input
                      type="number"
                      placeholder="例：52"
                      value={profile.weight}
                      onChange={(e) =>
                        setProfile({ ...profile, weight: e.target.value })
                      }
                      className="w-full bg-[#F5FBF7] rounded-xl p-2.5 text-xs border border-[#C5E8D8] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400">性別</p>
                    <div className="flex gap-2">
                      {[
                        { value: "female", label: "女性" },
                        { value: "male", label: "男性" },
                        { value: "other", label: "その他" },
                      ].map((g) => (
                        <button
                          key={g.value}
                          onClick={() =>
                            setProfile({ ...profile, gender: g.value })
                          }
                          className={`flex-1 rounded-xl p-2 text-xs font-bold transition ${profile.gender === g.value ? "bg-[#C5E8D8] text-[#2a6649]" : "bg-gray-100 text-gray-400"}`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400">活動レベル</p>
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
                          className={`flex-1 rounded-xl p-2 text-xs font-bold transition ${profile.activityLevel === a.value ? "bg-[#C5E8D8] text-[#2a6649]" : "bg-gray-100 text-gray-400"}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={saveProfile}
                    className={`w-full rounded-xl p-2.5 text-xs font-bold transition ${profileSaved ? "bg-[#C5E8D8] text-[#2a6649]" : "bg-[#9FE1CB] text-white hover:opacity-80"}`}
                  >
                    {profileSaved ? "保存しました ✓" : "プロフィールを保存"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* アカウント情報 */}
          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#F9C6D0] shadow-sm space-y-3">
            <h2 className="text-xs font-extrabold text-[#D9768A]">
              👤 アカウント情報
            </h2>
            {loading && <p className="text-xs text-gray-400">読み込み中...</p>}
            {!loading && user && (
              <div className="space-y-2">
                <div className="bg-[#FFF5F7] rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-gray-400">メールアドレス</p>
                  <p className="text-xs font-bold">
                    {user.email ? user.email : "未設定"}
                  </p>
                </div>
                <div className="bg-[#FFF5F7] rounded-xl p-3 space-y-1">
                  <p className="text-[10px] text-gray-400">ログイン方法</p>
                  <p className="text-xs font-bold">
                    {user.providerData[0]
                      ? getProviderLabel(user.providerData[0].providerId)
                      : "不明"}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-100 text-gray-500 rounded-xl p-2.5 text-xs font-bold hover:opacity-80 transition"
                >
                  ログアウト
                </button>
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
