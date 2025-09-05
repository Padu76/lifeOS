import { LifeScore, Suggestion, UserSuggestion, UserPreferences } from '../../types';

export class SuggestionEngine {
  // Cooldown periods to avoid spam
  private static readonly COOLDOWN_HOURS = {
    'breathing-478': 6,
    'meditation-5min': 12,
    'walk-10min': 8,
    'stretching-basic': 4,
    'power-nap': 24,
    'hydration-reminder': 2,
    'posture-break': 3
  };

  /**
   * Generate personalized suggestions based on LifeScore analysis
   */
  static generateSuggestions(
    lifeScore: LifeScore,
    userPreferences: UserPreferences = {},
    recentSuggestions: UserSuggestion[] = [],
    availableSuggestions: Suggestion[]
  ): UserSuggestion[] {
    const currentTime = new Date();
    const suggestions: UserSuggestion[] = [];

    // Filter out suggestions in cooldown
    const availableNow = availableSuggestions.filter(suggestion => 
      this.isAvailable(suggestion, recentSuggestions, currentTime)
    );

    // Priority scoring based on flags and user preferences
    const scoredSuggestions = availableNow.map(suggestion => ({
      suggestion,
      priority: this.calculatePriority(suggestion, lifeScore, userPreferences),
      reason: this.generateReason(suggestion, lifeScore)
    }));

    // Sort by priority and take top 3
    const topSuggestions = scoredSuggestions
      .filter(item => item.priority > 0)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    // Convert to UserSuggestion format
    return topSuggestions.map((item, index) => ({
      id: `${lifeScore.date}-${item.suggestion.key}-${Date.now()}`,
      user_id: '', // Will be filled by caller
      suggestion_key: item.suggestion.key,
      date: lifeScore.date,
      reason: item.reason,
      priority: item.priority,
      completed: false,
      created_at: currentTime.toISOString()
    }));
  }

  /**
   * Check if suggestion is available (not in cooldown)
   */
  private static isAvailable(
    suggestion: Suggestion,
    recentSuggestions: UserSuggestion[],
    currentTime: Date
  ): boolean {
    const cooldownHours = this.COOLDOWN_HOURS[suggestion.key as keyof typeof this.COOLDOWN_HOURS] || 8;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;

    const lastUsed = recentSuggestions
      .filter(s => s.suggestion_key === suggestion.key)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!lastUsed) return true;

