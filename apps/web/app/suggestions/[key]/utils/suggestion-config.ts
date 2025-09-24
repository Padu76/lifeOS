import { Clock, Droplets, Brain, Wind, Activity, Moon, Zap } from 'lucide-react';
import UnifiedBreathingExperience from '../components/UnifiedBreathingExperience';
import { GuidedMeditationSystem } from '../components/GuidedMeditationSystem';
import { VirtualWalkingCoach } from '../components/VirtualWalkingCoach';
import { HydrationGuide } from '../components/HydrationGuide';
import { PowerNapGuide } from '../components/PowerNapGuide';
import { StretchingSequence } from '../components/StretchingSequence';
import { EnergyBoostSession } from '../components/EnergyBoostSession';

// Configurazioni delle suggestions
export const suggestions = {
  'breathing-center': {
    title: 'Centro di Respirazione',
    description: 'Tecniche di respirazione guidata per ogni esigenza',
    icon: Wind,
    gradient: 'from-green-400 to-teal-600',
    component: UnifiedBreathingExperience
  },
  'guided-meditation': {
    title: 'Meditazione guidata',
    description: 'Sessione di mindfulness personalizzata',
    icon: Brain,
    gradient: 'from-purple-400 to-pink-600',
    component: GuidedMeditationSystem
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