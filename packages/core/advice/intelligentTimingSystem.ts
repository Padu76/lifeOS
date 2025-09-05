import { HealthMetrics, LifeScoreV2, UserProfile } from '../../types';

// Types for intelligent timing system
interface CircadianProfile {
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  natural_wake_time: string; // HH:MM format
  natural_sleep_time: string; // HH:MM format
  peak_energy_hours: number[]; // Hours of day (0-23)
  low_energy_hours: number[]; // Hours of day (0-23)
  stress_peak_hours: number[]; // When stress typically peaks
  optimal_intervention_windows: TimeWindow[];
}

interface TimeWindow {
  start_hour: number;
  end_hour: number;
  effectiveness_score: number;
  intervention_type: 'stress_relief' | 'energy_boost' | 'mindfulness' | 'celebration';
  frequency_limit: number; // Max interventions in this window per day
}

interface TimingContext {
  current_time: Date;
  user_timezone: string;
  day_of_week: number; // 0 = Sunday
  is_working_day: boolean;
  predicted_availability: number; // 0-1 score
  recent_activity_level: 'low' | 'medium' | 'high';
  time_since_last_intervention: number; // Minutes
  current_stress_trend: 'rising' | 'stable' | 'declining';
}

interface OptimalMoment {
  suggested_time: Date;
  confidence_score: number; // 0-1
  intervention_type: string;
  reasoning: string;
  alternative_times: Date[];
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
}

interface PatternLearning {
  response_rates_by_hour: Record<number, number>;
  completion_rates_by_day: Record<number, number>;
  effectiveness_by_context: Record<string, number>;
  burnout_indicators: {
    consecutive_dismissals: number;
    declining_engagement: boolean;
    fatigue_score: number;
  };
}

export class IntelligentTimingSystem {
  private readonly MAX_DAILY_INTERVENTIONS = 5;
  private readonly MIN_INTERVENTION_GAP_MINUTES = 90;
  private readonly PEAK_EFFECTIVENESS_THRESHOLD = 0.75;

  // Analyze user's circadian patterns from historical data
  analyzeCircadianProfile(
    historicalMetrics: HealthMetrics[],
    userProfile: UserProfile
  ): CircadianProfile {
    const sleepData = this.extractSleepPatterns(historicalMetrics);
    const energyData = this.extractEnergyPatterns(historicalMetrics);
    const stressData = this.extractStressPatterns(historicalMetrics);

    // Determine chronotype based on sleep patterns
    const avgBedtime = this.calculateAverageTime(sleepData.bedtimes);
    const avgWakeTime = this.calculateAverageTime(sleepData.waketimes);
    const chronotype = this.determineChronotype(avgBedtime, avgWakeTime);

    // Find peak energy and stress hours
    const peakEnergyHours = this.findPeakHours(energyData, 'high');
    const lowEnergyHours = this.findPeakHours(energyData, 'low');
    const stressPeakHours = this.findPeakHours(stressData, 'high');

    // Generate optimal intervention windows
    const optimalWindows = this.generateOptimalWindows(
      chronotype,
      peakEnergyHours,
      lowEnergyHours,
      stressPeakHours
    );

    return {
      chronotype,
      natural_wake_time: avgWakeTime,
      natural_sleep_time: avgBedtime,
      peak_energy_hours: peakEnergyHours,
      low_energy_hours: lowEnergyHours,
      stress_peak_hours: stressPeakHours,
      optimal_intervention_windows: optimalWindows
    };
  }

  // Predict optimal moment for intervention
  predictOptimalMoment(
    context: TimingContext,
    circadianProfile: CircadianProfile,
    currentLifeScore: LifeScoreV2,
    interventionType: string,
    patternLearning: PatternLearning
  ): OptimalMoment {
    const currentHour = context.current_time.getHours();
    const urgencyLevel = this.assessUrgencyLevel(currentLifeScore, context);
    
    // Check if immediate intervention is needed (emergency)
    if (urgencyLevel === 'emergency') {
      return {
        suggested_time: context.current_time,
        confidence_score: 0.95,
        intervention_type: interventionType,
        reasoning: 'Emergency intervention needed - high stress/low wellbeing detected',
        alternative_times: [],
        urgency_level: 'emergency'
      };
    }

    // Find optimal window for this intervention type
    const relevantWindows = circadianProfile.optimal_intervention_windows
      .filter(w => w.intervention_type === interventionType || w.intervention_type === 'mindfulness');

    let bestMoment: Date = context.current_time;
    let bestScore = 0;
    let reasoning = '';

    for (const window of relevantWindows) {
      const windowScore = this.calculateWindowScore(
        window,
        context,
        patternLearning,
        urgencyLevel
      );

      if (windowScore > bestScore) {
        bestScore = windowScore;
        bestMoment = this.findNextTimeInWindow(window, context.current_time);
        reasoning = this.generateReasoningForWindow(window, windowScore);
      }
    }

    // Generate alternative times
    const alternatives = this.generateAlternativeTimes(
      bestMoment,
      circadianProfile,
      context
    );

    return {
      suggested_time: bestMoment,
      confidence_score: bestScore,
      intervention_type: interventionType,
      reasoning,
      alternative_times: alternatives,
      urgency_level
    };
  }

