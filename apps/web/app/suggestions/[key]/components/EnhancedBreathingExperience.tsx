'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, Shield, Wind, Zap, Heart, Brain, Volume2, VolumeX, Settings } from 'lucide-react';
import { MMSS } from '../utils/browser-utils';

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
  rate: 0.9,
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

  const speakBreathingPhase = useCallback(async (
    phase: string,
    duration: number,
    technique: string,
    onPhaseComplete?: () => void
  ) => {
    const phaseInstructions: { [key: string]: string } = {
      'Inspira': `Inspira per ${duration} secondi`,
      'Trattieni': `Trattieni il respiro per ${duration} secondi`,
      'Espira': `Espira per ${duration} secondi`,
      'Pausa': `Pausa per ${duration} secondi`,
      'Doppia Inspira': `Fai una doppia inspirazione`,
      'Lunga Espira': `Espira lentamente per ${duration} secondi`,
      'Inspira Veloce': `Inspira velocemente per ${duration} secondi`,
      'Espira Veloce': `Espira velocemente per ${duration} secondi`
    };

    const instruction = phaseInstructions[phase] || `${phase} per ${duration} secondi`;

    await speakText(instruction, {
      onEnd: onPhaseComplete
    });
  }, [speakText]);

  return {
    ...state,
    config,
    speak: speakText,
    stop,
    markUserInteraction,
    updateConfig,
    speakBreathingPhase,
    canSpeak: state.isSupported && state.userHasInteracted,
    isActive: state.isPlaying || state.isLoading
  };
};

interface EnhancedBreathingExperienceProps {
  onComplete?: () => void;
}

export const EnhancedBreathingExperience = ({ onComplete }: EnhancedBreathingExperienceProps) => {
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [count, setCount] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [duration, setDuration] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // TTS Integration
  const {
    speakBreathingPhase,
    markUserInteraction,
    canSpeak,
    isActive: ttsIsActive,
    stop: stopTTS,
    config,
    updateConfig,
    availableVoices,
    error: ttsError
  } = useTTSInline();

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
      description: 'Respirazione energizzante per vitalita',
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
      stopTTS();
      onComplete?.();
    }
  }, [breathCount, duration, isActive, onComplete, stopTTS]);

  // Speak phase instructions
  useEffect(() => {
    if (!isActive || !selectedTechnique || !audioEnabled || !canSpeak) return;

    const technique = breathingTechniques[selectedTechnique as keyof typeof breathingTechniques];
    const currentPhaseIndex = ['inhale', 'hold1', 'exhale', 'hold2'].indexOf(phase);
    const currentPhaseLabel = technique.phases[currentPhaseIndex];
    const currentPhaseDuration = technique.pattern[currentPhaseIndex];

    if (currentPhaseLabel && currentPhaseDuration > 0) {
      speakBreathingPhase(
        currentPhaseLabel,
        currentPhaseDuration,
        selectedTechnique
      );
    }
  }, [phase, isActive, selectedTechnique, audioEnabled, canSpeak, speakBreathingPhase]);

  const togglePlay = () => {
    if (!selectedTechnique) return;
    
    markUserInteraction();
    setIsActive(!isActive);
    
    if (isActive) {
      stopTTS();
    }
  };

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(0);
    setCycleCount(0);
    setBreathCount(0);
    setTotalTime(0);
    setTimeLeft(0);
    stopTTS();
  };

  const selectTechnique = (techniqueKey: string) => {
    setSelectedTechnique(techniqueKey);
    reset();
  };

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
    if (!audioEnabled) {
      markUserInteraction();
    }
  }, [audioEnabled, markUserInteraction]);

  if (!selectedTechnique) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">Scegli la tua tecnica di respirazione</h3>
          <p className="text-white/60">Ogni tecnica ha benefici specifici per il tuo benessere</p>
        </div>

        {/* Audio Warning for iOS */}
        {!canSpeak && audioEnabled && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm text-center">
              Le istruzioni vocali saranno disponibili dopo aver selezionato una tecnica
            </p>
          </div>
        )}

        {/* TTS Error */}
        {ttsError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm text-center">{ttsError}</p>
          </div>
        )}

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

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h3 className="text-white text-lg font-semibold mb-4">Impostazioni Audio</h3>
          
          {/* Voice Selection */}
          {audioEnabled && availableVoices.length > 0 && (
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Voce
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
                max="2"
                step="0.1"
                value={config.rate}
                onChange={(e) => updateConfig({ rate: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      )}

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
        
        {audioEnabled && (
          <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
            <p className="text-blue-200 text-sm text-center">
              Le istruzioni vocali ti guideranno attraverso ogni fase
            </p>
          </div>
        )}
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