"use client";
import { useEffect,useState } from 'react';
import { doc,getDoc,setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { intakeKeys,intakeLabels,intakeUnits,parseGoals } from '../lib/nutrition';
import { errorMessage } from '../lib/errors';
export function NutritionGoalsSettings({uid}:{uid:string}){
  const [values,setValues]=useState<Record<string,string>>({}),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{let active=true;getDoc(doc(db,'users',uid)).then(d=>{if(!active)return;const goals=parseGoals(d.data()?.nutritionGoals);setValues(Object.fromEntries(intakeKeys.map(key=>[key,goals[key]===undefined?'':String(goals[key])])));setReady(true);}).catch(e=>{if(active)setError(errorMessage(e));});return()=>{active=false;};},[uid,retry]);
  return <section className="surface share-panel"><h2>一日の栄養目標</h2><p>あなたが比較に使いたい目標量を入力してください。医療者などから指定された目標がある場合は、その値を使えます。空欄の項目は比較しません。</p>
    <p className="small muted">年齢や体格だけで必要量を断定しないため、初期値は設定していません。参考：<a href="https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/eiyou/syokuji_kijyun.html" target="_blank" rel="noreferrer">厚生労働省 日本人の食事摂取基準</a></p>
    {!ready&&!error&&<p role="status">目標を読み込んでいます…</p>}
    {ready&&<form onSubmit={async e=>{e.preventDefault();setError('');setMessage('');const goals:Record<string,number>={};for(const key of intakeKeys){const value=values[key]?.trim();if(!value)continue;const number=Number(value);if(!Number.isFinite(number)||number<=0||number>100000){setError('目標は0より大きい数値で入力してください。');return;}goals[key]=number;}
      setBusy(true);try{await setDoc(doc(db,'users',uid),{nutritionGoals:goals},{mergeFields:['nutritionGoals']});setMessage('一日の栄養目標を保存しました。');}catch(e){setError(errorMessage(e));}finally{setBusy(false);}
    }}><div className="nutrition-input-grid">{intakeKeys.map(key=><label key={key} className="field">{intakeLabels[key]}（{intakeUnits[key]}/日）<input type="number" min="0.01" max="100000" step="any" placeholder="未設定" disabled={busy} value={values[key]??''} onChange={e=>{setValues({...values,[key]:e.target.value});setMessage('');}}/></label>)}</div><button className="button primary" disabled={busy}>{busy?'保存しています…':'栄養目標を保存'}</button></form>}
    {error&&<p className="notice error" role="alert">{error}{!ready&&<button className="button secondary" onClick={()=>{setError('');setRetry(v=>v+1);}}>再読み込み</button>}</p>}{message&&<p className="notice" role="status">{message}</p>}
  </section>;
}