  // Check if now is a good time for intervention
  isOptimalTimeForIntervention(
    context: TimingContext,
    circadianProfile: CircadianProfile,
    patternLearning: PatternLearning,
    interventionType: string
  ): { isOptimal: boolean; score: number; reasoning: string } {
    const currentHour = context.current_time.getHours();
    
    // Check basic constraints
    if (context.time_since_last_intervention < this.MIN_INTERVENTION_GAP_MINUTES) {
      return {
        isOptimal: false,
        score: 0,
        reasoning: 'Too soon since last intervention'
      };
    }

    // Check daily limit
    if (this.hasReachedDailyLimit(context, patternLearning)) {
      return {
        isOptimal: false,
        score: 0,
        reasoning: 'Daily intervention limit reached'
      };
    }

    // Check if in optimal window
    const relevantWindow = circadianProfile.optimal_intervention_windows
      .find(w => 
        currentHour >= w.start_hour && 
        currentHour <= w.end_hour &&
        (w.intervention_type === interventionType || w.intervention_type === 'mindfulness')
      );

    if (!relevantWindow) {
      return {
        isOptimal: false,
        score: 0.2,
        reasoning: 'Outside optimal intervention windows'
      };
    }

    // Calculate comprehensive score
    const score = this.calculateCurrentMomentScore(
      context,
      relevantWindow,
      patternLearning
    );

    const isOptimal = score >= this.PEAK_EFFECTIVENESS_THRESHOLD;

    return {
      isOptimal,
      score,
      reasoning: isOptimal ? 
        `Optimal timing (score: ${score.toFixed(2)}) - ${this.generateReasoningForWindow(relevantWindow, score)}` :
        `Suboptimal timing (score: ${score.toFixed(2)}) - consider waiting`
    };
  }

  // Learn from user responses to improve timing
  recordInterventionResponse(
    interventionTime: Date,
    interventionType: string,
    userResponse: 'completed' | 'dismissed' | 'snoozed',
    completionTime?: Date,
    userRating?: number
  ): Partial<PatternLearning> {
    const hour = interventionTime.getHours();
    const dayOfWeek = interventionTime.getDay();

    const responseValue = this.calculateResponseValue(userResponse, userRating);
    
    return {
      response_rates_by_hour: {
        [hour]: responseValue
      },
      completion_rates_by_day: {
        [dayOfWeek]: responseValue
      },
      effectiveness_by_context: {
        [`${interventionType}_${hour}`]: responseValue
      }
    };
  }

  // Detect and prevent intervention burnout
  detectBurnoutRisk(
    patternLearning: PatternLearning,
    recentInterventions: Array<{
      time: Date;
      response: string;
      type: string;
    }>
  ): {
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    cooldownPeriod?: number; // Hours
  } {
    const { burnout_indicators } = patternLearning;
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const recommendations: string[] = [];
    let cooldownPeriod: number | undefined;

    // Check consecutive dismissals
    if (burnout_indicators.consecutive_dismissals >= 5) {
      riskLevel = 'high';
      recommendations.push('Reduce intervention frequency significantly');
      cooldownPeriod = 24; // 24 hour cooldown
    } else if (burnout_indicators.consecutive_dismissals >= 3) {
      riskLevel = 'medium';
      recommendations.push('Space out interventions more');
      cooldownPeriod = 8; // 8 hour cooldown
    }

    // Check declining engagement
    if (burnout_indicators.declining_engagement) {
      riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      recommendations.push('Switch to passive observation mode');
      recommendations.push('Focus on celebration and positive reinforcement');
    }

    // Check fatigue score
    if (burnout_indicators.fatigue_score > 0.8) {
      riskLevel = 'high';
      recommendations.push('Implement extended break from interventions');
      cooldownPeriod = Math.max(cooldownPeriod || 0, 48);
    }

    return { riskLevel, recommendations, cooldownPeriod };
  }

