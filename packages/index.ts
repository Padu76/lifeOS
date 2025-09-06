// =====================================================
// LifeOS - Main Index Export
// File: packages/index.ts
// =====================================================

// =====================================================
// CORE SYSTEM EXPORTS
// =====================================================

// Core functionality (hooks, scoring, advice engines, etc.)
export * from './core';

// Types package
export * from './types';

// =====================================================
// UI SYSTEM EXPORTS
// =====================================================

// Base UI components (design system)
export * from './ui';

// =====================================================
// COMPONENT EXPORTS BY DOMAIN
// =====================================================

// Dashboard components
export * from './dashboard';

// Analytics components  
export * from './analytics';

// Onboarding components
export * from './onboarding';

// Shared utility components
export * from './shared';

// Screen components
export * from './screens';

// All components (convenience export)
export * from './components';

// =====================================================
// EXPLICIT EXPORTS FOR BETTER IDE SUPPORT
// =====================================================

// Core hooks
export {
  useMicroAdvice,
  useWellnessDashboard,
  useUserPreferences,
  useSystemAnalytics,
  useUserInitialization,
  useSupabaseEdgeFunctions,
} from './core/hooks';

// Key components
export { AdviceCard } from './dashboard/AdviceCard';
export { LifeScoreRing } from './dashboard/LifeScoreRing';
export { TodayStats } from './dashboard/TodayStats';
export { QuickMetrics } from './dashboard/QuickMetrics';
export { RecentActivities } from './dashboard/RecentActivities';
export { AchievementsBanner } from './dashboard/AchievementsBanner';

export { TrendChart } from './analytics/TrendChart';
export { CategoryInsightCard } from './analytics/CategoryInsightCard';
export { PatternInsightCard } from './analytics/PatternInsightCard';
export { BurnoutRiskCard } from './analytics/BurnoutRiskCard';

export { LifeScoreInput } from './onboarding/LifeScoreInput';

export { LoadingSpinner } from './shared/LoadingSpinner';
export { ErrorBanner } from './shared/ErrorBanner';
export { ProgressBar } from './shared/ProgressBar';
export { MetricCard } from './shared/MetricCard';

export { DashboardScreen } from './screens/DashboardScreen';
export { AnalyticsScreen } from './screens/AnalyticsScreen';
export { OnboardingScreen } from './screens/OnboardingScreen';
export { SettingsScreen } from './screens/SettingsScreen';

// UI components
export { Button } from './ui/Button';
export { Card } from './ui/Card';
export { Typography } from './ui/Typography';

// =====================================================
// COMPONENT COLLECTIONS
// =====================================================

export const LifeOSComponents = {
  // Dashboard
  Dashboard: {
    AdviceCard: require('./dashboard/AdviceCard').AdviceCard,
    LifeScoreRing: require('./dashboard/LifeScoreRing').LifeScoreRing,
    TodayStats: require('./dashboard/TodayStats').TodayStats,
    QuickMetrics: require('./dashboard/QuickMetrics').QuickMetrics,
    RecentActivities: require('./dashboard/RecentActivities').RecentActivities,
    AchievementsBanner: require('./dashboard/AchievementsBanner').AchievementsBanner,
  },

  // Analytics
  Analytics: {
    TrendChart: require('./analytics/TrendChart').TrendChart,
    CategoryInsightCard: require('./analytics/CategoryInsightCard').CategoryInsightCard,
    PatternInsightCard: require('./analytics/PatternInsightCard').PatternInsightCard,
    BurnoutRiskCard: require('./analytics/BurnoutRiskCard').BurnoutRiskCard,
  },

  // Onboarding
  Onboarding: {
    LifeScoreInput: require('./onboarding/LifeScoreInput').LifeScoreInput,
  },

  // Shared
  Shared: {
    LoadingSpinner: require('./shared/LoadingSpinner').LoadingSpinner,
    ErrorBanner: require('./shared/ErrorBanner').ErrorBanner,
    ProgressBar: require('./shared/ProgressBar').ProgressBar,
    MetricCard: require('./shared/MetricCard').MetricCard,
  },

  // Screens
  Screens: {
    DashboardScreen: require('./screens/DashboardScreen').DashboardScreen,
    AnalyticsScreen: require('./screens/AnalyticsScreen').AnalyticsScreen,
    OnboardingScreen: require('./screens/OnboardingScreen').OnboardingScreen,
    SettingsScreen: require('./screens/SettingsScreen').SettingsScreen,
  },

  // UI
  UI: {
    Button: require('./ui/Button').Button,
    Card: require('./ui/Card').Card,
    Typography: require('./ui/Typography').Typography,
  },
} as const;

// =====================================================
// HOOKS COLLECTION
// =====================================================

export const LifeOSHooks = {
  useMicroAdvice: require('./core/hooks/useMicroAdvice').useMicroAdvice,
  useWellnessDashboard: require('./core/hooks/useWellnessDashboard').useWellnessDashboard,
  useUserPreferences: require('./core/hooks/useUserPreferences').useUserPreferences,
  useSystemAnalytics: require('./core/hooks/useSystemAnalytics').useSystemAnalytics,
  useUserInitialization: require('./core/hooks/useUserInitialization').useUserInitialization,
  useSupabaseEdgeFunctions: require('./core/hooks/useSupabaseEdgeFunctions').useSupabaseEdgeFunctions,
} as const;

