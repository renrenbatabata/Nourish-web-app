"use client";
import {useState} from 'react';
import Link from 'next/link';
import {useAuth} from '../hooks/useAuth';
import {useRecords} from '../hooks/useRecords';
import {AuthState,Loading,Notice,PageHeader} from '../components/AppUI';
import {DayView} from '../components/DayView';
import {emptyDay,formatDay,hasRecord,isDateKey,localDateKey,monthCells} from '../lib/records';
export default function History(){
 const {user,loading,error}=useAuth(true);const records=useRecords(user?.uid);
 const [date,setDate]=useState(localDateKey);const [month,setMonth]=useState(()=>localDateKey().slice(0,7));
 const [start,setStart]=useState(()=>localDateKey().slice(0,7)+'-01');const [end,setEnd]=useState(localDateKey);const [diary,setDiary]=useState(false);const [report,setReport]=useState(false);
 if(loading||error||!user)return <AuthState error={error}/>;
 const valid=isDateKey(start)&&isDateKey(end)&&start<=end;
 const days=Object.values(records.days).filter(d=>d.date>=start&&d.date<=end&&hasRecord(d)).sort((a,b)=>a.date.localeCompare(b.date));
 const move=(n:number)=>{const d=new Date(month+'-01T12:00:00');d.setMonth(d.getMonth()+n);setMonth(localDateKey(d).slice(0,7));};
 return <div className={'page '+(report?'report-mode':'')}><div className="no-print"><PageHeader title="日々の記録" description="残した言葉と写真を、ゆっくり振り返る。"/>
 {records.loading?<Loading/>:records.error?<Notice error>{records.error}<button className="button secondary" onClick={records.retry}>再読み込み</button></Notice>:<>
 <div className="history-grid"><section className="surface"><div className="section-heading"><button className="icon-button" aria-label="前の月" onClick={()=>move(-1)}>‹</button><h2>{month.replace('-','年')}月</h2><button className="icon-button" aria-label="次の月" onClick={()=>move(1)}>›</button></div><div className="calendar">{['月','火','水','木','金','土','日'].map(d=><span className="weekday" key={d}>{d}</span>)}{monthCells(month).map((d,i)=>d?<button key={d} aria-label={formatDay(d)+(hasRecord(records.days[d])?'、記録あり':'')} aria-pressed={d===date} onClick={()=>setDate(d)} className={[d===date?'selected':'',d===localDateKey()?'today':'',hasRecord(records.days[d])?'has-record':''].join(' ')}>{Number(d.slice(-2))}</button>:<span key={i}/>)}</div><p className="small muted calendar-key">点のある日に、記録が残っています。</p><button className="text-button" onClick={()=>{setDate(localDateKey());setMonth(localDateKey().slice(0,7));}}>今日を表示</button></section>
 <section className="surface"><div className="section-heading"><h2>{formatDay(date)}</h2>{date<=localDateKey()&&<Link className="button secondary" href={'/?date='+date}>この日を編集</Link>}</div><DayView day={records.days[date]??emptyDay(date)}/></section></div>
 <section className="surface share-panel"><h2>必要なときに、記録を共有</h2><p className="muted">見せたい期間を選び、内容を確認してから印刷・PDF保存できます。</p><div className="toolbar"><label className="field">開始日<input type="date" value={start} onChange={e=>{setStart(e.target.value);setReport(false);}}/></label><label className="field">終了日<input type="date" value={end} onChange={e=>{setEnd(e.target.value);setReport(false);}}/></label></div><label className="check"><input type="checkbox" checked={diary} onChange={e=>{setDiary(e.target.checked);setReport(false);}}/>その日の気持ちも含める</label>{!valid&&<Notice error>開始日から終了日の順に、日付を選んでください。</Notice>}<button className="button secondary" disabled={!valid} onClick={()=>setReport(true)}>共有する内容を確認</button></section></> }</div>
 {report&&valid&&!records.loading&&!records.error&&<section className="report surface"><div className="no-print section-heading"><h2>共有プレビュー</h2><button className="button primary" disabled={!days.length} onClick={()=>window.print()}>印刷・PDF保存</button><button className="text-button" onClick={()=>setReport(false)}>閉じる</button></div><h2>Nourish 食事の記録</h2><p>{start} 〜 {end}</p>{!days.length?<p>この期間に記録はありません。</p>:days.map(day=><article className="report-day" key={day.date}><h2>{day.date} · {formatDay(day.date)}</h2><DayView day={day} includeDiary={diary}/></article>)}</section>}</div>;
}
