import { NextRequest, NextResponse } from 'next/server';
import { IntelligentPushSystem, EmpatheticLanguageEngine } from '@lifeos/core';
import { createClient } from '@supabase/supabase-js';

interface TestNotificationRequest {
  type: 'immediate' | 'scheduled' | 'optimal_timing';
  category?: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'motivation';
  message?: string;
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  scheduled_time?: string; // ISO string
  test_emotional_state?: 'stressed' | 'energetic' | 'tired' | 'balanced' | 'anxious' | 'motivated';
}

interface TestNotificationResponse {
  success: boolean;
  notification_id: string;
  message: string;
  scheduled_time: string;
  delivery_method: 'push' | 'in_app' | 'email';
  confidence_score?: number;
  reasoning?: string;
  test_results: {
    timing_analysis: any;
    emotional_context: any;
    empathetic_message: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: TestNotificationRequest = await request.json();
    const { 
      type, 
      category = 'motivation', 
      message, 
      priority = 'normal',
      scheduled_time,
      test_emotional_state 
    } = body;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize systems
    const pushSystem = new IntelligentPushSystem();
    const languageEngine = new EmpatheticLanguageEngine();

    // Get user data for testing
    const userData = await getUserDataForTesting(userId, test_emotional_state);

    let result: TestNotificationResponse;

    switch (type) {
      case 'immediate':
        result = await testImmediateNotification(
          userId, 
          category, 
          message, 
          priority as any, 
          userData, 
          pushSystem, 
          languageEngine
        );
        break;

      case 'scheduled':
        if (!scheduled_time) {
          return NextResponse.json({ 
            error: 'scheduled_time required for scheduled test' 
          }, { status: 400 });
        }
        result = await testScheduledNotification(
          userId,
          category,
          message,
          new Date(scheduled_time),
          userData,
          pushSystem,
          languageEngine
        );
        break;

      case 'optimal_timing':
        result = await testOptimalTimingNotification(
          userId,
          category,
          message,
          userData,
          pushSystem,
          languageEngine
        );
        break;

      default:
        return NextResponse.json({ 
          error: 'Invalid test type. Use: immediate, scheduled, or optimal_timing' 
        }, { status: 400 });
    }

    // Log test for analytics
    await supabase
      .from('notification_tests')
      .insert({
        user_id: userId,
        test_type: type,
        category,
        notification_id: result.notification_id,
        confidence_score: result.confidence_score,
        test_results: result.test_results,
        created_at: new Date().toISOString()
      });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in test notification API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get recent test results
    const { data: testResults, error } = await supabase
      .from('notification_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching test results:', error);
      return NextResponse.json({ error: 'Failed to fetch test results' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: testResults,
      meta: {
        total: testResults.length,
        available_test_types: ['immediate', 'scheduled', 'optimal_timing'],
        available_categories: ['stress_relief', 'energy_boost', 'sleep_prep', 'celebration', 'motivation']
      }
    });

  } catch (error) {
    console.error('Error in test notification GET:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Helper functions
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    // Implement your JWT verification here
    return 'user_123'; // Mock for development
  } catch (error) {
    return null;
  }
}

async function getUserDataForTesting(userId: string, testEmotionalState?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user data or use defaults for testing
  const [
    { data: recentMetrics },
    { data: lifeScore },
    { data: userProfile },
    { data: circadianProfile },
    { data: preferences }
  ] = await Promise.all([
    supabase.from('health_metrics').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1),
    supabase.from('life_scores').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(1),
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('circadian_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('notification_preferences').select('*').eq('user_id', userId).single()
  ]);

  // Create test data with optional emotional state override
  const testMetrics = recentMetrics?.[0] || getTestMetrics(testEmotionalState);
  const testLifeScore = lifeScore?.[0] || getTestLifeScore(testEmotionalState);
  
  return {
    metrics: testMetrics,
    lifeScore: testLifeScore,
    userProfile: userProfile || getTestUserProfile(),
    circadianProfile: circadianProfile || getTestCircadianProfile(),
    preferences: preferences || getTestPreferences()
  };
}

async function testImmediateNotification(
  userId: string,
  category: string,
  customMessage: string | undefined,
  priority: 'low' | 'normal' | 'high' | 'emergency',
  userData: any,
  pushSystem: IntelligentPushSystem,
  languageEngine: EmpatheticLanguageEngine
): Promise<TestNotificationResponse> {

  // Generate empathetic message
  const empatheticContext = buildEmpatheticContext(userData);
  const generatedMessage = languageEngine.generateMessage(
    empatheticContext,
    category as any,
    userData.userProfile
  );

  const finalMessage = customMessage || generatedMessage.content;

  // Send immediate notification (test mode)
  const notificationId = await pushSystem.sendImmediateNotification(
    userId,
    generatedMessage,
    priority as any,
    userData.preferences
  );

  return {
    success: true,
    notification_id: notificationId,
    message: finalMessage,
    scheduled_time: new Date().toISOString(),
    delivery_method: 'push',
    test_results: {
      timing_analysis: {
        type: 'immediate',
        current_time: new Date().toISOString(),
        timing_appropriateness: analyzeCurrentTiming(userData.circadianProfile)
      },
      emotional_context: empatheticContext,
      empathetic_message: {
        generated_content: generatedMessage.content,
        tone: generatedMessage.tone,
        personalization_score: generatedMessage.personalization_score,
        predicted_effectiveness: generatedMessage.predicted_effectiveness
      }
    }
  };
}

async function testScheduledNotification(
  userId: string,
  category: string,
  customMessage: string | undefined,
  scheduledTime: Date,
  userData: any,
  pushSystem: IntelligentPushSystem,
  languageEngine: EmpatheticLanguageEngine
): Promise<TestNotificationResponse> {

  // Generate empathetic message
  const empatheticContext = buildEmpatheticContext(userData);
  const generatedMessage = languageEngine.generateMessage(
    empatheticContext,
    category as any,
    userData.userProfile
  );

  const finalMessage = customMessage || generatedMessage.content;

  // Schedule notification (test mode - not actually scheduled)
  const notificationId = crypto.randomUUID();

  // Analyze timing for the specified time
  const timingAnalysis = analyzeScheduledTiming(scheduledTime, userData.circadianProfile);

  return {
    success: true,
    notification_id: notificationId,
    message: finalMessage,
    scheduled_time: scheduledTime.toISOString(),
    delivery_method: 'push',
    confidence_score: timingAnalysis.confidence,
    reasoning: timingAnalysis.reasoning,
    test_results: {
      timing_analysis: timingAnalysis,
      emotional_context: empatheticContext,
      empathetic_message: {
        generated_content: generatedMessage.content,
        tone: generatedMessage.tone,
        personalization_score: generatedMessage.personalization_score,
        predicted_effectiveness: generatedMessage.predicted_effectiveness
      }
    }
  };
}

async function testOptimalTimingNotification(
  userId: string,
  category: string,
  customMessage: string | undefined,
  userData: any,
  pushSystem: IntelligentPushSystem,
  languageEngine: EmpatheticLanguageEngine
): Promise<TestNotificationResponse> {

  // Use intelligent scheduling system
  const result = await pushSystem.scheduleAdviceNotification(
    userId,
    userData.lifeScore,
    userData.metrics,
    userData.userProfile,
    userData.preferences,
    userData.circadianProfile
  );

  // Generate empathetic message
  const empatheticContext = buildEmpatheticContext(userData);
  const generatedMessage = languageEngine.generateMessage(
    empatheticContext,
    category as any,
    userData.userProfile
  );

  const finalMessage = customMessage || generatedMessage.content;

  return {
    success: true,
    notification_id: result.notificationId,
    message: finalMessage,
    scheduled_time: result.scheduledTime.toISOString(),
    delivery_method: 'push',
    confidence_score: result.confidence,
    reasoning: `Optimal timing calculated by intelligent system`,
    test_results: {
      timing_analysis: {
        type: 'optimal',
        calculated_time: result.scheduledTime.toISOString(),
        confidence: result.confidence,
        factors_considered: [
          'circadian_profile',
          'current_life_score',
          'historical_patterns',
          'user_preferences'
        ]
      },
      emotional_context: empatheticContext,
      empathetic_message: {
        generated_content: generatedMessage.content,
        tone: generatedMessage.tone,
        personalization_score: generatedMessage.personalization_score,
        predicted_effectiveness: generatedMessage.predicted_effectiveness
      }
    }
  };
}

function buildEmpatheticContext(userData: any): any {
  const languageEngine = new EmpatheticLanguageEngine();
  
  return {
    emotional_state: languageEngine.analyzeEmotionalState(userData.lifeScore, userData.metrics),
    time_of_day: determineTimeOfDay(),
    current_streak: 0, // Would be loaded from database
    recent_completion_rate: 0.7,
    preferred_tone: userData.preferences.tone_preference === 'adaptive' ? 
      languageEngine.determineOptimalTone(userData.userProfile, 'balanced', 'morning') :
      userData.preferences.tone_preference,
    personality_traits: [],
    historical_effectiveness: {}
  };
}

function analyzeCurrentTiming(circadianProfile: any): any {
  const currentHour = new Date().getHours();
  const isOptimalWindow = circadianProfile.optimal_intervention_windows?.some(
    (window: any) => currentHour >= window.start_hour && currentHour <= window.end_hour
  );
  
  return {
    current_hour: currentHour,
    is_optimal_window: isOptimalWindow,
    energy_level: circadianProfile.peak_energy_hours?.includes(currentHour) ? 'high' : 
                  circadianProfile.low_energy_hours?.includes(currentHour) ? 'low' : 'normal',
    stress_likelihood: circadianProfile.stress_peak_hours?.includes(currentHour) ? 'high' : 'normal',
    appropriateness_score: isOptimalWindow ? 0.8 : 0.5
  };
}

function analyzeScheduledTiming(scheduledTime: Date, circadianProfile: any): any {
  const scheduledHour = scheduledTime.getHours();
  const optimalWindow = circadianProfile.optimal_intervention_windows?.find(
    (window: any) => scheduledHour >= window.start_hour && scheduledHour <= window.end_hour
  );
  
  let confidence = 0.5; // Base confidence
  let reasoning = '';
  
  if (optimalWindow) {
    confidence = optimalWindow.effectiveness_score;
    reasoning = `Scheduled during optimal ${optimalWindow.intervention_type} window`;
  } else {
    reasoning = 'Scheduled outside optimal intervention windows';
  }
  
  const isHighEnergyTime = circadianProfile.peak_energy_hours?.includes(scheduledHour);
  const isLowEnergyTime = circadianProfile.low_energy_hours?.includes(scheduledHour);
  const isStressPeakTime = circadianProfile.stress_peak_hours?.includes(scheduledHour);
  
  if (isHighEnergyTime) {
    confidence += 0.1;
    reasoning += '. High energy time detected';
  } else if (isLowEnergyTime) {
    confidence -= 0.1;
    reasoning += '. Low energy time - may reduce effectiveness';
  }
  
  if (isStressPeakTime) {
    confidence -= 0.05;
    reasoning += '. Stress peak time - user may be less receptive';
  }
  
  return {
    scheduled_hour: scheduledHour,
    confidence: Math.max(0.1, Math.min(1, confidence)),
    reasoning,
    optimal_window: optimalWindow,
    energy_level: isHighEnergyTime ? 'high' : isLowEnergyTime ? 'low' : 'normal',
    stress_likelihood: isStressPeakTime ? 'high' : 'normal'
  };
}

function determineTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function getTestMetrics(emotionalState?: string) {
  const baseMetrics = {
    mood: 5,
    stress: 3,
    energy: 5,
    sleep_hours: 7,
    steps: 5000,
    date: new Date().toISOString()
  };
  
  // Adjust based on test emotional state
  switch (emotionalState) {
    case 'stressed':
      return { ...baseMetrics, mood: 3, stress: 7, energy: 3 };
    case 'energetic':
      return { ...baseMetrics, mood: 7, stress: 2, energy: 8, steps: 8000 };
    case 'tired':
      return { ...baseMetrics, mood: 4, stress: 4, energy: 2, sleep_hours: 5 };
    case 'anxious':
      return { ...baseMetrics, mood: 3, stress: 6, energy: 4 };
    case 'motivated':
      return { ...baseMetrics, mood: 7, stress: 2, energy: 7, steps: 7000 };
    case 'balanced':
    default:
      return baseMetrics;
  }
}

function getTestLifeScore(emotionalState?: string) {
  const baseScore = {
    score: 65,
    breakdown: {
      sleep_score: 70,
      activity_score: 60,
      mental_score: 65
    },
    date: new Date().toISOString()
  };
  
  // Adjust based on test emotional state
  switch (emotionalState) {
    case 'stressed':
      return { 
        ...baseScore, 
        score: 45, 
        breakdown: { ...baseScore.breakdown, mental_score: 35, sleep_score: 50 } 
      };
    case 'energetic':
      return { 
        ...baseScore, 
        score: 80, 
        breakdown: { ...baseScore.breakdown, activity_score: 85, mental_score: 80 } 
      };
    case 'tired':
      return { 
        ...baseScore, 
        score: 50, 
        breakdown: { ...baseScore.breakdown, sleep_score: 35, activity_score: 45 } 
      };
    case 'anxious':
      return { 
        ...baseScore, 
        score: 40, 
        breakdown: { ...baseScore.breakdown, mental_score: 30 } 
      };
    case 'motivated':
      return { 
        ...baseScore, 
        score: 85, 
        breakdown: { ...baseScore.breakdown, mental_score: 85, activity_score: 80 } 
      };
    case 'balanced':
    default:
      return baseScore;
  }
}

function getTestUserProfile() {
  return {
    chronotype: 'intermediate',
    timezone: 'Europe/Rome',
    language_preference: 'it',
    wellness_goals: ['stress_management', 'better_sleep'],
    activity_level: 'moderate'
  };
}

function getTestCircadianProfile() {
  return {
    chronotype: 'intermediate',
    natural_wake_time: '07:00',
    natural_sleep_time: '23:00',
    peak_energy_hours: [9, 10, 11, 15, 16],
    low_energy_hours: [13, 14, 20, 21],
    stress_peak_hours: [11, 17, 18],
    optimal_intervention_windows: [
      {
        start_hour: 9,
        end_hour: 11,
        effectiveness_score: 0.85,
        intervention_type: 'mindfulness',
        frequency_limit: 1
      },
      {
        start_hour: 14,
        end_hour: 16,
        effectiveness_score: 0.78,
        intervention_type: 'energy_boost',
        frequency_limit: 1
      },
      {
        start_hour: 17,
        end_hour: 19,
        effectiveness_score: 0.92,
        intervention_type: 'stress_relief',
        frequency_limit: 2
      }
    ]
  };
}

function getTestPreferences() {
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