// =====================================================
// UTILITIES COLLECTION
// =====================================================

export const LifeOSUtils = {
  // From core
  CoreUtils: require('./core').CoreUtils,
  LIFEOS_CONSTANTS: require('./core').LIFEOS_CONSTANTS,
  
  // From components
  formatters: require('./components').formatters,
  DefaultTheme: require('./components').DefaultTheme,
  LightTheme: require('./components').LightTheme,
} as const;

// =====================================================
// TYPE COLLECTIONS
// =====================================================

export type {
  // Core types
  HealthMetrics,
  LifeScoreV2,
  MicroAdvice,
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
  UserProfile,
} from './core';

export type {
  // Component types
  ComponentProps,
  ComponentTheme,
  AnimationConfig,
} from './components';

// =====================================================
// QUICK START EXAMPLES
// =====================================================

export const QuickStart = {
  // Dashboard setup example
  dashboardExample: `
import { LifeOSComponents, LifeOSHooks } from '@lifeos/packages';

const Dashboard = () => {
  const { dashboard, loading } = LifeOSHooks.useWellnessDashboard();
  const { currentAdvice } = LifeOSHooks.useMicroAdvice();

  return (
    <View>
      <LifeOSComponents.Dashboard.LifeScoreRing 
        lifeScore={dashboard?.current_life_score} 
      />
      {currentAdvice && (
        <LifeOSComponents.Dashboard.AdviceCard advice={currentAdvice} />
      )}
      <LifeOSComponents.Dashboard.TodayStats stats={dashboard?.today_stats} />
    </View>
  );
};
  `,

  // Analytics setup example
  analyticsExample: `
import { LifeOSComponents, LifeOSHooks } from '@lifeos/packages';

const Analytics = () => {
  const { analytics } = LifeOSHooks.useSystemAnalytics();

  return (
    <View>
      <LifeOSComponents.Analytics.TrendChart 
        data={analytics?.trends.life_score_trends} 
      />
      <LifeOSComponents.Analytics.BurnoutRiskCard 
        riskLevel={analytics?.burnout_analysis.risk_level} 
      />
    </View>
  );
};
  `,

  // Onboarding setup example
  onboardingExample: `
import { LifeOSComponents, LifeOSHooks } from '@lifeos/packages';

const Onboarding = () => {
  const { completeOnboarding } = LifeOSHooks.useUserInitialization();

  return (
    <LifeOSComponents.Onboarding.LifeScoreInput
      onStressChange={(value) => console.log('Stress:', value)}
      onEnergyChange={(value) => console.log('Energy:', value)}
      onSleepChange={(value) => console.log('Sleep:', value)}
    />
  );
};
  `,
} as const;

// =====================================================
// VERSION & METADATA
// =====================================================

export const LifeOSMetadata = {
  version: '1.0.0',
  lastUpdated: '2024-12-19',
  author: 'LifeOS Team',
  license: 'MIT',
  description: 'Complete wellness and micro-advice system for React Native',
  
  packages: {
    core: require('./core/package.json').version,
    types: require('./types/package.json').version,
    ui: require('./ui/package.json').version,
  },

  components: {
    dashboard: 6,
    analytics: 4,
    onboarding: 1,
    shared: 4,
    screens: 4,
    ui: 3,
  },

  hooks: 6,
  
  features: {
    microAdviceEngine: true,
    lifeScoreTracking: true,
    burnoutPrevention: true,
    intelligentTiming: true,
    softGamification: true,
    realTimeAnalytics: true,
    personalizedOnboarding: true,
  },
} as const;

// =====================================================
// DEVELOPMENT UTILITIES
// =====================================================

export const DevTools = {
  logVersion: () => {
    if (__DEV__) {
      console.log(`
🚀 LifeOS v${LifeOSMetadata.version}
📦 Components: ${Object.values(LifeOSMetadata.components).reduce((a, b) => a + b, 0)}
🎣 Hooks: ${LifeOSMetadata.hooks}
📅 Updated: ${LifeOSMetadata.lastUpdated}
      `);
    }
  },

  validateSetup: () => {
    const missing = [];
    
    // Check core dependencies
    if (!LifeOSHooks.useMicroAdvice) missing.push('useMicroAdvice hook');
    if (!LifeOSComponents.Dashboard.AdviceCard) missing.push('AdviceCard component');
    
    if (missing.length > 0) {
      console.error('❌ LifeOS Setup Issues:', missing);
      return false;
    }
    
    console.log('✅ LifeOS Setup Complete');
    return true;
  },

  listComponents: () => {
    if (__DEV__) {
      console.table(LifeOSMetadata.components);
    }
  },
} as const;

// =====================================================
// AUTO-INITIALIZE IN DEV
// =====================================================

if (__DEV__) {
  DevTools.logVersion();
}
