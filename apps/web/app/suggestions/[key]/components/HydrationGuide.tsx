'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Droplets, Settings } from 'lucide-react';

// TTS Types inline
interface TTSConfig {
  voice?: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

interface TTSState {
  isSupported: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  availableVoices: SpeechSynthesisVoice[];
  error: string | null;
  userHasInteracted: boolean;
}

const DEFAULT_TTS_CONFIG: TTSConfig = {
  voice: null,
  rate: 0.8,
  pitch: 1.0,
  volume: 0.8,
  lang: 'it-IT'
};

// TTS Hook inline
const useTTSInline = (initialConfig: Partial<TTSConfig> = {}) => {
  const [config, setConfig] = useState<TTSConfig>({ ...DEFAULT_TTS_CONFIG, ...initialConfig });
  const [state, setState] = useState<TTSState>({
    isSupported: false,
    isLoading: false,
    isPlaying: false,
    isPaused: false,
    currentText: '',
    availableVoices: [],
    error: null,
    userHasInteracted: false
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize TTS support and voices
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      
      setState(prev => ({ 
        ...prev, 
        isSupported,
        error: isSupported ? null : 'Text-to-Speech non supportato su questo dispositivo'
      }));

      if (isSupported) {
        loadVoices();
      }
    };

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      
      if (voices.length === 0) {
        return;
      }
      
      setState(prev => ({ ...prev, availableVoices: voices }));

      if (config.voice) {
        return;
      }

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('iOS Voices loading attempt, found:', voices.length);
        console.log('iOS Voices available:', voices.map(v => `${v.name} (${v.lang})`));
      }

      let preferredVoice: SpeechSynthesisVoice | undefined;
      
      if (isIOS) {
        const candidates = [
          voices.find(voice => voice.name.toLowerCase().includes('alice') && voice.lang === 'it-IT'),
          voices.find(voice => voice.name.toLowerCase().includes('alice')),
          voices.find(voice => voice.lang === 'it-IT' && !voice.name.toLowerCase().includes('en')),
          voices.find(voice => voice.lang.startsWith('it-') && !voice.name.toLowerCase().includes('en')),
          voices.find(voice => voice.lang.startsWith('it')),
          voices.find(voice => voice.name.toLowerCase().includes('italian'))
        ];
        
        preferredVoice = candidates.find(voice => voice !== undefined);
        
        if (preferredVoice) {
          console.log('iOS Auto-selecting voice:', preferredVoice.name, preferredVoice.lang);
          setConfig(prev => ({ ...prev, voice: preferredVoice }));
        } else {
          console.log('iOS No Italian voice found, available:', voices.slice(0, 5).map(v => `${v.name} (${v.lang})`));
        }
      } else {
        preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('google') && voice.lang.startsWith('it')
        );
        
        if (!preferredVoice) {
          preferredVoice = voices.find(voice => 
            voice.lang === 'it-IT' || voice.lang.startsWith('it')
          );
        }
        
        if (preferredVoice) {
          setConfig(prev => ({ ...prev, voice: preferredVoice }));
        }
      }
    };

    checkSupport();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const intervals = [100, 300, 500, 1000, 2000];
      intervals.forEach(delay => {
        setTimeout(() => {
          console.log(`iOS voice loading attempt after ${delay}ms`);
          loadVoices();
        }, delay);
      });
    }

    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  const markUserInteraction = useCallback(() => {
    setState(prev => ({ ...prev, userHasInteracted: true }));
  }, []);

  const createUtterance = useCallback((text: string): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.voice = config.voice || null;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;
    utterance.lang = config.lang;

    return utterance;
  }, [config]);

  const speakText = useCallback((
    text: string, 
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    }
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!state.isSupported) {
        const error = 'Text-to-Speech non supportato';
        callbacks?.onError?.(error);
        reject(new Error(error));
        return;
      }

      if (!state.userHasInteracted) {
        const error = 'Interazione utente richiesta. Tocca un pulsante per iniziare.';
        setState(prev => ({ ...prev, error }));
        callbacks?.onError?.(error);
        reject(new Error(error));
        return;
      }

      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        currentText: text,
        error: null 
      }));

      const utterance = createUtterance(text);
      utteranceRef.current = utterance;

      utterance.onstart = () => {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isPlaying: true,
          isPaused: false 
        }));
        callbacks?.onStart?.();
      };

      utterance.onend = () => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: false,
          isPaused: false,
          currentText: '' 
        }));
        callbacks?.onEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        const errorMsg = `TTS Error: ${event.error}`;
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isPlaying: false,
          isPaused: false,
          error: errorMsg 
        }));
        callbacks?.onError?.(errorMsg);
        reject(new Error(errorMsg));
      };

      utterance.onpause = () => {
        setState(prev => ({ ...prev, isPaused: true }));
      };

      utterance.onresume = () => {
        setState(prev => ({ ...prev, isPaused: false }));
      };

      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'TTS failed to start';
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          error: errorMsg 
        }));
        callbacks?.onError?.(errorMsg);
        reject(new Error(errorMsg));
      }
    });
  }, [state.isSupported, state.userHasInteracted, createUtterance]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setState(prev => ({ 
      ...prev, 
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentText: '' 
    }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<TTSConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const speakHydrationInstruction = useCallback(async (
    instruction: string,
    onComplete?: () => void
  ) => {
    await speakText(instruction, {
      onEnd: onComplete
    });
  }, [speakText]);

  return {
    ...state,
    config,
    speak: speakText,
    stop,
    markUserInteraction,
    updateConfig,
    speakHydrationInstruction,
    canSpeak: state.isSupported && state.userHasInteracted,
    isActive: state.isPlaying || state.isLoading
  };
};

interface HydrationGuideProps {
  onComplete?: () => void;
}

export const HydrationGuide = ({ onComplete }: HydrationGuideProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'observation' | 'first_sip' | 'mindful_drinking' | 'body_awareness' | 'integration' | 'completed'>('setup');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [droplets, setDroplets] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);
  
  // TTS Integration
  const {
    speakHydrationInstruction,
    markUserInteraction,
    canSpeak,
    isActive: ttsIsActive,
    stop: stopTTS,
    config,
    updateConfig,
    availableVoices,
    error: ttsError
  } = useTTSInline();

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

            if (audioEnabled && canSpeak) {
              const instruction = getPhaseInstructions(newPhase, 0);
              speakHydrationInstruction(instruction);
            }
          }

          if (newTime >= totalDuration) {
            setIsActive(false);
            setCurrentPhase('completed');
            stopTTS();
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
  }, [isActive, currentPhase, audioEnabled, onComplete, canSpeak, speakHydrationInstruction, stopTTS]);

  const togglePlay = () => {
    markUserInteraction();
    setIsActive(!isActive);
    
    if (isActive) {
      stopTTS();
    }
  };

  const reset = () => {
    setIsActive(false);
    setCurrentTime(0);
    setCurrentPhase('setup');
    setBreathingActive(false);
    stopTTS();
  };

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
    if (!audioEnabled) {
      markUserInteraction();
    }
  }, [audioEnabled, markUserInteraction]);

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

      {/* Header con controlli audio */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="w-20" />
        <h2 className="text-2xl font-bold text-white">Idratazione Consapevole</h2>
        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg font-semibold hover:scale-105 transition-transform 
                       ${audioEnabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}
            title={audioEnabled ? 'Audio abilitato' : 'Audio disabilitato'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-600 text-white p-2 rounded-lg font-semibold hover:scale-105 transition-transform"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audio Warning for iOS */}
      {!canSpeak && audioEnabled && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6 relative z-10">
          <p className="text-yellow-200 text-sm text-center">
            Tocca "Play" per abilitare le istruzioni vocali guidate
          </p>
        </div>
      )}

      {/* TTS Error */}
      {ttsError && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 relative z-10">
          <p className="text-red-200 text-sm text-center">{ttsError}</p>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 relative z-10">
          <h3 className="text-white text-lg font-semibold mb-4">Impostazioni Guidate</h3>
          
          {/* Voice Selection */}
          {audioEnabled && availableVoices.length > 0 && (
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Voce Guida
              </label>
              <select
                value={config.voice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  updateConfig({ voice });
                }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              >
                <option value="">Voce predefinita</option>
                {availableVoices
                  .filter(voice => voice.lang.startsWith('it') || voice.lang.startsWith('en'))
                  .map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speech Rate */}
          {audioEnabled && (
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Velocità voce: {config.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={config.rate}
                onChange={(e) => updateConfig({ rate: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-white/60 text-xs mt-1">Velocità più lenta per maggiore rilassamento</p>
            </div>
          )}
        </div>
      )}

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
          
          {audioEnabled && (
            <div className="mt-4 p-3 bg-cyan-500/20 rounded-lg">
              <p className="text-cyan-200 text-sm">
                Le istruzioni vocali ti guideranno attraverso ogni fase
              </p>
            </div>
          )}
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
      </div>

      {/* Messaggio di completamento */}
      {currentPhase === 'completed' && (
        <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-xl p-4 backdrop-blur-lg relative z-10">
          <div className="flex items-start gap-3">
            <Droplets className="w-5 h-5 text-cyan-300 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-cyan-200 text-sm font-medium mb-1">Idratazione mindful completata</p>
              <p className="text-cyan-200/80 text-sm mb-4">
                Hai nutrito il tuo corpo con consapevolezza. Nota come ti senti più vitale e presente.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 text-sm"
                >
                  Ripeti Esperienza
                </button>
                
                <a
                  href="/suggestions"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 text-sm"
                >
                  Altre Suggestions
                </a>
                
                <a
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:scale-105 transition-transform text-sm"
                >
                  Dashboard
                </a>
              </div>
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