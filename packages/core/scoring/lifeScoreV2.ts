import { HealthMetrics, LifeScore, LifeScoreWeights, LifeScoreFlags } from '../../types';

export interface AdvancedLifeScore extends LifeScore {
  confidence_level: number; // 0-1, quanto siamo sicuri del calcolo
  prediction_3d: number; // previsione a 3 giorni
  prediction_7d: number; // previsione a 7 giorni
  anomaly_score: number; // 0-1, detecta outliers
  circadian_factor: number; // fattore basato su ora/giorno
  personal_baseline: number; // baseline personale dell'utente
  improvement_suggestions: string[]; // suggerimenti specifici per migliorare
}

export interface UserProfile {
  user_id: string;
  baseline_sleep: number;
  baseline_activity: number;
  baseline_mood: number;
  sleep_sensitivity: number; // quanto il sonno impatta il punteggio
  activity_sensitivity: number;
  mood_sensitivity: number;
  optimal_sleep_range: [number, number];
  optimal_activity_range: [number, number];
  chronotype: 'morning' | 'evening' | 'neutral';
  stress_patterns: string[]; // giorni settimana più stressanti
  created_at: string;
  updated_at: string;
}

export class LifeScoreV2Calculator {
  private static readonly DEFAULT_WEIGHTS: LifeScoreWeights = {
    w_sleep: 0.35,
    w_activity: 0.30,
    w_mental: 0.35,
    updated_at: new Date().toISOString()
  };

  // Parametri per machine learning semplificato
  private static readonly LEARNING_RATE = 0.1;
  private static readonly MIN_HISTORY_DAYS = 7;
  private static readonly CONFIDENCE_THRESHOLD = 0.7;

  /**
   * Calcola LifeScore avanzato con machine learning
   */
  static async calculateAdvancedLifeScore(
    metrics: HealthMetrics,
    historicalData: HealthMetrics[],
    userProfile?: UserProfile,
    previousScores: LifeScore[] = []
  ): Promise<AdvancedLifeScore> {
    
    // 1. Calcola baseline personale se non esiste
    const profile = userProfile || this.generateUserProfile(metrics.user_id, historicalData);
    
    // 2. Calcola pesi adattivi basati su correlazioni personali
    const adaptiveWeights = this.calculateAdaptiveWeights(historicalData, previousScores, profile);
    
    // 3. Normalizza metriche rispetto al baseline personale
    const normalizedMetrics = this.normalizeToPersonalBaseline(metrics, profile);
    
    // 4. Calcola score base con pesi adattivi
    const baseScore = this.calculateBaseScore(normalizedMetrics, adaptiveWeights);
    
    // 5. Applica fattori circadiani
    const circadianFactor = this.calculateCircadianFactor(metrics, profile);
    const adjustedScore = this.applyCircadianAdjustment(baseScore, circadianFactor);
    
    // 6. Calcola confidence level
    const confidence = this.calculateConfidenceLevel(historicalData.length, profile);
    
    // 7. Anomaly detection
    const anomalyScore = this.detectAnomalies(metrics, historicalData, profile);
    
    // 8. Predizioni future
    const predictions = this.calculatePredictions(historicalData, previousScores);
    
    // 9. Trend analysis avanzato
    const trends = this.calculateAdvancedTrends(adjustedScore, previousScores);
    
    // 10. Genera flags intelligenti
    const smartFlags = this.generateSmartFlags(metrics, anomalyScore, trends, profile);
    
    // 11. Suggerimenti personalizzati
    const suggestions = this.generateImprovementSuggestions(
      normalizedMetrics, 
      smartFlags, 
      profile,
      trends
    );

    return {
      date: metrics.date,
      score: Math.max(0, Math.min(100, Math.round(adjustedScore))),
      breakdown: {
        sleep_score: this.calculateSleepScore(normalizedMetrics, profile),
        activity_score: this.calculateActivityScore(normalizedMetrics, profile),
        mental_score: this.calculateMentalScore(normalizedMetrics, profile)
      },
      trend_3d: trends.trend_3d,
      trend_7d: trends.trend_7d,
      flags: smartFlags,
      reasons: this.generateReasons(normalizedMetrics, smartFlags, suggestions),
      
      // Campi avanzati
      confidence_level: confidence,
      prediction_3d: predictions.prediction_3d,
      prediction_7d: predictions.prediction_7d,
      anomaly_score: anomalyScore,
      circadian_factor: circadianFactor,
      personal_baseline: this.calculatePersonalBaseline(profile),
      improvement_suggestions: suggestions
    };
  }

