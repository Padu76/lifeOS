// =====================================================
// LifeOS Edge Function: get-wellness-dashboard
// File: get-wellness-dashboard/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface WellnessDashboard {
  user_profile: {
    chronotype: string;
    sensitivity_level: string;
    focus_areas: string[];
  };
  current_life_score: {
    stress: number;
    energy: number;
    sleep: number;
    overall: number;
    last_updated: string;
  };
  active_streaks: Array<{
    type: string;
    category: string;
    current_count: number;
    best_count: number;
    celebration_pending: boolean;
  }>;
  recent_achievements: Array<{
    title: string;
    description: string;
    earned_date: string;
    rarity: string;
    category: string;
  }>;
  pending_celebrations: Array<{
    type: string;
    message: string;
    visual_style: string;
    scheduled_time?: string;
  }>;
  progress_visualization: {
    type: string;
    recent_highlights: string[];
    areas_of_growth: string[];
    gentle_next_steps: string[];
    trend_data: any;
  };
  wellness_insights: string[];
  next_advice_eta?: string;
  engagement_metrics: {
    completion_rate: number;
    average_rating: number;
    streak_consistency: number;
    total_sessions: number;
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

    // Get user from auth
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    console.log(`Loading wellness dashboard for user: ${user.id}`)

    // Load user profile data
    const userProfile = await loadUserProfile(supabaseClient, user.id)
    
    // Calculate current life score
    const currentLifeScore = await calculateCurrentLifeScore(supabaseClient, user.id)
    
    // Get active streaks
    const activeStreaks = await getActiveStreaks(supabaseClient, user.id)
    
    // Get recent achievements (last 30 days)
    const recentAchievements = await getRecentAchievements(supabaseClient, user.id)
    
    // Get pending celebrations
    const pendingCelebrations = await getPendingCelebrations(supabaseClient, user.id)
    
    // Generate progress visualization
    const progressVisualization = await generateProgressVisualization(supabaseClient, user.id)
    
    // Generate wellness insights
    const wellnessInsights = await generateWellnessInsights(supabaseClient, user.id, currentLifeScore)
    
    // Calculate next advice ETA
    const nextAdviceEta = await calculateNextAdviceEta(supabaseClient, user.id)
    
    // Get engagement metrics
    const engagementMetrics = await getEngagementMetrics(supabaseClient, user.id)

    const dashboard: WellnessDashboard = {
      user_profile: {
        chronotype: userProfile.chronotype || 'intermediate',
        sensitivity_level: userProfile.sensitivity_level || 'moderate',
        focus_areas: userProfile.focus_areas || ['stress_management', 'energy', 'sleep']
      },
      current_life_score: currentLifeScore,
      active_streaks: activeStreaks,
      recent_achievements: recentAchievements,
      pending_celebrations: pendingCelebrations,
      progress_visualization: progressVisualization,
      wellness_insights: wellnessInsights,
      next_advice_eta: nextAdviceEta,
      engagement_metrics: engagementMetrics
    }

    console.log(`Successfully loaded dashboard for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true, data: dashboard }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-wellness-dashboard:', error)
    
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

async function loadUserProfile(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('user_wellness_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  return {
    ...profile,
    preferences: preferences || {}
  }
}

async function calculateCurrentLifeScore(supabase: any, userId: string) {
  // Get most recent health metrics
  const { data: recentSession } = await supabase
    .from('micro_advice_sessions')
    .select('life_score, session_timestamp')
    .eq('user_id', userId)
    .order('session_timestamp', { ascending: false })
    .limit(1)
    .single()

  if (recentSession) {
    return {
      ...recentSession.life_score,
      last_updated: recentSession.session_timestamp
    }
  }

  // Default scores if no data
  return {
    stress: 5,
    energy: 5,
    sleep: 5,
    overall: 5,
    last_updated: new Date().toISOString()
  }
}

async function getActiveStreaks(supabase: any, userId: string) {
  const { data: streaks } = await supabase
    .from('user_streaks')
    .select('streak_type, category, current_count, best_count, pattern_strength, celebration_pending')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gt('current_count', 0)
    .order('current_count', { ascending: false })

  return streaks || []
}

async function getRecentAchievements(supabase: any, userId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('title, description, earned_date, rarity, category, personal_significance')
    .eq('user_id', userId)
    .eq('is_earned', true)
    .gte('earned_date', thirtyDaysAgo.toISOString())
    .order('earned_date', { ascending: false })
    .limit(10)

  return achievements || []
}

async function getPendingCelebrations(supabase: any, userId: string) {
  const { data: celebrations } = await supabase
    .from('celebration_moments')
    .select('celebration_type, message, visual_style, emotional_tone, scheduled_time')
    .eq('user_id', userId)
    .eq('is_delivered', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return celebrations?.map(c => ({
    type: c.celebration_type,
    message: c.message,
    visual_style: c.visual_style,
    scheduled_time: c.scheduled_time
  })) || []
}

async function generateProgressVisualization(supabase: any, userId: string) {
  // Get last 30 days of sessions for trend analysis
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: sessions } = await supabase
    .from('micro_advice_sessions')
    .select('life_score, session_timestamp, user_response_action, user_rating')
    .eq('user_id', userId)
    .gte('session_timestamp', thirtyDaysAgo.toISOString())
    .order('session_timestamp', { ascending: true })

  if (!sessions || sessions.length === 0) {
    return {
      type: 'wellness_garden',
      recent_highlights: ['Inizia il tuo percorso di benessere con il primo check-in!'],
      areas_of_growth: ['Stabilisci una routine di check-in giornalieri'],
      gentle_next_steps: ['Prova a fare il check-in ogni giorno alla stessa ora'],
      trend_data: { sessions: 0, trend: 'neutral' }
    }
  }

  // Analyze trends
  const recentHighlights = []
  const areasOfGrowth = []
  const gentleNextSteps = []

  // Calculate averages for first half vs second half
  const midPoint = Math.floor(sessions.length / 2)
  const firstHalf = sessions.slice(0, midPoint)
  const secondHalf = sessions.slice(midPoint)

  const avgFirstHalf = calculateAverageLifeScore(firstHalf)
  const avgSecondHalf = calculateAverageLifeScore(secondHalf)

  // Identify improvements
  if (avgSecondHalf.stress < avgFirstHalf.stress) {
    recentHighlights.push('Miglioramento nella gestione dello stress 📉')
  }
  if (avgSecondHalf.energy > avgFirstHalf.energy) {
    recentHighlights.push('Livelli di energia in crescita ⚡')
  }
  if (avgSecondHalf.sleep > avgFirstHalf.sleep) {
    recentHighlights.push('Qualità del sonno migliorata 😴')
  }
  if (avgSecondHalf.overall > avgFirstHalf.overall) {
    recentHighlights.push('Benessere generale in miglioramento 📈')
  }

  // Identify areas for growth
  if (avgSecondHalf.stress > 6) {
    areasOfGrowth.push('Gestione dello stress')
    gentleNextSteps.push('Prova tecniche di respirazione quando ti senti stressato')
  }
  if (avgSecondHalf.energy < 5) {
    areasOfGrowth.push('Livelli di energia')
    gentleNextSteps.push('Considera micro-pause durante la giornata')
  }
  if (avgSecondHalf.sleep < 6) {
    areasOfGrowth.push('Qualità del sonno')
    gentleNextSteps.push('Stabilisci una routine serale rilassante')
  }

  // Calculate completion rate
  const completedSessions = sessions.filter(s => s.user_response_action === 'completed').length
  const completionRate = completedSessions / sessions.length

  if (completionRate < 0.5) {
    areasOfGrowth.push('Completamento micro-consigli')
    gentleNextSteps.push('Prova a dedicare qualche minuto in più ai consigli')
  }

  // Default suggestions if no specific areas identified
  if (gentleNextSteps.length === 0) {
    gentleNextSteps.push('Continua così! Mantieni la routine di check-in')
    gentleNextSteps.push('Sperimenta con nuove tecniche di benessere')
  }

  return {
    type: 'wellness_garden',
    recent_highlights: recentHighlights.length > 0 ? recentHighlights : ['Continua a prenderti cura del tuo benessere! 🌱'],
    areas_of_growth: areasOfGrowth,
    gentle_next_steps: gentleNextSteps,
    trend_data: {
      sessions: sessions.length,
      trend: avgSecondHalf.overall > avgFirstHalf.overall ? 'improving' : 
             avgSecondHalf.overall < avgFirstHalf.overall ? 'declining' : 'stable',
      weekly_scores: generateWeeklyScores(sessions)
    }
  }
}

function calculateAverageLifeScore(sessions: any[]) {
  if (sessions.length === 0) {
    return { stress: 5, energy: 5, sleep: 5, overall: 5 }
  }

  const totals = sessions.reduce((acc, session) => {
    const score = session.life_score
    return {
      stress: acc.stress + (score.stress || 5),
      energy: acc.energy + (score.energy || 5),
      sleep: acc.sleep + (score.sleep || 5),
      overall: acc.overall + (score.overall || 5)
    }
  }, { stress: 0, energy: 0, sleep: 0, overall: 0 })

  return {
    stress: totals.stress / sessions.length,
    energy: totals.energy / sessions.length,
    sleep: totals.sleep / sessions.length,
    overall: totals.overall / sessions.length
  }
}

function generateWeeklyScores(sessions: any[]) {
  // Group sessions by week and calculate averages
  const weeklyData: any[] = []
  const weeksMap = new Map()

  sessions.forEach(session => {
    const date = new Date(session.session_timestamp)
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
    const weekKey = weekStart.toISOString().split('T')[0]

    if (!weeksMap.has(weekKey)) {
      weeksMap.set(weekKey, [])
    }
    weeksMap.get(weekKey).push(session)
  })

  weeksMap.forEach((weekSessions, weekKey) => {
    const avgScore = calculateAverageLifeScore(weekSessions)
    weeklyData.push({
      week: weekKey,
      overall: Math.round(avgScore.overall * 10) / 10,
      stress: Math.round(avgScore.stress * 10) / 10,
      energy: Math.round(avgScore.energy * 10) / 10,
      sleep: Math.round(avgScore.sleep * 10) / 10,
      sessions: weekSessions.length
    })
  })

  return weeklyData.sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
}

async function generateWellnessInsights(supabase: any, userId: string, currentLifeScore: any) {
  const insights = []

  // Get recent pattern data
  const { data: patternData } = await supabase
    .from('pattern_learning_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get recent sessions for analysis
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentSessions } = await supabase
    .from('micro_advice_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('session_timestamp', sevenDaysAgo.toISOString())
    .order('session_timestamp', { ascending: false })

  // Analyze current state
  if (currentLifeScore.overall >= 7) {
    insights.push('🌟 Il tuo benessere generale è in ottima forma! Continua così.')
  } else if (currentLifeScore.overall >= 5) {
    insights.push('📈 Il tuo benessere è stabile. Piccoli miglioramenti possono fare la differenza.')
  } else {
    insights.push('🤗 Prenditi cura di te stesso oggi. Ogni piccolo passo conta.')
  }

  // Analyze engagement patterns
  if (patternData) {
    const completionRate = patternData.completed_sessions / Math.max(1, patternData.total_sessions)
    
    if (completionRate >= 0.8) {
      insights.push('💪 Eccellente costanza nel completare i micro-consigli!')
    } else if (completionRate >= 0.5) {
      insights.push('👍 Buona partecipazione ai micro-consigli. Continua a migliorare!')
    } else if (completionRate < 0.3) {
      insights.push('🌱 Prova a dedicare qualche minuto in più ai consigli - anche 2 minuti possono aiutare.')
    }

    // Time-based insights
    const responseRates = patternData.response_rates_by_hour || {}
    const bestHours = Object.entries(responseRates)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([hour]) => parseInt(hour))

    if (bestHours.length > 0) {
      const timeRanges = bestHours.map(hour => 
        hour < 12 ? 'mattina' : hour < 18 ? 'pomeriggio' : 'sera'
      )
      insights.push(`⏰ Rispondi meglio ai consigli di ${timeRanges.join(' e ')}.`)
    }
  }

  // Stress pattern insights
  if (recentSessions && recentSessions.length > 0) {
    const avgStress = recentSessions.reduce((sum, s) => sum + (s.life_score.stress || 5), 0) / recentSessions.length
    
    if (avgStress >= 7) {
      insights.push('🧘 I tuoi livelli di stress sono alti. Le tecniche di respirazione possono aiutare.')
    } else if (avgStress <= 3) {
      insights.push('😌 Ottima gestione dello stress questa settimana!')
    }

    // Energy pattern insights
    const avgEnergy = recentSessions.reduce((sum, s) => sum + (s.life_score.energy || 5), 0) / recentSessions.length
    
    if (avgEnergy >= 7) {
      insights.push('⚡ I tuoi livelli di energia sono fantastici! Sei in una fase produttiva.')
    } else if (avgEnergy <= 3) {
      insights.push('🔋 Considera micro-pause durante la giornata per ricaricare le energie.')
    }
  }

  // Achievement-based insights
  const { data: recentAchievements } = await supabase
    .from('user_achievements')
    .select('category')
    .eq('user_id', userId)
    .eq('is_earned', true)
    .gte('earned_date', sevenDaysAgo.toISOString())

  if (recentAchievements && recentAchievements.length > 0) {
    insights.push('🏆 Hai sbloccato nuovi achievement recentemente. I tuoi sforzi stanno dando frutti!')
  }

  // Default insights if none generated
  if (insights.length === 0) {
    insights.push('🌱 Continua il tuo percorso di benessere un giorno alla volta.')
    insights.push('💝 Ricorda: prendersi cura di sé non è egoismo, è necessità.')
  }

  return insights
}

async function calculateNextAdviceEta(supabase: any, userId: string) {
  // Get user preferences for frequency
  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('intervention_frequency, max_daily_notifications')
    .eq('user_id', userId)
    .single()

  // Get today's advice count
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: todayAdvice } = await supabase
    .from('micro_advice_sessions')
    .select('id')
    .eq('user_id', userId)
    .gte('session_timestamp', today.toISOString())

  const todayCount = todayAdvice?.length || 0
  const maxDaily = preferences?.max_daily_notifications || 5

  if (todayCount >= maxDaily) {
    // Next advice tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow.toISOString()
  }

  // Calculate next ETA based on frequency preference
  const frequency = preferences?.intervention_frequency || 'balanced'
  let hoursDelay = 4

  switch (frequency) {
    case 'minimal':
      hoursDelay = 8
      break
    case 'frequent':
      hoursDelay = 2
      break
    default:
      hoursDelay = 4
  }

  const nextAdvice = new Date(Date.now() + hoursDelay * 60 * 60 * 1000)
  return nextAdvice.toISOString()
}

async function getEngagementMetrics(supabase: any, userId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Get sessions from last 30 days
  const { data: sessions } = await supabase
    .from('micro_advice_sessions')
    .select('user_response_action, user_rating')
    .eq('user_id', userId)
    .gte('session_timestamp', thirtyDaysAgo.toISOString())

  if (!sessions || sessions.length === 0) {
    return {
      completion_rate: 0,
      average_rating: 0,
      streak_consistency: 0,
      total_sessions: 0
    }
  }

  // Calculate completion rate
  const completedSessions = sessions.filter(s => s.user_response_action === 'completed')
  const completionRate = completedSessions.length / sessions.length

  // Calculate average rating
  const ratedSessions = sessions.filter(s => s.user_rating !== null)
  const averageRating = ratedSessions.length > 0 ?
    ratedSessions.reduce((sum, s) => sum + s.user_rating, 0) / ratedSessions.length : 0

  // Get streak consistency (active streaks count)
  const { data: activeStreaks } = await supabase
    .from('user_streaks')
    .select('current_count')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gt('current_count', 0)

  const streakConsistency = activeStreaks ? 
    activeStreaks.reduce((sum, s) => sum + Math.min(s.current_count / 7, 1), 0) / Math.max(activeStreaks.length, 1) : 0

  return {
    completion_rate: Math.round(completionRate * 100) / 100,
    average_rating: Math.round(averageRating * 10) / 10,
    streak_consistency: Math.round(streakConsistency * 100) / 100,
    total_sessions: sessions.length
  }
}
