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
    
    // No auth required - usa dati di default se non autenticato
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const body = await request.json();
    
    const {
      force_immediate = false,
      preferred_category,
      context_override = {}
    } = body;

    // Get user's current wellness data con schema corretto
    const currentLifeScore = await getCurrentLifeScore(supabase, userId);
    const userPreferences = await getUserPreferences(supabase, userId);

    // Generate sempre 6 suggestions
    const suggestions = await generateSimpleSuggestions(
      currentLifeScore,
      userPreferences,
      context_override.requested_count || 6
    );

    return NextResponse.json({
      success: true,
      suggestions,
      generated_at: new Date().toISOString(),
      user_context: {
        life_score: currentLifeScore,
        preferences: userPreferences
      }
    });

  } catch (error: any) {
    console.error('Error in simple advice generation:', error);
    
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

async function getCurrentLifeScore(supabase: any, userId: string | null) {
  try {
    if (!userId) {
      return { stress: 5, energy: 5, sleep: 5, overall: 5 };
    }

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
    console.error('Error getting life score:', error);
    return { stress: 5, energy: 5, sleep: 5, overall: 5 };
  }
}

async function getUserPreferences(supabase: any, userId: string | null) {
  try {
    if (!userId) {
      return {
        preferred_tone: 'encouraging',
        focus_areas: ['stress', 'energy', 'sleep'],
        notification_frequency: 'balanced'
      };
    }

    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return {
      preferred_tone: prefs?.preferred_tone || 'encouraging',
      focus_areas: prefs?.focus_areas || ['stress', 'energy', 'sleep'],
      notification_frequency: prefs?.notification_frequency || 'balanced'
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {
      preferred_tone: 'encouraging',
      focus_areas: ['stress', 'energy', 'sleep'],
      notification_frequency: 'balanced'
    };
  }
}

// Generate sempre 6 suggestions diverse
async function generateSimpleSuggestions(
  lifeScore: any,
  preferences: any,
  count: number = 6
): Promise<SimpleSuggestion[]> {
  
  const hour = new Date().getHours();
  
  // Pool completo di suggestions - sempre disponibili
  const allSuggestionTemplates = [
    {
      title: 'Respirazione 4-7-8',
      description: 'Tecnica di respirazione per ridurre lo stress rapidamente',
      category: 'stress_relief',
      duration: 5,
      priority: lifeScore.stress >= 6 ? 'high' : 'medium',
      key: 'breathing-478',
      content: 'Il tuo stress sembra elevato. La respirazione 4-7-8 può aiutarti a calmarti in pochi minuti.',
      effectiveness: 0.85
    },
    {
      title: 'Camminata energizzante',
      description: 'Una breve camminata per riattivare energia e concentrazione',
      category: 'energy_boost',
      duration: 10,
      priority: lifeScore.energy <= 5 ? 'high' : 'medium',
      key: '10min-walk',
      content: 'I tuoi livelli di energia potrebbero migliorare. Una camminata veloce può dare la carica che cerchi.',
      effectiveness: 0.78
    },
    {
      title: 'Meditazione guidata',
      description: 'Rilassa mente e corpo con una breve meditazione',
      category: 'sleep_prep',
      duration: 8,
      priority: lifeScore.sleep <= 6 ? 'high' : 'medium',
      key: '5min-meditation',
      content: 'La qualità del sonno può sempre migliorare. Una breve meditazione ti aiuterà.',
      effectiveness: 0.82
    },
    {
      title: 'Momento di gratitudine',
      description: 'Celebra i tuoi progressi e mantieni lo slancio positivo',
      category: 'celebration',
      duration: 3,
      priority: lifeScore.overall >= 6 ? 'medium' : 'low',
      key: 'gratitude-moment',
      content: 'Prendiamoci un momento per apprezzare i progressi fatti oggi.',
      effectiveness: 0.91
    },
    {
      title: 'Focus session Pomodoro',
      description: 'Tecnica di concentrazione per massimizzare la produttività',
      category: 'focus',
      duration: 25,
      priority: hour >= 9 && hour <= 17 ? 'high' : 'medium',
      key: 'pomodoro-technique',
      content: 'Perfetto momento per una sessione di focus. 25 minuti di concentrazione totale.',
      effectiveness: 0.75
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
      title: 'Pausa digitale',
      description: 'Stacca dai dispositivi per 10 minuti',
      category: 'stress_relief',
      duration: 10,
      priority: hour >= 12 && hour <= 18 ? 'high' : 'medium',
      key: 'digital-detox',
      content: 'I tuoi occhi e la tua mente meritano una pausa dagli schermi.',
      effectiveness: 0.68
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

  // Ordina per priorità e personalizzazione
  const scoredTemplates = allSuggestionTemplates.map(template => ({
    ...template,
    score: calculatePersonalizationScore(template, lifeScore, preferences, hour)
  })).sort((a, b) => b.score - a.score);

  // Prendi i primi 'count' templates
  const selectedTemplates = scoredTemplates.slice(0, count);

  // Crea suggestion objects
  const suggestions: SimpleSuggestion[] = selectedTemplates.map((template, index) => ({
    id: `ai-${Date.now()}-${index}`,
    title: template.title,
    description: template.description,
    category: template.category,
    duration: template.duration,
    priority: template.priority,
    key: template.key,
    ai_generated: {
      content: template.content,
      tone: preferences.preferred_tone,
      template_id: template.key,
      personalization_score: Math.min(template.score / 100, 1), // Normalizza 0-1
      predicted_effectiveness: template.effectiveness
    },
    timing: {
      suggested_time: new Date(),
      urgency_level: template.priority === 'high' ? 'high' : 'medium',
      confidence_score: 0.8
    }
  }));

  return suggestions;
}

// Calcola score di personalizzazione per ordinare i suggestions
function calculatePersonalizationScore(template: any, lifeScore: any, preferences: any, hour: number): number {
  let score = 50; // Base score

  // Boost basato su lifescore
  if (template.category === 'stress_relief' && lifeScore.stress >= 6) score += 30;
  if (template.category === 'energy_boost' && lifeScore.energy <= 5) score += 25;
  if (template.category === 'sleep_prep' && lifeScore.sleep <= 6) score += 20;
  if (template.category === 'celebration' && lifeScore.overall >= 7) score += 15;

  // Boost basato su timing
  if (template.key === 'pomodoro-technique' && hour >= 9 && hour <= 17) score += 20;
  if (template.key === '5min-meditation' && hour >= 18) score += 15;
  if (template.key === 'digital-detox' && hour >= 12 && hour <= 18) score += 10;

  // Boost basato su focus areas preferences
  if (preferences.focus_areas.includes('stress') && template.category === 'stress_relief') score += 15;
  if (preferences.focus_areas.includes('energy') && template.category === 'energy_boost') score += 15;
  if (preferences.focus_areas.includes('sleep') && template.category === 'sleep_prep') score += 15;

  // Varietà di durata
  if (template.duration <= 5) score += 10; // Preferenza per attività brevi
  
  return score;
}
