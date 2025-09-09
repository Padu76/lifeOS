import { HealthMetrics, LifeScoreV2, UserProfile } from '../../types';

// Types for micro-advice system
interface MicroAdviceContext {
  current_metrics: HealthMetrics;
  recent_trend: 'improving' | 'stable' | 'declining';
  streak_days: number;
  time_of_day: number; // 0-23
  day_of_week: number; // 0-6
  recent_completions: string[]; // recently completed suggestions
  stress_pattern: 'rising' | 'stable' | 'lowering';
  energy_level: 'low' | 'medium' | 'high';
  anomaly_detected: boolean;
}

interface MicroAdvice {
  id: string;
  message: string;
  action: string;
  duration_minutes: number;
  priority: number; // 1-10
  trigger_reason: string;
  tone: 'encouraging' | 'gentle' | 'celebratory' | 'supportive';
  timing_optimal: boolean;
  suggestion_key?: string; // link to full tutorial
}

interface MessageTemplate {
  id: string;
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'maintenance';
  condition: (context: MicroAdviceContext) => boolean;
  templates: {
    message: string;
    action: string;
    tone: 'encouraging' | 'gentle' | 'celebratory' | 'supportive';
  }[];
  priority_base: number;
  optimal_hours: number[]; // hours when this advice works best
}

