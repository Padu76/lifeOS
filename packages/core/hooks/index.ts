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

// Re-export types for convenience
export type {
  // From useMicroAdvice
  HealthMetrics,
  LifeScoreV2,
  MicroAdvice,
  
  // From useWellnessDashboard
  WellnessDashboard,
  TodayStats,
  RecentActivity,
  Achievement,
  
  // From useUserPreferences
  UserPreferences,
  QuietHours,
  NotificationSettings,
  
  // From useSystemAnalytics
  SystemAnalytics,
  TimeRange,
  MetricTrend,
  CategoryInsight,
  PatternInsight,
  
  // From useUserInitialization
  OnboardingAnswers,
  InitializationResult,
  InitializationProgress
} from './useMicroAdvice';

export type {
  WellnessDashboard,
  TodayStats,
  RecentActivity,
  Achievement
} from './useWellnessDashboard';

export type {
  UserPreferences,
  QuietHours,
  NotificationSettings,
  UpdatePreferencesInput
} from './useUserPreferences';

export type {
  SystemAnalytics,
  TimeRange,
  MetricTrend,
  CategoryInsight,
  PatternInsight,
  AnalyticsQuery
} from './useSystemAnalytics';

export type {
  OnboardingAnswers,
  InitializationResult,
  InitializationProgress
} from './useUserInitialization';
