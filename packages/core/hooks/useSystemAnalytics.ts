// =====================================================
// LifeOS - System Analytics Hook
// File: useSystemAnalytics.ts
// =====================================================

import { useState, useCallback, useEffect } from 'react';
import { useTypedEdgeFunction } from './useSupabaseEdgeFunctions';

interface TimeRange {
  start_date: string;
  end_date: string;
}

interface MetricTrend {
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface CategoryInsight {
  category: string;
  total_interventions: number;
  completion_rate: number;
  avg_rating: number;
  avg_duration_minutes: number;
  effectiveness_score: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface PatternInsight {
  pattern_type: 'time_of_day' | 'day_of_week' | 'stress_level' | 'energy_level';
  pattern_value: string;
  success_rate: number;
  confidence_score: number;
  description: string;
}

interface SystemAnalytics {
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

interface AnalyticsQuery {
  timeframe: 'week' | 'month' | 'quarter' | 'year';
  custom_range?: TimeRange;
  include_comparisons?: boolean;
  focus_categories?: string[];
}

export function useSystemAnalytics() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [currentQuery, setCurrentQuery] = useState<AnalyticsQuery>({
    timeframe: 'month',
    include_comparisons: true
  });
  const [cachedAnalytics, setCachedAnalytics] = useState<Map<string, SystemAnalytics>>(new Map());

  const analyticsFunction = useTypedEdgeFunction<AnalyticsQuery, SystemAnalytics>(
    'get-system-analytics'
  );

  // Generate cache key for query
  const getCacheKey = useCallback((query: AnalyticsQuery): string => {
    return JSON.stringify({
      timeframe: query.timeframe,
      custom_range: query.custom_range,
      focus_categories: query.focus_categories?.sort()
    });
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (
    query?: Partial<AnalyticsQuery>,
    useCache: boolean = true
  ): Promise<SystemAnalytics | null> => {
    const finalQuery = { ...currentQuery, ...query };
    const cacheKey = getCacheKey(finalQuery);

    // Check cache first
    if (useCache && cachedAnalytics.has(cacheKey)) {
      const cached = cachedAnalytics.get(cacheKey)!;
      setAnalytics(cached);
      return cached;
    }

    try {
      setCurrentQuery(finalQuery);
      const data = await analyticsFunction.execute(finalQuery);
      
      if (data) {
        setAnalytics(data);
        setCachedAnalytics(prev => new Map(prev.set(cacheKey, data)));
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }, [currentQuery, getCacheKey, cachedAnalytics, analyticsFunction.execute]);

  // Quick timeframe methods
  const getWeeklyAnalytics = useCallback(async (): Promise<SystemAnalytics | null> => {
    return fetchAnalytics({ timeframe: 'week' });
  }, [fetchAnalytics]);

  const getMonthlyAnalytics = useCallback(async (): Promise<SystemAnalytics | null> => {
    return fetchAnalytics({ timeframe: 'month' });
  }, [fetchAnalytics]);

  const getQuarterlyAnalytics = useCallback(async (): Promise<SystemAnalytics | null> => {
    return fetchAnalytics({ timeframe: 'quarter' });
  }, [fetchAnalytics]);

  const getCustomRangeAnalytics = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<SystemAnalytics | null> => {
    return fetchAnalytics({
      timeframe: 'week', // Doesn't matter when custom_range is provided
      custom_range: {
        start_date: startDate,
        end_date: endDate
      }
    });
  }, [fetchAnalytics]);

  // Category-specific analytics
  const getCategoryAnalytics = useCallback(async (
    categories: string[],
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<SystemAnalytics | null> => {
    return fetchAnalytics({
      timeframe,
      focus_categories: categories
    });
  }, [fetchAnalytics]);

  // Insight helpers
  const getBestPerformingCategories = useCallback((): CategoryInsight[] => {
    if (!analytics) return [];
    
    return analytics.category_insights
      .filter(insight => insight.effectiveness_score > 0.7)
      .sort((a, b) => b.effectiveness_score - a.effectiveness_score)
      .slice(0, 3);
  }, [analytics]);

  const getWorstPerformingCategories = useCallback((): CategoryInsight[] => {
    if (!analytics) return [];
    
    return analytics.category_insights
      .filter(insight => insight.effectiveness_score < 0.5)
      .sort((a, b) => a.effectiveness_score - b.effectiveness_score)
      .slice(0, 3);
  }, [analytics]);

  const getOptimalTimes = useCallback(): PatternInsight[] => {
    if (!analytics) return [];
    
    return analytics.pattern_insights
      .filter(insight => insight.pattern_type === 'time_of_day')
      .filter(insight => insight.success_rate > 0.7)
      .sort((a, b) => b.success_rate - a.success_rate);
  }, [analytics]);

  const getBurnoutRisk = useCallback(): 'low' | 'medium' | 'high' | null => {
    return analytics?.burnout_analysis?.risk_level || null;
  }, [analytics]);

  const getBurnoutRiskFactors = useCallback(): string[] => {
    return analytics?.burnout_analysis?.risk_factors || [];
  }, [analytics]);

  const getRecommendedActions = useCallback(): string[] => {
    return analytics?.burnout_analysis?.recommended_actions || [];
  }, [analytics]);

  // Trend analysis helpers
  const getImprovingTrends = useCallback(): MetricTrend[] => {
    if (!analytics) return [];
    
    const allTrends = [
      ...analytics.trends.life_score_trends,
      ...analytics.trends.engagement_trends,
      ...analytics.trends.effectiveness_trends
    ];
    
    return allTrends.filter(trend => trend.trend === 'improving');
  }, [analytics]);

