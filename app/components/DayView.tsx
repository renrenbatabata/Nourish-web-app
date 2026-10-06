/* User photos use native images to avoid forwarding private storage URLs through an image proxy. */
/* eslint-disable @next/next/no-img-element */
import { DayRecord, mealKeys, mealLabels, hasRecord } from '../lib/records';
export function DayView({day,includeDiary=true}:{day:DayRecord;includeDiary?:boolean}) {
  if(!hasRecord(day)) return <p className="empty">この日の記録はまだありません。残したいことがあれば、ひとことから。</p>;
  return <div>{mealKeys.map(key=>{const meal=day[key];return (meal.note||meal.photos.length>0)&&<section className="history-meal" key={key}><h3>{mealLabels[key]}</h3><div className="history-photos">{meal.photos.map(photo=><img key={photo.id} src={photo.url} alt={`${mealLabels[key]}の写真`} loading="lazy"/>)}</div>{meal.note&&<p>{meal.note}</p>}</section>;})}
  {day.legacyMeals.map(meal=><section className="history-meal" key={meal.id}><h3>{mealLabels[meal.mealType as keyof typeof mealLabels] || '食事の記録'}</h3>{meal.photoUri&&<div className="history-photos"><img src={meal.photoUri} alt="保存した食事" loading="lazy"/></div>}<p>{meal.note}</p></section>)}
  {!!day.snacks.length&&<section className="history-meal"><h3>おやつ・そのほか</h3>{day.snacks.map(snack=><p key={snack.id}>{snack.note}</p>)}</section>}
  {includeDiary&&day.diary&&<section className="history-meal"><h3>その日の気持ち</h3><p>{day.diary}</p></section>}
  {!includeDiary&&day.diary&&<p className="small muted">気持ちの記録は共有に含めていません。</p>}</div>;
}