  // Generate personalized intervention schedule
  generateDailySchedule(
    circadianProfile: CircadianProfile,
    context: TimingContext,
    patternLearning: PatternLearning,
    plannedInterventions: string[]
  ): Array<{
    time: Date;
    type: string;
    confidence: number;
    backup_times: Date[];
  }> {
    const schedule: Array<{
      time: Date;
      type: string;
      confidence: number;
      backup_times: Date[];
    }> = [];

    // Sort interventions by priority and optimal timing
    const prioritizedInterventions = this.prioritizeInterventions(
      plannedInterventions,
      circadianProfile,
      context
    );

    for (const intervention of prioritizedInterventions) {
      const optimalMoment = this.predictOptimalMoment(
        context,
        circadianProfile,
        { stress: 5, energy: 5, sleep: 5, overall: 5 }, // Default scores
        intervention,
        patternLearning
      );

      if (optimalMoment.confidence_score > 0.5) {
        schedule.push({
          time: optimalMoment.suggested_time,
          type: intervention,
          confidence: optimalMoment.confidence_score,
          backup_times: optimalMoment.alternative_times
        });
      }
    }

    return this.optimizeScheduleSpacing(schedule);
  }

  // Private helper methods
  private extractSleepPatterns(metrics: HealthMetrics[]) {
    return {
      bedtimes: metrics.map(m => m.sleep_time).filter(Boolean),
      waketimes: metrics.map(m => m.wake_time).filter(Boolean)
    };
  }

  private extractEnergyPatterns(metrics: HealthMetrics[]) {
    return metrics.map(m => ({
      hour: new Date(m.timestamp).getHours(),
      energy: m.energy_level || 5
    }));
  }

  private extractStressPatterns(metrics: HealthMetrics[]) {
    return metrics.map(m => ({
      hour: new Date(m.timestamp).getHours(),
      stress: m.stress_level || 5
    }));
  }

