import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types
interface HealthMetrics {
  user_id: string;
  date: string;
  steps: number;
  active_minutes?: number;
  sleep_hours: number;
  sleep_quality: number;
  hr_avg?: number;
  mood: number;
  stress: number;
  energy?: number;
  source: string;
}

interface UserProfile {
  user_id: string;
  baseline_sleep: number;
  baseline_activity: number;
  baseline_mood: number;
  baseline_stress: number;
  baseline_energy: number;
  sleep_sensitivity: number;
  activity_sensitivity: number;
  mood_sensitivity: number;
  stress_sensitivity: number;
  optimal_sleep_min: number;
  optimal_sleep_max: number;
  optimal_activity_min: number;
  optimal_activity_max: number;
  chronotype: 'morning' | 'evening' | 'neutral';
  stress_pattern_weekdays: string[];
  confidence_score: number;
  data_points_count: number;
}

interface LifeScoreV2 {
  date: string;
  score: number;
  sleep_score: number;
  activity_score: number;
  mental_score: number;
  trend_3d?: number;
  trend_7d?: number;
  flags: Record<string, boolean>;
  reasons: string[];
  confidence_level: number;
  prediction_3d: number;
  prediction_7d: number;
  anomaly_score: number;
  circadian_factor: number;
  personal_baseline: number;
  improvement_suggestions: string[];
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { day } = await req.json();
    const targetDate = day || new Date().toISOString().slice(0, 10);

    console.log(`Processing daily rollup for ${targetDate}`);

