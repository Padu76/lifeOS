// deno-lint-ignore-file no-explicit-any
// LifeOS — Advanced Edge Function: daily-rollup with intelligent LifeScore & suggestions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PROJECT_URL = Deno.env.get("PROJECT_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing PROJECT_URL or SERVICE_ROLE_KEY");
}

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface HealthMetrics {
  user_id: string;
  date: string;
  sleep_hours: number;
  sleep_quality: number;
  steps: number;
  active_minutes?: number;
  hr_avg?: number;
  mood: number;
  stress: number;
  energy: number;
  source: string;
}

interface LifeScore {
  date: string;
  score: number;
  breakdown: {
    sleep_score: number;
    activity_score: number;
    mental_score: number;
  };
  trend_3d: number;
  trend_7d: number;
  flags: LifeScoreFlags;
  reasons: string[];
}

interface LifeScoreFlags {
  low_sleep?: boolean;
  high_stress?: boolean;
  low_activity?: boolean;
  declining_trend?: boolean;
  improving_trend?: boolean;
  burnout_risk?: boolean;
}

interface SuggestionTrigger {
  condition: 'low_sleep' | 'high_stress' | 'low_activity' | 'declining_trend' | 'burnout_risk';
  priority: number;
}

interface Suggestion {
  id: string;
  key: string;
  title: string;
  short_copy: string;
  category: string;
  duration_sec: number;
  difficulty: number;
  triggers: SuggestionTrigger[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function isValidISODate(d: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function toISODateEuropeRome(date?: Date): string {
  const d = date ?? new Date();
  const local = new Date(d.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, (m - 1), d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  const ry = dt.getUTCFullYear();
  const rm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const rd = String(dt.getUTCDate()).padStart(2, "0");
  return `${ry}-${rm}-${rd}`;
}

function json(obj: any, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

// ============================================================================
// ADVANCED LIFESCORE CALCULATOR
// ============================================================================
class LifeScoreCalculator {
  private static readonly TARGETS = {
    sleep_hours: 8,
    steps: 7000,
    active_minutes: 30,
  };

  private static readonly THRESHOLDS = {
    low_sleep: 6,
    high_stress: 4,
    low_activity: 3000,
    score_decline: 15,
    burnout_risk_score: 40,
  };

  static calculateLifeScore(metrics: HealthMetrics, historicalScores: any[] = []): LifeScore {
    // Normalize individual metrics to 0-100 scale
    const sleepScore = this.calculateSleepScore(metrics);
    const activityScore = this.calculateActivityScore(metrics);
    const mentalScore = this.calculateMentalScore(metrics);

    // Apply dynamic weighting based on outliers
    const dynamicWeights = this.calculateDynamicWeights({
      sleepScore,
      activityScore,
      mentalScore
    });

    // Calculate final weighted score
    const finalScore = Math.round(
      sleepScore * dynamicWeights.w_sleep +
      activityScore * dynamicWeights.w_activity +
      mentalScore * dynamicWeights.w_mental
    );

    // Calculate trends
    const trends = this.calculateTrends(finalScore, historicalScores);

    // Generate flags based on metrics and trends
    const flags = this.generateFlags(metrics, finalScore, trends);

    // Generate explanatory reasons
    const reasons = this.generateReasons(metrics, { sleepScore, activityScore, mentalScore }, flags);

    return {
      date: metrics.date,
      score: Math.max(0, Math.min(100, finalScore)),
      breakdown: {
        sleep_score: sleepScore,
        activity_score: activityScore,
        mental_score: mentalScore
      },
      trend_3d: trends.trend_3d,
      trend_7d: trends.trend_7d,
      flags,
      reasons
    };
  }

  private static calculateSleepScore(metrics: HealthMetrics): number {
    const { sleep_hours, sleep_quality } = metrics;
    
    // Hours component (0-70 points)
    const hoursRatio = Math.min(sleep_hours / this.TARGETS.sleep_hours, 1.2);
    let hoursScore = 70;
    
    if (hoursRatio < 0.75) {
      hoursScore = hoursRatio * 93.33;
    } else if (hoursRatio > 1.125) {
      hoursScore = 70 - (hoursRatio - 1.125) * 80;
    }
    
    // Quality component (0-30 points)
    const qualityScore = ((sleep_quality - 1) / 4) * 30;
    
    return Math.max(0, Math.min(100, hoursScore + qualityScore));
  }

  private static calculateActivityScore(metrics: HealthMetrics): number {
    const { steps, active_minutes = 0 } = metrics;
    
    // Steps component (0-60 points)
    const stepsRatio = Math.min(steps / this.TARGETS.steps, 1.5);
    const stepsScore = Math.min(stepsRatio * 60, 60);
    
    // Active minutes component (0-40 points)
    const activeRatio = Math.min(active_minutes / this.TARGETS.active_minutes, 1.5);
    const activeScore = Math.min(activeRatio * 40, 40);
    
    return Math.max(0, Math.min(100, stepsScore + activeScore));
  }

  private static calculateMentalScore(metrics: HealthMetrics): number {
    const { mood, stress, energy } = metrics;
    
    // Mood: 1-5 -> 0-40 points
    const moodScore = ((mood - 1) / 4) * 40;
    
    // Stress (inverted): 1-5 -> 30-0 points
    const stressScore = ((5 - stress) / 4) * 30;
    
    // Energy: 1-5 -> 0-30 points
    const energyScore = ((energy - 1) / 4) * 30;
    
    return Math.max(0, Math.min(100, moodScore + stressScore + energyScore));
  }

  private static calculateDynamicWeights(scores: {
    sleepScore: number;
    activityScore: number;
    mentalScore: number;
  }) {
    const { sleepScore, activityScore, mentalScore } = scores;
    const avgScore = (sleepScore + activityScore + mentalScore) / 3;
    
    // Base weights
    let w_sleep = 0.4;
    let w_activity = 0.3;
    let w_mental = 0.3;
    
    // If one dimension is significantly below average, increase its weight
    const adjustments = {
      sleep: sleepScore < avgScore - 20 ? 0.1 : 0,
      activity: activityScore < avgScore - 20 ? 0.1 : 0,
      mental: mentalScore < avgScore - 20 ? 0.1 : 0
    };
    
    // Apply adjustments and normalize
    const totalAdjustment = Object.values(adjustments).reduce((sum, adj) => sum + adj, 0);
    const remainingWeight = 1 - totalAdjustment;
    
    return {
      w_sleep: (w_sleep * remainingWeight) + adjustments.sleep,
      w_activity: (w_activity * remainingWeight) + adjustments.activity,
      w_mental: (w_mental * remainingWeight) + adjustments.mental
    };
  }

  private static calculateTrends(currentScore: number, historicalScores: any[]) {
    const get3DayAvg = () => {
      const recent = historicalScores.slice(-3);
      return recent.length > 0 
        ? recent.reduce((sum: number, s: any) => sum + (s.score || s.lifescore), 0) / recent.length 
        : currentScore;
    };
    
    const get7DayAvg = () => {
      const recent = historicalScores.slice(-7);
      return recent.length > 0 
        ? recent.reduce((sum: number, s: any) => sum + (s.score || s.lifescore), 0) / recent.length 
        : currentScore;
    };
    
    return {
      trend_3d: Math.round(currentScore - get3DayAvg()),
      trend_7d: Math.round(currentScore - get7DayAvg())
    };
  }

  private static generateFlags(
    metrics: HealthMetrics,
    score: number,
    trends: { trend_3d: number; trend_7d: number }
  ): LifeScoreFlags {
    const flags: LifeScoreFlags = {};
    
    if (metrics.sleep_hours < this.THRESHOLDS.low_sleep) {
      flags.low_sleep = true;
    }
    
    if (metrics.stress >= this.THRESHOLDS.high_stress) {
      flags.high_stress = true;
    }
    
    if (metrics.steps < this.THRESHOLDS.low_activity) {
      flags.low_activity = true;
    }
    
    if (trends.trend_7d <= -this.THRESHOLDS.score_decline) {
      flags.declining_trend = true;
    }
    
    if (trends.trend_7d >= this.THRESHOLDS.score_decline) {
      flags.improving_trend = true;
    }
    
    if (score < this.THRESHOLDS.burnout_risk_score && 
        flags.high_stress && 
        flags.declining_trend) {
      flags.burnout_risk = true;
    }
    
    return flags;
  }

  private static generateReasons(
    metrics: HealthMetrics,
    scores: { sleepScore: number; activityScore: number; mentalScore: number },
    flags: LifeScoreFlags
  ): string[] {
    const reasons: string[] = [];
    
    // Positive contributors
    if (scores.sleepScore >= 80) reasons.push("Ottimo riposo notturno");
    if (scores.activityScore >= 80) reasons.push("Eccellente livello di attività");
    if (scores.mentalScore >= 80) reasons.push("Stato mentale molto positivo");
    
    // Areas for improvement
    if (flags.low_sleep) reasons.push(`Sonno insufficiente (${metrics.sleep_hours}h)`);
    if (flags.high_stress) reasons.push("Livello di stress elevato");
    if (flags.low_activity) reasons.push("Attività fisica limitata");
    if (flags.declining_trend) reasons.push("Trend in peggioramento");
    if (flags.improving_trend) reasons.push("Miglioramento costante");
    if (flags.burnout_risk) reasons.push("⚠️ Segnali di possibile burnout");
    
    return reasons;
  }
}

// ============================================================================
// INTELLIGENT SUGGESTION ENGINE
// ============================================================================
class SuggestionEngine {
  private static readonly COOLDOWN_HOURS: { [key: string]: number } = {
    'breathing-478': 6,
    'meditation-5min': 12,
    'walk-10min': 8,
    'stretching-basic': 4,
    'power-nap': 24,
  };

  static async generateSuggestions(
    lifeScore: LifeScore,
    userId: string,
    supabase: any,
    availableSuggestions: Suggestion[]
  ): Promise<any[]> {
    // Get recent suggestions for cooldown check
    const { data: recentSuggestions } = await supabase
      .from('user_suggestions')
      .select('suggestion_key, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const currentTime = new Date();
    
    // Filter out suggestions in cooldown
    const availableNow = availableSuggestions.filter(suggestion => 
      this.isAvailable(suggestion, recentSuggestions || [], currentTime)
    );

    // Priority scoring based on flags
    const scoredSuggestions = availableNow.map(suggestion => ({
      suggestion,
      priority: this.calculatePriority(suggestion, lifeScore),
      reason: this.generateReason(suggestion, lifeScore)
    }));

    // Sort by priority and take top 3
    const topSuggestions = scoredSuggestions
      .filter(item => item.priority > 0)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);

    // Convert to database format
    return topSuggestions.map(item => ({
      user_id: userId,
      date: lifeScore.date,
      suggestion_key: item.suggestion.key,
      suggestion_id: item.suggestion.id,
      priority: item.priority,
      reason: item.reason,
      completed: false
    }));
  }

  private static isAvailable(
    suggestion: Suggestion,
    recentSuggestions: any[],
    currentTime: Date
  ): boolean {
    const cooldownHours = this.COOLDOWN_HOURS[suggestion.key] || 8;
    const cooldownMs = cooldownHours * 60 * 60 * 1000;

    const lastUsed = recentSuggestions
      .filter(s => s.suggestion_key === suggestion.key)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (!lastUsed) return true;

    const timeSinceLastUse = currentTime.getTime() - new Date(lastUsed.created_at).getTime();
    return timeSinceLastUse >= cooldownMs;
  }

  private static calculatePriority(suggestion: Suggestion, lifeScore: LifeScore): number {
    let priority = 0;

    // Base priority from suggestion triggers
    const matchingTriggers = suggestion.triggers.filter(trigger => {
      switch (trigger.condition) {
        case 'low_sleep': return lifeScore.flags.low_sleep;
        case 'high_stress': return lifeScore.flags.high_stress;
        case 'low_activity': return lifeScore.flags.low_activity;
        case 'declining_trend': return lifeScore.flags.declining_trend;
        case 'burnout_risk': return lifeScore.flags.burnout_risk;
        default: return false;
      }
    });

    if (matchingTriggers.length === 0) return 0;

    // Sum base priorities from matching triggers
    priority = matchingTriggers.reduce((sum, trigger) => sum + trigger.priority, 0);

    // Score-based adjustments
    if (lifeScore.score < 40) {
      priority += 3;
    } else if (lifeScore.score < 60) {
      priority += 1;
    }

    // Trend-based adjustments
    if (lifeScore.trend_7d < -15) {
      priority += 2;
    }

    // Time-of-day contextual boosting
    const hour = new Date().getHours();
    priority += this.getTimeBasedBoost(suggestion, hour);

    return Math.max(0, priority);
  }

  private static getTimeBasedBoost(suggestion: Suggestion, hour: number): number {
    const category = suggestion.category;
    
    if (hour >= 6 && hour <= 10 && category === 'movement') return 2;
    if (hour >= 11 && hour <= 14 && suggestion.key === 'power-nap') return 2;
    if (hour >= 15 && hour <= 18 && category === 'breathing') return 1;
    if (hour >= 19 && hour <= 22 && category === 'meditation') return 2;
    
    return 0;
  }

  private static generateReason(suggestion: Suggestion, lifeScore: LifeScore): string {
    const reasons: string[] = [];

    if (lifeScore.flags.burnout_risk) reasons.push("Segnali di stress elevato rilevati");
    if (lifeScore.flags.low_sleep) reasons.push("Qualità del sonno da migliorare");
    if (lifeScore.flags.high_stress) reasons.push("Livello di stress alto");
    if (lifeScore.flags.low_activity) reasons.push("Attività fisica limitata oggi");
    if (lifeScore.flags.declining_trend) reasons.push("Trend in peggioramento");
    if (lifeScore.score < 50) reasons.push("Benessere generale sotto la media");

    return reasons.length > 0 ? reasons.join(" • ") : "Suggerito per mantenere il benessere";
  }
}

// ============================================================================
// BUILT-IN SUGGESTIONS CATALOG
// ============================================================================
const BUILT_IN_SUGGESTIONS: Suggestion[] = [
  {
    id: 'breathing-478-builtin',
    key: 'breathing-478',
    title: 'Respirazione 4-7-8',
    short_copy: 'Tecnica di respirazione per ridurre stress e ansia',
    category: 'breathing',
    duration_sec: 120,
    difficulty: 1,
    triggers: [
      { condition: 'high_stress', priority: 8 },
      { condition: 'burnout_risk', priority: 9 }
    ]
  },
  {
    id: 'meditation-5min-builtin',
    key: 'meditation-5min',
    title: 'Meditazione Mindfulness',
    short_copy: 'Sessione guidata di 5 minuti',
    category: 'meditation',
    duration_sec: 300,
    difficulty: 2,
    triggers: [
      { condition: 'high_stress', priority: 7 },
      { condition: 'burnout_risk', priority: 8 }
    ]
  },
  {
    id: 'walk-10min-builtin',
    key: 'walk-10min',
    title: 'Camminata Energizzante',
    short_copy: 'Passeggiata di 10 minuti',
    category: 'movement',
    duration_sec: 600,
    difficulty: 1,
    triggers: [
      { condition: 'low_activity', priority: 9 }
    ]
  },
  {
    id: 'power-nap-builtin',
    key: 'power-nap',
    title: 'Power Nap',
    short_copy: 'Micro-sonno rigenerante di 15 minuti',
    category: 'rest',
    duration_sec: 900,
    difficulty: 2,
    triggers: [
      { condition: 'low_sleep', priority: 8 }
    ]
  }
];

// ============================================================================
// MAIN HANDLER
// ============================================================================
export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
      },
    });
  }

