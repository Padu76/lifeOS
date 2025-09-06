// =====================================================
// LifeOS - Progress Bar Component
// File: ProgressBar.tsx
// =====================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  animationDuration?: number;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  percentageStyle?: TextStyle;
  rounded?: boolean;
  gradient?: boolean;
  striped?: boolean;
  glowing?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = '#7c3aed',
  backgroundColor = '#374151',
  showPercentage = true,
  showLabel = false,
  label,
  animated = true,
  animationDuration = 800,
  style,
  labelStyle,
  percentageStyle,
  rounded = true,
  gradient = false,
  striped = false,
  glowing = false,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const stripeAnim = useRef(new Animated.Value(0)).current;

  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Animate progress change
  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: clampedProgress,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animationDuration, progressAnim]);

  // Glow animation
  useEffect(() => {
    if (glowing && clampedProgress > 0) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      glowAnimation.start();

      return () => glowAnimation.stop();
    }
  }, [glowing, clampedProgress, glowAnim]);

  // Stripe animation
  useEffect(() => {
    if (striped && clampedProgress > 0) {
      const stripeAnimation = Animated.loop(
        Animated.timing(stripeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      stripeAnimation.start();

      return () => stripeAnimation.stop();
    }
  }, [striped, clampedProgress, stripeAnim]);

  // Get progress color based on value
  const getProgressColor = () => {
    if (gradient) {
      if (clampedProgress >= 80) return '#22c55e'; // Green
      if (clampedProgress >= 60) return '#eab308'; // Yellow
      if (clampedProgress >= 40) return '#f97316'; // Orange
      return '#ef4444'; // Red
    }
    return color;
  };

  // Get glow style
  const getGlowStyle = () => {
    if (!glowing) return {};
    
    return {
      shadowColor: getProgressColor(),
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: glowAnim,
      shadowRadius: 8,
      elevation: 8,
    };
  };

  // Get stripe transform
  const getStripeTransform = () => {
    if (!striped) return [];
    
    return [
      {
        translateX: stripeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-20, 20],
        }),
      },
    ];
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {showLabel && label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          {showPercentage && (
            <Text style={[styles.percentage, percentageStyle]}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}

      {/* Progress Bar Container */}
      <View
        style={[
          styles.progressContainer,
          {
            height,
            backgroundColor,
            borderRadius: rounded ? height / 2 : 0,
          },
        ]}
      >
        {/* Progress Fill */}
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              backgroundColor: getProgressColor(),
              borderRadius: rounded ? height / 2 : 0,
            },
            getGlowStyle(),
          ]}
        >
          {/* Stripe Overlay */}
          {striped && clampedProgress > 0 && (
            <Animated.View
              style={[
                styles.stripeOverlay,
                {
                  borderRadius: rounded ? height / 2 : 0,
                  transform: getStripeTransform(),
                },
              ]}
            />
          )}

          {/* Shine Effect */}
          {clampedProgress > 0 && (
            <View
              style={[
                styles.shine,
                {
                  borderRadius: rounded ? height / 2 : 0,
                },
              ]}
            />
          )}
        </Animated.View>
      </View>

      {/* Percentage (if not shown with label) */}
      {showPercentage && !showLabel && (
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, percentageStyle]}>
            {Math.round(clampedProgress)}%
          </Text>
        </View>
      )}
    </View>
  );
};

// Preset Progress Bars
export const LifeScoreProgressBar: React.FC<{
  score: number; // 1-10
  style?: ViewStyle;
}> = ({ score, style }) => {
  const percentage = (score / 10) * 100;
  return (
    <ProgressBar
      progress={percentage}
      height={12}
      gradient
      glowing
      showPercentage={false}
      style={style}
    />
  );
};

export const OnboardingProgressBar: React.FC<{
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}> = ({ currentStep, totalSteps, style }) => {
  const percentage = (currentStep / totalSteps) * 100;
  return (
    <ProgressBar
      progress={percentage}
      height={6}
      color="#7c3aed"
      animated
      showPercentage={false}
      style={style}
    />
  );
};

export const DownloadProgressBar: React.FC<{
  progress: number;
  style?: ViewStyle;
}> = ({ progress, style }) => (
  <ProgressBar
    progress={progress}
    height={10}
    color="#3b82f6"
    striped
    showPercentage
    animated
    style={style}
  />
);

export const HealthMetricProgressBar: React.FC<{
  value: number; // 1-10
  label: string;
  style?: ViewStyle;
}> = ({ value, label, style }) => {
  const percentage = (value / 10) * 100;
  return (
    <ProgressBar
      progress={percentage}
      height={8}
      gradient
      showLabel
      label={label}
      showPercentage={false}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e5e7eb',
  },
  percentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  percentageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stripeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
});

// Additional Progress Variants
export const CircularProgress: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: ViewStyle;
}> = ({ 
  progress, 
  size = 60, 
  strokeWidth = 6, 
  color = '#7c3aed',
  style 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View 
      style={[
        {
          width: size,
          height: size,
          transform: [{ rotate: '-90deg' }],
        },
        style,
      ]}
    >
      {/* This would need react-native-svg for actual implementation */}
      <Text style={{ 
        fontSize: 12, 
        color: '#9ca3af',
        textAlign: 'center',
        transform: [{ rotate: '90deg' }],
        lineHeight: size,
      }}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
};

export const StepProgress: React.FC<{
  currentStep: number;
  totalSteps: number;
  style?: ViewStyle;
}> = ({ currentStep, totalSteps, style }) => (
  <View style={[styles.stepContainer, style]}>
    {Array.from({ length: totalSteps }, (_, index) => (
      <View
        key={index}
        style={[
          styles.step,
          {
            backgroundColor: index < currentStep ? '#7c3aed' : '#374151',
          },
        ]}
      />
    ))}
  </View>
);

const stepStyles = StyleSheet.create({
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  step: {
    flex: 1,
    height: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
});
