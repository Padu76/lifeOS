import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get comprehensive wellness dashboard data
    const dashboardData = await buildDashboardData(supabase, userId);

    return NextResponse.json({
      success: true,
      data: dashboardData,
      generated_at: new Date().toISOString(),
      user_id: userId
    });

  } catch (error: any) {
    console.error('Error in wellness dashboard API:', error);
    
    // Return minimal fallback data
    const fallbackData = {
      current_life_score: { stress: 5, energy: 5, sleep: 5, overall: 5 },
      active_streaks: [],
      recent_achievements: [],
      wellness_insights: ['Dashboard temporaneamente non disponibile'],
      error_mode: true
    };
    
    return NextResponse.json({
      success: false,
      data: fallbackData,
      message: 'Using fallback dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Build comprehensive dashboard data
async function buildDashboardData(supabase: any, userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    // Get current life score
    const currentLifeScore = await getCurrentLifeScore(supabase, userId, today);
    
    // Get active streaks
    const activeStreaks = await getActiveStreaks(supabase, userId);
    
    // Get recent achievements
    const recentAchievements = await getRecentAchievements(supabase, userId);
    
    // Get completion statistics
    const completionStats = await getCompletionStatistics(supabase, userId);
    
    // Get life score trends
    const lifeScoreTrends = await getLifeScoreTrends(supabase, userId);
    
    // Generate wellness insights
    const wellnessInsights = generateWellnessInsights(
      currentLifeScore,
      activeStreaks,
      completionStats,
      lifeScoreTrends
    );

    return {
      current_life_score: currentLifeScore,
      active_streaks: activeStreaks,
      recent_achievements: recentAchievements,
      statistics: {
        total_completions: completionStats.total,
        weekly_completions: completionStats.weekly,
        completion_rate: completionStats.rate,
        best_streak: completionStats.best_streak
      },
      trends: {
        lifescore_history: lifeScoreTrends,
        improvement_rate: calculateImprovementRate(lifeScoreTrends)
      },
      wellness_insights: wellnessInsights,
      next_advice_eta: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      user_preferences: await getUserPreferences(supabase, userId)
    };

  } catch (error) {
    console.error('Error building dashboard data:', error);
    throw error;
  }
}

// Get current life score
async function getCurrentLifeScore(supabase: any, userId: string, date: string) {
  try {
    const { data: score } = await supabase
      .from('lifescores')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    return {
      stress: score?.stress_score || 5,
      energy: score?.energy_score || 5,
      sleep: score?.sleep_score || 5,
      overall: score?.overall_score || 5
    };
  } catch (error) {
    console.error('Error getting current life score:', error);
    return { stress: 5, energy: 5, sleep: 5, overall: 5 };
  }
}

// Get active streaks
async function getActiveStreaks(supabase: any, userId: string) {
  try {
    const { data: streaks } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .gt('current_count', 0);

    return (streaks || []).map((streak: any) => ({
      type: streak.streak_type,
      current_count: streak.current_count,
      best_count: streak.best_count,
      last_activity: streak.last_activity_date
    }));
  } catch (error) {
    console.error('Error getting active streaks:', error);
    return [];
  }
}

// Get recent achievements (last 7 days)
async function getRecentAchievements(supabase: any, userId: string) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .gte('earned_date', sevenDaysAgo.toISOString())
      .order('earned_date', { ascending: false });

    return (achievements || []).map(achievement => ({
      title: achievement.title,
      description: achievement.description,
      earned_date: achievement.earned_date,
      type: achievement.achievement_type
    }));
  } catch (error) {
    console.error('Error getting recent achievements:', error);
    return [];
  }
}

// Get completion statistics
async function getCompletionStatistics(supabase: any, userId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get daily completions
    const { data: dailyCompletions } = await supabase
      .from('daily_completions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Get streaks for best streak calculation
    const { data: streaks } = await supabase
      .from('user_streaks')
      .select('best_count')
      .eq('user_id', userId);

    const total = (dailyCompletions || []).reduce((sum, day) => sum + day.completed_count, 0);
    const weeklyTotal = (dailyCompletions || [])
      .filter(day => new Date(day.date) >= sevenDaysAgo)
      .reduce((sum, day) => sum + day.completed_count, 0);

    const daysWithActivity = (dailyCompletions || []).filter(day => day.completed_count > 0).length;
    const totalDays = Math.min(30, dailyCompletions?.length || 0);
    const rate = totalDays > 0 ? daysWithActivity / totalDays : 0;

    const bestStreak = Math.max(...(streaks || []).map(s => s.best_count), 0);

    return {
      total,
      weekly: weeklyTotal,
      rate: Math.round(rate * 100),
      best_streak: bestStreak
    };
  } catch (error) {
    console.error('Error getting completion statistics:', error);
    return { total: 0, weekly: 0, rate: 0, best_streak: 0 };
  }
}

