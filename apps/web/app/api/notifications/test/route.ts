import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface TestNotificationRequest {
  type: 'immediate' | 'scheduled' | 'optimal_timing';
  category?: 'stress_relief' | 'energy_boost' | 'celebration' | 'mindfulness' | 'sleep_prep';
  message?: string;
  scheduled_time?: string;
}

interface TestNotificationResponse {
  id: string;
  type: string;
  category: string;
  message: string;
  scheduled_time?: string;
  delivery_context: {
    timing_analysis: any;
    emotional_context: any;
    effectiveness_prediction: number;
    confidence_score: number;
  };
  test_results: {
    appropriateness_score: number;
    personalization_score: number;
    predicted_engagement: number;
    reasoning: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from('test_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: testNotifications, error } = await query;

    if (error) {
      console.error('Error fetching test notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch test notifications' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: testNotifications,
      meta: {
        total: testNotifications.length,
        type: type || 'all'
      }
    });

  } catch (error) {
    console.error('Error in test notifications GET:', error);
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

    const body: TestNotificationRequest = await request.json();
    const { type, category = 'mindfulness', message, scheduled_time } = body;

    if (!type) {
      return NextResponse.json({ error: 'Test type required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user data for context
    const [
      { data: recentMetrics },
      { data: lifeScore },
      { data: emotionalState },
      { data: circadianProfile }
    ] = await Promise.all([
      supabase.from('health_metrics').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).single(),
      supabase.from('life_scores').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1).single(),
      supabase.from('emotional_states').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(1).single(),
      supabase.from('circadian_profiles').select('*').eq('user_id', userId).single()
    ]);

    // Prepare default data
    const defaultMetrics = recentMetrics || getDefaultMetrics();
    const defaultLifeScore = lifeScore || getDefaultLifeScore();
    const defaultEmotionalState = emotionalState || getDefaultEmotionalState();
    const defaultCircadianProfile = circadianProfile || getDefaultCircadianProfile();

    // Generate test notification based on type
    let testNotification: TestNotificationResponse;

    switch (type) {
      case 'immediate':
        testNotification = await generateImmediateTest(
          userId,
          category,
          message,
          defaultMetrics,
          defaultLifeScore,
          defaultEmotionalState
        );
        break;

      case 'scheduled':
        if (!scheduled_time) {
          return NextResponse.json({ error: 'Scheduled time required for scheduled test' }, { status: 400 });
        }
        testNotification = await generateScheduledTest(
          userId,
          category,
          message,
          scheduled_time,
          defaultMetrics,
          defaultLifeScore,
          defaultEmotionalState
        );
        break;

      case 'optimal_timing':
        testNotification = await generateOptimalTimingTest(
          userId,
          category,
          message,
          defaultMetrics,
          defaultLifeScore,
          defaultEmotionalState,
          defaultCircadianProfile
        );
        break;

      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }

    // Save test notification to database
    const { error: saveError } = await supabase
      .from('test_notifications')
      .insert({
        id: testNotification.id,
        user_id: userId,
        type: testNotification.type,
        category: testNotification.category,
        message: testNotification.message,
        scheduled_time: testNotification.scheduled_time,
        delivery_context: testNotification.delivery_context,
        test_results: testNotification.test_results,
        created_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('Error saving test notification:', saveError);
    }

    return NextResponse.json({
      success: true,
      data: testNotification,
      message: 'Test notification generated successfully'
    });

  } catch (error) {
    console.error('Error in test notifications POST:', error);
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

async function generateImmediateTest(
  userId: string,
  category: string,
  customMessage: string | undefined,
  metrics: any,
  lifeScore: any,
  emotionalState: any
): Promise<TestNotificationResponse> {
  const currentTime = new Date();
  const timeOfDay = getTimeOfDay(currentTime);
  
  // Analyze current context
  const timingAnalysis = analyzeCurrentTiming(currentTime, metrics, emotionalState);
  const emotionalContext = analyzeEmotionalContext(emotionalState, metrics);
  
  // Generate empathetic message
  const generatedMessage = customMessage || generateEmpatheticMessage(
    category,
    emotionalState.current_state || 'balanced',
    timeOfDay
  );

  // Calculate effectiveness scores
  const appropriatenessScore = calculateAppropriatenessScore(category, emotionalState, timingAnalysis);
  const personalizationScore = calculatePersonalizationScore(generatedMessage, emotionalState, metrics);
  const predictedEngagement = calculateEngagementPrediction(category, timingAnalysis, emotionalContext);

  return {
    id: crypto.randomUUID(),
    type: 'immediate',
    category,
    message: generatedMessage,
    delivery_context: {
      timing_analysis: timingAnalysis,
      emotional_context: emotionalContext,
      effectiveness_prediction: (appropriatenessScore + personalizationScore + predictedEngagement) / 3,
      confidence_score: Math.min(timingAnalysis.confidence * emotionalContext.confidence, 1.0)
    },
    test_results: {
      appropriateness_score: appropriatenessScore,
      personalization_score: personalizationScore,
      predicted_engagement: predictedEngagement,
      reasoning: `Immediate test for ${category} during ${timeOfDay}. ${emotionalState.current_state} state detected.`
    }
  };
}

async function generateScheduledTest(
  userId: string,
  category: string,
  customMessage: string | undefined,
  scheduledTime: string,
  metrics: any,
  lifeScore: any,
  emotionalState: any
): Promise<TestNotificationResponse> {
  const scheduleDate = new Date(scheduledTime);
  const timeOfDay = getTimeOfDay(scheduleDate);
  
  // Analyze scheduled timing
  const timingAnalysis = analyzeScheduledTiming(scheduleDate, metrics);
  const emotionalContext = analyzeEmotionalContext(emotionalState, metrics);
  
  // Generate message for future context
  const generatedMessage = customMessage || generateEmpatheticMessage(
    category,
    'balanced', // Assume balanced state for future scheduling
    timeOfDay
  );

  const appropriatenessScore = calculateAppropriatenessScore(category, emotionalState, timingAnalysis);
  const personalizationScore = calculatePersonalizationScore(generatedMessage, emotionalState, metrics);
  const predictedEngagement = calculateEngagementPrediction(category, timingAnalysis, emotionalContext);

  return {
    id: crypto.randomUUID(),
    type: 'scheduled',
    category,
    message: generatedMessage,
    scheduled_time: scheduledTime,
    delivery_context: {
      timing_analysis: timingAnalysis,
      emotional_context: emotionalContext,
      effectiveness_prediction: (appropriatenessScore + personalizationScore + predictedEngagement) / 3,
      confidence_score: timingAnalysis.confidence * 0.8 // Lower confidence for future prediction
    },
    test_results: {
      appropriateness_score: appropriatenessScore,
      personalization_score: personalizationScore,
      predicted_engagement: predictedEngagement,
      reasoning: `Scheduled test for ${category} at ${timeOfDay} on ${scheduleDate.toDateString()}.`
    }
  };
}

async function generateOptimalTimingTest(
  userId: string,
  category: string,
  customMessage: string | undefined,
  metrics: any,
  lifeScore: any,
  emotionalState: any,
  circadianProfile: any
): Promise<TestNotificationResponse> {
  // Find optimal timing using circadian profile
  const optimalTime = findOptimalDeliveryTime(category, circadianProfile, emotionalState);
  const timeOfDay = getTimeOfDay(optimalTime);
  
  const timingAnalysis = analyzeOptimalTiming(optimalTime, circadianProfile, emotionalState);
  const emotionalContext = analyzeEmotionalContext(emotionalState, metrics);
  
  // Generate optimally-timed message
  const generatedMessage = customMessage || generateEmpatheticMessage(
    category,
    emotionalState.current_state || 'balanced',
    timeOfDay
  );

  const appropriatenessScore = calculateAppropriatenessScore(category, emotionalState, timingAnalysis);
  const personalizationScore = calculatePersonalizationScore(generatedMessage, emotionalState, metrics);
  const predictedEngagement = calculateEngagementPrediction(category, timingAnalysis, emotionalContext);

  return {
    id: crypto.randomUUID(),
    type: 'optimal_timing',
    category,
    message: generatedMessage,
    scheduled_time: optimalTime.toISOString(),
    delivery_context: {
      timing_analysis: timingAnalysis,
      emotional_context: emotionalContext,
      effectiveness_prediction: (appropriatenessScore + personalizationScore + predictedEngagement) / 3,
      confidence_score: timingAnalysis.confidence * emotionalContext.confidence
    },
    test_results: {
      appropriateness_score: appropriatenessScore,
      personalization_score: personalizationScore,
      predicted_engagement: predictedEngagement,
      reasoning: `Optimal timing test for ${category}. Best delivery window identified at ${timeOfDay}.`
    }
  };
}

function generateEmpatheticMessage(category: string, emotionalState: string, timeOfDay: string): string {
  const messageTemplates = {
    stress_relief: {
      stressed: 'So che stai attraversando un momento difficile. Prenditi qualche minuto per respirare profondamente.',
      anxious: 'L\'ansia può essere travolgente. Ricorda che sei al sicuro e che questo momento passerà.',
      tired: 'Ti senti stanco? Un momento di relax può aiutarti a ritrovare energie.',
      balanced: 'Stai gestendo bene le cose. Una pausa mindful può aiutarti a mantenere questo equilibrio.',
      energetic: 'Anche con tutta questa energia, un momento di calma può essere benefico.',
      motivated: 'La tua motivazione è fantastica! Bilanciala con un po\' di autocura.'
    },
    energy_boost: {
      stressed: 'Lo stress può prosciugare le energie. Che ne dici di una breve attività per ricaricati?',
      anxious: 'L\'attività fisica può aiutare a gestire l\'ansia. Prova qualche movimento dolce.',
      tired: 'Ti serve una spinta? Anche 5 minuti di movimento possono fare la differenza.',
      balanced: 'Mantieni questo equilibrio con un po\' di movimento energizzante.',
      energetic: 'Perfetto! Incanala questa energia in qualcosa di positivo.',
      motivated: 'La tua motivazione è contagiosa! Trasformala in azione.'
    },
    celebration: {
      stressed: 'Nonostante le sfide, stai facendo del tuo meglio. Questo merita riconoscimento.',
      anxious: 'Hai superato momenti difficili prima d\'ora. Celebra la tua resilienza.',
      tired: 'Anche quando sei stanco, continui ad andare avanti. Questo è ammirevole.',
      balanced: 'Il tuo equilibrio è qualcosa di cui essere orgoglioso. Celebra questo momento.',
      energetic: 'La tua energia positiva illumina tutto! Continua così.',
      motivated: 'La tua determinazione è ispiratrice. Prenditi un momento per apprezzarla.'
    },
    mindfulness: {
      stressed: 'In questo momento di stress, trova pace nel respiro e nella presenza.',
      anxious: 'Torna al presente. Qui e ora sei al sicuro.',
      tired: 'Anche nella stanchezza, c\'è saggezza. Ascolta cosa ti dice il tuo corpo.',
      balanced: 'Questo equilibrio è prezioso. Rimani presente per apprezzarlo pienamente.',
      energetic: 'Tutta questa energia... come la senti nel corpo? Rimani connesso.',
      motivated: 'La motivazione nasce dal presente. Sentila, respirala, vivila.'
    },
    sleep_prep: {
      stressed: 'È tempo di lasciare andare le preoccupazioni della giornata. Il riposo ti aspetta.',
      anxious: 'La notte può portare pace. Prepara mente e corpo per un sonno ristoratore.',
      tired: 'Il tuo corpo sa di cosa ha bisogno. Crea le condizioni per un riposo profondo.',
      balanced: 'Questo equilibrio può accompagnarti in un sonno sereno.',
      energetic: 'Anche l\'energia ha bisogno di riposo per rinnovarsi. Rallenta dolcemente.',
      motivated: 'La vera produttività include il riposo. Prepara il terreno per domani.'
    }
  };

  const timeAdjustments = {
    morning: ' Inizia la giornata con gentilezza verso te stesso.',
    afternoon: ' Nel mezzo della giornata, riconnettiti con te stesso.',
    evening: ' Mentre la giornata volge al termine, prenditi cura di te.',
    night: ' In queste ore tranquille, trova pace.'
  };

  // Safe type casting and access
  const categoryTemplates = messageTemplates[category as keyof typeof messageTemplates] || messageTemplates.mindfulness;
  const stateKey = emotionalState as keyof typeof categoryTemplates;
  const baseMessage = categoryTemplates[stateKey] || messageTemplates.mindfulness.balanced;
  
  const timeAdjustment = timeAdjustments[timeOfDay as keyof typeof timeAdjustments] || '';

  return baseMessage + timeAdjustment;
}

// Analysis helper functions
function analyzeCurrentTiming(currentTime: Date, metrics: any, emotionalState: any): any {
  const hour = currentTime.getHours();
  const dayOfWeek = currentTime.getDay();
  
  return {
    hour,
    day_of_week: dayOfWeek,
    is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
    energy_level: metrics.energy || 5,
    stress_level: metrics.stress || 3,
    appropriateness: calculateTimeAppropriateness(hour, metrics),
    confidence: 0.8
  };
}

function analyzeScheduledTiming(scheduledTime: Date, metrics: any): any {
  const hour = scheduledTime.getHours();
  const dayOfWeek = scheduledTime.getDay();
  
  return {
    hour,
    day_of_week: dayOfWeek,
    is_weekend: dayOfWeek === 0 || dayOfWeek === 6,
    predicted_energy: predictEnergyAtTime(hour),
    predicted_stress: predictStressAtTime(hour),
    appropriateness: calculateTimeAppropriateness(hour, metrics),
    confidence: 0.6 // Lower confidence for future prediction
  };
}

function analyzeOptimalTiming(optimalTime: Date, circadianProfile: any, emotionalState: any): any {
  const hour = optimalTime.getHours();
  
  return {
    hour,
    optimal_window: true,
    circadian_alignment: calculateCircadianAlignment(hour, circadianProfile),
    emotional_readiness: calculateEmotionalReadiness(emotionalState),
    appropriateness: 0.9, // High since it's optimal
    confidence: 0.9
  };
}

function analyzeEmotionalContext(emotionalState: any, metrics: any): any {
  return {
    current_state: emotionalState.current_state || 'balanced',
    stress_level: metrics.stress || 3,
    energy_level: metrics.energy || 5,
    mood_score: metrics.mood || 5,
    receptivity_score: calculateReceptivityScore(emotionalState, metrics),
    confidence: emotionalState.confidence || 0.7
  };
}

// Utility functions
function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function findOptimalDeliveryTime(category: string, circadianProfile: any, emotionalState: any): Date {
  const now = new Date();
  const currentHour = now.getHours();
  
  // Use circadian profile to find optimal windows
  const optimalWindows = circadianProfile?.optimal_intervention_windows || [];
  
  // Filter windows by category
  const relevantWindows = optimalWindows.filter((window: any) => {
    if (category === 'stress_relief') return window.intervention_type === 'stress_relief';
    if (category === 'energy_boost') return window.intervention_type === 'energy_boost';
    return window.intervention_type === 'mindfulness';
  });
  
  if (relevantWindows.length > 0) {
    const bestWindow = relevantWindows[0];
    const targetHour = bestWindow.start_hour;
    
    const optimalTime = new Date(now);
    optimalTime.setHours(targetHour, 0, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (optimalTime <= now) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }
    
    return optimalTime;
  }
  
  // Fallback: find next good hour based on energy peaks
  const peakEnergyHours = circadianProfile?.peak_energy_hours || [9, 10, 15, 16];
  const nextPeakHour = peakEnergyHours.find((h: number) => h > currentHour) || peakEnergyHours[0];
  
  const fallbackTime = new Date(now);
  fallbackTime.setHours(nextPeakHour, 0, 0, 0);
  
  if (fallbackTime <= now) {
    fallbackTime.setDate(fallbackTime.getDate() + 1);
  }
  
  return fallbackTime;
}

function calculateAppropriatenessScore(category: string, emotionalState: any, timingAnalysis: any): number {
  let score = 0.5;
  
  // Category-state alignment
  const state = emotionalState.current_state || 'balanced';
  if (category === 'stress_relief' && state === 'stressed') score += 0.3;
  if (category === 'energy_boost' && (state === 'tired' || state === 'low_energy')) score += 0.3;
  if (category === 'celebration' && (state === 'motivated' || state === 'energetic')) score += 0.3;
  
  // Timing appropriateness
  score += timingAnalysis.appropriateness * 0.2;
  
  return Math.min(score, 1.0);
}

function calculatePersonalizationScore(message: string, emotionalState: any, metrics: any): number {
  let score = 0.6; // Base personalization
  
  // Check if message acknowledges current state
  const state = emotionalState.current_state || 'balanced';
  if (message.toLowerCase().includes(state)) score += 0.2;
  
  // Check stress/energy awareness
  if (metrics.stress >= 6 && message.toLowerCase().includes('stress')) score += 0.1;
  if (metrics.energy <= 3 && message.toLowerCase().includes('energia')) score += 0.1;
  
  return Math.min(score, 1.0);
}

function calculateEngagementPrediction(category: string, timingAnalysis: any, emotionalContext: any): number {
  let engagement = 0.5;
  
  // Timing factor
  engagement += timingAnalysis.appropriateness * 0.3;
  
  // Emotional readiness
  engagement += emotionalContext.receptivity_score * 0.2;
  
  return Math.min(engagement, 1.0);
}

function calculateTimeAppropriateness(hour: number, metrics: any): number {
  // Avoid very early/late hours
  if (hour < 6 || hour > 22) return 0.2;
  if (hour < 8 || hour > 20) return 0.5;
  
  // Peak hours are good
  if (hour >= 9 && hour <= 11) return 0.9;
  if (hour >= 15 && hour <= 17) return 0.8;
  
  return 0.7;
}

function calculateReceptivityScore(emotionalState: any, metrics: any): number {
  const stress = metrics.stress || 3;
  const energy = metrics.energy || 5;
  
  // Lower stress and moderate energy = higher receptivity
  let score = 0.5;
  if (stress <= 4) score += 0.2;
  if (energy >= 4 && energy <= 7) score += 0.2;
  
  return Math.min(score, 1.0);
}

function calculateCircadianAlignment(hour: number, circadianProfile: any): number {
  const peakHours = circadianProfile?.peak_energy_hours || [9, 10, 11, 15, 16];
  return peakHours.includes(hour) ? 0.9 : 0.5;
}

function calculateEmotionalReadiness(emotionalState: any): number {
  // Higher readiness for balanced states
  const state = emotionalState.current_state || 'balanced';
  const readinessMap: { [key: string]: number } = {
    balanced: 0.9,
    motivated: 0.8,
    energetic: 0.7,
    tired: 0.5,
    stressed: 0.4,
    anxious: 0.3
  };
  
  return readinessMap[state] || 0.6;
}

function predictEnergyAtTime(hour: number): number {
  // Simple energy prediction based on typical patterns
  if (hour >= 9 && hour <= 11) return 7;
  if (hour >= 15 && hour <= 17) return 6;
  if (hour >= 13 && hour <= 14) return 4; // Post-lunch dip
  return 5;
}

function predictStressAtTime(hour: number): number {
  // Simple stress prediction
  if (hour >= 11 && hour <= 12) return 6; // Pre-lunch stress
  if (hour >= 17 && hour <= 18) return 7; // End of workday
  return 3;
}

// Default data functions
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

function getDefaultEmotionalState() {
  return {
    current_state: 'balanced',
    confidence: 0.7,
    factors: ['moderate_stress', 'adequate_energy']
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