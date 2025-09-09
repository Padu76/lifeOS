// =====================================================
// LifeOS Intelligent Notification Scheduling System
// File: supabase/functions/schedule-intelligent-notifications/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SchedulingRequest {
  user_id?: string;
  notification_type: 'micro_advice' | 'reminder' | 'celebration' | 'check_in';
  content: {
    title: string;
    body: string;
    data?: Record<string, any>;
  };
  priority?: 'low' | 'medium' | 'high';
  context?: {
    stress_level?: number;
    energy_level?: number;
    current_activity?: string;
    location_context?: string;
  };
  force_immediate?: boolean;
}

interface UserPattern {
  user_id: string;
  engagement_scores: {
    morning: number;    // 6-12
    afternoon: number;  // 12-18
    evening: number;    // 18-22
  };
  optimal_times: {
    morning: string;    // HH:mm
    afternoon: string;  // HH:mm
    evening: string;    // HH:mm
  };
  response_patterns: {
    weekday_engagement: number;
    weekend_engagement: number;
    stress_response_timing: number;
  };
  quiet_hours: {
    start: string;      // HH:mm
    end: string;        // HH:mm
  };
  timezone: string;
  last_updated: string;
}

interface SchedulingDecision {
  should_send: boolean;
  optimal_time: Date;
  confidence_score: number;
  reasoning: string;
  fallback_times?: Date[];
  delay_reason?: string;
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

    const requestData: SchedulingRequest = await req.json()

    console.log(`Processing intelligent scheduling for user: ${user.id}`)

    // Validate request
    if (!requestData.content?.title || !requestData.content?.body) {
      throw new Error('Notification content is required')
    }

    const targetUserId = requestData.user_id || user.id

    // Load user patterns and preferences
    const userPattern = await loadUserPattern(supabaseClient, targetUserId)
    const userPreferences = await loadUserPreferences(supabaseClient, targetUserId)
    
