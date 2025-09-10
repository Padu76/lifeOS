// Integration test setup for LifeOS
// This file runs before integration tests

// Mock environment variables for testing
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key',
};

// Mock console methods to reduce noise in test output
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalLog;
  console.warn = originalWarn;
  console.error = originalError;
});

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock Supabase client for integration tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }),
      signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn((table) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
    functions: {
      invoke: jest.fn().mockResolvedValue({ 
        data: { success: true }, 
        error: null 
      }),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        download: jest.fn().mockResolvedValue({ data: new Blob(), error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      })),
    },
  })),
}));

// Global test utilities
global.testUtils = {
  // Mock health metrics
  getMockHealthMetrics: () => ({
    date: new Date().toISOString().split('T')[0],
    sleep_hours: 7.5,
    sleep_quality: 4,
    steps: 8500,
    mood: 4,
    stress: 3,
    energy: 4,
    source: 'manual',
    timestamp: new Date().toISOString(),
  }),
  
  // Mock life score
  getMockLifeScore: () => ({
    stress: 6,
    energy: 7,
    sleep: 8,
    overall: 7,
    timestamp: new Date().toISOString(),
    confidence: 0.85,
  }),
  
  // Mock user preferences
  getMockUserPreferences: () => ({
    intervention_frequency: 'balanced',
    preferred_tone: 'warm',
    notification_settings: {
      enabled: true,
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00',
    },
    focus_areas: ['stress', 'sleep'],
    chronotype: 'intermediate',
  }),
  
  // Mock micro advice
  getMockMicroAdvice: () => ({
    session_id: 'test-session-123',
    advice_text: 'Test advice: Take 3 deep breaths',
    advice_type: 'immediate',
    priority: 'medium',
    category: 'stress_relief',
    estimated_duration_minutes: 2,
    expires_at: new Date(Date.now() + 3600000).toISOString(),
    created_at: new Date().toISOString(),
    personalization_factors: {
      chronotype_optimized: true,
      stress_level_considered: true,
      energy_level_considered: true,
      context_aware: false,
    },
    effectiveness_tracking: {
      expected_stress_impact: -2,
      expected_energy_impact: 1,
      confidence_score: 0.8,
    },
  }),
};

// Setup for async operations
jest.setTimeout(10000); // 10 second timeout for integration tests

// Mock timers for tests that need them
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
