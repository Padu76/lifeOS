'use client'
import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Flag } from 'lucide-react';
import TutorialStepComponent from './TutorialStep';

interface TutorialStep {
  step: number;
  instruction: string;
  duration_sec?: number;
  animation_type?: 'breathing_circle' | 'timer' | 'movement' | null;
  audio_cue?: string;
}

interface Suggestion {
  id: string;
  key: string;
  title: string;
  short_copy: string;
  category: string;
  duration_sec: number;
  difficulty: number;
  tutorial: TutorialStep[];
}

interface TutorialManagerProps {
  suggestion: Suggestion;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (timeSpent: number, feedback?: number) => void;
  onExit?: () => void;
}

export default function TutorialManager({
  suggestion,
  isOpen,
  onClose,
  onComplete,
  onExit
}: TutorialManagerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [feedback, setFeedback] = useState<number | undefined>(undefined);
  const [showFeedback, setShowFeedback] = useState(false);

  // Initialize when tutorial opens
  useEffect(() => {
    if (isOpen && !startTime) {
      setStartTime(new Date());
      setCurrentStepIndex(0);
      setIsCompleted(false);
      setFeedback(undefined);
      setShowFeedback(false);
    }
  }, [isOpen, startTime]);

  // Handle step completion
  const handleStepComplete = () => {
    if (currentStepIndex < suggestion.tutorial.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Last step completed
      setIsCompleted(true);
      setShowFeedback(true);
    }
  };

  // Handle tutorial completion with feedback
  const handleTutorialComplete = () => {
    const timeSpent = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;
    onComplete(timeSpent, feedback);
    onClose();
  };

  // Handle skip step
  const handleStepSkip = () => {
    handleStepComplete();
  };

  // Handle restart tutorial
  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setStartTime(new Date());
    setFeedback(undefined);
    setShowFeedback(false);
  };

  // Handle early exit
  const handleExit = () => {
    onExit?.();
    onClose();
  };

  // Get breathing pattern for breathing exercises
  const getBreathingPattern = (): '4-7-8' | '5-5' => {
    if (suggestion.key.includes('478')) return '4-7-8';
    if (suggestion.key.includes('5count')) return '5-5';
    return '4-7-8'; // default
  };

  // Calculate total progress
  const getProgress = () => {
    if (isCompleted) return 100;
    return Math.round((currentStepIndex / suggestion.tutorial.length) * 100);
  };

  // Get estimated time remaining
  const getTimeRemaining = () => {
    const remainingSteps = suggestion.tutorial.slice(currentStepIndex);
    const totalTime = remainingSteps.reduce((sum, step) => sum + (step.duration_sec || 0), 0);
    return totalTime;
  };

  // Feedback component
  const FeedbackComponent = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900">Ottimo lavoro!</h2>
      <p className="text-gray-600">
        Hai completato "{suggestion.title}". Come ti senti ora?
      </p>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Valuta il tuo stato d'animo (1-5)</p>
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFeedback(rating)}
              className={`w-12 h-12 rounded-full border-2 transition-all ${
                feedback === rating
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {rating === 1 ? '😞' : rating === 2 ? '😐' : rating === 3 ? '🙂' : rating === 4 ? '😊' : '😄'}
            </button>
          ))}
        </div>
        
        <div className="flex justify-center space-x-3 pt-4">
          <button
            onClick={handleTutorialComplete}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            {feedback ? 'Completa' : 'Salta Feedback'}
          </button>
          
          <button
            onClick={handleRestart}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Ripeti Tutorial
          </button>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{suggestion.title}</h1>
              <p className="text-sm text-gray-600">{suggestion.short_copy}</p>
            </div>
            <button
              onClick={handleExit}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{getProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          {!isCompleted && (
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Step {currentStepIndex + 1} di {suggestion.tutorial.length}</span>
              <span>~{Math.ceil(getTimeRemaining() / 60)} min rimanenti</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {showFeedback ? (
            <FeedbackComponent />
          ) : (
            <TutorialStepComponent
              step={suggestion.tutorial[currentStepIndex]}
              isActive={true}
              onStepComplete={handleStepComplete}
              onStepSkip={handleStepSkip}
              totalSteps={suggestion.tutorial.length}
              currentStepIndex={currentStepIndex}
              breathingPattern={getBreathingPattern()}
            />
          )}
        </div>

        {/* Footer */}
        {!showFeedback && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-2xl">
            <div className="flex justify-between items-center">
              <button
                onClick={handleRestart}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ricomincia</span>
              </button>

              <button
                onClick={() => {
                  setIsCompleted(true);
                  setShowFeedback(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span>Termina Ora</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
