// =====================================================
// LifeOS Advanced Emotion Detection System
// File: supabase/functions/_shared/emotion-detection-system.ts
// =====================================================

import { HealthMetrics, LifeScoreV2, UserProfile } from '../../types';

// Enhanced emotion types with confidence and context
interface EmotionPrediction {
  primary_emotion: EmotionalState;
  secondary_emotion?: EmotionalState;
  confidence: number; // 0-1
  intensity: number; // 0-10
  stability: number; // How stable this emotion is expected to be (0-1)
  triggers: EmotionTrigger[];
  duration_estimate: number; // minutes
  optimal_intervention_window: number; // minutes from now
}

interface EmotionTrigger {
  type: 'stress_spike' | 'energy_drop' | 'sleep_debt' | 'weather' | 'time_pattern' | 'external';
  severity: number; // 0-1
  confidence: number; // 0-1
  description: string;
}

interface EmotionPattern {
  user_id: string;
  emotion: EmotionalState;
  time_of_day: number; // 0-23
  day_of_week: number; // 0-6
  frequency: number;
  effectiveness_history: Record<string, number>;
  last_occurrence: Date;
}

interface ContextualFactors {
  weather?: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
    temperature: number;
    pressure: number;
  };
  calendar?: {
    has_meetings_next_2h: boolean;
    meeting_density: number; // meetings per hour
    work_hours_remaining: number;
  };
  location?: {
    type: 'home' | 'work' | 'gym' | 'outdoor' | 'transport';
    noise_level: number; // 0-10
  };
  physiological?: {
    heart_rate_variability?: number;
    recent_activity_level: number; // 0-10
    hydration_estimate: number; // 0-10
  };
}

type EmotionalState = 'stressed' | 'energetic' | 'tired' | 'balanced' | 'anxious' | 'motivated' | 'overwhelmed' | 'focused' | 'restless' | 'serene';

export class AdvancedEmotionDetector {
  private emotionPatterns: Map<string, EmotionPattern[]> = new Map();
  private recentPredictions: Map<string, EmotionPrediction[]> = new Map();

  // Main emotion prediction method
  async predictEmotion(
    userId: string,
    lifeScore: LifeScoreV2,
    metrics: HealthMetrics,
    userProfile: UserProfile,
    contextualFactors?: ContextualFactors,
    historicalData?: any[]
  ): Promise<EmotionPrediction> {
    
    // 1. Analyze current physiological state
    const physiologicalEmotion = this.analyzePhysiologicalState(lifeScore, metrics);
    
    // 2. Analyze temporal patterns
    const temporalEmotion = await this.analyzeTemporalPatterns(userId, historicalData);
    
    // 3. Analyze contextual factors
    const contextualEmotion = this.analyzeContextualFactors(contextualFactors);
    
    // 4. Detect triggers and patterns
    const triggers = this.detectEmotionTriggers(lifeScore, metrics, contextualFactors);
    
    // 5. Combine predictions with weighted confidence
    const finalPrediction = this.combinePredictions([
      { prediction: physiologicalEmotion, weight: 0.4 },
      { prediction: temporalEmotion, weight: 0.35 },
      { prediction: contextualEmotion, weight: 0.25 }
    ]);
    
    // 6. Calculate intervention timing
    const interventionTiming = this.calculateOptimalInterventionWindow(
      finalPrediction,
      triggers,
      contextualFactors
    );
    
    const emotionPrediction: EmotionPrediction = {
      primary_emotion: finalPrediction.emotion,
      secondary_emotion: finalPrediction.secondary,
      confidence: finalPrediction.confidence,
      intensity: finalPrediction.intensity,
      stability: this.calculateEmotionStability(finalPrediction, triggers),
      triggers: triggers,
      duration_estimate: this.estimateEmotionDuration(finalPrediction, triggers),
      optimal_intervention_window: interventionTiming
    };
    
    // Store prediction for learning
    this.storePrediction(userId, emotionPrediction);
    
    return emotionPrediction;
  }

