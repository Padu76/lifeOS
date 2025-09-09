import type { Meta, StoryObj } from '@storybook/react';
import { PatternInsightCard } from '@lifeos/analytics';

const meta = {
  title: 'Analytics/PatternInsightCard',
  component: PatternInsightCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Pattern Insight Card reveals behavioral patterns in user interactions with wellness content. Analyzes optimal timing, stress/energy correlations, and contextual factors to provide data-driven recommendations for improving engagement and effectiveness.',
      },
    },
  },
  argTypes: {
    pattern: {
      control: 'object',
      description: 'Pattern insight data with metrics and analysis',
      table: {
        type: { summary: 'PatternInsight' },
      },
    },
    onPress: {
      action: 'patternPressed',
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
} satisfies Meta<typeof PatternInsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample pattern data for different types and confidence levels
const timeOfDayPattern = {
  pattern_type: 'time_of_day' as const,
  pattern_value: '09:30',
  success_rate: 0.87,
  confidence_score: 0.91,
  description: 'Gli utenti mostrano il più alto tasso di completamento per i micro-consigli alle 9:30 del mattino, con particolare efficacia per consigli su mindfulness ed energia.',
};

const dayOfWeekPattern = {
  pattern_type: 'day_of_week' as const,
  pattern_value: 'tuesday',
  success_rate: 0.73,
  confidence_score: 0.85,
  description: 'Il martedì emerge come il giorno più produttivo per l\'engagement, specialmente per consigli legati a produttività e focus.',
};

const stressLevelPattern = {
  pattern_type: 'stress_level' as const,
  pattern_value: 'medium',
  success_rate: 0.79,
  confidence_score: 0.76,
  description: 'Livelli di stress medi correlano con maggiore apertura ai consigli di gestione dello stress e tecniche di rilassamento.',
};

const energyLevelPattern = {
  pattern_type: 'energy_level' as const,
  pattern_value: 'high',
  success_rate: 0.82,
  confidence_score: 0.88,
  description: 'Alti livelli di energia coincidono con maggiore successo per consigli di movimento e attività fisica.',
};

const lowConfidencePattern = {
  pattern_type: 'time_of_day' as const,
  pattern_value: '15:45',
  success_rate: 0.45,
  confidence_score: 0.32,
  description: 'Pattern emergente ma con bassa confidenza statistica. Necessari più dati per confermare la tendenza.',
};

const weekendPattern = {
  pattern_type: 'day_of_week' as const,
  pattern_value: 'saturday',
  success_rate: 0.91,
  confidence_score: 0.94,
  description: 'Il sabato mostra il più alto engagement per consigli di benessere e self-care, con utenti più disponibili per attività lunghe.',
};

// Pattern Type Stories
export const TimeOfDayPattern: Story = {
  args: {
    pattern: timeOfDayPattern,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Optimal time-of-day pattern with high success rate and confidence.',
      },
    },
  },
};

export const DayOfWeekPattern: Story = {
  args: {
    pattern: dayOfWeekPattern,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Day-of-week pattern showing Tuesday as optimal engagement day.',
      },
    },
  },
};

export const StressLevelPattern: Story = {
  args: {
    pattern: stressLevelPattern,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Stress level correlation pattern for targeted recommendations.',
      },
    },
  },
};

export const EnergyLevelPattern: Story = {
  args: {
    pattern: energyLevelPattern,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Energy level pattern for activity-based recommendations.',
      },
    },
  },
};

// Confidence Level Stories
export const HighConfidence: Story = {
  args: {
    pattern: {
      ...weekendPattern,
      confidence_score: 0.94,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'High confidence pattern with strong statistical significance.',
      },
    },
  },
};

export const MediumConfidence: Story = {
  args: {
    pattern: {
      ...stressLevelPattern,
      confidence_score: 0.76,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium confidence pattern requiring some caution in application.',
      },
    },
  },
};

export const LowConfidence: Story = {
  args: {
    pattern: lowConfidencePattern,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Low confidence pattern needing more data for validation.',
      },
    },
  },
};

// Success Rate Variants
export const HighSuccessRate: Story = {
  args: {
    pattern: {
      ...weekendPattern,
      success_rate: 0.91,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern with very high success rate indicating strong correlation.',
      },
    },
  },
};

