import type { Meta, StoryObj } from '@storybook/react';
import { LifeScoreInput } from '@lifeos/dashboard';

const meta = {
  title: 'Dashboard/LifeScoreInput',
  component: LifeScoreInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Life Score Input component allows users to rate their stress, energy, and sleep levels on a 1-10 scale. Features interactive scoring, visual feedback, emotional indicators, and comprehensive assessment with breakdown visualization.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    stressLevel: {
      control: { type: 'range', min: 1, max: 10, step: 0.1 },
      description: 'Current stress level (1-10)',
      defaultValue: 5,
    },
    energyLevel: {
      control: { type: 'range', min: 1, max: 10, step: 0.1 },
      description: 'Current energy level (1-10)',
      defaultValue: 5,
    },
    sleepQuality: {
      control: { type: 'range', min: 1, max: 10, step: 0.1 },
      description: 'Sleep quality rating (1-10)',
      defaultValue: 5,
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable entry animations',
      defaultValue: true,
    },
    onStressChange: {
      action: 'stress-changed',
      description: 'Called when stress level changes',
    },
    onEnergyChange: {
      action: 'energy-changed',
      description: 'Called when energy level changes',
    },
    onSleepChange: {
      action: 'sleep-changed',
      description: 'Called when sleep quality changes',
    },
  },
} satisfies Meta<typeof LifeScoreInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    stressLevel: 5,
    energyLevel: 5,
    sleepQuality: 5,
  },
};

export const ExcellentDay: Story = {
  args: {
    stressLevel: 2,
    energyLevel: 9,
    sleepQuality: 9,
  },
  parameters: {
    docs: {
      description: {
        story: 'Excellent day with low stress, high energy, and great sleep.',
      },
    },
  },
};

export const DifficultDay: Story = {
  args: {
    stressLevel: 9,
    energyLevel: 2,
    sleepQuality: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Difficult day with high stress, low energy, and poor sleep.',
      },
    },
  },
};

export const MixedMetrics: Story = {
  args: {
    stressLevel: 7,
    energyLevel: 8,
    sleepQuality: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Mixed metrics showing varied wellness aspects.',
      },
    },
  },
};

// ===== STRESS LEVEL STORIES =====

export const VeryLowStress: Story = {
  args: {
    stressLevel: 1,
    energyLevel: 6,
    sleepQuality: 7,
  },
  parameters: {
    docs: {
      description: {
        story: 'Very low stress level showing green indicators and positive emoji.',
      },
    },
  },
};

export const ModerateStress: Story = {
  args: {
    stressLevel: 5,
    energyLevel: 6,
    sleepQuality: 6,
  },
  parameters: {
    docs: {
      description: {
        story: 'Moderate stress level in the middle range.',
      },
    },
  },
};

export const HighStress: Story = {
  args: {
    stressLevel: 8,
    energyLevel: 4,
    sleepQuality: 5,
  },
  parameters: {
    docs: {
      description: {
        story: 'High stress level showing red indicators and concerned emoji.',
      },
    },
  },
};

export const ExtremeStress: Story = {
  args: {
    stressLevel: 10,
    energyLevel: 2,
    sleepQuality: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Maximum stress level requiring immediate attention.',
      },
    },
  },
};

// ===== ENERGY LEVEL STORIES =====

export const HighEnergy: Story = {
  args: {
    stressLevel: 3,
    energyLevel: 9,
    sleepQuality: 8,
  },
  parameters: {
    docs: {
      description: {
        story: 'High energy level with positive indicators.',
      },
    },
  },
};

export const LowEnergy: Story = {
  args: {
    stressLevel: 6,
    energyLevel: 2,
    sleepQuality: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Low energy level indicating fatigue.',
      },
    },
  },
};

export const BalancedEnergy: Story = {
  args: {
    stressLevel: 4,
    energyLevel: 6,
    sleepQuality: 6,
  },
  parameters: {
    docs: {
      description: {
        story: 'Balanced energy level in the moderate range.',
      },
    },
  },
};

// ===== SLEEP QUALITY STORIES =====

