// Test utilities for Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface TestContext {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
}

export function createTestClient(context: TestContext) {
  return createClient(context.supabaseUrl, context.supabaseServiceKey);
}

export function createAnonClient(context: TestContext) {
  return createClient(context.supabaseUrl, context.supabaseAnonKey);
}

export async function testFunction(
  functionName: string,
  payload: any,
  headers: Record<string, string> = {}
): Promise<Response> {
  const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionName}`;
  
  return await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

export function assertValidResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`Function returned ${response.status}: ${response.statusText}`);
  }
}

export async function assertValidJsonResponse(response: Response) {
  assertValidResponse(response);
  
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Expected JSON response, got ${contentType}`);
  }
  
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Invalid JSON response: ${error.message}`);
  }
}

// Test data generators
export function generateTestUser() {
  const userId = crypto.randomUUID();
  return {
    id: userId,
    email: `test-${userId.slice(0, 8)}@example.com`,
    chronotype: 'early_bird' as const,
    sensitivity_level: 'moderate' as const,
    focus_areas: ['stress', 'energy'],
    created_at: new Date().toISOString(),
  };
}

export function generateTestLifeScore() {
  return {
    stress_level: Math.floor(Math.random() * 10) + 1,
    energy_level: Math.floor(Math.random() * 10) + 1,
    sleep_quality: Math.floor(Math.random() * 10) + 1,
    timestamp: new Date().toISOString(),
  };
}

export function generateTestAdvice() {
  const adviceTemplates = [
    'Take a 5-minute breathing break to reduce stress',
    'Go for a short walk to boost your energy',
    'Consider a power nap to improve your alertness',
    'Try some gentle stretching to release tension',
    'Drink a glass of water to stay hydrated',
  ];
  
  return {
    content: adviceTemplates[Math.floor(Math.random() * adviceTemplates.length)],
    category: ['stress', 'energy', 'sleep', 'focus'][Math.floor(Math.random() * 4)],
    priority: Math.floor(Math.random() * 3) + 1,
    estimated_duration_minutes: [2, 5, 10, 15][Math.floor(Math.random() * 4)],
  };
}
