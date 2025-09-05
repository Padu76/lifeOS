"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return

      const url = new URL(window.location.href)

      // 1) Flow consigliato: token_hash in query
      const token_hash = url.searchParams.get('token_hash')
      const type = (url.searchParams.get('type') ?? 'email') as any
      if (token_hash) {
        try {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type })
          if (error) console.error('verifyOtp error:', error.message)
          // pulisci query
          url.search = ''
          window.history.replaceState({}, '', url.toString())
          router.replace('/dashboard')
          return
        } catch (e) {
          console.error(e)
        }
      }

      // 2) Vecchio flow magic link: token nel fragment #access_token=...
      if (url.hash) {
        const h = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
        const p = new URLSearchParams(h)
        const access_token = p.get('access_token') || undefined
        const refresh_token = p.get('refresh_token') || undefined
        if (access_token && refresh_token) {
          try {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) console.error('setSession error:', error.message)
            url.hash = ''
            window.history.replaceState({}, '', url.toString())
            router.replace('/dashboard')
            return
          } catch (e) {
            console.error(e)
          }
        }
      }

      // 3) Fallback
      router.replace('/sign-in')
    })()
  }, [router])

  return <p className="p-6">Verifica in corso…</p>
}
