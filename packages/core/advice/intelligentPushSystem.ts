import { EmpatheticLanguageEngine, GeneratedMessage } from './empatheticLanguageEngine';
import { IntelligentTimingSystem, OptimalMoment, CircadianProfile } from './intelligentTimingSystem';
import { HealthMetrics, LifeScoreV2, UserProfile } from '../../types';

// Types for intelligent push notification system
interface NotificationPreferences {
  enabled: boolean;
  categories: {
    stress_relief: boolean;
    energy_boost: boolean;
    sleep_prep: boolean;
    celebration: boolean;
    emergency: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string; // HH:MM
    end_time: string; // HH:MM
  };
  frequency_limits: {
    max_daily: number;
    min_gap_minutes: number;
    respect_dnd: boolean;
  };
  delivery_channels: {
    push_notifications: boolean;
    in_app_only: boolean;
    email_backup: boolean;
  };
  tone_preference: 'gentle' | 'encouraging' | 'casual' | 'formal' | 'adaptive';
}

interface PushNotificationPayload {
  title: string;
  body: string;
  data: {
    type: 'micro_advice';
    advice_id: string;
    category: string;
    action_required: boolean;
    deep_link: string;
    priority: 'low' | 'normal' | 'high' | 'emergency';
  };
  actions?: NotificationAction[];
  badge?: number;
  sound?: string;
  image?: string;
}

interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  type: 'complete' | 'snooze' | 'dismiss' | 'view';
}

interface DeliveryContext {
  device_type: 'ios' | 'android' | 'web';
  app_state: 'foreground' | 'background' | 'inactive';
  device_settings: {
    notifications_enabled: boolean;
    dnd_active: boolean;
    battery_level?: number;
  };
  network_status: 'online' | 'offline' | 'poor';
  user_activity: 'active' | 'idle' | 'driving' | 'meeting';
}

interface NotificationResult {
  id: string;
  scheduled_time: Date;
  delivered_time?: Date;
  status: 'scheduled' | 'delivered' | 'failed' | 'cancelled';
  user_action?: 'opened' | 'dismissed' | 'completed' | 'snoozed';
  engagement_score: number;
  delivery_context: DeliveryContext;
}

interface NotificationAnalytics {
  delivery_rate: number;
  open_rate: number;
  completion_rate: number;
  optimal_timing_accuracy: number;
  user_satisfaction_score: number;
  burnout_risk_score: number;
}

