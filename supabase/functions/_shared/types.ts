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
