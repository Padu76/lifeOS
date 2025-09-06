// =====================================================
// LifeOS - Pattern Insight Card Component
// File: PatternInsightCard.tsx
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

interface PatternInsight {
  pattern_type: 'time_of_day' | 'day_of_week' | 'stress_level' | 'energy_level';
  pattern_value: string;
  success_rate: number;
  confidence_score: number;
  description: string;
}

interface PatternInsightCardProps {
  pattern: PatternInsight;
  onPress?: () => void;
  style?: ViewStyle;
  showAnimation?: boolean;
  compact?: boolean;
}

export const PatternInsightCard: React.FC<PatternInsightCardProps> = ({
  pattern,
  onPress,
  style,
  showAnimation = true,
  compact = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const confidenceAnim = useRef(new Animated.Value(0)).current;

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
        Animated.timing(successAnim, {
          toValue: pattern.success_rate,
          duration: 1000,
          delay: 300,
          useNativeDriver: false,
        }),
        Animated.timing(confidenceAnim, {
          toValue: pattern.confidence_score,
          duration: 1200,
          delay: 500,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      successAnim.setValue(pattern.success_rate);
      confidenceAnim.setValue(pattern.confidence_score);
    }
  }, [showAnimation, fadeAnim, scaleAnim, successAnim, confidenceAnim, pattern]);

  // Get pattern type styling
  const getPatternTypeStyle = () => {
    switch (pattern.pattern_type) {
      case 'time_of_day':
        return {
          icon: '🕐',
          title: 'Orario Ottimale',
          color: '#3b82f6',
          bgColor: '#1e3a8a',
        };
      case 'day_of_week':
        return {
          icon: '📅',
          title: 'Giorno della Settimana',
          color: '#10b981',
          bgColor: '#065f46',
        };
      case 'stress_level':
        return {
          icon: '🧘',
          title: 'Livello di Stress',
          color: '#ef4444',
          bgColor: '#7f1d1d',
        };
      case 'energy_level':
        return {
          icon: '⚡',
          title: 'Livello di Energia',
          color: '#f59e0b',
          bgColor: '#92400e',
        };
      default:
        return {
          icon: '📊',
          title: 'Pattern',
          color: '#7c3aed',
          bgColor: '#581c87',
        };
    }
  };

  const typeStyle = getPatternTypeStyle();

  // Get success rate color
  const getSuccessRateColor = (): string => {
    if (pattern.success_rate >= 0.8) return '#10b981'; // Green
    if (pattern.success_rate >= 0.6) return '#eab308'; // Yellow
    if (pattern.success_rate >= 0.4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Get confidence level
  const getConfidenceLevel = (): { text: string; color: string } => {
    const score = pattern.confidence_score;
    if (score >= 0.8) return { text: 'Alta', color: '#10b981' };
    if (score >= 0.6) return { text: 'Media', color: '#eab308' };
    if (score >= 0.4) return { text: 'Bassa', color: '#f97316' };
    return { text: 'Molto Bassa', color: '#ef4444' };
  };

  const confidence = getConfidenceLevel();

  // Format pattern value based on type
  const formatPatternValue = (): string => {
    switch (pattern.pattern_type) {
      case 'time_of_day':
        return formatTime(pattern.pattern_value);
      case 'day_of_week':
        return formatDayOfWeek(pattern.pattern_value);
      case 'stress_level':
      case 'energy_level':
        return formatLevel(pattern.pattern_value);
      default:
        return pattern.pattern_value;
    }
  };

  // Helper formatting functions
  const formatTime = (time: string): string => {
    // Assume time is in HH:MM format
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const formatDayOfWeek = (day: string): string => {
    const days: Record<string, string> = {
      'monday': 'Lunedì',
      'tuesday': 'Martedì',
      'wednesday': 'Mercoledì',
      'thursday': 'Giovedì',
      'friday': 'Venerdì',
      'saturday': 'Sabato',
      'sunday': 'Domenica',
    };
    return days[day.toLowerCase()] || day;
  };

  const formatLevel = (level: string): string => {
    const levels: Record<string, string> = {
      'low': 'Basso',
      'medium': 'Medio',
      'high': 'Alto',
      'very_low': 'Molto Basso',
      'very_high': 'Molto Alto',
    };
    return levels[level.toLowerCase()] || level;
  };

  // Get recommendation based on pattern
  const getRecommendation = (): string => {
    const successRate = pattern.success_rate;
    const patternType = pattern.pattern_type;

    if (successRate >= 0.8) {
      switch (patternType) {
        case 'time_of_day':
          return `Ottimo momento per i micro-consigli! Programma più attività in questo orario.`;
        case 'day_of_week':
          return `Giorno molto produttivo! Considera sessioni più intensive.`;
        case 'stress_level':
          return `Livello di stress ideale per l'engagement. Mantieni questo equilibrio.`;
        case 'energy_level':
          return `Energia perfetta per i consigli! Sfrutta al massimo questi momenti.`;
        default:
          return `Pattern ad alta efficacia! Continua a seguire questo approccio.`;
      }
    } else if (successRate >= 0.6) {
      return `Buon pattern da ottimizzare. Piccoli aggiustamenti potrebbero migliorare i risultati.`;
    } else {
      switch (patternType) {
        case 'time_of_day':
          return `Orario meno efficace. Considera di spostare i consigli in altri momenti.`;
        case 'day_of_week':
          return `Giorno difficile. Riduci la frequenza o prova consigli più leggeri.`;
        default:
          return `Pattern da rivedere. Potrebbe essere necessario un approccio diverso.`;
      }
    }
  };

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
          style={[styles.compactCard, { backgroundColor: typeStyle.bgColor }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <View style={styles.compactHeader}>
            <Text style={styles.compactIcon}>{typeStyle.icon}</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle}>{formatPatternValue()}</Text>
              <Text style={[styles.compactSuccess, { color: getSuccessRateColor() }]}>
                {(pattern.success_rate * 100).toFixed(0)}% successo
              </Text>
            </View>
            <View style={styles.compactConfidence}>
              <Text style={[styles.compactConfidenceText, { color: confidence.color }]}>
                {confidence.text}
              </Text>
            </View>
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
        style={[styles.card, { borderLeftColor: typeStyle.color }]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.patternIcon}>{typeStyle.icon}</Text>
            <View>
              <Text style={styles.patternType}>{typeStyle.title}</Text>
              <Text style={styles.patternValue}>{formatPatternValue()}</Text>
            </View>
          </View>
          
          <View style={[styles.confidenceBadge, { backgroundColor: confidence.color }]}>
            <Text style={styles.confidenceText}>
              Fiducia: {confidence.text}
            </Text>
          </View>
        </View>

        {/* Success Rate */}
        <View style={styles.successContainer}>
          <View style={styles.successHeader}>
            <Text style={styles.successLabel}>Tasso di Successo</Text>
            <Text style={[styles.successValue, { color: getSuccessRateColor() }]}>
              {(pattern.success_rate * 100).toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.successProgressContainer}>
            <Animated.View
              style={[
                styles.successProgressBar,
                {
                  backgroundColor: getSuccessRateColor(),
                  width: successAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Confidence Score */}
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceHeader}>
            <Text style={styles.confidenceLabel}>Livello di Fiducia</Text>
            <Text style={[styles.confidenceScore, { color: confidence.color }]}>
              {(pattern.confidence_score * 100).toFixed(0)}%
            </Text>
          </View>
          
          <View style={styles.confidenceProgressContainer}>
            <Animated.View
              style={[
                styles.confidenceProgressBar,
                {
                  backgroundColor: confidence.color,
                  width: confidenceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>📝 Descrizione</Text>
          <Text style={styles.descriptionText}>{pattern.description}</Text>
        </View>

        {/* Recommendation */}
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationTitle}>💡 Raccomandazione</Text>
          <Text style={styles.recommendationText}>{getRecommendation()}</Text>
        </View>

        {/* Pattern Strength Indicator */}
        <View style={styles.strengthContainer}>
          <Text style={styles.strengthTitle}>Forza del Pattern</Text>
          <View style={styles.strengthIndicators}>
            {[1, 2, 3, 4, 5].map((level) => (
              <View
                key={level}
                style={[
                  styles.strengthDot,
                  {
                    backgroundColor: level <= (pattern.confidence_score * 5)
                      ? typeStyle.color
                      : '#374151',
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
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
  patternIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  patternType: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  patternValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  successContainer: {
    marginBottom: 16,
  },
  successHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  successLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  successValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  successProgressContainer: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  successProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  confidenceScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceProgressContainer: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceProgressBar: {
    height: '100%',
    borderRadius: 2,
  },
  descriptionContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  descriptionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 11,
    color: '#e5e7eb',
    lineHeight: 16,
  },
  recommendationContainer: {
    backgroundColor: '#065f46',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  recommendationText: {
    fontSize: 11,
    color: '#d1fae5',
    lineHeight: 16,
  },
  strengthContainer: {
    alignItems: 'center',
  },
  strengthTitle: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 8,
  },
  strengthIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactContainer: {
    marginBottom: 8,
  },
  compactCard: {
    borderRadius: 8,
    padding: 12,
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
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  compactSuccess: {
    fontSize: 11,
    fontWeight: '600',
  },
  compactConfidence: {
    alignItems: 'center',
  },
  compactConfidenceText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
