// =====================================================
// LifeOS Edge Functions - Complete Integration
// File: generate-micro-advice/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Import orchestrator and types (simplified for Edge Functions)
interface HealthMetrics {
  timestamp: string;
  stress_level?: number;
  energy_level?: number;
  sleep_quality?: number;
  mood?: string;
  [key: string]: any;
}

interface LifeScoreV2 {
  stress: number;
  energy: number;
  sleep: number;
  overall: number;
}

interface AdviceResponse {
  session_id: string;
  advice: {
    content: string;
    tone: string;
    template_id: string;
    personalization_score: number;
    predicted_effectiveness: number;
  };
  timing: {
    suggested_time: string;
    confidence_score: number;
    urgency_level: string;
    reasoning: string;
  };
  gamification: {
    streaks: any[];
    new_achievements: any[];
    celebration?: any;
  };
  notification: {
    scheduled: boolean;
    scheduled_time?: string;
    notification_id?: string;
  };
  next_advice_eta?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
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

    // Parse request body
    const { 
      current_metrics, 
      current_life_score, 
      force_immediate = false,
      preferred_category 
    } = await req.json()

    // Validate required inputs
    if (!current_metrics || !current_life_score) {
      throw new Error('Missing required fields: current_metrics, current_life_score')
    }

    console.log(`Generating micro-advice for user: ${user.id}`)

    // Load user wellness profile
    const userProfile = await loadUserWellnessProfile(supabaseClient, user.id)
    
    // Determine intervention need
    const interventionAnalysis = analyzeInterventionNeed(
      current_life_score,
      current_metrics,
      userProfile,
      force_immediate
    )

    if (!interventionAnalysis.intervention_needed && !force_immediate) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No intervention needed at this time',
          next_check_eta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Generate empathetic message
    const advice = generateEmpatheticMessage(
      interventionAnalysis.intervention_type,
      current_life_score,
      current_metrics,
      userProfile
    )

    // Determine optimal timing
    const optimalTiming = calculateOptimalTiming(
      user.id,
      userProfile,
      current_life_score,
      interventionAnalysis.intervention_type
    )

    // Update gamification elements
    const gamificationUpdate = await updateGamificationElements(
      supabaseClient,
      user.id,
      current_metrics,
      current_life_score,
      userProfile
    )

    // Schedule notification if needed
    let notificationResult = { scheduled: false }
    if (!force_immediate && shouldScheduleNotification(optimalTiming)) {
      notificationResult = await scheduleNotification(
        supabaseClient,
        user.id,
        advice,
        optimalTiming,
        userProfile
      )
    }

    // Create session record
    const sessionId = await createAdviceSession(
      supabaseClient,
      {
        user_id: user.id,
        current_metrics,
        current_life_score,
        advice,
        optimalTiming,
        gamificationUpdate,
        notificationResult
      }
    )

    // Calculate next advice ETA
    const nextAdviceEta = calculateNextAdviceEta(userProfile)

    // Build response
    const response: AdviceResponse = {
      session_id: sessionId,
      advice: {
        content: advice.content,
        tone: advice.tone,
        template_id: advice.template_id || 'default',
        personalization_score: advice.personalization_score || 0.7,
        predicted_effectiveness: advice.predicted_effectiveness || 0.8
      },
      timing: {
        suggested_time: optimalTiming.suggested_time.toISOString(),
        confidence_score: optimalTiming.confidence_score,
        urgency_level: optimalTiming.urgency_level,
        reasoning: optimalTiming.reasoning
      },
      gamification: {
        streaks: gamificationUpdate.streaks_updated,
        new_achievements: gamificationUpdate.achievements_earned,
        celebration: gamificationUpdate.celebration
      },
      notification: notificationResult,
      next_advice_eta: nextAdviceEta.toISOString()
    }

