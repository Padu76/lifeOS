'use client';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, CheckCircle, Clock, Zap, Brain, Moon, Heart, Activity, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import Link from 'next/link';

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

// Simulazione dei dati utente (da collegare al vero sistema)
const mockUserProfile: UserProfile = {
  stressLevel: 'high',
  energyLevel: 'low', 
  experienceLevel: 'beginner',
  timeOfDay: 'evening',
  preferredStyle: 'breathing-focused'
};

// Script di meditazione personalizzati con tipizzazione corretta
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

  // Determina la chiave dello script in modo type-safe
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
  const [duration] = useState(300); // 5 minuti
  const [currentInstruction, setCurrentInstruction] = useState<MeditationStep | null>(null);
  const [meditationScript, setMeditationScript] = useState<MeditationStep[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'active' | 'completed'>('setup');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Genera script personalizzato basato sul profilo
    const script = getMeditationScript(mockUserProfile, duration);
    setMeditationScript(script);
    setCurrentInstruction(script[0]);

    // Mouse tracking per effetti parallax
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
          
          // Trova l'istruzione corrente
          const instruction = meditationScript
            .filter(item => item.time <= newTime)
            .pop();
            
          if (instruction && instruction !== currentInstruction) {
            setCurrentInstruction(instruction);
            
            // Text-to-speech se abilitato
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

  // Calcola parallax mouse
  const mouseParallaxX = typeof window !== 'undefined' 
    ? (mousePosition.x - window.innerWidth / 2) * 0.02 
    : 0;
  const mouseParallaxY = typeof window !== 'undefined'
    ? (mousePosition.y - window.innerHeight / 2) * 0.02 
    : 0;

  return (
    <div className="space-y-8">
      {/* Dynamic Background Effects */}
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
        
        {/* Floating particles */}
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

      {/* Central Breathing Animation */}
      <div className="flex justify-center relative z-10">
        <div 
          className="relative w-80 h-80"
          style={{
            transform: `translate(${mouseParallaxX}px, ${mouseParallaxY}px)`
          }}
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-600/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Main breathing circle */}
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

          {/* Progress ring */}
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

      {/* Progress Bar */}
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

      {/* Current Instruction */}
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

      {/* Controls */}
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

      {/* Phase Indicators */}
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

      {/* Tips & Status */}
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

function ModernBreathing478() {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [remaining, setRemaining] = useState(4);
  const [cycle, setCycle] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const phaseConfig = {
    inhale: { duration: 4, label: 'Inspira', color: 'from-blue-400 to-cyan-500' },
    hold: { duration: 7, label: 'Trattieni', color: 'from-purple-400 to-pink-500' },
    exhale: { duration: 8, label: 'Espira', color: 'from-green-400 to-blue-500' }
  };

  useEffect(() => {
    if (!isActive) return;
    
    let seconds = phaseConfig[phase].duration;
    setRemaining(seconds);
    
    const t = setInterval(() => {
      seconds--;
      setRemaining(seconds);
      if (seconds <= 0) {
        clearInterval(t);
        if (phase === 'inhale') setPhase('hold');
        else if (phase === 'hold') setPhase('exhale');
        else {
          setCycle(c => c + 1);
          setPhase('inhale');
          if (cycle >= 4) setIsActive(false);
        }
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase, isActive, cycle]);

  const currentConfig = phaseConfig[phase];
  const progress = ((currentConfig.duration - remaining) / currentConfig.duration) * 100;

  return (
    <div className="text-center space-y-8">
      <div className="relative mx-auto w-64 h-64">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentConfig.color} opacity-20 animate-pulse`} />
        <div 
          className={`absolute inset-4 rounded-full bg-gradient-to-br ${currentConfig.color} transition-transform duration-1000 flex items-center justify-center backdrop-blur-lg border border-white/20`}
          style={{ 
            transform: phase === 'inhale' ? 'scale(1.1)' : phase === 'exhale' ? 'scale(0.9)' : 'scale(1)' 
          }}
        >
          <div className="text-white text-center">
            <div className="text-2xl font-bold">{currentConfig.label}</div>
            <div className="text-4xl font-bold mt-2">{remaining}</div>
          </div>
        </div>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
          />
          <circle
            cx="50%"
            cy="50%"
            r="120"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      
      <div className="space-y-4">
        <div className="text-white/80">Cicli completati: <span className="text-white font-bold">{cycle} / 5</span></div>
        <button
          onClick={() => setIsActive(!isActive)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2 mx-auto backdrop-blur-lg shadow-lg"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isActive ? 'Pausa' : 'Inizia'}
        </button>
      </div>
    </div>
  );
}

function ModernTimer({ duration, title }: { duration: number; title: string }) {
  const { sec, isRunning, setIsRunning } = useTick(duration);
  const progress = ((duration - sec) / duration) * 100;

  return (
    <div className="text-center space-y-8">
      <div className="relative mx-auto w-64 h-64">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20" />
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center backdrop-blur-lg border border-white/20">
          <div className="text-white text-center">
            <div className="text-6xl font-bold">{MMSS(sec)}</div>
            <div className="text-lg opacity-80 mt-2">{title}</div>
          </div>
        </div>
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="6"
          />
          <circle
            cx="50%"
            cy="50%"
            r="120"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      
      <button
        onClick={() => setIsRunning(!isRunning)}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2 mx-auto backdrop-blur-lg shadow-lg"
      >
        {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        {isRunning ? 'Pausa' : 'Inizia'}
      </button>
    </div>
  );
}

function VirtualWalkingCoach() {
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'preparation' | 'warmup' | 'steady_pace' | 'energetic' | 'mindful' | 'cooldown' | 'completed'>('preparation');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = 600; // 10 minuti

  // Fasi della camminata con timing e obiettivi
  const walkingPhases = {
    preparation: { start: 0, end: 60, title: "Preparazione", color: "from-blue-400 to-cyan-500", icon: "🏃‍♂️" },
    warmup: { start: 60, end: 180, title: "Riscaldamento", color: "from-green-400 to-emerald-500", icon: "🌱" },
    steady_pace: { start: 180, end: 360, title: "Passo Costante", color: "from-orange-400 to-amber-500", icon: "⚡" },
    energetic: { start: 360, end: 480, title: "Ritmo Energico", color: "from-red-400 to-pink-500", icon: "🔥" },
    mindful: { start: 480, end: 540, title: "Camminata Mindful", color: "from-purple-400 to-indigo-500", icon: "🧘‍♀️" },
    cooldown: { start: 540, end: 600, title: "Defaticamento", color: "from-teal-400 to-cyan-500", icon: "🌊" },
    completed: { start: 600, end: 600, title: "Completato", color: "from-emerald-400 to-green-500", icon: "🏆" }
  };

  const getCurrentPhase = (time: number) => {
    for (const [key, phase] of Object.entries(walkingPhases)) {
      if (time >= phase.start && time < phase.end) {
        return key as keyof typeof walkingPhases;
      }
    }
    return 'completed';
  };

  const getCoachingMessage = (phase: keyof typeof walkingPhases, timeInPhase: number) => {
    const messages = {
      preparation: [
        "Benvenuto nel tuo allenamento di camminata personalizzato!",
        "Assicurati di avere scarpe comode e di essere idratato",
        "Questa camminata ti darà energia e chiarezza mentale",
        "Preparati a muoverti e a sentirti fantastico!"
      ],
      warmup: [
        "Inizia con un passo comodo e naturale",
        "Senti i tuoi muscoli che si scaldano gradualmente",
        "Respira profondamente e rilassa le spalle",
        "Il tuo corpo si sta preparando per l'attività"
      ],
      steady_pace: [
        "Trova il tuo ritmo ideale - sostenibile ma energico",
        "Sei nel flow! Mantieni questo passo costante",
        "Senti la forza nelle tue gambe e l'energia che cresce",
        "Ogni passo ti porta verso il tuo benessere",
        "Ottimo ritmo! Stai facendo un lavoro fantastico"
      ],
      energetic: [
        "Ora acceleriamo un po'! Aumenta il ritmo",
        "Senti l'energia che sale - sei più forte di quanto pensi!",
        "Pompa le braccia e mantieni il passo sostenuto",
        "Questa è la fase che brucia calorie e rinforza il cuore",
        "Forza! Solo qualche minuto di intensità in più"
      ],
      mindful: [
        "Ora rallenta e porta attenzione al momento presente",
        "Senti i tuoi piedi che toccano il suolo",
        "Nota i suoni intorno a te e il ritmo del respiro",
        "Questa è meditazione in movimento - mindfulness attiva"
      ],
      cooldown: [
        "Rallenta gradualmente e respira profondamente",
        "Senti il calore nel corpo e la soddisfazione del movimento",
        "Stai completando un'ottima sessione di attività fisica",
        "Il tuo corpo ti ringrazia per questa cura"
      ]
    };

    const phaseMessages = messages[phase];
    const messageIndex = Math.floor((timeInPhase / (walkingPhases[phase].end - walkingPhases[phase].start)) * phaseMessages.length);
    return phaseMessages[Math.min(messageIndex, phaseMessages.length - 1)];
  };

  // Simulazione conteggio passi
  useEffect(() => {
    if (isActive && currentPhase !== 'preparation' && currentPhase !== 'completed') {
      const stepsPerSecond = currentPhase === 'energetic' ? 2.2 : currentPhase === 'steady_pace' ? 2.0 : 1.8;
      setStepCount(prev => prev + stepsPerSecond);
    }
  }, [currentTime, isActive, currentPhase]);

  // Sistema achievements
  const checkAchievements = (time: number, steps: number) => {
    const newAchievements = [];
    
    if (time >= 180 && !achievements.includes('3min')) {
      newAchievements.push('3min');
      setCurrentMilestone('3 minuti completati! 🎯');
    }
    if (time >= 300 && !achievements.includes('5min')) {
      newAchievements.push('5min');
      setCurrentMilestone('Halfway hero! 🌟');
    }
    if (steps >= 1000 && !achievements.includes('1k_steps')) {
      newAchievements.push('1k_steps');
      setCurrentMilestone('1000 passi raggiunti! 👏');
    }
    if (time >= 480 && !achievements.includes('8min')) {
      newAchievements.push('8min');
      setCurrentMilestone('Quasi alla fine - sei fortissimo! 💪');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      setTimeout(() => setCurrentMilestone(null), 3000);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newPhase = getCurrentPhase(newTime);
          
          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);

            // Voice guidance per nuova fase
            if (audioEnabled && 'speechSynthesis' in window) {
              const message = getCoachingMessage(newPhase, 0);
              const utterance = new SpeechSynthesisUtterance(message);
              utterance.rate = 0.9;
              speechSynthesis.speak(utterance);
            }
          }

          checkAchievements(newTime, stepCount);

          if (newTime >= totalDuration) {
            setIsActive(false);
            setCurrentPhase('completed');
            return totalDuration;
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
  }, [isActive, currentPhase, audioEnabled, stepCount]);

  const togglePlay = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setCurrentTime(0);
    setCurrentPhase('preparation');
    setStepCount(0);
    setAchievements([]);
    setCurrentMilestone(null);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => (currentTime / totalDuration) * 100;
  const estimatedCalories = Math.round((currentTime / 60) * 4.5); // Stima calorie
  const currentPhaseData = walkingPhases[currentPhase];
  const timeInPhase = currentTime - currentPhaseData.start;
  const currentMessage = getCoachingMessage(currentPhase, timeInPhase);

  return (
    <div className="space-y-8">
      {/* Sfondo dinamico con effetti di movimento */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          {/* Particelle di movimento */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-8 bg-gradient-to-b ${currentPhaseData.color} rounded-full opacity-60`}
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${Math.random() * 100}%`,
                animation: isActive ? `moveRight ${2 + Math.random()}s linear infinite` : 'none',
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Visualizzazione centrale del cammino */}
      <div className="flex justify-center relative z-10">
        <div className="relative w-80 h-80">
          {/* Percorso di camminata */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20" />
          <div 
            className={`absolute inset-4 rounded-full bg-gradient-to-br ${currentPhaseData.color} opacity-80 backdrop-blur-lg border border-white/30 transition-all duration-1000 flex items-center justify-center shadow-2xl`}
            style={{
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              animation: isActive ? 'walkPulse 2s ease-in-out infinite' : 'none'
            }}
          >
            <div className="text-white text-center">
              <div className="text-6xl font-light mb-2">
                {currentPhaseData.icon}
              </div>
              <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
              <div className="text-sm opacity-80 mt-1">
                {currentPhaseData.title}
              </div>
            </div>
          </div>

          {/* Ring di progresso */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="150"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="150"
              fill="none"
              stroke="url(#walkGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 150}`}
              strokeDashoffset={`${2 * Math.PI * 150 * (1 - getProgressPercentage() / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="walkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#EF4444" />
              </linearGradient>
            </defs>
          </svg>

          {/* Walking person animation */}
          {isActive && (
            <div className="absolute top-4 right-4">
              <div 
                className="text-2xl"
                style={{
                  animation: 'walkBounce 0.6s ease-in-out infinite'
                }}
              >
                🚶‍♂️
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats dashboard */}
      <div className="grid grid-cols-3 gap-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-300">{Math.round(stepCount)}</div>
            <div className="text-xs text-white/60">Passi</div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-300">{estimatedCalories}</div>
            <div className="text-xs text-white/60">Calorie</div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-300">{achievements.length}</div>
            <div className="text-xs text-white/60">Achievement</div>
          </div>
        </div>
      </div>

      {/* Progress bar con milestone */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-sm text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span className="text-xs opacity-70">
            Coach Virtuale - {currentPhaseData.title}
          </span>
          <span>{formatTime(totalDuration)}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-lg overflow-hidden">
          <div 
            className={`bg-gradient-to-r ${currentPhaseData.color} h-3 rounded-full transition-all duration-1000 relative`}
            style={{ width: `${getProgressPercentage()}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Messaggio del coach */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 min-h-[120px] flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="text-lg leading-relaxed text-white mb-2">
            {currentMessage}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider">
            {currentPhaseData.title} • {Math.ceil((currentPhaseData.end - currentPhaseData.start - timeInPhase) / 60)} min rimanenti
          </div>
        </div>
      </div>

      {/* Achievement popup */}
      {currentMilestone && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-center font-bold">{currentMilestone}</div>
          </div>
        </div>
      )}

      {/* Controlli */}
      <div className="flex justify-center space-x-6 relative z-10">
        <button
          onClick={togglePlay}
          className={`group flex items-center justify-center w-16 h-16 bg-gradient-to-r ${currentPhaseData.color} text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl`}
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
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

      {/* Messaggio finale */}
      {currentPhase === 'completed' && (
        <div className="bg-green-500/10 border border-green-400/20 rounded-xl p-4 backdrop-blur-lg relative z-10">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <p className="text-green-200 text-sm font-medium mb-1">Camminata completata con successo!</p>
              <p className="text-green-200/80 text-sm">
                Hai completato {Math.round(stepCount)} passi e bruciato circa {estimatedCalories} calorie. Il tuo corpo e la tua mente ti ringraziano!
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes walkPulse {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
        }
        @keyframes moveRight {
          0% { transform: translateX(-100px) rotate(-45deg); }
          100% { transform: translateX(calc(100vw + 100px)) rotate(-45deg); }
        }
        @keyframes walkBounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

function HydrationGuide() {
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'observation' | 'first_sip' | 'mindful_drinking' | 'body_awareness' | 'integration' | 'completed'>('setup');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [droplets, setDroplets] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = 270; // 4.5 minuti

  // Fasi dell'esperienza di idratazione mindful
  const phases = {
    setup: { start: 0, end: 30, title: "Preparazione", icon: "🏺" },
    observation: { start: 30, end: 80, title: "Osservazione", icon: "👁️" },
    first_sip: { start: 80, end: 140, title: "Primo Contatto", icon: "💧" },
    mindful_drinking: { start: 140, end: 210, title: "Idratazione Consapevole", icon: "🌊" },
    body_awareness: { start: 210, end: 250, title: "Sensazioni Corporee", icon: "✨" },
    integration: { start: 250, end: 270, title: "Integrazione", icon: "🙏" },
    completed: { start: 270, end: 270, title: "Completato", icon: "🌟" }
  };

  const getCurrentPhase = (time: number) => {
    for (const [key, phase] of Object.entries(phases)) {
      if (time >= phase.start && time < phase.end) {
        return key as keyof typeof phases;
      }
    }
    return 'completed';
  };

  const getPhaseInstructions = (phase: keyof typeof phases, timeInPhase: number) => {
    const instructions = {
      setup: [
        "Benvenuto in questo momento di idratazione consapevole",
        "Prendi un bicchiere d'acqua fresca e trovati un posto comodo",
        "Questo non è solo bere acqua, è nutrire il tuo corpo con presenza"
      ],
      observation: [
        "Osserva l'acqua nel bicchiere. Nota la sua trasparenza cristallina",
        "Senti il peso del bicchiere nelle tue mani",
        "Guarda come la luce si riflette sulla superficie dell'acqua",
        "L'acqua è vita pura. Ogni goccia porta energia vitale"
      ],
      first_sip: [
        "Avvicina lentamente il bicchiere alle labbra",
        "Senti la freschezza dell'acqua che tocca le labbra",
        "Prendi il primo piccolo sorso e lascialo riposare in bocca",
        "Nota la temperatura, la purezza, la sensazione di freschezza",
        "Deglutisci lentamente, seguendo l'acqua che scende"
      ],
      mindful_drinking: [
        "Ora sincronizziamo il bere con il respiro",
        "Inspira profondamente, poi prendi un sorso durante l'espirazione",
        "Senti l'acqua che viaggia nel tuo corpo",
        "Ogni sorso è un atto di amore verso te stesso",
        "L'acqua si diffonde nelle cellule, portando vita e energia"
      ],
      body_awareness: [
        "Nota come il tuo corpo risponde all'idratazione",
        "Senti la freschezza che si diffonde nel petto",
        "Le tue cellule si risvegliano e ringraziano",
        "Il tuo corpo si sente più vitale e presente"
      ],
      integration: [
        "Prendi gli ultimi sorsi con gratitudine profonda",
        "Ringrazia l'acqua per aver nutrito il tuo corpo",
        "Porta questa consapevolezza nella tua giornata"
      ]
    };

    const phaseInstructions = instructions[phase];
    const instructionIndex = Math.floor((timeInPhase / (phases[phase].end - phases[phase].start)) * phaseInstructions.length);
    return phaseInstructions[Math.min(instructionIndex, phaseInstructions.length - 1)];
  };

  useEffect(() => {
    // Genera gocce animate
    const newDroplets = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setDroplets(newDroplets);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newPhase = getCurrentPhase(newTime);
          
          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);
            
            // Attiva respirazione durante la fase mindful_drinking
            if (newPhase === 'mindful_drinking') {
              setBreathingActive(true);
            } else {
              setBreathingActive(false);
            }

            // Voice guidance per nuova fase
            if (audioEnabled && 'speechSynthesis' in window) {
              const instruction = getPhaseInstructions(newPhase, 0);
              const utterance = new SpeechSynthesisUtterance(instruction);
              utterance.rate = 0.8;
              utterance.pitch = 0.9;
              speechSynthesis.speak(utterance);
            }
          }

          if (newTime >= totalDuration) {
            setIsActive(false);
            setCurrentPhase('completed');
            return totalDuration;
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
  }, [isActive, currentPhase, audioEnabled]);

  const togglePlay = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setIsActive(false);
    setCurrentTime(0);
    setCurrentPhase('setup');
    setBreathingActive(false);
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => (currentTime / totalDuration) * 100;

  const currentPhaseData = phases[currentPhase];
  const timeInPhase = currentTime - currentPhaseData.start;
  const currentInstruction = getPhaseInstructions(currentPhase, timeInPhase);

  // Calcola parallax mouse per effetto acqua
  const mouseParallaxX = typeof window !== 'undefined' 
    ? (mousePosition.x - window.innerWidth / 2) * 0.01 
    : 0;
  const mouseParallaxY = typeof window !== 'undefined'
    ? (mousePosition.y - window.innerHeight / 2) * 0.01 
    : 0;

  return (
    <div className="space-y-8">
      {/* Effetti di sfondo dinamici - acqua */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                rgba(6, 182, 212, 0.2) 0%, 
                transparent 50%),
              radial-gradient(circle at 30% 70%, rgba(14, 165, 233, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 70% 30%, rgba(56, 189, 248, 0.1) 0%, transparent 40%)
            `
          }}
        />
        
        {/* Gocce d'acqua animate */}
        {droplets.map((droplet) => (
          <div
            key={droplet.id}
            className="absolute w-2 h-2 bg-cyan-300 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${droplet.x}%`,
              top: `${droplet.y}%`,
              animationDelay: `${droplet.delay}s`,
              animationDuration: '4s',
              transform: `translate(${mouseParallaxX * (droplet.id % 3)}px, ${mouseParallaxY * (droplet.id % 3)}px)`
            }}
          />
        ))}

        {/* Onde di acqua */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10">
          <div 
            className="absolute inset-0 bg-gradient-to-t from-cyan-500 to-transparent"
            style={{
              animation: 'wave 6s ease-in-out infinite',
              transform: `translateY(${mouseParallaxY * 2}px)`
            }}
          />
        </div>
      </div>

      {/* Visualizzazione centrale */}
      <div className="flex justify-center relative z-10">
        <div 
          className="relative w-80 h-80"
          style={{
            transform: `translate(${mouseParallaxX * 2}px, ${mouseParallaxY * 2}px)`
          }}
        >
          {/* Cerchi concentrici come onde d'acqua */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-300/30 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-4 rounded-full border border-cyan-400/20 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-8 rounded-full border border-cyan-500/10 animate-pulse" style={{ animationDuration: '5s' }} />
          
          {/* Contenitore principale - bicchiere d'acqua stilizzato */}
          <div 
            className={`absolute inset-12 rounded-full bg-gradient-to-br from-cyan-400/60 to-blue-500/60 backdrop-blur-lg border border-white/30 transition-all duration-1000 flex items-center justify-center shadow-2xl ${
              isActive ? 'shadow-[0_0_60px_rgba(6,182,212,0.4)]' : 'shadow-[0_0_30px_rgba(6,182,212,0.2)]'
            }`}
            style={{
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              animation: breathingActive ? 'waterFlow 4s ease-in-out infinite' : 'none'
            }}
          >
            <div className="text-white text-center">
              <div className="text-6xl font-light mb-2">
                {currentPhaseData.icon}
              </div>
              <div className="text-lg font-medium">{formatTime(currentTime)}</div>
              <div className="text-sm opacity-80 mt-1">
                {currentPhaseData.title}
              </div>
            </div>
          </div>

          {/* Ring di progresso come cerchi d'acqua */}
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
              stroke="url(#waterGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 150}`}
              strokeDashoffset={`${2 * Math.PI * 150 * (1 - getProgressPercentage() / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Animazione di respirazione durante fase mindful */}
      {breathingActive && (
        <div className="flex justify-center relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-center text-cyan-200 text-sm mb-4">Sincronizza il bere con il respiro</p>
            <div className="flex justify-center">
              <div 
                className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                style={{
                  animation: 'breatheWater 4s ease-in-out infinite'
                }}
              >
                <span className="text-white text-xl">💧</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar fluida */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-sm text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span className="text-xs opacity-70">
            Idratazione mindful - {currentPhaseData.title}
          </span>
          <span>{formatTime(totalDuration)}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-lg overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 relative"
            style={{ width: `${getProgressPercentage()}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      {/* Istruzione corrente */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 min-h-[120px] flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="text-lg leading-relaxed text-cyan-200 mb-2">
            {currentInstruction}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider">
            {currentPhaseData.title} • {Math.ceil((currentPhaseData.end - currentPhaseData.start - timeInPhase) / 60)} min rimanenti
          </div>
        </div>
      </div>

      {/* Controlli */}
      <div className="flex justify-center space-x-6 relative z-10">
        <button
          onClick={togglePlay}
          className="group flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl"
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
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

      {/* Indicatori di fase */}
      <div className="text-center relative z-10">
        <div className="flex justify-center space-x-2 mb-3">
          {Object.keys(phases).filter(p => p !== 'completed').map((phaseKey, i) => (
            <div
              key={phaseKey}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                phaseKey === currentPhase ? 'bg-gradient-to-r from-cyan-400 to-blue-500 scale-150' : 
                Object.keys(phases).indexOf(currentPhase) > i ? 'bg-cyan-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-white/60">
          {currentPhase === 'setup' && 'Preparati per un momento di connessione con l\'acqua'}
          {currentPhase === 'observation' && 'Osserva e apprezza la purezza dell\'acqua'}
          {currentPhase === 'first_sip' && 'Assapora consapevolmente ogni sensazione'}
          {currentPhase === 'mindful_drinking' && 'Unisci respiro e idratazione in armonia'}
          {currentPhase === 'body_awareness' && 'Senti l\'energia vitale che si diffonde'}
          {currentPhase === 'integration' && 'Integra questa consapevolezza nella giornata'}
          {currentPhase === 'completed' && 'Esperienza completata con successo'}
        </p>
      </div>

      {/* Messaggio finale */}
      {currentPhase === 'completed' && (
        <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4 backdrop-blur-lg relative z-10">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🌟</div>
            <div>
              <p className="text-cyan-200 text-sm font-medium mb-1">Idratazione mindful completata</p>
              <p className="text-cyan-200/80 text-sm">
                Hai trasformato un semplice gesto quotidiano in un momento di presenza e cura di te. Porta questa consapevolezza nel resto della giornata.
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes waterFlow {
          0%, 100% { transform: scale(1.05) rotate(0deg); }
          50% { transform: scale(1.1) rotate(2deg); }
        }
        @keyframes breatheWater {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}

function StretchingGuide() {
  const [currentStretch, setCurrentStretch] = useState(0);
  const stretches = [
    { name: "Collo laterale", duration: 15, description: "Inclina la testa a destra, tieni 15 secondi" },
    { name: "Collo sinistra", duration: 15, description: "Inclina la testa a sinistra, tieni 15 secondi" },
    { name: "Spalle su", duration: 10, description: "Alza le spalle verso le orecchie, rilascia" },
    { name: "Braccia dietro", duration: 20, description: "Intreccia le dita dietro la schiena, allunga" },
    { name: "Busto torsione", duration: 15, description: "Ruota dolcemente il busto a destra" },
    { name: "Busto sinistra", duration: 15, description: "Ruota dolcemente il busto a sinistra" }
  ];

  const { sec, isRunning, setIsRunning } = useTick(stretches[currentStretch].duration);

  const nextStretch = () => {
    if (currentStretch < stretches.length - 1) {
      setCurrentStretch(currentStretch + 1);
      setIsRunning(false);
    }
  };

  return (
    <div className="text-center space-y-8">
      <div className="mx-auto w-64 h-64 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/20 shadow-lg">
        <div className="text-white text-center">
          <Activity className="w-16 h-16 mx-auto mb-4" />
          <div className="text-2xl font-bold">{sec}s</div>
          <div className="text-sm opacity-80">{currentStretch + 1}/{stretches.length}</div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg border border-white/20">
        <h3 className="text-white text-xl font-bold mb-2">{stretches[currentStretch].name}</h3>
        <p className="text-white/80">{stretches[currentStretch].description}</p>
      </div>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pausa' : 'Inizia'}
        </button>
        {currentStretch < stretches.length - 1 && (
          <button
            onClick={nextStretch}
            className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-lg border border-white/20"
          >
            Prossimo
          </button>
        )}
      </div>
    </div>
  );
}

function DeepBreathingGuide() {
  const [breathCount, setBreatheCount] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  
  const startBreath = () => {
    setIsBreathing(true);
    setTimeout(() => {
      setIsBreathing(false);
      setBreatheCount(prev => prev + 1);
    }, 6000);
  };

  return (
    <div className="text-center space-y-8">
      <div className="mx-auto w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/20 shadow-lg">
        <div className="text-white text-center">
          <Heart className="w-16 h-16 mx-auto mb-4" />
          <div className="text-2xl font-bold">{breathCount}/3</div>
          <div className="text-sm opacity-80">Respiri profondi</div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg border border-white/20">
        <p className="text-white text-lg">
          {isBreathing ? "Inspira profondamente... ed espira lentamente" : "Clicca per iniziare un respiro profondo"}
        </p>
      </div>
      
      <button
        onClick={startBreath}
        disabled={isBreathing || breathCount >= 3}
        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50 shadow-lg"
      >
        {breathCount >= 3 ? 'Completato' : isBreathing ? 'Respira...' : 'Respiro Profondo'}
      </button>
    </div>
  );
}

export default function ModernSuggestionDetail() {
  const params = useParams();
  const key = String(params?.key ?? '');
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const tutorialConfig = useMemo(() => {
    switch (key) {
      case 'breathing-478':
        return {
          title: 'Respirazione 4-7-8',
          description: '5 cicli guidati per ridurre lo stress',
          icon: <Brain className="w-8 h-8" />,
          color: 'from-blue-500 to-purple-600',
          component: <ModernBreathing478 />
        };
      case '5min-meditation':
        return {
          title: 'Meditazione Guidata',
          description: 'Sessione personalizzata con istruzioni progressive',
          icon: <Moon className="w-8 h-8" />,
          color: 'from-indigo-500 to-purple-600',
          component: <GuidedMeditationSystem />
        };
      case '10min-walk':
        return {
          title: 'Camminata 10 minuti',
          description: 'Cammina a passo svelto all\'aria aperta',
          icon: <Activity className="w-8 h-8" />,
          color: 'from-green-500 to-teal-600',
          component: <ModernTimer duration={600} title="Cammina" />
        };
      case 'mindful-hydration':
        return {
          title: 'Idratazione mindful',
          description: 'Bevi consapevolmente un bicchiere d\'acqua',
          icon: <Zap className="w-8 h-8" />,
          color: 'from-cyan-500 to-blue-600',
          component: <HydrationGuide />
        };
      case 'light-stretching':
        return {
          title: 'Stretching leggero',
          description: 'Sequenza guidata di allungamenti',
          icon: <Activity className="w-8 h-8" />,
          color: 'from-green-500 to-teal-600',
          component: <StretchingGuide />
        };
      case 'deep-breathing':
        return {
          title: 'Respirazione profonda',
          description: 'Tre respiri profondi per rilassarti',
          icon: <Heart className="w-8 h-8" />,
          color: 'from-purple-500 to-pink-600',
          component: <DeepBreathingGuide />
        };
      default:
        return {
          title: 'Suggerimento',
          description: 'Tutorial non disponibile',
          icon: <Brain className="w-8 h-8" />,
          color: 'from-gray-500 to-gray-600',
          component: <div className="text-white text-center py-12">Tutorial non ancora implementato</div>
        };
    }
  }, [key]);

  const markCompleted = async () => {
    setSaving(true);
    setMsg(null);
    
    try {
      // TODO: Qui collegare all'API per salvare il completamento
      // await fetch('/api/activity/complete', { ... })
      
      setMsg('Attività completata!');
      setTimeout(() => router.push('/suggestions'), 1500);
    } catch (e: any) {
      setMsg('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LifeOS
            </Link>
            <Link 
              href="/suggestions"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Torna ai consigli
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${tutorialConfig.color} rounded-2xl mb-6 shadow-lg backdrop-blur-lg border border-white/20`}>
            {tutorialConfig.icon}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{tutorialConfig.title}</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">{tutorialConfig.description}</p>
        </div>

        {/* Tutorial Component */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 mb-8 shadow-2xl relative">
          {tutorialConfig.component}
        </div>

        {/* Completion Section */}
        <div className="text-center space-y-6">
          <button
            onClick={markCompleted}
            disabled={saving}
            className={`bg-gradient-to-r ${tutorialConfig.color} text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-3 mx-auto shadow-lg backdrop-blur-lg border border-white/20`}
          >
            <CheckCircle className="w-6 h-6" />
            {saving ? 'Salvando...' : 'Segna come completato'}
          </button>
          
          {msg && (
            <div className={`text-center p-4 rounded-xl backdrop-blur-lg border ${
              msg.includes('completata') 
                ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                : 'bg-red-500/20 text-red-300 border-red-400/30'
            }`}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
