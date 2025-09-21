'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, Mic } from 'lucide-react';

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
  audioInitialized: boolean;
}

const DEFAULT_TTS_CONFIG: TTSConfig = {
  voice: null,
  rate: 0.9,
  pitch: 1.0,
  volume: 0.9,
  lang: 'it-IT'
};

// TTS Hook inline con fix per iOS
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
    userHasInteracted: false,
    audioInitialized: false
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messageQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

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
      
      // FILTRO SOLO VOCI ITALIANE
      const italianVoices = voices.filter(voice => 
        voice.lang.startsWith('it') || 
        voice.lang === 'it-IT' || 
        voice.lang === 'it_IT'
      );
      
      setState(prev => ({ ...prev, availableVoices: italianVoices }));

      if (config.voice) {
        return;
      }

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      let preferredVoice: SpeechSynthesisVoice | undefined;
      
      if (isIOS) {
        // Priorità voci iOS italiane
        const iosPriority = [
          'Alice', // Prima scelta iOS
          'Luca',  // Seconda scelta iOS
          'Federica',
          'Paola'
        ];
        
        for (const voiceName of iosPriority) {
          preferredVoice = italianVoices.find(voice => 
            voice.name.toLowerCase().includes(voiceName.toLowerCase())
          );
          if (preferredVoice) break;
        }
        
        // Fallback a qualsiasi voce italiana
        if (!preferredVoice && italianVoices.length > 0) {
          preferredVoice = italianVoices[0];
        }
      } else {
        // Android/Desktop - priorità Google
        preferredVoice = italianVoices.find(voice => 
          voice.name.toLowerCase().includes('google') && voice.lang === 'it-IT'
        ) || italianVoices.find(voice => 
          voice.lang === 'it-IT'
        ) || italianVoices[0];
      }
      
      if (preferredVoice) {
        setConfig(prev => ({ ...prev, voice: preferredVoice }));
      }
    };

    checkSupport();

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Ricarica voci multiple volte su iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const intervals = [100, 300, 500, 1000, 2000];
      intervals.forEach(delay => {
        setTimeout(() => {
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

  const initializeAudio = useCallback(async () => {
    if (!state.isSupported) return false;
    
    try {
      // Cancella eventuali speech in corso
      speechSynthesis.cancel();
      
      // Test silenzioso per inizializzare
      const testUtterance = new SpeechSynthesisUtterance(' ');
      testUtterance.volume = 0;
      testUtterance.rate = 1;
      
      await new Promise((resolve, reject) => {
        testUtterance.onend = resolve;
        testUtterance.onerror = reject;
        speechSynthesis.speak(testUtterance);
        
        // Timeout di sicurezza
        setTimeout(resolve, 1000);
      });
      
      setState(prev => ({ 
        ...prev, 
        userHasInteracted: true,
        audioInitialized: true,
        error: null 
      }));
      
      return true;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Impossibile inizializzare audio. Riprova.' 
      }));
      return false;
    }
  }, [state.isSupported]);

  const processMessageQueue = useCallback(async () => {
    if (isProcessingRef.current || messageQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    
    while (messageQueueRef.current.length > 0) {
      const message = messageQueueRef.current.shift();
      if (message) {
        await speakTextInternal(message);
      }
    }
    
    isProcessingRef.current = false;
  }, []);

  const speakTextInternal = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!state.isSupported || !state.audioInitialized) {
        resolve();
        return;
      }

      // Cancella speech precedente
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.voice = config.voice || null;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;
      utterance.lang = config.lang;

      utterance.onstart = () => {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isPlaying: true,
          isPaused: false,
          currentText: text
        }));
      };

      utterance.onend = () => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: false,
          isPaused: false,
          currentText: '' 
        }));
        resolve();
      };

      utterance.onerror = () => {
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          isPlaying: false,
          isPaused: false
        }));
        resolve();
      };

      try {
        speechSynthesis.speak(utterance);
        utteranceRef.current = utterance;
      } catch {
        resolve();
      }
    });
  };

  const speakText = useCallback((text: string): Promise<void> => {
    if (!state.audioInitialized) {
      return Promise.resolve();
    }
    
    // Aggiungi alla coda invece di parlare direttamente
    messageQueueRef.current = [text]; // Sostituisce la coda con il nuovo messaggio
    return processMessageQueue();
  }, [state.audioInitialized, processMessageQueue]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    messageQueueRef.current = [];
    isProcessingRef.current = false;
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

  const speakCoachingMessage = useCallback(async (
    message: string,
    onComplete?: () => void
  ) => {
    await speakText(message);
    onComplete?.();
  }, [speakText]);

  return {
    ...state,
    config,
    speak: speakText,
    stop,
    initializeAudio,
    updateConfig,
    speakCoachingMessage,
    canSpeak: state.isSupported && state.audioInitialized,
    isActive: state.isPlaying || state.isLoading
  };
};

