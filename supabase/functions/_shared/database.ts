export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

export function buildUpdateObject(updates: Record<string, any>): Record<string, any> {
  const updateObj = { ...updates };
  updateObj.updated_at = new Date().toISOString();
  
  // Remove null and undefined values
  Object.keys(updateObj).forEach(key => {
    if (updateObj[key] === null || updateObj[key] === undefined) {
      delete updateObj[key];
    }
  });
  
  return updateObj;
}
