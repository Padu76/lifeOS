// =====================================================
// LifeOS Advanced A/B Testing Framework
// File: supabase/functions/_shared/ab-testing-framework.ts
// =====================================================

import { EmotionPrediction } from './emotion-detection-system';
import { GeneratedStory } from './storytelling-engine';

interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  start_date: Date;
  end_date?: Date;
  target_segments: string[];
  variants: Variant[];
  traffic_allocation: Record<string, number>; // variant_id -> percentage
  primary_metric: string;
  secondary_metrics: string[];
  statistical_significance: number; // 0-1
  minimum_sample_size: number;
  current_results: ExperimentResults;
}

interface Variant {
  id: string;
  name: string;
  description: string;
  is_control: boolean;
  template_modifications: TemplateModification[];
  tone_overrides: Record<string, string>;
  story_preferences: StoryPreference[];
  timing_adjustments: TimingAdjustment[];
  weight: number; // For traffic allocation
}

interface TemplateModification {
  template_id: string;
  field: string; // 'base_template' | 'variables' | 'tone_adaptations'
  modification_type: 'replace' | 'append' | 'modify';
  original_value: any;
  new_value: any;
}

interface StoryPreference {
  category: string;
  preferred_types: string[];
  avoid_types: string[];
  emphasis_factors: Record<string, number>;
}

interface TimingAdjustment {
  emotion_state: string;
  delay_modifier: number; // Multiply optimal timing by this
  frequency_modifier: number; // Multiply frequency by this
}

interface ExperimentResults {
  total_participants: number;
  variant_results: Record<string, VariantResults>;
  statistical_confidence: number;
  winning_variant: string | null;
  effect_size: number;
  last_updated: Date;
}

interface VariantResults {
  participants: number;
  metrics: Record<string, MetricResult>;
  conversion_rate: number;
  average_rating: number;
  completion_rate: number;
  engagement_score: number;
  retention_impact: number;
}

interface MetricResult {
  value: number;
  confidence_interval: [number, number];
  sample_size: number;
  significance: number;
}

interface UserAssignment {
  user_id: string;
  experiment_id: string;
  variant_id: string;
  assigned_date: Date;
  segment: string;
  completed_actions: string[];
  metrics_collected: Record<string, number>;
}

interface ABTestConfig {
  enable_auto_optimization: boolean;
  traffic_ramp_speed: number; // How fast to shift traffic to winner
  significance_threshold: number; // Statistical significance required
  minimum_runtime_days: number;
  maximum_runtime_days: number;
  auto_pause_underperforming: boolean;
  sample_size_calculator: 'fixed' | 'sequential' | 'adaptive';
}

export class AdvancedABTestingFramework {
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, UserAssignment[]> = new Map();
  private config: ABTestConfig;

  constructor(config?: Partial<ABTestConfig>) {
    this.config = {
      enable_auto_optimization: true,
      traffic_ramp_speed: 0.1, // 10% shift per day toward winner
      significance_threshold: 0.95,
      minimum_runtime_days: 7,
      maximum_runtime_days: 30,
      auto_pause_underperforming: true,
      sample_size_calculator: 'adaptive',
      ...config
    };
    
    this.initializeDefaultExperiments();
  }

