'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Moon, Clock, CheckCircle } from 'lucide-react';

export const PowerNapGuide: React.FC = () => {
  const [phase, setPhase] = useState<'preparation' | 'timer' | 'wakeup' | 'completed'>('preparation');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minuti in secondi
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState('rain');
  const [customTime, setCustomTime] = useState(15);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  // Oscillatori per suoni sintetici
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setPhase('wakeup');
            stopAmbientSound();
            playWakeupSound();
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
      stopAmbientSound();
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported');
      }
    }
  };

  const createOscillatorSound = (frequency: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    
    return { oscillator, gainNode };
  };

  const playAmbientSound = () => {
    if (!soundEnabled) return;
    
    initAudioContext();
    stopAmbientSound();

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    try {
      // Suoni sintetici con Web Audio API
      if (audioContextRef.current) {
        let sound;
        
        switch (ambientSound) {
          case 'rain':
            // Suono di pioggia: rumore bianco filtrato
            sound = createOscillatorSound(200, 'sawtooth', 0.05);
            if (sound) {
              oscillatorRef.current = sound.oscillator;
              gainNodeRef.current = sound.gainNode;
              // Aggiunge variazione casuale per simulare pioggia
              setInterval(() => {
                if (gainNodeRef.current && audioContextRef.current) {
                  const randomVolume = 0.03 + Math.random() * 0.04;
                  gainNodeRef.current.gain.setValueAtTime(randomVolume, audioContextRef.current.currentTime);
                }
              }, 500);
              sound.oscillator.start();
            }
            break;
            
          case 'ocean':
            // Suono oceano: frequenza bassa ondulante
            sound = createOscillatorSound(80, 'sine', 0.08);
            if (sound) {
              oscillatorRef.current = sound.oscillator;
              gainNodeRef.current = sound.gainNode;
              // Oscillazione per simulare onde
              sound.oscillator.frequency.setValueAtTime(80, audioContextRef.current.currentTime);
              sound.oscillator.frequency.linearRampToValueAtTime(120, audioContextRef.current.currentTime + 3);
              sound.oscillator.frequency.linearRampToValueAtTime(80, audioContextRef.current.currentTime + 6);
              sound.oscillator.start();
            }
            break;
            
          case 'forest':
            // Suono foresta: frequenze medie con variazioni
            sound = createOscillatorSound(150, 'triangle', 0.06);
            if (sound) {
              oscillatorRef.current = sound.oscillator;
              gainNodeRef.current = sound.gainNode;
              sound.oscillator.start();
            }
            break;
            
          case 'silence':
            // Nessun suono
            break;
        }
      }
    } catch (error) {
      console.warn('Error playing ambient sound:', error);
    }
  };

  const stopAmbientSound = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current = null;
      }
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.warn('Error stopping ambient sound:', error);
    }
  };

  const playWakeupSound = () => {
    if (!soundEnabled) return;
    
    initAudioContext();
    
    try {
      if (audioContextRef.current) {
        // Suono dolce di campanella per il risveglio
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (accordo maggiore)
        
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const sound = createOscillatorSound(freq, 'sine', 0.2);
            if (sound) {
              sound.gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + 1.5);
              sound.oscillator.start();
              sound.oscillator.stop(audioContextRef.current!.currentTime + 2);
            }
          }, index * 300);
        });
      }
    } catch (error) {
      console.warn('Error playing wakeup sound:', error);
    }
  };

  const startTimer = () => {
    setTimeLeft(customTime * 60);
    setIsActive(true);
    setPhase('timer');
    if (soundEnabled) {
      // Piccolo delay per permettere user interaction prima di avviare audio
      setTimeout(() => {
        playAmbientSound();
      }, 100);
    }
  };

  const pauseTimer = () => {
    setIsActive(!isActive);
    if (isActive) {
      stopAmbientSound();
    } else if (soundEnabled) {
      playAmbientSound();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customTime * 60);
    setPhase('preparation');
    stopAmbientSound();
  };

  const completeSession = () => {
    setPhase('completed');
    stopAmbientSound();
  };

  // Cleanup quando il componente viene smontato
  useEffect(() => {
    return () => {
      stopAmbientSound();
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
              Un breve riposo per ricaricare le energie e migliorare focus e creatività
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="space-y-6">
              {/* Durata */}
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

              {/* Suono ambientale */}
              <div>
                <label className="block text-white font-medium mb-3">Suono ambientale</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'rain', label: 'Pioggia', icon: '🌧️', desc: 'Suono rilassante di pioggia' },
                    { key: 'ocean', label: 'Oceano', icon: '🌊', desc: 'Onde che si infrangono' },
                    { key: 'forest', label: 'Foresta', icon: '🌲', desc: 'Suoni della natura' },
                    { key: 'silence', label: 'Silenzio', icon: '🤫', desc: 'Nessun suono' }
                  ].map(sound => (
                    <button
                      key={sound.key}
                      onClick={() => setAmbientSound(sound.key)}
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

              {/* Audio toggle */}
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Suoni abilitati</span>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
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

              {/* Audio test */}
              {soundEnabled && ambientSound !== 'silence' && (
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">Prova il suono selezionato:</span>
                    <button
                      onClick={() => {
                        stopAmbientSound();
                        setTimeout(() => playAmbientSound(), 100);
                        setTimeout(() => stopAmbientSound(), 3000);
                      }}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded text-sm hover:bg-blue-500/30 transition-colors"
                    >
                      Test Audio
                    </button>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <h3 className="text-blue-200 font-medium mb-2">Consigli per un power nap efficace:</h3>
                <ul className="text-blue-100/80 text-sm space-y-1">
                  <li>• Trova un luogo buio e silenzioso</li>
                  <li>• Usa una sveglia per evitare di dormire troppo</li>
                  <li>• Rilassati ma non forzare il sonno</li>
                  <li>• Anche solo riposare gli occhi è benefico</li>
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
              <p className="text-white/50 text-sm mt-2">
                🎵 {ambientSound === 'rain' ? 'Pioggia rilassante' : 
                     ambientSound === 'ocean' ? 'Suoni dell\'oceano' : 
                     'Suoni della foresta'} in riproduzione
              </p>
            )}
          </div>

          {/* Timer grande */}
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

          {/* Controlli */}
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
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all border border-white/20"
              title={soundEnabled ? 'Disattiva audio' : 'Attiva audio'}
            >
              {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
          </div>

          {/* Ambiente rilassante */}
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <p className="text-white/80 leading-relaxed">
              Respira lentamente e profondamente. Lascia andare le tensioni del corpo. 
              Questo è il tuo momento di pausa. Non preoccuparti di dormire profondamente, 
              anche solo rilassarti farà la differenza.
            </p>
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
              Il tuo power nap è completato. Prenditi un momento per svegliarti gradualmente.
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
              Hai dedicato {customTime} minuti al riposo. Il tuo corpo e mente sono ora più freschi e concentrati.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Benefici del power nap</h3>
            <div className="grid md:grid-cols-2 gap-4 text-white/80">
              <div className="text-left">
                <p>✓ Miglioramento della concentrazione</p>
                <p>✓ Aumento della creatività</p>
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
