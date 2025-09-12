import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface NotificationAnalyticsResponse {
  delivery_rate: number;
  open_rate: number;
  completion_rate: number;
  optimal_timing_accuracy: number;
  user_satisfaction_score: number;
  burnout_risk_score: number;
  period_stats: {
    total_sent: number;
    total_delivered: number;
    total_opened: number;
    total_completed: number;
    avg_response_time_minutes: number;
  };
  effectiveness_by_type: {
    [key: string]: {
      completion_rate: number;
      user_rating: number;
      optimal_timing_success: number;
    };
  };
  timing_patterns: {
    best_hours: number[];
    worst_hours: number[];
    peak_engagement_hour: number;
  };
  trends: {
    delivery_trend: 'improving' | 'stable' | 'declining';
    engagement_trend: 'improving' | 'stable' | 'declining';
    satisfaction_trend: 'improving' | 'stable' | 'declining';
  };
  recommendations: string[];
  period: string;
  last_updated: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

    // Fetch notification data for period
    const { data: notifications, error: notificationsError } = await supabase
      .from('scheduled_notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Fetch interaction data
    const { data: interactions, error: interactionsError } = await supabase
      .from('notification_interactions')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError);
      return NextResponse.json({ error: 'Failed to fetch interactions' }, { status: 500 });
    }

    // Calculate analytics
    const analytics = calculateNotificationAnalytics(notifications, interactions, periodDays);

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.message : String(error)) : undefined
    }, { status: 500 });
  }
}

// Helper functions
async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    
    // Get Supabase client for auth verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Verify JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Auth verification failed:', error);
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return null;
  }
}

function calculateNotificationAnalytics(
  notifications: any[],
  interactions: any[],
  periodDays: number
): NotificationAnalyticsResponse {
  
  // Basic period stats
  const totalSent = notifications.length;
  const totalDelivered = notifications.filter(n => 
    ['delivered', 'completed'].includes(n.status)
  ).length;
  
  // Calculate interactions stats
  const openedNotifications = interactions.filter(i => i.action === 'opened');
  const completedNotifications = interactions.filter(i => i.action === 'completed');
  const totalOpened = openedNotifications.length;
  const totalCompleted = completedNotifications.length;

  // Calculate rates
  const deliveryRate = totalSent > 0 ? totalDelivered / totalSent : 0;
  const openRate = totalDelivered > 0 ? totalOpened / totalDelivered : 0;
  const completionRate = totalOpened > 0 ? totalCompleted / totalOpened : 0;

  // Calculate timing accuracy
  const optimalTimingAccuracy = calculateOptimalTimingAccuracy(notifications, interactions);

  // Calculate user satisfaction
  const userSatisfactionScore = calculateUserSatisfaction(interactions);

  // Calculate burnout risk
  const burnoutRiskScore = calculateBurnoutRisk(notifications, interactions);

  // Calculate average response time
  const avgResponseTime = calculateAverageResponseTime(notifications, interactions);

  // Effectiveness by type
  const effectivenessByType = calculateEffectivenessByType(notifications, interactions);

  // Timing patterns
  const timingPatterns = calculateTimingPatterns(notifications, interactions);

  // Trends
  const trends = calculateTrends(notifications, interactions, periodDays);

  // Generate recommendations
  const recommendations = generateRecommendations({
    deliveryRate,
    openRate,
    completionRate,
    optimalTimingAccuracy,
    userSatisfactionScore,
    burnoutRiskScore,
    timingPatterns,
    trends,
    effectivenessByType
  });

  return {
    delivery_rate: deliveryRate,
    open_rate: openRate,
    completion_rate: completionRate,
    optimal_timing_accuracy: optimalTimingAccuracy,
    user_satisfaction_score: userSatisfactionScore,
    burnout_risk_score: burnoutRiskScore,
    period_stats: {
      total_sent: totalSent,
      total_delivered: totalDelivered,
      total_opened: totalOpened,
      total_completed: totalCompleted,
      avg_response_time_minutes: avgResponseTime
    },
    effectiveness_by_type: effectivenessByType,
    timing_patterns: timingPatterns,
    trends,
    recommendations,
    period: `${periodDays} days`,
    last_updated: new Date().toISOString()
  };
}

function calculateOptimalTimingAccuracy(notifications: any[], interactions: any[]): number {
  // Calculate how often notifications sent at "optimal" times get positive responses
  const notificationsWithOptimalTiming = notifications.filter(n => n.confidence_score > 0.7);
  const optimalTimingInteractions = interactions.filter(i => {
    const notification = notifications.find(n => n.id === i.notification_id);
    return notification && notification.confidence_score > 0.7;
  });
  
  const positiveOptimalResponses = optimalTimingInteractions.filter(i => 
    ['opened', 'completed'].includes(i.action)
  );

  return notificationsWithOptimalTiming.length > 0 
    ? positiveOptimalResponses.length / notificationsWithOptimalTiming.length 
    : 0.5; // Default if no data
}

