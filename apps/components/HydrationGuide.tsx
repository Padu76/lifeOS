import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Droplets } from 'lucide-react';

interface HydrationGuideProps {
  onComplete?: () => void;
}

export const HydrationGuide = ({ onComplete }: HydrationGuideProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'observation' | 'first_sip' | 'mindful_drinking' | 'body_awareness' | 'integration' | 'completed'>('setup');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [droplets, setDroplets] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = 270; // 4.5 minuti

  const phases = {
    setup: { start: 0, end: 30, title: "Preparazione", icon: "🥤" },
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
      ],
      completed: [
        "Esperienza di idratazione consapevole completata"
      ]
    };

    const phaseInstructions = instructions[phase];
    const instructionIndex = Math.floor((timeInPhase / (phases[phase].end - phases[phase].start)) * phaseInstructions.length);
    return phaseInstructions[Math.min(instructionIndex, phaseInstructions.length - 1)];
  };

  useEffect(() => {
    const newDroplets = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3
    }));
    setDroplets(newDroplets);

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
            
            if (newPhase === 'mindful_drinking') {
              setBreathingActive(true);
            } else {
              setBreathingActive(false);
            }

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
            onComplete?.();
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
  }, [isActive, currentPhase, audioEnabled, onComplete]);

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

      {/* Progress bar */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between text-sm text-white/60">
          <span>{formatTime(currentTime)}</span>
          <span className="text-xs opacity-70">
            Idratazione Mindful - {currentPhaseData.title}
          </span>
          <span>{formatTime(totalDuration)}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-lg">
          <div 
            className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Istruzioni correnti */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 min-h-[120px] flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="text-lg leading-relaxed text-cyan-200 mb-2">
            {currentInstruction}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider">
            {currentPhaseData.title}
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

      {/* Messaggio di completamento */}
      {currentPhase === 'completed' && (
        <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4 backdrop-blur-lg relative z-10">
          <div className="flex items-start gap-3">
            <Droplets className="w-5 h-5 text-cyan-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-cyan-200 text-sm font-medium mb-1">Idratazione mindful completata</p>
              <p className="text-cyan-200/80 text-sm">
                Hai nutrito il tuo corpo con consapevolezza. Nota come ti senti più vitale e presente.
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
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};