  const getDecliningTrends = useCallback(): MetricTrend[] => {
    if (!analytics) return [];
    
    const allTrends = [
      ...analytics.trends.life_score_trends,
      ...analytics.trends.engagement_trends,
      ...analytics.trends.effectiveness_trends
    ];
    
    return allTrends.filter(trend => trend.trend === 'declining');
  }, [analytics]);

  // Comparison helpers
  const compareTimeframes = useCallback(async (
    timeframe1: 'week' | 'month' | 'quarter',
    timeframe2: 'week' | 'month' | 'quarter'
  ): Promise<{ current: SystemAnalytics | null; previous: SystemAnalytics | null }> => {
    const current = await fetchAnalytics({ timeframe: timeframe1 });
    const previous = await fetchAnalytics({ timeframe: timeframe2 });
    
    return { current, previous };
  }, [fetchAnalytics]);

  // Calculate percentage change
  const calculateChange = useCallback((current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }, []);

  // Export data helper
  const exportAnalytics = useCallback((): string => {
    if (!analytics) return '';
    
    return JSON.stringify(analytics, null, 2);
  }, [analytics]);

  // Auto-fetch on mount
  useEffect(() => {
    if (!analytics && !analyticsFunction.loading) {
      fetchAnalytics();
    }
  }, [analytics, analyticsFunction.loading, fetchAnalytics]);

  // Cache cleanup (keep only last 10 entries)
  useEffect(() => {
    if (cachedAnalytics.size > 10) {
      const entries = Array.from(cachedAnalytics.entries());
      const newCache = new Map(entries.slice(-10));
      setCachedAnalytics(newCache);
    }
  }, [cachedAnalytics]);

  // Reset function
  const reset = useCallback(() => {
    setAnalytics(null);
    setCurrentQuery({ timeframe: 'month', include_comparisons: true });
    setCachedAnalytics(new Map());
    analyticsFunction.reset();
  }, [analyticsFunction.reset]);

  return {
    // State
    analytics,
    currentQuery,
    
    // Loading and error states
    loading: analyticsFunction.loading,
    error: analyticsFunction.error,
    
    // Methods
    fetchAnalytics,
    getWeeklyAnalytics,
    getMonthlyAnalytics,
    getQuarterlyAnalytics,
    getCustomRangeAnalytics,
    getCategoryAnalytics,
    
    // Insight helpers
    getBestPerformingCategories,
    getWorstPerformingCategories,
    getOptimalTimes,
    getBurnoutRisk,
    getBurnoutRiskFactors,
    getRecommendedActions,
    
    // Trend helpers
    getImprovingTrends,
    getDecliningTrends,
    
    // Comparison helpers
    compareTimeframes,
    calculateChange,
    
    // Utilities
    exportAnalytics,
    reset
  };
}
