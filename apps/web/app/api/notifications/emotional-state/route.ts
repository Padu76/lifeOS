import { NextRequest, NextResponse } from 'next/server';
import { EmpatheticLanguageEngine } from '../../../../packages/core';
import { createClient } from '@supabase/supabase-js';

interface EmotionalStateResponse {
  current_state: 'stressed' | 'energetic' | 'tired' | 'balanced' | 'anxious' | 'motivated';
  confidence: number;
  factors: string[];
  trend: 'improving' | 'stable' | 'declining';
  last_analyzed: string;
  recommendations: {
    immediate: string[];
    preventive: string[];
  };
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

    // Get recent metrics for emotional analysis
    const { data: recentMetrics, error: metricsError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(7); // Last 7 days

    if (metricsError) {
      console.error('Error fetching recent metrics:', metricsError);
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }

    // Get current life score
    const { data: latestLifeScore, error: scoreError } = await supabase
      .from('life_scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (scoreError && scoreError.code !== 'PGRST116') {
      console.error('Error fetching life score:', scoreError);
      return NextResponse.json({ error: 'Failed to fetch life score' }, { status: 500 });
    }

    // Get user profile for context
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }

    // Initialize empathetic engine
    const languageEngine = new EmpatheticLanguageEngine();

    // Prepare data for analysis
    const currentMetrics = recentMetrics[0] || getDefaultMetrics();
    const lifeScore = latestLifeScore || getDefaultLifeScore();

    // Analyze emotional state
    const emotionalState = languageEngine.analyzeEmotionalState(lifeScore, currentMetrics);
    
    // Calculate trend from recent data
    const trend = calculateEmotionalTrend(recentMetrics);
    
    // Identify contributing factors
    const factors = identifyEmotionalFactors(currentMetrics, lifeScore, recentMetrics);
    
    // Calculate confidence based on data quality
    const confidence = calculateAnalysisConfidence(recentMetrics, lifeScore);
    
    // Generate recommendations
    const recommendations = generateEmotionalRecommendations(
      emotionalState,
      currentMetrics,
      lifeScore,
      trend
    );

    const response: EmotionalStateResponse = {
      current_state: emotionalState,
      confidence,
      factors,
      trend,
      last_analyzed: new Date().toISOString(),
      recommendations
    };

    // Store analysis result for tracking
    await supabase
      .from('emotional_analyses')
      .insert({
        user_id: userId,
        emotional_state: emotionalState,
        confidence_score: confidence,
        contributing_factors: factors,
        trend,
        recommendations,
        analyzed_at: new Date().toISOString()
      });

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error in emotional state API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Helper functions
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Same auth logic as circadian profile
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

function calculateEmotionalTrend(recentMetrics: any[]): 'improving' | 'stable' | 'declining' {
  if (!recentMetrics || recentMetrics.length < 3) return 'stable';

  // Calculate trend from mood and stress over time
  const moodTrend = calculateMetricTrend(recentMetrics, 'mood');
  const stressTrend = calculateMetricTrend(recentMetrics, 'stress');
  const energyTrend = calculateMetricTrend(recentMetrics, 'energy');

  // Combine trends (stress is inverse - lower stress is better)
  const overallTrend = (moodTrend - stressTrend + energyTrend) / 3;

  if (overallTrend > 0.3) return 'improving';
  if (overallTrend < -0.3) return 'declining';
  return 'stable';
}

function calculateMetricTrend(metrics: any[], metricName: string): number {
  const values = metrics.map(m => m[metricName] || 5).slice(0, 5); // Last 5 days
  if (values.length < 3) return 0;

  // Simple linear trend calculation
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.ceil(values.length / 2));

  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

  return (secondAvg - firstAvg) / 5; // Normalize to -1 to 1 range
}

