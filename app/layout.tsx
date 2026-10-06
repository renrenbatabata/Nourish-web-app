
import './globals.css';
import { TabNavigation } from './components/TabNavigation';
export const metadata={title:'Nourish | 食べる日々の記録',description:'写真や言葉で、あなたのペースで残す食事の記録。'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ja"><body><a className="sr-only skip-link" href="#main">本文へ</a><main id="main">{children}</main><TabNavigation/></body></html>;}
