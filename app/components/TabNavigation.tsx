"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items=[{path:"/",label:"きょう",icon:"⌂"},{path:"/history",label:"記録",icon:"▦"},{path:"/foodbook",label:"食材",icon:"♧"},{path:"/nutrition",label:"栄養",icon:"❋"},{path:"/settings",label:"設定",icon:"⚙"}];
export function TabNavigation(){const pathname=usePathname();if(pathname==="/login"||pathname==="/onboarding")return null;return <nav className="bottom-nav" aria-label="メインメニュー">{items.map(item=><Link key={item.path} href={item.path} aria-current={pathname===item.path?"page":undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav>;}
