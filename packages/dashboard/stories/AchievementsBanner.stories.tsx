import type { Meta, StoryObj } from '@storybook/react';
import { AchievementsBanner } from '@lifeos/dashboard';

const meta = {
  title: 'Dashboard/AchievementsBanner',
  component: AchievementsBanner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Achievements Banner component displays newly unlocked achievements with celebratory animations, category badges, and detailed modal view. Features auto-hide functionality and responsive design.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    achievements: {
      control: 'object',
      description: 'Array of achievements to display',
    },
    maxVisible: {
      control: 'number',
      description: 'Maximum number of achievements visible at once',
      defaultValue: 3,
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable celebration animations',
      defaultValue: true,
    },
    autoHide: {
      control: 'boolean',
      description: 'Auto-hide banner after delay',
      defaultValue: false,
    },
    autoHideDelay: {
      control: 'number',
      description: 'Auto-hide delay in milliseconds',
      defaultValue: 8000,
    },
    onAchievementPress: {
      action: 'achievement-pressed',
      description: 'Called when an achievement is pressed',
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Called when banner is dismissed',
    },
  },
} satisfies Meta<typeof AchievementsBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample achievements data
const streakAchievement = {
  id: '1',
  title: 'Mindful Streak Master',
  description: 'Hai completato 7 giorni consecutivi di esercizi di mindfulness',
  icon: '🔥',
  unlocked_at: new Date().toISOString(),
  category: 'streak' as const,
};

const completionAchievement = {
  id: '2',
  title: 'Centurion Completer',
  description: 'Hai completato 100 micro-consigli con successo',
  icon: '💯',
  unlocked_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  category: 'completion' as const,
};

const improvementAchievement = {
  id: '3',
  title: 'Stress Buster',
  description: 'Hai ridotto il tuo livello di stress medio del 30% questo mese',
  icon: '🧘‍♀️',
  unlocked_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  category: 'improvement' as const,
};

const consistencyAchievement = {
  id: '4',
  title: 'Early Bird Champion',
  description: 'Check-in mattutino completato per 14 giorni di fila',
  icon: '🌅',
  unlocked_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  category: 'consistency' as const,
};

const multipleAchievements = [
  streakAchievement,
  completionAchievement,
  improvementAchievement,
  consistencyAchievement,
  {
    id: '5',
    title: 'Hydration Hero',
    description: 'Hai mantenuto un\'idratazione ottimale per una settimana intera',
    icon: '💧',
    unlocked_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    category: 'consistency' as const,
  },
];

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    achievements: [streakAchievement],
  },
};

export const SingleAchievement: Story = {
  args: {
    achievements: [completionAchievement],
  },
  parameters: {
    docs: {
      description: {
        story: 'Single achievement unlock with celebration effects.',
      },
    },
  },
};

export const MultipleAchievements: Story = {
  args: {
    achievements: [streakAchievement, completionAchievement, improvementAchievement],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple achievements unlocked simultaneously.',
      },
    },
  },
};

export const ManyAchievements: Story = {
  args: {
    achievements: multipleAchievements,
    maxVisible: 3,
  },
  parameters: {
    docs: {
      description: {
        story: 'Many achievements with overflow indicator showing additional count.',
      },
    },
  },
};

// ===== CATEGORY STORIES =====

export const StreakCategory: Story = {
  args: {
    achievements: [
      streakAchievement,
      {
        id: '6',
        title: 'Meditation Marathon',
        description: '30 giorni consecutivi di meditazione quotidiana',
        icon: '🏃‍♂️',
        unlocked_at: new Date().toISOString(),
        category: 'streak' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Streak-based achievements showing consistency rewards.',
      },
    },
  },
};

export const CompletionCategory: Story = {
  args: {
    achievements: [
      completionAchievement,
      {
        id: '7',
        title: 'Task Master',
        description: 'Hai completato 500 attività di benessere',
        icon: '⭐',
        unlocked_at: new Date().toISOString(),
        category: 'completion' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Completion-based achievements for milestone rewards.',
      },
    },
  },
};