export const ExcellentSleep: Story = {
  args: {
    stressLevel: 3,
    energyLevel: 8,
    sleepQuality: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Perfect sleep quality contributing to overall wellness.',
      },
    },
  },
};

export const PoorSleep: Story = {
  args: {
    stressLevel: 7,
    energyLevel: 3,
    sleepQuality: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Poor sleep quality affecting other metrics.',
      },
    },
  },
};

export const InconsistentSleep: Story = {
  args: {
    stressLevel: 5,
    energyLevel: 7,
    sleepQuality: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Inconsistent sleep despite good energy levels.',
      },
    },
  },
};

// ===== OVERALL ASSESSMENT STORIES =====

export const ExcellentOverall: Story = {
  args: {
    stressLevel: 2,
    energyLevel: 9,
    sleepQuality: 9,
  },
  parameters: {
    docs: {
      description: {
        story: 'Excellent overall assessment (average 8.7/10).',
      },
    },
  },
};

export const GoodOverall: Story = {
  args: {
    stressLevel: 4,
    energyLevel: 7,
    sleepQuality: 7,
  },
  parameters: {
    docs: {
      description: {
        story: 'Good overall assessment (average 6.7/10).',
      },
    },
  },
};

export const AverageOverall: Story = {
  args: {
    stressLevel: 6,
    energyLevel: 5,
    sleepQuality: 4,
  },
  parameters: {
    docs: {
      description: {
        story: 'Average overall assessment (average 5.0/10).',
      },
    },
  },
};

export const ChallengingOverall: Story = {
  args: {
    stressLevel: 9,
    energyLevel: 3,
    sleepQuality: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Challenging overall assessment (average 4.7/10).',
      },
    },
  },
};

// ===== COMMON PATTERNS =====

export const StressedButEnergetic: Story = {
  args: {
    stressLevel: 8,
    energyLevel: 8,
    sleepQuality: 6,
  },
  parameters: {
    docs: {
      description: {
        story: 'High stress but high energy - common in busy productive periods.',
      },
    },
  },
};

export const TiredAfterBadSleep: Story = {
  args: {
    stressLevel: 6,
    energyLevel: 3,
    sleepQuality: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Poor sleep leading to low energy and increased stress.',
      },
    },
  },
};

export const RelaxedButTired: Story = {
  args: {
    stressLevel: 2,
    energyLevel: 4,
    sleepQuality: 6,
  },
  parameters: {
    docs: {
      description: {
        story: 'Low stress but still feeling tired - need for energy boost.',
      },
    },
  },
};

export const RecoveringWell: Story = {
  args: {
    stressLevel: 4,
    energyLevel: 7,
    sleepQuality: 8,
  },
  parameters: {
    docs: {
      description: {
        story: 'Good recovery pattern with improving sleep and energy.',
      },
    },
  },
};

// ===== DISPLAY VARIANTS =====

export const NoAnimations: Story = {
  args: {
    stressLevel: 6,
    energyLevel: 7,
    sleepQuality: 5,
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

// ===== DECIMAL VALUES =====

export const PreciseValues: Story = {
  args: {
    stressLevel: 4.7,
    energyLevel: 6.3,
    sleepQuality: 7.8,
  },
  parameters: {
    docs: {
      description: {
        story: 'Precise decimal values showing fine-grained measurements.',
      },
    },
  },
};

export const HalfValues: Story = {
  args: {
    stressLevel: 5.5,
    energyLevel: 6.5,
    sleepQuality: 4.5,
  },
  parameters: {
    docs: {
      description: {
        story: 'Half-point values for more nuanced scoring.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    stressLevel: 5,
    energyLevel: 5,
    sleepQuality: 5,
    showAnimation: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - adjust sliders to see real-time feedback.',
      },
    },
  },
};

// ===== LIFEOS USAGE EXAMPLES =====

export const OnboardingFlow: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '600px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
          Benvenuto in LifeOS
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '16px' }}>
          Iniziamo con una valutazione del tuo stato attuale
        </p>
      </div>
      
      <LifeScoreInput
        stressLevel={5}
        energyLevel={5}
        sleepQuality={5}
        onStressChange={() => {}}
        onEnergyChange={() => {}}
        onSleepChange={() => {}}
      />
      
      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          Continua
        </button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Life Score Input in onboarding flow context.',
      },
    },
  },
};

