'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Moon, Clock, CheckCircle } from 'lucide-react';
import { Howl } from 'howler';

export const PowerNapGuide: React.FC = () => {
  const [phase, setPhase] = useState<'preparation' | 'timer' | 'wakeup' | 'completed'>('preparation');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState('rain');
  const [customTime, setCustomTime] = useState(15);
  const [volume, setVolume] = useState(0.3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Array per tracciare TUTTE le istanze audio attive
  const activeAudioRef = useRef<Howl[]>([]);
  const currentAudioRef = useRef<Howl | null>(null);

  // Audio URLs - file reali caricati in /public/audio/
  const audioSources = {
    rain: '/audio/rain.mp3',
    ocean: '/audio/ocean.mp3',
    forest: '/audio/forest.mp3',
    chimes: '/audio/chimes.mp3'
  };

  // Funzione AGGRESSIVA per fermare TUTTO l'audio
  const stopAllAudio = () => {
    console.log('STOP ALL AUDIO - Cleaning everything');
    
    // Ferma tutti gli audio nell'array
    activeAudioRef.current.forEach((howl, index) => {
      try {
        console.log(`Stopping audio ${index}`);
        howl.stop();
        howl.unload();
      } catch (e) {
        console.warn(`Error stopping audio ${index}:`, e);
      }
    });
    
    // Pulisci array
    activeAudioRef.current = [];
    
    // Pulisci riferimento corrente
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.stop();
        currentAudioRef.current.unload();
      } catch (e) {
        console.warn('Error stopping current audio:', e);
      }
      currentAudioRef.current = null;
    }
    
    // Cleanup globale Howler (se disponibile)
    try {
      if (typeof window !== 'undefined' && (window as any).Howler) {
        (window as any).Howler.stop();
      }
    } catch (e) {
      console.warn('Global Howler stop failed:', e);
    }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setPhase('wakeup');
            stopAllAudio();
            playWakeupChimes();
            return 0;
          }
          return time - 1;
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
      stopAllAudio();
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createNewHowl = (audioUrl: string, isLoop: boolean = true, volumeLevel: number = volume) => {
    const howl = new Howl({
      src: [audioUrl],
      loop: isLoop,
      volume: volumeLevel,
      html5: true,
      preload: true,
      onload: () => {
        console.log(`Audio loaded: ${audioUrl}`);
      },
      onloaderror: (id, error) => {
        console.warn(`Audio loading error for ${audioUrl}:`, error);
        // Rimuovi dall'array se fallisce
        const index = activeAudioRef.current.indexOf(howl);
        if (index > -1) {
          activeAudioRef.current.splice(index, 1);
        }
      },
      onplayerror: (id, error) => {
        console.warn(`Audio play error for ${audioUrl}:`, error);
      },
      onplay: () => {
        console.log(`Audio playing: ${audioUrl}`);
      },
      onend: () => {
        console.log(`Audio ended: ${audioUrl}`);
        if (!isLoop) {
          // Rimuovi dall'array quando finisce (per suoni non-loop come test e chimes)
          const index = activeAudioRef.current.indexOf(howl);
          if (index > -1) {
            activeAudioRef.current.splice(index, 1);
          }
        }
      }
    });
    
    // Aggiungi all'array di tracking
    activeAudioRef.current.push(howl);
    return howl;
  };

  const playAmbientSound = () => {
    if (!soundEnabled || ambientSound === 'silence') return;
    
    console.log(`Starting ambient sound: ${ambientSound}`);
    
    // STOP tutto prima di iniziare
    stopAllAudio();
    
    const audioUrl = audioSources[ambientSound as keyof typeof audioSources];
    if (!audioUrl) return;

    // Attendi per essere sicuri che tutto sia fermato
    setTimeout(() => {
      try {
        const howl = createNewHowl(audioUrl, true, volume);
        currentAudioRef.current = howl;
        
        const playResult = howl.play();
        console.log(`Play result for ${ambientSound}:`, playResult);
        
      } catch (error) {
        console.warn('Error creating ambient sound:', error);
        createFallbackSound(ambientSound);
      }
    }, 200);
  };

  const testAmbientSound = () => {
    if (!soundEnabled || ambientSound === 'silence') return;
    
    console.log(`Testing audio: ${ambientSound}`);
    
    // STOP tutto prima del test
    stopAllAudio();
    
    const audioUrl = audioSources[ambientSound as keyof typeof audioSources];
    if (!audioUrl) return;

    setTimeout(() => {
      try {
        const howl = createNewHowl(audioUrl, false, volume); // Non loop per test
        
        howl.play();
        
        // Auto-stop dopo 3 secondi
        setTimeout(() => {
          try {
            const index = activeAudioRef.current.indexOf(howl);
            if (index > -1) {
              console.log('Stopping test audio after 3 seconds');
              howl.stop();
              howl.unload();
              activeAudioRef.current.splice(index, 1);
            }
          } catch (e) {
            console.warn('Error stopping test audio:', e);
          }
        }, 3000);
        
      } catch (error) {
        console.warn('Error creating test sound:', error);
      }
    }, 100);
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    // Aggiorna volume di tutti gli audio attivi
    activeAudioRef.current.forEach(howl => {
      try {
        howl.volume(newVolume);
      } catch (e) {
        console.warn('Error updating volume:', e);
      }
    });
  };

  const playWakeupChimes = () => {
    if (!soundEnabled) return;
    
    console.log('Playing wakeup chimes');
    
    const chimesUrl = audioSources.chimes;
    
    setTimeout(() => {
      try {
        const chimesHowl = createNewHowl(chimesUrl, false, volume * 0.8);
        chimesHowl.play();
      } catch (error) {
        console.warn('Error playing chimes:', error);
        createSyntheticChimes();
      }
    }, 100);
  };

  // Fallback Web Audio API
  const createFallbackSound = (type: string) => {
    if (!soundEnabled) return;
    
    console.log(`Creating fallback sound: ${type}`);
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      switch (type) {
        case 'rain':
          const bufferSize = 4096;
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const output = buffer.getChannelData(0);
          
          for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.1;
          }
          
          const noise = audioContext.createBufferSource();
          noise.buffer = buffer;
          noise.loop = true;
          
          const gainNode = audioContext.createGain();
          gainNode.gain.setValueAtTime(volume * 0.2, audioContext.currentTime);
          
          noise.connect(gainNode);
          gainNode.connect(audioContext.destination);
          noise.start();
          break;

        case 'ocean':
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
          gain.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
          
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          break;

        case 'forest':
          const frequencies = [220, 330, 440];
          frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const oscGain = audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            oscGain.gain.setValueAtTime(volume * 0.05, audioContext.currentTime);
            
            osc.connect(oscGain);
            oscGain.connect(audioContext.destination);
            osc.start();
          });
          break;
      }
    } catch (error) {
      console.warn('Fallback audio not supported:', error);
    }
  };

  const createSyntheticChimes = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const frequencies = [523.25, 783.99, 1046.5];
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 2.5);
        }, index * 500);
      });
    } catch (error) {
      console.warn('Synthetic chimes not supported:', error);
    }
  };

  const startTimer = () => {
    console.log('Starting timer');
    stopAllAudio();
    setTimeLeft(customTime * 60);
    setIsActive(true);
    setPhase('timer');
    if (soundEnabled) {
      setTimeout(() => playAmbientSound(), 400);
    }
  };

  const pauseTimer = () => {
    console.log(`Timer ${isActive ? 'pausing' : 'resuming'}`);
    if (isActive) {
      stopAllAudio();
    }
    setIsActive(!isActive);
    if (!isActive && soundEnabled) {
      setTimeout(() => playAmbientSound(), 300);
    }
  };

  const resetTimer = () => {
    console.log('Resetting timer');
    setIsActive(false);
    setTimeLeft(customTime * 60);
    setPhase('preparation');
    stopAllAudio();
  };

  const completeSession = () => {
    console.log('Completing session');
    setPhase('completed');
    stopAllAudio();
  };

  // Cleanup quando cambia il suono ambientale
  useEffect(() => {
    if (phase === 'timer' && isActive && soundEnabled) {
      console.log(`Ambient sound changed to: ${ambientSound}`);
      stopAllAudio();
      setTimeout(() => playAmbientSound(), 300);
    }
  }, [ambientSound]);

  // Cleanup globale
  useEffect(() => {
    return () => {
      console.log('Component unmounting - cleaning all audio');
      stopAllAudio();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (phase === 'preparation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌙</div>
            <h1 className="text-4xl font-bold text-white mb-4">Power Nap</h1>
            <p className="text-xl text-white/70">
              Un breve riposo per ricaricare le energie e migliorare focus e creativita
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-3">Durata (minuti)</label>
                <div className="flex items-center gap-4">
                  {[10, 15, 20, 25].map(duration => (
                    <button
                      key={duration}
                      onClick={() => setCustomTime(duration)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        customTime === duration
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-3">Suono ambientale rilassante</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'rain', label: 'Pioggia dolce', icon: '🌧️', desc: 'Suono naturale di pioggia leggera' },
                    { key: 'ocean', label: 'Onde marine', icon: '🌊', desc: 'Dolci onde che si infrangono' },
                    { key: 'forest', label: 'Foresta zen', icon: '🌲', desc: 'Armonie naturali della foresta' },
                    { key: 'silence', label: 'Silenzio', icon: '🤫', desc: 'Silenzio completo' }
                  ].map(sound => (
                    <button
                      key={sound.key}
                      onClick={() => {
                        console.log(`Selecting sound: ${sound.key}`);
                        stopAllAudio();
                        setAmbientSound(sound.key);
                      }}
                      className={`p-3 rounded-lg transition-all flex items-center gap-3 ${
                        ambientSound === sound.key
                          ? 'bg-purple-500/30 text-purple-200 border border-purple-400/50'
                          : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                      }`}
                      title={sound.desc}
                    >
                      <span className="text-xl">{sound.icon}</span>
                      <div className="text-left">
                        <div className="font-medium">{sound.label}</div>
                        <div className="text-xs opacity-70">{sound.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {soundEnabled && ambientSound !== 'silence' && (
                <div>
                  <label className="block text-white font-medium mb-3">Volume audio</label>
                  <div className="flex items-center gap-4">
                    <Volume2 className="w-4 h-4 text-white/60" />
                    <input
                      type="range"
                      min="0.1"
                      max="0.8"
                      step="0.1"
                      value={volume}
                      onChange={(e) => updateVolume(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white/60 text-sm w-8">{Math.round(volume * 100)}%</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Suoni abilitati</span>
                <button
                  onClick={() => {
                    console.log(`Sound ${soundEnabled ? 'disabled' : 'enabled'}`);
                    stopAllAudio();
                    setSoundEnabled(!soundEnabled);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    soundEnabled
                      ? 'bg-green-500/30 text-green-200 border border-green-400/50'
                      : 'bg-red-500/30 text-red-200 border border-red-400/50'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {soundEnabled ? 'Attivo' : 'Disattivo'}
                </button>
              </div>

              {soundEnabled && ambientSound !== 'silence' && (
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">Prova il suono selezionato (3 secondi):</span>
                    <button
                      onClick={() => {
                        console.log('Test button clicked');
                        testAmbientSound();
                      }}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30 transition-colors"
                    >
                      Test Audio
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <h3 className="text-blue-200 font-medium mb-2">Consigli per un power nap efficace:</h3>
                <ul className="text-blue-100/80 text-sm space-y-1">
                  <li>• Trova un luogo buio e silenzioso</li>
                  <li>• Usa una sveglia per evitare di dormire troppo</li>
                  <li>• Rilassati ma non forzare il sonno</li>
                  <li>• Anche solo riposare gli occhi e benefico</li>
                  <li>• La durata ideale e tra 10-20 minuti</li>
                </ul>
              </div>

              <button
                onClick={startTimer}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-3"
              >
                <Moon className="w-6 h-6" />
                Inizia Power Nap ({customTime} min)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'timer') {
    const progress = ((customTime * 60 - timeLeft) / (customTime * 60)) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">😴</div>
            <h1 className="text-3xl font-bold text-white mb-2">Riposa e Ricaricati</h1>
            <p className="text-white/60">Chiudi gli occhi e lascia che il corpo si rigeneri</p>
            {soundEnabled && ambientSound !== 'silence' && (
              <p className="text-white/40 text-sm mt-2">
                🎵 {ambientSound === 'rain' ? 'Pioggia dolce' : 
                     ambientSound === 'ocean' ? 'Onde marine' : 
                     'Foresta zen'} in riproduzione
              </p>
            )}
          </div>

          <div className="relative mb-8">
            <div className="w-64 h-64 mx-auto mb-6 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#timerGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-white mb-2">{formatTime(timeLeft)}</div>
                <div className="text-white/60 text-sm">rimanenti</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={pauseTimer}
              className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all border border-white/20"
              title={isActive ? 'Pausa' : 'Riprendi'}
            >
              {isActive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all border border-white/20"
              title="Ricomincia"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={() => {
                console.log(`Audio toggle: ${soundEnabled ? 'off' : 'on'}`);
                setSoundEnabled(!soundEnabled);
                if (soundEnabled) {
                  stopAllAudio();
                } else {
                  playAmbientSound();
                }
              }}
              className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all border border-white/20"
              title={soundEnabled ? 'Disattiva audio' : 'Attiva audio'}
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <p className="text-white/80 leading-relaxed mb-4">
              Respira lentamente e profondamente. Lascia andare le tensioni del corpo. 
              Questo e il tuo momento di pausa.
            </p>
            <div className="text-white/60 text-sm space-y-1">
              <p>• Rilassa i muscoli dal viso ai piedi</p>
              <p>• Non preoccuparti di dormire profondamente</p>
              <p>• Anche solo riposare gli occhi e benefico</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'wakeup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4 animate-bounce">☀️</div>
            <h1 className="text-4xl font-bold text-white mb-4">Svegliati Dolcemente</h1>
            <p className="text-xl text-white/70">
              Il tuo power nap e completato. Prenditi un momento per svegliarti gradualmente.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Risveglio graduale</h3>
            <div className="space-y-4 text-white/80">
              <p>1. Muovi lentamente dita di mani e piedi</p>
              <p>2. Fai qualche respiro profondo</p>
              <p>3. Apri gli occhi quando ti senti pronto</p>
              <p>4. Alzati lentamente e fai un leggero stretching</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={resetTimer}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
            >
              Altro Power Nap
            </button>
            
            <button
              onClick={completeSession}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:scale-105 transition-transform"
            >
              Sono Sveglio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Power Nap Completato!</h1>
            <p className="text-xl text-white/70">
              Hai dedicato {customTime} minuti al riposo. Il tuo corpo e mente sono ora piu freschi e concentrati.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Benefici del power nap</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80">
              <div className="text-left">
                <p>✓ Miglioramento della concentrazione</p>
                <p>✓ Aumento della creativita</p>
                <p>✓ Riduzione dello stress</p>
              </div>
              <div className="text-left">
                <p>✓ Miglioramento dell'umore</p>
                <p>✓ Aumento dell'energia</p>
                <p>✓ Migliore performance cognitiva</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
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
              Torna alla Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};