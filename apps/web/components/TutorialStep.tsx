'use client'
import React, { useState, useEffect, useRef } from 'react';
import BreathAnimator from './BreathAnimator';

interface TutorialStep {
  step: number;
  instruction: string;
  duration_sec?: number;
  animation_type?: 'breathing_circle' | 'timer' | 'movement' | null;
  audio_cue?: string;
}

interface TutorialStepProps {
  step: TutorialStep;
  isActive: boolean;
  onStepComplete: () => void;
  onStepSkip?: () => void;
  totalSteps: number;
  currentStepIndex: number;
  breathingPattern?: '4-7-8' | '5-5';
}

export default function TutorialStepComponent({
  step,
  isActive,
  onStepComplete,
  onStepSkip,
  totalSteps,
  currentStepIndex,
  breathingPattern = '4-7-8'
}: TutorialStepProps) {
  const [timeRemaining, setTimeRemaining] = useState(step.duration_sec || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-start when step becomes active
  useEffect(() => {
    if (isActive && step.duration_sec && step.duration_sec > 0) {
      setTimeRemaining(step.duration_sec);
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [isActive, step.duration_sec]);

  // Timer countdown
  useEffect(() => {
    if (isPlaying && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsPlaying(false);
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
  }, [isPlaying, isPaused, timeRemaining, onStepComplete]);

  // Text-to-speech for audio cues
  const speakAudioCue = () => {
    if (step.audio_cue && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(step.audio_cue);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.7;
      
      // Try to use Italian voice if available
      const voices = window.speechSynthesis.getVoices();
      const italianVoice = voices.find(voice => 
        voice.lang.startsWith('it') || voice.name.toLowerCase().includes('italian')
      );
      if (italianVoice) {
        utterance.voice = italianVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Play/pause controls
  const handlePlayPause = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeRemaining(step.duration_sec || 0);
  };

  const handleSkip = () => {
    setIsPlaying(false);
    setTimeRemaining(0);
    onStepSkip?.();
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
              onCycleComplete={() => {
                // Optional: trigger audio cue on each breath cycle
                if (step.audio_cue && isPlaying) {
                  speakAudioCue();
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

      {/* Instruction */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {step.instruction}
        </h3>
        
        {step.audio_cue && (
          <button
            onClick={speakAudioCue}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            🔊 Ascolta guida vocale
          </button>
        )}
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
    </div>
  );
}
