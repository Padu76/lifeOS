import type { Meta, StoryObj } from '@storybook/react';
import { AnalyticsScreen } from '@lifeos/screens';

const meta = {
  title: 'Screens/AnalyticsScreen',
  component: AnalyticsScreen,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Analytics Screen provides comprehensive data visualization and insights for LifeOS users. Features multiple timeframes, tab navigation, trend analysis, category insights, pattern recognition, and actionable recommendations. Essential for data-driven wellness optimization.',
      },
    },
  },
  argTypes: {
    navigation: {
      description: 'React Navigation object',
      table: {
        type: { summary: 'any' },
      },
    },
  },
} satisfies Meta<typeof AnalyticsScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock navigation object
const mockNavigation = {
  goBack: () => console.log('Navigate back'),
  navigate: (screen: string) => console.log(`Navigate to ${screen}`),
  replace: (screen: string) => console.log(`Replace with ${screen}`),
};

// Mock analytics data for different scenarios
const mockAnalyticsData = {
  overview: {
    total_interventions: 127,
    completion_rate: 0.84,
    avg_session_rating: 4.3,
    total_engagement_minutes: 2145,
    stress_improvement_avg: 1.2,
  },
  trends: {
    life_score_trends: [
      {
        metric_name: 'Energia',
        current_value: 7.8,
        previous_value: 7.2,
        change_percentage: 8.3,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Stress',
        current_value: 3.2,
        previous_value: 4.1,
        change_percentage: -22.0,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Sonno',
        current_value: 8.1,
        previous_value: 7.8,
        change_percentage: 3.8,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Focus',
        current_value: 6.9,
        previous_value: 7.2,
        change_percentage: -4.2,
        trend: 'declining' as const,
      },
    ],
    engagement_trends: [
      {
        metric_name: 'Lun',
        current_value: 85,
        previous_value: 78,
        change_percentage: 9.0,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Mar',
        current_value: 92,
        previous_value: 88,
        change_percentage: 4.5,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Mer',
        current_value: 78,
        previous_value: 84,
        change_percentage: -7.1,
        trend: 'declining' as const,
      },
      {
        metric_name: 'Gio',
        current_value: 88,
        previous_value: 85,
        change_percentage: 3.5,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Ven',
        current_value: 95,
        previous_value: 91,
        change_percentage: 4.4,
        trend: 'improving' as const,
      },
    ],
    effectiveness_trends: [
      {
        metric_name: 'Mindfulness',
        current_value: 94,
        previous_value: 87,
        change_percentage: 8.0,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Movimento',
        current_value: 76,
        previous_value: 73,
        change_percentage: 4.1,
        trend: 'improving' as const,
      },
      {
        metric_name: 'Alimentazione',
        current_value: 68,
        previous_value: 72,
        change_percentage: -5.6,
        trend: 'declining' as const,
      },
    ],
  },
  recommendations: {
    focus_areas: [
      'Aumenta la frequenza di esercizi di respirazione',
      'Concentrati su routine mattutine più consistenti',
      'Migliora la qualità del sonno con tecniche di rilassamento',
    ],
    optimal_timing: [
      'I tuoi momenti migliori sono tra le 9:00 e le 11:00',
      'Evita consigli dopo le 20:00 per migliore adesione',
      'I martedì mostrano il più alto engagement',
    ],
    intervention_adjustments: [
      'Riduci la durata media dei consigli a 8-10 minuti',
      'Aumenta la varietà nelle categorie stress e energia',
      'Implementa più feedback personalizzati',
    ],
  },
};

