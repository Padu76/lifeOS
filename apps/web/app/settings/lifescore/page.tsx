"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Settings, Target, Activity, Brain, Moon, TrendingUp, Save, RefreshCw, Menu, X } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

type Weights = {
  w_mood: number
  w_sleep: number
  w_steps: number
  steps_goal: number
  sleep_goal: number
}

// Mobile Menu Component
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-lg border-l border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            LifeOS
          </span>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-6 space-y-6">
          {[
            { href: '/', label: 'Home' },
            { href: '/suggestions', label: 'Suggestions' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/settings', label: 'Settings' }
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block text-lg font-semibold text-white/80 hover:text-white transition-colors py-2"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Custom Range Slider Component
const CustomRangeSlider: React.FC<{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  color: string;
  icon: React.ReactNode;
}> = ({ value, onChange, min = 0, max = 100, step = 1, label, color, icon }) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 bg-gradient-to-r ${color} rounded-xl`}>
            {icon}
          </div>
          <span className="text-white font-medium text-sm sm:text-base">{label}</span>
        </div>
        <div className="text-white font-bold text-lg">
          {typeof value === 'number' && max === 100 ? `${Math.round(value)}%` : value}
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, 
              rgb(59, 130, 246) 0%, 
              rgb(139, 92, 246) ${percentage}%, 
              rgba(255, 255, 255, 0.2) ${percentage}%, 
              rgba(255, 255, 255, 0.2) 100%)`
          }}
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
          }
          .slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3B82F6, #8B5CF6);
            border: 2px solid white;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </div>
    </div>
  );
};

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [wMood, setWMood]   = useState(0.30)
  const [wSleep, setWSleep] = useState(0.30)
  const [wSteps, setWSteps] = useState(0.40)
  const [stepsGoal, setStepsGoal] = useState(8000)
  const [sleepGoal, setSleepGoal] = useState(7.5)

  const sum = useMemo(() => wMood + wSleep + wSteps, [wMood, wSleep, wSteps])
  const today = useMemo(() => todayISOEuropeRome(), [])

  useEffect(() => {
    setMounted(true)
  }, [])

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

    // Normalizza i pesi lato client
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
    else setMsg('Impostazioni salvate con successo!')
    setSaving(false)

    // Hide success message after 3 seconds
    if (!error) {
      setTimeout(() => setMsg(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-base sm:text-lg">Caricamento impostazioni...</div>
        </div>
      </div>
    )
  }

  if (!uid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20 text-center max-w-md mx-4">
          <div className="text-red-400 text-lg sm:text-xl font-semibold mb-4">Accesso richiesto</div>
          <p className="text-white/70 mb-6">Devi essere autenticato per modificare le impostazioni LifeScore.</p>
          <Link
            href="/sign-in"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-transform inline-block"
          >
            Accedi
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Navigation - Mobile Optimized */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors min-w-0 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Dashboard</span>
            </Link>
            
            {/* Logo centralized */}
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Apri menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8 text-white/80">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/suggestions" className="hover:text-white transition-colors">Suggestions</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/settings" className="hover:text-white transition-colors">Settings</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Settings className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-400" />
            Impostazioni LifeScore
          </h1>
          <p className="text-white/70 text-sm sm:text-base">Personalizza i parametri per il calcolo del tuo punteggio benessere</p>
        </div>

        {/* Messages */}
        {msg && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-400/20 rounded-lg text-green-300 text-center animate-fade-in">
            {msg}
          </div>
        )}
        
        {err && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-400/20 rounded-lg text-red-300 text-center">
            {err}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Weights Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Pesi delle Metriche</h2>
            </div>

            <div className="space-y-6">
              <CustomRangeSlider
                value={pct(wMood)}
                onChange={(value) => setWMood(value / 100)}
                min={0}
                max={100}
                label="Umore"
                color="from-yellow-500 to-orange-600"
                icon={<Brain className="w-5 h-5 text-white" />}
              />

              <CustomRangeSlider
                value={pct(wSleep)}
                onChange={(value) => setWSleep(value / 100)}
                min={0}
                max={100}
                label="Sonno"
                color="from-indigo-500 to-purple-600"
                icon={<Moon className="w-5 h-5 text-white" />}
              />

              <CustomRangeSlider
                value={pct(wSteps)}
                onChange={(value) => setWSteps(value / 100)}
                min={0}
                max={100}
                label="Attività Fisica"
                color="from-green-500 to-blue-600"
                icon={<Activity className="w-5 h-5 text-white" />}
              />

              <div className={`p-3 rounded-lg text-sm text-center ${
                Math.abs(sum - 1) < 0.001 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
              }`}>
                Somma pesi: {Math.round(sum * 100)}%
                <div className="text-xs opacity-75 mt-1">
                  {Math.abs(sum - 1) < 0.001 ? 'Perfetto!' : 'Verrà normalizzata automaticamente'}
                </div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-bold text-white">Obiettivi Giornalieri</h2>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <label className="text-white font-medium text-sm sm:text-base">Passi target</label>
                    <div className="text-white/60 text-xs">Obiettivo giornaliero</div>
                  </div>
                </div>
                <input
                  type="number"
                  min={500}
                  max={100000}
                  step={500}
                  value={stepsGoal}
                  onChange={(e) => setStepsGoal(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 min-h-[44px] text-sm sm:text-base focus:border-blue-400/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                    <Moon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <label className="text-white font-medium text-sm sm:text-base">Ore di sonno</label>
                    <div className="text-white/60 text-xs">Obiettivo notturno</div>
                  </div>
                </div>
                <input
                  type="number"
                  min={3}
                  max={12}
                  step={0.25}
                  value={sleepGoal}
                  onChange={(e) => setSleepGoal(Number(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 min-h-[44px] text-sm sm:text-base focus:border-purple-400/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Current Date Info */}
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white/60 text-xs">Data corrente</div>
                <div className="text-white font-medium">{today}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={save}
            disabled={saving}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-3 min-h-[44px] shadow-xl"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Salvataggio in corso...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salva Impostazioni
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-400" />
            Come funziona il LifeScore
          </h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-white/70">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-white">Umore</div>
              <div>Stato emotivo giornaliero</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-white">Sonno</div>
              <div>Qualità del riposo</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-white">Attività</div>
              <div>Movimento e fitness</div>
            </div>
          </div>
          <p className="text-center text-white/60 text-xs mt-4">
            Il LifeScore combina questi fattori usando i pesi personalizzati per calcolare il tuo benessere complessivo
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}