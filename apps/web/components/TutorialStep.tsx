'use client'
import React, { useState, useEffect, useRef } from 'react';
import BreathAnimator from './BreathAnimator';

interface VoiceGuidance {
  start?: string;
  during?: string;
  end?: string;
}

interface TutorialStep {
  step: number;
  instruction: string;
  duration_sec?: number;
  animation_type?: 'breathing_circle' | 'timer' | 'movement' | null;
  audio_cue?: string;
  voice_guidance?: VoiceGuidance;
}

interface TutorialStepProps {
  step: TutorialStep;
  isActive: boolean;
  onStepComplete: () => void;
  onStepSkip?: () => void;
  totalSteps: number;
  currentStepIndex: number;
  breathingPattern?: '4-7-8' | '5-5';
  voiceEnabled?: boolean;
}

export default function TutorialStepComponent({
  step,
  isActive,
  onStepComplete,
  onStepSkip,
  totalSteps,
  currentStepIndex,
  breathingPattern = '4-7-8',
  voiceEnabled = true
}: TutorialStepProps) {
  const [timeRemaining, setTimeRemaining] = useState(step.duration_sec || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceActive, setVoiceActive] = useState(voiceEnabled);
  const [currentBreathPhase, setCurrentBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Voice synthesis setup
  const speak = (text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) => {
    if (!voiceActive || !text || !('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.8;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;
    
    // Try to use Italian voice if available
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find(voice => 
      voice.lang.startsWith('it') || voice.name.toLowerCase().includes('italian')
    );
    if (italianVoice) {
      utterance.voice = italianVoice;
    }
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Breathing-specific voice guidance
  const speakBreathingCue = (phase: 'inhale' | 'hold' | 'exhale', count: number) => {
    if (!voiceActive) return;
    
    const cues = {
      'inhale': `Inspira per ${count}`,
      'hold': `Trattieni per ${count}`,
      'exhale': `Espira per ${count}`
    };
    
    speak(cues[phase], { rate: 0.7 });
  };

  // Auto-start when step becomes active
  useEffect(() => {
    if (isActive && step.duration_sec && step.duration_sec > 0) {
      setTimeRemaining(step.duration_sec);
      setIsPlaying(true);
      setIsPaused(false);
      
      // Speak initial instruction
      if (voiceActive && step.instruction) {
        setTimeout(() => {
          speak(step.instruction);
        }, 500);
      }
      
      // Speak start guidance if available
      if (voiceActive && step.voice_guidance?.start) {
        setTimeout(() => {
          speak(step.voice_guidance.start);
        }, 2000);
      }
    } else {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isActive, step.duration_sec, step.instruction, voiceActive, step.voice_guidance]);

  // Timer countdown with voice guidance
  useEffect(() => {
    if (isPlaying && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          
          // Voice guidance during specific moments
          if (voiceActive && step.voice_guidance?.during) {
            const totalDuration = step.duration_sec || 0;
            const elapsed = totalDuration - newTime;
            
            // Speak guidance at quarter points
            if (elapsed === Math.floor(totalDuration * 0.25) || 
                elapsed === Math.floor(totalDuration * 0.5) || 
                elapsed === Math.floor(totalDuration * 0.75)) {
              speak(step.voice_guidance.during);
            }
          }
          
          // Final countdown for breathing exercises
          if (step.animation_type === 'breathing_circle' && newTime <= 5 && newTime > 0) {
            speak(`${newTime}`);
          }
          
          if (newTime <= 0) {
            setIsPlaying(false);
            
            // Speak end guidance
            if (voiceActive && step.voice_guidance?.end) {
              speak(step.voice_guidance.end);
            }
            
            onStepComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, isPaused, timeRemaining, onStepComplete, voiceActive, step.voice_guidance, step.animation_type, step.duration_sec]);

  // Handle breathing phase changes for voice guidance
  const handleBreathPhaseChange = (phase: 'inhale' | 'hold' | 'exhale', timeRemaining: number) => {
    if (phase !== currentBreathPhase && step.animation_type === 'breathing_circle' && voiceActive) {
      setCurrentBreathPhase(phase);
      
      // Only speak breathing cues if no other audio is specified
      if (!step.audio_cue && !step.voice_guidance?.during) {
        const count = Math.ceil(timeRemaining);
        if (count > 0) {
          speakBreathingCue(phase, count);
        }
      }
    }
  };

  // Play/pause controls
  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
      if (!isPaused) {
        // Pause voice too
        if ('speechSynthesis' in window) {
          window.speechSynthesis.pause();
        }
      } else {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.resume();
        }
      }
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeRemaining(step.duration_sec || 0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleVoice = () => {
    setVoiceActive(!voiceActive);
    if (voiceActive && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSkip = () => {
    setIsPlaying(false);
    setTimeRemaining(0);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onStepSkip?.();
  };

  // Manual voice trigger for current instruction
  const speakCurrentInstruction = () => {
    if (step.instruction) {
      speak(step.instruction);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = () => {
    if (!step.duration_sec || step.duration_sec === 0) return 100;
    return ((step.duration_sec - timeRemaining) / step.duration_sec) * 100;
  };

  // Render animation based on type
  const renderAnimation = () => {
    switch (step.animation_type) {
      case 'breathing_circle':
        return (
          <div className="flex justify-center my-8">
            <BreathAnimator
              isActive={isPlaying && !isPaused}
              pattern={breathingPattern}
              size={180}
              onPhaseChange={handleBreathPhaseChange}
              onCycleComplete={() => {
                // Optional: trigger voice cue on each breath cycle
                if (step.audio_cue && isPlaying && voiceActive) {
                  speak(step.audio_cue);
                }
              }}
            />
          </div>
        );
      
      case 'timer':
        return (
          <div className="flex justify-center my-8">
            <div className="relative w-32 h-32">
              {/* Progress circle */}
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - getProgress() / 100)}`}
                  className="text-blue-500 transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Time display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        );

      case 'movement':
        return (
          <div className="flex justify-center my-8">
            <div className="text-6xl animate-bounce">
              🏃‍♂️
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isActive) return null;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-medium text-gray-500">
          Step {step.step} di {totalSteps}
        </span>
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= currentStepIndex 
                  ? 'bg-blue-500' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instruction with voice controls */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {step.instruction}
        </h3>
        
        <div className="flex justify-center space-x-3">
          <button
            onClick={speakCurrentInstruction}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
          >
            <span>🔊</span>
            <span>Ripeti istruzione</span>
          </button>
          
          <button
            onClick={toggleVoice}
            className={`text-sm transition-colors flex items-center space-x-1 ${
              voiceActive 
                ? 'text-green-600 hover:text-green-800' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{voiceActive ? '🎤' : '🔇'}</span>
            <span>{voiceActive ? 'Voce ON' : 'Voce OFF'}</span>
          </button>
        </div>
      </div>

      {/* Animation */}
      {renderAnimation()}

      {/* Timer and controls */}
      {step.duration_sec && step.duration_sec > 0 && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${getProgress()}%` }}
            />
          </div>

          {/* Time remaining */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Tempo rimanente: <span className="font-mono">{formatTime(timeRemaining)}</span>
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={handlePlayPause}
              className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
            >
              {isPlaying && !isPaused ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <button
              onClick={handleStop}
              className="flex items-center justify-center w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            </button>

            {onStepSkip && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Salta
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual completion for steps without timer */}
      {(!step.duration_sec || step.duration_sec === 0) && (
        <div className="flex justify-center space-x-3 mt-6">
          <button
            onClick={onStepComplete}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Continua
          </button>
          
          {onStepSkip && (
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Salta
            </button>
          )}
        </div>
      )}

      {/* Voice status indicator */}
      {voiceActive && isPlaying && (
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-green-600">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Guida vocale attiva</span>
        </div>
      )}
    </div>
  );
}
