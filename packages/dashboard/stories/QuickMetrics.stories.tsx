import type { Meta, StoryObj } from '@storybook/react';
import { QuickMetrics, WeeklyTrendsMetrics, CompactMetrics } from '@lifeos/dashboard';

const meta = {
  title: 'Dashboard/QuickMetrics',
  component: QuickMetrics,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Quick Metrics component displays weekly trends for stress, energy, sleep, and engagement with visual indicators, insights, and trend analysis. Provides actionable recommendations based on pattern recognition.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trends: {
      control: 'object',
      description: 'Weekly trends object containing all metric trends',
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable entry animations for metric cards',
      defaultValue: true,
    },
    onMetricPress: {
      action: 'metric-pressed',
      description: 'Called when a metric card is pressed',
    },
  },
} satisfies Meta<typeof QuickMetrics>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample trends data
const excellentTrends = {
  stress_trend: 'improving' as const,
  energy_trend: 'improving' as const,
  sleep_trend: 'improving' as const,
  engagement_trend: 'improving' as const,
};

const goodTrends = {
  stress_trend: 'improving' as const,
  energy_trend: 'stable' as const,
  sleep_trend: 'improving' as const,
  engagement_trend: 'stable' as const,
};

const mixedTrends = {
  stress_trend: 'improving' as const,
  energy_trend: 'declining' as const,
  sleep_trend: 'stable' as const,
  engagement_trend: 'improving' as const,
};

const concerningTrends = {
  stress_trend: 'declining' as const,
  energy_trend: 'declining' as const,
  sleep_trend: 'declining' as const,
  engagement_trend: 'stable' as const,
};

const stableTrends = {
  stress_trend: 'stable' as const,
  energy_trend: 'stable' as const,
  sleep_trend: 'stable' as const,
  engagement_trend: 'stable' as const,
};

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    trends: goodTrends,
  },
};

export const ExcellentProgress: Story = {
  args: {
    trends: excellentTrends,
  },
  parameters: {
    docs: {
      description: {
        story: 'Excellent progress with all metrics improving.',
      },
    },
  },
};

export const MixedProgress: Story = {
  args: {
    trends: mixedTrends,
  },
  parameters: {
    docs: {
      description: {
        story: 'Mixed progress with some metrics improving, others declining.',
      },
    },
  },
};

export const ConcerningTrends: Story = {
  args: {
    trends: concerningTrends,
  },
  parameters: {
    docs: {
      description: {
        story: 'Concerning trends requiring attention and intervention.',
      },
    },
  },
};

export const StableTrends: Story = {
  args: {
    trends: stableTrends,
  },
  parameters: {
    docs: {
      description: {
        story: 'All metrics stable with consistent performance.',
      },
    },
  },
};

// ===== INDIVIDUAL TREND STORIES =====

export const StressImproving: Story = {
  args: {
    trends: {
      stress_trend: 'improving' as const,
      energy_trend: 'stable' as const,
      sleep_trend: 'stable' as const,
      engagement_trend: 'stable' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Stress management showing improvement while other metrics remain stable.',
      },
    },
  },
};

export const EnergyDeclining: Story = {
  args: {
    trends: {
      stress_trend: 'stable' as const,
      energy_trend: 'declining' as const,
      sleep_trend: 'stable' as const,
      engagement_trend: 'stable' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Energy levels declining, requiring attention to boost strategies.',
      },
    },
  },
};

export const SleepRecovery: Story = {
  args: {
    trends: {
      stress_trend: 'stable' as const,
      energy_trend: 'improving' as const,
      sleep_trend: 'improving' as const,
      engagement_trend: 'stable' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Sleep quality improving, positively affecting energy levels.',
      },
    },
  },
};

export const EngagementBoost: Story = {
  args: {
    trends: {
      stress_trend: 'stable' as const,
      energy_trend: 'stable' as const,
      sleep_trend: 'stable' as const,
      engagement_trend: 'improving' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'User engagement improving with LifeOS platform.',
      },
    },
  },
};

// ===== PATTERN STORIES =====

