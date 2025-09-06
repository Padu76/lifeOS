// =====================================================
// LifeOS Mobile Components - Index Export File
// File: components/index.ts
// =====================================================

// Main Screen Components
export { DashboardScreen } from '../screens/DashboardScreen';
export { SettingsScreen } from '../screens/SettingsScreen';
export { OnboardingScreen } from '../screens/OnboardingScreen';
export { AnalyticsScreen } from '../screens/AnalyticsScreen';

// Core UI Components
export { AdviceCard } from './AdviceCard';
export { LifeScoreRing } from './LifeScoreRing';

// Shared UI Components (to be implemented)
export { LoadingSpinner } from './LoadingSpinner';
export { ErrorBanner } from './ErrorBanner';
export { ProgressBar } from './ProgressBar';
export { QuickMetrics } from './QuickMetrics';
export { TodayStats } from './TodayStats';
export { RecentActivities } from './RecentActivities';
export { AchievementsBanner } from './AchievementsBanner';
export { LifeScoreInput } from './LifeScoreInput';
export { TrendChart } from './TrendChart';
export { CategoryInsightCard } from './CategoryInsightCard';
export { PatternInsightCard } from './PatternInsightCard';
export { BurnoutRiskCard } from './BurnoutRiskCard';
export { MetricCard } from './MetricCard';

// Re-export types for convenience
export type {
  // From hooks
  MicroAdvice,
  LifeScoreV2,
  WellnessDashboard,
  UserPreferences,
  SystemAnalytics,
  OnboardingAnswers,
  InitializationResult,
} from '../hooks';
