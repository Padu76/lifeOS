import { HealthMetrics } from '../../types';
import { AdvancedLifeScore, UserProfile } from '../scoring/lifeScoreV2';
import { EmpatheticLanguageEngine } from './empatheticLanguageEngine';

// Types for soft gamification system
interface StreakData {
  type: 'consecutive' | 'pattern' | 'improvement' | 'consistency';
  current_count: number;
  best_count: number;
  category: 'checkin' | 'stress_mgmt' | 'energy' | 'sleep' | 'overall_wellness';
  pattern_strength: number; // 0-1 for pattern-based streaks
  last_activity: Date;
  celebration_pending: boolean;
}

interface PersonalizedAchievement {
  id: string;
  title: string;
  description: string;
  category: 'progress' | 'consistency' | 'milestone' | 'breakthrough' | 'effort';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  earned_date?: Date;
  progress: number; // 0-1
  criteria: AchievementCriteria;
  celebration_style: 'gentle' | 'enthusiastic' | 'proud' | 'warm';
  personal_significance: number; // 0-1 how meaningful for this user
}

interface AchievementCriteria {
  metric: string;
  comparison: 'greater_than' | 'less_than' | 'improved_by' | 'consistent_for';
  target_value: number;
  time_period?: 'day' | 'week' | 'month';
  baseline_period?: number; // days to compare against
}

interface CelebrationMoment {
  id: string;
  type: 'streak_milestone' | 'achievement_earned' | 'progress_boost' | 'effort_recognition' | 'personal_best';
  message: string;
  visual_style: 'gentle_glow' | 'sparkles' | 'warm_pulse' | 'quiet_celebration';
  timing: 'immediate' | 'next_checkin' | 'optimal_moment';
  emotional_tone: 'proud' | 'encouraging' | 'warm' | 'excited' | 'grateful';
  user_action_suggested?: string;
}

interface ProgressVisualization {
  type: 'growth_chart' | 'wellness_garden' | 'journey_path' | 'harmony_circles';
  current_state: any;
  recent_highlights: string[];
  areas_of_growth: string[];
  gentle_next_steps: string[];
}

interface MicroMilestone {
  id: string;
  description: string;
  significance: 'small_win' | 'steady_progress' | 'gentle_improvement' | 'effort_acknowledgment';
  earned_date: Date;
  context: string; // What was happening when this was achieved
}

interface MotivationProfile {
  preferred_recognition_style: 'public' | 'private' | 'subtle';
  responds_to: ('progress' | 'effort' | 'consistency' | 'breakthrough')[];
  sensitivity_level: 'gentle' | 'moderate' | 'enthusiastic';
  focus_areas: string[]; // What they care most about improving
  celebration_frequency: 'minimal' | 'balanced' | 'frequent';
}

export class SoftGamificationSystem {
  private languageEngine: EmpatheticLanguageEngine;
  private readonly GENTLE_CELEBRATION_COOLDOWN = 24; // hours
  
  constructor() {
    this.languageEngine = new EmpatheticLanguageEngine();
  }

  // Analyze and update all streak types for user
  analyzeStreaks(
    userId: string,
    recentMetrics: HealthMetrics[],
    currentLifeScore: AdvancedLifeScore,
    motivationProfile: MotivationProfile
  ): StreakData[] {
    const streaks: StreakData[] = [];
    
    // Check-in consistency streak (most important)
    const checkinStreak = this.analyzeCheckinStreak(recentMetrics);
    streaks.push(checkinStreak);

    // Pattern-based streaks (more forgiving)
    const weeklyPatternStreak = this.analyzeWeeklyPattern(recentMetrics);
    if (weeklyPatternStreak.pattern_strength > 0.6) {
      streaks.push(weeklyPatternStreak);
    }

    // Improvement streaks (focusing on progress)
    const improvementStreaks = this.analyzeImprovementStreaks(recentMetrics);
    streaks.push(...improvementStreaks);

    // Consistency streaks (stable performance)
    const consistencyStreaks = this.analyzeConsistencyStreaks(recentMetrics);
    streaks.push(...consistencyStreaks);

    return this.prioritizeStreaks(streaks, motivationProfile);
  }

