// =====================================================
// LifeOS React Native Push Notifications Setup
// File: apps/mobile/src/services/PushNotificationService.ts
// =====================================================

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidColor } from '@notifee/react-native';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  category: 'micro_advice' | 'reminder' | 'celebration' | 'check_in';
  priority: 'low' | 'medium' | 'high';
  data?: Record<string, any>;
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;
  private userId: string | null = null;

  constructor() {
    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
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
        
        this.isInitialized = true;
        console.log('Push notification service initialized');
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
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
      // Check if app is running in simulator
      if (__DEV__) {
        console.log('Running in development mode');
      }

      // Get the token
      const token = await messaging().getToken();
      this.fcmToken = token;
      
      // Store token locally
      await AsyncStorage.setItem('fcm_token', token);
      
      // Send token to server
      await this.sendTokenToServer(token);
      
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async sendTokenToServer(token: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/register-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
          user_id: this.userId,
          device_info: {
            os: Platform.OS,
            version: Platform.Version,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token');
      }

      console.log('Token registered with server');
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  }

  async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      // Create channels for different notification types
      const channels = [
        {
          id: 'micro_advice',
          name: 'Micro Advice',
          description: 'AI-powered wellness suggestions',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
        },
        {
          id: 'reminders',
          name: 'Reminders',
          description: 'Check-in and activity reminders',
          importance: AndroidImportance.DEFAULT,
          sound: 'default',
        },
        {
          id: 'celebrations',
          name: 'Celebrations',
          description: 'Achievement and milestone celebrations',
          importance: AndroidImportance.HIGH,
          sound: 'celebration',
        },
        {
          id: 'urgent',
          name: 'Urgent Wellness',
          description: 'Important wellness alerts',
          importance: AndroidImportance.HIGH,
          sound: 'urgent',
        },
      ];

      for (const channel of channels) {
        await notifee.createChannel(channel);
      }

      console.log('Notification channels created');
    } catch (error) {
      console.error('Failed to create notification channels:', error);
    }
  }

  setupMessageHandlers(): void {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      
      // Display notification when app is in foreground
      await this.displayForegroundNotification(remoteMessage);
      
      // Track notification received
      this.trackNotificationEvent('received', remoteMessage);
    });

    // Background/quit state message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
      
      // Track notification received in background
      this.trackNotificationEvent('received_background', remoteMessage);
    });

    // Notification opened handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      
      // Handle navigation based on notification data
      this.handleNotificationPress(remoteMessage);
      
      // Track notification opened
      this.trackNotificationEvent('opened', remoteMessage);
    });

    // Check if app was opened from notification when killed
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          this.handleNotificationPress(remoteMessage);
          this.trackNotificationEvent('opened_from_kill', remoteMessage);
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
          importance: AndroidImportance.DEFAULT,
          color: AndroidColor.BLUE,
          smallIcon: 'ic_notification',
          largeIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
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
      
      // Update local data if needed
      if (data?.update_local_data) {
        await this.updateLocalData(data);
      }
      
      // Schedule follow-up notifications if needed
      if (data?.schedule_followup) {
        await this.scheduleFollowupNotification(data);
      }
      
    } catch (error) {
      console.error('Failed to process background notification:', error);
    }
  }

  handleNotificationPress(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { data } = remoteMessage;
    
    if (!data) return;

    // Navigate based on notification type
    switch (data.type) {
      case 'micro_advice':
        this.navigateToAdvice(data.advice_id);
        break;
      case 'check_in':
        this.navigateToCheckIn();
        break;
      case 'celebration':
        this.navigateToCelebration(data.achievement_id);
        break;
      case 'reminder':
        this.navigateToReminder(data.reminder_type);
        break;
      default:
        this.navigateToHome();
    }
  }

  // Navigation methods
  navigateToAdvice(adviceId: string): void {
    // Implement navigation to advice screen
    console.log('Navigate to advice:', adviceId);
  }

  navigateToCheckIn(): void {
    // Implement navigation to check-in screen
    console.log('Navigate to check-in');
  }

  navigateToCelebration(achievementId: string): void {
    // Implement navigation to celebration screen
    console.log('Navigate to celebration:', achievementId);
  }

  navigateToReminder(reminderType: string): void {
    // Implement navigation based on reminder type
    console.log('Navigate to reminder:', reminderType);
  }

  navigateToHome(): void {
    // Implement navigation to home screen
    console.log('Navigate to home');
  }

  // Scheduling methods
  async scheduleLocalNotification(notification: ScheduledNotification): Promise<void> {
    try {
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
            sound: 'default',
          },
        },
        {
          type: notifee.TriggerType.TIMESTAMP,
          timestamp: notification.scheduledTime.getTime(),
        }
      );

      console.log('Local notification scheduled:', notification.id);
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
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

  // Utility methods
  getChannelId(category: string): string {
    switch (category) {
      case 'micro_advice':
        return 'micro_advice';
      case 'reminder':
        return 'reminders';
      case 'celebration':
        return 'celebrations';
      case 'urgent':
        return 'urgent';
      default:
        return 'micro_advice';
    }
  }

  getAndroidImportance(priority: string): AndroidImportance {
    switch (priority) {
      case 'high':
        return AndroidImportance.HIGH;
      case 'medium':
        return AndroidImportance.DEFAULT;
      case 'low':
        return AndroidImportance.LOW;
      default:
        return AndroidImportance.DEFAULT;
    }
  }

  async updateLocalData(data: any): Promise<void> {
    // Implement local data update logic
    console.log('Updating local data:', data);
  }

  async scheduleFollowupNotification(data: any): Promise<void> {
    // Implement follow-up notification scheduling
    console.log('Scheduling follow-up notification:', data);
  }

  trackNotificationEvent(event: string, remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    // Track notification events for analytics
    console.log('Tracking notification event:', event, remoteMessage.messageId);
  }

  async getAuthToken(): Promise<string> {
    // Get current user auth token
    const token = await AsyncStorage.getItem('auth_token');
    return token || '';
  }

  setUserId(userId: string): void {
    this.userId = userId;
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
      
      // Notify server about token removal
      await this.sendTokenToServer('');
      
      return true;
    } catch (error) {
      console.error('Failed to unregister:', error);
      return false;
    }
  }
}

export default new PushNotificationService();
