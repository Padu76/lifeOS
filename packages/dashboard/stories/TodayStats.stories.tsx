import type { Meta, StoryObj } from '@storybook/react';
import { TodayStats } from '@lifeos/dashboard';

const meta = {
  title: 'Dashboard/TodayStats',
  component: TodayStats,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Today Stats component displays daily statistics including completed interventions, engagement time, ratings, and improvement metrics. Features animated cards with trend indicators and goal progress tracking.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    stats: {
      control: 'object',
      description: 'Daily statistics object containing all metrics',
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable entry animations for stat cards',
      defaultValue: true,
    },
    compact: {
      control: 'boolean',
      description: 'Show compact version for smaller spaces',
      defaultValue: false,
    },
    onStatPress: {
      action: 'stat-pressed',
      description: 'Called when a stat card is pressed',
    },
  },
} satisfies Meta<typeof TodayStats>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample stats data
const excellentStats = {
  interventions_completed: 8,
  interventions_dismissed: 1,
  total_engagement_time_minutes: 65,
  avg_completion_rating: 4.6,
  stress_improvement: 2.3,
  energy_improvement: 1.8,
};

const goodStats = {
  interventions_completed: 4,
  interventions_dismissed: 2,
  total_engagement_time_minutes: 35,
  avg_completion_rating: 4.2,
  stress_improvement: 1.1,
  energy_improvement: 0.8,
};

const averageStats = {
  interventions_completed: 2,
  interventions_dismissed: 3,
  total_engagement_time_minutes: 18,
  avg_completion_rating: 3.5,
  stress_improvement: 0.3,
  energy_improvement: -0.2,
};

const beginnerStats = {
  interventions_completed: 1,
  interventions_dismissed: 1,
  total_engagement_time_minutes: 8,
  avg_completion_rating: 4.0,
  stress_improvement: 0.5,
  energy_improvement: 0.3,
};

const challengingStats = {
  interventions_completed: 1,
  interventions_dismissed: 5,
  total_engagement_time_minutes: 5,
  avg_completion_rating: 2.8,
  stress_improvement: -0.8,
  energy_improvement: -1.2,
};

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    stats: goodStats,
  },
};

export const ExcellentDay: Story = {
  args: {
    stats: excellentStats,
  },
  parameters: {
    docs: {
      description: {
        story: 'Excellent day with high completion rate and significant improvements.',
      },
    },
  },
};

export const BeginnerDay: Story = {
  args: {
    stats: beginnerStats,
  },
  parameters: {
    docs: {
      description: {
        story: 'Beginner-friendly stats showing early progress.',
      },
    },
  },
};

export const ChallengingDay: Story = {
  args: {
    stats: challengingStats,
  },
  parameters: {
    docs: {
      description: {
        story: 'Challenging day with low completion rate and declining metrics.',
      },
    },
  },
};

// ===== COMPLETION RATE STORIES =====

export const HighCompletionRate: Story = {
  args: {
    stats: {
      interventions_completed: 9,
      interventions_dismissed: 1,
      total_engagement_time_minutes: 78,
      avg_completion_rating: 4.8,
      stress_improvement: 2.5,
      energy_improvement: 2.1,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Very high completion rate (90%) showing excellent engagement.',
      },
    },
  },
};

export const MediumCompletionRate: Story = {
  args: {
    stats: {
      interventions_completed: 5,
      interventions_dismissed: 5,
      total_engagement_time_minutes: 42,
      avg_completion_rating: 3.8,
      stress_improvement: 0.8,
      energy_improvement: 0.5,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium completion rate (50%) showing balanced engagement.',
      },
    },
  },
};

export const LowCompletionRate: Story = {
  args: {
    stats: {
      interventions_completed: 2,
      interventions_dismissed: 8,
      total_engagement_time_minutes: 12,
      avg_completion_rating: 3.2,
      stress_improvement: -0.3,
      energy_improvement: -0.8,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Low completion rate (20%) indicating need for motivation.',
      },
    },
  },
};

// ===== ENGAGEMENT TIME STORIES =====

