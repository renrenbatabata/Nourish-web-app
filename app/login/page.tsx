"use client";
import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../firebase";
import { useAuth } from "../hooks/useAuth";
import { errorMessage } from "../lib/errors";
import { Notice } from "../components/AppUI";
export default function Login() {
  const router=useRouter(); const {user,loading,error:authError}=useAuth();
  const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  useEffect(()=>{ if(!loading && user) router.replace("/"); },[user,loading,router]);
  const login=async()=>{setBusy(true);setError("");try{await signInWithPopup(auth,new GoogleAuthProvider());}catch(e){setError(errorMessage(e));}finally{setBusy(false);}};
  return <div className="login-shell"><div className="login-art"><p className="login-tagline">食べる日々に、<br/>やさしい余白を。</p></div><div className="surface login-card"><p className="eyebrow">あなたのペースで。</p><h1>✿ Nourish</h1><h2>今日の食事を、そっと残す。</h2><p>写真やひとことから。カロリーや点数で評価せず、食事と気持ちを振り返ります。</p>{(error||authError)&&<Notice error>{error||authError}</Notice>}<button className="button primary wide" onClick={login} disabled={busy||loading}>{loading?"ログインを確認中…":busy?"Googleの画面でログイン中…":"Googleでログイン"}</button><a className="quiet-link" href="https://nourish-web-app-nine.vercel.app/">正式なアプリのURLで開く</a><p className="small muted">記録はログインしたアカウントに保存します。写真のAI解析は、あなたが選んだときだけ行います。</p></div></div>;
}
