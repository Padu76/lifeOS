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

// Anteprima punteggio avanzato lato client
function previewAdvancedScore(
  mood: number, 
  sleep_hours: number, 
  sleep_quality: number,
  steps: number, 
  active_minutes: number,
  stress: number, 
  energy: number
) {
  // Sleep score (0-100)
  const sleepTarget = 8
  const hoursRatio = Math.min(sleep_hours / sleepTarget, 1.2)
  let hoursScore = 70
  
  if (hoursRatio < 0.75) {
    hoursScore = hoursRatio * 93.33
  } else if (hoursRatio > 1.125) {
    hoursScore = 70 - (hoursRatio - 1.125) * 80
  }
  
  const qualityScore = ((sleep_quality - 1) / 4) * 30
  const sleepScore = Math.max(0, Math.min(100, hoursScore + qualityScore))

  // Activity score (0-100)
  const stepsTarget = 7000
  const activeTarget = 30
  const stepsRatio = Math.min(steps / stepsTarget, 1.5)
  const stepsComponent = Math.min(stepsRatio * 60, 60)
  const activeRatio = Math.min(active_minutes / activeTarget, 1.5)
  const activeComponent = Math.min(activeRatio * 40, 40)
  const activityScore = Math.max(0, Math.min(100, stepsComponent + activeComponent))

  // Mental score (0-100)
  const moodComponent = ((mood - 1) / 4) * 40
  const stressComponent = ((5 - stress) / 4) * 30 // inverted
  const energyComponent = ((energy - 1) / 4) * 30
  const mentalScore = Math.max(0, Math.min(100, moodComponent + stressComponent + energyComponent))

  // Dynamic weighting
  const avgScore = (sleepScore + activityScore + mentalScore) / 3
  let w_sleep = 0.4, w_activity = 0.3, w_mental = 0.3
  
  // Adjust weights for outliers
  const adjustments = {
    sleep: sleepScore < avgScore - 20 ? 0.1 : 0,
    activity: activityScore < avgScore - 20 ? 0.1 : 0,
    mental: mentalScore < avgScore - 20 ? 0.1 : 0
  }
  
  const totalAdjustment = Object.values(adjustments).reduce((sum, adj) => sum + adj, 0)
  const remainingWeight = 1 - totalAdjustment
  
  w_sleep = (w_sleep * remainingWeight) + adjustments.sleep
  w_activity = (w_activity * remainingWeight) + adjustments.activity
  w_mental = (w_mental * remainingWeight) + adjustments.mental

  const finalScore = Math.round(sleepScore * w_sleep + activityScore * w_activity + mentalScore * w_mental)

  return {
    sleepScore: Math.round(sleepScore),
    activityScore: Math.round(activityScore),
    mentalScore: Math.round(mentalScore),
    finalScore: Math.max(0, Math.min(100, finalScore))
  }
}

