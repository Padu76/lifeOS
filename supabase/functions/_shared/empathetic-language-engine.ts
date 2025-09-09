// =====================================================
// LifeOS Advanced Empathetic Language Engine
// File: supabase/functions/_shared/empathetic-language-engine.ts
// =====================================================

interface UserContext {
  stress_level: number; // 1-10
  energy_level: number; // 1-10
  mood: string;
  recent_activities: string[];
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  day_of_week: string;
  current_streak: number;
  recent_completions: number;
  preferred_tone: 'warm' | 'direct' | 'encouraging' | 'playful';
  personality_profile: {
    openness: number; // 0-1
    conscientiousness: number; // 0-1
    motivation_style: 'intrinsic' | 'extrinsic' | 'mixed';
  };
}

interface EmotionalState {
  primary_emotion: 'stressed' | 'tired' | 'motivated' | 'overwhelmed' | 'content' | 'frustrated';
  intensity: number; // 0-1
  secondary_emotions: string[];
  emotional_trajectory: 'improving' | 'stable' | 'declining';
}

interface MessageTemplate {
  id: string;
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'motivation';
  subcategory: string;
  emotional_targets: string[];
  tone_variants: {
    warm: string[];
    direct: string[];
    encouraging: string[];
    playful: string[];
  };
  personalization_slots: string[];
  effectiveness_score: number;
  usage_count: number;
  context_conditions: {
    stress_range?: [number, number];
    energy_range?: [number, number];
    time_constraints?: string[];
    streak_requirements?: number;
  };
}

class EmpatheticLanguageEngine {
  private templates: Map<string, MessageTemplate[]> = new Map();
  private userHistories: Map<string, any[]> = new Map();
  private abTestingResults: Map<string, any> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  async generateMessage(
    category: string,
    userContext: UserContext,
    emotionalState: EmotionalState,
    additionalContext?: Record<string, any>
  ): Promise<{
    message: string;
    template_id: string;
    personalization_score: number;
    emotional_resonance_score: number;
    variant_used: string;
  }> {
    // 1. Detect emotional needs
    const emotionalNeeds = this.analyzeEmotionalNeeds(emotionalState, userContext);
    
    // 2. Select best template category
    const templates = this.selectRelevantTemplates(category, emotionalNeeds, userContext);
    
    // 3. Apply A/B testing logic
    const template = this.selectTemplateWithABTesting(templates, userContext.preferred_tone);
    
    // 4. Generate personalized variant
    const personalizedMessage = await this.personalizeTemplate(
      template,
      userContext,
      emotionalState,
      additionalContext
    );
    
    // 5. Add storytelling elements if appropriate
    const enhancedMessage = await this.addStorytellingElements(
      personalizedMessage,
      userContext,
      emotionalState
    );
    
    // 6. Calculate scores
    const scores = this.calculateResonanceScores(template, userContext, emotionalState);
    
    return {
      message: enhancedMessage.text,
      template_id: template.id,
      personalization_score: scores.personalization,
      emotional_resonance_score: scores.emotional_resonance,
      variant_used: enhancedMessage.variant_used
    };
  }

