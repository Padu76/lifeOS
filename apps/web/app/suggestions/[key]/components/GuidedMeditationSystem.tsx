import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Brain, Heart } from 'lucide-react';
import { getMeditationScript, mockUserProfile, MeditationStep } from '../utils/meditation-scripts';

interface GuidedMeditationSystemProps {
  onComplete?: () => void;
}

export const GuidedMeditationSystem = ({ onComplete }: GuidedMeditationSystemProps) => {
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
            onComplete?.();
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
  }, [isPlaying, meditationScript, currentInstruction, audioEnabled, duration, onComplete]);

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
};