export const DailyCheckIn: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '500px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '22px', fontWeight: 'bold' }}>
          Check-in Giornaliero
        </h3>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Giovedì, 6 Settembre • 14:30
        </p>
      </div>
      
      <LifeScoreInput
        stressLevel={6}
        energyLevel={4}
        sleepQuality={5}
        onStressChange={() => {}}
        onEnergyChange={() => {}}
        onSleepChange={() => {}}
        showAnimation={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Daily check-in context with current values.',
      },
    },
  },
};

export const MobileInterface: Story = {
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
      
      <LifeScoreInput
        stressLevel={7}
        energyLevel={3}
        sleepQuality={4}
        onStressChange={() => {}}
        onEnergyChange={() => {}}
        onSleepChange={() => {}}
      />
      
      <div style={{ 
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '4px',
        backgroundColor: '#374151',
        borderRadius: '2px'
      }} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Mobile interface with device frame context.',
      },
    },
  },
};

export const ProgressComparison: Story = {
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
        Confronto Progresso
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <div>
          <h4 style={{ color: '#ef4444', margin: '0 0 12px 0', fontSize: '16px' }}>
            Settimana Scorsa
          </h4>
          <LifeScoreInput
            stressLevel={8}
            energyLevel={3}
            sleepQuality={4}
            onStressChange={() => {}}
            onEnergyChange={() => {}}
            onSleepChange={() => {}}
            showAnimation={false}
          />
        </div>
        
        <div>
          <h4 style={{ color: '#10b981', margin: '0 0 12px 0', fontSize: '16px' }}>
            Questa Settimana
          </h4>
          <LifeScoreInput
            stressLevel={4}
            energyLevel={7}
            sleepQuality={7}
            onStressChange={() => {}}
            onEnergyChange={() => {}}
            onSleepChange={() => {}}
            showAnimation={false}
          />
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#1e293b', 
        padding: '16px', 
        borderRadius: '12px',
        borderLeft: '4px solid #10b981'
      }}>
        <p style={{ color: '#10b981', margin: 0, fontSize: '14px', fontWeight: '600' }}>
          📈 Miglioramento significativo! Il tuo Life Score è aumentato del 40% questa settimana.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Progress comparison showing improvement over time.',
      },
    },
  },
};

// ===== EDGE CASES =====

export const MinimumValues: Story = {
  args: {
    stressLevel: 1,
    energyLevel: 1,
    sleepQuality: 1,
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimum values across all metrics.',
      },
    },
  },
};

export const MaximumValues: Story = {
  args: {
    stressLevel: 10,
    energyLevel: 10,
    sleepQuality: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Maximum values across all metrics.',
      },
    },
  },
};

export const ExtremeContrast: Story = {
  args: {
    stressLevel: 10,
    energyLevel: 1,
    sleepQuality: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'Extreme contrast between metrics testing assessment logic.',
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
        <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Multi-Modal Input</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Multiple ways to interact and clear visual feedback for all users.
        </p>
        <LifeScoreInput
          stressLevel={6}
          energyLevel={7}
          sleepQuality={5}
          onStressChange={() => {}}
          onEnergyChange={() => {}}
          onSleepChange={() => {}}
          showAnimation={false}
        />
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Features Include:</h4>
        <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
          <li>Button-based scoring for keyboard navigation</li>
          <li>High contrast colors for value indicators</li>
          <li>Emoji + color + text combinations for recognition</li>
          <li>Progress bars for visual progress indication</li>
          <li>Clear labeling for each metric category</li>
          <li>Semantic structure for screen readers</li>
          <li>Large touch targets for mobile accessibility</li>
          <li>Real-time feedback with assessment summary</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features ensuring usability for all users.',
      },
    },
  },
};