export const ImprovementCategory: Story = {
  args: {
    achievements: [
      improvementAchievement,
      {
        id: '8',
        title: 'Energy Booster',
        description: 'Hai aumentato il tuo livello di energia medio del 25%',
        icon: '⚡',
        unlocked_at: new Date().toISOString(),
        category: 'improvement' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Improvement-based achievements for wellness progress.',
      },
    },
  },
};

export const ConsistencyCategory: Story = {
  args: {
    achievements: [
      consistencyAchievement,
      {
        id: '9',
        title: 'Weekend Warrior',
        description: 'Hai mantenuto la routine anche nei weekend per un mese',
        icon: '🏆',
        unlocked_at: new Date().toISOString(),
        category: 'consistency' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Consistency-based achievements for habit building.',
      },
    },
  },
};

// ===== TIMING STORIES =====

export const JustUnlocked: Story = {
  args: {
    achievements: [
      {
        id: '10',
        title: 'Appena Sbloccato!',
        description: 'Questo achievement è stato sbloccato proprio ora',
        icon: '🎉',
        unlocked_at: new Date().toISOString(),
        category: 'streak' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Freshly unlocked achievement showing "Ora" timestamp.',
      },
    },
  },
};

export const RecentlyUnlocked: Story = {
  args: {
    achievements: [
      {
        id: '11',
        title: 'Recente',
        description: 'Sbloccato pochi minuti fa',
        icon: '🌟',
        unlocked_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        category: 'completion' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Recently unlocked achievement showing minutes ago.',
      },
    },
  },
};

export const HoursAgo: Story = {
  args: {
    achievements: [
      {
        id: '12',
        title: 'Ore Fa',
        description: 'Sbloccato alcune ore fa',
        icon: '🏅',
        unlocked_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        category: 'improvement' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Achievement unlocked hours ago showing hour format.',
      },
    },
  },
};

// ===== DISPLAY VARIANTS =====

export const NoAnimations: Story = {
  args: {
    achievements: [streakAchievement, completionAchievement],
    showAnimation: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner without animations for faster rendering or accessibility.',
      },
    },
  },
};

export const AutoHide: Story = {
  args: {
    achievements: [improvementAchievement],
    autoHide: true,
    autoHideDelay: 3000, // Shorter for demo
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with auto-hide functionality (3 seconds for demo).',
      },
    },
  },
};

export const LimitedVisible: Story = {
  args: {
    achievements: multipleAchievements,
    maxVisible: 2,
  },
  parameters: {
    docs: {
      description: {
        story: 'Limited visible achievements with overflow count.',
      },
    },
  },
};

// ===== SPECIAL ACHIEVEMENTS =====

export const MilestoneAchievement: Story = {
  args: {
    achievements: [
      {
        id: '13',
        title: 'Milestone Mastery',
        description: 'Hai raggiunto 1000 punti life score totali - un traguardo incredibile!',
        icon: '🏆',
        unlocked_at: new Date().toISOString(),
        category: 'completion' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Major milestone achievement with longer description.',
      },
    },
  },
};

export const RareAchievement: Story = {
  args: {
    achievements: [
      {
        id: '14',
        title: 'Perfectionist',
        description: 'Hai completato 50 micro-consigli consecutivi con valutazione 5 stelle',
        icon: '💎',
        unlocked_at: new Date().toISOString(),
        category: 'improvement' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Rare achievement for exceptional performance.',
      },
    },
  },
};

export const SeasonalAchievement: Story = {
  args: {
    achievements: [
      {
        id: '15',
        title: 'Winter Wellness Warrior',
        description: 'Hai mantenuto una routine costante durante tutto l\'inverno',
        icon: '❄️',
        unlocked_at: new Date().toISOString(),
        category: 'consistency' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Seasonal achievement for period-specific goals.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    achievements: [streakAchievement, completionAchievement],
    maxVisible: 3,
    showAnimation: true,
    autoHide: false,
    autoHideDelay: 8000,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use controls to test different configurations.',
      },
    },
  },
};

// ===== LIFEOS USAGE EXAMPLES =====