  // Analyze physiological indicators
  private analyzePhysiologicalState(
    lifeScore: LifeScoreV2,
    metrics: HealthMetrics
  ): { emotion: EmotionalState; confidence: number; intensity: number; secondary?: EmotionalState } {
    
    const { stress, energy, sleep, overall } = lifeScore;
    
    // Multi-dimensional analysis
    const stressLevel = stress / 10;
    const energyLevel = energy / 10;
    const sleepQuality = sleep / 10;
    const overallLevel = overall / 10;
    
    // Complex emotion mapping
    if (stressLevel > 0.8 && energyLevel < 0.4) {
      return {
        emotion: 'overwhelmed',
        secondary: 'anxious',
        confidence: 0.85,
        intensity: Math.min(stressLevel * 10, 10)
      };
    }
    
    if (stressLevel > 0.7 && sleepQuality < 0.5) {
      return {
        emotion: 'anxious',
        secondary: 'tired',
        confidence: 0.8,
        intensity: stressLevel * 8
      };
    }
    
    if (energyLevel > 0.8 && stressLevel < 0.3 && overallLevel > 0.7) {
      return {
        emotion: 'energetic',
        secondary: 'motivated',
        confidence: 0.9,
        intensity: energyLevel * 9
      };
    }
    
    if (energyLevel > 0.7 && stressLevel < 0.4) {
      return {
        emotion: 'motivated',
        confidence: 0.75,
        intensity: energyLevel * 7
      };
    }
    
    if (energyLevel < 0.3 || sleepQuality < 0.4) {
      return {
        emotion: 'tired',
        confidence: 0.8,
        intensity: (1 - energyLevel) * 8
      };
    }
    
    if (stressLevel > 0.6) {
      return {
        emotion: 'stressed',
        confidence: 0.7,
        intensity: stressLevel * 7
      };
    }
    
    if (energyLevel > 0.6 && stressLevel < 0.5 && overallLevel > 0.6) {
      return {
        emotion: 'focused',
        confidence: 0.65,
        intensity: 6
      };
    }
    
    if (stressLevel < 0.4 && energyLevel > 0.5 && sleepQuality > 0.6) {
      return {
        emotion: 'serene',
        confidence: 0.8,
        intensity: 5
      };
    }
    
    // Default balanced state
    return {
      emotion: 'balanced',
      confidence: 0.6,
      intensity: 5
    };
  }

