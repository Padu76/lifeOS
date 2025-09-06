// =====================================================
// LifeOS Advanced Storytelling Engine
// File: supabase/functions/_shared/storytelling-engine.ts
// =====================================================

import { HealthMetrics, LifeScoreV2, UserProfile } from '../../types';
import { EmotionPrediction } from './emotion-detection-system';

interface StoryElement {
  id: string;
  category: 'success_story' | 'community_insight' | 'scientific_fact' | 'progress_narrative' | 'peer_comparison';
  template: string;
  variables: Record<string, any>;
  target_emotions: string[];
  effectiveness_score: number;
  personalization_factors: string[];
  usage_count: number;
}

interface UserSegment {
  age_range: string;
  stress_level: 'low' | 'medium' | 'high';
  energy_pattern: 'morning' | 'afternoon' | 'evening' | 'variable';
  primary_goals: string[];
  engagement_level: 'low' | 'medium' | 'high';
  experience_level: 'beginner' | 'intermediate' | 'advanced';
}

interface StoryMetrics {
  completion_rate: number;
  user_rating: number;
  sharing_frequency: number;
  behavior_change_correlation: number;
  emotional_impact_score: number;
}

interface GeneratedStory {
  content: string;
  story_type: string;
  personalization_score: number;
  credibility_score: number;
  emotional_appeal: number;
  data_points: string[];
  call_to_action: string;
  estimated_impact: number;
}

