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
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "url", url: imageUri } },
                {
                  type: "text",
                  text: "この食事や飲み物の写真を見て、含まれている食材や成分が体にもたらす嬉しい効果を、優しく温かい言葉で教えてください。数字やカロリーは使わず、「〇〇が肌をきれいにしてくれるよ」のような言葉で伝えてください。",
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const message = data.content[0].text;
      setMeals((prev) => ({
        ...prev,
        [mealKey]: { ...prev[mealKey], message },
      }));
    } catch (error) {
      setMeals((prev) => ({
        ...prev,
        [mealKey]: {
          ...prev[mealKey],
          message: "食事の記録ができたね🌸 今日もよく食べられました！",
        },
      }));
    }
  };

  // 間食・ドリンク用（setStateを直接受け取る汎用版）
  const analyzeFoodFree = async (
    imageUri: string,
    onSuccess: (message: string) => void,
    onError?: () => void,
  ) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "url", url: imageUri } },
                {
                  type: "text",
                  text: `あなたはユーザーの食事を優しく応援する、温かい管理栄養士です。
                  この食事や飲み物の写真を見て、含まれている食材や成分が体にもたらす嬉しい効果（メリット）だけを、優しく温かい言葉で教えてください。
                  【守るべきルール】
                  ・数字やカロリーは絶対に遣わないでください。
                  ・「脂質が多い」「野菜が足りない」といった、否定的なアドバイスや改善点は一切含めないでください。
                  ・100文字〜150文字程度（3文ほど）の、スマホで読みやすい短文で出力してください。
                  【話し方のイメージ】
                  「トマトのリコピンが、お肌を生き生きとさせてくれるよ。午後もリフレッシュして過ごそうね🌸」
                  「お肉のパワーで、午後からの元気をしっかりチャージできるよ！よく噛んで味わってね」。`,
                },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      onSuccess(data.content[0].text);
    } catch (error) {
      onError?.();
    }
  };

  return { analyzeFood, analyzeFoodFree };
};
