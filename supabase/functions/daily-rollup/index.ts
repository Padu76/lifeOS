import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import micro advice engine (simplified for Edge Function)
interface MicroAdviceContext {
  current_metrics: any;
  recent_trend: 'improving' | 'stable' | 'declining';
  streak_days: number;
  time_of_day: number;
  day_of_week: number;
  recent_completions: string[];
  stress_pattern: 'rising' | 'stable' | 'lowering';
  energy_level: 'low' | 'medium' | 'high';
  anomaly_detected: boolean;
}

interface MicroAdvice {
  message: string;
  action: string;
  duration_minutes: number;
  priority: number;
  trigger_reason: string;
  tone: 'encouraging' | 'gentle' | 'celebratory' | 'supportive';
  timing_optimal: boolean;
  suggestion_key?: string;
}

// Micro Advice Templates (simplified version for Edge Function)
const MICRO_ADVICE_TEMPLATES = [
  {
    id: 'stress_relief_breathing',
    category: 'stress_relief',
    condition: (ctx: MicroAdviceContext) => ctx.current_metrics.stress >= 4 || ctx.stress_pattern === 'rising',
    templates: [
      {
        message: "Noto che oggi il tuo livello di stress è un po' alto. Se ti va, prova 2 minuti di respirazione lenta.",
        action: "Respira lentamente: 4 secondi inspira, 4 espira",
        tone: 'gentle' as const
      },
      {
        message: "Il tuo corpo potrebbe aver bisogno di una pausa. Che ne dici di qualche respiro profondo?",
        action: "Tecnica 4-7-8: inspira 4, trattieni 7, espira 8",
        tone: 'supportive' as const
      }
    ],
    priority_base: 8,
    optimal_hours: [9, 10, 11, 14, 15, 16, 17],
    suggestion_key: 'breathing-478'
  },
  {
    id: 'energy_boost_movement',
    category: 'energy_boost',
    condition: (ctx: MicroAdviceContext) => ctx.energy_level === 'low' && ctx.current_metrics.steps < 2000,
    templates: [
      {
        message: "L'energia sembra un po' bassa oggi. Un piccolo movimento può risvegliare tutto!",
        action: "5 minuti di camminata o stretching leggero",
        tone: 'encouraging' as const
      },
      {
        message: "Diversi utenti in situazioni simili hanno trovato utile una micro-pausa attiva.",
        action: "3 minuti di movimenti leggeri o stretching",
        tone: 'supportive' as const
      }
    ],
    priority_base: 6,
    optimal_hours: [8, 9, 10, 13, 14, 15, 16],
    suggestion_key: 'walk-10min'
  },
  {
    id: 'sleep_prep_evening',
    category: 'sleep_prep',
    condition: (ctx: MicroAdviceContext) => ctx.current_metrics.sleep_hours < 7 && ctx.time_of_day >= 20,
    templates: [
      {
        message: "Vedo che ultimamente dormi poco. Che ne dici di preparare il terreno per una bella notte?",
        action: "10 minuti di routine serale rilassante",
        tone: 'gentle' as const
      },
      {
        message: "Il sonno è il tuo alleato per il recupero. Una piccola routine serale può aiutare.",
        action: "Respirazione lenta o meditazione breve",
        tone: 'supportive' as const
      }
    ],
    priority_base: 7,
    optimal_hours: [20, 21, 22],
    suggestion_key: 'meditation-5min'
  },
  {
    id: 'celebration_streak',
    category: 'celebration',
    condition: (ctx: MicroAdviceContext) => ctx.streak_days >= 3 && ctx.recent_trend === 'improving',
    templates: [
      {
        message: `Fantastico! ${ctx.streak_days} giorni consecutivi di check-in. Stai costruendo una vera abitudine!`,
        action: "Continua così e concediti un momento di soddisfazione",
        tone: 'celebratory' as const
      },
      {
        message: `Bel segnale 🟢 La costanza sta pagando! ${ctx.streak_days} giorni di fila dimostrano la tua dedizione.`,
        action: "Oggi mantieni il ritmo con una piccola azione di benessere",
        tone: 'celebratory' as const
      }
    ],
    priority_base: 5,
    optimal_hours: [8, 9, 10, 18, 19]
  },
  {
    id: 'emergency_intervention',
    category: 'emergency',
    condition: (ctx: MicroAdviceContext) => ctx.current_metrics.stress >= 5 && ctx.current_metrics.mood <= 2,
    templates: [
      {
        message: "Sembra una giornata difficile. Va bene non essere sempre al top. Un piccolo gesto di cura per te stesso?",
        action: "Anche solo 2 minuti di respiri lenti e un po' di gentilezza verso te stesso",
        tone: 'supportive' as const
      },
      {
        message: "I momenti difficili fanno parte del percorso. Se ti va, prova qualcosa di molto semplice e rassicurante.",
        action: "Bevi un bicchiere d'acqua lentamente e fai 3 respiri profondi",
        tone: 'gentle' as const
      }
    ],
    priority_base: 10,
    optimal_hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    suggestion_key: 'breathing-478'
  }
];

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { day } = await req.json();
    const targetDate = day || new Date().toISOString().slice(0, 10);

    console.log(`Processing daily rollup with micro-advice for ${targetDate}`);

    // Get all users with health metrics for the target date
    const { data: healthMetrics, error: metricsError } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('date', targetDate);

    if (metricsError) {
      throw new Error(`Error fetching health metrics: ${metricsError.message}`);
    }

    if (!healthMetrics || healthMetrics.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No health metrics found for target date',
        processed: 0 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    }

    let processedUsers = 0;
    let generatedAdvices = 0;
    let errors: string[] = [];

    // Process each user
    for (const metrics of healthMetrics) {
      try {
        const adviceCount = await processUserLifeScoreAndAdvice(supabase, metrics, targetDate);
        generatedAdvices += adviceCount;
        processedUsers++;
      } catch (error) {
        console.error(`Error processing user ${metrics.user_id}:`, error);
        errors.push(`User ${metrics.user_id}: ${error.message}`);
      }
    }

    return new Response(JSON.stringify({
      message: `Daily rollup completed for ${targetDate}`,
      processed: processedUsers,
      total: healthMetrics.length,
      micro_advices_generated: generatedAdvices,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Daily rollup error:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

async function processUserLifeScoreAndAdvice(supabase: any, metrics: any, targetDate: string): Promise<number> {
  // 1. Process LifeScore as before (simplified)
  const lifeScore = await calculateAndSaveLifeScore(supabase, metrics, targetDate);
  
  // 2. Generate micro-advices
  const microAdvices = await generateMicroAdvices(supabase, metrics, lifeScore, targetDate);
  
  // 3. Save micro-advices
  const savedCount = await saveMicroAdvices(supabase, metrics.user_id, microAdvices);
  
  // 4. Update analytics
  await updateMicroAdviceAnalytics(supabase, metrics.user_id, targetDate);
  
  return savedCount;
}

async function calculateAndSaveLifeScore(supabase: any, metrics: any, targetDate: string) {
  // Simplified LifeScore calculation for this example
  // In production, use the full LifeScoreV2 algorithm
  
  const sleepScore = Math.min(metrics.sleep_hours / 8.0, 1.2) * 80 + ((metrics.sleep_quality - 1) / 4) * 20;
  const activityScore = Math.min(metrics.steps / 7000, 1.5) * 60 + Math.min((metrics.active_minutes || 0) / 30, 1.5) * 40;
  const mentalScore = ((metrics.mood - 1) / 4) * 40 + ((5 - metrics.stress) / 4) * 30 + (((metrics.energy || metrics.mood) - 1) / 4) * 30;
  
  const finalScore = Math.round((sleepScore * 0.35) + (activityScore * 0.30) + (mentalScore * 0.35));
  
  const lifeScore = {
    score: Math.max(0, Math.min(100, finalScore)),
    sleep_score: Math.max(0, Math.min(100, sleepScore)),
    activity_score: Math.max(0, Math.min(100, activityScore)),
    mental_score: Math.max(0, Math.min(100, mentalScore)),
    confidence_level: 0.8,
    anomaly_score: 0.1,
    flags: metrics.stress >= 4 ? { high_stress: true } : {}
  };

  // Save LifeScore
  await supabase
    .from('lifescores')
    .upsert({
      user_id: metrics.user_id,
      date: targetDate,
      ...lifeScore
    }, {
      onConflict: 'user_id,date'
    });

  return lifeScore;
}

async function generateMicroAdvices(supabase: any, metrics: any, lifeScore: any, targetDate: string): Promise<MicroAdvice[]> {
  // Get user context
  const context = await buildUserContext(supabase, metrics, targetDate);
  
  // Generate advices using templates
  const potentialAdvices: MicroAdvice[] = [];
  const now = new Date();
  
  for (const template of MICRO_ADVICE_TEMPLATES) {
    if (template.condition(context)) {
      // Calculate priority
      let priority = template.priority_base;
      
      // Boost for optimal timing
      if (template.optimal_hours.includes(now.getHours())) {
        priority += 2;
      }
      
      // Boost for critical situations
      if (context.anomaly_detected) {
        priority += 3;
      }
      
      // Select random template message
      const selectedTemplate = template.templates[Math.floor(Math.random() * template.templates.length)];
      
      // Personalize message
      let personalizedMessage = selectedTemplate.message.replace(/\$\{streak_days\}/g, context.streak_days.toString());
      
      potentialAdvices.push({
        message: personalizedMessage,
        action: selectedTemplate.action,
        duration_minutes: estimateDuration(selectedTemplate.action),
        priority: Math.max(1, Math.min(10, priority)),
        trigger_reason: `${template.category}: ${getContextReason(template.category, context)}`,
        tone: selectedTemplate.tone,
        timing_optimal: template.optimal_hours.includes(now.getHours()),
        suggestion_key: template.suggestion_key
      });
    }
  }
  
  // Sort by priority and return top 3
  return potentialAdvices
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.timing_optimal !== b.timing_optimal) return a.timing_optimal ? -1 : 1;
      return a.duration_minutes - b.duration_minutes;
    })
    .slice(0, 3);
}

