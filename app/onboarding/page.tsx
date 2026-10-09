"use client";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { AuthState, PageHeader } from "../components/AppUI";
export default function Onboarding(){const {user,loading,error}=useAuth(true);if(loading||!user||error)return <AuthState error={error}/>;return <div className="page narrow"><PageHeader title="あなたのペースで、はじめよう。" description="すべてを記録しなくても大丈夫です。"/><section className="surface stack"><h2>写真でも、ひとことでも。</h2><p>記録する日や食事を選んで残せます。体重や身長の入力は必要ありません。</p><p>栄養の振り返りは、食材から含まれそうな栄養の種類を知るためのものです。食べた量と数値を確認して、自分の一日の栄養目標と比較できます。目標は設定画面から入力できます。</p><Link href="/" className="button primary">きょうの記録へ</Link></section></div>;}