export const ModerateSuccessRate: Story = {
  args: {
    pattern: {
      ...dayOfWeekPattern,
      success_rate: 0.73,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern with moderate success rate showing potential for optimization.',
      },
    },
  },
};

export const LowSuccessRate: Story = {
  args: {
    pattern: {
      ...lowConfidencePattern,
      success_rate: 0.45,
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern with low success rate requiring intervention or different approach.',
      },
    },
  },
};

// Compact Variants
export const CompactTimePattern: Story = {
  args: {
    pattern: timeOfDayPattern,
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact time pattern suitable for dashboard widgets.',
      },
    },
  },
};

export const CompactDayPattern: Story = {
  args: {
    pattern: dayOfWeekPattern,
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact day pattern with essential metrics only.',
      },
    },
  },
};

export const CompactStressPattern: Story = {
  args: {
    pattern: stressLevelPattern,
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact stress level pattern for quick insights.',
      },
    },
  },
};

// Animation Variants
export const WithAnimation: Story = {
  args: {
    pattern: energyLevelPattern,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern card with full entry animations and progress bars.',
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    pattern: timeOfDayPattern,
    showAnimation: false,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Static pattern card without animations for immediate display.',
      },
    },
  },
};

// Real LifeOS Usage Examples
export const PatternGrid: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(2, 1fr)', 
      gap: '16px',
      padding: '20px',
      backgroundColor: '#0f172a',
      borderRadius: '12px'
    }}>
      <PatternInsightCard
        pattern={timeOfDayPattern}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Time pattern selected')}
      />
      <PatternInsightCard
        pattern={dayOfWeekPattern}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Day pattern selected')}
      />
      <PatternInsightCard
        pattern={stressLevelPattern}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Stress pattern selected')}
      />
      <PatternInsightCard
        pattern={energyLevelPattern}
        compact={true}
        showAnimation={true}
        onPress={() => console.log('Energy pattern selected')}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grid layout for pattern overview in analytics dashboard.',
      },
    },
  },
};

export const AnalyticsInsights: Story = {
  render: () => (
    <div style={{ 
      backgroundColor: '#0f172a', 
      padding: '24px',
      borderRadius: '16px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Behavioral Patterns</h2>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Data-driven insights for optimal engagement timing</p>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <PatternInsightCard
          pattern={timeOfDayPattern}
          showAnimation={false}
          compact={false}
          onPress={() => console.log('View time pattern details')}
        />
        <PatternInsightCard
          pattern={weekendPattern}
          showAnimation={false}
          compact={false}
          onPress={() => console.log('View weekend pattern details')}
        />
        <PatternInsightCard
          pattern={energyLevelPattern}
          showAnimation={false}
          compact={false}
          onPress={() => console.log('View energy pattern details')}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full pattern cards in behavioral insights page layout.',
      },
    },
  },
};

export const ConfidenceAnalysis: Story = {
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      padding: '20px'
    }}>
      <div>
        <h3 style={{ color: '#10b981', marginBottom: '12px' }}>🎯 High Confidence Patterns</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <PatternInsightCard
            pattern={{ ...timeOfDayPattern, confidence_score: 0.91 }}
            compact={true}
            showAnimation={false}
          />
          <PatternInsightCard
            pattern={{ ...weekendPattern, confidence_score: 0.94 }}
            compact={true}
            showAnimation={false}
          />
        </div>
      </div>
      
      <div>
        <h3 style={{ color: '#f59e0b', marginBottom: '12px' }}>⚠️ Medium Confidence Patterns</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <PatternInsightCard
            pattern={{ ...stressLevelPattern, confidence_score: 0.76 }}
            compact={true}
            showAnimation={false}
          />
          <PatternInsightCard
            pattern={{ ...dayOfWeekPattern, confidence_score: 0.68 }}
            compact={true}
            showAnimation={false}
          />
        </div>
      </div>
      
      <div>
        <h3 style={{ color: '#ef4444', marginBottom: '12px' }}>🔍 Low Confidence Patterns</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <PatternInsightCard
            pattern={lowConfidencePattern}
            compact={true}
            showAnimation={false}
          />
          <PatternInsightCard
            pattern={{ ...lowConfidencePattern, pattern_value: '22:15', confidence_score: 0.28 }}
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
        story: 'Patterns organized by confidence level for prioritized insights.',
      },
    },
  },
};

