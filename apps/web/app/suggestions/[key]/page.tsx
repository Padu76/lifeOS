'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Play, Pause, CheckCircle, Clock, Zap, Brain, Moon, Heart, Activity } from 'lucide-react';
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
          className={`absolute inset-4 rounded-full bg-gradient-to-br ${currentConfig.color} transition-transform duration-1000 flex items-center justify-center`}
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
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
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
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
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
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
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
      <div className="mx-auto w-64 h-64 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
        <div className="text-white text-center">
          <Zap className="w-16 h-16 mx-auto mb-4" />
          <div className="text-xl font-bold">Passo {step + 1}/7</div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg">
        <p className="text-white text-lg">{steps[step]}</p>
      </div>
      
      <div className="flex gap-4 justify-center">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            Indietro
          </button>
        )}
        <button
          onClick={() => setStep(Math.min(step + 1, steps.length - 1))}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform"
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
      <div className="mx-auto w-64 h-64 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center">
        <div className="text-white text-center">
          <Activity className="w-16 h-16 mx-auto mb-4" />
          <div className="text-2xl font-bold">{sec}s</div>
          <div className="text-sm opacity-80">{currentStretch + 1}/{stretches.length}</div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg">
        <h3 className="text-white text-xl font-bold mb-2">{stretches[currentStretch].name}</h3>
        <p className="text-white/80">{stretches[currentStretch].description}</p>
      </div>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:scale-105 transition-transform flex items-center gap-2"
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isRunning ? 'Pausa' : 'Inizia'}
        </button>
        {currentStretch < stretches.length - 1 && (
          <button
            onClick={nextStretch}
            className="bg-white/20 text-white px-6 py-2 rounded-lg hover:bg-white/30 transition-colors"
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
      <div className="mx-auto w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
        <div className="text-white text-center">
          <Heart className="w-16 h-16 mx-auto mb-4" />
          <div className="text-2xl font-bold">{breathCount}/3</div>
          <div className="text-sm opacity-80">Respiri profondi</div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-xl p-6 backdrop-blur-lg">
        <p className="text-white text-lg">
          {isBreathing ? "Inspira profondamente... ed espira lentamente" : "Clicca per iniziare un respiro profondo"}
        </p>
      </div>
      
      <button
        onClick={startBreath}
        disabled={isBreathing || breathCount >= 3}
        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform disabled:opacity-50"
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
          title: 'Meditazione 5 minuti',
          description: 'Siediti comodamente e segui il respiro',
          icon: <Moon className="w-8 h-8" />,
          color: 'from-indigo-500 to-purple-600',
          component: <ModernTimer duration={300} title="Medita" />
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
      // Simplified completion - just show success and return
      setMsg('Attività completata! 🎉');
      setTimeout(() => router.push('/suggestions'), 1500);
    } catch (e: any) {
      setMsg('Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${tutorialConfig.color} rounded-full mb-6`}>
            {tutorialConfig.icon}
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">{tutorialConfig.title}</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">{tutorialConfig.description}</p>
        </div>

        {/* Tutorial Component */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 mb-8">
          {tutorialConfig.component}
        </div>

        {/* Completion Section */}
        <div className="text-center space-y-4">
          <button
            onClick={markCompleted}
            disabled={saving}
            className={`bg-gradient-to-r ${tutorialConfig.color} text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-3 mx-auto`}
          >
            <CheckCircle className="w-6 h-6" />
            {saving ? 'Salvando...' : 'Segna come completato'}
          </button>
          
          {msg && (
            <div className={`text-center p-4 rounded-lg ${msg.includes('completata') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
