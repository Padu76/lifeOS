'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

function parseHashFragment(hash: string) {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  const p = new URLSearchParams(h)
  const access_token = p.get('access_token') || undefined
  const refresh_token = p.get('refresh_token') || undefined
  return { access_token, refresh_token }
}

export default function CallbackClient() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    (async () => {
      // 1) Flow con token_hash in query (server-side recommended)
      const token_hash = sp.get('token_hash')
      const typeFromQs = sp.get('type') || 'email' // 'email' consigliato; 'magiclink' è deprecato
      if (token_hash) {
        try {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type: typeFromQs as any })
          if (error) console.error('verifyOtp error:', error.message)
          // pulisci query
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href)
            url.search = ''
            window.history.replaceState({}, '', url.toString())
          }
          router.replace('/dashboard')
          return
        } catch (e) {
          console.error(e)
        }
      }

      // 2) Flow default magic link: tokens nel fragment dopo redirect
      if (typeof window !== 'undefined' && window.location.hash) {
        const { access_token, refresh_token } = parseHashFragment(window.location.hash)
        if (access_token && refresh_token) {
          try {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token })
            if (error) console.error('setSession error:', error.message)
            // pulisci hash
            const url = new URL(window.location.href)
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
  }, [router, sp])

  return <p className="p-6">Verifica in corso…</p>
}