// Get life score trends (last 30 days)
async function getLifeScoreTrends(supabase: any, userId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: scores } = await supabase
      .from('lifescores')
      .select('date, overall_score, stress_score, energy_score, sleep_score')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    return scores || [];
  } catch (error) {
    console.error('Error getting life score trends:', error);
    return [];
  }
}

// Calculate improvement rate from trends
function calculateImprovementRate(trends: any[]) {
  if (trends.length < 7) return 0;

  const recent = trends.slice(-7).map(t => t.overall_score || 0);
  const previous = trends.slice(-14, -7).map(t => t.overall_score || 0);

  if (recent.length === 0 || previous.length === 0) return 0;

  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const previousAvg = previous.reduce((sum, score) => sum + score, 0) / previous.length;

  return previousAvg > 0 ? Math.round(((recentAvg - previousAvg) / previousAvg) * 100) : 0;
}

// Generate wellness insights
function generateWellnessInsights(
  lifeScore: any,
  streaks: any[],
  stats: any,
  trends: any[]
): string[] {
  const insights: string[] = [];

  // Life score insights
  if (lifeScore.overall >= 8) {
    insights.push('Eccellente! Il tuo benessere generale è molto alto');
  } else if (lifeScore.overall >= 6) {
    insights.push('Buoni livelli di benessere generale, continua così');
  } else if (lifeScore.overall <= 4) {
    insights.push('I tuoi livelli potrebbero migliorare - considera più attività di self-care');
  }

  // Streak insights
  const activeStreak = streaks.find(s => s.current_count > 0);
  if (activeStreak && activeStreak.current_count >= 7) {
    insights.push(`Fantastico! Hai una streak attiva di ${activeStreak.current_count} giorni`);
  } else if (activeStreak && activeStreak.current_count >= 3) {
    insights.push(`Stai costruendo una buona abitudine: ${activeStreak.current_count} giorni consecutivi`);
  }

  // Completion rate insights
  if (stats.rate >= 80) {
    insights.push('Hai un ottimo tasso di completamento delle attività');
  } else if (stats.rate >= 50) {
    insights.push('Buona consistenza nelle attività - prova ad aumentare leggermente');
  } else if (stats.rate < 30) {
    insights.push('Considera di iniziare con obiettivi più piccoli e raggiungibili');
  }

  // Trend insights
  const improvementRate = calculateImprovementRate(trends);
  if (improvementRate > 10) {
    insights.push('I tuoi score stanno migliorando significativamente');
  } else if (improvementRate < -10) {
    insights.push('I tuoi livelli sono in calo - potrebbe essere utile un check-in più frequente');
  }

  // Time-based insights
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 10) {
    insights.push('Ottimo momento per impostare le intenzioni della giornata');
  } else if (hour >= 15 && hour <= 17) {
    insights.push('Pomeriggio perfetto per una pausa rigenerante');
  } else if (hour >= 19 && hour <= 22) {
    insights.push('Serata ideale per attività di rilassamento');
  }

  // Ensure we have at least one insight
  if (insights.length === 0) {
    insights.push('Continua a tracciare i tuoi progressi per ricevere insights personalizzati');
  }

  return insights.slice(0, 5); // Limit to 5 insights
}

// Get user preferences
async function getUserPreferences(supabase: any, userId: string) {
  try {
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      notification_frequency: prefs?.notification_frequency || 'balanced',
      preferred_tone: prefs?.preferred_tone || 'encouraging',
      focus_areas: prefs?.focus_areas || ['stress', 'energy', 'sleep'],
      quiet_hours: prefs?.quiet_hours || { start: '22:00', end: '08:00' }
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {
      notification_frequency: 'balanced',
      preferred_tone: 'encouraging',
      focus_areas: ['stress', 'energy', 'sleep'],
      quiet_hours: { start: '22:00', end: '08:00' }
    };
  }
}
