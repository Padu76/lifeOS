import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface VirtualWalkingCoachProps {
  onComplete?: () => void;
}

export const VirtualWalkingCoach = ({ onComplete }: VirtualWalkingCoachProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'preparation' | 'warmup' | 'steady_pace' | 'energetic' | 'mindful' | 'cooldown' | 'completed'>('preparation');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = 600; // 10 minuti

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
      ],
      completed: [
        "Congratulazioni! Hai completato la tua camminata!"
      ]
    };

    const phaseMessages = messages[phase];
    const messageIndex = Math.floor((timeInPhase / (walkingPhases[phase].end - walkingPhases[phase].start)) * phaseMessages.length);
    return phaseMessages[Math.min(messageIndex, phaseMessages.length - 1)];
  };

  useEffect(() => {
    if (isActive && currentPhase !== 'preparation' && currentPhase !== 'completed') {
      const stepsPerSecond = currentPhase === 'energetic' ? 2.2 : currentPhase === 'steady_pace' ? 2.0 : 1.8;
      setStepCount(prev => prev + stepsPerSecond);
    }
  }, [currentTime, isActive, currentPhase]);

  const checkAchievements = (time: number, steps: number) => {
    const newAchievements: string[] = [];
    
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
  }, [isActive, currentPhase, audioEnabled, stepCount, onComplete]);

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
  const estimatedCalories = Math.round((currentTime / 60) * 4.5);
  const currentPhaseData = walkingPhases[currentPhase];
  const timeInPhase = currentTime - currentPhaseData.start;
  const currentMessage = getCoachingMessage(currentPhase, timeInPhase);

  return (
    <div className="space-y-8">
      {/* Sfondo dinamico con effetti di movimento */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
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
};
