// =====================================================
// LifeOS Register Push Token Edge Function
// File: supabase/functions/register-push-token/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RegisterTokenRequest {
  token: string;
  platform: 'ios' | 'android';
  user_id?: string;
  device_info?: {
    os: string;
    version: string | number;
    model?: string;
    app_version?: string;
  };
  preferences?: {
    micro_advice: boolean;
    reminders: boolean;
    celebrations: boolean;
    urgent: boolean;
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

    const requestData: RegisterTokenRequest = await req.json()

    console.log(`Registering push token for user: ${user.id}`)

    // Validate request
    if (!requestData.token) {
      throw new Error('Push token is required')
    }

    if (!requestData.platform || !['ios', 'android'].includes(requestData.platform)) {
      throw new Error('Valid platform (ios/android) is required')
    }

    // Check if token already exists for this user
    const { data: existingToken } = await supabaseClient
      .from('user_device_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('token', requestData.token)
      .single()

    if (existingToken) {
      // Update existing token
      const { data: updatedToken, error: updateError } = await supabaseClient
        .from('user_device_tokens')
        .update({
          platform: requestData.platform,
          device_info: requestData.device_info || {},
          is_active: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingToken.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(`Failed to update token: ${updateError.message}`)
      }

      console.log('Token updated successfully')

      // Update notification preferences if provided
      if (requestData.preferences) {
        await updateNotificationPreferences(
          supabaseClient,
          user.id,
          requestData.preferences
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Token updated successfully',
          token_id: updatedToken.id
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Deactivate old tokens for this user and platform
    await supabaseClient
      .from('user_device_tokens')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('platform', requestData.platform)

    // Create new token record
    const { data: newToken, error: insertError } = await supabaseClient
      .from('user_device_tokens')
      .insert({
        user_id: user.id,
        token: requestData.token,
        platform: requestData.platform,
        device_info: requestData.device_info || {},
        is_active: true,
        first_registered_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to register token: ${insertError.message}`)
    }

    console.log('New token registered successfully')

    // Set up default notification preferences if provided
    if (requestData.preferences) {
      await updateNotificationPreferences(
        supabaseClient,
        user.id,
        requestData.preferences
      )
    } else {
      // Set default preferences
      await createDefaultNotificationPreferences(supabaseClient, user.id)
    }

    // Initialize intelligent scheduling profile
    await initializeSchedulingProfile(supabaseClient, user.id)

    // Send welcome notification
    await sendWelcomeNotification(supabaseClient, user.id, requestData.token)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Token registered successfully',
        token_id: newToken.id,
        welcome_notification_sent: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in register-push-token:', error)
    
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

async function updateNotificationPreferences(
  supabase: any,
  userId: string,
  preferences: any
) {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      micro_advice_enabled: preferences.micro_advice ?? true,
      reminders_enabled: preferences.reminders ?? true,
      celebrations_enabled: preferences.celebrations ?? true,
      urgent_enabled: preferences.urgent ?? true,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to update notification preferences:', error)
    throw new Error('Failed to update preferences')
  }
}

async function createDefaultNotificationPreferences(
  supabase: any,
  userId: string
) {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      micro_advice_enabled: true,
      reminders_enabled: true,
      celebrations_enabled: true,
      urgent_enabled: true,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      max_daily_notifications: 5,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to create default preferences:', error)
  }
}

async function initializeSchedulingProfile(
  supabase: any,
  userId: string
) {
  // Create initial scheduling profile for intelligent timing
  const { error } = await supabase
    .from('user_scheduling_profiles')
    .upsert({
      user_id: userId,
      optimal_morning_time: '09:00',
      optimal_afternoon_time: '14:00',
      optimal_evening_time: '19:00',
      timezone: 'UTC',
      active_days: [1, 2, 3, 4, 5], // Monday to Friday
      engagement_pattern: {},
      learning_phase: true,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to initialize scheduling profile:', error)
  }
}

async function sendWelcomeNotification(
  supabase: any,
  userId: string,
  deviceToken: string
) {
  try {
    // Send welcome notification after 30 seconds
    const scheduledTime = new Date(Date.now() + 30 * 1000)

    await supabase
      .from('scheduled_notifications')
      .insert({
        title: 'Benvenuto in LifeOS! 🌟',
        body: 'Le tue notifiche intelligenti sono attive. Inizieremo con consigli personalizzati basati sui tuoi pattern.',
        notification_type: 'celebration',
        priority: 'medium',
        data_payload: {
          type: 'welcome',
          action: 'onboarding_complete'
        },
        target_users: [userId],
        scheduled_time: scheduledTime.toISOString(),
        status: 'scheduled',
        created_by: userId
      })

    console.log('Welcome notification scheduled')
  } catch (error) {
    console.error('Failed to schedule welcome notification:', error)
  }
}
