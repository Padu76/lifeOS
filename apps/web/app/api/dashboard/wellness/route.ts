import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MicroAdviceOrchestrator } from '@lifeos/core/orchestrator/microAdviceOrchestrator';

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
    
    // Initialize orchestrator
    const orchestrator = new MicroAdviceOrchestrator();

    // Get comprehensive wellness dashboard data
    const dashboardData = await orchestrator.getWellnessDashboard(userId);

    // Enrich with additional database data
    const enrichedData = await enrichDashboardData(supabase, userId, dashboardData);

    return NextResponse.json({
      success: true,
      data: enrichedData,
      generated_at: new Date().toISOString(),
      user_id: userId
    });

  } catch (error) {
    console.error('Error in wellness dashboard API:', error);
    
    // Return fallback data if main system fails
    const fallbackData = await getFallbackDashboardData(createRouteHandlerClient({ cookies }), session?.user?.id);
    
    return NextResponse.json({
      success: false,
      error: 'Partial data available',
      data: fallbackData,
      message: 'Using fallback dashboard data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to enrich dashboard data with additional database queries
async function enrichDashboardData(supabase: any, userId: string, dashboardData: any) {
  try {
    // Get recent LifeScore history for trends
    const lifeScoreHistory = await getLifeScoreHistory(supabase, userId, 30);
    
    // Get completion statistics
    const completionStats = await getCompletionStats(supabase, userId);
    
    // Get wellness insights from recent patterns
    const patternInsights = await generatePatternInsights(supabase, userId);
    
    // Get upcoming scheduled advice
    const upcomingAdvice = await getUpcomingAdvice(supabase, userId);

    return {
      ...dashboardData,
      trends: {
        lifescore_history: lifeScoreHistory,
        completion_rate_trend: completionStats.trend,
        wellness_trajectory: calculateWellnessTrend(lifeScoreHistory)
      },
      statistics: {
        total_completions: completionStats.total,
        weekly_completions: completionStats.weekly,
        avg_daily_completions: completionStats.daily_average,
        best_week_completions: completionStats.best_week
      },
      enhanced_insights: [
        ...dashboardData.wellness_insights,
        ...patternInsights
      ],
      upcoming: {
        next_advice_eta: dashboardData.next_advice_eta,
        scheduled_notifications: upcomingAdvice,
        optimal_times_today: await getPredictedOptimalTimes(supabase, userId)
      },
      user_preferences: await getUserPreferences(supabase, userId)
    };

  } catch (error) {
    console.error('Error enriching dashboard data:', error);
    // Return original data if enrichment fails
    return dashboardData;
  }
}

// Helper function to get LifeScore history
async function getLifeScoreHistory(supabase: any, userId: string, days: number = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: scores, error } = await supabase
      .from('lifescores')
      .select('date, overall_score, stress_score, energy_score, sleep_score, mood_score')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching LifeScore history:', error);
      return [];
    }

    return scores || [];
  } catch (error) {
    console.error('Error in getLifeScoreHistory:', error);
    return [];
  }
}

// Helper function to get completion statistics
async function getCompletionStats(supabase: any, userId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get total completions
    const { data: totalCompletions } = await supabase
      .from('advice_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('user_response->>action', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get weekly completions
    const { data: weeklyCompletions } = await supabase
      .from('advice_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('user_response->>action', 'completed')
      .gte('created_at', sevenDaysAgo.toISOString());

    // Get daily completion counts for trend analysis
    const { data: dailyCompletions } = await supabase
      .from('daily_completions')
      .select('date, completed_count')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    const total = totalCompletions?.length || 0;
    const weekly = weeklyCompletions?.length || 0;
    const dailyAverage = dailyCompletions?.length > 0 
      ? dailyCompletions.reduce((sum, day) => sum + day.completed_count, 0) / dailyCompletions.length
      : 0;

    // Calculate trend
    const recentWeek = dailyCompletions?.slice(-7) || [];
    const previousWeek = dailyCompletions?.slice(-14, -7) || [];
    
    const recentAvg = recentWeek.length > 0 
      ? recentWeek.reduce((sum, day) => sum + day.completed_count, 0) / recentWeek.length 
      : 0;
    const previousAvg = previousWeek.length > 0 
      ? previousWeek.reduce((sum, day) => sum + day.completed_count, 0) / previousWeek.length 
      : 0;

    const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      total,
      weekly,
      daily_average: Math.round(dailyAverage * 10) / 10,
      best_week: Math.max(...(dailyCompletions?.map(d => d.completed_count) || [0])),
      trend: Math.round(trend * 10) / 10
    };

  } catch (error) {
    console.error('Error in getCompletionStats:', error);
    return {
      total: 0,
      weekly: 0,
      daily_average: 0,
      best_week: 0,
      trend: 0
    };
  }
}

