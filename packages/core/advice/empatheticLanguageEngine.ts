import { HealthMetrics, LifeScore } from '../../types';
import { AdvancedLifeScore, UserProfile } from '../scoring/lifeScoreV2';

// Types for empathic language system
interface EmpatheticContext {
  emotional_state: 'stressed' | 'energetic' | 'tired' | 'balanced' | 'anxious' | 'motivated';
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  current_streak: number;
  recent_completion_rate: number;
  preferred_tone: 'formal' | 'casual' | 'encouraging' | 'gentle';
  personality_traits: string[];
  historical_effectiveness: Record<string, number>;
}

interface MessageTemplate {
  id: string;
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'motivation';
  base_template: string;
  variables: Record<string, string[]>;
  tone_adaptations: Record<string, string>;
  effectiveness_score: number;
  usage_count: number;
}

interface GeneratedMessage {
  content: string;
  tone: string;
  template_id: string;
  personalization_score: number;
  predicted_effectiveness: number;
  storytelling_element?: string;
}

export class EmpatheticLanguageEngine {
  private templates: MessageTemplate[] = [
    // Stress Relief Templates
    {
      id: 'stress_support_gentle',
      category: 'stress_relief',
      base_template: "{greeting}, {observation}. {suggestion} {encouragement}",
      variables: {
        greeting: [
          "Ehi",
          "Ciao",
          "Hey tu",
          "So che è stata una giornata intensa"
        ],
        observation: [
          "vedo che lo stress è un po' alto oggi",
          "sembra che tu abbia bisogno di una pausa",
          "noto che sei sotto pressione",
          "oggi sembra pesante"
        ],
        suggestion: [
          "Che ne dici di 3 respiri profondi?",
          "Una micro-pausa di 2 minuti potrebbe aiutare.",
          "Prova a fermarti un attimo e ascoltare il tuo corpo.",
          "Un momento di calma può fare la differenza."
        ],
        encouragement: [
          "Sei più forte di quanto pensi 💪",
          "Va bene non essere sempre al top",
          "Un passo alla volta, sempre",
          "Ricorda: anche i momenti difficili passano"
        ]
      },
      tone_adaptations: {
        gentle: "So che è dura. {suggestion} Non c'è fretta.",
        encouraging: "Hai affrontato di peggio! {suggestion} Ce la fai!",
        casual: "Ehi, {suggestion} Trust me, funziona!",
        formal: "Ho notato alcuni indicatori di stress. {suggestion}"
      },
      effectiveness_score: 0.85,
      usage_count: 0
    },
    
    // Energy Boost Templates
    {
      id: 'energy_motivation',
      category: 'energy_boost',
      base_template: "{energy_recognition} {movement_suggestion} {time_frame}",
      variables: {
        energy_recognition: [
          "Ottimo momento per muoversi!",
          "La tua energia sta salendo 📈",
          "Perfetto timing per attivarsi",
          "Sento che hai voglia di fare"
        ],
        movement_suggestion: [
          "5 jumping jacks ti daranno la carica",
          "Una camminata veloce di 3 minuti",
          "Qualche stretching energizzante",
          "Balla la tua canzone preferita"
        ],
        time_frame: [
          "Bastano davvero 2-3 minuti",
          "Veloce e efficace",
          "Il tuo corpo ti ringrazierà",
          "Small action, big impact"
        ]
      },
      tone_adaptations: {
        encouraging: "Sei in modalità FIRE! {movement_suggestion}",
        casual: "Dai dai dai! {movement_suggestion}",
        gentle: "Se ti va, {movement_suggestion}",
        formal: "I dati suggeriscono che {movement_suggestion}"
      },
      effectiveness_score: 0.78,
      usage_count: 0
    },

    // Sleep Preparation Templates
    {
      id: 'sleep_wind_down',
      category: 'sleep_prep',
      base_template: "{evening_recognition} {wind_down_activity} {sleep_benefit}",
      variables: {
        evening_recognition: [
          "La giornata volge al termine",
          "È ora di rallentare il ritmo",
          "Il tuo corpo ha bisogno di riposare",
          "Tempo di prepare per un sonno ristoratore"
        ],
        wind_down_activity: [
          "La respirazione 4-7-8 è perfetta ora",
          "5 minuti di stretching dolce",
          "Un po' di journaling per svuotare la mente",
          "Meditation guidata breve"
        ],
        sleep_benefit: [
          "Ti aiuterà a dormire meglio",
          "Il sonno di qualità è il miglior investimento",
          "Domani ti sveglierai più riposato",
          "La mente ha bisogno di questo reset"
        ]
      },
      tone_adaptations: {
        gentle: "Dolcemente, {wind_down_activity}. {sleep_benefit}.",
        encouraging: "Ottima scelta! {wind_down_activity}",
        casual: "Chill time! {wind_down_activity}",
        formal: "Per ottimizzare il recupero notturno, {wind_down_activity}"
      },
      effectiveness_score: 0.82,
      usage_count: 0
    },

    // Celebration Templates
    {
      id: 'streak_celebration',
      category: 'celebration',
      base_template: "{celebration} {achievement_recognition} {forward_momentum}",
      variables: {
        celebration: [
          "Wow! 🎉",
          "Fantastico! ⭐",
          "Grande lavoro! 👏",
          "Sei on fire! 🔥"
        ],
        achievement_recognition: [
          "{{streak_days}} giorni di fila è impressionante",
          "La costanza sta pagando",
          "Stai costruendo abitudini solide",
          "I progressi sono evidenti"
        ],
        forward_momentum: [
          "Mantieni questo ritmo!",
          "Un altro piccolo step oggi?",
          "Il momentum è dalla tua parte",
          "Ogni giorno diventa più facile"
        ]
      },
      tone_adaptations: {
        encouraging: "BESTIALE! {{streak_days}} giorni! Keep going!",
        casual: "Boom! {{streak_days}} giorni straight! 💪",
        gentle: "Che bello vedere i tuoi progressi. {{streak_days}} giorni...",
        formal: "Eccellente consistenza: {{streak_days}} giorni consecutivi"
      },
      effectiveness_score: 0.91,
      usage_count: 0
    }
  ];

