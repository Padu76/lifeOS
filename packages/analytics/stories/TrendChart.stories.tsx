import type { Meta, StoryObj } from '@storybook/react';
import { TrendChart, LifeScoreTrendChart, EngagementTrendChart, CompletionTrendChart, MiniTrendChart, MultiSeriesChart } from '@lifeos/analytics';

const meta = {
  title: 'Analytics/TrendChart',
  component: TrendChart,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile trend chart component for visualizing metric data over time. Supports line, bar, and area charts with smooth animations, grid lines, and trend indicators. Perfect for analytics dashboards and data visualization.',
      },
    },
  },
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of metric trend data points',
      table: {
        type: { summary: 'MetricTrend[]' },
        defaultValue: { summary: '[]' },
      },
    },
    height: {
      control: { type: 'range', min: 100, max: 400, step: 20 },
      description: 'Chart height in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '200' },
      },
    },
    color: {
      control: 'color',
      description: 'Primary chart color',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#7c3aed' },
      },
    },
    showGrid: {
      control: 'boolean',
      description: 'Show grid lines',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showLabels: {
      control: 'boolean',
      description: 'Show metric labels',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    animated: {
      control: 'boolean',
      description: 'Enable entry animations',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    type: {
      control: { type: 'select' },
      options: ['line', 'bar', 'area'],
      description: 'Chart visualization type',
      table: {
        type: { summary: 'line | bar | area' },
        defaultValue: { summary: 'line' },
      },
    },
    style: {
      control: 'object',
      description: 'Additional container styles',
    },
  },
} satisfies Meta<typeof TrendChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const sampleTrendData = [
  {
    metric_name: 'Energy',
    current_value: 7.2,
    previous_value: 6.8,
    change_percentage: 5.9,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Stress',
    current_value: 4.1,
    previous_value: 4.5,
    change_percentage: -8.9,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Focus',
    current_value: 6.8,
    previous_value: 7.1,
    change_percentage: -4.2,
    trend: 'declining' as const,
  },
  {
    metric_name: 'Sleep',
    current_value: 8.1,
    previous_value: 8.0,
    change_percentage: 1.3,
    trend: 'stable' as const,
  },
  {
    metric_name: 'Mood',
    current_value: 7.5,
    previous_value: 7.0,
    change_percentage: 7.1,
    trend: 'improving' as const,
  },
];

const weeklyData = [
  {
    metric_name: 'Mon',
    current_value: 6.5,
    previous_value: 6.2,
    change_percentage: 4.8,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Tue',
    current_value: 7.2,
    previous_value: 6.9,
    change_percentage: 4.3,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Wed',
    current_value: 6.8,
    previous_value: 7.1,
    change_percentage: -4.2,
    trend: 'declining' as const,
  },
  {
    metric_name: 'Thu',
    current_value: 8.1,
    previous_value: 7.8,
    change_percentage: 3.8,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Fri',
    current_value: 7.9,
    previous_value: 8.2,
    change_percentage: -3.7,
    trend: 'declining' as const,
  },
  {
    metric_name: 'Sat',
    current_value: 8.4,
    previous_value: 8.1,
    change_percentage: 3.7,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Sun',
    current_value: 7.6,
    previous_value: 7.3,
    change_percentage: 4.1,
    trend: 'improving' as const,
  },
];

const monthlyData = [
  {
    metric_name: 'Week 1',
    current_value: 6.8,
    previous_value: 6.5,
    change_percentage: 4.6,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Week 2',
    current_value: 7.2,
    previous_value: 6.8,
    change_percentage: 5.9,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Week 3',
    current_value: 7.5,
    previous_value: 7.2,
    change_percentage: 4.2,
    trend: 'improving' as const,
  },
  {
    metric_name: 'Week 4',
    current_value: 7.1,
    previous_value: 7.5,
    change_percentage: -5.3,
    trend: 'declining' as const,
  },
];

// Basic Stories
export const Default: Story = {
  args: {
    data: sampleTrendData,
    height: 200,
    color: '#7c3aed',
    showGrid: true,
    showLabels: true,
    animated: true,
    type: 'line',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
      <div>
        <h3 style={{ marginBottom: '12px', color: '#fff' }}>Line Chart</h3>
        <TrendChart
          data={sampleTrendData}
          height={180}
          color="#3b82f6"
          type="line"
        />
      </div>
      <div>
        <h3 style={{ marginBottom: '12px', color: '#fff' }}>Bar Chart</h3>
        <TrendChart
          data={sampleTrendData}
          height={180}
          color="#10b981"
          type="bar"
        />
      </div>
      <div>
        <h3 style={{ marginBottom: '12px', color: '#fff' }}>Area Chart</h3>
        <TrendChart
          data={sampleTrendData}
          height={180}
          color="#f59e0b"
          type="area"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all three chart types: line, bar, and area.',
      },
    },
  },
};

