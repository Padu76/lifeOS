import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard, PercentageCard, CounterCard, TimeCard, ScoreCard, MiniMetricCard, MetricGrid } from '@lifeos/shared';

const meta = {
  title: 'Shared/MetricCard',
  component: MetricCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Metric Card component displays key performance indicators with visual trend indicators, icons, and animations. Perfect for dashboards, analytics, and data visualization. Supports different sizes, trend directions, and interactive features.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Card title/metric name',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      control: 'text',
      description: 'Metric value (string or number)',
      table: {
        type: { summary: 'string | number' },
      },
    },
    subtitle: {
      control: 'text',
      description: 'Optional subtitle/description',
      table: {
        type: { summary: 'string' },
      },
    },
    icon: {
      control: 'text',
      description: 'Emoji or icon for the metric',
      table: {
        type: { summary: 'string' },
      },
    },
    trend: {
      control: { type: 'select' },
      options: ['improving', 'stable', 'declining', undefined],
      description: 'Trend direction affecting colors and indicators',
      table: {
        type: { summary: 'improving | stable | declining' },
      },
    },
    onPress: {
      action: 'cardPressed',
      description: 'Callback when card is pressed',
      table: {
        type: { summary: '() => void' },
      },
    },
    color: {
      control: 'color',
      description: 'Custom color (overridden by trend)',
      table: {
        type: { summary: 'string' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Card size variant',
      table: {
        type: { summary: 'small | medium | large' },
        defaultValue: { summary: 'medium' },
      },
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable entry animations',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showTrendArrow: {
      control: 'boolean',
      description: 'Show trend arrow indicator',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    gradient: {
      control: 'boolean',
      description: 'Enable gradient styling with shimmer effect',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    style: {
      control: 'object',
      description: 'Additional container styles',
    },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Trend Stories
export const ImprovingTrend: Story = {
  args: {
    title: 'Life Score',
    value: '8.2',
    subtitle: 'Overall wellbeing',
    icon: '🌟',
    trend: 'improving',
    size: 'medium',
    showAnimation: true,
    showTrendArrow: true,
    gradient: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Metric card showing positive improvement with green styling.',
      },
    },
  },
};

export const StableTrend: Story = {
  args: {
    title: 'Daily Steps',
    value: '8,547',
    subtitle: 'Target: 10,000',
    icon: '👟',
    trend: 'stable',
    size: 'medium',
    showAnimation: true,
    showTrendArrow: true,
    gradient: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Metric card showing stable trend with neutral styling.',
      },
    },
  },
};

export const DecliningTrend: Story = {
  args: {
    title: 'Sleep Quality',
    value: '6.1',
    subtitle: 'Needs attention',
    icon: '😴',
    trend: 'declining',
    size: 'medium',
    showAnimation: true,
    showTrendArrow: true,
    gradient: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Metric card showing declining trend with red styling.',
      },
    },
  },
};

export const NoTrend: Story = {
  args: {
    title: 'Total Sessions',
    value: '127',
    subtitle: 'This month',
    icon: '📊',
    color: '#7c3aed',
    size: 'medium',
    showAnimation: true,
    showTrendArrow: false,
    gradient: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Metric card without trend indicators for simple display.',
      },
    },
  },
};

// Size Variants
export const SmallSize: Story = {
  args: {
    title: 'Energy',
    value: '7.8',
    icon: '⚡',
    trend: 'improving',
    size: 'small',
    showAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Small metric card suitable for compact layouts.',
      },
    },
  },
};

export const MediumSize: Story = {
  args: {
    title: 'Stress Level',
    value: '3.2',
    subtitle: 'Low stress',
    icon: '🧘',
    trend: 'improving',
    size: 'medium',
    showAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium metric card for standard dashboard usage.',
      },
    },
  },
};

export const LargeSize: Story = {
  args: {
    title: 'Weekly Progress',
    value: '92%',
    subtitle: 'Excellent performance',
    icon: '🎯',
    trend: 'improving',
    size: 'large',
    showAnimation: true,
    gradient: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large metric card for featured metrics and detailed displays.',
      },
    },
  },
};

// Size Comparison
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '12px' }}>Small</h4>
        <MetricCard
          title="Focus"
          value="6.4"
          icon="🎯"
          trend="stable"
          size="small"
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '12px' }}>Medium</h4>
        <MetricCard
          title="Energy Level"
          value="7.8"
          subtitle="Good energy"
          icon="⚡"
          trend="improving"
          size="medium"
        />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '12px', fontSize: '12px' }}>Large</h4>
        <MetricCard
          title="Life Score"
          value="8.2"
          subtitle="Excellent wellbeing"
          icon="🌟"
          trend="improving"
          size="large"
          gradient
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all size variants.',
      },
    },
  },
};