  // Generate personalized achievements based on user's journey
  generatePersonalizedAchievements(
    userId: string,
    historicalData: HealthMetrics[],
    userProfile: UserProfile,
    motivationProfile: MotivationProfile
  ): PersonalizedAchievement[] {
    const achievements: PersonalizedAchievement[] = [];

    // Progress-based achievements (comparing to personal baseline)
    const progressAchievements = this.createProgressAchievements(
      historicalData,
      userProfile,
      motivationProfile
    );
    achievements.push(...progressAchievements);

    // Effort-based achievements (recognizing attempts, not just success)
    const effortAchievements = this.createEffortAchievements(
      historicalData,
      motivationProfile
    );
    achievements.push(...effortAchievements);

    // Breakthrough achievements (significant improvements)
    const breakthroughAchievements = this.createBreakthroughAchievements(
      historicalData,
      userProfile
    );
    achievements.push(...breakthroughAchievements);

    // Consistency achievements (showing up regularly)
    const consistencyAchievements = this.createConsistencyAchievements(
      historicalData,
      motivationProfile
    );
    achievements.push(...consistencyAchievements);

    return this.personalizeAchievements(achievements, userProfile, motivationProfile);
  }

  // Create celebration moments for achievements and milestones
  createCelebrationMoment(
    achievementOrStreak: PersonalizedAchievement | StreakData,
    userContext: {
      currentMood: string;
      timeOfDay: string;
      recentCelebrations: CelebrationMoment[];
    },
    motivationProfile: MotivationProfile
  ): CelebrationMoment | null {

    // Check celebration cooldown to avoid overwhelming
    if (this.isInCelebrationCooldown(userContext.recentCelebrations)) {
      return null;
    }

    // Determine celebration type and style
    const celebrationType = this.determineCelebrationType(achievementOrStreak);
    const emotionalTone = this.determineEmotionalTone(userContext.currentMood, motivationProfile);
    const visualStyle = this.determineVisualStyle(emotionalTone, userContext.timeOfDay);

    // Generate personalized celebration message
    const message = this.generateCelebrationMessage(
      achievementOrStreak,
      emotionalTone,
      userContext,
      motivationProfile
    );

    // Determine optimal timing
    const timing = this.determineCelebrationTiming(
      celebrationType,
      userContext,
      motivationProfile
    );

    return {
      id: crypto.randomUUID(),
      type: celebrationType,
      message,
      visual_style: visualStyle,
      timing,
      emotional_tone: emotionalTone,
      user_action_suggested: this.suggestFollowUpAction(achievementOrStreak, motivationProfile)
    };
  }

  // Recognize micro-milestones (small but meaningful progress)
  recognizeMicroMilestones(
    recentMetrics: HealthMetrics[],
    previousPeriodMetrics: HealthMetrics[],
    motivationProfile: MotivationProfile
  ): MicroMilestone[] {
    const milestones: MicroMilestone[] = [];

    // Small improvements in any metric
    const improvements = this.detectSmallImprovements(recentMetrics, previousPeriodMetrics);
    improvements.forEach(improvement => {
      milestones.push({
        id: crypto.randomUUID(),
        description: improvement.description,
        significance: 'gentle_improvement',
        earned_date: new Date(),
        context: improvement.context
      });
    });

    // Consistent effort recognition
    const effortRecognition = this.recognizeEffort(recentMetrics, motivationProfile);
    milestones.push(...effortRecognition);

    // Small wins (completing suggested actions)
    const smallWins = this.detectSmallWins(recentMetrics);
    milestones.push(...smallWins);

    return this.prioritizeMilestones(milestones, motivationProfile);
  }

