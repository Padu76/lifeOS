'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Brain, Clock, Star, Play, CheckCircle, ArrowRight, Zap, Heart, Moon } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'stress' | 'energy' | 'sleep' | 'focus';
  duration: number;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
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

const SuggestionCard: React.FC<{
  suggestion: Suggestion;
  delay: number;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
}> = ({ suggestion, delay, onStart, onComplete }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(cardRef);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stress': return <Brain className="w-6 h-6 text-white" />;
      case 'energy': return <Zap className="w-6 h-6 text-white" />;
      case 'sleep': return <Moon className="w-6 h-6 text-white" />;
      case 'focus': return <Heart className="w-6 h-6 text-white" />;
      default: return <Star className="w-6 h-6 text-white" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stress': return 'from-blue-500 to-purple-600';
      case 'energy': return 'from-orange-500 to-red-600';
      case 'sleep': return 'from-indigo-500 to-purple-600';
      case 'focus': return 'from-green-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
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
      {/* Priority indicator */}
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getPriorityColor(suggestion.priority)}`} />
      
      {/* Category icon */}
      <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${getCategoryColor(suggestion.category)} rounded-xl mb-4 group-hover:rotate-12 transition-transform duration-300`}>
        {getCategoryIcon(suggestion.category)}
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
          {suggestion.title}
        </h3>
        <p className="text-white/70 leading-relaxed mb-3">
          {suggestion.description}
        </p>
        
        {/* Duration */}
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Clock className="w-4 h-4" />
          <span>{suggestion.duration} minuti</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!suggestion.completed ? (
          <>
            <button
              onClick={() => onStart(suggestion.id)}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Inizia
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
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      title: 'Respirazione 4-7-8',
      description: 'Una tecnica di respirazione per ridurre lo stress e migliorare la concentrazione. Inspira per 4, trattieni per 7, espira per 8.',
      category: 'stress',
      duration: 5,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Camminata energizzante',
      description: 'Una breve camminata all\'aria aperta per aumentare i livelli di energia e migliorare l\'umore.',
      category: 'energy',
      duration: 15,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Meditazione serale',
      description: 'Una sessione di mindfulness per rilassare la mente e preparare il corpo al riposo notturno.',
      category: 'sleep',
      duration: 10,
      priority: 'high'
    },
    {
      id: '4',
      title: 'Stretching rilassante',
      description: 'Esercizi di allungamento dolci per rilassare i muscoli e ridurre la tensione accumulata.',
      category: 'stress',
      duration: 8,
      priority: 'low'
    },
    {
      id: '5',
      title: 'Tecnica Pomodoro',
      description: 'Sessione di lavoro focalizzato di 25 minuti seguita da una pausa di 5 minuti per migliorare la produttività.',
      category: 'focus',
      duration: 25,
      priority: 'medium'
    },
    {
      id: '6',
      title: 'Idratazione mindful',
      description: 'Bevi lentamente un bicchiere d\'acqua prestando attenzione alle sensazioni e al momento presente.',
      category: 'energy',
      duration: 3,
      priority: 'low'
    }
  ]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window === 'undefined') return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStart = (id: string) => {
    console.log('Starting suggestion:', id);
    // Navigate to tutorial or start session
  };

  const handleComplete = (id: string) => {
    setSuggestions(prev => 
      prev.map(s => s.id === id ? { ...s, completed: true } : s)
    );
  };

  const activeSuggestions = suggestions.filter(s => !s.completed);
  const completedSuggestions = suggestions.filter(s => s.completed);

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
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            <div className="hidden md:flex space-x-8 text-white/80">
              <a href="/" className="hover:text-white transition-colors">Home</a>
              <a href="/suggestions" className="text-white font-semibold">Suggestions</a>
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="/profile" className="hover:text-white transition-colors">Profilo</a>
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition-transform">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              I tuoi consigli
              <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                personalizzati
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              Suggerimenti AI basati sui tuoi dati per migliorare benessere, energia e produttività
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-white mb-2">{activeSuggestions.length}</div>
              <div className="text-white/70">Consigli attivi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{completedSuggestions.length}</div>
              <div className="text-white/70">Completati oggi</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">87</div>
              <div className="text-white/70">LifeScore attuale</div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Suggestions */}
      {activeSuggestions.length > 0 && (
        <section className="relative py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <Star className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">Consigli per oggi</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSuggestions.map((suggestion, index) => (
                <SuggestionCard
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
      )}

      {/* Completed Suggestions */}
      {completedSuggestions.length > 0 && (
        <section className="relative py-12 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Completati</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedSuggestions.map((suggestion, index) => (
                <SuggestionCard
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
      )}

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">
              Hai completato tutto?
            </h2>
            <p className="text-xl text-white/70 mb-8">
              Controlla la tua dashboard per vedere i progressi e ottenere nuovi consigli personalizzati
            </p>
            <a 
              href="/dashboard"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
            >
              Vai alla Dashboard
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuggestionsPage;
