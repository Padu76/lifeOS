// =====================================================
// LifeOS Edge Function: initialize-user-profile
// File: initialize-user-profile/index.ts
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface InitializationRequest {
  // Basic profile information
  chronotype?: 'early_bird' | 'night_owl' | 'intermediate';
  sensitivity_level?: 'gentle' | 'moderate' | 'enthusiastic';
  focus_areas?: string[];

  // Notification preferences
  intervention_frequency?: 'minimal' | 'balanced' | 'frequent';
  preferred_tone?: 'gentle' | 'encouraging' | 'casual' | 'formal' | 'adaptive';
  quiet_hours?: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };

  // Initial health data (optional)
  initial_life_score?: {
    stress: number;
    energy: number;
    sleep: number;
    overall: number;
  };

  // Onboarding survey responses
  primary_goals?: string[];
  wellness_experience?: 'beginner' | 'intermediate' | 'advanced';
  available_time_per_day?: number; // minutes
  notification_preference?: 'frequent' | 'moderate' | 'minimal';
}

interface InitializationResponse {
  user_profile: {
    wellness_profile_id: string;
    preferences_id: string;
    pattern_learning_id: string;
  };
  initial_streaks: Array<{
    type: string;
    category: string;
  }>;
  welcome_achievements: Array<{
    title: string;
    description: string;
  }>;
  first_advice?: {
    content: string;
    category: string;
    timing: string;
  };
  onboarding_complete: boolean;
  next_steps: string[];
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

    // Parse request body
    const initData: InitializationRequest = await req.json()

    console.log(`Initializing user profile for: ${user.id}`)

    // Check if user is already initialized
    const existingProfile = await checkExistingProfile(supabaseClient, user.id)
    if (existingProfile.exists) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User profile already initialized',
          data: existingProfile.profile
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create wellness profile
    const wellnessProfile = await createWellnessProfile(supabaseClient, user.id, initData)
    
    // Create user preferences
    const userPreferences = await createUserPreferences(supabaseClient, user.id, initData)
    
    // Create pattern learning data
    const patternLearning = await createPatternLearningData(supabaseClient, user.id)
    
    // Create initial streaks
    const initialStreaks = await createInitialStreaks(supabaseClient, user.id)
    
    // Create welcome achievements
    const welcomeAchievements = await createWelcomeAchievements(supabaseClient, user.id, initData)
    
    // Generate first micro-advice if requested
    let firstAdvice = null
    if (initData.initial_life_score) {
      firstAdvice = await generateFirstAdvice(supabaseClient, user.id, initData)
    }

    // Generate personalized next steps
    const nextSteps = generateNextSteps(initData)

    const response: InitializationResponse = {
      user_profile: {
        wellness_profile_id: wellnessProfile.id,
        preferences_id: userPreferences.id,
        pattern_learning_id: patternLearning.id
      },
      initial_streaks: initialStreaks,
      welcome_achievements: welcomeAchievements,
      first_advice: firstAdvice,
      onboarding_complete: true,
      next_steps: nextSteps
    }

    console.log(`Successfully initialized profile for user: ${user.id}`)