export const HighEngagement: Story = {
  args: {
    stats: {
      interventions_completed: 6,
      interventions_dismissed: 2,
      total_engagement_time_minutes: 95, // 1h 35m
      avg_completion_rating: 4.3,
      stress_improvement: 1.8,
      energy_improvement: 1.5,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'High engagement time showing deep involvement with activities.',
      },
    },
  },
};

export const QuickSessions: Story = {
  args: {
    stats: {
      interventions_completed: 8,
      interventions_dismissed: 1,
      total_engagement_time_minutes: 24, // Quick micro-interventions
      avg_completion_rating: 4.1,
      stress_improvement: 1.2,
      energy_improvement: 0.9,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Many quick sessions showing efficient micro-intervention usage.',
      },
    },
  },
};

// ===== IMPROVEMENT TRENDS =====

export const SignificantImprovement: Story = {
  args: {
    stats: {
      interventions_completed: 5,
      interventions_dismissed: 1,
      total_engagement_time_minutes: 45,
      avg_completion_rating: 4.5,
      stress_improvement: 3.2, // Significant stress reduction
      energy_improvement: 2.8, // Major energy boost
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Significant improvements in both stress and energy levels.',
      },
    },
  },
};

export const MixedTrends: Story = {
  args: {
    stats: {
      interventions_completed: 4,
      interventions_dismissed: 2,
      total_engagement_time_minutes: 32,
      avg_completion_rating: 3.9,
      stress_improvement: 1.5, // Good stress improvement
      energy_improvement: -0.3, // Slight energy decline
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Mixed trends with stress improving but energy slightly declining.',
      },
    },
  },
};

export const NoImprovement: Story = {
  args: {
    stats: {
      interventions_completed: 3,
      interventions_dismissed: 4,
      total_engagement_time_minutes: 22,
      avg_completion_rating: 3.1,
      stress_improvement: 0.0, // No change
      energy_improvement: 0.1, // Minimal change
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Stable metrics with minimal improvement, requiring strategy adjustment.',
      },
    },
  },
};

// ===== RATING STORIES =====

export const HighRatings: Story = {
  args: {
    stats: {
      interventions_completed: 6,
      interventions_dismissed: 1,
      total_engagement_time_minutes: 48,
      avg_completion_rating: 4.9, // Excellent ratings
      stress_improvement: 2.1,
      energy_improvement: 1.7,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Consistently high user ratings indicating great satisfaction.',
      },
    },
  },
};

export const ModeratRatings: Story = {
  args: {
    stats: {
      interventions_completed: 5,
      interventions_dismissed: 2,
      total_engagement_time_minutes: 38,
      avg_completion_rating: 3.2, // Moderate ratings
      stress_improvement: 0.8,
      energy_improvement: 0.6,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Moderate ratings suggesting room for improvement in intervention quality.',
      },
    },
  },
};

// ===== DISPLAY VARIANTS =====

export const Compact: Story = {
  args: {
    stats: goodStats,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version showing essential stats in minimal space.',
      },
    },
  },
};

export const NoAnimations: Story = {
  args: {
    stats: excellentStats,
    showAnimation: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Component without animations for faster rendering or accessibility.',
      },
    },
  },
};

// ===== GOAL PROGRESS STORIES =====

export const NearGoal: Story = {
  args: {
    stats: {
      interventions_completed: 4, // Near the daily goal of 5
      interventions_dismissed: 1,
      total_engagement_time_minutes: 35,
      avg_completion_rating: 4.2,
      stress_improvement: 1.1,
      energy_improvement: 0.8,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Near daily goal completion, showing progress motivation.',
      },
    },
  },
};

export const GoalAchieved: Story = {
  args: {
    stats: {
      interventions_completed: 5, // Exactly at goal
      interventions_dismissed: 0,
      total_engagement_time_minutes: 45,
      avg_completion_rating: 4.4,
      stress_improvement: 1.6,
      energy_improvement: 1.3,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Daily goal achieved, no goal progress bar shown.',
      },
    },
  },
};

