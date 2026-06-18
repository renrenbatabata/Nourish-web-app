import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUri, prompt } = body;

    const matches = imageUri.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 },
      );
    }
    const mediaType = matches[1];
    const base64Data = matches[2];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// 栄養スコア分析用
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { imageUri, age, gender, activityLevel, height, weight } = body;

    const matches = imageUri.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 },
      );
    }
    const mediaType = matches[1];
    const base64Data = matches[2];

    const prompt = `あなたは管理栄養士です。この食事の写真を見て、以下のユーザー情報をもとに五大栄養素が一日の推奨摂取量に対して何%摂れているか推定してください。

ユーザー情報：
- 年齢: ${age}歳
- 身長: ${height}cm
- 体重: ${weight}kg
- 性別: ${gender === "female" ? "女性" : gender === "male" ? "男性" : "その他"}
- 活動レベル: ${activityLevel === "low" ? "低め（デスクワーク中心）" : activityLevel === "high" ? "高め（運動習慣あり）" : "普通"}

【重要】必ず以下のJSON形式のみで回答してください。説明文は一切不要です：
{"carbs": 数値, "fat": 数値, "protein": 数値, "vitamin": 数値, "mineral": 数値}

数値は0〜100の整数で、この一食で一日の推奨量の何%を摂取できるかを表します。`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;

    // JSONを安全にパース
    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Parse error" }, { status: 500 });
    }
    const scores = JSON.parse(jsonMatch[0]);
    return NextResponse.json(scores);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
