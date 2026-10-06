/* User photos use native images to avoid forwarding private storage URLs through an image proxy. */
/* eslint-disable @next/next/no-img-element */

"use client";
import { useState } from 'react';
import { DayRecord, Meal, MealKey, mealKeys, mealLabels, nutrientLabels, parseAnalysis } from '../lib/records';
import { analyzePhotos, photoData, prepareImage, uploadPhoto } from '../lib/images';
import { auth } from '../../firebase';
import { Notice } from './AppUI';
type Patch = Partial<Omit<DayRecord,'date'|'legacyMeals'>>;
export function Journal({day,uid,save,showNutrition=true}:{day:DayRecord;uid:string;save:(patch:Patch)=>Promise<void>;showNutrition?:boolean}) {
  return <div className="journal"><div className="section-heading"><h2>食事の記録</h2><span className="muted">写真も、ひとことも。残したい分だけ。</span></div>
    <div className="meal-grid">{mealKeys.map(key=><MealEditor key={day.date+key} meal={day[key]} mealKey={key} date={day.date} uid={uid} save={meal=>save({[key]:meal})} showNutrition={showNutrition}/>)}</div>
    <div className="two-column"><SnackEditor key={'snack'+day.date} day={day} save={save}/><DiaryEditor key={'diary'+day.date} initial={day.diary} save={diary=>save({diary})}/></div>
    {day.legacyMeals.length>0 && <section className="surface"><h2>以前の形式で残した記録</h2><p className="muted">これまでの記録もここで確認できます。</p>{day.legacyMeals.map(m=><p key={m.id}>{mealLabels[m.mealType as MealKey] || '食事'}：{m.note || '写真の記録'}{m.photoUri && <a href={m.photoUri} target="_blank" rel="noreferrer"> 写真を見る</a>}</p>)}</section>}
  </div>;
}
function MealEditor({meal,mealKey,date,uid,save,showNutrition}:{meal:Meal;mealKey:MealKey;date:string;uid:string;save:(m:Meal)=>Promise<void>;showNutrition:boolean}) {
  const [note,setNote]=useState(meal.note); const [busy,setBusy]=useState(''); const [error,setError]=useState(''); const [success,setSuccess]=useState(''); const [consent,setConsent]=useState(false);
  async function run(label:string, work:()=>Promise<void>) {setBusy(label);setError('');setSuccess('');try{await work();setSuccess('保存しました。');}catch(e){setError(e instanceof Error?e.message:'保存できませんでした。再試行してください。');}finally{setBusy('');}}
  async function add(file?:File) {if(!file)return;await run('写真を保存しています',async()=>{const data=await prepareImage(file);const photo=await uploadPhoto(uid,date,data);await save({photos:[...meal.photos,photo],note,message:'',analyzed:false});});}
  return <section className="surface meal-card"><div className="section-heading"><h3>{mealLabels[mealKey]}</h3><span className="meal-symbol" aria-hidden="true">{mealKey==='breakfast'?'☀':mealKey==='lunch'?'☁':'☾'}</span></div>
    <div className="photos">{meal.photos.map((photo,i)=><div className="photo" key={photo.id}><img src={photo.url} alt={mealLabels[mealKey]+'の写真 '+(i+1)}/><button className="photo-remove" aria-label={'写真'+(i+1)+'を記録から外す'} disabled={!!busy} onClick={()=>run('変更しています',()=>save({photos:meal.photos.filter(p=>p.id!==photo.id),note,message:'',analyzed:false}))}>×</button></div>)}</div>
    {meal.photos.length<3 && <label className={'photo-add '+(busy?'disabled':'')}><span aria-hidden="true">＋</span> 写真を追加<input type="file" accept="image/jpeg,image/png,image/webp" disabled={!!busy} onChange={e=>{void add(e.target.files?.[0]);e.target.value='';}}/></label>}
    <label className="field">ひとこと<textarea maxLength={1500} rows={2} value={note} disabled={!!busy} onChange={e=>{setNote(e.target.value);setSuccess('');}} placeholder="食べたものや、そのときのこと"/></label>
    <button className="button secondary wide" disabled={!!busy || note===meal.note} onClick={()=>run('保存しています',()=>save({...meal,note}))}>ひとことを保存</button>
    {showNutrition && meal.photos.length>0 && <details className="analysis-panel"><summary>食材と栄養のヒント</summary><p className="small muted">写真から分かる範囲の推定です。食べた量や一日の充足度は判定しません。</p>
      {meal.analysis && <div className="analysis-result">{meal.analysis.foods.length ? meal.analysis.foods.map((f,i)=><div key={i}><strong>{f.food}</strong><div className="tags">{f.nutrients.map(n=><span key={n}>{nutrientLabels[n]}</span>)}</div></div>):<p>写真から食材を特定できませんでした。</p>}<p>{meal.analysis.message}</p><p className="small muted">写っていない食材や調味料は分からないことがあります。誤りがあれば参考にしないでください。</p><button className="text-button" disabled={!!busy} onClick={()=>run('変更しています',()=>save({photos:meal.photos,note,message:'',analyzed:false}))}>この推定を取り消す</button></div>}
      <label className="check"><input type="checkbox" checked={consent} disabled={!!busy} onChange={e=>setConsent(e.target.checked)}/><span>この食事の写真をAI提供元（Anthropic）に送って確認する</span></label><p className="small muted">氏名や顔などが写った写真は避けてください。利用するかどうかは自由です。</p>
      <button className="button secondary wide" disabled={!!busy||!consent} onClick={()=>run('食材を確認しています',async()=>{const user=auth.currentUser;if(!user||user.uid!==uid)throw new Error('再度ログインしてください。');const images=await Promise.all(meal.photos.map(p=>photoData(p.url)));const result=parseAnalysis(await analyzePhotos(images,await user.getIdToken()));if(!result)throw new Error('結果を読み取れませんでした。');await save({...meal,note,analysis:result,analyzed:true,message:''});setConsent(false);})}>{meal.analysis?'もう一度確認する':'写真の食材を確認する'}</button>
    </details>}
    {busy && <p role="status" className="small">{busy}…</p>}{error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}
  </section>;
}
function DiaryEditor({initial,save}:{initial:string;save:(value:string)=>Promise<void>}) {
  const [text,setText]=useState(initial);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState(false);
  return <section className="surface"><h2>今日の気持ち</h2><p className="muted">うまく言葉にできなくても、そのままで。</p><label className="field"><span className="sr-only">今日の気持ちの記録</span><textarea rows={4} maxLength={5000} value={text} disabled={busy} onChange={e=>{setText(e.target.value);setMessage('');}} placeholder="どんな一日だった？ 書かない日があっても大丈夫。"/></label><button className="button secondary" disabled={busy||text===initial} onClick={async()=>{setBusy(true);setMessage('');try{await save(text);setError(false);setMessage('保存しました。');}catch{setError(true);setMessage('保存できませんでした。文章を残したまま、もう一度お試しください。');}finally{setBusy(false);}}}>{busy?'保存しています…':'気持ちを保存'}</button>{message&&<Notice error={error}>{message}</Notice>}</section>;
}
function SnackEditor({day,save}:{day:DayRecord;save:(patch:Patch)=>Promise<void>}) {
  const [note,setNote]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
  return <section className="surface"><h2>おやつ・飲みものなど</h2><p className="muted">食事の時間に当てはまらない記録はこちら。</p>{day.snacks.map(s=><div className="snack-row" key={s.id}><p>{s.note}</p>{s.photo&&<a href={s.photo} target="_blank" rel="noreferrer">写真</a>}</div>)}<label className="field"><span className="sr-only">おやつや飲みものの記録</span><input value={note} maxLength={500} disabled={busy} onChange={e=>setNote(e.target.value)} placeholder="温かいお茶を飲んだ、など"/></label><button className="button secondary" disabled={busy||!note.trim()} onClick={async()=>{setBusy(true);setError('');try{await save({snacks:[...day.snacks,{id:crypto.randomUUID(),note:note.trim(),date:day.date}]});setNote('');}catch{setError('保存できませんでした。もう一度お試しください。');}finally{setBusy(false);}}}>{busy?'保存しています…':'記録を追加'}</button>{error&&<Notice error>{error}</Notice>}</section>;
}
