// =====================================================
// LifeOS Edge Function: update-user-preferences
// File: update-user-preferences/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PreferencesUpdateRequest {
  // Notification preferences
  notifications_enabled?: boolean;
  notification_categories?: {
    stress_relief?: boolean;
    energy_boost?: boolean;
    sleep_prep?: boolean;
    celebration?: boolean;
    emergency?: boolean;
  };
  quiet_hours?: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
  max_daily_notifications?: number;
  min_notification_gap_minutes?: number;
  respect_dnd?: boolean;

  // Language and tone
  language_code?: string;
  preferred_tone?: 'gentle' | 'encouraging' | 'casual' | 'formal' | 'adaptive';

  // Intervention settings
  intervention_frequency?: 'minimal' | 'balanced' | 'frequent';
  emergency_interventions_enabled?: boolean;

  // Delivery channels
  push_notifications_enabled?: boolean;
  in_app_only?: boolean;
  email_backup_enabled?: boolean;

  // Gamification preferences
  streaks_enabled?: boolean;
  achievements_enabled?: boolean;
  celebrations_enabled?: boolean;
  progress_sharing_enabled?: boolean;

  // Wellness profile updates
  chronotype?: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level?: 'gentle' | 'moderate' | 'enthusiastic';
  celebration_frequency?: 'minimal' | 'balanced' | 'frequent';
  focus_areas?: string[];
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

    // Get user from auth
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const preferences: PreferencesUpdateRequest = await req.json()

    if (!preferences || Object.keys(preferences).length === 0) {
      throw new Error('No preferences provided for update')
    }

    console.log(`Updating preferences for user: ${user.id}`)

    // Separate preferences by table
    const userPreferencesUpdates: any = {}
    const wellnessProfileUpdates: any = {}

    // Map preference updates to appropriate tables
    mapPreferencesToTables(preferences, userPreferencesUpdates, wellnessProfileUpdates)

    // Update user_preferences table
    if (Object.keys(userPreferencesUpdates).length > 0) {
      userPreferencesUpdates.updated_at = new Date().toISOString()
      
      const { error: preferencesError } = await supabaseClient
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...userPreferencesUpdates
        })

      if (preferencesError) {
        console.error('Failed to update user preferences:', preferencesError)
        throw new Error('Failed to update notification preferences')
      }
    }

    // Update user_wellness_profiles table
    if (Object.keys(wellnessProfileUpdates).length > 0) {
      wellnessProfileUpdates.updated_at = new Date().toISOString()
      
      const { error: profileError } = await supabaseClient
        .from('user_wellness_profiles')
        .upsert({
          user_id: user.id,
          ...wellnessProfileUpdates
        })

      if (profileError) {
        console.error('Failed to update wellness profile:', profileError)
        throw new Error('Failed to update wellness profile')
      }
    }

    // Handle special preference changes that affect other systems
    const systemUpdates = await handleSpecialPreferenceChanges(
      supabaseClient,
      user.id,
      preferences
    )

    // Generate recommendations based on new preferences
    const recommendations = generatePreferenceRecommendations(preferences)

    // Load updated preferences to return
    const updatedPreferences = await loadUserPreferences(supabaseClient, user.id)

    const response = {
      success: true,
      data: {
        updated_preferences: updatedPreferences,
        system_updates: systemUpdates,
        recommendations: recommendations,
        effective_immediately: true,
        message: 'Preferences updated successfully'
      }
    }

    console.log(`Successfully updated preferences for user: ${user.id}`)

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in update-user-preferences:', error)
    
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

