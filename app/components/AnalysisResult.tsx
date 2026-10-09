import { Analysis, nutrientLabels } from '../lib/records';

export function AnalysisResult({ analysis }: { analysis: Analysis }) {
  return <div className="analysis-result">
    <header className="analysis-overview">
      <p className="analysis-kicker">写真からの推定</p>
      <h4>{analysis.dishName || (analysis.foods.length ? '写真から見つかった食べもの' : '食べものを特定できませんでした')}</h4>
      {analysis.summary && <p className="analysis-summary">{analysis.summary}</p>}
    </header>
    {analysis.foods.length > 0 && <>
      <h5 className="analysis-section-title">食材と栄養の特徴</h5>
      <ul className="analysis-food-list">
        {analysis.foods.map((food, index) => <li className="analysis-food-card" key={index}>
          <div className="analysis-food-heading"><h6>{food.food}</h6>
            {food.basis && <span className="analysis-basis">{food.basis === 'visible' ? '写真で確認' : '料理から推定'}</span>}
          </div>
          {food.description && <p className="analysis-food-description">{food.description}</p>}
          {food.nutrients.length > 0 && <div className="tags" aria-label="一般的に含まれる栄養素">{food.nutrients.map(n => <span key={n}>{nutrientLabels[n]}</span>)}</div>}
        </li>)}
      </ul>
    </>}
    <p className="analysis-caption">{analysis.message || '食材に一般的に含まれる栄養の紹介です。'}</p>
    {!analysis.dishName && analysis.foods.length > 0 && <p className="small muted">もう一度確認すると、料理名や栄養の特徴も表示されます。</p>}
  </div>;
}
