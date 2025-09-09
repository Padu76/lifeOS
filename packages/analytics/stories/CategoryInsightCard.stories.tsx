import type { Meta, StoryObj } from '@storybook/react';
import { CategoryInsightCard } from '@lifeos/analytics';

const meta = {
  title: 'Analytics/CategoryInsightCard',
  component: CategoryInsightCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Category Insight Card displays comprehensive analytics for specific wellness categories. Shows effectiveness scores, completion rates, trending data, and provides actionable insights to optimize user engagement with different types of wellness activities.',
      },
    },
  },
  argTypes: {
    category: {
      control: 'object',
      description: 'Category insight data including metrics and trends',
      table: {
        type: { summary: 'CategoryInsight' },
      },
    },
    onPress: {
      action: 'categoryPressed',
      description: 'Callback when card is pressed',
      table: {
        type: { summary: '() => void' },
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
    compact: {
      control: 'boolean',
      description: 'Use compact layout',
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
} satisfies Meta<typeof CategoryInsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for different categories and performance levels
const excellentCategory = {
  category: 'Mindfulness',
  total_interventions: 45,
  completion_rate: 0.89,
  avg_rating: 4.6,
  avg_duration_minutes: 12.5,
  effectiveness_score: 0.92,
  trend: 'improving' as const,
};

const goodCategory = {
  category: 'Exercise',
  total_interventions: 32,
  completion_rate: 0.75,
  avg_rating: 4.2,
  avg_duration_minutes: 18.3,
  effectiveness_score: 0.78,
  trend: 'stable' as const,
};

const mediumCategory = {
  category: 'Nutrition',
  total_interventions: 28,
  completion_rate: 0.64,
  avg_rating: 3.8,
  avg_duration_minutes: 25.7,
  effectiveness_score: 0.61,
  trend: 'improving' as const,
};

const needsImprovementCategory = {
  category: 'Sleep',
  total_interventions: 15,
  completion_rate: 0.43,
  avg_rating: 3.1,
  avg_duration_minutes: 35.2,
  effectiveness_score: 0.35,
  trend: 'declining' as const,
};

const stressCategory = {
  category: 'Stress',
  total_interventions: 67,
  completion_rate: 0.82,
  avg_rating: 4.4,
  avg_duration_minutes: 8.1,
  effectiveness_score: 0.87,
  trend: 'improving' as const,
};

const energyCategory = {
  category: 'Energy',
  total_interventions: 38,
  completion_rate: 0.71,
  avg_rating: 4.0,
  avg_duration_minutes: 14.8,
  effectiveness_score: 0.73,
  trend: 'stable' as const,
};

const focusCategory = {
  category: 'Focus',
  total_interventions: 41,
  completion_rate: 0.68,
  avg_rating: 3.9,
  avg_duration_minutes: 22.4,
  effectiveness_score: 0.69,
  trend: 'declining' as const,
};

// Performance Level Stories
export const ExcellentPerformance: Story = {
  args: {
    category: excellentCategory,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with excellent performance metrics across all indicators.',
      },
    },
  },
};

export const GoodPerformance: Story = {
  args: {
    category: goodCategory,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with good overall performance and stable trends.',
      },
    },
  },
};

export const MediumPerformance: Story = {
  args: {
    category: mediumCategory,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with medium performance but showing improvement trend.',
      },
    },
  },
};

export const NeedsImprovement: Story = {
  args: {
    category: needsImprovementCategory,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category requiring attention with declining performance metrics.',
      },
    },
  },
};

// Trend-based Stories
export const ImprovingTrend: Story = {
  args: {
    category: {
      ...stressCategory,
      trend: 'improving' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category showing positive improvement trend over time.',
      },
    },
  },
};

export const StableTrend: Story = {
  args: {
    category: {
      ...energyCategory,
      trend: 'stable' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with stable performance maintaining consistent metrics.',
      },
    },
  },
};