  // Initialize common experiments
  private initializeDefaultExperiments(): void {
    // Tone Testing Experiment
    this.createExperiment({
      id: 'tone_effectiveness_2024',
      name: 'Empathetic Tone Effectiveness',
      description: 'Test effectiveness of different empathetic tones',
      target_segments: ['stressed_users', 'anxious_users'],
      variants: [
        {
          id: 'control_gentle',
          name: 'Gentle Tone (Control)',
          description: 'Current gentle tone approach',
          is_control: true,
          template_modifications: [],
          tone_overrides: {},
          story_preferences: [],
          timing_adjustments: [],
          weight: 0.4
        },
        {
          id: 'variant_encouraging',
          name: 'More Encouraging',
          description: 'Emphasis on empowerment and capability',
          is_control: false,
          template_modifications: [
            {
              template_id: 'stress_support_gentle',
              field: 'tone_adaptations',
              modification_type: 'modify',
              original_value: {},
              new_value: {
                gentle: "Sei più capace di quello che pensi. {suggestion} Prenditi questo momento.",
                encouraging: "Hai già superato momenti difficili! {suggestion} Questa volta non è diversa!"
              }
            }
          ],
          tone_overrides: {
            'stressed': 'encouraging',
            'anxious': 'encouraging'
          },
          story_preferences: [
            {
              category: 'stress_relief',
              preferred_types: ['success_story', 'peer_comparison'],
              avoid_types: ['scientific_fact'],
              emphasis_factors: { 'empowerment': 1.5, 'capability': 1.3 }
            }
          ],
          timing_adjustments: [],
          weight: 0.3
        },
        {
          id: 'variant_scientific',
          name: 'Science-Backed',
          description: 'Emphasis on scientific credibility',
          is_control: false,
          template_modifications: [
            {
              template_id: 'stress_support_gentle',
              field: 'variables',
              modification_type: 'append',
              original_value: {},
              new_value: {
                scientific_backing: [
                  "Ricerche mostrano che questa tecnica riduce cortisolo del 23%",
                  "Neuroscienze confermano l'efficacia di questo approccio",
                  "Studi clinici validano questo metodo"
                ]
              }
            }
          ],
          tone_overrides: {
            'stressed': 'formal',
            'anxious': 'formal'
          },
          story_preferences: [
            {
              category: 'stress_relief',
              preferred_types: ['scientific_fact', 'community_insight'],
              avoid_types: ['progress_narrative'],
              emphasis_factors: { 'credibility': 1.8, 'evidence': 1.6 }
            }
          ],
          timing_adjustments: [],
          weight: 0.3
        }
      ],
      primary_metric: 'completion_rate',
      secondary_metrics: ['user_rating', 'stress_reduction', 'retention_7d']
    });

    // Storytelling Effectiveness Experiment
    this.createExperiment({
      id: 'storytelling_impact_2024',
      name: 'Storytelling vs Direct Advice',
      description: 'Test impact of narrative elements vs direct suggestions',
      target_segments: ['all_users'],
      variants: [
        {
          id: 'control_direct',
          name: 'Direct Advice (Control)',
          description: 'Straightforward advice without stories',
          is_control: true,
          template_modifications: [],
          tone_overrides: {},
          story_preferences: [
            {
              category: 'all',
              preferred_types: [],
              avoid_types: ['success_story', 'peer_comparison', 'community_insight'],
              emphasis_factors: { 'directness': 2.0 }
            }
          ],
          timing_adjustments: [],
          weight: 0.5
        },
        {
          id: 'variant_storytelling',
          name: 'Story-Enhanced',
          description: 'Advice enhanced with relevant stories',
          is_control: false,
          template_modifications: [],
          tone_overrides: {},
          story_preferences: [
            {
              category: 'all',
              preferred_types: ['success_story', 'community_insight'],
              avoid_types: [],
              emphasis_factors: { 'narrative': 1.8, 'relatability': 1.5 }
            }
          ],
          timing_adjustments: [],
          weight: 0.5
        }
      ],
      primary_metric: 'engagement_score',
      secondary_metrics: ['completion_rate', 'sharing_frequency', 'behavior_change']
    });

    // Timing Optimization Experiment
    this.createExperiment({
      id: 'timing_optimization_2024',
      name: 'Intervention Timing Optimization',
      description: 'Test optimal timing for different emotional states',
      target_segments: ['energetic_users', 'tired_users'],
      variants: [
        {
          id: 'control_standard',
          name: 'Standard Timing (Control)',
          description: 'Current timing algorithm',
          is_control: true,
          template_modifications: [],
          tone_overrides: {},
          story_preferences: [],
          timing_adjustments: [],
          weight: 0.4
        },
        {
          id: 'variant_immediate',
          name: 'Immediate Response',
          description: 'Faster response to emotional states',
          is_control: false,
          template_modifications: [],
          tone_overrides: {},
          story_preferences: [],
          timing_adjustments: [
            {
              emotion_state: 'stressed',
              delay_modifier: 0.5, // 50% faster
              frequency_modifier: 1.0
            },
            {
              emotion_state: 'anxious',
              delay_modifier: 0.3, // 70% faster
              frequency_modifier: 1.0
            }
          ],
          weight: 0.3
        },
        {
          id: 'variant_delayed',
          name: 'Thoughtful Delay',
          description: 'Allow processing time before intervention',
          is_control: false,
          template_modifications: [],
          tone_overrides: {},
          story_preferences: [],
          timing_adjustments: [
            {
              emotion_state: 'stressed',
              delay_modifier: 1.5, // 50% slower
              frequency_modifier: 0.8
            },
            {
              emotion_state: 'energetic',
              delay_modifier: 0.8, // 20% faster when energetic
              frequency_modifier: 1.2
            }
          ],
          weight: 0.3
        }
      ],
      primary_metric: 'stress_reduction',
      secondary_metrics: ['completion_rate', 'user_satisfaction']
    });
  }