function calculateUserSatisfaction(interactions: any[]): number {
  const ratingsInteractions = interactions.filter(i => i.feedback && i.feedback.rating);
  
  if (ratingsInteractions.length === 0) {
    // Infer satisfaction from actions
    const positiveActions = interactions.filter(i => 
      ['completed', 'opened'].includes(i.action)
    ).length;
    const negativeActions = interactions.filter(i => 
      ['dismissed'].includes(i.action)
    ).length;
    
    const totalActions = positiveActions + negativeActions;
    return totalActions > 0 ? positiveActions / totalActions : 0.5;
  }

  const avgRating = ratingsInteractions.reduce((sum, i) => 
    sum + i.feedback.rating, 0
  ) / ratingsInteractions.length;

  return avgRating / 5; // Normalize to 0-1 if ratings are 1-5
}

function calculateBurnoutRisk(notifications: any[], interactions: any[]): number {
  const recentNotifications = notifications.slice(0, 10); // Last 10 notifications
  const recentInteractions = interactions.filter(i => 
    recentNotifications.some(n => n.id === i.notification_id)
  );

  const dismissalRate = recentInteractions.filter(i => i.action === 'dismissed').length / 
                       Math.max(recentInteractions.length, 1);
  
  const consecutiveDismissals = calculateConsecutiveDismissals(recentInteractions);
  
  // High dismissal rate or many consecutive dismissals = high burnout risk
  let burnoutScore = 0;
  burnoutScore += dismissalRate * 0.6; // 60% weight for dismissal rate
  burnoutScore += Math.min(consecutiveDismissals / 5, 1) * 0.4; // 40% weight for consecutive dismissals

  return Math.min(burnoutScore, 1);
}

function calculateConsecutiveDismissals(interactions: any[]): number {
  const sortedInteractions = interactions
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  let consecutive = 0;
  for (const interaction of sortedInteractions) {
    if (interaction.action === 'dismissed') {
      consecutive++;
    } else {
      break;
    }
  }
  
  return consecutive;
}

function calculateAverageResponseTime(notifications: any[], interactions: any[]): number {
  const responseTimes: number[] = [];
  
  interactions.forEach(interaction => {
    const notification = notifications.find(n => n.id === interaction.notification_id);
    if (notification) {
      const notificationTime = new Date(notification.scheduled_time).getTime();
      const responseTime = new Date(interaction.timestamp).getTime();
      const diffMinutes = (responseTime - notificationTime) / (1000 * 60);
      
      if (diffMinutes >= 0 && diffMinutes < 24 * 60) { // Within 24 hours
        responseTimes.push(diffMinutes);
      }
    }
  });

  return responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0;
}

function calculateEffectivenessByType(notifications: any[], interactions: any[]): any {
  const typeStats: any = {};

  notifications.forEach(notification => {
    const type = notification.type;
    if (!typeStats[type]) {
      typeStats[type] = {
        total: 0,
        completed: 0,
        opened: 0,
        ratings: [],
        optimalTiming: 0
      };
    }

    typeStats[type].total++;
    
    if (notification.confidence_score > 0.7) {
      typeStats[type].optimalTiming++;
    }

    const relatedInteractions = interactions.filter(i => i.notification_id === notification.id);
    relatedInteractions.forEach(interaction => {
      if (interaction.action === 'completed') {
        typeStats[type].completed++;
      } else if (interaction.action === 'opened') {
        typeStats[type].opened++;
      }
      
      if (interaction.feedback && interaction.feedback.rating) {
        typeStats[type].ratings.push(interaction.feedback.rating);
      }
    });
  });

  // Convert to final format
  const result: any = {};
  Object.entries(typeStats).forEach(([type, stats]: [string, any]) => {
    result[type] = {
      completion_rate: stats.total > 0 ? stats.completed / stats.total : 0,
      user_rating: stats.ratings.length > 0 
        ? stats.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / stats.ratings.length / 5
        : 0.5,
      optimal_timing_success: stats.total > 0 ? stats.optimalTiming / stats.total : 0
    };
  });

  return result;
}

function calculateTimingPatterns(notifications: any[], interactions: any[]): any {
  const hourlyStats: any = {};
  
  // Initialize hourly stats
  for (let hour = 0; hour < 24; hour++) {
    hourlyStats[hour] = { sent: 0, positive_responses: 0 };
  }

  // Count notifications by hour
  notifications.forEach(notification => {
    const hour = new Date(notification.scheduled_time).getHours();
    hourlyStats[hour].sent++;

    const positiveInteractions = interactions.filter(i => 
      i.notification_id === notification.id && 
      ['opened', 'completed'].includes(i.action)
    );
    hourlyStats[hour].positive_responses += positiveInteractions.length;
  });

  // Calculate engagement rates by hour
  const hourlyEngagement = Object.entries(hourlyStats).map(([hour, stats]: [string, any]) => ({
    hour: parseInt(hour),
    engagement_rate: stats.sent > 0 ? stats.positive_responses / stats.sent : 0,
    volume: stats.sent
  }));

  // Find best and worst hours
  const sortedByEngagement = hourlyEngagement
    .filter(h => h.volume > 0)
    .sort((a, b) => b.engagement_rate - a.engagement_rate);

  const bestHours = sortedByEngagement.slice(0, 3).map(h => h.hour);
  const worstHours = sortedByEngagement.slice(-3).map(h => h.hour);
  const peakEngagementHour = sortedByEngagement[0]?.hour || 10;

  return {
    best_hours: bestHours,
    worst_hours: worstHours,
    peak_engagement_hour: peakEngagementHour
  };
}