  private initializeTemplates(): void {
    // Stress Relief Templates
    this.templates.set('stress_relief', [
      {
        id: 'stress_001',
        category: 'stress_relief',
        subcategory: 'breathing',
        emotional_targets: ['stressed', 'overwhelmed', 'anxious'],
        tone_variants: {
          warm: [
            "Respira con me per un momento. So che oggi è pesante, ma sei più forte di quanto pensi.",
            "Il tuo corpo ha bisogno di una pausa dolce. Tre respiri profondi possono fare la differenza.",
            "Sento che lo stress ti sta parlando forte oggi. Lascia che il respiro sia la tua ancora."
          ],
          direct: [
            "Stress alto rilevato. Tecnica 4-7-8: inspira 4 secondi, trattieni 7, espira 8.",
            "Momento pausa necessario. Respirazione controllata per 2 minuti.",
            "Stop. Respira. 5 minuti di respirazione consapevole ora."
          ],
          encouraging: [
            "Hai superato giorni difficili prima, puoi farcela anche oggi! Iniziamo con il respiro.",
            "La tua resilienza è impressionante. Una pausa respiratoria ti darà la carica per continuare.",
            "Ogni respiro profondo è un atto di cura verso te stesso. Sei sulla strada giusta!"
          ],
          playful: [
            "Il tuo stress sta facendo troppo rumore! Zittiamolo con una respirazione ninja 🥷",
            "Tempo di spegnere l'allarme stress con la magia del respiro ✨",
            "Il tuo cervello ha bisogno di un reboot. Premiamo il tasto respiro! 💨"
          ]
        },
        personalization_slots: ['{time_context}', '{recent_activity}', '{stress_level_context}'],
        effectiveness_score: 0.85,
        usage_count: 0,
        context_conditions: {
          stress_range: [6, 10],
          time_constraints: ['any']
        }
      },
      {
        id: 'stress_002',
        category: 'stress_relief',
        subcategory: 'perspective',
        emotional_targets: ['overwhelmed', 'frustrated'],
        tone_variants: {
          warm: [
            "Questo momento difficile non definisce la tua giornata. Sei capace di più di quanto credi.",
            "Le sfide di oggi sono temporanee, la tua forza è permanente.",
            "Non sei solo in questo. Anche i momenti pesanti hanno una fine."
          ],
          direct: [
            "Situazione stressante identificata. Ricorda: è temporaneo, gestibile, superabile.",
            "Reframe necessario: questa sfida è un'opportunità di crescita.",
            "Perspective check: questo stress passerà. Tu resterai più forte."
          ],
          encouraging: [
            "Ogni sfida che superi ti rende più resiliente. Questa non sarà diversa!",
            "La tua capacità di gestire lo stress sta crescendo ogni giorno. Continua così!",
            "Hai gli strumenti per superare questo momento. Credici!"
          ],
          playful: [
            "Plot twist: questo stress è solo un personaggio secondario nella tua storia! 📖",
            "Livello difficoltà temporaneamente aumentato. Tu hai i cheat codes! 🎮",
            "Il tuo stress pensa di essere il protagonista, ma tu sei l'eroe! 🦸"
          ]
        },
        personalization_slots: ['{personal_strength}', '{past_success}', '{support_system}'],
        effectiveness_score: 0.78,
        usage_count: 0,
        context_conditions: {
          stress_range: [5, 8],
          time_constraints: ['any']
        }
      }
    ]);

    // Energy Boost Templates
    this.templates.set('energy_boost', [
      {
        id: 'energy_001',
        category: 'energy_boost',
        subcategory: 'movement',
        emotional_targets: ['tired', 'sluggish', 'unmotivated'],
        tone_variants: {
          warm: [
            "Il tuo corpo sussurra che ha bisogno di movimento. Anche 2 minuti possono risvegliare la tua energia.",
            "Sento che l'energia sta scendendo. Un piccolo movimento può accendere la scintilla.",
            "Il movimento è medicina per l'anima stanca. Concediti questo regalo."
          ],
          direct: [
            "Energia bassa rilevata. 5 jumping jacks o 1 minuto di camminata. Ora.",
            "Attivazione necessaria. Movimento per riattivare il sistema.",
            "Energy boost protocol: movimento immediato per 90 secondi."
          ],
          encouraging: [
            "Il tuo corpo ha una riserva di energia nascosta. Il movimento la sblocca!",
            "Ogni piccolo movimento è un investimento nella tua energia. Inizia ora!",
            "La tua motivazione tornerà con il primo passo. Fidati del processo!"
          ],
          playful: [
            "La tua energia sta facendo un pisolino! Svegliamola con un po' di movimento! 🏃‍♂️",
            "Modalità bradipo attivata. Tempo di switch a modalità ghepardo! 🐆",
            "Il tuo motore interno ha bisogno di una scossa. Facciamo vroom vroom! 🏎️"
          ]
        },
        personalization_slots: ['{energy_level}', '{preferred_movement}', '{time_available}'],
        effectiveness_score: 0.82,
        usage_count: 0,
        context_conditions: {
          energy_range: [1, 5],
          time_constraints: ['morning', 'afternoon']
        }
      }
    ]);

    // Celebration Templates
    this.templates.set('celebration', [
      {
        id: 'celebration_001',
        category: 'celebration',
        subcategory: 'achievement',
        emotional_targets: ['accomplished', 'proud', 'motivated'],
        tone_variants: {
          warm: [
            "Quello che hai appena fatto merita di essere celebrato. Sei sulla strada giusta.",
            "Il tuo impegno sta dando frutti. Ogni piccolo passo conta davvero.",
            "Questo momento di successo è il risultato della tua dedizione. Goditelo."
          ],
          direct: [
            "Obiettivo raggiunto. Progress confermato. Continua su questa traiettoria.",
            "Performance positiva registrata. Momentum mantenuto.",
            "Target completato. Sistema in funzione ottimale."
          ],
          encouraging: [
            "Incredibile! La tua costanza sta pagando. Continua così, stai costruendo qualcosa di grande!",
            "Questo successo è solo l'inizio. Hai dimostrato di cosa sei capace!",
            "La tua dedizione è ispirante. Ogni traguardo ti avvicina alla versione migliore di te!"
          ],
          playful: [
            "Achievement unlocked! 🎉 Il tuo avatar sta livellando up!",
            "Plot twist: sei diventato la versione più forte di te stesso! ⚡",
            "Nuovo record personale! La leaderboard della tua vita è aggiornata! 🏆"
          ]
        },
        personalization_slots: ['{specific_achievement}', '{effort_recognition}', '{future_potential}'],
        effectiveness_score: 0.91,
        usage_count: 0,
        context_conditions: {
          stress_range: [1, 6],
          energy_range: [4, 10]
        }
      }
    ]);

    // Sleep Preparation Templates
    this.templates.set('sleep_prep', [
      {
        id: 'sleep_001',
        category: 'sleep_prep',
        subcategory: 'wind_down',
        emotional_targets: ['tired', 'restless', 'wired'],
        tone_variants: {
          warm: [
            "Il tuo corpo e la tua mente hanno lavorato duramente oggi. È tempo di lasciare andare dolcemente.",
            "La giornata sta volgendo al termine. Concedi a te stesso il riposo che meriti.",
            "Ogni respiro ti porta più vicino a un sonno ristoratore. Lascia che la calma ti avvolga."
          ],
          direct: [
            "Sleep preparation protocol. Riduzione stimoli per 15 minuti. Respirazione 4-7-8.",
            "Wind-down sequence iniziata. Prepara il sistema per il riposo ottimale.",
            "Modalità sleep attivata. Shutdown progressivo delle attività stimolanti."
          ],
          encouraging: [
            "Il tuo impegno per un buon riposo è un investimento nella tua salute. Fai la scelta giusta!",
            "Ogni notte di qualità è un regalo per il tuo domani. Stai costruendo abitudini vincenti!",
            "Il tuo corpo sa come riposare bene. Fidati della sua saggezza naturale!"
          ],
          playful: [
            "Il tuo cervello sta facendo le pulizie di fine giornata! 🧹 Aiutalo a finire in pace.",
            "Modalità orso: tempo di andare in letargo e ricaricare le batterie! 🐻",
            "Il sandman sta arrivando! Prepara il red carpet per un sonno da VIP! ✨"
          ]
        },
        personalization_slots: ['{day_summary}', '{tomorrow_prep}', '{relaxation_preference}'],
        effectiveness_score: 0.87,
        usage_count: 0,
        context_conditions: {
          time_constraints: ['evening', 'night'],
          energy_range: [1, 7]
        }
      }
    ]);

    // Motivation Templates
    this.templates.set('motivation', [
      {
        id: 'motivation_001',
        category: 'motivation',
        subcategory: 'consistency',
        emotional_targets: ['unmotivated', 'discouraged', 'neutral'],
        tone_variants: {
          warm: [
            "Anche nei giorni in cui la motivazione sembra assente, il tuo impegno parla per te.",
            "Non devi sentirti perfetto per fare il passo successivo. Basta essere presente.",
            "La costanza batte la perfezione. Ogni piccolo gesto di cura verso te stesso conta."
          ],
          direct: [
            "Motivazione non richiesta. Disciplina sufficiente. Azione necessaria ora.",
            "Sistema operativo: agire indipendentemente dai sentimenti momentanei.",
            "Protocollo attivo: piccoli passi consistenti producono grandi risultati."
          ],
          encouraging: [
            "Non sottovalutare la forza della tua costanza! Stai costruendo la versione migliore di te!",
            "Ogni giorno che scegli il benessere è una vittoria. Stai vincendo più di quanto pensi!",
            "La tua determinazione è il tuo superpotere. Usalo anche oggi!"
          ],
          playful: [
            "Il tuo future self ti sta mandando un messaggio: 'Grazie per non arrenderti!' 💌",
            "Update del software Life: versione Più Forte installata con successo! 🔄",
            "Achievement in progress: 'Master of Small Steps' 👣 Continua così!"
          ]
        },
        personalization_slots: ['{current_challenge}', '{progress_recognition}', '{next_small_step}'],
        effectiveness_score: 0.79,
        usage_count: 0,
        context_conditions: {
          stress_range: [3, 7],
          energy_range: [2, 6]
        }
      }
    ]);
  }

