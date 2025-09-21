import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || 'guest';

    const body = await request.json();
    
    const {
      force_immediate = false,
      preferred_category,
      context_override = {}
    } = body;

    // Get current metrics and generate suggestions
    const currentMetrics = await getCurrentHealthMetrics(supabase, userId);
    const lifeScore = await getSimpleLifeScore(supabase, userId);
    
    // Generate personalized suggestions based on current state
    const suggestions = await generatePersonalizedSuggestions(
      context_override.requested_count || 6,
      lifeScore,
      currentMetrics,
      preferred_category,
      force_immediate
    );

    return NextResponse.json({
      success: true,
      suggestions,
      generated_at: new Date().toISOString(),
      user_context: {
        life_score: lifeScore,
        metrics: currentMetrics,
        user_id: userId
      }
    });

  } catch (error: any) {
    console.error('Error in advice generation:', error);
    
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
        sleep_hours: (lifeScore.sleep_score || 5) * 1.6,
        sleep_quality: Math.round((lifeScore.sleep_score || 5) / 2),
        steps: (lifeScore.activity_score || 5) * 1000,
        mood: lifeScore.mental_score || 3,
        stress: 10 - (lifeScore.mental_score || 5),
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

async function getSimpleLifeScore(supabase: any, userId: string) {
  try {
    if (userId === 'guest') {
      return { stress: 5, energy: 5, sleep: 5, overall: 75 };
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { data: score } = await supabase
      .from('lifescores')
      .select('score, sleep_score, activity_score, mental_score')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (!score) {
      return { stress: 5, energy: 5, sleep: 5, overall: 75 };
    }

    return {
      stress: 10 - (score.mental_score || 5),
      energy: score.activity_score || 5,
      sleep: score.sleep_score || 5,
      overall: score.score || 75
    };
  } catch (error) {
    console.error('Error getting life score:', error);
    return { stress: 5, energy: 5, sleep: 5, overall: 75 };
  }
}

async function generatePersonalizedSuggestions(
  count: number,
  lifeScore: any,
  metrics: any,
  preferredCategory?: string,
  forceImmediate?: boolean
): Promise<SimpleSuggestion[]> {
  const hour = new Date().getHours();
  const isEvening = hour >= 18 && hour <= 23;
  const isMorning = hour >= 5 && hour <= 11;
  const isAfternoon = hour >= 12 && hour <= 17;
  
  // Dynamic suggestion templates based on time and metrics
  const templates = [
    {
      title: 'Respirazione 4-7-8',
      description: 'Tecnica di respirazione per ridurre lo stress rapidamente',
      category: 'stress_relief',
      duration: 5,
      priority: metrics.stress >= 4 ? 'high' : 'medium',
      key: 'breathing-478',
      content: metrics.stress >= 4 
        ? 'Il tuo livello di stress è elevato. La respirazione 4-7-8 può aiutarti a calmarti in pochi minuti.'
        : 'Mantieni il tuo equilibrio con questa tecnica di respirazione rilassante.',
      effectiveness: 0.85,
      timeWeight: isEvening ? 1.2 : 1.0
    },
    {
      title: 'Meditazione guidata',
      description: 'Rilassa mente e corpo con una breve meditazione',
      category: 'sleep_prep',
      duration: 8,
      priority: isEvening ? 'high' : 'medium',
      key: '5min-meditation',
      content: isEvening 
        ? 'È sera, il momento perfetto per una meditazione che prepara al sonno.'
        : 'Prenditi un momento per centrare la mente e rilassare il corpo.',
      effectiveness: 0.82,
      timeWeight: isEvening ? 1.5 : 0.8
    },
    {
      title: 'Camminata energizzante',
      description: 'Una breve camminata per riattivare energia e concentrazione',
      category: 'energy_boost',
      duration: 10,
      priority: metrics.energy <= 3 ? 'high' : 'medium',
      key: '10min-walk',
      content: metrics.energy <= 3
        ? 'I tuoi livelli di energia sono bassi. Una camminata veloce può darti la carica di cui hai bisogno.'
        : 'Mantieni alta la tua energia con una camminata attivante.',
      effectiveness: 0.78,
      timeWeight: isAfternoon ? 1.3 : (isEvening ? 0.7 : 1.0)
    },
    {
      title: 'Idratazione mindful',
      description: 'Bevi consapevolmente un bicchiere d\'acqua',
      category: 'energy_boost',
      duration: 2,
      priority: 'low',
      key: 'mindful-hydration',
      content: 'Il corpo ha bisogno di idratazione costante. Bevi con attenzione e presenza.',
      effectiveness: 0.65,
      timeWeight: 1.0
    },
    {
      title: 'Stretching leggero',
      description: 'Allunga i muscoli e riattiva la circolazione',
      category: 'energy_boost',
      duration: 7,
      priority: isAfternoon ? 'high' : 'medium',
      key: 'light-stretching',
      content: isAfternoon
        ? 'Perfetto per il pomeriggio: stretching per combattere la stanchezza post-pranzo.'
        : 'Allunga i muscoli per mantenere il corpo attivo e flessibile.',
      effectiveness: 0.72,
      timeWeight: isAfternoon ? 1.4 : 1.0
    },
    {
      title: 'Respirazione profonda',
      description: 'Tre respiri profondi per resettare l\'energia',
      category: 'stress_relief',
      duration: 2,
      priority: 'medium',
      key: 'deep-breathing',
      content: 'Tre respiri profondi possono cambiare completamente il tuo stato d\'animo.',
      effectiveness: 0.79,
      timeWeight: 1.0
    },
    {
      title: 'Power nap guidato',
      description: 'Breve riposo rigenerante di 15 minuti',
      category: 'energy_boost',
      duration: 15,
      priority: isAfternoon && metrics.energy <= 3 ? 'high' : 'low',
      key: 'power-nap',
      content: 'Un breve riposo può ricaricarti per il resto della giornata.',
      effectiveness: 0.88,
      timeWeight: isAfternoon ? 1.5 : 0.3
    },
    {
      title: 'Gratitudine serale',
      description: 'Rifletti su tre cose positive della giornata',
      category: 'sleep_prep',
      duration: 5,
      priority: isEvening ? 'high' : 'low',
      key: 'gratitude-practice',
      content: 'Concludi la giornata con gratitudine per migliorare il sonno e l\'umore.',
      effectiveness: 0.75,
      timeWeight: isEvening ? 1.8 : 0.4
    },
    {
      title: 'Energia mattutina',
      description: 'Routine energizzante per iniziare la giornata',
      category: 'energy_boost',
      duration: 5,
      priority: isMorning ? 'high' : 'low',
      key: 'morning-routine',
      content: 'Inizia la giornata con energia e focus ottimali.',
      effectiveness: 0.80,
      timeWeight: isMorning ? 1.6 : 0.3
    }
  ];

  // Sort templates by weighted score
  const scoredTemplates = templates.map(template => {
    let score = template.effectiveness * template.timeWeight;
    
    // Boost score if matches preferred category
    if (preferredCategory && template.category === preferredCategory) {
      score *= 1.5;
    }
    
    // Boost score based on user metrics
    if (template.category === 'stress_relief' && metrics.stress >= 4) {
      score *= 1.3;
    }
    if (template.category === 'energy_boost' && metrics.energy <= 3) {
      score *= 1.3;
    }
    if (template.category === 'sleep_prep' && metrics.sleep_quality <= 2) {
      score *= 1.2;
    }
    
    return { ...template, score };
  });

  // Sort by score and take top suggestions
  scoredTemplates.sort((a, b) => b.score - a.score);
  const selectedTemplates = scoredTemplates.slice(0, count);

  // Convert to SimpleSuggestion format
  return selectedTemplates.map((template, index) => ({
    id: `suggestion-${Date.now()}-${index}`,
    title: template.title,
    description: template.description,
    category: template.category,
    duration: template.duration,
    priority: forceImmediate && index === 0 ? 'high' : template.priority,
    key: template.key,
    ai_generated: {
      content: template.content,
      tone: 'encouraging',
      template_id: template.key,
      personalization_score: template.score / 2, // Normalize to 0-1
      predicted_effectiveness: template.effectiveness
    },
    timing: {
      suggested_time: new Date(),
      urgency_level: template.priority,
      confidence_score: Math.min(0.95, template.score)
    }
  }));
}

function getDefaultHealthMetrics() {
  return {
    user_id: 'guest',
    date: new Date().toISOString().split('T')[0],
    sleep_hours: 7,
    sleep_quality: 3,
    steps: 5000,
    mood: 3,
    stress: 3,
    energy: 3,
    source: 'manual' as const
  };
}