    // Get all users with health metrics for the target date
    const { data: healthMetrics, error: metricsError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('date', targetDate);

    if (metricsError) {
      throw new Error(`Error fetching health metrics: ${metricsError.message}`);
    }

    if (!healthMetrics || healthMetrics.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No health metrics found for target date',
        processed: 0 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }

    let processedUsers = 0;
    let errors: string[] = [];

    // Process each user
    for (const metrics of healthMetrics) {
      try {
        await processUserLifeScore(supabase, metrics, targetDate);
        processedUsers++;
      } catch (error) {
        console.error(`Error processing user ${metrics.user_id}:`, error);
        errors.push(`User ${metrics.user_id}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      message: `Daily rollup completed for ${targetDate}`,
      processed: processedUsers,
      total: healthMetrics.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Daily rollup error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function processUserLifeScore(supabase: any, metrics: HealthMetrics, targetDate: string) {
  // 1. Get or create user profile
  const profile = await getUserProfile(supabase, metrics.user_id);
  
  // 2. Get historical data for context
  const historicalData = await getHistoricalData(supabase, metrics.user_id, 30);
  
  // 3. Get previous scores for trend analysis
  const previousScores = await getPreviousScores(supabase, metrics.user_id, 14);
  
  // 4. Calculate LifeScore V2
  const lifeScore = calculateLifeScoreV2(metrics, profile, historicalData, previousScores);
  
  // 5. Save LifeScore
  await saveLifeScore(supabase, metrics.user_id, lifeScore);
  
  // 6. Generate and save suggestions
  await generateSuggestions(supabase, metrics.user_id, lifeScore, profile, targetDate);
  
  // 7. Update user profile if needed
  await updateUserProfileIfNeeded(supabase, metrics.user_id, profile, historicalData);
}

async function getUserProfile(supabase: any, userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // Create default profile
    const defaultProfile: Partial<UserProfile> = {
      user_id: userId,
      baseline_sleep: 7.5,
      baseline_activity: 7000,
      baseline_mood: 3.5,
      baseline_stress: 2.5,
      baseline_energy: 3.5,
      sleep_sensitivity: 0.5,
      activity_sensitivity: 0.5,
      mood_sensitivity: 0.5,
      stress_sensitivity: 0.5,
      optimal_sleep_min: 7.0,
      optimal_sleep_max: 8.5,
      optimal_activity_min: 6000,
      optimal_activity_max: 10000,
      chronotype: 'neutral',
      stress_pattern_weekdays: [],
      confidence_score: 0.0,
      data_points_count: 0
    };

    const { data: newProfile } = await supabase
      .from('user_profiles')
      .insert(defaultProfile)
      .select()
      .single();

    return newProfile || defaultProfile as UserProfile;
  }

  return data;
}

async function getHistoricalData(supabase: any, userId: string, days: number) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  const { data } = await supabase
    .from('health_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromDate.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  return data || [];
}

async function getPreviousScores(supabase: any, userId: string, days: number) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  
  const { data } = await supabase
    .from('lifescores')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromDate.toISOString().slice(0, 10))
    .order('date', { ascending: true });

  return data || [];
}

function calculateLifeScoreV2(
  metrics: HealthMetrics, 
  profile: UserProfile, 
  historicalData: any[], 
  previousScores: any[]
): LifeScoreV2 {
  // 1. Calculate adaptive weights
  const weights = calculateAdaptiveWeights(profile, historicalData, previousScores);
  
  // 2. Normalize metrics to personal baseline
  const normalizedMetrics = normalizeToPersonalBaseline(metrics, profile);
  
  // 3. Calculate component scores
  const sleepScore = calculateSleepScore(normalizedMetrics, profile);
  const activityScore = calculateActivityScore(normalizedMetrics, profile);
  const mentalScore = calculateMentalScore(normalizedMetrics, profile);
  
  // 4. Calculate base score
  const baseScore = Math.round(
    sleepScore * weights.sleep +
    activityScore * weights.activity +
    mentalScore * weights.mental
  );
  
  // 5. Apply circadian adjustment
  const circadianFactor = calculateCircadianFactor(metrics, profile);
  const adjustedScore = Math.round(baseScore * circadianFactor);
  
  // 6. Calculate confidence
  const confidence = Math.min(1.0, profile.data_points_count / 30);
  
  // 7. Anomaly detection
  const anomalyScore = detectAnomalies(metrics, historicalData, profile);
  
  // 8. Calculate predictions
  const predictions = calculatePredictions(previousScores);
  
  // 9. Calculate trends
  const trends = calculateTrends(adjustedScore, previousScores);
  
  // 10. Generate flags
  const flags = generateFlags(metrics, anomalyScore, trends, profile);
  
  // 11. Generate improvement suggestions
  const suggestions = generateImprovementSuggestions(normalizedMetrics, flags, profile, trends);
  
  // 12. Generate reasons
  const reasons = generateReasons(normalizedMetrics, flags, suggestions);

  return {
    date: metrics.date,
    score: Math.max(0, Math.min(100, adjustedScore)),
    sleep_score: sleepScore,
    activity_score: activityScore,
    mental_score: mentalScore,
    trend_3d: trends.trend_3d,
    trend_7d: trends.trend_7d,
    flags,
    reasons,
    confidence_level: confidence,
    prediction_3d: predictions.prediction_3d,
    prediction_7d: predictions.prediction_7d,
    anomaly_score: anomalyScore,
    circadian_factor: circadianFactor,
    personal_baseline: Math.round((profile.baseline_mood / 5) * 100),
    improvement_suggestions: suggestions
  };
}

function calculateAdaptiveWeights(profile: UserProfile, historicalData: any[], previousScores: any[]) {
  if (historicalData.length < 7) {
    return { sleep: 0.35, activity: 0.30, mental: 0.35 };
  }

  // Use sensitivity factors from profile
  const totalSensitivity = profile.sleep_sensitivity + profile.activity_sensitivity + profile.mood_sensitivity;
  
  if (totalSensitivity === 0) {
    return { sleep: 0.35, activity: 0.30, mental: 0.35 };
  }

  // Normalize sensitivities to weights
  const baseWeights = {
    sleep: profile.sleep_sensitivity / totalSensitivity,
    activity: profile.activity_sensitivity / totalSensitivity,
    mental: profile.mood_sensitivity / totalSensitivity
  };

  // Smooth transition for new users
  const smoothingFactor = Math.min(historicalData.length / 30, 1);
  const defaultWeights = { sleep: 0.35, activity: 0.30, mental: 0.35 };

  return {
    sleep: defaultWeights.sleep * (1 - smoothingFactor) + baseWeights.sleep * smoothingFactor,
    activity: defaultWeights.activity * (1 - smoothingFactor) + baseWeights.activity * smoothingFactor,
    mental: defaultWeights.mental * (1 - smoothingFactor) + baseWeights.mental * smoothingFactor
  };
}

function normalizeToPersonalBaseline(metrics: HealthMetrics, profile: UserProfile): HealthMetrics {
  return {
    ...metrics,
    sleep_hours: Math.max(0, Math.min(1, 
      (metrics.sleep_hours - profile.optimal_sleep_min) / 
      (profile.optimal_sleep_max - profile.optimal_sleep_min)
    )) * metrics.sleep_hours,
    steps: Math.max(0, Math.min(1,
      (metrics.steps - profile.optimal_activity_min) /
      (profile.optimal_activity_max - profile.optimal_activity_min)
    )) * metrics.steps,
    mood: metrics.mood / profile.baseline_mood,
    stress: metrics.stress,
    energy: (metrics.energy || metrics.mood) / profile.baseline_energy
  };
}

function calculateSleepScore(metrics: HealthMetrics, profile: UserProfile): number {
  const hoursScore = Math.min(metrics.sleep_hours / 8.0, 1.2) * 70;
  const qualityScore = ((metrics.sleep_quality - 1) / 4) * 30;
  return Math.max(0, Math.min(100, hoursScore + qualityScore));
}

function calculateActivityScore(metrics: HealthMetrics, profile: UserProfile): number {
  const stepsScore = Math.min(metrics.steps / 7000, 1.5) * 60;
  const activeScore = Math.min((metrics.active_minutes || 0) / 30, 1.5) * 40;
  return Math.max(0, Math.min(100, stepsScore + activeScore));
}

function calculateMentalScore(metrics: HealthMetrics, profile: UserProfile): number {
  const moodScore = ((metrics.mood - 1) / 4) * 40;
  const stressScore = ((5 - metrics.stress) / 4) * 30;
  const energyScore = (((metrics.energy || metrics.mood) - 1) / 4) * 30;
  return Math.max(0, Math.min(100, moodScore + stressScore + energyScore));
}

function calculateCircadianFactor(metrics: HealthMetrics, profile: UserProfile): number {
  const date = new Date(metrics.date);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  let factor = 1.0;
  
  // Weekend boost
  if (isWeekend) {
    factor += 0.05;
  }
  
  // Stress pattern penalty
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  if (profile.stress_pattern_weekdays.includes(dayNames[dayOfWeek])) {
    factor -= 0.1;
  }
  
  return Math.max(0.8, Math.min(1.2, factor));
}

function detectAnomalies(metrics: HealthMetrics, historicalData: any[], profile: UserProfile): number {
  if (historicalData.length < 14) return 0;

  const recent = historicalData.slice(-14);
  
  // Calculate z-scores
  const sleepAvg = recent.reduce((sum, d) => sum + d.sleep_hours, 0) / recent.length;
  const sleepStd = Math.sqrt(recent.reduce((sum, d) => sum + Math.pow(d.sleep_hours - sleepAvg, 2), 0) / recent.length);
  const sleepZScore = sleepStd === 0 ? 0 : Math.abs((metrics.sleep_hours - sleepAvg) / sleepStd);
  
  const stepsAvg = recent.reduce((sum, d) => sum + d.steps, 0) / recent.length;
  const stepsStd = Math.sqrt(recent.reduce((sum, d) => sum + Math.pow(d.steps - stepsAvg, 2), 0) / recent.length);
  const stepsZScore = stepsStd === 0 ? 0 : Math.abs((metrics.steps - stepsAvg) / stepsStd);
  
  const maxDeviation = Math.max(sleepZScore, stepsZScore);
  return Math.min(1, maxDeviation / 3); // 3 sigma = max anomaly
}

function calculatePredictions(previousScores: any[]): { prediction_3d: number; prediction_7d: number } {
  if (previousScores.length < 7) {
    const recent = previousScores.slice(-3);
    const avg = recent.length > 0 ? recent.reduce((sum, s) => sum + s.score, 0) / recent.length : 75;
    return { prediction_3d: avg, prediction_7d: avg };
  }

  const recentScores = previousScores.slice(-14).map(s => s.score);
  const trend = calculateLinearTrend(recentScores);
  const currentAvg = recentScores.slice(-3).reduce((sum, score) => sum + score, 0) / 3;
  
  return {
    prediction_3d: Math.max(0, Math.min(100, currentAvg + trend * 3)),
    prediction_7d: Math.max(0, Math.min(100, currentAvg + trend * 7))
  };
}

function calculateLinearTrend(values: number[]): number {
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
}

function calculateTrends(currentScore: number, previousScores: any[]): { trend_3d: number; trend_7d: number } {
  const get3DayAvg = () => {
    const recent = previousScores.slice(-3);
    return recent.length > 0 ? recent.reduce((sum, s) => sum + s.score, 0) / recent.length : currentScore;
  };
  
  const get7DayAvg = () => {
    const recent = previousScores.slice(-7);
    return recent.length > 0 ? recent.reduce((sum, s) => sum + s.score, 0) / recent.length : currentScore;
  };
  
  return {
    trend_3d: Math.round(currentScore - get3DayAvg()),
    trend_7d: Math.round(currentScore - get7DayAvg())
  };
}

function generateFlags(metrics: HealthMetrics, anomalyScore: number, trends: any, profile: UserProfile): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  
  if (metrics.sleep_hours < 6) flags.low_sleep = true;
  if (metrics.stress >= 4) flags.high_stress = true;
  if (metrics.steps < 3000) flags.low_activity = true;
  if (trends.trend_7d <= -15) flags.declining_trend = true;
  if (trends.trend_7d >= 15) flags.improving_trend = true;
  if (anomalyScore > 0.7) flags.anomaly_detected = true;
  
  // Burnout risk
  if (flags.low_sleep && flags.high_stress && flags.declining_trend) {
    flags.burnout_risk = true;
  }
  
  return flags;
}

function generateImprovementSuggestions(metrics: HealthMetrics, flags: any, profile: UserProfile, trends: any): string[] {
  const suggestions: string[] = [];
  
  if (flags.low_sleep) {
    const deficit = profile.optimal_sleep_min - metrics.sleep_hours;
    suggestions.push(`Aumenta il sonno di ${deficit.toFixed(1)} ore per notte`);
  }
  
  if (flags.low_activity) {
    const deficit = profile.optimal_activity_min - metrics.steps;
    suggestions.push(`Aggiungi ${Math.round(deficit)} passi (~${Math.round(deficit/100/10)} min)`);
  }
  
  if (flags.high_stress && profile.chronotype === 'morning') {
    suggestions.push('Respirazione mattutina 4-7-8');
  } else if (flags.high_stress) {
    suggestions.push('Meditazione serale 5 minuti');
  }
  
  if (flags.declining_trend) {
    suggestions.push('Focus su routine costanti');
  }
  
  return suggestions.slice(0, 3);
}

function generateReasons(metrics: HealthMetrics, flags: any, suggestions: string[]): string[] {
  const reasons: string[] = [];
  
  if (flags.low_sleep) reasons.push(`Sonno insufficiente (${metrics.sleep_hours}h)`);
  if (flags.high_stress) reasons.push('Livello di stress elevato');
  if (flags.low_activity) reasons.push('Attività fisica limitata');
  if (flags.improving_trend) reasons.push('Miglioramento costante');
  if (flags.declining_trend) reasons.push('Trend in peggioramento');
  if (flags.burnout_risk) reasons.push('Segnali di possibile burnout');
  
  if (reasons.length === 0) reasons.push('Giornata equilibrata');
  
  return reasons.slice(0, 3);
}

async function saveLifeScore(supabase: any, userId: string, lifeScore: LifeScoreV2) {
  const { error } = await supabase
    .from('lifescores')
    .upsert({
      user_id: userId,
      date: lifeScore.date,
      score: lifeScore.score,
      sleep_score: lifeScore.sleep_score,
      activity_score: lifeScore.activity_score,
      mental_score: lifeScore.mental_score,
      trend_3d: lifeScore.trend_3d,
      trend_7d: lifeScore.trend_7d,
      flags: lifeScore.flags,
      reasons: lifeScore.reasons,
      confidence_level: lifeScore.confidence_level,
      prediction_3d: lifeScore.prediction_3d,
      prediction_7d: lifeScore.prediction_7d,
      anomaly_score: lifeScore.anomaly_score,
      circadian_factor: lifeScore.circadian_factor,
      personal_baseline: lifeScore.personal_baseline,
      improvement_suggestions: lifeScore.improvement_suggestions
    }, {
      onConflict: 'user_id,date'
    });

  if (error) {
    throw new Error(`Error saving LifeScore: ${error.message}`);
  }
}

async function generateSuggestions(supabase: any, userId: string, lifeScore: LifeScoreV2, profile: UserProfile, date: string) {
  // Smart suggestion logic based on flags and profile
  const suggestions: any[] = [];
  
  if (lifeScore.flags.high_stress) {
    suggestions.push({
      suggestion_key: 'breathing-478',
      priority: 8,
      reason: 'Stress elevato rilevato'
    });
  }
  
  if (lifeScore.flags.low_sleep) {
    suggestions.push({
      suggestion_key: 'power-nap',
      priority: 7,
      reason: 'Recupero energia dopo sonno insufficiente'
    });
  }
  
  if (lifeScore.flags.low_activity) {
    suggestions.push({
      suggestion_key: 'walk-10min',
      priority: 6,
      reason: 'Aumentare attività fisica'
    });
  }
  
  if (lifeScore.score >= 80) {
    suggestions.push({
      suggestion_key: 'meditation-5min',
      priority: 5,
      reason: 'Mantenere il benessere ottimale'
    });
  }

  // Save suggestions
  for (const suggestion of suggestions) {
    await supabase
      .from('user_suggestions')
      .upsert({
        user_id: userId,
        date: date,
        suggestion_key: suggestion.suggestion_key,
        priority: suggestion.priority,
        reason: suggestion.reason,
        completed: false
      }, {
        onConflict: 'user_id,date,suggestion_key'
      });
  }
}

async function updateUserProfileIfNeeded(supabase: any, userId: string, profile: UserProfile, historicalData: any[]) {
  // Update profile every 7 days or when we have enough new data
  const daysSinceUpdate = profile.last_learning_date ? 
    Math.floor((Date.now() - new Date(profile.last_learning_date).getTime()) / (1000 * 60 * 60 * 24)) : 999;
  
  if (daysSinceUpdate >= 7 && historicalData.length >= 14) {
    // Recalculate baselines
    const recentData = historicalData.slice(-30);
    
    const newBaseline = {
      sleep: recentData.reduce((sum, d) => sum + d.sleep_hours, 0) / recentData.length,
      activity: recentData.reduce((sum, d) => sum + d.steps, 0) / recentData.length,
      mood: recentData.reduce((sum, d) => sum + d.mood, 0) / recentData.length,
      stress: recentData.reduce((sum, d) => sum + d.stress, 0) / recentData.length
    };
    
    await supabase
      .from('user_profiles')
      .update({
        baseline_sleep: newBaseline.sleep,
        baseline_activity: Math.round(newBaseline.activity),
        baseline_mood: newBaseline.mood,
        baseline_stress: newBaseline.stress,
        data_points_count: recentData.length,
        last_learning_date: new Date().toISOString().slice(0, 10),
        confidence_score: Math.min(1.0, recentData.length / 30)
      })
      .eq('user_id', userId);
  }
}
