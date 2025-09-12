'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Settings, Moon, Sun } from 'lucide-react';

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

// Power Nap Types
interface NapPhase {
  id: string;
  name: string;
  duration: number;
  instructions: string[];
  pauseBetween: number;
  type: 'preparation' | 'relaxation' | 'sleep' | 'awakening';
}

interface NapStats {
  selectedDuration: number;
  currentPhase: number;
  currentInstruction: number;
  isActive: boolean;
  startTime: Date | null;
  timeRemaining: number;
  awakeningStarted: boolean;
}

const DEFAULT_TTS_CONFIG: TTSConfig = {
  voice: null,
  rate: 0.3, // Very slow for relaxation
  pitch: 1.0,
  volume: 0.8,
  lang: 'it-IT'
};

const NAP_SESSIONS = {
  10: {
    name: 'Power Nap Veloce',
    totalDuration: 600, // 10 minutes
    phases: [
      {
        id: 'preparation',
        name: 'Preparazione',
        duration: 120,
        instructions: [
          'Trova una posizione comoda per riposare',
          'Chiudi gli occhi e lascia che il corpo si rilassi',
          'Respira naturalmente e profondamente'
        ],
        pauseBetween: 15,
        type: 'preparation' as const
      },
      {
        id: 'relaxation',
        name: 'Rilassamento',
        duration: 180,
        instructions: [
          'Lascia andare ogni tensione dai muscoli del viso',
          'Rilassa le spalle e le braccia',
          'Senti il peso del corpo che si appoggia',
          'Permetti alla mente di rallentare'
        ],
        pauseBetween: 20,
        type: 'relaxation' as const
      },
      {
        id: 'sleep',
        name: 'Riposo',
        duration: 240,
        instructions: [
          'Ora puoi riposare completamente',
          'Non serve dormire profondamente, solo rilassarti'
        ],
        pauseBetween: 30,
        type: 'sleep' as const
      },
      {
        id: 'awakening',
        name: 'Risveglio',
        duration: 60,
        instructions: [
          'È ora di risvegliarti dolcemente',
          'Muovi lentamente le dita delle mani e dei piedi',
          'Stiracchiati delicatamente',
          'Apri gli occhi quando ti senti pronto'
        ],
        pauseBetween: 8,
        type: 'awakening' as const
      }
    ]
  },
  20: {
    name: 'Power Nap Completo',
    totalDuration: 1200, // 20 minutes
    phases: [
      {
        id: 'preparation',
        name: 'Preparazione',
        duration: 180,
        instructions: [
          'Mettiti in una posizione comoda per il riposo',
          'Assicurati che la stanza sia tranquilla',
          'Chiudi gli occhi e inizia a rilassarti',
          'Porta l\'attenzione al tuo respiro naturale'
        ],
        pauseBetween: 12,
        type: 'preparation' as const
      },
      {
        id: 'relaxation',
        name: 'Rilassamento Profondo',
        duration: 300,
        instructions: [
          'Inizia a rilassare i muscoli del viso',
          'Lascia che la mascella si distenda',
          'Rilassa il collo e le spalle',
          'Senti le braccia diventare pesanti',
          'Rilassa il torace e l\'addome',
          'Lascia che le gambe si distendano',
          'Tutto il corpo ora è rilassato'
        ],
        pauseBetween: 25,
        type: 'relaxation' as const
      },
      {
        id: 'sleep',
        name: 'Riposo Profondo',
        duration: 600,
        instructions: [
          'Ora puoi riposare completamente',
          'Lascia che la mente si quieti',
          'Se arrivano pensieri, lasciali passare',
          'Goditi questo momento di pace'
        ],
        pauseBetween: 45,
        type: 'sleep' as const
      },
      {
        id: 'awakening',
        name: 'Risveglio Graduale',
        duration: 120,
        instructions: [
          'È ora di iniziare a risvegliarti',
          'Porta lentamente l\'attenzione al corpo',
          'Respira più profondamente',
          'Muovi dolcemente le dita',
          'Stiracchiati come preferisci',
          'Apri gli occhi quando ti senti completamente sveglio'
        ],
        pauseBetween: 10,
        type: 'awakening' as const
      }
    ]
  }
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
      
      setState(prev => ({ ...prev, availableVoices: voices }));

      // Debug: log all available voices on iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        console.log('iOS Voices available:', voices.map(v => `${v.name} (${v.lang})`));
      }

      // Auto-select best Italian voice based on platform
      let preferredVoice;
      
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
          console.log('iOS Selected voice:', preferredVoice.name, preferredVoice.lang);
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
      }
      
      if (preferredVoice && !config.voice) {
        setConfig(prev => ({ ...prev, voice: preferredVoice }));
      }
    };

    checkSupport();

    // Voices might load asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Clean up on unmount
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, [config.voice]);

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

    // Utility
    canSpeak: state.isSupported && state.userHasInteracted,
    isActive: state.isPlaying || state.isLoading
  };
};