    // Check if notifications are enabled for this type
    if (!isNotificationTypeEnabled(userPreferences, requestData.notification_type)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Notifications disabled for type: ${requestData.notification_type}`,
          scheduled: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Make scheduling decision
    const schedulingDecision = await makeSchedulingDecision(
      userPattern,
      userPreferences,
      requestData
    )

    if (!schedulingDecision.should_send && !requestData.force_immediate) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Notification not optimal for current timing',
          reasoning: schedulingDecision.reasoning,
          suggested_time: schedulingDecision.optimal_time?.toISOString(),
          scheduled: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    let scheduledTime = schedulingDecision.optimal_time
    let scheduled = false

    // Immediate send if optimal time is now or force immediate
    if (requestData.force_immediate || 
        (scheduledTime && Math.abs(scheduledTime.getTime() - Date.now()) < 5 * 60 * 1000)) {
      
      // Send immediately
      const sendResult = await sendImmediateNotification(
        supabaseClient,
        targetUserId,
        requestData
      )

      return new Response(
        JSON.stringify({ 
          success: sendResult.success,
          message: sendResult.success ? 'Notification sent immediately' : 'Failed to send notification',
          sent_immediately: sendResult.success,
          notification_id: sendResult.notification_id,
          confidence_score: schedulingDecision.confidence_score,
          reasoning: schedulingDecision.reasoning
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: sendResult.success ? 200 : 500 
        }
      )
    } else {
      // Schedule for later
      const scheduleResult = await scheduleForOptimalTime(
        supabaseClient,
        targetUserId,
        requestData,
        scheduledTime
      )

      scheduled = scheduleResult.success

      // Update user pattern with scheduling decision
      await updateUserPatternLearning(
        supabaseClient,
        targetUserId,
        requestData,
        schedulingDecision
      )

      return new Response(
        JSON.stringify({ 
          success: scheduleResult.success,
          message: scheduleResult.success ? 'Notification scheduled successfully' : 'Failed to schedule notification',
          scheduled: scheduled,
          scheduled_time: scheduledTime?.toISOString(),
          scheduled_id: scheduleResult.scheduled_id,
          confidence_score: schedulingDecision.confidence_score,
          reasoning: schedulingDecision.reasoning,
          fallback_times: schedulingDecision.fallback_times?.map(t => t.toISOString())
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: scheduleResult.success ? 200 : 500 
        }
      )
    }

  } catch (error) {
    console.error('Error in schedule-intelligent-notifications:', error)
    
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

async function loadUserPattern(supabase: any, userId: string): Promise<UserPattern> {
  const { data: profile } = await supabase
    .from('user_scheduling_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile) {
    // Return default pattern for new users
    return {
      user_id: userId,
      engagement_scores: {
        morning: 0.7,
        afternoon: 0.8,
        evening: 0.6
      },
      optimal_times: {
        morning: '09:00',
        afternoon: '14:00',
        evening: '19:00'
      },
      response_patterns: {
        weekday_engagement: 0.8,
        weekend_engagement: 0.6,
        stress_response_timing: 0.7
      },
      quiet_hours: {
        start: '22:00',
        end: '08:00'
      },
      timezone: 'UTC',
      last_updated: new Date().toISOString()
    }
  }

  return {
    user_id: userId,
    engagement_scores: profile.engagement_scores || {
      morning: 0.7,
      afternoon: 0.8,
      evening: 0.6
    },
    optimal_times: profile.optimal_times || {
      morning: '09:00',
      afternoon: '14:00',
      evening: '19:00'
    },
    response_patterns: profile.response_patterns || {
      weekday_engagement: 0.8,
      weekend_engagement: 0.6,
      stress_response_timing: 0.7
    },
    quiet_hours: {
      start: profile.quiet_hours_start || '22:00',
      end: profile.quiet_hours_end || '08:00'
    },
    timezone: profile.timezone || 'UTC',
    last_updated: profile.updated_at || new Date().toISOString()
  }
}

async function loadUserPreferences(supabase: any, userId: string) {
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  return preferences || {
    micro_advice_enabled: true,
    reminders_enabled: true,
    celebrations_enabled: true,
    urgent_enabled: true,
    max_daily_notifications: 5
  }
}

function isNotificationTypeEnabled(preferences: any, notificationType: string): boolean {
  switch (notificationType) {
    case 'micro_advice':
      return preferences.micro_advice_enabled !== false
    case 'reminder':
      return preferences.reminders_enabled !== false
    case 'celebration':
      return preferences.celebrations_enabled !== false
    case 'check_in':
      return preferences.reminders_enabled !== false
    default:
      return true
  }
}

async function makeSchedulingDecision(
  userPattern: UserPattern,
  userPreferences: any,
  request: SchedulingRequest
): Promise<SchedulingDecision> {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
  
  // Check quiet hours
  if (isInQuietHours(currentTime, userPattern.quiet_hours)) {
    const nextActiveTime = getNextActiveTime(userPattern.quiet_hours, userPattern.timezone)
    return {
      should_send: false,
      optimal_time: nextActiveTime,
      confidence_score: 0.9,
      reasoning: 'Currently in quiet hours',
      delay_reason: 'quiet_hours'
    }
  }

  // Check daily notification limit
  const todayNotificationCount = await getTodayNotificationCount(userPattern.user_id)
  if (todayNotificationCount >= (userPreferences.max_daily_notifications || 5)) {
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0) // Next day at 9 AM
    
    return {
      should_send: false,
      optimal_time: tomorrow,
      confidence_score: 0.8,
      reasoning: 'Daily notification limit reached',
      delay_reason: 'daily_limit'
    }
  }

  // Determine optimal time based on notification type and user patterns
  const optimalTime = calculateOptimalTime(userPattern, request)
  const confidence = calculateConfidenceScore(userPattern, request, optimalTime)

  // Check if current time is close to optimal
  const timeDifferenceMinutes = Math.abs(optimalTime.getTime() - now.getTime()) / (1000 * 60)
  
  if (timeDifferenceMinutes <= 30 || request.force_immediate) {
    return {
      should_send: true,
      optimal_time: now,
      confidence_score: confidence,
      reasoning: 'Within optimal time window'
    }
  }

  // Schedule for optimal time
  return {
    should_send: false,
    optimal_time: optimalTime,
    confidence_score: confidence,
    reasoning: `Scheduled for optimal engagement time`,
    fallback_times: generateFallbackTimes(optimalTime, userPattern)
  }
}

function isInQuietHours(currentTime: string, quietHours: { start: string; end: string }): boolean {
  const current = timeToMinutes(currentTime)
  const start = timeToMinutes(quietHours.start)
  const end = timeToMinutes(quietHours.end)

  if (start < end) {
    // Same day range (e.g., 14:00 - 18:00)
    return current >= start && current <= end
  } else {
    // Overnight range (e.g., 22:00 - 08:00)
    return current >= start || current <= end
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function getNextActiveTime(quietHours: { start: string; end: string }, timezone: string): Date {
  const now = new Date()
  const endTime = new Date()
  const [endHours, endMinutes] = quietHours.end.split(':').map(Number)
  
  endTime.setHours(endHours, endMinutes, 0, 0)
  
  if (endTime <= now) {
    endTime.setDate(endTime.getDate() + 1)
  }
  
  return endTime
}

async function getTodayNotificationCount(userId: string): Promise<number> {
  // This would query the database for today's notification count
  // For now, return a mock value
  return 2
}

function calculateOptimalTime(userPattern: UserPattern, request: SchedulingRequest): Date {
  const now = new Date()
  const currentHour = now.getHours()
  
  let optimalTimeStr: string
  
  // Choose time period based on current time and notification type
  if (currentHour < 12) {
    optimalTimeStr = userPattern.optimal_times.morning
  } else if (currentHour < 18) {
    optimalTimeStr = userPattern.optimal_times.afternoon
  } else {
    optimalTimeStr = userPattern.optimal_times.evening
  }

  // Handle stress-based timing adjustment
  if (request.context?.stress_level && request.context.stress_level > 7) {
    // For high stress, prefer immediate response
    return now
  }

  // Create optimal time for today or tomorrow
  const [hours, minutes] = optimalTimeStr.split(':').map(Number)
  const optimalTime = new Date()
  optimalTime.setHours(hours, minutes, 0, 0)
  
  if (optimalTime <= now) {
    optimalTime.setDate(optimalTime.getDate() + 1)
  }
  
  return optimalTime
}

function calculateConfidenceScore(
  userPattern: UserPattern,
  request: SchedulingRequest,
  optimalTime: Date
): number {
  let confidence = 0.5 // Base confidence

  // Adjust based on historical engagement
  const hour = optimalTime.getHours()
  if (hour >= 6 && hour < 12) {
    confidence += userPattern.engagement_scores.morning * 0.3
  } else if (hour >= 12 && hour < 18) {
    confidence += userPattern.engagement_scores.afternoon * 0.3
  } else if (hour >= 18 && hour < 22) {
    confidence += userPattern.engagement_scores.evening * 0.3
  }

  // Adjust for weekday vs weekend
  const isWeekend = [0, 6].includes(optimalTime.getDay())
  if (isWeekend) {
    confidence += userPattern.response_patterns.weekend_engagement * 0.2
  } else {
    confidence += userPattern.response_patterns.weekday_engagement * 0.2
  }

  // Adjust for notification priority
  if (request.priority === 'high') {
    confidence += 0.1
  } else if (request.priority === 'low') {
    confidence -= 0.1
  }

  return Math.min(Math.max(confidence, 0), 1)
}

function generateFallbackTimes(optimalTime: Date, userPattern: UserPattern): Date[] {
  const fallbacks: Date[] = []
  
  // Add alternative times at 2-hour intervals
  for (let i = 1; i <= 3; i++) {
    const fallback = new Date(optimalTime)
    fallback.setHours(fallback.getHours() + (i * 2))
    
    // Skip if in quiet hours
    const fallbackTimeStr = `${fallback.getHours().toString().padStart(2, '0')}:${fallback.getMinutes().toString().padStart(2, '0')}`
    if (!isInQuietHours(fallbackTimeStr, userPattern.quiet_hours)) {
      fallbacks.push(fallback)
    }
  }
  
  return fallbacks
}

async function sendImmediateNotification(
  supabase: any,
  userId: string,
  request: SchedulingRequest
) {
  try {
    // Call the send-push-notification function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
      body: JSON.stringify({
        user_id: userId,
        notification_type: request.notification_type,
        title: request.content.title,
        body: request.content.body,
        data: request.content.data,
        priority: request.priority
      })
    })

    const result = await response.json()
    
    return {
      success: result.success,
      notification_id: result.message_id
    }
  } catch (error) {
    console.error('Failed to send immediate notification:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function scheduleForOptimalTime(
  supabase: any,
  userId: string,
  request: SchedulingRequest,
  scheduledTime: Date
) {
  try {
    const { data, error } = await supabase
      .from('scheduled_notifications')
      .insert({
        title: request.content.title,
        body: request.content.body,
        notification_type: request.notification_type,
        priority: request.priority || 'medium',
        data_payload: request.content.data || {},
        target_users: [userId],
        scheduled_time: scheduledTime.toISOString(),
        status: 'scheduled',
        created_by: userId,
        context: request.context || {}
      })
      .select()
      .single()

    return {
      success: !error,
      scheduled_id: data?.id,
      error: error?.message
    }
  } catch (error) {
    console.error('Failed to schedule notification:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

async function updateUserPatternLearning(
  supabase: any,
  userId: string,
  request: SchedulingRequest,
  decision: SchedulingDecision
) {
  // Update learning data for future optimization
  try {
    await supabase
      .from('scheduling_learning_data')
      .insert({
        user_id: userId,
        notification_type: request.notification_type,
        scheduled_time: decision.optimal_time.toISOString(),
        confidence_score: decision.confidence_score,
        context: request.context || {},
        decision_reasoning: decision.reasoning,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to update learning data:', error)
  }
}
