'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Droplets, Brain, Wind, Activity, Moon, Zap, Play, ChevronRight } from 'lucide-react';

interface Suggestion {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  category: 'relax' | 'energy' | 'focus' | 'sleep';
  duration: string;
  difficulty: 'easy' | 'medium' | 'advanced';
}

const suggestions: Suggestion[] = [
  {
    key: 'take-break',
    title: 'Prenditi una pausa',
    description: 'Momento di relax per ricaricare le energie',
    icon: Clock,
    gradient: 'from-blue-400 to-indigo-600',
    category: 'relax',
    duration: '5 min',
    difficulty: 'easy'
  },
  {
    key: 'drink-water',
    title: 'Bevi acqua',
    description: 'Mantieni il corpo idratato per il benessere',
    icon: Droplets,
    gradient: 'from-cyan-400 to-blue-600',
    category: 'relax',
    duration: '2 min',
    difficulty: 'easy'
  },
  {
    key: 'guided-meditation',
    title: 'Meditazione guidata',
    description: 'Sessione di mindfulness personalizzata',
    icon: Brain,
    gradient: 'from-purple-400 to-pink-600',
    category: 'focus',
    duration: '5-15 min',
    difficulty: 'medium'
  },
  {
    key: 'deep-breathing',
    title: 'Respirazione profonda',
    description: 'Tecniche di respirazione terapeutica',
    icon: Wind,
    gradient: 'from-green-400 to-teal-600',
    category: 'relax',
    duration: '3-6 min',
    difficulty: 'easy'
  },
  {
    key: 'breathing-exercise',
    title: 'Respirazione 4-7-8',
    description: 'Tecnica di respirazione per rilassamento',
    icon: Wind,
    gradient: 'from-green-400 to-emerald-600',
    category: 'relax',
    duration: '5 min',
    difficulty: 'easy'
  },
  {
    key: '10min-walk',
    title: 'Camminata di 10 minuti',
    description: 'Movimento consapevole con coach virtuale',
    icon: Activity,
    gradient: 'from-orange-400 to-red-600',
    category: 'energy',
    duration: '10 min',
    difficulty: 'easy'
  },
  {
    key: 'mindful-hydration',
    title: 'Idratazione consapevole',
    description: 'Bere acqua con presenza e gratitudine',
    icon: Droplets,
    gradient: 'from-cyan-400 to-blue-600',
    category: 'focus',
    duration: '4-5 min',
    difficulty: 'medium'
  },
  {
    key: 'power-nap',
    title: 'Power nap',
    description: 'Breve riposo rigenerante',
    icon: Moon,
    gradient: 'from-indigo-400 to-purple-600',
    category: 'sleep',
    duration: '15-20 min',
    difficulty: 'easy'
  },
  {
    key: 'stretch',
    title: 'Stretching',
    description: 'Allunga i muscoli e rilassa il corpo',
    icon: Activity,
    gradient: 'from-green-400 to-blue-600',
    category: 'energy',
    duration: '10 min',
    difficulty: 'easy'
  },
  {
    key: 'energy-boost',
    title: 'Ricarica di energia',
    description: 'Attività per aumentare vitalità',
    icon: Zap,
    gradient: 'from-yellow-400 to-orange-600',
    category: 'energy',
    duration: '5-8 min',
    difficulty: 'medium'
  }
];

const categories = [
  { key: 'all', label: 'Tutte', color: 'from-gray-400 to-gray-600' },
  { key: 'relax', label: 'Relax', color: 'from-blue-400 to-cyan-500' },
  { key: 'energy', label: 'Energia', color: 'from-orange-400 to-red-500' },
  { key: 'focus', label: 'Focus', color: 'from-purple-400 to-pink-500' },
  { key: 'sleep', label: 'Sonno', color: 'from-indigo-400 to-purple-600' }
];

const SuggestionCard: React.FC<{
  suggestion: Suggestion;
  delay: number;
}> = ({ suggestion, delay }) => {
  const IconComponent = suggestion.icon;

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `/suggestions/${suggestion.key}`;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 text-left w-full translate-y-20 opacity-0 animate-slideIn`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-r ${suggestion.gradient} rounded-xl group-hover:rotate-12 transition-transform duration-300`}>
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            suggestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
            suggestion.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {suggestion.difficulty}
          </span>
          <span className="text-white/60 text-sm">{suggestion.duration}</span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
        {suggestion.title}
      </h3>
      <p className="text-white/70 text-sm mb-4 line-clamp-2">
        {suggestion.description}
      </p>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${
          categories.find(c => c.key === suggestion.category)?.color || 'from-gray-400 to-gray-600'
        } text-white`}>
          {categories.find(c => c.key === suggestion.category)?.label}
        </span>
        <div className="flex items-center gap-2 text-blue-300 group-hover:text-blue-200 transition-colors">
          <Play className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  );
};

const SuggestionsIndexPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setMounted(true);

    if (typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  };

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

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
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>

            <div className="w-24" />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="relative pt-20 pb-12 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Suggestions
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Personalizzate
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Scegli l'attività perfetta per il tuo momento. Ogni suggestion è progettata per migliorare il tuo benessere.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative py-8 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category.key
                    ? `bg-gradient-to-r ${category.color} text-white scale-105 shadow-lg`
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Suggestions Grid */}
      <section className="relative py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.map((suggestion, index) => (
              <SuggestionCard
                key={suggestion.key}
                suggestion={suggestion}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Footer */}
      <section className="relative py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{suggestions.length}</div>
                <div className="text-white/70">Suggestions disponibili</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">4</div>
                <div className="text-white/70">Categorie di benessere</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">2-20</div>
                <div className="text-white/70">Minuti richiesti</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slideIn {
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default SuggestionsIndexPage;