async function buildUserContext(supabase: any, metrics: any, targetDate: string): Promise<MicroAdviceContext> {
  // Get recent scores for trend analysis
  const { data: recentScores } = await supabase
    .from('lifescores')
    .select('score, mental_score')
    .eq('user_id', metrics.user_id)
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
    .order('date', { ascending: true });

  // Get streak data
  const { data: streakData } = await supabase
    .from('health_metrics')
    .select('date')
    .eq('user_id', metrics.user_id)
    .order('date', { ascending: false })
    .limit(30);

  // Calculate streak
  const streak = calculateStreak(streakData || []);
  
  // Analyze trends
  const recentTrend = analyzeTrend(recentScores || []);
  const stressPattern = analyzeStressPattern(recentScores || []);
  
  // Get recent completions
  const { data: recentCompletions } = await supabase
    .from('micro_advices')
    .select('trigger_reason')
    .eq('user_id', metrics.user_id)
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const now = new Date();

  return {
    current_metrics: metrics,
    recent_trend: recentTrend,
    streak_days: streak,
    time_of_day: now.getHours(),
    day_of_week: now.getDay(),
    recent_completions: (recentCompletions || []).map(r => r.trigger_reason),
    stress_pattern: stressPattern,
    energy_level: determineEnergyLevel(metrics),
    anomaly_detected: false // simplified for now
  };
}

