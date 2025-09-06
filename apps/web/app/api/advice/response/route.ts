import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Validate required fields
    const { session_id, response } = body;
    if (!session_id || !response) {
      return NextResponse.json(
        { 
          error: 'Invalid request', 
          message: 'session_id and response are required'
        },
        { status: 400 }
      );
    }

    // Validate response action
    const validActions = ['completed', 'dismissed', 'snoozed'];
    if (!validActions.includes(response.action)) {
      return NextResponse.json(
        { 
          error: 'Invalid action', 
          message: `Action must be one of: ${validActions.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Process the response
    const result = await processAdviceResponse(supabase, userId, session_id, response);

    return NextResponse.json({
      success: true,
      action_processed: response.action,
      session_id,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in advice response API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process advice response',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Process advice response and update relevant data
async function processAdviceResponse(
  supabase: any,
  userId: string,
  sessionId: string,
  response: any
) {
  const today = new Date().toISOString().split('T')[0];
  let result: any = {
    celebration: null,
    streak_update: [],
    pattern_learning_updated: true
  };

  try {
    // Record the response in advice_sessions table
    await recordAdviceSession(supabase, userId, sessionId, response);

    // Handle completion
    if (response.action === 'completed') {
      // Update daily completions
      const completionUpdate = await updateDailyCompletions(supabase, userId, today);
      
      // Update streaks
      const streakUpdate = await updateUserStreaks(supabase, userId);
      result.streak_update = streakUpdate;

      // Check for celebration (simple milestone logic)
      const celebration = await checkForCelebration(supabase, userId, completionUpdate);
      result.celebration = celebration;
    }

    // Handle dismissal pattern tracking
    if (response.action === 'dismissed') {
      await trackDismissalPattern(supabase, userId);
    }

    return result;

  } catch (error) {
    console.error('Error processing advice response:', error);
    return result;
  }
}

// Record advice session
async function recordAdviceSession(
  supabase: any,
  userId: string,
  sessionId: string,
  response: any
) {
  try {
    // First, try to update existing session
    const { error: updateError } = await supabase
      .from('advice_sessions')
      .update({
        user_response: response,
        completed_at: response.action === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userId);

    // If session doesn't exist, create a new one
    if (updateError) {
      await supabase
        .from('advice_sessions')
        .insert({
          id: sessionId,
          user_id: userId,
          user_response: response,
          completed_at: response.action === 'completed' ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error recording advice session:', error);
  }
}

// Update daily completions
async function updateDailyCompletions(supabase: any, userId: string, date: string) {
  try {
    // Get existing completion record for today
    const { data: existing } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const { data: updated } = await supabase
        .from('daily_completions')
        .update({
          completed_count: existing.completed_count + 1,
          last_completion_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      return updated;
    } else {
      // Create new record
      const { data: created } = await supabase
        .from('daily_completions')
        .insert({
          user_id: userId,
          date: date,
          completed_count: 1,
          last_completion_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      return created;
    }
  } catch (error) {
    console.error('Error updating daily completions:', error);
    return null;
  }
}

// Update user streaks
async function updateUserStreaks(supabase: any, userId: string) {
  try {
    // Get recent completion data
    const { data: completions } = await supabase
      .from('daily_completions')
      .select('date, completed_count')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (!completions || completions.length === 0) return [];

    // Calculate current streak
    let currentStreak = 0;
    let maxStreak = 0;
    const today = new Date();
    
    // Simple streak calculation
    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (completionDate.toDateString() === expectedDate.toDateString()) {
        currentStreak = i + 1;
      } else {
        break;
      }
    }

    // Calculate max streak
    maxStreak = Math.max(currentStreak, ...completions.map((_: any, i: number) => i + 1));

    // Update streak record
    const streakData = {
      user_id: userId,
      streak_type: 'daily_completions',
      current_count: currentStreak,
      best_count: Math.max(maxStreak, currentStreak),
      last_activity_date: today.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };

    const { data: updatedStreak } = await supabase
      .from('user_streaks')
      .upsert(streakData, { onConflict: 'user_id,streak_type' })
      .select()
      .single();

    return [updatedStreak];

  } catch (error) {
    console.error('Error updating user streaks:', error);
    return [];
  }
}

// Check for celebration moments
async function checkForCelebration(supabase: any, userId: string, completionData: any) {
  try {
    if (!completionData) return null;

    const milestones = [1, 3, 5, 7, 10, 14, 21, 30, 50, 100];
    const completedCount = completionData.completed_count;

    // Check if we hit a milestone
    if (milestones.includes(completedCount)) {
      return {
        type: 'milestone',
        message: `Fantastico! Hai completato ${completedCount} consigli!`,
        milestone: completedCount,
        celebration_level: completedCount >= 30 ? 'major' : completedCount >= 7 ? 'medium' : 'minor'
      };
    }

    // Check for streak milestones
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_count')
      .eq('user_id', userId)
      .eq('streak_type', 'daily_completions')
      .maybeSingle();

    if (streak && milestones.includes(streak.current_count)) {
      return {
        type: 'streak',
        message: `Incredibile! ${streak.current_count} giorni di fila!`,
        streak_days: streak.current_count,
        celebration_level: 'major'
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking for celebration:', error);
    return null;
  }
}

// Track dismissal patterns for burnout prevention
async function trackDismissalPattern(supabase: any, userId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Count recent dismissals
    const { data: recentSessions } = await supabase
      .from('advice_sessions')
      .select('user_response')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString());

    if (!recentSessions) return;

    const dismissals = recentSessions.filter(
      session => session.user_response?.action === 'dismissed'
    );

    const dismissalRate = dismissals.length / recentSessions.length;

    // Flag high dismissal rate
    if (dismissalRate > 0.6 && dismissals.length >= 3) {
      await supabase
        .from('user_wellness_flags')
        .upsert({
          user_id: userId,
          flag_type: 'high_dismissal_rate',
          flag_value: dismissalRate,
          metadata: {
            recent_dismissals: dismissals.length,
            total_sessions: recentSessions.length
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,flag_type'
        });
    }
  } catch (error) {
    console.error('Error tracking dismissal pattern:', error);
  }
}
