// =====================================================
// LifeOS - Recent Activities Component
// File: RecentActivities.tsx
// =====================================================

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';

interface RecentActivity {
  id: string;
  type: 'advice_completed' | 'advice_dismissed' | 'metrics_logged' | 'achievement_unlocked';
  description: string;
  timestamp: string;
  impact_score?: number;
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
  onActivityPress?: (activity: RecentActivity) => void;
  onSeeAllPress?: () => void;
  style?: ViewStyle;
  showAnimation?: boolean;
  maxVisible?: number;
  compact?: boolean;
}

interface ActivityItemProps {
  activity: RecentActivity;
  onPress?: () => void;
  delay?: number;
  isLast?: boolean;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  activity,
  onPress,
  delay = 0,
  isLast = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get activity styling
  const getActivityStyle = () => {
    switch (activity.type) {
      case 'advice_completed':
        return {
          icon: '✅',
          iconColor: '#10b981',
          backgroundColor: '#065f46',
          borderColor: '#10b981',
          timeColor: '#6ee7b7',
        };
      case 'advice_dismissed':
        return {
          icon: '⏭️',
          iconColor: '#6b7280',
          backgroundColor: '#374151',
          borderColor: '#6b7280',
          timeColor: '#9ca3af',
        };
      case 'metrics_logged':
        return {
          icon: '📊',
          iconColor: '#3b82f6',
          backgroundColor: '#1e3a8a',
          borderColor: '#3b82f6',
          timeColor: '#93c5fd',
        };
      case 'achievement_unlocked':
        return {
          icon: '🏆',
          iconColor: '#f59e0b',
          backgroundColor: '#92400e',
          borderColor: '#f59e0b',
          timeColor: '#fbbf24',
        };
      default:
        return {
          icon: '📝',
          iconColor: '#7c3aed',
          backgroundColor: '#581c87',
          borderColor: '#7c3aed',
          timeColor: '#c4b5fd',
        };
    }
  };

  const activityStyle = getActivityStyle();

