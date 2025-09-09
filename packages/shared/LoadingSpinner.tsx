// =====================================================
// LifeOS - Loading Spinner Component
// File: LoadingSpinner.tsx
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

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showMessage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#7c3aed',
  message = 'Caricamento...',
  style,
  textStyle,
  showMessage = true,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  // Get size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 20, height: 20, borderWidth: 2 };
      case 'large':
        return { width: 60, height: 60, borderWidth: 4 };
      default: // medium
        return { width: 40, height: 40, borderWidth: 3 };
    }
  };

  const dimensions = getSizeDimensions();

  // Spin animation
  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    spinAnimation.start();

    return () => spinAnimation.stop();
  }, [spinValue]);

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeValue]);

  // Pulse animation for message
  useEffect(() => {
    if (showMessage && message) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [pulseValue, showMessage, message]);

  // Spin interpolation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeValue,
        },
        style,
      ]}
    >
      {/* Main Spinner */}
      <Animated.View
        style={[
          styles.spinner,
          {
            width: dimensions.width,
            height: dimensions.height,
            borderWidth: dimensions.borderWidth,
            borderTopColor: color,
            borderRightColor: `${color}40`, // 25% opacity
            borderBottomColor: `${color}20`, // 12% opacity
            borderLeftColor: `${color}10`, // 6% opacity
            transform: [{ rotate: spin }],
          },
        ]}
      />

      {/* Outer Ring for Large Size */}
      {size === 'large' && (
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: dimensions.width + 20,
              height: dimensions.height + 20,
              borderWidth: 1,
              borderColor: `${color}20`,
              transform: [{ rotate: spin }],
            },
          ]}
        />
      )}

      {/* Loading Message */}
      {showMessage && message && (
        <Animated.View
          style={[
            styles.messageContainer,
            {
              opacity: pulseValue,
              marginTop: size === 'small' ? 8 : size === 'large' ? 20 : 12,
            },
          ]}
        >
          <Text
            style={[
              styles.message,
              {
                fontSize: size === 'small' ? 12 : size === 'large' ? 18 : 14,
                color: color,
              },
              textStyle,
            ]}
          >
            {message}
          </Text>
        </Animated.View>
      )}

      {/* Loading Dots Animation */}
      {showMessage && (
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <LoadingDot
              key={index}
              delay={index * 200}
              color={color}
              size={size === 'small' ? 3 : size === 'large' ? 6 : 4}
            />
          ))}
        </View>
      )}
    </Animated.View>
  );
};

// Individual Loading Dot Component
interface LoadingDotProps {
  delay: number;
  color: string;
  size: number;
}

const LoadingDot: React.FC<LoadingDotProps> = ({ delay, color, size }) => {
  const scaleValue = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const dotAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );

    dotAnimation.start();

    return () => dotAnimation.stop();
  }, [delay, scaleValue]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          backgroundColor: color,
          transform: [{ scale: scaleValue }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  spinner: {
    borderRadius: 100,
    borderStyle: 'solid',
  },
  outerRing: {
    position: 'absolute',
    borderRadius: 100,
    borderStyle: 'solid',
  },
  messageContainer: {
    alignItems: 'center',
  },
  message: {
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  dot: {
    borderRadius: 10,
  },
});

// Preset Configurations
export const LoadingSpinnerPresets = {
  // Dashboard loading
  dashboard: {
    size: 'large' as const,
    color: '#7c3aed',
    message: 'Caricamento dashboard...',
  },
  
  // Advice generation
  advice: {
    size: 'medium' as const,
    color: '#3b82f6',
    message: 'Generazione consiglio...',
  },
  
  // Settings save
  saving: {
    size: 'small' as const,
    color: '#10b981',
    message: 'Salvataggio...',
  },
  
  // Analytics loading
  analytics: {
    size: 'medium' as const,
    color: '#f59e0b',
    message: 'Elaborazione dati...',
  },
  
  // Onboarding
  setup: {
    size: 'large' as const,
    color: '#7c3aed',
    message: 'Configurazione profilo...',
  },
};

// Quick Access Components
export const DashboardLoader: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <LoadingSpinner {...LoadingSpinnerPresets.dashboard} style={style} />
);

export const AdviceLoader: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <LoadingSpinner {...LoadingSpinnerPresets.advice} style={style} />
);

export const SavingLoader: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <LoadingSpinner {...LoadingSpinnerPresets.saving} style={style} />
);

export const AnalyticsLoader: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <LoadingSpinner {...LoadingSpinnerPresets.analytics} style={style} />
);

export const SetupLoader: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <LoadingSpinner {...LoadingSpinnerPresets.setup} style={style} />
);