export class MicroAdviceEngine {
  private messageTemplates: MessageTemplate[] = [
    // Stress relief templates
    {
      id: 'stress_relief_breathing',
      category: 'stress_relief',
      condition: (ctx) => ctx.current_metrics.stress >= 4 || ctx.stress_pattern === 'rising',
      templates: [
        {
          message: "Noto che oggi il tuo livello di stress è un po' alto. Se ti va, prova 2 minuti di respirazione lenta.",
          action: "Respira lentamente: 4 secondi inspira, 4 espira",
          tone: 'gentle'
        },
        {
          message: "Il tuo corpo potrebbe aver bisogno di una pausa. Che ne dici di qualche respiro profondo?",
          action: "Tecnica 4-7-8: inspira 4, trattieni 7, espira 8",
          tone: 'supportive'
        },
        {
          message: "Vedo tensione nei tuoi dati. Un momento per te stesso potrebbe aiutare.",
          action: "Chiudi gli occhi e fai 5 respiri consapevoli",
          tone: 'gentle'
        }
      ],
      priority_base: 8,
      optimal_hours: [9, 10, 11, 14, 15, 16, 17]
    },
    
    // Energy boost templates
    {
      id: 'energy_boost_movement',
      category: 'energy_boost',
      condition: (ctx) => ctx.energy_level === 'low' && ctx.current_metrics.steps < 2000,
      templates: [
        {
          message: "L'energia sembra un po' bassa oggi. Un piccolo movimento può risvegliare tutto!",
          action: "5 minuti di camminata o stretching leggero",
          tone: 'encouraging'
        },
        {
          message: "Il tuo corpo chiede movimento. Anche solo alzarsi e muoversi un po' può fare la differenza.",
          action: "Alzati e fai qualche passo per casa",
          tone: 'gentle'
        },
        {
          message: "Diversi utenti in situazioni simili hanno trovato utile una micro-pausa attiva.",
          action: "3 minuti di movimenti leggeri o stretching",
          tone: 'supportive'
        }
      ],
      priority_base: 6,
      optimal_hours: [8, 9, 10, 13, 14, 15, 16]
    },

    // Sleep preparation templates
    {
      id: 'sleep_prep_evening',
      category: 'sleep_prep',
      condition: (ctx) => ctx.current_metrics.sleep_hours < 7 && ctx.time_of_day >= 20,
      templates: [
        {
          message: "Vedo che ultimamente dormi poco. Che ne dici di preparare il terreno per una bella notte?",
          action: "10 minuti di routine serale rilassante",
          tone: 'gentle'
        },
        {
          message: "Il sonno è il tuo alleato per il recupero. Una piccola routine serale può aiutare.",
          action: "Respirazione lenta o meditazione breve",
          tone: 'supportive'
        },
        {
          message: "Il tuo corpo ha bisogno di riposo. Inizia a rallentare dolcemente.",
          action: "Spegni schermi e fai qualche minuto di relax",
          tone: 'gentle'
        }
      ],
      priority_base: 7,
      optimal_hours: [20, 21, 22]
    },

    // Celebration templates
    {
      id: 'celebration_streak',
      category: 'celebration',
      condition: (ctx) => ctx.streak_days >= 3 && ctx.recent_trend === 'improving',
      templates: [
        {
          message: `Fantastico! ${ctx.streak_days} giorni consecutivi di check-in. Stai costruendo una vera abitudine!`,
          action: "Continua così e concediti un momento di soddisfazione",
          tone: 'celebratory'
        },
        {
          message: `Bel segnale 🟢 La costanza sta pagando! ${ctx.streak_days} giorni di fila dimostrano la tua dedizione.`,
          action: "Oggi mantieni il ritmo con una piccola azione di benessere",
          tone: 'celebratory'
        },
        {
          message: `Grande lavoro! La tua costanza degli ultimi ${ctx.streak_days} giorni sta dando i suoi frutti.`,
          action: "Scegli una piccola attività che ti fa stare bene",
          tone: 'celebratory'
        }
      ],
      priority_base: 5,
      optimal_hours: [8, 9, 10, 18, 19]
    },

    // Maintenance templates (when everything is going well)
    {
      id: 'maintenance_good_state',
      category: 'maintenance',
      condition: (ctx) => ctx.current_metrics.mood >= 4 && ctx.current_metrics.stress <= 2 && ctx.energy_level === 'high',
      templates: [
        {
          message: "Oggi ti senti energico! È il momento perfetto per consolidare le buone abitudini.",
          action: "Una camminata veloce di 10 minuti per sfruttare l'energia",
          tone: 'encouraging'
        },
        {
          message: "Bel momento! Quando stai bene è utile 'investire' in te stesso per domani.",
          action: "5 minuti di meditazione o respirazione consapevole",
          tone: 'encouraging'
        },
        {
          message: "La tua energia è alta oggi. Piccoli passi portano a grandi risultati nel tempo.",
          action: "Scegli una micro-abitudine che vuoi rafforzare",
          tone: 'encouraging'
        }
      ],
      priority_base: 3,
      optimal_hours: [9, 10, 11, 15, 16, 17]
    },

    // Emergency intervention templates
    {
      id: 'emergency_intervention',
      category: 'stress_relief',
      condition: (ctx) => ctx.current_metrics.stress >= 5 && ctx.current_metrics.mood <= 2,
      templates: [
        {
          message: "Sembra una giornata difficile. Va bene non essere sempre al top. Un piccolo gesto di cura per te stesso?",
          action: "Anche solo 2 minuti di respiri lenti e un po' di gentilezza verso te stesso",
          tone: 'supportive'
        },
        {
          message: "I momenti difficili fanno parte del percorso. Se ti va, prova qualcosa di molto semplice e rassicurante.",
          action: "Bevi un bicchiere d'acqua lentamente e fai 3 respiri profondi",
          tone: 'gentle'
        },
        {
          message: "Oggi è una di quelle giornate. Non c'è pressione, solo un piccolo gesto di cura se ne hai voglia.",
          action: "Trova un posto comodo e stai con te stesso per qualche minuto",
          tone: 'supportive'
        }
      ],
      priority_base: 10,
      optimal_hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
    }
  ];

