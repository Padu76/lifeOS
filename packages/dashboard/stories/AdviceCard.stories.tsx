import type { Meta, StoryObj } from '@storybook/react';
import { AdviceCard } from '@lifeos/dashboard';

const meta = {
  title: 'Dashboard/AdviceCard',
  component: AdviceCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Advice Card component displays personalized micro-interventions with priority indicators, effectiveness tracking, and user feedback collection. Features adaptive timing, personalization factors, and comprehensive interaction options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    advice: {
      control: 'object',
      description: 'Micro-advice object with all intervention details',
    },
    isResponding: {
      control: 'boolean',
      description: 'Whether the component is processing a user response',
      defaultValue: false,
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable entry animations',
      defaultValue: true,
    },
    compact: {
      control: 'boolean',
      description: 'Show compact version for limited space',
      defaultValue: false,
    },
    onComplete: {
      action: 'completed',
      description: 'Called when user completes the advice',
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Called when user dismisses the advice',
    },
    onSnooze: {
      action: 'snoozed',
      description: 'Called when user snoozes the advice',
    },
  },
} satisfies Meta<typeof AdviceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample advice data
const stressAdvice = {
  session_id: 'stress_001',
  advice_text: 'Prendi 3 respiri profondi e concentrati sul tuo battito cardiaco. Questo ti aiuterà a attivare il sistema nervoso parasimpatico.',
  advice_type: 'immediate' as const,
  priority: 'high' as const,
  category: 'stress',
  estimated_duration_minutes: 2,
  expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
  created_at: new Date().toISOString(),
  personalization_factors: {
    chronotype_optimized: true,
    stress_level_considered: true,
    energy_level_considered: false,
    context_aware: true,
  },
  effectiveness_tracking: {
    expected_stress_impact: 1.5,
    expected_energy_impact: 0.3,
    confidence_score: 0.87,
  },
};

const energyAdvice = {
  session_id: 'energy_001',
  advice_text: 'Fai una camminata veloce di 5 minuti o qualche jumping jack. Il movimento aumenterà la circolazione e ti darà energia naturale.',
  advice_type: 'contextual' as const,
  priority: 'medium' as const,
  category: 'movement',
  estimated_duration_minutes: 5,
  expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  personalization_factors: {
    chronotype_optimized: false,
    stress_level_considered: false,
    energy_level_considered: true,
    context_aware: true,
  },
  effectiveness_tracking: {
    expected_stress_impact: -0.2,
    expected_energy_impact: 2.1,
    confidence_score: 0.78,
  },
};

const urgentAdvice = {
  session_id: 'urgent_001',
  advice_text: 'Il tuo livello di stress è molto elevato. Fermati immediatamente e dedica 1 minuto alla respirazione 4-7-8: inspira per 4, trattieni per 7, espira per 8.',
  advice_type: 'immediate' as const,
  priority: 'urgent' as const,
  category: 'breathing',
  estimated_duration_minutes: 1,
  expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
  created_at: new Date().toISOString(),
  personalization_factors: {
    chronotype_optimized: true,
    stress_level_considered: true,
    energy_level_considered: true,
    context_aware: true,
  },
  effectiveness_tracking: {
    expected_stress_impact: 2.8,
    expected_energy_impact: 0.5,
    confidence_score: 0.92,
  },
};

const lowPriorityAdvice = {
  session_id: 'low_001',
  advice_text: 'Considera di bere un bicchiere d\'acqua. L\'idratazione adeguata supporta la concentrazione e il benessere generale.',
  advice_type: 'scheduled' as const,
  priority: 'low' as const,
  category: 'hydration',
  estimated_duration_minutes: 1,
  expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  personalization_factors: {
    chronotype_optimized: false,
    stress_level_considered: false,
    energy_level_considered: false,
    context_aware: false,
  },
  effectiveness_tracking: {
    expected_stress_impact: 0.1,
    expected_energy_impact: 0.4,
    confidence_score: 0.65,
  },
};

const expiredAdvice = {
  session_id: 'expired_001',
  advice_text: 'Questo consiglio è scaduto e non dovrebbe più essere visibile.',
  advice_type: 'immediate' as const,
  priority: 'medium' as const,
  category: 'test',
  estimated_duration_minutes: 5,
  expires_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  created_at: new Date().toISOString(),
  personalization_factors: {
    chronotype_optimized: false,
    stress_level_considered: false,
    energy_level_considered: false,
    context_aware: false,
  },
  effectiveness_tracking: {
    expected_stress_impact: 0,
    expected_energy_impact: 0,
    confidence_score: 0.5,
  },
};

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    advice: stressAdvice,
  },
};

export const StressRelief: Story = {
  args: {
    advice: stressAdvice,
  },
  parameters: {
    docs: {
      description: {
        story: 'High priority stress relief advice with breathing technique.',
      },
    },
  },
};

export const EnergyBoost: Story = {
  args: {
    advice: energyAdvice,
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium priority energy boost advice with movement suggestion.',
      },
    },
  },
};

