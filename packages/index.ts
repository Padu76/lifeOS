// =====================================================
// LifeOS Mobile Components - Complete Index Export
// File: index.ts
// =====================================================

// =====================================================
// MAIN SCREEN COMPONENTS
// =====================================================

// Dashboard Screen Components
export { DashboardScreen } from '../screens/DashboardScreen';
export { SettingsScreen } from '../screens/SettingsScreen';
export { OnboardingScreen } from '../screens/OnboardingScreen';
export { AnalyticsScreen } from '../screens/AnalyticsScreen';

// =====================================================
// SHARED UI COMPONENTS
// =====================================================

// Loading & Error Components
export {
  LoadingSpinner,
  LoadingSpinnerPresets,
  DashboardLoader,
  AdviceLoader,
  SavingLoader,
  AnalyticsLoader,
  SetupLoader,
} from './LoadingSpinner';

export {
  ErrorBanner,
  ErrorMessages,
  WarningMessages,
  InfoMessages,
  NetworkErrorBanner,
  AuthErrorBanner,
  UnsavedChangesBanner,
  SuccessBanner,
} from './ErrorBanner';

// Progress Components
export {
  ProgressBar,
  LifeScoreProgressBar,
  OnboardingProgressBar,
  DownloadProgressBar,
  HealthMetricProgressBar,
  CircularProgress,
  StepProgress,
} from './ProgressBar';

// Metric Components
export {
  MetricCard,
  PercentageCard,
  CounterCard,
  TimeCard,
  ScoreCard,
  MiniMetricCard,
  MetricGrid,
} from './MetricCard';

// =====================================================
// DASHBOARD COMPONENTS
// =====================================================

// Core Dashboard Components
export { AdviceCard } from './AdviceCard';
export { LifeScoreRing } from './LifeScoreRing';

// Dashboard Stats & Metrics
export {
  QuickMetrics,
  WeeklyTrendsMetrics,
  CompactMetrics,
} from './QuickMetrics';

export { TodayStats } from './TodayStats';

export { RecentActivities } from './RecentActivities';

export { AchievementsBanner } from './AchievementsBanner';

// =====================================================
// ANALYTICS COMPONENTS
// =====================================================

// Chart Components
export {
  TrendChart,
  LifeScoreTrendChart,
  EngagementTrendChart,
  CompletionTrendChart,
  MiniTrendChart,
  MultiSeriesChart,
} from './TrendChart';

// Insight Components
export { CategoryInsightCard } from './CategoryInsightCard';
export { PatternInsightCard } from './PatternInsightCard';
export { BurnoutRiskCard } from './BurnoutRiskCard';

// =====================================================
// ONBOARDING COMPONENTS
// =====================================================

export { LifeScoreInput } from './LifeScoreInput';

// =====================================================
// TYPE EXPORTS
// =====================================================

// Re-export types for convenience
export type {
  // From hooks
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
} from '../hooks';

// Component-specific types
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

export interface AnimationConfig {
  duration: number;
  delay?: number;
  useNativeDriver?: boolean;
}

export interface CommonProps {
  style?: any; // ViewStyle from react-native
  showAnimation?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

// =====================================================
// COMPONENT COLLECTIONS
// =====================================================

// Dashboard Component Collection
export const DashboardComponents = {
  AdviceCard,
  LifeScoreRing,
  QuickMetrics,
  TodayStats,
  RecentActivities,
  AchievementsBanner,
} as const;

// Analytics Component Collection
export const AnalyticsComponents = {
  TrendChart,
  CategoryInsightCard,
  PatternInsightCard,
  BurnoutRiskCard,
  LifeScoreTrendChart,
  EngagementTrendChart,
  CompletionTrendChart,
  MiniTrendChart,
  MultiSeriesChart,
} as const;

// Shared Component Collection
export const SharedComponents = {
  LoadingSpinner,
  ErrorBanner,
  ProgressBar,
  MetricCard,
} as const;

// Onboarding Component Collection
export const OnboardingComponents = {
  LifeScoreInput,
} as const;

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Theme utilities
export const getThemeColor = (theme: ComponentTheme, color: keyof ComponentTheme): string => {
  return theme[color];
};

// Animation utilities
export const createFadeAnimation = (
  animatedValue: any, // Animated.Value
  config?: AnimationConfig
) => {
  const { duration = 600, delay = 0, useNativeDriver = true } = config || {};
  
  return {
    toValue: 1,
    duration,
    delay,
    useNativeDriver,
  };
};

export const createScaleAnimation = (
  animatedValue: any, // Animated.Value
  config?: AnimationConfig
) => {
  const { duration = 500, delay = 0, useNativeDriver = true } = config || {};
  
  return {
    toValue: 1,
    duration,
    delay,
    useNativeDriver,
    tension: 100,
    friction: 8,
  };
};

// Component size utilities
export const getComponentSize = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      padding: 12,
      fontSize: 12,
      iconSize: 16,
    },
    medium: {
      padding: 16,
      fontSize: 14,
      iconSize: 20,
    },
    large: {
      padding: 20,
      fontSize: 16,
      iconSize: 24,
    },
  };
  
  return sizes[size];
};

// Format utilities for components
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
// DEFAULT THEMES
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
// COMPONENT FACTORY FUNCTIONS
// =====================================================

// Create themed components
export const createThemedComponent = <T extends React.ComponentType<any>>(
  Component: T,
  theme: ComponentTheme
) => {
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    return React.createElement(Component, { ...props, theme, ref });
  });
};

// Create animated component wrapper
export const createAnimatedComponent = <T extends React.ComponentType<any>>(
  Component: T,
  defaultAnimation?: AnimationConfig
) => {
  return React.forwardRef<any, React.ComponentProps<T> & { animationConfig?: AnimationConfig }>((props, ref) => {
    const { animationConfig, ...otherProps } = props;
    const finalConfig = { ...defaultAnimation, ...animationConfig };
    
    return React.createElement(Component, { 
      ...otherProps, 
      animationConfig: finalConfig,
      showAnimation: true,
      ref 
    });
  });
};

// =====================================================
// PRESETS AND CONFIGURATIONS
// =====================================================

export const ComponentPresets = {
  LoadingSpinner: LoadingSpinnerPresets,
  
  ErrorMessages: {
    ...ErrorMessages,
    ...WarningMessages,
    ...InfoMessages,
  },
  
  Animations: {
    fast: { duration: 300 },
    normal: { duration: 600 },
    slow: { duration: 1000 },
    spring: { tension: 100, friction: 8 },
  },
  
  Sizes: {
    small: getComponentSize('small'),
    medium: getComponentSize('medium'),
    large: getComponentSize('large'),
  },
} as const;

// =====================================================
// VERSION INFO
// =====================================================

export const COMPONENTS_VERSION = '1.0.0';
export const LAST_UPDATED = '2024-12-19';

// =====================================================
// DEVELOPMENT UTILITIES
// =====================================================

export const DevUtils = {
  logComponentRender: (componentName: string) => {
    if (__DEV__) {
      console.log(`[LifeOS] ${componentName} rendered`);
    }
  },
  
  measurePerformance: (componentName: string, fn: () => void) => {
    if (__DEV__) {
      const start = performance.now();
      fn();
      const end = performance.now();
      console.log(`[LifeOS] ${componentName} execution time: ${end - start}ms`);
    } else {
      fn();
    }
  },
};
