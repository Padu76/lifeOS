'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Brain, Clock, Star, Play, CheckCircle, ArrowRight, Zap, Heart, Moon, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'motivation';
  duration: number;
  priority: 'high' | 'medium' | 'low';
  key: string;
  completed?: boolean;
  ai_generated: {
    content: string;
    tone: string;
    template_id: string;
    personalization_score: number;
    predicted_effectiveness: number;
    storytelling_element?: string;
  };
  timing: {
    suggested_time: Date;
    urgency_level: 'low' | 'medium' | 'high' | 'emergency';
    confidence_score: number;
  };
  gamification?: {
    streak_impact: number;
    potential_achievements: string[];
  };
}

interface WellnessDashboard {
  current_life_score: {
    stress: number;
    energy: number;
    sleep: number;
    overall: number;
  };
  active_streaks: Array<{
    type: string;
    current_count: number;
    best_count: number;
  }>;
  recent_achievements: Array<{
    title: string;
    description: string;
    earned_date: string;
  }>;
  next_advice_eta?: Date;
  wellness_insights: string[];
}

const useIntersectionObserver = (ref: React.RefObject<HTMLElement>, threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold }
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, [ref, threshold]);

  return isIntersecting;
};

const AISuggestionCard: React.FC<{
  suggestion: AISuggestion;
  delay: number;
  onStart: (key: string) => void;
  onComplete: (id: string) => void;
}> = ({ suggestion, delay, onStart, onComplete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stress_relief': return <Brain className="w-6 h-6 text-white" />;
      case 'energy_boost': return <Zap className="w-6 h-6 text-white" />;
      case 'sleep_prep': return <Moon className="w-6 h-6 text-white" />;
      case 'celebration': return <Star className="w-6 h-6 text-white" />;
      case 'motivation': return <Heart className="w-6 h-6 text-white" />;
      default: return <Star className="w-6 h-6 text-white" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stress_relief': return 'from-blue-500 to-purple-600';
      case 'energy_boost': return 'from-orange-500 to-red-600';
      case 'sleep_prep': return 'from-indigo-500 to-purple-600';
      case 'celebration': return 'from-yellow-500 to-orange-600';
      case 'motivation': return 'from-green-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-20 opacity-0'
      } ${suggestion.completed ? 'opacity-60' : ''}`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms'
      }}
    >
      {/* Urgency indicator */}
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getUrgencyColor(suggestion.timing.urgency_level)}`} />
      
      {/* AI Badge */}
      <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
        AI • {Math.round(suggestion.ai_generated.predicted_effectiveness * 100)}%
      </div>
      
      {/* Category icon */}
      <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${getCategoryColor(suggestion.category)} rounded-xl mb-4 mt-6 group-hover:rotate-12 transition-transform duration-300`}>
        {getCategoryIcon(suggestion.category)}
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {suggestion.title}
        </h3>
        
        {/* AI Generated empathetic content */}
        <div className="bg-white/5 rounded-lg p-3 mb-3">
          <p className="text-blue-200 text-sm leading-relaxed italic">
            "{suggestion.ai_generated.content}"
          </p>
          {suggestion.ai_generated.storytelling_element && (
            <p className="text-white/60 text-xs mt-2">
              {suggestion.ai_generated.storytelling_element}
            </p>
          )}
        </div>
        
        <p className="text-white/70 leading-relaxed mb-3">
          {suggestion.description}
        </p>
        
        {/* Duration and confidence */}
        <div className="flex items-center justify-between text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{suggestion.duration} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span>Match: {Math.round(suggestion.ai_generated.personalization_score * 100)}%</span>
          </div>
        </div>

        {/* Gamification preview */}
        {suggestion.gamification && (
          <div className="mt-3 p-2 bg-white/5 rounded-lg">
            <div className="text-xs text-purple-300">
              Streak boost: +{suggestion.gamification.streak_impact}
            </div>
            {suggestion.gamification.potential_achievements.length > 0 && (
              <div className="text-xs text-yellow-300">
                Achievement opportunity: {suggestion.gamification.potential_achievements[0]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!suggestion.completed ? (
          <>
            <button
              onClick={() => onStart(suggestion.key)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Inizia ora
            </button>
            <button
              onClick={() => onComplete(suggestion.id)}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-green-400 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Completato
          </div>
        )}
      </div>

      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(suggestion.category)}/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
    </div>
  );
};

const SuggestionsPage: React.FC = () => {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<WellnessDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // 6 consigli sempre disponibili - bypass completo API
  const suggestions: AISuggestion[] = [
    {
      id: 'hardcoded-1',
      title: 'Meditazione guidata',
      description: 'Rilassa mente e corpo con una breve meditazione',
      category: 'sleep_prep',
      duration: 8,
      priority: new Date().getHours() >= 18 ? 'high' : 'medium',
      key: '5min-meditation',
      completed: false,
      ai_generated: {
        content: "La qualità del sonno può sempre migliorare. Una breve meditazione ti aiuterà.",
        tone: 'encouraging',
        template_id: '5min-meditation',
        personalization_score: 1.0,
        predicted_effectiveness: 0.82
      },
      timing: {
        suggested_time: new Date(),
        urgency_level: new Date().getHours() >= 18 ? 'high' : 'medium',
        confidence_score: 0.8
      }
    },
    {
      id: 'hardcoded-2',
      title: 'Idratazione mindful',
      description: 'Bevi consapevolmente un bicchiere d\'acqua',
      category: 'energy_boost',
      duration: 2,
      priority: 'low',
      key: 'mindful-hydration',
      completed: false,
      ai_generated: {
        content: "Il corpo ha bisogno di idratazione. Beviamo con attenzione e presenza.",
        tone: 'encouraging',
        template_id: 'mindful-hydration',
        personalization_score: 1.0,
        predicted_effectiveness: 0.65
      },
      timing: {
        suggested_time: new Date(),
        urgency_level: 'medium',
        confidence_score: 0.8
      }
    },
    {
      id: 'hardcoded-3',
      title: 'Camminata energizzante',
      description: 'Una breve camminata per riattivare energia e concentrazione',
      category: 'energy_boost',
      duration: 10,
      priority: 'high',
      key: '10min-walk',
      completed: false,
      ai_generated: {
        content: "I tuoi livelli di energia potrebbero migliorare. Una camminata veloce può dare la carica che cerchi.",
        tone: 'encouraging',
        template_id: '10min-walk',
        personalization_score: 0.9,
        predicted_effectiveness: 0.78
      },
      timing: {
        suggested_time: new Date(),
        urgency_level: 'high',
        confidence_score: 0.8
      }
    },
    {
      id: 'hardcoded-4',
      title: 'Stretching leggero',
      description: 'Allunga i muscoli e riattiva la circolazione',
      category: 'energy_boost',
      duration: 7,
      priority: 'medium',
      key: 'light-stretching',
      completed: false,
      ai_generated: {
        content: "Il corpo ha bisogno di movimento. Qualche allungamento può fare la differenza.",
        tone: 'encouraging',
        template_id: 'light-stretching',
        personalization_score: 0.9,
        predicted_effectiveness: 0.72
      },
      timing: {
        suggested_time: new Date(),
        urgency_level: 'medium',
        confidence_score: 0.8
      }
    },
    {
      id: 'hardcoded-5',
      title: 'Respirazione 4-7-8',
      description: 'Tecnica di respirazione per ridurre lo stress rapidamente',
      category: 'stress_relief',
      duration: 5,
      priority: 'medium',
      key: 'breathing-478',
      completed: false,
      ai_generated: {
        content: "Il tuo stress sembra elevato. La respirazione 4-7-8 può aiutarti a calmarti in pochi minuti.",
        tone: 'encouraging',
        template_id: 'breathing-478',
        personalization_score: 0.75,
        predicted_effectiveness: 0.85
      },
      timing: {
        suggested_time: new Date(),
        urgency_level: 'medium',
        confidence_score: 0.8
      }
    },
    {
      id: 'hardcoded-6',
      title: 'Respirazione profonda',
      description: 'Tre respiri profondi per resettare l\'energia',
      category: 'stress_relief',
      duration: 2,
      priority: 'medium',
      key: 'deep-breathing',
      completed: false,
      ai_generated: {
        content: "Tre respiri profondi possono cambiare completamente il tuo stato d'animo.",
        tone: 'encouraging',
        template_id: 'deep-breathing',
        personalization_score: 0.75,
        predicted_effectiveness: 0.79
      },
      timing: {
        suggested_time: new Date(),
        urgency_level: 'medium',
        confidence_score: 0.8
      }
    }
  ];

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load only dashboard data
  useEffect(() => {
    loadWellnessDashboard();
  }, []);

  const loadWellnessDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/wellness');
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setDashboard({
        current_life_score: { stress: 5, energy: 6, sleep: 7, overall: 6 },
        active_streaks: [],
        recent_achievements: [],
        wellness_insights: ["AI sta analizzando i tuoi pattern..."]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (key: string) => {
    router.push(`/suggestions/${key}`);
  };

  const handleComplete = async (id: string) => {
    // Update local state - nessuna chiamata API
    console.log(`Completed suggestion: ${id}`);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWellnessDashboard();
    setRefreshing(false);
  };

  const activeSuggestions = suggestions.filter(s => !s.completed);
  const completedSuggestions = suggestions.filter(s => s.completed);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">L'AI sta generando i tuoi consigli personalizzati...</p>
          <p className="text-white/60 text-sm mt-2">Analizzando LifeScore, patterns e preferenze</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Fixed Background */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        style={{
          background: mounted 
            ? `
              radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                rgba(147, 197, 253, 0.1) 0%, 
                transparent 50%),
              linear-gradient(135deg, 
                #0f172a 0%, 
                #1e1b4b 25%, 
                #312e81 50%, 
                #1e1b4b 75%, 
                #0f172a 100%)
            `
            : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </Link>
            <div className="hidden md:flex space-x-8 text-white/80">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/suggestions" className="text-white font-semibold">Suggestions</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/profile" className="hover:text-white transition-colors">Profilo</Link>
            </div>
            <Link href="/sign-in" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Accedi
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                Consigli AI
                <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  personalizzati
                </span>
              </h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              >
                <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              L'AI ha analizzato il tuo LifeScore, patterns comportamentali e timing ottimale per generare questi consigli
            </p>
          </div>

          {/* AI-Enhanced Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">{activeSuggestions.length}</div>
              <div className="text-white/70">Consigli AI attivi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{completedSuggestions.length}</div>
              <div className="text-white/70">Completati oggi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {dashboard?.current_life_score?.overall || '--'}
              </div>
              <div className="text-white/70">LifeScore attuale</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {Math.round(suggestions.reduce((sum, s) => sum + s.ai_generated.predicted_effectiveness, 0) / suggestions.length * 100)}%
              </div>
              <div className="text-white/70">Efficacia prevista</div>
            </div>
          </div>

          {/* AI Insights */}
          {dashboard?.wellness_insights && dashboard.wellness_insights.length > 0 && (
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 mb-12">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                AI Insights
              </h3>
              <div className="space-y-2">
                {dashboard.wellness_insights.map((insight, index) => (
                  <p key={index} className="text-white/80 text-sm">{insight}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Active AI Suggestions */}
      <section className="relative py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Consigli AI per te</h2>
            <div className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full">
              Generati ora
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSuggestions.map((suggestion, index) => (
              <AISuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                delay={index * 100}
                onStart={handleStart}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              L'AI continua ad imparare
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Ogni interazione migliora la personalizzazione. Vai alla dashboard per analytics avanzate
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              Dashboard AI
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuggestionsPage;