  // Entry animation
  useEffect(() => {
    const animation = Animated.parallel([
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: delay + 200,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, [delay, fadeAnim, slideAnim, scaleAnim]);

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Ora';
    if (diffMinutes < 60) return `${diffMinutes}min fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffDays < 7) return `${diffDays}g fa`;
    
    return activityTime.toLocaleDateString('it-IT', {
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
            { translateX: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.activityItem,
          {
            backgroundColor: activityStyle.backgroundColor,
            borderLeftColor: activityStyle.borderColor,
          },
          !isLast && styles.activityItemBorder,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* Timeline dot */}
        <View style={styles.timelineContainer}>
          <View
            style={[
              styles.timelineDot,
              { backgroundColor: activityStyle.iconColor },
            ]}
          >
            <Text style={styles.timelineIcon}>{activityStyle.icon}</Text>
          </View>
          {!isLast && (
            <View
              style={[
                styles.timelineLine,
                { backgroundColor: activityStyle.borderColor },
              ]}
            />
          )}
        </View>

        {/* Content */}
        <View style={styles.activityContent}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityDescription} numberOfLines={2}>
              {activity.description}
            </Text>
            {activity.impact_score && (
              <View style={styles.impactBadge}>
                <Text style={styles.impactScore}>
                  +{activity.impact_score}
                </Text>
              </View>
            )}
          </View>
          
          <Text
            style={[
              styles.activityTime,
              { color: activityStyle.timeColor },
            ]}
          >
            {formatTimestamp(activity.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities,
  onActivityPress,
  onSeeAllPress,
  style,
  showAnimation = true,
  maxVisible = 5,
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

  // Get visible activities
  const visibleActivities = activities.slice(0, maxVisible);
  const hasMore = activities.length > maxVisible;

  // Get activity summary
  const getActivitySummary = () => {
    const completed = activities.filter(a => a.type === 'advice_completed').length;
    const achievements = activities.filter(a => a.type === 'achievement_unlocked').length;
    
    if (achievements > 0 && completed > 0) {
      return {
        text: `${completed} completati, ${achievements} achievement`,
        icon: '🎉',
        color: '#10b981',
      };
    } else if (completed > 0) {
      return {
        text: `${completed} consigli completati`,
        icon: '✅',
        color: '#10b981',
      };
    } else if (activities.length > 0) {
      return {
        text: `${activities.length} attività recenti`,
        icon: '📊',
        color: '#6b7280',
      };
    } else {
      return {
        text: 'Nessuna attività',
        icon: '💤',
        color: '#6b7280',
      };
    }
  };

  const summary = getActivitySummary();

  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactTitle}>Attività</Text>
          <View style={styles.compactSummary}>
            <Text style={styles.compactSummaryIcon}>{summary.icon}</Text>
            <Text style={[styles.compactSummaryText, { color: summary.color }]}>
              {summary.text}
            </Text>
          </View>
        </View>
        
        {visibleActivities.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.compactActivities}
          >
            {visibleActivities.map((activity) => {
              const activityStyle = getActivityStyle(activity.type);
              return (
                <View key={activity.id} style={styles.compactActivity}>
                  <Text style={styles.compactActivityIcon}>
                    {activityStyle.icon}
                  </Text>
                  <Text style={styles.compactActivityTime}>
                    {formatTimestamp(activity.timestamp)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <Animated.View
        style={[
          styles.container,
          { opacity: containerAnim },
          style,
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Attività Recenti</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💤</Text>
          <Text style={styles.emptyTitle}>Nessuna attività</Text>
          <Text style={styles.emptyDescription}>
            Le tue attività recenti appariranno qui
          </Text>
        </View>
      </Animated.View>
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
        <Text style={styles.title}>Attività Recenti</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryIcon}>{summary.icon}</Text>
          <Text style={[styles.summaryText, { color: summary.color }]}>
            {summary.text}
          </Text>
        </View>
      </View>

      {/* Activities List */}
      <ScrollView
        style={styles.activitiesList}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {visibleActivities.map((activity, index) => (
          <ActivityItem
            key={activity.id}
            activity={activity}
            onPress={() => onActivityPress?.(activity)}
            delay={showAnimation ? index * 100 : 0}
            isLast={index === visibleActivities.length - 1}
          />
        ))}
      </ScrollView>

      {/* See All Button */}
      {hasMore && onSeeAllPress && (
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={onSeeAllPress}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>
            Vedi tutte ({activities.length})
          </Text>
          <Text style={styles.seeAllArrow}>→</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// Helper function to get activity style (used in compact mode)
const getActivityStyle = (type: RecentActivity['type']) => {
  switch (type) {
    case 'advice_completed':
      return { icon: '✅', color: '#10b981' };
    case 'advice_dismissed':
      return { icon: '⏭️', color: '#6b7280' };
    case 'metrics_logged':
      return { icon: '📊', color: '#3b82f6' };
    case 'achievement_unlocked':
      return { icon: '🏆', color: '#f59e0b' };
    default:
      return { icon: '📝', color: '#7c3aed' };
  }
};

// Helper function to format timestamp (used in compact mode)
const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes < 1) return 'ora';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  
  return activityTime.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
  });
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
  activitiesList: {
    maxHeight: 300,
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    borderLeftWidth: 4,
    borderRadius: 12,
    marginBottom: 2,
    position: 'relative',
  },
  activityItemBorder: {
    marginBottom: 8,
  },
  timelineContainer: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineIcon: {
    fontSize: 14,
  },
  timelineLine: {
    position: 'absolute',
    top: 32,
    width: 2,
    height: 40,
    opacity: 0.3,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  impactBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  impactScore: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  seeAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '600',
    marginRight: 8,
  },
  seeAllArrow: {
    fontSize: 14,
    color: '#7c3aed',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
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
  compactActivities: {
    flexDirection: 'row',
  },
  compactActivity: {
    alignItems: 'center',
    marginRight: 16,
  },
  compactActivityIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  compactActivityTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
});
