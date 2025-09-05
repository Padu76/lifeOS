'use client'
import './globals.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let alive = true
    supabase.auth.getUser().then(({ data }) => { if (alive) setUser(data.user) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setUser(session?.user ?? null)
    })
    return () => { alive = false; subscription.unsubscribe() }
  }, [])

  const logout = async () => { await supabase.auth.signOut(); router.push('/sign-in') }

  return (
    <html lang="it">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', margin: 0 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #eee' }}>
          <nav style={{ display: 'flex', gap: 16 }}>
            <Link href="/">🏠 Home</Link>
            <Link href="/suggestions">💡 Suggestions</Link>
            <Link href="/dashboard">📈 Dashboard</Link>
            <Link href="/profile">👤 Profilo</Link>
          </nav>
          {user ? (
            <button onClick={logout} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', background: '#f9fafb' }}>
              Logout
            </button>
          ) : (
            <Link href="/sign-in">Accedi</Link>
          )}
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
