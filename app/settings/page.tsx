"use client";
import { NutritionGoalsSettings } from '../components/NutritionGoalsSettings';
import {useEffect,useState} from 'react';
import {doc,getDoc,setDoc} from 'firebase/firestore';
import {signOut} from 'firebase/auth';
import {auth,db} from '../../firebase';
import {useAuth} from '../hooks/useAuth';
import {errorMessage} from '../lib/errors';
import {AuthState,Loading,Notice,PageHeader} from '../components/AppUI';
export default function Settings(){
 const {user,loading,error}=useAuth(true);const [value,setValue]=useState(false);const [ready,setReady]=useState(false);const [busy,setBusy]=useState(false);const [failure,setFailure]=useState('');const [message,setMessage]=useState('');const [retry,setRetry]=useState(0);
 useEffect(()=>{if(!user)return;let active=true;const timer=setTimeout(()=>{if(active){active=false;setFailure('読み込みに時間がかかっています。再読み込みしてください。');}},20000);getDoc(doc(db,'users',user.uid)).then(d=>{if(active){setValue(d.data()?.showNutrition!==false);setReady(true);}}).catch(e=>{if(active)setFailure(errorMessage(e));}).finally(()=>clearTimeout(timer));return()=>{active=false;clearTimeout(timer);};},[user,retry]);
 if(loading||error||!user)return <AuthState error={error}/>;
 const save=async()=>{setBusy(true);setFailure('');setMessage('');try{await setDoc(doc(db,'users',user.uid),{showNutrition:value},{merge:true});setMessage('表示の設定を保存しました。');}catch(e){setFailure(errorMessage(e));}finally{setBusy(false);}};
 return <div className="page narrow"><PageHeader title="あなたに合う使い方に" description="心地よく使える表示を選べます。"/><section className="surface"><h2>栄養の振り返り</h2><p>写真から食材と栄養の種類を振り返る機能です。食べた量を補正して、設定した一日の栄養目標と比較できます。</p>{!ready&&!failure?<Loading/>:null}{ready&&<><label className="check"><input type="checkbox" checked={value} disabled={busy} onChange={e=>{setValue(e.target.checked);setMessage('');}}/>食事の記録に、AIで振り返る機能を表示する</label><p className="small muted">非表示でも、写真・メモ・気持ちの記録を使えます。AIへ写真を送る前には、毎回確認します。</p><button className="button primary" disabled={busy} onClick={save}>{busy?'保存しています…':'設定を保存'}</button></>}{failure&&<Notice error>{failure}{!ready&&<button className="button secondary" onClick={()=>{setFailure('');setRetry(v=>v+1);}}>再読み込み</button>}</Notice>}{message&&<Notice>{message}</Notice>}</section><NutritionGoalsSettings key={user.uid} uid={user.uid}/><section className="surface share-panel"><h2>アカウント</h2><p className="preserve">{user.email}</p><p className="small muted">記録はこのアカウントに保存されます。共有端末では、使い終わったらログアウトしてください。</p><button className="button secondary" disabled={busy} onClick={async()=>{setBusy(true);try{await signOut(auth);}catch(e){setFailure(errorMessage(e));}finally{setBusy(false);}}}>ログアウト</button></section></div>;
}