export class AdvancedStorytellingEngine {
  private storyElements: StoryElement[] = [
    // Success Stories
    {
      id: 'similar_user_success_stress',
      category: 'success_story',
      template: "{{similar_user_description}} come te aveva stress a {{stress_level}}/10. Dopo {{timeframe}} di micro-pause come questa, il suo stress è sceso a {{result_level}}/10. {{outcome_benefit}}",
      variables: {
        similar_user_description: [
          "Un utente della tua età",
          "Qualcuno con il tuo stesso lavoro",
          "Una persona con routine simile alla tua",
          "Un membro della community LifeOS"
        ],
        timeframe: [
          "2 settimane",
          "10 giorni",
          "una settimana",
          "pochi giorni"
        ],
        outcome_benefit: [
          "Ora dorme meglio e si sente più in controllo",
          "Ha notato miglioramenti anche nel lavoro",
          "Si sente più presente con famiglia e amici",
          "Ha più energia per le cose che ama"
        ]
      },
      target_emotions: ['stressed', 'anxious', 'overwhelmed'],
      effectiveness_score: 0.87,
      personalization_factors: ['age', 'stress_level', 'occupation'],
      usage_count: 0
    },

    {
      id: 'energy_boost_success',
      category: 'success_story',
      template: "{{user_type}} che si sentiva sempre stanco come te ha provato questo esercizio. Risultato? {{energy_improvement}} in {{timeframe}}. {{specific_benefit}}",
      variables: {
        user_type: [
          "Un genitore di 30-35 anni",
          "Un professionista",
          "Uno studente universitario",
          "Qualcuno che lavora da casa"
        ],
        energy_improvement: [
          "Energia aumentata del 40%",
          "Pomeriggi senza crash energetico",
          "Mattine più energiche",
          "Sensazione di vitalità ritrovata"
        ],
        specific_benefit: [
          "Ora riesce a fare tutto senza caffè extra",
          "I colleghi hanno notato il cambiamento",
          "Si allena regolarmente dopo il lavoro",
          "Ha ritrovato motivazione per i suoi hobby"
        ]
      },
      target_emotions: ['tired', 'low_energy'],
      effectiveness_score: 0.83,
      personalization_factors: ['age', 'energy_level', 'lifestyle'],
      usage_count: 0
    },

    // Community Insights
    {
      id: 'community_data_stress',
      category: 'community_insight',
      template: "Nella community LifeOS, {{percentage}}% degli utenti che praticano questa tecnica {{frequency}} riportano {{improvement}}. {{community_quote}}",
      variables: {
        percentage: ["89", "92", "85", "94"],
        frequency: [
          "3 volte a settimana",
          "quotidianamente",
          "nei momenti di stress",
          "durante le pause lavoro"
        ],
        improvement: [
          "riduzione significativa dell'ansia",
          "miglior gestione dello stress",
          "sonno più riparatore",
          "maggiore focus mentale"
        ],
        community_quote: [
          '"È diventato il mio superpotere anti-stress" - Marco, 28',
          '"Non pensavo funzionasse così bene" - Sara, 34',
          '"Ora lo consiglio a tutti" - Luca, 31',
          '"Ha cambiato le mie giornate" - Elena, 29'
        ]
      },
      target_emotions: ['stressed', 'anxious', 'skeptical'],
      effectiveness_score: 0.91,
      personalization_factors: ['community_engagement', 'skepticism_level'],
      usage_count: 0
    },

    {
      id: 'peer_comparison_energy',
      category: 'peer_comparison',
      template: "Utenti della tua età con pattern simili hanno energia media {{peer_energy}}/10. Tu sei a {{user_energy}}/10. {{comparison_insight}} {{actionable_tip}}",
      variables: {
        comparison_insight: [
          "Sei sulla buona strada!",
          "C'è margine di miglioramento,",
          "Stai andando meglio della media!",
          "Puoi raggiungere il loro livello"
        ],
        actionable_tip: [
          "Questo esercizio è quello che fa la differenza.",
          "I top performer fanno esattamente questo.",
          "È il segreto di chi ha energia stabile.",
          "Provalo per 3 giorni e vedrai il cambiamento."
        ]
      },
      target_emotions: ['competitive', 'motivated', 'curious'],
      effectiveness_score: 0.79,
      personalization_factors: ['competitive_nature', 'peer_group'],
      usage_count: 0
    },

    // Scientific Facts
    {
      id: 'science_breathing',
      category: 'scientific_fact',
      template: "Studi neuroscientifici mostrano che {{technique}} attiva il {{brain_system}} in {{timeframe}}. {{scientific_detail}} {{practical_application}}",
      variables: {
        technique: [
          "la respirazione controllata",
          "questo tipo di breathwork",
          "esercizi di respirazione profonda",
          "tecniche di respirazione lenta"
        ],
        brain_system: [
          "sistema nervoso parasimpatico",
          "nervo vago",
          "corteccia prefrontale",
          "sistema di rilassamento naturale"
        ],
        timeframe: [
          "30-60 secondi",
          "meno di un minuto",
          "pochi respiri",
          "immediatamente"
        ],
        scientific_detail: [
          "Riduce cortisolo del 23% in media.",
          "Aumenta variabilità cardiaca del 15%.",
          "Migliora ossigenazione cerebrale.",
          "Rilascia endorfine naturali."
        ],
        practical_application: [
          "Ecco perché ti senti subito meglio.",
          "Il tuo corpo sa già come guarire.",
          "È scienza applicata al benessere.",
          "Funziona a livello biologico."
        ]
      },
      target_emotions: ['curious', 'analytical', 'skeptical'],
      effectiveness_score: 0.85,
      personalization_factors: ['education_level', 'science_interest'],
      usage_count: 0
    },

    // Progress Narratives
    {
      id: 'progress_journey',
      category: 'progress_narrative',
      template: "{{timeframe_start}} eri a {{start_level}}/10. {{progress_acknowledgment}} {{current_position}} {{future_vision}}",
      variables: {
        timeframe_start: [
          "La settimana scorsa",
          "Alcuni giorni fa",
          "All'inizio del tuo percorso",
          "Quando hai iniziato"
        ],
        progress_acknowledgment: [
          "Ogni piccolo step conta.",
          "Stai costruendo un cambiamento duraturo.",
          "Il progresso non è sempre lineare, ma c'è.",
          "Ogni giorno aggiungi un mattoncino."
        ],
        current_position: [
          "Oggi è un'opportunità per andare avanti.",
          "Questo momento è perfetto per il prossimo step.",
          "Sei esattamente dove devi essere.",
          "Il tuo percorso continua ora."
        ],
        future_vision: [
          "Tra una settimana ti ringrazierai.",
          "Il te del futuro sarà grato.",
          "Stai investendo nel tuo benessere a lungo termine.",
          "Ogni azione di oggi forma l'abitudine di domani."
        ]
      },
      target_emotions: ['unmotivated', 'discouraged', 'plateau'],
      effectiveness_score: 0.88,
      personalization_factors: ['progress_tracking', 'goal_orientation'],
      usage_count: 0
    },

    // Seasonal/Contextual Stories
    {
      id: 'weather_connection',
      category: 'community_insight',
      template: "{{weather_acknowledgment}} {{weather_effect}} {{community_adaptation}} {{suggested_approach}}",
      variables: {
        weather_acknowledgment: [
          "Giornate come questa",
          "Con questo tempo",
          "In condizioni meteo simili",
          "Quando il cielo è così"
        ],
        weather_effect: [
          "influenzano il nostro umore più di quanto pensiamo.",
          "possono abbassare naturalmente i nostri livelli di energia.",
          "tendono a farci sentire più introspettivi.",
          "ci connettono di più con i nostri bisogni interiori."
        ],
        community_adaptation: [
          "La community LifeOS ha imparato a usare questi momenti",
          "Molti utenti trasformano giornate così",
          "È sorprendente come altri abbiano imparato",
          "Centinaia di persone hanno scoperto che giorni così"
        ],
        suggested_approach: [
          "per pratiche di mindfulness più profonde.",
          "in opportunità di riconnessione con se stessi.",
          "per rallentare e ascoltare davvero il corpo.",
          "possono essere i più trasformativi."
        ]
      },
      target_emotions: ['weather_affected', 'seasonal', 'contemplative'],
      effectiveness_score: 0.76,
      personalization_factors: ['weather_sensitivity', 'location'],
      usage_count: 0
    }
  ];

