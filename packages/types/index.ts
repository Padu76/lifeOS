// Types for LifeOS core system

export interface HealthMetrics {
  date: string; // YYYY-MM-DD
  sleep_hours: number;
  sleep_quality: number; // 1-5
  steps: number;
  active_minutes?: number;
  hr_avg?: number; // heart rate average
  mood: number; // 1-5
  stress: number; // 1-5
  energy: number; // 1-5
  source: 'manual' | 'apple' | 'google';
}

export interface LifeScore {
  date: string;
  score: number; // 0-100
  breakdown: {
    sleep_score: number;
    activity_score: number;
    mental_score: number;
  };
  trend_3d: number; // change vs 3 days ago
  trend_7d: number; // change vs 7 days ago
  flags: LifeScoreFlags;
  reasons: string[]; // explanation of score factors
}

export interface LifeScoreFlags {
  low_sleep?: boolean;
  high_stress?: boolean;
  low_activity?: boolean;
  declining_trend?: boolean;
  improving_trend?: boolean;
  burnout_risk?: boolean;
}

export interface LifeScoreWeights {
  w_sleep: number; // 0-1
  w_activity: number; // 0-1
  w_mental: number; // 0-1
  updated_at: string;
}

export interface Suggestion {
  id: string;
  key: string; // unique identifier like "breathing-478"
  title: string;
  short_copy: string;
  category: 'breathing' | 'meditation' | 'movement' | 'rest' | 'nutrition';
  duration_sec: number;
  difficulty: 1 | 2 | 3;
  tutorial: TutorialStep[];
  triggers: SuggestionTrigger[];
}

export interface TutorialStep {
  step: number;
  instruction: string;
  duration_sec?: number;
  animation_type?: 'breathing_circle' | 'timer' | 'movement' | null;
  audio_cue?: string;
}

export interface SuggestionTrigger {
  condition: 'low_sleep' | 'high_stress' | 'low_activity' | 'declining_trend' | 'burnout_risk';
  min_score?: number;
  max_score?: number;
  priority: number; // 1-10, higher = more important
}

export interface UserSuggestion {
  id: string;
  user_id: string;
  suggestion_key: string;
  date: string;
  reason: string; // why it was suggested
  priority: number;
  completed: boolean;
  feedback_mood?: number; // 1-5, how user felt after
  time_spent_sec?: number;
  created_at: string;
}

export interface StressTrend {
  trend_direction: 'improving' | 'stable' | 'declining' | 'concerning';
  confidence: number; // 0-1
  prediction_days: number; // how many days ahead
  risk_factors: string[];
  recommendations: string[];
}

export interface UserPreferences {
  notification_time?: string; // HH:mm format
  preferred_duration?: number; // minutes for activities
  focus_areas?: ('sleep' | 'stress' | 'activity' | 'energy')[];
  difficulty_preference?: 1 | 2 | 3;
}
