'use client'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }){
  const router=useRouter(); const [user,setUser]=useState<any>(null);
  useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user));const{sub}=supabase.auth.onAuthStateChange((_e,s)=>setUser(s?.user??null));return()=>{sub.subscription.unsubscribe()};},[]);
  const logout=async()=>{await supabase.auth.signOut();router.push('/sign-in')}
  return(<html lang="it"><body><header style={{display:'flex',justifyContent:'space-between',padding:'12px 20px',borderBottom:'1px solid #eee'}}><nav style={{display:'flex',gap:16}}><Link href="/">🏠 Home</Link><Link href="/suggestions">💡 Suggestions</Link><Link href="/dashboard">📈 Dashboard</Link></nav>{user?(<button onClick={logout}>Logout</button>):(<Link href="/sign-in">Accedi</Link>)}</header><main>{children}</main></body></html>)
}