    const timeSinceLastUse = currentTime.getTime() - new Date(lastUsed.created_at).getTime();
    return timeSinceLastUse >= cooldownMs;
  }

  /**
   * Calculate priority score for suggestion based on current state
   */
  private static calculatePriority(
    suggestion: Suggestion,
    lifeScore: LifeScore,
    preferences: UserPreferences
  ): number {
    let priority = 0;

    // Base priority from suggestion triggers
    const matchingTriggers = suggestion.triggers.filter(trigger => {
      switch (trigger.condition) {
        case 'low_sleep':
          return lifeScore.flags.low_sleep;
        case 'high_stress':
          return lifeScore.flags.high_stress;
        case 'low_activity':
          return lifeScore.flags.low_activity;
        case 'declining_trend':
          return lifeScore.flags.declining_trend;
        case 'burnout_risk':
          return lifeScore.flags.burnout_risk;
        default:
          return false;
      }
    });

    if (matchingTriggers.length === 0) return 0;

    // Sum base priorities from matching triggers
    priority = matchingTriggers.reduce((sum, trigger) => sum + trigger.priority, 0);

    // Score-based adjustments
    if (lifeScore.score < 40) {
      priority += 3; // Urgent situations get boost
    } else if (lifeScore.score < 60) {
      priority += 1;
    }

    // Trend-based adjustments
    if (lifeScore.trend_7d < -15) {
      priority += 2; // Declining trend needs attention
    }

    // User preference adjustments
    if (preferences.focus_areas?.includes(this.getSuggestionFocusArea(suggestion))) {
      priority += 2;
    }

    // Difficulty preference matching
    if (preferences.difficulty_preference === suggestion.difficulty) {
      priority += 1;
    }

    // Duration preference (if available)
    if (preferences.preferred_duration) {
      const preferredSec = preferences.preferred_duration * 60;
      const durationDiff = Math.abs(suggestion.duration_sec - preferredSec);
      if (durationDiff < 300) { // Within 5 minutes
        priority += 1;
      }
    }

    // Time-of-day contextual boosting
    const hour = new Date().getHours();
    priority += this.getTimeBasedBoost(suggestion, hour);

    return Math.max(0, priority);
  }

  /**
   * Map suggestion category to focus area
   */
  private static getSuggestionFocusArea(suggestion: Suggestion): 'sleep' | 'stress' | 'activity' | 'energy' {
    switch (suggestion.category) {
      case 'breathing':
      case 'meditation':
        return 'stress';
      case 'movement':
        return 'activity';
      case 'rest':
        return 'sleep';
      default:
        return 'energy';
    }
  }

  /**
   * Boost suggestions based on time of day appropriateness
   */
  private static getTimeBasedBoost(suggestion: Suggestion, hour: number): number {
    const category = suggestion.category;
    
    // Morning boosts (6-10 AM)
    if (hour >= 6 && hour <= 10) {
      if (category === 'movement') return 2;
      if (suggestion.key === 'hydration-reminder') return 1;
    }
    
    // Midday boosts (11 AM - 2 PM)
    if (hour >= 11 && hour <= 14) {
      if (suggestion.key === 'power-nap') return 2;
      if (category === 'breathing') return 1;
    }
    
    // Afternoon boosts (3-6 PM)
    if (hour >= 15 && hour <= 18) {
      if (suggestion.key === 'posture-break') return 2;
      if (category === 'movement') return 1;
    }
    
    // Evening boosts (7-10 PM)
    if (hour >= 19 && hour <= 22) {
      if (category === 'meditation') return 2;
      if (category === 'rest') return 1;
    }
    
    return 0;
  }

  /**
   * Generate human-readable reason for suggestion
   */
  private static generateReason(suggestion: Suggestion, lifeScore: LifeScore): string {
    const reasons: string[] = [];

    if (lifeScore.flags.burnout_risk) {
      reasons.push("Segnali di stress elevato rilevati");
    }
    
    if (lifeScore.flags.low_sleep) {
      reasons.push("Qualità del sonno da migliorare");
    }
    
    if (lifeScore.flags.high_stress) {
      reasons.push("Livello di stress alto");
    }
    
    if (lifeScore.flags.low_activity) {
      reasons.push("Attività fisica limitata oggi");
    }
    
    if (lifeScore.flags.declining_trend) {
      reasons.push("Trend in peggioramento");
    }
    
    if (lifeScore.score < 50) {
      reasons.push("Benessere generale sotto la media");
    }

    // Fallback reason
    if (reasons.length === 0) {
      reasons.push("Suggerito per mantenere il benessere");
    }

    return reasons.join(" • ");
  }

  /**
   * Mark suggestion as completed and record feedback
   */
  static completeSuggestion(
    suggestionId: string,
    timeSpentSec: number,
    feedbackMood?: number
  ): Partial<UserSuggestion> {
    return {
      completed: true,
      time_spent_sec: timeSpentSec,
      feedback_mood: feedbackMood
    };
  }

  /**
   * Get effectiveness analytics for suggestions
   */
  static analyzeSuggestionEffectiveness(
    completedSuggestions: UserSuggestion[]
  ): { [key: string]: { avgMoodImprovement: number; completionRate: number; avgDuration: number } } {
    const analytics: { [key: string]: any } = {};

    // Group by suggestion key
    const grouped = completedSuggestions.reduce((acc, suggestion) => {
      if (!acc[suggestion.suggestion_key]) {
        acc[suggestion.suggestion_key] = [];
      }
      acc[suggestion.suggestion_key].push(suggestion);
      return acc;
    }, {} as { [key: string]: UserSuggestion[] });

    // Calculate metrics for each suggestion type
    Object.entries(grouped).forEach(([key, suggestions]) => {
      const completed = suggestions.filter(s => s.completed);
      const withFeedback = completed.filter(s => s.feedback_mood !== undefined);
      
      analytics[key] = {
        completionRate: completed.length / suggestions.length,
        avgMoodImprovement: withFeedback.length > 0 
          ? withFeedback.reduce((sum, s) => sum + (s.feedback_mood || 0), 0) / withFeedback.length
          : 0,
        avgDuration: completed.length > 0
          ? completed.reduce((sum, s) => sum + (s.time_spent_sec || 0), 0) / completed.length
          : 0
      };
    });

    return analytics;
  }
}
