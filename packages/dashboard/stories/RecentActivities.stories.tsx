import type { Meta, StoryObj } from '@storybook/react';
import { RecentActivities } from '@lifeos/dashboard';

const meta = {
  title: 'Dashboard/RecentActivities',
  component: RecentActivities,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Recent Activities component displays a timeline of user activities with animations, different activity types, and interactive features. Shows completed advice, achievements, and other user interactions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    activities: {
      control: 'object',
      description: 'Array of recent activities to display',
    },
    maxVisible: {
      control: 'number',
      description: 'Maximum number of activities to show initially',
      defaultValue: 5,
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable entry animations',
      defaultValue: true,
    },
    compact: {
      control: 'boolean',
      description: 'Show compact version',
      defaultValue: false,
    },
    onActivityPress: {
      action: 'activity-pressed',
      description: 'Called when an activity is pressed',
    },
    onSeeAllPress: {
      action: 'see-all-pressed',
      description: 'Called when "See All" button is pressed',
    },
  },
} satisfies Meta<typeof RecentActivities>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const sampleActivities = [
  {
    id: '1',
    type: 'advice_completed' as const,
    description: 'Completato: 5 minuti di respirazione profonda',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    impact_score: 8,
  },
  {
    id: '2',
    type: 'achievement_unlocked' as const,
    description: 'Sbloccato: "Respiratore Zen" - 7 giorni consecutivi',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'metrics_logged' as const,
    description: 'Aggiornato life score: Stress 4/10, Energia 8/10',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'advice_dismissed' as const,
    description: 'Rimandato: Camminata di 10 minuti',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'advice_completed' as const,
    description: 'Completato: Pausa idratazione',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    impact_score: 5,
  },
];

const manyActivities = [
  ...sampleActivities,
  {
    id: '6',
    type: 'achievement_unlocked' as const,
    description: 'Sbloccato: "Early Bird" - Check-in mattutino per 5 giorni',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'advice_completed' as const,
    description: 'Completato: Stretching alla scrivania',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    impact_score: 6,
  },
  {
    id: '8',
    type: 'metrics_logged' as const,
    description: 'Check-in serale completato',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    activities: sampleActivities,
  },
};

export const Empty: Story = {
  args: {
    activities: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no activities are available.',
      },
    },
  },
};

export const SingleActivity: Story = {
  args: {
    activities: [sampleActivities[0]],
  },
  parameters: {
    docs: {
      description: {
        story: 'Component with only one activity.',
      },
    },
  },
};

// ===== ACTIVITY TYPE STORIES =====

export const CompletedAdviceOnly: Story = {
  args: {
    activities: sampleActivities.filter(a => a.type === 'advice_completed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Activities showing only completed advice with impact scores.',
      },
    },
  },
};

export const AchievementsOnly: Story = {
  args: {
    activities: sampleActivities.filter(a => a.type === 'achievement_unlocked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Activities showing only unlocked achievements.',
      },
    },
  },
};

export const MixedActivities: Story = {
  args: {
    activities: sampleActivities,
  },
  parameters: {
    docs: {
      description: {
        story: 'Mixed activity types showing the full timeline experience.',
      },
    },
  },
};

export const DismissedActivities: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'advice_dismissed' as const,
        description: 'Rimandato: Sessione di meditazione guidata',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'advice_dismissed' as const,
        description: 'Saltato: Pausa movimento',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Activities showing dismissed or skipped advice.',
      },
    },
  },
};

// ===== DISPLAY VARIANTS =====

export const Compact: Story = {
  args: {
    activities: sampleActivities,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version suitable for smaller spaces or secondary displays.',
      },
    },
  },
};

export const LimitedVisible: Story = {
  args: {
    activities: manyActivities,
    maxVisible: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Limited number of visible activities with "See All" option.',
      },
    },
  },
};

export const NoAnimations: Story = {
  args: {
    activities: sampleActivities,
    showAnimation: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Component without entry animations for faster rendering.',
      },
    },
  },
};

// ===== TIME-BASED STORIES =====

export const RecentActivities: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'advice_completed' as const,
        description: 'Completato proprio ora: Respirazione mindful',
        timestamp: new Date().toISOString(),
        impact_score: 9,
      },
      {
        id: '2',
        type: 'metrics_logged' as const,
        description: 'Aggiornato life score',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'achievement_unlocked' as const,
        description: 'Nuovo traguardo sbloccato!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Very recent activities (within minutes) showing immediate feedback.',
      },
    },
  },
};

