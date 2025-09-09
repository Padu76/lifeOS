// apps/web/lib/smart-notifications/core.ts
export interface UserPattern {
  user_id: string;
  chronotype: 'early_bird' | 'night_owl' | 'intermediate';
  optimal_windows: {
    morning: { start: string; end: string; effectiveness: number };
    afternoon: { start: string; end: string; effectiveness: number };
    evening: { start: string; end: string; effectiveness: number };
  };
  stress_peaks: string[]; // Hours when stress typically peaks
  energy_lows: string[]; // Hours when energy is typically low
  sleep_schedule: { bedtime: string; wake_time: string };
  response_rates: {
    by_hour: Record<string, number>;
    by_day: Record<string, number>;
    by_category: Record<string, number>;
  };
  burnout_indicators: {
    consecutive_dismissals: number;
    weekly_engagement_decline: boolean;
    fatigue_score: number;
  };
  last_updated: string;
}

export interface NotificationContext {
  user_id: string;
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'reminder';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  content: {
    title: string;
    body: string;
    action_text?: string;
    deep_link?: string;
  };
  scheduling: {
    preferred_time?: string;
    latest_time?: string;
    min_gap_minutes: number;
    respect_quiet_hours: boolean;
  };
  personalization: {
    tone: 'gentle' | 'encouraging' | 'casual' | 'formal';
    include_emoji: boolean;
    reference_progress: boolean;
  };
}

export interface TimingRecommendation {
  optimal_time: string;
  confidence_score: number;
  reasoning: string[];
  alternative_times: string[];
  should_skip: boolean;
  skip_reason?: string;
}

export class CircadianAnalyzer {
  static analyzeUserPatterns(activities: any[], checkins: any[]): UserPattern {
    const patterns = this.extractTimePatterns(activities, checkins);
    const chronotype = this.determineChronotype(patterns);
    const optimalWindows = this.calculateOptimalWindows(patterns, chronotype);
    
    return {
      user_id: patterns.user_id,
      chronotype,
      optimal_windows: optimalWindows,
      stress_peaks: this.identifyStressPeaks(checkins),
      energy_lows: this.identifyEnergyLows(checkins),
      sleep_schedule: this.extractSleepSchedule(activities),
      response_rates: this.calculateResponseRates(activities),
      burnout_indicators: this.assessBurnoutRisk(activities),
      last_updated: new Date().toISOString()
    };
  }

  private static extractTimePatterns(activities: any[], checkins: any[]) {
    // Analyze completion times, engagement patterns, and response rates
    const hourlyEngagement = new Map<number, number[]>();
    const dailyPatterns = new Map<string, number>();
    
    activities.forEach(activity => {
      const hour = new Date(activity.completed_at || activity.created_at).getHours();
      const engagement = activity.completion_rate || (activity.completed ? 1 : 0);
      
      if (!hourlyEngagement.has(hour)) {
        hourlyEngagement.set(hour, []);
      }
      hourlyEngagement.get(hour)!.push(engagement);
    });

    return {
      user_id: activities[0]?.user_id,
      hourlyEngagement,
      dailyPatterns,
      totalActivities: activities.length,
      avgCompletionRate: activities.reduce((sum, a) => sum + (a.completed ? 1 : 0), 0) / activities.length
    };
  }

  private static determineChronotype(patterns: any): 'early_bird' | 'night_owl' | 'intermediate' {
    const { hourlyEngagement } = patterns;
    
    const morningScore = this.calculatePeriodScore(hourlyEngagement, 6, 10);
    const eveningScore = this.calculatePeriodScore(hourlyEngagement, 18, 22);
    const ratio = morningScore / (eveningScore || 1);
    
    if (ratio > 1.3) return 'early_bird';
    if (ratio < 0.7) return 'night_owl';
    return 'intermediate';
  }

