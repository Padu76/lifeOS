// =====================================================
// LifeOS - Achievements Banner Component
// File: AchievementsBanner.tsx
// =====================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ViewStyle,
  Modal,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  category: 'streak' | 'completion' | 'improvement' | 'consistency';
}

interface AchievementsBannerProps {
  achievements: Achievement[];
  onAchievementPress?: (achievement: Achievement) => void;
  onDismiss?: () => void;
  style?: ViewStyle;
  showAnimation?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  maxVisible?: number;
}

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
  delay?: number;
  index?: number;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
  delay = 0,
  index = 0,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  // Get category styling
  const getCategoryStyle = () => {
    switch (achievement.category) {
      case 'streak':
        return {
          backgroundColor: '#065f46',
          borderColor: '#10b981',
          glowColor: '#10b981',
          textColor: '#ffffff',
        };
      case 'completion':
        return {
          backgroundColor: '#1e3a8a',
          borderColor: '#3b82f6',
          glowColor: '#3b82f6',
          textColor: '#ffffff',
        };
      case 'improvement':
        return {
          backgroundColor: '#92400e',
          borderColor: '#f59e0b',
          glowColor: '#f59e0b',
          textColor: '#ffffff',
        };
      case 'consistency':
        return {
          backgroundColor: '#581c87',
          borderColor: '#7c3aed',
          glowColor: '#7c3aed',
          textColor: '#ffffff',
        };
      default:
        return {
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          glowColor: '#6b7280',
          textColor: '#ffffff',
        };
    }
  };

  const categoryStyle = getCategoryStyle();

  // Entry animations
  useEffect(() => {
    const entryAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delay + 200,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]);

    entryAnimation.start(() => {
      // Celebration bounce
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 100,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [delay, fadeAnim, scaleAnim, bounceAnim]);

  // Shine animation
  useEffect(() => {
    const shine = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    const timer = setTimeout(() => {
      shine.start();
    }, delay + 1000);

    return () => {
      clearTimeout(timer);
      shine.stop();
    };
  }, [delay, shineAnim]);

  // Format unlock time
  const formatUnlockTime = (timestamp: string): string => {
    const now = new Date();
    const unlockTime = new Date(timestamp);
    const diffMs = now.getTime() - unlockTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return 'Ora';
    if (diffMinutes < 60) return `${diffMinutes} min fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    
    return unlockTime.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
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
                outputRange: [0, -8],
              })
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.achievementCard,
          {
            backgroundColor: categoryStyle.backgroundColor,
            borderColor: categoryStyle.borderColor,
            shadowColor: categoryStyle.glowColor,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Shine overlay */}
        <Animated.View
          style={[
            styles.shineOverlay,
            {
              opacity: shineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
              transform: [
                {
                  translateX: shineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 100],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Content */}
        <View style={styles.achievementContent}>
          {/* Icon */}
          <View style={styles.achievementIconContainer}>
            <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryStyle.borderColor },
              ]}
            >
              <Text style={styles.categoryText}>
                {achievement.category.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Text */}
          <View style={styles.achievementText}>
            <Text
              style={[
                styles.achievementTitle,
                { color: categoryStyle.textColor },
              ]}
              numberOfLines={1}
            >
              {achievement.title}
            </Text>
            <Text
              style={[
                styles.achievementDescription,
                { color: categoryStyle.textColor },
              ]}
              numberOfLines={2}
            >
              {achievement.description}
            </Text>
            <Text
              style={[
                styles.achievementTime,
                { color: categoryStyle.borderColor },
              ]}
            >
              {formatUnlockTime(achievement.unlocked_at)}
            </Text>
          </View>
        </View>

        {/* Celebration particles */}
        <View style={styles.particlesContainer}>
          {[...Array(3)].map((_, i) => (
            <CelebrationParticle
              key={i}
              delay={delay + 500 + i * 200}
              color={categoryStyle.borderColor}
            />
          ))}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Celebration particle component
interface CelebrationParticleProps {
  delay: number;
  color: string;
}

const CelebrationParticle: React.FC<CelebrationParticleProps> = ({ delay, color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -50,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
  }, [delay, translateY, opacity, scale]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    />
  );
};

export const AchievementsBanner: React.FC<AchievementsBannerProps> = ({
  achievements,
  onAchievementPress,
  onDismiss,
  style,
  showAnimation = true,
  autoHide = false,
  autoHideDelay = 8000,
  maxVisible = 3,
}) => {
  const [visible, setVisible] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const containerAnim = useRef(new Animated.Value(0)).current;

  // Container animation
  useEffect(() => {
    if (showAnimation && visible) {
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } else {
      containerAnim.setValue(visible ? 1 : 0);
    }
  }, [visible, showAnimation, containerAnim]);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, visible]);

  // Handle dismiss
  const handleDismiss = () => {
    Animated.timing(containerAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      onDismiss?.();
    });
  };

  // Handle achievement press
  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    onAchievementPress?.(achievement);
  };

  // Get visible achievements
  const visibleAchievements = achievements.slice(0, maxVisible);
  const hasMore = achievements.length > maxVisible;

  if (!visible || achievements.length === 0) {
    return null;
  }

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: containerAnim,
            transform: [
              {
                translateY: containerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
              {
                scale: containerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
          },
          style,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🎉</Text>
            <View>
              <Text style={styles.headerTitle}>Nuovo Achievement!</Text>
              <Text style={styles.headerSubtitle}>
                {achievements.length === 1 
                  ? 'Hai sbloccato un nuovo traguardo'
                  : `Hai sbloccato ${achievements.length} traguardi`
                }
              </Text>
            </View>
          </View>
          
          {onDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Achievements List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.achievementsList}
          contentContainerStyle={styles.achievementsContent}
        >
          {visibleAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onPress={() => handleAchievementPress(achievement)}
              delay={showAnimation ? index * 300 : 0}
              index={index}
            />
          ))}
        </ScrollView>

        {/* See More Indicator */}
        {hasMore && (
          <View style={styles.seeMoreContainer}>
            <Text style={styles.seeMoreText}>
              +{achievements.length - maxVisible} altri
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Achievement Detail Modal */}
      <Modal
        visible={selectedAchievement !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAchievement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAchievement && (
              <>
                <Text style={styles.modalIcon}>
                  {selectedAchievement.icon}
                </Text>
                <Text style={styles.modalTitle}>
                  {selectedAchievement.title}
                </Text>
                <Text style={styles.modalDescription}>
                  {selectedAchievement.description}
                </Text>
                <View style={styles.modalBadge}>
                  <Text style={styles.modalBadgeText}>
                    {selectedAchievement.category.toUpperCase()}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setSelectedAchievement(null)}
                >
                  <Text style={styles.modalCloseText}>Fantastico!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  dismissButton: {
    padding: 8,
  },
  dismissText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  achievementsList: {
    marginHorizontal: -4,
  },
  achievementsContent: {
    paddingHorizontal: 4,
  },
  achievementCard: {
    width: width * 0.7,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
  achievementContent: {
    position: 'relative',
    zIndex: 1,
  },
  achievementIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  achievementText: {
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 8,
    lineHeight: 16,
  },
  achievementTime: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: '50%',
    left: '50%',
  },
  seeMoreContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  seeMoreText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 300,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalCloseButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