// Create mock useSystemAnalytics hook return
const createMockAnalyticsHook = (data: any, loading = false, error = null) => ({
  analytics: data,
  loading,
  error,
  fetchAnalytics: async () => {},
  getWeeklyAnalytics: async () => {},
  getMonthlyAnalytics: async () => {},
  getQuarterlyAnalytics: async () => {},
  getBestPerformingCategories: () => [
    {
      category: 'Mindfulness',
      total_interventions: 45,
      completion_rate: 0.94,
      avg_rating: 4.7,
      avg_duration_minutes: 12.5,
      effectiveness_score: 0.92,
      trend: 'improving' as const,
    },
    {
      category: 'Breathing',
      total_interventions: 38,
      completion_rate: 0.89,
      avg_rating: 4.5,
      avg_duration_minutes: 8.2,
      effectiveness_score: 0.88,
      trend: 'improving' as const,
    },
  ],
  getWorstPerformingCategories: () => [
    {
      category: 'Nutrition',
      total_interventions: 18,
      completion_rate: 0.56,
      avg_rating: 3.2,
      avg_duration_minutes: 15.7,
      effectiveness_score: 0.48,
      trend: 'declining' as const,
    },
  ],
  getOptimalTimes: () => [
    {
      pattern_type: 'time_of_day' as const,
      pattern_value: '09:30',
      success_rate: 0.87,
      confidence_score: 0.91,
      description: 'Optimal morning engagement window',
    },
  ],
  getBurnoutRisk: () => 'medium' as const,
  getBurnoutRiskFactors: () => [
    'Orari di lavoro prolungati',
    'Qualità del sonno ridotta',
    'Stress levels elevati',
  ],
  getRecommendedActions: () => [
    'Implementa pause regolari',
    'Migliora routine del sonno',
    'Pratica tecniche di rilassamento',
  ],
  getImprovingTrends: () => data?.trends?.life_score_trends?.filter((t: any) => t.trend === 'improving') || [],
  getDecliningTrends: () => data?.trends?.life_score_trends?.filter((t: any) => t.trend === 'declining') || [],
  exportAnalytics: () => ({ exported: true, timestamp: new Date().toISOString() }),
});

// Override the useSystemAnalytics hook for stories
const withMockAnalytics = (data: any, loading = false, error = null) => (Story: any) => {
  // In a real Storybook setup, you'd use decorators or mock the hook properly
  return (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e' }}>
      <Story analytics={data} loading={loading} error={error} />
    </div>
  );
};

// Basic States
export const LoadingState: Story = {
  render: () => {
    // Simulate loading state
    return (
      <div style={{ 
        height: '100vh', 
        backgroundColor: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #374151',
            borderTop: '3px solid #7c3aed',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Caricamento analytics...</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state shown during initial analytics data fetch.',
      },
    },
  },
};

export const ErrorState: Story = {
  render: () => (
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#1a1a2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: '#ef4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        maxWidth: '300px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0 0 12px', fontSize: '16px' }}>Impossibile caricare gli analytics</p>
        <button 
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => console.log('Retry')}
        >
          Riprova
        </button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error state when analytics data fails to load.',
      },
    },
  },
};

// Tab States
export const OverviewTab: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', padding: '20px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', margin: '0 0 8px' }}>Analytics</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Settimana', 'Mese', 'Trimestre'].map((period, i) => (
            <button
              key={period}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: i === 1 ? '#7c3aed' : '#374151',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Consigli Completati</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>127</div>
          <div style={{ color: '#10b981', fontSize: '12px' }}>84% completati</div>
        </div>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Rating Medio</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>4.3</div>
          <div style={{ color: '#10b981', fontSize: '12px' }}>su 5.0</div>
        </div>
      </div>

      <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Andamento Life Score</h3>
        <div style={{ height: '200px', backgroundColor: '#1a1a2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#9ca3af' }}>Grafico Trend Life Score</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview tab showing key metrics and life score trends.',
      },
    },
  },
};

export const TrendsTab: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#10b981', fontSize: '18px', marginBottom: '16px' }}>📈 Trend in Miglioramento</h2>
        {[
          { name: 'Energia', change: '+8.3%', value: '7.8' },
          { name: 'Mindfulness', change: '+12.1%', value: '8.2' },
        ].map((trend, i) => (
          <div key={i} style={{ 
            backgroundColor: '#16213e', 
            padding: '16px', 
            borderRadius: '8px', 
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#e5e7eb' }}>{trend.name}</span>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>{trend.change}</span>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{trend.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#ef4444', fontSize: '18px', marginBottom: '16px' }}>📉 Trend in Declino</h2>
        <div style={{ 
          backgroundColor: '#16213e', 
          padding: '16px', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ color: '#e5e7eb' }}>Focus</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>-4.2%</span>
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>6.9</span>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
        <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Andamento Engagement</h3>
        <div style={{ height: '200px', backgroundColor: '#1a1a2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#9ca3af' }}>Grafico Engagement Settimanale</span>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Trends tab showing improving and declining metrics.',
      },
    },
  },
};

export const InsightsTab: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>🏆 Categorie Top Performance</h2>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🧘</span>
            <div>
              <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>Mindfulness</h4>
              <span style={{ color: '#10b981', fontSize: '12px' }}>Eccellente</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#10b981', fontSize: '24px', fontWeight: 'bold' }}>92.0%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
            <span>45 Totali</span>
            <span>94% Completati</span>
            <span>4.7 Rating</span>
            <span>12.5min</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>⚠️ Categorie da Migliorare</h2>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🥗</span>
            <div>
              <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>Nutrition</h4>
              <span style={{ color: '#ef4444', fontSize: '12px' }}>Da migliorare</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold' }}>48.0%</span>
          </div>
          <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
            <p style={{ color: '#e5e7eb', fontSize: '11px', margin: 0 }}>
              💡 Basso tasso di completamento. Prova consigli più brevi o in momenti diversi.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>⏰ Orari Ottimali</h2>
        <div style={{ backgroundColor: '#1e3a8a', padding: '16px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px', marginRight: '12px' }}>🕘</span>
            <div>
              <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 4px' }}>09:30 AM</h4>
              <span style={{ color: '#3b82f6', fontSize: '12px' }}>Alta confidenza</span>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Tasso di Successo</span>
              <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 'bold' }}>87%</span>
            </div>
            <div style={{ height: '4px', backgroundColor: '#1f2937', borderRadius: '2px' }}>
              <div style={{ width: '87%', height: '100%', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Insights tab showing category performance and optimal timing patterns.',
      },
    },
  },
};

