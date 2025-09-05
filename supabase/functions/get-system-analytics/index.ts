// =====================================================
// LifeOS Edge Function: get-system-analytics
// File: get-system-analytics/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface SystemAnalyticsResponse {
  advice_effectiveness: {
    total_generated: number;
    completion_rate: number;
    user_satisfaction: number;
    most_effective_times: string[];
    most_effective_categories: string[];
    weekly_trend: 'improving' | 'stable' | 'declining';
  };
  engagement_metrics: {
    streak_retention: number;
    achievement_celebration_rate: number;
    notification_response_rate: number;
    burnout_risk_score: number;
    consistency_score: number;
  };
  wellness_trends: {
    overall_improvement: number;
    stress_management: number;
    energy_levels: number;
    sleep_quality: number;
    trend_direction: 'improving' | 'stable' | 'declining';
    significant_changes: string[];
  };
  personalization_insights: {
    best_intervention_types: string[];
    optimal_timing_windows: Array<{ start: string; end: string; effectiveness: number }>;
    tone_preference_effectiveness: Record<string, number>;
    category_preferences: Record<string, number>;
  };
  recommendations: string[];
  time_period: {
    start_date: string;
    end_date: string;
    days_analyzed: number;
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

    // Parse query parameters
    const url = new URL(req.url)
    const timeframe = url.searchParams.get('timeframe') || 'month' // week, month, quarter
    const includeRecommendations = url.searchParams.get('recommendations') !== 'false'

    console.log(`Generating system analytics for user: ${user.id}, timeframe: ${timeframe}`)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'month':
      default:
        startDate.setMonth(startDate.getMonth() - 1)
        break
    }

    // Load sessions data for analysis
    const sessionsData = await loadSessionsData(supabaseClient, user.id, startDate, endDate)
    
    // Calculate advice effectiveness metrics
    const adviceEffectiveness = calculateAdviceEffectiveness(sessionsData)
    
    // Calculate engagement metrics
    const engagementMetrics = await calculateEngagementMetrics(
      supabaseClient, 
      user.id, 
      startDate, 
      endDate,
      sessionsData
    )
    
    // Calculate wellness trends
    const wellnessTrends = calculateWellnessTrends(sessionsData)
    
    // Generate personalization insights
    const personalizationInsights = generatePersonalizationInsights(sessionsData)
    
    // Generate recommendations
    const recommendations = includeRecommendations ? 
      await generateSystemRecommendations(
        supabaseClient,
        user.id,
        adviceEffectiveness,
        engagementMetrics,
        wellnessTrends,
        personalizationInsights
      ) : []

    const analytics: SystemAnalyticsResponse = {
      advice_effectiveness: adviceEffectiveness,
      engagement_metrics: engagementMetrics,
      wellness_trends: wellnessTrends,
      personalization_insights: personalizationInsights,
      recommendations: recommendations,
      time_period: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        days_analyzed: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      }
    }

    console.log(`Successfully generated analytics for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true, data: analytics }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in get-system-analytics:', error)
    
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

async function loadSessionsData(supabase: any, userId: string, startDate: Date, endDate: Date) {
  const { data: sessions, error } = await supabase
    .from('micro_advice_sessions')
    .select(`
      id,
      session_timestamp,
      life_score,
      health_metrics,
      advice_content,
      advice_category,
      advice_tone,
      personalization_score,
      predicted_effectiveness,
      timing_confidence,
      urgency_level,
      user_response_action,
      user_response_timestamp,
      user_rating,
      completion_time,
      engagement_score,
      effectiveness_score
    `)
    .eq('user_id', userId)
    .gte('session_timestamp', startDate.toISOString())
    .lte('session_timestamp', endDate.toISOString())
    .order('session_timestamp', { ascending: true })

  if (error) {
    console.error('Failed to load sessions data:', error)
    return []
  }

  return sessions || []
}

function calculateAdviceEffectiveness(sessions: any[]) {
  if (sessions.length === 0) {
    return {
      total_generated: 0,
      completion_rate: 0,
      user_satisfaction: 0,
      most_effective_times: [],
      most_effective_categories: [],
      weekly_trend: 'stable' as const
    }
  }

  // Calculate completion rate
  const completedSessions = sessions.filter(s => s.user_response_action === 'completed')
  const completionRate = completedSessions.length / sessions.length

  // Calculate user satisfaction (average rating)
  const ratedSessions = sessions.filter(s => s.user_rating !== null && s.user_rating !== undefined)
  const averageRating = ratedSessions.length > 0 ?
    ratedSessions.reduce((sum, s) => sum + s.user_rating, 0) / ratedSessions.length : 0

  // Find most effective times (hours with highest completion rates)
  const timeEffectiveness: Record<number, { completed: number; total: number }> = {}
  
  sessions.forEach(session => {
    const hour = new Date(session.session_timestamp).getHours()
    if (!timeEffectiveness[hour]) {
      timeEffectiveness[hour] = { completed: 0, total: 0 }
    }
    timeEffectiveness[hour].total++
    if (session.user_response_action === 'completed') {
      timeEffectiveness[hour].completed++
    }
  })

  const mostEffectiveTimes = Object.entries(timeEffectiveness)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      rate: data.completed / data.total
    }))
    .filter(item => item.rate > 0.6) // Above 60% completion rate
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3)
    .map(item => `${item.hour.toString().padStart(2, '0')}:00`)

  // Find most effective categories
  const categoryEffectiveness: Record<string, { completed: number; total: number; avgRating: number }> = {}
  
  sessions.forEach(session => {
    const category = session.advice_category
    if (!categoryEffectiveness[category]) {
      categoryEffectiveness[category] = { completed: 0, total: 0, avgRating: 0 }
    }
    categoryEffectiveness[category].total++
    if (session.user_response_action === 'completed') {
      categoryEffectiveness[category].completed++
    }
    if (session.user_rating) {
      categoryEffectiveness[category].avgRating += session.user_rating
    }
  })

  const mostEffectiveCategories = Object.entries(categoryEffectiveness)
    .map(([category, data]) => ({
      category,
      score: (data.completed / data.total) * 0.7 + (data.avgRating / data.total / 10) * 0.3
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.category)

  // Calculate weekly trend
  const weeklyTrend = calculateWeeklyTrend(sessions)

  return {
    total_generated: sessions.length,
    completion_rate: Math.round(completionRate * 100) / 100,
    user_satisfaction: Math.round(averageRating * 10) / 10,
    most_effective_times: mostEffectiveTimes,
    most_effective_categories: mostEffectiveCategories,
    weekly_trend: weeklyTrend
  }
}

function calculateWeeklyTrend(sessions: any[]): 'improving' | 'stable' | 'declining' {
  if (sessions.length < 14) return 'stable' // Need at least 2 weeks

  const midPoint = Math.floor(sessions.length / 2)
  const firstHalf = sessions.slice(0, midPoint)
  const secondHalf = sessions.slice(midPoint)

  const firstHalfCompletion = firstHalf.filter(s => s.user_response_action === 'completed').length / firstHalf.length
  const secondHalfCompletion = secondHalf.filter(s => s.user_response_action === 'completed').length / secondHalf.length

  const improvement = secondHalfCompletion - firstHalfCompletion

  if (improvement > 0.1) return 'improving'
  if (improvement < -0.1) return 'declining'
  return 'stable'
}

async function calculateEngagementMetrics(
  supabase: any,
  userId: string,
  startDate: Date,
  endDate: Date,
  sessions: any[]
) {
  // Get streak data
  const { data: streaks } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  // Calculate streak retention (percentage of days with active streaks)
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const activeDays = new Set(sessions.map(s => new Date(s.session_timestamp).toDateString())).size
  const streakRetention = activeDays / daysInPeriod

  // Get achievements data
  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .gte('earned_date', startDate.toISOString())
    .lte('earned_date', endDate.toISOString())

  // Get celebrations data
  const { data: celebrations } = await supabase
    .from('celebration_moments')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const achievementCelebrationRate = achievements && celebrations ? 
    celebrations.length / Math.max(achievements.length, 1) : 0

  // Calculate notification response rate
  const { data: notifications } = await supabase
    .from('notification_schedules')
    .select('user_action')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .not('user_action', 'is', null)

  const notificationResponseRate = notifications && notifications.length > 0 ?
    notifications.filter(n => n.user_action !== 'dismissed').length / notifications.length : 0

  // Get burnout risk from pattern learning data
  const { data: patternData } = await supabase
    .from('pattern_learning_data')
    .select('consecutive_dismissals, declining_engagement, fatigue_score')
    .eq('user_id', userId)
    .single()

  const burnoutRiskScore = patternData ? 
    Math.min(1, (patternData.consecutive_dismissals / 10) * 0.4 + 
             (patternData.declining_engagement ? 0.3 : 0) + 
             (patternData.fatigue_score || 0) * 0.3) : 0

  // Calculate consistency score
  const consistencyScore = calculateConsistencyScore(sessions, daysInPeriod)

  return {
    streak_retention: Math.round(streakRetention * 100) / 100,
    achievement_celebration_rate: Math.round(achievementCelebrationRate * 100) / 100,
    notification_response_rate: Math.round(notificationResponseRate * 100) / 100,
    burnout_risk_score: Math.round(burnoutRiskScore * 100) / 100,
    consistency_score: Math.round(consistencyScore * 100) / 100
  }
}

function calculateConsistencyScore(sessions: any[], daysInPeriod: number): number {
  if (sessions.length === 0) return 0

  // Count unique days with sessions
  const uniqueDays = new Set(sessions.map(s => new Date(s.session_timestamp).toDateString())).size
  
  // Calculate base consistency (days with activity / total days)
  const baseConsistency = uniqueDays / daysInPeriod

  // Bonus for completing actions
  const completionBonus = sessions.filter(s => s.user_response_action === 'completed').length / sessions.length * 0.2

  return Math.min(1, baseConsistency + completionBonus)
}

function calculateWellnessTrends(sessions: any[]) {
  if (sessions.length === 0) {
    return {
      overall_improvement: 0,
      stress_management: 0,
      energy_levels: 0,
      sleep_quality: 0,
      trend_direction: 'stable' as const,
      significant_changes: []
    }
  }

  // Split sessions into first and second half
  const midPoint = Math.floor(sessions.length / 2)
  const firstHalf = sessions.slice(0, midPoint)
  const secondHalf = sessions.slice(midPoint)

  // Calculate averages for each half
  const firstAvg = calculateAverageLifeScore(firstHalf)
  const secondAvg = calculateAverageLifeScore(secondHalf)

  // Calculate improvements
  const overallImprovement = secondAvg.overall - firstAvg.overall
  const stressImprovement = firstAvg.stress - secondAvg.stress // Lower stress is better
  const energyImprovement = secondAvg.energy - firstAvg.energy
  const sleepImprovement = secondAvg.sleep - firstAvg.sleep

  // Determine overall trend direction
  let trendDirection: 'improving' | 'stable' | 'declining' = 'stable'
  if (overallImprovement > 0.5) trendDirection = 'improving'
  else if (overallImprovement < -0.5) trendDirection = 'declining'

  // Identify significant changes
  const significantChanges: string[] = []
  if (Math.abs(stressImprovement) > 1) {
    significantChanges.push(stressImprovement > 0 ? 
      'Significativo miglioramento nella gestione dello stress' : 
      'Aumento dei livelli di stress rilevato')
  }
  if (Math.abs(energyImprovement) > 1) {
    significantChanges.push(energyImprovement > 0 ? 
      'Notevole miglioramento dei livelli di energia' : 
      'Calo dei livelli di energia osservato')
  }
  if (Math.abs(sleepImprovement) > 1) {
    significantChanges.push(sleepImprovement > 0 ? 
      'Miglioramento significativo della qualità del sonno' : 
      'Peggioramento della qualità del sonno')
  }

  return {
    overall_improvement: Math.round(overallImprovement * 100) / 100,
    stress_management: Math.round(stressImprovement * 100) / 100,
    energy_levels: Math.round(energyImprovement * 100) / 100,
    sleep_quality: Math.round(sleepImprovement * 100) / 100,
    trend_direction: trendDirection,
    significant_changes: significantChanges
  }
}

function calculateAverageLifeScore(sessions: any[]) {
  if (sessions.length === 0) {
    return { stress: 5, energy: 5, sleep: 5, overall: 5 }
  }

  const totals = sessions.reduce((acc, session) => {
    const score = session.life_score || { stress: 5, energy: 5, sleep: 5, overall: 5 }
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

function generatePersonalizationInsights(sessions: any[]) {
  if (sessions.length === 0) {
    return {
      best_intervention_types: [],
      optimal_timing_windows: [],
      tone_preference_effectiveness: {},
      category_preferences: {}
    }
  }

  // Analyze intervention type effectiveness
  const interventionEffectiveness: Record<string, { completed: number; total: number; avgRating: number }> = {}
  
  sessions.forEach(session => {
    const category = session.advice_category
    if (!interventionEffectiveness[category]) {
      interventionEffectiveness[category] = { completed: 0, total: 0, avgRating: 0 }
    }
    interventionEffectiveness[category].total++
    if (session.user_response_action === 'completed') {
      interventionEffectiveness[category].completed++
    }
    if (session.user_rating) {
      interventionEffectiveness[category].avgRating += session.user_rating
    }
  })

  const bestInterventionTypes = Object.entries(interventionEffectiveness)
    .map(([category, data]) => ({
      category,
      score: (data.completed / data.total) * 0.6 + (data.avgRating / data.total / 10) * 0.4
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.category)

  // Analyze optimal timing windows
  const hourlyEffectiveness: Record<number, { completed: number; total: number }> = {}
  
  sessions.forEach(session => {
    const hour = new Date(session.session_timestamp).getHours()
    if (!hourlyEffectiveness[hour]) {
      hourlyEffectiveness[hour] = { completed: 0, total: 0 }
    }
    hourlyEffectiveness[hour].total++
    if (session.user_response_action === 'completed') {
      hourlyEffectiveness[hour].completed++
    }
  })

  const optimalTimingWindows = Object.entries(hourlyEffectiveness)
    .map(([hour, data]) => ({
      start: `${hour.padStart(2, '0')}:00`,
      end: `${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`,
      effectiveness: data.completed / data.total
    }))
    .filter(window => window.effectiveness > 0.5)
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .slice(0, 5)

  // Analyze tone effectiveness
  const toneEffectiveness: Record<string, { completed: number; total: number; avgRating: number }> = {}
  
  sessions.forEach(session => {
    const tone = session.advice_tone || 'default'
    if (!toneEffectiveness[tone]) {
      toneEffectiveness[tone] = { completed: 0, total: 0, avgRating: 0 }
    }
    toneEffectiveness[tone].total++
    if (session.user_response_action === 'completed') {
      toneEffectiveness[tone].completed++
    }
    if (session.user_rating) {
      toneEffectiveness[tone].avgRating += session.user_rating
    }
  })

  const tonePreferenceEffectiveness: Record<string, number> = {}
  Object.entries(toneEffectiveness).forEach(([tone, data]) => {
    tonePreferenceEffectiveness[tone] = Math.round(
      ((data.completed / data.total) * 0.6 + (data.avgRating / data.total / 10) * 0.4) * 100
    ) / 100
  })

  // Calculate category preferences (user engagement)
  const categoryPreferences: Record<string, number> = {}
  Object.entries(interventionEffectiveness).forEach(([category, data]) => {
    categoryPreferences[category] = Math.round((data.completed / data.total) * 100) / 100
  })

  return {
    best_intervention_types: bestInterventionTypes,
    optimal_timing_windows: optimalTimingWindows,
    tone_preference_effectiveness: tonePreferenceEffectiveness,
    category_preferences: categoryPreferences
  }
}

async function generateSystemRecommendations(
  supabase: any,
  userId: string,
  adviceEffectiveness: any,
  engagementMetrics: any,
  wellnessTrends: any,
  personalizationInsights: any
): Promise<string[]> {
  const recommendations: string[] = []

  // Effectiveness recommendations
  if (adviceEffectiveness.completion_rate < 0.5) {
    recommendations.push('Considera di ridurre la frequenza degli interventi o provare categorie diverse di micro-consigli.')
  } else if (adviceEffectiveness.completion_rate > 0.8) {
    recommendations.push('Ottima partecipazione! Potresti beneficiare di consigli più frequenti o avanzati.')
  }

  // User satisfaction recommendations
  if (adviceEffectiveness.user_satisfaction < 6) {
    recommendations.push('I feedback suggeriscono di adattare il tono o la tipologia dei consigli alle tue preferenze.')
  } else if (adviceEffectiveness.user_satisfaction > 8) {
    recommendations.push('I consigli si adattano perfettamente al tuo stile! Continua così.')
  }

  // Timing recommendations
  if (personalizationInsights.optimal_timing_windows.length > 0) {
    const bestWindow = personalizationInsights.optimal_timing_windows[0]
    recommendations.push(`I tuoi momenti più produttivi sono tra le ${bestWindow.start} e le ${bestWindow.end}. Considera di programmare attività importanti in questa fascia.`)
  }

  // Burnout prevention
  if (engagementMetrics.burnout_risk_score > 0.6) {
    recommendations.push('Rilevato rischio di sovraccarico. Considera di ridurre la frequenza delle notifiche e focalizzarti sui consigli più importanti.')
  }

  // Wellness trend recommendations
  if (wellnessTrends.trend_direction === 'improving') {
    recommendations.push('I tuoi progressi sono evidenti! Mantieni le abitudini attuali e considera di aggiungere nuove sfide.')
  } else if (wellnessTrends.trend_direction === 'declining') {
    recommendations.push('Sembra un periodo più difficile. Focalizzati sui consigli di base e sii gentile con te stesso.')
  }

  // Category-specific recommendations
  if (personalizationInsights.best_intervention_types.length > 0) {
    const bestCategory = personalizationInsights.best_intervention_types[0]
    recommendations.push(`I consigli di tipo "${bestCategory}" funzionano meglio per te. Ne riceverai di più di questa categoria.`)
  }

  // Consistency recommendations
  if (engagementMetrics.consistency_score < 0.4) {
    recommendations.push('Prova a stabilire una routine fissa per i check-in, anche solo 2-3 volte a settimana possono fare la differenza.')
  }

  // Specific wellness area recommendations
  if (wellnessTrends.stress_management < -1) {
    recommendations.push('Focus sullo stress: dedica qualche minuto extra alle tecniche di respirazione e rilassamento.')
  }

  if (wellnessTrends.energy_levels < -1) {
    recommendations.push('Per migliorare l\'energia: considera micro-pause più frequenti e attività di movimento leggero.')
  }

  if (wellnessTrends.sleep_quality < -1) {
    recommendations.push('Per il sonno: prova a seguire una routine serale più strutturata e limita gli schermi prima di dormire.')
  }

  // Achievement recommendations
  if (engagementMetrics.achievement_celebration_rate < 0.5) {
    recommendations.push('Non dimenticare di celebrare i tuoi progressi! Anche i piccoli traguardi meritano riconoscimento.')
  }

  // Default positive reinforcement
  if (recommendations.length === 0) {
    recommendations.push('Continua il tuo ottimo lavoro! I dati mostrano un percorso di benessere equilibrato.')
    recommendations.push('Piccole azioni quotidiane portano a grandi risultati nel tempo.')
  }

  return recommendations.slice(0, 8) // Limit to max 8 recommendations
}
