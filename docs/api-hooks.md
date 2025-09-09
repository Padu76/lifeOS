# LifeOS React Hooks API Documentation

Documentazione completa dei React Hooks di LifeOS per integrazione frontend.

## Panoramica

I React Hooks di LifeOS forniscono interfacce tipizzate per interagire con Edge Functions, gestire stato applicazione e analytics. Tutti gli hooks gestiscono automaticamente loading states, error handling e caching.

**Location:** `packages/core/hooks/`

---

## 1. useMicroAdvice

Hook principale per generazione e gestione micro-consigli AI-powered.

### Import
```typescript
import { useMicroAdvice } from '@lifeos/packages/core';
```

### Interface Types

```typescript
interface MicroAdvice {
  session_id: string;
  advice_text: string;
  advice_type: 'immediate' | 'scheduled' | 'contextual';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimated_duration_minutes: number;
  expires_at: string;
  created_at: string;
  personalization_factors: {
    chronotype_optimized: boolean;
    stress_level_considered: boolean;
    energy_level_considered: boolean;
    context_aware: boolean;
  };
  effectiveness_tracking: {
    expected_stress_impact: number;
    expected_energy_impact: number;
    confidence_score: number;
  };
}
```

### Return Value

```typescript
{
  // Current State
  currentAdvice: MicroAdvice | null;
  recentAdvice: MicroAdvice[];
  lastResponse: string | null;
  
  // Loading States
  isGenerating: boolean;
  isResponding: boolean;
  
  // Errors
  generateError: string | null;
  responseError: string | null;
  
  // Methods
  generateAdvice: (healthMetrics: HealthMetrics, lifeScore: LifeScoreV2, context?: any) => Promise<MicroAdvice | null>;
  respondToAdvice: (sessionId: string, responseType: 'completed' | 'dismissed' | 'snoozed', options?: ResponseOptions) => Promise<boolean>;
  completeAdvice: (sessionId: string, rating?: number, feedback?: string, actualDuration?: number) => Promise<boolean>;
  dismissAdvice: (sessionId: string, feedback?: string) => Promise<boolean>;
  snoozeAdvice: (sessionId: string, snoozeDuration?: number) => Promise<boolean>;
  isAdviceExpired: (advice: MicroAdvice) => boolean;
  reset: () => void;
}
```

### Usage Examples

#### Generazione Micro-Consiglio
```typescript
function Dashboard() {
  const { 
    currentAdvice, 
    isGenerating, 
    generateAdvice,
    generateError 
  } = useMicroAdvice();

  const handleGenerateAdvice = async () => {
    const healthMetrics = {
      timestamp: new Date().toISOString(),
      stress_level: 7,
      energy_level: 4,
      sleep_quality: 6,
      mood: "stressed"
    };

    const lifeScore = {
      stress: 7,
      energy: 4,
      sleep: 6,
      overall: 5
    };

    const advice = await generateAdvice(healthMetrics, lifeScore);
    
    if (advice) {
      console.log('New advice:', advice.advice_text);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateAdvice} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Get Advice'}
      </button>
      
      {currentAdvice && (
        <AdviceCard advice={currentAdvice} />
      )}
      
      {generateError && (
        <ErrorBanner message={generateError} />
      )}
    </div>
  );
}
```

#### Risposta a Consiglio
```typescript
function AdviceCard({ advice }) {
  const { completeAdvice, dismissAdvice, snoozeAdvice, isResponding } = useMicroAdvice();

  const handleComplete = async (rating: number) => {
    const success = await completeAdvice(
      advice.session_id, 
      rating, 
      "Really helpful!", 
      3 // actual duration in minutes
    );
    
    if (success) {
      console.log('Advice completed successfully');
    }
  };

  const handleSnooze = async () => {
    await snoozeAdvice(advice.session_id, 30); // 30 minutes
  };

  return (
    <div>
      <p>{advice.advice_text}</p>
      <div>
        <button onClick={() => handleComplete(5)} disabled={isResponding}>
          Complete
        </button>
        <button onClick={handleSnooze} disabled={isResponding}>
          Snooze 30min
        </button>
        <button onClick={() => dismissAdvice(advice.session_id)} disabled={isResponding}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
```

---

## 2. useWellnessDashboard

Hook per recuperare e gestire dati della dashboard wellness.

### Import
```typescript
import { useWellnessDashboard } from '@lifeos/packages/core';
```

### Return Value

