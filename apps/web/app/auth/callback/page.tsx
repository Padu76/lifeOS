'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Callback() {
  const router = useRouter()
  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href)
      const token_hash = url.searchParams.get('token_hash')
      const type = url.searchParams.get('type') as 'recovery' | 'invite' | 'magiclink' | 'email'
      if (token_hash) {
        const { error } = await supabase.auth.verifyOtp({ type: 'email', token_hash })
        if (error) console.error(error)
      }
      router.replace('/dashboard')
    })()
  }, [router])
  return <p className="p-6">Verifica in corso…</p>
}