  /**
   * Genera micro-consigli personalizzati basati sul contesto attuale
   */
  generateMicroAdvice(
    context: MicroAdviceContext,
    userProfile: UserProfile,
    maxAdvices: number = 3
  ): MicroAdvice[] {
    const potentialAdvices: MicroAdvice[] = [];

    // Filtra template applicabili
    const applicableTemplates = this.messageTemplates.filter(template => 
      template.condition(context)
    );

    for (const template of applicableTemplates) {
      // Calcola priorità contestuale
      const priority = this.calculateContextualPriority(template, context, userProfile);
      
      // Verifica timing ottimale
      const timingOptimal = template.optimal_hours.includes(context.time_of_day);
      
      // Seleziona template message casuale per varietà
      const selectedTemplate = template.templates[
        Math.floor(Math.random() * template.templates.length)
      ];

      // Personalizza il messaggio
      const personalizedMessage = this.personalizeMessage(
        selectedTemplate.message, 
        context, 
        userProfile
      );

      potentialAdvices.push({
        id: `${template.id}_${Date.now()}`,
        message: personalizedMessage,
        action: selectedTemplate.action,
        duration_minutes: this.estimateDuration(selectedTemplate.action),
        priority,
        trigger_reason: this.explainTrigger(template, context),
        tone: selectedTemplate.tone,
        timing_optimal: timingOptimal,
        suggestion_key: this.mapToSuggestionKey(template.category)
      });
    }

    // Ordina per priorità e timing, filtra duplicati
    const filteredAdvices = this.filterAndRankAdvices(potentialAdvices, context);
    
    return filteredAdvices.slice(0, maxAdvices);
  }

  /**
   * Calcola priorità contestuale considerando vari fattori
   */
  private calculateContextualPriority(
    template: MessageTemplate, 
    context: MicroAdviceContext,
    userProfile: UserProfile
  ): number {
    let priority = template.priority_base;

    // Boost per timing ottimale
    if (template.optimal_hours.includes(context.time_of_day)) {
      priority += 2;
    }

    // Boost per situazioni critiche
    if (context.anomaly_detected) {
      priority += 3;
    }

    // Penalità per consigli ripetuti
    if (context.recent_completions.includes(template.id)) {
      priority -= 4;
    }

    // Boost per streak in corso
    if (context.streak_days >= 5 && template.category === 'celebration') {
      priority += 2;
    }

    // Adattamento per chronotype
    if (userProfile.chronotype === 'morning' && context.time_of_day <= 10) {
      priority += 1;
    } else if (userProfile.chronotype === 'evening' && context.time_of_day >= 18) {
      priority += 1;
    }

    // Penalità per weekend se stress-pattern indica riposo
    if (context.day_of_week === 0 || context.day_of_week === 6) {
      if (template.category === 'energy_boost') {
        priority -= 1;
      }
    }

    return Math.max(1, Math.min(10, priority));
  }

  /**
   * Personalizza il messaggio usando i dati del contesto
   */
  private personalizeMessage(
    baseMessage: string, 
    context: MicroAdviceContext,
    userProfile: UserProfile
  ): string {
    let message = baseMessage;

    // Sostituisci placeholder con dati reali
    message = message.replace(/\$\{streak_days\}/g, context.streak_days.toString());
    
    // Aggiungi contesto temporale
    if (context.time_of_day < 12) {
      message = message.replace(/oggi/g, 'questa mattina');
    } else if (context.time_of_day >= 18) {
      message = message.replace(/oggi/g, 'questa sera');
    }

    // Adatta il tono in base al pattern di stress
    if (context.stress_pattern === 'rising' && !message.includes('Va bene')) {
      message = "Va bene se oggi è più difficile. " + message;
    }

    return message;
  }

  /**
   * Stima la durata dell'azione suggerita
   */
  private estimateDuration(action: string): number {
    // Analisi basica del testo per stimare durata
    if (action.includes('2 minuti') || action.includes('5 respiri')) return 2;
    if (action.includes('5 minuti')) return 5;
    if (action.includes('10 minuti')) return 10;
    if (action.includes('camminata') || action.includes('stretching')) return 5;
    if (action.includes('meditazione') || action.includes('respirazione')) return 3;
    
    return 5; // default
  }

