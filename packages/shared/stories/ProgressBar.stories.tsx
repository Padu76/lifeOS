import type { Meta, StoryObj } from '@storybook/react';
import { ProgressBar, LifeScoreProgressBar, OnboardingProgressBar, DownloadProgressBar, HealthMetricProgressBar, CircularProgress, StepProgress } from '@lifeos/shared';

const meta = {
  title: 'Shared/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Progress Bar component provides visual feedback for completion states, loading processes, and goal tracking. Features customizable styling, animations, gradients, and accessibility support. Essential for user engagement and progress communication.',
      },
    },
  },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value from 0 to 100',
      table: {
        type: { summary: 'number' },
      },
    },
    height: {
      control: { type: 'range', min: 4, max: 24, step: 2 },
      description: 'Progress bar height in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '8' },
      },
    },
    color: {
      control: 'color',
      description: 'Progress fill color',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#7c3aed' },
      },
    },
    backgroundColor: {
      control: 'color',
      description: 'Background track color',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#374151' },
      },
    },
    showPercentage: {
      control: 'boolean',
      description: 'Show percentage text',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showLabel: {
      control: 'boolean',
      description: 'Show label text above bar',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      control: 'text',
      description: 'Label text when showLabel is true',
      table: {
        type: { summary: 'string' },
      },
    },
    animated: {
      control: 'boolean',
      description: 'Enable progress animation',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    animationDuration: {
      control: { type: 'range', min: 200, max: 2000, step: 100 },
      description: 'Animation duration in milliseconds',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '800' },
      },
    },
    rounded: {
      control: 'boolean',
      description: 'Use rounded corners',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    gradient: {
      control: 'boolean',
      description: 'Use gradient colors based on progress',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    striped: {
      control: 'boolean',
      description: 'Add animated stripe pattern',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    glowing: {
      control: 'boolean',
      description: 'Add glow effect',
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
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Progress Values
export const LowProgress: Story = {
  args: {
    progress: 25,
    height: 8,
    color: '#7c3aed',
    backgroundColor: '#374151',
    showPercentage: true,
    animated: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at 25% completion.',
      },
    },
  },
};

export const MediumProgress: Story = {
  args: {
    progress: 60,
    height: 8,
    color: '#7c3aed',
    backgroundColor: '#374151',
    showPercentage: true,
    animated: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at 60% completion.',
      },
    },
  },
};

export const HighProgress: Story = {
  args: {
    progress: 85,
    height: 8,
    color: '#7c3aed',
    backgroundColor: '#374151',
    showPercentage: true,
    animated: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at 85% completion.',
      },
    },
  },
};

export const CompleteProgress: Story = {
  args: {
    progress: 100,
    height: 8,
    color: '#10b981',
    backgroundColor: '#374151',
    showPercentage: true,
    animated: true,
    rounded: true,
    glowing: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Completed progress bar with green color and glow effect.',
      },
    },
  },
};

export const ZeroProgress: Story = {
  args: {
    progress: 0,
    height: 8,
    color: '#7c3aed',
    backgroundColor: '#374151',
    showPercentage: true,
    animated: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar at 0% (starting state).',
      },
    },
  },
};

// Size and Style Variants
export const ThinBar: Story = {
  args: {
    progress: 65,
    height: 4,
    color: '#3b82f6',
    showPercentage: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Thin progress bar for subtle progress indication.',
      },
    },
  },
};

export const ThickBar: Story = {
  args: {
    progress: 45,
    height: 16,
    color: '#f59e0b',
    showPercentage: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Thick progress bar for prominent display.',
      },
    },
  },
};

export const SquareCorners: Story = {
  args: {
    progress: 72,
    height: 10,
    color: '#ef4444',
    showPercentage: true,
    rounded: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with square corners for modern design.',
      },
    },
  },
};

// Color Variants
export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', minWidth: '300px' }}>
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px' }}>Purple (Default)</h4>
        <ProgressBar progress={65} color="#7c3aed" showPercentage={false} />
      </div>
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px' }}>Blue</h4>
        <ProgressBar progress={78} color="#3b82f6" showPercentage={false} />
      </div>
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px' }}>Green</h4>
        <ProgressBar progress={92} color="#10b981" showPercentage={false} />
      </div>
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px' }}>Orange</h4>
        <ProgressBar progress={45} color="#f97316" showPercentage={false} />
      </div>
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '12px' }}>Red</h4>
        <ProgressBar progress={23} color="#ef4444" showPercentage={false} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different color variants for various contexts.',
      },
    },
  },
};

