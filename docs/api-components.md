# LifeOS Components API Documentation

Documentazione completa dei componenti React di LifeOS organizzati per package.

## Panoramica

I componenti LifeOS sono organizzati in package modulari per facilitare importazione e manutenzione. Tutti i componenti sono sviluppati in TypeScript con Tailwind CSS e supportano temi dark/light.

**Import Pattern:**
```typescript
// Import da package specifico
import { AdviceCard } from '@lifeos/packages/dashboard';

// Import da collezione
import { LifeOSComponents } from '@lifeos/packages';
```

---

## Dashboard Components (`packages/dashboard/`)

Componenti per la dashboard principale dell'app.

### 1. AdviceCard

Visualizza micro-consigli con azioni utente.

#### Props
```typescript
interface AdviceCardProps {
  advice: MicroAdvice;
  onComplete?: (sessionId: string, rating: number) => void;
  onDismiss?: (sessionId: string) => void;
  onSnooze?: (sessionId: string, duration: number) => void;
  compact?: boolean;
  showActions?: boolean;
  className?: string;
}
```

#### Usage
```typescript
import { AdviceCard } from '@lifeos/packages/dashboard';

function Dashboard() {
  const handleComplete = (sessionId: string, rating: number) => {
    console.log('Completed with rating:', rating);
  };

  return (
    <AdviceCard
      advice={currentAdvice}
      onComplete={handleComplete}
      onDismiss={(id) => console.log('Dismissed:', id)}
      onSnooze={(id, duration) => console.log('Snoozed:', duration)}
      showActions={true}
    />
  );
}
```

### 2. LifeScoreRing

Anello circolare per visualizzare LifeScore con animazioni.

#### Props
```typescript
interface LifeScoreRingProps {
  score: LifeScoreV2;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  animated?: boolean;
  onClick?: () => void;
  className?: string;
}
```

#### Usage
```typescript
import { LifeScoreRing } from '@lifeos/packages/dashboard';

function ScoreDisplay() {
  const lifeScore = {
    stress: 6,
    energy: 7,
    sleep: 8,
    overall: 7
  };

  return (
    <LifeScoreRing
      score={lifeScore}
      size="large"
      showLabels={true}
      animated={true}
      onClick={() => console.log('Score clicked')}
    />
  );
}
```

### 3. TodayStats

Statistiche rapide della giornata corrente.

#### Props
```typescript
interface TodayStatsProps {
  metrics: HealthMetrics;
  comparison?: HealthMetrics; // Per confronto con ieri
  layout?: 'horizontal' | 'vertical';
  className?: string;
}
```

#### Usage
```typescript
import { TodayStats } from '@lifeos/packages/dashboard';

function DashboardOverview() {
  return (
    <TodayStats
      metrics={todayMetrics}
      comparison={yesterdayMetrics}
      layout="horizontal"
    />
  );
}
```

### 4. QuickMetrics

Metriche veloci con icone e trend indicators.

#### Props
```typescript
interface QuickMetricsProps {
  metrics: {
    label: string;
    value: number | string;
    trend?: 'up' | 'down' | 'stable';
    icon?: string;
    color?: 'green' | 'yellow' | 'red' | 'blue';
  }[];
  layout?: 'grid' | 'list';
  className?: string;
}
```

### 5. RecentActivities

Lista delle attivita recenti dell'utente.

#### Props
```typescript
interface RecentActivitiesProps {
  activities: Activity[];
  maxItems?: number;
  showTimestamps?: boolean;
  onActivityClick?: (activity: Activity) => void;
  className?: string;
}
```

### 6. AchievementsBanner

Banner per nuovi achievement con animazioni.

#### Props
```typescript
interface AchievementsBannerProps {
  achievements: Achievement[];
  onDismiss?: (achievementId: string) => void;
  autoHide?: boolean;
  hideDelay?: number;
  className?: string;
}
```

---

## Analytics Components (`packages/analytics/`)

Componenti per visualizzazione dati e analytics.

### 1. TrendChart