  // Generate contextual positive feedback
  generateContextualFeedback(
    currentLifeScore: AdvancedLifeScore,
    recentTrend: 'improving' | 'stable' | 'declining',
    userContext: {
      timeOfDay: string;
      mood: string;
      recentStressors: string[];
    },
    motivationProfile: MotivationProfile
  ): {
    message: string;
    tone: string;
    focus: string;
    encouragement_type: 'gentle' | 'warm' | 'proud' | 'understanding';
  } {

    const feedback = {
      message: '',
      tone: '',
      focus: '',
      encouragement_type: 'gentle' as 'gentle' | 'warm' | 'proud' | 'understanding'
    };

    // Adapt feedback based on trend and context
    if (recentTrend === 'improving') {
      feedback.encouragement_type = 'proud';
      feedback.focus = 'progress_recognition';
      feedback.message = this.generateProgressFeedback(currentLifeScore, userContext, motivationProfile);
    } else if (recentTrend === 'stable') {
      feedback.encouragement_type = 'warm';
      feedback.focus = 'consistency_appreciation';
      feedback.message = this.generateStabilityFeedback(currentLifeScore, userContext, motivationProfile);
    } else {
      feedback.encouragement_type = 'understanding';
      feedback.focus = 'gentle_support';
      feedback.message = this.generateSupportiveFeedback(currentLifeScore, userContext, motivationProfile);
    }

    feedback.tone = this.adaptToneForContext(userContext, motivationProfile);

    return feedback;
  }

  // Create progress visualization data
  createProgressVisualization(
    userId: string,
    historicalData: HealthMetrics[],
    timeframe: 'week' | 'month' | 'quarter',
    motivationProfile: MotivationProfile
  ): ProgressVisualization {
    
    const visualizationType = this.selectVisualizationType(motivationProfile);
    const recentHighlights = this.identifyRecentHighlights(historicalData, timeframe);
    const growthAreas = this.identifyGrowthAreas(historicalData, motivationProfile);
    const gentleNextSteps = this.suggestGentleNextSteps(historicalData, motivationProfile);

    return {
      type: visualizationType,
      current_state: this.buildCurrentStateVisualization(historicalData, visualizationType),
      recent_highlights: recentHighlights,
      areas_of_growth: growthAreas,
      gentle_next_steps: gentleNextSteps
    };
  }

