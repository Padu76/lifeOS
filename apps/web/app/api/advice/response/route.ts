import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MicroAdviceOrchestrator } from '@lifeos/core/orchestrator/microAdviceOrchestrator';

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
          message: 'session_id and response are required',
          required_fields: {
            session_id: 'string',
            response: {
              action: 'completed | dismissed | snoozed',
              timestamp: 'ISO string (optional)',
              rating: 'number 1-5 (optional)',
              completion_time: 'ISO string (optional)'
            }
          }
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
          message: `Action must be one of: ${validActions.join(', ')}`,
          received: response.action
        },
        { status: 400 }
      );
    }

    // Initialize orchestrator
    const orchestrator = new MicroAdviceOrchestrator();

    // Prepare response object with defaults
    const adviceResponse = {
      action: response.action,
      timestamp: response.timestamp ? new Date(response.timestamp) : new Date(),
      rating: response.rating && response.rating >= 1 && response.rating <= 5 ? response.rating : undefined,
      completion_time: response.completion_time ? new Date(response.completion_time) : undefined
    };

    // Handle the advice response through orchestrator
    const result = await orchestrator.handleAdviceResponse(
      session_id,
      userId,
      adviceResponse
    );

    // Record the response in database for analytics
    await recordAdviceResponse(supabase, session_id, userId, adviceResponse);

    // Update user streaks if completion
    if (response.action === 'completed') {
      await updateUserStreaks(supabase, userId, session_id);
    }

    // Handle dismissal pattern analysis
    if (response.action === 'dismissed') {
      await analyzeDismissalPattern(supabase, userId);
    }

    return NextResponse.json({
      success: true,
      action_processed: response.action,
      session_id,
      result: {
        celebration: result.celebration,
        streak_update: result.streak_update,
        pattern_learning_updated: result.pattern_learning_updated
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in advice response API:', error);
    
    // Handle specific error types
    if (error?.message?.includes('Session not found')) {
      return NextResponse.json(
        { 
          error: 'Session not found',
          message: 'The advice session could not be found or has expired',
          session_id: body?.session_id
        },
        { status: 404 }
      );
    }

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

// Helper function to record advice response in database
async function recordAdviceResponse(
  supabase: any,
  sessionId: string,
  userId: string,
  response: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('advice_sessions')
      .update({
        user_response: response,
        completed_at: response.action === 'completed' ? response.timestamp : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error recording advice response:', error);
      // Don't throw - this is supplementary data
    }
  } catch (error) {
    console.error('Error in recordAdviceResponse:', error);
    // Don't throw - this is supplementary data
  }
}

// Helper function to update user streaks
async function updateUserStreaks(
  supabase: any,
  userId: string,
  sessionId: string
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get or create daily completion record
    const { data: existingRecord } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (existingRecord) {
      // Update existing record
      await supabase
        .from('daily_completions')
        .update({
          completed_count: existingRecord.completed_count + 1,
          last_completion_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);
    } else {
      // Create new record
      await supabase
        .from('daily_completions')
        .insert({
          user_id: userId,
          date: today,
          completed_count: 1,
          last_completion_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }

    // Update or create streak record
    await updateStreakRecord(supabase, userId);

  } catch (error) {
    console.error('Error updating user streaks:', error);
    // Don't throw - this is supplementary data
  }
}

// Helper function to update streak record
async function updateStreakRecord(supabase: any, userId: string): Promise<void> {
  try {
    // Get recent completion dates
    const { data: completions } = await supabase
      .from('daily_completions')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    if (!completions || completions.length === 0) return;

    // Calculate current streak
    let currentStreak = 0;
    let maxStreak = 0;
    let consecutiveDays = 0;

    const today = new Date();
    const completionDates = completions.map(c => new Date(c.date));

    // Sort dates in descending order
    completionDates.sort((a, b) => b.getTime() - a.getTime());

    // Calculate streaks
    for (let i = 0; i < completionDates.length; i++) {
      const currentDate = completionDates[i];
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (currentDate.toDateString() === expectedDate.toDateString()) {
        consecutiveDays++;
        currentStreak = consecutiveDays;
      } else {
        break;
      }
    }

    // Calculate max streak from all completions
    let tempStreak = 1;
    for (let i = 1; i < completionDates.length; i++) {
      const prevDate = completionDates[i - 1];
      const currentDate = completionDates[i];
      const daysDiff = Math.abs((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);

    // Update or insert streak record
    const { error } = await supabase
      .from('user_streaks')
      .upsert({
        user_id: userId,
        streak_type: 'daily_completions',
        current_count: currentStreak,
        best_count: Math.max(maxStreak, currentStreak),
        last_activity_date: today.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,streak_type'
      });

    if (error) {
      console.error('Error updating streak record:', error);
    }

  } catch (error) {
    console.error('Error in updateStreakRecord:', error);
  }
}

// Helper function to analyze dismissal patterns
async function analyzeDismissalPattern(supabase: any, userId: string): Promise<void> {
  try {
    // Get recent dismissals (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentSessions } = await supabase
      .from('advice_sessions')
      .select('user_response, created_at')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (!recentSessions || recentSessions.length === 0) return;

    // Count dismissals
    const dismissals = recentSessions.filter(
      session => session.user_response?.action === 'dismissed'
    );

    const dismissalRate = dismissals.length / recentSessions.length;

    // If dismissal rate is high (>60%), record burnout risk
    if (dismissalRate > 0.6 && dismissals.length >= 3) {
      await supabase
        .from('user_wellness_flags')
        .upsert({
          user_id: userId,
          flag_type: 'high_dismissal_rate',
          flag_value: dismissalRate,
          metadata: {
            recent_dismissals: dismissals.length,
            total_sessions: recentSessions.length,
            analysis_date: new Date().toISOString()
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,flag_type'
        });
    }

  } catch (error) {
    console.error('Error analyzing dismissal pattern:', error);
    // Don't throw - this is analytics data
  }
}
