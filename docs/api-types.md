# LifeOS TypeScript Types API Documentation

Documentazione completa delle interfacce TypeScript e tipi utilizzati in LifeOS.

## Panoramica

Tutte le interfacce TypeScript di LifeOS sono centralizzate per garantire type safety e consistenza attraverso Edge Functions, hooks e componenti.

**Import Pattern:**
```typescript
import { HealthMetrics, LifeScoreV2, MicroAdvice } from '@lifeos/packages/types';
```

---

## Core Health Types

### HealthMetrics

Rappresenta le metriche di salute e benessere dell'utente.

```typescript
interface HealthMetrics {
  date: string; // YYYY-MM-DD format
  sleep_hours: number;
  sleep_quality: number; // 1-5 scale
  steps: number;
  active_minutes?: number;
  hr_avg?: number; // Heart rate average
  mood: number; // 1-5 scale
  stress: number; // 1-5 scale
  energy: number; // 1-5 scale
  source: 'manual' | 'apple' | 'google';
  timestamp?: string; // ISO timestamp for real-time data
  heart_rate?: number; // Real-time heart rate
}
```

### LifeScore

Score complessivo della qualità di vita (versione legacy).

```typescript
interface LifeScore {
  date: string;
  score: number; // 0-100 overall score
  breakdown: {
    sleep_score: number;
    activity_score: number;
    mental_score: number;
  };
  trend_3d: number; // Change vs 3 days ago
  trend_7d: number; // Change vs 7 days ago
  flags: LifeScoreFlags;
  reasons: string[]; // Explanation of score factors
}
```

### LifeScoreV2

Versione aggiornata del LifeScore con granularità migliorata.

```typescript
interface LifeScoreV2 {
  stress: number; // 1-10 scale
  energy: number; // 1-10 scale
  sleep: number; // 1-10 scale
  overall: number; // 1-10 calculated average
  timestamp?: string; // When calculated
  confidence?: number; // 0-1, confidence in the score
}
```

### LifeScoreFlags

Flag per identificare pattern significativi.

```typescript
interface LifeScoreFlags {
  low_sleep?: boolean;
  high_stress?: boolean;
  low_activity?: boolean;
  declining_trend?: boolean;
  improving_trend?: boolean;
  burnout_risk?: boolean;
  energy_crash?: boolean;
  sleep_debt?: boolean;
}
```

### LifeScoreWeights

Pesi personalizzabili per il calcolo LifeScore.

```typescript
interface LifeScoreWeights {
  w_sleep: number; // 0-1 weight for sleep component
  w_activity: number; // 0-1 weight for activity component
  w_mental: number; // 0-1 weight for mental component
  updated_at: string;
  user_id?: string;
}
```

---

## Micro-Advice Types

### MicroAdvice

Struttura principale per i micro-consigli AI.

```typescript
interface MicroAdvice {
  session_id: string;
  advice_text: string;
  advice_type: 'immediate' | 'scheduled' | 'contextual';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'mindfulness' | 'celebration';
  estimated_duration_minutes: number;
  expires_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
  personalization_factors: PersonalizationFactors;
  effectiveness_tracking: EffectivenessTracking;
  template_id?: string;
  tone?: string;
}
```

### PersonalizationFactors

Fattori utilizzati per personalizzare i consigli.

```typescript
interface PersonalizationFactors {
  chronotype_optimized: boolean;
  stress_level_considered: boolean;
  energy_level_considered: boolean;
  context_aware: boolean;
  user_preferences_applied: boolean;
  historical_effectiveness: number; // 0-1
}
```

### EffectivenessTracking

Tracking dell'efficacia predetta e reale dei consigli.

```typescript
interface EffectivenessTracking {
  expected_stress_impact: number; // -10 to +10
  expected_energy_impact: number; // -10 to +10
  confidence_score: number; // 0-1
  predicted_completion_rate: number; // 0-1
  actual_effectiveness?: number; // Set after completion
}
```

### AdviceResponse

Risposta dell'utente a un micro-consiglio.

```typescript
interface AdviceResponse {
  session_id: string;
  response_type: 'completed' | 'dismissed' | 'snoozed';
  completion_rating?: number; // 1-5 scale
  user_feedback?: string;
  actual_duration_minutes?: number;
  snooze_duration_minutes?: number;
  response_timestamp: string;
}
```

---

## Suggestion & Tutorial Types

### Suggestion

Struttura per suggerimenti predefiniti.

```typescript
interface Suggestion {
  id: string;
  key: string; // Unique identifier like "breathing-478"
  title: string;
  short_copy: string;
  category: 'breathing' | 'meditation' | 'movement' | 'rest' | 'nutrition';
  duration_sec: number;
  difficulty: 1 | 2 | 3;
  tutorial: TutorialStep[];
  triggers: SuggestionTrigger[];
  effectiveness_data?: EffectivenessData;
}
```