  private storytellingElements = [
    "Molti utenti in situazioni simili hanno trovato questo utile",
    "Altri che erano nella tua stessa situazione dicono che questo ha fatto la differenza",
    "La community LifeOS adora questo micro-momento",
    "Statisticamente, chi fa questo step ha il 73% di probabilità in più di sentirsi meglio",
    "Fun fact: piccole azioni come questa attivano circuiti neurali positivi",
    "Pro tip dalla community: questo funziona meglio se fatto con intenzione"
  ];

  generateMessage(
    context: EmpatheticContext,
    category: MessageTemplate['category'],
    userProfile?: UserProfile
  ): GeneratedMessage {
    // Filter templates by category and effectiveness
    const relevantTemplates = this.templates
      .filter(t => t.category === category)
      .sort((a, b) => b.effectiveness_score - a.effectiveness_score);

    const selectedTemplate = relevantTemplates[0];
    
    if (!selectedTemplate) {
      throw new Error(`No template found for category: ${category}`);
    }

    // Generate personalized content
    const personalizedContent = this.personalizeTemplate(selectedTemplate, context, userProfile);
    
    // Add storytelling element (30% chance)
    const storytellingElement = Math.random() < 0.3 ? 
      this.getRandomElement(this.storytellingElements) : undefined;

    // Calculate predicted effectiveness
    const predictedEffectiveness = this.calculatePredictedEffectiveness(
      selectedTemplate,
      context,
      userProfile
    );

    return {
      content: personalizedContent,
      tone: context.preferred_tone,
      template_id: selectedTemplate.id,
      personalization_score: this.calculatePersonalizationScore(context),
      predicted_effectiveness: predictedEffectiveness,
      storytelling_element: storytellingElement
    };
  }

  private personalizeTemplate(
    template: MessageTemplate,
    context: EmpatheticContext,
    userProfile?: UserProfile
  ): string {
    let content = template.base_template;

    // Apply tone adaptation
    if (template.tone_adaptations[context.preferred_tone]) {
      content = template.tone_adaptations[context.preferred_tone];
    }

    // Replace template variables
    Object.entries(template.variables).forEach(([key, options]) => {
      const placeholder = `{${key}}`;
      if (content.includes(placeholder)) {
        const selectedOption = this.selectBestOption(options, context, userProfile);
        content = content.replace(placeholder, selectedOption);
      }
    });

    // Handle special variables like streak_days
    content = content.replace(/\{\{streak_days\}\}/g, context.current_streak.toString());

    // Apply emotional state adaptations
    content = this.adaptForEmotionalState(content, context.emotional_state);

    return content.trim();
  }

  private selectBestOption(
    options: string[],
    context: EmpatheticContext,
    userProfile?: UserProfile
  ): string {
    // Simple selection based on context
    // In a real implementation, this would use ML models
    
    if (context.emotional_state === 'stressed' || context.emotional_state === 'anxious') {
      // Prefer gentler, more supportive options
      const gentleOptions = options.filter(opt => 
        opt.includes('gentle') || opt.includes('calma') || opt.includes('respir')
      );
      if (gentleOptions.length > 0) {
        return this.getRandomElement(gentleOptions);
      }
    }

    if (context.emotional_state === 'energetic' || context.emotional_state === 'motivated') {
      // Prefer more energetic options
      const energeticOptions = options.filter(opt => 
        opt.includes('!') || opt.includes('energia') || opt.includes('movimento')
      );
      if (energeticOptions.length > 0) {
        return this.getRandomElement(energeticOptions);
      }
    }

    // Default to random selection
    return this.getRandomElement(options);
  }