function mapPreferencesToTables(
  preferences: PreferencesUpdateRequest,
  userPreferencesUpdates: any,
  wellnessProfileUpdates: any
) {
  // Map to user_preferences table
  if (preferences.notifications_enabled !== undefined) {
    userPreferencesUpdates.notifications_enabled = preferences.notifications_enabled
  }

  if (preferences.notification_categories) {
    userPreferencesUpdates.notification_categories = preferences.notification_categories
  }

  if (preferences.quiet_hours) {
    userPreferencesUpdates.quiet_hours_enabled = preferences.quiet_hours.enabled
    userPreferencesUpdates.quiet_hours_start = preferences.quiet_hours.start_time
    userPreferencesUpdates.quiet_hours_end = preferences.quiet_hours.end_time
  }

  if (preferences.max_daily_notifications !== undefined) {
    userPreferencesUpdates.max_daily_notifications = preferences.max_daily_notifications
  }

  if (preferences.min_notification_gap_minutes !== undefined) {
    userPreferencesUpdates.min_notification_gap_minutes = preferences.min_notification_gap_minutes
  }

  if (preferences.respect_dnd !== undefined) {
    userPreferencesUpdates.respect_dnd = preferences.respect_dnd
  }

  if (preferences.language_code) {
    userPreferencesUpdates.language_code = preferences.language_code
  }

  if (preferences.preferred_tone) {
    userPreferencesUpdates.preferred_tone = preferences.preferred_tone
  }

  if (preferences.intervention_frequency) {
    userPreferencesUpdates.intervention_frequency = preferences.intervention_frequency
  }

  if (preferences.emergency_interventions_enabled !== undefined) {
    userPreferencesUpdates.emergency_interventions_enabled = preferences.emergency_interventions_enabled
  }

  if (preferences.push_notifications_enabled !== undefined) {
    userPreferencesUpdates.push_notifications_enabled = preferences.push_notifications_enabled
  }

  if (preferences.in_app_only !== undefined) {
    userPreferencesUpdates.in_app_only = preferences.in_app_only
  }

  if (preferences.email_backup_enabled !== undefined) {
    userPreferencesUpdates.email_backup_enabled = preferences.email_backup_enabled
  }

  if (preferences.streaks_enabled !== undefined) {
    userPreferencesUpdates.streaks_enabled = preferences.streaks_enabled
  }

  if (preferences.achievements_enabled !== undefined) {
    userPreferencesUpdates.achievements_enabled = preferences.achievements_enabled
  }

  if (preferences.celebrations_enabled !== undefined) {
    userPreferencesUpdates.celebrations_enabled = preferences.celebrations_enabled
  }

  if (preferences.progress_sharing_enabled !== undefined) {
    userPreferencesUpdates.progress_sharing_enabled = preferences.progress_sharing_enabled
  }

  // Map to user_wellness_profiles table
  if (preferences.chronotype) {
    wellnessProfileUpdates.chronotype = preferences.chronotype
  }

  if (preferences.sensitivity_level) {
    wellnessProfileUpdates.sensitivity_level = preferences.sensitivity_level
  }

  if (preferences.celebration_frequency) {
    wellnessProfileUpdates.celebration_frequency = preferences.celebration_frequency
  }

  if (preferences.focus_areas) {
    wellnessProfileUpdates.focus_areas = preferences.focus_areas
  }

  // Update timing preferences based on chronotype
  if (preferences.chronotype) {
    updateTimingPreferences(preferences.chronotype, wellnessProfileUpdates)
  }
}

function updateTimingPreferences(chronotype: string, profileUpdates: any) {
  switch (chronotype) {
    case 'early_bird':
      profileUpdates.natural_wake_time = '06:00'
      profileUpdates.natural_sleep_time = '22:00'
      profileUpdates.peak_energy_hours = [6, 7, 8, 9, 10]
      profileUpdates.low_energy_hours = [13, 14, 20, 21]
      break
    
    case 'night_owl':
      profileUpdates.natural_wake_time = '08:30'
      profileUpdates.natural_sleep_time = '00:00'
      profileUpdates.peak_energy_hours = [10, 11, 15, 16, 19, 20]
      profileUpdates.low_energy_hours = [7, 8, 13, 14]
      break
    
    case 'intermediate':
    default:
      profileUpdates.natural_wake_time = '07:00'
      profileUpdates.natural_sleep_time = '23:00'
      profileUpdates.peak_energy_hours = [9, 10, 11, 15, 16]
      profileUpdates.low_energy_hours = [13, 14, 22, 23]
      break
  }
}