```typescript
{
  // Data
  dashboardData: WellnessDashboardData | null;
  currentLifeScore: LifeScoreV2 | null;
  recentMetrics: HealthMetrics[];
  trends: WellnessTrends | null;
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  
  // Methods
  refreshDashboard: (days?: number) => Promise<void>;
  updateMetrics: (metrics: HealthMetrics) => Promise<void>;
  reset: () => void;
}
```

### Usage Example

```typescript
function WellnessDashboard() {
  const { 
    dashboardData, 
    currentLifeScore, 
    trends,
    loading, 
    error,
    refreshDashboard,
    updateMetrics 
  } = useWellnessDashboard();

  useEffect(() => {
    refreshDashboard(7); // Load last 7 days
  }, []);

  const handleUpdateMetrics = async () => {
    const newMetrics = {
      timestamp: new Date().toISOString(),
      stress_level: 5,
      energy_level: 7,
      sleep_quality: 8,
      mood: "good",
      steps: 8500
    };

    await updateMetrics(newMetrics);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      {currentLifeScore && (
        <LifeScoreRing score={currentLifeScore} />
      )}
      
      {trends && (
        <TrendChart data={trends.stress_trend} />
      )}
      
      <button onClick={handleUpdateMetrics}>
        Update Metrics
      </button>
    </div>
  );
}
```

---

## 3. useUserPreferences

Hook per gestire preferenze utente e personalizzazione.

### Import
```typescript
import { useUserPreferences } from '@lifeos/packages/core';
```

### Return Value

```typescript
{
  // Current Preferences
  preferences: UserPreferences | null;
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  
  // Methods
  updatePreferences: (newPreferences: Partial<UserPreferences>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  loadPreferences: () => Promise<void>;
}
```

### Usage Example

```typescript
function SettingsScreen() {
  const { 
    preferences, 
    loading, 
    updatePreferences 
  } = useUserPreferences();

  const handleUpdateFrequency = async (frequency: string) => {
    const success = await updatePreferences({
      intervention_frequency: frequency as "minimal" | "balanced" | "frequent"
    });
    
    if (success) {
      console.log('Preferences updated');
    }
  };

  const handleUpdateNotifications = async (enabled: boolean) => {
    await updatePreferences({
      notification_settings: {
        enabled,
        quiet_hours_start: "22:00",
        quiet_hours_end: "08:00"
      }
    });
  };

  return (
    <div>
      <select onChange={(e) => handleUpdateFrequency(e.target.value)}>
        <option value="minimal">Minimal</option>
        <option value="balanced">Balanced</option>
        <option value="frequent">Frequent</option>
      </select>
      
      <label>
        <input 
          type="checkbox" 
          checked={preferences?.notification_settings?.enabled}
          onChange={(e) => handleUpdateNotifications(e.target.checked)}
        />
        Enable Notifications
      </label>
    </div>
  );
}
```

---

## 4. useSystemAnalytics

Hook per analytics e insights di sistema.

### Import
```typescript
import { useSystemAnalytics } from '@lifeos/packages/core';
```

### Return Value

```typescript
{
  // Analytics Data
  userAnalytics: UserAnalytics | null;
  systemAnalytics: SystemAnalytics | null;
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  
  // Methods
  loadAnalytics: (scope: 'user' | 'system', timeframe: 'day' | 'week' | 'month') => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}
```

### Usage Example

```typescript
function AnalyticsScreen() {
  const { 
    userAnalytics, 
    loading, 
    loadAnalytics 
  } = useSystemAnalytics();

  useEffect(() => {
    loadAnalytics('user', 'week');
  }, []);

  return (
    <div>
      {userAnalytics && (
        <div>
          <MetricCard 
            title="Completion Rate" 
            value={`${(userAnalytics.completion_rate * 100).toFixed(1)}%`}
          />
          <MetricCard 
            title="Average Rating" 
            value={userAnalytics.avg_rating.toFixed(1)}
          />
          <MetricCard 
            title="Total Sessions" 
            value={userAnalytics.total_sessions.toString()}
          />
        </div>
      )}
    </div>
  );
}
```

---

## 5. useUserInitialization

Hook per inizializzazione profilo nuovo utente.

### Import
```typescript
import { useUserInitialization } from '@lifeos/packages/core';
```

### Return Value

```typescript
{
  // Initialization State
  isInitialized: boolean;
  initializationStep: 'assessment' | 'goals' | 'preferences' | 'complete';
  
  // Loading & Error
  loading: boolean;
  error: string | null;
  
  // Methods
  initializeProfile: (assessment: InitialAssessment) => Promise<boolean>;
  setGoals: (goals: string[]) => Promise<boolean>;
  setInitialPreferences: (preferences: UserPreferences) => Promise<boolean>;
  skipOnboarding: () => Promise<boolean>;
}
```

