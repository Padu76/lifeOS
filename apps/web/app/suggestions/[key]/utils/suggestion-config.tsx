import { Clock, Droplets, Brain, Wind, Activity, Moon, Zap } from 'lucide-react';
import { EnhancedBreathingExperience } from '../components/EnhancedBreathingExperience';
import { GuidedMeditationSystem } from '../components/GuidedMeditationSystem';
import { VirtualWalkingCoach } from '../components/VirtualWalkingCoach';
import { HydrationGuide } from '../components/HydrationGuide';
import { ModernBreathing478 } from '../components/ModernBreathing478';
import { PowerNapGuide } from '../components/PowerNapGuide';
import { StretchingSequence } from '../components/StretchingSequence';
import { EnergyBoostSession } from '../components/EnergyBoostSession';

// Configurazioni delle suggestions
export const suggestions = {
  'take-break': {
    title: 'Prenditi una pausa',
    description: 'Momento di relax per ricaricare le energie',
    icon: Clock,
    gradient: 'from-blue-400 to-indigo-600',
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">☕</div>
        <p className="text-lg text-white/80">Fermati, respira e ricaricati</p>
      </div>
    )
  },
  'drink-water': {
    title: 'Bevi acqua',
    description: 'Mantieni il corpo idratato per il benessere',
    icon: Droplets,
    gradient: 'from-cyan-400 to-blue-600',
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">💧</div>
        <p className="text-lg text-white/80">Il tuo corpo ha bisogno di idratazione</p>
      </div>
    )
  },
  'guided-meditation': {
    title: 'Meditazione guidata',
    description: 'Sessione di mindfulness personalizzata',
    icon: Brain,
    gradient: 'from-purple-400 to-pink-600',
    component: GuidedMeditationSystem
  },
  'deep-breathing': {
    title: 'Respirazione profonda',
    description: 'Tecniche di respirazione terapeutica',
    icon: Wind,
    gradient: 'from-green-400 to-teal-600',
    component: EnhancedBreathingExperience
  },
  'breathing-exercise': {
    title: 'Esercizio di respirazione 4-7-8',
    description: 'Tecnica di respirazione per rilassamento',
    icon: Wind,
    gradient: 'from-green-400 to-emerald-600',
    component: ModernBreathing478
  },
  '10min-walk': {
    title: 'Camminata di 10 minuti',
    description: 'Movimento consapevole con coach virtuale',
    icon: Activity,
    gradient: 'from-orange-400 to-red-600',
    component: VirtualWalkingCoach
  },
  'mindful-hydration': {
    title: 'Idratazione consapevole',
    description: 'Bere acqua con presenza e gratitudine',
    icon: Droplets,
    gradient: 'from-cyan-400 to-blue-600',
    component: HydrationGuide
  },
  'power-nap': {
    title: 'Power nap',
    description: 'Breve riposo rigenerante',
    icon: Moon,
    gradient: 'from-indigo-400 to-purple-600',
    component: PowerNapGuide
  },
  'stretch': {
    title: 'Stretching',
    description: 'Allunga i muscoli e rilassa il corpo',
    icon: Activity,
    gradient: 'from-green-400 to-blue-600',
    component: StretchingSequence
  },
  'energy-boost': {
    title: 'Ricarica di energia',
    description: 'Attività per aumentare vitalità',
    icon: Zap,
    gradient: 'from-yellow-400 to-orange-600',
    component: EnergyBoostSession
  }
};