// Time-based Patterns
export const OptimalTimesDemo: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Optimal Engagement Times</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <PatternInsightCard
          pattern={{
            pattern_type: 'time_of_day',
            pattern_value: '07:00',
            success_rate: 0.84,
            confidence_score: 0.89,
            description: 'Mattino presto ottimale per consigli energetici e movimento.',
          }}
          compact={true}
          showAnimation={false}
        />
        <PatternInsightCard
          pattern={{
            pattern_type: 'time_of_day',
            pattern_value: '12:30',
            success_rate: 0.71,
            confidence_score: 0.82,
            description: 'Pausa pranzo ideale per mindfulness e rilassamento.',
          }}
          compact={true}
          showAnimation={false}
        />
        <PatternInsightCard
          pattern={{
            pattern_type: 'time_of_day',
            pattern_value: '19:00',
            success_rate: 0.78,
            confidence_score: 0.85,
            description: 'Sera perfetta per riflessione e journaling.',
          }}
          compact={true}
          showAnimation={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple time-based patterns showing optimal engagement windows.',
      },
    },
  },
};

// Edge Cases
export const ExtremeLowSuccess: Story = {
  args: {
    pattern: {
      pattern_type: 'time_of_day' as const,
      pattern_value: '03:30',
      success_rate: 0.12,
      confidence_score: 0.45,
      description: 'Orario notturno con bassissimo engagement. Pattern probabilmente correlato a insonnia o turni notturni.',
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pattern with extremely low success rate requiring different approach.',
      },
    },
  },
};

export const PerfectPattern: Story = {
  args: {
    pattern: {
      pattern_type: 'day_of_week' as const,
      pattern_value: 'sunday',
      success_rate: 0.98,
      confidence_score: 0.96,
      description: 'Domenica dimostra engagement quasi perfetto per consigli di wellness e recupero.',
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Near-perfect pattern with highest possible metrics.',
      },
    },
  },
};

export const InconsistentPattern: Story = {
  args: {
    pattern: {
      pattern_type: 'stress_level' as const,
      pattern_value: 'very_high',
      success_rate: 0.23,
      confidence_score: 0.18,
      description: 'Pattern inconsistente durante stress elevato. Utenti potrebbero aver bisogno di approccio completamente diverso.',
    },
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Inconsistent pattern with low confidence requiring reevaluation.',
      },
    },
  },
};

// Interactive Examples
export const InteractivePatternExplorer: Story = {
  render: () => {
    const [selectedType, setSelectedType] = React.useState<'time_of_day' | 'day_of_week' | 'stress_level' | 'energy_level'>('time_of_day');
    
    const patterns = {
      time_of_day: timeOfDayPattern,
      day_of_week: dayOfWeekPattern,
      stress_level: stressLevelPattern,
      energy_level: energyLevelPattern,
    };
    
    const typeLabels = {
      time_of_day: 'Time of Day',
      day_of_week: 'Day of Week',
      stress_level: 'Stress Level',
      energy_level: 'Energy Level',
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', marginBottom: '12px' }}>Pattern Type Explorer</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(patterns).map(key => (
              <button
                key={key}
                onClick={() => setSelectedType(key as any)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedType === key ? '#7c3aed' : '#374151',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {typeLabels[key as keyof typeof typeLabels]}
              </button>
            ))}
          </div>
        </div>
        
        <PatternInsightCard
          key={selectedType} // Force re-render
          pattern={patterns[selectedType]}
          showAnimation={true}
          compact={false}
          onPress={() => console.log(`Selected ${selectedType} pattern`)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive explorer allowing you to switch between different pattern types.',
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
        <PatternInsightCard
          pattern={timeOfDayPattern}
          showAnimation={false}
          style={{ filter: 'contrast(150%) brightness(110%)' }}
        />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Focus Indicators</h4>
        <PatternInsightCard
          pattern={energyLevelPattern}
          showAnimation={false}
          style={{ outline: '2px solid #f59e0b', outlineOffset: '4px' }}
        />
      </div>
      
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Screen Reader Optimization</h4>
        <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
          <p style={{ color: '#e5e7eb', fontSize: '12px', margin: 0 }}>
            Pattern cards include descriptive text, confidence levels are clearly communicated,
            and success rates are presented with contextual meaning for assistive technologies.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features for pattern insights including contrast, focus states, and screen reader support.',
      },
    },
  },
};
