import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { MicroAdviceOrchestrator } from '../../../../../../packages/core/orchestrator/microAdviceOrchestrator';
import { LifeScoreV2Calculator } from '../../../../../../packages/core/scoring/lifeScoreV2';

interface SimpleSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  priority: string;
  key: string;
  ai_generated: {
    content: string;
    tone: string;
    template_id: string;
    personalization_score: number;
    predicted_effectiveness: number;
  };
  timing: {
    suggested_time: Date;
    urgency_level: string;
    confidence_score: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get user session (optional for orchestrator)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || 'guest';

    const body = await request.json();
    
    const {
      force_immediate = false,
      preferred_category,
      context_override = {}
    } = body;

    // Initialize MicroAdviceOrchestrator
    const orchestrator = new MicroAdviceOrchestrator();

    try {
      // Get current metrics and life score
      const currentMetrics = await getCurrentHealthMetrics(supabase, userId);
      const historicalMetrics = await getHistoricalMetrics(supabase, userId);
      const previousScores = await getPreviousLifeScores(supabase, userId);
      
      // Calculate advanced life score using V2
      const currentLifeScore = await LifeScoreV2Calculator.calculateAdvancedLifeScore(
        currentMetrics,
        historicalMetrics,
        await getUserProfile(supabase, userId),
        previousScores
      );

      // Generate advice using orchestrator
      const adviceResponse = await orchestrator.generateMicroAdvice({
        user_id: userId,
        current_metrics: currentMetrics,
        current_life_score: currentLifeScore,
        force_immediate,
        preferred_category,
        context_override
      });

      // Transform orchestrator response to frontend format
      const suggestions: SimpleSuggestion[] = [{
        id: adviceResponse.session_id,
        title: extractTitleFromAdvice(adviceResponse.advice),
        description: adviceResponse.advice.content,
        category: mapAdviceToCategory(adviceResponse.advice),
        duration: estimateAdviceDuration(adviceResponse.advice),
        priority: mapUrgencyToPriority(adviceResponse.timing.urgency_level),
        key: generateKeyFromAdvice(adviceResponse.advice),
        ai_generated: {
          content: adviceResponse.advice.content,
          tone: adviceResponse.advice.tone,
          template_id: adviceResponse.advice.template_id,
          personalization_score: adviceResponse.advice.personalization_score,
          predicted_effectiveness: adviceResponse.advice.predicted_effectiveness
        },
        timing: {
          suggested_time: adviceResponse.timing.suggested_time,
          urgency_level: adviceResponse.timing.urgency_level,
          confidence_score: adviceResponse.timing.confidence_score
        }
      }];

      // Add additional suggestions if needed to reach requested count
      const requestedCount = context_override.requested_count || 6;
      if (suggestions.length < requestedCount) {
        const additionalSuggestions = await generateFallbackSuggestions(
          requestedCount - suggestions.length,
          currentLifeScore,
          currentMetrics
        );
        suggestions.push(...additionalSuggestions);
      }

      return NextResponse.json({
        success: true,
        suggestions,
        generated_at: new Date().toISOString(),
        user_context: {
          life_score: currentLifeScore,
          next_advice_eta: adviceResponse.next_advice_eta,
          gamification: adviceResponse.gamification
        },
        orchestrator_session: adviceResponse.session_id
      });

    } catch (orchestratorError) {
      console.log('Orchestrator failed, using fallback system:', orchestratorError.message);
      
      // Fallback to simplified system if orchestrator fails
      return await generateFallbackResponse(supabase, userId, context_override);
    }

  } catch (error: any) {
    console.error('Error in integrated advice generation:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to generate suggestions',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions for data retrieval
async function getCurrentHealthMetrics(supabase: any, userId: string) {
  try {
    if (userId === 'guest') {
      return getDefaultHealthMetrics();
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Try to get today's metrics from health_metrics table
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (metrics) {
      return {
        user_id: userId,
        date: today,
        sleep_hours: metrics.sleep_hours || 7,
        sleep_quality: metrics.sleep_quality || 3,
        steps: metrics.steps || 5000,
        mood: metrics.mood || 3,
        stress: metrics.stress || 3,
        energy: metrics.energy || 3,
        source: metrics.source || 'manual' as const
      };
    }

    // Fallback to lifescores if health_metrics doesn't exist
    const { data: lifeScore } = await supabase
      .from('lifescores')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (lifeScore) {
      return {
        user_id: userId,
        date: today,
        sleep_hours: (lifeScore.sleep_score || 5) * 1.6, // Convert 1-10 to hours
        sleep_quality: Math.round((lifeScore.sleep_score || 5) / 2), // Convert to 1-5 scale
        steps: (lifeScore.activity_score || 5) * 1000, // Rough conversion
        mood: lifeScore.mental_score || 3,
        stress: 10 - (lifeScore.mental_score || 5), // Inverse relationship
        energy: lifeScore.activity_score || 3,
        source: 'computed' as const
      };
    }

    return getDefaultHealthMetrics();
  } catch (error) {
    console.error('Error getting health metrics:', error);
    return getDefaultHealthMetrics();
  }
}

async function getHistoricalMetrics(supabase: any, userId: string) {
  try {
    if (userId === 'guest') {
      return [];
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    return metrics || [];
  } catch (error) {
    console.error('Error getting historical metrics:', error);
    return [];
  }
}

async function getPreviousLifeScores(supabase: any, userId: string) {
  try {
    if (userId === 'guest') {
      return [];
    }

    const { data: scores } = await supabase
      .from('lifescores')
      .select('date, score, sleep_score, activity_score, mental_score')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(30);

    return (scores || []).map(score => ({
      date: score.date,
      score: score.score || 5,
      breakdown: {
        sleep_score: score.sleep_score || 5,
        activity_score: score.activity_score || 5,
        mental_score: score.mental_score || 5
      }
    }));
  } catch (error) {
    console.error('Error getting previous scores:', error);
    return [];
  }
}

async function getUserProfile(supabase: any, userId: string) {
  try {
    if (userId === 'guest') {
      return undefined;
    }

    const { data: profile } = await supabase
      .from('user_wellness_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return profile || undefined;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return undefined;
  }
}

// Helper functions for data transformation
function extractTitleFromAdvice(advice: any): string {
  // Extract first sentence or create title from template_id
  const firstSentence = advice.content.split('.')[0];
  if (firstSentence.length > 5 && firstSentence.length < 50) {
    return firstSentence;
  }
  
  // Generate from template_id
  const templateMap: Record<string, string> = {
    'stress_relief': 'Momento di rilassamento',
    'energy_boost': 'Ricarica le energie',
    'sleep_prep': 'Preparazione al sonno',
    'mindfulness': 'Pratica mindfulness',
    'movement': 'Movimento consapevole'
  };
  
  return templateMap[advice.template_id] || 'Consiglio personalizzato';
}

function mapAdviceToCategory(advice: any): string {
  const categoryMap: Record<string, string> = {
    'stress_relief': 'stress_relief',
    'energy_boost': 'energy_boost', 
    'sleep_prep': 'sleep_prep',
    'mindfulness': 'celebration',
    'movement': 'energy_boost'
  };
  
  return categoryMap[advice.template_id] || 'motivation';
}

function estimateAdviceDuration(advice: any): number {
  const content = advice.content.toLowerCase();
  
  if (content.includes('respir') || content.includes('breath')) return 5;
  if (content.includes('cammina') || content.includes('walk')) return 10;
  if (content.includes('medita') || content.includes('meditation')) return 8;
  if (content.includes('stretching') || content.includes('allungamento')) return 7;
  if (content.includes('idrat') || content.includes('acqua')) return 2;
  
  return 5; // Default
}

function mapUrgencyToPriority(urgency: string): string {
  switch (urgency) {
    case 'emergency': return 'high';
    case 'high': return 'high';
    case 'medium': return 'medium';
    default: return 'low';
  }
}

function generateKeyFromAdvice(advice: any): string {
  const content = advice.content.toLowerCase();
  
  if (content.includes('4-7-8') || (content.includes('respir') && content.includes('4'))) {
    return 'breathing-478';
  }
  if (content.includes('medita') || content.includes('meditation')) {
    return '5min-meditation';
  }
  if (content.includes('cammina') || content.includes('walk')) {
    return '10min-walk';
  }
  if (content.includes('idrat') || content.includes('acqua')) {
    return 'mindful-hydration';
  }
  if (content.includes('stretching') || content.includes('allungamento')) {
    return 'light-stretching';
  }
  if (content.includes('respir') || content.includes('breath')) {
    return 'deep-breathing';
  }
  
  return 'mindful-moment';
}

// Fallback system
async function generateFallbackResponse(supabase: any, userId: string, context_override: any) {
  const suggestions = await generateFallbackSuggestions(
    context_override.requested_count || 6,
    await getSimpleLifeScore(supabase, userId),
    await getCurrentHealthMetrics(supabase, userId)
  );

  return NextResponse.json({
    success: true,
    suggestions,
    generated_at: new Date().toISOString(),
    user_context: {
      life_score: await getSimpleLifeScore(supabase, userId),
      fallback_mode: true
    }
  });
}

async function generateFallbackSuggestions(
  count: number,
  lifeScore: any,
  metrics: any
): Promise<SimpleSuggestion[]> {
  const hour = new Date().getHours();
  
  const templates = [
    {
      title: 'Respirazione 4-7-8',
      description: 'Tecnica di respirazione per ridurre lo stress rapidamente',
      category: 'stress_relief',
      duration: 5,
      priority: 'medium',
      key: 'breathing-478',
      content: 'Il tuo stress sembra elevato. La respirazione 4-7-8 può aiutarti a calmarti in pochi minuti.',
      effectiveness: 0.85
    },
    {
      title: 'Meditazione guidata',
      description: 'Rilassa mente e corpo con una breve meditazione',
      category: 'sleep_prep',
      duration: 8,
      priority: hour >= 18 ? 'high' : 'medium',
      key: '5min-meditation',
      content: 'La qualità del sonno può sempre migliorare. Una breve meditazione ti aiuterà.',
      effectiveness: 0.82
    },
    {
      title: 'Camminata energizzante',
      description: 'Una breve camminata per riattivare energia e concentrazione',
      category: 'energy_boost',
      duration: 10,
      priority: 'high',
      key: '10min-walk',
      content: 'I tuoi livelli di energia potrebbero migliorare. Una camminata veloce può dare la carica che cerchi.',
      effectiveness: 0.78
    },
    {
      title: 'Idratazione mindful',
      description: 'Bevi consapevolmente un bicchiere d\'acqua',
      category: 'energy_boost',
      duration: 2,
      priority: 'low',
      key: 'mindful-hydration',
      content: 'Il corpo ha bisogno di idratazione. Beviamo con attenzione e presenza.',
      effectiveness: 0.65
    },
    {
      title: 'Stretching leggero',
      description: 'Allunga i muscoli e riattiva la circolazione',
      category: 'energy_boost',
      duration: 7,
      priority: 'medium',
      key: 'light-stretching',
      content: 'Il corpo ha bisogno di movimento. Qualche allungamento può fare la differenza.',
      effectiveness: 0.72
    },
    {
      title: 'Respirazione profonda',
      description: 'Tre respiri profondi per resettare l\'energia',
      category: 'stress_relief',
      duration: 2,
      priority: 'medium',
      key: 'deep-breathing',
      content: 'Tre respiri profondi possono cambiare completamente il tuo stato d\'animo.',
      effectiveness: 0.79
    }
  ];

  return templates.slice(0, count).map((template, index) => ({
    id: `fallback-${Date.now()}-${index}`,
    title: template.title,
    description: template.description,
    category: template.category,
    duration: template.duration,
    priority: template.priority,
    key: template.key,
    ai_generated: {
      content: template.content,
      tone: 'encouraging',
      template_id: template.key,
      personalization_score: 0.75,
      predicted_effectiveness: template.effectiveness
    },
    timing: {
      suggested_time: new Date(),
      urgency_level: template.priority === 'high' ? 'high' : 'medium',
      confidence_score: 0.8
    }
  }));
}

function getDefaultHealthMetrics() {
  return {
    user_id: 'guest',
    date: new Date().toISOString().split('T')[0],
    sleep_hours: 7,
    sleep_quality: 3, // 1-5 scale
    steps: 5000,
    mood: 3,
    stress: 3,
    energy: 3,
    source: 'manual' as const
  };
}

async function getSimpleLifeScore(supabase: any, userId: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: score } = await supabase
      .from('lifescores')
      .select('score, sleep_score, activity_score, mental_score')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (!score) {
      return { stress: 5, energy: 5, sleep: 5, overall: 5 };
    }

    return {
      stress: 10 - (score.mental_score || 5),
      energy: score.activity_score || 5,
      sleep: score.sleep_score || 5,
      overall: score.score || 5
    };
  } catch (error) {
    return { stress: 5, energy: 5, sleep: 5, overall: 5 };
  }
}