interface VirtualWalkingCoachProps {
  onComplete?: () => void;
}

export const VirtualWalkingCoach = ({ onComplete }: VirtualWalkingCoachProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'warmup' | 'steady_pace' | 'energetic' | 'mindful' | 'cooldown' | 'completed'>('warmup');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  
  // TTS Integration
  const {
    speakCoachingMessage,
    initializeAudio,
    canSpeak,
    audioInitialized,
    isActive: ttsIsActive,
    stop: stopTTS,
    config,
    updateConfig,
    availableVoices,
    error: ttsError
  } = useTTSInline();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<number>(0);
  const totalDuration = 600; // 10 minuti

  // Detect iOS
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  // FASI OTTIMIZZATE
  const walkingPhases = {
    warmup: { start: 0, end: 120, title: "Riscaldamento", color: "from-green-400 to-emerald-500", icon: "🌱" },
    steady_pace: { start: 120, end: 300, title: "Passo Costante", color: "from-orange-400 to-amber-500", icon: "⚡" },
    energetic: { start: 300, end: 420, title: "Ritmo Energico", color: "from-red-400 to-pink-500", icon: "🔥" },
    mindful: { start: 420, end: 540, title: "Camminata Mindful", color: "from-purple-400 to-indigo-500", icon: "🧘‍♀️" },
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
      warmup: [
        "Iniziamo con un passo comodo e naturale. Benvenuto nella tua camminata!",
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

  // Enable audio handler
  const handleEnableAudio = async () => {
    const success = await initializeAudio();
    if (success) {
      setShowAudioPrompt(false);
      // Test con messaggio di benvenuto
      await speakCoachingMessage("Audio attivato! Sono il tuo coach virtuale, pronto a guidarti.");
    }
  };

  useEffect(() => {
    if (isActive && currentPhase !== 'completed') {
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
          const now = Date.now();
          
          // Cambio fase
          if (newPhase !== currentPhase) {
            setCurrentPhase(newPhase);

            if (audioEnabled && canSpeak) {
              const message = getCoachingMessage(newPhase, 0);
              speakCoachingMessage(message);
              lastMessageTimeRef.current = now;
            }
          }
          
          // Messaggio ogni 30 secondi (evita sovrapposizioni)
          else if (newTime % 30 === 0 && 
                   audioEnabled && 
                   canSpeak && 
                   newPhase !== 'completed' &&
                   (now - lastMessageTimeRef.current) > 5000) { // Almeno 5 secondi tra messaggi
            const timeInPhase = newTime - walkingPhases[newPhase].start;
            const message = getCoachingMessage(newPhase, timeInPhase);
            speakCoachingMessage(message);
            lastMessageTimeRef.current = now;
          }

          checkAchievements(newTime, stepCount);

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
  }, [isActive, currentPhase, audioEnabled, stepCount, onComplete, canSpeak, speakCoachingMessage, stopTTS]);

  const startWalking = async () => {
    // Su iOS, mostra prima il prompt audio
    if (isIOS && audioEnabled && !audioInitialized) {
      setShowAudioPrompt(true);
      return;
    }
    
    setIsActive(true);
    setHasStarted(true);
    
    // Messaggio iniziale
    if (audioEnabled && canSpeak) {
      const message = "Iniziamo con un passo comodo e naturale. Benvenuto nella tua camminata!";
      await speakCoachingMessage(message);
    }
  };

  const togglePlay = () => {
    if (!hasStarted) {
      startWalking();
    } else {
      setIsActive(!isActive);
      
      if (isActive) {
        stopTTS();
      }
    }
  };

  const reset = () => {
    setIsActive(false);
    setCurrentTime(0);
    setCurrentPhase('warmup');
    setStepCount(0);
    setAchievements([]);
    setCurrentMilestone(null);
    setHasStarted(false);
    lastMessageTimeRef.current = 0;
    stopTTS();
  };

  const toggleAudio = useCallback(async () => {
    const newAudioState = !audioEnabled;
    setAudioEnabled(newAudioState);
    
    if (newAudioState && !audioInitialized && isIOS) {
      setShowAudioPrompt(true);
    } else if (!newAudioState) {
      stopTTS();
    }
  }, [audioEnabled, audioInitialized, isIOS, stopTTS]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => (currentTime / totalDuration) * 100;
  const estimatedCalories = Math.round((currentTime / 60) * 4.5);
  const currentPhaseData = walkingPhases[currentPhase];
  const timeInPhase = currentTime - currentPhaseData.start;
  const currentMessage = hasStarted ? getCoachingMessage(currentPhase, timeInPhase) : "Premi Play per iniziare subito la tua camminata energizzante!";

  return (
    <div className="space-y-8">
      {/* Audio Enable Prompt per iOS */}
      {showAudioPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-sm w-full border border-white/20">
            <div className="text-center space-y-4">
              <div className="text-5xl">🎧</div>
              <h3 className="text-xl font-bold text-white">Attiva il Coaching Vocale</h3>
              <p className="text-white/80 text-sm">
                Per guidarti durante la camminata, ho bisogno di attivare l'audio. 
                {isIOS && " Su iOS è necessaria la tua autorizzazione."}
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleEnableAudio}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
                >
                  <Mic className="inline w-5 h-5 mr-2" />
                  Attiva Audio Italiano
                </button>
                
                <button
                  onClick={() => {
                    setShowAudioPrompt(false);
                    setAudioEnabled(false);
                    setIsActive(true);
                    setHasStarted(true);
                  }}
                  className="w-full bg-white/10 text-white/70 px-6 py-3 rounded-full hover:bg-white/20 transition-colors text-sm"
                >
                  Continua senza audio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Header con controlli audio */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="w-20" />
        <h2 className="text-2xl font-bold text-white">Coach Virtuale</h2>
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
          {audioEnabled && availableVoices.length > 0 && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-gray-600 text-white p-2 rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Audio Status */}
      {audioEnabled && !audioInitialized && !showAudioPrompt && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6 relative z-10">
          <p className="text-yellow-200 text-sm text-center">
            {isIOS ? "Premi Play per attivare il coaching vocale" : "Audio non ancora inizializzato"}
          </p>
        </div>
      )}

      {/* TTS Error */}
      {ttsError && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 mb-6 relative z-10">
          <p className="text-red-200 text-sm text-center">{ttsError}</p>
        </div>
      )}

      {/* Settings Panel - SOLO VOCI ITALIANE */}
      {showSettings && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20 relative z-10">
          <h3 className="text-white text-lg font-semibold mb-4">Impostazioni Coach Vocale</h3>
          
          {/* Voice Selection - SOLO ITALIANE */}
          {availableVoices.length > 0 ? (
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Voce Italiana del Coach
              </label>
              <select
                value={config.voice?.name || ''}
                onChange={(e) => {
                  const voice = availableVoices.find(v => v.name === e.target.value);
                  updateConfig({ voice });
                }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              >
                <option value="">Voce italiana predefinita</option>
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} {voice.lang === 'it-IT' ? '🇮🇹' : ''}
                  </option>
                ))}
              </select>
              <p className="text-white/60 text-xs mt-2">
                {availableVoices.length} {availableVoices.length === 1 ? 'voce italiana disponibile' : 'voci italiane disponibili'}
              </p>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-yellow-500/20 rounded-lg">
              <p className="text-yellow-200 text-sm">
                Nessuna voce italiana trovata. Usa le impostazioni di sistema per aggiungere voci italiane.
              </p>
            </div>
          )}

          {/* Speech Rate */}
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
          </div>

          {/* Volume */}
          <div className="mb-4">
            <label className="block text-white text-sm font-medium mb-2">
              Volume: {Math.round(config.volume * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={config.volume}
              onChange={(e) => updateConfig({ volume: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

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
                {hasStarted ? currentPhaseData.title : "Pronto a partire"}
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
            {hasStarted ? `Coach Virtuale - ${currentPhaseData.title}` : "Coach Virtuale"}
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
          {hasStarted && (
            <div className="text-xs text-white/40 uppercase tracking-wider">
              {currentPhaseData.title} • {Math.ceil((currentPhaseData.end - currentPhaseData.start - timeInPhase) / 60)} min rimanenti
            </div>
          )}
          
          {audioEnabled && hasStarted && audioInitialized && (
            <div className="mt-4 p-3 bg-green-500/20 rounded-lg">
              <p className="text-green-200 text-sm flex items-center justify-center gap-2">
                <Volume2 className="w-4 h-4" />
                Coach vocale italiano attivo
              </p>
            </div>
          )}
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
              
              <div className="mt-4 flex gap-2">
                <a
                  href="/suggestions"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20 text-sm"
                >
                  Altre Suggestions
                </a>
                
                <a
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:scale-105 transition-transform text-sm"
                >
                  Dashboard
                </a>
              </div>
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