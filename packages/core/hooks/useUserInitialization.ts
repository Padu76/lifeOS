// =====================================================
// LifeOS - User Initialization Hook
// File: useUserInitialization.ts
// =====================================================

import { useState, useCallback } from 'react';
import { useTypedEdgeFunction } from './useSupabaseEdgeFunctions';

interface OnboardingAnswers {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic';
  preferred_tone: 'professional' | 'friendly' | 'casual' | 'motivational';
  focus_areas: string[];
  current_stress_level: number; // 1-10
  current_energy_level: number; // 1-10
  current_sleep_quality: number; // 1-10
  main_goals: string[];
  time_availability: 'low' | 'medium' | 'high'; // for interventions
  notification_preferences: {
    push_enabled: boolean;
    optimal_times: string[]; // HH:MM format
  };
  quiet_hours?: {
    start_time: string;
    end_time: string;
  };
}

interface InitializationResult {
  user_profile: {
    id: string;
    user_id: string;
    chronotype: string;
    sensitivity_level: string;
    focus_areas: string[];
    preferences: any;
  };
  initial_life_score: {
    stress: number;
    energy: number;
    sleep: number;
    overall: number;
  };
  welcome_achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
  first_advice?: {
    session_id: string;
    advice_text: string;
    category: string;
    estimated_duration_minutes: number;
  };
  next_steps: {
    immediate_actions: string[];
    recommended_schedule: string[];
    tips_for_success: string[];
  };
}

interface InitializationProgress {
  step: number;
  totalSteps: number;
  currentSection: 'profile' | 'assessment' | 'preferences' | 'goals' | 'finalization';
  completedSections: string[];
}

