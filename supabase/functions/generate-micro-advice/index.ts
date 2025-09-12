// =====================================================
// LifeOS Edge Function: generate-micro-advice (Ultra-Simple)
// File: generate-micro-advice/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

    console.log(`Generating simple micro-advice for user: ${user.id}`)
    console.log('Current metrics:', current_metrics)
    console.log('Current life score:', current_life_score)

    // Analyze intervention need (no database)
    const interventionAnalysis = analyzeInterventionNeed(current_life_score, force_immediate)

    // Generate advice (no database)
    const advice = generateAdvice(interventionAnalysis, current_life_score)

    // Calculate timing (no database)
    const timing = calculateTiming(interventionAnalysis)

    // Generate session ID
    const sessionId = crypto.randomUUID()

    // Build simple response
    const response = {
      session_id: sessionId,
      advice: {
        content: advice.content,
        tone: advice.tone,
        template_id: advice.template_id,
        personalization_score: advice.personalization_score,
        predicted_effectiveness: advice.predicted_effectiveness
      },
      timing: {
        suggested_time: timing.suggested_time,
        confidence_score: timing.confidence_score,
        urgency_level: timing.urgency_level,
        reasoning: timing.reasoning
      },
      gamification: {
        streaks: [],
        new_achievements: [],
        celebration: null
      },
      notification: {
        scheduled: false
      },
      next_advice_eta: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    }

    console.log('Generated advice successfully:', advice.content)

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
// Simplified Helper Functions (No Database)
// =====================================================

function analyzeInterventionNeed(lifeScore: LifeScoreV2, forceImmediate: boolean) {
  if (forceImmediate) {
    return {
      intervention_needed: true,
      intervention_type: 'stress_relief',
      urgency_level: 'emergency'
    }
  }

  const { stress, energy, sleep, overall } = lifeScore

  // High stress
  if (stress >= 7) {
    return {
      intervention_needed: true,
      intervention_type: 'stress_relief',
      urgency_level: stress >= 9 ? 'emergency' : 'high'
    }
  }

  // Low energy
  if (energy <= 4) {
    return {
      intervention_needed: true,
      intervention_type: 'energy_boost',
      urgency_level: 'medium'
    }
  }

  // Poor sleep (evening)
  const hour = new Date().getHours()
  if (sleep <= 5 && hour >= 18) {
    return {
      intervention_needed: true,
      intervention_type: 'sleep_prep',
      urgency_level: 'medium'
    }
  }

  // Good state - celebration
  if (overall >= 8 && energy >= 7) {
    return {
      intervention_needed: true,
      intervention_type: 'celebration',
      urgency_level: 'low'
    }
  }

  // Default mindfulness
  return {
    intervention_needed: true,
    intervention_type: 'mindfulness',
    urgency_level: 'low'
  }
}

function generateAdvice(interventionAnalysis: any, lifeScore: LifeScoreV2) {
  const messages = {
    stress_relief: [
      "Vedo che lo stress è alto oggi. Prova 3 respiri profondi - sei più forte di quanto pensi! 💙",
      "Momento difficile? Una micro-pausa di 2 minuti può aiutare. Non c'è fretta 🌸",
      "Oggi è pesante. Fermati un attimo e ascolta il tuo corpo. Va bene non essere sempre al top 💙"
    ],
    energy_boost: [
      "Tempo di muoversi! 5 jumping jacks ti daranno la carica in 2-3 minuti ⚡",
      "La tua energia può salire! Una camminata veloce di 3 minuti? Il corpo ti ringrazierà",
      "Hai voglia di fare! Balla la tua canzone preferita. Small action, big impact ⚡"
    ],
    sleep_prep: [
      "La giornata volge al termine. La respirazione 4-7-8 è perfetta ora per dormire meglio 🌙",
      "Ora di rallentare il ritmo. 5 minuti di stretching dolce? Il sonno di qualità è un investimento 😌",
      "Il corpo ha bisogno di riposare. Un po' di journaling per svuotare la mente? 🌙"
    ],
    celebration: [
      "Fantastico! 🎉 I progressi sono evidenti. Mantieni questo ritmo!",
      "Sei on fire! 🔥 La costanza sta pagando. Un altro piccolo step oggi?",
      "Grande lavoro! 👏 Stai costruendo abitudini solide. Keep going! 🌟"
    ],
    mindfulness: [
      "Un momento mindful per te 🧘 Che ne dici di 2 minuti di respirazione consapevole?",
      "Tempo di centrare te stesso ✨ Una mini-meditazione può fare la differenza",
      "Pausa presenza 🌅 Ascolta il tuo respiro per qualche momento"
    ]
  }

  const categoryMessages = messages[interventionAnalysis.intervention_type as keyof typeof messages] || messages.mindfulness
  const selectedMessage = categoryMessages[Math.floor(Math.random() * categoryMessages.length)]

  return {
    content: selectedMessage,
    tone: 'warm',
    template_id: `${interventionAnalysis.intervention_type}_simple`,
    personalization_score: 0.8,
    predicted_effectiveness: 0.85
  }
}

function calculateTiming(interventionAnalysis: any) {
  const now = new Date()
  const hour = now.getHours()
  
  let suggestedTime = new Date(now)
  let confidence = 0.8
  let reasoning = 'Timing ottimizzato per il tipo di intervento'

  // Emergency - immediate
  if (interventionAnalysis.urgency_level === 'emergency') {
    confidence = 0.95
    reasoning = 'Intervento immediato necessario'
  }
  // Energy boost - avoid late hours
  else if (interventionAnalysis.intervention_type === 'energy_boost' && hour >= 20) {
    suggestedTime.setDate(suggestedTime.getDate() + 1)
    suggestedTime.setHours(9, 0, 0, 0)
    confidence = 0.9
    reasoning = 'Programmato per domattina per massimo beneficio energetico'
  }
  // Sleep prep - perfect in evening
  else if (interventionAnalysis.intervention_type === 'sleep_prep' && hour >= 18) {
    confidence = 0.95
    reasoning = 'Timing perfetto per la preparazione al sonno'
  }

  return {
    suggested_time: suggestedTime.toISOString(),
    confidence_score: confidence,
    urgency_level: interventionAnalysis.urgency_level,
    reasoning
  }
}