  private userSegments: Map<string, UserSegment> = new Map();
  private storyMetrics: Map<string, StoryMetrics> = new Map();

  // Main story generation method
  generateStory(
    userId: string,
    emotionPrediction: EmotionPrediction,
    lifeScore: LifeScoreV2,
    userProfile: UserProfile,
    contextualFactors?: any,
    adviceCategory?: string
  ): GeneratedStory {

    // 1. Determine user segment
    const userSegment = this.determineUserSegment(userId, lifeScore, userProfile);
    
    // 2. Select best story elements
    const relevantStories = this.filterRelevantStories(
      emotionPrediction,
      userSegment,
      adviceCategory
    );
    
    // 3. Personalize and generate
    const selectedStory = this.selectOptimalStory(relevantStories, userSegment);
    const personalizedContent = this.personalizeStory(
      selectedStory,
      userSegment,
      lifeScore,
      emotionPrediction,
      contextualFactors
    );
    
    // 4. Calculate impact scores
    const credibilityScore = this.calculateCredibilityScore(selectedStory, userSegment);
    const emotionalAppeal = this.calculateEmotionalAppeal(selectedStory, emotionPrediction);
    const estimatedImpact = this.estimateStoryImpact(selectedStory, userSegment, emotionPrediction);
    
    // 5. Generate call-to-action
    const callToAction = this.generateCallToAction(selectedStory, emotionPrediction);
    
    return {
      content: personalizedContent,
      story_type: selectedStory.category,
      personalization_score: this.calculatePersonalizationScore(selectedStory, userSegment),
      credibility_score: credibilityScore,
      emotional_appeal: emotionalAppeal,
      data_points: this.extractDataPoints(selectedStory),
      call_to_action: callToAction,
      estimated_impact: estimatedImpact
    };
  }

  // Determine user segment for personalization
  private determineUserSegment(
    userId: string,
    lifeScore: LifeScoreV2,
    userProfile: UserProfile
  ): UserSegment {
    
    // Check if we have cached segment
    const existingSegment = this.userSegments.get(userId);
    if (existingSegment) {
      return existingSegment;
    }
    
    // Calculate new segment
    const age = this.calculateAge(userProfile.date_of_birth);
    const ageRange = age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : '45+';
    
    const stressLevel = lifeScore.stress > 7 ? 'high' : lifeScore.stress > 4 ? 'medium' : 'low';
    
    const energyPattern = this.determineEnergyPattern(lifeScore);
    
    const segment: UserSegment = {
      age_range: ageRange,
      stress_level: stressLevel,
      energy_pattern: energyPattern,
      primary_goals: this.inferPrimaryGoals(lifeScore),
      engagement_level: this.calculateEngagementLevel(userProfile),
      experience_level: this.determineExperienceLevel(userProfile)
    };
    
    this.userSegments.set(userId, segment);
    return segment;
  }

