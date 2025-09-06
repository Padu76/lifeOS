// =====================================================
// LifeOS - Micro Advice Hook
// File: useMicroAdvice.ts
// =====================================================

import { useState, useCallback, useEffect } from 'react';
import { useTypedEdgeFunction } from './useSupabaseEdgeFunctions';

interface HealthMetrics {
  timestamp: string;
  stress_level?: number;
  energy_level?: number;
  sleep_quality?: number;
  mood?: string;
  heart_rate?: number;
  steps?: number;
  [key: string]: any;
}

interface LifeScoreV2 {
  stress: number;
  energy: number;
  sleep: number;
  overall: number;
}

interface MicroAdvice {
  session_id: string;
  advice_text: string;
  advice_type: 'immediate' | 'scheduled' | 'contextual';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimated_duration_minutes: number;
  expires_at: string;
  created_at: string;
  personalization_factors: {
    chronotype_optimized: boolean;
    stress_level_considered: boolean;
    energy_level_considered: boolean;
    context_aware: boolean;
  };
  effectiveness_tracking: {
    expected_stress_impact: number;
    expected_energy_impact: number;
    confidence_score: number;
  };
}

interface GenerateAdviceInput {
  health_metrics: HealthMetrics;
  life_score: LifeScoreV2;
  context?: {
    current_activity?: string;
    location?: string;
    calendar_availability?: boolean;
  };
}

interface AdviceResponseInput {
  session_id: string;
  response_type: 'completed' | 'dismissed' | 'snoozed';
  completion_rating?: number;
  user_feedback?: string;
  actual_duration_minutes?: number;
  snooze_duration_minutes?: number;
}

export function useMicroAdvice() {
  const [currentAdvice, setCurrentAdvice] = useState<MicroAdvice | null>(null);
  const [recentAdvice, setRecentAdvice] = useState<MicroAdvice[]>([]);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const generateAdviceFunction = useTypedEdgeFunction<GenerateAdviceInput, MicroAdvice>(
    'generate-micro-advice'
  );

  const responseFunction = useTypedEdgeFunction<AdviceResponseInput, { success: boolean; next_advice?: MicroAdvice }>(
    'handle-advice-response'
  );

  // Generate new micro advice
  const generateAdvice = useCallback(async (
    healthMetrics: HealthMetrics,
    lifeScore: LifeScoreV2,
    context?: any
  ): Promise<MicroAdvice | null> => {
    try {
      const input: GenerateAdviceInput = {
        health_metrics: healthMetrics,
        life_score: lifeScore,
        context
      };

      const advice = await generateAdviceFunction.execute(input);
      
      if (advice) {
        setCurrentAdvice(advice);
        setRecentAdvice(prev => [advice, ...prev.slice(0, 9)]); // Keep last 10
      }
      
      return advice;
    } catch (error) {
      console.error('Error generating advice:', error);
      return null;
    }
  }, [generateAdviceFunction.execute]);

  // Respond to advice (complete, dismiss, snooze)
  const respondToAdvice = useCallback(async (
    sessionId: string,
    responseType: 'completed' | 'dismissed' | 'snoozed',
    options?: {
      rating?: number;
      feedback?: string;
      actualDuration?: number;
      snoozeDuration?: number;
    }
  ): Promise<boolean> => {
    try {
      const input: AdviceResponseInput = {
        session_id: sessionId,
        response_type: responseType,
        completion_rating: options?.rating,
        user_feedback: options?.feedback,
        actual_duration_minutes: options?.actualDuration,
        snooze_duration_minutes: options?.snoozeDuration
      };

      const result = await responseFunction.execute(input);
      
      if (result?.success) {
        setLastResponse(responseType);
        
        // Clear current advice if completed or dismissed
        if (responseType === 'completed' || responseType === 'dismissed') {
          setCurrentAdvice(null);
        }
        
        // Set next advice if provided
        if (result.next_advice) {
          setCurrentAdvice(result.next_advice);
          setRecentAdvice(prev => [result.next_advice!, ...prev.slice(0, 9)]);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error responding to advice:', error);
      return false;
    }
  }, [responseFunction.execute]);

  // Quick response methods
  const completeAdvice = useCallback(async (
    sessionId: string,
    rating?: number,
    feedback?: string,
    actualDuration?: number
  ): Promise<boolean> => {
    return respondToAdvice(sessionId, 'completed', {
      rating,
      feedback,
      actualDuration
    });
  }, [respondToAdvice]);

  const dismissAdvice = useCallback(async (
    sessionId: string,
    feedback?: string
  ): Promise<boolean> => {
    return respondToAdvice(sessionId, 'dismissed', { feedback });
  }, [respondToAdvice]);

  const snoozeAdvice = useCallback(async (
    sessionId: string,
    snoozeDuration: number = 30
  ): Promise<boolean> => {
    return respondToAdvice(sessionId, 'snoozed', { snoozeDuration });
  }, [respondToAdvice]);

  // Check if current advice is expired
  const isAdviceExpired = useCallback((advice: MicroAdvice): boolean => {
    return new Date(advice.expires_at) < new Date();
  }, []);

  // Auto-clear expired advice
  useEffect(() => {
    if (currentAdvice && isAdviceExpired(currentAdvice)) {
      setCurrentAdvice(null);
    }
  }, [currentAdvice, isAdviceExpired]);

  // Reset states
  const reset = useCallback(() => {
    setCurrentAdvice(null);
    setRecentAdvice([]);
    setLastResponse(null);
    generateAdviceFunction.reset();
    responseFunction.reset();
  }, [generateAdviceFunction.reset, responseFunction.reset]);

  return {
    // State
    currentAdvice,
    recentAdvice,
    lastResponse,
    
    // Loading states
    isGenerating: generateAdviceFunction.loading,
    isResponding: responseFunction.loading,
    
    // Errors
    generateError: generateAdviceFunction.error,
    responseError: responseFunction.error,
    
    // Methods
    generateAdvice,
    respondToAdvice,
    completeAdvice,
    dismissAdvice,
    snoozeAdvice,
    isAdviceExpired,
    reset
  };
}
