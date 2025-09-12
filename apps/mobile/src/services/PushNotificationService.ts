// =====================================================
// LifeOS React Native Push Notifications Setup - Complete Enhanced
// File: apps/mobile/src/services/PushNotificationService.ts
// =====================================================

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidColor } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SyncService from '../../../packages/shared/services/SyncService';

interface NotificationPermissionResult {
  granted: boolean;
  token?: string;
  error?: string;
}

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'mindfulness' | 'emergency' | 'micro_advice';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  data?: Record<string, any>;
}

interface NotificationPreferences {
  enabled: boolean;
  categories: {
    stress_relief: boolean;
    energy_boost: boolean;
    sleep_prep: boolean;
    celebration: boolean;
    mindfulness: boolean;
    emergency: boolean;
  };
  quiet_hours: {
    enabled: boolean;
    start_time: string;
    end_time: string;
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
  tone_preference: 'adaptive' | 'encouraging' | 'gentle' | 'direct';
  circadian_optimization: boolean;
  emotional_awareness: boolean;
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;
  private userId: string | null = null;
  private preferences: NotificationPreferences | null = null;
  private apiBaseUrl: string;
  private authToken: string | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.apiBaseUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL}/functions/v1`;
    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load stored auth token and user ID
      await this.loadStoredCredentials();
      
      // Request permission first
      const hasPermission = await this.requestUserPermission();
      
      if (hasPermission) {
        // Get FCM token
        await this.getFCMToken();
        
        // Setup notification channel for Android
        await this.createNotificationChannels();
        
        // Setup message handlers
        this.setupMessageHandlers();
        
        // Setup background handler
        this.setupBackgroundHandler();
        
        // Load preferences from SyncService
        await this.loadPreferencesFromSync();
        
        // Start sync interval
        this.startSyncInterval();
        
        this.isInitialized = true;
        console.log('Enhanced push notification service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  async loadStoredCredentials(): Promise<void> {
    try {
      const [storedUserId, storedAuthToken] = await Promise.all([
        AsyncStorage.getItem('user_id'),
        AsyncStorage.getItem('auth_token')
      ]);
      
      this.userId = storedUserId;
      this.authToken = storedAuthToken;
    } catch (error) {
      console.error('Failed to load stored credentials:', error);
    }
  }

  async loadPreferencesFromSync(): Promise<void> {
    try {
      // Load from local storage (synced by SyncService)
      const storedPrefs = await AsyncStorage.getItem('notification_preferences');
      if (storedPrefs) {
        this.preferences = JSON.parse(storedPrefs);
        console.log('Preferences loaded from sync');
      }
    } catch (error) {
      console.error('Failed to load preferences from sync:', error);
    }
  }

  startSyncInterval(): void {
    // Sync preferences every 5 minutes
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      await this.loadPreferencesFromSync();
    }, 5 * 60 * 1000); // 5 minutes
  }

  async requestUserPermission(): Promise<boolean> {
    try {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (Platform.OS === 'android') {
        // Request additional Android permissions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return enabled && granted === PermissionsAndroid.RESULTS.GRANTED;
      }

      return enabled;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      // Get the token
      const token = await messaging().getToken();
      this.fcmToken = token;
      
      // Store token locally
      await AsyncStorage.setItem('fcm_token', token);
      
      // Register token with SyncService
      await this.registerTokenWithSync(token);
      
      console.log('FCM Token obtained and registered:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async registerTokenWithSync(token: string): Promise<void> {
    if (!this.authToken || !this.userId) {
      console.warn('Cannot register token - missing auth or user ID');
      return;
    }

    try {
      // Register token via SyncService
      await SyncService.queueOperation({
        type: 'update',
        endpoint: 'analytics',
        data: {
          action: 'register_push_token',
          token,
          platform: Platform.OS,
          user_id: this.userId,
          device_info: {
            os: Platform.OS,
            version: Platform.Version,
          }
        }
      });

      console.log('Token registered with SyncService');
    } catch (error) {
      console.error('Failed to register token with SyncService:', error);
    }
  }

  async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      // Create channels for different notification categories
      const channels = [
        {
          id: 'stress_relief',
          name: 'Stress Relief',
          description: 'Relaxation and stress management notifications',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
        },
        {
          id: 'energy_boost',
          name: 'Energy Boost',
          description: 'Energy and vitality enhancement notifications',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
        },
        {
          id: 'sleep_prep',
          name: 'Sleep Preparation',
          description: 'Sleep optimization and wind-down notifications',
          importance: AndroidImportance.DEFAULT,
          sound: 'gentle',
        },
        {
          id: 'celebration',
          name: 'Celebrations',
          description: 'Achievement and milestone celebrations',
          importance: AndroidImportance.HIGH,
          sound: 'celebration',
        },
        {
          id: 'mindfulness',
          name: 'Mindfulness',
          description: 'Mindfulness and awareness notifications',
          importance: AndroidImportance.DEFAULT,
          sound: 'soft',
        },
        {
          id: 'emergency',
          name: 'Emergency Wellness',
          description: 'Critical wellness alerts and interventions',
          importance: AndroidImportance.HIGH,
          sound: 'urgent',
        },
        {
          id: 'micro_advice',
          name: 'Micro Advice',
          description: 'AI-powered wellness suggestions',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
        },
      ];

      for (const channel of channels) {
        await notifee.createChannel(channel);
      }

      console.log('Enhanced notification channels created');
    } catch (error) {
      console.error('Failed to create notification channels:', error);
    }
  }

  setupMessageHandlers(): void {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      
      // Check if notifications are enabled and category is allowed
      if (!this.shouldDisplayNotification(remoteMessage)) {
        console.log('Notification filtered by preferences');
        return;
      }
      
      // Display notification when app is in foreground
      await this.displayForegroundNotification(remoteMessage);
      
      // Track notification received via SyncService
      this.trackNotificationEventWithSync('received', remoteMessage);
    });

    // Background/quit state message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
      
      // Track notification received in background
      this.trackNotificationEventWithSync('received_background', remoteMessage);
    });

    // Notification opened handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      
      // Handle navigation based on notification data
      this.handleNotificationPress(remoteMessage);
      
      // Track notification opened via SyncService
      this.trackNotificationEventWithSync('opened', remoteMessage);
    });

    // Check if app was opened from notification when killed
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationPress(remoteMessage);
          this.trackNotificationEventWithSync('opened_from_kill', remoteMessage);
        }
      });
  }

  setupBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background!', remoteMessage);
      
      // Process background logic
      await this.processBackgroundNotification(remoteMessage);
    });
  }

  shouldDisplayNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): boolean {
    if (!this.preferences) return true;

    // Check if notifications are globally enabled
    if (!this.preferences.enabled) return false;

    // Check category preferences
    const category = remoteMessage.data?.category as keyof typeof this.preferences.categories;
    if (category && this.preferences.categories[category] === false) {
      return false;
    }

    // Check quiet hours
    if (this.preferences.quiet_hours.enabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const startTime = this.parseTimeString(this.preferences.quiet_hours.start_time);
      const endTime = this.parseTimeString(this.preferences.quiet_hours.end_time);

      if (startTime < endTime) {
        // Same day quiet hours
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      } else {
        // Quiet hours span midnight
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      }
    }

    // Check if in-app only mode
    if (this.preferences.delivery_channels.in_app_only && !this.preferences.delivery_channels.push_notifications) {
      return false;
    }

    return true;
  }

  parseTimeString(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async displayForegroundNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const { notification, data } = remoteMessage;
      
      if (!notification) return;

      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        data: data,
        android: {
          channelId: this.getChannelId(data?.category || 'micro_advice'),
          importance: this.getAndroidImportance(data?.priority || 'normal'),
          color: AndroidColor.BLUE,
          smallIcon: 'ic_notification',
          largeIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: this.getIOSSound(data?.category),
          badge: 1,
        },
      });
    } catch (error) {
      console.error('Failed to display foreground notification:', error);
    }
  }

  async processBackgroundNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const { data } = remoteMessage;
      
      // Update local preferences if needed
      if (data?.sync_preferences) {
        await this.loadPreferencesFromSync();
      }
      
      // Schedule follow-up notifications based on intelligent timing
      if (data?.schedule_followup && data?.followup_category) {
        await this.scheduleIntelligentFollowup(data);
      }
      
    } catch (error) {
      console.error('Failed to process background notification:', error);
    }
  }

  async scheduleIntelligentFollowup(data: any): Promise<void> {
    try {
      // Use SyncService for intelligent scheduling
      await SyncService.scheduleNotification({
        type: data.followup_category,
        message: data.followup_message || 'Follow-up wellness check'
      });

      console.log('Intelligent follow-up scheduled via SyncService');
    } catch (error) {
      console.error('Failed to schedule intelligent follow-up:', error);
    }
  }

  handleNotificationPress(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { data } = remoteMessage;
    
    if (!data) return;

    // Mark notification as opened via SyncService
    if (data.notification_id) {
      this.markNotificationActionWithSync(data.notification_id, 'opened');
    }

    // Navigate based on notification type
    switch (data.type) {
      case 'stress_relief':
        this.navigateToStressRelief(data);
        break;
      case 'energy_boost':
        this.navigateToEnergyBoost(data);
        break;
      case 'sleep_prep':
        this.navigateToSleepPrep(data);
        break;
      case 'celebration':
        this.navigateToCelebration(data);
        break;
      case 'mindfulness':
        this.navigateToMindfulness(data);
        break;
      case 'emergency':
        this.navigateToEmergency(data);
        break;
      case 'micro_advice':
        this.navigateToAdvice(data.advice_id);
        break;
      case 'check_in':
        this.navigateToCheckIn();
        break;
      default:
        this.navigateToHome();
    }
  }

  async markNotificationActionWithSync(notificationId: string, action: string): Promise<void> {
    try {
      await SyncService.markNotificationAction(notificationId, action);
      console.log(`Notification ${notificationId} marked as ${action} via SyncService`);
    } catch (error) {
      console.error('Failed to mark notification action via SyncService:', error);
    }
  }

  trackNotificationEventWithSync(event: string, remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    // Track asynchronously via SyncService
    setTimeout(async () => {
      try {
        await SyncService.queueOperation({
          type: 'update',
          endpoint: 'analytics',
          data: {
            action: 'track_event',
            event,
            notification_id: remoteMessage.data?.notification_id,
            message_id: remoteMessage.messageId,
            category: remoteMessage.data?.category,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to track notification event via SyncService:', error);
      }
    }, 0);
  }

  // Enhanced navigation methods
  navigateToStressRelief(data: any): void {
    console.log('Navigate to stress relief:', data);
    // Implement navigation to stress relief activities
  }

  navigateToEnergyBoost(data: any): void {
    console.log('Navigate to energy boost:', data);
    // Implement navigation to energy boosting activities
  }

  navigateToSleepPrep(data: any): void {
    console.log('Navigate to sleep prep:', data);
    // Implement navigation to sleep preparation
  }

  navigateToMindfulness(data: any): void {
    console.log('Navigate to mindfulness:', data);
    // Implement navigation to mindfulness exercises
  }

  navigateToEmergency(data: any): void {
    console.log('Navigate to emergency:', data);
    // Implement navigation to emergency wellness support
  }

  navigateToAdvice(adviceId: string): void {
    console.log('Navigate to advice:', adviceId);
    // Implement navigation to specific advice
  }

  navigateToCheckIn(): void {
    console.log('Navigate to check-in');
    // Implement navigation to daily check-in
  }

  navigateToCelebration(data: any): void {
    console.log('Navigate to celebration:', data);
    // Implement navigation to achievement celebration
  }

  navigateToHome(): void {
    console.log('Navigate to home');
    // Implement navigation to home screen
  }

  // Enhanced scheduling methods with SyncService integration
  async scheduleLocalNotification(notification: ScheduledNotification): Promise<void> {
    try {
      // Check preferences before scheduling
      if (!this.shouldAllowCategory(notification.category)) {
        console.log('Local notification filtered by preferences:', notification.category);
        return;
      }

      await notifee.createTriggerNotification(
        {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          android: {
            channelId: this.getChannelId(notification.category),
            importance: this.getAndroidImportance(notification.priority),
          },
          ios: {
            sound: this.getIOSSound(notification.category),
          },
        },
        {
          type: notifee.TriggerType.TIMESTAMP,
          timestamp: notification.scheduledTime.getTime(),
        }
      );

      console.log('Enhanced local notification scheduled:', notification.id);
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  }

  shouldAllowCategory(category: string): boolean {
    if (!this.preferences) return true;
    
    const categoryKey = category as keyof typeof this.preferences.categories;
    return this.preferences.categories[categoryKey] !== false;
  }

  async testIntelligentNotification(category: string = 'mindfulness'): Promise<boolean> {
    try {
      // Test via SyncService
      await SyncService.scheduleNotification({
        type: 'immediate',
        category,
        message: 'Test notifica intelligente - Sistema mobile automatizzato funzionante!'
      });

      // Schedule local notification with test message
      await this.scheduleLocalNotification({
        id: `test_${Date.now()}`,
        title: 'LifeOS Test',
        body: 'Sistema mobile automatizzato funzionante!',
        scheduledTime: new Date(),
        category: category as any,
        priority: 'normal'
      });

      return true;
    } catch (error) {
      console.error('Failed to test intelligent notification:', error);
      return false;
    }
  }

  // Utility methods
  getChannelId(category: string): string {
    switch (category) {
      case 'stress_relief':
        return 'stress_relief';
      case 'energy_boost':
        return 'energy_boost';
      case 'sleep_prep':
        return 'sleep_prep';
      case 'celebration':
        return 'celebration';
      case 'mindfulness':
        return 'mindfulness';
      case 'emergency':
        return 'emergency';
      case 'micro_advice':
        return 'micro_advice';
      default:
        return 'micro_advice';
    }
  }

  getAndroidImportance(priority: string): AndroidImportance {
    switch (priority) {
      case 'emergency':
        return AndroidImportance.HIGH;
      case 'high':
        return AndroidImportance.HIGH;
      case 'normal':
        return AndroidImportance.DEFAULT;
      case 'low':
        return AndroidImportance.LOW;
      default:
        return AndroidImportance.DEFAULT;
    }
  }

  getIOSSound(category?: string): string {
    switch (category) {
      case 'emergency':
        return 'urgent.aiff';
      case 'celebration':
        return 'celebration.aiff';
      case 'sleep_prep':
        return 'gentle.aiff';
      default:
        return 'default';
    }
  }

  async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async getAllScheduledNotifications(): Promise<any[]> {
    try {
      const notifications = await notifee.getTriggerNotifications();
      return notifications;
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Public API
  async getRegistrationStatus(): Promise<NotificationPermissionResult> {
    try {
      const hasPermission = await this.requestUserPermission();
      
      if (hasPermission && this.fcmToken) {
        return {
          granted: true,
          token: this.fcmToken,
        };
      } else {
        return {
          granted: false,
          error: 'Permission denied or token unavailable',
        };
      }
    } catch (error) {
      return {
        granted: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      await messaging().deleteToken();
      return await this.getFCMToken();
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem('fcm_token');
      this.fcmToken = null;
      
      // Notify SyncService about token removal
      if (this.authToken) {
        await SyncService.queueOperation({
          type: 'update',
          endpoint: 'analytics',
          data: {
            action: 'unregister_push_token',
            user_id: this.userId
          }
        });
      }
      
      // Stop sync interval
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to unregister:', error);
      return false;
    }
  }

  // Enhanced API methods with SyncService integration
  setUserId(userId: string): void {
    this.userId = userId;
    AsyncStorage.setItem('user_id', userId);
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    AsyncStorage.setItem('auth_token', token);
    
    // Set credentials in SyncService
    if (this.userId) {
      SyncService.setCredentials(this.userId, token);
    }
    
    // Reload preferences with new token
    this.loadPreferencesFromSync();
  }

  updatePreferences(preferences: NotificationPreferences): void {
    this.preferences = preferences;
    
    // Store locally
    AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
    
    // Sync via SyncService
    SyncService.updatePreferences(preferences);
  }

  getPreferences(): NotificationPreferences | null {
    return this.preferences;
  }

  // Send token to server - kept for compatibility but now uses SyncService
  async sendTokenToServer(token: string): Promise<void> {
    await this.registerTokenWithSync(token);
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.isInitialized = false;
  }
}

export default new PushNotificationService();