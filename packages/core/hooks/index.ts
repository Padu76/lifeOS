// =====================================================
// LifeOS Hooks - Index Export File
// File: index.ts
// =====================================================

// Base hook for Edge Functions
export { useSupabaseEdgeFunctions, useTypedEdgeFunction } from './useSupabaseEdgeFunctions';

// Core functionality hooks
export { useMicroAdvice } from './useMicroAdvice';
export { useWellnessDashboard } from './useWellnessDashboard';
export { useUserPreferences } from './useUserPreferences';
export { useSystemAnalytics } from './useSystemAnalytics';
export { useUserInitialization } from './useUserInitialization';

// Re-export types for convenience - NO DUPLICATES
export type {
  // From useMicroAdvice only
  HealthMetrics,
  LifeScoreV2,
  MicroAdvice
} from './useMicroAdvice';

export type {
  // From useWellnessDashboard
  WellnessDashboard,
  TodayStats,
  RecentActivity,
  Achievement
} from './useWellnessDashboard';

export type {
  // From useUserPreferences
  UserPreferences,
  QuietHours,
  NotificationSettings,
  UpdatePreferencesInput
} from './useUserPreferences';

export type {
  // From useSystemAnalytics
  SystemAnalytics,
  TimeRange,
  MetricTrend,
  CategoryInsight,
  PatternInsight,
  AnalyticsQuery
} from './useSystemAnalytics';

export type {
  // From useUserInitialization
  OnboardingAnswers,
  InitializationResult,
  InitializationProgress
} from './useUserInitialization';