  private static calculatePeriodScore(hourlyEngagement: Map<number, number[]>, start: number, end: number): number {
    let total = 0;
    let count = 0;
    
    for (let hour = start; hour <= end; hour++) {
      const engagements = hourlyEngagement.get(hour) || [];
      if (engagements.length > 0) {
        total += engagements.reduce((sum, val) => sum + val, 0) / engagements.length;
        count++;
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  private static calculateOptimalWindows(patterns: any, chronotype: string) {
    const baseWindows = {
      early_bird: {
        morning: { start: '07:00', end: '09:00', effectiveness: 0.9 },
        afternoon: { start: '14:00', end: '16:00', effectiveness: 0.7 },
        evening: { start: '19:00', end: '20:30', effectiveness: 0.5 }
      },
      night_owl: {
        morning: { start: '09:30', end: '11:00', effectiveness: 0.6 },
        afternoon: { start: '15:00', end: '17:00', effectiveness: 0.8 },
        evening: { start: '20:00', end: '22:00', effectiveness: 0.9 }
      },
      intermediate: {
        morning: { start: '08:00', end: '10:00', effectiveness: 0.8 },
        afternoon: { start: '14:30', end: '16:30', effectiveness: 0.8 },
        evening: { start: '19:30', end: '21:00', effectiveness: 0.7 }
      }
    };

    return baseWindows[chronotype as keyof typeof baseWindows];
  }

  private static identifyStressPeaks(checkins: any[]): string[] {
    const stressByHour = new Map<number, number[]>();
    
    checkins.forEach(checkin => {
      if (checkin.stress_level !== null) {
        const hour = new Date(checkin.created_at).getHours();
        if (!stressByHour.has(hour)) {
          stressByHour.set(hour, []);
        }
        stressByHour.get(hour)!.push(checkin.stress_level);
      }
    });

    const avgStressByHour = new Map<number, number>();
    stressByHour.forEach((values, hour) => {
      avgStressByHour.set(hour, values.reduce((sum, val) => sum + val, 0) / values.length);
    });

    const overallAvg = Array.from(avgStressByHour.values()).reduce((sum, val) => sum + val, 0) / avgStressByHour.size;
    
    return Array.from(avgStressByHour.entries())
      .filter(([hour, stress]) => stress > overallAvg * 1.2)
      .map(([hour]) => `${hour.toString().padStart(2, '0')}:00`);
  }

  private static identifyEnergyLows(checkins: any[]): string[] {
    const energyByHour = new Map<number, number[]>();
    
    checkins.forEach(checkin => {
      if (checkin.energy_level !== null) {
        const hour = new Date(checkin.created_at).getHours();
        if (!energyByHour.has(hour)) {
          energyByHour.set(hour, []);
        }
        energyByHour.get(hour)!.push(checkin.energy_level);
      }
    });

    const avgEnergyByHour = new Map<number, number>();
    energyByHour.forEach((values, hour) => {
      avgEnergyByHour.set(hour, values.reduce((sum, val) => sum + val, 0) / values.length);
    });

    const overallAvg = Array.from(avgEnergyByHour.values()).reduce((sum, val) => sum + val, 0) / avgEnergyByHour.size;
    
    return Array.from(avgEnergyByHour.entries())
      .filter(([hour, energy]) => energy < overallAvg * 0.8)
      .map(([hour]) => `${hour.toString().padStart(2, '0')}:00`);
  }

  private static extractSleepSchedule(activities: any[]) {
    const sleepActivities = activities.filter(a => 
      a.category === 'sleep' || a.title?.toLowerCase().includes('sleep')
    );

    if (sleepActivities.length === 0) {
      return { bedtime: '22:30', wake_time: '07:00' };
    }

    // Analyze sleep-related activity patterns to infer schedule
    const sleepTimes = sleepActivities.map(a => new Date(a.created_at).getHours());
    const avgSleepTime = sleepTimes.reduce((sum, hour) => sum + hour, 0) / sleepTimes.length;
    
    return {
      bedtime: `${Math.floor(avgSleepTime)}:${Math.round((avgSleepTime % 1) * 60).toString().padStart(2, '0')}`,
      wake_time: `${Math.floor((avgSleepTime + 8) % 24)}:00`
    };
  }

  private static calculateResponseRates(activities: any[]) {
    const byHour: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    activities.forEach(activity => {
      const date = new Date(activity.created_at);
      const hour = date.getHours().toString();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const category = activity.category || 'general';
      
      const completed = activity.completed ? 1 : 0;
      
      byHour[hour] = (byHour[hour] || 0) + completed;
      byDay[day] = (byDay[day] || 0) + completed;
      byCategory[category] = (byCategory[category] || 0) + completed;
    });

    return { by_hour: byHour, by_day: byDay, by_category: byCategory };
  }

  private static assessBurnoutRisk(activities: any[]) {
    const recentActivities = activities
      .filter(a => {
        const daysSince = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    let consecutiveDismissals = 0;
    for (const activity of recentActivities) {
      if (!activity.completed) {
        consecutiveDismissals++;
      } else {
        break;
      }
    }

    const thisWeekCompletion = recentActivities.filter(a => a.completed).length / recentActivities.length;
    const lastWeekActivities = activities.filter(a => {
      const daysSince = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7 && daysSince <= 14;
    });
    const lastWeekCompletion = lastWeekActivities.filter(a => a.completed).length / lastWeekActivities.length;
    
    const weeklyEngagementDecline = thisWeekCompletion < lastWeekCompletion * 0.7;
    
    const fatigueScore = Math.min(
      (consecutiveDismissals / 5) + (weeklyEngagementDecline ? 0.3 : 0),
      1.0
    );

    return {
      consecutive_dismissals: consecutiveDismissals,
      weekly_engagement_decline: weeklyEngagementDecline,
      fatigue_score: fatigueScore
    };
  }
}

export class OptimalMomentPredictor {
  static predictOptimalTiming(
    context: NotificationContext,
    userPattern: UserPattern,
    currentDateTime: Date = new Date()
  ): TimingRecommendation {
    const currentHour = currentDateTime.getHours();
    const currentMinute = currentDateTime.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    // Check burnout prevention
    if (this.shouldSkipDueToBurnout(userPattern, context)) {
      return {
        optimal_time: currentTime,
        confidence_score: 0,
        reasoning: ['User showing burnout signs - implementing cooldown period'],
        alternative_times: [],
        should_skip: true,
        skip_reason: 'burnout_prevention'
      };
    }

    // Emergency notifications bypass all timing logic
    if (context.urgency === 'emergency') {
      return {
        optimal_time: currentTime,
        confidence_score: 1.0,
        reasoning: ['Emergency notification - immediate delivery required'],
        alternative_times: [],
        should_skip: false
      };
    }

    // Check quiet hours
    if (this.isQuietHours(currentDateTime, userPattern) && context.scheduling.respect_quiet_hours) {
      const nextAvailableTime = this.findNextAvailableTime(currentDateTime, userPattern);
      return {
        optimal_time: nextAvailableTime,
        confidence_score: 0.3,
        reasoning: ['Current time is within user quiet hours'],
        alternative_times: [nextAvailableTime],
        should_skip: false
      };
    }

    // Find optimal window based on category and user patterns
    const optimalWindow = this.findOptimalWindow(context, userPattern, currentDateTime);
    const confidence = this.calculateConfidence(optimalWindow, userPattern, context);

    return {
      optimal_time: optimalWindow.time,
      confidence_score: confidence,
      reasoning: optimalWindow.reasoning,
      alternative_times: optimalWindow.alternatives,
      should_skip: false
    };
  }

  private static shouldSkipDueToBurnout(userPattern: UserPattern, context: NotificationContext): boolean {
    const { burnout_indicators } = userPattern;
    
    // Skip if high fatigue and non-urgent
    if (burnout_indicators.fatigue_score > 0.7 && context.urgency === 'low') {
      return true;
    }
    
    // Skip if many consecutive dismissals
    if (burnout_indicators.consecutive_dismissals >= 5 && context.urgency !== 'high') {
      return true;
    }
    
    return false;
  }

  private static isQuietHours(currentDateTime: Date, userPattern: UserPattern): boolean {
    const currentHour = currentDateTime.getHours();
    const { sleep_schedule } = userPattern;
    
    const bedtimeHour = parseInt(sleep_schedule.bedtime.split(':')[0]);
    const wakeHour = parseInt(sleep_schedule.wake_time.split(':')[0]);
    
    if (bedtimeHour < wakeHour) {
      // Same day sleep schedule
      return currentHour >= bedtimeHour || currentHour < wakeHour;
    } else {
      // Overnight sleep schedule
      return currentHour >= bedtimeHour && currentHour < wakeHour;
    }
  }

  private static findNextAvailableTime(currentDateTime: Date, userPattern: UserPattern): string {
    const wakeHour = parseInt(userPattern.sleep_schedule.wake_time.split(':')[0]);
    const nextDay = new Date(currentDateTime);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(wakeHour, 0, 0, 0);
    
    return `${wakeHour.toString().padStart(2, '0')}:00`;
  }

  private static findOptimalWindow(
    context: NotificationContext,
    userPattern: UserPattern,
    currentDateTime: Date
  ) {
    const currentHour = currentDateTime.getHours();
    const { optimal_windows, stress_peaks, energy_lows } = userPattern;
    
    // Category-specific timing logic
    switch (context.category) {
      case 'stress_relief':
        return this.findStressReliefWindow(currentHour, optimal_windows, stress_peaks);
      
      case 'energy_boost':
        return this.findEnergyBoostWindow(currentHour, optimal_windows, energy_lows);
      
      case 'sleep_prep':
        return this.findSleepPrepWindow(currentHour, userPattern.sleep_schedule);
      
      case 'celebration':
        return this.findCelebrationWindow(currentHour, optimal_windows);
      
      default:
        return this.findGeneralWindow(currentHour, optimal_windows);
    }
  }

  private static findStressReliefWindow(currentHour: number, optimalWindows: any, stressPeaks: string[]) {
    // During stress peaks, provide immediate relief
    const isStressPeak = stressPeaks.some(peak => {
      const peakHour = parseInt(peak.split(':')[0]);
      return Math.abs(currentHour - peakHour) <= 1;
    });

    if (isStressPeak) {
      return {
        time: `${currentHour.toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
        reasoning: ['User is in identified stress peak period'],
        alternatives: []
      };
    }

    // Otherwise use general optimal windows
    return this.findGeneralWindow(currentHour, optimalWindows);
  }

  private static findEnergyBoostWindow(currentHour: number, optimalWindows: any, energyLows: string[]) {
    // During energy lows, provide boost
    const isEnergyLow = energyLows.some(low => {
      const lowHour = parseInt(low.split(':')[0]);
      return Math.abs(currentHour - lowHour) <= 1;
    });

    if (isEnergyLow) {
      return {
        time: `${currentHour.toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
        reasoning: ['User is in identified energy low period'],
        alternatives: []
      };
    }

    return this.findGeneralWindow(currentHour, optimalWindows);
  }

  private static findSleepPrepWindow(currentHour: number, sleepSchedule: any) {
    const bedtimeHour = parseInt(sleepSchedule.bedtime.split(':')[0]);
    const idealTime = bedtimeHour - 1; // 1 hour before bedtime
    
    return {
      time: `${idealTime.toString().padStart(2, '0')}:00`,
      reasoning: ['Scheduled for 1 hour before user bedtime'],
      alternatives: [`${(idealTime - 1).toString().padStart(2, '0')}:00`]
    };
  }

  private static findCelebrationWindow(currentHour: number, optimalWindows: any) {
    // Celebrations work best during high-effectiveness windows
    const windows = [optimalWindows.morning, optimalWindows.afternoon, optimalWindows.evening];
    const bestWindow = windows.reduce((best, current) => 
      current.effectiveness > best.effectiveness ? current : best
    );
    
    return {
      time: bestWindow.start,
      reasoning: ['Scheduled during highest effectiveness window for maximum impact'],
      alternatives: [optimalWindows.afternoon.start, optimalWindows.evening.start]
    };
  }

  private static findGeneralWindow(currentHour: number, optimalWindows: any) {
    const windows = [
      { ...optimalWindows.morning, period: 'morning' },
      { ...optimalWindows.afternoon, period: 'afternoon' },
      { ...optimalWindows.evening, period: 'evening' }
    ];

    // Find the next optimal window
    const nextWindow = windows.find(window => {
      const startHour = parseInt(window.start.split(':')[0]);
      return startHour >= currentHour;
    }) || windows[0]; // Wrap to next day

    return {
      time: nextWindow.start,
      reasoning: [`Scheduled for next optimal ${nextWindow.period} window`],
      alternatives: windows.filter(w => w !== nextWindow).map(w => w.start)
    };
  }

  private static calculateConfidence(
    optimalWindow: any,
    userPattern: UserPattern,
    context: NotificationContext
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for category-specific response rates
    const categoryRate = userPattern.response_rates.by_category[context.category] || 0;
    confidence += categoryRate * 0.3;
    
    // Boost confidence for historically effective hours
    const windowHour = parseInt(optimalWindow.time.split(':')[0]);
    const hourlyRate = userPattern.response_rates.by_hour[windowHour.toString()] || 0;
    confidence += hourlyRate * 0.2;
    
    // Reduce confidence for burnout indicators
    confidence -= userPattern.burnout_indicators.fatigue_score * 0.3;
    
    return Math.max(0, Math.min(1, confidence));
  }
}