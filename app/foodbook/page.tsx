"use client";

import { useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";
const categories = [
  {
    id: "fruit",
    label: "🍎 果物",
    color: "bg-[#FFE4EC]",
    borderColor: "border-[#F9C6D0]",
    activeBg: "bg-[#F9C6D0]",
    items: [
      {
        name: "🍎 りんご",
        effect:
          "腸を元気にする食物繊維がたっぷり！お腹の調子を整えて、気持ちも穏やかにしてくれるよ。皮ごと食べるとさらに効果等🌿",
        tags: ["#食物繊維", "#カリウム", "#ビタミンC"],
      },
      {
        name: "🍌 バナナ",
        effect:
          "疲れた体にすぐエネルギーを届けてくれる。気持ちを安定させるセロトニンの材料にもなるよ☀️",
        tags: ["#ビタミンB6", "#カリウム", "#食物繊維"],
      },
      {
        name: "🍓 いちご",
        effect:
          "肌をピカピカにするビタミンCがたっぷり！甘酸っぱい味が気分をリフレッシュさせてくれるよ🌸",
        tags: ["#ビタミンC", "#葉酸", "#食物繊維"],
      },
      {
        name: "🍊 みかん",
        effect:
          "風邪から体を守る免疫力をアップ！皮の白い筋にも栄養がたっぷり入ってるよ🍊",
        tags: ["#ビタミンC", "#βカロテン", "#クエン酸"],
      },
    ],
  },
  {
    id: "veggie",
    label: "🥦 野菜",
    color: "bg-[#F0FFF8]",
    borderColor: "border-[#C5E8D8]",
    activeBg: "bg-[#C5E8D8]",
    items: [
      {
        name: "🥦 ブロッコリー",
        effect:
          "肌のコラーゲンを作るのを助けてくれる。体の中のサビ取り効果もあって、元気な細胞を守ってくれるよ🌿",
        tags: ["#ビタミンC", "#葉酸", "#食物繊維"],
      },
      {
        name: "🥕 にんじん",
        effect:
          "目を健康に保つβカロテンが豊富！油と一緒に食べると吸収率がアップするよ✨",
        tags: ["#βカロテン", "#ビタミンK", "#食物繊維"],
      },
      {
        name: "🍅 トマト",
        effect:
          "リコピンというパワフルな成分が体をサビから守る。肌のハリとツヤを守ってくれるよ🍅",
        tags: ["#リコピン", "#ビタミンC", "#カリウム"],
      },
      {
        name: "🧅 玉ねぎ",
        effect:
          "血液をサラサラにしてくれる。体を温める効果もあって、ポカポカが続くよ🔥",
        tags: ["#ケルセチン", "#ビタミンB1", "#食物繊維"],
      },
    ],
  },
  {
    id: "protein",
    label: "🍗 お肉・魚",
    color: "bg-[#feebd7]",
    borderColor: "border-[#FDDCB5]",
    activeBg: "bg-[#FDDCB5]",
    items: [
      {
        name: "🍗 鶏肉",
        effect:
          "筋肉を作り・維持するのに最高の食材。食べると体がシャキッとする感覚が出てくるよ💪",
        tags: ["#タンパク質", "#ビタミンB6", "#ナイアシン"],
      },
      {
        name: "🐟 鮭",
        effect:
          "脳を元気にするオメガ3が豊富！気持ちを穏やかにする効果もあるよ。肌もしっとりさせてくれる🌊",
        tags: ["#オメガ3", "#ビタミンD", "#タンパク質"],
      },
      {
        name: "🥚 卵",
        effect:
          "髪の毛・爪・肌・筋肉すべての材料になる。「完全栄養食品」と呼ばれるほど栄養バランスが優秀🥚",
        tags: ["#タンパク質", "#ビタミンD", "#ビタミンB12"],
      },
      {
        name: "🥩 牛肉",
        effect:
          "疲労回復に役立つ鉄分が豊富！貧血を防いで、体をポカポカにしてくれるよ",
        tags: ["#鉄分", "#タンパク質", "#亜鉛"],
      },
    ],
  },
  {
    id: "grain",
    label: "🌾 穀物",
    color: "bg-[#FFFDF0]",
    borderColor: "border-[#FBF0B2]",
    activeBg: "bg-[#FBF0B2]",
    items: [
      {
        name: "🍚 ご飯",
        effect:
          "脳に届くいちばん大切なエネルギー源。朝からご飯を食べると、頭がハッキリして体温も上がってポカポカに✨",
        tags: ["#炭水化物", "#ビタミンB1", "#食物繊維"],
      },
      {
        name: "🍞 パン",
        effect:
          "手軽にエネルギー補給できる。全粒粉なら食物繊維もたっぷりで腸も喜ぶよ🌾",
        tags: ["#炭水化物", "#ビタミンB群", "#鉄分"],
      },
      {
        name: "🍝 パスタ",
        effect:
          "持続するエネルギーを届けてくれる。腹持ちがよくて、午後も元気に過ごせるよ💫",
        tags: ["#炭水化物", "#タンパク質", "#鉄分"],
      },
    ],
  },
  {
    id: "dairy",
    label: "🥛 乳製品",
    color: "bg-[#F0F8FF]",
    borderColor: "border-[#B5D4F4]",
    activeBg: "bg-[#B5D4F4]",
    items: [
      {
        name: "🥛 牛乳",
        effect:
          "骨や歯を強くするカルシウムがたっぷり。寝る前に飲むとリラックスして眠りやすくなるよ🌙",
        tags: ["#カルシウム", "#タンパク質", "#ビタミンD"],
      },
      {
        name: "🧀 チーズ",
        effect:
          "骨や歯を強くするカルシウムの宝庫。脳の神経を落ち着かせる働きもあって、食べるとホッとするよ🧀",
        tags: ["#カルシウム", "#タンパク質", "#ビタミンB12"],
      },
      {
        name: "🍦 ヨーグルト",
        effect:
          "腸を元気にする乳酸菌がいっぱい！腸が整うと気持ちも穏やかになるって知ってた？心と腸はつながってるよ☁️",
        tags: ["#乳酸菌", "#カルシウム", "#タンパク質"],
      },
    ],
  },
];

type Item = { name: string; effect: string; tags: string[] };

export default function FoodBook() {
  const [selectedCategory, setSelectedCategory] = useState("fruit");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const current = categories.find((c) => c.id === selectedCategory)!;

  return (
    <div className="min-h-screen bg-[#FDF6F0] relative font-sans antialiased pb-10">
      {/* 背景ドット（ImageBackgroundの代わりに、CSSの可愛いドット背景を使用するとさらに軽量です！） */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#4a3f3a 2px, transparent 2px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-md mx-auto space-y-4 relative z-10 p-4">
        {/* ヘッダーコンポーネントの呼び出し */}
        <ScreenHeader source="/foodbook-header.png" height={100} />

        {/* カテゴリタブ（横スクロール） */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition text-[#4a3f3a] ${
                selectedCategory === cat.id
                  ? cat.activeBg
                  : "bg-[#F0EEE8] hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 食材グリッド */}
        <div className="grid grid-cols-2 gap-3.5">
          {current.items.map((item) => {
            const emoji = item.name.split(" ")[0];
            const name = item.name.split(" ").slice(1).join(" ");
            return (
              <button
                key={item.name}
                onClick={() => setSelectedItem(item)}
                className={`rounded-2xl border-[1.5px] p-5 flex flex-col items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] ${current.color} ${current.borderColor}`}
              >
                <span className="text-4xl">{emoji}</span>
                <span className="text-sm font-bold text-[#4a3f3a]">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- 詳細モーダル (条件分岐によるWebポップアップ表示) --- */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          {/* 白いカード部分 */}
          <div
            className={`w-full max-w-sm bg-white rounded-3xl p-6 border-2 flex flex-col gap-4 shadow-xl transform transition-all ${current.borderColor}`}
            onClick={(e) => e.stopPropagation()} // カード内クリックで閉じないようにする
          >
            <h3 className="text-xl font-extrabold text-[#4a3f3a]">
              {selectedItem.name}
            </h3>
            <p className="text-xs text-[#6a5060] leading-relaxed font-medium bg-gray-50 p-3 rounded-2xl">
              {selectedItem.effect}
            </p>

            {/* タグ一覧 */}
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.tags.map((tag) => (
                <div
                  key={tag}
                  className={`text-[10px] font-bold text-[#4a3f3a] px-2.5 py-1 rounded-full border border-black/5 ${current.color}`}
                >
                  {tag}
                </div>
              ))}
            </div>

            {/* 閉じるボタン */}
            <button
              onClick={() => setSelectedItem(null)}
              className={`w-full py-3 rounded-2xl text-xs font-bold text-white transition hover:opacity-90 active:scale-98 ${current.activeBg}`}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
