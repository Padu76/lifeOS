'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Volume2, VolumeX, Settings, Brain, Heart } from 'lucide-react';

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

// Meditation Types
interface MeditationPhase {
  id: string;
  name: string;
  duration: number;
  instructions: string[];
  pauseBetween: number;
  backgroundSound?: string;
}

interface MeditationStats {
  currentPhase: number;
  currentInstruction: number;
  isActive: boolean;
  startTime: Date | null;
  totalDuration: number;
  timeRemaining: number;
}

const DEFAULT_TTS_CONFIG: TTSConfig = {
  voice: null,
  rate: 0.8, // Slower for meditation
  pitch: 1.0,
  volume: 0.9,
  lang: 'it-IT'
};

const MEDITATION_SESSIONS = {
  '5min': {
    name: 'Rilassamento veloce',
    duration: 300,
    phases: [
      {
        id: 'preparation',
        name: 'Preparazione',
        duration: 60,
        instructions: [
          'Trova una posizione comoda e chiudi dolcemente gli occhi',
          'Lascia che il tuo corpo si rilassi completamente',
          'Porta l\'attenzione al tuo respiro naturale'
        ],
        pauseBetween: 8
      },
      {
        id: 'breathing',
        name: 'Respirazione consapevole',
        duration: 180,
        instructions: [
          'Inspira lentamente attraverso il naso',
          'Senti l\'aria che entra nei polmoni',
          'Espira dolcemente dalla bocca',
          'Lascia andare ogni tensione con ogni espirazione',
          'Continua a respirare naturalmente'
        ],
        pauseBetween: 15
      },
      {
        id: 'closing',
        name: 'Chiusura',
        duration: 60,
        instructions: [
          'Porta gradualmente l\'attenzione al tuo corpo',
          'Muovi delicatamente le dita delle mani e dei piedi',
          'Quando sei pronto, apri lentamente gli occhi'
        ],
        pauseBetween: 8
      }
    ]
  },
  '10min': {
    name: 'Meditazione mindfulness',
    duration: 600,
    phases: [
      {
        id: 'preparation',
        name: 'Preparazione',
        duration: 90,
        instructions: [
          'Siediti in una posizione stabile e confortevole',
          'Allunga la colonna vertebrale verso l\'alto',
          'Lascia che le spalle si rilassino',
          'Chiudi dolcemente gli occhi'
        ],
        pauseBetween: 10
      },
      {
        id: 'body-scan',
        name: 'Scansione corporea',
        duration: 180,
        instructions: [
          'Porta l\'attenzione alla sommità della testa',
          'Scendi lentamente verso la fronte',
          'Rilassa gli occhi e la mascella',
          'Lascia che il collo si distenda',
          'Senti le spalle che si ammorbidiscono',
          'Rilassa le braccia e le mani',
          'Porta attenzione al petto e al cuore',
          'Lascia che l\'addome si rilassi',
          'Senti la schiena appoggiata',
          'Rilassa le anche e le gambe',
          'Lascia che i piedi si distendano completamente'
        ],
        pauseBetween: 12
      },
      {
        id: 'breathing',
        name: 'Respiro consapevole',
        duration: 240,
        instructions: [
          'Ora porta tutta l\'attenzione al respiro',
          'Non cambiare nulla, osserva semplicemente',
          'Senti l\'aria che entra dalle narici',
          'Segui il respiro fino ai polmoni',
          'Nota la pausa naturale',
          'Osserva l\'espirazione che fluisce',
          'Se la mente vaga, torna gentilmente al respiro',
          'Ogni respiro è un nuovo inizio'
        ],
        pauseBetween: 20
      },
      {
        id: 'closing',
        name: 'Integrazione',
        duration: 90,
        instructions: [
          'Espandi la consapevolezza a tutto il corpo',
          'Senti la pace e la calma che hai coltivato',
          'Porta questa sensazione nel resto della giornata',
          'Muovi delicatamente le dita',
          'Stiracchiati se ne senti il bisogno',
          'Apri gli occhi quando ti senti pronto'
        ],
        pauseBetween: 10
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

      // Auto-select Google Italian voice (best quality)
      let preferredVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('google') && voice.lang.startsWith('it')
      );
      
      // Fallback to any Italian voice if Google not available
      if (!preferredVoice) {
        preferredVoice = voices.find(voice => 
          voice.lang.startsWith('it') || voice.name.toLowerCase().includes('italian')
        );
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

export const GuidedMeditationSystem = () => {
  const [selectedSession, setSelectedSession] = useState<'5min' | '10min'>('5min');
  const [stats, setStats] = useState<MeditationStats>({
    currentPhase: 0,
    currentInstruction: 0,
    isActive: false,
    startTime: null,
    totalDuration: 0,
    timeRemaining: 0
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

  const session = MEDITATION_SESSIONS[selectedSession];
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
      
      // Pause before next phase
      setTimeout(() => {
        if (audioEnabled && canSpeak) {
          speak(nextInstruction);
        }
        setStats(prev => ({ ...prev, timeRemaining: nextPhase.pauseBetween }));
      }, 3000);
      
    } else {
      // Move to next instruction in same phase
      setStats(prev => ({
        ...prev,
        currentInstruction: nextInstructionIndex
      }));
      
      const nextInstruction = currentPhase.instructions[nextInstructionIndex];
      
      if (audioEnabled && canSpeak) {
        speak(nextInstruction);
      }
      setStats(prev => ({ ...prev, timeRemaining: currentPhase.pauseBetween }));
    }
  }, [stats, currentPhase, session, audioEnabled, canSpeak, speak]);

  const handleSessionComplete = useCallback(async () => {
    setStats(prev => ({ ...prev, isActive: false }));
    stopTTS();

    if (audioEnabled && canSpeak) {
      await speak('La tua sessione di meditazione è terminata. Prenditi un momento per notare come ti senti ora.');
    }
  }, [audioEnabled, canSpeak, speak, stopTTS]);

  const startSession = useCallback(async () => {
    markUserInteraction();
    
    setStats({
      currentPhase: 0,
      currentInstruction: 0,
      isActive: true,
      startTime: new Date(),
      totalDuration: session.duration,
      timeRemaining: session.phases[0].pauseBetween
    });

    const firstInstruction = session.phases[0].instructions[0];
    
    if (audioEnabled && canSpeak) {
      await speak(firstInstruction);
    }
  }, [session, markUserInteraction, audioEnabled, canSpeak, speak]);

  const pauseSession = useCallback(() => {
    setStats(prev => ({ ...prev, isActive: false }));
    stopTTS();
  }, [stopTTS]);

  const stopSession = useCallback(() => {
    setStats({
      currentPhase: 0,
      currentInstruction: 0,
      isActive: false,
      startTime: null,
      totalDuration: 0,
      timeRemaining: 0
    });
    stopTTS();
  }, [stopTTS]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 p-4">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Meditazione Guidata</h1>
          <p className="text-purple-200">
            Rilassa mente e corpo con sessioni guidate dalla voce
          </p>
        </div>

        {/* Audio Warning for iOS */}
        {!canSpeak && audioEnabled && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm text-center">
              Tocca "Inizia" per abilitare la guida vocale
            </p>
          </div>
        )}

        {/* TTS Error */}
        {ttsError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm text-center">{ttsError}</p>
          </div>
        )}

        {/* Session Selection */}
        {!stats.isActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {Object.entries(MEDITATION_SESSIONS).map(([key, sessionData]) => (
              <button
                key={key}
                onClick={() => setSelectedSession(key as '5min' | '10min')}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                  selectedSession === key
                    ? 'border-purple-400 bg-purple-500/20'
                    : 'border-white/20 bg-white/10 hover:border-white/40'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <Brain className="w-8 h-8 text-purple-400" />
                  <div>
                    <h3 className="text-white text-xl font-semibold">{sessionData.name}</h3>
                    <p className="text-purple-200 text-sm">{formatTime(sessionData.duration)}</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm">
                  {sessionData.phases.length} fasi guidate per {sessionData.duration / 60} minuti
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
                <div className="text-purple-200 text-lg mb-1">
                  {currentPhase?.name}
                </div>
                <div className="text-white/80 text-sm">
                  Fase {stats.currentPhase + 1} di {session.phases.length}
                </div>
              </div>

              {/* Current Instruction */}
              <div className="bg-purple-500/20 rounded-xl p-6 mb-6">
                <Heart className="w-8 h-8 text-purple-300 mx-auto mb-4" />
                <p className="text-white text-lg leading-relaxed">
                  {currentInstruction}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${((stats.currentPhase * session.phases[0].instructions.length + stats.currentInstruction) / 
                           (session.phases.reduce((acc, phase) => acc + phase.instructions.length, 0))) * 100}%`
                  }}
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
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Inizia {session.name}
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
                  min="0.3"
                  max="0.8"
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
          <h3 className="text-white text-lg font-semibold mb-4">Benefici della Meditazione</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Riduce stress e ansia</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Migliora la concentrazione</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Aumenta la consapevolezza</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm">Favorisce il benessere emotivo</p>
            </div>
          </div>
          
          {audioEnabled && (
            <div className="mt-4 p-3 bg-purple-500/20 rounded-lg">
              <p className="text-purple-200 text-sm">
                La guida vocale ti permetterà di meditare ad occhi chiusi senza distrazioni
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};