  /**
   * Genera profilo utente basato su dati storici
   */
  private static generateUserProfile(userId: string, historicalData: HealthMetrics[]): UserProfile {
    if (historicalData.length < this.MIN_HISTORY_DAYS) {
      // Profilo default per nuovi utenti
      return this.getDefaultProfile(userId);
    }

    const sleepData = historicalData.map(d => d.sleep_hours).filter(s => s > 0);
    const activityData = historicalData.map(d => d.steps).filter(s => s > 0);
    const moodData = historicalData.map(d => d.mood).filter(m => m > 0);

    // Calcola baseline e sensitivities usando correlazioni
    const sleepSensitivity = this.calculateSensitivity(sleepData, historicalData);
    const activitySensitivity = this.calculateSensitivity(activityData, historicalData);
    const moodSensitivity = this.calculateSensitivity(moodData, historicalData);

    // Detecta chronotype basato su pattern temporali
    const chronotype = this.detectChronotype(historicalData);

    // Identifica pattern di stress
    const stressPatterns = this.identifyStressPatterns(historicalData);

    return {
      user_id: userId,
      baseline_sleep: this.calculateMedian(sleepData),
      baseline_activity: this.calculateMedian(activityData),
      baseline_mood: this.calculateMedian(moodData),
      sleep_sensitivity: sleepSensitivity,
      activity_sensitivity: activitySensitivity,
      mood_sensitivity: moodSensitivity,
      optimal_sleep_range: this.calculateOptimalRange(sleepData),
      optimal_activity_range: this.calculateOptimalRange(activityData),
      chronotype,
      stress_patterns: stressPatterns,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Calcola pesi adattivi basati su correlazioni personali
   */
  private static calculateAdaptiveWeights(
    historicalData: HealthMetrics[],
    previousScores: LifeScore[],
    profile: UserProfile
  ): LifeScoreWeights {
    if (historicalData.length < this.MIN_HISTORY_DAYS) {
      return this.DEFAULT_WEIGHTS;
    }

    // Calcola correlazioni tra metriche e benessere percepito
    const sleepCorrelation = this.calculateCorrelation(
      historicalData.map(d => d.sleep_hours),
      historicalData.map(d => d.mood)
    );
    
    const activityCorrelation = this.calculateCorrelation(
      historicalData.map(d => d.steps),
      historicalData.map(d => d.energy || d.mood) // fallback se energy non esiste
    );
    
    const stressCorrelation = this.calculateCorrelation(
      historicalData.map(d => 5 - d.stress), // inverted stress
      historicalData.map(d => d.mood)
    );

    // Normalizza correlazioni in pesi
    const totalCorrelation = Math.abs(sleepCorrelation) + Math.abs(activityCorrelation) + Math.abs(stressCorrelation);
    
    if (totalCorrelation === 0) {
      return this.DEFAULT_WEIGHTS;
    }

    const adaptiveWeights = {
      w_sleep: (Math.abs(sleepCorrelation) / totalCorrelation) * 0.7 + 0.15, // min 15%, max 85%
      w_activity: (Math.abs(activityCorrelation) / totalCorrelation) * 0.7 + 0.15,
      w_mental: (Math.abs(stressCorrelation) / totalCorrelation) * 0.7 + 0.15,
      updated_at: new Date().toISOString()
    };

    // Smooth transition da pesi default
    const smoothingFactor = Math.min(historicalData.length / 30, 1); // 30 giorni per convergenza
    
    return {
      w_sleep: this.DEFAULT_WEIGHTS.w_sleep * (1 - smoothingFactor) + adaptiveWeights.w_sleep * smoothingFactor,
      w_activity: this.DEFAULT_WEIGHTS.w_activity * (1 - smoothingFactor) + adaptiveWeights.w_activity * smoothingFactor,
      w_mental: this.DEFAULT_WEIGHTS.w_mental * (1 - smoothingFactor) + adaptiveWeights.w_mental * smoothingFactor,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Normalizza metriche rispetto al baseline personale
   */
  private static normalizeToPersonalBaseline(
    metrics: HealthMetrics, 
    profile: UserProfile
  ): HealthMetrics {
    return {
      ...metrics,
      sleep_hours: this.normalizeToRange(
        metrics.sleep_hours, 
        profile.optimal_sleep_range[0], 
        profile.optimal_sleep_range[1]
      ),
      steps: this.normalizeToRange(
        metrics.steps, 
        profile.optimal_activity_range[0], 
        profile.optimal_activity_range[1]
      ),
      mood: this.adjustToBaseline(metrics.mood, profile.baseline_mood),
      stress: metrics.stress, // stress rimane 1-5
      energy: metrics.energy ? this.adjustToBaseline(metrics.energy, profile.baseline_mood) : metrics.energy
    };
  }

  /**
   * Calcola fattore circadiano
   */
  private static calculateCircadianFactor(metrics: HealthMetrics, profile: UserProfile): number {
    const date = new Date(metrics.date);
    const dayOfWeek = date.getDay(); // 0 = Sunday
    const hour = date.getHours();

    let circadianMultiplier = 1.0;

    // Fattore chronotype
    if (profile.chronotype === 'morning' && hour >= 6 && hour <= 10) {
      circadianMultiplier += 0.1; // boost mattutino
    } else if (profile.chronotype === 'evening' && hour >= 18 && hour <= 22) {
      circadianMultiplier += 0.1; // boost serale
    }

    // Fattore weekend vs weekday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
      circadianMultiplier += 0.05; // leggero boost weekend
    }

    // Penalità per pattern di stress noti
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    if (profile.stress_patterns.includes(dayName)) {
      circadianMultiplier -= 0.1;
    }

    return Math.max(0.8, Math.min(1.2, circadianMultiplier));
  }

  /**
   * Calcola predizioni future
   */
  private static calculatePredictions(
    historicalData: HealthMetrics[],
    previousScores: LifeScore[]
  ): { prediction_3d: number; prediction_7d: number } {
    if (previousScores.length < 7) {
      const recent = previousScores.slice(-3);
      const avg = recent.length > 0 ? recent.reduce((sum, s) => sum + s.score, 0) / recent.length : 75;
      return { prediction_3d: avg, prediction_7d: avg };
    }

    // Simple linear regression per trend
    const recentScores = previousScores.slice(-14).map(s => s.score);
    const trend = this.calculateLinearTrend(recentScores);
    
    const currentAvg = recentScores.slice(-3).reduce((sum, score) => sum + score, 0) / 3;
    
    return {
      prediction_3d: Math.max(0, Math.min(100, currentAvg + trend * 3)),
      prediction_7d: Math.max(0, Math.min(100, currentAvg + trend * 7))
    };
  }

  /**
   * Anomaly detection
   */
  private static detectAnomalies(
    metrics: HealthMetrics,
    historicalData: HealthMetrics[],
    profile: UserProfile
  ): number {
    if (historicalData.length < 14) return 0;

    const recent = historicalData.slice(-14);
    
    // Calcola z-scores per ogni metrica
    const sleepZScore = this.calculateZScore(metrics.sleep_hours, recent.map(d => d.sleep_hours));
    const activityZScore = this.calculateZScore(metrics.steps, recent.map(d => d.steps));
    const moodZScore = this.calculateZScore(metrics.mood, recent.map(d => d.mood));
    const stressZScore = this.calculateZScore(metrics.stress, recent.map(d => d.stress));

    // Anomaly score è la massima deviazione normalizzata
    const maxDeviation = Math.max(
      Math.abs(sleepZScore),
      Math.abs(activityZScore), 
      Math.abs(moodZScore),
      Math.abs(stressZScore)
    );

    // Normalizza a 0-1
    return Math.min(1, maxDeviation / 3); // 3 sigma = anomalia massima
  }

  /**
   * Genera suggerimenti di miglioramento personalizzati
   */
  private static generateImprovementSuggestions(
    metrics: HealthMetrics,
    flags: LifeScoreFlags,
    profile: UserProfile,
    trends: { trend_3d: number; trend_7d: number }
  ): string[] {
    const suggestions: string[] = [];

    // Sonno
    if (metrics.sleep_hours < profile.optimal_sleep_range[0]) {
      suggestions.push(`Dormi ${(profile.optimal_sleep_range[0] - metrics.sleep_hours).toFixed(1)}h in più`);
    } else if (metrics.sleep_hours > profile.optimal_sleep_range[1]) {
      suggestions.push('Riduci leggermente le ore di sonno per ottimizzare energia');
    }

    // Attività
    if (metrics.steps < profile.optimal_activity_range[0]) {
      const diff = profile.optimal_activity_range[0] - metrics.steps;
      suggestions.push(`Aggiungi ${Math.round(diff)} passi (~${Math.round(diff/100)*100/1000*10} min camminata)`);
    }

    // Stress e mood pattern
    if (flags.high_stress && profile.chronotype === 'morning') {
      suggestions.push('Prova respirazione 4-7-8 al mattino');
    } else if (flags.high_stress) {
      suggestions.push('Considera meditazione serale per rilassarti');
    }

    // Trend declining
    if (trends.trend_7d < -10) {
      suggestions.push('Focus su routine costanti per stabilizzare il benessere');
    }

    return suggestions.slice(0, 3); // max 3 suggerimenti
  }

  // Utility functions
  private static calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 3) return 0;

    const xMean = x.slice(0, n).reduce((a, b) => a + b) / n;
    const yMean = y.slice(0, n).reduce((a, b) => a + b) / n;

    let numerator = 0;
    let xDenom = 0;
    let yDenom = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xDenom += xDiff * xDiff;
      yDenom += yDiff * yDiff;
    }

    return numerator / Math.sqrt(xDenom * yDenom) || 0;
  }

