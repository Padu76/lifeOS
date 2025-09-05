'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

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

interface MicroAdviceWidgetProps {
  className?: string;
  maxAdvices?: number;
  autoRefresh?: boolean;
}

export default function MicroAdviceWidget({ 
  className = '', 
  maxAdvices = 3,
  autoRefresh = true 
}: MicroAdviceWidgetProps) {
  const [advices, setAdvices] = useState<MicroAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interacting, setInteracting] = useState<number | null>(null);

  const loadMicroAdvices = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_active_micro_advices');
      
      if (error) throw error;
      
      setAdvices(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading micro advices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAdviceStatus = async (adviceId: number, status: string, rating?: number) => {
    setInteracting(adviceId);
    
    try {
      const { data, error } = await supabase.rpc('update_micro_advice_status', {
        advice_id: adviceId,
        new_status: status,
        rating: rating
      });
      
      if (error) throw error;
      
      // Remove the advice from the list if completed or dismissed
      if (status === 'completed' || status === 'dismissed') {
        setAdvices(prev => prev.filter(a => a.id !== adviceId));
      }
    } catch (err: any) {
      console.error('Error updating advice status:', err);
    } finally {
      setInteracting(null);
    }
  };

  useEffect(() => {
    loadMicroAdvices();
    
    // Auto refresh every 30 minutes if enabled
    if (autoRefresh) {
      const interval = setInterval(loadMicroAdvices, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [loadMicroAdvices, autoRefresh]);

  const getToneStyles = (tone: string) => {
    switch (tone) {
      case 'celebratory':
        return 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-900';
      case 'encouraging':
        return 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 text-green-900';
      case 'gentle':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900';
      case 'supportive':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'celebratory': return '🎉';
      case 'encouraging': return '💪';
      case 'gentle': return '🤗';
      case 'supportive': return '💙';
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

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-red-700 text-sm">
          Errore nel caricamento dei micro-consigli: {error}
        </div>
      </div>
    );
  }

  if (advices.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-3xl mb-2">🌟</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Tutto sotto controllo!</h3>
        <p className="text-sm text-gray-600">
          Non ci sono micro-consigli al momento. L'AI genererà nuovi suggerimenti basati sui tuoi pattern.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">I tuoi micro-consigli</h3>
        <button
          onClick={loadMicroAdvices}
          className="text-sm text-blue-600 hover:text-blue-700"
          disabled={loading}
        >
          Aggiorna
        </button>
      </div>

      <div className="space-y-3">
        {advices.slice(0, maxAdvices).map((advice) => (
          <div
            key={advice.id}
            className={`border rounded-lg p-4 transition-all ${getToneStyles(advice.tone)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{getToneIcon(advice.tone)}</span>
                <div className="flex items-center space-x-2">
                  <div className="text-xs text-gray-600">
                    {formatTimeAgo(advice.generated_at)}
                  </div>
                  {advice.timing_optimal && (
                    <div className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Momento ottimale
                    </div>
                  )}
                  <div className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {advice.duration_minutes} min
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(advice.priority, 5) }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-current rounded-full opacity-60"></div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mb-3">
              <p className="text-sm leading-relaxed">
                {advice.message}
              </p>
            </div>

            {/* Action */}
            <div className="mb-4 p-3 bg-white/50 rounded-lg border border-white/20">
              <p className="text-sm font-medium text-gray-800">
                💡 {advice.action}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={() => updateAdviceStatus(advice.id, 'completed')}
                  disabled={interacting === advice.id}
                  className="px-3 py-1.5 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {interacting === advice.id ? 'Fatto...' : 'Fatto! ✅'}
                </button>
                
                <button
                  onClick={() => updateAdviceStatus(advice.id, 'dismissed')}
                  disabled={interacting === advice.id}
                  className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs font-medium hover:bg-gray-500 transition-colors disabled:opacity-50"
                >
                  Non ora
                </button>
              </div>

              {advice.suggestion_key && (
                <Link
                  href={`/suggestions`}
                  className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors"
                >
                  Tutorial completo
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {advices.length > maxAdvices && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setAdvices(advices.slice(0, advices.length))}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Mostra tutti ({advices.length - maxAdvices} in più)
          </button>
        </div>
      )}
    </div>
  );
}

// Hook per usare micro-consigli in altri componenti
export function useMicroAdvices() {
  const [advices, setAdvices] = useState<MicroAdvice[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_active_micro_advices');
      if (error) throw error;
      setAdvices(data || []);
    } catch (error) {
      console.error('Error loading micro advices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeAdvice = async (id: number, rating?: number) => {
    await supabase.rpc('update_micro_advice_status', {
      advice_id: id,
      new_status: 'completed',
      rating
    });
    
    setAdvices(prev => prev.filter(a => a.id !== id));
  };

  const dismissAdvice = async (id: number) => {
    await supabase.rpc('update_micro_advice_status', {
      advice_id: id,
      new_status: 'dismissed'
    });
    
    setAdvices(prev => prev.filter(a => a.id !== id));
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    advices,
    loading,
    refresh,
    completeAdvice,
    dismissAdvice
  };
}

// Componente per integrare nella dashboard
export function MicroAdviceDashboardWidget() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <MicroAdviceWidget maxAdvices={2} />
    </div>
  );
}
