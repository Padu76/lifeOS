// =====================================================
// LifeOS - Life Score Ring Component
// File: LifeScoreRing.tsx
// =====================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { LifeScoreV2 } from '../hooks';

const { width } = Dimensions.get('window');
const RING_SIZE = width * 0.7;
const RING_RADIUS = (RING_SIZE - 40) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface LifeScoreRingProps {
  lifeScore: LifeScoreV2;
  burnoutRisk?: 'low' | 'medium' | 'high' | null;
  onPress?: () => void;
  style?: ViewStyle;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const LifeScoreRing: React.FC<LifeScoreRingProps> = ({
  lifeScore,
  burnoutRisk,
  onPress,
  style,
}) => {
  // Animation values
  const overallProgress = useRef(new Animated.Value(0)).current;
  const stressProgress = useRef(new Animated.Value(0)).current;
  const energyProgress = useRef(new Animated.Value(0)).current;
  const sleepProgress = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate percentages (0-1)
  const overallPercentage = lifeScore.overall / 10;
  const stressPercentage = lifeScore.stress / 10;
  const energyPercentage = lifeScore.energy / 10;
  const sleepPercentage = lifeScore.sleep / 10;

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  // Progress animations
  useEffect(() => {
    const animations = [
      Animated.timing(overallProgress, {
        toValue: overallPercentage,
        duration: 1200,
        useNativeDriver: false,
      }),
      Animated.timing(stressProgress, {
        toValue: stressPercentage,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(energyProgress, {
        toValue: energyPercentage,
        duration: 1100,
        useNativeDriver: false,
      }),
      Animated.timing(sleepProgress, {
        toValue: sleepPercentage,
        duration: 1300,
        useNativeDriver: false,
      }),
    ];

    Animated.stagger(200, animations).start();
  }, [lifeScore, overallProgress, stressProgress, energyProgress, sleepProgress]);

  // Pulse animation for low scores
  useEffect(() => {
    if (lifeScore.overall < 5 || burnoutRisk === 'high') {
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(pulse).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [lifeScore.overall, burnoutRisk, pulseAnim]);

  // Get color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 8) return '#22c55e'; // Green
    if (score >= 6) return '#eab308'; // Yellow
    if (score >= 4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Get burnout risk color
  const getBurnoutRiskColor = (): string => {
    switch (burnoutRisk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  // Calculate stroke dash array for progress
  const getStrokeDashArray = (progress: Animated.Value, offset: number = 0): any => {
    return progress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        `0, ${RING_CIRCUMFERENCE}`,
        `${RING_CIRCUMFERENCE}, ${RING_CIRCUMFERENCE}`
      ],
    });
  };

  // Get stroke dash offset for positioning
  const getStrokeDashOffset = (offset: number): number => {
    return RING_CIRCUMFERENCE * (0.25 + offset); // Start from top
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
          ],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        style={styles.touchable}
        activeOpacity={0.9}
      >
        {/* SVG Rings */}
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <G rotation="-90" origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}>
              {/* Background circles */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke="#1f2937"
                strokeWidth={12}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS - 20}
                stroke="#1f2937"
                strokeWidth={8}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS - 35}
                stroke="#1f2937"
                strokeWidth={6}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS - 48}
                stroke="#1f2937"
                strokeWidth={6}
                fill="none"
              />

              {/* Progress circles */}
              
              {/* Overall Score (outer ring) */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={getScoreColor(lifeScore.overall)}
                strokeWidth={12}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getStrokeDashArray(overallProgress)}
                strokeDashoffset={getStrokeDashOffset(0)}
              />

              {/* Stress Score */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS - 20}
                stroke={getScoreColor(lifeScore.stress)}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getStrokeDashArray(stressProgress)}
                strokeDashoffset={getStrokeDashOffset(0)}
              />

              {/* Energy Score */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS - 35}
                stroke={getScoreColor(lifeScore.energy)}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getStrokeDashArray(energyProgress)}
                strokeDashoffset={getStrokeDashOffset(0)}
              />

              {/* Sleep Score */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS - 48}
                stroke={getScoreColor(lifeScore.sleep)}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={getStrokeDashArray(sleepProgress)}
                strokeDashoffset={getStrokeDashOffset(0)}
              />
            </G>
          </Svg>

          {/* Center Content */}
          <View style={styles.centerContent}>
            <Text style={styles.overallScore}>
              {lifeScore.overall.toFixed(1)}
            </Text>
            <Text style={styles.overallLabel}>Life Score</Text>
            
            {burnoutRisk && (
              <View style={[
                styles.burnoutRiskBadge,
                { backgroundColor: getBurnoutRiskColor() }
              ]}>
                <Text style={styles.burnoutRiskText}>
                  {burnoutRisk.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Score Breakdown */}
        <View style={styles.scoreBreakdown}>
          <View style={styles.scoreItem}>
            <View style={[styles.scoreDot, { backgroundColor: getScoreColor(lifeScore.stress) }]} />
            <Text style={styles.scoreLabel}>Stress</Text>
            <Text style={styles.scoreValue}>{lifeScore.stress.toFixed(1)}</Text>
          </View>

          <View style={styles.scoreItem}>
            <View style={[styles.scoreDot, { backgroundColor: getScoreColor(lifeScore.energy) }]} />
            <Text style={styles.scoreLabel}>Energia</Text>
            <Text style={styles.scoreValue}>{lifeScore.energy.toFixed(1)}</Text>
          </View>

          <View style={styles.scoreItem}>
            <View style={[styles.scoreDot, { backgroundColor: getScoreColor(lifeScore.sleep) }]} />
            <Text style={styles.scoreLabel}>Sonno</Text>
            <Text style={styles.scoreValue}>{lifeScore.sleep.toFixed(1)}</Text>
          </View>
        </View>

        {/* Tap to view details */}
        {onPress && (
          <Text style={styles.tapHint}>Tocca per vedere dettagli</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  touchable: {
    alignItems: 'center',
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -50 },
      { translateY: -50 },
    ],
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  overallLabel: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  burnoutRiskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  burnoutRiskText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
  },
  scoreDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tapHint: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
});