export const DecliningTrend: Story = {
  args: {
    category: {
      ...focusCategory,
      trend: 'declining' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with declining trend requiring intervention.',
      },
    },
  },
};

// Compact Variants
export const CompactExcellent: Story = {
  args: {
    category: excellentCategory,
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version suitable for dashboard grids.',
      },
    },
  },
};

export const CompactMedium: Story = {
  args: {
    category: mediumCategory,
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact card showing essential metrics only.',
      },
    },
  },
};

export const CompactNeedsWork: Story = {
  args: {
    category: needsImprovementCategory,
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version highlighting areas needing attention.',
      },
    },
  },
};

// Category-specific Stories
export const MindfulnessCategory: Story = {
  args: {
    category: {
      category: 'Mindfulness',
      total_interventions: 52,
      completion_rate: 0.91,
      avg_rating: 4.7,
      avg_duration_minutes: 11.2,
      effectiveness_score: 0.94,
      trend: 'improving' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Mindfulness category with meditation icon and high engagement.',
      },
    },
  },
};

export const MovementCategory: Story = {
  args: {
    category: {
      category: 'Movement',
      total_interventions: 29,
      completion_rate: 0.69,
      avg_rating: 4.1,
      avg_duration_minutes: 24.6,
      effectiveness_score: 0.72,
      trend: 'stable' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Movement/exercise category with activity-focused metrics.',
      },
    },
  },
};

export const SocialCategory: Story = {
  args: {
    category: {
      category: 'Social',
      total_interventions: 19,
      completion_rate: 0.58,
      avg_rating: 3.6,
      avg_duration_minutes: 31.4,
      effectiveness_score: 0.54,
      trend: 'declining' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Social connection category with lower engagement patterns.',
      },
    },
  },
};

export const BreathingCategory: Story = {
  args: {
    category: {
      category: 'Breathing',
      total_interventions: 73,
      completion_rate: 0.85,
      avg_rating: 4.3,
      avg_duration_minutes: 6.8,
      effectiveness_score: 0.88,
      trend: 'improving' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Breathing exercises with high frequency and short duration.',
      },
    },
  },
};

// Animation Variants
export const WithAnimation: Story = {
  args: {
    category: excellentCategory,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with full entry animations and progress bar animations.',
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    category: goodCategory,
    showAnimation: false,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Static card without animations for immediate display.',
      },
    },
  },
};

// Real LifeOS Usage Examples
export const CategoryGrid: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(2, 1fr)', 
      gap: '16px',
      padding: '20px',
      backgroundColor: '#0f172a',
      borderRadius: '12px'
    }}>
      <CategoryInsightCard
        category={excellentCategory}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Mindfulness selected')}
      />
      <CategoryInsightCard
        category={goodCategory}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Exercise selected')}
      />
      <CategoryInsightCard
        category={mediumCategory}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Nutrition selected')}
      />
      <CategoryInsightCard
        category={needsImprovementCategory}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Sleep selected')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid layout for category overview in analytics dashboard.',
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
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Category Performance</h2>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Wellness category effectiveness analysis</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <CategoryInsightCard
          category={excellentCategory}
          showAnimation={false}
          compact={false}
          onPress={() => console.log('View mindfulness details')}
        />
        <CategoryInsightCard
          category={stressCategory}
          showAnimation={false}
          compact={false}
          onPress={() => console.log('View stress details')}
        />
        <CategoryInsightCard
          category={needsImprovementCategory}
          showAnimation={false}
          compact={false}
          onPress={() => console.log('View sleep details')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full category cards in analytics page layout.',
      },
    },
  },
};

