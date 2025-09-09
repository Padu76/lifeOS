// =====================================================
// LifeOS - User Preferences Hook
// File: useUserPreferences.ts
// =====================================================

import { useState, useCallback, useEffect } from 'react';
import { useTypedEdgeFunction } from './useSupabaseEdgeFunctions';

interface QuietHours {
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  enabled: boolean;
}

interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  advice_notifications: boolean;
  achievement_notifications: boolean;
  weekly_report_notifications: boolean;
  reminder_notifications: boolean;
}

interface UserPreferences {
  id: string;
  user_id: string;
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic';
  preferred_tone: 'professional' | 'friendly' | 'casual' | 'motivational';
  focus_areas: string[];
  max_daily_interventions: number;
  min_intervention_gap_minutes: number;
  quiet_hours: QuietHours;
  notification_settings: NotificationSettings;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface UpdatePreferencesInput {
  chronotype?: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level?: 'gentle' | 'moderate' | 'enthusiastic';
  preferred_tone?: 'professional' | 'friendly' | 'casual' | 'motivational';
  focus_areas?: string[];
  max_daily_interventions?: number;
  min_intervention_gap_minutes?: number;
  quiet_hours?: QuietHours;
  notification_settings?: Partial<NotificationSettings>;
  language?: string;
  timezone?: string;
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<UpdatePreferencesInput>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateFunction = useTypedEdgeFunction<UpdatePreferencesInput, UserPreferences>(
    'update-user-preferences'
  );

  // Fetch current preferences (called automatically)
  const fetchPreferences = useCallback(async (): Promise<UserPreferences | null> => {
    try {
      const data = await updateFunction.execute({}); // Empty object triggers fetch
      
      if (data) {
        setPreferences(data);
        setLastSaved(new Date());
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return null;
    }
  }, [updateFunction.execute]);

  // Update preferences (batched)
  const updatePreferences = useCallback(async (
    updates: UpdatePreferencesInput,
    immediate: boolean = false
  ): Promise<UserPreferences | null> => {
    // Update local state immediately for instant UI feedback
    if (preferences) {
      setPreferences(prev => prev ? {
        ...prev,
        ...updates,
        quiet_hours: updates.quiet_hours ? {
          ...prev.quiet_hours,
          ...updates.quiet_hours
        } : prev.quiet_hours,
        notification_settings: updates.notification_settings ? {
          ...prev.notification_settings,
          ...updates.notification_settings
        } : prev.notification_settings,
        updated_at: new Date().toISOString()
      } : null);
    }

    if (immediate) {
      // Send update immediately
      try {
        const result = await updateFunction.execute(updates);
        
        if (result) {
          setPreferences(result);
          setLastSaved(new Date());
          setPendingUpdates({});
        }
        
        return result;
      } catch (error) {
        console.error('Error updating preferences:', error);
        return null;
      }
    } else {
      // Batch the update
      setPendingUpdates(prev => ({
        ...prev,
        ...updates,
        quiet_hours: updates.quiet_hours ? {
          ...prev.quiet_hours,
          ...updates.quiet_hours
        } : prev.quiet_hours,
        notification_settings: updates.notification_settings ? {
          ...prev.notification_settings,
          ...updates.notification_settings
        } : prev.notification_settings
      }));
      
      return preferences;
    }
  }, [preferences, updateFunction.execute]);

  // Save pending updates
  const savePendingUpdates = useCallback(async (): Promise<boolean> => {
    if (Object.keys(pendingUpdates).length === 0) {
      return true;
    }

    try {
      const result = await updateFunction.execute(pendingUpdates);
      
      if (result) {
        setPreferences(result);
        setLastSaved(new Date());
        setPendingUpdates({});
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving pending updates:', error);
      return false;
    }
  }, [pendingUpdates, updateFunction.execute]);

  // Quick update methods
  const updateChronotype = useCallback(async (
    chronotype: 'early_bird' | 'night_owl' | 'intermediate'
  ): Promise<UserPreferences | null> => {
    return updatePreferences({ chronotype });
  }, [updatePreferences]);

  const updateSensitivityLevel = useCallback(async (
    sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic'
  ): Promise<UserPreferences | null> => {
    return updatePreferences({ sensitivity_level });
  }, [updatePreferences]);

  const updateTonePreference = useCallback(async (
    preferred_tone: 'professional' | 'friendly' | 'casual' | 'motivational'
  ): Promise<UserPreferences | null> => {
    return updatePreferences({ preferred_tone });
  }, [updatePreferences]);

  const updateFocusAreas = useCallback(async (
    focus_areas: string[]
  ): Promise<UserPreferences | null> => {
    return updatePreferences({ focus_areas });
  }, [updatePreferences]);

  const updateQuietHours = useCallback(async (
    quiet_hours: Partial<QuietHours>
  ): Promise<UserPreferences | null> => {
    const currentQuietHours = preferences?.quiet_hours || {
      start_time: '22:00',
      end_time: '07:00',
      enabled: true
    };
    
    return updatePreferences({
      quiet_hours: {
        ...currentQuietHours,
        ...quiet_hours
      }
    });
  }, [preferences, updatePreferences]);

  const updateNotificationSettings = useCallback(async (
    notification_settings: Partial<NotificationSettings>
  ): Promise<UserPreferences | null> => {
    return updatePreferences({ notification_settings });
  }, [updatePreferences]);

  const updateInterventionLimits = useCallback(async (
    max_daily_interventions?: number,
    min_intervention_gap_minutes?: number
  ): Promise<UserPreferences | null> => {
    return updatePreferences({
      max_daily_interventions,
      min_intervention_gap_minutes
    });
  }, [updatePreferences]);

  // Toggle helpers
  const toggleQuietHours = useCallback(async (): Promise<UserPreferences | null> => {
    const currentEnabled = preferences?.quiet_hours?.enabled ?? true;
    return updateQuietHours({ enabled: !currentEnabled });
  }, [preferences, updateQuietHours]);

  const toggleNotification = useCallback(async (
    type: keyof NotificationSettings
  ): Promise<UserPreferences | null> => {
    const currentValue = preferences?.notification_settings?.[type] ?? true;
    return updateNotificationSettings({ [type]: !currentValue });
  }, [preferences, updateNotificationSettings]);

  // Auto-fetch preferences on mount
  useEffect(() => {
    if (!preferences && !updateFunction.loading) {
      fetchPreferences();
    }
  }, [preferences, updateFunction.loading, fetchPreferences]);

  // Auto-save pending updates after 2 seconds of inactivity
  useEffect(() => {
    if (Object.keys(pendingUpdates).length > 0) {
      const timeoutId = setTimeout(() => {
        savePendingUpdates();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [pendingUpdates, savePendingUpdates]);

  // Utility functions
  const hasPendingChanges = useCallback((): boolean => {
    return Object.keys(pendingUpdates).length > 0;
  }, [pendingUpdates]);

  const getTimeSinceLastSave = useCallback((): string => {
    if (!lastSaved) return 'Mai salvato';
    
    const minutes = Math.floor((Date.now() - lastSaved.getTime()) / (1000 * 60));
    
    if (minutes < 1) return 'Appena salvato';
    if (minutes === 1) return '1 minuto fa';
    if (minutes < 60) return `${minutes} minuti fa`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 ora fa';
    return `${hours} ore fa`;
  }, [lastSaved]);

  // Reset function
  const reset = useCallback(() => {
    setPreferences(null);
    setPendingUpdates({});
    setLastSaved(null);
    updateFunction.reset();
  }, [updateFunction.reset]);

  return {
    // State
    preferences,
    pendingUpdates,
    lastSaved,
    
    // Loading and error states
    loading: updateFunction.loading,
    error: updateFunction.error,
    
    // Methods
    fetchPreferences,
    updatePreferences,
    savePendingUpdates,
    
    // Quick update methods
    updateChronotype,
    updateSensitivityLevel,
    updateTonePreference,
    updateFocusAreas,
    updateQuietHours,
    updateNotificationSettings,
    updateInterventionLimits,
    
    // Toggle helpers
    toggleQuietHours,
    toggleNotification,
    
    // Utilities
    hasPendingChanges,
    getTimeSinceLastSave,
    reset
  };
}
