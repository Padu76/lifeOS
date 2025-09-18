'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Lightbulb, Clock, Target, RefreshCw } from 'lucide-react';
import { supabase, callEdgeFunction, getCurrentUser } from '../lib/supabase';

interface MicroAdvice {
  id: number;
  message: string;
  action: string;
  duration_minutes: number;
  priority: number;
  tone: 'encouraging' | 'gentle' | 'celebratory' | 'supportive';
  timing_optimal: boolean;
  suggestion_key?: string;
  generated_at: string;
  expires_at: string;
}

interface DashboardData {
  current_life_score: {
    stress: number;
    energy: number;
    sleep: number;
    overall: number;
    last_updated: string;
  };
  metrics?: Array<{
    label: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }>;
}

interface MicroAdviceWidgetProps {
  className?: string;
  maxAdvices?: number;
  autoRefresh?: boolean;
  dashboardData?: DashboardData;
}

export default function MicroAdviceWidget({
  className = '',
  maxAdvices = 2,
  autoRefresh = true,
  dashboardData
}: MicroAdviceWidgetProps) {
  const [advices, setAdvices] = useState<MicroAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interacting, setInteracting] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);

  // Carica utente corrente solo una volta
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (!currentUser) {
          setError('Utente non autenticato');
          setLoading(false);
        } else {
          setInitialized(true);
        }
      } catch (err) {
        setError('Errore caricamento utente');
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Mappa il tone dall'API al formato del widget - memoizzato
  const mapToneFromAPI = useCallback((apiTone: string): MicroAdvice['tone'] => {
    switch (apiTone) {
      case 'warm':
      case 'supportive':
        return 'supportive';
      case 'encouraging':
        return 'encouraging';
      case 'gentle':
        return 'gentle';
      case 'celebratory':
        return 'celebratory';
      default:
        return 'gentle';
    }
  }, []);

  // Funzione loadMicroAdvices stabile con useCallback
  const loadMicroAdvices = useCallback(async () => {
    if (!user || !dashboardData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepara i parametri per la Edge Function
      const currentLifeScore = dashboardData.current_life_score;

      const currentMetrics = {
        timestamp: new Date().toISOString(),
        stress_level: currentLifeScore.stress,
        energy_level: currentLifeScore.energy,
        sleep_quality: currentLifeScore.sleep,
        mood: currentLifeScore.overall >= 7 ? 'positive' : 
              currentLifeScore.overall >= 4 ? 'neutral' : 'low',
        context: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          time_of_day: new Date().getHours()
        }
      };

      const apiPayload = {
        current_metrics: currentMetrics,
        current_life_score: currentLifeScore,
        force_immediate: false,
        preferred_category: null
      };

      // Chiamata alla Edge Function
      const data = await callEdgeFunction('generate-micro-advice', apiPayload);
      
      if (data && data.success && data.data) {
        const advice = data.data;
        
        const formattedAdvice: MicroAdvice = {
          id: Math.random(),
          message: advice.advice?.content || 'Consiglio generato',
          action: advice.advice?.content || 'Azione consigliata',
          duration_minutes: 5,
          priority: Math.floor((advice.advice?.personalization_score || 0.5) * 5),
          tone: mapToneFromAPI(advice.advice?.tone || 'gentle'),
          timing_optimal: (advice.timing?.confidence_score || 0) > 0.7,
          suggestion_key: advice.advice?.template_id,
          generated_at: new Date().toISOString(),
          expires_at: advice.next_advice_eta || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        };
        
        setAdvices([formattedAdvice]);
      } else {
        setAdvices([]);
      }
      
    } catch (err: any) {
      setError(err.message || 'Errore nel caricamento dei consigli');
      setAdvices([]);
    } finally {
      setLoading(false);
    }
  }, [user, dashboardData, mapToneFromAPI]);

  // Effect per caricare i consigli quando tutto è pronto
  useEffect(() => {
    if (initialized && user && dashboardData) {
      loadMicroAdvices();
    }
  }, [initialized, dashboardData]); // Dipendenze ridotte per evitare loop

  // Auto-refresh separato per evitare interferenze
  useEffect(() => {
    if (!autoRefresh || !initialized || !user || !dashboardData) return;
    
    const interval = setInterval(() => {
      loadMicroAdvices();
    }, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, initialized, user, dashboardData, loadMicroAdvices]);

  // Update advice status
  const updateAdviceStatus = useCallback(async (adviceId: number, status: string) => {
    if (!user) return;
    
    setInteracting(adviceId);

    try {
      await callEdgeFunction('handle-advice-response', {
        user_id: user.id,
        advice_id: adviceId.toString(),
        response_type: status,
        timestamp: new Date().toISOString()
      });

      if (status === 'completed' || status === 'dismissed') {
        setAdvices(prev => prev.filter(a => a.id !== adviceId));
      }
      
    } catch (err: any) {
      // Gestione errore silenziosa
    } finally {
      setInteracting(null);
    }
  }, [user]);

  // Stili memoizzati
  const getToneStyles = useMemo(() => (tone: string) => {
    switch (tone) {
      case 'celebratory':
        return 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/30 text-purple-100';
      case 'encouraging':
        return 'bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-400/30 text-green-100';
      case 'gentle':
        return 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-400/30 text-blue-100';
      case 'supportive':
        return 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-400/30 text-amber-100';
      default:
        return 'bg-white/10 border-white/20 text-white';
    }
  }, []);

  const getToneIcon = useMemo(() => (tone: string) => {
    switch (tone) {
      case 'celebratory': return '🎉';
      case 'encouraging': return '💪';
      case 'gentle': return '🤗';
      case 'supportive': return '🤝';
      default: return '💡';
    }
  }, []);

  // Stati di rendering
  if (!user && !loading) {
    return (
      <div className={`p-6 bg-yellow-500/10 border border-yellow-400/20 rounded-lg text-center ${className}`}>
        <div className="text-yellow-300 text-lg font-medium mb-2">Accesso richiesto</div>
        <div className="text-yellow-200/80 text-sm mb-4">
          Effettua il login per ricevere consigli AI personalizzati
        </div>
      </div>
    );
  }

  if (loading && advices.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-6 h-6 text-blue-400 animate-pulse" />
          <h3 className="text-xl font-bold text-white">Consigli AI Personalizzati</h3>
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse">
              <div className="border border-white/10 rounded-2xl p-6 bg-white/5">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-5/6"></div>
                <div className="flex gap-3 mt-4">
                  <div className="h-9 bg-white/10 rounded-lg w-24"></div>
                  <div className="h-9 bg-white/10 rounded-lg w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && advices.length === 0) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-400/20 rounded-lg ${className}`}>
        <div className="text-red-300 text-sm mb-3">
          Impossibile caricare i consigli
        </div>
        <button
          onClick={loadMicroAdvices}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Consigli AI Personalizzati</h3>
        </div>
        <button
          onClick={loadMicroAdvices}
          className="p-2 text-white/60 hover:text-white transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {advices.length === 0 && !loading && (
        <div className="p-6 text-center">
          <div className="text-3xl mb-2">🌟</div>
          <h3 className="text-lg font-medium text-white mb-1">Tutto tranquillo</h3>
          <p className="text-sm text-white/60 mb-4">
            Al momento non ci sono consigli. Continua così!
          </p>
          <button
            onClick={loadMicroAdvices}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Aggiorna
          </button>
        </div>
      )}

      <div className="space-y-4">
        {advices.slice(0, maxAdvices).map((advice) => (
          <div
            key={advice.id}
            className={`border rounded-2xl p-6 transition-all backdrop-blur-lg ${getToneStyles(advice.tone)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getToneIcon(advice.tone)}</span>
                {advice.timing_optimal && (
                  <span className="flex items-center gap-1 text-xs text-white/60">
                    <Clock className="w-3 h-3" />
                    Momento ottimale
                  </span>
                )}
              </div>
              {advice.priority > 3 && (
                <Target className="w-4 h-4 text-white/40" />
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm leading-relaxed text-white/90">
                {advice.message}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => updateAdviceStatus(advice.id, 'completed')}
                  disabled={interacting === advice.id}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-green-400/30"
                >
                  {interacting === advice.id ? '...' : 'Fatto'}
                </button>

                <button
                  onClick={() => updateAdviceStatus(advice.id, 'dismissed')}
                  disabled={interacting === advice.id}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-white/20"
                >
                  Non ora
                </button>
              </div>

              {advice.duration_minutes && (
                <span className="text-xs text-white/50">
                  ~{advice.duration_minutes} min
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}