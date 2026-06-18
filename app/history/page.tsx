"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ScreenHeader } from "../components/ScreenHeader";

import { useDateRange } from "../hooks/useDateRange";
import { usePDFExport } from "../hooks/usePDFExport";
import { useAuth } from "../hooks/useAuth";

type FirestoreMeal = {
  id: string;
  mealType: string;
  photoUri?: string;
  note?: string;
  date: string;
};

type FirestoreDiary = {
  id: string;
  note: string;
  date: string;
};

type MealLabel = {
  icon: string;
  label: string;
  color: string;
  borderColor: string;
  bgColor: string;
};

const mealLabels: Record<string, MealLabel> = {
  breakfast: {
    icon: "🌅",
    label: "朝ごはん",
    color: "text-[#D9768A]",
    borderColor: "border-[#F9C6D0]",
    bgColor: "bg-[#FFF5F7]",
  },
  lunch: {
    icon: "☀️",
    label: "昼ごはん",
    color: "text-[#7a6010]",
    borderColor: "border-[#FAE095]",
    bgColor: "bg-[#FFFDF0]",
  },
  dinner: {
    icon: "🌙",
    label: "夜ごはん",
    color: "text-[#2a6649]",
    borderColor: "border-[#C5E8D8]",
    bgColor: "bg-[#F5FBF7]",
  },
};

const toDateKey = (isoString: string) => isoString.split("T")[0];