Grafico per visualizzare trend nel tempo.

#### Props
```typescript
interface TrendChartProps {
  data: TrendData[];
  type?: 'line' | 'area' | 'bar';
  metric: 'stress' | 'energy' | 'sleep' | 'overall';
  timeframe?: 'week' | 'month' | 'quarter';
  showGrid?: boolean;
  interactive?: boolean;
  height?: number;
  className?: string;
}
```

#### Usage
```typescript
import { TrendChart } from '@lifeos/packages/analytics';

function AnalyticsView() {
  return (
    <TrendChart
      data={stressTrendData}
      type="line"
      metric="stress"
      timeframe="week"
      showGrid={true}
      interactive={true}
      height={300}
    />
  );
}
```

### 2. BurnoutRiskCard

Card per visualizzare rischio burnout.

#### Props
```typescript
interface BurnoutRiskCardProps {
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendations?: string[];
  onViewDetails?: () => void;
  className?: string;
}
```

### 3. CategoryInsightCard

Insights per categoria specifica (stress, sleep, etc.).

#### Props
```typescript
interface CategoryInsightCardProps {
  category: 'stress' | 'energy' | 'sleep' | 'mindfulness';
  insight: {
    title: string;
    description: string;
    trend: 'improving' | 'stable' | 'declining';
    recommendation?: string;
  };
  data?: number[];
  className?: string;
}
```

### 4. PatternInsightCard

Card per pattern behavior insights.

#### Props
```typescript
interface PatternInsightCardProps {
  pattern: {
    type: 'daily' | 'weekly' | 'seasonal';
    description: string;
    confidence: number;
    impact: 'positive' | 'negative' | 'neutral';
  };
  onLearnMore?: () => void;
  className?: string;
}
```

---

## Shared Components (`packages/shared/`)

Componenti utility condivisi tra package.

### 1. LoadingSpinner

Spinner di caricamento con varianti.

#### Props
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'green' | 'gray';
  text?: string;
  centered?: boolean;
  className?: string;
}
```

#### Usage
```typescript
import { LoadingSpinner } from '@lifeos/packages/shared';

function LoadingState() {
  return (
    <LoadingSpinner
      size="medium"
      color="blue"
      text="Loading wellness data..."
      centered={true}
    />
  );
}
```

### 2. ErrorBanner

Banner per messaggi di errore.

#### Props
```typescript
interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
  className?: string;
}
```

### 3. MetricCard

Card generica per visualizzare metriche.

#### Props
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label?: string;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  onClick?: () => void;
  className?: string;
}
```

### 4. ProgressBar

Barra di progresso animata.

#### Props
```typescript
interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  animated?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}
```

---

## Screen Components (`packages/screens/`)

Schermate complete dell'applicazione.

### 1. DashboardScreen

Schermata dashboard principale.

#### Props
```typescript
interface DashboardScreenProps {
  userId: string;
  initialData?: WellnessDashboardData;
  onAdviceGenerate?: () => void;
  onMetricsUpdate?: (metrics: HealthMetrics) => void;
  className?: string;
}
```

#### Usage
```typescript
import { DashboardScreen } from '@lifeos/packages/screens';

function App() {
  return (
    <DashboardScreen
      userId="user-123"
      onAdviceGenerate={() => console.log('Generate advice')}
      onMetricsUpdate={(metrics) => console.log('Metrics:', metrics)}
    />
  );
}
```

### 2. AnalyticsScreen

Schermata analytics completa.

#### Props
```typescript
interface AnalyticsScreenProps {
  userId: string;
  timeframe?: 'week' | 'month' | 'quarter';
  onTimeframeChange?: (timeframe: string) => void;
  className?: string;
}
```

### 3. OnboardingScreen

Schermata onboarding nuovo utente.

#### Props
```typescript
interface OnboardingScreenProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  steps?: string[];
  className?: string;
}
```

### 4. SettingsScreen

Schermata impostazioni utente.

