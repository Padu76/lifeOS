'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function CallbackClient() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    (async () => {
      const token_hash = sp.get('token_hash')
      const type = (sp.get('type') ?? 'magiclink') as
        | 'magiclink' | 'recovery' | 'signup' | 'email_change' | 'email'

      if (token_hash) {
        await supabase.auth.verifyOtp({ token_hash, type })
      }
      router.replace('/dashboard')
    })()
  }, [router, sp])

  return <p className="p-6">Verifica in corso…</p>
}
