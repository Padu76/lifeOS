// =====================================================
// LifeOS Push Notification Edge Function
// File: supabase/functions/send-push-notification/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PushNotificationRequest {
  user_id?: string;
  notification_type: 'micro_advice' | 'reminder' | 'celebration' | 'check_in' | 'urgent';
  title: string;
  body: string;
  data?: Record<string, any>;
  scheduled_time?: string;
  priority?: 'low' | 'medium' | 'high';
  target_users?: string[];
}

interface FCMMessage {
  token?: string;
  tokens?: string[];
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  android?: {
    priority: 'normal' | 'high';
    notification: {
      channel_id: string;
      priority: 'default' | 'high' | 'low';
      sound: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        alert: {
          title: string;
          body: string;
        };
        sound: string;
        badge?: number;
      };
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

    const requestData: PushNotificationRequest = await req.json()

    console.log(`Processing push notification request:`, requestData)

    // Validate request
    if (!requestData.title || !requestData.body) {
      throw new Error('Title and body are required')
    }

    let targetUsers: string[] = []
    
    if (requestData.user_id) {
      targetUsers = [requestData.user_id]
    } else if (requestData.target_users) {
      targetUsers = requestData.target_users
    } else {
      // Send to current user by default
      targetUsers = [user.id]
    }

    // Get FCM tokens for target users
    const { data: deviceTokens, error: tokensError } = await supabaseClient
      .from('user_device_tokens')
      .select('*')
      .in('user_id', targetUsers)
      .eq('is_active', true)

    if (tokensError) {
      throw new Error(`Failed to get device tokens: ${tokensError.message}`)
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No active device tokens found for target users' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Found ${deviceTokens.length} device tokens`)

    // Check if notification should be scheduled
    if (requestData.scheduled_time) {
      const scheduledTime = new Date(requestData.scheduled_time)
      const now = new Date()
      
      if (scheduledTime > now) {
        // Schedule notification for later
        const result = await scheduleNotification(
          supabaseClient,
          requestData,
          targetUsers,
          scheduledTime
        )
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Notification scheduled successfully',
            scheduled_id: result.id,
            scheduled_time: scheduledTime.toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // Send immediate notification
    const results = await sendImmediateNotifications(
      deviceTokens,
      requestData
    )

    // Log notification event
    await logNotificationEvent(
      supabaseClient,
      user.id,
      requestData,
      results
    )

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Notifications sent: ${successCount} successful, ${failureCount} failed`,
        results: results.map(r => ({
          success: r.success,
          error: r.error
        }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in send-push-notification:', error)
    
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

async function sendImmediateNotifications(
  deviceTokens: any[],
  notificationData: PushNotificationRequest
) {
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')
  if (!fcmServerKey) {
    throw new Error('FCM_SERVER_KEY not configured')
  }

  const results = []

  for (const deviceToken of deviceTokens) {
    try {
      const message = buildFCMMessage(deviceToken.token, notificationData)
      const result = await sendFCMMessage(message, fcmServerKey)
      
      results.push({
        user_id: deviceToken.user_id,
        token: deviceToken.token,
        success: true,
        message_id: result.name
      })
      
    } catch (error) {
      console.error(`Failed to send to token ${deviceToken.token}:`, error)
      
      results.push({
        user_id: deviceToken.user_id,
        token: deviceToken.token,
        success: false,
        error: error.message
      })
    }
  }

  return results
}

function buildFCMMessage(
  token: string,
  notificationData: PushNotificationRequest
): FCMMessage {
  const priority = notificationData.priority || 'medium'
  const androidPriority = priority === 'high' ? 'high' : 'normal'
  const channelId = getChannelId(notificationData.notification_type)

  // Convert data to string values (FCM requirement)
  const dataPayload: Record<string, string> = {}
  if (notificationData.data) {
    Object.keys(notificationData.data).forEach(key => {
      dataPayload[key] = String(notificationData.data![key])
    })
  }

  // Add notification metadata
  dataPayload.type = notificationData.notification_type
  dataPayload.priority = priority
  dataPayload.timestamp = new Date().toISOString()

  return {
    token,
    notification: {
      title: notificationData.title,
      body: notificationData.body
    },
    data: dataPayload,
    android: {
      priority: androidPriority,
      notification: {
        channel_id: channelId,
        priority: priority === 'high' ? 'high' : 'default',
        sound: getNotificationSound(notificationData.notification_type)
      }
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: notificationData.title,
            body: notificationData.body
          },
          sound: getNotificationSound(notificationData.notification_type),
          badge: 1
        }
      }
    }
  }
}

async function sendFCMMessage(message: FCMMessage, serverKey: string) {
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${serverKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`FCM request failed: ${response.status} ${errorText}`)
  }

  return await response.json()
}

function getChannelId(notificationType: string): string {
  switch (notificationType) {
    case 'micro_advice':
      return 'micro_advice'
    case 'reminder':
      return 'reminders'
    case 'celebration':
      return 'celebrations'
    case 'urgent':
      return 'urgent'
    default:
      return 'micro_advice'
  }
}

function getNotificationSound(notificationType: string): string {
  switch (notificationType) {
    case 'celebration':
      return 'celebration'
    case 'urgent':
      return 'urgent'
    default:
      return 'default'
  }
}

async function scheduleNotification(
  supabase: any,
  notificationData: PushNotificationRequest,
  targetUsers: string[],
  scheduledTime: Date
) {
  const { data, error } = await supabase
    .from('scheduled_notifications')
    .insert({
      title: notificationData.title,
      body: notificationData.body,
      notification_type: notificationData.notification_type,
      priority: notificationData.priority || 'medium',
      data_payload: notificationData.data || {},
      target_users: targetUsers,
      scheduled_time: scheduledTime.toISOString(),
      status: 'scheduled',
      created_by: targetUsers[0] // Use first user as creator
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to schedule notification: ${error.message}`)
  }

  return data
}

async function logNotificationEvent(
  supabase: any,
  userId: string,
  notificationData: PushNotificationRequest,
  results: any[]
) {
  const successCount = results.filter(r => r.success).length
  const failureCount = results.length - successCount

  const { error } = await supabase
    .from('notification_logs')
    .insert({
      user_id: userId,
      notification_type: notificationData.notification_type,
      title: notificationData.title,
      body: notificationData.body,
      target_count: results.length,
      success_count: successCount,
      failure_count: failureCount,
      priority: notificationData.priority || 'medium',
      sent_at: new Date().toISOString(),
      results: results
    })

  if (error) {
    console.error('Failed to log notification event:', error)
  }
}