#### Props
```typescript
interface SettingsScreenProps {
  userId: string;
  currentPreferences?: UserPreferences;
  onPreferencesUpdate?: (prefs: UserPreferences) => void;
  onAccountAction?: (action: string) => void;
  className?: string;
}
```

---

## UI Components (`packages/ui/`)

Componenti base del design system.

### 1. Button

Bottone con varianti e stati.

#### Props
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
}
```

#### Usage
```typescript
import { Button } from '@lifeos/packages/ui';

function ActionPanel() {
  return (
    <div>
      <Button variant="primary" size="medium" loading={isLoading}>
        Generate Advice
      </Button>
      
      <Button variant="outline" icon={<RefreshIcon />}>
        Refresh
      </Button>
    </div>
  );
}
```

### 2. Card

Container card con shadow e padding.

#### Props
```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  clickable?: boolean;
  onClick?: () => void;
  className?: string;
}
```

### 3. Typography

Componenti tipografici consistenti.

#### Props
```typescript
interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
  className?: string;
}
```

---

## Onboarding Components (`packages/onboarding/`)

### 1. LifeScoreInput

Input per initial assessment LifeScore.

#### Props
```typescript
interface LifeScoreInputProps {
  onScoreChange: (score: LifeScoreV2) => void;
  initialScore?: Partial<LifeScoreV2>;
  showLabels?: boolean;
  interactive?: boolean;
  className?: string;
}
```

#### Usage
```typescript
import { LifeScoreInput } from '@lifeos/packages/onboarding';

function InitialAssessment() {
  const handleScoreChange = (score: LifeScoreV2) => {
    console.log('New score:', score);
  };

  return (
    <LifeScoreInput
      onScoreChange={handleScoreChange}
      showLabels={true}
      interactive={true}
    />
  );
}
```

---

## Theming Support

Tutti i componenti supportano temi dark/light:

```typescript
// Theme provider (già configurato nel main package)
import { ThemeProvider } from '@lifeos/packages';

function App() {
  return (
    <ThemeProvider theme="dark">
      <DashboardScreen userId="123" />
    </ThemeProvider>
  );
}
```

### Custom Theme Variables

```css
:root {
  --lifeos-primary: #3b82f6;
  --lifeos-secondary: #64748b;
  --lifeos-success: #10b981;
  --lifeos-warning: #f59e0b;
  --lifeos-error: #ef4444;
  --lifeos-background: #ffffff;
  --lifeos-surface: #f8fafc;
  --lifeos-text-primary: #0f172a;
  --lifeos-text-secondary: #64748b;
}

[data-theme="dark"] {
  --lifeos-background: #0f172a;
  --lifeos-surface: #1e293b;
  --lifeos-text-primary: #f8fafc;
  --lifeos-text-secondary: #cbd5e1;
}
```

---

## Accessibility

Tutti i componenti includono:

- **ARIA labels** appropriati
- **Keyboard navigation** completa
- **Screen reader support**
- **Focus management**
- **Color contrast** WCAG AA compliant

### Usage Example
```typescript
// Componenti sono già accessibili out-of-the-box
<Button 
  aria-label="Generate new micro advice"
  onClick={handleGenerate}
>
  Generate Advice
</Button>
```

---

## Performance

### Lazy Loading
```typescript
// Components supportano lazy loading
const DashboardScreen = lazy(() => import('@lifeos/packages/screens/DashboardScreen'));
```

### Memoization
```typescript
// Componenti pesanti sono già memoizzati
const MemoizedTrendChart = memo(TrendChart);
```

---

## Testing

Tutti i componenti includono test utilities:

```typescript
import { render, screen } from '@testing-library/react';
import { AdviceCard } from '@lifeos/packages/dashboard';

test('renders advice card', () => {
  render(<AdviceCard advice={mockAdvice} />);
  expect(screen.getByText(mockAdvice.advice_text)).toBeInTheDocument();
});
```

---

## Storybook Integration

Per development e testing visuale:

```bash
npm run storybook
```

Ogni componente ha stories complete con:
- Varianti diverse
- Interactive controls
- Documentation integrata
- Responsive testing