export const RecommendationsTab: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>🎯 Aree di Focus Consigliate</h2>
        {[
          'Aumenta la frequenza di esercizi di respirazione',
          'Concentrati su routine mattutine più consistenti',
          'Migliora la qualità del sonno con tecniche di rilassamento'
        ].map((recommendation, i) => (
          <div key={i} style={{
            backgroundColor: '#16213e',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '8px',
            borderLeft: '4px solid #7c3aed'
          }}>
            <p style={{ color: '#e5e7eb', fontSize: '14px', margin: 0 }}>{recommendation}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>⏰ Timing Ottimale</h2>
        {[
          'I tuoi momenti migliori sono tra le 9:00 e le 11:00',
          'Evita consigli dopo le 20:00 per migliore adesione',
          'I martedì mostrano il più alto engagement'
        ].map((timing, i) => (
          <div key={i} style={{
            backgroundColor: '#16213e',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '8px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <p style={{ color: '#e5e7eb', fontSize: '14px', margin: 0 }}>{timing}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>⚙️ Aggiustamenti Consigliati</h2>
        {[
          'Riduci la durata media dei consigli a 8-10 minuti',
          'Aumenta la varietà nelle categorie stress e energia',
          'Implementa più feedback personalizzati'
        ].map((adjustment, i) => (
          <div key={i} style={{
            backgroundColor: '#16213e',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '8px',
            borderLeft: '4px solid #10b981'
          }}>
            <p style={{ color: '#e5e7eb', fontSize: '14px', margin: 0 }}>{adjustment}</p>
          </div>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Recommendations tab with actionable insights for optimization.',
      },
    },
  },
};

// Timeframe Variants
export const WeeklyTimeframe: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', padding: '20px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px' }}>Analytics - Vista Settimanale</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: '#fff', fontSize: '14px' }}>
            Settimana
          </button>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff', fontSize: '14px' }}>
            Mese
          </button>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff', fontSize: '14px' }}>
            Trimestre
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Questa Settimana</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>23</div>
          <div style={{ color: '#10b981', fontSize: '12px' }}>+15% vs settimana scorsa</div>
        </div>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Completamento</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>87%</div>
          <div style={{ color: '#10b981', fontSize: '12px' }}>+3% miglioramento</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Analytics screen with weekly timeframe selected.',
      },
    },
  },
};

export const MonthlyTimeframe: Story = {
  render: () => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', padding: '20px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
        <h1 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px' }}>Analytics - Vista Mensile</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff', fontSize: '14px' }}>
            Settimana
          </button>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#7c3aed', color: '#fff', fontSize: '14px' }}>
            Mese
          </button>
          <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#374151', color: '#fff', fontSize: '14px' }}>
            Trimestre
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Questo Mese</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>127</div>
          <div style={{ color: '#10b981', fontSize: '12px' }}>+22% vs mese scorso</div>
        </div>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Life Score Medio</div>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>7.8</div>
          <div style={{ color: '#10b981', fontSize: '12px' }}>+0.4 miglioramento</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Analytics screen with monthly timeframe selected.',
      },
    },
  },
};

