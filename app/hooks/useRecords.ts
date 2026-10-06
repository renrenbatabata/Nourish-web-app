"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { collection, doc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { db } from "../../firebase";
import { combineRecords, DayRecord, emptyDay, isDateKey } from "../lib/records";
import { errorMessage } from "../lib/errors";
export function useRecords(uid?: string) {
  const [version, setVersion] = useState(0);
  const [snapshot, setSnapshot] = useState<{ uid?: string; version: number; days: Record<string, DayRecord>; error: string }>({ version:-1, days:{}, error:"" });
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  useEffect(() => {
    if (!uid) return;
    let active = true;
    const timer = setTimeout(() => { if(active) { active=false; setSnapshot({uid, version, days:{}, error:"読み込みに時間がかかっています。接続を確認して再試行してください。"}); } }, 20000);
    const read = async (name: string) => (await getDocs(query(collection(db,name), where("uid","==",uid)))).docs.map(d => ({id:d.id, data:d.data()}));
    Promise.all([read("dailyMeals"),read("meals"),read("diary"),read("snacks")]).then(([daily,meals,diary,snacks]) => {
      if(active) setSnapshot({ uid, version, days:combineRecords(uid,daily,meals,diary,snacks), error:"" });
    }).catch(e => { if(active) setSnapshot({ uid,version,days:{},error:errorMessage(e) }); }).finally(() => clearTimeout(timer));
    return () => { active=false; clearTimeout(timer); };
  },[uid,version]);
  const ready = !!uid && snapshot.uid === uid && snapshot.version === version;
  const days = ready ? snapshot.days : {};
  const save = async (date: string, patch: Partial<Omit<DayRecord,"date"|"legacyMeals">>) => {
    if (!uid || !ready || snapshot.error || !isDateKey(date)) throw new Error("記録を読み込んでから再試行してください。");
    if(lock.current) throw new Error("保存が終わるまでお待ちください。");
    lock.current=true; setSaving(true);
    try {
      await setDoc(doc(db,"dailyMeals",`${uid}_${date}`),{ uid,date,...patch,updatedAt:Timestamp.now() },{ mergeFields:["uid","date","updatedAt",...Object.keys(patch)] });
      setSnapshot(prev => prev.uid !== uid ? prev : { ...prev, days:{...prev.days,[date]:{...(prev.days[date] ?? emptyDay(date)),...patch}} });
    } finally { lock.current=false; setSaving(false); }
  };
  const retry = useCallback(() => setVersion(v => v+1),[]);
  return { days, loading: !!uid && !ready, error:ready ? snapshot.error : "", saving, save, retry };
}