  // Analyze user's historical emotional patterns
  private async analyzeTemporalPatterns(
    userId: string,
    historicalData?: any[]
  ): Promise<{ emotion: EmotionalState; confidence: number; intensity: number; secondary?: EmotionalState }> {
    
    const userPatterns = this.emotionPatterns.get(userId) || [];
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();
    
    // Find patterns for current time
    const relevantPatterns = userPatterns.filter(pattern => 
      Math.abs(pattern.time_of_day - currentHour) <= 1 &&
      pattern.day_of_week === currentDay
    );
    
    if (relevantPatterns.length === 0) {
      return {
        emotion: 'balanced',
        confidence: 0.3,
        intensity: 5
      };
    }
    
    // Weight by frequency and recency
    const weightedPatterns = relevantPatterns.map(pattern => ({
      ...pattern,
      weight: pattern.frequency * this.calculateRecencyWeight(pattern.last_occurrence)
    }));
    
    // Find most likely emotion
    const emotionScores = new Map<EmotionalState, number>();
    weightedPatterns.forEach(pattern => {
      const current = emotionScores.get(pattern.emotion) || 0;
      emotionScores.set(pattern.emotion, current + pattern.weight);
    });
    
    const sortedEmotions = Array.from(emotionScores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    if (sortedEmotions.length === 0) {
      return {
        emotion: 'balanced',
        confidence: 0.3,
        intensity: 5
      };
    }
    
    const primaryEmotion = sortedEmotions[0];
    const secondaryEmotion = sortedEmotions[1];
    
    return {
      emotion: primaryEmotion[0],
      secondary: secondaryEmotion?.[0],
      confidence: Math.min(primaryEmotion[1] / weightedPatterns.length, 0.9),
      intensity: 6 // Average intensity for patterns
    };
  }

  // Analyze contextual factors (weather, calendar, location)
  private analyzeContextualFactors(
    contextualFactors?: ContextualFactors
  ): { emotion: EmotionalState; confidence: number; intensity: number; secondary?: EmotionalState } {
    
    if (!contextualFactors) {
      return {
        emotion: 'balanced',
        confidence: 0.2,
        intensity: 5
      };
    }
    
    let emotionScore = 0;
    let stressModifier = 0;
    let energyModifier = 0;
    let confidence = 0.4;
    
    // Weather impact
    if (contextualFactors.weather) {
      const { condition, temperature, pressure } = contextualFactors.weather;
      
      if (condition === 'sunny' && temperature > 20 && temperature < 28) {
        energyModifier += 0.2;
        emotionScore += 0.1;
        confidence += 0.1;
      } else if (condition === 'rainy' || condition === 'stormy') {
        energyModifier -= 0.15;
        stressModifier += 0.1;
      }
      
      if (pressure < 1010) { // Low pressure
        stressModifier += 0.1;
        energyModifier -= 0.1;
      }
    }
    
    // Calendar pressure
    if (contextualFactors.calendar) {
      const { has_meetings_next_2h, meeting_density, work_hours_remaining } = contextualFactors.calendar;
      
      if (has_meetings_next_2h && meeting_density > 0.5) {
        stressModifier += 0.2;
        confidence += 0.15;
      }
      
      if (work_hours_remaining > 6) {
        stressModifier += 0.1;
      } else if (work_hours_remaining < 2) {
        energyModifier -= 0.1;
      }
    }
    
    // Location context
    if (contextualFactors.location) {
      const { type, noise_level } = contextualFactors.location;
      
      if (type === 'gym') {
        energyModifier += 0.2;
        confidence += 0.1;
      } else if (type === 'home' && new Date().getHours() > 18) {
        stressModifier -= 0.1;
      }
      
      if (noise_level > 7) {
        stressModifier += 0.15;
      }
    }
    
    // Determine primary emotion based on modifiers
    let primaryEmotion: EmotionalState = 'balanced';
    let intensity = 5;
    
    if (stressModifier > 0.15) {
      primaryEmotion = 'stressed';
      intensity = Math.min(5 + stressModifier * 10, 10);
    } else if (energyModifier > 0.15) {
      primaryEmotion = 'energetic';
      intensity = Math.min(5 + energyModifier * 10, 10);
    } else if (energyModifier < -0.15) {
      primaryEmotion = 'tired';
      intensity = Math.min(5 - energyModifier * 10, 10);
    }
    
    return {
      emotion: primaryEmotion,
      confidence: Math.min(confidence, 0.8),
      intensity: intensity
    };
  }

  // Detect specific emotion triggers
  private detectEmotionTriggers(
    lifeScore: LifeScoreV2,
    metrics: HealthMetrics,
    contextualFactors?: ContextualFactors
  ): EmotionTrigger[] {
    
    const triggers: EmotionTrigger[] = [];
    
    // Stress spike detection
    if (lifeScore.stress > 7) {
      triggers.push({
        type: 'stress_spike',
        severity: (lifeScore.stress - 7) / 3,
        confidence: 0.8,
        description: `Stress level at ${lifeScore.stress}/10`
      });
    }
    
    // Energy drop detection
    if (lifeScore.energy < 4) {
      triggers.push({
        type: 'energy_drop',
        severity: (4 - lifeScore.energy) / 4,
        confidence: 0.75,
        description: `Energy level at ${lifeScore.energy}/10`
      });
    }
    
    // Sleep debt detection
    if (lifeScore.sleep < 5) {
      triggers.push({
        type: 'sleep_debt',
        severity: (5 - lifeScore.sleep) / 5,
        confidence: 0.85,
        description: `Sleep quality at ${lifeScore.sleep}/10`
      });
    }
    
    // Time pattern triggers
    const currentHour = new Date().getHours();
    if (currentHour >= 14 && currentHour <= 16) { // Afternoon dip
      triggers.push({
        type: 'time_pattern',
        severity: 0.3,
        confidence: 0.6,
        description: 'Natural afternoon energy dip'
      });
    }
    
    // Weather triggers
    if (contextualFactors?.weather) {
      const { condition, pressure } = contextualFactors.weather;
      if (condition === 'rainy' || pressure < 1010) {
        triggers.push({
          type: 'weather',
          severity: 0.2,
          confidence: 0.5,
          description: `Weather: ${condition}, pressure: ${pressure}`
        });
      }
    }
    
    return triggers;
  }

  // Combine multiple predictions with weights
  private combinePredictions(
    predictions: Array<{
      prediction: { emotion: EmotionalState; confidence: number; intensity: number; secondary?: EmotionalState };
      weight: number;
    }>
  ): { emotion: EmotionalState; confidence: number; intensity: number; secondary?: EmotionalState } {
    
    const emotionScores = new Map<EmotionalState, number>();
    let totalConfidence = 0;
    let totalIntensity = 0;
    let totalWeight = 0;
    
    predictions.forEach(({ prediction, weight }) => {
      const adjustedWeight = weight * prediction.confidence;
      
      // Primary emotion
      const currentScore = emotionScores.get(prediction.emotion) || 0;
      emotionScores.set(prediction.emotion, currentScore + adjustedWeight);
      
      // Secondary emotion
      if (prediction.secondary) {
        const secondaryScore = emotionScores.get(prediction.secondary) || 0;
        emotionScores.set(prediction.secondary, secondaryScore + adjustedWeight * 0.5);
      }
      
      totalConfidence += prediction.confidence * weight;
      totalIntensity += prediction.intensity * weight;
      totalWeight += weight;
    });
    
    const sortedEmotions = Array.from(emotionScores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return {
      emotion: sortedEmotions[0][0],
      secondary: sortedEmotions[1]?.[0],
      confidence: totalConfidence / totalWeight,
      intensity: totalIntensity / totalWeight
    };
  }

  // Calculate optimal intervention timing
  private calculateOptimalInterventionWindow(
    prediction: { emotion: EmotionalState; confidence: number; intensity: number },
    triggers: EmotionTrigger[],
    contextualFactors?: ContextualFactors
  ): number {
    
    let baseWindow = 15; // Default 15 minutes
    
    // Adjust based on emotion intensity
    if (prediction.intensity > 7) {
      baseWindow = 5; // Immediate intervention for high intensity
    } else if (prediction.intensity < 4) {
      baseWindow = 30; // Can wait longer for low intensity
    }
    
    // Adjust based on triggers
    const urgentTriggers = triggers.filter(t => t.severity > 0.7);
    if (urgentTriggers.length > 0) {
      baseWindow = Math.min(baseWindow, 5);
    }
    
    // Adjust based on context
    if (contextualFactors?.calendar?.has_meetings_next_2h) {
      baseWindow = Math.min(baseWindow, 10); // Before meeting
    }
    
    return baseWindow;
  }

  // Calculate emotion stability
  private calculateEmotionStability(
    prediction: { emotion: EmotionalState; confidence: number; intensity: number },
    triggers: EmotionTrigger[]
  ): number {
    
    let stability = 0.7; // Base stability
    
    // High confidence = more stable
    stability += (prediction.confidence - 0.5) * 0.4;
    
    // External triggers reduce stability
    const externalTriggers = triggers.filter(t => t.type === 'external' || t.type === 'weather');
    stability -= externalTriggers.length * 0.1;
    
    // High intensity emotions are less stable
    if (prediction.intensity > 7) {
      stability -= 0.2;
    }
    
    return Math.max(Math.min(stability, 1), 0);
  }

  // Estimate emotion duration
  private estimateEmotionDuration(
    prediction: { emotion: EmotionalState; confidence: number; intensity: number },
    triggers: EmotionTrigger[]
  ): number {
    
    const baseDurations: Record<EmotionalState, number> = {
      'stressed': 45,
      'anxious': 30,
      'overwhelmed': 60,
      'tired': 120,
      'energetic': 90,
      'motivated': 180,
      'focused': 120,
      'balanced': 240,
      'serene': 180,
      'restless': 20
    };
    
    let duration = baseDurations[prediction.emotion] || 60;
    
    // High intensity emotions last shorter
    if (prediction.intensity > 7) {
      duration *= 0.7;
    }
    
    // Triggered emotions last longer
    if (triggers.length > 2) {
      duration *= 1.3;
    }
    
    return Math.round(duration);
  }

  // Store prediction for learning
  private storePrediction(userId: string, prediction: EmotionPrediction): void {
    const userPredictions = this.recentPredictions.get(userId) || [];
    userPredictions.push(prediction);
    
    // Keep only last 10 predictions
    if (userPredictions.length > 10) {
      userPredictions.shift();
    }
    
    this.recentPredictions.set(userId, userPredictions);
  }

  // Calculate recency weight for patterns
  private calculateRecencyWeight(lastOccurrence: Date): number {
    const daysSince = (Date.now() - lastOccurrence.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-daysSince / 30); // Exponential decay over 30 days
  }

  // Public method to get recent emotion predictions
  getRecentPredictions(userId: string): EmotionPrediction[] {
    return this.recentPredictions.get(userId) || [];
  }

  // Learn from user feedback
  recordEmotionAccuracy(
    userId: string,
    predictionId: string,
    actualEmotion: EmotionalState,
    userConfidence: number
  ): void {
    // In production, this would update ML models
    // For now, we'll use it to improve pattern recognition
    
    const userPredictions = this.recentPredictions.get(userId) || [];
    const prediction = userPredictions.find(p => p.template_id === predictionId);
    
    if (prediction && prediction.primary_emotion === actualEmotion) {
      // Correct prediction - boost confidence in similar patterns
      // Implementation would update pattern weights
    } else {
      // Incorrect prediction - learn from the mistake
      // Implementation would adjust prediction algorithms
    }
  }
}

// Export utility function for easy integration
export async function detectAdvancedEmotion(
  userId: string,
  lifeScore: LifeScoreV2,
  metrics: HealthMetrics,
  userProfile: UserProfile,
  contextualFactors?: ContextualFactors,
  historicalData?: any[]
): Promise<EmotionPrediction> {
  const detector = new AdvancedEmotionDetector();
  return detector.predictEmotion(
    userId,
    lifeScore,
    metrics,
    userProfile,
    contextualFactors,
    historicalData
  );
}

// Integration helper for existing Empathetic Language Engine
export function enhanceEmpatheticContext(
  emotionPrediction: EmotionPrediction,
  baseContext: any
): any {
  return {
    ...baseContext,
    emotional_state: emotionPrediction.primary_emotion,
    emotion_intensity: emotionPrediction.intensity,
    emotion_confidence: emotionPrediction.confidence,
    emotion_triggers: emotionPrediction.triggers.map(t => t.type),
    optimal_timing: emotionPrediction.optimal_intervention_window,
    secondary_emotion: emotionPrediction.secondary_emotion
  };
}