### Usage Example

```typescript
function OnboardingScreen() {
  const { 
    isInitialized,
    initializationStep,
    loading,
    initializeProfile,
    setGoals 
  } = useUserInitialization();

  const handleInitialAssessment = async () => {
    const assessment = {
      stress_level: 6,
      energy_level: 5,
      sleep_quality: 7,
      activity_level: 4
    };

    const success = await initializeProfile(assessment);
    if (success) {
      console.log('Profile initialized');
    }
  };

  const handleSetGoals = async () => {
    await setGoals(['reduce_stress', 'better_sleep']);
  };

  if (isInitialized) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div>
      {initializationStep === 'assessment' && (
        <InitialAssessmentForm onSubmit={handleInitialAssessment} />
      )}
      
      {initializationStep === 'goals' && (
        <GoalsSelectionForm onSubmit={handleSetGoals} />
      )}
    </div>
  );
}
```

---

## 6. useSupabaseEdgeFunctions

Hook di base per chiamate tipizzate alle Edge Functions.

### Import
```typescript
import { useTypedEdgeFunction } from '@lifeos/packages/core';
```

### Generic Usage

```typescript
// Per chiamate custom a Edge Functions
function useCustomFunction() {
  const customFunction = useTypedEdgeFunction<InputType, OutputType>('function-name');
  
  return {
    loading: customFunction.loading,
    error: customFunction.error,
    execute: customFunction.execute,
    reset: customFunction.reset
  };
}
```

### Usage Example

```typescript
function CustomComponent() {
  const dailyRollup = useTypedEdgeFunction<
    { date?: string }, 
    { users_processed: number }
  >('daily-rollup');

  const handleDailyRollup = async () => {
    const result = await dailyRollup.execute({
      date: '2025-01-15'
    });
    
    if (result) {
      console.log(`Processed ${result.users_processed} users`);
    }
  };

  return (
    <button 
      onClick={handleDailyRollup} 
      disabled={dailyRollup.loading}
    >
      {dailyRollup.loading ? 'Processing...' : 'Run Daily Rollup'}
    </button>
  );
}
```

---

## Error Handling

Tutti gli hooks implementano error handling consistente:

```typescript
// Error types
type HookError = string | null;

// Usage pattern
function Component() {
  const { error, loading, someMethod } = useSomeHook();
  
  useEffect(() => {
    if (error) {
      console.error('Hook error:', error);
      // Handle error (show toast, log, etc.)
    }
  }, [error]);
  
  return (
    <div>
      {error && <ErrorBanner message={error} />}
      {loading && <LoadingSpinner />}
    </div>
  );
}
```

---

## TypeScript Support

Tutti gli hooks sono completamente tipizzati:

```typescript
// Auto-completion e type checking
const { currentAdvice } = useMicroAdvice();

// currentAdvice è tipizzato come MicroAdvice | null
if (currentAdvice) {
  // TypeScript sa che currentAdvice non è null qui
  console.log(currentAdvice.advice_text); // ✅ Type-safe
  console.log(currentAdvice.wrongProperty); // ❌ TypeScript error
}
```

---

## Testing

Per testing degli hooks, usare `@testing-library/react-hooks`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useMicroAdvice } from '../useMicroAdvice';

test('should generate advice', async () => {
  const { result } = renderHook(() => useMicroAdvice());
  
  await act(async () => {
    const advice = await result.current.generateAdvice(mockMetrics, mockScore);
    expect(advice).toBeDefined();
  });
  
  expect(result.current.currentAdvice).toBeTruthy();
});
```

---

## Best Practices

### 1. Error Boundaries
Wrap components usando hooks in Error Boundaries:

```typescript
function App() {
  return (
    <ErrorBoundary>
      <DashboardWithHooks />
    </ErrorBoundary>
  );
}
```

### 2. Loading States
Sempre gestire loading states per UX fluida:

```typescript
const { loading, data } = useWellnessDashboard();

if (loading) return <SkeletonLoader />;
return <DashboardContent data={data} />;
```

### 3. Cleanup
Hooks si puliscono automaticamente, ma puoi chiamare reset() se necessario:

```typescript
useEffect(() => {
  return () => {
    reset(); // Cleanup manuale se necessario
  };
}, []);
```

### 4. Memoization
Per performance, considera useMemo per computazioni costose:

```typescript
const expensiveComputation = useMemo(() => {
  return processAdviceData(currentAdvice);
}, [currentAdvice]);
```