  // Filter stories relevant to current context
  private filterRelevantStories(
    emotionPrediction: EmotionPrediction,
    userSegment: UserSegment,
    adviceCategory?: string
  ): StoryElement[] {
    
    return this.storyElements.filter(story => {
      // Check emotion relevance
      const emotionMatch = story.target_emotions.some(emotion => 
        emotion === emotionPrediction.primary_emotion ||
        emotion === emotionPrediction.secondary_emotion
      );
      
      // Check personalization factors
      const personalizationMatch = story.personalization_factors.some(factor => {
        switch (factor) {
          case 'age': return true; // We have age data
          case 'stress_level': return userSegment.stress_level !== 'low';
          case 'competitive_nature': return userSegment.engagement_level === 'high';
          case 'science_interest': return userSegment.experience_level === 'advanced';
          default: return true;
        }
      });
      
      return emotionMatch && personalizationMatch;
    });
  }

  // Select the optimal story based on effectiveness and context
  private selectOptimalStory(
    relevantStories: StoryElement[],
    userSegment: UserSegment
  ): StoryElement {
    
    if (relevantStories.length === 0) {
      return this.storyElements[0]; // Fallback
    }
    
    // Score each story
    const scoredStories = relevantStories.map(story => ({
      story,
      score: this.calculateStoryScore(story, userSegment)
    }));
    
    // Sort by score and add some randomization (80% best, 20% exploration)
    scoredStories.sort((a, b) => b.score - a.score);
    
    if (Math.random() < 0.8) {
      return scoredStories[0].story; // Best performing
    } else {
      // Exploration - pick from top 3
      const topStories = scoredStories.slice(0, 3);
      return topStories[Math.floor(Math.random() * topStories.length)].story;
    }
  }

  // Personalize story with real data and context
  private personalizeStory(
    story: StoryElement,
    userSegment: UserSegment,
    lifeScore: LifeScoreV2,
    emotionPrediction: EmotionPrediction,
    contextualFactors?: any
  ): string {
    
    let content = story.template;
    
    // Replace template variables
    Object.entries(story.variables).forEach(([key, options]) => {
      const placeholder = `{{${key}}}`;
      if (content.includes(placeholder)) {
        const selectedOption = this.selectPersonalizedOption(
          options,
          key,
          userSegment,
          lifeScore,
          emotionPrediction
        );
        content = content.replace(placeholder, selectedOption);
      }
    });
    
    // Replace data placeholders
    content = content.replace(/{{stress_level}}/g, lifeScore.stress.toString());
    content = content.replace(/{{user_energy}}/g, lifeScore.energy.toString());
    content = content.replace(/{{start_level}}/g, (lifeScore.overall - 1).toString());
    
    // Calculate peer energy (simulated)
    const peerEnergy = this.calculatePeerEnergy(userSegment);
    content = content.replace(/{{peer_energy}}/g, peerEnergy.toString());
    
    // Calculate result level (optimistic but realistic)
    const resultLevel = Math.min(lifeScore.stress - 2, 10);
    content = content.replace(/{{result_level}}/g, Math.max(resultLevel, 3).toString());
    
    return content;
  }

  // Select personalized option based on context
  private selectPersonalizedOption(
    options: any[],
    key: string,
    userSegment: UserSegment,
    lifeScore: LifeScoreV2,
    emotionPrediction: EmotionPrediction
  ): string {
    
    // Context-aware selection
    switch (key) {
      case 'similar_user_description':
        if (userSegment.age_range === '25-34') {
          return "Un giovane professionista";
        } else if (userSegment.age_range === '35-44') {
          return "Un genitore della tua età";
        }
        break;
        
      case 'user_type':
        if (userSegment.engagement_level === 'high') {
          return "Un utente attivo come te";
        }
        break;
        
      case 'percentage':
        // Higher percentages for high-engagement users
        if (userSegment.engagement_level === 'high') {
          return options.filter(p => parseInt(p) > 90)[0] || options[0];
        }
        break;
        
      case 'comparison_insight':
        if (lifeScore.energy > 6) {
          return "Stai andando meglio della media!";
        } else if (lifeScore.energy < 4) {
          return "C'è margine di miglioramento,";
        }
        break;
    }
    
    // Default random selection
    return options[Math.floor(Math.random() * options.length)];
  }

