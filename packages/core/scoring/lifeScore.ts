import { HealthMetrics, LifeScore, LifeScoreWeights, LifeScoreFlags } from '../../types';

export class LifeScoreCalculator {
  private static readonly DEFAULT_WEIGHTS: LifeScoreWeights = {
    w_sleep: 0.4,
    w_activity: 0.3,
    w_mental: 0.3,
    updated_at: new Date().toISOString()
  };

  // Target values for normalization
  private static readonly TARGETS = {
    sleep_hours: 8,
    steps: 7000,
    active_minutes: 30,
    hr_rest_max: 70, // above this is concerning
  };

  // Thresholds for flags
  private static readonly THRESHOLDS = {
    low_sleep: 6,
    high_stress: 4,
    low_activity: 3000,
    score_decline: 15,
    burnout_risk_score: 40,
  };

  /**
   * Calculate LifeScore for a given day
   */
  static calculateLifeScore(
    metrics: HealthMetrics,
    weights: LifeScoreWeights = this.DEFAULT_WEIGHTS,
    historicalScores: LifeScore[] = []
  ): LifeScore {
    // Normalize individual metrics to 0-100 scale
    const sleepScore = this.calculateSleepScore(metrics);
    const activityScore = this.calculateActivityScore(metrics);
    const mentalScore = this.calculateMentalScore(metrics);

    // Apply dynamic weighting based on outliers
    const dynamicWeights = this.calculateDynamicWeights(
      { sleepScore, activityScore, mentalScore },
      weights
    );

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

  /**
   * Calculate sleep score (0-100) based on hours and quality
   */
  private static calculateSleepScore(metrics: HealthMetrics): number {
    const { sleep_hours, sleep_quality } = metrics;
    
    // Hours component (0-70 points)
    const hoursRatio = Math.min(sleep_hours / this.TARGETS.sleep_hours, 1.2);
    let hoursScore = 70;
    
    if (hoursRatio < 0.75) { // less than 6 hours
      hoursScore = hoursRatio * 93.33; // linear decrease
    } else if (hoursRatio > 1.125) { // more than 9 hours
      hoursScore = 70 - (hoursRatio - 1.125) * 80; // penalty for oversleeping
    }
    
    // Quality component (0-30 points)
    const qualityScore = ((sleep_quality - 1) / 4) * 30;
    
    return Math.max(0, Math.min(100, hoursScore + qualityScore));
  }

  /**
   * Calculate activity score based on steps and active minutes
   */
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

  /**
   * Calculate mental wellness score based on mood, stress, energy
   */
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

  /**
   * Adjust weights dynamically based on outlier detection
   */
  private static calculateDynamicWeights(
    scores: { sleepScore: number; activityScore: number; mentalScore: number },
    baseWeights: LifeScoreWeights
  ): LifeScoreWeights {
    const { sleepScore, activityScore, mentalScore } = scores;
    const avgScore = (sleepScore + activityScore + mentalScore) / 3;
    
    // If one dimension is significantly below average, increase its weight
    const adjustments = {
      sleep: sleepScore < avgScore - 20 ? 0.1 : 0,
      activity: activityScore < avgScore - 20 ? 0.1 : 0,
      mental: mentalScore < avgScore - 20 ? 0.1 : 0
    };
    
    // Normalize weights to sum to 1
    const totalAdjustment = Object.values(adjustments).reduce((sum, adj) => sum + adj, 0);
    const remainingWeight = 1 - totalAdjustment;
    
    return {
      w_sleep: (baseWeights.w_sleep * remainingWeight) + adjustments.sleep,
      w_activity: (baseWeights.w_activity * remainingWeight) + adjustments.activity,
      w_mental: (baseWeights.w_mental * remainingWeight) + adjustments.mental,
      updated_at: baseWeights.updated_at
    };
  }

  /**
   * Calculate trend analysis vs historical scores
   */
  private static calculateTrends(
    currentScore: number,
    historicalScores: LifeScore[]
  ): { trend_3d: number; trend_7d: number } {
    const get3DayAvg = () => {
      const recent = historicalScores.slice(-3);
      return recent.length > 0 
        ? recent.reduce((sum, s) => sum + s.score, 0) / recent.length 
        : currentScore;
    };
    
    const get7DayAvg = () => {
      const recent = historicalScores.slice(-7);
      return recent.length > 0 
        ? recent.reduce((sum, s) => sum + s.score, 0) / recent.length 
        : currentScore;
    };
    
    return {
      trend_3d: Math.round(currentScore - get3DayAvg()),
      trend_7d: Math.round(currentScore - get7DayAvg())
    };
  }

  /**
   * Generate warning flags based on metrics and trends
   */
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
    
    // Burnout risk: low score + high stress + declining trend
    if (score < this.THRESHOLDS.burnout_risk_score && 
        flags.high_stress && 
        flags.declining_trend) {
      flags.burnout_risk = true;
    }
    
    return flags;
  }

  /**
   * Generate human-readable explanations
   */
  private static generateReasons(
    metrics: HealthMetrics,
    scores: { sleepScore: number; activityScore: number; mentalScore: number },
    flags: LifeScoreFlags
  ): string[] {
    const reasons: string[] = [];
    
    // Positive contributors
    if (scores.sleepScore >= 80) {
      reasons.push("Ottimo riposo notturno");
    }
    if (scores.activityScore >= 80) {
      reasons.push("Eccellente livello di attività fisica");
    }
    if (scores.mentalScore >= 80) {
      reasons.push("Stato mentale molto positivo");
    }
    
    // Areas for improvement
    if (flags.low_sleep) {
      reasons.push(`Sonno insufficiente (${metrics.sleep_hours}h)`);
    }
    if (flags.high_stress) {
      reasons.push("Livello di stress elevato");
    }
    if (flags.low_activity) {
      reasons.push("Attività fisica limitata");
    }
    if (flags.declining_trend) {
      reasons.push("Trend in peggioramento negli ultimi giorni");
    }
    if (flags.improving_trend) {
      reasons.push("Miglioramento costante nel tempo");
    }
    if (flags.burnout_risk) {
      reasons.push("⚠️ Segnali di possibile burnout");
    }
    
    return reasons;
  }
}