export const DashboardNotification: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '900px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px',
      position: 'relative'
    }}>
      <h3 style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '24px', fontWeight: 'bold' }}>
        Dashboard LifeOS
      </h3>
      
      {/* Banner overlay */}
      <div style={{ position: 'relative', zIndex: 10, marginBottom: '20px' }}>
        <AchievementsBanner 
          achievements={[streakAchievement, completionAchievement]}
          autoHide={false}
        />
      </div>
      
      {/* Dashboard content behind */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        opacity: 0.7 // Reduced to show banner prominence
      }}>
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '20px', 
          borderRadius: '12px',
          color: '#e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 16px 0' }}>Life Score</h4>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#3b82f6' }}>8.2</div>
        </div>
        
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '20px', 
          borderRadius: '12px',
          color: '#e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 16px 0' }}>Today\'s Progress</h4>
          <div style={{ color: '#10b981' }}>7/10 goals completed</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Achievements banner as dashboard notification overlay.',
      },
    },
  },
};

export const MobileNotification: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '375px',
      margin: '0 auto',
      backgroundColor: '#0f172a',
      padding: '16px',
      borderRadius: '24px',
      border: '8px solid #374151',
      minHeight: '600px',
      position: 'relative'
    }}>
      {/* Mobile status bar */}
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
      
      {/* Achievement notification */}
      <AchievementsBanner 
        achievements={[improvementAchievement]}
        maxVisible={1}
      />
      
      {/* Mobile app content */}
      <div style={{ marginTop: '20px', color: '#e2e8f0' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Dashboard</h3>
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '16px', 
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>8.5</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>Life Score</div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Achievement banner in mobile app context.',
      },
    },
  },
};

export const CelebrationSequence: Story = {
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
        Celebration Sequence
      </h3>
      
      <div style={{ color: '#94a3b8', fontSize: '14px' }}>
        Multiple achievements unlocked after completing a major milestone
      </div>
      
      <AchievementsBanner 
        achievements={[
          {
            id: '16',
            title: 'Week One Complete',
            description: 'Hai completato la tua prima settimana su LifeOS!',
            icon: '🎯',
            unlocked_at: new Date().toISOString(),
            category: 'completion' as const,
          },
          {
            id: '17',
            title: 'Habit Builder',
            description: 'Hai stabilito 3 nuove abitudini salutari',
            icon: '🔗',
            unlocked_at: new Date().toISOString(),
            category: 'consistency' as const,
          },
          {
            id: '18',
            title: 'Progress Pioneer',
            description: 'Hai migliorato tutti i tuoi indicatori di benessere',
            icon: '📈',
            unlocked_at: new Date().toISOString(),
            category: 'improvement' as const,
          },
        ]}
        maxVisible={3}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple achievements celebrating a major milestone completion.',
      },
    },
  },
};

// ===== EDGE CASES =====

export const LongTitles: Story = {
  args: {
    achievements: [
      {
        id: '19',
        title: 'Super Long Achievement Title That Might Need Truncation',
        description: 'This is an extremely long description that tests how the component handles text overflow and truncation in various scenarios with multiple lines of content.',
        icon: '📏',
        unlocked_at: new Date().toISOString(),
        category: 'completion' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing text overflow and truncation with long content.',
      },
    },
  },
};

export const SpecialCharacters: Story = {
  args: {
    achievements: [
      {
        id: '20',
        title: 'Spëcîál Chåractërs & Émöjîs 🌈',
        description: 'Testing special characters: àáâãäåæçèéêë & ñòóôõö ÷øùúûüý 💫✨🎊',
        icon: '🌟',
        unlocked_at: new Date().toISOString(),
        category: 'improvement' as const,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing support for special characters and emoji.',
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
        <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Celebration with Accessibility</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Achievement celebrations use multiple sensory indicators and semantic markup.
        </p>
        <AchievementsBanner 
          achievements={[streakAchievement]} 
          showAnimation={false}
        />
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Features Include:</h4>
        <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
          <li>Category-specific color coding with high contrast</li>
          <li>Icon + text + color combinations for multiple recognition methods</li>
          <li>Semantic structure for screen reader announcements</li>
          <li>Keyboard navigation for achievement interaction</li>
          <li>Reduced motion support (disable animations)</li>
          <li>Modal dialog with focus management</li>
          <li>Clear dismiss actions with appropriate labeling</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features ensuring celebrations are inclusive.',
      },
    },
  },
};
