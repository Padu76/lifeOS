// =====================================================
// LifeOS - Category Insight Card Component
// File: CategoryInsightCard.tsx
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

interface CategoryInsight {
  category: string;
  total_interventions: number;
  completion_rate: number;
  avg_rating: number;
  avg_duration_minutes: number;
  effectiveness_score: number;
  trend: 'improving' | 'stable' | 'declining';
}

interface CategoryInsightCardProps {
  category: CategoryInsight;
  onPress?: () => void;
  style?: ViewStyle;
  showAnimation?: boolean;
  compact?: boolean;
}

export const CategoryInsightCard: React.FC<CategoryInsightCardProps> = ({
  category,
  onPress,
  style,
  showAnimation = true,
  compact = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Entry animation
  useEffect(() => {
    if (showAnimation) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          delay: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      progressAnim.setValue(1);
    }
  }, [showAnimation, fadeAnim, scaleAnim, progressAnim]);

  // Get category icon
  const getCategoryIcon = (): string => {
    const categoryIcons: Record<string, string> = {
      stress: '🧘',
      energy: '⚡',
      sleep: '😴',
      focus: '🎯',
      movement: '🏃',
      nutrition: '🥗',
      social: '👥',
      mindfulness: '🌸',
      productivity: '💼',
      recovery: '🛋️',
      breathing: '🫁',
      meditation: '🧘‍♀️',
      exercise: '💪',
      hydration: '💧',
      reading: '📚',
      creativity: '🎨',
    };
    
    return categoryIcons[category.category.toLowerCase()] || '💡';
  };

  // Get effectiveness color
  const getEffectivenessColor = (): string => {
    if (category.effectiveness_score >= 0.8) return '#10b981'; // Green
    if (category.effectiveness_score >= 0.6) return '#eab308'; // Yellow
    if (category.effectiveness_score >= 0.4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Get trend styling
  const getTrendStyle = () => {
    switch (category.trend) {
      case 'improving':
        return {
          color: '#10b981',
          icon: '📈',
          bgColor: '#065f46',
        };
      case 'declining':
        return {
          color: '#ef4444',
          icon: '📉',
          bgColor: '#7f1d1d',
        };
      default: // stable
        return {
          color: '#6b7280',
          icon: '📊',
          bgColor: '#374151',
        };
    }
  };

  const trendStyle = getTrendStyle();

  // Format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Get performance level
  const getPerformanceLevel = (): { text: string; color: string } => {
    const score = category.effectiveness_score;
    if (score >= 0.8) return { text: 'Eccellente', color: '#10b981' };
    if (score >= 0.6) return { text: 'Buono', color: '#eab308' };
    if (score >= 0.4) return { text: 'Medio', color: '#f97316' };
    return { text: 'Da migliorare', color: '#ef4444' };
  };

  const performance = getPerformanceLevel();

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.compactContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.compactCard}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.compactHeader}>
            <Text style={styles.compactIcon}>{getCategoryIcon()}</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle}>{category.category}</Text>
              <Text style={[styles.compactScore, { color: getEffectivenessColor() }]}>
                {(category.effectiveness_score * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={[styles.compactTrend, { color: trendStyle.color }]}>
              {trendStyle.icon}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
            <View>
              <Text style={styles.categoryTitle}>{category.category}</Text>
              <Text style={[styles.performanceLevel, { color: performance.color }]}>
                {performance.text}
              </Text>
            </View>
          </View>
          
          <View style={[styles.trendBadge, { backgroundColor: trendStyle.bgColor }]}>
            <Text style={styles.trendIcon}>{trendStyle.icon}</Text>
            <Text style={[styles.trendText, { color: trendStyle.color }]}>
              {category.trend}
            </Text>
          </View>
        </View>

        {/* Main Metric - Effectiveness Score */}
        <View style={styles.mainMetric}>
          <Text style={styles.effectivenessLabel}>Efficacia</Text>
          <Text style={[styles.effectivenessValue, { color: getEffectivenessColor() }]}>
            {(category.effectiveness_score * 100).toFixed(1)}%
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: getEffectivenessColor(),
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${category.effectiveness_score * 100}%`],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{category.total_interventions}</Text>
            <Text style={styles.statLabel}>Totali</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(category.completion_rate * 100).toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Completati</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{category.avg_rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(category.avg_duration_minutes)}</Text>
            <Text style={styles.statLabel}>Durata</Text>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>💡 Insight</Text>
          <Text style={styles.insightsText}>
            {generateInsight(category)}
          </Text>
        </View>

        {/* Performance Indicators */}
        <View style={styles.indicatorsContainer}>
          <PerformanceIndicator
            label="Completamento"
            value={category.completion_rate}
            color="#3b82f6"
            animated={showAnimation}
            delay={600}
          />
          <PerformanceIndicator
            label="Soddisfazione"
            value={category.avg_rating / 5}
            color="#f59e0b"
            animated={showAnimation}
            delay={800}
          />
          <PerformanceIndicator
            label="Efficienza"
            value={Math.min(1, (30 / category.avg_duration_minutes))}
            color="#10b981"
            animated={showAnimation}
            delay={1000}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Performance Indicator Component
interface PerformanceIndicatorProps {
  label: string;
  value: number; // 0-1
  color: string;
  animated?: boolean;
  delay?: number;
}

const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  label,
  value,
  color,
  animated = true,
  delay = 0,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: value,
        duration: 800,
        delay,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(value);
    }
  }, [animated, value, delay, progressAnim]);

  return (
    <View style={styles.indicator}>
      <Text style={styles.indicatorLabel}>{label}</Text>
      <View style={styles.indicatorTrack}>
        <Animated.View
          style={[
            styles.indicatorProgress,
            {
              backgroundColor: color,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.indicatorValue}>{(value * 100).toFixed(0)}%</Text>
    </View>
  );
};

// Generate insight text based on category data
const generateInsight = (category: CategoryInsight): string => {
  const completionRate = category.completion_rate;
  const effectiveness = category.effectiveness_score;
  const rating = category.avg_rating;

  if (effectiveness >= 0.8 && completionRate >= 0.8) {
    return `Categoria ad alta performance! Mantieni questa strategia.`;
  }

  if (completionRate < 0.5) {
    return `Basso tasso di completamento. Prova consigli più brevi o in momenti diversi.`;
  }

  if (rating < 3) {
    return `Rating basso. I consigli potrebbero non essere adatti alle tue preferenze.`;
  }

  if (category.avg_duration_minutes > 45) {
    return `Durata elevata. Considera consigli più concisi per aumentare l'engagement.`;
  }

  if (category.trend === 'declining') {
    return `Performance in calo. Potrebbe essere il momento di variare l'approccio.`;
  }

  if (category.trend === 'improving') {
    return `Ottimo progresso! Continua su questa strada per risultati ancora migliori.`;
  }

  return `Performance stabile. Piccoli aggiustamenti potrebbero portare miglioramenti.`;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  performanceLevel: {
    fontSize: 12,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  mainMetric: {
    alignItems: 'center',
    marginBottom: 16,
  },
  effectivenessLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  effectivenessValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  insightsContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  insightsText: {
    fontSize: 11,
    color: '#e5e7eb',
    lineHeight: 16,
  },
  indicatorsContainer: {
    gap: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorLabel: {
    fontSize: 10,
    color: '#9ca3af',
    width: 70,
  },
  indicatorTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  indicatorProgress: {
    height: '100%',
    borderRadius: 2,
  },
  indicatorValue: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    width: 30,
    textAlign: 'right',
  },
  compactContainer: {
    marginBottom: 8,
  },
  compactCard: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  compactScore: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  compactTrend: {
    fontSize: 16,
  },
});