  // Check if user has earned any new achievements
  checkForNewAchievements(
    userId: string,
    currentMetrics: HealthMetrics,
    historicalData: HealthMetrics[],
    existingAchievements: PersonalizedAchievement[]
  ): PersonalizedAchievement[] {
    const newAchievements: PersonalizedAchievement[] = [];

    // Check each potential achievement against current data
    const potentialAchievements = this.generatePersonalizedAchievements(
      userId,
      historicalData,
      {} as UserProfile, // Would be loaded
      {} as MotivationProfile // Would be loaded
    );

    for (const achievement of potentialAchievements) {
      // Skip if already earned
      if (existingAchievements.some(existing => existing.id === achievement.id)) {
        continue;
      }

      // Check if criteria are met
      if (this.evaluateAchievementCriteria(achievement.criteria, currentMetrics, historicalData)) {
        achievement.earned_date = new Date();
        achievement.progress = 1.0;
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  // Private helper methods

  private analyzeCheckinStreak(metrics: HealthMetrics[]): StreakData {
    const sortedMetrics = metrics.sort((a, b) => 
      new Date((a as any).timestamp || a.date).getTime() - new Date((b as any).timestamp || b.date).getTime()
    );

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Count backwards from today
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today.getTime() - (i * oneDayMs));
      const hasCheckin = sortedMetrics.some(metric => 
        this.isSameDay(new Date((metric as any).timestamp || metric.date), checkDate)
      );

      if (hasCheckin) {
        if (i === 0) currentStreak = 1; // Today counts
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        if (i === 0) break; // Streak broken if no checkin today
        tempStreak = 0;
      }
    }

    return {
      type: 'consecutive',
      current_count: currentStreak,
      best_count: bestStreak,
      category: 'checkin',
      pattern_strength: 1.0,
      last_activity: sortedMetrics.length > 0 ? new Date((sortedMetrics[sortedMetrics.length - 1] as any).timestamp || sortedMetrics[sortedMetrics.length - 1].date) : new Date(),
      celebration_pending: currentStreak > 0 && currentStreak % 3 === 0 // Celebrate every 3 days
    };
  }

  private analyzeWeeklyPattern(metrics: HealthMetrics[]): StreakData {
    const recentWeeks = this.groupByWeek(metrics, 4); // Last 4 weeks
    let patternStrength = 0;
    let weeklyConsistency = 0;

    for (const week of recentWeeks) {
      const daysWithCheckin = week.length;
      const weekScore = Math.min(daysWithCheckin / 5, 1); // 5+ days = perfect week
      weeklyConsistency += weekScore;
    }

    patternStrength = weeklyConsistency / recentWeeks.length;
    const patternCount = Math.floor(patternStrength * 10); // Convert to streak number

    return {
      type: 'pattern',
      current_count: patternCount,
      best_count: patternCount, // Would track historically
      category: 'consistency',
      pattern_strength: patternStrength,
      last_activity: new Date(),
      celebration_pending: patternStrength > 0.7 && patternCount % 2 === 0
    };
  }

  private analyzeImprovementStreaks(metrics: HealthMetrics[]): StreakData[] {
    const streaks: StreakData[] = [];
    const categories = ['stress_mgmt', 'energy', 'sleep'] as const;

    for (const category of categories) {
      const improvement = this.calculateImprovementTrend(metrics, category);
      if (improvement.isImproving && improvement.daysImproving >= 3) {
        streaks.push({
          type: 'improvement',
          current_count: improvement.daysImproving,
          best_count: improvement.daysImproving, // Would track historically
          category: category,
          pattern_strength: improvement.strength,
          last_activity: new Date(),
          celebration_pending: improvement.daysImproving % 5 === 0
        });
      }
    }

    return streaks;
  }

  private analyzeConsistencyStreaks(metrics: HealthMetrics[]): StreakData[] {
    const streaks: StreakData[] = [];
    
    // Check for stable performance (not necessarily improving, but consistent)
    const stability = this.calculateStabilityScore(metrics);
    if (stability.score > 0.7 && stability.days >= 7) {
      streaks.push({
        type: 'consistency',
        current_count: stability.days,
        best_count: stability.days,
        category: 'overall_wellness',
        pattern_strength: stability.score,
        last_activity: new Date(),
        celebration_pending: stability.days % 7 === 0 // Weekly celebration
      });
    }

    return streaks;
  }

  private createProgressAchievements(
    historicalData: HealthMetrics[],
    userProfile: UserProfile,
    motivationProfile: MotivationProfile
  ): PersonalizedAchievement[] {
    const achievements: PersonalizedAchievement[] = [];

    // Personal best achievements
    const personalBests = this.identifyPersonalBests(historicalData);
    for (const best of personalBests) {
      achievements.push({
        id: `personal_best_${best.metric}`,
        title: `Nuovo record personale: ${best.title}`,
        description: `Il tuo miglior ${best.metric} finora! ${best.description}`,
        category: 'milestone',
        rarity: 'uncommon',
        progress: best.isAchieved ? 1.0 : best.progress,
        criteria: {
          metric: best.metric,
          comparison: 'greater_than',
          target_value: best.target,
          time_period: 'day'
        },
        celebration_style: 'proud',
        personal_significance: 0.9
      });
    }

    // Improvement achievements
    const improvements = this.identifySignificantImprovements(historicalData);
    for (const improvement of improvements) {
      achievements.push({
        id: `improvement_${improvement.metric}`,
        title: improvement.title,
        description: improvement.description,
        category: 'progress',
        rarity: 'common',
        progress: improvement.progress,
        criteria: {
          metric: improvement.metric,
          comparison: 'improved_by',
          target_value: improvement.target_improvement,
          time_period: 'week',
          baseline_period: 7
        },
        celebration_style: 'enthusiastic',
        personal_significance: 0.7
      });
    }

    return achievements;
  }

  private createEffortAchievements(
    historicalData: HealthMetrics[],
    motivationProfile: MotivationProfile
  ): PersonalizedAchievement[] {
    const achievements: PersonalizedAchievement[] = [];

    // Showing up achievements (effort recognition)
    if (this.hasShownConsistentEffort(historicalData)) {
      achievements.push({
        id: 'consistent_effort',
        title: 'Costanza che conta',
        description: 'Hai fatto check-in regolarmente anche nei giorni difficili. Questo è il vero progresso.',
        category: 'effort',
        rarity: 'rare',
        progress: 1.0,
        criteria: {
          metric: 'checkin_frequency',
          comparison: 'greater_than',
          target_value: 0.7,
          time_period: 'week'
        },
        celebration_style: 'warm',
        personal_significance: 0.8
      });
    }

    // Trying new things achievements
    const newTries = this.identifyNewBehaviors(historicalData);
    for (const newTry of newTries) {
      achievements.push({
        id: `new_try_${newTry.behavior}`,
        title: `Esploratore del benessere`,
        description: `Hai provato qualcosa di nuovo: ${newTry.description}. Ogni esperimento conta!`,
        category: 'effort',
        rarity: 'common',
        progress: 1.0,
        criteria: {
          metric: newTry.behavior,
          comparison: 'greater_than',
          target_value: 1,
          time_period: 'day'
        },
        celebration_style: 'encouraging',
        personal_significance: 0.6
      });
    }

    return achievements;
  }

  private createBreakthroughAchievements(
    historicalData: HealthMetrics[],
    userProfile: UserProfile
  ): PersonalizedAchievement[] {
    const achievements: PersonalizedAchievement[] = [];

    // Significant life score improvements
    const breakthroughs = this.identifyBreakthroughs(historicalData);
    for (const breakthrough of breakthroughs) {
      achievements.push({
        id: `breakthrough_${breakthrough.area}`,
        title: breakthrough.title,
        description: breakthrough.description,
        category: 'breakthrough',
        rarity: 'legendary',
        progress: 1.0,
        criteria: {
          metric: breakthrough.metric,
          comparison: 'improved_by',
          target_value: breakthrough.improvement_amount,
          time_period: 'month'
        },
        celebration_style: 'proud',
        personal_significance: 1.0
      });
    }

    return achievements;
  }

  private createConsistencyAchievements(
    historicalData: HealthMetrics[],
    motivationProfile: MotivationProfile
  ): PersonalizedAchievement[] {
    const achievements: PersonalizedAchievement[] = [];

    // Long-term consistency
    const consistencyPeriods = this.identifyConsistencyPeriods(historicalData);
    for (const period of consistencyPeriods) {
      achievements.push({
        id: `consistency_${period.duration}`,
        title: period.title,
        description: period.description,
        category: 'consistency',
        rarity: period.duration >= 30 ? 'rare' : 'uncommon',
        progress: 1.0,
        criteria: {
          metric: 'checkin_consistency',
          comparison: 'greater_than',
          target_value: 0.8,
          time_period: 'month'
        },
        celebration_style: 'warm',
        personal_significance: 0.8
      });
    }

    return achievements;
  }

  // Utility methods
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private groupByWeek(metrics: HealthMetrics[], weekCount: number): HealthMetrics[][] {
    // Group metrics by week - simplified implementation
    const weeks: HealthMetrics[][] = [];
    for (let i = 0; i < weekCount; i++) {
      weeks.push(metrics.slice(i * 7, (i + 1) * 7));
    }
    return weeks;
  }

  private calculateImprovementTrend(metrics: HealthMetrics[], category: string): {
    isImproving: boolean;
    daysImproving: number;
    strength: number;
  } {
    // Simplified trend analysis
    const recentValues = metrics.slice(-7).map(m => {
      switch (category) {
        case 'stress_mgmt': return 10 - ((m as any).stress_level || m.stress || 5); // Inverse stress
        case 'energy': return (m as any).energy_level || m.energy || 5;
        case 'sleep': return (m as any).sleep_quality || m.sleep_quality || 5;
        default: return 5;
      }
    });

    let improvingDays = 0;
    for (let i = 1; i < recentValues.length; i++) {
      if (recentValues[i] >= recentValues[i - 1]) {
        improvingDays++;
      }
    }

    return {
      isImproving: improvingDays >= 3,
      daysImproving: improvingDays,
      strength: improvingDays / (recentValues.length - 1)
    };
  }

  private calculateStabilityScore(metrics: HealthMetrics[]): {
    score: number;
    days: number;
  } {
    // Calculate variance to determine stability
    const recentScores = metrics.slice(-14).map(m => 
      (((m as any).energy_level || m.energy || 5) + (10 - ((m as any).stress_level || m.stress || 5)) + ((m as any).sleep_quality || m.sleep_quality || 5)) / 3
    );

    if (recentScores.length < 7) {
      return { score: 0, days: 0 };
    }

    const mean = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const variance = recentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / recentScores.length;
    
    // Lower variance = higher stability
    const stabilityScore = Math.max(0, 1 - (variance / 4)); // Normalize to 0-1

    return {
      score: stabilityScore,
      days: recentScores.length
    };
  }

  private isInCelebrationCooldown(recentCelebrations: CelebrationMoment[]): boolean {
    const lastCelebration = recentCelebrations
      .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())[0];
    
    if (!lastCelebration) return false;
    
    const timeSinceLastMs = Date.now() - new Date(lastCelebration.id).getTime();
    const hoursSinceLastMs = timeSinceLastMs / (1000 * 60 * 60);
    
    return hoursSinceLastMs < this.GENTLE_CELEBRATION_COOLDOWN;
  }

