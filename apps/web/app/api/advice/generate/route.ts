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
    
    // Rimuovo controllo autenticazione - uso dati di default se non autenticato
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const body = await request.json();
    
    // Parse request parameters
    const {
      force_immediate = false,
      preferred_category,
      context_override = {}
    } = body;

    // Get user's current wellness data - usa schema corretto
    const currentLifeScore = await getCurrentLifeScore(supabase, userId);
    const userPreferences = await getUserPreferences(supabase, userId);

    // Generate suggestions based on current state
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

// Helper to get current life score - USA SCHEMA CORRETTO
async function getCurrentLifeScore(supabase: any, userId: string | null) {
  try {
    if (!userId) {
      // Dati di default se non autenticato
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
      stress: 10 - (score.mental_score || 5), // Inversione logica: mental basso = stress alto
      energy: score.activity_score || 5,
      sleep: score.sleep_score || 5,
      overall: score.score || 5
    };
  } catch (error) {
    console.error('Error getting life score:', error);
    return { stress: 5, energy: 5, sleep: 5, overall: 5 };
  }
}

// Helper to get user preferences
async function getUserPreferences(supabase: any, userId: string | null) {
  try {
    if (!userId) {
      // Dati di default se non autenticato
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

// Generate simple suggestions based on wellness state
async function generateSimpleSuggestions(
  lifeScore: any,
  preferences: any,
  count: number = 6
): Promise<SimpleSuggestion[]> {
  
  const suggestions: SimpleSuggestion[] = [];
  const hour = new Date().getHours();
  
  // Define suggestion templates based on wellness state
  const suggestionTemplates = [
    {
      condition: () => lifeScore.stress >= 7,
      suggestion: {
        title: 'Respirazione 4-7-8',
        description: 'Tecnica di respirazione per ridurre lo stress rapidamente',
        category: 'stress_relief',
        duration: 5,
        priority: 'high',
        key: 'breathing-478',
        content: 'Il tuo stress sembra elevato. La respirazione 4-7-8 può aiutarti a calmarti in pochi minuti.',
        effectiveness: 0.85
      }
    },
    {
      condition: () => lifeScore.energy <= 4,
      suggestion: {
        title: 'Camminata energizzante',
        description: 'Una breve camminata per riattivare energia e concentrazione',
        category: 'energy_boost',
        duration: 10,
        priority: 'medium',
        key: '10min-walk',
        content: 'I tuoi livelli di energia sono bassi. Una camminata veloce può dare la carica che cerchi.',
        effectiveness: 0.78
      }
    },
    {
      condition: () => lifeScore.sleep <= 5 && hour >= 18,
      suggestion: {
        title: 'Meditazione serale',
        description: 'Rilassa mente e corpo per prepararti al riposo',
        category: 'sleep_prep',
        duration: 8,
        priority: 'high',
        key: '5min-meditation',
        content: 'La qualità del sonno può migliorare. Una breve meditazione serale ti aiuterà.',
        effectiveness: 0.82
      }
    },
    {
      condition: () => lifeScore.overall >= 7,
      suggestion: {
        title: 'Momento di gratitudine',
        description: 'Celebra i tuoi progressi e mantieni lo slancio positivo',
        category: 'celebration',
        duration: 3,
        priority: 'low',
        key: 'gratitude-moment',
        content: 'Stai andando bene! Prendiamoci un momento per apprezzare i progressi fatti.',
        effectiveness: 0.91
      }
    },
    {
      condition: () => hour >= 9 && hour <= 11,
      suggestion: {
        title: 'Focus session 25 min',
        description: 'Tecnica Pomodoro per massimizzare la produttività mattutina',
        category: 'focus',
        duration: 25,
        priority: 'medium',
        key: 'pomodoro-technique',
        content: 'Perfetto momento per una sessione di focus. 25 minuti di concentrazione totale.',
        effectiveness: 0.75
      }
    },
    {
      condition: () => true, // Always available
      suggestion: {
        title: 'Idratazione mindful',
        description: 'Bevi consapevolmente un bicchiere d\'acqua',
        category: 'energy_boost',
        duration: 2,
        priority: 'low',
        key: 'mindful-hydration',
        content: 'Il corpo ha bisogno di idratazione. Beviamo con attenzione e presenza.',
        effectiveness: 0.65
      }
    }
  ];

  // Filter and select suggestions based on conditions
  let selectedTemplates = suggestionTemplates.filter(t => t.condition());
  
  // If we don't have enough, add some general ones
  if (selectedTemplates.length < count) {
    selectedTemplates = suggestionTemplates;
  }

  // Create suggestion objects
  for (let i = 0; i < Math.min(count, selectedTemplates.length); i++) {
    const template = selectedTemplates[i];
    const suggestion: SimpleSuggestion = {
      id: `simple-${Date.now()}-${i}`,
      title: template.suggestion.title,
      description: template.suggestion.description,
      category: template.suggestion.category,
      duration: template.suggestion.duration,
      priority: template.suggestion.priority,
      key: template.suggestion.key,
      ai_generated: {
        content: template.suggestion.content,
        tone: preferences.preferred_tone,
        template_id: template.suggestion.key,
        personalization_score: Math.random() * 0.3 + 0.7, // 0.7-1.0
        predicted_effectiveness: template.suggestion.effectiveness
      },
      timing: {
        suggested_time: new Date(),
        urgency_level: template.suggestion.priority === 'high' ? 'high' : 'medium',
        confidence_score: 0.8
      }
    };
    
    suggestions.push(suggestion);
  }

  return suggestions;
}
