'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Moon, Clock, CheckCircle } from 'lucide-react';

interface AudioSource {
  stop: () => void;
}

export const PowerNapGuide: React.FC = () => {
  const [phase, setPhase] = useState<'preparation' | 'timer' | 'wakeup' | 'completed'>('preparation');
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState('rain');
  const [customTime, setCustomTime] = useState(15);
  const [volume, setVolume] = useState(0.3);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioSourceRef = useRef<AudioSource | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setPhase('wakeup');
            stopAmbientSound();
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
      stopAmbientSound();
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createRelaxingAmbientSound = (type: string) => {
    if (!soundEnabled || type === 'silence') return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      let oscillator1: OscillatorNode;
      let oscillator2: OscillatorNode;
      let gainNode: GainNode;
      let filter: BiquadFilterNode;

      switch (type) {
        case 'rain':
          // Gentle pink noise for rain
          const bufferSize = 4096;
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
          const output = buffer.getChannelData(0);
          
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
          }
          
          const whiteNoise = audioContext.createBufferSource();
          whiteNoise.buffer = buffer;
          whiteNoise.loop = true;
          
          gainNode = audioContext.createGain();
          gainNode.gain.setValueAtTime(volume * 0.15, audioContext.currentTime);
          
          filter = audioContext.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, audioContext.currentTime);
          
          whiteNoise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioContext.destination);
          whiteNoise.start();
          
          audioSourceRef.current = {
            stop: () => {
              try {
                whiteNoise.stop();
              } catch (e) {
                // Already stopped
              }
            }
          };
          break;

        case 'ocean':
          // Low frequency waves with gentle oscillation
          oscillator1 = audioContext.createOscillator();
          oscillator2 = audioContext.createOscillator();
          gainNode = audioContext.createGain();
          
          oscillator1.type = 'sine';
          oscillator1.frequency.setValueAtTime(60, audioContext.currentTime);
          
          oscillator2.type = 'sine';
          oscillator2.frequency.setValueAtTime(0.2, audioContext.currentTime);
          
          const gainNode2 = audioContext.createGain();
          gainNode2.gain.setValueAtTime(30, audioContext.currentTime);
          
          oscillator2.connect(gainNode2);
          gainNode2.connect(oscillator1.frequency);
          
          gainNode.gain.setValueAtTime(volume * 0.1, audioContext.currentTime);
          
          oscillator1.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator1.start();
          oscillator2.start();
          
          audioSourceRef.current = {
            stop: () => {
              try {
                oscillator1.stop();
                oscillator2.stop();
              } catch (e) {
                // Already stopped
              }
            }
          };
          break;

        case 'forest':
          // Multiple gentle tones for forest ambience
          const frequencies = [220, 330, 440, 550];
          const oscillators: OscillatorNode[] = [];
          const gains: GainNode[] = [];
          
          frequencies.forEach((freq, index) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq + Math.random() * 20 - 10, audioContext.currentTime);
            
            gain.gain.setValueAtTime(volume * 0.02 * (1 - index * 0.2), audioContext.currentTime);
            
            gain.gain.setTargetAtTime(volume * 0.01 * (1 - index * 0.2), audioContext.currentTime + Math.random() * 5, 2);
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.start();
            
            oscillators.push(osc);
            gains.push(gain);
          });
          
          audioSourceRef.current = {
            stop: () => {
              try {
                oscillators.forEach(osc => osc.stop());
              } catch (e) {
                // Already stopped
              }
            }
          };
          break;
      }
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  };

  const playAmbientSound = () => {
    if (!soundEnabled || ambientSound === 'silence') return;
    
    try {
      stopAmbientSound();
      setTimeout(() => {
        createRelaxingAmbientSound(ambientSound);
      }, 100);
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  };

  const stopAmbientSound = () => {
    try {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
    } catch (error) {
      console.warn('Error stopping audio:', error);
    }
  };

  const playWakeupChimes = () => {
    if (!soundEnabled) return;
    
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
      console.warn('Wakeup sound not supported:', error);
    }
  };

  const startTimer = () => {
    setTimeLeft(customTime * 60);
    setIsActive(true);
    setPhase('timer');
    if (soundEnabled) {
      setTimeout(() => playAmbientSound(), 200);
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
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white/60 text-sm w-8">{Math.round(volume * 100)}%</span>
                  </div>
                </div>
              )}

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

              {soundEnabled && ambientSound !== 'silence' && (
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200 text-sm">Prova il suono selezionato (3 secondi):</span>
                    <button
                      onClick={() => {
                        stopAmbientSound();
                        setTimeout(() => {
                          createRelaxingAmbientSound(ambientSound);
                          setTimeout(() => stopAmbientSound(), 3000);
                        }, 100);
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
                setSoundEnabled(!soundEnabled);
                if (soundEnabled) {
                  stopAmbientSound();
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