export const OlderActivities: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'advice_completed' as const,
        description: 'Completato: Camminata energizzante',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        impact_score: 7,
      },
      {
        id: '2',
        type: 'achievement_unlocked' as const,
        description: 'Sbloccato: "Consistency Master"',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'metrics_logged' as const,
        description: 'Check-in settimanale completato',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Older activities showing formatted dates instead of relative time.',
      },
    },
  },
};

// ===== HIGH ENGAGEMENT STORIES =====

export const HighEngagementDay: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'advice_completed' as const,
        description: 'Completato: Meditazione mattutina da 10 minuti',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        impact_score: 9,
      },
      {
        id: '2',
        type: 'advice_completed' as const,
        description: 'Completato: Power nap da 20 minuti',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        impact_score: 8,
      },
      {
        id: '3',
        type: 'achievement_unlocked' as const,
        description: 'Sbloccato: "Mindful Master" - 30 sessioni completate',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'advice_completed' as const,
        description: 'Completato: Idratazione consapevole',
        timestamp: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
        impact_score: 6,
      },
      {
        id: '5',
        type: 'achievement_unlocked' as const,
        description: 'Sbloccato: "Hydration Hero" - 7 giorni di idratazione corretta',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'High engagement day with multiple completed activities and achievements.',
      },
    },
  },
};

export const MixedEngagementDay: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'advice_completed' as const,
        description: 'Completato: Stretching da scrivania',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        impact_score: 7,
      },
      {
        id: '2',
        type: 'advice_dismissed' as const,
        description: 'Rimandato: Chiamata a un amico',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'metrics_logged' as const,
        description: 'Check-in pomeridiano: Energia 6/10, Stress 7/10',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'advice_dismissed' as const,
        description: 'Saltato: Pausa caffè consapevole',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Mixed engagement showing both completed and dismissed activities.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    activities: sampleActivities,
    maxVisible: 5,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use controls to customize component behavior.',
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
      maxWidth: '800px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <h3 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
        Dashboard LifeOS
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        <div>
          <h4 style={{ color: '#e2e8f0', fontSize: '18px', margin: '0 0 16px 0' }}>
            Metriche Principali
          </h4>
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: '20px', 
            borderRadius: '12px',
            color: '#e2e8f0',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            [Life Score Ring Component]
          </div>
        </div>
        
        <RecentActivities
          activities={sampleActivities.slice(0, 4)}
          maxVisible={4}
          compact={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Recent Activities integrated in a typical LifeOS dashboard layout.',
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
      <div style={{ marginBottom: '20px' }}>
        <RecentActivities
          activities={sampleActivities.slice(0, 3)}
          compact={true}
        />
      </div>
      
      <div style={{ 
        backgroundColor: '#1e293b', 
        padding: '16px', 
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '16px' }}>
          Vista Mobile
        </h4>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Versione compatta ottimizzata per dispositivi mobili
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Recent Activities optimized for mobile view with compact layout.',
      },
    },
  },
};

// ===== EDGE CASES =====

export const VeryLongDescriptions: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'advice_completed' as const,
        description: 'Completato: Sessione di meditazione mindfulness avanzata con tecniche di respirazione profonda e visualizzazione guidata per il rilassamento completo del sistema nervoso',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        impact_score: 9,
      },
      {
        id: '2',
        type: 'achievement_unlocked' as const,
        description: 'Sbloccato: "Master of Zen Ultimate Achievement" - Hai completato 100 sessioni consecutive di meditazione mattutina con una valutazione media superiore a 8/10',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing text truncation with very long activity descriptions.',
      },
    },
  },
};

export const HighImpactScores: Story = {
  args: {
    activities: [
      {
        id: '1',
        type: 'advice_completed' as const,
        description: 'Completato: Workout HIIT da 30 minuti',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        impact_score: 15,
      },
      {
        id: '2',
        type: 'advice_completed' as const,
        description: 'Completato: Sessione di terapia online',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        impact_score: 25,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Activities with high impact scores showing significant wellness improvements.',
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
        <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Screen Reader Support</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Each activity has semantic markup and proper ARIA labels for screen readers.
        </p>
        <RecentActivities
          activities={sampleActivities.slice(0, 2)}
          showAnimation={false}
        />
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Features Include:</h4>
        <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
          <li>Semantic timeline structure</li>
          <li>Activity type indicators with icons and colors</li>
          <li>Relative time formatting for better comprehension</li>
          <li>Keyboard navigation support</li>
          <li>High contrast color scheme</li>
          <li>Impact score visual indicators</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features for users with different needs.',
      },
    },
  },
};
