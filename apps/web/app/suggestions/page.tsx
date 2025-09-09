'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Droplets, Brain, Wind, Activity, Moon, Zap, Play, ChevronRight } from 'lucide-react';
import { suggestions } from './[key]/utils/suggestion-config';

interface SuggestionConfig {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  component: React.ComponentType<any>;
}

const SuggestionsIndex: React.FC = () => {
  const [filter, setFilter] = useState<string>('tutte');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Converte l'oggetto suggestions in array con chiavi
  const suggestionsList = Object.entries(suggestions).map(([key, config]) => ({
    key,
    ...config,
    category: getCategoryFromKey(key),
    duration: getDurationFromKey(key),
    difficulty: getDifficultyFromKey(key)
  }));

  // Categorizza le suggestions basandosi sulla chiave
  function getCategoryFromKey(key: string): string {
    if (key.includes('breathing') || key.includes('meditation')) return 'relax';
    if (key.includes('walk') || key.includes('stretch') || key.includes('energy')) return 'energia';
    if (key.includes('nap') || key.includes('sleep')) return 'sonno';
    if (key.includes('brain') || key.includes('focus')) return 'focus';
    return 'relax';
  }

  function getDurationFromKey(key: string): number {
    if (key.includes('10min') || key.includes('walk')) return 10;
    if (key.includes('nap')) return 15;
    if (key.includes('meditation')) return 8;
    if (key.includes('breathing')) return 5;
    return 5;
  }

  function getDifficultyFromKey(key: string): string {
    if (key.includes('deep') || key.includes('meditation')) return 'Intermedio';
    if (key.includes('walk') || key.includes('energy')) return 'Facile';
    return 'Principiante';
  }

  const filteredSuggestions = suggestionsList.filter(suggestion => {
    if (filter === 'tutte') return true;
    return suggestion.category === filter;
  });

  const filters = [
    { key: 'tutte', label: 'Tutte', count: suggestionsList.length },
    { key: 'relax', label: 'Relax', count: suggestionsList.filter(s => s.category === 'relax').length },
    { key: 'energia', label: 'Energia', count: suggestionsList.filter(s => s.category === 'energia').length },
    { key: 'focus', label: 'Focus', count: suggestionsList.filter(s => s.category === 'focus').length },
    { key: 'sonno', label: 'Sonno', count: suggestionsList.filter(s => s.category === 'sonno').length }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'relax': return <Brain className="w-4 h-4" />;
      case 'energia': return <Zap className="w-4 h-4" />;
      case 'focus': return <Activity className="w-4 h-4" />;
      case 'sonno': return <Moon className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'relax': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'energia': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'focus': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'sonno': return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse p-8">
          <div className="h-8 bg-white/20 rounded w-48 mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-white/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a 
                href="/dashboard" 
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
            </div>
            
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            
            <div className="w-20"></div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-12 pb-8 px-6">
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

      {/* Filters */}
      <section className="pb-8 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filterItem) => (
              <button
                key={filterItem.key}
                onClick={() => setFilter(filterItem.key)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-lg ${
                  filter === filterItem.key
                    ? 'bg-blue-500/30 text-blue-200 border-blue-400/50 scale-105'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white'
                }`}
              >
                {filterItem.label}
                <span className="ml-2 text-xs opacity-75">({filterItem.count})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Suggestions Grid */}
      <section className="pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <div
                  key={suggestion.key}
                  className={`group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 cursor-pointer transform ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`
                  }}
                  onClick={() => window.location.href = `/suggestions/${suggestion.key}`}
                >
                  {/* Header con icon e categoria */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-r ${suggestion.gradient} rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(suggestion.category)}`}>
                      {getCategoryIcon(suggestion.category)}
                      {suggestion.category}
                    </div>
                  </div>

                  {/* Contenuto */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors">
                      {suggestion.title}
                    </h3>
                    
                    <p className="text-white/70 text-sm leading-relaxed">
                      {suggestion.description}
                    </p>

                    {/* Metadati */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-white/60 text-xs">
                          <Clock className="w-3 h-3" />
                          {suggestion.duration} min
                        </div>
                        <div className="text-white/60 text-xs">
                          {suggestion.difficulty}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-blue-300 text-sm font-medium group-hover:text-blue-200 transition-colors">
                        Inizia
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Footer */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">{suggestionsList.length}</div>
                <div className="text-white/60">Suggestions disponibili</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">{filters.length - 1}</div>
                <div className="text-white/60">Categorie di benessere</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">2-20</div>
                <div className="text-white/60">Minuti richiesti</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuggestionsIndex;
