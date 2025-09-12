'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Settings } from 'lucide-react';

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

// Breathing Types
interface BreathingPhase {
  name: 'inhale' | 'hold' | 'exhale';
  duration: number;
  instruction: string;
  color: string;
}

interface BreathingStats {
  totalCycles: number;
  completedCycles: number;
  currentPhase: number;
  isActive: boolean;
  startTime: Date | null;
}

const BREATHING_PHASES: BreathingPhase[] = [
  {
    name: 'inhale',
    duration: 4,
    instruction: 'Inspira lentamente',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    name: 'hold',
    duration: 7,
    instruction: 'Trattieni il respiro',
    color: 'from-purple-400 to-pink-500'
  },
  {
    name: 'exhale',
    duration: 8,
    instruction: 'Espira completamente',
    color: 'from-green-400 to-emerald-500'
  }
];

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
      
      // Skip if no voices loaded yet (common on iOS)
      if (voices.length === 0) {
        return;
      }
      
      setState(prev => ({ ...prev, availableVoices: voices }));

      // Only auto-select if no voice is currently set
      if (config.voice) {
        return;
      }

      // Debug: log all available voices on iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('iOS Voices loading attempt, found:', voices.length);
        console.log('iOS Voices available:', voices.map(v => `${v.name} (${v.lang})`));
      }

      // Auto-select best Italian voice based on platform
      let preferredVoice: SpeechSynthesisVoice | undefined;
      
      if (isIOS) {
        // On iOS, try multiple fallbacks in order
        const candidates = [
          // Try Alice variants
          voices.find(voice => voice.name.toLowerCase().includes('alice') && voice.lang === 'it-IT'),
          voices.find(voice => voice.name.toLowerCase().includes('alice')),
          // Try other Italian voices
          voices.find(voice => voice.lang === 'it-IT' && !voice.name.toLowerCase().includes('en')),
          voices.find(voice => voice.lang.startsWith('it-') && !voice.name.toLowerCase().includes('en')),
          // Try any Italian voice
          voices.find(voice => voice.lang.startsWith('it')),
          // Last resort: any voice with Italian in name
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
        // On other platforms, prefer Google Italian TTS
        preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('google') && voice.lang.startsWith('it')
        );
        
        // Fallback to any Italian voice
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

    // Voices might load asynchronously on iOS
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // iOS: Force multiple loading attempts with delays
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

    // Clean up on unmount
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []); // Remove config.voice dependency to allow auto-selection

  // Mark user interaction (required for iOS)
  const markUserInteraction = useCallback(() => {
    setState(prev => ({ ...prev, userHasInteracted: true }));
  }, []);

  // Create speech utterance
  const createUtterance = useCallback((text: string): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.voice = config.voice || null;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;
    utterance.lang = config.lang;

    return utterance;
  }, [config]);

  // Core speak function
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

      // Stop current speech
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

  // Stop speech
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

  // Update config
  const updateConfig = useCallback((newConfig: Partial<TTSConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  // Breathing exercise TTS helper
  const speakBreathingInstruction = useCallback(async (
    phase: 'inhale' | 'hold' | 'exhale',
    duration: number,
    onPhaseComplete?: () => void
  ) => {
    const instructions = {
      inhale: `Inspira lentamente per ${duration} secondi`,
      hold: `Trattieni il respiro per ${duration} secondi`,
      exhale: `Espira completamente per ${duration} secondi`
    };

    await speakText(instructions[phase], {
      onEnd: onPhaseComplete
    });
  }, [speakText]);

  return {
    // State
    ...state,
    config,

    // Core actions
    speak: speakText,
    stop,
    markUserInteraction,

    // Configuration
    updateConfig,

    // Specialized helpers for LifeOS suggestions
    speakBreathingInstruction,

    // Utility
    canSpeak: state.isSupported && state.userHasInteracted,
    isActive: state.isPlaying || state.isLoading
  };
};

export default function ModernBreathing478() {
  const [stats, setStats] = useState<BreathingStats>({
    totalCycles: 4,
    completedCycles: 0,
    currentPhase: 0,
    isActive: false,
    startTime: null
  });

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // TTS Integration
  const {
    speakBreathingInstruction,
    markUserInteraction,
    canSpeak,
    isActive: ttsIsActive,
    stop: stopTTS,
    config,
    updateConfig,
    availableVoices,
    error: ttsError
  } = useTTSInline();

  const currentPhase = BREATHING_PHASES[stats.currentPhase];
  const progress = stats.currentPhase === 0 ? 0 : 
    (stats.completedCycles * 3 + stats.currentPhase) / (stats.totalCycles * 3) * 100;

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stats.isActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (stats.isActive && timeRemaining === 0) {
      // Phase completed, move to next
      handlePhaseComplete();
    }

    return () => clearTimeout(timer);
  }, [stats.isActive, timeRemaining]);

  const handlePhaseComplete = useCallback(() => {
    const nextPhaseIndex = (stats.currentPhase + 1) % 3;
    
    if (nextPhaseIndex === 0) {
      // Completed a full cycle
      const newCompletedCycles = stats.completedCycles + 1;
      
      if (newCompletedCycles >= stats.totalCycles) {
        // Session completed
        handleSessionComplete();
        return;
      }
      
      setStats(prev => ({
        ...prev,
        completedCycles: newCompletedCycles,
        currentPhase: 0
      }));
    } else {
      setStats(prev => ({
        ...prev,
        currentPhase: nextPhaseIndex
      }));
    }

    // Start next phase
    const nextPhase = BREATHING_PHASES[nextPhaseIndex];
    setTimeRemaining(nextPhase.duration);
    
    // Speak instruction if audio enabled
    if (audioEnabled && canSpeak) {
      speakBreathingInstruction(
        nextPhase.name,
        nextPhase.duration
      );
    }
  }, [stats, audioEnabled, canSpeak, speakBreathingInstruction]);

  const handleSessionComplete = useCallback(() => {
    setStats(prev => ({ ...prev, isActive: false }));
    setTimeRemaining(0);
    stopTTS();

    // Custom completion message
    if (audioEnabled && canSpeak) {
      speakBreathingInstruction('exhale', 0);
    }
  }, [audioEnabled, canSpeak, stopTTS, speakBreathingInstruction]);

  const startSession = useCallback(() => {
    // Mark user interaction for iOS
    markUserInteraction();
    
    setStats(prev => ({
      ...prev,
      isActive: true,
      completedCycles: 0,
      currentPhase: 0,
      startTime: new Date()
    }));
    
    const firstPhase = BREATHING_PHASES[0];
    setTimeRemaining(firstPhase.duration);

    // Speak initial instruction
    if (audioEnabled && canSpeak) {
      speakBreathingInstruction(
        firstPhase.name,
        firstPhase.duration
      );
    }
  }, [markUserInteraction, audioEnabled, canSpeak, speakBreathingInstruction]);

  const pauseSession = useCallback(() => {
    setStats(prev => ({ ...prev, isActive: false }));
    stopTTS();
  }, [stopTTS]);

  const stopSession = useCallback(() => {
    setStats(prev => ({
      ...prev,
      isActive: false,
      completedCycles: 0,
      currentPhase: 0,
      startTime: null
    }));
    setTimeRemaining(0);
    stopTTS();
  }, [stopTTS]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled(prev => !prev);
    if (!audioEnabled) {
      markUserInteraction(); // Prepare TTS when enabling
    }
  }, [audioEnabled, markUserInteraction]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Respirazione 4-7-8</h1>
          <p className="text-blue-200">
            Tecnica di rilassamento per ridurre stress e ansia
          </p>
        </div>

        {/* Audio Warning for iOS */}
        {!canSpeak && audioEnabled && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm text-center">
              Tocca "Inizia" per abilitare le istruzioni vocali
            </p>
          </div>
        )}

        {/* TTS Error */}
        {ttsError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm text-center">{ttsError}</p>
          </div>
        )}

        {/* Main Breathing Circle */}
        <div className="relative w-80 h-80 mx-auto mb-8">
          
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="160"
              cy="160"
              r="150"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 9.42} 942`}
              className="transition-all duration-1000 ease-in-out"
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Breathing Circle */}
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${currentPhase.color} 
                         flex items-center justify-center transition-all duration-1000
                         ${stats.isActive ? 'animate-pulse' : ''}`}>
            
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">{timeRemaining}</div>
              <div className="text-lg font-medium mb-1">{currentPhase.instruction}</div>
              <div className="text-sm opacity-80">
                Ciclo {stats.completedCycles + 1} di {stats.totalCycles}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-8">
          
          {!stats.isActive ? (
            <button
              onClick={startSession}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Inizia
            </button>
          ) : (
            <>
              <button
                onClick={pauseSession}
                className="bg-yellow-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                Pausa
              </button>
              
              <button
                onClick={stopSession}
                className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            </>
          )}

          {/* Audio Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full font-semibold hover:scale-105 transition-transform 
                       ${audioEnabled ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300'}`}
            title={audioEnabled ? 'Audio abilitato' : 'Audio disabilitato'}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-600 text-white p-3 rounded-full font-semibold hover:scale-105 transition-transform"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h3 className="text-white text-lg font-semibold mb-4">Impostazioni</h3>
            
            {/* Cycles Setting */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Numero di cicli: {stats.totalCycles}
              </label>
              <input
                type="range"
                min="2"
                max="10"
                value={stats.totalCycles}
                onChange={(e) => setStats(prev => ({ ...prev, totalCycles: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={stats.isActive}
              />
            </div>

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

        {/* Instructions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Come funziona</h3>
          <div className="space-y-3 text-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">1</div>
              <p>Inspira dal naso per 4 secondi</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">2</div>
              <p>Trattieni il respiro per 7 secondi</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">3</div>
              <p>Espira dalla bocca per 8 secondi</p>
            </div>
          </div>
          
          {audioEnabled && (
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg">
              <p className="text-blue-200 text-sm">
                Le istruzioni vocali ti guideranno attraverso ogni fase
              </p>
            </div>
          )}
        </div>

        {/* Progress Summary */}
        {stats.completedCycles > 0 && (
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <h3 className="text-white text-lg font-semibold mb-2">Progresso Sessione</h3>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {stats.completedCycles}/{stats.totalCycles}
            </div>
            <p className="text-blue-200">cicli completati</p>
          </div>
        )}
      </div>
    </div>
  );
}