    return new Response(
      JSON.stringify({ success: true, data: response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in initialize-user-profile:', error)
    
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

async function checkExistingProfile(supabase: any, userId: string) {
  const { data: existingProfile } = await supabase
    .from('user_wellness_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingProfile) {
    // Load complete profile data
    const profileData = await loadCompleteProfile(supabase, userId)
    return { exists: true, profile: profileData }
  }

  return { exists: false, profile: null }
}

async function loadCompleteProfile(supabase: any, userId: string) {
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

  return { profile, preferences, streaks }
}

async function createWellnessProfile(supabase: any, userId: string, initData: InitializationRequest) {
  // Determine optimal timing based on chronotype
  const timingPreferences = getTimingPreferences(initData.chronotype || 'intermediate')
  
  const profileData = {
    user_id: userId,
    chronotype: initData.chronotype || 'intermediate',
    natural_wake_time: timingPreferences.wake_time,
    natural_sleep_time: timingPreferences.sleep_time,
    peak_energy_hours: timingPreferences.peak_energy_hours,
    low_energy_hours: timingPreferences.low_energy_hours,
    stress_peak_hours: timingPreferences.stress_peak_hours,
    sensitivity_level: initData.sensitivity_level || 'moderate',
    celebration_frequency: mapNotificationTocelebration(initData.notification_preference || 'moderate'),
    focus_areas: initData.focus_areas || ['stress_management', 'energy', 'sleep'],
    wellness_trends: {
      stress_pattern: [],
      energy_pattern: [],
      sleep_pattern: [],
      overall_trend: 'stable'
    },
    historical_effectiveness: {}
  }

  const { data, error } = await supabase
    .from('user_wellness_profiles')
    .insert(profileData)
    .select()
    .single()

  if (error) {
    console.error('Failed to create wellness profile:', error)
    throw new Error('Failed to create wellness profile')
  }

  return data
}

async function createUserPreferences(supabase: any, userId: string, initData: InitializationRequest) {
  const preferencesData = {
    user_id: userId,
    notifications_enabled: true,
    notification_categories: {
      stress_relief: true,
      energy_boost: true,
      sleep_prep: true,
      celebration: true,
      emergency: true
    },
    quiet_hours_enabled: initData.quiet_hours?.enabled ?? true,
    quiet_hours_start: initData.quiet_hours?.start_time || '22:00',
    quiet_hours_end: initData.quiet_hours?.end_time || '07:00',
    max_daily_notifications: mapFrequencyToDaily(initData.intervention_frequency || 'balanced'),
    min_notification_gap_minutes: mapFrequencyToGap(initData.intervention_frequency || 'balanced'),
    respect_dnd: true,
    language_code: 'it',
    preferred_tone: initData.preferred_tone || 'adaptive',
    intervention_frequency: initData.intervention_frequency || 'balanced',
    emergency_interventions_enabled: true,
    push_notifications_enabled: true,
    in_app_only: false,
    email_backup_enabled: false,
    streaks_enabled: true,
    achievements_enabled: true,
    celebrations_enabled: true,
    progress_sharing_enabled: false
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .insert(preferencesData)
    .select()
    .single()

  if (error) {
    console.error('Failed to create user preferences:', error)
    throw new Error('Failed to create user preferences')
  }

  return data
}

async function createPatternLearningData(supabase: any, userId: string) {
  const patternData = {
    user_id: userId,
    response_rates_by_hour: {},
    completion_rates_by_day: {},
    effectiveness_by_context: {},
    optimal_intervention_windows: [],
    timing_accuracy_score: 0,
    consecutive_dismissals: 0,
    declining_engagement: false,
    fatigue_score: 0,
    total_sessions: 0,
    completed_sessions: 0,
    average_response_time_minutes: 0,
    preferred_categories: [],
    model_version: 'v1.0',
    prediction_accuracy: 0
  }

  const { data, error } = await supabase
    .from('pattern_learning_data')
    .insert(patternData)
    .select()
    .single()

  if (error) {
    console.error('Failed to create pattern learning data:', error)
    throw new Error('Failed to create pattern learning data')
  }

  return data
}

async function createInitialStreaks(supabase: any, userId: string) {
  const initialStreaks = [
    {
      user_id: userId,
      streak_type: 'consecutive',
      category: 'checkin',
      current_count: 0,
      best_count: 0,
      pattern_strength: 0,
      is_active: true,
      celebration_pending: false
    },
    {
      user_id: userId,
      streak_type: 'pattern',
      category: 'consistency',
      current_count: 0,
      best_count: 0,
      pattern_strength: 0,
      is_active: true,
      celebration_pending: false
    },
    {
      user_id: userId,
      streak_type: 'improvement',
      category: 'stress_mgmt',
      current_count: 0,
      best_count: 0,
      pattern_strength: 0,
      is_active: true,
      celebration_pending: false
    }
  ]

  const { data, error } = await supabase
    .from('user_streaks')
    .insert(initialStreaks)
    .select()

  if (error) {
    console.error('Failed to create initial streaks:', error)
    throw new Error('Failed to create initial streaks')
  }

  return data.map((streak: any) => ({
    type: streak.streak_type,
    category: streak.category
  }))
}

async function createWelcomeAchievements(supabase: any, userId: string, initData: InitializationRequest) {
  const welcomeAchievements = [
    {
      user_id: userId,
      achievement_key: 'welcome_aboard',
      title: 'Benvenuto in LifeOS! 🌟',
      description: 'Hai completato l\'onboarding e iniziato il tuo percorso di benessere personalizzato.',
      category: 'milestone',
      rarity: 'common',
      is_earned: true,
      earned_date: new Date().toISOString(),
      progress: 1.0,
      criteria: { metric: 'onboarding', target_value: 1 },
      personal_significance: 0.9,
      celebration_style: 'warm'
    }
  ]

  // Add experience-based achievement
  if (initData.wellness_experience === 'beginner') {
    welcomeAchievements.push({
      user_id: userId,
      achievement_key: 'first_steps',
      title: 'Primi Passi 👶',
      description: 'Ogni esperto è stato un principiante. Il tuo viaggio verso il benessere inizia qui!',
      category: 'effort',
      rarity: 'common',
      is_earned: true,
      earned_date: new Date().toISOString(),
      progress: 1.0,
      criteria: { metric: 'experience_level', target_value: 1 },
      personal_significance: 0.8,
      celebration_style: 'encouraging'
    })
  } else if (initData.wellness_experience === 'advanced') {
    welcomeAchievements.push({
      user_id: userId,
      achievement_key: 'wellness_veteran',
      title: 'Esperto del Benessere 🏆',
      description: 'La tua esperienza nel benessere è preziosa. Ora hai strumenti ancora più avanzati!',
      category: 'progress',
      rarity: 'uncommon',
      is_earned: true,
      earned_date: new Date().toISOString(),
      progress: 1.0,
      criteria: { metric: 'experience_level', target_value: 3 },
      personal_significance: 0.9,
      celebration_style: 'proud'
    })
  }

  // Add goal-based achievement
  if (initData.primary_goals && initData.primary_goals.length > 0) {
    welcomeAchievements.push({
      user_id: userId,
      achievement_key: 'goal_setter',
      title: 'Obiettivi Chiari 🎯',
      description: `Hai definito ${initData.primary_goals.length} obiettivi per il tuo benessere. La chiarezza è il primo passo verso il successo!`,
      category: 'effort',
      rarity: 'common',
      is_earned: true,
      earned_date: new Date().toISOString(),
      progress: 1.0,
      criteria: { metric: 'goals_set', target_value: initData.primary_goals.length },
      personal_significance: 0.7,
      celebration_style: 'encouraging'
    })
  }

  const { data, error } = await supabase
    .from('user_achievements')
    .insert(welcomeAchievements)
    .select()

  if (error) {
    console.error('Failed to create welcome achievements:', error)
    throw new Error('Failed to create welcome achievements')
  }

  return data.map((achievement: any) => ({
    title: achievement.title,
    description: achievement.description
  }))
}

async function generateFirstAdvice(supabase: any, userId: string, initData: InitializationRequest) {
  if (!initData.initial_life_score) return null

  const { stress, energy, sleep, overall } = initData.initial_life_score

  // Determine first advice category based on initial state
  let category = 'mindfulness'
  let content = 'Benvenuto in LifeOS! Iniziamo con un momento di presenza consapevole. 🧘'

  if (stress >= 7) {
    category = 'stress_relief'
    content = 'Vedo che lo stress è alto oggi. Iniziamo con 3 respiri profondi insieme. Inspira... trattieni... espira lentamente. 💙'
  } else if (energy <= 3) {
    category = 'energy_boost'
    content = 'I livelli di energia sembrano bassi. Che ne dici di 5 jumping jacks per attivarci? Piccole azioni, grandi risultati! ⚡'
  } else if (sleep <= 4) {
    category = 'sleep_prep'
    content = 'Il sonno è importante per il benessere. Stasera prova la respirazione 4-7-8 prima di dormire. 🌙'
  } else if (overall >= 7) {
    category = 'celebration'
    content = 'Che bello iniziare con energia positiva! 🌟 Mantieni questo ritmo e celebra i piccoli momenti di benessere.'
  }

  // Create the first advice session
  const sessionData = {
    user_id: userId,
    session_timestamp: new Date().toISOString(),
    life_score: initData.initial_life_score,
    health_metrics: { 
      timestamp: new Date().toISOString(),
      source: 'onboarding',
      initial_assessment: true 
    },
    advice_content: content,
    advice_category: category,
    advice_tone: initData.preferred_tone || 'warm',
    template_id: 'onboarding_first_advice',
    personalization_score: 0.8,
    predicted_effectiveness: 0.8,
    optimal_timing: {
      suggested_time: new Date().toISOString(),
      confidence_score: 0.9,
      urgency_level: 'low',
      reasoning: 'Welcome advice during onboarding'
    },
    timing_confidence: 0.9,
    urgency_level: 'low'
  }

  const { data, error } = await supabase
    .from('micro_advice_sessions')
    .insert(sessionData)
    .select()
    .single()

  if (error) {
    console.error('Failed to create first advice session:', error)
    return null
  }

  return {
    content: content,
    category: category,
    timing: 'immediate'
  }
}

function generateNextSteps(initData: InitializationRequest): string[] {
  const steps: string[] = []

  // Always include basic steps
  steps.push('Fai il tuo primo check-in giornaliero per iniziare a tracciare il tuo benessere')
  
  if (initData.wellness_experience === 'beginner') {
    steps.push('Esplora i tutorial guidati per imparare tecniche di respirazione e rilassamento')
    steps.push('Inizia con micro-consigli brevi (2-3 minuti) per costruire l\'abitudine')
  } else {
    steps.push('Personalizza le tue preferenze di notifica nella sezione impostazioni')
    steps.push('Sperimenta con diverse categorie di micro-consigli per trovare le più efficaci')
  }

  // Goal-specific steps
  if (initData.primary_goals?.includes('stress_management')) {
    steps.push('Prova la tecnica di respirazione 4-7-8 durante i momenti di stress')
  }
  
  if (initData.primary_goals?.includes('energy_improvement')) {
    steps.push('Imposta promemoria per micro-pause energizzanti durante la giornata')
  }
  
  if (initData.primary_goals?.includes('sleep_quality')) {
    steps.push('Stabilisci una routine serale con i consigli di preparazione al sonno')
  }

  // Frequency-specific steps
  if (initData.intervention_frequency === 'frequent') {
    steps.push('Tieni il telefono a portata di mano per ricevere i micro-consigli durante la giornata')
  } else if (initData.intervention_frequency === 'minimal') {
    steps.push('Controlla l\'app 1-2 volte al giorno per i consigli mirati')
  }

  steps.push('Ritorna domani per continuare il tuo percorso di benessere! 🌱')

  return steps
}

// =====================================================
// Utility Functions
// =====================================================

function getTimingPreferences(chronotype: string) {
  switch (chronotype) {
    case 'early_bird':
      return {
        wake_time: '06:00',
        sleep_time: '22:00',
        peak_energy_hours: [6, 7, 8, 9, 10],
        low_energy_hours: [13, 14, 20, 21],
        stress_peak_hours: [9, 14, 17]
      }
    
    case 'night_owl':
      return {
        wake_time: '08:30',
        sleep_time: '00:00',
        peak_energy_hours: [10, 11, 15, 16, 19, 20],
        low_energy_hours: [7, 8, 13, 14],
        stress_peak_hours: [10, 15, 18]
      }
    
    default: // intermediate
      return {
        wake_time: '07:00',
        sleep_time: '23:00',
        peak_energy_hours: [9, 10, 11, 15, 16],
        low_energy_hours: [13, 14, 22, 23],
        stress_peak_hours: [10, 14, 18]
      }
  }
}

function mapNotificationTocelebration(notificationPref: string): string {
  switch (notificationPref) {
    case 'frequent': return 'frequent'
    case 'minimal': return 'minimal'
    default: return 'balanced'
  }
}

function mapFrequencyToDaily(frequency: string): number {
  switch (frequency) {
    case 'minimal': return 2
    case 'frequent': return 8
    default: return 5
  }
}

function mapFrequencyToGap(frequency: string): number {
  switch (frequency) {
    case 'minimal': return 240 // 4 hours
    case 'frequent': return 60  // 1 hour
    default: return 120 // 2 hours
  }
}
