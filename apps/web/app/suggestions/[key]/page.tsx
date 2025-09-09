'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { suggestions } from './utils/suggestion-config';
import { getUrlParameter } from './utils/browser-utils';

export default function SuggestionsPage() {
  const [key, setKey] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const urlKey = getUrlParameter('key');
    setKey(urlKey);
  }, []);

  const handleCompletion = () => {
    setIsCompleted(true);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  if (!key || !suggestions[key as keyof typeof suggestions]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Suggestion non trovata</h1>
          <button
            onClick={handleBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Torna alla dashboard
          </button>
        </div>
      </div>
    );
  }

  const suggestion = suggestions[key as keyof typeof suggestions];
  const IconComponent = suggestion.icon;
  const Component = suggestion.component;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${suggestion.gradient} relative overflow-hidden`}>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 border border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        
        <div className="text-center">
          <div className="flex items-center gap-3 justify-center mb-1">
            <IconComponent className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">{suggestion.title}</h1>
          </div>
          <p className="text-white/70 text-sm">{suggestion.description}</p>
        </div>

        <div className="w-24" />
      </div>

      {/* Contenuto principale */}
      <div className="relative z-10 container mx-auto px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          {isCompleted ? (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white">Ottimo lavoro!</h2>
              <p className="text-white/80">Hai completato la tua sessione di benessere</p>
              <button
                onClick={handleBack}
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-lg border border-white/20"
              >
                Torna alla dashboard
              </button>
            </div>
          ) : (
            <Component onComplete={handleCompletion} />
          )}
        </div>
      </div>
    </div>
  );
}