  // Calculate story effectiveness score
  private calculateStoryScore(
    story: StoryElement,
    userSegment: UserSegment
  ): number {
    
    let score = story.effectiveness_score;
    
    // Adjust based on user segment
    if (story.category === 'scientific_fact' && userSegment.experience_level === 'advanced') {
      score += 0.1;
    }
    
    if (story.category === 'success_story' && userSegment.engagement_level === 'low') {
      score += 0.15; // Success stories work well for low engagement
    }
    
    if (story.category === 'peer_comparison' && userSegment.engagement_level === 'high') {
      score += 0.1; // Competitive users like comparisons
    }
    
    // Avoid overused stories
    if (story.usage_count > 5) {
      score -= 0.05;
    }
    
    return Math.max(Math.min(score, 1), 0);
  }

  // Calculate credibility score
  private calculateCredibilityScore(
    story: StoryElement,
    userSegment: UserSegment
  ): number {
    
    let credibility = 0.7; // Base credibility
    
    switch (story.category) {
      case 'scientific_fact':
        credibility = 0.95;
        break;
      case 'community_insight':
        credibility = 0.85;
        break;
      case 'success_story':
        credibility = 0.75;
        break;
      case 'peer_comparison':
        credibility = 0.8;
        break;
      case 'progress_narrative':
        credibility = 0.9; // Personal data is highly credible
        break;
    }
    
    // Adjust based on user skepticism (inferred from experience level)
    if (userSegment.experience_level === 'advanced') {
      credibility *= 0.9; // More skeptical users
    }
    
    return credibility;
  }

  // Calculate emotional appeal
  private calculateEmotionalAppeal(
    story: StoryElement,
    emotionPrediction: EmotionPrediction
  ): number {
    
    let appeal = 0.6; // Base appeal
    
    // Higher appeal for matching emotions
    if (story.target_emotions.includes(emotionPrediction.primary_emotion)) {
      appeal += 0.2;
    }
    
    if (emotionPrediction.secondary_emotion && 
        story.target_emotions.includes(emotionPrediction.secondary_emotion)) {
      appeal += 0.1;
    }
    
    // Adjust based on emotion intensity
    appeal += (emotionPrediction.intensity / 10) * 0.2;
    
    return Math.min(appeal, 1);
  }

  // Generate contextual call-to-action
  private generateCallToAction(
    story: StoryElement,
    emotionPrediction: EmotionPrediction
  ): string {
    
    const callToActions = {
      'stressed': [
        "Prova ora, ci vogliono solo 30 secondi",
        "Il tuo sistema nervoso ti ringrazierà",
        "Un piccolo momento di calma ora"
      ],
      'anxious': [
        "Respira con me, un passo alla volta",
        "Questo momento è tuo, prendilo",
        "La calma è a un respiro di distanza"
      ],
      'tired': [
        "Ricaricati in 2 minuti",
        "Energia naturale incoming",
        "Il tuo corpo sa come recuperare"
      ],
      'energetic': [
        "Incanala questa energia positiva",
        "Perfetto momento per muoversi",
        "Cavalca quest'onda di vitalità"
      ]
    };
    
    const emotionCTAs = callToActions[emotionPrediction.primary_emotion] || [
      "Prova ora, vedrai la differenza",
      "Un piccolo step con grande impatto",
      "Il momento perfetto è adesso"
    ];
    
    return emotionCTAs[Math.floor(Math.random() * emotionCTAs.length)];
  }

  // Helper methods
  private calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private determineEnergyPattern(lifeScore: LifeScoreV2): UserSegment['energy_pattern'] {
    const hour = new Date().getHours();
    if (hour < 12 && lifeScore.energy > 6) return 'morning';
    if (hour >= 12 && hour < 17 && lifeScore.energy > 6) return 'afternoon';
    if (hour >= 17 && lifeScore.energy > 6) return 'evening';
    return 'variable';
  }

