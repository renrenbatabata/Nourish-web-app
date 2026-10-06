"use client";

import Image from "next/image";
import { useState } from "react";
import type { MealData, Meals } from "../hooks/useMeals";

type MealConfig = {
  key: keyof Meals;
  icon: string;
  label: string;
  borderColor: string;
  bgColor: string;
  tagColor: string;
};

type MealCardProps = {
  config: MealConfig;
  data: MealData;
  isAnalyzing: boolean;
  onAddPhoto: (file: File) => void;
  onRemovePhoto: (photoId: string) => void;
  onAnalyze: () => void;
};

export function MealCard({
  config,
  data,
  isAnalyzing,
  onAddPhoto,
  onRemovePhoto,
  onAnalyze,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    onAddPhoto(e.target.files[0]);
    e.target.value = ""; // 同じファイルを連続選択できるようにリセット
  };

  return (
    <div
      className={`flex-1 rounded-2xl border-[1.5px] p-2 flex flex-col ${config.borderColor} ${config.bgColor}`}
    >
      <div
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full self-start ${config.tagColor}`}
      >
        <span className="text-[10px]">{config.icon}</span>
        <span className="text-[9px] font-bold">{config.label}</span>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        {/* 写真一覧（複数枚対応） */}
        {data.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {data.photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <Image
                  src={photo.url}
                  alt={config.label}
                  width={200}
                  height={100}
                  className="w-full h-12 object-cover rounded-lg"
                  unoptimized
                />
                <button
                  onClick={() => onRemovePhoto(photo.id)}
                  className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center shadow-sm text-gray-400 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 写真追加ボタン */}
        <label
          className={`border-2 border-dashed rounded-xl p-2 flex flex-col items-center justify-center gap-0.5 ${config.borderColor} cursor-pointer hover:opacity-70 transition`}
        >
          <span className="text-sm">📷</span>
          <span className="text-[8px] text-gray-400 text-center leading-tight">
            {data.photos.length > 0 ? "写真を追加" : "写真を追加する"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* 分析ボタン：写真があってまだ分析していない時だけ表示 */}
        {data.photos.length > 0 && !data.analyzed && (
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`text-[9px] font-bold rounded-lg py-1.5 transition ${
              isAnalyzing
                ? "bg-gray-100 text-gray-400"
                : "bg-[#D9768A] text-white hover:opacity-90"
            }`}
          >
            {isAnalyzing ? "分析中...🌸" : "✨ この内容で分析する"}
          </button>
        )}

        {/* 分析結果メッセージ */}
        {data.analyzed && data.message && (
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <p
              className={`text-[9px] text-[#7a6070] leading-tight ${expanded ? "" : "line-clamp-3"}`}
            >
              {data.message}
            </p>
            <span className="text-[8px] text-[#D9768A]">
              {expanded ? "閉じる ▲" : "続きを見る ▼"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
