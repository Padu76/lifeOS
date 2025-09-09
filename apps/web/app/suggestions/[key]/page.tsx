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

// Simulazione dei dati utente (da collegare al vero sistema)
const mockUserProfile = {
  stressLevel: 'high',
  energyLevel: 'low', 
  experienceLevel: 'beginner',
  timeOfDay: 'evening',
  preferredStyle: 'breathing-focused'
};

// Script di meditazione personalizzati
const getMeditationScript = (profile, duration) => {
  const scripts = {
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
    ]
  };

  const key = `${profile.stressLevel}_${profile.experienceLevel}` in scripts ? 
    `${profile.stressLevel}_${profile.experienceLevel}` : 
    `${profile.energyLevel}_${profile.timeOfDay}`;
    
  return scripts[key] || scripts.high_stress_beginner;
};

function GuidedMeditationSystem() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(300); // 5 minuti
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [meditationScript, setMeditationScript] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [phase, setPhase] = useState('setup'); // setup, active, completed
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const intervalRef = useRef(null);

  useEffect(() => {
    // Genera script personalizzato basato sul profilo
    const script = getMeditationScript(mockUserProfile, duration);
    setMeditationScript(script);
    setCurrentInstruction(script[0]);

    // Mouse tracking per effetti parallax
    const handleMouseMove = (e) => {
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
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => (currentTime / duration) * 100;

  const getInstructionStyle = (type) => {
    const styles = {
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
          {phase === 'completed' && 'Sessione completata - Ben fatto! 🎉'}
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

function HydrationGuide() {
  const [step, setStep] = useState(0);
  const steps = [
    "Prendi un bicchiere d'acqua fresca",
    "Siediti comodamente e rilassati",
    "Osserva l'acqua per alcuni secondi",
    "Porta il bicchiere alle labbra lentamente",
    "Bevi piccoli sorsi consapevoli",
    "Senti l'acqua che rinfresca il corpo",
    "Completa l'idratazione mindful"
  ];

  return (
    <div className="text-center space-y-8">
      <div className="mx-auto w-64 h-64 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center backdrop-blur-lg border border-white/20 shadow-lg">
        <div className="text-white text-center">
          <Zap className="w-16 h-16 mx-auto mb-4" />
          <div className="text-xl font-bold">Passo {step + 1}/7</div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg border border-white/20">
        <p className="text-white text-lg">{steps[step]}</p>
      </div>
      
      <div className="flex gap-4 justify-center">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors backdrop-blur-lg border border-white/20"
          >
            Indietro
          </button>
        )}
        <button
          onClick={() => setStep(Math.min(step + 1, steps.length - 1))}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          {step === steps.length - 1 ? 'Completato' : 'Avanti'}
        </button>
      </div>
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
      
      setMsg('Attività completata! 🎉');
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