function identifyEmotionalFactors(currentMetrics: any, lifeScore: any, recentMetrics: any[]): string[] {
  const factors: string[] = [];

  // Sleep factor
  const sleepHours = currentMetrics.sleep_hours || 7;
  if (sleepHours < 6) {
    factors.push('sleep_quality: poor');
  } else if (sleepHours > 8.5) {
    factors.push('sleep_quality: excellent');
  } else {
    factors.push('sleep_quality: good');
  }

  // Activity factor
  const steps = currentMetrics.steps || 0;
  if (steps < 2000) {
    factors.push('activity_level: low');
  } else if (steps > 8000) {
    factors.push('activity_level: high');
  } else {
    factors.push('activity_level: moderate');
  }

  // Stress factor
  const stress = currentMetrics.stress || 3;
  if (stress >= 4) {
    factors.push('stress_level: elevated');
  } else if (stress <= 2) {
    factors.push('stress_level: low');
  } else {
    factors.push('stress_level: normal');
  }

  // Trend factor
  const trend = calculateEmotionalTrend(recentMetrics);
  factors.push(`recent_trend: ${trend}`);

  // Time of day factor
  const hour = new Date().getHours();
  if (hour < 6) {
    factors.push('time_context: very_early');
  } else if (hour < 12) {
    factors.push('time_context: morning');
  } else if (hour < 17) {
    factors.push('time_context: afternoon');
  } else if (hour < 21) {
    factors.push('time_context: evening');
  } else {
    factors.push('time_context: late');
  }

  return factors;
}

function calculateAnalysisConfidence(recentMetrics: any[], lifeScore: any): number {
  let confidence = 0.5; // Base confidence

  // Data recency boost
  if (recentMetrics && recentMetrics.length > 0) {
    const lastDataDate = new Date(recentMetrics[0].date || recentMetrics[0].timestamp);
    const hoursSinceLastData = (Date.now() - lastDataDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastData < 24) confidence += 0.3;
    else if (hoursSinceLastData < 48) confidence += 0.2;
    else confidence += 0.1;
  }

  // Data quantity boost
  if (recentMetrics) {
    const dataPoints = recentMetrics.length;
    confidence += Math.min(dataPoints / 7, 1) * 0.2; // 7 days = max boost
  }

  // Life score availability boost
  if (lifeScore) {
    confidence += 0.1;
  }

  return Math.min(confidence, 1);
}

function generateEmotionalRecommendations(
  emotionalState: string,
  currentMetrics: any,
  lifeScore: any,
  trend: string
): { immediate: string[]; preventive: string[] } {
  const immediate: string[] = [];
  const preventive: string[] = [];

  switch (emotionalState) {
    case 'stressed':
    case 'anxious':
      immediate.push('Prova 5 minuti di respirazione profonda');
      immediate.push('Fai una breve pausa dalla attività corrente');
      preventive.push('Pianifica pause regolari durante la giornata');
      preventive.push('Considera tecniche di mindfulness serali');
      break;

    case 'tired':
      immediate.push('Bevi un bicchiere d\'acqua');
      immediate.push('Fai stretching leggero');
      preventive.push('Ottimizza la routine del sonno');
      preventive.push('Considera un power nap di 20 minuti');
      break;

    case 'energetic':
    case 'motivated':
      immediate.push('Sfrutta questo momento per attività impegnative');
      immediate.push('Considera un workout energizzante');
      preventive.push('Programma le attività più difficili in questi momenti');
      preventive.push('Mantieni l\'energia con snack salutari');
      break;

    case 'balanced':
      immediate.push('Ottimo momento per pianificare la giornata');
      immediate.push('Continua con le attività routinarie');
      preventive.push('Mantieni le abitudini che ti portano equilibrio');
      preventive.push('Monitora i fattori che contribuiscono al benessere');
      break;
  }

  // Add trend-based recommendations
  if (trend === 'declining') {
    preventive.push('Monitora i pattern che potrebbero influenzare il benessere');
    preventive.push('Considera di consultare un professionista se la tendenza persiste');
  } else if (trend === 'improving') {
    preventive.push('Identifica e mantieni i fattori che stanno contribuendo al miglioramento');
  }

  return { immediate, preventive };
}

function getDefaultMetrics() {
  return {
    mood: 5,
    stress: 3,
    energy: 5,
    sleep_hours: 7,
    steps: 5000,
    date: new Date().toISOString()
  };
}

function getDefaultLifeScore() {
  return {
    score: 65,
    breakdown: {
      sleep_score: 70,
      activity_score: 60,
      mental_score: 65
    },
    date: new Date().toISOString()
  };
}