  const supabase = createClient(PROJECT_URL!, SERVICE_ROLE_KEY!);

  // Parse day parameter
  let day: string | undefined;
  try {
    if (req.method === "POST" && req.headers.get("content-type")?.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      day = body?.day;
    } else {
      const url = new URL(req.url);
      day = url.searchParams.get("day") ?? undefined;
    }
  } catch (_e) {}

  const dayStr = (day && isValidISODate(day)) ? day : toISODateEuropeRome();

  // 1) Get health metrics for the day
  const { data: rows, error: selErr } = await supabase
    .from("health_metrics")
    .select("*")
    .eq("date", dayStr);

  if (selErr) return json({ ok: false, error: selErr.message }, 500);
  if (!rows || rows.length === 0) {
    return json({ ok: true, processed: 0, day: dayStr, message: "No health metrics found" });
  }

  // 2) Load available suggestions from database (fallback to built-in)
  let availableSuggestions = BUILT_IN_SUGGESTIONS;
  try {
    const { data: dbSuggestions } = await supabase
      .from("suggestions")
      .select("*");
    
    if (dbSuggestions && dbSuggestions.length > 0) {
      // Map database suggestions to our format
      availableSuggestions = dbSuggestions.map((s: any) => ({
        id: s.id,
        key: s.key || s.id,
        title: s.title || 'Unnamed Suggestion',
        short_copy: s.short_copy || '',
        category: s.category || 'general',
        duration_sec: s.duration_sec || 300,
        difficulty: s.difficulty || 1,
        triggers: [{ condition: 'high_stress', priority: 5 }] // Default trigger
      }));
    }
  } catch (e) {
    console.warn("Failed to load suggestions from database, using built-in:", e);
  }