export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', padding: '20px' }}>
      <div>
        <h4 style={{ marginBottom: '8px', color: '#fff' }}>Purple (Default)</h4>
        <TrendChart data={sampleTrendData} height={160} color="#7c3aed" />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px', color: '#fff' }}>Blue</h4>
        <TrendChart data={sampleTrendData} height={160} color="#3b82f6" />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px', color: '#fff' }}>Green</h4>
        <TrendChart data={sampleTrendData} height={160} color="#10b981" />
      </div>
      <div>
        <h4 style={{ marginBottom: '8px', color: '#fff' }}>Orange</h4>
        <TrendChart data={sampleTrendData} height={160} color="#f97316" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different color schemes for various metrics and branding.',
      },
    },
  },
};

export const NoGrid: Story = {
  args: {
    data: sampleTrendData,
    height: 200,
    color: '#ef4444',
    showGrid: false,
    showLabels: true,
    animated: true,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Clean chart without grid lines for minimal design.',
      },
    },
  },
};

export const NoLabels: Story = {
  args: {
    data: sampleTrendData,
    height: 160,
    color: '#8b5cf6',
    showGrid: true,
    showLabels: false,
    animated: true,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart without labels for embedded use in compact spaces.',
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    data: sampleTrendData,
    height: 200,
    color: '#06b6d4',
    showGrid: true,
    showLabels: true,
    animated: false,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Static chart without entry animations for immediate display.',
      },
    },
  },
};

export const LargeChart: Story = {
  args: {
    data: weeklyData,
    height: 300,
    color: '#7c3aed',
    showGrid: true,
    showLabels: true,
    animated: true,
    type: 'area',
  },
  parameters: {
    docs: {
      description: {
        story: 'Larger chart suitable for detailed analysis and presentations.',
      },
    },
  },
};

export const CompactChart: Story = {
  args: {
    data: sampleTrendData.slice(0, 3),
    height: 120,
    color: '#f59e0b',
    showGrid: false,
    showLabels: false,
    animated: true,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact chart for dashboard widgets and small spaces.',
      },
    },
  },
};

// LifeOS Preset Components
export const LifeScoreTrend: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '16px', color: '#fff' }}>Life Score Trend</h3>
      <LifeScoreTrendChart data={monthlyData} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset component for Life Score trending with area chart visualization.',
      },
    },
  },
};

export const EngagementTrend: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '16px', color: '#fff' }}>Engagement Trend</h3>
      <EngagementTrendChart data={weeklyData} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset component for engagement metrics with line chart visualization.',
      },
    },
  },
};

export const CompletionTrend: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '16px', color: '#fff' }}>Completion Trend</h3>
      <CompletionTrendChart data={weeklyData} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset component for completion rates with bar chart visualization.',
      },
    },
  },
};

export const MiniTrends: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '20px' }}>
      <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Energy</h4>
        <MiniTrendChart data={sampleTrendData.slice(0, 4)} color="#10b981" />
      </div>
      <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Stress</h4>
        <MiniTrendChart data={sampleTrendData.slice(1, 5)} color="#ef4444" />
      </div>
      <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>Focus</h4>
        <MiniTrendChart data={sampleTrendData.slice(0, 3)} color="#3b82f6" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mini trend charts for dashboard widgets and metric cards.',
      },
    },
  },
};

