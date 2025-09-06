// =====================================================
// LifeOS - Quick Metrics Component
// File: QuickMetrics.tsx
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

interface WeeklyTrends {
  stress_trend: 'improving' | 'stable' | 'declining';
  energy_trend: 'improving' | 'stable' | 'declining';
  sleep_trend: 'improving' | 'stable' | 'declining';
  engagement_trend: 'improving' | 'stable' | 'declining';
}

interface QuickMetricsProps {
  trends: WeeklyTrends;
  onMetricPress?: (metric: string) => void;
  style?: ViewStyle;
  showAnimation?: boolean;
}

interface MetricCardProps {
  title: string;
  trend: 'improving' | 'stable' | 'declining';
  icon: string;
  onPress?: () => void;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  trend,
  icon,
  onPress,
  delay = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get trend styling
  const getTrendStyle = () => {
    switch (trend) {
      case 'improving':
        return {
          backgroundColor: '#10b981',
          borderColor: '#10b981',
          textColor: '#ffffff',
          arrow: '↗️',
          description: 'In miglioramento',
        };
      case 'declining':
        return {
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          textColor: '#ffffff',
          arrow: '↘️',
          description: 'In calo',
        };
      default: // stable
        return {
          backgroundColor: '#6b7280',
          borderColor: '#6b7280',
          textColor: '#ffffff',
          arrow: '→',
          description: 'Stabile',
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

  // Pulse animation for improving trends
  useEffect(() => {
    if (trend === 'improving') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      pulse.start();

      return () => pulse.stop();
    }
  }, [trend, pulseAnim]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.metricCard,
          {
            backgroundColor: trendStyle.backgroundColor,
            borderColor: trendStyle.borderColor,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Icon and Arrow */}
        <View style={styles.metricHeader}>
          <Text style={styles.metricIcon}>{icon}</Text>
          <Text style={styles.trendArrow}>{trendStyle.arrow}</Text>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.metricTitle,
            { color: trendStyle.textColor },
          ]}
        >
          {title}
        </Text>

        {/* Trend Description */}
        <Text
          style={[
            styles.trendDescription,
            { color: trendStyle.textColor },
          ]}
        >
          {trendStyle.description}
        </Text>

        {/* Trend Indicator Line */}
        <View style={styles.trendIndicator}>
          <View
            style={[
              styles.trendLine,
              {
                backgroundColor: trendStyle.textColor,
                opacity: 0.3,
              },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const QuickMetrics: React.FC<QuickMetricsProps> = ({
  trends,
  onMetricPress,
  style,
  showAnimation = true,
}) => {
  const containerAnim = useRef(new Animated.Value(0)).current;

  // Container animation
  useEffect(() => {
    if (showAnimation) {
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      containerAnim.setValue(1);
    }
  }, [showAnimation, containerAnim]);

  // Metrics configuration
  const metrics = [
    {
      key: 'stress',
      title: 'Stress',
      trend: trends.stress_trend,
      icon: '🧘',
    },
    {
      key: 'energy',
      title: 'Energia',
      trend: trends.energy_trend,
      icon: '⚡',
    },
    {
      key: 'sleep',
      title: 'Sonno',
      trend: trends.sleep_trend,
      icon: '😴',
    },
    {
      key: 'engagement',
      title: 'Engagement',
      trend: trends.engagement_trend,
      icon: '🎯',
    },
  ];

  // Get overall trend summary
  const getOverallSummary = () => {
    const improving = metrics.filter(m => m.trend === 'improving').length;
    const declining = metrics.filter(m => m.trend === 'declining').length;
    const stable = metrics.filter(m => m.trend === 'stable').length;

    if (improving >= 3) {
      return {
        text: 'Ottimo progresso!',
        icon: '🎉',
        color: '#10b981',
      };
    } else if (declining >= 3) {
      return {
        text: 'Serve attenzione',
        icon: '⚠️',
        color: '#ef4444',
      };
    } else if (improving > declining) {
      return {
        text: 'Buon andamento',
        icon: '👍',
        color: '#10b981',
      };
    } else {
      return {
        text: 'Andamento stabile',
        icon: '📊',
        color: '#6b7280',
      };
    }
  };

  const summary = getOverallSummary();

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
                outputRange: [20, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tendenze Settimanali</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryIcon}>{summary.icon}</Text>
          <Text style={[styles.summaryText, { color: summary.color }]}>
            {summary.text}
          </Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            trend={metric.trend}
            icon={metric.icon}
            onPress={() => onMetricPress?.(metric.key)}
            delay={showAnimation ? index * 100 : 0}
          />
        ))}
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>💡 Insight</Text>
        <Text style={styles.insightsText}>
          {getInsightMessage(trends)}
        </Text>
      </View>
    </Animated.View>
  );
};

// Helper function to get insight message
const getInsightMessage = (trends: WeeklyTrends): string => {
  const improving = Object.values(trends).filter(t => t === 'improving').length;
  const declining = Object.values(trends).filter(t => t === 'declining').length;

  if (improving >= 3) {
    return 'Stai facendo progressi eccellenti! Continua così per mantenere il momentum positivo.';
  }

  if (declining >= 2) {
    return 'Alcune aree potrebbero beneficiare di maggiore attenzione. Considera di aumentare la frequenza dei micro-consigli.';
  }

  if (trends.stress_trend === 'declining' && trends.energy_trend === 'improving') {
    return 'Lo stress in aumento potrebbe influire sui tuoi progressi energetici. Prova tecniche di rilassamento.';
  }

  if (trends.sleep_trend === 'declining') {
    return 'La qualità del sonno è fondamentale per tutto il resto. Concentrati su una routine serale consistente.';
  }

  if (trends.engagement_trend === 'declining') {
    return 'Il coinvolgimento è in calo. Prova a variare i tipi di micro-consigli per ritrovare motivazione.';
  }

  return 'Mantieni la costanza nelle tue abitudini per vedere miglioramenti più significativi nel tempo.';
};

// Preset Quick Metrics
export const WeeklyTrendsMetrics: React.FC<{
  trends: WeeklyTrends;
  style?: ViewStyle;
}> = ({ trends, style }) => (
  <QuickMetrics
    trends={trends}
    style={style}
  />
);

export const CompactMetrics: React.FC<{
  trends: WeeklyTrends;
  style?: ViewStyle;
}> = ({ trends, style }) => (
  <View style={[styles.compactContainer, style]}>
    {Object.entries(trends).map(([key, trend], index) => {
      const icons = {
        stress_trend: '🧘',
        energy_trend: '⚡',
        sleep_trend: '😴',
        engagement_trend: '🎯',
      };
      
      const arrows = {
        improving: '↗️',
        declining: '↘️',
        stable: '→',
      };

      return (
        <View key={key} style={styles.compactMetric}>
          <Text style={styles.compactIcon}>
            {icons[key as keyof typeof icons]}
          </Text>
          <Text style={styles.compactArrow}>
            {arrows[trend]}
          </Text>
        </View>
      );
    })}
  </View>
);

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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 24,
  },
  trendArrow: {
    fontSize: 16,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
  trendIndicator: {
    width: '100%',
    marginTop: 8,
  },
  trendLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },
  insightsContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  insightsText: {
    fontSize: 13,
    color: '#e5e7eb',
    lineHeight: 18,
  },
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
  },
  compactMetric: {
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  compactArrow: {
    fontSize: 14,
  },
});