  private determineCelebrationType(achievementOrStreak: PersonalizedAchievement | StreakData): CelebrationMoment['type'] {
    if ('type' in achievementOrStreak) {
      // It's a streak
      return 'streak_milestone';
    } else {
      // It's an achievement
      switch (achievementOrStreak.category) {
        case 'breakthrough': return 'personal_best';
        case 'progress': return 'progress_boost';
        case 'effort': return 'effort_recognition';
        default: return 'achievement_earned';
      }
    }
  }

  private determineEmotionalTone(currentMood: string, motivationProfile: MotivationProfile): CelebrationMoment['emotional_tone'] {
    if (motivationProfile.sensitivity_level === 'gentle') {
      return 'warm';
    }
    
    switch (currentMood) {
      case 'stressed':
      case 'anxious':
        return 'grateful';
      case 'energetic':
      case 'motivated':
        return 'excited';
      case 'tired':
        return 'warm';
      default:
        return 'proud';
    }
  }

  private determineVisualStyle(emotionalTone: string, timeOfDay: string): CelebrationMoment['visual_style'] {
    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      return 'gentle_glow';
    }
    
    switch (emotionalTone) {
      case 'excited': return 'sparkles';
      case 'warm': return 'warm_pulse';
      case 'grateful': return 'gentle_glow';
      default: return 'quiet_celebration';
    }
  }

  private generateCelebrationMessage(
    achievementOrStreak: PersonalizedAchievement | StreakData,
    emotionalTone: string,
    userContext: any,
    motivationProfile: MotivationProfile
  ): string {
    // This would integrate with the EmpatheticLanguageEngine
    // Simplified implementation for now
    if ('type' in achievementOrStreak) {
      // Streak message
      return `Fantastico! ${achievementOrStreak.current_count} giorni di ${achievementOrStreak.category}. La costanza è la tua forza!`;
    } else {
      // Achievement message
      return `${achievementOrStreak.title}! ${achievementOrStreak.description}`;
    }
  }

  private determineCelebrationTiming(
    type: CelebrationMoment['type'],
    userContext: any,
    motivationProfile: MotivationProfile
  ): CelebrationMoment['timing'] {
    if (type === 'personal_best' || type === 'streak_milestone') {
      return 'immediate';
    }
    
    if (motivationProfile.celebration_frequency === 'minimal') {
      return 'next_checkin';
    }
    
    return 'optimal_moment';
  }

  private suggestFollowUpAction(
    achievementOrStreak: PersonalizedAchievement | StreakData,
    motivationProfile: MotivationProfile
  ): string | undefined {
    if (motivationProfile.responds_to.includes('progress')) {
      return 'Condividi questo momento con qualcuno che ti sostiene';
    }
    return undefined;
  }

  // Additional placeholder methods for complex logic
  private prioritizeStreaks(streaks: StreakData[], motivationProfile: MotivationProfile): StreakData[] {
    return streaks.sort((a, b) => b.current_count - a.current_count).slice(0, 3);
  }

  private personalizeAchievements(
    achievements: PersonalizedAchievement[],
    userProfile: UserProfile,
    motivationProfile: MotivationProfile
  ): PersonalizedAchievement[] {
    return achievements.sort((a, b) => b.personal_significance - a.personal_significance);
  }

  private detectSmallImprovements(recent: HealthMetrics[], previous: HealthMetrics[]): any[] {
    return []; // Would implement small improvement detection
  }

  private recognizeEffort(metrics: HealthMetrics[], motivationProfile: MotivationProfile): MicroMilestone[] {
    return []; // Would implement effort recognition
  }

  private detectSmallWins(metrics: HealthMetrics[]): MicroMilestone[] {
    return []; // Would implement small wins detection
  }

  private prioritizeMilestones(milestones: MicroMilestone[], motivationProfile: MotivationProfile): MicroMilestone[] {
    return milestones.slice(0, 3); // Limit to most important
  }

  private generateProgressFeedback(lifeScore: AdvancedLifeScore, userContext: any, motivationProfile: MotivationProfile): string {
    return "Ottimo progresso! I tuoi sforzi stanno dando risultati visibili.";
  }

  private generateStabilityFeedback(lifeScore: AdvancedLifeScore, userContext: any, motivationProfile: MotivationProfile): string {
    return "La tua costanza è ammirevole. Mantenere l'equilibrio è una skill preziosa.";
  }

  private generateSupportiveFeedback(lifeScore: AdvancedLifeScore, userContext: any, motivationProfile: MotivationProfile): string {
    return "Ogni giorno è diverso, e va bene così. Il fatto che tu sia qui conta molto.";
  }

  private adaptToneForContext(userContext: any, motivationProfile: MotivationProfile): string {
    return motivationProfile.sensitivity_level;
  }

  private selectVisualizationType(motivationProfile: MotivationProfile): ProgressVisualization['type'] {
    return 'wellness_garden'; // Default gentle visualization
  }

  private identifyRecentHighlights(historicalData: HealthMetrics[], timeframe: string): string[] {
    return ["Miglioramento nel sonno", "Gestione dello stress più efficace"];
  }

  private identifyGrowthAreas(historicalData: HealthMetrics[], motivationProfile: MotivationProfile): string[] {
    return ["Energia mattutina", "Routine serale"];
  }

  private suggestGentleNextSteps(historicalData: HealthMetrics[], motivationProfile: MotivationProfile): string[] {
    return ["Prova una micro-pausa di 2 minuti", "Esperimenta con la respirazione 4-7-8"];
  }

  private buildCurrentStateVisualization(historicalData: HealthMetrics[], visualizationType: string): any {
    return { type: visualizationType, data: "visualization_data" };
  }

  private evaluateAchievementCriteria(criteria: AchievementCriteria, currentMetrics: HealthMetrics, historicalData: HealthMetrics[]): boolean {
    // Would implement criteria evaluation logic
    return false;
  }

  // Placeholder methods for achievement creation helpers
  private identifyPersonalBests(historicalData: HealthMetrics[]): any[] { return []; }
  private identifySignificantImprovements(historicalData: HealthMetrics[]): any[] { return []; }
  private hasShownConsistentEffort(historicalData: HealthMetrics[]): boolean { return false; }
  private identifyNewBehaviors(historicalData: HealthMetrics[]): any[] { return []; }
  private identifyBreakthroughs(historicalData: HealthMetrics[]): any[] { return []; }
  private identifyConsistencyPeriods(historicalData: HealthMetrics[]): any[] { return []; }
}