export const TrendComparison: Story = {
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      padding: '20px'
    }}>
      <div>
        <h3 style={{ color: '#10b981', marginBottom: '12px' }}>📈 Improving Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <CategoryInsightCard
            category={{ ...excellentCategory, trend: 'improving' }}
            compact={true}
            showAnimation={false}
          />
          <CategoryInsightCard
            category={{ ...mediumCategory, trend: 'improving' }}
            compact={true}
            showAnimation={false}
          />
        </div>
      </div>
      
      <div>
        <h3 style={{ color: '#6b7280', marginBottom: '12px' }}>📊 Stable Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <CategoryInsightCard
            category={{ ...goodCategory, trend: 'stable' }}
            compact={true}
            showAnimation={false}
          />
          <CategoryInsightCard
            category={{ ...energyCategory, trend: 'stable' }}
            compact={true}
            showAnimation={false}
          />
        </div>
      </div>
      
      <div>
        <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>📉 Declining Categories</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <CategoryInsightCard
            category={{ ...needsImprovementCategory, trend: 'declining' }}
            compact={true}
            showAnimation={false}
          />
          <CategoryInsightCard
            category={{ ...focusCategory, trend: 'declining' }}
            compact={true}
            showAnimation={false}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Categories organized by trend direction for quick insights.',
      },
    },
  },
};

// Edge Cases
export const HighVolumeCategory: Story = {
  args: {
    category: {
      category: 'Productivity',
      total_interventions: 156,
      completion_rate: 0.72,
      avg_rating: 3.9,
      avg_duration_minutes: 18.7,
      effectiveness_score: 0.76,
      trend: 'stable' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with high intervention volume and extensive data.',
      },
    },
  },
};

export const LowVolumeCategory: Story = {
  args: {
    category: {
      category: 'Creativity',
      total_interventions: 3,
      completion_rate: 0.67,
      avg_rating: 4.0,
      avg_duration_minutes: 28.3,
      effectiveness_score: 0.71,
      trend: 'stable' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with very low intervention count (insufficient data).',
      },
    },
  },
};

export const PerfectScores: Story = {
  args: {
    category: {
      category: 'Hydration',
      total_interventions: 24,
      completion_rate: 1.0,
      avg_rating: 5.0,
      avg_duration_minutes: 2.1,
      effectiveness_score: 1.0,
      trend: 'stable' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with perfect scores across all metrics.',
      },
    },
  },
};

export const VeryLongDuration: Story = {
  args: {
    category: {
      category: 'Reading',
      total_interventions: 12,
      completion_rate: 0.42,
      avg_rating: 3.8,
      avg_duration_minutes: 67.5,
      effectiveness_score: 0.48,
      trend: 'declining' as const,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Category with very long average duration affecting completion.',
      },
    },
  },
};

// Interactive Examples
export const InteractiveComparison: Story = {
  render: () => {
    const [selectedCategory, setSelectedCategory] = React.useState<string>('mindfulness');
    
    const categories = {
      mindfulness: excellentCategory,
      exercise: goodCategory,
      nutrition: mediumCategory,
      sleep: needsImprovementCategory,
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', marginBottom: '12px' }}>Category Comparison</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(categories).map(key => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedCategory === key ? '#7c3aed' : '#374151',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <CategoryInsightCard
          key={selectedCategory} // Force re-render
          category={categories[selectedCategory as keyof typeof categories]}
          showAnimation={true}
          compact={false}
          onPress={() => console.log(`Selected ${selectedCategory}`)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive comparison allowing you to switch between different categories.',
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
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>High Contrast Version</h4>
        <CategoryInsightCard
          category={excellentCategory}
          showAnimation={false}
          style={{ filter: 'contrast(150%) brightness(110%)' }}
        />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Focus Indicators</h4>
        <CategoryInsightCard
          category={mediumCategory}
          showAnimation={false}
          style={{ outline: '2px solid #3b82f6', outlineOffset: '4px' }}
        />
      </div>
      
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Semantic Structure</h4>
        <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
          <p style={{ color: '#e5e7eb', fontSize: '12px', margin: 0 }}>
            Cards use semantic HTML with proper headings, ARIA labels, and descriptive text.
            Progress bars include accessible values and performance indicators are clearly labeled.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including high contrast, focus indicators, and semantic structure.',
      },
    },
  },
};
