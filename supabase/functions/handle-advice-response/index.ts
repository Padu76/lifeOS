// =====================================================
// LifeOS Edge Function: handle-advice-response
// File: handle-advice-response/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface AdviceResponseRequest {
  session_id: string;
  action: 'completed' | 'dismissed' | 'snoozed' | 'opened';
  rating?: number; // 1-10
  completion_time?: string;
  snooze_minutes?: number;
  feedback?: string;
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

    // Parse request
    const { 
      session_id, 
      action, 
      rating, 
      completion_time, 
      snooze_minutes,
      feedback 
    }: AdviceResponseRequest = await req.json()

    if (!session_id || !action) {
      throw new Error('Missing required fields: session_id, action')
    }

    console.log(`Handling advice response: ${action} for session ${session_id}`)

    // Get session details
    const { data: session, error: sessionError } = await supabaseClient
      .from('micro_advice_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found or unauthorized')
    }

    // Update session with user response
    const updateData: any = {
      user_response_action: action,
      user_response_timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (rating) updateData.user_rating = rating
    if (completion_time) updateData.completion_time = completion_time
    if (snooze_minutes) updateData.snooze_duration_minutes = snooze_minutes

    // Calculate engagement score based on action
    const engagementScore = calculateEngagementScore(action, rating, session)
    updateData.engagement_score = engagementScore

    const { error: updateError } = await supabaseClient
      .from('micro_advice_sessions')
      .update(updateData)
      .eq('id', session_id)

    if (updateError) {
      throw new Error('Failed to update session')
    }

    // Handle specific actions
    let celebrationResult = null
    let streakUpdate = null
    let patternLearningUpdated = false

    switch (action) {
      case 'completed':
        // Handle completion logic
        const completionResults = await handleAdviceCompletion(
          supabaseClient,
          user.id,
          session_id,
          rating || 5
        )
        celebrationResult = completionResults.celebration
        streakUpdate = completionResults.streak_update
        break

      case 'dismissed':
        // Handle dismissal pattern analysis
        await handleAdviceDismissal(supabaseClient, user.id, session)
        break

      case 'snoozed':
        // Handle snooze rescheduling
        if (snooze_minutes) {
          await handleAdviceSnooze(supabaseClient, session_id, user.id, snooze_minutes)
        }
        break

      case 'opened':
        // Just track engagement - already handled in update
        break
    }

    // Update pattern learning data
    await updatePatternLearning(supabaseClient, user.id, session, action, rating)
    patternLearningUpdated = true

    // Update user wellness profile with latest interaction
    await updateWellnessProfile(supabaseClient, user.id, action, rating)

    const response = {
      success: true,
      data: {
        session_id,
        action_processed: action,
        engagement_score: engagementScore,
        celebration: celebrationResult,
        streak_update: streakUpdate,
        pattern_learning_updated: patternLearningUpdated,
        message: `Successfully processed ${action} action`
      }
    }

    console.log(`Successfully processed ${action} for session ${session_id}`)

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in handle-advice-response:', error)
    
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

function calculateEngagementScore(action: string, rating?: number, session?: any): number {
  let baseScore = 0.5

  switch (action) {
    case 'completed':
      baseScore = 0.9
      if (rating && rating >= 8) baseScore = 1.0
      if (rating && rating <= 3) baseScore = 0.6
      break
    case 'opened':
      baseScore = 0.7
      break
    case 'snoozed':
      baseScore = 0.4
      break
    case 'dismissed':
      baseScore = 0.1
      break
  }

  // Adjust based on timing (quick responses are better engagement)
  if (session?.session_timestamp) {
    const responseTimeMs = Date.now() - new Date(session.session_timestamp).getTime()
    const responseTimeMinutes = responseTimeMs / (1000 * 60)
    
    if (responseTimeMinutes <= 5) baseScore += 0.1 // Quick response bonus
    if (responseTimeMinutes >= 60) baseScore -= 0.1 // Late response penalty
  }

  return Math.max(0, Math.min(1, baseScore))
}

async function handleAdviceCompletion(
  supabase: any,
  userId: string,
  sessionId: string,
  rating: number
) {
  // Update completion streak
  const streakResult = await supabase.rpc('update_user_streak', {
    p_user_id: userId,
    p_streak_type: 'consecutive',
    p_category: 'checkin',
    p_increment: true
  })

  // Check for completion-based achievements
  const { data: completedSessions } = await supabase
    .from('micro_advice_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('user_response_action', 'completed')

  const completionCount = completedSessions?.length || 0
  let newAchievement = null

  // Milestone achievements
  if ([5, 10, 25, 50, 100].includes(completionCount)) {
    const achievementKey = `completions_${completionCount}`
    
    // Check if achievement already exists
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_key', achievementKey)
      .single()

    if (!existing) {
      const achievement = {
        user_id: userId,
        achievement_key: achievementKey,
        title: `${completionCount} Completamenti`,
        description: `Hai completato ${completionCount} micro-consigli! La costanza è la tua forza.`,
        category: 'milestone',
        rarity: completionCount >= 50 ? 'rare' : completionCount >= 25 ? 'uncommon' : 'common',
        is_earned: true,
        earned_date: new Date().toISOString(),
        progress: 1.0,
        criteria: { metric: 'completions', target_value: completionCount },
        personal_significance: 0.8
      }

      await supabase.from('user_achievements').insert(achievement)
      newAchievement = achievement
    }
  }

  // High rating achievement
  if (rating >= 9) {
    const { data: highRatings } = await supabase
      .from('micro_advice_sessions')
      .select('id')
      .eq('user_id', userId)
      .gte('user_rating', 9)

    if (highRatings?.length === 10) { // 10th high rating
      const achievementKey = 'high_satisfaction_10'
      
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_key', achievementKey)
        .single()

      if (!existing) {
        const achievement = {
          user_id: userId,
          achievement_key: achievementKey,
          title: 'Super Soddisfatto',
          description: 'Hai dato voti alti (9+) a 10 micro-consigli. I tuoi feedback aiutano a migliorare!',
          category: 'progress',
          rarity: 'uncommon',
          is_earned: true,
          earned_date: new Date().toISOString(),
          progress: 1.0,
          criteria: { metric: 'high_ratings', target_value: 10 },
          personal_significance: 0.7
        }

        await supabase.from('user_achievements').insert(achievement)
        if (!newAchievement) newAchievement = achievement
      }
    }
  }

  // Create celebration if new achievement or significant streak
  let celebration = null
  if (newAchievement || (streakResult.data && streakResult.data[0]?.celebration_triggered)) {
    const celebrationType = newAchievement ? 'achievement_earned' : 'streak_milestone'
    const message = newAchievement ? 
      `🎉 ${newAchievement.title}! ${newAchievement.description}` :
      `🔥 Fantastico! ${streakResult.data[0]?.current_count} completamenti di fila!`

    celebration = {
      user_id: userId,
      celebration_type: celebrationType,
      message,
      visual_style: newAchievement?.rarity === 'rare' ? 'sparkles' : 'warm_pulse',
      emotional_tone: 'proud',
      timing_preference: 'immediate',
      related_session_id: sessionId
    }

    await supabase.from('celebration_moments').insert(celebration)
  }

  return {
    celebration,
    streak_update: streakResult.data,
    new_achievement: newAchievement
  }
}

async function handleAdviceDismissal(supabase: any, userId: string, session: any) {
  // Update pattern learning for dismissal analysis
  const { data: patternData } = await supabase
    .from('pattern_learning_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (patternData) {
    const consecutiveDismissals = (patternData.consecutive_dismissals || 0) + 1
    
    // Check for burnout risk
    const updateData: any = {
      consecutive_dismissals: consecutiveDismissals,
      updated_at: new Date().toISOString()
    }

    if (consecutiveDismissals >= 3) {
      updateData.declining_engagement = true
      updateData.fatigue_score = Math.min(1.0, (consecutiveDismissals - 2) * 0.2)
    }

    await supabase
      .from('pattern_learning_data')
      .update(updateData)
      .eq('user_id', userId)

    // If high burnout risk, reduce intervention frequency
    if (consecutiveDismissals >= 5) {
      await supabase
        .from('user_preferences')
        .update({
          intervention_frequency: 'minimal',
          max_daily_notifications: Math.max(1, patternData.max_daily_notifications - 1),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
    }
  }
}

async function handleAdviceSnooze(
  supabase: any, 
  sessionId: string, 
  userId: string, 
  snoozeMinutes: number
) {
  // Create new notification schedule for snoozed advice
  const snoozeTime = new Date(Date.now() + snoozeMinutes * 60 * 1000)
  
  // Get original session for content
  const { data: session } = await supabase
    .from('micro_advice_sessions')
    .select('advice_content, advice_category')
    .eq('id', sessionId)
    .single()

  if (session) {
    await supabase
      .from('notification_schedules')
      .insert({
        user_id: userId,
        notification_type: 'micro_advice',
        title: '⏰ Promemoria: micro consiglio',
        body: session.advice_content,
        scheduled_time: snoozeTime.toISOString(),
        status: 'scheduled',
        priority: 'normal',
        related_session_id: sessionId,
        notification_payload: {
          type: 'snoozed_advice',
          original_session_id: sessionId,
          deep_link: 'lifeos://advice/snoozed'
        }
      })
  }
}

async function updatePatternLearning(
  supabase: any,
  userId: string,
  session: any,
  action: string,
  rating?: number
) {
  const { data: patternData } = await supabase
    .from('pattern_learning_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!patternData) return

  // Update response rates by hour
  const hour = new Date(session.session_timestamp).getHours()
  const responseRates = patternData.response_rates_by_hour || {}
  const actionValue = action === 'completed' ? 1 : action === 'opened' ? 0.7 : action === 'snoozed' ? 0.4 : 0.1
  
  responseRates[hour] = responseRates[hour] ? 
    (responseRates[hour] + actionValue) / 2 : 
    actionValue

  // Update effectiveness by context
  const effectivenessContext = patternData.effectiveness_by_context || {}
  const contextKey = `${session.advice_category}_${hour}`
  const effectivenessValue = rating ? rating / 10 : actionValue
  
  effectivenessContext[contextKey] = effectivenessContext[contextKey] ?
    (effectivenessContext[contextKey] + effectivenessValue) / 2 :
    effectivenessValue

  // Reset consecutive dismissals if action is positive
  let consecutiveDismissals = patternData.consecutive_dismissals || 0
  if (action === 'completed' || action === 'opened') {
    consecutiveDismissals = 0
  }

  await supabase
    .from('pattern_learning_data')
    .update({
      response_rates_by_hour: responseRates,
      effectiveness_by_context: effectivenessContext,
      consecutive_dismissals: consecutiveDismissals,
      declining_engagement: consecutiveDismissals >= 3,
      total_sessions: (patternData.total_sessions || 0) + 1,
      completed_sessions: action === 'completed' ? 
        (patternData.completed_sessions || 0) + 1 : 
        (patternData.completed_sessions || 0),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
}

async function updateWellnessProfile(
  supabase: any,
  userId: string,
  action: string,
  rating?: number
) {
  // Update wellness profile with latest interaction patterns
  const { data: profile } = await supabase
    .from('user_wellness_profiles')
    .select('historical_effectiveness')
    .eq('user_id', userId)
    .single()

  if (profile) {
    const effectiveness = profile.historical_effectiveness || {}
    const actionValue = action === 'completed' ? (rating || 5) / 10 : 
                       action === 'opened' ? 0.7 : 
                       action === 'snoozed' ? 0.4 : 0.1

    effectiveness['recent_response'] = actionValue
    
    await supabase
      .from('user_wellness_profiles')
      .update({
        historical_effectiveness: effectiveness,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
  }
}
