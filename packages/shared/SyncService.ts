// =====================================================
// LifeOS Cross-Platform Sync Service
// File: packages/shared/services/SyncService.ts
// =====================================================

import { Platform } from 'react-native';

// Platform-specific imports
let AsyncStorage: any;
let supabase: any;

// Dynamic imports based on platform
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} else if (typeof window !== 'undefined') {
  // Web environment
  try {
    supabase = require('../../apps/web/lib/supabase').supabase;
  } catch (e) {
    console.warn('Web supabase not available');
  }
}

// Types
interface SyncData {
  preferences: any;
  scheduled_notifications: any[];
  emotional_state: any;
  circadian_profile: any;
  analytics: any;
  last_sync: string;
  version: number;
}

interface SyncConflict {
  key: string;
  local_value: any;
  remote_value: any;
  local_timestamp: string;
  remote_timestamp: string;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: string;
  retry_count: number;
}

interface SyncResult {
  success: boolean;
  conflicts: SyncConflict[];
  operations_synced: number;
  errors: string[];
}

class CrossPlatformSyncService {
  private isOnline: boolean = true;
  private syncQueue: SyncOperation[] = [];
  private syncInProgress: boolean = false;
  private authToken: string | null = null;
  private userId: string | null = null;
  private apiBaseUrl: string;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private onlineListener: any = null;

  constructor() {
    this.apiBaseUrl = this.getApiBaseUrl();
    this.initialize();
  }

