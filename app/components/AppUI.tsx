"use client";
import Link from "next/link";
import type { ReactNode } from "react";
export function PageHeader({title, description, eyebrow="Nourish"}:{title:string;description:string;eyebrow?:string}) { return <header className="page-header"><Link className="brand" href="/">✿ {eyebrow}</Link><h1>{title}</h1><p>{description}</p></header>; }
export function Notice({children, error=false}:{children:ReactNode;error?:boolean}) { return <div className={error?"notice error":"notice"} role={error?"alert":"status"}>{children}</div>; }
export function Loading({message="記録を読み込んでいます…"}:{message?:string}) { return <div className="loading" role="status"><span className="loading-flower" aria-hidden="true">✿</span><p>{message}</p></div>; }
export function AuthState({error}:{error:string}) { return error ? <div className="page"><Notice error>{error}</Notice><button className="button secondary" onClick={()=>window.location.reload()}>再読み込み</button></div> : <Loading message="ログインを確認しています…"/>; }
export function Empty({children}:{children:ReactNode}) { return <p className="empty">{children}</p>; }

