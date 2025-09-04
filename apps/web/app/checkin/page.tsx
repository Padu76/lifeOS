"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

// Util: "oggi" in Europe/Rome (ISO YYYY-MM-DD)
function todayISOEuropeRome(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Anteprima punteggio lato client (l'ufficiale gira lato DB/Edge Function)
function previewScore(mood: number, sleep: number, steps: number) {
  const stepsGoal = 8000
  const sleepGoal = 7.5

  const moodScore = Math.round(((mood - 1) / 4) * 100)
  const sleepScore = sleep <= sleepGoal
    ? Math.round(100 * (sleep / sleepGoal))
    : Math.round(Math.max(0, 100 - 15 * (sleep - sleepGoal)))
  const stepsScore = Math.round(Math.min(1, steps / stepsGoal) * 100)

  const total = Math.round(0.3 * moodScore + 0.3 * sleepScore + 0.4 * stepsScore)
  return { moodScore, sleepScore, stepsScore, total }
}

export default function CheckinPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [mood, setMood] = useState<number>(3)
  const [sleep, setSleep] = useState<number>(7.0)
  const [steps, setSteps] = useState<number>(6000)

  const isoToday = useMemo(() => todayISOEuropeRome(), [])
  const { total } = previewScore(mood, sleep, steps)

  // Carica utente
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: sessionData, error } = await supabase.auth.getSession()
      if (!active) return
      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }
      const session = sessionData?.session
      const uid = session?.user?.id ?? null
      setUserId(uid)
      setLoading(false)
    })()
    return () => { active = false }
  }, [])

  const handleSave = async () => {
    if (!userId) {
      router.push('/sign-in')
      return
    }

    setSaving(true)
    setErrorMsg(null)
    setOkMsg(null)

    const payload = {
      user_id: userId,
      date: isoToday,
      mood,
      sleep_hours: sleep,
      steps,
      source: 'manual' as const,
    }

    const { error } = await supabase
      .from('health_metrics')
      .upsert(payload, { onConflict: 'user_id,date' })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setOkMsg('Check‑in salvato!')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-sm p-6 min-h-[100dvh] flex items-center justify-center">
        <p className="opacity-70">Caricamento…</p>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-sm p-6 min-h-[100dvh] flex flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-2xl font-bold">Check‑in giornaliero</h1>
        <p className="opacity-80">Accedi per registrare umore, sonno e passi.</p>
        <Link href="/sign-in" className="rounded-2xl px-4 py-2 bg-black text-white">Vai al login</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm p-4 min-h-[100dvh] flex flex-col gap-4">
      <header className="pt-4">
        <h1 className="text-2xl font-bold">Check‑in giornaliero</h1>
        <p className="text-sm opacity-70">Umore • Sonno • Passi</p>
      </header>

      <section className="bg-white rounded-2xl shadow p-4 grid gap-4">
        {/* Umore */}
        <div>
          <label className="block text-sm font-medium mb-1">Umore</label>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map((v)=> (
              <button
                key={v}
                onClick={()=>setMood(v)}
                className={`h-10 w-10 rounded-full border flex items-center justify-center text-lg ${mood===v? 'bg-black text-white' : 'bg-gray-100'}`}
                aria-pressed={mood===v}
              >{['😕','🙁','😐','🙂','😄'][v-1]}</button>
            ))}
          </div>
        </div>

        {/* Sonno */}
        <div>
          <label className="block text-sm font-medium mb-1">Ore di sonno</label>
          <input
            type="number"
            inputMode="decimal"
            step={0.5}
            min={0}
            max={14}
            value={sleep}
            onChange={(e)=>setSleep(Number(e.target.value))}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Passi */}
        <div>
          <label className="block text-sm font-medium mb-1">Passi</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={100000}
            value={steps}
            onChange={(e)=>setSteps(Number(e.target.value))}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Anteprima punteggio */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-sm">Anteprima LifeScore di oggi</p>
          <p className="text-4xl font-extrabold">{total}</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-2xl py-3 font-semibold bg-black text-white disabled:opacity-60">
          {saving ? 'Salvataggio…' : 'Salva check‑in'}
        </button>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
        {okMsg && <p className="text-sm text-green-700">{okMsg}</p>}
      </section>

      <footer className="mt-auto pb-2 text-center text-xs opacity-60">
        Dati salvati in Supabase • fuso orario Europe/Rome
      </footer>
    </div>
  )
}