export class IntelligentPushSystem {
  private languageEngine: EmpatheticLanguageEngine;
  private timingSystem: IntelligentTimingSystem;
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    this.languageEngine = new EmpatheticLanguageEngine();
    this.timingSystem = new IntelligentTimingSystem();
  }

  // Schedule intelligent micro-advice notification
  async scheduleAdviceNotification(
    userId: string,
    lifeScore: LifeScoreV2,
    metrics: HealthMetrics,
    userProfile: UserProfile,
    preferences: NotificationPreferences,
    circadianProfile: CircadianProfile
  ): Promise<{ notificationId: string; scheduledTime: Date; confidence: number }> {
    
    // Check if notifications are enabled and not in burnout state
    if (!preferences.enabled || !this.canSendNotification(userId, preferences)) {
      throw new Error('Notifications disabled or user in cooldown period');
    }

    // Determine intervention type based on current state
    const interventionType = this.determineInterventionType(lifeScore, metrics);
    
    // Check category preferences
    if (!preferences.categories[interventionType as keyof typeof preferences.categories]) {
      throw new Error(`Category ${interventionType} disabled in user preferences`);
    }

    // Find optimal timing
    const context = await this.buildTimingContext(userId);
    const patternLearning = await this.getUserPatternLearning(userId);
    
    const optimalMoment = this.timingSystem.predictOptimalMoment(
      context,
      circadianProfile,
      lifeScore,
      interventionType,
      patternLearning
    );

    // Check if timing respects quiet hours
    if (!this.respectsQuietHours(optimalMoment.suggested_time, preferences.quiet_hours)) {
      // Find next available time outside quiet hours
      optimalMoment.suggested_time = this.findNextAvailableTime(
        optimalMoment.suggested_time,
        preferences.quiet_hours
      );
    }

    // Generate empathetic message
    const message = this.languageEngine.generateMessage(
      this.buildEmpatheticContext(lifeScore, metrics, userProfile, preferences),
      interventionType as any,
      userProfile
    );

    // Create push notification payload
    const payload = this.createNotificationPayload(
      message,
      interventionType,
      optimalMoment.urgency_level
    );

    // Schedule the notification
    const notificationId = await this.scheduleNotification(
      userId,
      payload,
      optimalMoment.suggested_time,
      preferences
    );

    return {
      notificationId,
      scheduledTime: optimalMoment.suggested_time,
      confidence: optimalMoment.confidence_score
    };
  }

  // Send immediate notification (for emergency situations)
  async sendImmediateNotification(
    userId: string,
    message: GeneratedMessage,
    urgencyLevel: 'high' | 'emergency',
    preferences: NotificationPreferences
  ): Promise<string> {
    
    const payload = this.createNotificationPayload(
      message,
      'stress_relief', // Emergency interventions are typically stress relief
      urgencyLevel
    );

    // Override quiet hours for emergency
    const effectivePreferences = urgencyLevel === 'emergency' ? 
      { ...preferences, quiet_hours: { ...preferences.quiet_hours, enabled: false } } :
      preferences;

    return await this.sendNotification(userId, payload, effectivePreferences);
  }

  // Handle user interaction with notification
  async handleNotificationAction(
    notificationId: string,
    userId: string,
    action: 'opened' | 'completed' | 'snoozed' | 'dismissed',
    snoozeMinutes?: number
  ): Promise<void> {
    
    // Record user response for learning
    await this.recordUserResponse(notificationId, userId, action);

    switch (action) {
      case 'snoozed':
        if (snoozeMinutes) {
          await this.snoozeNotification(notificationId, userId, snoozeMinutes);
        }
        break;
      
      case 'completed':
        await this.markAdviceCompleted(notificationId, userId);
        await this.triggerPositiveReinforcement(userId);
        break;
      
      case 'dismissed':
        await this.handleDismissal(notificationId, userId);
        break;
      
      case 'opened':
        await this.trackEngagement(notificationId, userId);
        break;
    }
  }

  // Snooze notification for specified time
  private async snoozeNotification(
    notificationId: string,
    userId: string,
    snoozeMinutes: number
  ): Promise<void> {
    
    // Cancel current notification if still scheduled
    this.cancelScheduledNotification(notificationId);

    // Get original notification data
    const originalNotification = await this.getNotificationData(notificationId);
    
    if (originalNotification) {
      // Reschedule for snooze time
      const newTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);
      
      await this.scheduleNotification(
        userId,
        originalNotification.payload,
        newTime,
        await this.getUserPreferences(userId),
        `${notificationId}_snoozed`
      );
    }
  }

  // Create notification payload with appropriate formatting
  private createNotificationPayload(
    message: GeneratedMessage,
    interventionType: string,
    urgencyLevel: string
  ): PushNotificationPayload {
    
    const title = this.generateNotificationTitle(interventionType, urgencyLevel);
    const actions = this.createNotificationActions(interventionType);
    
    return {
      title,
      body: message.content,
      data: {
        type: 'micro_advice',
        advice_id: crypto.randomUUID(),
        category: interventionType,
        action_required: true,
        deep_link: `lifeos://advice/${interventionType}`,
        priority: urgencyLevel as any
      },
      actions,
      badge: 1,
      sound: urgencyLevel === 'emergency' ? 'emergency.wav' : 'gentle.wav'
    };
  }

  // Generate appropriate notification title based on context
  private generateNotificationTitle(interventionType: string, urgencyLevel: string): string {
    if (urgencyLevel === 'emergency') {
      return '🆘 Momento di supporto';
    }

    const titles = {
      stress_relief: ['💙 Respira con me', '🌸 Un momento per te', '☁️ Pausa rilassante'],
      energy_boost: ['⚡ Ricarica energia', '🔋 Attiva il corpo', '🚀 Boost moment'],
      sleep_prep: ['🌙 Prepara il sonno', '😴 Wind down time', '🛏️ Verso il riposo'],
      celebration: ['🎉 Ottimo lavoro!', '⭐ Sei fantastico', '👏 Grande progresso'],
      mindfulness: ['🧘 Momento mindful', '🌅 Presenza', '✨ Centro te stesso']
    };

    const categoryTitles = titles[interventionType as keyof typeof titles] || ['💡 Micro consiglio'];
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  // Create quick actions for notification
  private createNotificationActions(interventionType: string): NotificationAction[] {
    const baseActions: NotificationAction[] = [
      {
        id: 'complete',
        title: '✅ Fatto',
        type: 'complete'
      },
      {
        id: 'snooze',
        title: '⏰ 10 min',
        type: 'snooze'
      }
    ];

    // Add category-specific actions
    if (interventionType === 'stress_relief') {
      baseActions.unshift({
        id: 'view_breathing',
        title: '🫁 Respira ora',
        type: 'view'
      });
    } else if (interventionType === 'energy_boost') {
      baseActions.unshift({
        id: 'view_movement',
        title: '🏃 Muovi corpo',
        type: 'view'
      });
    }

    return baseActions;
  }

  // Check if notification can be sent (rate limiting, burnout prevention)
  private canSendNotification(userId: string, preferences: NotificationPreferences): boolean {
    // Check daily limit
    const todayCount = this.getTodayNotificationCount(userId);
    if (todayCount >= preferences.frequency_limits.max_daily) {
      return false;
    }

    // Check minimum gap
    const lastNotificationTime = this.getLastNotificationTime(userId);
    if (lastNotificationTime) {
      const timeSinceLastMin = (Date.now() - lastNotificationTime.getTime()) / (1000 * 60);
      if (timeSinceLastMin < preferences.frequency_limits.min_gap_minutes) {
        return false;
      }
    }

    // Check burnout status
    if (this.isUserInBurnoutCooldown(userId)) {
      return false;
    }

    return true;
  }

  // Check if time respects user's quiet hours
  private respectsQuietHours(
    scheduledTime: Date,
    quietHours: NotificationPreferences['quiet_hours']
  ): boolean {
    if (!quietHours.enabled) return true;

    const hour = scheduledTime.getHours();
    const minute = scheduledTime.getMinutes();
    const timeValue = hour * 60 + minute;

    const [startHour, startMin] = quietHours.start_time.split(':').map(Number);
    const [endHour, endMin] = quietHours.end_time.split(':').map(Number);
    
    const startValue = startHour * 60 + startMin;
    const endValue = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (startValue > endValue) {
      return !(timeValue >= startValue || timeValue <= endValue);
    } else {
      return !(timeValue >= startValue && timeValue <= endValue);
    }
  }

  // Find next available time outside quiet hours
  private findNextAvailableTime(
    originalTime: Date,
    quietHours: NotificationPreferences['quiet_hours']
  ): Date {
    if (!quietHours.enabled) return originalTime;

    const [endHour, endMin] = quietHours.end_time.split(':').map(Number);
    const nextAvailable = new Date(originalTime);
    
    nextAvailable.setHours(endHour, endMin, 0, 0);
    
    // If end time is next day, adjust accordingly
    if (nextAvailable <= originalTime) {
      nextAvailable.setDate(nextAvailable.getDate() + 1);
    }

    return nextAvailable;
  }

  // Build timing context for intelligent scheduling
  private async buildTimingContext(userId: string): Promise<any> {
    return {
      current_time: new Date(),
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      day_of_week: new Date().getDay(),
      is_working_day: this.isWorkingDay(new Date()),
      predicted_availability: await this.predictUserAvailability(userId),
      recent_activity_level: await this.getRecentActivityLevel(userId),
      time_since_last_intervention: await this.getTimeSinceLastIntervention(userId),
      current_stress_trend: await this.getCurrentStressTrend(userId)
    };
  }

  // Build empathetic context for message generation
  private buildEmpatheticContext(
    lifeScore: LifeScoreV2,
    metrics: HealthMetrics,
    userProfile: UserProfile,
    preferences: NotificationPreferences
  ): any {
    return {
      emotional_state: this.languageEngine.analyzeEmotionalState(lifeScore, metrics),
      time_of_day: this.determineTimeOfDay(),
      current_streak: 0, // Would be loaded from database
      recent_completion_rate: 0.7, // Would be calculated from history
      preferred_tone: preferences.tone_preference === 'adaptive' ? 
        this.languageEngine.determineOptimalTone(userProfile, 'balanced', 'morning') :
        preferences.tone_preference,
      personality_traits: [],
      historical_effectiveness: {}
    };
  }

  // Determine intervention type based on current state
  private determineInterventionType(lifeScore: LifeScoreV2, metrics: HealthMetrics): string {
    const { stress, energy, sleep, overall } = lifeScore;

    if (stress >= 8 || overall <= 3) return 'stress_relief';
    if (energy <= 3 && stress < 6) return 'energy_boost';
    if (sleep <= 4 && this.isEveningTime()) return 'sleep_prep';
    if (overall >= 7 && energy >= 7) return 'celebration';
    
    return 'mindfulness'; // Default
  }

  // Platform-specific notification scheduling
  private async scheduleNotification(
    userId: string,
    payload: PushNotificationPayload,
    scheduledTime: Date,
    preferences: NotificationPreferences,
    customId?: string
  ): Promise<string> {
    const notificationId = customId || crypto.randomUUID();
    const delay = scheduledTime.getTime() - Date.now();

    if (delay <= 0) {
      // Send immediately
      await this.sendNotification(userId, payload, preferences);
      return notificationId;
    }

    // Schedule for later
    const timeout = setTimeout(async () => {
      await this.sendNotification(userId, payload, preferences);
      this.scheduledNotifications.delete(notificationId);
    }, delay);

    this.scheduledNotifications.set(notificationId, timeout);
    
    // Store in database for persistence
    await this.saveScheduledNotification(notificationId, userId, payload, scheduledTime);

    return notificationId;
  }

  // Send notification via appropriate channel
  private async sendNotification(
    userId: string,
    payload: PushNotificationPayload,
    preferences: NotificationPreferences
  ): Promise<string> {
    const deliveryContext = await this.getDeliveryContext(userId);
    
    // Check final delivery conditions
    if (preferences.frequency_limits.respect_dnd && deliveryContext.device_settings.dnd_active) {
      throw new Error('Respecting Do Not Disturb mode');
    }

    // Choose delivery method based on preferences and context
    if (preferences.delivery_channels.push_notifications && 
        deliveryContext.device_settings.notifications_enabled) {
      
      return await this.sendPushNotification(userId, payload, deliveryContext);
    } else if (preferences.delivery_channels.in_app_only) {
      return await this.sendInAppNotification(userId, payload);
    } else if (preferences.delivery_channels.email_backup) {
      return await this.sendEmailNotification(userId, payload);
    }

    throw new Error('No available delivery channel');
  }

  // Send actual push notification (platform specific)
  private async sendPushNotification(
    userId: string,
    payload: PushNotificationPayload,
    context: DeliveryContext
  ): Promise<string> {
    // This would integrate with expo-notifications or platform-specific APIs
    console.log('Sending push notification:', {
      userId,
      title: payload.title,
      body: payload.body,
      context
    });

    // Mock implementation - in real app would use:
    // - Expo.Notifications.scheduleNotificationAsync() for Expo
    // - Firebase Cloud Messaging for native
    // - Web Push API for web notifications

    return crypto.randomUUID();
  }

  // Utility methods (would be implemented with actual data sources)
  private determineTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private isEveningTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 18 && hour <= 23;
  }

  private isWorkingDay(date: Date): boolean {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  }

  // These methods would connect to actual databases and services
  private async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // Load from database
    return {
      enabled: true,
      categories: {
        stress_relief: true,
        energy_boost: true,
        sleep_prep: true,
        celebration: true,
        emergency: true
      },
      quiet_hours: {
        enabled: true,
        start_time: '22:00',
        end_time: '07:00'
      },
      frequency_limits: {
        max_daily: 5,
        min_gap_minutes: 90,
        respect_dnd: true
      },
      delivery_channels: {
        push_notifications: true,
        in_app_only: false,
        email_backup: false
      },
      tone_preference: 'adaptive'
    };
  }

  private async getUserPatternLearning(userId: string): Promise<any> {
    // Load from database
    return {
      response_rates_by_hour: {},
      completion_rates_by_day: {},
      effectiveness_by_context: {},
      burnout_indicators: {
        consecutive_dismissals: 0,
        declining_engagement: false,
        fatigue_score: 0
      }
    };
  }

  private getTodayNotificationCount(userId: string): number {
    // Query database for today's notifications
    return 0;
  }

  private getLastNotificationTime(userId: string): Date | null {
    // Query database for last notification time
    return null;
  }

  private isUserInBurnoutCooldown(userId: string): boolean {
    // Check if user is in cooldown period due to burnout
    return false;
  }

  private async predictUserAvailability(userId: string): Promise<number> {
    // ML model to predict availability (0-1)
    return 0.8;
  }

  private async getRecentActivityLevel(userId: string): Promise<'low' | 'medium' | 'high'> {
    // Analyze recent app usage
    return 'medium';
  }

  private async getTimeSinceLastIntervention(userId: string): Promise<number> {
    // Minutes since last intervention
    return 120;
  }

  private async getCurrentStressTrend(userId: string): Promise<'rising' | 'stable' | 'declining'> {
    // Analyze stress trend from recent data
    return 'stable';
  }

  private async getDeliveryContext(userId: string): Promise<DeliveryContext> {
    return {
      device_type: 'ios',
      app_state: 'background',
      device_settings: {
        notifications_enabled: true,
        dnd_active: false,
        battery_level: 75
      },
      network_status: 'online',
      user_activity: 'idle'
    };
  }

  private cancelScheduledNotification(notificationId: string): void {
    const timeout = this.scheduledNotifications.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(notificationId);
    }
  }

  // Placeholder methods for database operations
  private async saveScheduledNotification(id: string, userId: string, payload: any, time: Date): Promise<void> {}
  private async getNotificationData(id: string): Promise<any> { return null; }
  private async recordUserResponse(id: string, userId: string, action: string): Promise<void> {}
  private async markAdviceCompleted(id: string, userId: string): Promise<void> {}
  private async triggerPositiveReinforcement(userId: string): Promise<void> {}
  private async handleDismissal(id: string, userId: string): Promise<void> {}
  private async trackEngagement(id: string, userId: string): Promise<void> {}
  private async sendInAppNotification(userId: string, payload: any): Promise<string> { return ''; }
  private async sendEmailNotification(userId: string, payload: any): Promise<string> { return ''; }
}
