import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface ModernBreathing478Props {
  onComplete?: () => void;
}

export const ModernBreathing478 = ({ onComplete }: ModernBreathing478Props) => {
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
          if (cycle >= 4) {
            setIsActive(false);
            onComplete?.();
          }
        }
      }
    }, 1000);
    return () => clearInterval(t);
  }, [phase, isActive, cycle, onComplete]);

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
};