function calculateStreak(dates: any[]): number {
  if (!dates.length) return 0;
  
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  const sortedDates = dates.map(d => d.date).sort().reverse();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (sortedDates[i] === expectedDate || (i === 0 && sortedDates[i] === today)) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function analyzeTrend(scores: any[]): 'improving' | 'stable' | 'declining' {
  if (scores.length < 3) return 'stable';
  
  const recent = scores.slice(-3);
  const trend = recent[2].score - recent[0].score;
  
  if (trend > 5) return 'improving';
  if (trend < -5) return 'declining';
  return 'stable';
}

function analyzeStressPattern(scores: any[]): 'rising' | 'stable' | 'lowering' {
  if (scores.length < 2) return 'stable';
  
  const recent = scores.slice(-2);
  const stressTrend = recent[1].mental_score - recent[0].mental_score;
  
  if (stressTrend < -10) return 'rising';
  if (stressTrend > 10) return 'lowering';
  return 'stable';
}

function determineEnergyLevel(metrics: any): 'low' | 'medium' | 'high' {
  const energy = metrics.energy || metrics.mood;
  const activity = metrics.steps;
  
  if (energy <= 2 || activity < 2000) return 'low';
  if (energy >= 4 && activity > 5000) return 'high';
  return 'medium';
}

function estimateDuration(action: string): number {
  if (action.includes('2 minuti')) return 2;
  if (action.includes('5 minuti')) return 5;
  if (action.includes('10 minuti')) return 10;
  if (action.includes('camminata') || action.includes('stretching')) return 5;
  return 3;
}

function getContextReason(category: string, context: MicroAdviceContext): string {
  switch (category) {
    case 'stress_relief':
      return `Stress ${context.current_metrics.stress}/5`;
    case 'energy_boost':
      return `Energia bassa, ${context.current_metrics.steps} passi`;
    case 'sleep_prep':
      return `Sonno ${context.current_metrics.sleep_hours}h`;
    case 'celebration':
      return `Streak ${context.streak_days} giorni`;
    default:
      return 'Pattern analysis';
  }
}

async function saveMicroAdvices(supabase: any, userId: string, advices: MicroAdvice[]): Promise<number> {
  if (advices.length === 0) return 0;
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  
  const microAdvicesToSave = advices.map(advice => ({
    user_id: userId,
    message: advice.message,
    action: advice.action,
    duration_minutes: advice.duration_minutes,
    priority: advice.priority,
    trigger_reason: advice.trigger_reason,
    tone: advice.tone,
    timing_optimal: advice.timing_optimal,
    suggestion_key: advice.suggestion_key,
    expires_at: expiresAt.toISOString(),
    context_data: {
      generated_by: 'daily_rollup',
      generation_time: now.toISOString()
    }
  }));
  
  const { error } = await supabase
    .from('micro_advices')
    .insert(microAdvicesToSave);
  
  if (error) {
    console.error('Error saving micro advices:', error);
    return 0;
  }
  
  return advices.length;
}

async function updateMicroAdviceAnalytics(supabase: any, userId: string, date: string) {
  // Call the analytics update function
  const { error } = await supabase.rpc('update_micro_advice_analytics', {
    target_user_id: userId,
    target_date: date
  });
  
  if (error) {
    console.error('Error updating micro advice analytics:', error);
  }
}