  private calculateAverageTime(times: string[]): string {
    if (times.length === 0) return '07:00';
    
    // Convert times to minutes from midnight, average, then convert back
    const totalMinutes = times.reduce((sum, time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return sum + (hours * 60) + minutes;
    }, 0);
    
    const avgMinutes = Math.round(totalMinutes / times.length);
    const hours = Math.floor(avgMinutes / 60);
    const mins = avgMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private determineChronotype(bedtime: string, waketime: string): CircadianProfile['chronotype'] {
    const bedHour = parseInt(bedtime.split(':')[0]);
    const wakeHour = parseInt(waketime.split(':')[0]);
    
    if (wakeHour <= 6 && bedHour <= 22) return 'early_bird';
    if (wakeHour >= 9 && bedHour >= 24) return 'night_owl';
    return 'intermediate';
  }

  private findPeakHours(data: Array<{ hour: number; energy?: number; stress?: number }>, type: 'high' | 'low'): number[] {
    const hourlyAverages: Record<number, number> = {};
    
    // Calculate averages for each hour
    for (let hour = 0; hour < 24; hour++) {
      const hourData = data.filter(d => d.hour === hour);
      if (hourData.length > 0) {
        const values = hourData.map(d => d.energy || d.stress || 5);
        hourlyAverages[hour] = values.reduce((sum, val) => sum + val, 0) / values.length;
      }
    }

    // Find peaks or lows
    const hours = Object.keys(hourlyAverages).map(Number);
    const values = Object.values(hourlyAverages);
    const threshold = type === 'high' ? 
      Math.max(...values) * 0.8 : 
      Math.min(...values) * 1.2;

    return hours.filter(hour => 
      type === 'high' ? 
        hourlyAverages[hour] >= threshold :
        hourlyAverages[hour] <= threshold
    );
  }

  private generateOptimalWindows(
    chronotype: CircadianProfile['chronotype'],
    peakEnergyHours: number[],
    lowEnergyHours: number[],
    stressPeakHours: number[]
  ): TimeWindow[] {
    const windows: TimeWindow[] = [];

    // Energy boost windows (during low energy periods)
    for (const hour of lowEnergyHours) {
      if (hour >= 6 && hour <= 20) { // Only during waking hours
        windows.push({
          start_hour: hour,
          end_hour: hour + 1,
          effectiveness_score: 0.85,
          intervention_type: 'energy_boost',
          frequency_limit: 1
        });
      }
    }

    // Stress relief windows (during or just before stress peaks)
    for (const hour of stressPeakHours) {
      windows.push({
        start_hour: Math.max(hour - 1, 6),
        end_hour: hour + 1,
        effectiveness_score: 0.9,
        intervention_type: 'stress_relief',
        frequency_limit: 2
      });
    }

    // Mindfulness windows (based on chronotype)
    if (chronotype === 'early_bird') {
      windows.push({
        start_hour: 6,
        end_hour: 8,
        effectiveness_score: 0.8,
        intervention_type: 'mindfulness',
        frequency_limit: 1
      });
    } else if (chronotype === 'night_owl') {
      windows.push({
        start_hour: 21,
        end_hour: 23,
        effectiveness_score: 0.75,
        intervention_type: 'mindfulness',
        frequency_limit: 1
      });
    }

    // Celebration windows (during peak energy)
    for (const hour of peakEnergyHours) {
      windows.push({
        start_hour: hour,
        end_hour: hour + 2,
        effectiveness_score: 0.7,
        intervention_type: 'celebration',
        frequency_limit: 1
      });
    }

    return windows;
  }

  private assessUrgencyLevel(
    lifeScore: LifeScoreV2,
    context: TimingContext
  ): OptimalMoment['urgency_level'] {
    const { stress, overall } = lifeScore;
    
    if (stress >= 9 || overall <= 2) return 'emergency';
    if (stress >= 7 || overall <= 3) return 'high';
    if (stress >= 6 || overall <= 4) return 'medium';
    return 'low';
  }

  private calculateWindowScore(
    window: TimeWindow,
    context: TimingContext,
    patternLearning: PatternLearning,
    urgency: string
  ): number {
    let score = window.effectiveness_score;
    
    // Historical response rate for this hour
    const hour = context.current_time.getHours();
    if (patternLearning.response_rates_by_hour[hour]) {
      score = (score + patternLearning.response_rates_by_hour[hour]) / 2;
    }

    // Day of week adjustment
    const dayOfWeek = context.current_time.getDay();
    if (patternLearning.completion_rates_by_day[dayOfWeek]) {
      score = (score + patternLearning.completion_rates_by_day[dayOfWeek]) / 2;
    }

    // Urgency boost
    if (urgency === 'high') score += 0.1;
    if (urgency === 'emergency') score += 0.2;

    // Availability score
    score *= context.predicted_availability;

    return Math.min(score, 1);
  }

  private findNextTimeInWindow(window: TimeWindow, currentTime: Date): Date {
    const current = new Date(currentTime);
    const targetHour = window.start_hour;
    
    current.setHours(targetHour, 0, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (current <= currentTime) {
      current.setDate(current.getDate() + 1);
    }
    
    return current;
  }

  private generateReasoningForWindow(window: TimeWindow, score: number): string {
    const reasons = [];
    
    if (window.effectiveness_score > 0.8) {
      reasons.push('historically high effectiveness');
    }
    
    if (window.intervention_type === 'stress_relief') {
      reasons.push('optimal for stress management');
    }
    
    if (window.intervention_type === 'energy_boost') {
      reasons.push('perfect timing for energy enhancement');
    }
    
    if (score > 0.8) {
      reasons.push('user typically responsive at this time');
    }
    
    return reasons.join(', ') || 'good timing based on analysis';
  }

  private generateAlternativeTimes(
    bestTime: Date,
    circadianProfile: CircadianProfile,
    context: TimingContext
  ): Date[] {
    const alternatives: Date[] = [];
    
    // Add times ±2 hours from best time
    for (let offset of [-2, -1, 1, 2]) {
      const altTime = new Date(bestTime);
      altTime.setHours(altTime.getHours() + offset);
      
      if (altTime > context.current_time) {
        alternatives.push(altTime);
      }
    }
    
    return alternatives.slice(0, 3); // Max 3 alternatives
  }

  private hasReachedDailyLimit(context: TimingContext, patternLearning: PatternLearning): boolean {
    // This would check against actual intervention history
    // Simplified for this implementation
    return false;
  }

  private calculateCurrentMomentScore(
    context: TimingContext,
    window: TimeWindow,
    patternLearning: PatternLearning
  ): number {
    return this.calculateWindowScore(window, context, patternLearning, 'low');
  }

  private calculateResponseValue(response: string, rating?: number): number {
    switch (response) {
      case 'completed': return rating ? rating / 10 : 0.8;
      case 'snoozed': return 0.4;
      case 'dismissed': return 0.1;
      default: return 0.5;
    }
  }

  private prioritizeInterventions(
    interventions: string[],
    circadianProfile: CircadianProfile,
    context: TimingContext
  ): string[] {
    // Simple prioritization - in production this would be more sophisticated
    const priority = ['stress_relief', 'energy_boost', 'mindfulness', 'celebration'];
    return interventions.sort((a, b) => {
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }

  private optimizeScheduleSpacing(
    schedule: Array<{
      time: Date;
      type: string;
      confidence: number;
      backup_times: Date[];
    }>
  ) {
    // Ensure minimum spacing between interventions
    const optimized = [];
    let lastTime: Date | null = null;

    for (const item of schedule.sort((a, b) => a.time.getTime() - b.time.getTime())) {
      if (!lastTime || 
          (item.time.getTime() - lastTime.getTime()) >= (this.MIN_INTERVENTION_GAP_MINUTES * 60 * 1000)) {
        optimized.push(item);
        lastTime = item.time;
      }
    }

    return optimized.slice(0, this.MAX_DAILY_INTERVENTIONS);
  }
}
