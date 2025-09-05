'use client'
import React, { useState, useEffect, useRef } from 'react';

interface BreathAnimatorProps {
  isActive: boolean;
  pattern: '4-7-8' | '5-5' | 'custom';
  inhaleTime?: number; // seconds
  holdTime?: number; // seconds  
  exhaleTime?: number; // seconds
  onCycleComplete?: () => void;
  onPhaseChange?: (phase: 'inhale' | 'hold' | 'exhale', timeRemaining: number) => void;
  size?: number; // diameter in pixels
  className?: string;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export default function BreathAnimator({
  isActive,
  pattern,
  inhaleTime,
  holdTime,
  exhaleTime,
  onCycleComplete,
  onPhaseChange,
  size = 200,
  className = ''
}: BreathAnimatorProps) {
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('pause');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get timing based on pattern
  const getPatternTiming = () => {
    switch (pattern) {
      case '4-7-8':
        return { inhale: 4, hold: 7, exhale: 8 };
      case '5-5':
        return { inhale: 5, hold: 0, exhale: 5 };
      case 'custom':
        return { 
          inhale: inhaleTime || 4, 
          hold: holdTime || 0, 
          exhale: exhaleTime || 4 
        };
      default:
        return { inhale: 4, hold: 0, exhale: 4 };
    }
  };

  const timing = getPatternTiming();

  // Start breathing cycle
  const startBreathingCycle = () => {
    if (!isActive) return;
    
    setCurrentPhase('inhale');
    setTimeRemaining(timing.inhale);
    
    // Inhale phase
    phaseTimeoutRef.current = setTimeout(() => {
      if (timing.hold > 0) {
        setCurrentPhase('hold');
        setTimeRemaining(timing.hold);
        
        // Hold phase
        phaseTimeoutRef.current = setTimeout(() => {
          setCurrentPhase('exhale');
          setTimeRemaining(timing.exhale);
          
          // Exhale phase
          phaseTimeoutRef.current = setTimeout(() => {
            setCurrentPhase('pause');
            setTimeRemaining(1);
            setCycleCount(prev => prev + 1);
            onCycleComplete?.();
            
            // Brief pause before next cycle
            phaseTimeoutRef.current = setTimeout(() => {
              if (isActive) {
                startBreathingCycle();
              }
            }, 1000);
          }, timing.exhale * 1000);
        }, timing.hold * 1000);
      } else {
        // Skip hold, go directly to exhale
        setCurrentPhase('exhale');
        setTimeRemaining(timing.exhale);
        
        phaseTimeoutRef.current = setTimeout(() => {
          setCurrentPhase('pause');
          setTimeRemaining(1);
          setCycleCount(prev => prev + 1);
          onCycleComplete?.();
          
          phaseTimeoutRef.current = setTimeout(() => {
            if (isActive) {
              startBreathingCycle();
            }
          }, 1000);
        }, timing.exhale * 1000);
      }
    }, timing.inhale * 1000);
  };

  // Countdown timer
  useEffect(() => {
    if (currentPhase !== 'pause' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - 0.1);
          onPhaseChange?.(currentPhase as 'inhale' | 'hold' | 'exhale', newTime);
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentPhase, timeRemaining, onPhaseChange]);

  // Start/stop breathing based on isActive
  useEffect(() => {
    if (isActive && currentPhase === 'pause') {
      startBreathingCycle();
    } else if (!isActive) {
      setCurrentPhase('pause');
      setTimeRemaining(0);
      setCycleCount(0);
    }

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  // Calculate animation scale and colors
  const getAnimationValues = () => {
    const baseScale = 0.6;
    const maxScale = 1.0;
    
    switch (currentPhase) {
      case 'inhale':
        const inhaleProgress = 1 - (timeRemaining / timing.inhale);
        return {
          scale: baseScale + (maxScale - baseScale) * inhaleProgress,
          color: `rgb(59, 130, 246)`, // blue
          opacity: 0.7 + 0.3 * inhaleProgress
        };
      case 'hold':
        return {
          scale: maxScale,
          color: `rgb(168, 85, 247)`, // purple
          opacity: 1.0
        };
      case 'exhale':
        const exhaleProgress = timeRemaining / timing.exhale;
        return {
          scale: baseScale + (maxScale - baseScale) * exhaleProgress,
          color: `rgb(34, 197, 94)`, // green
          opacity: 0.4 + 0.6 * exhaleProgress
        };
      case 'pause':
      default:
        return {
          scale: baseScale,
          color: `rgb(156, 163, 175)`, // gray
          opacity: 0.4
        };
    }
  };

  const { scale, color, opacity } = getAnimationValues();

  // Get instruction text
  const getInstructionText = () => {
    switch (currentPhase) {
      case 'inhale':
        return pattern === '4-7-8' ? 'Inspira dal naso' : 'Inspira lentamente';
      case 'hold':
        return 'Trattieni il respiro';
      case 'exhale':
        return pattern === '4-7-8' ? 'Espira dalla bocca' : 'Espira lentamente';
      case 'pause':
        return isActive ? 'Preparati...' : 'Premi play per iniziare';
      default:
        return '';
    }
  };

  const getCountText = () => {
    if (currentPhase === 'pause') return '';
    return Math.ceil(timeRemaining).toString();
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Breathing Circle */}
      <div 
        className="relative flex items-center justify-center transition-all duration-300 ease-in-out"
        style={{
          width: size,
          height: size,
          transform: `scale(${scale})`,
        }}
      >
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-300"
          style={{
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
            transform: `scale(${1.2 + (scale - 0.6) * 0.5})`,
          }}
        />
        
        {/* Main circle */}
        <div 
          className="relative rounded-full border-4 transition-all duration-300 flex items-center justify-center"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color,
            borderColor: color,
            opacity: opacity,
            boxShadow: `0 0 30px ${color}40`
          }}
        >
          {/* Count display */}
          <div className="text-white text-4xl font-bold">
            {getCountText()}
          </div>
        </div>

        {/* Pulse rings for visual enhancement */}
        {currentPhase === 'inhale' && (
          <>
            <div 
              className="absolute inset-0 rounded-full border-2 animate-ping"
              style={{ borderColor: color + '60' }}
            />
            <div 
              className="absolute inset-0 rounded-full border animate-pulse"
              style={{ 
                borderColor: color + '40',
                transform: 'scale(1.3)'
              }}
            />
          </>
        )}
      </div>

      {/* Instruction Text */}
      <div className="mt-6 text-center">
        <p className="text-lg font-medium text-gray-800 mb-2">
          {getInstructionText()}
        </p>
        
        {/* Phase indicator */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className={`w-3 h-3 rounded-full transition-colors ${
            currentPhase === 'inhale' ? 'bg-blue-500' : 'bg-gray-300'
          }`} />
          {timing.hold > 0 && (
            <div className={`w-3 h-3 rounded-full transition-colors ${
              currentPhase === 'hold' ? 'bg-purple-500' : 'bg-gray-300'
            }`} />
          )}
          <div className={`w-3 h-3 rounded-full transition-colors ${
            currentPhase === 'exhale' ? 'bg-green-500' : 'bg-gray-300'
          }`} />
        </div>

        {/* Cycle counter */}
        {cycleCount > 0 && (
          <p className="text-sm text-gray-600">
            Ciclo {cycleCount}
          </p>
        )}
      </div>
    </div>
  );
}