// Interactive Examples
export const TabNavigation: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('overview');
    
    const tabs = [
      { key: 'overview', label: 'Panoramica' },
      { key: 'trends', label: 'Trend' },
      { key: 'insights', label: 'Insights' },
      { key: 'recommendations', label: 'Consigli' },
    ];
    
    return (
      <div style={{ height: '100vh', backgroundColor: '#1a1a2e' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
          <h1 style={{ color: '#fff', fontSize: '24px', margin: '0 0 16px' }}>Analytics</h1>
          <div style={{ display: 'flex' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.key ? '#7c3aed' : '#9ca3af',
                  borderBottom: activeTab === tab.key ? '2px solid #7c3aed' : '2px solid transparent',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ padding: '20px' }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Panoramica</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Consigli Totali</div>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>127</div>
                </div>
                <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>Rating Medio</div>
                  <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>4.3</div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'trends' && (
            <div>
              <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Trend</h2>
              <p style={{ color: '#9ca3af' }}>Analisi dei trend temporali e performance</p>
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div>
              <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Insights</h2>
              <p style={{ color: '#9ca3af' }}>Categorie e pattern di successo</p>
            </div>
          )}
          
          {activeTab === 'recommendations' && (
            <div>
              <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '16px' }}>Consigli</h2>
              <p style={{ color: '#9ca3af' }}>Raccomandazioni per ottimizzare l'esperienza</p>
            </div>
          )}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive tab navigation between different analytics views.',
      },
    },
  },
};

// Mobile Layout
export const MobileLayout: Story = {
  render: () => (
    <div style={{ width: '375px', height: '812px', backgroundColor: '#1a1a2e', margin: '0 auto' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #374151' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px' }}>←</button>
          <h1 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>Analytics</h1>
          <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px' }}>📊</button>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Settimana', 'Mese', 'Trimestre'].map((period, i) => (
            <button
              key={period}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: i === 1 ? '#7c3aed' : '#374151',
                color: '#fff',
                fontSize: '12px'
              }}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ backgroundColor: '#16213e', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>Completati</div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>127</div>
          </div>
          <div style={{ backgroundColor: '#16213e', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>Rating</div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>4.3</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#16213e', padding: '12px', borderRadius: '8px' }}>
          <h3 style={{ color: '#fff', fontSize: '14px', marginBottom: '12px' }}>Trend Settimanale</h3>
          <div style={{ height: '120px', backgroundColor: '#1a1a2e', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#9ca3af', fontSize: '12px' }}>Grafico Mobile</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Analytics screen optimized for mobile devices.',
      },
    },
  },
};

// Real Usage Examples
export const FullFeaturedAnalytics: Story = {
  args: {
    navigation: mockNavigation,
  },
  render: (args) => (
    <div style={{ height: '100vh', backgroundColor: '#1a1a2e', overflow: 'hidden' }}>
      {/* This would be the actual AnalyticsScreen component */}
      <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button 
              onClick={() => args.navigation.goBack()}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
            >
              ←
            </button>
            <h1 style={{ color: '#fff', fontSize: '18px', margin: 0 }}>Analytics</h1>
            <button style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>
              📊
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['Settimana', 'Mese', 'Trimestre'].map((period, i) => (
              <button
                key={period}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: i === 1 ? '#7c3aed' : '#374151',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {period}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex' }}>
            {['Panoramica', 'Trend', 'Insights', 'Consigli'].map((tab, i) => (
              <button
                key={tab}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: i === 0 ? '#7c3aed' : '#9ca3af',
                  borderBottom: i === 0 ? '2px solid #7c3aed' : '2px solid transparent',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Consigli Completati', value: '127', subtitle: '84% completati', trend: 'up' },
              { label: 'Rating Medio', value: '4.3', subtitle: 'su 5.0', trend: 'up' },
              { label: 'Tempo Engagement', value: '36h', subtitle: '2145 minuti totali', trend: 'stable' },
              { label: 'Miglioramento Stress', value: '+1.2', subtitle: 'punti in media', trend: 'up' },
            ].map((metric, i) => (
              <div key={i} style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px' }}>
                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>{metric.label}</div>
                <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{metric.value}</div>
                <div style={{ color: metric.trend === 'up' ? '#10b981' : '#6b7280', fontSize: '12px' }}>{metric.subtitle}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px' }}>Andamento Life Score</h3>
            <div style={{ height: '200px', backgroundColor: '#1a1a2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#9ca3af' }}>Interactive Trend Chart</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete analytics screen with all features and interactions.',
      },
    },
  },
};
