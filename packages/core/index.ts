// =====================================================
// LifeOS Core - Complete Index Export
// File: packages/core/index.ts
// =====================================================

// =====================================================
// HOOKS EXPORTS
// =====================================================

export * from './hooks';

// Explicit hook exports for better IDE support
export {
  useSupabaseEdgeFunctions,
  useTypedEdgeFunction,
  useMicroAdvice,
  useWellnessDashboard,
  useUserPreferences,
  useSystemAnalytics,
  useUserInitialization,
} from './hooks';

// =====================================================
// SCORING SYSTEM EXPORTS
// =====================================================

export * from './scoring/lifeScore';
export * from './scoring/lifeScoreV2';
export * from './scoring/normalizers';

// Explicit scoring exports
export {
  calculateLifeScore,
  calculateLifeScoreV2,
  normalizeStressLevel,
  normalizeEnergyLevel,
  normalizeSleepQuality,
  calculateOverallWellness,
} from './scoring/lifeScoreV2';

// =====================================================
// ADVICE SYSTEM EXPORTS
// =====================================================

export * from './advice/engine';
export * from './advice/microAdviceEngine';
export * from './advice/intelligentTimingSystem';
export * from './advice/intelligentPushSystem';
export * from './advice/empatheticLanguageEngine';
export * from './advice/softGamificationSystem';

// Advice recipes
export * from './advice/recipes/breathing-478';
export * from './advice/recipes/5min-meditation';
export * from './advice/recipes/10min-walk';

// =====================================================
// ORCHESTRATOR EXPORTS
// =====================================================

export * from './orchestrator/microAdviceOrchestrator';

// =====================================================
// PREDICTORS EXPORTS
// =====================================================

export * from './predictors/stressTrend';

// =====================================================
// TYPE EXPORTS
// =====================================================

// Core domain types
export interface HealthMetrics {
  timestamp: string;
  stress_level?: number;
  energy_level?: number;
  sleep_quality?: number;
  mood?: string;
  heart_rate?: number;
  steps?: number;
  [key: string]: any;
}

export interface LifeScoreV2 {
  stress: number;
  energy: number;
  sleep: number;
  overall: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic';
  focus_areas: string[];
  preferences: any;
}

