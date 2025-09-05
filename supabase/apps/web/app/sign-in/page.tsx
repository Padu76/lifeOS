"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'sent'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!alive) return
      if (data.session?.user) router.replace('/dashboard')
    })()
    return () => { alive = false }
  }, [router])

  const sendOtp = async () => {
    setErrorMsg(null); setOkMsg(null)
    if (!email) { setErrorMsg('Inserisci la tua email'); return }
    setSending(true)
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true
        }
      })
      if (error) throw error
      setPhase('sent')
      setOkMsg('Email inviata: inserisci il codice a 6 cifre oppure clicca il link nella mail.')
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Errore invio OTP')
    } finally {
      setSending(false)
    }
  }

  const verifyCode = async () => {
    setErrorMsg(null); setOkMsg(null)
    if (!email || !code) { setErrorMsg('Inserisci email e codice'); return }
    setVerifying(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email' // per docs: 'email' usato per sign-in/signup
      })
      if (error) throw error
      router.replace('/dashboard')
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Codice non valido')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6 min-h-[100dvh] flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Accedi</h1>
        <p className="text-sm opacity-70">Inserisci email, riceverai un codice e un link.</p>
      </header>

      <label className="grid gap-2">
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          placeholder="tuo@email.it"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          className="w-full rounded-xl border p-3"
        />
      </label>

      {phase === 'idle' && (
        <button
          onClick={sendOtp}
          disabled={sending}
          className="rounded-2xl bg-black text-white px-4 py-3 disabled:opacity-60"
        >
          {sending ? 'Invio…' : 'Invia codice / link'}
        </button>
      )}

      {phase === 'sent' && (
        <div className="grid gap-3">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Codice a 6 cifre (dalla mail)</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={e=>setCode(e.target.value)}
              className="w-full rounded-xl border p-3 tracking-widest text-center text-lg"
            />
          </label>
          <button
            onClick={verifyCode}
            disabled={verifying}
            className="rounded-2xl bg-black text-white px-4 py-3 disabled:opacity-60"
          >
            {verifying ? 'Verifica…' : 'Verifica codice'}
          </button>

          <button
            onClick={sendOtp}
            disabled={sending}
            className="rounded-xl border px-3 py-2"
          >
            {sending ? 'Re-invio…' : 'Reinvia email'}
          </button>

          <p className="text-xs opacity-70">
            In alternativa, clicca il <strong>link</strong> nella mail: verremo qui
            su <code>/auth/callback</code> e ti porteremo alla dashboard.
          </p>
        </div>
      )}

      {okMsg && <p className="text-green-700 text-sm">{okMsg}</p>}
      {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
    </div>
  )
}