  /**
   * Spiega perché questo consiglio è stato generato
   */
  private explainTrigger(template: MessageTemplate, context: MicroAdviceContext): string {
    switch (template.category) {
      case 'stress_relief':
        return `Stress rilevato: ${context.current_metrics.stress}/5`;
      case 'energy_boost':
        return `Energia bassa e poca attività: ${context.current_metrics.steps} passi`;
      case 'sleep_prep':
        return `Sonno insufficiente recente: ${context.current_metrics.sleep_hours}h`;
      case 'celebration':
        return `Streak positivo: ${context.streak_days} giorni consecutivi`;
      case 'maintenance':
        return `Stato ottimale: mood ${context.current_metrics.mood}, stress ${context.current_metrics.stress}`;
      default:
        return 'Analisi pattern comportamentali';
    }
  }

  /**
   * Mappa categoria a suggestion_key per tutorial completi
   */
  private mapToSuggestionKey(category: string): string | undefined {
    switch (category) {
      case 'stress_relief': return 'breathing-478';
      case 'energy_boost': return 'walk-10min';
      case 'sleep_prep': return 'meditation-5min';
      default: return undefined;
    }
  }

  /**
   * Filtra consigli duplicati e li ordina per rilevanza
   */
  private filterAndRankAdvices(
    advices: MicroAdvice[], 
    context: MicroAdviceContext
  ): MicroAdvice[] {
    // Rimuovi duplicati per categoria
    const uniqueCategories = new Set<string>();
    const filtered = advices.filter(advice => {
      const category = advice.trigger_reason.split(':')[0];
      if (uniqueCategories.has(category)) {
        return false;
      }
      uniqueCategories.add(category);
      return true;
    });

    // Ordina per priorità, timing ottimale, poi durata breve
    return filtered.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.timing_optimal !== b.timing_optimal) return a.timing_optimal ? -1 : 1;
      return a.duration_minutes - b.duration_minutes;
    });
  }

  /**
   * Analizza il contesto attuale dall'utente per generare micro-consigli
   */
  static buildContext(
    currentMetrics: HealthMetrics,
    recentScores: LifeScoreV2[],
    streakDays: number,
    recentCompletions: string[] = []
  ): MicroAdviceContext {
    const now = new Date();
    
    // Analizza trend recente
    const recentTrend = this.analyzeTrend(recentScores);
    
    // Analizza pattern di stress
    const stressPattern = this.analyzeStressPattern(recentScores);
    
    // Determina livello di energia
    const energyLevel = this.determineEnergyLevel(currentMetrics, recentScores);
    
    // Detecta anomalie
    const anomalyDetected = recentScores[recentScores.length - 1]?.anomaly_score > 0.5;

    return {
      current_metrics: currentMetrics,
      recent_trend: recentTrend,
      streak_days: streakDays,
      time_of_day: now.getHours(),
      day_of_week: now.getDay(),
      recent_completions: recentCompletions,
      stress_pattern: stressPattern,
      energy_level: energyLevel,
      anomaly_detected: anomalyDetected
    };
  }

  private static analyzeTrend(recentScores: LifeScoreV2[]): 'improving' | 'stable' | 'declining' {
    if (recentScores.length < 3) return 'stable';
    
    const recent = recentScores.slice(-3);
    const trend = recent[2].score - recent[0].score;
    
    if (trend > 5) return 'improving';
    if (trend < -5) return 'declining';
    return 'stable';
  }

  private static analyzeStressPattern(recentScores: LifeScoreV2[]): 'rising' | 'stable' | 'lowering' {
    if (recentScores.length < 2) return 'stable';
    
    const recent = recentScores.slice(-2);
    const stressTrend = recent[1].mental_score - recent[0].mental_score;
    
    if (stressTrend < -10) return 'rising'; // mental score dropping = stress rising
    if (stressTrend > 10) return 'lowering';
    return 'stable';
  }

  private static determineEnergyLevel(
    currentMetrics: HealthMetrics, 
    recentScores: LifeScoreV2[]
  ): 'low' | 'medium' | 'high' {
    const energy = currentMetrics.energy || currentMetrics.mood;
    const activity = currentMetrics.steps;
    
    if (energy <= 2 || activity < 2000) return 'low';
    if (energy >= 4 && activity > 5000) return 'high';
    return 'medium';
  }
}
