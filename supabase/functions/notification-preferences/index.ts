// =====================================================
// LifeOS Notification Preferences API Edge Function
// File: supabase/functions/notification-preferences/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface NotificationPreferencesRequest {
  preferences?: {
    // Main categories
    micro_advice_enabled: boolean;
    reminders_enabled: boolean;
    celebrations_enabled: boolean;
    urgent_enabled: boolean;
    
    // Granular controls
    micro_advice_settings: {
      frequency: 'minimal' | 'balanced' | 'frequent';
      stress_threshold: number;
      energy_threshold: number;
      categories: {
        breathing: boolean;
        meditation: boolean;
        movement: boolean;
        rest: boolean;
        nutrition: boolean;
      };
    };
    
    // Timing preferences
    quiet_hours: {
      enabled: boolean;
      start_time: string;
      end_time: string;
    };
    
    optimal_times: {
      morning_enabled: boolean;
      morning_time: string;
      afternoon_enabled: boolean;
      afternoon_time: string;
      evening_enabled: boolean;
      evening_time: string;
    };
    
    // Daily limits
    max_daily_notifications: number;
    min_interval_minutes: number;
    
    // Context-based
    location_based: {
      enabled: boolean;
      work_notifications: boolean;
      home_notifications: boolean;
      gym_notifications: boolean;
    };
    
    // Advanced settings
    adaptive_learning: boolean;
    emergency_override: boolean;
    weekend_different_schedule: boolean;
    weekend_quiet_hours?: {
      start_time: string;
      end_time: string;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    if (req.method === 'GET') {
      // Get user preferences
      const preferences = await getUserPreferences(supabaseClient, user.id)
      
      return new Response(
        JSON.stringify({ 
          success: true,
          preferences
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      // Update user preferences
      const requestData: NotificationPreferencesRequest = await req.json()
      
      if (!requestData.preferences) {
        throw new Error('Preferences data is required')
      }

      console.log(`Updating notification preferences for user: ${user.id}`)

      // Validate preferences
      const validationResult = validatePreferences(requestData.preferences)
      if (!validationResult.valid) {
        throw new Error(`Invalid preferences: ${validationResult.errors.join(', ')}`)
      }

      // Save preferences to database
      const saveResult = await saveUserPreferences(
        supabaseClient, 
        user.id, 
        requestData.preferences
      )

      if (!saveResult.success) {
        throw new Error(`Failed to save preferences: ${saveResult.error}`)
      }

      // Update scheduling profile based on preferences
      await updateSchedulingProfile(supabaseClient, user.id, requestData.preferences)

      // If adaptive learning is enabled, create learning baseline
      if (requestData.preferences.adaptive_learning) {
        await initializeAdaptiveLearning(supabaseClient, user.id)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Preferences updated successfully',
          preferences: requestData.preferences
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (req.method === 'DELETE') {
      // Reset to default preferences
      const defaultPreferences = getDefaultPreferences()
      
      const saveResult = await saveUserPreferences(
        supabaseClient, 
        user.id, 
        defaultPreferences
      )

      if (!saveResult.success) {
        throw new Error(`Failed to reset preferences: ${saveResult.error}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Preferences reset to defaults',
          preferences: defaultPreferences
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Method not allowed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Error in notification-preferences:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// =====================================================
// Helper Functions
// =====================================================

async function getUserPreferences(supabase: any, userId: string) {
  try {
    // Get main preferences
    const { data: mainPrefs, error: mainError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (mainError && mainError.code !== 'PGRST116') { // Not found is ok
      throw mainError
    }

    // Get detailed settings
    const { data: detailedSettings, error: detailedError } = await supabase
      .from('notification_detailed_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (detailedError && detailedError.code !== 'PGRST116') { // Not found is ok
      throw detailedError
    }

    // Merge with defaults if no preferences exist
    if (!mainPrefs && !detailedSettings) {
      return getDefaultPreferences()
    }

    // Combine preferences from both tables
    const preferences = {
      micro_advice_enabled: mainPrefs?.micro_advice_enabled ?? true,
      reminders_enabled: mainPrefs?.reminders_enabled ?? true,
      celebrations_enabled: mainPrefs?.celebrations_enabled ?? true,
      urgent_enabled: mainPrefs?.urgent_enabled ?? true,
      
      micro_advice_settings: detailedSettings?.micro_advice_settings || {
        frequency: 'balanced',
        stress_threshold: 7,
        energy_threshold: 4,
        categories: {
          breathing: true,
          meditation: true,
          movement: true,
          rest: true,
          nutrition: true,
        },
      },
      
      quiet_hours: {
        enabled: mainPrefs?.quiet_hours_enabled ?? true,
        start_time: mainPrefs?.quiet_hours_start || '22:00',
        end_time: mainPrefs?.quiet_hours_end || '08:00',
      },
      
      optimal_times: detailedSettings?.optimal_times || {
        morning_enabled: true,
        morning_time: '09:00',
        afternoon_enabled: true,
        afternoon_time: '14:00',
        evening_enabled: true,
        evening_time: '19:00',
      },
      
      max_daily_notifications: mainPrefs?.max_daily_notifications || 5,
      min_interval_minutes: mainPrefs?.min_interval_minutes || 60,
      
      location_based: detailedSettings?.location_based || {
        enabled: false,
        work_notifications: true,
        home_notifications: true,
        gym_notifications: false,
      },
      
      adaptive_learning: detailedSettings?.adaptive_learning ?? true,
      emergency_override: mainPrefs?.emergency_override ?? true,
      weekend_different_schedule: detailedSettings?.weekend_different_schedule ?? false,
      weekend_quiet_hours: detailedSettings?.weekend_quiet_hours,
    }

    return preferences
  } catch (error) {
    console.error('Error getting user preferences:', error)
    return getDefaultPreferences()
  }
}

async function saveUserPreferences(supabase: any, userId: string, preferences: any) {
  try {
    // Save main preferences
    const { error: mainError } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        micro_advice_enabled: preferences.micro_advice_enabled,
        reminders_enabled: preferences.reminders_enabled,
        celebrations_enabled: preferences.celebrations_enabled,
        urgent_enabled: preferences.urgent_enabled,
        quiet_hours_enabled: preferences.quiet_hours.enabled,
        quiet_hours_start: preferences.quiet_hours.start_time,
        quiet_hours_end: preferences.quiet_hours.end_time,
        max_daily_notifications: preferences.max_daily_notifications,
        min_interval_minutes: preferences.min_interval_minutes,
        emergency_override: preferences.emergency_override,
        updated_at: new Date().toISOString()
      })

    if (mainError) {
      throw mainError
    }

    // Save detailed settings
    const { error: detailedError } = await supabase
      .from('notification_detailed_settings')
      .upsert({
        user_id: userId,
        micro_advice_settings: preferences.micro_advice_settings,
        optimal_times: preferences.optimal_times,
        location_based: preferences.location_based,
        adaptive_learning: preferences.adaptive_learning,
        weekend_different_schedule: preferences.weekend_different_schedule,
        weekend_quiet_hours: preferences.weekend_quiet_hours,
        updated_at: new Date().toISOString()
      })

    if (detailedError) {
      throw detailedError
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving preferences:', error)
    return { success: false, error: error.message }
  }
}

function validatePreferences(preferences: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate thresholds
  if (preferences.micro_advice_settings?.stress_threshold) {
    const threshold = preferences.micro_advice_settings.stress_threshold
    if (threshold < 1 || threshold > 10) {
      errors.push('Stress threshold must be between 1 and 10')
    }
  }

  if (preferences.micro_advice_settings?.energy_threshold) {
    const threshold = preferences.micro_advice_settings.energy_threshold
    if (threshold < 1 || threshold > 10) {
      errors.push('Energy threshold must be between 1 and 10')
    }
  }

  // Validate daily limits
  if (preferences.max_daily_notifications) {
    if (preferences.max_daily_notifications < 1 || preferences.max_daily_notifications > 20) {
      errors.push('Max daily notifications must be between 1 and 20')
    }
  }

  if (preferences.min_interval_minutes) {
    if (preferences.min_interval_minutes < 15 || preferences.min_interval_minutes > 1440) {
      errors.push('Min interval must be between 15 minutes and 24 hours')
    }
  }

  // Validate time formats
  const timeFields = [
    'quiet_hours.start_time',
    'quiet_hours.end_time',
    'optimal_times.morning_time',
    'optimal_times.afternoon_time',
    'optimal_times.evening_time'
  ]

  timeFields.forEach(field => {
    const value = getNestedValue(preferences, field)
    if (value && !isValidTimeFormat(value)) {
      errors.push(`Invalid time format for ${field}: ${value}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

async function updateSchedulingProfile(supabase: any, userId: string, preferences: any) {
  try {
    const profileUpdate = {
      user_id: userId,
      optimal_morning_time: preferences.optimal_times.morning_enabled ? 
        preferences.optimal_times.morning_time : null,
      optimal_afternoon_time: preferences.optimal_times.afternoon_enabled ? 
        preferences.optimal_times.afternoon_time : null,
      optimal_evening_time: preferences.optimal_times.evening_enabled ? 
        preferences.optimal_times.evening_time : null,
      quiet_hours_start: preferences.quiet_hours.enabled ? 
        preferences.quiet_hours.start_time : null,
      quiet_hours_end: preferences.quiet_hours.enabled ? 
        preferences.quiet_hours.end_time : null,
      max_daily_notifications: preferences.max_daily_notifications,
      min_interval_minutes: preferences.min_interval_minutes,
      adaptive_learning_enabled: preferences.adaptive_learning,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_scheduling_profiles')
      .upsert(profileUpdate)

    if (error) {
      console.error('Error updating scheduling profile:', error)
    }
  } catch (error) {
    console.error('Error updating scheduling profile:', error)
  }
}

async function initializeAdaptiveLearning(supabase: any, userId: string) {
  try {
    // Create initial learning baseline
    const { error } = await supabase
      .from('adaptive_learning_baselines')
      .upsert({
        user_id: userId,
        initial_preferences: await getUserPreferences(supabase, userId),
        learning_started_at: new Date().toISOString(),
        learning_phase: 'initialization',
        baseline_metrics: {
          total_notifications: 0,
          engagement_rate: 0,
          optimal_time_accuracy: 0,
        },
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error initializing adaptive learning:', error)
    }
  } catch (error) {
    console.error('Error initializing adaptive learning:', error)
  }
}

function getDefaultPreferences() {
  return {
    micro_advice_enabled: true,
    reminders_enabled: true,
    celebrations_enabled: true,
    urgent_enabled: true,
    micro_advice_settings: {
      frequency: 'balanced' as const,
      stress_threshold: 7,
      energy_threshold: 4,
      categories: {
        breathing: true,
        meditation: true,
        movement: true,
        rest: true,
        nutrition: true,
      },
    },
    quiet_hours: {
      enabled: true,
      start_time: '22:00',
      end_time: '08:00',
    },
    optimal_times: {
      morning_enabled: true,
      morning_time: '09:00',
      afternoon_enabled: true,
      afternoon_time: '14:00',
      evening_enabled: true,
      evening_time: '19:00',
    },
    max_daily_notifications: 5,
    min_interval_minutes: 60,
    location_based: {
      enabled: false,
      work_notifications: true,
      home_notifications: true,
      gym_notifications: false,
    },
    adaptive_learning: true,
    emergency_override: true,
    weekend_different_schedule: false,
  }
}