export const GoalExceeded: Story = {
  args: {
    stats: {
      interventions_completed: 7, // Exceeded goal
      interventions_dismissed: 1,
      total_engagement_time_minutes: 58,
      avg_completion_rating: 4.5,
      stress_improvement: 2.0,
      energy_improvement: 1.8,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Daily goal exceeded, showing exceptional engagement.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    stats: goodStats,
    showAnimation: true,
    compact: false,
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

export const DashboardGrid: Story = {
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
        Daily Dashboard Overview
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <TodayStats stats={excellentStats} />
        
        <div style={{ 
          backgroundColor: '#1e293b', 
          padding: '20px', 
          borderRadius: '12px',
          color: '#e2e8f0'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Quick Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{ 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '8px',
              fontWeight: '600'
            }}>
              Start New Check-in
            </button>
            <button style={{ 
              backgroundColor: '#10b981', 
              color: 'white', 
              border: 'none', 
              padding: '12px', 
              borderRadius: '8px',
              fontWeight: '600'
            }}>
              View Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Today Stats integrated in a dashboard grid layout.',
      },
    },
  },
};

export const MobileCard: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '375px',
      margin: '0 auto',
      backgroundColor: '#0f172a',
      padding: '16px',
      borderRadius: '24px',
      border: '8px solid #374151'
    }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h3 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '20px' }}>
          Oggi
        </h3>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Le tue statistiche giornaliere
        </p>
      </div>
      
      <TodayStats stats={goodStats} compact={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Today Stats optimized for mobile view.',
      },
    },
  },
};

export const ProgressComparison: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gap: '24px', 
      maxWidth: '800px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <h3 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
        Progress Comparison
      </h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <h4 style={{ color: '#10b981', margin: '0 0 12px 0', fontSize: '18px' }}>
            Excellent Day
          </h4>
          <TodayStats stats={excellentStats} showAnimation={false} />
        </div>
        
        <div>
          <h4 style={{ color: '#f59e0b', margin: '0 0 12px 0', fontSize: '18px' }}>
            Average Day
          </h4>
          <TodayStats stats={averageStats} showAnimation={false} />
        </div>
        
        <div>
          <h4 style={{ color: '#ef4444', margin: '0 0 12px 0', fontSize: '18px' }}>
            Challenging Day
          </h4>
          <TodayStats stats={challengingStats} showAnimation={false} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of different performance levels throughout various days.',
      },
    },
  },
};

// ===== EDGE CASES =====

export const ZeroStats: Story = {
  args: {
    stats: {
      interventions_completed: 0,
      interventions_dismissed: 0,
      total_engagement_time_minutes: 0,
      avg_completion_rating: 0,
      stress_improvement: 0,
      energy_improvement: 0,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case with all zero values, early in the day or inactive user.',
      },
    },
  },
};

export const ExtremeValues: Story = {
  args: {
    stats: {
      interventions_completed: 25,
      interventions_dismissed: 2,
      total_engagement_time_minutes: 180, // 3 hours
      avg_completion_rating: 5.0,
      stress_improvement: 5.0,
      energy_improvement: 4.8,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case with extreme values testing component limits.',
      },
    },
  },
};

export const NegativeImprovements: Story = {
  args: {
    stats: {
      interventions_completed: 2,
      interventions_dismissed: 6,
      total_engagement_time_minutes: 15,
      avg_completion_rating: 2.5,
      stress_improvement: -2.3, // Stress increased
      energy_improvement: -1.8, // Energy decreased
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Negative improvements showing declining wellness metrics.',
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
        <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Visual Indicators</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Color-coded trends with icons ensure accessibility for colorblind users.
        </p>
        <TodayStats stats={goodStats} showAnimation={false} />
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Features Include:</h4>
        <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
          <li>High contrast colors for trend indicators</li>
          <li>Icon + color combinations for better recognition</li>
          <li>Clear progress bars with numerical values</li>
          <li>Semantic structure for screen readers</li>
          <li>Keyboard navigation support for interactive elements</li>
          <li>Descriptive text for all metrics</li>
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
