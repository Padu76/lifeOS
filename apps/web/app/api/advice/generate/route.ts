import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MicroAdviceOrchestrator } from '@lifeos/core/orchestrator/microAdviceOrchestrator';
import { HealthMetrics, LifeScoreV2 } from '@lifeos/types';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    
    // Parse request parameters
    const {
      force_immediate = false,
      preferred_category,
      context_override = {}
    } = body;

    // Initialize orchestrator
    const orchestrator = new MicroAdviceOrchestrator();

    // Get current user metrics and LifeScore
    const currentMetrics = await getCurrentUserMetrics(supabase, userId);
    const currentLifeScore = await getCurrentUserLifeScore(supabase, userId);

    // Handle request for multiple suggestions (for suggestions page)
    if (context_override.page === 'suggestions' && context_override.requested_count) {
      const suggestions = [];
      const requestedCount = Math.min(context_override.requested_count, 8); // Max 8 suggestions
      
      for (let i = 0; i < requestedCount; i++) {
        try {
          const advice = await orchestrator.generateMicroAdvice({
            user_id: userId,
            current_metrics: currentMetrics,
            current_life_score: currentLifeScore,
            force_immediate: i === 0 ? force_immediate : false, // Only force first one
            preferred_category: i === 0 ? preferred_category : undefined
          });
          
          suggestions.push(advice);
          
          // Add small delay between generations to vary timing
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error generating suggestion ${i + 1}:`, error);
          // Continue with other suggestions even if one fails
        }
      }

      if (suggestions.length === 0) {
        return NextResponse.json(
          { 
            error: 'No suggestions generated', 
            message: 'Unable to generate any AI suggestions at this time',
            fallback: true
          },
          { status: 200 } // Return 200 to trigger fallback
        );
      }

      return NextResponse.json({
        success: true,
        suggestions,
        generated_at: new Date().toISOString(),
        user_context: {
          life_score: currentLifeScore,
          metrics_available: !!currentMetrics
        }
      });
    }

    // Handle single advice generation
    const advice = await orchestrator.generateMicroAdvice({
      user_id: userId,
      current_metrics: currentMetrics,
      current_life_score: currentLifeScore,
      force_immediate,
      preferred_category
    });

    return NextResponse.json({
      success: true,
      advice,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in advice generation API:', error);
    
    // Determine error type for appropriate response
    if (error.message?.includes('No intervention needed')) {
      return NextResponse.json(
        { 
          error: 'No intervention needed',
          message: 'Your wellness metrics look good right now. Try again later.',
          retry_after: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to generate AI advice',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to get current user metrics
async function getCurrentUserMetrics(supabase: any, userId: string): Promise<HealthMetrics> {
  try {
    // Get today's metrics
    const today = new Date().toISOString().split('T')[0];
    
    const { data: metrics, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching user metrics:', error);
    }

    if (!metrics) {
      // Return default metrics if none found
      return {
        date: today,
        user_id: userId,
        steps: 5000, // Default reasonable values
        sleep_hours: 7,
        mood_score: 5,
        stress_level: 5,
        energy_level: 5,
        heart_rate: 70,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    return metrics;
  } catch (error) {
    console.error('Error in getCurrentUserMetrics:', error);
    // Return safe defaults
    return {
      date: new Date().toISOString().split('T')[0],
      user_id: userId,
      steps: 5000,
      sleep_hours: 7,
      mood_score: 5,
      stress_level: 5,
      energy_level: 5,
      heart_rate: 70,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

// Helper function to get current user LifeScore
async function getCurrentUserLifeScore(supabase: any, userId: string): Promise<LifeScoreV2> {
  try {
    // Get today's LifeScore
    const today = new Date().toISOString().split('T')[0];
    
    const { data: lifeScore, error } = await supabase
      .from('lifescores')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user LifeScore:', error);
    }

    if (!lifeScore) {
      // Calculate LifeScore from current metrics
      const metrics = await getCurrentUserMetrics(supabase, userId);
      return calculateLifeScoreFromMetrics(metrics);
    }

    return {
      stress: lifeScore.stress_score || 5,
      energy: lifeScore.energy_score || 5,
      sleep: lifeScore.sleep_score || 5,
      overall: lifeScore.overall_score || 5
    };

  } catch (error) {
    console.error('Error in getCurrentUserLifeScore:', error);
    // Return safe defaults
    return {
      stress: 5,
      energy: 5,
      sleep: 5,
      overall: 5
    };
  }
}

// Helper function to calculate LifeScore from metrics
function calculateLifeScoreFromMetrics(metrics: HealthMetrics): LifeScore {
  // Simple calculation - in production this would use the core LifeScore algorithm
  const stressScore = Math.max(1, Math.min(10, 11 - (metrics.stress_level || 5)));
  const energyScore = Math.max(1, Math.min(10, metrics.energy_level || 5));
  const sleepScore = Math.max(1, Math.min(10, (metrics.sleep_hours || 7) * 1.2));
  const overallScore = Math.round((stressScore + energyScore + sleepScore) / 3);

  return {
    stress: stressScore,
    energy: energyScore,
    sleep: sleepScore,
    overall: overallScore
  };
}