  private inferPrimaryGoals(lifeScore: LifeScoreV2): string[] {
    const goals = [];
    if (lifeScore.stress > 6) goals.push('stress_management');
    if (lifeScore.energy < 5) goals.push('energy_boost');
    if (lifeScore.sleep < 6) goals.push('better_sleep');
    if (lifeScore.overall < 6) goals.push('overall_wellness');
    return goals.length > 0 ? goals : ['general_improvement'];
  }

  private calculateEngagementLevel(userProfile: UserProfile): UserSegment['engagement_level'] {
    // This would be based on actual usage data
    // For now, using a simple heuristic
    return 'medium'; // Default
  }

  private determineExperienceLevel(userProfile: UserProfile): UserSegment['experience_level'] {
    // This would be based on user onboarding and usage patterns
    // For now, using a simple heuristic
    return 'intermediate'; // Default
  }

  private calculatePeerEnergy(userSegment: UserSegment): number {
    // Simulated peer data based on segment
    const baseEnergy = userSegment.stress_level === 'low' ? 7 : 
                      userSegment.stress_level === 'medium' ? 6 : 5;
    return baseEnergy + Math.floor(Math.random() * 2);
  }

  private calculatePersonalizationScore(
    story: StoryElement,
    userSegment: UserSegment
  ): number {
    let score = 0.5; // Base score
    
    // More personalization factors = higher score
    score += story.personalization_factors.length * 0.1;
    
    // Segment-specific bonuses
    if (userSegment.engagement_level === 'high') score += 0.1;
    if (userSegment.experience_level === 'advanced') score += 0.1;
    
    return Math.min(score, 1);
  }

  private extractDataPoints(story: StoryElement): string[] {
    const dataPoints = [];
    
    if (story.template.includes('{{percentage}}')) {
      dataPoints.push('community_statistics');
    }
    if (story.template.includes('{{peer_energy}}')) {
      dataPoints.push('peer_comparison_data');
    }
    if (story.category === 'scientific_fact') {
      dataPoints.push('scientific_research');
    }
    
    return dataPoints;
  }

  private estimateStoryImpact(
    story: StoryElement,
    userSegment: UserSegment,
    emotionPrediction: EmotionPrediction
  ): number {
    let impact = story.effectiveness_score;
    
    // Adjust based on emotion confidence
    impact *= emotionPrediction.confidence;
    
    // Adjust based on user segment
    if (userSegment.engagement_level === 'high') {
      impact *= 1.1;
    }
    
    return Math.min(impact, 1);
  }

  // Public method to record story effectiveness
  recordStoryEffectiveness(
    storyId: string,
    userId: string,
    userRating: number,
    behaviorChange: boolean,
    shared: boolean = false
  ): void {
    const story = this.storyElements.find(s => s.id === storyId);
    if (story) {
      story.usage_count += 1;
      
      // Update effectiveness score
      const newScore = (story.effectiveness_score * (story.usage_count - 1) + userRating) / story.usage_count;
      story.effectiveness_score = Math.max(Math.min(newScore, 1), 0);
      
      // Store detailed metrics
      const metrics: StoryMetrics = {
        completion_rate: userRating > 0.7 ? 1 : 0,
        user_rating: userRating,
        sharing_frequency: shared ? 1 : 0,
        behavior_change_correlation: behaviorChange ? 1 : 0,
        emotional_impact_score: userRating * (behaviorChange ? 1.2 : 1)
      };
      
      this.storyMetrics.set(`${storyId}_${userId}`, metrics);
    }
  }
}

// Export utility function for easy integration
export function generatePersonalizedStory(
  userId: string,
  emotionPrediction: EmotionPrediction,
  lifeScore: LifeScoreV2,
  userProfile: UserProfile,
  contextualFactors?: any,
  adviceCategory?: string
): GeneratedStory {
  const storyteller = new AdvancedStorytellingEngine();
  return storyteller.generateStory(
    userId,
    emotionPrediction,
    lifeScore,
    userProfile,
    contextualFactors,
    adviceCategory
  );
}
