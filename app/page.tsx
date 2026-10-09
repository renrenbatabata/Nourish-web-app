
"use client";
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from './hooks/useAuth';
import { useRecords } from './hooks/useRecords';
import { usePreferences } from './hooks/usePreferences';
import { AuthState,Loading,Notice,PageHeader } from './components/AppUI';
import { DailyNutrition } from './components/DailyNutrition';
import { Journal } from './components/Journal';
import { emptyDay,formatDay,isDateKey,localDateKey,shiftDay } from './lib/records';
export default function Home() {
  return <Suspense fallback={<Loading/>}><HomeRoute/></Suspense>;
}
function HomeRoute(){const requested=useSearchParams().get('date');return <HomeContent key={requested} initialDate={requested&&isDateKey(requested)&&requested<=localDateKey()?requested:localDateKey()}/>;}
function HomeContent({initialDate}:{initialDate:string}) {
  const {user,loading,error}=useAuth(true);const records=useRecords(user?.uid);const preferences=usePreferences(user?.uid);const [date,setDate]=useState(initialDate);
  if(loading||error||!user)return <AuthState error={error}/>;
  const day=records.days[date]??emptyDay(date);
  return <div className="page"><PageHeader title="食べる日々に、やさしい余白を。" description="記録したいときに、あなたのペースで。"/>
    <div className="hero-note"><span aria-hidden="true">❋</span><div><strong>今日は、どんなひとときでしたか。</strong><p>写真一枚でも、短い言葉でも。ここに残しておけます。</p></div></div>
    <div className="date-bar"><div className="date-switch"><button aria-label="前の日" className="icon-button" disabled={records.saving} onClick={()=>setDate(shiftDay(date,-1))}>‹</button><label><span className="sr-only">記録する日</span><input type="date" value={date} max={localDateKey()} disabled={records.saving} onChange={e=>{if(isDateKey(e.target.value)&&e.target.value<=localDateKey())setDate(e.target.value);}}/></label><button aria-label="次の日" className="icon-button" disabled={date>=localDateKey()||records.saving} onClick={()=>setDate(shiftDay(date,1))}>›</button></div><strong>{date===localDateKey()?'きょう':formatDay(date)}</strong><button className="text-button" disabled={records.saving} onClick={()=>setDate(localDateKey())}>今日に戻る</button></div>
    {records.loading?<Loading/>:records.error?<Notice error>{records.error}<button className="button secondary" onClick={records.retry}>再読み込み</button></Notice>:<>{preferences.showNutrition&&<DailyNutrition day={day} goals={preferences.goals} loadingGoals={preferences.loadingGoals} save={patch=>records.save(date,patch)}/>}<Journal day={day} uid={user.uid} save={patch=>records.save(date,patch)} showNutrition={preferences.showNutrition}/></>}
    <p className="footnote">このアプリは日々を振り返るための記録帳です。栄養の必要量や治療方針は、担当の医療者と相談してください。<Link href="/settings">表示の設定</Link></p>
  </div>;
}

