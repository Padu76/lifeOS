import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

// Types for gamification system
export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'improvement' | 'consistency' | 'milestone' | 'exploration';
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
  category: 'sleep' | 'energy' | 'stress' | 'activity' | 'overall';
}

export interface StreakData {
  current: number;
  best: number;
  lastUpdate: Date;
  type: 'lifescore' | 'checkin' | 'improvement';
  isActive: boolean;
  pausedDays?: number; // Grace period for gentle streak system
}

export interface MicroMilestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  category: string;
  date: Date;
  celebrationShown: boolean;
}

export interface ProgressCelebration {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'streak' | 'milestone' | 'improvement';
  celebratedAt: Date;
  isShown: boolean;
  intensity: 'small' | 'medium' | 'big';
}

export interface GamificationState {
  achievements: Achievement[];
  streaks: Record<string, StreakData>;
  todayMilestones: MicroMilestone[];
  pendingCelebrations: ProgressCelebration[];
  totalScore: number;
  level: number;
  weeklyProgress: number;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'progress' | 'isUnlocked'>[] = [
  {
    id: 'first_checkin',
    title: 'Primo Passo',
    description: 'Hai completato il tuo primo check-in giornaliero',
    type: 'milestone',
    icon: '🌱',
    maxProgress: 1,
    category: 'overall'
  },
  {
    id: 'week_consistency',
    title: 'Una Settimana di Cura',
    description: 'Check-in completati per 7 giorni (anche non consecutivi)',
    type: 'consistency',
    icon: '📅',
    maxProgress: 7,
    category: 'overall'
  },
  {
    id: 'lifescore_improvement',
    title: 'In Crescita',
    description: 'LifeScore migliorato di 10 punti rispetto alla settimana scorsa',
    type: 'improvement',
    icon: '📈',
    maxProgress: 10,
    category: 'overall'
  },
  {
    id: 'sleep_optimizer',
    title: 'Dormiglione Saggio',
    description: 'Qualità del sonno superiore a 80 per 3 giorni',
    type: 'consistency',
    icon: '😴',
    maxProgress: 3,
    category: 'sleep'
  },
  {
    id: 'energy_master',
    title: 'Energizzato',
    description: 'Livelli di energia stabili sopra 75 per una settimana',
    type: 'consistency',
    icon: '⚡',
    maxProgress: 7,
    category: 'energy'
  },
  {
    id: 'stress_manager',
    title: 'Zen Master',
    description: 'Stress sotto controllo (< 40) per 5 giorni',
    type: 'consistency',
    icon: '🧘',
    maxProgress: 5,
    category: 'stress'
  },
  {
    id: 'suggestion_explorer',
    title: 'Esploratore del Benessere',
    description: 'Hai provato 10 diversi tipi di suggerimenti',
    type: 'exploration',
    icon: '🔍',
    maxProgress: 10,
    category: 'overall'
  },
  {
    id: 'month_warrior',
    title: 'Guerriero del Mese',
    description: 'Attivo per 20 giorni in un mese (con pause gentili)',
    type: 'consistency',
    icon: '🏆',
    maxProgress: 20,
    category: 'overall'
  }
];

export const useGamification = () => {
  const [state, setState] = useState<GamificationState>({
    achievements: [],
    streaks: {},
    todayMilestones: [],
    pendingCelebrations: [],
    totalScore: 0,
    level: 1,
    weeklyProgress: 0,
    isLoading: true,
    error: null
  });

  // Initialize gamification data
  const initializeGamification = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, isLoading: false, error: 'User not authenticated' }));
        return;
      }

      // Load user gamification data
      const { data: gamificationData, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (gamificationError && gamificationError.code !== 'PGRST116') {
        throw gamificationError;
      }

      // Initialize achievements with progress
      const achievements = DEFAULT_ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        progress: gamificationData?.achievements?.[achievement.id]?.progress || 0,
        isUnlocked: gamificationData?.achievements?.[achievement.id]?.isUnlocked || false,
        unlockedAt: gamificationData?.achievements?.[achievement.id]?.unlockedAt 
          ? new Date(gamificationData.achievements[achievement.id].unlockedAt) 
          : undefined
      }));

      // Load streaks with gentle system
      const streaks = gamificationData?.streaks || {
        lifescore: { current: 0, best: 0, lastUpdate: new Date(), type: 'lifescore', isActive: false },
        checkin: { current: 0, best: 0, lastUpdate: new Date(), type: 'checkin', isActive: false },
        improvement: { current: 0, best: 0, lastUpdate: new Date(), type: 'improvement', isActive: false }
      };

      // Generate today's micro-milestones
      const todayMilestones = await generateTodayMilestones(user.id);

      setState(prev => ({
        ...prev,
        achievements,
        streaks,
        todayMilestones,
        totalScore: gamificationData?.total_score || 0,
        level: calculateLevel(gamificationData?.total_score || 0),
        isLoading: false
      }));

    } catch (error) {
      console.error('Error initializing gamification:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load gamification data' 
      }));
    }
  }, []);

  // Generate personalized daily micro-milestones
  const generateTodayMilestones = async (userId: string): Promise<MicroMilestone[]> => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if milestones already exist for today
    const { data: existingMilestones } = await supabase
      .from('daily_milestones')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today);

    if (existingMilestones && existingMilestones.length > 0) {
      return existingMilestones.map(m => ({
        ...m,
        date: new Date(m.date),
        isCompleted: m.current_value >= m.target_value
      }));
    }

    // Generate new milestones based on user's recent performance
    const { data: recentData } = await supabase
      .from('daily_checkins')
      .select('lifescore, sleep_quality, energy_level, stress_level')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(7);

    const avgLifeScore = recentData?.reduce((acc, d) => acc + (d.lifescore || 0), 0) / (recentData?.length || 1) || 60;
    
    const milestones: MicroMilestone[] = [
      {
        id: `checkin_${today}`,
        title: 'Check-in Giornaliero',
        description: 'Completa il tuo check-in quotidiano',
        targetValue: 1,
        currentValue: 0,
        isCompleted: false,
        category: 'daily',
        date: new Date(),
        celebrationShown: false
      },
      {
        id: `lifescore_${today}`,
        title: 'LifeScore Stabile',
        description: `Mantieni un LifeScore sopra ${Math.max(avgLifeScore - 5, 50)}`,
        targetValue: Math.max(avgLifeScore - 5, 50),
        currentValue: 0,
        isCompleted: false,
        category: 'performance',
        date: new Date(),
        celebrationShown: false
      },
      {
        id: `suggestion_${today}`,
        title: 'Prova un Suggerimento',
        description: 'Segui almeno un suggerimento personalizzato',
        targetValue: 1,
        currentValue: 0,
        isCompleted: false,
        category: 'engagement',
        date: new Date(),
        celebrationShown: false
      }
    ];

    // Save to database
    const milestonesData = milestones.map(m => ({
      user_id: userId,
      milestone_id: m.id,
      title: m.title,
      description: m.description,
      target_value: m.targetValue,
      current_value: m.currentValue,
      category: m.category,
      date: today,
      celebration_shown: false
    }));

    await supabase.from('daily_milestones').insert(milestonesData);

    return milestones;
  };

  // Update streak with gentle system (allows pause days)
  const updateStreak = useCallback(async (type: string, hasActivity: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setState(prev => {
        const currentStreak = prev.streaks[type] || { 
          current: 0, 
          best: 0, 
          lastUpdate: new Date(), 
          type: type as any, 
          isActive: false,
          pausedDays: 0
        };

        const today = new Date();
        const lastUpdate = new Date(currentStreak.lastUpdate);
        const daysDiff = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

        let newStreak = { ...currentStreak };

        if (hasActivity) {
          if (daysDiff <= 1) {
            // Continue or maintain streak
            newStreak.current = daysDiff === 0 ? newStreak.current : newStreak.current + 1;
          } else if (daysDiff <= 3) {
            // Gentle pause system - allow up to 3 days gap
            newStreak.current += 1;
            newStreak.pausedDays = (newStreak.pausedDays || 0) + daysDiff - 1;
          } else {
            // Reset streak after 3+ days, but start with 1
            newStreak.current = 1;
            newStreak.pausedDays = 0;
          }
          
          newStreak.isActive = true;
          newStreak.lastUpdate = today;
          newStreak.best = Math.max(newStreak.best, newStreak.current);
        }

        return {
          ...prev,
          streaks: {
            ...prev.streaks,
            [type]: newStreak
          }
        };
      });

      // Save to database
      await saveGamificationData();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  }, []);

  // Progress achievement with healthy focus
  const progressAchievement = useCallback(async (achievementId: string, increment = 1) => {
    try {
      setState(prev => {
        const achievements = prev.achievements.map(achievement => {
          if (achievement.id === achievementId) {
            const newProgress = Math.min(achievement.progress + increment, achievement.maxProgress);
            const wasUnlocked = achievement.isUnlocked;
            const isNowUnlocked = newProgress >= achievement.maxProgress;

            // Add celebration if newly unlocked
            if (!wasUnlocked && isNowUnlocked) {
              const celebration: ProgressCelebration = {
                id: `achievement_${achievementId}_${Date.now()}`,
                title: 'Achievement Sbloccato!',
                message: `Complimenti! Hai sbloccato "${achievement.title}"`,
                type: 'achievement',
                celebratedAt: new Date(),
                isShown: false,
                intensity: 'big'
              };

              setTimeout(() => {
                setState(state => ({
                  ...state,
                  pendingCelebrations: [...state.pendingCelebrations, celebration]
                }));
              }, 100);
            }

            return {
              ...achievement,
              progress: newProgress,
              isUnlocked: isNowUnlocked,
              unlockedAt: isNowUnlocked && !wasUnlocked ? new Date() : achievement.unlockedAt
            };
          }
          return achievement;
        });

        return { ...prev, achievements };
      });

      await saveGamificationData();
    } catch (error) {
      console.error('Error progressing achievement:', error);
    }
  }, []);

  // Complete micro-milestone with gentle celebration
  const completeMilestone = useCallback(async (milestoneId: string, value: number) => {
    try {
      setState(prev => {
        const milestones = prev.todayMilestones.map(milestone => {
          if (milestone.id === milestoneId) {
            const wasCompleted = milestone.isCompleted;
            const isNowCompleted = value >= milestone.targetValue;

            if (!wasCompleted && isNowCompleted && !milestone.celebrationShown) {
              const celebration: ProgressCelebration = {
                id: `milestone_${milestoneId}_${Date.now()}`,
                title: 'Micro-Obiettivo Raggiunto!',
                message: `Ottimo lavoro! Hai completato: ${milestone.title}`,
                type: 'milestone',
                celebratedAt: new Date(),
                isShown: false,
                intensity: 'small'
              };

              setTimeout(() => {
                setState(state => ({
                  ...state,
                  pendingCelebrations: [...state.pendingCelebrations, celebration]
                }));
              }, 100);
            }

            return {
              ...milestone,
              currentValue: value,
              isCompleted: isNowCompleted,
              celebrationShown: isNowCompleted || milestone.celebrationShown
            };
          }
          return milestone;
        });

        return { ...prev, todayMilestones: milestones };
      });

      // Update database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('daily_milestones')
          .update({ current_value: value })
          .eq('user_id', user.id)
          .eq('milestone_id', milestoneId);
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  }, []);

  // Mark celebration as shown
  const markCelebrationShown = useCallback((celebrationId: string) => {
    setState(prev => ({
      ...prev,
      pendingCelebrations: prev.pendingCelebrations.filter(c => c.id !== celebrationId)
    }));
  }, []);

  // Calculate level based on total score
  const calculateLevel = (score: number): number => {
    return Math.floor(score / 100) + 1;
  };

  // Save gamification data to database
  const saveGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const gamificationData = {
        user_id: user.id,
        achievements: state.achievements.reduce((acc, achievement) => {
          acc[achievement.id] = {
            progress: achievement.progress,
            isUnlocked: achievement.isUnlocked,
            unlockedAt: achievement.unlockedAt?.toISOString()
          };
          return acc;
        }, {} as Record<string, any>),
        streaks: state.streaks,
        total_score: state.totalScore,
        updated_at: new Date().toISOString()
      };

      await supabase
        .from('user_gamification')
        .upsert(gamificationData);
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  };

  // Public methods for integration
  const trackCheckin = useCallback((lifeScore: number) => {
    updateStreak('checkin', true);
    completeMilestone(`checkin_${new Date().toISOString().split('T')[0]}`, 1);
    completeMilestone(`lifescore_${new Date().toISOString().split('T')[0]}`, lifeScore);
    
    // Progress relevant achievements
    progressAchievement('first_checkin');
    progressAchievement('week_consistency');
    
    if (lifeScore >= 80) {
      progressAchievement('lifescore_improvement');
    }
  }, [updateStreak, completeMilestone, progressAchievement]);

  const trackSuggestionUsed = useCallback((suggestionType: string) => {
    completeMilestone(`suggestion_${new Date().toISOString().split('T')[0]}`, 1);
    progressAchievement('suggestion_explorer');
  }, [completeMilestone, progressAchievement]);

  const trackSleepQuality = useCallback((quality: number) => {
    if (quality >= 80) {
      progressAchievement('sleep_optimizer');
    }
  }, [progressAchievement]);

  const trackEnergyLevel = useCallback((energy: number) => {
    if (energy >= 75) {
      progressAchievement('energy_master');
    }
  }, [progressAchievement]);

  const trackStressLevel = useCallback((stress: number) => {
    if (stress <= 40) {
      progressAchievement('stress_manager');
    }
  }, [progressAchievement]);

  // Initialize on mount
  useEffect(() => {
    initializeGamification();
  }, [initializeGamification]);

  return {
    ...state,
    // Actions
    trackCheckin,
    trackSuggestionUsed,
    trackSleepQuality,
    trackEnergyLevel,
    trackStressLevel,
    completeMilestone,
    markCelebrationShown,
    refreshData: initializeGamification
  };
};