  private analyzeEmotionalNeeds(
    emotionalState: EmotionalState,
    userContext: UserContext
  ): string[] {
    const needs: string[] = [];

    // Analyze primary emotion
    switch (emotionalState.primary_emotion) {
      case 'stressed':
        needs.push('calming', 'grounding', 'perspective');
        if (emotionalState.intensity > 0.7) needs.push('immediate_relief');
        break;
      case 'tired':
        needs.push('energizing', 'motivating');
        if (userContext.time_of_day === 'evening') needs.push('wind_down');
        break;
      case 'overwhelmed':
        needs.push('simplifying', 'prioritizing', 'breathing_space');
        break;
      case 'frustrated':
        needs.push('validation', 'perspective', 'problem_solving');
        break;
      case 'content':
        needs.push('celebrating', 'building_momentum');
        break;
      case 'motivated':
        needs.push('channeling_energy', 'goal_setting');
        break;
    }

    // Add context-based needs
    if (userContext.stress_level > 7) needs.push('urgent_stress_relief');
    if (userContext.energy_level < 4) needs.push('energy_boost');
    if (userContext.current_streak > 5) needs.push('streak_celebration');
    if (userContext.recent_completions === 0) needs.push('gentle_motivation');

    return [...new Set(needs)]; // Remove duplicates
  }