export const PowerNapGuide = () => {
  const [selectedDuration, setSelectedDuration] = useState<10 | 20>(20);
  const [stats, setStats] = useState<NapStats>({
    selectedDuration: 20,
    currentPhase: 0,
    currentInstruction: 0,
    isActive: false,
    startTime: null,
    timeRemaining: 0,
    awakeningStarted: false
  });

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // TTS Integration
  const {
    speak,
    markUserInteraction,
    canSpeak,
    isActive: ttsIsActive,
    stop: stopTTS,
    config,
    updateConfig,
    availableVoices,
    error: ttsError
  } = useTTSInline();

  const session = NAP_SESSIONS[selectedDuration];
  const currentPhase = session.phases[stats.currentPhase];
  const currentInstruction = currentPhase?.instructions[stats.currentInstruction];

  // Timer for session
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (stats.isActive && stats.timeRemaining > 0) {
      timer = setTimeout(() => {
        setStats(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
    } else if (stats.isActive && stats.timeRemaining === 0) {
      // Move to next instruction or phase
      handleInstructionComplete();
    }

    return () => clearTimeout(timer);
  }, [stats.isActive, stats.timeRemaining]);

  const handleInstructionComplete = useCallback(async () => {
    const nextInstructionIndex = stats.currentInstruction + 1;
    
    if (nextInstructionIndex >= currentPhase.instructions.length) {
      // Move to next phase
      const nextPhaseIndex = stats.currentPhase + 1;
      
      if (nextPhaseIndex >= session.phases.length) {
        // Session completed
        handleSessionComplete();
        return;
      }
      
      setStats(prev => ({
        ...prev,
        currentPhase: nextPhaseIndex,
        currentInstruction: 0
      }));
      
      const nextPhase = session.phases[nextPhaseIndex];
      const nextInstruction = nextPhase.instructions[0];
      
      // For sleep phase, give longer pauses and fewer interruptions
      if (nextPhase.type === 'sleep') {
        // Only speak first instruction, then let user rest
        if (audioEnabled && canSpeak) {
          await speak(nextInstruction);
        }
        setStats(prev => ({ ...prev, timeRemaining: nextPhase.duration }));
      } else {
        // Normal phase progression
        if (audioEnabled && canSpeak) {
          await speak(nextInstruction);
        }
        setStats(prev => ({ ...prev, timeRemaining: nextPhase.pauseBetween }));
      }
      
    } else {
      // Move to next instruction in same phase
      setStats(prev => ({
        ...prev,
        currentInstruction: nextInstructionIndex
      }));
      
      const nextInstruction = currentPhase.instructions[nextInstructionIndex];
      
      // Skip speaking during sleep phase after first instruction
      if (currentPhase.type !== 'sleep' || stats.currentInstruction === 0) {
        if (audioEnabled && canSpeak) {
          await speak(nextInstruction);
        }
        setStats(prev => ({ ...prev, timeRemaining: currentPhase.pauseBetween }));
      } else {
        // During sleep phase, just wait without speaking
        setStats(prev => ({ ...prev, timeRemaining: currentPhase.pauseBetween }));
      }
    }
  }, [stats, currentPhase, session, audioEnabled, canSpeak, speak]);

  const handleSessionComplete = useCallback(async () => {
    setStats(prev => ({ ...prev, isActive: false }));
    stopTTS();

    if (audioEnabled && canSpeak) {
      await speak('Il tuo power nap è terminato. Ti senti più riposato e energico.');
    }
  }, [audioEnabled, canSpeak, speak, stopTTS]);

  const startSession = useCallback(async () => {
    markUserInteraction();
    
    setStats({
      selectedDuration,
      currentPhase: 0,
      currentInstruction: 0,
      isActive: true,
      startTime: new Date(),
      timeRemaining: session.phases[0].pauseBetween,
      awakeningStarted: false
    });

    const firstInstruction = session.phases[0].instructions[0];
    
    if (audioEnabled && canSpeak) {
      await speak(firstInstruction);
    }
  }, [selectedDuration, session, markUserInteraction, audioEnabled, canSpeak, speak]);

  const pauseSession = useCallback(() => {
    setStats(prev => ({ ...prev, isActive: false }));
    stopTTS();
  }, [stopTTS]);

  const stopSession = useCallback(() => {
    setStats({
      selectedDuration,
      currentPhase: 0,
      currentInstruction: 0,
      isActive: false,
      startTime: null,
      timeRemaining: 0,
      awakeningStarted: false
    });
    stopTTS();
  }, [selectedDuration, stopTTS]);

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

  const getPhaseProgress = () => {
    if (!stats.isActive) return 0;
    const totalInstructions = session.phases.reduce((acc, phase) => acc + phase.instructions.length, 0);
    const completedInstructions = session.phases.slice(0, stats.currentPhase).reduce((acc, phase) => acc + phase.instructions.length, 0) + stats.currentInstruction;
    return (completedInstructions / totalInstructions) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Power Nap Guidato</h1>
          <p className="text-indigo-200">
            Riposo rigenerante con guida vocale per rilassamento profondo
          </p>
        </div>

        {/* Audio Warning for iOS */}
        {!canSpeak && audioEnabled && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm text-center">
              Tocca "Inizia" per abilitare la guida vocale rilassante
            </p>
          </div>
        )}

        {/* TTS Error */}
        {ttsError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm text-center">{ttsError}</p>
          </div>
        )}

        {/* Duration Selection */}
        {!stats.isActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(NAP_SESSIONS).map(([duration, sessionData]) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(parseInt(duration) as 10 | 20)}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedDuration === parseInt(duration)
                    ? 'border-indigo-400 bg-indigo-500/20'
                    : 'border-white/20 bg-white/10 hover:border-white/40'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <Moon className="w-8 h-8 text-indigo-400" />
                  <div>
                    <h3 className="text-white text-xl font-semibold">{sessionData.name}</h3>
                    <p className="text-indigo-200 text-sm">{duration} minuti</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  {sessionData.phases.length} fasi di rilassamento guidato
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Active Session Interface */}
        {stats.isActive && (
          <div className="text-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
              <div className="mb-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {formatTime(stats.timeRemaining)}
                </div>
                <div className="text-indigo-200 text-lg mb-1">
                  {currentPhase?.name}
                </div>
                <div className="text-white/80 text-sm">
                  Fase {stats.currentPhase + 1} di {session.phases.length}
                </div>
              </div>

              {/* Current Instruction */}
              <div className="bg-indigo-500/20 rounded-xl p-6 mb-6">
                {currentPhase?.type === 'sleep' ? (
                  <Moon className="w-8 h-8 text-indigo-300 mx-auto mb-4" />
                ) : currentPhase?.type === 'awakening' ? (
                  <Sun className="w-8 h-8 text-yellow-300 mx-auto mb-4" />
                ) : (
                  <Moon className="w-8 h-8 text-indigo-300 mx-auto mb-4" />
                )}
                
                <p className="text-white text-lg leading-relaxed">
                  {currentInstruction || 'Rilassati e goditi questo momento di pace...'}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${getPhaseProgress()}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-8">
          
          {!stats.isActive ? (
            <button
              onClick={startSession}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Inizia Power Nap
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
            <h3 className="text-white text-lg font-semibold mb-4">Impostazioni Audio</h3>
            
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
                  max="1.3"
                  step="0.1"
                  value={config.rate}
                  onChange={(e) => updateConfig({ rate: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* Benefits */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Benefici del Power Nap</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-200">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Aumenta energia e concentrazione</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Migliora memoria e apprendimento</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Riduce stress e affaticamento</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Migliora umore e creatività</p>
            </div>
          </div>
          
          {audioEnabled && (
            <div className="mt-4 p-3 bg-indigo-500/20 rounded-lg">
              <p className="text-indigo-200 text-sm">
                La guida vocale ti accompagnerà dolcemente attraverso rilassamento e risveglio
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};