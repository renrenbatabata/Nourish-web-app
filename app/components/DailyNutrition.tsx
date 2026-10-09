"use client";
import { useState } from 'react';
import Link from 'next/link';
import { DayRecord, MealKey, formatDay } from '../lib/records';
import { dailyNutrition, goalProgress, intakeKeys, intakeLabels, intakeUnits, nutritionEntries, unknownNutrition, NutritionAmounts, NutritionGoals } from '../lib/nutrition';
type Patch=Partial<Omit<DayRecord,'date'|'legacyMeals'>>;
export function DailyNutrition({day,goals,save,loadingGoals=false}:{day:DayRecord;goals:NutritionGoals;save:(patch:Patch)=>Promise<void>;loadingGoals?:boolean}){
  const totals=dailyNutrition(day),entries=nutritionEntries(day);
  const editorEntries=[...entries,...(['breakfast','lunch','dinner'] as const).filter(key=>!entries.some(entry=>entry.id===key)).map(key=>({id:key,label:{breakfast:'朝ごはん',lunch:'昼ごはん',dinner:'夜ごはん'}[key],amounts:unknownNutrition(),portion:1}))];
  return <section className="surface daily-nutrition">
    <div className="section-heading"><div><p className="eyebrow">{formatDay(day.date)}</p><h2>一日の栄養目標との比較</h2></div><Link href="/settings">目標を設定</Link></div>
    <p className="small muted">記録した食事の栄養量を合計します。AIの数値は概算です。食べた割合と数値を確認して補正してください。</p>
    <p className="small muted">以前の分析結果に栄養量がない場合は、食事の「もう一度確認する」を実行するか、下の確認欄から数値を入力できます。</p>
    {loadingGoals?<p role="status">栄養目標を読み込んでいます…</p>:<div className="nutrition-gauges">{intakeKeys.map(key=>{
      const value=totals[key],goal=goals[key],progress=goalProgress(value.total,goal),known=value.known>0;
      const amount=known?value.total.toLocaleString('ja-JP',{maximumFractionDigits:1}):'未計算';
      return <div className="nutrition-gauge" key={key}>
        <div className="nutrition-gauge-heading"><strong>{intakeLabels[key]}</strong><span>{amount}{known?' '+intakeUnits[key]:''} / {goal ? goal+' '+intakeUnits[key] : '目標未設定'}</span></div>
        {progress&&known?<><div className="nutrition-track" role="progressbar" aria-label={intakeLabels[key]+'の目標に対する記録済み量'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100,Math.round(progress.percent))} aria-valuetext={Math.round(progress.percent)+'%（記録済み量）'}><span style={{width:progress.width+'%'}}/></div><p className="nutrition-gauge-caption">目標に対して約{Math.round(progress.percent)}%{value.missing?'（記録の一部のみ）':''}</p></>:<p className="nutrition-gauge-caption">{!goal?'設定から自分の一日の目標を入力してください。':'食事の栄養量を確認するとゲージが表示されます。'}</p>}
        {value.missing>0&&<p className="nutrition-incomplete">栄養量が未入力の記録：{value.missing}件</p>}
      </div>;
    })}</div>}
    <details className="nutrition-edit"><summary>食べた量・栄養量を確認して補正</summary><p className="small muted">100%は写真に写る全量、50%は半分です。数値は写真の全量を基準に入力してください。空欄は「未計算」として扱います。包装の栄養表示などで補正できます。写真がない食事は食べた全量を入力し、割合を100%にしてください。</p>
      {editorEntries.map(entry=><NutritionEntry key={day.date+entry.id+JSON.stringify(entry.amounts)+entry.portion} entry={entry} assumption={['breakfast','lunch','dinner'].includes(entry.id)?day[entry.id as MealKey].nutrition?'保存した補正値を使用しています。':day[entry.id as MealKey].analysis?.portionNote:undefined} onSave={async(nutrition,portion)=>{
        if(['breakfast','lunch','dinner'].includes(entry.id)){const key=entry.id as MealKey;await save({[key]:{...day[key],nutrition,portion}});}
        else await save({snacks:day.snacks.map(s=>s.id===entry.id?{...s,nutrition,portion}:s)});
      }}/>)}</details>
    {day.legacyMeals.length>0&&<p className="small muted">以前の形式の記録は栄養量がないため合計できません。食事欄に栄養量を入力すると比較できます。</p>}
    <p className="nutrition-footnote">ゲージは設定した目標との比較であり、栄養の不足・過剰を診断するものではありません。ビタミンCとカルシウムは、それぞれ個別の栄養素です。</p>
  </section>;
}
function NutritionEntry({entry,assumption,onSave}:{entry:{label:string;amounts:NutritionAmounts;portion:number};assumption?:string;onSave:(values:NutritionAmounts,portion:number)=>Promise<void>}){
  const [values,setValues]=useState(()=>Object.fromEntries(intakeKeys.map(key=>[key,entry.amounts[key]===null?'':String(entry.amounts[key])])) as Record<typeof intakeKeys[number],string>);
  const [percent,setPercent]=useState(String(entry.portion*100)),[busy,setBusy]=useState(false),[error,setError]=useState('');
  return <form className="nutrition-entry" onSubmit={async e=>{e.preventDefault();setError('');const portion=Number(percent)/100;if(!percent.trim()||!Number.isFinite(portion)||portion<0||portion>3){setError('食べた割合は0〜300%で入力してください。');return;}
    const amounts={} as NutritionAmounts;for(const key of intakeKeys){const value=values[key].trim();if(!value){amounts[key]=null;continue;}const number=Number(value);if(!Number.isFinite(number)||number<0||number>100000){setError('栄養量は0以上の数値で入力してください。');return;}amounts[key]=number;}
    setBusy(true);try{await onSave(amounts,portion);}catch{setError('保存できませんでした。入力を残したまま再度お試しください。');}finally{setBusy(false);}
  }}><h3>{entry.label}</h3>{assumption&&<p className="small muted">推定した量：{assumption}</p>}
    <label className="field">食べた割合（%）<input type="number" min="0" max="300" step="1" required value={percent} disabled={busy} onChange={e=>setPercent(e.target.value)}/></label>
    <div className="nutrition-input-grid">{intakeKeys.map(key=><label className="field" key={key}>{intakeLabels[key]}（{intakeUnits[key]}）<input type="number" min="0" max="100000" step="any" placeholder="未計算" value={values[key]} disabled={busy} onChange={e=>setValues({...values,[key]:e.target.value})}/></label>)}</div>
    <button className="button secondary" disabled={busy}>{busy?'保存しています…':'量を確認して保存'}</button>{error&&<p role="alert" className="notice error">{error}</p>}
  </form>;
}
