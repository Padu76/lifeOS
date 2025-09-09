// =====================================================
// LifeOS - Analytics Screen Component
// File: AnalyticsScreen.tsx
// =====================================================

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-area-context';
import { useSystemAnalytics } from '../hooks';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { TrendChart } from '../components/TrendChart';
import { CategoryInsightCard } from '../components/CategoryInsightCard';
import { PatternInsightCard } from '../components/PatternInsightCard';
import { BurnoutRiskCard } from '../components/BurnoutRiskCard';
import { MetricCard } from '../components/MetricCard';

const { width } = Dimensions.get('window');

interface AnalyticsScreenProps {
  navigation: any;
}

interface TimeframeSelectorProps {
  selectedTimeframe: 'week' | 'month' | 'quarter';
  onTimeframeChange: (timeframe: 'week' | 'month' | 'quarter') => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
  selectedTimeframe,
  onTimeframeChange,
}) => {
  const timeframes = [
    { key: 'week', label: 'Settimana' },
    { key: 'month', label: 'Mese' },
    { key: 'quarter', label: 'Trimestre' },
  ] as const;

  return (
    <View style={styles.timeframeSelector}>
      {timeframes.map((timeframe) => (
        <TouchableOpacity
          key={timeframe.key}
          style={[
            styles.timeframeButton,
            selectedTimeframe === timeframe.key && styles.selectedTimeframeButton,
          ]}
          onPress={() => onTimeframeChange(timeframe.key)}
        >
          <Text style={[
            styles.timeframeButtonText,
            selectedTimeframe === timeframe.key && styles.selectedTimeframeButtonText,
          ]}>
            {timeframe.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigation }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'insights' | 'recommendations'>('overview');

  const {
    analytics,
    loading,
    error,
    fetchAnalytics,
    getWeeklyAnalytics,
    getMonthlyAnalytics,
    getQuarterlyAnalytics,
    getBestPerformingCategories,
    getWorstPerformingCategories,
    getOptimalTimes,
    getBurnoutRisk,
    getBurnoutRiskFactors,
    getRecommendedActions,
    getImprovingTrends,
    getDecliningTrends,
    exportAnalytics,
  } = useSystemAnalytics();

  // Fetch analytics based on timeframe
  useEffect(() => {
    const fetchData = async () => {
      switch (selectedTimeframe) {
        case 'week':
          await getWeeklyAnalytics();
          break;
        case 'month':
          await getMonthlyAnalytics();
          break;
        case 'quarter':
          await getQuarterlyAnalytics();
          break;
      }
    };

    fetchData();
  }, [selectedTimeframe, getWeeklyAnalytics, getMonthlyAnalytics, getQuarterlyAnalytics]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAnalytics({ timeframe: selectedTimeframe }, false);
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchAnalytics, selectedTimeframe]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handle export
  const handleExport = useCallback(() => {
    try {
      const data = exportAnalytics();
      // In a real app, you would save this to device storage or share it
      Alert.alert(
        'Dati Esportati',
        'I tuoi dati analytics sono stati preparati per l\'esportazione.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Errore', 'Impossibile esportare i dati. Riprova.');
    }
  }, [exportAnalytics]);

  // Get tab content
  const getTabContent = () => {
    if (!analytics) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Overview Metrics */}
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Consigli Completati"
                value={analytics.overview.total_interventions.toString()}
                subtitle={`${(analytics.overview.completion_rate * 100).toFixed(1)}% completati`}
                trend={analytics.overview.completion_rate > 0.8 ? 'improving' : analytics.overview.completion_rate > 0.5 ? 'stable' : 'declining'}
                icon="🎯"
              />

              <MetricCard
                title="Rating Medio"
                value={analytics.overview.avg_session_rating.toFixed(1)}
                subtitle="su 5.0"
                trend={analytics.overview.avg_session_rating > 4 ? 'improving' : analytics.overview.avg_session_rating > 3 ? 'stable' : 'declining'}
                icon="⭐"
              />

              <MetricCard
                title="Tempo di Engagement"
                value={`${Math.round(analytics.overview.total_engagement_minutes / 60)}h`}
                subtitle={`${analytics.overview.total_engagement_minutes} minuti totali`}
                trend="stable"
                icon="⏱️"
              />

              <MetricCard
                title="Miglioramento Stress"
                value={`${analytics.overview.stress_improvement_avg > 0 ? '+' : ''}${analytics.overview.stress_improvement_avg.toFixed(1)}`}
                subtitle="punti in media"
                trend={analytics.overview.stress_improvement_avg > 0.5 ? 'improving' : analytics.overview.stress_improvement_avg > -0.5 ? 'stable' : 'declining'}
                icon="🧘"
              />
            </View>

            {/* Burnout Risk */}
            <BurnoutRiskCard
              riskLevel={getBurnoutRisk()}
              riskFactors={getBurnoutRiskFactors()}
              recommendedActions={getRecommendedActions()}
              style={styles.burnoutCard}
            />

            {/* Life Score Trends Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Andamento Life Score</Text>
              <TrendChart
                data={analytics.trends.life_score_trends}
                height={200}
                style={styles.chart}
              />
            </View>
          </View>
        );

      case 'trends':
        return (
          <View style={styles.tabContent}>
            {/* Improving Trends */}
            <View style={styles.trendsSection}>
              <Text style={styles.sectionTitle}>📈 Trend in Miglioramento</Text>
              {getImprovingTrends().map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendName}>{trend.metric_name}</Text>
                  <View style={styles.trendValues}>
                    <Text style={styles.trendChange}>
                      +{trend.change_percentage.toFixed(1)}%
                    </Text>
                    <Text style={styles.trendValue}>
                      {trend.current_value.toFixed(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Declining Trends */}
            <View style={styles.trendsSection}>
              <Text style={styles.sectionTitle}>📉 Trend in Declino</Text>
              {getDecliningTrends().map((trend, index) => (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendName}>{trend.metric_name}</Text>
                  <View style={styles.trendValues}>
                    <Text style={[styles.trendChange, styles.negativeChange]}>
                      {trend.change_percentage.toFixed(1)}%
                    </Text>
                    <Text style={styles.trendValue}>
                      {trend.current_value.toFixed(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Engagement Trends Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Andamento Engagement</Text>
              <TrendChart
                data={analytics.trends.engagement_trends}
                height={200}
                color="#3b82f6"
                style={styles.chart}
              />
            </View>

            {/* Effectiveness Trends Chart */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Andamento Efficacia</Text>
              <TrendChart
                data={analytics.trends.effectiveness_trends}
                height={200}
                color="#10b981"
                style={styles.chart}
              />
            </View>
          </View>
        );

      case 'insights':
        return (
          <View style={styles.tabContent}>
            {/* Best Performing Categories */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>🏆 Categorie Top Performance</Text>
              {getBestPerformingCategories().map((category, index) => (
                <CategoryInsightCard
                  key={index}
                  category={category}
                  style={styles.categoryCard}
                />
              ))}
            </View>

            {/* Worst Performing Categories */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>⚠️ Categorie da Migliorare</Text>
              {getWorstPerformingCategories().map((category, index) => (
                <CategoryInsightCard
                  key={index}
                  category={category}
                  style={styles.categoryCard}
                />
              ))}
            </View>

            {/* Optimal Times */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>⏰ Orari Ottimali</Text>
              {getOptimalTimes().map((pattern, index) => (
                <PatternInsightCard
                  key={index}
                  pattern={pattern}
                  style={styles.patternCard}
                />
              ))}
            </View>
          </View>
        );

      case 'recommendations':
        return (
          <View style={styles.tabContent}>
            {/* Focus Areas Recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>🎯 Aree di Focus Consigliate</Text>
              {analytics.recommendations.focus_areas.map((area, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>{area}</Text>
                </View>
              ))}
            </View>

            {/* Optimal Timing Recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>⏰ Timing Ottimale</Text>
              {analytics.recommendations.optimal_timing.map((timing, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>{timing}</Text>
                </View>
              ))}
            </View>

            {/* Intervention Adjustments */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>⚙️ Aggiustamenti Consigliati</Text>
              {analytics.recommendations.intervention_adjustments.map((adjustment, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>{adjustment}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading && !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <LoadingSpinner message="Caricamento analytics..." />
      </SafeAreaView>
    );
  }

  if (error && !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
        <ErrorBanner message="Impossibile caricare gli analytics" onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* Timeframe Selector */}
      <TimeframeSelector
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
      />

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Panoramica' },
          { key: 'trends', label: 'Trend' },
          { key: 'insights', label: 'Insights' },
          { key: 'recommendations', label: 'Consigli' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.activeTabButtonText,
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
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
        {getTabContent()}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  exportButton: {
    padding: 8,
  },
  exportButtonText: {
    fontSize: 20,
  },
  timeframeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  selectedTimeframeButton: {
    backgroundColor: '#7c3aed',
  },
  timeframeButtonText: {
    fontSize: 14,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  selectedTimeframeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#7c3aed',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  burnoutCard: {
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  trendsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendName: {
    fontSize: 14,
    color: '#e5e7eb',
    flex: 1,
  },
  trendValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendChange: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  negativeChange: {
    color: '#ef4444',
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  insightsSection: {
    marginBottom: 24,
  },
  categoryCard: {
    marginBottom: 12,
  },
  patternCard: {
    marginBottom: 12,
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationItem: {
    backgroundColor: '#16213e',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  recommendationText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