### TutorialStep

Singolo step di un tutorial guidato.

```typescript
interface TutorialStep {
  step: number;
  instruction: string;
  duration_sec?: number;
  animation_type?: 'breathing_circle' | 'timer' | 'movement' | null;
  audio_cue?: string;
  image_url?: string;
  verification_method?: 'timer' | 'user_confirmation' | 'sensor';
}
```

### SuggestionTrigger

Condizioni che attivano un suggerimento.

```typescript
interface SuggestionTrigger {
  condition: 'low_sleep' | 'high_stress' | 'low_activity' | 'declining_trend' | 'burnout_risk';
  min_score?: number;
  max_score?: number;
  priority: number; // 1-10, higher = more important
  context_requirements?: string[];
}
```

---

## User & Preferences Types

### UserPreferences

Preferenze di personalizzazione dell'utente.

```typescript
interface UserPreferences {
  notification_time?: string; // HH:mm format
  preferred_duration?: number; // Minutes for activities
  focus_areas?: ('sleep' | 'stress' | 'activity' | 'energy')[];
  difficulty_preference?: 1 | 2 | 3;
  intervention_frequency?: 'minimal' | 'balanced' | 'frequent';
  preferred_tone?: 'warm' | 'direct' | 'encouraging';
  notification_settings?: NotificationSettings;
  chronotype?: 'morning' | 'evening' | 'flexible';
}
```

### NotificationSettings

Impostazioni per le notifiche push.

```typescript
interface NotificationSettings {
  enabled: boolean;
  quiet_hours_start?: string; // HH:mm
  quiet_hours_end?: string; // HH:mm
  days_of_week?: number[]; // 0-6 (Sunday=0)
  max_daily_notifications?: number;
  priority_threshold?: 'low' | 'medium' | 'high';
}
```

### UserSuggestion

Suggerimento assegnato a un utente specifico.

```typescript
interface UserSuggestion {
  id: string;
  user_id: string;
  suggestion_key: string;
  date: string;
  reason: string; // Why it was suggested
  priority: number;
  completed: boolean;
  feedback_mood?: number; // 1-5, how user felt after
  time_spent_sec?: number;
  created_at: string;
  effectiveness_rating?: number;
}
```

---

## Analytics & Trends Types

### StressTrend

Analisi del trend dello stress nel tempo.

```typescript
interface StressTrend {
  trend_direction: 'improving' | 'stable' | 'declining' | 'concerning';
  confidence: number; // 0-1
  prediction_days: number; // How many days ahead
  risk_factors: string[];
  recommendations: string[];
  data_points: TrendDataPoint[];
}
```

### TrendData

Dati generici per trend analytics.

```typescript
interface TrendData {
  date: string;
  value: number;
  category: string;
  metadata?: Record<string, any>;
}
```

### TrendDataPoint

Singolo punto dati per trend analysis.

```typescript
interface TrendDataPoint {
  timestamp: string;
  value: number;
  context?: string;
  confidence?: number;
}
```

### WellnessDashboardData

Dati completi per la dashboard wellness.

```typescript
interface WellnessDashboardData {
  current_life_score: LifeScoreV2;
  recent_metrics: HealthMetrics[];
  active_streaks: Streak[];
  recent_achievements: Achievement[];
  wellness_trends: WellnessTrends;
  quick_stats: QuickStats;
  last_updated: string;
}
```

### WellnessTrends

Collezione di trend per diverse metriche.

```typescript
interface WellnessTrends {
  stress_trend: TrendData[];
  energy_trend: TrendData[];
  sleep_trend: TrendData[];
  overall_trend: TrendData[];
  trend_analysis: {
    primary_insight: string;
    recommendations: string[];
    confidence: number;
  };
}
```

---

## Gamification Types

### Streak

Rappresenta una streak di comportamenti consecutivi.

```typescript
interface Streak {
  id: string;
  user_id: string;
  streak_type: 'consecutive' | 'weekly' | 'monthly';
  category: 'checkin' | 'advice_completion' | 'goal_achievement';
  current_count: number;
  best_count: number;
  start_date: string;
  last_activity_date: string;
  is_active: boolean;
  celebration_triggered?: boolean;
}
```

### Achievement

Achievement guadagnabili dall'utente.

```typescript
interface Achievement {
  id: string;
  achievement_key: string;
  title: string;
  description: string;
  category: 'milestone' | 'streak' | 'improvement' | 'consistency';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon_url?: string;
  points?: number;
  unlock_criteria: UnlockCriteria;
}
```

### UnlockCriteria

Criteri per sbloccare achievement.

