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

export default function MicroAdviceWidget2({
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

  // SUPER DEBUG - Massimo dettaglio
  console.log('🔥 WIDGET2 DEBUG START 🔥');
  console.log('🔍 Received props:', {
    className,
    maxAdvices,
    autoRefresh,
    dashboardData_exists: !!dashboardData,
    dashboardData_full: dashboardData
  });
  console.log('🔍 User state:', user ? `ID: ${user.id}` : 'NULL');
  console.log('🔍 Component state:', { 
    advices_count: advices.length, 
    loading, 
    error,
    interacting 
  });

  // Carica utente corrente
  useEffect(() => {
    const loadUser = async () => {
      console.log('🚀 Loading user...');
      try {
        const currentUser = await getCurrentUser();
        console.log('✅ User loaded:', currentUser ? `${currentUser.id} (${currentUser.email})` : 'NULL');
        setUser(currentUser);
        if (!currentUser) {
          console.log('❌ No user - setting error');
          setError('Utente non autenticato');
          setLoading(false);
        }
      } catch (err) {
        console.error('💥 User loading error:', err);
        setError('Errore caricamento utente');
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const loadMicroAdvices = useCallback(async () => {
    console.log('🎯 === LOAD MICRO ADVICES START ===');
    
    if (!user) {
      console.log('❌ No user - skipping API call');
      return;
    }
    
    console.log('✅ User check passed');
    console.log('🔍 Dashboard data check:', {
      has_dashboardData: !!dashboardData,
      dashboardData_details: dashboardData
    });
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Preparing API parameters...');
      
      // Prepara i parametri per la Edge Function
      const currentLifeScore = dashboardData?.current_life_score || {
        stress: 5,
        energy: 5,
        sleep: 5,
        overall: 5
      };

      console.log('📊 Current life score:', currentLifeScore);

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

      console.log('📤 Sending to API:', JSON.stringify(apiPayload, null, 2));
      
      // Chiamata alla Edge Function
      console.log('🌐 Calling Edge Function...');
      const data = await callEdgeFunction('generate-micro-advice', apiPayload);

      console.log('📥 Raw API Response:', data);
      console.log('📥 Response type:', typeof data);
      console.log('📥 Response keys:', data ? Object.keys(data) : 'No keys');
      
      if (data && data.success && data.data) {
        console.log('✅ API Success - processing advice');
        const advice = data.data;
        console.log('🎯 Advice data:', advice);
        
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
        
        console.log('✨ Formatted advice:', formattedAdvice);
        setAdvices([formattedAdvice]);
        
      } else {
        console.log('⚠️ API returned but no data');
        console.log('🔍 Response analysis:', {
          has_data: !!data,
          has_success: data?.success,
          has_data_property: data?.data,
          full_response: data
        });
        setAdvices([]);
      }
      
    } catch (err: any) {
      console.error('💥 API Error:', err);
      console.error('💥 Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'Errore nel caricamento dei consigli');
      setAdvices([]);
    } finally {
      setLoading(false);
      console.log('🏁 Load micro advices complete');
    }
  }, [maxAdvices, user, dashboardData]);

  // Mappa il tone dall'API al formato del widget
  const mapToneFromAPI = (apiTone: string): MicroAdvice['tone'] => {
    console.log('🎨 Mapping tone:', apiTone);
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

  useEffect(() => {
    console.log('⚡ useEffect triggered');
    console.log('🔍 Conditions check:', { 
      has_user: !!user, 
      has_dashboardData: !!dashboardData,
      will_call_api: !!(user && dashboardData)
    });
    
    if (user && dashboardData) {
      console.log('✅ All conditions met - calling API');
      loadMicroAdvices();

      if (autoRefresh) {
        console.log('🔄 Setting up auto-refresh (30min)');
        const interval = setInterval(loadMicroAdvices, 30 * 60 * 1000);
        return () => {
          console.log('🛑 Clearing auto-refresh interval');
          clearInterval(interval);
        };
      }
    } else {
      console.log('❌ Conditions not met - no API call');
      console.log('🔍 Missing:', {
        user: user ? '✅' : '❌',
        dashboardData: dashboardData ? '✅' : '❌'
      });
    }
  }, [loadMicroAdvices, autoRefresh, user, dashboardData]);

  const updateAdviceStatus = async (adviceId: number, status: string) => {
    console.log(`🎯 Updating advice ${adviceId} to ${status}`);
    if (!user) {
      console.log('❌ No user for advice update');
      return;
    }
    
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
      console.error('💥 Advice update error:', err);
    } finally {
      setInteracting(null);
    }
  };

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

  console.log('🔥 WIDGET2 DEBUG END 🔥');

  if (!user && !loading) {
    console.log('🚫 Rendering: No user, not loading');
    return (
      <div className={`p-6 bg-yellow-500/10 border border-yellow-400/20 rounded-lg text-center ${className}`}>
        <div className="text-yellow-300 text-lg font-medium mb-2">DEBUG: Accesso richiesto</div>
        <div className="text-yellow-200/80 text-sm mb-4">
          Effettua il login per ricevere consigli AI personalizzati
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('⏳ Rendering: Loading state');
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-white/20 rounded"></div>
          <div className="h-6 bg-white/20 rounded w-64">
            <div className="text-xs text-white p-1">DEBUG: Caricamento...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && advices.length === 0) {
    console.log('❌ Rendering: Error state');
    return (
      <div className={`p-4 bg-red-500/10 border border-red-400/20 rounded-lg ${className}`}>
        <div className="text-red-300 text-sm mb-3">
          DEBUG - Errore: {error}
        </div>
        <button
          onClick={loadMicroAdvices}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Riprova Debug
        </button>
      </div>
    );
  }

  console.log('✨ Rendering: Main widget');
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">🔥 WIDGET2 DEBUG - Consigli AI 🔥</h3>
          {!dashboardData && (
            <div className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
              DEBUG: Dati mancanti
            </div>
          )}
          {dashboardData && (
            <div className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
              DEBUG: Dati OK ({dashboardData.current_life_score.stress}/{dashboardData.current_life_score.energy}/{dashboardData.current_life_score.sleep})
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

      {advices.length === 0 && !loading && (
        <div className="p-6 text-center">
          <div className="text-3xl mb-2">🌟</div>
          <h3 className="text-lg font-medium text-white mb-1">DEBUG: Nessun consiglio</h3>
          <p className="text-sm text-white/60 mb-4">
            Il widget è caricato ma non ci sono consigli. Controlla la console per i dettagli.
          </p>
          <button
            onClick={loadMicroAdvices}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Debug Refresh
          </button>
        </div>
      )}

      <div className="space-y-4">
        {advices.slice(0, maxAdvices).map((advice, index) => (
          <div
            key={advice.id}
            className={`border rounded-2xl p-6 transition-all backdrop-blur-lg ${getToneStyles(advice.tone)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getToneIcon(advice.tone)}</span>
                <div className="text-sm text-white/80">
                  DEBUG: Advice #{advice.id}
                </div>
              </div>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}