  let processed = 0;
  const errors: any[] = [];

  for (const metrics of rows) {
    try {
      // Prepare metrics in expected format
      const healthMetrics: HealthMetrics = {
        user_id: metrics.user_id,
        date: metrics.date,
        sleep_hours: Number(metrics.sleep_hours || 0),
        sleep_quality: Number(metrics.sleep_quality || 3),
        steps: Number(metrics.steps || 0),
        active_minutes: Number(metrics.active_minutes || 0),
        hr_avg: metrics.hr_avg ? Number(metrics.hr_avg) : undefined,
        mood: Number(metrics.mood || 3),
        stress: Number(metrics.stress || 3),
        energy: Number(metrics.energy || 3),
        source: metrics.source || 'manual'
      };

      // Get historical scores for trend calculation
      const { data: historicalScores } = await supabase
        .from("lifescores")
        .select("score, lifescore, date")
        .eq("user_id", metrics.user_id)
        .lt("date", dayStr)
        .order("date", { ascending: false })
        .limit(7);

      // Calculate advanced LifeScore
      const lifeScore = LifeScoreCalculator.calculateLifeScore(
        healthMetrics,
        historicalScores || []
      );

      // Save LifeScore to database
      const { error: lifescoreErr } = await supabase
        .from("lifescores")
        .upsert({
          user_id: metrics.user_id,
          date: dayStr,
          score: lifeScore.score,
          sleep_score: lifeScore.breakdown.sleep_score,
          activity_score: lifeScore.breakdown.activity_score,
          mental_score: lifeScore.breakdown.mental_score,
          trend_3d: lifeScore.trend_3d,
          trend_7d: lifeScore.trend_7d,
          flags: lifeScore.flags,
          reasons: lifeScore.reasons,
          lifescore: lifeScore.score // Keep for backwards compatibility
        }, { onConflict: "user_id,date" });

      if (lifescoreErr) throw lifescoreErr;

      // Generate intelligent suggestions
      const suggestions = await SuggestionEngine.generateSuggestions(
        lifeScore,
        metrics.user_id,
        supabase,
        availableSuggestions
      );

      // Clear existing suggestions for the day and insert new ones
      await supabase
        .from("user_suggestions")
        .delete()
        .eq("user_id", metrics.user_id)
        .eq("date", dayStr);

      if (suggestions.length > 0) {
        const { error: suggestionErr } = await supabase
          .from("user_suggestions")
          .insert(suggestions);
        
        if (suggestionErr) {
          console.warn(`Suggestion insert warning for user ${metrics.user_id}:`, suggestionErr.message);
        }
      }

      processed += 1;
    } catch (e: any) {
      errors.push({ 
        user_id: metrics.user_id, 
        error: String(e?.message ?? e) 
      });
      console.error(`Error processing user ${metrics.user_id}:`, e);
    }
  }

  return json({ 
    ok: true, 
    processed, 
    day: dayStr, 
    errors,
    message: `Processed ${processed} users with advanced LifeScore algorithm`
  });
}

Deno.serve(handler);
