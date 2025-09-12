'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zap, Play, Pause, RotateCcw, CheckCircle, Timer, Lightbulb, Volume2, VolumeX, Settings } from 'lucide-react';

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

  const speakActivityInstruction = useCallback(async (
    activityName: string,
    instruction: string,
    timeRemaining?: number,
    onComplete?: () => void
  ) => {
    let fullInstruction = `${activityName}. ${instruction}`;
    
    if (timeRemaining !== undefined && timeRemaining > 0) {
      fullInstruction += ` Per ${timeRemaining} secondi.`;
    }

    await speakText(fullInstruction, {
      onEnd: onComplete
    });
  }, [speakText]);

  const speakCountdown = useCallback(async (
    count: number,
    onComplete?: () => void
  ) => {
    const countdownText = count > 0 ? `${count}` : 'Completato!';
    
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
    speakActivityInstruction,
    speakCountdown,
    canSpeak: state.isSupported && state.userHasInteracted,
    isActive: state.isPlaying || state.isLoading
  };
};

interface EnergyActivity {
  id: number;
  name: string;
  description: string;
  duration: number;
  instructions: string[];
  energyLevel: 'Basso' | 'Medio' | 'Alto';
  type: 'Respirazione' | 'Movimento' | 'Mentale' | 'Idratazione';
  icon: string;
}

const energyActivities: EnergyActivity[] = [
  {
    id: 1,
    name: "Respirazione energizzante",
    description: "Tecnica di respirazione per attivare il sistema nervoso",
    duration: 60,
    instructions: [
      "Fai 3 respiri profondi per prepararti",
      "Inspira energicamente per 4 secondi",
      "Trattieni il respiro per 2 secondi",
      "Espira con forza per 4 secondi",
      "Ripeti per tutto il tempo indicato"
    ],
    energyLevel: 'Alto',
    type: 'Respirazione',
    icon: "💨"
  },
  {
    id: 2,
    name: "Jumping jacks",
    description: "Movimento rapido per attivare la circolazione",
    duration: 30,
    instructions: [
      "Posizionati in piedi con i piedi uniti",
      "Salta aprendo gambe e alzando le braccia",
      "Torna alla posizione iniziale",
      "Mantieni un ritmo costante e energico",
      "Concentrati sulla coordinazione"
    ],
    energyLevel: 'Alto',
    type: 'Movimento',
    icon: "🏃‍♂️"
  },
  {
    id: 3,
    name: "Power pose",
    description: "Posizioni del corpo che aumentano fiducia ed energia",
    duration: 60,
    instructions: [
      "Alzati in piedi con le gambe leggermente divaricate",
      "Metti le mani sui fianchi o alza le braccia al cielo",
      "Solleva il mento e guarda avanti con determinazione",
      "Respira profondamente e senti la tua forza",
      "Mantieni la posizione con orgoglio"
    ],
    energyLevel: 'Medio',
    type: 'Mentale',
    icon: "💪"
  },
  {
    id: 4,
    name: "Stretching dinamico",
    description: "Movimenti fluidi per risvegliare muscoli e articolazioni",
    duration: 90,
    instructions: [
      "Ruota le spalle avanti e indietro 10 volte",
      "Ruota la testa delicatamente in tutte le direzioni",
      "Fai cerchi con le braccia, prima piccoli poi grandi",
      "Piega il busto lateralmente, alternando i lati",
      "Termina con qualche balzo leggero sul posto"
    ],
    energyLevel: 'Medio',
    type: 'Movimento',
    icon: "🤸‍♀️"
  }
];

