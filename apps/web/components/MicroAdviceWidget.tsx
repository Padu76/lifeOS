'use client';
import React, { useState, useEffect, useCallback } from 'react';
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

  // DEBUG: Controlla cosa riceve il widget
  console.log('🔍 Widget debug:', { 
    user: user ? user.id : 'null', 
    dashboardData: dashboardData ? 'received' : 'null',
    dashboardData_details: dashboardData 
  });

  // Carica utente corrente
  useEffect(() => {
    const loadUser = async () => {
      console.log('🔍 Loading user...');
      const currentUser = await getCurrentUser();
      console.log('🔍 User loaded:', currentUser ? currentUser.id : 'null');
      setUser(currentUser);
      if (!currentUser) {
        setError('Utente non autenticato');
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const loadMicroAdvices = useCallback(async () => {
    if (!user) {
      console.log('🔍 No user - skipping API call');
      return;
    }
    
    console.log('🔍 Starting API call - user and dashboardData check:', {
      hasUser: !!user,
      hasDashboardData: !!dashboardData
    });
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Calling generate-micro-advice Edge Function with dashboard data...');
      
      // Prepara i parametri corretti per la Edge Function
      const currentLifeScore = dashboardData?.current_life_score || {
        stress: 5,
        energy: 5,
        sleep: 5,
        overall: 5
      };

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

      console.log('🔍 Sending parameters:', {
        current_metrics: currentMetrics,
        current_life_score: currentLifeScore,
        force_immediate: false,
        preferred_category: null
      });
      
      // Chiamata alla Edge Function con parametri corretti
      const data = await callEdgeFunction('generate-micro-advice', {
        current_metrics: currentMetrics,
        current_life_score: currentLifeScore,
        force_immediate: false,
        preferred_category: null
      });

      console.log('🔍 Edge Function response:', data);
      
      if (data && data.success && data.data) {
        // Converte la risposta della Edge Function nel formato atteso dal widget
        const advice = data.data;
        const formattedAdvice: MicroAdvice = {
          id: Math.random(),
          message: advice.advice.content,
          action: advice.advice.content,
          duration_minutes: 5, // Default
          priority: Math.floor(advice.advice.personalization_score * 5),
          tone: mapToneFromAPI(advice.advice.tone),
          timing_optimal: advice.timing.confidence_score > 0.7,
          suggestion_key: advice.advice.template_id,
          generated_at: new Date().toISOString(),
          expires_at: advice.next_advice_eta || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        };
        
        console.log('🔍 Formatted advice:', formattedAdvice);
        setAdvices([formattedAdvice]);
      } else {
        console.log('🔍 No advice generated or API returned empty response');
        setAdvices([]);
      }
      
    } catch (err: any) {
      console.error('🔍 Error loading micro advices:', err);
      setError(err.message || 'Errore nel caricamento dei consigli');
      setAdvices([]);
    } finally {
      setLoading(false);
    }
  }, [maxAdvices, user, dashboardData]);

  // Mappa il tone dall'API al formato del widget
  const mapToneFromAPI = (apiTone: string): MicroAdvice['tone'] => {
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
  };

  const updateAdviceStatus = async (adviceId: number, status: string) => {
    if (!user) return;
    
    setInteracting(adviceId);

    try {
      console.log(`Updating advice ${adviceId} status to: ${status}`);
      
      // Chiamata alla Edge Function per gestire la risposta
      await callEdgeFunction('handle-advice-response', {
        user_id: user.id,
        advice_id: adviceId.toString(),
        response_type: status,
        timestamp: new Date().toISOString()
      });

      // Rimuovi il consiglio dalla lista se completato o respinto
      if (status === 'completed' || status === 'dismissed') {
        setAdvices(prev => prev.filter(a => a.id !== adviceId));
      }
      
    } catch (err: any) {
      console.error('Error updating advice status:', err);
      // Non mostrare errore all'utente per questa operazione
    } finally {
      setInteracting(null);
    }
  };

  const handleSuggestionClick = (suggestionKey: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/suggestions/${suggestionKey}`;
    }
  };

  useEffect(() => {
    console.log('🔍 useEffect triggered:', { 
      hasUser: !!user, 
      hasDashboardData: !!dashboardData,
      willCallAPI: !!(user && dashboardData)
    });
    
    if (user && dashboardData) {
      console.log('🔍 Conditions met - calling loadMicroAdvices');
      loadMicroAdvices();

      // Auto refresh ogni 30 minuti se abilitato
      if (autoRefresh) {
        const interval = setInterval(loadMicroAdvices, 30 * 60 * 1000);
        return () => clearInterval(interval);
      }
    } else {
      console.log('🔍 Conditions not met:', {
        user: user ? 'present' : 'missing',
        dashboardData: dashboardData ? 'present' : 'missing'
      });
    }
  }, [user?.id, dashboardData?.current_life_score?.overall, dashboardData?.current_life_score?.last_updated]);

  const getToneStyles = (tone: string) => {
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
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'celebratory': return '🎉';
      case 'encouraging': return '💪';
      case 'gentle': return '🤗';
      case 'supportive': return '🤝';
      default: return '💡';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const generated = new Date(dateString);
    const diffMs = now.getTime() - generated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h fa`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m fa`;
    } else {
      return 'Ora';
    }
  };

  if (!user && !loading) {
    return (
      <div className={`p-6 bg-yellow-500/10 border border-yellow-400/20 rounded-lg text-center ${className}`}>
        <div className="text-yellow-300 text-lg font-medium mb-2">Accesso richiesto</div>
        <div className="text-yellow-200/80 text-sm mb-4">
          Effettua il login per ricevere consigli AI personalizzati
        </div>
        <button
          onClick={() => window.location.href = '/sign-in'}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-transform"
        >
          Accedi
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-white/20 rounded"></div>
          <div className="h-6 bg-white/20 rounded w-48"></div>
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-white/10 rounded-lg border border-white/20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error && advices.length === 0) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-400/20 rounded-lg ${className}`}>
        <div className="text-red-300 text-sm mb-3">
          Errore nel caricamento dei micro-consigli: {error}
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

  if (advices.length === 0 && !loading) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-3xl mb-2">🌟</div>
        <h3 className="text-lg font-medium text-white mb-1">Tutto sotto controllo!</h3>
        <p className="text-sm text-white/60 mb-4">
          Non ci sono micro-consigli al momento. L'AI genererà nuovi suggerimenti basati sui tuoi pattern.
        </p>
        <button
          onClick={loadMicroAdvices}
          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Aggiorna
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Consigli AI Personalizzati - DEBUG VERSION</h3>
          {!dashboardData && (
            <div className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
              Dati mancanti
            </div>
          )}
        </div>
        <button
          onClick={loadMicroAdvices}
          className="p-2 text-white/60 hover:text-white transition-colors"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {advices.slice(0, maxAdvices).map((advice, index) => (
          <div
            key={advice.id}
            className={`border rounded-2xl p-6 transition-all backdrop-blur-lg ${getToneStyles(advice.tone)} hover:scale-[1.02] transform duration-300`}
            style={{ 
              animationDelay: `${index * 150}ms`,
              animation: 'slideInUp 0.6s ease-out forwards'
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getToneIcon(advice.tone)}</span>
                <div className="flex items-center space-x-3">
                  <div className="text-xs text-white/60">
                    {formatTimeAgo(advice.generated_at)}
                  </div>
                  {advice.timing_optimal && (
                    <div className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-400/30">
                      ⚡ Momento ottimale
                    </div>
                  )}
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs border border-white/20">
                    <Clock className="w-3 h-3" />
                    {advice.duration_minutes} min
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(advice.priority, 5) }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-sm leading-relaxed text-white/90">
                {advice.message}
              </p>
            </div>

            {/* Action */}
            <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-white/80" />
                <p className="text-sm font-medium text-white">
                  {advice.action}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={() => updateAdviceStatus(advice.id, 'completed')}
                  disabled={interacting === advice.id}
                  className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-green-400/30"
                >
                  {interacting === advice.id ? 'Fatto...' : 'Completato ✓'}
                </button>

                <button
                  onClick={() => updateAdviceStatus(advice.id, 'dismissed')}
                  disabled={interacting === advice.id}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-white/20"
                >
                  Non ora
                </button>
              </div>

              {advice.suggestion_key && (
                <button
                  onClick={() => handleSuggestionClick(advice.suggestion_key!)}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors border border-blue-400/30"
                >
                  Inizia →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}