export interface MicroAdvice {
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

export interface WellnessDashboard {
  current_life_score: LifeScoreV2;
  today_stats: TodayStats;
  recent_activities: RecentActivity[];
  recent_achievements: Achievement[];
  next_scheduled_intervention?: {
    estimated_time: string;
    category: string;
  };
  weekly_trends: {
    stress_trend: 'improving' | 'stable' | 'declining';
    energy_trend: 'improving' | 'stable' | 'declining';
    sleep_trend: 'improving' | 'stable' | 'declining';
    engagement_trend: 'improving' | 'stable' | 'declining';
  };
  insights: {
    top_performing_categories: string[];
    areas_for_improvement: string[];
    optimal_intervention_times: string[];
    burnout_risk_level: 'low' | 'medium' | 'high';
  };
}

export interface TodayStats {
  interventions_completed: number;
  interventions_dismissed: number;
  total_engagement_time_minutes: number;
  avg_completion_rating: number;
  stress_improvement: number;
  energy_improvement: number;
}

export interface RecentActivity {
  id: string;
  type: 'advice_completed' | 'advice_dismissed' | 'metrics_logged' | 'achievement_unlocked';
  description: string;
  timestamp: string;
  impact_score?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  category: 'streak' | 'completion' | 'improvement' | 'consistency';
}

export interface UserPreferences {
  id: string;
  user_id: string;
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic';
  preferred_tone: 'professional' | 'friendly' | 'casual' | 'motivational';
  focus_areas: string[];
  max_daily_interventions: number;
  min_intervention_gap_minutes: number;
  quiet_hours: QuietHours;
  notification_settings: NotificationSettings;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface QuietHours {
  start_time: string;
  end_time: string;
  enabled: boolean;
}

export interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  advice_notifications: boolean;
  achievement_notifications: boolean;
  weekly_report_notifications: boolean;
  reminder_notifications: boolean;
}

export interface SystemAnalytics {
  time_range: TimeRange;
  overview: {
    total_interventions: number;
    completion_rate: number;
    avg_session_rating: number;
    total_engagement_minutes: number;
    stress_improvement_avg: number;
    energy_improvement_avg: number;
    sleep_improvement_avg: number;
  };
  trends: {
    life_score_trends: MetricTrend[];
    engagement_trends: MetricTrend[];
    effectiveness_trends: MetricTrend[];
  };
  category_insights: CategoryInsight[];
  pattern_insights: PatternInsight[];
  recommendations: {
    focus_areas: string[];
    optimal_timing: string[];
    intervention_adjustments: string[];
  };
  burnout_analysis: {
    risk_level: 'low' | 'medium' | 'high';
    risk_factors: string[];
    protective_factors: string[];
    recommended_actions: string[];
  };
}

export interface TimeRange {
  start_date: string;
  end_date: string;
}

export interface MetricTrend {
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface CategoryInsight {
  category: string;
  total_interventions: number;
  completion_rate: number;
  avg_rating: number;
  avg_duration_minutes: number;
  effectiveness_score: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface PatternInsight {
  pattern_type: 'time_of_day' | 'day_of_week' | 'stress_level' | 'energy_level';
  pattern_value: string;
  success_rate: number;
  confidence_score: number;
  description: string;
}

export interface OnboardingAnswers {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic';
  preferred_tone: 'professional' | 'friendly' | 'casual' | 'motivational';
  focus_areas: string[];
  current_stress_level: number;
  current_energy_level: number;
  current_sleep_quality: number;
  main_goals: string[];
  time_availability: 'low' | 'medium' | 'high';
  notification_preferences: {
    push_enabled: boolean;
    optimal_times: string[];
  };
  quiet_hours?: {
    start_time: string;
    end_time: string;
  };
}

export interface InitializationResult {
  user_profile: UserProfile;
  initial_life_score: LifeScoreV2;
  welcome_achievements: Achievement[];
  first_advice?: MicroAdvice;
  next_steps: {
    immediate_actions: string[];
    recommended_schedule: string[];
    tips_for_success: string[];
  };
}

export interface InitializationProgress {
  step: number;
  totalSteps: number;
  currentSection: 'profile' | 'assessment' | 'preferences' | 'goals' | 'finalization';
  completedSections: string[];
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const CoreUtils = {
  // Life Score utilities
  isValidLifeScore: (score: LifeScoreV2): boolean => {
    const { stress, energy, sleep, overall } = score;
    return [stress, energy, sleep, overall].every(
      value => typeof value === 'number' && value >= 1 && value <= 10
    );
  },

  // Health metrics utilities
  isValidHealthMetrics: (metrics: HealthMetrics): boolean => {
    if (!metrics.timestamp) return false;
    const date = new Date(metrics.timestamp);
    return date instanceof Date && !isNaN(date.getTime());
  },

  // Time utilities
  formatTimeRange: (range: TimeRange): string => {
    const start = new Date(range.start_date).toLocaleDateString('it-IT');
    const end = new Date(range.end_date).toLocaleDateString('it-IT');
    return `${start} - ${end}`;
  },

  // Advice utilities
  isAdviceExpired: (advice: MicroAdvice): boolean => {
    return new Date(advice.expires_at) < new Date();
  },

  getAdvicePriorityWeight: (priority: MicroAdvice['priority']): number => {
    const weights = { low: 1, medium: 2, high: 3, urgent: 4 };
    return weights[priority] || 1;
  },

  // Trend utilities
  getTrendDirection: (trend: MetricTrend): 'up' | 'down' | 'stable' => {
    if (Math.abs(trend.change_percentage) < 5) return 'stable';
    return trend.change_percentage > 0 ? 'up' : 'down';
  },

  // Category utilities
  getCategoryIcon: (category: string): string => {
    const icons: Record<string, string> = {
      stress: '🧘',
      energy: '⚡',
      sleep: '😴',
      focus: '🎯',
      movement: '🏃',
      nutrition: '🥗',
      social: '👥',
      mindfulness: '🌸',
      productivity: '💼',
      recovery: '🛋️',
    };
    return icons[category.toLowerCase()] || '💡';
  },
};

// =====================================================
// CONSTANTS
// =====================================================

export const LIFEOS_CONSTANTS = {
  // Scoring constants
  LIFE_SCORE_MIN: 1,
  LIFE_SCORE_MAX: 10,
  HIGH_STRESS_THRESHOLD: 7,
  LOW_ENERGY_THRESHOLD: 3,
  POOR_SLEEP_THRESHOLD: 4,

  // Timing constants
  MIN_INTERVENTION_GAP_MINUTES: 90,
  MAX_DAILY_INTERVENTIONS: 5,

  // Engagement constants
  HIGH_ENGAGEMENT_COMPLETION_RATE: 0.8,
  LOW_ENGAGEMENT_COMPLETION_RATE: 0.3,
  BURNOUT_RISK_DISMISSAL_THRESHOLD: 5,

  // Achievement constants
  STREAK_CELEBRATION_INTERVALS: [3, 7, 14, 30, 60, 100],
  COMPLETION_MILESTONES: [5, 10, 25, 50, 100, 250, 500],

  // Notification constants
  QUIET_HOURS_DEFAULT_START: '22:00',
  QUIET_HOURS_DEFAULT_END: '07:00',

  // Pattern learning
  MIN_SESSIONS_FOR_PATTERNS: 10,
  EFFECTIVENESS_THRESHOLD: 0.6,

  // Cache durations (seconds)
  USER_PROFILE_CACHE_DURATION: 300,
  ANALYTICS_CACHE_DURATION: 1800,

  // Validation limits
  MAX_FOCUS_AREAS: 5,
  MAX_CUSTOM_GOALS: 10,
  MAX_FEEDBACK_LENGTH: 500,

  // Feature flags
  FEATURES: {
    ADVANCED_ANALYTICS: true,
    PUSH_NOTIFICATIONS: true,
    ACHIEVEMENT_SHARING: false,
    AI_INSIGHTS: true,
    EXPORT_DATA: true,
  },
} as const;

// =====================================================
// VERSION INFO
// =====================================================

export const CORE_VERSION = '1.0.0';
export const CORE_LAST_UPDATED = '2024-12-19';

// =====================================================
// DEVELOPMENT UTILITIES
// =====================================================

export const DevUtils = {
  logCoreOperation: (operation: string, data?: any) => {
    if (__DEV__) {
      console.log(`[LifeOS Core] ${operation}`, data || '');
    }
  },

  validateCoreData: (type: string, data: any): boolean => {
    switch (type) {
      case 'lifeScore':
        return CoreUtils.isValidLifeScore(data);
      case 'healthMetrics':
        return CoreUtils.isValidHealthMetrics(data);
      default:
        return true;
    }
  },

  measureCorePerformance: (operation: string, fn: () => void) => {
    if (__DEV__) {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`[LifeOS Core] ${operation} took ${end - start}ms`);
    } else {
      fn();
    }
  },
};