  private selectRelevantTemplates(
    category: string,
    emotionalNeeds: string[],
    userContext: UserContext
  ): MessageTemplate[] {
    const categoryTemplates = this.templates.get(category) || [];
    
    return categoryTemplates.filter(template => {
      // Check emotional relevance
      const emotionalMatch = template.emotional_targets.some(target =>
        emotionalNeeds.includes(target)
      );

      // Check context conditions
      let contextMatch = true;
      if (template.context_conditions.stress_range) {
        const [min, max] = template.context_conditions.stress_range;
        contextMatch = contextMatch && userContext.stress_level >= min && userContext.stress_level <= max;
      }
      if (template.context_conditions.energy_range) {
        const [min, max] = template.context_conditions.energy_range;
        contextMatch = contextMatch && userContext.energy_level >= min && userContext.energy_level <= max;
      }
      if (template.context_conditions.time_constraints) {
        contextMatch = contextMatch && (
          template.context_conditions.time_constraints.includes('any') ||
          template.context_conditions.time_constraints.includes(userContext.time_of_day)
        );
      }

      return emotionalMatch && contextMatch;
    }).sort((a, b) => b.effectiveness_score - a.effectiveness_score);
  }

  private selectTemplateWithABTesting(
    templates: MessageTemplate[],
    preferredTone: string
  ): MessageTemplate {
    if (templates.length === 0) {
      // Fallback to first available template
      const allTemplates = Array.from(this.templates.values()).flat();
      return allTemplates[0];
    }

    // A/B testing logic: 80% best performer, 20% exploration
    if (Math.random() < 0.8) {
      return templates[0]; // Best performer
    } else {
      // Exploration: select from top 3 or all if less than 3
      const explorationPool = templates.slice(0, Math.min(3, templates.length));
      return explorationPool[Math.floor(Math.random() * explorationPool.length)];
    }
  }