// Helper function to generate pattern insights
async function generatePatternInsights(supabase: any, userId: string): Promise<string[]> {
  try {
    const insights: string[] = [];
    
    // Analyze time-of-day patterns
    const { data: timePatterns } = await supabase
      .from('advice_sessions')
      .select('created_at, user_response')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    if (timePatterns && timePatterns.length > 0) {
      const completions = timePatterns.filter(p => p.user_response?.action === 'completed');
      const hourCounts = new Array(24).fill(0);
      
      completions.forEach(completion => {
        const hour = new Date(completion.created_at).getHours();
        hourCounts[hour]++;
      });

      const bestHour = hourCounts.indexOf(Math.max(...hourCounts));
      if (bestHour >= 0 && hourCounts[bestHour] > 0) {
        insights.push(`Completi più consigli alle ${bestHour}:00 - considera questo il tuo momento ottimale`);
      }
    }

    // Analyze streak patterns
    const { data: streaks } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId);

    if (streaks && streaks.length > 0) {
      const bestStreak = Math.max(...streaks.map(s => s.best_count));
      const currentStreak = Math.max(...streaks.map(s => s.current_count));
      
      if (currentStreak >= 3) {
        insights.push(`Stai mantenendo una streak di ${currentStreak} giorni - mantieni il momentum!`);
      }
      
      if (bestStreak > currentStreak && bestStreak >= 7) {
        insights.push(`Il tuo record è ${bestStreak} giorni consecutivi - puoi raggiungerlo di nuovo`);
      }
    }

    // Analyze wellness trajectory
    const recentScores = await getLifeScoreHistory(supabase, userId, 7);
    if (recentScores.length >= 3) {
      const trend = calculateWellnessTrend(recentScores);
      if (trend > 0.1) {
        insights.push('I tuoi score stanno migliorando costantemente questa settimana');
      } else if (trend < -0.1) {
        insights.push('I tuoi livelli sembrano in calo - considera di aumentare la frequenza dei check-in');
      }
    }

    return insights.slice(0, 5); // Limit to 5 insights

  } catch (error) {
    console.error('Error generating pattern insights:', error);
    return ['Continua a tracciare i tuoi progressi per ricevere insights personalizzati'];
  }
}

// Helper function to calculate wellness trend
function calculateWellnessTrend(scores: any[]): number {
  if (scores.length < 2) return 0;
  
  const recent = scores.slice(-3).map(s => s.overall_score || 0);
  const previous = scores.slice(-6, -3).map(s => s.overall_score || 0);
  
  if (recent.length === 0 || previous.length === 0) return 0;
  
  const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
  const previousAvg = previous.reduce((sum, score) => sum + score, 0) / previous.length;
  
  return previousAvg > 0 ? (recentAvg - previousAvg) / previousAvg : 0;
}

// Helper function to get upcoming advice
async function getUpcomingAdvice(supabase: any, userId: string) {
  try {
    const { data: scheduled } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('delivered', false)
      .gte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true })
      .limit(3);

    return scheduled || [];
  } catch (error) {
    console.error('Error fetching upcoming advice:', error);
    return [];
  }
}

// Helper function to get predicted optimal times
async function getPredictedOptimalTimes(supabase: any, userId: string) {
  try {
    // Simple prediction based on historical completion patterns
    const { data: completions } = await supabase
      .from('advice_sessions')
      .select('created_at')
      .eq('user_id', userId)
      .eq('user_response->>action', 'completed')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    if (!completions || completions.length === 0) {
      return ['09:00', '15:00', '19:00']; // Default optimal times
    }

    // Calculate hour frequency
    const hourCounts = new Array(24).fill(0);
    completions.forEach(completion => {
      const hour = new Date(completion.created_at).getHours();
      hourCounts[hour]++;
    });

    // Get top 3 hours
    const topHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(h => `${h.hour.toString().padStart(2, '0')}:00`);

    return topHours.length > 0 ? topHours : ['09:00', '15:00', '19:00'];

  } catch (error) {
    console.error('Error predicting optimal times:', error);
    return ['09:00', '15:00', '19:00'];
  }
}

// Helper function to get user preferences
async function getUserPreferences(supabase: any, userId: string) {
  try {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return preferences || {
      notification_frequency: 'balanced',
      preferred_tone: 'adaptive',
      focus_areas: ['stress', 'energy', 'sleep'],
      quiet_hours: { start: '22:00', end: '08:00' }
    };
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return {
      notification_frequency: 'balanced',
      preferred_tone: 'adaptive',
      focus_areas: ['stress', 'energy', 'sleep'],
      quiet_hours: { start: '22:00', end: '08:00' }
    };
  }
}

// Fallback function for when main orchestrator fails
async function getFallbackDashboardData(supabase: any, userId: string) {
  try {
    // Get basic data from database
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayScore } = await supabase
      .from('lifescores')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    const { data: streaks } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId);

    return {
      current_life_score: {
        stress: todayScore?.stress_score || 5,
        energy: todayScore?.energy_score || 5,
        sleep: todayScore?.sleep_score || 5,
        overall: todayScore?.overall_score || 5
      },
      active_streaks: streaks?.map(s => ({
        type: s.streak_type,
        current_count: s.current_count,
        best_count: s.best_count
      })) || [],
      recent_achievements: [],
      wellness_insights: [
        'Dashboard in modalità limitata - alcuni dati potrebbero non essere aggiornati',
        'Riprova più tardi per insights AI completi'
      ],
      fallback_mode: true
    };

  } catch (error) {
    console.error('Error in fallback dashboard data:', error);
    return {
      current_life_score: { stress: 5, energy: 5, sleep: 5, overall: 5 },
      active_streaks: [],
      recent_achievements: [],
      wellness_insights: ['Impossibile caricare i dati dashboard'],
      error_mode: true
    };
  }
}
