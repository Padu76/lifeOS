export function validateLifeScore(lifeScore: any): boolean {
  if (!lifeScore || typeof lifeScore !== 'object') return false;
  
  const requiredFields = ['stress', 'energy', 'sleep', 'overall'];
  for (const field of requiredFields) {
    if (typeof lifeScore[field] !== 'number' || 
        lifeScore[field] < 1 || 
        lifeScore[field] > 10) {
      return false;
    }
  }
  
  return true;
}

export function validateHealthMetrics(metrics: any): boolean {
  if (!metrics || typeof metrics !== 'object') return false;
  
  if (!metrics.timestamp || !isValidDate(metrics.timestamp)) return false;
  
  // Optional numeric fields validation
  const numericFields = ['stress_level', 'energy_level', 'sleep_quality', 'heart_rate', 'steps'];
  for (const field of numericFields) {
    if (metrics[field] !== undefined && 
        (typeof metrics[field] !== 'number' || metrics[field] < 0)) {
      return false;
    }
  }
  
  return true;
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateUserInput(input: any, requiredFields: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input || typeof input !== 'object') {
    errors.push('Invalid input format');
    return { valid: false, errors };
  }
  
  for (const field of requiredFields) {
    if (!(field in input) || input[field] === null || input[field] === undefined) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