function calculateTrends(notifications: any[], interactions: any[], periodDays: number): any {
  if (periodDays < 14) {
    // Need at least 2 weeks for trend analysis
    return {
      delivery_trend: 'stable' as const,
      engagement_trend: 'stable' as const,
      satisfaction_trend: 'stable' as const
    };
  }

  const midPoint = new Date(Date.now() - (periodDays / 2) * 24 * 60 * 60 * 1000);
  
  const firstHalf = notifications.filter(n => new Date(n.created_at) < midPoint);
  const secondHalf = notifications.filter(n => new Date(n.created_at) >= midPoint);

  const firstHalfInteractions = interactions.filter(i => 
    firstHalf.some(n => n.id === i.notification_id)
  );
  const secondHalfInteractions = interactions.filter(i => 
    secondHalf.some(n => n.id === i.notification_id)
  );

  // Calculate metrics for each half
  const firstHalfDeliveryRate = firstHalf.length > 0 
    ? firstHalf.filter(n => ['delivered', 'completed'].includes(n.status)).length / firstHalf.length 
    : 0;
  const secondHalfDeliveryRate = secondHalf.length > 0 
    ? secondHalf.filter(n => ['delivered', 'completed'].includes(n.status)).length / secondHalf.length 
    : 0;

  const firstHalfEngagementRate = firstHalfInteractions.length > 0 
    ? firstHalfInteractions.filter(i => ['opened', 'completed'].includes(i.action)).length / firstHalfInteractions.length 
    : 0;
  const secondHalfEngagementRate = secondHalfInteractions.length > 0 
    ? secondHalfInteractions.filter(i => ['opened', 'completed'].includes(i.action)).length / secondHalfInteractions.length 
    : 0;

  const firstHalfSatisfaction = calculateUserSatisfaction(firstHalfInteractions);
  const secondHalfSatisfaction = calculateUserSatisfaction(secondHalfInteractions);

  return {
    delivery_trend: getTrend(firstHalfDeliveryRate, secondHalfDeliveryRate),
    engagement_trend: getTrend(firstHalfEngagementRate, secondHalfEngagementRate),
    satisfaction_trend: getTrend(firstHalfSatisfaction, secondHalfSatisfaction)
  };
}

function getTrend(firstValue: number, secondValue: number): 'improving' | 'stable' | 'declining' {
  const diff = secondValue - firstValue;
  if (diff > 0.1) return 'improving';
  if (diff < -0.1) return 'declining';
  return 'stable';
}

function generateRecommendations(analytics: any): string[] {
  const recommendations: string[] = [];

  if (analytics.deliveryRate < 0.8) {
    recommendations.push('Migliorare il sistema di consegna notifiche - tasso attuale sotto l\'80%');
  }

  if (analytics.openRate < 0.4) {
    recommendations.push('Ottimizzare i titoli e il timing delle notifiche per aumentare l\'apertura');
  }

  if (analytics.completionRate < 0.3) {
    recommendations.push('Semplificare le azioni richieste o migliorare la rilevanza dei contenuti');
  }

  if (analytics.burnoutRiskScore > 0.6) {
    recommendations.push('Ridurre la frequenza delle notifiche - rilevato rischio burnout');
  }

  if (analytics.optimalTimingAccuracy < 0.6) {
    recommendations.push('Raffinare l\'algoritmo di timing intelligente per migliorare la precisione');
  }

  if (analytics.userSatisfactionScore < 0.6) {
    recommendations.push('Raccogliere più feedback utente e personalizzare maggiormente i contenuti');
  }

  if (analytics.trends.engagementTrend === 'declining') {
    recommendations.push('Trend di engagement in calo - rivedere strategia e contenuti');
  }

  if (Object.keys(analytics.effectivenessByType).length > 0) {
    const worstType = Object.entries(analytics.effectivenessByType)
      .sort(([,a]: [string, any], [,b]: [string, any]) => a.completion_rate - b.completion_rate)[0];
    
    if (worstType && (worstType[1] as any).completion_rate < 0.2) {
      recommendations.push(`Tipo notifica "${worstType[0]}" ha bassa efficacia - considerare modifiche`);
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Sistema funziona bene - continua il monitoraggio e ottimizzazioni incrementali');
  }

  return recommendations;
}