export default function History() {
  const { user, loading } = useAuth(true);

  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setThisWeek,
    setThisMonth,
    setLastMonth,
  } = useDateRange();

  const { generatePDF } = usePDFExport();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [firestoreMeals, setFirestoreMeals] = useState<FirestoreMeal[]>([]);
  const [firestoreDiary, setFirestoreDiary] = useState<FirestoreDiary[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mealsSnap = await getDocs(
          query(
            collection(db, "meals"),
            where("uid", "==", user?.uid ?? "anonymous"),
          ),
        );
        const diarySnap = await getDocs(
          query(
            collection(db, "diary"),
            where("uid", "==", user?.uid ?? "anonymous"),
          ),
        );
        setFirestoreMeals(
          mealsSnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as FirestoreMeal,
          ),
        );
        setFirestoreDiary(
          diarySnap.docs.map(
            (d) => ({ id: d.id, ...d.data() }) as FirestoreDiary,
          ),
        );
      } catch (e) {
        console.error(e);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [user?.uid]);

  const mealsByDate: Record<string, FirestoreMeal[]> = {};
  firestoreMeals.forEach((meal) => {
    const key = toDateKey(meal.date);
    if (!mealsByDate[key]) mealsByDate[key] = [];
    mealsByDate[key].push(meal);
  });

  const diaryByDate: Record<string, FirestoreDiary> = {};
  firestoreDiary.forEach((diary) => {
    const key = toDateKey(diary.date);
    diaryByDate[key] = diary;
  });

  const allDates = Object.keys(mealsByDate).sort();
  const totalDays = allDates.length;
  const threeMealDays = allDates.filter(
    (d) => mealsByDate[d].length >= 3,
  ).length;
  const totalMeals = firestoreMeals.length;

  const selectedMeals = selectedDate ? mealsByDate[selectedDate] || [] : [];
  const selectedDiary = selectedDate ? diaryByDate[selectedDate] : null;

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  if (loading) return null;
  return (
    <div className="min-h-screen bg-[#FDF6F0] px-0 text-[#4a3f3a] font-sans antialiased pb-10">
      <div className="max-w-md mx-auto">
        <ScreenHeader source="/history-header.png" height={100} />

        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#E8E0F8] space-y-3 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#4a3f3a]">6月</h2>

            {dataLoading ? ( // loading → dataLoading
              <p className="text-center text-xs text-gray-400">読み込み中...</p>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["月", "火", "水", "木", "金", "土", "日"].map((d) => (
                    <span
                      key={d}
                      className="text-[11px] text-gray-400 font-bold mb-1"
                    >
                      {d}
                    </span>
                  ))}

                  {[...Array(30)].map((_, i) => {
                    const day = i + 1;
                    const dateKey = `2026-06-${String(day).padStart(2, "0")}`;
                    const meals = mealsByDate[dateKey];
                    const isToday =
                      dateKey === new Date().toISOString().split("T")[0];
                    const isSelected = selectedDate === dateKey;

                    let bgColor = "bg-transparent";
                    if (isSelected) bgColor = "bg-[#D9768A]";
                    else if (isToday) bgColor = "bg-[#F9C6D0]";
                    else if (meals?.length >= 3) bgColor = "bg-[#C5E8D8]";
                    else if (meals?.length > 0) bgColor = "bg-[#FBF0B2]";

                    return (
                      <button
                        key={day}
                        onClick={() =>
                          meals && setSelectedDate(isSelected ? null : dateKey)
                        }
                        disabled={!meals}
                        className={`aspect-square flex flex-col items-center justify-center rounded-xl transition ${bgColor} ${
                          meals
                            ? "cursor-pointer active:scale-95"
                            : "cursor-default opacity-40"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold ${
                            isSelected
                              ? "text-white"
                              : isToday
                                ? "text-[#c0506a]"
                                : "text-gray-700"
                          }`}
                        >
                          {day}
                        </span>
                        {meals && (
                          <span
                            className={`text-[7px] font-semibold mt-0.5 ${isSelected ? "text-white/90" : "text-gray-400"}`}
                          >
                            {meals.length}/3
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 justify-center text-[10px] text-gray-400 pt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C5E8D8]" />
                    3食食べた🎉
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
                <p className="text-center text-[10px] text-gray-400 pt-1">
                  📌 日付をタップするとその日の食事が見れるよ
                </p>
              </>
            )}
          </div>

          {selectedDate && (
            <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#F9C6D0] space-y-3 shadow-sm animate-fade-in">
              <h3 className="text-sm font-extrabold text-[#4a3f3a]">
                {selectedDate.replace("2026-", "").replace("-", "月")}日の食事
              </h3>

              {selectedMeals.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-2">
                  この日の記録はないよ🌱
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedMeals
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((meal) => {
                      const config = mealLabels[meal.mealType];
                      return (
                        <div
                          key={meal.id}
                          className={`rounded-xl border-[1.5px] p-3 flex gap-3 items-start ${config?.borderColor || "border-gray-200"} ${config?.bgColor || "bg-gray-50"}`}
                        >
                          <span className="text-2xl">
                            {config?.icon || "🍽️"}
                          </span>
                          <div className="flex-1 space-y-0.5">
                            <p className="text-xs font-bold text-[#4a3f3a]">
                              {config?.label || meal.mealType}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              🕐 {formatTime(meal.date)}
                            </p>
                            {meal.note && (
                              <p className="text-xs text-[#6a5060] leading-relaxed mt-1">
                                {meal.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {selectedMeals.length > 0 && selectedMeals.length < 3 && (
                <p className="text-center text-[11px] text-gray-400 bg-gray-50 p-2 rounded-xl leading-relaxed">
                  {3 - selectedMeals.length}
                  食分は記録されていないよ。次はもう少し食べられるといいね🌱
                </p>
              )}

              {selectedDiary && (
                <div className="bg-[#FFF5F7] rounded-xl p-3 border border-[#F9C6D0] space-y-1">
                  <p className="text-[11px] font-bold text-[#D9768A]">
                    📝 その日の日記
                  </p>
                  <p className="text-xs text-[#6a5060] leading-relaxed">
                    {selectedDiary.note}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#F9C6D0] space-y-3 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#4a3f3a]">
              今月のまとめ
            </h2>
            <div className="flex justify-around py-2">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[#D9768A]">
                  {totalDays}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">記録した日</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[#D9768A]">
                  {threeMealDays}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">3食達成🎉</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-[#D9768A]">
                  {totalMeals}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">食事の記録</p>
              </div>
            </div>
            <p className="text-center text-xs text-[#6a5060] leading-relaxed">
              少しずつ記録できてるね🌱 続けていこう！
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 border-[1.5px] border-[#C5E8D8] space-y-3 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#2a6649]">
              📋 診察用レポート
            </h2>
            <p className="text-[11px] text-gray-400 leading-normal">
              先生に見せる食事記録をPDFで出力できるよ🌸
            </p>

            <div className="flex gap-2 justify-center">
              <button
                onClick={setThisWeek}
                className="bg-[#F0FFF8] border border-[#C5E8D8] rounded-full px-4 py-1.5 text-xs font-bold text-[#2a6649] hover:bg-[#e2f7ed] transition"
              >
                今週
              </button>
              <button
                onClick={setThisMonth}
                className="bg-[#F0FFF8] border border-[#C5E8D8] rounded-full px-4 py-1.5 text-xs font-bold text-[#2a6649] hover:bg-[#e2f7ed] transition"
              >
                今月
              </button>
              <button
                onClick={setLastMonth}
                className="bg-[#F0FFF8] border border-[#C5E8D8] rounded-full px-4 py-1.5 text-xs font-bold text-[#2a6649] hover:bg-[#e2f7ed] transition"
              >
                先月
              </button>
            </div>

            <div className="flex items-center gap-2 justify-center">
              <div className="bg-[#F0FFF8] rounded-xl p-2 flex flex-col items-center flex-1">
                <span className="text-[9px] text-gray-400">開始日</span>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="2026-06-01"
                  className="w-full bg-transparent text-center text-xs font-bold text-[#2a6649] border-b border-[#C5E8D8] focus:outline-none py-0.5"
                />
              </div>
              <span className="text-gray-400 text-sm">〜</span>
              <div className="bg-[#F0FFF8] rounded-xl p-2 flex flex-col items-center flex-1">
                <span className="text-[9px] text-gray-400">終了日</span>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="2026-06-30"
                  className="w-full bg-transparent text-center text-xs font-bold text-[#2a6649] border-b border-[#C5E8D8] focus:outline-none py-0.5"
                />
              </div>
            </div>

            <button
              onClick={() =>
                generatePDF(mealsByDate, diaryByDate, startDate, endDate)
              }
              className="w-full bg-[#C5E8D8] text-[#2a6649] py-3.5 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 active:scale-98 transition"
            >
              📄 PDFを作成して共有する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
