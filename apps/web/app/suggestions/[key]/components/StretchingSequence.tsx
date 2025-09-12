'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, Clock, Volume2, VolumeX, Settings } from 'lucide-react';

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

  const speakExerciseInstruction = useCallback(async (
    exerciseName: string,
    timeRemaining?: number,
    onComplete?: () => void
  ) => {
    let instruction = `Iniziamo con ${exerciseName}`;
    
    if (timeRemaining !== undefined) {
      if (timeRemaining > 0) {
        instruction = `${exerciseName}. Mantieni la posizione per ${timeRemaining} secondi`;
      } else {
        instruction = `${exerciseName} completato. Ottimo lavoro!`;
      }
    }

    await speakText(instruction, {
      onEnd: onComplete
    });
  }, [speakText]);

  const speakCountdown = useCallback(async (
    count: number,
    onComplete?: () => void
  ) => {
    const countdownText = count > 0 ? `${count}` : 'Finito!';
    
    await speakText(countdownText, {
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
    speakExerciseInstruction,
    speakCountdown,
    canSpeak: state.isSupported && state.userHasInteracted,
    isActive: state.isPlaying || state.isLoading
  };
};

interface StretchExercise {
  id: number;
  name: string;
  description: string;
  duration: number;
  instructions: string[];
  targetMuscles: string[];
  difficulty: 'Facile' | 'Medio' | 'Avanzato';
  illustration: string;
}

const stretchingExercises: StretchExercise[] = [
  {
    id: 1,
    name: "Stretching del collo",
    description: "Rilassa i muscoli del collo e delle spalle",
    duration: 30,
    instructions: [
      "Siediti o stai in piedi con la schiena dritta",
      "Inclina lentamente la testa verso destra",
      "Mantieni la posizione per 15 secondi",
      "Ripeti sul lato sinistro"
    ],
    targetMuscles: ["Collo", "Trapezio"],
    difficulty: 'Facile',
    illustration: "🔄"
  },
  {
    id: 2,
    name: "Stretching delle spalle",
    description: "Allunga e rilassa le spalle tese",
    duration: 45,
    instructions: [
      "Porta il braccio destro attraverso il petto",
      "Con la mano sinistra, tira delicatamente il gomito",
      "Mantieni per 20 secondi",
      "Ripeti con l'altro braccio"
    ],
    targetMuscles: ["Deltoidi", "Trapezio"],
    difficulty: 'Facile',
    illustration: "🤗"
  },
  {
    id: 3,
    name: "Stretching della schiena",
    description: "Decomprime la colonna vertebrale",
    duration: 60,
    instructions: [
      "Siediti su una sedia con i piedi a terra",
      "Inclina lentamente il busto in avanti",
      "Lascia che le braccia pendano naturalmente",
      "Respira profondamente e rilassati"
    ],
    targetMuscles: ["Colonna vertebrale", "Lombari"],
    difficulty: 'Medio',
    illustration: "🧘‍♂️"
  },
  {
    id: 4,
    name: "Stretching dei polsi",
    description: "Allevia la tensione da computer e scrittura",
    duration: 30,
    instructions: [
      "Estendi il braccio destro davanti a te",
      "Con la mano sinistra, piega delicatamente il polso verso il basso",
      "Mantieni per 15 secondi",
      "Ripeti nella direzione opposta e cambia braccio"
    ],
    targetMuscles: ["Polsi", "Avambracci"],
    difficulty: 'Facile',
    illustration: "✋"
  },
  {
    id: 5,
    name: "Stretching delle gambe",
    description: "Rilassa muscoli delle gambe e migliora circolazione",
    duration: 45,
    instructions: [
      "Stai in piedi, appoggiati a una parete",
      "Porta una gamba indietro tenendo il tallone a terra",
      "Spingi delicatamente il bacino in avanti",
      "Ripeti con l'altra gamba"
    ],
    targetMuscles: ["Polpacci", "Tendini"],
    difficulty: 'Medio',
    illustration: "🦵"
  }
];

export const StretchingSequence: React.FC = () => {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timeLeft, setTimeLeft] = useState(stretchingExercises[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // TTS Integration
  const {
    speakExerciseInstruction,
    speakCountdown,
    markUserInteraction,
    canSpeak,
    isActive: ttsIsActive,
    stop: stopTTS,
    config,
    updateConfig,
    availableVoices,
    error: ttsError
  } = useTTSInline();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          const newTime = time - 1;
          
          // Speak countdown for last 5 seconds
          if (audioEnabled && canSpeak && newTime <= 5 && newTime > 0) {
            speakCountdown(newTime);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleExerciseComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, audioEnabled, canSpeak, speakCountdown]);

  const handleExerciseComplete = () => {
    setIsActive(false);
    setCompletedExercises(prev => [...prev, currentExercise]);
    stopTTS();
    
    // Speak completion message
    if (audioEnabled && canSpeak) {
      speakExerciseInstruction(stretchingExercises[currentExercise].name, 0);
    }
    
    if (currentExercise < stretchingExercises.length - 1) {
      // Passa al prossimo esercizio
      setTimeout(() => {
        setCurrentExercise(prev => prev + 1);
        setTimeLeft(stretchingExercises[currentExercise + 1].duration);
        setShowInstructions(true);
      }, 2000);
    } else {
      // Sequenza completata
      setTimeout(() => {
        setIsCompleted(true);
        if (audioEnabled && canSpeak) {
          speakExerciseInstruction("Sequenza di stretching completata. Ottimo lavoro!");
        }
      }, 2000);
    }
  };

  const startTimer = () => {
    markUserInteraction();
    setIsActive(true);
    setShowInstructions(false);
    
    // Speak exercise start instruction
    if (audioEnabled && canSpeak) {
      speakExerciseInstruction(
        stretchingExercises[currentExercise].name,
        timeLeft
      );
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    stopTTS();
  };

  const skipExercise = () => {
    stopTTS();
    handleExerciseComplete();
  };

  const resetSequence = () => {
    setCurrentExercise(0);
    setTimeLeft(stretchingExercises[0].duration);
    setIsActive(false);
    setIsCompleted(false);
    setCompletedExercises([]);
    setShowInstructions(true);
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = stretchingExercises.reduce((sum, ex) => sum + ex.duration, 0);
  const progress = ((currentExercise + (stretchingExercises[currentExercise].duration - timeLeft) / stretchingExercises[currentExercise].duration) / stretchingExercises.length) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Stretching Completato!</h1>
          <p className="text-xl text-white/70 mb-8">
            Hai completato tutti i {stretchingExercises.length} esercizi di stretching. I tuoi muscoli sono ora più rilassati e flessibili.
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Benefici ottenuti</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80">
              <div className="text-left space-y-2">
                <p>✓ Muscoli più rilassati</p>
                <p>✓ Miglioramento della postura</p>
                <p>✓ Riduzione delle tensioni</p>
              </div>
              <div className="text-left space-y-2">
                <p>✓ Maggiore flessibilità</p>
                <p>✓ Miglior circolazione</p>
                <p>✓ Sensazione di benessere</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetSequence}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Ripeti Stretching
            </button>
            
            <a
              href="/suggestions"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Altre Suggestions
            </a>
            
            <a
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const exercise = stretchingExercises[currentExercise];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-900 to-teal-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header con progresso */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20" />
            <div className="text-6xl">{exercise.illustration}</div>
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

          <h1 className="text-3xl font-bold text-white mb-2">Sequenza Stretching</h1>
          <p className="text-white/70 mb-4">
            Esercizio {currentExercise + 1} di {stretchingExercises.length}
          </p>
          
          {/* Audio Warning for iOS */}
          {!canSpeak && audioEnabled && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm text-center">
                Tocca "Inizia Esercizio" per abilitare le istruzioni vocali
              </p>
            </div>
          )}

          {/* TTS Error */}
          {ttsError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm text-center">{ttsError}</p>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-white/60 text-sm">
            Tempo totale rimanente: {formatTime(stretchingExercises.slice(currentExercise).reduce((sum, ex, index) => 
              index === 0 ? sum + timeLeft : sum + ex.duration, 0
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20">
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pannello esercizio */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                exercise.difficulty === 'Facile' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                exercise.difficulty === 'Medio' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                'bg-red-500/20 text-red-300 border border-red-400/30'
              }`}>
                {exercise.difficulty}
              </span>
            </div>

            <p className="text-white/80 mb-6">{exercise.description}</p>

            {/* Muscoli target */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Muscoli coinvolti:</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map(muscle => (
                  <span key={muscle} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-400/30">
                    {muscle}
                  </span>
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-white mb-2">{formatTime(timeLeft)}</div>
              <div className="text-white/60">
                {isActive ? 'In corso...' : showInstructions ? 'Pronto per iniziare' : 'In pausa'}
              </div>
            </div>

            {/* Controlli */}
            <div className="flex justify-center gap-4">
              {showInstructions ? (
                <button
                  onClick={startTimer}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Inizia Esercizio
                </button>
              ) : (
                <>
                  <button
                    onClick={isActive ? pauseTimer : startTimer}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all border border-white/20"
                  >
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={skipExercise}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all border border-white/20"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={resetSequence}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all border border-white/20"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Pannello istruzioni */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6">Istruzioni passo-passo</h3>
            
            <div className="space-y-4">
              {exercise.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-white/80 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>

            {/* Consigli */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
              <h4 className="text-blue-200 font-medium mb-2">Consigli importanti:</h4>
              <ul className="text-blue-100/80 text-sm space-y-1">
                <li>• Non forzare mai i movimenti</li>
                <li>• Respira lentamente e profondamente</li>
                <li>• Fermati se senti dolore</li>
                <li>• Mantieni le posizioni senza rimbalzare</li>
              </ul>
            </div>

            {audioEnabled && (
              <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
                <p className="text-green-200 text-sm text-center">
                  Le istruzioni vocali ti guideranno durante ogni esercizio
                </p>
              </div>
            )}

            {/* Prossimo esercizio */}
            {currentExercise < stretchingExercises.length - 1 && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Prossimo esercizio:</h4>
                <p className="text-white/70 text-sm">
                  {stretchingExercises[currentExercise + 1].name} - {stretchingExercises[currentExercise + 1].duration}s
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lista esercizi completati */}
        {completedExercises.length > 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Esercizi completati:</h3>
            <div className="flex flex-wrap gap-2">
              {completedExercises.map(index => (
                <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-400/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {stretchingExercises[index].name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};