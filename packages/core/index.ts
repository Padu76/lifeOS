// Main entry point for LifeOS core business logic

// Export main classes
export { LifeScoreCalculator } from './scoring/lifeScore';
export { SuggestionEngine } from './advice/engine';

// Export suggestion recipes
export { breathing478, breathing5Count } from './advice/recipes/breathing-478';
export { meditation5min, bodyScan } from './advice/recipes/5min-meditation';
export { walk10min, stretchingBasic, powerNap } from './advice/recipes/10min-walk';

// Export all recipes as a collection for easy database seeding
export const ALL_SUGGESTIONS = [
  breathing478,
  breathing5Count,
  meditation5min,
  bodyScan,
  walk10min,
  stretchingBasic,
  powerNap
];

// Helper function to calculate LifeScore with suggestions
export async function processDaily(
  metrics: any, // HealthMetrics from types package
  historicalScores: any[] = [],
  userPreferences: any = {},
  recentSuggestions: any[] = []
) {
  // Calculate LifeScore
  const lifeScore = LifeScoreCalculator.calculateLifeScore(
    metrics,
    undefined, // use default weights
    historicalScores
  );

  // Generate suggestions based on score
  const suggestions = SuggestionEngine.generateSuggestions(
    lifeScore,
    userPreferences,
    recentSuggestions,
    ALL_SUGGESTIONS
  );

  return {
    lifeScore,
    suggestions
  };
}