// Feature Variants
export const WithLabel: Story = {
  args: {
    progress: 73,
    height: 8,
    color: '#7c3aed',
    showLabel: true,
    label: 'Download Progress',
    showPercentage: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with descriptive label above.',
      },
    },
  },
};

export const WithoutPercentage: Story = {
  args: {
    progress: 58,
    height: 8,
    color: '#10b981',
    showPercentage: false,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar without percentage display for cleaner look.',
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    progress: 42,
    height: 8,
    color: '#f59e0b',
    animated: false,
    showPercentage: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Static progress bar without animation.',
      },
    },
  },
};

export const SlowAnimation: Story = {
  args: {
    progress: 67,
    height: 8,
    color: '#8b5cf6',
    animated: true,
    animationDuration: 2000,
    showPercentage: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with slower animation for dramatic effect.',
      },
    },
  },
};

// Advanced Features
export const GradientProgress: Story = {
  args: {
    progress: 75,
    height: 12,
    gradient: true,
    showPercentage: true,
    rounded: true,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with gradient colors based on completion level.',
      },
    },
  },
};

export const StripedProgress: Story = {
  args: {
    progress: 55,
    height: 10,
    color: '#3b82f6',
    striped: true,
    showPercentage: true,
    rounded: true,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with animated stripe pattern.',
      },
    },
  },
};

export const GlowingProgress: Story = {
  args: {
    progress: 88,
    height: 10,
    color: '#10b981',
    glowing: true,
    showPercentage: true,
    rounded: true,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with glow effect for emphasis.',
      },
    },
  },
};

export const AllFeatures: Story = {
  args: {
    progress: 82,
    height: 14,
    gradient: true,
    striped: true,
    glowing: true,
    showLabel: true,
    label: 'Ultimate Progress',
    showPercentage: true,
    rounded: true,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with all visual features enabled.',
      },
    },
  },
};

// Preset Component Stories
export const LifeScoreProgress: Story = {
  render: () => (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Life Score Progress</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <LifeScoreProgressBar score={8.4} />
        <LifeScoreProgressBar score={6.7} />
        <LifeScoreProgressBar score={9.1} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset Life Score progress bars with gradient and glow effects.',
      },
    },
  },
};

export const OnboardingProgress: Story = {
  render: () => (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Onboarding Steps</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>Step 2 of 5</p>
          <OnboardingProgressBar currentStep={2} totalSteps={5} />
        </div>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>Step 4 of 7</p>
          <OnboardingProgressBar currentStep={4} totalSteps={7} />
        </div>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>Step 5 of 5 (Complete)</p>
          <OnboardingProgressBar currentStep={5} totalSteps={5} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Onboarding progress indicators for multi-step processes.',
      },
    },
  },
};

export const DownloadProgress: Story = {
  render: () => (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Download Progress</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <DownloadProgressBar progress={0} />
        <DownloadProgressBar progress={33} />
        <DownloadProgressBar progress={67} />
        <DownloadProgressBar progress={100} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Download progress bars with striped animation and percentage display.',
      },
    },
  },
};

export const HealthMetrics: Story = {
  render: () => (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Health Metrics</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <HealthMetricProgressBar value={8.2} label="Energy Level" />
        <HealthMetricProgressBar value={6.8} label="Sleep Quality" />
        <HealthMetricProgressBar value={7.5} label="Mood Rating" />
        <HealthMetricProgressBar value={5.3} label="Stress Level" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Health metric progress bars with labels and gradient colors.',
      },
    },
  },
};

// Alternative Progress Components
export const CircularProgressDemo: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Circular Progress</h3>
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
        <CircularProgress progress={25} size={60} color="#ef4444" />
        <CircularProgress progress={65} size={80} color="#f59e0b" />
        <CircularProgress progress={90} size={100} color="#10b981" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Circular progress indicators for compact displays.',
      },
    },
  },
};