  private adaptForEmotionalState(content: string, emotionalState: string): string {
    switch (emotionalState) {
      case 'stressed':
      case 'anxious':
        // Add calming language
        if (!content.includes('💙') && !content.includes('🌸')) {
          content += ' 💙';
        }
        break;
      case 'energetic':
      case 'motivated':
        // Add energetic emojis
        if (!content.includes('⚡') && !content.includes('🔥')) {
          content += ' ⚡';
        }
        break;
      case 'tired':
        // Add gentle support
        if (!content.includes('🌙') && !content.includes('😌')) {
          content += ' 🌙';
        }
        break;
    }
    return content;
  }

  private calculatePredictedEffectiveness(
    template: MessageTemplate,
    context: EmpatheticContext,
    userProfile?: UserProfile
  ): number {
    let baseScore = template.effectiveness_score;
    
    // Adjust based on historical effectiveness for this user
    if (context.historical_effectiveness[template.id]) {
      baseScore = (baseScore + context.historical_effectiveness[template.id]) / 2;
    }

    // Adjust based on completion rate
    if (context.recent_completion_rate > 0.8) {
      baseScore += 0.1; // User is highly engaged
    } else if (context.recent_completion_rate < 0.3) {
      baseScore -= 0.1; // User needs more motivation
    }

    // Time of day adjustment
    if (template.category === 'energy_boost' && context.time_of_day === 'morning') {
      baseScore += 0.15;
    }
    if (template.category === 'sleep_prep' && context.time_of_day === 'evening') {
      baseScore += 0.15;
    }

    return Math.min(Math.max(baseScore, 0), 1);
  }

  private calculatePersonalizationScore(context: EmpatheticContext): number {
    let score = 0.5; // Base score

    // Historical data availability
    if (Object.keys(context.historical_effectiveness).length > 0) {
      score += 0.2;
    }

    // Streak consideration
    if (context.current_streak > 7) {
      score += 0.15;
    }

    // Completion rate
    if (context.recent_completion_rate > 0.7) {
      score += 0.15;
    }

    return Math.min(score, 1);
  }

  private getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // A/B Testing methods
  recordMessageEffectiveness(
    templateId: string,
    userId: string,
    completed: boolean,
    userRating?: number
  ): void {
    // Find and update template effectiveness
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      template.usage_count += 1;
      
      // Simple effectiveness calculation
      // In production, this would be more sophisticated
      if (completed) {
        const newScore = (template.effectiveness_score * (template.usage_count - 1) + 
                         (userRating || 0.8)) / template.usage_count;
        template.effectiveness_score = newScore;
      }
    }
  }

  // Method to analyze emotional state from LifeScore data
  analyzeEmotionalState(
    lifeScore: AdvancedLifeScore,
    metrics: HealthMetrics
  ): EmpatheticContext['emotional_state'] {
    const { stress, energy, sleep, overall } = lifeScore;

    if (stress > 7 || overall < 4) return 'stressed';
    if (stress > 6 && sleep < 5) return 'anxious';
    if (energy > 7 && overall > 6) return 'energetic';
    if (energy > 6 && stress < 4) return 'motivated';
    if (energy < 4 || sleep < 4) return 'tired';
    
    return 'balanced';
  }

  // Method to determine optimal tone based on user patterns
  determineOptimalTone(
    userProfile: UserProfile,
    emotionalState: EmpatheticContext['emotional_state'],
    timeOfDay: EmpatheticContext['time_of_day']
  ): EmpatheticContext['preferred_tone'] {
    // This would typically use ML models or user preferences
    // Simple heuristic for now
    
    if (emotionalState === 'stressed' || emotionalState === 'anxious') {
      return 'gentle';
    }
    
    if (emotionalState === 'energetic' || emotionalState === 'motivated') {
      return 'encouraging';
    }
    
    if (timeOfDay === 'evening' || timeOfDay === 'night') {
      return 'gentle';
    }
    
    return 'casual'; // Default
  }
}

// Export utility function for easy integration
export function generateEmpatheticMessage(
  category: MessageTemplate['category'],
  lifeScore: AdvancedLifeScore,
  metrics: HealthMetrics,
  userProfile: UserProfile,
  streakDays: number = 0,
  completionRate: number = 0.5
): GeneratedMessage {
  const engine = new EmpatheticLanguageEngine();
  
  const emotionalState = engine.analyzeEmotionalState(lifeScore, metrics);
  const timeOfDay = determineTimeOfDay();
  const preferredTone = engine.determineOptimalTone(userProfile, emotionalState, timeOfDay);
  
  const context: EmpatheticContext = {
    emotional_state: emotionalState,
    time_of_day: timeOfDay,
    current_streak: streakDays,
    recent_completion_rate: completionRate,
    preferred_tone: preferredTone,
    personality_traits: [], // Would be populated from user profile
    historical_effectiveness: {} // Would be loaded from database
  };
  
  return engine.generateMessage(context, category, userProfile);
}

function determineTimeOfDay(): EmpatheticContext['time_of_day'] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}