    console.log(`Successfully generated micro-advice for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in generate-micro-advice:', error)
    
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
// Helper Functions for Micro-Advice Generation
// =====================================================

async function loadUserWellnessProfile(supabase: any, userId: string) {
  // Load user wellness profile with all necessary data
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

  const { data: streaks } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  const { data: achievements } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .eq('is_earned', true)

  const { data: patternData } = await supabase
    .from('pattern_learning_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  return {
    profile: profile || {},
    preferences: preferences || {},
    streaks: streaks || [],
    achievements: achievements || [],
    patternData: patternData || {}
  }
}

function analyzeInterventionNeed(
  lifeScore: LifeScoreV2,
  metrics: HealthMetrics,
  userProfile: any,
  forceImmediate: boolean
) {
  if (forceImmediate) {
    return {
      intervention_needed: true,
      intervention_type: 'stress_relief',
      urgency_level: 'emergency',
      reasoning: 'Immediate intervention requested'
    }
  }

  const { stress, energy, sleep, overall } = lifeScore

  // Emergency situations
  if (stress >= 9 || overall <= 2) {
    return {
      intervention_needed: true,
      intervention_type: 'stress_relief',
      urgency_level: 'emergency',
      reasoning: 'Critical stress levels detected'
    }
  }

  // High priority
  if (stress >= 7 || overall <= 3) {
    return {
      intervention_needed: true,
      intervention_type: 'stress_relief',
      urgency_level: 'high',
      reasoning: 'High stress levels detected'
    }
  }

  // Medium priority - energy issues
  if (energy <= 3 && stress < 6) {
    return {
      intervention_needed: true,
      intervention_type: 'energy_boost',
      urgency_level: 'medium',
      reasoning: 'Low energy levels detected'
    }
  }

  // Sleep preparation (evening time)
  const hour = new Date().getHours()
  if (sleep <= 4 && hour >= 18 && hour <= 23) {
    return {
      intervention_needed: true,
      intervention_type: 'sleep_prep',
      urgency_level: 'medium',
      reasoning: 'Poor sleep quality and evening time'
    }
  }

  // Positive interventions
  if (overall >= 7 && energy >= 7) {
    return {
      intervention_needed: true,
      intervention_type: 'celebration',
      urgency_level: 'low',
      reasoning: 'Good opportunity for positive reinforcement'
    }
  }

  // Default mindfulness
  if (overall >= 5) {
    return {
      intervention_needed: true,
      intervention_type: 'mindfulness',
      urgency_level: 'low',
      reasoning: 'Good time for mindfulness practice'
    }
  }

  return {
    intervention_needed: false,
    intervention_type: 'none',
    urgency_level: 'low',
    reasoning: 'No intervention needed at this time'
  }
}

function generateEmpatheticMessage(
  interventionType: string,
  lifeScore: LifeScoreV2,
  metrics: HealthMetrics,
  userProfile: any
) {
  // Simplified message generation based on intervention type
  const messages = {
    stress_relief: [
      "Ehi, vedo che lo stress è un po' alto oggi. Che ne dici di 3 respiri profondi? Sei più forte di quanto pensi 💙",
      "So che è dura oggi. Una micro-pausa di 2 minuti potrebbe aiutare. Non c'è fretta 🌸",
      "Oggi sembra pesante. Prova a fermarti un attimo e ascoltare il tuo corpo. Va bene non essere sempre al top 💙"
    ],
    energy_boost: [
      "Ottimo momento per muoversi! 5 jumping jacks ti daranno la carica. Bastano davvero 2-3 minuti ⚡",
      "La tua energia sta salendo 📈 Una camminata veloce di 3 minuti? Il tuo corpo ti ringrazierà",
      "Sento che hai voglia di fare! Balla la tua canzone preferita. Small action, big impact ⚡"
    ],
    sleep_prep: [
      "La giornata volge al termine. La respirazione 4-7-8 è perfetta ora. Ti aiuterà a dormire meglio 🌙",
      "È ora di rallentare il ritmo. 5 minuti di stretching dolce? Il sonno di qualità è il miglior investimento 😌",
      "Il tuo corpo ha bisogno di riposare. Un po' di journaling per svuotare la mente? Domani ti sveglierai più riposato 🌙"
    ],
    celebration: [
      "Fantastico! 🎉 I progressi sono evidenti. Mantieni questo ritmo! Il momentum è dalla tua parte",
      "Sei on fire! 🔥 La costanza sta pagando. Un altro piccolo step oggi? Ogni giorno diventa più facile",
      "Grande lavoro! 👏 Stai costruendo abitudini solide. Keep going! 🌟"
    ],
    mindfulness: [
      "Un momento mindful per te 🧘 Che ne dici di 2 minuti di respirazione consapevole?",
      "Tempo di centrare te stesso ✨ Una mini-meditazione può fare la differenza",
      "Pausa presenza 🌅 Ascolta il tuo respiro per qualche momento"
    ]
  }

  const categoryMessages = messages[interventionType as keyof typeof messages] || messages.mindfulness
  const selectedMessage = categoryMessages[Math.floor(Math.random() * categoryMessages.length)]

  return {
    content: selectedMessage,
    tone: userProfile.preferences?.preferred_tone || 'warm',
    template_id: `${interventionType}_${Math.floor(Math.random() * 3)}`,
    personalization_score: 0.8,
    predicted_effectiveness: 0.75 + Math.random() * 0.2
  }
}

function calculateOptimalTiming(
  userId: string,
  userProfile: any,
  lifeScore: LifeScoreV2,
  interventionType: string
) {
  const now = new Date()
  const hour = now.getHours()
  
  // Simple timing logic - in production would use full timing system
  let suggestedTime = new Date(now)
  let confidence = 0.7
  let reasoning = 'Standard timing based on current context'

  // Emergency - immediate
  if (lifeScore.stress >= 9 || lifeScore.overall <= 2) {
    confidence = 0.95
    reasoning = 'Emergency intervention - immediate delivery'
  }
  
  // Stress relief - avoid late evening unless urgent
  else if (interventionType === 'stress_relief' && hour >= 22) {
    suggestedTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour delay
    confidence = 0.6
    reasoning = 'Delayed to avoid late evening stress intervention'
  }
  
  // Energy boost - avoid late hours
  else if (interventionType === 'energy_boost' && hour >= 20) {
    suggestedTime.setDate(suggestedTime.getDate() + 1)
    suggestedTime.setHours(9, 0, 0, 0) // Next morning
    confidence = 0.8
    reasoning = 'Scheduled for next morning for optimal energy boost'
  }
  
  // Sleep prep - evening is perfect
  else if (interventionType === 'sleep_prep' && hour >= 18 && hour <= 23) {
    confidence = 0.9
    reasoning = 'Perfect timing for sleep preparation'
  }

  return {
    suggested_time: suggestedTime,
    confidence_score: confidence,
    urgency_level: lifeScore.stress >= 9 ? 'emergency' : 
                   lifeScore.stress >= 7 ? 'high' : 'medium',
    reasoning
  }
}

async function updateGamificationElements(
  supabase: any,
  userId: string,
  metrics: HealthMetrics,
  lifeScore: LifeScoreV2,
  userProfile: any
) {
  // Update check-in streak
  const streakResult = await supabase.rpc('update_user_streak', {
    p_user_id: userId,
    p_streak_type: 'consecutive',
    p_category: 'checkin',
    p_increment: true
  })

  // Check for new achievements (simplified)
  const newAchievements = []
  
  // Example: First advice completion achievement
  const totalSessions = await supabase
    .from('micro_advice_sessions')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)

  if (totalSessions.count === 1) {
    const achievement = {
      achievement_key: 'first_advice',
      title: 'Primo Passo',
      description: 'Hai completato il tuo primo micro-consiglio LifeOS!',
      category: 'milestone',
      rarity: 'common'
    }
    
    await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        ...achievement,
        is_earned: true,
        earned_date: new Date().toISOString(),
        progress: 1.0
      })
    
    newAchievements.push(achievement)
  }

  // Create celebration if warranted
  let celebration = null
  if (newAchievements.length > 0 || (streakResult.data && streakResult.data[0]?.celebration_triggered)) {
    celebration = {
      id: crypto.randomUUID(),
      type: newAchievements.length > 0 ? 'achievement_earned' : 'streak_milestone',
      message: newAchievements.length > 0 ? 
        `🎉 ${newAchievements[0].title}! ${newAchievements[0].description}` :
        `🔥 Streak di ${streakResult.data[0]?.current_count} giorni! Fantastico!`,
      visual_style: 'gentle_glow',
      emotional_tone: 'proud',
      timing: 'immediate'
    }
    
    await supabase
      .from('celebration_moments')
      .insert({
        user_id: userId,
        celebration_type: celebration.type,
        message: celebration.message,
        visual_style: celebration.visual_style,
        emotional_tone: celebration.emotional_tone,
        timing_preference: celebration.timing
      })
  }

  return {
    streaks_updated: streakResult.data || [],
    achievements_earned: newAchievements,
    celebration
  }
}

function shouldScheduleNotification(optimalTiming: any): boolean {
  const delayMs = optimalTiming.suggested_time.getTime() - Date.now()
  return delayMs > (5 * 60 * 1000) // More than 5 minutes delay
}

async function scheduleNotification(
  supabase: any,
  userId: string,
  advice: any,
  timing: any,
  userProfile: any
) {
  // Create notification schedule record
  const notificationId = crypto.randomUUID()
  
  const { error } = await supabase
    .from('notification_schedules')
    .insert({
      id: notificationId,
      user_id: userId,
      notification_type: 'micro_advice',
      title: '💡 Micro consiglio per te',
      body: advice.content,
      scheduled_time: timing.suggested_time.toISOString(),
      status: 'scheduled',
      priority: timing.urgency_level,
      notification_payload: {
        advice_content: advice.content,
        advice_tone: advice.tone,
        deep_link: 'lifeos://advice'
      }
    })

  if (error) {
    console.error('Failed to schedule notification:', error)
    return { scheduled: false }
  }

  return {
    scheduled: true,
    scheduled_time: timing.suggested_time.toISOString(),
    notification_id: notificationId
  }
}

async function createAdviceSession(supabase: any, params: any) {
  const sessionId = crypto.randomUUID()
  
  const { error } = await supabase
    .from('micro_advice_sessions')
    .insert({
      id: sessionId,
      user_id: params.user_id,
      session_timestamp: new Date().toISOString(),
      life_score: params.current_life_score,
      health_metrics: params.current_metrics,
      advice_content: params.advice.content,
      advice_category: params.optimalTiming.urgency_level === 'emergency' ? 'stress_relief' : 'mindfulness',
      advice_tone: params.advice.tone,
      template_id: params.advice.template_id,
      personalization_score: params.advice.personalization_score,
      predicted_effectiveness: params.advice.predicted_effectiveness,
      optimal_timing: params.optimalTiming,
      timing_confidence: params.optimalTiming.confidence_score,
      urgency_level: params.optimalTiming.urgency_level,
      notification_scheduled: params.notificationResult.scheduled,
      notification_id: params.notificationResult.notification_id,
      scheduled_time: params.notificationResult.scheduled_time
    })

  if (error) {
    console.error('Failed to create advice session:', error)
    throw new Error('Failed to create session record')
  }

  return sessionId
}

function calculateNextAdviceEta(userProfile: any): Date {
  // Simple calculation - in production would use full timing system
  const preferences = userProfile.preferences || {}
  const frequency = preferences.intervention_frequency || 'balanced'
  
  let hoursDelay = 4 // Default 4 hours
  
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

  return new Date(Date.now() + hoursDelay * 60 * 60 * 1000)
}

// =====================================================
// Additional Edge Functions
// =====================================================

// File: handle-advice-response/index.ts
// This would be a separate Edge Function file

// File: get-wellness-dashboard/index.ts  
// This would be a separate Edge Function file

// File: update-user-preferences/index.ts
// This would be a separate Edge Function file

// File: get-system-analytics/index.ts
// This would be a separate Edge Function file

// File: initialize-user-profile/index.ts
// This would be a separate Edge Function file

// =====================================================
// Shared utilities (_shared/cors.ts)
// =====================================================

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}
