// apps/web/lib/smart-notifications/scheduler.ts
import { CircadianAnalyzer, OptimalMomentPredictor, UserPattern, NotificationContext, TimingRecommendation } from './core';
import { EmpatheticMessaging, UserContext, GeneratedMessage } from './messaging';

export interface ScheduledNotification {
  id: string;
  user_id: string;
  category: string;
  urgency: string;
  scheduled_time: string;
  content: GeneratedMessage;
  delivery_status: 'pending' | 'delivered' | 'failed' | 'cancelled';
  created_at: string;
  attempts: number;
  context: NotificationContext;
}

export interface NotificationSettings {
  enabled: boolean;
  categories: {
    stress_relief: boolean;
    energy_boost: boolean;
    sleep_prep: boolean;
    celebration: boolean;
    reminder: boolean;
  };
  quiet_hours: {
    start: string;
    end: string;
    enabled: boolean;
  };
  frequency_limits: {
    max_daily: number;
    min_gap_minutes: number;
  };
  tone_preference: 'gentle' | 'encouraging' | 'casual' | 'formal';
  respect_dnd: boolean;
}

export class SmartNotificationScheduler {
  private static readonly DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    categories: {
      stress_relief: true,
      energy_boost: true,
      sleep_prep: true,
      celebration: true,
      reminder: true
    },
    quiet_hours: {
      start: '22:00',
      end: '07:00',
      enabled: true
    },
    frequency_limits: {
      max_daily: 5,
      min_gap_minutes: 90
    },
    tone_preference: 'encouraging',
    respect_dnd: true
  };

  static async scheduleSmartNotification(
    userId: string,
    category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'reminder',
    urgency: 'low' | 'medium' | 'high' | 'emergency',
    specificContent?: {
      suggestion?: string;
      context?: any;
    }
  ): Promise<ScheduledNotification | null> {
    try {
      // Load user settings and patterns
      const [userSettings, userPattern, userContext] = await Promise.all([
        this.getUserNotificationSettings(userId),
        this.getUserPattern(userId),
        this.buildUserContext(userId)
      ]);

      // Check if notifications are enabled for this category
      if (!userSettings.enabled || !userSettings.categories[category]) {
        console.log(`Notifications disabled for user ${userId}, category ${category}`);
        return null;
      }

      // Check daily limits
      const todayCount = await this.getTodayNotificationCount(userId);
      if (todayCount >= userSettings.frequency_limits.max_daily && urgency !== 'emergency') {
        console.log(`Daily limit reached for user ${userId}`);
        return null;
      }

      // Check minimum gap between notifications
      const lastNotification = await this.getLastNotificationTime(userId);
      if (lastNotification && urgency !== 'emergency') {
        const timeSince = Date.now() - new Date(lastNotification).getTime();
        const minGapMs = userSettings.frequency_limits.min_gap_minutes * 60 * 1000;
        
        if (timeSince < minGapMs) {
          console.log(`Minimum gap not met for user ${userId}`);
          return null;
        }
      }

      // Build notification context
      const notificationContext: NotificationContext = {
        user_id: userId,
        category,
        urgency,
        content: {
          title: '',
          body: '',
          action_text: 'Apri LifeOS',
          deep_link: `/suggestions?category=${category}`
        },
        scheduling: {
          min_gap_minutes: userSettings.frequency_limits.min_gap_minutes,
          respect_quiet_hours: userSettings.quiet_hours.enabled
        },
        personalization: {
          tone: userSettings.tone_preference,
          include_emoji: true,
          reference_progress: true
        }
      };

      // Predict optimal timing
      const timingRecommendation = OptimalMomentPredictor.predictOptimalTiming(
        notificationContext,
        userPattern
      );

      if (timingRecommendation.should_skip) {
        console.log(`Skipping notification for user ${userId}: ${timingRecommendation.skip_reason}`);
        return null;
      }

      // Generate personalized message
      const personalizedMessage = EmpatheticMessaging.generatePersonalizedMessage(
        category,
        userContext,
        specificContent?.suggestion
      );

      // Update notification context with generated content
      notificationContext.content = {
        title: personalizedMessage.title,
        body: personalizedMessage.body,
        action_text: personalizedMessage.action_text || 'Apri LifeOS',
        deep_link: `/suggestions?category=${category}`
      };

      // Create scheduled notification
      const scheduledNotification: ScheduledNotification = {
        id: this.generateNotificationId(),
        user_id: userId,
        category,
        urgency,
        scheduled_time: timingRecommendation.optimal_time,
        content: personalizedMessage,
        delivery_status: 'pending',
        created_at: new Date().toISOString(),
        attempts: 0,
        context: notificationContext
      };

      // Save to database and schedule delivery
      await this.saveScheduledNotification(scheduledNotification);
      await this.scheduleDelivery(scheduledNotification, timingRecommendation);

      return scheduledNotification;

    } catch (error) {
      console.error('Error scheduling smart notification:', error);
      return null;
    }
  }

  static async processScheduledNotifications(): Promise<void> {
    try {
      const pendingNotifications = await this.getPendingNotifications();
      
      for (const notification of pendingNotifications) {
        await this.processNotification(notification);
      }
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
    }
  }

  private static async processNotification(notification: ScheduledNotification): Promise<void> {
    const now = new Date();
    const scheduledTime = new Date(notification.scheduled_time);

    // Check if it's time to deliver
    if (now >= scheduledTime) {
      try {
        // Final context check before delivery
        const shouldDeliver = await this.finalDeliveryCheck(notification);
        
        if (shouldDeliver) {
          await this.deliverNotification(notification);
        } else {
          await this.rescheduleOrCancel(notification);
        }
      } catch (error) {
        console.error(`Error delivering notification ${notification.id}:`, error);
        await this.handleDeliveryFailure(notification);
      }
    }
  }

  private static async finalDeliveryCheck(notification: ScheduledNotification): Promise<boolean> {
    // Check device status (DND, battery, network)
    const deviceStatus = await this.getDeviceStatus(notification.user_id);
    
    if (deviceStatus.doNotDisturb && notification.context.scheduling.respect_quiet_hours) {
      return false;
    }

    if (deviceStatus.batteryLevel < 10 && notification.urgency !== 'emergency') {
      return false;
    }

    // Check app state
    const appState = await this.getAppState(notification.user_id);
    
    if (appState.isActive && notification.urgency === 'low') {
      // User is actively using the app, skip low-priority notifications
      return false;
    }

    return true;
  }

  private static async deliverNotification(notification: ScheduledNotification): Promise<void> {
    const payload = {
      title: notification.content.title,
      body: notification.content.body,
      data: {
        category: notification.category,
        urgency: notification.urgency,
        deep_link: notification.context.content.deep_link,
        notification_id: notification.id
      },
      badge: await this.getBadgeCount(notification.user_id),
      sound: this.getNotificationSound(notification.category, notification.urgency),
      priority: this.getNotificationPriority(notification.urgency),
      ttl: this.getTimeToLive(notification.urgency)
    };

    // Platform-specific delivery
    const userDevices = await this.getUserDevices(notification.user_id);
    
    for (const device of userDevices) {
      await this.sendToDevice(device, payload);
    }

    // Update delivery status
    await this.updateNotificationStatus(notification.id, 'delivered');

    // Track delivery for analytics
    await this.trackNotificationDelivery(notification);

    console.log(`Notification ${notification.id} delivered successfully`);
  }

  private static async rescheduleOrCancel(notification: ScheduledNotification): Promise<void> {
    notification.attempts++;

    if (notification.attempts >= 3) {
      await this.updateNotificationStatus(notification.id, 'cancelled');
      return;
    }

    // Reschedule for later
    const newTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes later
    notification.scheduled_time = newTime.toISOString();
    
    await this.updateScheduledNotification(notification);
  }

  private static async handleDeliveryFailure(notification: ScheduledNotification): Promise<void> {
    notification.attempts++;
    
    if (notification.attempts >= 3) {
      await this.updateNotificationStatus(notification.id, 'failed');
    } else {
      // Retry with exponential backoff
      const retryDelay = Math.pow(2, notification.attempts) * 5 * 60 * 1000; // 5, 10, 20 minutes
      const retryTime = new Date(Date.now() + retryDelay);
      
      notification.scheduled_time = retryTime.toISOString();
      await this.updateScheduledNotification(notification);
    }
  }

  private static getNotificationSound(category: string, urgency: string): string {
    if (urgency === 'emergency') return 'emergency.wav';
    
    const sounds = {
      stress_relief: 'gentle_chime.wav',
      energy_boost: 'energetic_ping.wav',
      sleep_prep: 'soft_bells.wav',
      celebration: 'celebration.wav',
      reminder: 'default.wav'
    };

    return sounds[category as keyof typeof sounds] || 'default.wav';
  }

  private static getNotificationPriority(urgency: string): 'low' | 'normal' | 'high' | 'max' {
    const priorities = {
      low: 'low' as const,
      medium: 'normal' as const,
      high: 'high' as const,
      emergency: 'max' as const
    };

    return priorities[urgency as keyof typeof priorities] || 'normal';
  }

  private static getTimeToLive(urgency: string): number {
    // Time in seconds
    const ttls = {
      low: 3600, // 1 hour
      medium: 7200, // 2 hours
      high: 86400, // 24 hours
      emergency: 172800 // 48 hours
    };

    return ttls[urgency as keyof typeof ttls] || 3600;
  }

  // Utility methods for database operations
  private static async getUserNotificationSettings(userId: string): Promise<NotificationSettings> {
    // Implementation would query the database
    // For now, return default settings
    return this.DEFAULT_SETTINGS;
  }

  private static async getUserPattern(userId: string): Promise<UserPattern> {
    // Implementation would query user activities and generate patterns
    // This would typically call CircadianAnalyzer.analyzeUserPatterns()
    return CircadianAnalyzer.analyzeUserPatterns([], []);
  }

  private static async buildUserContext(userId: string): Promise<UserContext> {
    // Implementation would build context from recent user data
    return {
      life_score: 75,
      time_of_day: this.getTimeOfDay(),
      day_of_week: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
      streak_count: 3,
      personal_goals: [],
      preferred_tone: 'encouraging',
      recent_activities: []
    };
  }

  private static getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private static generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder methods for database operations
  private static async getTodayNotificationCount(userId: string): Promise<number> { return 0; }
  private static async getLastNotificationTime(userId: string): Promise<string | null> { return null; }
  private static async saveScheduledNotification(notification: ScheduledNotification): Promise<void> {}
  private static async scheduleDelivery(notification: ScheduledNotification, timing: TimingRecommendation): Promise<void> {}
  private static async getPendingNotifications(): Promise<ScheduledNotification[]> { return []; }
  private static async updateNotificationStatus(id: string, status: string): Promise<void> {}
  private static async updateScheduledNotification(notification: ScheduledNotification): Promise<void> {}
  private static async getDeviceStatus(userId: string): Promise<any> { return { doNotDisturb: false, batteryLevel: 100 }; }
  private static async getAppState(userId: string): Promise<any> { return { isActive: false }; }
  private static async getBadgeCount(userId: string): Promise<number> { return 0; }
  private static async getUserDevices(userId: string): Promise<any[]> { return []; }
  private static async sendToDevice(device: any, payload: any): Promise<void> {}
  private static async trackNotificationDelivery(notification: ScheduledNotification): Promise<void> {}
}

// React hook for notifications in components
export function useSmartNotifications(userId: string) {
  const scheduleNotification = async (
    category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'reminder',
    urgency: 'low' | 'medium' | 'high' = 'medium',
    content?: { suggestion?: string; context?: any }
  ) => {
    return await SmartNotificationScheduler.scheduleSmartNotification(
      userId,
      category,
      urgency,
      content
    );
  };

  const scheduleStressRelief = (urgency: 'low' | 'medium' | 'high' = 'medium') => 
    scheduleNotification('stress_relief', urgency);

  const scheduleEnergyBoost = (urgency: 'low' | 'medium' | 'high' = 'medium') => 
    scheduleNotification('energy_boost', urgency);

  const scheduleSleepPrep = () => 
    scheduleNotification('sleep_prep', 'low');

  const scheduleCelebration = (achievement: string) => 
    scheduleNotification('celebration', 'low', { suggestion: achievement });

  const scheduleReminder = (reminder: string) => 
    scheduleNotification('reminder', 'low', { suggestion: reminder });

  return {
    scheduleNotification,
    scheduleStressRelief,
    scheduleEnergyBoost,
    scheduleSleepPrep,
    scheduleCelebration,
    scheduleReminder
  };
}