  private async personalizeTemplate(
    template: MessageTemplate,
    userContext: UserContext,
    emotionalState: EmotionalState,
    additionalContext?: Record<string, any>
  ): Promise<{ text: string; variant_used: string }> {
    const toneVariants = template.tone_variants[userContext.preferred_tone] || 
                        template.tone_variants.warm;
    
    // Select variant (can add more sophisticated logic here)
    const selectedVariant = toneVariants[Math.floor(Math.random() * toneVariants.length)];
    
    // Apply personalization
    let personalizedText = selectedVariant;
    
    // Replace personalization slots
    template.personalization_slots.forEach(slot => {
      const replacement = this.getPersonalizationValue(slot, userContext, emotionalState, additionalContext);
      personalizedText = personalizedText.replace(slot, replacement);
    });

    return {
      text: personalizedText,
      variant_used: `${userContext.preferred_tone}_variant_${toneVariants.indexOf(selectedVariant)}`
    };
  }

  private getPersonalizationValue(
    slot: string,
    userContext: UserContext,
    emotionalState: EmotionalState,
    additionalContext?: Record<string, any>
  ): string {
    switch (slot) {
      case '{time_context}':
        return this.getTimeContext(userContext.time_of_day);
      case '{stress_level_context}':
        return this.getStressContext(userContext.stress_level);
      case '{energy_level}':
        return this.getEnergyContext(userContext.energy_level);
      case '{recent_activity}':
        return userContext.recent_activities[0] || 'attività recente';
      case '{specific_achievement}':
        return additionalContext?.achievement || 'questo traguardo';
      case '{personal_strength}':
        return this.getPersonalStrength(userContext);
      case '{current_challenge}':
        return this.getCurrentChallenge(userContext, emotionalState);
      default:
        return slot; // Return as-is if no replacement found
    }
  }

  private getTimeContext(timeOfDay: string): string {
    const contexts = {
      morning: 'in questa mattina',
      afternoon: 'in questo pomeriggio',
      evening: 'in questa sera',
      night: 'in questo momento della notte'
    };
    return contexts[timeOfDay] || 'in questo momento';
  }

  private getStressContext(stressLevel: number): string {
    if (stressLevel >= 8) return 'questo stress intenso';
    if (stressLevel >= 6) return 'questa tensione';
    if (stressLevel >= 4) return 'questo momento di pressione';
    return 'questa situazione';
  }

  private getEnergyContext(energyLevel: number): string {
    if (energyLevel <= 3) return 'questa stanchezza';
    if (energyLevel <= 5) return 'questo momento di bassa energia';
    if (energyLevel <= 7) return 'questa energia moderata';
    return 'questa bella energia';
  }

  private getPersonalStrength(userContext: UserContext): string {
    if (userContext.current_streak > 7) return 'la tua incredibile costanza';
    if (userContext.personality_profile.conscientiousness > 0.7) return 'la tua disciplina';
    if (userContext.personality_profile.motivation_style === 'intrinsic') return 'la tua motivazione interiore';
    return 'la tua determinazione';
  }

  private getCurrentChallenge(userContext: UserContext, emotionalState: EmotionalState): string {
    if (emotionalState.primary_emotion === 'stressed') return 'gestire questo stress';
    if (emotionalState.primary_emotion === 'tired') return 'trovare energia';
    if (emotionalState.primary_emotion === 'overwhelmed') return 'organizzare le priorità';
    return 'superare questo momento';
  }

  private async addStorytellingElements(
    message: { text: string; variant_used: string },
    userContext: UserContext,
    emotionalState: EmotionalState
  ): Promise<{ text: string; variant_used: string }> {
    // Add storytelling only for certain conditions
    if (emotionalState.intensity > 0.6 && userContext.personality_profile.openness > 0.6) {
      const storyElement = await this.generateStoryElement(userContext, emotionalState);
      if (storyElement) {
        message.text += ` ${storyElement}`;
      }
    }

    return message;
  }