// Gradient and Animation Stories
export const WithGradient: Story = {
  args: {
    title: 'Completion Rate',
    value: '89%',
    subtitle: 'Above target',
    icon: '✅',
    trend: 'improving',
    size: 'medium',
    showAnimation: true,
    gradient: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Metric card with gradient styling and shimmer effect.',
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    title: 'Quick Metric',
    value: '42',
    icon: '📈',
    trend: 'stable',
    size: 'medium',
    showAnimation: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Static metric card without entry animations.',
      },
    },
  },
};

// Value Types
export const NumericValue: Story = {
  args: {
    title: 'Sessions Count',
    value: 1247,
    subtitle: 'Total completed',
    icon: '🎯',
    trend: 'improving',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Metric card with numeric value (auto-formatted for large numbers).',
      },
    },
  },
};

export const PercentageValue: Story = {
  args: {
    title: 'Success Rate',
    value: '94.2%',
    subtitle: 'Excellent',
    icon: '🏆',
    trend: 'improving',
    size: 'medium',
    gradient: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Metric card with percentage value showing progress bar.',
      },
    },
  },
};

export const LargeNumericValue: Story = {
  args: {
    title: 'Total Points',
    value: 1547892,
    subtitle: 'Lifetime earned',
    icon: '💎',
    trend: 'improving',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large numeric value with K/M formatting (1.5M).',
      },
    },
  },
};

// Preset Component Stories
export const PercentageCardExample: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Percentage Card</h3>
      <PercentageCard
        title="Goal Achievement"
        percentage={87.5}
        icon="🎯"
        trend="improving"
        onPress={() => console.log('Percentage card pressed')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset percentage card with gradient styling.',
      },
    },
  },
};

export const CounterCardExample: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Counter Card</h3>
      <CounterCard
        title="Completed Tasks"
        count={156}
        subtitle="This week"
        icon="✅"
        color="#10b981"
        onPress={() => console.log('Counter card pressed')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset counter card without trend indicators.',
      },
    },
  },
};

export const TimeCardExample: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Time Card</h3>
      <div style={{ display: 'flex', gap: '16px' }}>
        <TimeCard
          title="Active Time"
          minutes={127}
          icon="⏱️"
          trend="improving"
        />
        <TimeCard
          title="Study Time"
          minutes={45}
          icon="📚"
          trend="stable"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Time cards with formatted duration display (hours/minutes).',
      },
    },
  },
};

export const ScoreCardExample: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Score Card</h3>
      <ScoreCard
        title="Wellness Score"
        score={7.8}
        maxScore={10}
        icon="🌟"
        trend="improving"
        onPress={() => console.log('Score card pressed')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Score card showing rating with maximum value.',
      },
    },
  },
};

export const MiniMetricCardExample: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Mini Metric Cards</h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        <MiniMetricCard
          title="Steps"
          value="8.2K"
          icon="👟"
          color="#3b82f6"
        />
        <MiniMetricCard
          title="Calories"
          value="420"
          icon="🔥"
          color="#ef4444"
        />
        <MiniMetricCard
          title="Distance"
          value="5.1km"
          icon="🏃"
          color="#10b981"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mini metric cards for compact layouts and sidebars.',
      },
    },
  },
};

// Real LifeOS Usage Examples
export const DashboardMetrics: Story = {
  render: () => (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#0f172a',
      borderRadius: '16px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Dashboard Overview</h2>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Your wellness metrics at a glance</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <MetricCard
          title="Life Score"
          value="8.4"
          subtitle="Excellent"
          icon="🌟"
          trend="improving"
          size="medium"
          gradient
          onPress={() => console.log('Life Score details')}
        />
        <MetricCard
          title="Daily Goals"
          value="7/9"
          subtitle="78% complete"
          icon="🎯"
          trend="stable"
          size="medium"
          onPress={() => console.log('Goals details')}
        />
        <MetricCard
          title="Streak"
          value="12"
          subtitle="Days active"
          icon="🔥"
          trend="improving"
          size="medium"
          onPress={() => console.log('Streak details')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard layout with key wellness metrics.',
      },
    },
  },
};

export const AnalyticsGrid: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Analytics Overview</h3>
      <MetricGrid
        metrics={[
          {
            title: 'Engagement Rate',
            value: '94.2%',
            subtitle: 'Above average',
            icon: '📈',
            trend: 'improving',
          },
          {
            title: 'Completion Rate',
            value: '87.5%',
            subtitle: 'Strong performance',
            icon: '✅',
            trend: 'stable',
          },
          {
            title: 'Average Rating',
            value: '4.6',
            subtitle: 'User satisfaction',
            icon: '⭐',
            trend: 'improving',
          },
          {
            title: 'Active Users',
            value: 15672,
            subtitle: 'This month',
            icon: '👥',
            trend: 'improving',
          },
        ]}
        columns={2}
      />
    </div>
  ),
  parameters: {
    docs