export const UrgentIntervention: Story = {
  args: {
    advice: urgentAdvice,
  },
  parameters: {
    docs: {
      description: {
        story: 'Urgent priority intervention with glow effects and immediate action needed.',
      },
    },
  },
};

export const LowPriority: Story = {
  args: {
    advice: lowPriorityAdvice,
  },
  parameters: {
    docs: {
      description: {
        story: 'Low priority advice for general wellness maintenance.',
      },
    },
  },
};

// ===== PRIORITY STORIES =====

export const AllPriorities: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
        Priority Levels
      </h3>
      
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#ef4444' }}>
          Urgent Priority
        </h4>
        <AdviceCard advice={urgentAdvice} showAnimation={false} />
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#f97316' }}>
          High Priority
        </h4>
        <AdviceCard advice={stressAdvice} showAnimation={false} />
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#eab308' }}>
          Medium Priority
        </h4>
        <AdviceCard advice={energyAdvice} showAnimation={false} />
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#22c55e' }}>
          Low Priority
        </h4>
        <AdviceCard advice={lowPriorityAdvice} showAnimation={false} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison of all priority levels with their visual indicators.',
      },
    },
  },
};

// ===== CATEGORY STORIES =====

export const BreathingAdvice: Story = {
  args: {
    advice: {
      ...urgentAdvice,
      category: 'breathing',
      advice_text: 'Pratica la respirazione box: inspira per 4, trattieni per 4, espira per 4, pausa per 4. Ripeti 3 volte.',
      priority: 'high' as const,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Breathing exercise advice with specific technique instructions.',
      },
    },
  },
};

export const MovementAdvice: Story = {
  args: {
    advice: {
      ...energyAdvice,
      category: 'movement',
      advice_text: 'Alzati e fai 10 squat o stretching delle braccia. Il movimento aiuta a riattivare la circolazione.',
      estimated_duration_minutes: 3,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Physical movement advice for energy and circulation.',
      },
    },
  },
};

export const MindfulnessAdvice: Story = {
  args: {
    advice: {
      ...stressAdvice,
      category: 'mindfulness',
      advice_text: 'Dedica 2 minuti alla consapevolezza del momento presente. Osserva 5 cose che vedi, 4 che senti, 3 che odi.',
      estimated_duration_minutes: 2,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Mindfulness advice with grounding technique.',
      },
    },
  },
};

export const HydrationAdvice: Story = {
  args: {
    advice: {
      ...lowPriorityAdvice,
      category: 'hydration',
      advice_text: 'È ora della tua pausa idratazione! Bevi lentamente un bicchiere d\'acqua e nota come ti senti.',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Hydration reminder with mindful drinking approach.',
      },
    },
  },
};

// ===== PERSONALIZATION STORIES =====

export const HighlyPersonalized: Story = {
  args: {
    advice: {
      ...stressAdvice,
      personalization_factors: {
        chronotype_optimized: true,
        stress_level_considered: true,
        energy_level_considered: true,
        context_aware: true,
      },
      effectiveness_tracking: {
        expected_stress_impact: 2.2,
        expected_energy_impact: 0.8,
        confidence_score: 0.94,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Highly personalized advice with all optimization factors applied.',
      },
    },
  },
};

export const MinimalPersonalization: Story = {
  args: {
    advice: {
      ...lowPriorityAdvice,
      personalization_factors: {
        chronotype_optimized: false,
        stress_level_considered: false,
        energy_level_considered: false,
        context_aware: false,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Generic advice with minimal personalization factors.',
      },
    },
  },
};

export const ContextOptimized: Story = {
  args: {
    advice: {
      ...energyAdvice,
      advice_text: 'Sei in ufficio e hai bisogno di energia. Prova questi esercizi discreti: rotazioni delle spalle, stretching del collo.',
      personalization_factors: {
        chronotype_optimized: false,
        stress_level_considered: false,
        energy_level_considered: true,
        context_aware: true,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Context-aware advice optimized for workplace environment.',
      },
    },
  },
};

// ===== STATE STORIES =====

export const Responding: Story = {
  args: {
    advice: stressAdvice,
    isResponding: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card in responding state showing loading indicators.',
      },
    },
  },
};

export const Compact: Story = {
  args: {
    advice: stressAdvice,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version suitable for mobile or sidebar display.',
      },
    },
  },
};

export const NoAnimations: Story = {
  args: {
    advice: urgentAdvice,
    showAnimation: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card without animations for accessibility or performance.',
      },
    },
  },
};

export const ExpiredAdvice: Story = {
  args: {
    advice: expiredAdvice,
  },
  parameters: {
    docs: {
      description: {
        story: 'Expired advice showing removal prompt.',
      },
    },
  },
};

// ===== EFFECTIVENESS STORIES =====

export const HighConfidence: Story = {
  args: {
    advice: {
      ...stressAdvice,
      effectiveness_tracking: {
        expected_stress_impact: 2.5,
        expected_energy_impact: 0.8,
        confidence_score: 0.96,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'High confidence advice with strong expected impact.',
      },
    },
  },
};

