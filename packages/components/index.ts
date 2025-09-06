// =====================================================
// LifeOS Components - Index Export
// File: packages/components/index.ts
// =====================================================

// Note: This package now contains only base/legacy components
// Specialized components have been moved to their domain packages:
// - dashboard/ for dashboard-specific components
// - analytics/ for analytics components  
// - onboarding/ for onboarding components
// - shared/ for shared utility components

// Re-export everything from other component packages for convenience
export * from '../dashboard';
export * from '../analytics';
export * from '../onboarding';
export * from '../shared';
export * from '../screens';

// Legacy exports (if any base components remain here)
// Currently empty as all components have been moved to specialized packages

// =====================================================
// TYPE EXPORTS
// =====================================================

// Re-export all component types
export type {
  // From core/hooks
  MicroAdvice,
  LifeScoreV2,
  WellnessDashboard,
  TodayStats,
  RecentActivity,
  Achievement,
  UserPreferences,
  QuietHours,
  NotificationSettings,
  SystemAnalytics,
  TimeRange,
  MetricTrend,
  CategoryInsight,
  PatternInsight,
  OnboardingAnswers,
  InitializationResult,
  InitializationProgress,
} from '../core';

// Component-specific interfaces
export interface ComponentProps {
  style?: any;
  showAnimation?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

export interface AnimationConfig {
  duration: number;
  delay?: number;
  useNativeDriver?: boolean;
}

export interface ComponentTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export const formatters = {
  duration: (minutes: number): string => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  },
  
  percentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },
  
  score: (value: number, maxValue: number = 10): string => {
    return `${value.toFixed(1)}/${maxValue}`;
  },
  
  timeAgo: (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Ora';
    if (diffMinutes < 60) return `${diffMinutes}min fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    
    return time.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  },
  
  number: (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  },
};

// =====================================================
// THEME PRESETS
// =====================================================

export const DefaultTheme: ComponentTheme = {
  primary: '#7c3aed',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#1a1a2e',
  surface: '#16213e',
  text: '#ffffff',
  textSecondary: '#9ca3af',
};

export const LightTheme: ComponentTheme = {
  primary: '#7c3aed',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
};

// =====================================================
// VERSION INFO
// =====================================================

export const COMPONENTS_VERSION = '1.0.0';
export const LAST_UPDATED = '2024-12-19';
