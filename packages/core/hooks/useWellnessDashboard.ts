// =====================================================
// LifeOS - Wellness Dashboard Hook
// File: useWellnessDashboard.ts
// =====================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTypedEdgeFunction } from './useSupabaseEdgeFunctions';

interface LifeScoreV2 {
  stress: number;
  energy: number;
  sleep: number;
  overall: number;
}

interface TodayStats {
  interventions_completed: number;
  interventions_dismissed: number;
  total_engagement_time_minutes: number;
  avg_completion_rating: number;
  stress_improvement: number;
  energy_improvement: number;
}

interface RecentActivity {
  id: string;
  type: 'advice_completed' | 'advice_dismissed' | 'metrics_logged' | 'achievement_unlocked';
  description: string;
  timestamp: string;
  impact_score?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  category: 'streak' | 'completion' | 'improvement' | 'consistency';
}

interface WellnessDashboard {
  current_life_score: LifeScoreV2;
  today_stats: TodayStats;
  recent_activities: RecentActivity[];
  recent_achievements: Achievement[];
  next_scheduled_intervention?: {
    estimated_time: string;
    category: string;
  };
  weekly_trends: {
    stress_trend: 'improving' | 'stable' | 'declining';
    energy_trend: 'improving' | 'stable' | 'declining';
    sleep_trend: 'improving' | 'stable' | 'declining';
    engagement_trend: 'improving' | 'stable' | 'declining';
  };
  insights: {
    top_performing_categories: string[];
    areas_for_improvement: string[];
    optimal_intervention_times: string[];
    burnout_risk_level: 'low' | 'medium' | 'high';
  };
}

export function useWellnessDashboard() {
  const [dashboard, setDashboard] = useState<WellnessDashboard | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const dashboardFunction = useTypedEdgeFunction<{}, WellnessDashboard>(
    'get-wellness-dashboard'
  );

  // Fetch dashboard data
  const fetchDashboard = useCallback(async (force: boolean = false): Promise<WellnessDashboard | null> => {
    // Don't fetch if already loading, unless forced
    if (dashboardFunction.loading && !force) {
      return dashboard;
    }

    try {
      const data = await dashboardFunction.execute({});
      
      if (data) {
        setDashboard(data);
        setLastUpdated(new Date());
        setIsStale(false);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return null;
    }
  }, [dashboardFunction.execute, dashboardFunction.loading, dashboard]);

  // Refresh dashboard (force fetch)
  const refreshDashboard = useCallback(async (): Promise<WellnessDashboard | null> => {
    return fetchDashboard(true);
  }, [fetchDashboard]);

  // Update life score optimistically
  const updateLifeScoreOptimistic = useCallback((newLifeScore: Partial<LifeScoreV2>) => {
    if (dashboard) {
      setDashboard(prev => prev ? {
        ...prev,
        current_life_score: {
          ...prev.current_life_score,
          ...newLifeScore
        }
      } : null);
      setIsStale(true);
    }
  }, [dashboard]);

  // Update today stats optimistically
  const updateTodayStatsOptimistic = useCallback((updates: Partial<TodayStats>) => {
    if (dashboard) {
      setDashboard(prev => prev ? {
        ...prev,
        today_stats: {
          ...prev.today_stats,
          ...updates
        }
      } : null);
      setIsStale(true);
    }
  }, [dashboard]);

  // Add activity optimistically
  const addActivityOptimistic = useCallback((activity: Omit<RecentActivity, 'id'>) => {
    if (dashboard) {
      const newActivity: RecentActivity = {
        ...activity,
        id: `temp_${Date.now()}`
      };
      
      setDashboard(prev => prev ? {
        ...prev,
        recent_activities: [newActivity, ...prev.recent_activities.slice(0, 9)]
      } : null);
      setIsStale(true);
    }
  }, [dashboard]);

  // Add achievement optimistically
  const addAchievementOptimistic = useCallback((achievement: Omit<Achievement, 'id' | 'unlocked_at'>) => {
    if (dashboard) {
      const newAchievement: Achievement = {
        ...achievement,
        id: `temp_${Date.now()}`,
        unlocked_at: new Date().toISOString()
      };
      
      setDashboard(prev => prev ? {
        ...prev,
        recent_achievements: [newAchievement, ...prev.recent_achievements.slice(0, 4)]
      } : null);
      setIsStale(true);
    }
  }, [dashboard]);

  // Check if data is stale
  const checkDataFreshness = useCallback(() => {
    if (lastUpdated) {
      const minutesSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60);
      if (minutesSinceUpdate > 5) { // Consider stale after 5 minutes
        setIsStale(true);
      }
    }
  }, [lastUpdated]);

  // Auto-refresh setup
  useEffect(() => {
    // Initial fetch
    if (!dashboard && !dashboardFunction.loading) {
      fetchDashboard();
    }

    // Set up auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      checkDataFreshness();
      if (!dashboardFunction.loading) {
        fetchDashboard();
      }
    }, 30000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [dashboard, dashboardFunction.loading, fetchDashboard, checkDataFreshness]);

  // Get formatted time since last update
  const getTimeSinceUpdate = useCallback((): string => {
    if (!lastUpdated) return 'Mai aggiornato';
    
    const minutes = Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));
    
    if (minutes < 1) return 'Appena aggiornato';
    if (minutes === 1) return '1 minuto fa';
    if (minutes < 60) return `${minutes} minuti fa`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 ora fa';
    return `${hours} ore fa`;
  }, [lastUpdated]);

  // Quick access getters
  const getCurrentLifeScore = useCallback((): LifeScoreV2 | null => {
    return dashboard?.current_life_score || null;
  }, [dashboard]);

  const getTodayStats = useCallback((): TodayStats | null => {
    return dashboard?.today_stats || null;
  }, [dashboard]);

  const getBurnoutRisk = useCallback(): 'low' | 'medium' | 'high' | null => {
    return dashboard?.insights?.burnout_risk_level || null;
  }, [dashboard]);

  // Reset function
  const reset = useCallback(() => {
    setDashboard(null);
    setLastUpdated(null);
    setIsStale(false);
    dashboardFunction.reset();
    
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  }, [dashboardFunction.reset]);

  return {
    // State
    dashboard,
    lastUpdated,
    isStale,
    
    // Loading and error states
    loading: dashboardFunction.loading,
    error: dashboardFunction.error,
    
    // Methods
    fetchDashboard,
    refreshDashboard,
    
    // Optimistic updates
    updateLifeScoreOptimistic,
    updateTodayStatsOptimistic,
    addActivityOptimistic,
    addAchievementOptimistic,
    
    // Utilities
    getTimeSinceUpdate,
    getCurrentLifeScore,
    getTodayStats,
    getBurnoutRisk,
    reset
  };
}
