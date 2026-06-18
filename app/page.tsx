"use client";

import { useState } from "react";
import { ScreenHeader } from "./components/ScreenHeader";
import Image from "next/image";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAnalyzeFood } from "./hooks/useAnalyzeFood";
import { useAuth } from "./hooks/useAuth";

type Meal = {
  photo: string | null;
  message: string;
};

type Meals = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
};

type Snack = {
  id: string;
  note: string;
  time: string;
  photo: string | null;
  message: string;
};

export default function Home() {
  const { user, loading } = useAuth(true);
  const [meals, setMeals] = useState<Meals>({
    breakfast: { photo: null, message: "朝から脳にエネルギーを届けられたね！" },
    lunch: {
      photo: null,
      message: "お昼もしっかり食べられたね。体が喜んでいるよ！",
    },
    dinner: {
      photo: null,
      message: "夜ごはんも食べられたね。今日もよく頑張ったね🌙",
    },
  });

  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [snackInput, setSnackInput] = useState("");
  const [diaryNote, setDiaryNote] = useState("");
  const [diarySaved, setDiarySaved] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [pastMealInput, setPastMealInput] = useState("");

  const { analyzeFood, analyzeFoodFree } = useAnalyzeFood(setMeals);

  const [mealHistory, setMealHistory] = useState<Record<string, string[]>>({
    "2026-06-04": ["breakfast", "lunch", "dinner"],
    "2026-06-05": ["breakfast", "lunch"],
    "2026-06-06": ["breakfast"],
  });
  if (loading) return null;
  const todayDate = new Date();
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const todayLabel = `今日 ${todayDate.getMonth() + 1}月${todayDate.getDate()}日（${dayNames[todayDate.getDay()]}）`;
  const todayKey = todayDate.toISOString().split("T")[0];

  const mealConfig = [
    {
      key: "breakfast" as keyof Meals,
      icon: "🌅",
      label: "朝ごはん",
      borderColor: "border-[#F5B8C4]",
      bgColor: "bg-[#FFF5F7]",
      tagColor: "bg-[#F9C6D0]",
    },
    {
      key: "lunch" as keyof Meals,
      icon: "☀️",
      label: "昼ごはん",
      borderColor: "border-[#F5C97A]",
      bgColor: "bg-[#FFFDF0]",
      tagColor: "bg-[#FAE095]",
    },
    {
      key: "dinner" as keyof Meals,
      icon: "🌙",
      label: "夜ごはん",
      borderColor: "border-[#B8D8C8]",
      bgColor: "bg-[#F5FBF7]",
      tagColor: "bg-[#C5E8D8]",
    },
  ];

  const nutrients = [
    {
      label: "🌾 炭水化物",
      hint: "脳のガソリン",
      color: "bg-[#FAC775]",
      width: "80%",
      comment: "いい感じ！集中力を支えてくれてるよ",
    },
    {
      label: "🥑 脂質",
      hint: "細胞のバリア",
      color: "bg-[#F5C4B3]",
      width: "55%",
      comment: "もう少し。ナッツやアボカドもいいよ🥑",
    },
    {
      label: "🍗 タンパク質",
      hint: "髪・肌・筋肉の材料",
      color: "bg-[#9FE1CB]",
      width: "75%",
      comment: "いい調子！髪がツヤツヤになってくるよ✨",
    },
    {
      label: "🥦 ビタミン",
      hint: "肌と免疫を守る",
      color: "bg-[#C0DD97]",
      width: "90%",
      comment: "すごい！肌がきれいになってる途中🌿",
    },
    {
      label: "🦴 ミネラル",
      hint: "骨・血液を作る",
      color: "bg-[#B5D4F4]",
      width: "60%",
      comment: "乳製品や小魚があると嬉しい🐟",
    },
  ];

  const handleMealImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mealKey: keyof Meals,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fakeUri = URL.createObjectURL(file);

    setMeals((prev) => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], photo: fakeUri, message: "分析中...🌸" },
    }));

    setMealHistory((prev) => ({
      ...prev,
      [todayKey]: [...(prev[todayKey] || []), mealKey],
    }));

    await addDoc(collection(db, "meals"), {
      mealType: mealKey,
      photoUri: fakeUri,
      date: new Date().toISOString(),
      uid: user?.uid ?? "anonymous",
    });

    await analyzeFood(fakeUri, mealKey);
  };

  const addSnack = async () => {
    if (!snackInput.trim()) return;
    const newSnack: Snack = {
      id: Date.now().toString(),
      note: snackInput,
      time: new Date().toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      photo: null,
      message: "",
    };
    setSnacks((prev) => [...prev, newSnack]);
    await addDoc(collection(db, "snacks"), {
      note: snackInput,
      date: new Date().toISOString(),
      uid: user?.uid ?? "anonymous",
    });
    setSnackInput("");
  };

  const handleSnackImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    snackId: string,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const fakeUri = URL.createObjectURL(file);

    setSnacks((prev) =>
      prev.map((s) =>
        s.id === snackId ? { ...s, photo: fakeUri, message: "分析中...🌸" } : s,
      ),
    );

    await analyzeFoodFree(
      fakeUri,
      (msg) => {
        setSnacks((prev) =>
          prev.map((s) => (s.id === snackId ? { ...s, message: msg } : s)),
        );
      },
      () => {
        setSnacks((prev) =>
          prev.map((s) =>
            s.id === snackId ? { ...s, message: "記録できたね🌸" } : s,
          ),
        );
      },
    );
  };

  const saveDiary = async () => {
    if (!diaryNote.trim()) return;
    await addDoc(collection(db, "diary"), {
      note: diaryNote,
      date: new Date().toISOString(),
      uid: user?.uid ?? "anonymous",
    });
    setDiarySaved(true);
    alert("日記を保存したよ🌸");
  };

  const addPastMeal = async () => {
    if (!selectedDay || !pastMealInput.trim()) return;
    setMealHistory((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), "past"],
    }));
    await addDoc(collection(db, "meals"), {
      mealType: "past",
      note: pastMealInput,
      date: new Date(selectedDay).toISOString(),
    });
    setPastMealInput("");
    setSelectedDay(null);
  };

  return (
    <div className="min-h-screen bg-[#FDF6F0] px-0 text-[#4a3f3a] font-sans antialiased pb-10">
      <div className="max-w-md mx-auto">
        <ScreenHeader source="/header.png" height={100} />

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-[#F9C6D0]" />
            <p className="text-sm font-bold tracking-wider text-[#7a3545] px-2">
              {todayLabel || "今日"}
            </p>
            <div className="h-px flex-1 bg-[#F9C6D0]" />
          </div>

          <div className="flex gap-2">
            {mealConfig.map((meal) => {
              const data = meals[meal.key];
              return (
                <div
                  key={meal.key}
                  className={`flex-1 rounded-2xl border-[1.5px] p-2 flex flex-col justify-between ${meal.borderColor} ${meal.bgColor}`}
                >
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full self-start ${meal.tagColor}`}
                  >
                    <span className="text-[10px]">{meal.icon}</span>
                    <span className="text-[9px] font-bold">{meal.label}</span>
                  </div>
                  {data.photo ? (
                    <div className="mt-2 flex flex-col gap-1">
                      <Image
                        src={data.photo}
                        alt={meal.label}
                        width={400}
                        height={80}
                        className="w-full h-20 object-cover rounded-xl"
                        unoptimized
                      />
                      <p className="text-[9px] text-[#7a6070] leading-tight h-9 overflow-hidden">
                        {data.message}
                      </p>
                      <label className="text-center text-[9px] text-gray-400 cursor-pointer block mt-1 hover:text-gray-600">
                        変更
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleMealImageChange(e, meal.key)}
                        />
                      </label>
                    </div>
                  ) : (
                    <label
                      className={`mt-3 border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1 ${meal.borderColor} cursor-pointer hover:opacity-70 transition`}
                    >
                      <span className="text-base">📷</span>
                      <span className="text-[9px] text-gray-400 text-center leading-tight">
                        写真を
                        <br />
                        追加する
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleMealImageChange(e, meal.key)}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#FBF0B2] space-y-3 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#7a6010]">
              🍵 間食・ドリンク記録
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例：コーヒー、りんご..."
                className="flex-1 bg-[#FFFDF0] rounded-xl p-2.5 text-xs border border-[#FBF0B2] focus:outline-none"
                value={snackInput}
                onChange={(e) => setSnackInput(e.target.value)}
              />
              <button
                onClick={addSnack}
                className="bg-[#FAE095] text-[#7a6010] px-4 rounded-xl text-xs font-bold hover:opacity-80 transition"
              >
                追加
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {snacks.map((s) => (
                <div
                  key={s.id}
                  className="border-t border-[#F5F0E8] pt-2 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-400 w-9">
                      {s.time}
                    </span>
                    <p className="text-xs flex-1 font-medium">{s.note}</p>
                    <label className="cursor-pointer p-1 hover:bg-gray-100 rounded-lg">
                      <span className="text-sm">📷</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSnackImageChange(e, s.id)}
                      />
                    </label>
                  </div>
                  {s.photo && (
                    <div className="flex flex-col gap-1 bg-gray-50 p-2 rounded-xl">
                      <Image
                        src={s.photo}
                        alt="snack"
                        width={400}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                        unoptimized
                      />
                      {s.message && (
                        <p className="text-[10px] text-[#7a6070]">
                          {s.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#F9C6D0] space-y-2 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#D9768A]">
              📝 今日の一言日記
            </h2>
            <p className="text-[10px] text-gray-400">
              今日の気持ちや気づいたこと、なんでも書いてね🌸
            </p>
            <textarea
              placeholder="今日はどんな一日でしたか？"
              className="w-full bg-[#FFF5F7] rounded-xl p-3 text-xs border border-[#F9C6D0] focus:outline-none resize-none h-20"
              value={diaryNote}
              onChange={(e) => {
                setDiaryNote(e.target.value);
                setDiarySaved(false);
              }}
            />
            <button
              onClick={saveDiary}
              className={`w-full p-2.5 rounded-xl text-xs font-bold transition ${diarySaved ? "bg-[#C5E8D8] text-gray-700" : "bg-[#F9C6D0] text-white hover:opacity-90"}`}
            >
              {diarySaved ? "保存済み ✓" : "保存する"}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#E8E0F8] space-y-3 shadow-sm">
            <h2 className="text-xs font-extrabold text-[#3d2d7a]">
              🌿 今日の栄養バランス
            </h2>
            <div className="space-y-3">
              {nutrients.map((n) => (
                <div key={n.label} className="text-[11px]">
                  <div className="flex justify-between text-gray-600 mb-1">
                    <span className="font-semibold">{n.label}</span>
                    <span className="text-[9px] text-gray-400">{n.hint}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F0EEF8] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${n.color}`}
                      style={{ width: n.width }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5">{n.comment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#E8E0F8] space-y-3 shadow-sm">
            <h2 className="text-xs font-extrabold text-gray-700">
              📅 6月の食事カレンダー
            </h2>
            <p className="text-[10px] text-gray-400">
              📌 日付をタップすると過去の記録を追加できるよ
            </p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {["月", "火", "水", "木", "金", "土", "日"].map((d) => (
                <span key={d} className="text-[10px] text-gray-400 font-bold">
                  {d}
                </span>
              ))}
              {[...Array(30)].map((_, i) => {
                const day = i + 1;
                const dateKey = `2026-06-${String(day).padStart(2, "0")}`;
                const history = mealHistory[dateKey] || [];
                const isToday = dateKey === todayKey;
                const isSelected = selectedDay === dateKey;

                let bgColor = "bg-transparent hover:bg-[#FFF0F3]";
                if (isSelected) bgColor = "bg-[#D9768A]";
                else if (isToday) bgColor = "bg-[#F9C6D0]";
                else if (history.length >= 3)
                  bgColor = "bg-[#C5E8D8] hover:opacity-80";
                else if (history.length > 0)
                  bgColor = "bg-[#FBF0B2] hover:opacity-80";

                return (
                  <div
                    key={day}
                    className={`aspect-square flex items-center justify-center rounded-full cursor-pointer transition ${bgColor}`}
                    onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                  >
                    <span
                      className={`text-[10px] font-semibold ${isSelected ? "text-white" : isToday ? "text-[#c0506a] font-bold" : "text-gray-700"}`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>

            {selectedDay && (
              <div className="mt-2 space-y-2 border-t border-[#F0E8F0] pt-3">
                <p className="text-xs font-bold text-[#7a3545]">
                  {selectedDay.replace(
                    /\d{4}-(\d{2})-(\d{2})/,
                    (_, m, d) => `${parseInt(m)}月${parseInt(d)}日`,
                  )}
                  の記録を追加
                </p>
                <input
                  type="text"
                  placeholder="例：ランチにパスタを食べた"
                  className="w-full bg-[#FFF5F7] rounded-xl p-2.5 text-xs border border-[#F9C6D0] focus:outline-none"
                  value={pastMealInput}
                  onChange={(e) => setPastMealInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addPastMeal}
                    className="flex-1 bg-[#F9C6D0] text-[#7a3545] rounded-xl p-2 text-xs font-bold hover:opacity-80"
                  >
                    記録する
                  </button>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="px-4 bg-gray-100 text-gray-500 rounded-xl p-2 text-xs hover:opacity-80"
                  >
                    閉じる
                  </button>
                </div>
                {(mealHistory[selectedDay] || []).length > 0 && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] text-gray-400">この日の記録：</p>
                    {(mealHistory[selectedDay] || []).map((m, idx) => (
                      <p
                        key={idx}
                        className="text-[10px] text-[#7a3545] bg-[#FFF5F7] rounded-lg px-2 py-1"
                      >
                        {m === "breakfast"
                          ? "🌅 朝ごはん"
                          : m === "lunch"
                            ? "☀️ 昼ごはん"
                            : m === "dinner"
                              ? "🌙 夜ごはん"
                              : "📝 " + m}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-center text-[9px] text-gray-400 pt-1">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C5E8D8]" />
                3食食べた
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FBF0B2]" />
                1〜2食
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[#F9C6D0]" />
                今日
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