export const PositiveMomentum: Story = {
  args: {
    trends: {
      stress_trend: 'improving' as const,
      energy_trend: 'improving' as const,
      sleep_trend: 'stable' as const,
      engagement_trend: 'improving' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Strong positive momentum with multiple improving metrics.',
      },
    },
  },
};

export const RecoveryPattern: Story = {
  args: {
    trends: {
      stress_trend: 'improving' as const,
      energy_trend: 'stable' as const,
      sleep_trend: 'improving' as const,
      engagement_trend: 'stable' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Recovery pattern showing stress and sleep improvements.',
      },
    },
  },
};

export const BurnoutRisk: Story = {
  args: {
    trends: {
      stress_trend: 'declining' as const,
      energy_trend: 'declining' as const,
      sleep_trend: 'declining' as const,
      engagement_trend: 'declining' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Potential burnout pattern with all metrics declining.',
      },
    },
  },
};

export const StressEnergyConflict: Story = {
  args: {
    trends: {
      stress_trend: 'declining' as const,
      energy_trend: 'improving' as const,
      sleep_trend: 'stable' as const,
      engagement_trend: 'stable' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Conflicting stress and energy trends requiring targeted intervention.',
      },
    },
  },
};

// ===== DISPLAY VARIANTS =====

export const NoAnimations: Story = {
  args: {
    trends: excellentTrends,
    showAnimation: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Component without animations for faster rendering.',
      },
    },
  },
};

// ===== PRESET COMPONENTS =====

export const WeeklyTrendsPreset: Story = {
  render: () => (
    <WeeklyTrendsMetrics trends={goodTrends} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset component for weekly trends display.',
      },
    },
  },
};

export const CompactPreset: Story = {
  render: () => (
    <CompactMetrics trends={mixedTrends} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact preset for sidebar or minimal space display.',
      },
    },
  },
};

// ===== INSIGHTS TESTING =====

export const InsightExcellentProgress: Story = {
  args: {
    trends: excellentTrends,
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing insight generation for excellent progress pattern.',
      },
    },
  },
};

export const InsightNeedsAttention: Story = {
  args: {
    trends: {
      stress_trend: 'declining' as const,
      energy_trend: 'declining' as const,
      sleep_trend: 'stable' as const,
      engagement_trend: 'stable' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing insight generation for patterns requiring attention.',
      },
    },
  },
};

export const InsightSleepFocus: Story = {
  args: {
    trends: {
      stress_trend: 'stable' as const,
      energy_trend: 'stable' as const,
      sleep_trend: 'declining' as const,
      engagement_trend: 'stable' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing insight generation for sleep-related concerns.',
      },
    },
  },
};

export const InsightEngagementDrop: Story = {
  args: {
    trends: {
      stress_trend: 'stable' as const,
      energy_trend: 'stable' as const,
      sleep_trend: 'stable' as const,
      engagement_trend: 'declining' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing insight generation for declining engagement.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    trends: mixedTrends,
    showAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use controls to test different trend combinations.',
      },
    },
  },
};

// ===== LIFEOS USAGE EXAMPLES =====

export const DashboardIntegration: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gap: '20px', 
      maxWidth: '1000px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <h3 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
        Weekly Dashboard Overview
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <QuickMetrics trends={goodTrends} />
        
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '20px', 
          borderRadius: '12px',
          color: '#e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>This Week</h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Advice Completed:</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>18</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Avg. Life Score:</span>
              <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>7.2</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Streak Days:</span>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Quick Metrics integrated in dashboard layout with complementary stats.',
      },
    },
  },
};

export const MobileView: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '375px',
      margin: '0 auto',
      backgroundColor: '#0f172a',
      padding: '16px',
      borderRadius: '24px',
      border: '8px solid #374151'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        color: '#ffffff',
        fontSize: '14px',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        <span>9:41</span>
        <span>LifeOS</span>
        <span>100%</span>
      </div>
      
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h3 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '20px' }}>
          Tendenze Settimanali
        </h3>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Come stai progredendo
        </p>
      </div>
      
      <QuickMetrics trends={goodTrends} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Quick Metrics optimized for mobile interface.',
      },
    },
  },
};

