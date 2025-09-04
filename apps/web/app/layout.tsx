'use client'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  return (
    <html lang="it">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', margin: 0 }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #eee'
        }}>
          <nav style={{ display: 'flex', gap: '16px' }}>
            <Link href="/">🏠 Home</Link>
            <Link href="/suggestions">💡 Suggestions</Link>
          </nav>
          {user ? (
            <button onClick={logout} style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '6px 12px',
              background: '#f9fafb'
            }}>
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