  private static calculateZScore(value: number, population: number[]): number {
    const mean = population.reduce((a, b) => a + b) / population.length;
    const variance = population.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / population.length;
    const stdDev = Math.sqrt(variance);
    return stdDev === 0 ? 0 : (value - mean) / stdDev;
  }

  // Placeholder implementations for brevity
  private static getDefaultProfile(userId: string): UserProfile {
    return {
      user_id: userId,
      baseline_sleep: 7.5,
      baseline_activity: 7000,
      baseline_mood: 3.5,
      sleep_sensitivity: 0.5,
      activity_sensitivity: 0.5,
      mood_sensitivity: 0.5,
      optimal_sleep_range: [7, 8.5],
      optimal_activity_range: [6000, 10000],
      chronotype: 'neutral',
      stress_patterns: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private static calculateSensitivity(data: number[], historical: HealthMetrics[]): number {
    // Simplified - in real implementation would calculate correlation with wellbeing
    return 0.5;
  }

  private static detectChronotype(data: HealthMetrics[]): 'morning' | 'evening' | 'neutral' {
    // Simplified - would analyze sleep/wake patterns
    return 'neutral';
  }

  private static identifyStressPatterns(data: HealthMetrics[]): string[] {
    // Simplified - would analyze stress by day of week
    return [];
  }

  private static calculateOptimalRange(data: number[]): [number, number] {
    const sorted = [...data].sort((a, b) => a - b);
    const p25 = sorted[Math.floor(sorted.length * 0.25)];
    const p75 = sorted[Math.floor(sorted.length * 0.75)];
    return [p25, p75];
  }

  private static normalizeToRange(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  private static adjustToBaseline(value: number, baseline: number): number {
    return value; // Simplified
  }

  private static calculateLinearTrend(values: number[]): number {
    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = values.reduce((sum, _, x) => sum + x * x, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  // Reuse existing methods from V1 with adaptations
  private static calculateBaseScore(metrics: HealthMetrics, weights: LifeScoreWeights): number {
    return 75; // Simplified
  }

  private static applyCircadianAdjustment(score: number, factor: number): number {
    return score * factor;
  }

  private static calculateConfidenceLevel(historyLength: number, profile: UserProfile): number {
    return Math.min(1, historyLength / 30);
  }

  private static calculateAdvancedTrends(score: number, previousScores: LifeScore[]): { trend_3d: number; trend_7d: number } {
    // Reuse existing trend calculation
    return { trend_3d: 0, trend_7d: 0 };
  }

  private static generateSmartFlags(metrics: HealthMetrics, anomalyScore: number, trends: any, profile: UserProfile): LifeScoreFlags {
    // Enhanced flag generation
    return {};
  }

  private static calculateSleepScore(metrics: HealthMetrics, profile: UserProfile): number {
    return 75; // Simplified
  }

  private static calculateActivityScore(metrics: HealthMetrics, profile: UserProfile): number {
    return 75; // Simplified
  }

  private static calculateMentalScore(metrics: HealthMetrics, profile: UserProfile): number {
    return 75; // Simplified
  }

  private static calculatePersonalBaseline(profile: UserProfile): number {
    return (profile.baseline_mood / 5) * 100;
  }

  private static generateReasons(metrics: HealthMetrics, flags: LifeScoreFlags, suggestions: string[]): string[] {
    return suggestions.slice(0, 2); // Top 2 reasons
  }
}