  // Create new experiment
  createExperiment(experimentData: Partial<Experiment>): string {
    const experiment: Experiment = {
      id: experimentData.id || this.generateExperimentId(),
      name: experimentData.name || 'Unnamed Experiment',
      description: experimentData.description || '',
      status: 'draft',
      start_date: new Date(),
      target_segments: experimentData.target_segments || ['all_users'],
      variants: experimentData.variants || [],
      traffic_allocation: this.calculateTrafficAllocation(experimentData.variants || []),
      primary_metric: experimentData.primary_metric || 'completion_rate',
      secondary_metrics: experimentData.secondary_metrics || [],
      statistical_significance: 0,
      minimum_sample_size: this.calculateMinimumSampleSize(experimentData.variants || []),
      current_results: this.initializeResults(experimentData.variants || [])
    };

    this.experiments.set(experiment.id, experiment);
    return experiment.id;
  }

  // Assign user to experiment variant
  assignUserToVariant(
    userId: string,
    experimentId: string,
    userSegment: string,
    emotionPrediction?: EmotionPrediction
  ): string | null {
    
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user is in target segment
    if (!experiment.target_segments.includes('all_users') && 
        !experiment.target_segments.includes(userSegment)) {
      return null;
    }

    // Check existing assignment
    const userAssignments = this.userAssignments.get(userId) || [];
    const existingAssignment = userAssignments.find(a => a.experiment_id === experimentId);
    if (existingAssignment) {
      return existingAssignment.variant_id;
    }

    // Assign to variant based on traffic allocation
    const variantId = this.selectVariantForUser(userId, experiment, emotionPrediction);
    
    const assignment: UserAssignment = {
      user_id: userId,
      experiment_id: experimentId,
      variant_id: variantId,
      assigned_date: new Date(),
      segment: userSegment,
      completed_actions: [],
      metrics_collected: {}
    };

    userAssignments.push(assignment);
    this.userAssignments.set(userId, userAssignments);

    return variantId;
  }

  // Get variant configuration for user
  getVariantConfig(userId: string, experimentId: string): Variant | null {
    const userAssignments = this.userAssignments.get(userId) || [];
    const assignment = userAssignments.find(a => a.experiment_id === experimentId);
    
    if (!assignment) return null;

    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    return experiment.variants.find(v => v.id === assignment.variant_id) || null;
  }

  // Apply experiment modifications to message generation
  applyExperimentModifications(
    userId: string,
    baseTemplate: any,
    context: any
  ): any {
    const userAssignments = this.userAssignments.get(userId) || [];
    let modifiedTemplate = { ...baseTemplate };
    let modifiedContext = { ...context };

    for (const assignment of userAssignments) {
      const experiment = this.experiments.get(assignment.experiment_id);
      if (!experiment || experiment.status !== 'running') continue;

      const variant = experiment.variants.find(v => v.id === assignment.variant_id);
      if (!variant || variant.is_control) continue;

      // Apply template modifications
      for (const mod of variant.template_modifications) {
        if (mod.template_id === baseTemplate.id) {
          modifiedTemplate = this.applyTemplateModification(modifiedTemplate, mod);
        }
      }

      // Apply tone overrides
      if (variant.tone_overrides[context.emotional_state]) {
        modifiedContext.preferred_tone = variant.tone_overrides[context.emotional_state];
      }

      // Apply timing adjustments
      for (const timing of variant.timing_adjustments) {
        if (timing.emotion_state === context.emotional_state) {
          if (context.optimal_intervention_window) {
            modifiedContext.optimal_intervention_window *= timing.delay_modifier;
          }
        }
      }
    }

    return { template: modifiedTemplate, context: modifiedContext };
  }