export const StepProgressDemo: Story = {
  render: () => (
    <div style={{ padding: '20px', minWidth: '300px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Step Progress</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>3 of 5 steps</p>
          <StepProgress currentStep={3} totalSteps={5} />
        </div>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>2 of 4 steps</p>
          <StepProgress currentStep={2} totalSteps={4} />
        </div>
        <div>
          <p style={{ color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>7 of 7 steps (Complete)</p>
          <StepProgress currentStep={7} totalSteps={7} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Step-based progress indicators with discrete segments.',
      },
    },
  },
};

// Real LifeOS Usage Examples
export const DashboardProgress: Story = {
  render: () => (
    <div style={{ 
      padding: '24px',
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      minWidth: '400px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>Today's Progress</h2>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Your wellness goals for today</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#e5e7eb', fontSize: '14px' }}>Daily Goals</span>
            <span style={{ color: '#7c3aed', fontSize: '14px', fontWeight: 'bold' }}>7/9</span>
          </div>
          <ProgressBar progress={78} color="#7c3aed" height={8} showPercentage={false} />
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#e5e7eb', fontSize: '14px' }}>Water Intake</span>
            <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 'bold' }}>6/8 glasses</span>
          </div>
          <ProgressBar progress={75} color="#3b82f6" height={8} showPercentage={false} />
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#e5e7eb', fontSize: '14px' }}>Active Time</span>
            <span style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold' }}>45/60 min</span>
          </div>
          <ProgressBar progress={75} color="#10b981" height={8} showPercentage={false} glowing />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard progress tracking for daily wellness goals.',
      },
    },
  },
};

export const SkillLevels: Story = {
  render: () => (
    <div style={{ padding: '20px', minWidth: '350px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Skill Development</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>Mindfulness Practice</h4>
          <ProgressBar
            progress={85}
            height={10}
            gradient
            showLabel
            label="Expert Level"
            showPercentage={false}
            glowing
          />
        </div>
        
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>Stress Management</h4>
          <ProgressBar
            progress={65}
            height={10}
            gradient
            showLabel
            label="Advanced"
            showPercentage={false}
          />
        </div>
        
        <div style={{ backgroundColor: '#16213e', padding: '16px', borderRadius: '8px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>Sleep Optimization</h4>
          <ProgressBar
            progress={40}
            height={10}
            gradient
            showLabel
            label="Intermediate"
            showPercentage={false}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skill level progress tracking with gradient colors.',
      },
    },
  },
};

// Interactive Examples
export const InteractiveDemo: Story = {
  render: () => {
    const [progress, setProgress] = React.useState(50);
    const [height, setHeight] = React.useState(8);
    const [gradient, setGradient] = React.useState(false);
    const [striped, setStriped] = React.useState(false);
    const [glowing, setGlowing] = React.useState(false);
    
    return (
      <div style={{ padding: '20px', minWidth: '400px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>Progress Bar Customizer</h3>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', minWidth: '80px' }}>Progress:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#fff', minWidth: '40px' }}>{progress}%</span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', minWidth: '80px' }}>Height:</span>
            <input
              type="range"
              min="4"
              max="20"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ color: '#fff', minWidth: '40px' }}>{height}px</span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox"
                checked={gradient}
                onChange={(e) => setGradient(e.target.checked)}
              />
              Gradient
            </label>
            <label style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox"
                checked={striped}
                onChange={(e) => setStriped(e.target.checked)}
              />
              Striped
            </label>
            <label style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox"
                checked={glowing}
                onChange={(e) => setGlowing(e.target.checked)}
              />
              Glowing
            </label>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#16213e', 
          padding: '24px', 
          borderRadius: '8px' 
        }}>
          <ProgressBar
            progress={progress}
            height={height}
            gradient={gradient}
            striped={striped}
            glowing={glowing}
            showPercentage={true}
            showLabel={true}
            label="Custom Progress Bar"
            animated={true}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with controls for all progress bar features.',
      },
    },
  },
};

// Edge Cases
export const OverflowProgress: Story = {
  args: {
    progress: 120,
    height: 8,
    color: '#ef4444',
    showPercentage: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with value over 100% (clamped to 100%).',
      },
    },
  },
};

export const NegativeProgress: Story = {
  args: {
    progress: -10,
    height: 8,
    color: '#7c3aed',
    showPercentage: true,
    rounded: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress bar with negative value (clamped to 0%).',
      },
    },
  },
};

// Accessibility Examples
export const AccessibilityDemo: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Accessibility Features</h3>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>High Contrast</h4>
        <ProgressBar
          progress={70}
          height={12}
          color="#ffffff"
          backgroundColor="#000000"
          showPercentage={true}
          showLabel={true}
          label="High Contrast Progress"
        />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Large Size for Visibility</h4>
        <ProgressBar
          progress={55}
          height={16}
          color="#eab308"
          showPercentage={true}
          showLabel={true}
          label="Large Visible Progress"
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
        />
      </div>
      
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Screen Reader Support</h4>
        <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
          <p style={{ color: '#e5e7eb', fontSize: '12px', margin: 0 }}>
            Progress bars include ARIA labels and role attributes for screen readers.
            Progress values are announced clearly with percentage and label context.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including high contrast, large sizes, and screen reader support.',
      },
    },
  },
};
