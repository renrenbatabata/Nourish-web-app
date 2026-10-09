"use client";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRecords } from "../hooks/useRecords";
import { usePreferences } from "../hooks/usePreferences";
import { DailyNutrition } from "../components/DailyNutrition";
import { AuthState,Loading,Notice } from "../components/AppUI";
import { emptyDay,localDateKey,isDateKey } from "../lib/records";
import {PageHeader} from '../components/AppUI';
const items=[['炭水化物','からだのエネルギー源となる栄養素です。','ごはん、パン、麺、いもなど'],['たんぱく質','筋肉や臓器など、からだを構成する材料になります。','肉、魚、卵、大豆製品、乳製品など'],['脂質','エネルギー源となり、細胞の構成などにも関わります。','油、ナッツ、魚など'],['ビタミン','からだのさまざまな働きを支える栄養素の総称です。','野菜、果物、肉、魚など。種類によって含まれる食品が異なります。'],['ミネラル','骨や歯の構成、からだの働きの調節などに関わります。','乳製品、大豆製品、肉、魚、野菜など']];
export default function Nutrition(){const {user,loading,error}=useAuth(true);const records=useRecords(user?.uid);const preferences=usePreferences(user?.uid);const [date,setDate]=useState(localDateKey());if(loading||error||!user)return <AuthState error={error}/>;return <div className="page"><PageHeader title="栄養の小さな読みもの" description="食べものを知るための、やさしい入口。"/><label className="field">比較する日<input type="date" value={date} max={localDateKey()} onChange={e=>{if(isDateKey(e.target.value)&&e.target.value<=localDateKey())setDate(e.target.value);}}/></label>{records.loading||preferences.loadingGoals?<Loading/>:records.error?<Notice error>{records.error}</Notice>:preferences.showNutrition?<DailyNutrition day={records.days[date]??emptyDay(date)} goals={preferences.goals} save={patch=>records.save(date,patch)}/>:<p className="small muted">栄養の比較は設定で非表示になっています。</p>}<div className="hero-note"><span aria-hidden="true">❋</span><div><strong>ひとつの食材にも、いろいろな栄養があります。</strong><p>このページは一般的な説明です。食事を採点したり、毎日すべてをそろえるためのチェックリストではありません。</p></div></div><div className="reference-grid">{items.map(([name,description,examples])=><article className="surface reference-card" key={name}><h2>{name}</h2><p>{description}</p><p className="small muted">含まれる食品の例：{examples}</p></article>)}</div><p className="footnote">必要な食事や量は人によって異なります。治療中の食事については担当の医療者と相談してください。参考：<a href="https://www.nhs.uk/live-well/eat-well/how-to-eat-a-balanced-diet/eating-a-balanced-diet/" target="_blank" rel="noreferrer">NHSの栄養情報（英語）</a></p></div>;}

