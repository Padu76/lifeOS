// =====================================================
// LifeOS - Today Stats Component
// File: TodayStats.tsx
// =====================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';

interface TodayStats {
  interventions_completed: number;
  interventions_dismissed: number;
  total_engagement_time_minutes: number;
  avg_completion_rating: number;
  stress_improvement: number;
  energy_improvement: number;
}

interface TodayStatsProps {
  stats: TodayStats;
  onStatPress?: (stat: string) => void;
  style?: ViewStyle;
  showAnimation?: boolean;
  compact?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: 'positive' | 'negative' | 'neutral';
  onPress?: () => void;
  delay?: number;
  size?: 'small' | 'medium' | 'large';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend = 'neutral',
  onPress,
  delay = 0,
  size = 'medium',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Get size styling
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          padding: 12,
          titleSize: 12,
          valueSize: 20,
          subtitleSize: 10,
          iconSize: 16,
        };
      case 'large':
        return {
          padding: 20,
          titleSize: 16,
          valueSize: 32,
          subtitleSize: 14,
          iconSize: 28,
        };
      default: // medium
        return {
          padding: 16,
          titleSize: 14,
          valueSize: 24,
          subtitleSize: 12,
          iconSize: 20,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  // Get trend styling
  const getTrendStyle = () => {
    switch (trend) {
      case 'positive':
        return {
          backgroundColor: '#065f46',
          borderColor: '#10b981',
          valueColor: '#10b981',
          accentColor: '#10b981',
        };
      case 'negative':
        return {
          backgroundColor: '#7f1d1d',
          borderColor: '#ef4444',
          valueColor: '#ef4444',
          accentColor: '#ef4444',
        };
      default: // neutral
        return {
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          valueColor: '#ffffff',
          accentColor: '#7c3aed',
        };
    }
  };

  const trendStyle = getTrendStyle();

  // Entry animation
  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, [delay, fadeAnim, scaleAnim]);

  // Bounce animation for positive trends
  useEffect(() => {
    if (trend === 'positive') {
      const bounce = Animated.sequence([
        Animated.delay(delay + 800),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 120,
          friction: 4,
          useNativeDriver: true,
        }),
      ]);

      bounce.start();
    }
  }, [trend, delay, bounceAnim]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { 
              translateY: bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -4],
              })
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.statCard,
          {
            backgroundColor: trendStyle.backgroundColor,
            borderColor: trendStyle.borderColor,
            padding: sizeStyle.padding,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon} fontSize={sizeStyle.iconSize}>
            {icon}
          </Text>
          {trend === 'positive' && (
            <View style={[styles.trendBadge, { backgroundColor: trendStyle.accentColor }]}>
              <Text style={styles.trendBadgeText}>↗</Text>
            </View>
          )}
          {trend === 'negative' && (
            <View style={[styles.trendBadge, { backgroundColor: trendStyle.accentColor }]}>
              <Text style={styles.trendBadgeText}>↘</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          style={[
            styles.cardTitle,
            { 
              fontSize: sizeStyle.titleSize,
              color: '#e5e7eb',
            },
          ]}
        >
          {title}
        </Text>

        {/* Value */}
        <Text
          style={[
            styles.cardValue,
            {
              fontSize: sizeStyle.valueSize,
              color: trendStyle.valueColor,
            },
          ]}
        >
          {value}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text
            style={[
              styles.cardSubtitle,
              { 
                fontSize: sizeStyle.subtitleSize,
                color: '#9ca3af',
              },
            ]}
          >
            {subtitle}
          </Text>
        )}

        {/* Progress indicator for completion rate */}
        {title.includes('Completati') && (
          <View style={styles.progressIndicator}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, Number(value) * 10)}%`,
                  backgroundColor: trendStyle.accentColor,
                },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const TodayStats: React.FC<TodayStatsProps> = ({
  stats,
  onStatPress,
  style,
  showAnimation = true,
  compact = false,
}) => {
  const containerAnim = useRef(new Animated.Value(0)).current;

  // Container animation
  useEffect(() => {
    if (showAnimation) {
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      containerAnim.setValue(1);
    }
  }, [showAnimation, containerAnim]);

  // Calculate completion rate
  const totalInterventions = stats.interventions_completed + stats.interventions_dismissed;
  const completionRate = totalInterventions > 0 
    ? (stats.interventions_completed / totalInterventions) * 100 
    : 0;

  // Format time
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Get trend for improvements
  const getImprovementTrend = (value: number): 'positive' | 'negative' | 'neutral' => {
    if (value > 0.5) return 'positive';
    if (value < -0.5) return 'negative';
    return 'neutral';
  };

  // Stats configuration
  const statsConfig = [
    {
      key: 'completed',
      title: 'Completati',
      value: stats.interventions_completed,
      subtitle: `${completionRate.toFixed(0)}% tasso di completamento`,
      icon: '✅',
      trend: completionRate >= 80 ? 'positive' : completionRate >= 50 ? 'neutral' : 'negative',
    },
    {
      key: 'engagement',
      title: 'Tempo Attivo',
      value: formatTime(stats.total_engagement_time_minutes),
      subtitle: 'di engagement oggi',
      icon: '⏱️',
      trend: stats.total_engagement_time_minutes >= 30 ? 'positive' : 'neutral',
    },
    {
      key: 'rating',
      title: 'Rating Medio',
      value: stats.avg_completion_rating.toFixed(1),
      subtitle: 'su 5.0 stelle',
      icon: '⭐',
      trend: stats.avg_completion_rating >= 4 ? 'positive' : stats.avg_completion_rating >= 3 ? 'neutral' : 'negative',
    },
    {
      key: 'stress',
      title: 'Stress',
      value: stats.stress_improvement > 0 ? `+${stats.stress_improvement.toFixed(1)}` : stats.stress_improvement.toFixed(1),
      subtitle: 'punti di miglioramento',
      icon: '🧘',
      trend: getImprovementTrend(stats.stress_improvement),
    },
    {
      key: 'energy',
      title: 'Energia',
      value: stats.energy_improvement > 0 ? `+${stats.energy_improvement.toFixed(1)}` : stats.energy_improvement.toFixed(1),
      subtitle: 'punti di miglioramento',
      icon: '⚡',
      trend: getImprovementTrend(stats.energy_improvement),
    },
  ];

  // Get daily summary
  const getDailySummary = () => {
    const improvements = [stats.stress_improvement, stats.energy_improvement];
    const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
    
    if (stats.interventions_completed >= 3 && avgImprovement > 0.5) {
      return {
        text: 'Giornata eccellente!',
        icon: '🎉',
        color: '#10b981',
      };
    } else if (stats.interventions_completed >= 2 && avgImprovement >= 0) {
      return {
        text: 'Buona giornata',
        icon: '👍',
        color: '#10b981',
      };
    } else if (stats.interventions_completed >= 1) {
      return {
        text: 'Buon inizio',
        icon: '🌱',
        color: '#6b7280',
      };
    } else {
      return {
        text: 'Inizia la giornata',
        icon: '☀️',
        color: '#7c3aed',
      };
    }
  };

  const summary = getDailySummary();

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>Oggi</Text>
          <View style={styles.compactSummary}>
            <Text style={styles.compactSummaryIcon}>{summary.icon}</Text>
            <Text style={[styles.compactSummaryText, { color: summary.color }]}>
              {summary.text}
            </Text>
          </View>
        </View>
        <View style={styles.compactStats}>
          {statsConfig.slice(0, 3).map((stat) => (
            <View key={stat.key} style={styles.compactStat}>
              <Text style={styles.compactStatIcon}>{stat.icon}</Text>
              <Text style={styles.compactStatValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerAnim,
          transform: [
            {
              translateY: containerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Statistiche di Oggi</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryIcon}>{summary.icon}</Text>
          <Text style={[styles.summaryText, { color: summary.color }]}>
            {summary.text}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statsConfig.map((stat, index) => (
          <StatCard
            key={stat.key}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend as any}
            onPress={() => onStatPress?.(stat.key)}
            delay={showAnimation ? index * 100 : 0}
            size="medium"
          />
        ))}
      </View>

      {/* Daily Goal Progress */}
      {stats.interventions_completed < 5 && (
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>
            🎯 Obiettivo Giornaliero
          </Text>
          <Text style={styles.goalText}>
            {5 - stats.interventions_completed} consigli rimanenti per raggiungere l'obiettivo giornaliero
          </Text>
          <View style={styles.goalProgress}>
            <View
              style={[
                styles.goalProgressBar,
                {
                  width: `${(stats.interventions_completed / 5) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 20,
  },
  trendBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  cardValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    opacity: 0.8,
  },
  progressIndicator: {
    marginTop: 8,
    height: 2,
    backgroundColor: '#374151',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
  goalContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  goalText: {
    fontSize: 13,
    color: '#e5e7eb',
    marginBottom: 12,
  },
  goalProgress: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 2,
  },
  compactContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  compactSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactSummaryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  compactSummaryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compactStat: {
    alignItems: 'center',
  },
  compactStatIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  compactStatValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
