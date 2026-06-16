"use client";

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
};

const mealLabels: Record<string, MealLabel> = {
  breakfast: { icon: "🌅", label: "朝ごはん" },
  lunch: { icon: "☀️", label: "昼ごはん" },
  dinner: { icon: "🌙", label: "夜ごはん" },
};

const formatTime = (isoString: string) => {
  const d = new Date(isoString);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const usePDFExport = () => {
  const generatePDF = async (
    mealsByDate: Record<string, FirestoreMeal[]>,
    diaryByDate: Record<string, FirestoreDiary>,
    startDate: string,
    endDate: string,
  ) => {
    try {
      // 1. 指定期間内のデータを絞り込んでソート
      const filtered = Object.entries(mealsByDate)
        .filter(([date]) => date >= startDate && date <= endDate)
        .sort(([a], [b]) => a.localeCompare(b));

      // 2. 元の可愛いHTMLデザインをそのまま再利用✨
      const htmlContent = `
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nourish - 食事記録レポート</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #4a3f3a; background: #white; }
            h1 { color: #D9768A; font-size: 22px; margin-bottom: 4px; }
            .period { font-size: 12px; color: #9a8a84; margin-bottom: 20px; }
            .day { margin-bottom: 24px; border-left: 3px solid #F9C6D0; padding-left: 12px; page-break-inside: avoid; }
            .day-title { font-size: 16px; font-weight: bold; color: #7a3545; margin-bottom: 10px; }
            .meal { margin: 8px 0; padding: 10px; background: #FFF5F7; border-radius: 8px; font-size: 13px; }
            .meal-header { font-weight: bold; margin-bottom: 4px; }
            .meal-time { font-size: 11px; color: #9a8a84; margin-bottom: 4px; }
            .meal-note { color: #6a5060; font-style: italic; }
            .meal-photo { color: #9a8a84; font-size: 11px; }
            .diary { margin-top: 10px; padding: 10px; background: #F0FFF8; border-radius: 8px; font-size: 13px; color: #2a6649; }
            .diary-label { font-weight: bold; margin-bottom: 4px; }
            .footer { margin-top: 30px; font-size: 11px; color: #b0a0a0; text-align: center; }
            .no-data { color: #b0a0a0; font-style: italic; font-size: 12px; }

            /* 🖨️ 印刷時・PDF保存用の最適化設定 */
            @media print {
              body { padding: 0; background: white; }
              /* ページの途中で1日分のデータが不自然に千切れるのを防ぐ設定 */
              .day { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>🌸 Nourish - 食事記録</h1>
          <div class="period">期間: ${startDate} 〜 ${endDate}</div>
          ${filtered.length === 0 ? '<p class="no-data">この期間の記録はありません</p>' : ""}
          ${filtered
            .map(
              ([date, meals]) => `
            <div class="day">
              <div class="day-title">
                ${date.replace(/\d{4}-(\d{2})-(\d{2})/, (_, m, d) => `${parseInt(m)}月${parseInt(d)}日`)}
                （${meals.length}食記録）
              </div>
              ${meals
                .sort((a, b) => a.date.localeCompare(b.date))
                .map(
                  (meal) => `
                <div class="meal">
                  <div class="meal-header">
                    ${mealLabels[meal.mealType]?.icon || ""} ${mealLabels[meal.mealType]?.label || meal.mealType}
                  </div>
                  <div class="meal-time">🕐 ${formatTime(meal.date)}</div>
                  ${meal.note ? `<div class="meal-note">${meal.note}</div>` : ""}
                  ${meal.photoUri ? `<div class="meal-photo">📷 写真あり</div>` : ""}
                </div>
              `,
                )
                .join("")}
              ${
                diaryByDate[date]
                  ? `
                <div class="diary">
                  <div class="diary-label">📝 その日の日記</div>
                  ${diaryByDate[date].note}
                </div>
              `
                  : ""
              }
            </div>
          `,
            )
            .join("")}
          <div class="footer">Nourish アプリより出力</div>
        </body>
        </html>
      `;

      // 3. ブラウザの新しい隠しウィンドウを作ってそこにHTMLを流し込む
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert(
          "ポップアップがブロックされました。ブラウザの設定で許可してください🌸",
        );
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // 4. 画像などの読み込みを少し待ってから、ブラウザ標準の印刷画面を起動！
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // 印刷画面を閉じたら、開いたタブも自動で閉じる親切設計
        printWindow.close();
      }, 500);
    } catch (error) {
      console.error("PDF生成エラー:", error);
      throw error;
    }
  };

  return { generatePDF };
};
