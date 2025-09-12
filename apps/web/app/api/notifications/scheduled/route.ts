import { NextRequest, NextResponse } from 'next/server';
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
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
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
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
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
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

// Helper functions
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth verification failed:', error);
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error verifying auth token:', error);
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

  // Prepare default data if missing
  const defaultMetrics = recentMetrics?.[0] || getDefaultMetrics();
  const defaultLifeScore = lifeScore || getDefaultLifeScore();
  const defaultPreferences = preferences || getDefaultPreferences();
  const defaultCircadianProfile = circadianProfile || getDefaultCircadianProfile();

  try {
    // Calculate optimal timing using inline intelligent scheduling
    const schedulingResult = calculateOptimalSchedulingTime(
      defaultLifeScore,
      defaultMetrics,
      userProfile || {},
      defaultPreferences,
      defaultCircadianProfile
    );

    // Generate contextual message based on current state
    const contextualMessage = generateContextualMessage(
      params.type || 'micro_advice',
      defaultMetrics,
      defaultLifeScore,
      schedulingResult.reasoning
    );

    const notificationData = {
      id: crypto.randomUUID(),
      user_id: userId,
      scheduled_time: schedulingResult.scheduledTime.toISOString(),
      type: params.type || 'micro_advice',
      message: params.message || contextualMessage,
      priority: determinePriority(defaultMetrics, defaultLifeScore) as 'low' | 'normal' | 'high' | 'emergency',
      status: 'scheduled' as const,
      confidence_score: schedulingResult.confidence,
      delivery_context: {
        reasoning: schedulingResult.reasoning,
        optimal_window: schedulingResult.optimalWindow,
        user_state: schedulingResult.userState
      },
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
      created_at: savedNotification.created_at,
      delivery_context: savedNotification.delivery_context
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

function calculateOptimalSchedulingTime(
  lifeScore: any,
  metrics: any,
  userProfile: any,
  preferences: any,
  circadianProfile: any
): {
  scheduledTime: Date;
  confidence: number;
  reasoning: string;
  optimalWindow: any;
  userState: string;
} {
  const now = new Date();
  const currentHour = now.getHours();

  // Determine current user state
  const userState = determineCurrentUserState(metrics, lifeScore);
  
  // Check quiet hours
  const quietStart = parseTime(preferences.quiet_hours?.start_time || '22:00');
  const quietEnd = parseTime(preferences.quiet_hours?.end_time || '07:00');
  
  if (isInQuietHours(currentHour, quietStart, quietEnd)) {
    // Schedule for after quiet hours
    const nextActiveHour = (quietEnd + 1) % 24;
    const scheduledTime = getNextOccurrenceOfHour(nextActiveHour);
    
    return {
      scheduledTime,
      confidence: 0.8,
      reasoning: 'Scheduled after quiet hours for better receptivity',
      optimalWindow: null,
      userState
    };
  }

  // Find optimal intervention window
  const optimalWindow = findOptimalInterventionWindow(circadianProfile, userState);
  
  if (optimalWindow) {
    // Schedule within the optimal window
    const windowStart = optimalWindow.start_hour;
    const windowEnd = optimalWindow.end_hour;
    
    let targetHour: number;
    
    if (currentHour >= windowStart && currentHour <= windowEnd) {
      // We're currently in the window, schedule soon
      targetHour = currentHour;
    } else if (currentHour < windowStart) {
      // Schedule for window start today
      targetHour = windowStart;
    } else {
      // Schedule for window start tomorrow
      targetHour = windowStart;
    }
    
    const scheduledTime = getNextOccurrenceOfHour(targetHour);
    
    return {
      scheduledTime,
      confidence: optimalWindow.effectiveness_score,
      reasoning: `Scheduled during optimal ${optimalWindow.intervention_type} window`,
      optimalWindow,
      userState
    };
  }

  // Fallback: schedule based on energy levels and avoid stress peaks
  const peakEnergyHours = circadianProfile?.peak_energy_hours || [9, 10, 11, 15, 16];
  const stressPeakHours = circadianProfile?.stress_peak_hours || [11, 17];
  
  // Find next peak energy hour that's not a stress peak - FIX TYPESCRIPT
  const goodHours = peakEnergyHours.filter((h: number) => !stressPeakHours.includes(h));
  
  let targetHour = currentHour + 1;
  if (goodHours.length > 0) {
    const nextGoodHour = goodHours.find((h: number) => h > currentHour) || goodHours[0];
    targetHour = nextGoodHour;
  }

  const scheduledTime = getNextOccurrenceOfHour(targetHour);
  
  return {
    scheduledTime,
    confidence: 0.6,
    reasoning: 'Scheduled during high energy, low stress period',
    optimalWindow: null,
    userState
  };
}

function determineCurrentUserState(metrics: any, lifeScore: any): string {
  const stress = metrics.stress || 3;
  const energy = metrics.energy || 5;
  const mood = metrics.mood || 5;
  
  if (stress >= 7) return 'high_stress';
  if (energy <= 3) return 'low_energy';
  if (mood >= 8 && energy >= 7) return 'motivated';
  if (stress <= 2 && energy >= 6) return 'balanced';
  
  return 'neutral';
}

function findOptimalInterventionWindow(circadianProfile: any, userState: string): any {
  if (!circadianProfile?.optimal_intervention_windows) return null;
  
  const currentHour = new Date().getHours();
  
  // Filter windows based on user state
  let relevantWindows = circadianProfile.optimal_intervention_windows;
  
  switch (userState) {
    case 'high_stress':
      relevantWindows = relevantWindows.filter((w: any) => w.intervention_type === 'stress_relief');
      break;
    case 'low_energy':
      relevantWindows = relevantWindows.filter((w: any) => w.intervention_type === 'energy_boost');
      break;
    case 'motivated':
      relevantWindows = relevantWindows.filter((w: any) => w.intervention_type === 'celebration');
      break;
    default:
      relevantWindows = relevantWindows.filter((w: any) => w.intervention_type === 'mindfulness');
  }
  
  // Find the best window (highest effectiveness score)
  return relevantWindows.sort((a: any, b: any) => b.effectiveness_score - a.effectiveness_score)[0] || null;
}

function generateContextualMessage(type: string, metrics: any, lifeScore: any, reasoning: string): string {
  const userState = determineCurrentUserState(metrics, lifeScore);
  
  const messages = {
    micro_advice: {
      high_stress: 'Momento perfetto per una pausa rilassante. Che ne dici di 5 minuti di respirazione?',
      low_energy: 'Ti serve una piccola spinta? Prova una breve camminata o un po\' di stretching.',
      motivated: 'Grande energia oggi! Approfitta di questo momento per tackle un progetto importante.',
      balanced: 'Stai andando bene! Continua così e considera un momento di mindfulness.',
      neutral: 'Ciao! Ecco un piccolo suggerimento per migliorare la tua giornata.'
    },
    stress_relief: {
      high_stress: 'Rilassati, respira profondamente. Questo momento passerà.',
      low_energy: 'Un momento di calma può aiutarti a ricaricare le energie.',
      motivated: 'Anche quando siamo energici, un momento di pace fa bene.',
      balanced: 'Mantieni questo equilibrio con una breve sessione di rilassamento.',
      neutral: 'Prenditi un momento per te stesso.'
    },
    energy_boost: {
      high_stress: 'Una piccola attività fisica può aiutare a scaricare la tensione.',
      low_energy: 'Ora è il momento perfetto per risvegliare corpo e mente!',
      motivated: 'Cavalca questa onda di energia con un po\' di movimento!',
      balanced: 'Un piccolo boost di energia per mantenere il ritmo.',
      neutral: 'Che ne dici di muoverti un po\'?'
    }
  };
  
  // Safe type casting and access
  const messageCategory = messages[type as keyof typeof messages] || messages.micro_advice;
  const stateKey = userState as keyof typeof messageCategory;
  
  return messageCategory[stateKey] || messages.micro_advice.neutral;
}

function determinePriority(metrics: any, lifeScore: any): string {
  const stress = metrics.stress || 3;
  const energy = metrics.energy || 5;
  const overallScore = lifeScore?.score || 65;
  
  if (stress >= 8 || overallScore < 30) return 'emergency';
  if (stress >= 6 || overallScore < 50) return 'high';
  if (energy <= 2 || overallScore < 60) return 'normal';
  
  return 'low';
}

function parseTime(timeStr: string): number {
  const [hours] = timeStr.split(':').map(Number);
  return hours;
}

function isInQuietHours(currentHour: number, quietStart: number, quietEnd: number): boolean {
  if (quietStart < quietEnd) {
    return currentHour >= quietStart && currentHour <= quietEnd;
  } else {
    // Quiet hours span midnight
    return currentHour >= quietStart || currentHour <= quietEnd;
  }
}

function getNextOccurrenceOfHour(targetHour: number): Date {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, 0, 0, 0);
  
  // If target hour has passed today, schedule for tomorrow
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  return target;
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