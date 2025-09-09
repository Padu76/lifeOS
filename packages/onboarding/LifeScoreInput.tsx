// =====================================================
// LifeOS - Life Score Input Component
// File: LifeScoreInput.tsx
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  PanGestureHandler,
  State,
} from 'react-native';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

interface LifeScoreInputProps {
  stressLevel?: number; // 1-10
  energyLevel?: number; // 1-10
  sleepQuality?: number; // 1-10
  onStressChange: (value: number) => void;
  onEnergyChange: (value: number) => void;
  onSleepChange: (value: number) => void;
  style?: ViewStyle;
  showAnimation?: boolean;
}

interface ScoreSliderProps {
  title: string;
  icon: string;
  value: number;
  onValueChange: (value: number) => void;
  color: string;
  lowLabel: string;
  highLabel: string;
  delay?: number;
}

const ScoreSlider: React.FC<ScoreSliderProps> = ({
  title,
  icon,
  value,
  onValueChange,
  color,
  lowLabel,
  highLabel,
  delay = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  // Pulse animation when dragging
  useEffect(() => {
    if (isDragging) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isDragging, pulseAnim]);

  // Handle pan gesture
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    // Implementation would require react-native-gesture-handler
    // For now, we'll use TouchableOpacity for each score
  };

  // Get value color based on score
  const getValueColor = (score: number): string => {
    if (score >= 8) return '#22c55e'; // Green
    if (score >= 6) return '#eab308'; // Yellow
    if (score >= 4) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  // Get emoji for score
  const getScoreEmoji = (score: number): string => {
    if (score >= 9) return '😍';
    if (score >= 8) return '😊';
    if (score >= 7) return '🙂';
    if (score >= 6) return '😐';
    if (score >= 5) return '😕';
    if (score >= 4) return '☹️';
    if (score >= 3) return '😟';
    if (score >= 2) return '😰';
    return '😱';
  };

  return (
    <Animated.View
      style={[
        styles.sliderContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      {/* Header */}
      <View style={styles.sliderHeader}>
        <View style={styles.sliderTitleContainer}>
          <Text style={styles.sliderIcon}>{icon}</Text>
          <Text style={styles.sliderTitle}>{title}</Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.scoreEmoji}>{getScoreEmoji(value)}</Text>
          <Text
            style={[
              styles.sliderValue,
              { color: getValueColor(value) },
            ]}
          >
            {value.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Score Buttons */}
      <View style={styles.scoreButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <TouchableOpacity
            key={score}
            style={[
              styles.scoreButton,
              {
                backgroundColor: score <= value ? color : '#374151',
                borderColor: score === value ? getValueColor(value) : 'transparent',
              },
            ]}
            onPress={() => onValueChange(score)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.scoreButtonText,
                {
                  color: score <= value ? '#ffffff' : '#9ca3af',
                  fontWeight: score === value ? 'bold' : 'normal',
                },
              ]}
            >
              {score}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.lowLabel}>{lowLabel}</Text>
        <Text style={styles.highLabel}>{highLabel}</Text>
      </View>

      {/* Visual Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${(value / 10) * 100}%`,
              backgroundColor: getValueColor(value),
            },
          ]}
        />
      </View>
    </Animated.View>
  );
};

export const LifeScoreInput: React.FC<LifeScoreInputProps> = ({
  stressLevel = 5,
  energyLevel = 5,
  sleepQuality = 5,
  onStressChange,
  onEnergyChange,
  onSleepChange,
  style,
  showAnimation = true,
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

  // Calculate overall score
  const overallScore = (stressLevel + energyLevel + sleepQuality) / 3;

  // Get overall assessment
  const getOverallAssessment = (): { text: string; color: string; icon: string } => {
    if (overallScore >= 8) {
      return {
        text: 'Eccellente! Ti senti fantastico oggi.',
        color: '#22c55e',
        icon: '🌟',
      };
    } else if (overallScore >= 6.5) {
      return {
        text: 'Buono! Stai abbastanza bene.',
        color: '#eab308',
        icon: '👍',
      };
    } else if (overallScore >= 5) {
      return {
        text: 'Nella media. Alcuni aspetti da migliorare.',
        color: '#f97316',
        icon: '⚖️',
      };
    } else {
      return {
        text: 'Difficile. Hai bisogno di maggiore attenzione.',
        color: '#ef4444',
        icon: '🆘',
      };
    }
  };

  const assessment = getOverallAssessment();

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
                outputRange: [50, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Come ti senti oggi?</Text>
        <Text style={styles.subtitle}>
          Valuta il tuo stato attuale da 1 a 10
        </Text>
      </View>

      {/* Stress Level */}
      <ScoreSlider
        title="Livello di Stress"
        icon="🧘"
        value={stressLevel}
        onValueChange={onStressChange}
        color="#ef4444"
        lowLabel="Molto rilassato"
        highLabel="Molto stressato"
        delay={showAnimation ? 0 : 0}
      />

      {/* Energy Level */}
      <ScoreSlider
        title="Livello di Energia"
        icon="⚡"
        value={energyLevel}
        onValueChange={onEnergyChange}
        color="#f59e0b"
        lowLabel="Esausto"
        highLabel="Pieno di energia"
        delay={showAnimation ? 200 : 0}
      />

      {/* Sleep Quality */}
      <ScoreSlider
        title="Qualità del Sonno"
        icon="😴"
        value={sleepQuality}
        onValueChange={onSleepChange}
        color="#7c3aed"
        lowLabel="Pessimo sonno"
        highLabel="Sonno ristoratore"
        delay={showAnimation ? 400 : 0}
      />

      {/* Overall Assessment */}
      <Animated.View
        style={[
          styles.assessmentContainer,
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
        ]}
      >
        <View style={styles.assessmentHeader}>
          <Text style={styles.assessmentIcon}>{assessment.icon}</Text>
          <View>
            <Text style={styles.assessmentTitle}>
              Valutazione Complessiva
            </Text>
            <Text
              style={[
                styles.overallScore,
                { color: assessment.color },
              ]}
            >
              {overallScore.toFixed(1)}/10
            </Text>
          </View>
        </View>
        
        <Text
          style={[
            styles.assessmentText,
            { color: assessment.color },
          ]}
        >
          {assessment.text}
        </Text>

        {/* Score Breakdown */}
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Stress</Text>
            <View style={styles.breakdownBar}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    width: `${(stressLevel / 10) * 100}%`,
                    backgroundColor: '#ef4444',
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownValue}>{stressLevel}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Energia</Text>
            <View style={styles.breakdownBar}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    width: `${(energyLevel / 10) * 100}%`,
                    backgroundColor: '#f59e0b',
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownValue}>{energyLevel}</Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text style={styles.breakdownLabel}>Sonno</Text>
            <View style={styles.breakdownBar}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    width: `${(sleepQuality / 10) * 100}%`,
                    backgroundColor: '#7c3aed',
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownValue}>{sleepQuality}</Text>
          </View>
        </View>
      </Animated.View>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 32,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sliderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sliderIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sliderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  scoreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  scoreButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lowLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  highLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  assessmentContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assessmentIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  assessmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  overallScore: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  assessmentText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    lineHeight: 20,
  },
  breakdownContainer: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#9ca3af',
    width: 60,
  },
  breakdownBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
    width: 20,
    textAlign: 'right',
  },
});