```typescript
interface UnlockCriteria {
  type: 'streak' | 'total_count' | 'improvement' | 'consistency';
  target_value: number;
  timeframe?: string;
  category?: string;
  conditions?: Record<string, any>;
}
```

---

## System & Analytics Types

### UserAnalytics

Analytics specifiche dell'utente.

```typescript
interface UserAnalytics {
  total_sessions: number;
  completion_rate: number;
  avg_rating: number;
  most_effective_category: string;
  streak_data: StreakAnalytics;
  improvement_score: number;
  engagement_level: 'low' | 'medium' | 'high';
}
```

### SystemAnalytics

Analytics di sistema per amministratori.

```typescript
interface SystemAnalytics {
  total_users: number;
  active_users_7d: number;
  avg_engagement: number;
  top_performing_advice: AdvicePerformance[];
  system_health: SystemHealth;
  usage_patterns: UsagePattern[];
}
```

### AdvicePerformance

Performance di categorie di consigli.

```typescript
interface AdvicePerformance {
  category: string;
  total_delivered: number;
  completion_rate: number;
  avg_rating: number;
  effectiveness_score: number;
  user_retention_impact: number;
}
```

---

## Timing & Context Types

### OptimalTiming

Timing ottimale per interventi.

```typescript
interface OptimalTiming {
  suggested_time: Date;
  confidence_score: number; // 0-1
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  reasoning: string;
  context_factors: string[];
  fallback_times?: Date[];
}
```

### UserContext

Contesto corrente dell'utente.

```typescript
interface UserContext {
  current_activity?: string;
  location?: string;
  calendar_availability?: boolean;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  battery_level?: number;
  focus_mode?: boolean;
  recent_app_usage?: AppUsageData[];
}
```

---

## Error & Response Types

### APIResponse

Struttura standardizzata per risposte API.

```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  error_code?: string;
  message?: string;
  timestamp: string;
  request_id?: string;
}
```

### EdgeFunctionError

Errori specifici delle Edge Functions.

```typescript
interface EdgeFunctionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
  function_name: string;
  timestamp: string;
}
```

---

## Utility Types

### ID Types

Tipi per identificatori comuni.

```typescript
type UserId = string;
type SessionId = string;
type AdviceId = string;
type AchievementId = string;
type StreakId = string;
```

### Enum Types

Enums per valori predefiniti.

```typescript
// Priority levels
type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Advice categories
type AdviceCategory = 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'mindfulness' | 'celebration';

// User states
type UserState = 'onboarding' | 'active' | 'inactive' | 'premium';

// Data sources
type DataSource = 'manual' | 'apple' | 'google' | 'fitbit' | 'garmin';

// Trend directions
type TrendDirection = 'improving' | 'stable' | 'declining' | 'concerning';
```

### Conditional Types

Utility types per manipolazione condizionale.

```typescript
// Make specific fields optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Extract advice by category
type AdviceByCategory<T extends AdviceCategory> = MicroAdvice & {
  category: T;
};

// User preferences by focus area
type PreferencesByArea<T extends string> = UserPreferences & {
  focus_areas: T[];
};
```

---

## Type Guards

Utility functions per type checking runtime.

```typescript
// Type guard per HealthMetrics
function isHealthMetrics(obj: any): obj is HealthMetrics {
  return obj && 
    typeof obj.date === 'string' &&
    typeof obj.sleep_hours === 'number' &&
    typeof obj.sleep_quality === 'number' &&
    typeof obj.steps === 'number' &&
    typeof obj.mood === 'number' &&
    typeof obj.stress === 'number' &&
    typeof obj.energy === 'number';
}

// Type guard per MicroAdvice
function isMicroAdvice(obj: any): obj is MicroAdvice {
  return obj &&
    typeof obj.session_id === 'string' &&
    typeof obj.advice_text === 'string' &&
    ['immediate', 'scheduled', 'contextual'].includes(obj.advice_type) &&
    ['low', 'medium', 'high', 'urgent'].includes(obj.priority);
}
```

---

## Generic Types

Tipi generici per operazioni comuni.

```typescript
// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Time-series data
interface TimeSeriesData<T> {
  timestamp: string;
  value: T;
  metadata?: Record<string, any>;
}

// Weighted average calculation
interface WeightedValue<T> {
  value: T;
  weight: number;
  confidence?: number;
}
```

---

## Import Examples

```typescript
// Import core types
import { 
  HealthMetrics, 
  LifeScoreV2, 
  MicroAdvice 
} from '@lifeos/packages/types';

// Import specific categories
import { 
  UserPreferences, 
  NotificationSettings 
} from '@lifeos/packages/types';

// Import utility types
import { 
  APIResponse, 
  PaginatedResponse 
} from '@lifeos/packages/types';

// Import type guards
import { 
  isHealthMetrics, 
  isMicroAdvice 
} from '@lifeos/packages/types';
```
