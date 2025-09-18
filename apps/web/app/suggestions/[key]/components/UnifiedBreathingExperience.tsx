'use client';

import React, { useState } from 'react';
import { ArrowLeft, Wind, Shield, Brain, Heart, Clock, Users, Sparkles } from 'lucide-react';
import ModernBreathing478 from './ModernBreathing478';
import { EnhancedBreathingExperience } from './EnhancedBreathingExperience';

interface UnifiedBreathingExperienceProps {
  onComplete?: () => void;
}

export default function UnifiedBreathingExperience({ onComplete }: UnifiedBreathingExperienceProps) {
  const [selectedMode, setSelectedMode] = useState<'selection' | '478' | 'advanced'>('selection');

  // Mostra la schermata di selezione
  if (selectedMode === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Centro di Respirazione
            </h1>
            <p className="text-xl text-blue-200">
              Scegli la tecnica più adatta al tuo momento
            </p>
          </div>

          {/* Cards di selezione */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            
            {/* Card 4-7-8 */}
            <div 
              onClick={() => setSelectedMode('478')}
              className="group bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full">
                  <Clock className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-300 text-sm font-medium">5 min</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Respirazione 4-7-8
              </h2>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Tecnica del Dr. Andrew Weil per <strong>calmare rapidamente</strong> il sistema nervoso. 
                Perfetta per ridurre ansia, addormentarsi più facilmente e gestire lo stress acuto.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5"></div>
                  <span className="text-white/70 text-sm">Inspira per 4 secondi</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5"></div>
                  <span className="text-white/70 text-sm">Trattieni per 7 secondi</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5"></div>
                  <span className="text-white/70 text-sm">Espira per 8 secondi</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                  Principianti
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                  Anti-stress
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                  Pre-sonno
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-green-400 font-medium">Ideale per iniziare</span>
                <div className="flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform">
                  <span>Inizia</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </div>

            {/* Card Tecniche Avanzate */}
            <div 
              onClick={() => setSelectedMode('advanced')}
              className="group bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl group-hover:rotate-12 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full">
                  <Clock className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-300 text-sm font-medium">3-6 min</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-3">
                Tecniche Avanzate
              </h2>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                <strong>4 tecniche specializzate</strong> per obiettivi diversi: Box Breathing per focus, 
                Physiological Sigh per relax rapido, Energizing per vitalità, Coherent per equilibrio.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-300" />
                  <span className="text-white/70 text-sm">Box Breathing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-green-300" />
                  <span className="text-white/70 text-sm">Physio Sigh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orange-300" />
                  <span className="text-white/70 text-sm">Energizing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-purple-300" />
                  <span className="text-white/70 text-sm">Coherent</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                  Personalizzato
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                  Multi-obiettivo
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/80">
                  Esperti
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-purple-400 font-medium">Per utenti esperti</span>
                <div className="flex items-center gap-2 text-white group-hover:translate-x-2 transition-transform">
                  <span>Esplora</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </div>
            </div>
          </div>

          {/* Info comparativa */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Quale scegliere?
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">Scegli 4-7-8 se:</h4>
                <ul className="space-y-1 text-white/70">
                  <li>• Sei nuovo alla respirazione guidata</li>
                  <li>• Vuoi ridurre rapidamente l'ansia</li>
                  <li>• Hai difficoltà ad addormentarti</li>
                  <li>• Preferisci una tecnica semplice e ripetitiva</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-purple-300 mb-2">Scegli Avanzate se:</h4>
                <ul className="space-y-1 text-white/70">
                  <li>• Hai già esperienza con la respirazione</li>
                  <li>• Vuoi tecniche per diversi momenti</li>
                  <li>• Ti piace variare gli esercizi</li>
                  <li>• Cerchi benefici specifici (energia, focus, ecc.)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostra il componente 4-7-8
  if (selectedMode === '478') {
    return (
      <div className="relative">
        <button
          onClick={() => setSelectedMode('selection')}
          className="absolute top-4 left-4 z-10 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 backdrop-blur-lg px-4 py-2 rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
          Cambia tecnica
        </button>
        <ModernBreathing478 />
      </div>
    );
  }

  // Mostra il componente avanzato
  if (selectedMode === 'advanced') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedMode('selection')}
            className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cambia tecnica
          </button>
          <EnhancedBreathingExperience onComplete={onComplete} />
        </div>
      </div>
    );
  }

  return null;
}