  // Record experiment metric
  recordMetric(
    userId: string,
    experimentId: string,
    metricName: string,
    value: number,
    additionalData?: Record<string, any>
  ): void {
    
    const userAssignments = this.userAssignments.get(userId) || [];
    const assignment = userAssignments.find(a => a.experiment_id === experimentId);
    
    if (!assignment) return;

    const experiment = this.experiments.get(experimentId);
    if (!experiment) return;

    // Update user assignment metrics
    assignment.metrics_collected[metricName] = value;

    // Update experiment results
    const variantResults = experiment.current_results.variant_results[assignment.variant_id];
    if (variantResults) {
      const metric = variantResults.metrics[metricName] || {
        value: 0,
        confidence_interval: [0, 0],
        sample_size: 0,
        significance: 0
      };

      // Update metric with new data point
      const newSampleSize = metric.sample_size + 1;
      const newValue = (metric.value * metric.sample_size + value) / newSampleSize;
      
      metric.value = newValue;
      metric.sample_size = newSampleSize;
      variantResults.metrics[metricName] = metric;

      // Update aggregate metrics
      this.updateAggregateMetrics(experiment, assignment.variant_id);
      
      // Check for statistical significance
      this.calculateStatisticalSignificance(experiment);
      
      // Auto-optimization if enabled
      if (this.config.enable_auto_optimization) {
        this.performAutoOptimization(experiment);
      }
    }

    experiment.current_results.last_updated = new Date();
  }

  // Get experiment results
  getExperimentResults(experimentId: string): ExperimentResults | null {
    const experiment = this.experiments.get(experimentId);
    return experiment ? experiment.current_results : null;
  }

  // Start experiment
  startExperiment(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'draft') {
      return false;
    }

