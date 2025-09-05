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
      // Usa il type passato dal template; default 'magiclink'
      const qsType = url.searchParams.get('type') || 'magiclink'
      const allowed = new Set(['magiclink', 'signup', 'recovery', 'email_change'])
      const type = (allowed.has(qsType) ? qsType : 'magiclink') as any

      if (token_hash) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type })
        if (!error) {
          url.search = ''
          window.history.replaceState({}, '', url.toString())
          router.replace('/dashboard/lifescore')
          return
        } else {
          console.error('verifyOtp error:', error.message)
        }
      }

      // 2) Vecchio flow magic link: token nel fragment #access_token=...
      if (url.hash) {
        const h = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash
        const p = new URLSearchParams(h)
        const access_token = p.get('access_token') || undefined
        const refresh_token = p.get('refresh_token') || undefined
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (!error) {
            url.hash = ''
            window.history.replaceState({}, '', url.toString())
            router.replace('/dashboard/lifescore')
            return
          } else {
            console.error('setSession error:', error.message)
          }
        }
      }

      // 3) Fallback
      router.replace('/sign-in')
    })()
  }, [router])

  return <p className="p-6">Verifica in corso…</p>
}