export function useUserInitialization() {
  const [progress, setProgress] = useState<InitializationProgress>({
    step: 1,
    totalSteps: 5,
    currentSection: 'profile',
    completedSections: []
  });
  
  const [answers, setAnswers] = useState<Partial<OnboardingAnswers>>({});
  const [result, setResult] = useState<InitializationResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const initializeFunction = useTypedEdgeFunction<OnboardingAnswers, InitializationResult>(
    'initialize-user-profile'
  );

  // Update onboarding answers
  const updateAnswers = useCallback((newAnswers: Partial<OnboardingAnswers>) => {
    setAnswers(prev => ({ ...prev, ...newAnswers }));
  }, []);

  // Move to next step
  const nextStep = useCallback((sectionData?: Partial<OnboardingAnswers>) => {
    if (sectionData) {
      updateAnswers(sectionData);
    }

    setProgress(prev => {
      const newStep = Math.min(prev.step + 1, prev.totalSteps);
      const sections = ['profile', 'assessment', 'preferences', 'goals', 'finalization'] as const;
      const currentIndex = sections.indexOf(prev.currentSection);
      const newSection = sections[Math.min(currentIndex + 1, sections.length - 1)];
      
      const completedSections = [...prev.completedSections];
      if (!completedSections.includes(prev.currentSection)) {
        completedSections.push(prev.currentSection);
      }

      return {
        step: newStep,
        totalSteps: prev.totalSteps,
        currentSection: newSection,
        completedSections
      };
    });
  }, [updateAnswers]);

  // Move to previous step
  const previousStep = useCallback(() => {
    setProgress(prev => {
      const newStep = Math.max(prev.step - 1, 1);
      const sections = ['profile', 'assessment', 'preferences', 'goals', 'finalization'] as const;
      const currentIndex = sections.indexOf(prev.currentSection);
      const newSection = sections[Math.max(currentIndex - 1, 0)];

      return {
        ...prev,
        step: newStep,
        currentSection: newSection
      };
    });
  }, []);

  // Go to specific step
  const goToStep = useCallback((step: number, section: 'profile' | 'assessment' | 'preferences' | 'goals' | 'finalization') => {
    setProgress(prev => ({
      ...prev,
      step: Math.max(1, Math.min(step, prev.totalSteps)),
      currentSection: section
    }));
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (): Promise<InitializationResult | null> => {
    // Validate required fields
    const requiredFields: (keyof OnboardingAnswers)[] = [
      'chronotype',
      'sensitivity_level',
      'preferred_tone',
      'focus_areas',
      'current_stress_level',
      'current_energy_level',
      'current_sleep_quality'
    ];

    const missingFields = requiredFields.filter(field => !answers[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    try {
      const completeAnswers = answers as OnboardingAnswers;
      const initResult = await initializeFunction.execute(completeAnswers);
      
      if (initResult) {
        setResult(initResult);
        setIsCompleted(true);
        setProgress(prev => ({
          ...prev,
          step: prev.totalSteps,
          currentSection: 'finalization',
          completedSections: ['profile', 'assessment', 'preferences', 'goals', 'finalization']
        }));
      }
      
      return initResult;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return null;
    }
  }, [answers, initializeFunction.execute]);

  // Quick answer setters for common patterns
  const setChronotype = useCallback((chronotype: 'early_bird' | 'night_owl' | 'intermediate') => {
    updateAnswers({ chronotype });
  }, [updateAnswers]);

  const setSensitivityLevel = useCallback((sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic') => {
    updateAnswers({ sensitivity_level });
  }, [updateAnswers]);

  const setPreferredTone = useCallback((preferred_tone: 'professional' | 'friendly' | 'casual' | 'motivational') => {
    updateAnswers({ preferred_tone });
  }, [updateAnswers]);

  const setFocusAreas = useCallback((focus_areas: string[]) => {
    updateAnswers({ focus_areas });
  }, [updateAnswers]);

  const setCurrentLevels = useCallback((
    stress_level: number,
    energy_level: number,
    sleep_quality: number
  ) => {
    updateAnswers({
      current_stress_level: stress_level,
      current_energy_level: energy_level,
      current_sleep_quality: sleep_quality
    });
  }, [updateAnswers]);

  const setMainGoals = useCallback((main_goals: string[]) => {
    updateAnswers({ main_goals });
  }, [updateAnswers]);

  const setTimeAvailability = useCallback((time_availability: 'low' | 'medium' | 'high') => {
    updateAnswers({ time_availability });
  }, [updateAnswers]);

  const setNotificationPreferences = useCallback((
    push_enabled: boolean,
    optimal_times: string[]
  ) => {
    updateAnswers({
      notification_preferences: {
        push_enabled,
        optimal_times
      }
    });
  }, [updateAnswers]);

  const setQuietHours = useCallback((start_time: string, end_time: string) => {
    updateAnswers({
      quiet_hours: {
        start_time,
        end_time
      }
    });
  }, [updateAnswers]);

  // Validation helpers
  const isStepValid = useCallback((step: number): boolean => {
    switch (step) {
      case 1: // Profile
        return !!(answers.chronotype && answers.sensitivity_level && answers.preferred_tone);
      case 2: // Assessment
        return !!(
          answers.current_stress_level &&
          answers.current_energy_level &&
          answers.current_sleep_quality
        );
      case 3: // Preferences
        return !!(answers.focus_areas && answers.focus_areas.length > 0);
      case 4: // Goals
        return !!(answers.time_availability);
      case 5: // Finalization
        return true;
      default:
        return false;
    }
  }, [answers]);

  const getCompletionPercentage = useCallback((): number => {
    return Math.round((progress.step / progress.totalSteps) * 100);
  }, [progress]);

  const canProceed = useCallback((): boolean => {
    return isStepValid(progress.step);
  }, [isStepValid, progress.step]);

  // Reset onboarding
  const reset = useCallback(() => {
    setProgress({
      step: 1,
      totalSteps: 5,
      currentSection: 'profile',
      completedSections: []
    });
    setAnswers({});
    setResult(null);
    setIsCompleted(false);
    initializeFunction.reset();
  }, [initializeFunction.reset]);

  return {
    // State
    progress,
    answers,
    result,
    isCompleted,
    
    // Loading and error states
    loading: initializeFunction.loading,
    error: initializeFunction.error,
    
    // Navigation methods
    nextStep,
    previousStep,
    goToStep,
    
    // Answer methods
    updateAnswers,
    setChronotype,
    setSensitivityLevel,
    setPreferredTone,
    setFocusAreas,
    setCurrentLevels,
    setMainGoals,
    setTimeAvailability,
    setNotificationPreferences,
    setQuietHours,
    
    // Completion
    completeOnboarding,
    
    // Validation and utilities
    isStepValid,
    getCompletionPercentage,
    canProceed,
    reset
  };
}