export const MultiSeries: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '16px', color: '#fff' }}>Multi-Series Chart</h3>
      <MultiSeriesChart
        height={250}
        series={[
          {
            name: 'Energy',
            data: weeklyData.map(d => ({ ...d, current_value: d.current_value + 1 })),
            color: '#10b981',
          },
          {
            name: 'Mood',
            data: weeklyData.map(d => ({ ...d, current_value: d.current_value - 0.5 })),
            color: '#3b82f6',
          },
          {
            name: 'Focus',
            data: weeklyData.map(d => ({ ...d, current_value: d.current_value + 0.2 })),
            color: '#f59e0b',
          },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Advanced multi-series chart for comparing multiple metrics over time.',
      },
    },
  },
};

// Edge Cases
export const EmptyData: Story = {
  args: {
    data: [],
    height: 200,
    color: '#7c3aed',
    showGrid: true,
    showLabels: true,
    animated: true,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no data is available.',
      },
    },
  },
};

export const SingleDataPoint: Story = {
  args: {
    data: [sampleTrendData[0]],
    height: 200,
    color: '#7c3aed',
    showGrid: true,
    showLabels: true,
    animated: true,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart with only one data point.',
      },
    },
  },
};

export const AllImprovingTrend: Story = {
  args: {
    data: sampleTrendData.map(d => ({ ...d, trend: 'improving' as const })),
    height: 200,
    color: '#10b981',
    showGrid: true,
    showLabels: true,
    animated: true,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart where all metrics are improving (positive trend).',
      },
    },
  },
};

export const AllDecliningTrend: Story = {
  args: {
    data: sampleTrendData.map(d => ({ ...d, trend: 'declining' as const })),
    height: 200,
    color: '#ef4444',
    showGrid: true,
    showLabels: true,
    animated: true,
    type: 'line',
  },
  parameters: {
    docs: {
      description: {
        story: 'Chart where all metrics are declining (negative trend).',
      },
    },
  },
};

// Real LifeOS Usage Examples
export const DashboardWidget: Story = {
  render: () => (
    <div style={{ 
      backgroundColor: '#16213e', 
      borderRadius: '12px', 
      padding: '16px',
      maxWidth: '320px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <h3 style={{ fontSize: '16px', color: '#fff', margin: 0 }}>Weekly Progress</h3>
        <span style={{ fontSize: '12px', color: '#10b981' }}>+5.2%</span>
      </div>
      <TrendChart
        data={weeklyData}
        height={140}
        color="#7c3aed"
        type="area"
        showGrid={false}
        showLabels={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Chart integrated into a dashboard widget card.',
      },
    },
  },
};

export const AnalyticsPage: Story = {
  render: () => (
    <div style={{ 
      backgroundColor: '#0f172a', 
      padding: '24px',
      borderRadius: '16px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Analytics Overview</h2>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Weekly wellness metrics performance</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px' }}>Life Score Trend</h3>
          <TrendChart
            data={monthlyData}
            height={200}
            color="#7c3aed"
            type="area"
          />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px' }}>Daily Metrics</h3>
          <TrendChart
            data={weeklyData}
            height={200}
            color="#3b82f6"
            type="line"
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Charts used in a full analytics page layout.',
      },
    },
  },
};

// Interactive Examples
export const InteractiveDemo: Story = {
  render: (args) => {
    const [chartType, setChartType] = React.useState<'line' | 'bar' | 'area'>('line');
    const [showAnimation, setShowAnimation] = React.useState(true);
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value as any)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
          </select>
          <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox"
              checked={showAnimation}
              onChange={(e) => setShowAnimation(e.target.checked)}
            />
            Animation
          </label>
        </div>
        <TrendChart
          {...args}
          type={chartType}
          animated={showAnimation}
          key={`${chartType}-${showAnimation}`} // Force re-render for animation
        />
      </div>
    );
  },
  args: {
    data: sampleTrendData,
    height: 200,
    color: '#7c3aed',
    showGrid: true,
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with controls for chart type and animation.',
      },
    },
  },
};
