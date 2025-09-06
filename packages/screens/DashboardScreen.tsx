// =====================================================
// LifeOS - Dashboard Screen Component
// File: DashboardScreen.tsx
// =====================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMicroAdvice, useWellnessDashboard } from '../hooks';
import { AdviceCard } from '../components/AdviceCard';
import { LifeScoreRing } from '../components/LifeScoreRing';
import { QuickMetrics } from '../components/QuickMetrics';
import { TodayStats } from '../components/TodayStats';
import { RecentActivities } from '../components/RecentActivities';
import { AchievementsBanner } from '../components/AchievementsBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';

const { width, height } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Hooks
  const {
    dashboard,
    loading: dashboardLoading,
    error: dashboardError,
    refreshDashboard,
    getCurrentLifeScore,
    getBurnoutRisk,
    addActivityOptimistic,
    addAchievementOptimistic,
  } = useWellnessDashboard();

  const {
    currentAdvice,
    isGenerating,
    isResponding,
    generateError,
    responseError,
    generateAdvice,
    completeAdvice,
    dismissAdvice,
    snoozeAdvice,
  } = useMicroAdvice();

  // Auto-generate advice when dashboard loads
  useEffect(() => {
    if (dashboard?.current_life_score && !currentAdvice && !isGenerating) {
      const healthMetrics = {
        timestamp: new Date().toISOString(),
        stress_level: 10 - dashboard.current_life_score.stress, // Convert to stress level
        energy_level: dashboard.current_life_score.energy,
        sleep_quality: dashboard.current_life_score.sleep,
      };

      generateAdvice(healthMetrics, dashboard.current_life_score);
    }
  }, [dashboard, currentAdvice, isGenerating, generateAdvice]);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshDashboard]);

  // Handle advice completion
  const handleAdviceComplete = useCallback(async (
    sessionId: string,
    rating?: number,
    feedback?: string,
    duration?: number
  ) => {
    try {
      const success = await completeAdvice(sessionId, rating, feedback, duration);
      
      if (success) {
        // Add optimistic activity
        addActivityOptimistic({
          type: 'advice_completed',
          description: 'Micro-consiglio completato',
          timestamp: new Date().toISOString(),
          impact_score: rating || 5,
        });

        // Check for achievements (streak, completion count, etc.)
        const todayStats = dashboard?.today_stats;
        if (todayStats) {
          const totalCompleted = todayStats.interventions_completed + 1;
          
          // Milestone achievements
          if ([5, 10, 25, 50].includes(totalCompleted)) {
            addAchievementOptimistic({
              title: `${totalCompleted} Consigli Completati`,
              description: `Hai completato ${totalCompleted} micro-consigli!`,
              icon: '🎯',
              category: 'completion',
            });
          }
        }
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile completare il consiglio. Riprova.');
    }
  }, [completeAdvice, addActivityOptimistic, addAchievementOptimistic, dashboard]);

  // Handle advice dismissal
  const handleAdviceDismiss = useCallback(async (
    sessionId: string,
    feedback?: string
  ) => {
    try {
      const success = await dismissAdvice(sessionId, feedback);
      
      if (success) {
        addActivityOptimistic({
          type: 'advice_dismissed',
          description: 'Micro-consiglio rimandato',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile rimandare il consiglio. Riprova.');
    }
  }, [dismissAdvice, addActivityOptimistic]);

  // Handle advice snooze
  const handleAdviceSnooze = useCallback(async (
    sessionId: string,
    duration: number = 30
  ) => {
    try {
      const success = await snoozeAdvice(sessionId, duration);
      
      if (success) {
        Alert.alert(
          'Consiglio posticipato',
          `Il tuo micro-consiglio riapparirà tra ${duration} minuti.`
        );
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile posticipare il consiglio. Riprova.');
    }
  }, [snoozeAdvice]);

  // Navigate to analytics
  const navigateToAnalytics = useCallback(() => {
    navigation.navigate('Analytics');
  }, [navigation]);

  // Navigate to settings
  const navigateToSettings = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  // Show loading spinner during initial load
  if (dashboardLoading && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <LoadingSpinner message="Caricamento dashboard..." />
      </SafeAreaView>
    );
  }

  // Show error if dashboard failed to load
  if (dashboardError && !dashboard) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <ErrorBanner
          message="Impossibile caricare la dashboard"
          onRetry={onRefresh}
        />
      </SafeAreaView>
    );
  }

  const lifeScore = getCurrentLifeScore();
  const burnoutRisk = getBurnoutRisk();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#7c3aed"
              colors={['#7c3aed']}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Bentornato</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('it-IT', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>

          {/* Error banners */}
          {(generateError || responseError) && (
            <ErrorBanner
              message={generateError || responseError || 'Errore sconosciuto'}
              style={styles.errorBanner}
            />
          )}

          {/* Achievements Banner */}
          {dashboard?.recent_achievements && dashboard.recent_achievements.length > 0 && (
            <AchievementsBanner
              achievements={dashboard.recent_achievements}
              style={styles.achievementsBanner}
            />
          )}

          {/* Current Advice Card */}
          {currentAdvice && (
            <AdviceCard
              advice={currentAdvice}
              isResponding={isResponding}
              onComplete={handleAdviceComplete}
              onDismiss={handleAdviceDismiss}
              onSnooze={handleAdviceSnooze}
              style={styles.adviceCard}
            />
          )}

          {/* Life Score Ring */}
          {lifeScore && (
            <LifeScoreRing
              lifeScore={lifeScore}
              burnoutRisk={burnoutRisk}
              onPress={navigateToAnalytics}
              style={styles.lifeScoreRing}
            />
          )}

          {/* Quick Metrics */}
          {dashboard?.weekly_trends && (
            <QuickMetrics
              trends={dashboard.weekly_trends}
              style={styles.quickMetrics}
            />
          )}

          {/* Today Stats */}
          {dashboard?.today_stats && (
            <TodayStats
              stats={dashboard.today_stats}
              style={styles.todayStats}
            />
          )}

          {/* Recent Activities */}
          {dashboard?.recent_activities && (
            <RecentActivities
              activities={dashboard.recent_activities}
              style={styles.recentActivities}
            />
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  achievementsBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  adviceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  lifeScoreRing: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  quickMetrics: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  todayStats: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  recentActivities: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  bottomSpacing: {
    height: 40,
  },
});
