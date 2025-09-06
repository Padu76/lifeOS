// =====================================================
// LifeOS - Metric Card Component
// File: MetricCard.tsx
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

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: 'improving' | 'stable' | 'declining';
  onPress?: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  showAnimation?: boolean;
  showTrendArrow?: boolean;
  gradient?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onPress,
  color,
  size = 'medium',
  style,
  showAnimation = true,
  showTrendArrow = true,
  gradient = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Get size styling
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          padding: 12,
          titleSize: 12,
          valueSize: 18,
          subtitleSize: 10,
          iconSize: 16,
          minWidth: 100,
          minHeight: 80,
        };
      case 'large':
        return {
          padding: 24,
          titleSize: 16,
          valueSize: 32,
          subtitleSize: 14,
          iconSize: 28,
          minWidth: 160,
          minHeight: 140,
        };
      default: // medium
        return {
          padding: 16,
          titleSize: 14,
          valueSize: 24,
          subtitleSize: 12,
          iconSize: 20,
          minWidth: 120,
          minHeight: 100,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  // Get trend styling
  const getTrendStyle = () => {
    switch (trend) {
      case 'improving':
        return {
          color: '#10b981',
          backgroundColor: '#065f46',
          borderColor: '#10b981',
          arrow: '↗️',
          glowColor: '#10b981',
        };
      case 'declining':
        return {
          color: '#ef4444',
          backgroundColor: '#7f1d1d',
          borderColor: '#ef4444',
          arrow: '↘️',
          glowColor: '#ef4444',
        };
      default: // stable
        return {
          color: color || '#7c3aed',
          backgroundColor: '#16213e',
          borderColor: color || '#7c3aed',
          arrow: '→',
          glowColor: color || '#7c3aed',
        };
    }
  };

  const trendStyle = getTrendStyle();

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
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [showAnimation, fadeAnim, scaleAnim]);

  // Bounce animation for improving trends
  useEffect(() => {
    if (trend === 'improving') {
      const bounce = Animated.sequence([
        Animated.delay(600),
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 120,
          friction: 4,
          useNativeDriver: true,
        }),
      ]);

      bounce.start();
    }
  }, [trend, bounceAnim]);

  // Shimmer animation for gradient cards
  useEffect(() => {
    if (gradient) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );

      shimmer.start();

      return () => shimmer.stop();
    }
  }, [gradient, shimmerAnim]);

  // Format value
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toString();
    }
    return val;
  };

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
          styles.card,
          {
            backgroundColor: trendStyle.backgroundColor,
            borderColor: trendStyle.borderColor,
            padding: sizeStyle.padding,
            minWidth: sizeStyle.minWidth,
            minHeight: sizeStyle.minHeight,
            shadowColor: trendStyle.glowColor,
          },
          gradient && styles.gradientCard,
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={!onPress}
      >
        {/* Shimmer overlay for gradient */}
        {gradient && (
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 100],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text 
            style={[
              styles.icon, 
              { fontSize: sizeStyle.iconSize }
            ]}
          >
            {icon}
          </Text>
          
          {trend && showTrendArrow && (
            <View style={[styles.trendBadge, { backgroundColor: trendStyle.color }]}>
              <Text style={styles.trendArrow}>{trendStyle.arrow}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              fontSize: sizeStyle.titleSize,
              color: '#e5e7eb',
            },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {/* Value */}
        <Text
          style={[
            styles.value,
            {
              fontSize: sizeStyle.valueSize,
              color: trendStyle.color,
            },
          ]}
        >
          {formatValue(value)}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: sizeStyle.subtitleSize,
                color: '#9ca3af',
              },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}

        {/* Progress indicator for percentage values */}
        {typeof value === 'string' && value.includes('%') && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, parseFloat(value.replace('%', '')))}%`,
                  backgroundColor: trendStyle.color,
                },
              ]}
            />
          </View>
        )}

        {/* Trend indicator for non-percentage numeric values */}
        {typeof value === 'number' && trend && (
          <View style={styles.trendIndicator}>
            <View style={[styles.trendLine, { backgroundColor: trendStyle.color }]} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Preset Metric Cards
export const PercentageCard: React.FC<{
  title: string;
  percentage: number;
  icon: string;
  trend?: 'improving' | 'stable' | 'declining';
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ title, percentage, icon, trend, onPress, style }) => (
  <MetricCard
    title={title}
    value={`${percentage.toFixed(1)}%`}
    icon={icon}
    trend={trend}
    onPress={onPress}
    style={style}
    gradient
  />
);

export const CounterCard: React.FC<{
  title: string;
  count: number;
  subtitle?: string;
  icon: string;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ title, count, subtitle, icon, color, onPress, style }) => (
  <MetricCard
    title={title}
    value={count}
    subtitle={subtitle}
    icon={icon}
    color={color}
    onPress={onPress}
    style={style}
    showTrendArrow={false}
  />
);

export const TimeCard: React.FC<{
  title: string;
  minutes: number;
  icon: string;
  trend?: 'improving' | 'stable' | 'declining';
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ title, minutes, icon, trend, onPress, style }) => {
  const formatTime = (mins: number): string => {
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  return (
    <MetricCard
      title={title}
      value={formatTime(minutes)}
      icon={icon}
      trend={trend}
      onPress={onPress}
      style={style}
    />
  );
};

export const ScoreCard: React.FC<{
  title: string;
  score: number;
  maxScore?: number;
  icon: string;
  trend?: 'improving' | 'stable' | 'declining';
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ title, score, maxScore = 10, icon, trend, onPress, style }) => (
  <MetricCard
    title={title}
    value={`${score.toFixed(1)}/${maxScore}`}
    icon={icon}
    trend={trend}
    onPress={onPress}
    style={style}
    gradient
  />
);

export const MiniMetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ title, value, icon, color, onPress, style }) => (
  <MetricCard
    title={title}
    value={value}
    icon={icon}
    color={color}
    size="small"
    onPress={onPress}
    style={style}
    showTrendArrow={false}
    showAnimation={false}
  />
);

// Grid Layout Helper
export const MetricGrid: React.FC<{
  metrics: Array<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    trend?: 'improving' | 'stable' | 'declining';
    onPress?: () => void;
  }>;
  columns?: number;
  style?: ViewStyle;
}> = ({ metrics, columns = 2, style }) => (
  <View style={[styles.grid, { gap: 12 }, style]}>
    {metrics.map((metric, index) => (
      <View key={index} style={{ flex: 1 }}>
        <MetricCard
          {...metric}
          size="medium"
          showAnimation={true}
        />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientCard: {
    borderWidth: 2,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    lineHeight: 24,
  },
  trendBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendArrow: {
    fontSize: 10,
    color: '#ffffff',
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 18,
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 16,
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 8,
    height: 3,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  trendIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  trendLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
