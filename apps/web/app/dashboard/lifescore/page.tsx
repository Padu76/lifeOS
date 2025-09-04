"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

// util date Europe/Rome
function todayISOEuropeRome(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' }))
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

type LifeRow = { date: string; lifescore: number }
type Suggestion = { id?: string; suggestion_id?: string; text?: string; category?: string; completed?: boolean }

export default function LifeScoreDashboardPage() {
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<LifeRow[]>([])
  const [sugs, setSugs] = useState<Suggestion[]>([])

  const today = useMemo(() => todayISOEuropeRome(), [])

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const u = data.session?.user?.id ?? null
      if (!active) return
      setUid(u)
      setLoading(false)
    })()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!uid) return
    ;(async () => {
      const { data: life } = await supabase
        .from('lifescores')
        .select('date,lifescore')
        .eq('user_id', uid)
        .gte('date', sevenDaysAgoISO(today))
        .lte('date', today)
        .order('date', { ascending: true })

      setRows(life || [])

      const { data: suggestions } = await supabase
        .from('user_suggestions')
        .select('id,suggestion_id,text,category,completed')
        .eq('user_id', uid)
        .eq('date', today)

      setSugs(suggestions || [])
    })()
  }, [uid, today])

  const todayScore = rows.find(r => r.date === today)?.lifescore ?? null

  if (loading) {
    return <div className="p-6">Caricamento…</div>
  }
  if (!uid) {
    return <div className="p-6">Devi <Link className="underline" href="/sign-in">accedere</Link> per vedere il tuo LifeScore.</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">LifeScore</h1>
        <Link href="/checkin" className="rounded-xl bg-black text-white px-3 py-2">+ Check‑in</Link>
      </header>

      <section className="grid gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-gray-900 text-white">
            <span className="font-bold">{todayScore ?? '—'}</span>
            <span className="opacity-80">Oggi</span>
          </span>
          <span className="text-sm opacity-70">{formatItalianDate(today)}</span>
        </div>

        <Sparkline data={rows.map(r => r.lifescore)} />
        <p className="text-xs opacity-70">Ultimi 7 giorni</p>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Suggerimenti di oggi</h2>
        {sugs.length === 0 && <p className="text-sm opacity-70">Nessun suggerimento per oggi (ancora). Fai un <Link className="underline" href="/checkin">check‑in</Link> e lancia il rollup.</p>}
        <ul className="grid gap-2">
          {sugs.map((s, i) => (
            <li key={s.id ?? i} className="rounded-xl border p-3 flex items-center justify-between">
              <div>
                <p className="text-sm">{s.text ?? `Suggerimento #${s.suggestion_id}`}</p>
                {s.category && <p className="text-xs opacity-60 mt-0.5">{s.category}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${s.completed ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                {s.completed ? 'Fatto' : 'Da fare'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function sevenDaysAgoISO(today: string): string {
  const [y, m, d] = today.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() - 6)
  const ry = dt.getUTCFullYear()
  const rm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const rd = String(dt.getUTCDate()).padStart(2, '0')
  return `${ry}-${rm}-${rd}`
}

function formatItalianDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return <div className="h-16 bg-gray-100 rounded-xl" />
  const w = 320, h = 64, pad = 6
  const xs = data.map((_, i) => pad + (i * (w - 2*pad)) / Math.max(1, data.length - 1))
  const min = Math.min(...data), max = Math.max(...data)
  const scaleY = (v: number) => {
    if (max === min) return h/2
    const t = (v - min) / (max - min)
    return h - pad - t * (h - 2*pad)
  }
  const pts = data.map((v, i) => `${xs[i]},${scaleY(v)}`).join(' ')
  return (
    <svg width={w} height={h} className="rounded-xl border bg-white">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
