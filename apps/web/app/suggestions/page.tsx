'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Droplets, Brain, Wind, Activity, Moon, Zap, Play, ChevronRight, Menu, X } from 'lucide-react';
import { suggestions } from './[key]/utils/suggestion-config';

interface SuggestionConfig {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  component: React.ComponentType<any>;
}

// Mobile Menu Component
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-lg border-l border-white/10">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            LifeOS
          </span>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="p-6 space-y-6">
          {[
            { href: '/', label: 'Home' },
            { href: '/suggestions', label: 'Suggestions' },
            { href: '/dashboard', label: 'Dashboard' },
            { href: '/settings', label: 'Settings' }
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="block text-lg font-semibold text-white/80 hover:text-white transition-colors py-2"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

const SuggestionsIndex: React.FC = () => {
  const [filter, setFilter] = useState<string>('tutte');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      case 'relax': return <Brain className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'energia': return <Zap className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'focus': return <Activity className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'sonno': return <Moon className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <Play className="w-3 h-3 sm:w-4 sm:h-4" />;
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
        <div className="animate-pulse p-4 sm:p-8">
          <div className="h-6 sm:h-8 bg-white/20 rounded w-32 sm:w-48 mb-6 sm:mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 sm:h-48 bg-white/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Navigation - Mobile Optimized */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Back button - sempre visibile */}
            <a 
              href="/dashboard" 
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors min-w-0 flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Dashboard</span>
            </a>
            
            {/* Logo centralized */}
            <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </div>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Apri menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Spacer for desktop */}
            <div className="hidden md:block w-20"></div>
          </div>
        </div>
      </nav>

      {/* Header - Mobile Optimized */}
      <section className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            Suggestions
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Personalizzate
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-2">
            Scegli l'attività perfetta per il tuo momento. Ogni suggestion è progettata per migliorare il tuo benessere.
          </p>
        </div>
      </section>

      {/* Filters - Mobile Optimized Horizontal Scroll */}
      <section className="pb-6 sm:pb-8">
        <div className="container mx-auto max-w-6xl">
          {/* Mobile: horizontal scroll */}
          <div className="md:hidden px-4 overflow-x-auto">
            <div className="flex gap-3 pb-2 min-w-max">
              {filters.map((filterItem) => (
                <button
                  key={filterItem.key}
                  onClick={() => setFilter(filterItem.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border backdrop-blur-lg whitespace-nowrap flex-shrink-0 ${
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
          
          {/* Desktop: centered wrap */}
          <div className="hidden md:flex flex-wrap justify-center gap-3 px-6">
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

      {/* Suggestions Grid - Mobile Optimized */}
      <section className="pb-8 sm:pb-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredSuggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <div
                  key={suggestion.key}
                  className={`group bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 cursor-pointer transform active:scale-95 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms`,
                    background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                    minHeight: '44px' // Touch target
                  }}
                  onClick={() => window.location.href = `/suggestions/${suggestion.key}`}
                >
                  {/* Header con icon e categoria - Mobile Optimized */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r ${suggestion.gradient} rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg flex-shrink-0`}>
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    
                    <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(suggestion.category)} ml-2`}>
                      {getCategoryIcon(suggestion.category)}
                      <span className="hidden sm:inline">{suggestion.category}</span>
                    </div>
                  </div>

                  {/* Contenuto - Mobile Optimized */}
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-200 transition-colors leading-tight">
                      {suggestion.title}
                    </h3>
                    
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                      {suggestion.description}
                    </p>

                    {/* Metadati - Mobile Optimized */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-1 text-white/60 text-xs">
                          <Clock className="w-3 h-3" />
                          {suggestion.duration} min
                        </div>
                        <div className="text-white/60 text-xs">
                          {suggestion.difficulty}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 text-blue-300 text-sm font-medium group-hover:text-blue-200 transition-colors">
                        <span className="hidden sm:inline">Inizia</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state when no results */}
          {filteredSuggestions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Nessuna suggestion trovata</h3>
              <p className="text-white/60">Prova a cambiare categoria o rimuovi i filtri</p>
              <button
                onClick={() => setFilter('tutte')}
                className="mt-4 px-6 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm hover:bg-blue-500/30 transition-colors"
              >
                Mostra tutte
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Footer - Mobile Optimized */}
      <section className="pb-16 sm:pb-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{suggestionsList.length}</div>
                <div className="text-white/60 text-sm sm:text-base">Suggestions disponibili</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">{filters.length - 1}</div>
                <div className="text-white/60 text-sm sm:text-base">Categorie di benessere</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">2-20</div>
                <div className="text-white/60 text-sm sm:text-base">Minuti richiesti</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuggestionsIndex;