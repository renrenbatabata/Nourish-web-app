"use client";

import { useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";

const nutrients = [
  {
    id: "carb",
    icon: "🌾",
    name: "炭水化物",
    tagline: "脳と体のガソリン",
    color: "bg-[#FBF0B2]",
    borderColor: "border-[#F5C97A]",
    summary:
      "炭水化物は、体を動かすための一番大切なエネルギー源。特に脳はブドウ糖しかエネルギーとして使えないから、炭水化物なしでは考えることも難しくなってしまうよ。",
    benefits: [
      "🧠 脳に届いて、考える力・集中力を支えてくれる",
      "🔥 体温を上げてポカポカにしてくれる",
      "😊 セロトニン（幸せホルモン）の材料になって気持ちを安定させる",
      "💪 筋肉を動かすエネルギーになる",
    ],
    foods: ["ご飯🍚", "パン🍞", "パスタ🍝", "さつまいも🍠", "バナナ🍌"],
    message: "ご飯やパンを食べることは、脳と体への優しいプレゼント🌸",
  },
  {
    id: "fat",
    icon: "🥑",
    name: "脂質",
    tagline: "細胞を守るバリア",
    color: "bg-[#FFE4EC]",
    borderColor: "border-[#F9C6D0]",
    summary:
      "脂質は「太る」イメージがあるけど、実は体にとってなくてはならない大切な栄養素。細胞のバリアを作って、ホルモンや神経の材料にもなるよ。",
    benefits: [
      "🧬 細胞の膜を作って、体全体を守ってくれる",
      "🧠 脳の60%は脂質でできている。思考力・感情の安定に関わる",
      "✨ 肌や髪をしっとりツヤツヤにしてくれる",
      "🌡️ 体温を保って、寒さから守ってくれる",
      "💊 ビタミンA・D・E・Kの吸収を助ける",
    ],
    foods: ["アボカド🥑", "ナッツ🥜", "オリーブオイル", "鮭🐟", "チーズ🧀"],
    message: "脂質は体と心を守る大切なもの。怖くないよ🌿",
  },
  {
    id: "protein",
    icon: "🍗",
    name: "タンパク質",
    tagline: "体を作る材料",
    color: "bg-[#feebd7]",
    borderColor: "border-[#FDDCB5]",
    summary:
      "タンパク質は体のあらゆる部分の材料になる栄養素。髪・爪・肌・筋肉・臓器・血液まで、全部タンパク質から作られているよ。",
    benefits: [
      "💇 髪をツヤツヤ・丈夫にしてくれる",
      "💅 爪を健康に保ってくれる",
      "🌸 肌のハリとコラーゲンを作る材料になる",
      "💪 筋肉を維持して体を支えてくれる",
      "🩸 血液や免疫細胞の材料になって体を守る",
    ],
    foods: ["鶏肉🍗", "卵🥚", "豆腐", "鮭🐟", "ヨーグルト🍦"],
    message: "タンパク質を食べるたびに、体が少しずつ美しくなってるよ✨",
  },
  {
    id: "vitamin",
    icon: "🥦",
    name: "ビタミン",
    tagline: "体の調子を整える",
    color: "bg-[#F0FFF8]",
    borderColor: "border-[#C5E8D8]",
    summary:
      "ビタミンは体の様々な働きを助ける「調整役」。少量でも体の調子を整えて、他の栄養素がうまく働くサポートをしてくれるよ。",
    benefits: [
      "🌟 ビタミンCが肌をきれいにするコラーゲンを作る",
      "🦷 ビタミンDが骨と歯を強くする",
      "👀 ビタミンAが目と肌を健康に保つ",
      "🛡️ 免疫力を高めて風邪をひきにくくする",
      "😌 ビタミンB群が疲れを回復させてくれる",
    ],
    foods: [
      "ブロッコリー🥦",
      "にんじん🥕",
      "トマト🍅",
      "みかん🍊",
      "ほうれん草",
    ],
    message: "野菜や果物を食べるたびに、体の中からきれいになってるよ🌿",
  },
  {
    id: "mineral",
    icon: "🦴",
    name: "ミネラル",
    tagline: "骨と血液を作る",
    color: "bg-[#F0F8FF]",
    borderColor: "border-[#B5D4F4]",
    summary:
      "ミネラルは骨・歯・血液を作り、神経や筋肉の働きを支える栄養素。体の中の「縁の下の力持ち」だよ。",
    benefits: [
      "🦴 カルシウムが骨と歯を丈夫にする",
      "🩸 鉄分が血液を作って貧血を防ぐ",
      "⚡ マグネシウムが神経と筋肉をリラックスさせる",
      "💧 体の水分バランスを整えてくれる",
      "🔋 エネルギーを作る酵素の働きを助ける",
    ],
    foods: ["牛乳🥛", "チーズ🧀", "小魚🐟", "ほうれん草", "ナッツ🥜"],
    message: "ミネラルは体の土台を作ってくれる、縁の下の力持ち🌸",
  },
];

export default function Nutrition() {
  const [selectedNutrientId, setSelectedNutrientId] = useState<string | null>(
    null,
  );

  return (
    <div className="min-h-screen bg-[#FDF6F0] px-0 text-[#4a3f3a] font-sans antialiased pb-10">
      <div className="max-w-md mx-auto">
        <ScreenHeader source="/nutrition-header.png" height={100} />

        <div className="p-4 space-y-3">
          {nutrients.map((n) => {
            const isOpen = selectedNutrientId === n.id;
            return (
              <div
                key={n.id}
                className={`rounded-2xl border-[1.5px] p-4 transition-all duration-300 shadow-xs ${n.color} ${n.borderColor}`}
              >
                <button
                  onClick={() => setSelectedNutrientId(isOpen ? null : n.id)}
                  className="w-full flex items-center gap-3.5 text-left focus:outline-none select-none"
                >
                  <span className="text-4xl">{n.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-base font-extrabold text-[#4a3f3a]">
                      {n.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      {n.tagline}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-400 transition-transform duration-300">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-4 pt-3 border-t border-black/5 space-y-4 animate-slide-down">
                    <p className="text-xs text-[#6a5060] leading-relaxed font-medium bg-white/50 p-3 rounded-xl">
                      {n.summary}
                    </p>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-[#4a3f3a] tracking-wide">
                        ✨ 体への嬉しい効果
                      </h4>
                      <div className="space-y-1 pl-0.5">
                        {n.benefits.map((b, i) => (
                          <p
                            key={i}
                            className="text-xs text-[#6a5060] leading-relaxed font-medium"
                          >
                            {b}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#4a3f3a] tracking-wide">
                        🛒 含まれる食材
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {n.foods.map((f, i) => (
                          <div
                            key={i}
                            className={`rounded-full border border-black/5 px-3 py-1 text-[11px] font-bold bg-white/80 text-[#4a3f3a] ${n.borderColor}`}
                          >
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/80 rounded-xl p-3 text-center border border-dashed border-black/10">
                      <p className="text-xs text-[#6a5060] font-semibold leading-normal">
                        {n.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
