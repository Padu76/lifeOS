// apps/web/lib/smart-notifications/messaging.ts
export interface MessageTemplate {
  id: string;
  category: 'stress_relief' | 'energy_boost' | 'sleep_prep' | 'celebration' | 'reminder';
  tone: 'gentle' | 'encouraging' | 'casual' | 'formal';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  template: string;
  variables: string[];
  effectiveness_score: number;
  usage_count: number;
}

export interface UserContext {
  current_mood?: 'stressed' | 'energetic' | 'tired' | 'neutral' | 'happy';
  life_score: number;
  recent_activities: string[];
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  day_of_week: string;
  streak_count: number;
  personal_goals: string[];
  preferred_tone: 'gentle' | 'encouraging' | 'casual' | 'formal';
}

export interface GeneratedMessage {
  title: string;
  body: string;
  action_text?: string;
  emoji?: string;
  personalization_score: number;
  template_id: string;
}

export class EmpatheticMessaging {
  private static messageTemplates: MessageTemplate[] = [
    // Stress Relief Templates
    {
      id: 'stress_gentle_1',
      category: 'stress_relief',
      tone: 'gentle',
      urgency: 'medium',
      template: 'Ho notato che potresti aver bisogno di un momento per te. Che ne dici di {suggestion}? Anche solo {duration} minuti possono fare la differenza.',
      variables: ['suggestion', 'duration'],
      effectiveness_score: 0.85,
      usage_count: 0
    },
    {
      id: 'stress_encouraging_1',
      category: 'stress_relief',
      tone: 'encouraging',
      urgency: 'medium',
      template: 'Hey, so che le giornate possono essere intense! Sei più forte di quanto pensi. Prova {suggestion} - ti aiuterà a ritrovare il tuo centro.',
      variables: ['suggestion'],
      effectiveness_score: 0.78,
      usage_count: 0
    },
    {
      id: 'stress_emergency_1',
      category: 'stress_relief',
      tone: 'gentle',
      urgency: 'emergency',
      template: 'Respira con me: inspira per 4, trattieni per 7, espira per 8. Ripeti 3 volte. Sei al sicuro, passerà.',
      variables: [],
      effectiveness_score: 0.92,
      usage_count: 0
    },

    // Energy Boost Templates
    {
      id: 'energy_casual_1',
      category: 'energy_boost',
      tone: 'casual',
      urgency: 'low',
      template: 'Energia un po\' giù? Nessun problema! {suggestion} ti darà la carica. Bastano davvero {duration} minuti ⚡',
      variables: ['suggestion', 'duration'],
      effectiveness_score: 0.82,
      usage_count: 0
    },
    {
      id: 'energy_encouraging_1',
      category: 'energy_boost',
      tone: 'encouraging',
      urgency: 'medium',
      template: 'È il momento perfetto per muoversi! Il tuo corpo ti ringrazierà. Prova {suggestion} e senti la differenza.',
      variables: ['suggestion'],
      effectiveness_score: 0.79,
      usage_count: 0
    },

    // Sleep Prep Templates
    {
      id: 'sleep_gentle_1',
      category: 'sleep_prep',
      tone: 'gentle',
      urgency: 'low',
      template: 'La giornata sta finendo, è tempo di prepararsi al riposo. {suggestion} ti aiuterà a rilassarti per una notte serena.',
      variables: ['suggestion'],
      effectiveness_score: 0.88,
      usage_count: 0
    },
    {
      id: 'sleep_formal_1',
      category: 'sleep_prep',
      tone: 'formal',
      urgency: 'low',
      template: 'Per ottimizzare la qualità del sonno, considera di dedicare {duration} minuti a {suggestion} prima di andare a letto.',
      variables: ['suggestion', 'duration'],
      effectiveness_score: 0.76,
      usage_count: 0
    },

    // Celebration Templates
    {
      id: 'celebration_encouraging_1',
      category: 'celebration',
      tone: 'encouraging',
      urgency: 'low',
      template: 'Fantastico! Hai completato {streak_count} giorni consecutivi! Ogni piccolo passo conta nel tuo percorso di benessere.',
      variables: ['streak_count'],
      effectiveness_score: 0.91,
      usage_count: 0
    },
    {
      id: 'celebration_casual_1',
      category: 'celebration',
      tone: 'casual',
      urgency: 'low',
      template: 'Wow! {achievement}! 🎉 Stai andando alla grande. Continue così!',
      variables: ['achievement'],
      effectiveness_score: 0.86,
      usage_count: 0
    },

    // Reminder Templates
    {
      id: 'reminder_gentle_1',
      category: 'reminder',
      tone: 'gentle',
      urgency: 'low',
      template: 'Promemoria dolce: hai un momento per {suggestion}? Il tuo benessere merita questa piccola pausa.',
      variables: ['suggestion'],
      effectiveness_score: 0.73,
      usage_count: 0
    }
  ];