  private getApiBaseUrl(): string {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return `${process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL}/functions/v1/notifications`;
    } else {
      return '/api/notifications';
    }
  }

  async initialize(): Promise<void> {
    try {
      // Load stored credentials
      await this.loadStoredCredentials();
      
      // Setup network monitoring
      this.setupNetworkMonitoring();
      
      // Load offline queue
      await this.loadSyncQueue();
      
      // Start periodic sync
      this.startPeriodicSync();
      
      console.log('Cross-platform sync service initialized');
    } catch (error) {
      console.error('Failed to initialize sync service:', error);
    }
  }

  private async loadStoredCredentials(): Promise<void> {
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const [userId, authToken] = await Promise.all([
          AsyncStorage.getItem('user_id'),
          AsyncStorage.getItem('auth_token')
        ]);
        this.userId = userId;
        this.authToken = authToken;
      } else if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        this.authToken = session?.access_token || null;
        this.userId = session?.user?.id || null;
      }
    } catch (error) {
      console.error('Failed to load stored credentials:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // React Native network monitoring
      try {
        const NetInfo = require('@react-native-community/netinfo');
        this.onlineListener = NetInfo.addEventListener((state: any) => {
          const wasOnline = this.isOnline;
          this.isOnline = state.isConnected && state.isInternetReachable;
          
          // If came back online, process sync queue
          if (!wasOnline && this.isOnline) {
            this.processSyncQueue();
          }
        });
      } catch (error) {
        console.warn('NetInfo not available, assuming online');
      }
    } else {
      // Web network monitoring
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      let stored: string | null = null;
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        stored = await AsyncStorage.getItem('sync_queue');
      } else if (typeof localStorage !== 'undefined') {
        stored = localStorage.getItem('sync_queue');
      }

      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      const serialized = JSON.stringify(this.syncQueue);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await AsyncStorage.setItem('sync_queue', serialized);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem('sync_queue', serialized);
      }
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private startPeriodicSync(): void {
    // Sync every 2 minutes when online
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    
    this.syncIntervalId = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.fullSync();
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.authToken) {
      throw new Error('No auth token available');
    }

    const response = await fetch(`${this.apiBaseUrl}/${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async fullSync(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline || !this.authToken) {
      return {
        success: false,
        conflicts: [],
        operations_synced: 0,
        errors: ['Sync conditions not met']
      };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      conflicts: [],
      operations_synced: 0,
      errors: []
    };

    try {
      console.log('Starting full sync...');

      // 1. Process pending operations queue
      const queueResult = await this.processSyncQueue();
      result.operations_synced += queueResult.operations_synced;
      result.errors.push(...queueResult.errors);

      // 2. Pull latest data from server
      const pullResult = await this.pullDataFromServer();
      if (!pullResult.success) {
        result.errors.push(...pullResult.errors);
      }

      // 3. Push local changes to server
      const pushResult = await this.pushLocalChangesToServer();
      result.conflicts.push(...pushResult.conflicts);
      result.operations_synced += pushResult.operations_synced;
      result.errors.push(...pushResult.errors);

      // 4. Resolve conflicts
      if (result.conflicts.length > 0) {
        await this.resolveConflicts(result.conflicts);
      }

      // 5. Update last sync timestamp
      await this.updateLastSyncTimestamp();

      console.log('Full sync completed:', result);
      
    } catch (error) {
      console.error('Full sync failed:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  async processSyncQueue(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      conflicts: [],
      operations_synced: 0,
      errors: []
    };

    if (!this.isOnline || this.syncQueue.length === 0) {
      return result;
    }

    const operations = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        result.operations_synced++;
      } catch (error) {
        console.error('Failed to execute operation:', operation, error);
        
        // Retry logic
        operation.retry_count = (operation.retry_count || 0) + 1;
        if (operation.retry_count < 3) {
          this.syncQueue.push(operation);
        } else {
          result.errors.push(`Failed to sync operation ${operation.id} after 3 retries`);
        }
      }
    }

    await this.saveSyncQueue();
    return result;
  }

  async executeOperation(operation: SyncOperation): Promise<void> {
    const { type, endpoint, data } = operation;
    
    switch (type) {
      case 'create':
      case 'update':
        await this.makeAuthenticatedRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        break;
      
      case 'delete':
        await this.makeAuthenticatedRequest(endpoint, {
          method: 'DELETE'
        });
        break;
      
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  async pullDataFromServer(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      conflicts: [],
      operations_synced: 0,
      errors: []
    };

    try {
      // Pull latest data from all endpoints
      const [
        preferencesResult,
        scheduledResult,
        emotionalResult,
        circadianResult,
        analyticsResult
      ] = await Promise.allSettled([
        this.makeAuthenticatedRequest('analytics?include_preferences=true'),
        this.makeAuthenticatedRequest('scheduled?limit=50&timeframe=all'),
        this.makeAuthenticatedRequest('emotional-state'),
        this.makeAuthenticatedRequest('circadian-profile'),
        this.makeAuthenticatedRequest('analytics?period=month')
      ]);

      // Store pulled data locally
      const pulledData: Partial<SyncData> = {};

      if (preferencesResult.status === 'fulfilled' && preferencesResult.value.success) {
        pulledData.preferences = preferencesResult.value.preferences;
      }

      if (scheduledResult.status === 'fulfilled' && scheduledResult.value.success) {
        pulledData.scheduled_notifications = scheduledResult.value.data;
      }

      if (emotionalResult.status === 'fulfilled' && emotionalResult.value.success) {
        pulledData.emotional_state = emotionalResult.value.data;
      }

      if (circadianResult.status === 'fulfilled' && circadianResult.value.success) {
        pulledData.circadian_profile = circadianResult.value.data;
      }

      if (analyticsResult.status === 'fulfilled' && analyticsResult.value.success) {
        pulledData.analytics = analyticsResult.value.data;
      }

      // Merge with local data and detect conflicts
      await this.mergeRemoteData(pulledData);

    } catch (error) {
      console.error('Failed to pull data from server:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Pull failed');
    }

    return result;
  }

  async pushLocalChangesToServer(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      conflicts: [],
      operations_synced: 0,
      errors: []
    };

    try {
      // Get local changes since last sync
      const localChanges = await this.getLocalChangesSinceLastSync();
      
      for (const change of localChanges) {
        try {
          await this.pushSingleChange(change);
          result.operations_synced++;
        } catch (error) {
          console.error('Failed to push change:', change, error);
          result.errors.push(`Failed to push ${change.type} to ${change.endpoint}`);
        }
      }

    } catch (error) {
      console.error('Failed to push local changes:', error);
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : 'Push failed');
    }

    return result;
  }

  async getLocalChangesSinceLastSync(): Promise<SyncOperation[]> {
    const changes: SyncOperation[] = [];
    
    try {
      let lastSyncStr: string | null = null;
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        lastSyncStr = await AsyncStorage.getItem('last_sync_timestamp');
      } else if (typeof localStorage !== 'undefined') {
        lastSyncStr = localStorage.getItem('last_sync_timestamp');
      }

      const lastSync = lastSyncStr ? new Date(lastSyncStr) : new Date(0);
      
      // Check for local changes in preferences
      const prefsChanges = await this.getPreferencesChanges(lastSync);
      changes.push(...prefsChanges);

      // Add other change types as needed
      
    } catch (error) {
      console.error('Failed to get local changes:', error);
    }

    return changes;
  }

  async getPreferencesChanges(since: Date): Promise<SyncOperation[]> {
    const changes: SyncOperation[] = [];
    
    try {
      let prefsStr: string | null = null;
      let prefsTimestampStr: string | null = null;
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        [prefsStr, prefsTimestampStr] = await Promise.all([
          AsyncStorage.getItem('notification_preferences'),
          AsyncStorage.getItem('preferences_last_modified')
        ]);
      } else if (typeof localStorage !== 'undefined') {
        prefsStr = localStorage.getItem('notification_preferences');
        prefsTimestampStr = localStorage.getItem('preferences_last_modified');
      }

      if (prefsStr && prefsTimestampStr) {
        const prefsTimestamp = new Date(prefsTimestampStr);
        
        if (prefsTimestamp > since) {
          changes.push({
            id: `prefs_${Date.now()}`,
            type: 'update',
            endpoint: 'analytics',
            data: {
              action: 'update_preferences',
              preferences: JSON.parse(prefsStr)
            },
            timestamp: prefsTimestampStr,
            retry_count: 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to get preferences changes:', error);
    }

    return changes;
  }

  async pushSingleChange(change: SyncOperation): Promise<void> {
    await this.executeOperation(change);
  }

  async mergeRemoteData(remoteData: Partial<SyncData>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(remoteData)) {
        if (value !== undefined) {
          await this.storeDataLocally(key, value);
        }
      }
    } catch (error) {
      console.error('Failed to merge remote data:', error);
    }
  }

  async storeDataLocally(key: string, data: any): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await AsyncStorage.setItem(key, serialized);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error(`Failed to store ${key} locally:`, error);
    }
  }

  async resolveConflicts(conflicts: SyncConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      try {
        // Simple last-write-wins resolution
        const localTime = new Date(conflict.local_timestamp);
        const remoteTime = new Date(conflict.remote_timestamp);
        
        const winningValue = remoteTime > localTime ? conflict.remote_value : conflict.local_value;
        
        await this.storeDataLocally(conflict.key, winningValue);
        
        console.log(`Conflict resolved for ${conflict.key}, winner: ${remoteTime > localTime ? 'remote' : 'local'}`);
      } catch (error) {
        console.error('Failed to resolve conflict:', conflict, error);
      }
    }
  }

  async updateLastSyncTimestamp(): Promise<void> {
    const timestamp = new Date().toISOString();
    
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await AsyncStorage.setItem('last_sync_timestamp', timestamp);
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem('last_sync_timestamp', timestamp);
      }
    } catch (error) {
      console.error('Failed to update last sync timestamp:', error);
    }
  }

  // Public API
  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retry_count'>): Promise<void> {
    const fullOperation: SyncOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      retry_count: 0
    };

    this.syncQueue.push(fullOperation);
    await this.saveSyncQueue();

    // If online, try to process immediately
    if (this.isOnline && !this.syncInProgress) {
      setTimeout(() => this.processSyncQueue(), 100);
    }
  }

  async updatePreferences(preferences: any): Promise<void> {
    // Store locally first
    await this.storeDataLocally('notification_preferences', preferences);
    await this.storeDataLocally('preferences_last_modified', new Date().toISOString());

    // Queue for sync
    await this.queueOperation({
      type: 'update',
      endpoint: 'analytics',
      data: {
        action: 'update_preferences',
        preferences
      }
    });
  }

  async scheduleNotification(params: any): Promise<void> {
    await this.queueOperation({
      type: 'create',
      endpoint: 'scheduled',
      data: {
        schedule_new: params
      }
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await this.queueOperation({
      type: 'update',
      endpoint: 'scheduled',
      data: {
        action: 'cancel',
        notification_id: notificationId
      }
    });
  }

  async markNotificationAction(notificationId: string, action: string): Promise<void> {
    await this.queueOperation({
      type: 'update',
      endpoint: 'scheduled',
      data: {
        notification_id: notificationId,
        user_action: action
      }
    });
  }

  setCredentials(userId: string, authToken: string): void {
    this.userId = userId;
    this.authToken = authToken;
    
    // Store credentials
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AsyncStorage.setItem('user_id', userId);
      AsyncStorage.setItem('auth_token', authToken);
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  async forcSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        conflicts: [],
        operations_synced: 0,
        errors: ['Sync already in progress']
      };
    }
    
    return this.fullSync();
  }

  // Cleanup
  destroy(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    
    if (this.onlineListener) {
      this.onlineListener();
      this.onlineListener = null;
    }
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.processSyncQueue);
      window.removeEventListener('offline', () => this.isOnline = false);
    }
  }
}

export default new CrossPlatformSyncService();