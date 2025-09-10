import { NextRequest, NextResponse } from 'next/server';
import { IntelligentPushSystem } from '@lifeos/core/advice/intelligentPushSystem';
import { IntelligentTimingSystem } from '@lifeos/core/advice/intelligentTimingSystem';
import { createClient } from '@supabase/supabase-js';

interface ScheduledNotificationResponse {
  id: string;
  scheduled_time: string;
  type: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  status: 'scheduled' | 'delivered' | 'failed' | 'cancelled';
  user_action?: 'opened' | 'dismissed' | 'completed' | 'snoozed';
  delivery_context?: any;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const timeframe = url.searchParams.get('timeframe') || 'upcoming'; // 'upcoming', 'past', 'all'

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_time', { ascending: true })
      .limit(limit);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Apply timeframe filter
    const now = new Date();
    if (timeframe === 'upcoming') {
      query = query.gte('scheduled_time', now.toISOString());
    } else if (timeframe === 'past') {
      query = query.lt('scheduled_time', now.toISOString());
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching scheduled notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    const response: ScheduledNotificationResponse[] = notifications.map(notif => ({
      id: notif.id,
      scheduled_time: notif.scheduled_time,
      type: notif.type,
      message: notif.message,
      priority: notif.priority,
      status: notif.status,
      user_action: notif.user_action,
      delivery_context: notif.delivery_context,
      created_at: notif.created_at
    }));

    return NextResponse.json({
      success: true,
      data: response,
      meta: {
        total: notifications.length,
        timeframe,
        status: status || 'all'
      }
    });

  } catch (error) {
    console.error('Error in scheduled notifications API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, notification_id, schedule_new } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (action === 'cancel' && notification_id) {
      // Cancel a scheduled notification
      const { error } = await supabase
        .from('scheduled_notifications')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', notification_id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error cancelling notification:', error);
        return NextResponse.json({ error: 'Failed to cancel notification' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Notification cancelled successfully'
      });

    } else if (action === 'reschedule' && notification_id) {
      const { new_time } = body;
      
      if (!new_time) {
        return NextResponse.json({ error: 'New time required for reschedule' }, { status: 400 });
      }

      const { error } = await supabase
        .from('scheduled_notifications')
        .update({ 
          scheduled_time: new_time,
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', notification_id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error rescheduling notification:', error);
        return NextResponse.json({ error: 'Failed to reschedule notification' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Notification rescheduled successfully'
      });

    } else if (schedule_new) {
      // Schedule new notification using intelligent system
      const newNotification = await scheduleIntelligentNotification(userId, schedule_new);
      
      return NextResponse.json({
        success: true,
        data: newNotification,
        message: 'New notification scheduled successfully'
      });

    } else {
      return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in scheduled notifications POST:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notification_id, user_action, feedback } = body;

    if (!notification_id || !user_action) {
      return NextResponse.json({ error: 'Notification ID and user action required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update notification with user action
    const { error: updateError } = await supabase
      .from('scheduled_notifications')
      .update({ 
        user_action,
        status: user_action === 'completed' ? 'delivered' : 'delivered',
        user_feedback: feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', notification_id)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating notification:', updateError);
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }

    // Record interaction for learning
    await supabase
      .from('notification_interactions')
      .insert({
        user_id: userId,
        notification_id,
        action: user_action,
        feedback,
        timestamp: new Date().toISOString()
      });

    // Handle specific actions
    if (user_action === 'snoozed') {
      const { snooze_minutes = 60 } = body;
      await handleNotificationSnooze(userId, notification_id, snooze_minutes);
    }

    return NextResponse.json({
      success: true,
      message: `Notification marked as ${user_action}`
    });

  } catch (error) {
    console.error('Error in scheduled notifications PATCH:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Helper functions
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    // Implement your JWT verification here
    return 'user_123'; // Mock for development
  } catch (error) {
    return null;
  }
}

async function scheduleIntelligentNotification(userId: string, params: any): Promise<ScheduledNotificationResponse> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user data for intelligent scheduling
  const [
    { data: recentMetrics },
    { data: lifeScore },
    { data: userProfile },
    { data: circadianProfile },
    { data: preferences }
  ] = await Promise.all([
    supabase.from('health_metrics').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(7),
    supabase.from('life_scores').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).single(),
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('circadian_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('notification_preferences').select('*').eq('user_id', userId).single()
  ]);

  // Initialize intelligent systems
  const pushSystem = new IntelligentPushSystem();

  // Prepare default data if missing
  const defaultMetrics = recentMetrics?.[0] || getDefaultMetrics();
  const defaultLifeScore = lifeScore || getDefaultLifeScore();
  const defaultPreferences = preferences || getDefaultPreferences();
  const defaultCircadianProfile = circadianProfile || getDefaultCircadianProfile();

  try {
    // Schedule using intelligent system
    const result = await pushSystem.scheduleAdviceNotification(
      userId,
      defaultLifeScore,
      defaultMetrics,
      userProfile || {},
      defaultPreferences,
      defaultCircadianProfile
    );

    // Get the generated notification details from system
    const notificationData = {
      id: result.notificationId,
      user_id: userId,
      scheduled_time: result.scheduledTime.toISOString(),
      type: params.type || 'micro_advice',
      message: params.message || 'Notifica intelligente programmata',
      priority: 'normal' as const,
      status: 'scheduled' as const,
      confidence_score: result.confidence,
      created_at: new Date().toISOString()
    };

    // Save to database
    const { data: savedNotification, error } = await supabase
      .from('scheduled_notifications')
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      id: savedNotification.id,
      scheduled_time: savedNotification.scheduled_time,
      type: savedNotification.type,
      message: savedNotification.message,
      priority: savedNotification.priority,
      status: savedNotification.status,
      created_at: savedNotification.created_at
    };

  } catch (error) {
    console.error('Error in intelligent scheduling:', error);
    
    // Fallback to simple scheduling
    const fallbackTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    const fallbackData = {
      id: crypto.randomUUID(),
      user_id: userId,
      scheduled_time: fallbackTime.toISOString(),
      type: params.type || 'reminder',
      message: params.message || 'Promemoria programmato',
      priority: 'normal' as const,
      status: 'scheduled' as const,
      created_at: new Date().toISOString()
    };

    const { data: savedNotification } = await supabase
      .from('scheduled_notifications')
      .insert(fallbackData)
      .select()
      .single();

    return {
      id: savedNotification.id,
      scheduled_time: savedNotification.scheduled_time,
      type: savedNotification.type,
      message: savedNotification.message,
      priority: savedNotification.priority,
      status: savedNotification.status,
      created_at: savedNotification.created_at
    };
  }
}

async function handleNotificationSnooze(userId: string, notificationId: string, snoozeMinutes: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get original notification
  const { data: originalNotification } = await supabase
    .from('scheduled_notifications')
    .select('*')
    .eq('id', notificationId)
    .single();

  if (!originalNotification) return;

  // Create snoozed version
  const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000);
  
  await supabase
    .from('scheduled_notifications')
    .insert({
      user_id: userId,
      scheduled_time: snoozeTime.toISOString(),
      type: originalNotification.type,
      message: originalNotification.message,
      priority: originalNotification.priority,
      status: 'scheduled',
      parent_notification_id: notificationId,
      created_at: new Date().toISOString()
    });
}

function getDefaultMetrics() {
  return {
    mood: 5,
    stress: 3,
    energy: 5,
    sleep_hours: 7,
    steps: 5000
  };
}

function getDefaultLifeScore() {
  return {
    score: 65,
    breakdown: {
      sleep_score: 70,
      activity_score: 60,
      mental_score: 65
    }
  };
}

function getDefaultPreferences() {
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

function getDefaultCircadianProfile() {
  return {
    chronotype: 'intermediate',
    natural_wake_time: '07:00',
    natural_sleep_time: '23:00',
    peak_energy_hours: [9, 10, 11, 15, 16],
    low_energy_hours: [13, 14, 20, 21],
    stress_peak_hours: [11, 17],
    optimal_intervention_windows: [
      {
        start_hour: 9,
        end_hour: 11,
        effectiveness_score: 0.7,
        intervention_type: 'mindfulness',
        frequency_limit: 1
      }
    ]
  };
}