export const LowConfidence: Story = {
  args: {
    advice: {
      ...lowPriorityAdvice,
      effectiveness_tracking: {
        expected_stress_impact: 0.2,
        expected_energy_impact: 0.3,
        confidence_score: 0.45,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Lower confidence advice with modest expected impact.',
      },
    },
  },
};

export const NegativeImpact: Story = {
  args: {
    advice: {
      ...energyAdvice,
      advice_text: 'Considera una pausa caffè, ma attenzione: troppa caffeina può aumentare lo stress più tardi.',
      effectiveness_tracking: {
        expected_stress_impact: -0.5, // May increase stress
        expected_energy_impact: 1.2,
        confidence_score: 0.72,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Advice with potential negative impact on one metric.',
      },
    },
  },
};

// ===== TIMING STORIES =====

export const ExpiringSoon: Story = {
  args: {
    advice: {
      ...urgentAdvice,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Advice expiring soon showing urgency in timing.',
      },
    },
  },
};

export const LongDuration: Story = {
  args: {
    advice: {
      ...stressAdvice,
      advice_text: 'Dedica 15 minuti a una sessione di meditazione guidata. Trova un posto tranquillo e usa la tua app preferita.',
      estimated_duration_minutes: 15,
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Longer duration advice requiring more time commitment.',
      },
    },
  },
};

export const QuickAction: Story = {
  args: {
    advice: {
      ...lowPriorityAdvice,
      advice_text: 'Fai 3 respiri profondi proprio ora. Veloce ed efficace!',
      estimated_duration_minutes: 0.5, // 30 seconds
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Very quick action requiring minimal time investment.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    advice: stressAdvice,
    isResponding: false,
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use controls to test different states.',
      },
    },
  },
};

// ===== LIFEOS USAGE EXAMPLES =====

export const FeedFlow: Story = {
  render: () => (
    <div style={{ 
      maxWidth: '600px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <h3 style={{ color: '#ffffff', margin: '0 0 20px 0', fontSize: '24px', fontWeight: 'bold' }}>
        Feed dei Consigli
      </h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        <AdviceCard advice={urgentAdvice} showAnimation={false} />
        <AdviceCard advice={stressAdvice} showAnimation={false} />
        <AdviceCard advice={energyAdvice} showAnimation={false} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple advice cards in a feed layout showing priority ordering.',
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
      
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h3 style={{ color: '#ffffff', margin: '0 0 8px 0', fontSize: '20px' }}>
          Consiglio per Te
        </h3>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
          Personalizzato per il tuo benessere
        </p>
      </div>
      
      <AdviceCard advice={stressAdvice} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Single advice card in mobile interface context.',
      },
    },
  },
};

export const CompactSidebar: Story = {
  render: () => (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '20px',
      maxWidth: '800px',
      backgroundColor: '#0f172a',
      padding: '20px',
      borderRadius: '16px'
    }}>
      <div>
        <h4 style={{ color: '#ffffff', margin: '0 0 16px 0', fontSize: '18px' }}>
          Quick Actions
        </h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          <AdviceCard advice={stressAdvice} compact={true} />
          <AdviceCard advice={energyAdvice} compact={true} />
          <AdviceCard advice={lowPriorityAdvice} compact={true} />
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#1e293b', 
        padding: '20px', 
        borderRadius: '12px',
        color: '#e2e8f0'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Main Dashboard</h4>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          [Main dashboard content would be here]
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact advice cards in sidebar layout alongside main content.',
      },
    },
  },
};

// ===== EDGE CASES =====

export const VeryLongAdvice: Story = {
  args: {
    advice: {
      ...stressAdvice,
      advice_text: 'Questo è un consiglio molto lungo che testa come il componente gestisce testo esteso. Pratica la respirazione profonda concentrandoti su ogni inspirazione ed espirazione. Conta fino a quattro mentre inspiri, trattieni il respiro per sette secondi, poi espira lentamente contando fino a otto. Ripeti questo ciclo almeno tre volte, permettendo al tuo corpo di rilassarsi progressivamente con ogni respirazione. Nota come la tensione si scioglie dalle tue spalle e come la tua mente diventa più calma.',
      estimated_duration_minutes: 8,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing layout with very long advice text.',
      },
    },
  },
};

export const ExtremeValues: Story = {
  args: {
    advice: {
      ...urgentAdvice,
      estimated_duration_minutes: 45,
      effectiveness_tracking: {
        expected_stress_impact: 5.0,
        expected_energy_impact: -2.0,
        confidence_score: 1.0,
      },
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Testing with extreme duration and impact values.',
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
        <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Priority Indicators</h4>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          Multiple visual indicators ensure priority is clear for all users.
        </p>
        <AdviceCard advice={urgentAdvice} showAnimation={false} />
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Features Include:</h4>
        <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
          <li>Color + text + icon priority indicators</li>
          <li>High contrast borders for priority levels</li>
          <li>Semantic markup for screen readers</li>
          <li>Keyboard navigation for all actions</li>
          <li>Clear action button labeling</li>
          <li>Modal feedback forms with proper focus management</li>
          <li>Progress indicators during loading states</li>
          <li>Time-based information in accessible formats</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features ensuring advice is actionable for all users.',
      },
    },
  },
};
