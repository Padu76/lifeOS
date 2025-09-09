'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { ArrowLeft, Play, Pause, CheckCircle, Clock, Zap, Brain, Moon, Heart, Activity, Volume2, VolumeX, RotateCcw, Droplets, Wind, Shield } from 'lucide-react';

// Utility function to get URL parameters in browser environment
function getUrlParameter(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  const param = urlParams.get(name);
  if (param) return param;
  
  // Try to get from pathname
  const pathSegments = window.location.pathname.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  return lastSegment || null;
}

function MMSS(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function useTick(seconds: number) {
  const [sec, setSec] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setSec(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  return { sec, isRunning, setIsRunning };
}

// Interfacce TypeScript per il profilo utente
interface UserProfile {
  stressLevel: 'low' | 'medium' | 'high';
  energyLevel: 'low' | 'medium' | 'high';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredStyle: 'breathing-focused' | 'mindfulness' | 'body-scan' | 'loving-kindness';
}

interface MeditationStep {
  time: number;
  text: string;
  type: 'intro' | 'instruction' | 'breathing' | 'encouragement' | 'guidance' | 'visualization' | 'mantra' | 'body_awareness' | 'transition' | 'awakening' | 'conclusion' | 'mindfulness' | 'release' | 'presence' | 'gratitude' | 'integration';
}

// Simulazione dei dati utente
const mockUserProfile: UserProfile = {
  stressLevel: 'high',
  energyLevel: 'low', 
  experienceLevel: 'beginner',
  timeOfDay: 'evening',
  preferredStyle: 'breathing-focused'
};

// Enhanced Breathing Experience Component
const EnhancedBreathingExperience = ({ onComplete }: { onComplete?: () => void }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [count, setCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [duration, setDuration] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const breathingTechniques = {
    'box-breathing': {
      name: 'Box Breathing',
      description: 'Tecnica militare per calma e concentrazione',
      icon: Shield,
      color: 'from-blue-400 to-blue-600',
      pattern: [4, 4, 4, 4], // inhale, hold, exhale, hold
      phases: ['Inspira', 'Trattieni', 'Espira', 'Trattieni'],
      benefits: 'Riduce stress e ansia, migliora focus'
    },
    'physiological-sigh': {
      name: 'Physiological Sigh',
      description: 'Doppia inspirazione per rilassamento rapido',
      icon: Wind,
      color: 'from-green-400 to-green-600',
      pattern: [2, 0, 6, 0], // doppia inspirazione veloce, lunga espirazione
      phases: ['Doppia Inspira', '', 'Lunga Espira', ''],
      benefits: 'Attiva il sistema nervoso parasimpatico'
    },
    'energizing-breath': {
      name: 'Energizing Breath',
      description: 'Respirazione energizzante per vitalità',
      icon: Zap,
      color: 'from-orange-400 to-red-500',
      pattern: [3, 1, 2, 0], // inspira veloce, pausa breve, espira veloce
      phases: ['Inspira Veloce', 'Pausa', 'Espira Veloce', ''],
      benefits: 'Aumenta energia e attenzione'
    },
    'coherent-breathing': {
      name: 'Coherent Breathing',
      description: 'Respirazione bilanciata per equilibrio',
      icon: Heart,
      color: 'from-purple-400 to-indigo-600',
      pattern: [5, 0, 5, 0], // 5 secondi inspira, 5 secondi espira
      phases: ['Inspira', '', 'Espira', ''],
      benefits: 'Equilibra il sistema nervoso autonomo'
    }
  };

  // Timer per la tecnica di respirazione
  useEffect(() => {
    if (!isActive || !selectedTechnique) return;

    const technique = breathingTechniques[selectedTechnique as keyof typeof breathingTechniques];
    const currentPhaseDuration = technique.pattern[['inhale', 'hold1', 'exhale', 'hold2'].indexOf(phase)];
    
    if (currentPhaseDuration === 0) {
      // Salta le fasi con durata 0
      const phases = ['inhale', 'hold1', 'exhale', 'hold2'] as const;
      const currentIndex = phases.indexOf(phase);
      const nextIndex = (currentIndex + 1) % 4;
      setPhase(phases[nextIndex]);
      return;
    }

    setTimeLeft(currentPhaseDuration);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Passa alla fase successiva
          const phases = ['inhale', 'hold1', 'exhale', 'hold2'] as const;
          const currentIndex = phases.indexOf(phase);
          const nextIndex = (currentIndex + 1) % 4;
          
          if (phase === 'hold2' || (phase === 'exhale' && technique.pattern[3] === 0)) {
            setCycleCount(prev => prev + 1);
            setBreathCount(prev => prev + 1);
          }
          
          setPhase(phases[nextIndex]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, selectedTechnique]);

  // Timer totale sessione
  useEffect(() => {
    if (!isActive) return;
    
    const sessionTimer = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(sessionTimer);
  }, [isActive]);

  // Completa sessione dopo target cycles
  useEffect(() => {
    const targetCycles = duration * 5; // 5 cicli per minuto
    if (breathCount >= targetCycles && isActive) {
      setIsActive(false);
      onComplete?.();
    }
  }, [breathCount, duration, isActive, onComplete]);

  const togglePlay = () => {
    if (!selectedTechnique) return;
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(0);
    setCycleCount(0);
    setBreathCount(0);
    setTotalTime(0);
    setTimeLeft(0);
  };

  const selectTechnique = (techniqueKey: string) => {
    setSelectedTechnique(techniqueKey);
    reset();
  };

  if (!selectedTechnique) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Scegli la tua tecnica di respirazione</h3>
          <p className="text-white/60">Ogni tecnica ha benefici specifici per il tuo benessere</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(breathingTechniques).map(([key, technique]) => {
            const IconComponent = technique.icon;
            return (
              <button
                key={key}
                onClick={() => selectTechnique(key)}
                className={`group bg-gradient-to-br ${technique.color} p-6 rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 text-left`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">{technique.name}</h4>
                    <p className="text-white/80 text-sm mb-3">{technique.description}</p>
                    <div className="text-white/60 text-xs">
                      <strong>Benefici:</strong> {technique.benefits}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 backdrop-blur-lg">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Personalizzazione automatica</p>
              <p className="text-blue-200/80 text-sm">
                Seleziona la durata della sessione: 
              </p>
              <div className="flex gap-2 mt-3">
                {[3, 4, 5, 6].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setDuration(mins)}
                    className={`px-3 py-1 rounded-lg text-sm transition-all ${
                      duration === mins 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/10 text-blue-200 hover:bg-white/20'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const technique = breathingTechniques[selectedTechnique as keyof typeof breathingTechniques];
  const IconComponent = technique.icon;
  const currentPhaseIndex = ['inhale', 'hold1', 'exhale', 'hold2'].indexOf(phase);
  const currentPhaseLabel = technique.phases[currentPhaseIndex];
  const progress = breathCount / (duration * 5) * 100;

  return (
    <div className="space-y-8">
      {/* Header con tecnica selezionata */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedTechnique(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cambia tecnica
        </button>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">{technique.name}</h3>
          <p className="text-white/60 text-sm">{duration} minuti • {breathCount} respiri</p>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </div>

      {/* Visualizzazione centrale */}
      <div className="flex justify-center">
        <div className="relative w-80 h-80">
          {/* Anelli di sfondo */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${technique.color} opacity-20 animate-pulse`} />
          <div className={`absolute inset-4 rounded-full bg-gradient-to-r ${technique.color} opacity-30 animate-pulse`} style={{ animationDelay: '0.5s' }} />
          
          {/* Cerchio principale */}
          <div 
            className={`absolute inset-8 rounded-full bg-gradient-to-br ${technique.color} backdrop-blur-lg border border-white/20 transition-all duration-1000 flex items-center justify-center shadow-2xl`}
            style={{
              transform: phase === 'inhale' ? 'scale(1.1)' : phase === 'exhale' ? 'scale(0.9)' : 'scale(1)',
              boxShadow: isActive ? '0 0 80px rgba(59, 130, 246, 0.4)' : '0 0 40px rgba(59, 130, 246, 0.2)'
            }}
          >
            <div className="text-white text-center">
              <IconComponent className="w-12 h-12 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{timeLeft || '--'}</div>
              <div className="text-sm opacity-80">{currentPhaseLabel}</div>
            </div>
          </div>

          {/* Progresso circolare */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="150"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <circle
              cx="50%"
              cy="50%"
              r="150"
              fill="none"
              stroke="url(#breathGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 150}`}
              strokeDashoffset={`${2 * Math.PI * 150 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="breathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
          <div className="text-2xl font-bold text-white">{MMSS(totalTime)}</div>
          <div className="text-xs text-white/60">Tempo</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
          <div className="text-2xl font-bold text-white">{breathCount}</div>
          <div className="text-xs text-white/60">Respiri</div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 text-center">
          <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
          <div className="text-xs text-white/60">Progresso</div>
        </div>
      </div>

      {/* Istruzioni */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <p className="text-white text-center text-lg mb-2">
          {isActive 
            ? `${currentPhaseLabel} per ${timeLeft} secondi`
            : 'Premi play per iniziare la tua sessione di respirazione'
          }
        </p>
        <p className="text-white/60 text-center text-sm">
          {technique.benefits}
        </p>
      </div>

      {/* Controlli */}
      <div className="flex justify-center space-x-6">
        <button
          onClick={togglePlay}
          className={`group flex items-center justify-center w-16 h-16 bg-gradient-to-r ${technique.color} text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl`}
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        
        <button
          onClick={reset}
          className="flex items-center justify-center w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-lg border border-white/20"
        >
          <RotateCcw size={24} />
        </button>
      </div>
    </div>
  );
};

// Script di meditazione personalizzati
const getMeditationScript = (profile: UserProfile, duration: number): MeditationStep[] => {
  const scripts: Record<string, MeditationStep[]> = {
    high_stress_beginner: [
      { time: 0, text: "Benvenuto. Trova una posizione comoda e chiudi gli occhi.", type: "intro" },
      { time: 10, text: "Porta l'attenzione al tuo respiro naturale, senza forzarlo.", type: "instruction" },
      { time: 30, text: "Inspira lentamente per 4 secondi...", type: "breathing" },
      { time: 40, text: "Trattieni per 2 secondi...", type: "breathing" },
      { time: 50, text: "Espira dolcemente per 6 secondi...", type: "breathing" },
      { time: 70, text: "Perfetto. Continua con questo ritmo naturale.", type: "encouragement" },
      { time: 90, text: "Se la mente vaga, è normale. Torna gentilmente al respiro.", type: "guidance" },
      { time: 120, text: "Senti come ogni espiro rilascia la tensione del giorno.", type: "visualization" },
      { time: 150, text: "Inspira calma, espira stress...", type: "mantra" },
      { time: 180, text: "Ancora qualche respiro profondo...", type: "instruction" },
      { time: 210, text: "Senti il tuo corpo completamente rilassato.", type: "body_awareness" },
      { time: 240, text: "Tra poco termineremo. Goditi questi ultimi momenti di pace.", type: "transition" },
      { time: 270, text: "Muovi delicatamente le dita delle mani e dei piedi.", type: "awakening" },
      { time: 285, text: "Quando sei pronto, apri gli occhi. Ben fatto!", type: "conclusion" }
    ],
    low_energy_evening: [
      { time: 0, text: "È stata una lunga giornata. È tempo di rilasciare tutto.", type: "intro" },
      { time: 15, text: "Lascia che il tuo corpo si abbandoni completamente.", type: "instruction" },
      { time: 35, text: "Respira profondamente, come onde che si infrangono dolcemente.", type: "breathing" },
      { time: 60, text: "Ogni respiro ti porta più in profondità nel rilassamento.", type: "visualization" },
      { time: 90, text: "Immagina di galleggiare su un lago tranquillo.", type: "visualization" },
      { time: 120, text: "La tua mente diventa silenziosa come l'acqua calma.", type: "mindfulness" },
      { time: 150, text: "Lascia andare i pensieri della giornata...", type: "release" },
      { time: 180, text: "Sei qui, ora, in perfetta pace.", type: "presence" },
      { time: 210, text: "Senti gratitudine per questo momento di calma.", type: "gratitude" },
      { time: 240, text: "Preparati dolcemente a tornare.", type: "transition" },
      { time: 270, text: "Porta questa calma con te.", type: "integration" },
      { time: 285, text: "Apri gli occhi quando ti senti pronto.", type: "conclusion" }
    ],
    medium_stress_intermediate: [
      { time: 0, text: "Siediti comodamente e prendi un momento per arrivare qui.", type: "intro" },
      { time: 20, text: "Osserva il tuo respiro senza giudicarlo.", type: "instruction" },
      { time: 45, text: "Nota le sensazioni del corpo contro la sedia.", type: "body_awareness" },
      { time: 75, text: "Se emergono pensieri, semplicemente notali.", type: "mindfulness" },
      { time: 105, text: "Torna sempre al respiro come al tuo ancoraggio.", type: "guidance" },
      { time: 135, text: "Inspira presenza, espira tensione.", type: "mantra" },
      { time: 165, text: "Senti lo spazio di calma che stai creando.", type: "visualization" },
      { time: 195, text: "Questo momento di pace ti appartiene.", type: "encouragement" },
      { time: 225, text: "Gradualmente espandi la consapevolezza.", type: "transition" },
      { time: 255, text: "Muovi lentamente le dita e i piedi.", type: "awakening" },
      { time: 285, text: "Apri gli occhi portando questa presenza con te.", type: "conclusion" }
    ]
  };

  const primaryKey = `${profile.stressLevel}_${profile.experienceLevel}`;
  const secondaryKey = `${profile.energyLevel}_${profile.timeOfDay}`;
  
  if (scripts[primaryKey]) {
    return scripts[primaryKey];
  }
  if (scripts[secondaryKey]) {
    return scripts[secondaryKey];
  }
  
  return scripts.high_stress_beginner;
};

function GuidedMeditationSystem() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(300);
  const [currentInstruction, setCurrentInstruction] = useState<MeditationStep | null>(null);
  const [meditationScript, setMeditationScript] = useState<MeditationStep[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'active' | 'completed'>('setup');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const script = getMeditationScript(mockUserProfile, duration);
    setMeditationScript(script);
    setCurrentInstruction(script[0]);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [duration]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          const instruction = meditationScript
            .filter(item => item.time <= newTime)
            .pop();
            
          if (instruction && instruction !== currentInstruction) {
            setCurrentInstruction(instruction);
            
            if (audioEnabled && 'speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(instruction.text);
              utterance.rate = 0.8;
              utterance.pitch = 0.9;
              speechSynthesis.speak(utterance);
            }
          }
          
          if (newTime >= duration) {
            setIsPlaying(false);
            setPhase('completed');
            return duration;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, meditationScript, currentInstruction, audioEnabled, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (phase === 'setup') setPhase('active');
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setPhase('setup');
    setCurrentInstruction(meditationScript[0]);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => (currentTime / duration) * 100;

  const getInstructionStyle = (type: MeditationStep['type']) => {
    const styles: Record<MeditationStep['type'], string> = {
      intro: 'text-blue-300',
      instruction: 'text-white/90',
      breathing: 'text-green-300 font-medium',
      encouragement: 'text-purple-300',
      guidance: 'text-indigo-300',
      visualization: 'text-teal-300',
      mantra: 'text-orange-300 italic',
      body_awareness: 'text-pink-300',
      transition: 'text-yellow-300',
      awakening: 'text-red-300',
      conclusion: 'text-emerald-300 font-medium',
      mindfulness: 'text-slate-300',
      release: 'text-violet-300',
      presence: 'text-cyan-300',
      gratitude: 'text-amber-300',
      integration: 'text-lime-300'
    };
    return styles[type] || 'text-white/90';
  };

  const mouseParallaxX = typeof window !== 'undefined' 
    ? (mousePosition.x - window.innerWidth / 2) * 0.02 
    : 0;
  const mouseParallaxY = typeof window !== 'undefined'
    ? (mousePosition.y - window.innerHeight / 2) * 0.02 
    : 0;

  return (
    <div className="space-y-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                rgba(147, 197, 253, 0.15) 0%, 
                transparent 50%),
              radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `
          }}
        />
        
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="flex justify-center relative z-10">
        <div 
          className="relative w-80 h-80"
          style={{
            transform: `translate(${mouseParallaxX}px, ${mouseParallaxY}px)`
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-600/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          <div 
            className={`absolute inset-8 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 backdrop-blur-lg border border-white/20 transition-all duration-1000 flex items-center justify-center shadow-2xl ${
              isPlaying ? 'shadow-[0_0_100px_rgba(147,197,253,0.4)]' : 'shadow-[0_0_50px_rgba(147,197,253,0.2)]'
            }`}
            style={{
              transform: isPlaying ? 'scale(1.05)' : 'scale(1)',
              animation: isPlaying ? 'breathe 4s ease-in-out infinite' : 'none'
            }}
          >
            <div className="text-white text-center">
              <div className="text-5xl font-light mb-2">
                {isPlaying ? '🧘‍♀️' : phase === 'completed' ? '✨' : '🕯️'}
              </div>
              <div className="text-xl font-medium">{formatTime(currentTime)}</div>
              <div className="text-sm opacity-70 mt-1">
                {phase === 'setup' && 'Pronto per iniziare'}
                {phase === 'active' && 'Meditazione in corso'}
                {phase === 'completed' && 'Completata'}
              </div>
            </div>
          </div>

          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="150"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
            />
            <circle
              cx="50%"
              cy="50%"
              r="150"
              fill="none"
              stroke="url(#meditationGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 150}`}
              strokeDashoffset={`${2 * Math.PI * 150 * (1 - getProgressPercentage() / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="meditationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-sm text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span className="text-xs opacity-70">
            Personalizzato per: {mockUserProfile.stressLevel} stress, {mockUserProfile.energyLevel} energia
          </span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-lg">
          <div 
            className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 min-h-[120px] flex items-center justify-center relative z-10">
        {currentInstruction ? (
          <div className="text-center">
            <div className={`text-lg leading-relaxed ${getInstructionStyle(currentInstruction.type)} mb-2`}>
              {currentInstruction.text}
            </div>
            <div className="text-xs text-white/40 uppercase tracking-wider">
              {currentInstruction.type.replace('_', ' ')}
            </div>
          </div>
        ) : (
          <p className="text-white/50 text-center text-lg">
            Premi play per iniziare la tua meditazione personalizzata
          </p>
        )}
      </div>

      <div className="flex justify-center space-x-6 relative z-10">
        <button
          onClick={togglePlay}
          className="group flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl"
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        
        <button
          onClick={reset}
          className="flex items-center justify-center w-16 h-16 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-lg border border-white/20"
        >
          <RotateCcw size={24} />
        </button>
        
        <button
          onClick={toggleAudio}
          className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-lg border border-white/20 ${
            audioEnabled ? 
              'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 
              'bg-white/10 hover:bg-white/20 text-white/60'
          }`}
        >
          {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
      </div>

      <div className="text-center relative z-10">
        <div className="flex justify-center space-x-3 mb-3">
          {['setup', 'active', 'completed'].map((p, i) => (
            <div
              key={p}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                phase === p ? 'bg-gradient-to-r from-blue-400 to-purple-500 scale-125' : 
                ['setup', 'active', 'completed'].indexOf(phase) > i ? 'bg-green-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-white/60">
          {phase === 'setup' && 'Preparazione - Trova una posizione comoda'}
          {phase === 'active' && 'Meditazione in corso - Segui le istruzioni'}
          {phase === 'completed' && 'Sessione completata - Ben fatto!'}
        </p>
      </div>

      {phase === 'setup' && (
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 backdrop-blur-lg relative z-10">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-blue-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Suggerimento personalizzato</p>
              <p className="text-blue-200/80 text-sm">
                Basandoci sul tuo livello di stress {mockUserProfile.stressLevel}, abbiamo preparato una sessione con focus sulla respirazione rilassante. Attiva l'audio per una guida vocale completa.
              </p>
            </div>
          </div>
        </div>
      )}

      {phase === 'completed' && (
        <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 backdrop-blur-lg relative z-10">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-200 text-sm font-medium mb-1">Sessione completata</p>
              <p className="text-green-200/80 text-sm">
                Ottimo lavoro! Hai dedicato 5 minuti al tuo benessere. Prendi un momento per notare come ti senti ora rispetto a prima della meditazione.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1.05) rotate(0deg); }
          50% { transform: scale(1.15) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

// Configurazioni delle suggestions
const suggestions = {
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
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🫁</div>
        <p className="text-lg text-white/80">Respira 4 secondi, trattieni 7, espira 8</p>
      </div>
    )
  },
  '10min-walk': {
    title: 'Camminata di 10 minuti',
    description: 'Movimento consapevole con coach virtuale',
    icon: Activity,
    gradient: 'from-orange-400 to-red-600',
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🚶‍♂️</div>
        <p className="text-lg text-white/80">Una breve camminata per rigenerare corpo e mente</p>
      </div>
    )
  },
  'mindful-hydration': {
    title: 'Idratazione consapevole',
    description: 'Bere acqua con presenza e gratitudine',
    icon: Droplets,
    gradient: 'from-cyan-400 to-blue-600',
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🥤</div>
        <p className="text-lg text-white/80">Bevi con consapevolezza e gratitudine</p>
      </div>
    )
  },
  'power-nap': {
    title: 'Power nap',
    description: 'Breve riposo rigenerante',
    icon: Moon,
    gradient: 'from-indigo-400 to-purple-600',
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">😴</div>
        <p className="text-lg text-white/80">15 minuti di riposo per ricaricarti</p>
      </div>
    )
  },
  'stretch': {
    title: 'Stretching',
    description: 'Allunga i muscoli e rilassa il corpo',
    icon: Activity,
    gradient: 'from-green-400 to-blue-600',
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">🤸‍♂️</div>
        <p className="text-lg text-white/80">Allunga e rilassa i muscoli</p>
      </div>
    )
  },
  'energy-boost': {
    title: 'Ricarica di energia',
    description: 'Attività per aumentare vitalità',
    icon: Zap,
    gradient: 'from-yellow-400 to-orange-600',
    component: () => (
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">⚡</div>
        <p className="text-lg text-white/80">Risveglia la tua energia vitale</p>
      </div>
    )
  }
};

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
