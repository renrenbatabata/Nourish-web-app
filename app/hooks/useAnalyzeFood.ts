import { Dispatch, SetStateAction } from "react";

type Meal = {
  photo: string | null;
  message: string;
};

type Meals = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
};

export const useAnalyzeFood = (setMeals: Dispatch<SetStateAction<Meals>>) => {
  const analyzeFood = async (imageUri: string, mealKey: keyof Meals) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUri,
          prompt:
            "この食事や飲み物の写真を見て、含まれている食材や成分が体にもたらす嬉しい効果を、優しく温かい言葉で教えてください。数字やカロリーは使わず、「〇〇が肌をきれいにしてくれるよ」のような言葉で伝えてください。",
        }),
      });
      const data = await response.json();
      const message = data.content[0].text;
      setMeals((prev) => ({
        ...prev,
        [mealKey]: { ...prev[mealKey], message },
      }));
    } catch {
      setMeals((prev) => ({
        ...prev,
        [mealKey]: {
          ...prev[mealKey],
          message: "食事の記録ができたね🌸 今日もよく食べられました！",
        },
      }));
    }
  };

  const analyzeFoodFree = async (
    imageUri: string,
    onSuccess: (message: string) => void,
    onError?: () => void,
  ) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUri,
          prompt: `あなたはユーザーの食事を優しく応援する、温かい管理栄養士です。この食事や飲み物の写真を見て、含まれている食材や成分が体にもたらす嬉しい効果（メリット）だけを、優しく温かい言葉で教えてください。【守るべきルール】・数字やカロリーは絶対に使わないでください。・「脂質が多い」「野菜が足りない」といった、否定的なアドバイスや改善点は一切含めないでください。・100文字〜150文字程度（3文ほど）の、スマホで読みやすい短文で出力してください。【話し方のイメージ】「トマトのリコピンが、お肌を生き生きとさせてくれるよ。午後もリフレッシュして過ごそうね🌸」`,
        }),
      });
      const data = await response.json();
      onSuccess(data.content[0].text);
    } catch {
      onError?.();
    }
  };

  return { analyzeFood, analyzeFoodFree };
};