    experiment.status = 'running';
    experiment.start_date = new Date();
    return true;
  }

  // Stop experiment
  stopExperiment(experimentId: string, reason?: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return false;
    }

    experiment.status = 'completed';
    experiment.end_date = new Date();
    
    // Determine winner
    this.determineWinner(experiment);
    
    return true;
  }

  // Private helper methods
  private generateExperimentId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTrafficAllocation(variants: Variant[]): Record<string, number> {
    const allocation: Record<string, number> = {};
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    
    variants.forEach(variant => {
      allocation[variant.id] = variant.weight / totalWeight;
    });
    
    return allocation;
  }

  private calculateMinimumSampleSize(variants: Variant[]): number {
    // Simplified sample size calculation
    // In production, this would use proper statistical methods
    const baseSize = 100; // Minimum per variant
    return baseSize * variants.length;
  }

  private initializeResults(variants: Variant[]): ExperimentResults {
    const variantResults: Record<string, VariantResults> = {};
    
    variants.forEach(variant => {
      variantResults[variant.id] = {
        participants: 0,
        metrics: {},
        conversion_rate: 0,
        average_rating: 0,
        completion_rate: 0,
        engagement_score: 0,
        retention_impact: 0
      };
    });

    return {
      total_participants: 0,
      variant_results: variantResults,
      statistical_confidence: 0,
      winning_variant: null,
      effect_size: 0,
      last_updated: new Date()
    };
  }

  private selectVariantForUser(
    userId: string,
    experiment: Experiment,
    emotionPrediction?: EmotionPrediction
  ): string {
    
    // Hash user ID for consistent assignment
    const hash = this.hashUserId(userId);
    let cumulativeWeight = 0;
    
    for (const variant of experiment.variants) {
      cumulativeWeight += experiment.traffic_allocation[variant.id];
      if (hash < cumulativeWeight) {
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return experiment.variants[0].id;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private applyTemplateModification(template: any, modification: TemplateModification): any {
    const modified = { ...template };
    
    switch (modification.modification_type) {
      case 'replace':
        modified[modification.field] = modification.new_value;
        break;
      case 'append':
        if (typeof modified[modification.field] === 'object') {
          modified[modification.field] = { ...modified[modification.field], ...modification.new_value };
        }
        break;
      case 'modify':
        if (modification.field === 'tone_adaptations') {
          modified.tone_adaptations = { ...modified.tone_adaptations, ...modification.new_value };
        }
        break;
    }
    
    return modified;
  }

  private updateAggregateMetrics(experiment: Experiment, variantId: string): void {
    const variantResults = experiment.current_results.variant_results[variantId];
    const metrics = variantResults.metrics;
    
    // Update aggregate scores
    if (metrics.completion_rate) {
      variantResults.completion_rate = metrics.completion_rate.value;
    }
    if (metrics.user_rating) {
      variantResults.average_rating = metrics.user_rating.value;
    }
    if (metrics.engagement_score) {
      variantResults.engagement_score = metrics.engagement_score.value;
    }
  }

  private calculateStatisticalSignificance(experiment: Experiment): void {
    // Simplified statistical significance calculation
    // In production, this would use proper statistical tests (t-test, chi-square, etc.)
    
    const variants = Object.values(experiment.current_results.variant_results);
    if (variants.length < 2) return;
    
    const controlVariant = variants.find(v => 
      experiment.variants.find(exp_v => exp_v.id === Object.keys(experiment.current_results.variant_results)[0])?.is_control
    );
    
    if (!controlVariant) return;
    
    let maxSignificance = 0;
    
    variants.forEach(variant => {
      if (variant === controlVariant) return;
      
      const sampleSize = variant.participants;
      if (sampleSize < 30) return; // Minimum sample size
      
      // Simple significance calculation based on sample size and effect size
      const effectSize = Math.abs(variant.conversion_rate - controlVariant.conversion_rate);
      const significance = Math.min(0.99, sampleSize / 100 * effectSize * 2);
      
      maxSignificance = Math.max(maxSignificance, significance);
    });
    
    experiment.current_results.statistical_confidence = maxSignificance;
  }

  private performAutoOptimization(experiment: Experiment): void {
    if (experiment.current_results.statistical_confidence < this.config.significance_threshold) {
      return;
    }

    const daysSinceStart = (Date.now() - experiment.start_date.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceStart < this.config.minimum_runtime_days) {
      return;
    }

    // Find best performing variant
    const variants = Object.entries(experiment.current_results.variant_results);
    const sortedVariants = variants.sort((a, b) => 
      b[1][experiment.primary_metric] - a[1][experiment.primary_metric]
    );

    const winnerVariantId = sortedVariants[0][0];
    
    // Gradually shift traffic to winner
    if (experiment.traffic_allocation[winnerVariantId] < 0.8) {
      const increment = this.config.traffic_ramp_speed;
      experiment.traffic_allocation[winnerVariantId] += increment;
      
      // Reduce traffic to other variants proportionally
      const otherVariants = Object.keys(experiment.traffic_allocation)
        .filter(id => id !== winnerVariantId);
      
      otherVariants.forEach(variantId => {
        experiment.traffic_allocation[variantId] *= (1 - increment / otherVariants.length);
      });
    }
  }

  private determineWinner(experiment: Experiment): void {
    const variants = Object.entries(experiment.current_results.variant_results);
    const sortedVariants = variants.sort((a, b) => 
      b[1][experiment.primary_metric] - a[1][experiment.primary_metric]
    );

    if (sortedVariants.length > 0) {
      experiment.current_results.winning_variant = sortedVariants[0][0];
      
      // Calculate effect size
      if (sortedVariants.length > 1) {
        const winner = sortedVariants[0][1];
        const second = sortedVariants[1][1];
        experiment.current_results.effect_size = 
          (winner[experiment.primary_metric] - second[experiment.primary_metric]) / 
          second[experiment.primary_metric];
      }
    }
  }

  // Public method to get active experiments for user
  getActiveExperimentsForUser(userId: string, userSegment: string): string[] {
    const activeExperiments: string[] = [];
    
    this.experiments.forEach((experiment, experimentId) => {
      if (experiment.status === 'running' && 
          (experiment.target_segments.includes('all_users') || 
           experiment.target_segments.includes(userSegment))) {
        activeExperiments.push(experimentId);
      }
    });
    
    return activeExperiments;
  }

  // Export experiment data
  exportExperimentData(experimentId: string): any {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    return {
      experiment: experiment,
      user_assignments: Array.from(this.userAssignments.values())
        .flat()
        .filter(assignment => assignment.experiment_id === experimentId)
    };
  }
}

// Export utility functions
export function initializeABTesting(config?: Partial<ABTestConfig>): AdvancedABTestingFramework {
  return new AdvancedABTestingFramework(config);
}

export function isUserInExperiment(
  framework: AdvancedABTestingFramework,
  userId: string,
  experimentId: string
): boolean {
  return framework.getVariantConfig(userId, experimentId) !== null;
}