  static generatePersonalizedMessage(
    category: string,
    userContext: UserContext,
    specificSuggestion?: string
  ): GeneratedMessage {
    // Filter templates by category and user preferences
    const candidateTemplates = this.messageTemplates.filter(template => 
      template.category === category &&
      (userContext.preferred_tone === template.tone || template.tone === 'gentle')
    );

    if (candidateTemplates.length === 0) {
      return this.getFallbackMessage(category, userContext);
    }

    // Select best template using adaptive algorithm
    const selectedTemplate = this.selectOptimalTemplate(candidateTemplates, userContext);
    
    // Generate personalized content
    const personalizedContent = this.personalizeTemplate(selectedTemplate, userContext, specificSuggestion);
    
    // Add contextual emoji
    const emoji = this.selectContextualEmoji(category, userContext);

    return {
      title: this.generateTitle(category, userContext),
      body: personalizedContent,
      action_text: this.generateActionText(category),
      emoji,
      personalization_score: this.calculatePersonalizationScore(selectedTemplate, userContext),
      template_id: selectedTemplate.id
    };
  }

  private static selectOptimalTemplate(templates: MessageTemplate[], userContext: UserContext): MessageTemplate {
    // Score templates based on context and effectiveness
    const scoredTemplates = templates.map(template => ({
      template,
      score: this.calculateTemplateScore(template, userContext)
    }));

    // Sort by score and add some randomness to avoid repetition
    scoredTemplates.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) < 0.1) {
        // If scores are close, add randomness
        return Math.random() - 0.5;
      }
      return scoreDiff;
    });

    return scoredTemplates[0].template;
  }

  private static calculateTemplateScore(template: MessageTemplate, userContext: UserContext): number {
    let score = template.effectiveness_score;

    // Reduce score for overused templates
    const usagePenalty = Math.min(template.usage_count * 0.05, 0.3);
    score -= usagePenalty;

    // Boost score for tone preference match
    if (template.tone === userContext.preferred_tone) {
      score += 0.15;
    }

    // Time-of-day context bonus
    if (this.isTimeAppropriateForTemplate(template, userContext.time_of_day)) {
      score += 0.1;
    }

    // Mood-template alignment
    if (this.isMoodAligned(template, userContext.current_mood)) {
      score += 0.12;
    }

    return Math.max(0, Math.min(1, score));
  }

  private static personalizeTemplate(
    template: MessageTemplate, 
    userContext: UserContext, 
    specificSuggestion?: string
  ): string {
    let content = template.template;

    // Replace variables with contextual content
    template.variables.forEach(variable => {
      const replacement = this.getVariableReplacement(variable, userContext, specificSuggestion);
      content = content.replace(`{${variable}}`, replacement);
    });

    // Add personal touches based on user context
    content = this.addPersonalTouches(content, userContext);

    return content;
  }

  private static getVariableReplacement(
    variable: string, 
    userContext: UserContext, 
    specificSuggestion?: string
  ): string {
    switch (variable) {
      case 'suggestion':
        return specificSuggestion || this.getContextualSuggestion(userContext);
      
      case 'duration':
        return this.getOptimalDuration(userContext);
      
      case 'streak_count':
        return userContext.streak_count.toString();
      
      case 'achievement':
        return this.getRecentAchievement(userContext);
      
      default:
        return variable;
    }
  }

  private static getContextualSuggestion(userContext: UserContext): string {
    const suggestions = {
      stressed: ['3 respiri profondi', 'una breve meditazione', 'ascoltare musica rilassante'],
      tired: ['una camminata veloce', '10 jumping jacks', 'bere un bicchiere d\'acqua'],
      energetic: ['stretching dinamico', 'una serie di squat', 'danza per 2 minuti'],
      neutral: ['qualche respiro consapevole', 'un momento di gratitudine', 'stretching dolce'],
      happy: ['condividere un sorriso', 'celebrare questo momento', 'apprezzare questo stato']
    };

    const moodSuggestions = suggestions[userContext.current_mood || 'neutral'];
    return moodSuggestions[Math.floor(Math.random() * moodSuggestions.length)];
  }

  private static getOptimalDuration(userContext: UserContext): string {
    // Adjust duration based on user context and time of day
    if (userContext.time_of_day === 'morning') {
      return Math.random() > 0.5 ? '5' : '3';
    } else if (userContext.time_of_day === 'evening') {
      return Math.random() > 0.5 ? '10' : '7';
    }
    return Math.random() > 0.5 ? '5' : '8';
  }

  private static getRecentAchievement(userContext: UserContext): string {
    const achievements = [
      'hai mantenuto la tua routine',
      'hai completato una nuova attività',
      'hai migliorato il tuo benessere',
      'hai fatto un passo avanti',
      'hai dimostrato costanza'
    ];

    return achievements[Math.floor(Math.random() * achievements.length)];
  }

  private static addPersonalTouches(content: string, userContext: UserContext): string {
    // Add encouragement based on life score
    if (userContext.life_score > 85 && Math.random() > 0.7) {
      content += ' Stai andando benissimo!';
    } else if (userContext.life_score < 60 && Math.random() > 0.8) {
      content += ' Ogni piccolo passo conta.';
    }

    // Add streak recognition
    if (userContext.streak_count > 7 && Math.random() > 0.6) {
      content += ` Che costanza, ${userContext.streak_count} giorni di seguito!`;
    }

    return content;
  }

  private static generateTitle(category: string, userContext: UserContext): string {
    const titles = {
      stress_relief: [
        'Momento di calma',
        'Respira e rilassati',
        'Pausa benessere',
        'Il tuo momento zen'
      ],
      energy_boost: [
        'Ricarica le energie!',
        'Momento energia!',
        'Attiva il corpo',
        'Sveglia l\'energia'
      ],
      sleep_prep: [
        'Prepariamoci al riposo',
        'Verso una notte serena',
        'Rilassamento serale',
        'Buonanotte imminente'
      ],
      celebration: [
        'Complimenti!',
        'Ben fatto!',
        'Fantastico progresso!',
        'Celebriamo insieme!'
      ],
      reminder: [
        'Promemoria gentile',
        'Non dimenticare',
        'Il tuo benessere',
        'Momento per te'
      ]
    };

    const categoryTitles = titles[category as keyof typeof titles] || titles.reminder;
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  private static generateActionText(category: string): string {
    const actions = {
      stress_relief: 'Respira ora',
      energy_boost: 'Attivati',
      sleep_prep: 'Rilassati',
      celebration: 'Continua così',
      reminder: 'Inizia ora'
    };

    return actions[category as keyof typeof actions] || 'Vai';
  }

  private static selectContextualEmoji(category: string, userContext: UserContext): string {
    const emojis = {
      stress_relief: ['🧘', '💙', '🌊', '🌱'],
      energy_boost: ['⚡', '🔥', '💪', '🌟'],
      sleep_prep: ['🌙', '😴', '✨', '💤'],
      celebration: ['🎉', '🏆', '👏', '🌟'],
      reminder: ['💜', '🔔', '✨', '🤗']
    };

    const categoryEmojis = emojis[category as keyof typeof emojis] || ['💜'];
    return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
  }

  private static isTimeAppropriateForTemplate(template: MessageTemplate, timeOfDay: string): boolean {
    // Some templates work better at certain times
    if (template.category === 'energy_boost' && timeOfDay === 'evening') {
      return false;
    }
    
    if (template.category === 'sleep_prep' && timeOfDay !== 'evening') {
      return false;
    }

    return true;
  }

  private static isMoodAligned(template: MessageTemplate, mood?: string): boolean {
    if (!mood) return true;

    const alignments = {
      stressed: ['stress_relief'],
      tired: ['energy_boost', 'sleep_prep'],
      energetic: ['energy_boost', 'celebration'],
      happy: ['celebration', 'energy_boost'],
      neutral: ['reminder', 'stress_relief']
    };

    return alignments[mood as keyof typeof alignments]?.includes(template.category) || false;
  }

  private static calculatePersonalizationScore(template: MessageTemplate, userContext: UserContext): number {
    let score = 0.5; // Base score

    // Template effectiveness
    score += template.effectiveness_score * 0.3;

    // Context alignment
    if (this.isMoodAligned(template, userContext.current_mood)) {
      score += 0.2;
    }

    // Time appropriateness
    if (this.isTimeAppropriateForTemplate(template, userContext.time_of_day)) {
      score += 0.15;
    }

    // Tone preference match
    if (template.tone === userContext.preferred_tone) {
      score += 0.15;
    }

    return Math.max(0, Math.min(1, score));
  }

  private static getFallbackMessage(category: string, userContext: UserContext): GeneratedMessage {
    return {
      title: 'LifeOS',
      body: 'È il momento perfetto per prenderti cura del tuo benessere. Cosa vorresti fare oggi?',
      action_text: 'Scopri',
      emoji: '💜',
      personalization_score: 0.3,
      template_id: 'fallback'
    };
  }

  // Adaptive learning - update template effectiveness based on user interaction
  static updateTemplateEffectiveness(templateId: string, wasSuccessful: boolean): void {
    const template = this.messageTemplates.find(t => t.id === templateId);
    if (template) {
      template.usage_count++;
      
      if (wasSuccessful) {
        template.effectiveness_score = Math.min(1.0, template.effectiveness_score + 0.02);
      } else {
        template.effectiveness_score = Math.max(0.1, template.effectiveness_score - 0.01);
      }
    }
  }
}