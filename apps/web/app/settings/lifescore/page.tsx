"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

type Weights = {
  w_mood: number
  w_sleep: number
  w_steps: number
  steps_goal: number
  sleep_goal: number
}

function pct(n: number) { return Math.round(n * 100) }

function todayISOEuropeRome(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function LifeScoreSettingsPage() {
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const [wMood, setWMood]   = useState(0.30)
  const [wSleep, setWSleep] = useState(0.30)
  const [wSteps, setWSteps] = useState(0.40)
  const [stepsGoal, setStepsGoal] = useState(8000)
  const [sleepGoal, setSleepGoal] = useState(7.5)

  const sum = useMemo(() => wMood + wSleep + wSteps, [wMood, wSleep, wSteps])
  const today = useMemo(() => todayISOEuropeRome(), [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const id = data.session?.user?.id ?? null
      if (!alive) return
      setUid(id)
      setLoading(false)
      if (!id) return

      const { data: row } = await supabase
        .from('lifescore_weights')
        .select('w_mood,w_sleep,w_steps,steps_goal,sleep_goal')
        .eq('user_id', id)
        .maybeSingle()

      if (row) {
        setWMood(Number(row.w_mood ?? 0.3))
        setWSleep(Number(row.w_sleep ?? 0.3))
        setWSteps(Number(row.w_steps ?? 0.4))
        setStepsGoal(Number(row.steps_goal ?? 8000))
        setSleepGoal(Number(row.sleep_goal ?? 7.5))
      }
    })()
    return () => { alive = false }
  }, [])

  const save = async () => {
    if (!uid) return
    setSaving(true); setMsg(null); setErr(null)

    // Normalizza i pesi lato client (il rollup normalizza comunque lato server)
    let wm = wMood, ws = wSleep, wt = wSteps
    const s = wm + ws + wt
    if (s > 0 && Math.abs(s - 1) > 0.001) {
      wm = wm / s; ws = ws / s; wt = wt / s
    }

    const payload = {
      user_id: uid,
      w_mood: wm,
      w_sleep: ws,
      w_steps: wt,
      steps_goal: stepsGoal,
      sleep_goal: sleepGoal
    }

    const { error } = await supabase
      .from('lifescore_weights')
      .upsert(payload, { onConflict: 'user_id' })

    if (error) setErr(error.message)
    else setMsg('Impostazioni salvate!')
    setSaving(false)
  }

  if (loading) return <div className="p-6">Caricamento…</div>
  if (!uid) return <div className="p-6">Devi <Link className="underline" href="/sign-in">accedere</Link> per modificare le impostazioni.</div>

  return (
    <div className="mx-auto max-w-xl p-4 md:p-6 grid gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Impostazioni LifeScore</h1>
        <Link href="/dashboard/lifescore" className="rounded-xl bg-black text-white px-3 py-2">↩︎ Dashboard</Link>
      </header>

      <section className="rounded-2xl border bg-white p-4 grid gap-4">
        <h2 className="text-lg font-semibold">Pesi</h2>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Umore: {pct(wMood)}%</label>
          <input type="range" min={0} max={100} value={pct(wMood)} onChange={e=>setWMood(Number(e.target.value)/100)} />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Sonno: {pct(wSleep)}%</label>
          <input type="range" min={0} max={100} value={pct(wSleep)} onChange={e=>setWSleep(Number(e.target.value)/100)} />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Passi: {pct(wSteps)}%</label>
          <input type="range" min={0} max={100} value={pct(wSteps)} onChange={e=>setWSteps(Number(e.target.value)/100)} />
        </div>

        <p className={`text-xs ${Math.abs(sum-1) < 0.001 ? 'text-green-700' : 'text-amber-700'}`}>
          Somma pesi: {Math.round(sum*100)}% {Math.abs(sum-1) < 0.001 ? '(ok)' : '(verrà normalizzata al salvataggio)'}
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-4 grid gap-4">
        <h2 className="text-lg font-semibold">Obiettivi</h2>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Passi target (giorno)</label>
          <input type="number" min={500} max={100000} step={500} value={stepsGoal}
                 onChange={e=>setStepsGoal(Number(e.target.value))}
                 className="w-full rounded-xl border p-3" />
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium">Ore di sonno (target)</label>
          <input type="number" min={3} max={12} step={0.25} value={sleepGoal}
                 onChange={e=>setSleepGoal(Number(e.target.value))}
                 className="w-full rounded-xl border p-3" />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
                className="rounded-2xl bg-black text-white px-4 py-2 disabled:opacity-60">
          {saving ? 'Salvataggio…' : 'Salva impostazioni'}
        </button>
        <span className="text-xs opacity-60">Oggi: {today}</span>
      </div>

      {msg && <p className="text-green-700 text-sm">{msg}</p>}
      {err && <p className="text-red-600 text-sm">{err}</p>}
    </div>
  )
}
