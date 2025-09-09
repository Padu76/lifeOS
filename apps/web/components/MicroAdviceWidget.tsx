'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, Clock, Target, RefreshCw } from 'lucide-react';

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

// Mock data per dimostrare il funzionamento
const mockAdvices: MicroAdvice[] = [
  {
    id: 1,
    message: "I tuoi livelli di energia sembrano bassi oggi. Una breve sessione di respirazione può aiutarti a ricentrarti e ritrovare focus.",
    action: "Prova la respirazione 4-7-8 per 5 minuti",
    duration_minutes: 5,
    priority: 4,
    tone: 'supportive',
    timing_optimal: true,
    suggestion_key: 'breathing-exercise',
    generated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    message: "Hai completato il check-in per 3 giorni consecutivi! Questo è il momento perfetto per una camminata energizzante.",
    action: "Fai una camminata di 10 minuti all'aria aperta",
    duration_minutes: 10,
    priority: 3,
    tone: 'celebratory',
    timing_optimal: true,
    suggestion_key: '10min-walk',
    generated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    message: "Il tuo stress level è aumentato negli ultimi giorni. Una sessione di meditazione guidata potrebbe essere molto benefica.",
    action: "Inizia una meditazione di 5 minuti",
    duration_minutes: 5,
    priority: 5,
    tone: 'gentle',
    timing_optimal: false,
    suggestion_key: 'guided-meditation',
    generated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
  }
];

export default function MicroAdviceWidget({
  className = '',
  maxAdvices = 2,
  autoRefresh = true
}: MicroAdviceWidgetProps) {
  const [advices, setAdvices] = useState<MicroAdvice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interacting, setInteracting] = useState<number | null>(null);

  const loadMicroAdvices = useCallback(async () => {
    setLoading(true);
    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 800));
      setAdvices(mockAdvices.slice(0, maxAdvices));
      setError(null);
    } catch (err: any) {
      console.error('Error loading micro advices:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [maxAdvices]);

  const updateAdviceStatus = async (adviceId: number, status: string) => {
    setInteracting(adviceId);

    try {
      // Simula chiamata API
      await new Promise(resolve => setTimeout(resolve, 500));

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

  const handleSuggestionClick = (suggestionKey: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/suggestions/${suggestionKey}`;
    }
  };

  useEffect(() => {
    loadMicroAdvices();

    // Auto refresh ogni 30 minuti se abilitato
    if (autoRefresh) {
      const interval = setInterval(loadMicroAdvices, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [loadMicroAdvices, autoRefresh]);

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

  if (error) {
    return (
      <div className={`p-4 bg-red-500/10 border border-red-400/20 rounded-lg ${className}`}>
        <div className="text-red-300 text-sm">
          Errore nel caricamento dei micro-consigli: {error}
        </div>
      </div>
    );
  }

  if (advices.length === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <div className="text-3xl mb-2">🌟</div>
        <h3 className="text-lg font-medium text-white mb-1">Tutto sotto controllo!</h3>
        <p className="text-sm text-white/60">
          Non ci sono micro-consigli al momento. L'AI genererà nuovi suggerimenti basati sui tuoi pattern.
        </p>
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

      {mockAdvices.length > maxAdvices && (
        <div className="mt-6 text-center">
          <button
            className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
            onClick={() => window.location.href = '/suggestions'}
          >
            Vedi tutti i consigli ({mockAdvices.length - maxAdvices} in più) →
          </button>
        </div>
      )}

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