export const SidebarWidget: Story = {
  render: () => (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      gap: '20px',
      maxWidth: '800px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <div>
        <h4 style={{ color: '#ffffff', margin: '0 0 16px 0', fontSize: '16px' }}>
          Quick Overview
        </h4>
        <CompactMetrics trends={mixedTrends} />
        
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <h5 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '14px' }}>
            Insight
          </h5>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '12px', lineHeight: '1.4' }}>
            Lo stress in aumento potrebbe influire sui tuoi progressi energetici.
          </p>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#1e293b', 
        padding: '20px', 
        borderRadius: '12px',
        color: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Main Content Area</h4>
          <p style={{ margin: 0, color: '#94a3b8' }}>
            Detailed metrics and analysis would appear here
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact metrics as sidebar widget alongside main content.',
      },
    },
  },
};

export const WeeklyReportHeader: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '700px',
      backgroundColor: '#0f172a',
      padding: '24px',
      borderRadius: '16px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
          Report Settimanale
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
          30 Agosto - 6 Settembre 2024
        </p>
      </div>
      
      <QuickMetrics trends={excellentTrends} showAnimation={false} />
      
      <div style={{ 
        marginTop: '24px',
        padding: '20px',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        borderLeft: '4px solid #10b981'
      }}>
        <h4 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '16px' }}>
          Congratulazioni!
        </h4>
        <p style={{ color: '#e2e8f0', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
          Hai fatto progressi eccellenti in tutte le aree questa settimana. 
          Il tuo impegno costante sta dando ottimi risultati.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Quick Metrics as header for weekly report with summary.',
      },
    },
  },
};

// ===== COMPARATIVE ANALYSIS =====

export const TrendComparison: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gap: '20px', 
      maxWidth: '900px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <h3 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
        Analisi Comparativa Tendenze
      </h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <h4 style={{ color: '#10b981', margin: '0 0 12px 0', fontSize: '18px' }}>
            Progresso Eccellente
          </h4>
          <QuickMetrics trends={excellentTrends} showAnimation={false} />
        </div>
        
        <div>
          <h4 style={{ color: '#f59e0b', margin: '0 0 12px 0', fontSize: '18px' }}>
            Progresso Misto
          </h4>
          <QuickMetrics trends={mixedTrends} showAnimation={false} />
        </div>
        
        <div>
          <h4 style={{ color: '#ef4444', margin: '0 0 12px 0', fontSize: '18px' }}>
            Tendenze Preoccupanti
          </h4>
          <QuickMetrics trends={concerningTrends} showAnimation={false} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparative analysis showing different trend scenarios and their insights.',
      },
    },
  },
};

// ===== EDGE CASES =====

export const AllImproving: Story = {
  args: {
    trends: excellentTrends,
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case with all metrics improving - testing celebration messaging.',
      },
    },
  },
};

export const AllDeclining: Story = {
  args: {
    trends: {
      stress_trend: 'declining' as const,
      energy_trend: 'declining' as const,
      sleep_trend: 'declining' as const,
      engagement_trend: 'declining' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case with all metrics declining - testing intervention messaging.',
      },
    },
  },
};

export const AllStable: Story = {
  args: {
    trends: stableTrends,
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case with all metrics stable - testing maintenance messaging.',
      },
    },
  },
};

// ===== ACCESSIBILITY DEMO =====

export const AccessibilityDemo: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Accessibility Features</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Trend Indicators</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Multiple visual cues ensure trend direction is clear for all users.
        </p>
        <QuickMetrics trends={mixedTrends} showAnimation={false} />
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Features Include:</h4>
        <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
          <li>Color + arrow + text combinations for trend direction</li>
          <li>High contrast colors meeting WCAG guidelines</li>
          <li>Descriptive text for each trend status</li>
          <li>Semantic structure for screen reader navigation</li>
          <li>Keyboard-accessible metric cards</li>
          <li>Clear insights with actionable language</li>
          <li>Summary indicators for quick understanding</li>
          <li>Consistent icon usage across all metrics</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features ensuring trend analysis is inclusive.',
      },
    },
  },
};
