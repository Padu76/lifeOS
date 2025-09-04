'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function Callback() {
  const router = useRouter()
  const sp = useSearchParams()

  useEffect(() => {
    (async () => {
      // Supabase mette questi parametri nella URL del magic link
      const token_hash = sp.get('token_hash')
      // Usa il type passato dal link (magiclink/recovery/signup/email). Default: magiclink
      const type = (sp.get('type') ?? 'magiclink') as
        | 'magiclink' | 'recovery' | 'signup' | 'email'

      if (token_hash) {
        // Verifica OTP/magic link e crea la sessione
        await supabase.auth.verifyOtp({ token_hash, type })
      }

      // Vai alla dashboard (o dove preferisci)
      router.replace('/dashboard')
    })()
  }, [router, sp])

  return <p className="p-6">Verifica in corso…</p>
}