async function handleSpecialPreferenceChanges(
  supabase: any,
  userId: string,
  preferences: PreferencesUpdateRequest
) {
  const systemUpdates: any = {
    notifications_rescheduled: false,
    streaks_updated: false,
    achievements_updated: false
  }

  // Handle notification frequency changes
  if (preferences.intervention_frequency || preferences.max_daily_notifications) {
    // Cancel existing scheduled notifications if frequency reduced
    if (preferences.intervention_frequency === 'minimal') {
      await supabase
        .from('notification_schedules')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'scheduled')
      
      systemUpdates.notifications_rescheduled = true
    }
  }

  // Handle gamification preference changes
  if (preferences.streaks_enabled === false) {
    // Pause active streaks without deleting them
    await supabase
      .from('user_streaks')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    systemUpdates.streaks_updated = true
  } else if (preferences.streaks_enabled === true) {
    // Reactivate streaks
    await supabase
      .from('user_streaks')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
    
    systemUpdates.streaks_updated = true
  }

  if (preferences.celebrations_enabled === false) {
    // Mark pending celebrations as cancelled
    await supabase
      .from('celebration_moments')
      .update({ 
        is_delivered: true, // Mark as delivered to hide them
        delivered_time: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_delivered', false)
    
    systemUpdates.achievements_updated = true
  }

  // Handle quiet hours changes - reschedule notifications if needed
  if (preferences.quiet_hours) {
    // Find notifications scheduled during new quiet hours
    const { data: conflictingNotifications } = await supabase
      .from('notification_schedules')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')

    if (conflictingNotifications && conflictingNotifications.length > 0) {
      for (const notification of conflictingNotifications) {
        const scheduledTime = new Date(notification.scheduled_time)
        const hour = scheduledTime.getHours()
        const minute = scheduledTime.getMinutes()
        const timeValue = hour * 60 + minute

        const [startHour, startMin] = preferences.quiet_hours.start_time.split(':').map(Number)
        const [endHour, endMin] = preferences.quiet_hours.end_time.split(':').map(Number)
        const startValue = startHour * 60 + startMin
        const endValue = endHour * 60 + endMin

        // Check if notification falls within quiet hours
        let inQuietHours = false
        if (startValue > endValue) { // Overnight quiet hours
          inQuietHours = timeValue >= startValue || timeValue <= endValue
        } else {
          inQuietHours = timeValue >= startValue && timeValue <= endValue
        }

        if (inQuietHours) {
          // Reschedule to end of quiet hours
          const newTime = new Date(scheduledTime)
          newTime.setHours(endHour, endMin, 0, 0)
          
          // If the new time is in the past, schedule for next day
          if (newTime <= new Date()) {
            newTime.setDate(newTime.getDate() + 1)
          }

          await supabase
            .from('notification_schedules')
            .update({ 
              scheduled_time: newTime.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', notification.id)
        }
      }
      
      systemUpdates.notifications_rescheduled = true
    }
  }

  return systemUpdates
}

function generatePreferenceRecommendations(preferences: PreferencesUpdateRequest): string[] {
  const recommendations: string[] = []

  // Intervention frequency recommendations
  if (preferences.intervention_frequency === 'frequent') {
    recommendations.push('Con interventi frequenti, assicurati di avere qualche minuto libero durante la giornata per i micro-consigli.')
  } else if (preferences.intervention_frequency === 'minimal') {
    recommendations.push('Modalità minimale attivata. Riceverai solo i consigli più importanti.')
  }

  // Notification recommendations
  if (preferences.notifications_enabled === false) {
    recommendations.push('Notifiche disabilitate. Ricorda di controllare l\'app regolarmente per i tuoi micro-consigli.')
  }

  if (preferences.quiet_hours?.enabled) {
    recommendations.push(`Ore silenziose impostate dalle ${preferences.quiet_hours.start_time} alle ${preferences.quiet_hours.end_time}. I consigli verranno riprogrammati automaticamente.`)
  }

  // Tone recommendations
  if (preferences.preferred_tone === 'gentle') {
    recommendations.push('Tono gentile selezionato. I messaggi saranno più soft e supportivi.')
  } else if (preferences.preferred_tone === 'encouraging') {
    recommendations.push('Tono incoraggiante selezionato. I messaggi saranno più motivanti ed energici.')
  }

  // Gamification recommendations
  if (preferences.streaks_enabled === false) {
    recommendations.push('Streak disabilitati. Puoi riabilitarli in qualsiasi momento per tracciare la tua costanza.')
  }

  if (preferences.achievements_enabled === false) {
    recommendations.push('Achievement disabilitati. Non riceverai notifiche per i traguardi raggiunti.')
  }

  // Chronotype recommendations
  if (preferences.chronotype === 'early_bird') {
    recommendations.push('Profilo mattiniero attivato. I consigli saranno ottimizzati per le tue ore di picco energetico (6-10).')
  } else if (preferences.chronotype === 'night_owl') {
    recommendations.push('Profilo nottambulo attivato. I consigli saranno ottimizzati per i tuoi ritmi serali.')
  }

  // Focus areas recommendations
  if (preferences.focus_areas) {
    const areas = preferences.focus_areas.join(', ')
    recommendations.push(`Aree di focus aggiornate: ${areas}. I consigli saranno personalizzati su questi aspetti.`)
  }

  // Default recommendation if none specific
  if (recommendations.length === 0) {
    recommendations.push('Preferenze aggiornate con successo. Le modifiche sono già attive!')
  }

  return recommendations
}

async function loadUserPreferences(supabase: any, userId: string) {
  // Load current preferences from both tables
  const { data: userPrefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  const { data: wellnessProfile } = await supabase
    .from('user_wellness_profiles')
    .select('chronotype, sensitivity_level, celebration_frequency, focus_areas, natural_wake_time, natural_sleep_time, peak_energy_hours')
    .eq('user_id', userId)
    .single()

  return {
    // Notification preferences
    notifications_enabled: userPrefs?.notifications_enabled ?? true,
    notification_categories: userPrefs?.notification_categories ?? {},
    quiet_hours: {
      enabled: userPrefs?.quiet_hours_enabled ?? true,
      start_time: userPrefs?.quiet_hours_start ?? '22:00',
      end_time: userPrefs?.quiet_hours_end ?? '07:00'
    },
    max_daily_notifications: userPrefs?.max_daily_notifications ?? 5,
    min_notification_gap_minutes: userPrefs?.min_notification_gap_minutes ?? 90,
    respect_dnd: userPrefs?.respect_dnd ?? true,

    // Language and tone
    language_code: userPrefs?.language_code ?? 'it',
    preferred_tone: userPrefs?.preferred_tone ?? 'adaptive',

    // Intervention settings
    intervention_frequency: userPrefs?.intervention_frequency ?? 'balanced',
    emergency_interventions_enabled: userPrefs?.emergency_interventions_enabled ?? true,

    // Delivery channels
    push_notifications_enabled: userPrefs?.push_notifications_enabled ?? true,
    in_app_only: userPrefs?.in_app_only ?? false,
    email_backup_enabled: userPrefs?.email_backup_enabled ?? false,

    // Gamification
    streaks_enabled: userPrefs?.streaks_enabled ?? true,
    achievements_enabled: userPrefs?.achievements_enabled ?? true,
    celebrations_enabled: userPrefs?.celebrations_enabled ?? true,
    progress_sharing_enabled: userPrefs?.progress_sharing_enabled ?? false,

    // Wellness profile
    chronotype: wellnessProfile?.chronotype ?? 'intermediate',
    sensitivity_level: wellnessProfile?.sensitivity_level ?? 'moderate',
    celebration_frequency: wellnessProfile?.celebration_frequency ?? 'balanced',
    focus_areas: wellnessProfile?.focus_areas ?? ['stress_management', 'energy', 'sleep'],
    natural_wake_time: wellnessProfile?.natural_wake_time ?? '07:00',
    natural_sleep_time: wellnessProfile?.natural_sleep_time ?? '23:00',
    peak_energy_hours: wellnessProfile?.peak_energy_hours ?? [9, 10, 11, 15, 16]
  }
}
