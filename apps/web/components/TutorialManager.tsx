'use client'
import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Flag, Loader2 } from 'lucide-react';
import TutorialStepComponent from './TutorialStep';
import { useTutorials, TutorialRecipe } from '../hooks/useTutorials';

interface TutorialManagerProps {
  tutorialKey: string; // Changed from suggestion object to tutorial key
  isOpen: boolean;
  onClose: () => void;
  onComplete: (timeSpent: number, feedback?: number) => void;
  onExit?: () => void;
}

export default function TutorialManager({
  tutorialKey,
  isOpen,
  onClose,
  onComplete,
  onExit
}: TutorialManagerProps) {
  const { 
    getTutorialByKey, 
    startSession, 
    completeSession, 
    logStep, 
    saving, 
    error 
  } = useTutorials();

  const [tutorial, setTutorial] = useState<TutorialRecipe | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [feedback, setFeedback] = useState<number | undefined>(undefined);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load tutorial when key changes
  useEffect(() => {
    if (tutorialKey) {
      const foundTutorial = getTutorialByKey(tutorialKey);
      setTutorial(foundTutorial);
    }
  }, [tutorialKey, getTutorialByKey]);

  // Initialize when tutorial opens
  useEffect(() => {
    if (isOpen && tutorial && !sessionId) {
      initializeSession();
    }
  }, [isOpen, tutorial, sessionId]);

  const initializeSession = async () => {
    if (!tutorial) return;
    
    setLoading(true);
    
    try {
      const newSessionId = await startSession(tutorial.id);
      if (newSessionId) {
        setSessionId(newSessionId);
        setStartTime(new Date());
        setCurrentStepIndex(0);
        setIsCompleted(false);
        setFeedback(undefined);
        setShowFeedback(false);
        
        // Log first step start
        await logStep(newSessionId, 1, 'started');
      }
    } catch (err) {
      console.error('Error initializing session:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle step completion
  const handleStepComplete = async () => {
    if (!sessionId || !tutorial) return;

    // Log current step as completed
    await logStep(sessionId, currentStepIndex + 1, 'completed');

    if (currentStepIndex < tutorial.steps.length - 1) {
      // Move to next step
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      
      // Log next step as started
      await logStep(sessionId, nextStepIndex + 1, 'started');
    } else {
      // Last step completed
      setIsCompleted(true);
      setShowFeedback(true);
    }
  };

  // Handle tutorial completion with feedback
  const handleTutorialComplete = async () => {
    if (!sessionId) return;

    try {
      await completeSession(sessionId, feedback, undefined);
      
      const timeSpent = startTime ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000) : 0;
      onComplete(timeSpent, feedback);
      onClose();
      
      // Reset state
      resetState();
    } catch (err) {
      console.error('Error completing tutorial:', err);
    }
  };

  // Handle skip step
  const handleStepSkip = async () => {
    if (!sessionId) return;

    // Log current step as skipped
    await logStep(sessionId, currentStepIndex + 1, 'skipped');
    
    // Move to next step
    handleStepComplete();
  };

  // Handle restart tutorial
  const handleRestart = async () => {
    resetState();
    await initializeSession();
  };

  // Handle early exit
  const handleExit = () => {
    onExit?.();
    onClose();
    resetState();
  };

  const resetState = () => {
    setSessionId(null);
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setStartTime(null);
    setFeedback(undefined);
    setShowFeedback(false);
  };

  // Get breathing pattern for breathing exercises
  const getBreathingPattern = (): '4-7-8' | '5-5' => {
    if (!tutorial) return '4-7-8';
    if (tutorial.key.includes('478')) return '4-7-8';
    if (tutorial.key.includes('55')) return '5-5';
    return '4-7-8'; // default
  };

  // Calculate total progress
  const getProgress = () => {
    if (!tutorial) return 0;
    if (isCompleted) return 100;
    return Math.round((currentStepIndex / tutorial.steps.length) * 100);
  };

  // Get estimated time remaining
  const getTimeRemaining = () => {
    if (!tutorial) return 0;
    const remainingSteps = tutorial.steps.slice(currentStepIndex);
    const totalTime = remainingSteps.reduce((sum, step) => sum + (step.duration_sec || 0), 0);
    return totalTime;
  };

  // Feedback component
  const FeedbackComponent = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900">Ottimo lavoro!</h2>
      <p className="text-gray-600">
        Hai completato "{tutorial?.title}". Come ti senti ora?
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
            disabled={saving}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{feedback ? 'Completa' : 'Salta Feedback'}</span>
          </button>
          
          <button
            onClick={handleRestart}
            disabled={saving}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Ripeti Tutorial
          </button>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading || !tutorial) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Caricamento tutorial...</p>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tutorial.title}</h1>
              <p className="text-sm text-gray-600">{tutorial.short_copy}</p>
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
              <span>Step {currentStepIndex + 1} di {tutorial.steps.length}</span>
              <span>~{Math.ceil(getTimeRemaining() / 60)} min rimanenti</span>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {showFeedback ? (
            <FeedbackComponent />
          ) : (
            <TutorialStepComponent
              step={tutorial.steps[currentStepIndex]}
              isActive={true}
              onStepComplete={handleStepComplete}
              onStepSkip={handleStepSkip}
              totalSteps={tutorial.steps.length}
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
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ricomincia</span>
              </button>

              <button
                onClick={() => {
                  setIsCompleted(true);
                  setShowFeedback(true);
                }}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
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