export const EnergyBoostSession: React.FC = () => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [timeLeft, setTimeLeft] = useState(energyActivities[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedActivities, setCompletedActivities] = useState<number[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // TTS Integration
  const {
    speakActivityInstruction,
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
      handleActivityComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, audioEnabled, canSpeak, speakCountdown]);

  const handleActivityComplete = () => {
    setIsActive(false);
    setCompletedActivities(prev => [...prev, currentActivity]);
    stopTTS();
    
    // Aumenta il livello di energia
    setEnergyLevel(prev => Math.min(10, prev + 1));
    
    // Speak completion message
    if (audioEnabled && canSpeak) {
      speakActivityInstruction(
        energyActivities[currentActivity].name,
        "completato! Ottimo lavoro!"
      );
    }
    
    if (currentActivity < energyActivities.length - 1) {
      // Passa alla prossima attività
      setTimeout(() => {
        setCurrentActivity(prev => prev + 1);
        setTimeLeft(energyActivities[currentActivity + 1].duration);
        setShowInstructions(true);
      }, 2000);
    } else {
      // Sessione completata
      setTimeout(() => {
        setIsCompleted(true);
        if (audioEnabled && canSpeak) {
          speakActivityInstruction("Sessione Energy Boost", "completata! Hai ricaricato la tua energia!");
        }
      }, 2000);
    }
  };

  const startTimer = () => {
    markUserInteraction();
    setIsActive(true);
    setShowInstructions(false);
    
    // Speak activity start instruction
    if (audioEnabled && canSpeak) {
      const activity = energyActivities[currentActivity];
      speakActivityInstruction(
        activity.name,
        activity.instructions[0],
        timeLeft
      );
    }
  };

  const pauseTimer = () => {
    setIsActive(false);
    stopTTS();
  };

  const skipActivity = () => {
    stopTTS();
    handleActivityComplete();
  };

  const resetSession = () => {
    setCurrentActivity(0);
    setTimeLeft(energyActivities[0].duration);
    setIsActive(false);
    setIsCompleted(false);
    setCompletedActivities([]);
    setShowInstructions(true);
    setEnergyLevel(5);
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

  const getEnergyColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'Medio': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'Basso': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Respirazione': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'Movimento': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'Mentale': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'Idratazione': return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const progress = ((currentActivity + (energyActivities[currentActivity].duration - timeLeft) / energyActivities[currentActivity].duration) / energyActivities.length) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="text-6xl mb-6 animate-bounce">⚡</div>
          <CheckCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-4">Energia Ricaricata!</h1>
          <p className="text-xl text-white/70 mb-8">
            Hai completato tutte le {energyActivities.length} attività energizzanti. La tua energia è ora al livello {energyLevel}/10!
          </p>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Benefici ottenuti</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80">
              <div className="text-left space-y-2">
                <p>⚡ Energia aumentata</p>
                <p>🧠 Mente più lucida</p>
                <p>💪 Corpo più attivo</p>
              </div>
              <div className="text-left space-y-2">
                <p>❤️ Circolazione migliorata</p>
                <p>😊 Umore elevato</p>
                <p>🎯 Focus aumentato</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetSession}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Altra Sessione
            </button>
            
            <a
              href="/suggestions"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Altre Suggestions
            </a>
            
            <a
              href="/dashboard"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const activity = energyActivities[currentActivity];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header con livello energia e controlli audio */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="w-20" />
            <div className="text-6xl">{activity.icon}</div>
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

          <h1 className="text-3xl font-bold text-white mb-2">Energy Boost Session</h1>
          <p className="text-white/70 mb-4">
            Attività {currentActivity + 1} di {energyActivities.length}
          </p>

          {/* Audio Warning for iOS */}
          {!canSpeak && audioEnabled && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-sm text-center">
                Tocca "Inizia Attività" per abilitare le istruzioni vocali
              </p>
            </div>
          )}

          {/* TTS Error */}
          {ttsError && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm text-center">{ttsError}</p>
            </div>
          )}
          
          {/* Energy Level Indicator */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-white/70">Energia:</span>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-6 rounded-sm ${
                    i < energyLevel ? 'bg-gradient-to-t from-yellow-500 to-orange-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <span className="text-white font-bold">{energyLevel}/10</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
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
          {/* Pannello attività */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{activity.name}</h2>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEnergyColor(activity.energyLevel)}`}>
                  {activity.energyLevel}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(activity.type)}`}>
                  {activity.type}
                </span>
              </div>
            </div>

            <p className="text-white/80 mb-6">{activity.description}</p>

            {/* Timer grande */}
            <div className="text-center mb-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#energyGradient)"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (timeLeft / activity.duration)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                  <defs>
                    <linearGradient id="energyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white">{formatTime(timeLeft)}</div>
                </div>
              </div>
              
              <div className="text-white/60">
                {isActive ? 'In corso...' : showInstructions ? 'Pronto!' : 'In pausa'}
              </div>
            </div>

            {/* Controlli */}
            <div className="flex justify-center gap-4">
              {showInstructions ? (
                <button
                  onClick={startTimer}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Inizia Attività
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
                    onClick={skipActivity}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-all border border-white/20"
                    title="Salta attività"
                  >
                    <Timer className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={resetSession}
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
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Come eseguire
            </h3>
            
            <div className="space-y-4">
              {activity.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-white/80 leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>

            {/* Consigli per l'energia */}
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
              <h4 className="text-yellow-200 font-medium mb-2">Consigli per massimizzare l'energia:</h4>
              <ul className="text-yellow-100/80 text-sm space-y-1">
                <li>• Mantieni una postura eretta e sicura</li>
                <li>• Respira profondamente durante ogni attività</li>
                <li>• Visualizza te stesso pieno di energia</li>
                <li>• Sii presente nel movimento</li>
              </ul>
            </div>

            {audioEnabled && (
              <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
                <p className="text-green-200 text-sm text-center">
                  Le istruzioni vocali ti guideranno durante ogni attività
                </p>
              </div>
            )}

            {/* Prossima attività */}
            {currentActivity < energyActivities.length - 1 && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h4 className="text-white font-medium mb-2">Prossima attività:</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{energyActivities[currentActivity + 1].icon}</span>
                  <div>
                    <p className="text-white/70 text-sm font-medium">
                      {energyActivities[currentActivity + 1].name}
                    </p>
                    <p className="text-white/50 text-xs">
                      {energyActivities[currentActivity + 1].duration}s - {energyActivities[currentActivity + 1].type}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attività completate */}
        {completedActivities.length > 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-4">Attività completate:</h3>
            <div className="flex flex-wrap gap-2">
              {completedActivities.map(index => (
                <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-400/30 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {energyActivities[index].icon} {energyActivities[index].name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};