  private async generateStoryElement(
    userContext: UserContext,
    emotionalState: EmotionalState
  ): Promise<string | null> {
    // Similar users storytelling
    const stories = {
      stress_relief: [
        "Altri utenti con il tuo livello di determinazione hanno trovato che piccole pause fanno grandi differenze.",
        "La comunità LifeOS ha scoperto che i momenti di respiro creano spazio per soluzioni inaspettate."
      ],
      energy_boost: [
        "Utenti simili a te hanno notato che anche 2 minuti di movimento cambiano completamente la giornata.",
        "Chi ha il tuo profilo di attività ha scoperto che l'energia si alimenta con piccoli gesti."
      ],
      motivation: [
        "Persone con la tua costanza spesso dicono che i giorni difficili sono quelli che contano di più.",
        "Chi condivide il tuo percorso ha imparato che la crescita avviene anche nei momenti di resistenza."
      ]
    };

    const relevantStories = stories[emotionalState.primary_emotion === 'stressed' ? 'stress_relief' :
                                  emotionalState.primary_emotion === 'tired' ? 'energy_boost' : 'motivation'];
    
    return relevantStories[Math.floor(Math.random() * relevantStories.length)];
  }

  private calculateResonanceScores(
    template: MessageTemplate,
    userContext: UserContext,
    emotionalState: EmotionalState
  ): { personalization: number; emotional_resonance: number } {
    // Personalization score based on context match
    let personalizationScore = 0.5; // Base score
    
    // Tone preference match
    if (template.tone_variants[userContext.preferred_tone]) {
      personalizationScore += 0.2;
    }
    
    // Context conditions match
    if (template.context_conditions.stress_range) {
      const [min, max] = template.context_conditions.stress_range;
      if (userContext.stress_level >= min && userContext.stress_level <= max) {
        personalizationScore += 0.2;
      }
    }
    
    // Template usage history (avoid overuse)
    if (template.usage_count < 3) {
      personalizationScore += 0.1;
    }

    // Emotional resonance based on emotional target match
    let emotionalResonance = 0.5; // Base score
    
    if (template.emotional_targets.includes(emotionalState.primary_emotion)) {
      emotionalResonance += 0.3;
    }
    
    if (emotionalState.secondary_emotions.some(emotion => 
        template.emotional_targets.includes(emotion))) {
      emotionalResonance += 0.2;
    }

    return {
      personalization: Math.min(personalizationScore, 1),
      emotional_resonance: Math.min(emotionalResonance, 1)
    };
  }

  // Public methods for analytics and improvement
  async recordMessageEffectiveness(
    templateId: string,
    userId: string,
    effectiveness: number,
    userFeedback?: string
  ): Promise<void> {
    // Record for A/B testing and template optimization
    if (!this.abTestingResults.has(templateId)) {
      this.abTestingResults.set(templateId, []);
    }
    
    this.abTestingResults.get(templateId)!.push({
      userId,
      effectiveness,
      feedback: userFeedback,
      timestamp: new Date().toISOString()
    });

    // Update template effectiveness score
    this.updateTemplateEffectiveness(templateId, effectiveness);
  }

  private updateTemplateEffectiveness(templateId: string, newEffectiveness: number): void {
    // Find and update template across all categories
    for (const [category, templates] of this.templates.entries()) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        // Weighted average with existing score
        const weight = 0.1; // How much new data influences the score
        template.effectiveness_score = 
          (template.effectiveness_score * (1 - weight)) + (newEffectiveness * weight);
        template.usage_count++;
        break;
      }
    }
  }

  async getAnalytics(): Promise<{
    total_templates: number;
    top_performing_templates: Array<{ id: string; effectiveness: number }>;
    tone_preferences_distribution: Record<string, number>;
    category_usage: Record<string, number>;
  }> {
    const totalTemplates = Array.from(this.templates.values())
      .reduce((sum, templates) => sum + templates.length, 0);

    const allTemplates = Array.from(this.templates.values()).flat()
      .sort((a, b) => b.effectiveness_score - a.effectiveness_score);

    const topPerforming = allTemplates.slice(0, 10).map(t => ({
      id: t.id,
      effectiveness: t.effectiveness_score
    }));

    return {
      total_templates: totalTemplates,
      top_performing_templates: topPerforming,
      tone_preferences_distribution: {}, // Would be calculated from user data
      category_usage: {} // Would be calculated from usage data
    };
  }
}

export default EmpatheticLanguageEngine;