export default function CheckinPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Form state
  const [mood, setMood] = useState<number>(3)
  const [sleep_hours, setSleepHours] = useState<number>(7.0)
  const [sleep_quality, setSleepQuality] = useState<number>(3)
  const [steps, setSteps] = useState<number>(6000)
  const [active_minutes, setActiveMinutes] = useState<number>(20)
  const [stress, setStress] = useState<number>(3)
  const [energy, setEnergy] = useState<number>(3)

  const isoToday = useMemo(() => todayISOEuropeRome(), [])
  const preview = previewAdvancedScore(mood, sleep_hours, sleep_quality, steps, active_minutes, stress, energy)

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
      stress,
      energy,
      sleep_hours,
      sleep_quality,
      steps,
      active_minutes,
      source: 'manual' as const,
    }

    const { error } = await supabase
      .from('health_metrics')
      .upsert(payload, { onConflict: 'user_id,date' })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setOkMsg('Check‑in salvato! Il tuo LifeScore verrà calcolato a breve.')
    }
    setSaving(false)
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Come ti senti?'
      case 2: return 'Il tuo sonno'
      case 3: return 'Attività fisica'
      default: return 'Riepilogo'
    }
  }

  const getRatingEmoji = (value: number, type: 'mood' | 'stress' | 'energy' | 'sleep_quality') => {
    const emojis = {
      mood: ['😞', '😐', '🙂', '😊', '😄'],
      stress: ['😌', '😊', '😐', '😰', '😵'],
      energy: ['😴', '😪', '😐', '⚡', '🔥'],
      sleep_quality: ['😵', '😪', '😐', '😊', '😄']
    }
    return emojis[type][value - 1] || '😐'
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-md p-6 min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-md p-6 min-h-[100dvh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-2xl font-bold text-gray-900">Check‑in giornaliero</h1>
        <p className="text-gray-600">Accedi per tracciare il tuo benessere quotidiano</p>
        <Link 
          href="/sign-in" 
          className="rounded-2xl px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
        >
          Vai al login
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md p-4 min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="pt-4 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Check‑in</h1>
        <p className="text-gray-600">{getStepTitle(currentStep)}</p>
        
        {/* Progress indicator */}
        <div className="flex space-x-2 mt-4">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Step content */}
      <div className="flex-1">
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Umore */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-lg font-semibold mb-4">Come è il tuo umore oggi?</label>
              <div className="grid grid-cols-5 gap-3">
                {[1,2,3,4,5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setMood(v)}
                    className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition-all ${
                      mood === v 
                        ? 'border-blue-500 bg-blue-50 transform scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getRatingEmoji(v, 'mood')}
                  </button>
                ))}
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {['Pessimo', 'Così così', 'Normale', 'Bene', 'Fantastico'][mood - 1]}
              </div>
            </div>

            {/* Stress */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-lg font-semibold mb-4">Livello di stress</label>
              <div className="grid grid-cols-5 gap-3">
                {[1,2,3,4,5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStress(v)}
                    className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition-all ${
                      stress === v 
                        ? 'border-orange-500 bg-orange-50 transform scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getRatingEmoji(v, 'stress')}
                  </button>
                ))}
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {['Rilassato', 'Calmo', 'Normale', 'Teso', 'Molto stressato'][stress - 1]}
              </div>
            </div>

            {/* Energia */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-lg font-semibold mb-4">Livello di energia</label>
              <div className="grid grid-cols-5 gap-3">
                {[1,2,3,4,5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setEnergy(v)}
                    className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition-all ${
                      energy === v 
                        ? 'border-green-500 bg-green-50 transform scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getRatingEmoji(v, 'energy')}
                  </button>
                ))}
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {['Esausto', 'Stanco', 'Normale', 'Energico', 'Pieno di energia'][energy - 1]}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Ore di sonno */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-lg font-semibold mb-4">Ore di sonno la scorsa notte</label>
              <div className="space-y-4">
                <input
                  type="number"
                  inputMode="decimal"
                  step={0.5}
                  min={0}
                  max={14}
                  value={sleep_hours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full text-2xl text-center font-bold rounded-xl border-2 border-gray-200 p-4 focus:border-blue-500 focus:outline-none"
                />
                <div className="text-center text-sm text-gray-600">
                  Consigliato: 7-9 ore
                </div>
              </div>
            </div>

            {/* Qualità del sonno */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-lg font-semibold mb-4">Qualità del sonno</label>
              <div className="grid grid-cols-5 gap-3">
                {[1,2,3,4,5].map((v) => (
                  <button
                    key={v}
                    onClick={() => setSleepQuality(v)}
                    className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl transition-all ${
                      sleep_quality === v 
                        ? 'border-purple-500 bg-purple-50 transform scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {getRatingEmoji(v, 'sleep_quality')}
                  </button>
                ))}
              </div>
              <div className="text-center mt-2 text-sm text-gray-600">
                {['Pessima', 'Scarsa', 'Normale', 'Buona', 'Ottima'][sleep_quality - 1]}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Passi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-lg font-semibold mb-4">Passi di oggi</label>
              <div className="space-y-4">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100000}
                  value={steps}
                  onChange={(e) => setSteps(Number(e.target.value))}
                  className="w-full text-2xl text-center font-bold rounded-xl border-2 border-gray-200 p-4 focus:border-green-500 focus:outline-none"
                />
                <div className="text-center text-sm text-gray-600">
                  Obiettivo: 7.000 passi
                </div>
              </div>
            </div>

            {/* Minuti attivi */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-lg font-semibold mb-4">Minuti di attività fisica</label>
              <div className="space-y-4">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={600}
                  value={active_minutes}
                  onChange={(e) => setActiveMinutes(Number(e.target.value))}
                  className="w-full text-2xl text-center font-bold rounded-xl border-2 border-gray-200 p-4 focus:border-green-500 focus:outline-none"
                />
                <div className="text-center text-sm text-gray-600">
                  Include: palestra, corsa, camminata veloce, sport
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            {/* LifeScore Preview */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Il tuo LifeScore di oggi</h2>
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {preview.finalScore}
                </div>
              </div>
              
              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-1">😴</div>
                  <div className="text-sm text-gray-600">Sonno</div>
                  <div className="font-bold text-blue-600">{preview.sleepScore}</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🏃‍♂️</div>
                  <div className="text-sm text-gray-600">Attività</div>
                  <div className="font-bold text-green-600">{preview.activityScore}</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">🧠</div>
                  <div className="text-sm text-gray-600">Mentale</div>
                  <div className="font-bold text-purple-600">{preview.mentalScore}</div>
                </div>
              </div>
            </div>

            {/* Riepilogo */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold mb-4">Riepilogo del tuo check-in</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Umore:</span>
                  <span>{getRatingEmoji(mood, 'mood')} {['Pessimo', 'Così così', 'Normale', 'Bene', 'Fantastico'][mood - 1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stress:</span>
                  <span>{getRatingEmoji(stress, 'stress')} {['Rilassato', 'Calmo', 'Normale', 'Teso', 'Molto stressato'][stress - 1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Energia:</span>
                  <span>{getRatingEmoji(energy, 'energy')} {['Esausto', 'Stanco', 'Normale', 'Energico', 'Pieno di energia'][energy - 1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sonno:</span>
                  <span>{sleep_hours}h • Qualità: {getRatingEmoji(sleep_quality, 'sleep_quality')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attività:</span>
                  <span>{steps.toLocaleString()} passi • {active_minutes}min</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-white pt-6 pb-4">
        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Indietro
            </button>
          )}
          
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 rounded-2xl py-3 font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Continua
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-2xl py-3 font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-60 transition-colors"
            >
              {saving ? 'Salvataggio...' : 'Completa Check-in'}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{errorMsg}</p>
          </div>
        )}
        
        {okMsg && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700">{okMsg}</p>
            <div className="mt-2">
              <Link 
                href="/suggestions" 
                className="text-sm text-green-600 hover:text-green-800 font-medium"
              >
                Vai ai suggerimenti →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
