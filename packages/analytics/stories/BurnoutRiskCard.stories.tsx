import type { Meta, StoryObj } from '@storybook/react';
import { BurnoutRiskCard } from '@lifeos/analytics';

const meta = {
  title: 'Analytics/BurnoutRiskCard',
  component: BurnoutRiskCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Burnout Risk Assessment Card that displays risk level, contributing factors, and actionable recommendations. Features progressive risk indicators, emergency support for high risk, and adaptive styling based on risk severity.',
      },
    },
  },
  argTypes: {
    riskLevel: {
      control: { type: 'select' },
      options: ['low', 'medium', 'high', null],
      description: 'Current burnout risk level',
      table: {
        type: { summary: 'low | medium | high | null' },
        defaultValue: { summary: 'low' },
      },
    },
    riskFactors: {
      control: 'object',
      description: 'Array of identified risk factors',
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: '[]' },
      },
    },
    recommendedActions: {
      control: 'object',
      description: 'Array of recommended actions',
      table: {
        type: { summary: 'string[]' },
        defaultValue: { summary: '[]' },
      },
    },
    onActionPress: {
      action: 'actionPressed',
      description: 'Callback when action button is pressed',
      table: {
        type: { summary: '(action: string) => void' },
      },
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Callback when card is dismissed',
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
} satisfies Meta<typeof BurnoutRiskCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Risk Level Stories
export const LowRisk: Story = {
  args: {
    riskLevel: 'low',
    riskFactors: [
      'Leggero aumento delle ore di lavoro',
      'Sonno occasionalmente insufficiente'
    ],
    recommendedActions: [
      'Continua routine di benessere attuale',
      'Monitora regolarmente i livelli di stress'
    ],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Low risk assessment with minimal factors and maintenance recommendations.',
      },
    },
  },
};

export const MediumRisk: Story = {
  args: {
    riskLevel: 'medium',
    riskFactors: [
      'Orari di lavoro prolungati per 2+ settimane',
      'Qualità del sonno ridotta',
      'Diminuzione attività fisica',
      'Aumento irritabilità'
    ],
    recommendedActions: [
      'Implementa pause regolari durante il lavoro',
      'Stabilisci una routine serale rilassante',
      'Riduci il carico di lavoro se possibile'
    ],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium risk with multiple factors requiring preventive measures.',
      },
    },
  },
};

export const HighRisk: Story = {
  args: {
    riskLevel: 'high',
    riskFactors: [
      'Esaurimento fisico e mentale persistente',
      'Insonnia frequente (5+ notti/settimana)',
      'Perdita di motivazione e interesse',
      'Isolamento sociale aumentato',
      'Difficoltà di concentrazione costanti',
      'Sintomi di ansia e irritabilità elevati'
    ],
    recommendedActions: [
      'Prendi una pausa immediata dal lavoro',
      'Consulta un professionista della salute mentale',
      'Implementa tecniche di gestione dello stress'
    ],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'High risk assessment with emergency support and immediate action required.',
      },
    },
  },
};

export const NoRiskData: Story = {
  args: {
    riskLevel: null,
    riskFactors: [],
    recommendedActions: [],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'State when insufficient data is available for assessment.',
      },
    },
  },
};

// Compact Variants
export const CompactLowRisk: Story = {
  args: {
    riskLevel: 'low',
    riskFactors: ['Lieve stress lavorativo'],
    recommendedActions: ['Mantieni routine attuali'],
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact version suitable for dashboard widgets.',
      },
    },
  },
};

export const CompactMediumRisk: Story = {
  args: {
    riskLevel: 'medium',
    riskFactors: ['Orari prolungati', 'Sonno ridotto'],
    recommendedActions: ['Implementa pause regolari'],
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact medium risk with essential information only.',
      },
    },
  },
};

export const CompactHighRisk: Story = {
  args: {
    riskLevel: 'high',
    riskFactors: ['Esaurimento persistente', 'Insonnia'],
    recommendedActions: ['Prendi pausa immediata'],
    showAnimation: true,
    compact: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact high risk with priority action button.',
      },
    },
  },
};

// Animation Variants
export const WithAnimation: Story = {
  args: {
    riskLevel: 'medium',
    riskFactors: [
      'Aumento del carico di lavoro',
      'Riduzione delle pause',
      'Stress interpersonale'
    ],
    recommendedActions: [
      'Programma pause di 15 minuti ogni 2 ore',
      'Pratica tecniche di respirazione',
      'Comunica con il team sui limiti'
    ],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with full entry animations and risk indicator pulse.',
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    riskLevel: 'high',
    riskFactors: [
      'Burnout sintomi evidenti',
      'Performance lavorativa ridotta'
    ],
    recommendedActions: [
      'Consultazione medica urgente',
      'Pausa dal lavoro necessaria'
    ],
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
export const DashboardIntegration: Story = {
  render: () => (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      gap: '16px',
      padding: '20px',
      backgroundColor: '#0f172a',
      borderRadius: '12px'
    }}>
      <div>
        <h3 style={{ color: '#fff', marginBottom: '16px' }}>Compact View</h3>
        <BurnoutRiskCard
          riskLevel="medium"
          riskFactors={['Orari prolungati', 'Stress elevato']}
          recommendedActions={['Pause regolari']}
          compact={true}
          showAnimation={true}
        />
      </div>
      <div>
        <h3 style={{ color: '#fff', marginBottom: '16px' }}>Full View</h3>
        <BurnoutRiskCard
          riskLevel="medium"
          riskFactors={[
            'Orari di lavoro prolungati',
            'Qualità del sonno ridotta',
            'Diminuzione attività fisica'
          ]}
          recommendedActions={[
            'Implementa pause regolari',
            'Stabilisci routine serale',
            'Aumenta movimento quotidiano'
          ]}
          compact={false}
          showAnimation={true}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard integration showing both compact and full card versions.',
      },
    },
  },
};

export const ProgressionDemo: Story = {
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '20px',
      padding: '20px'
    }}>
      <div>
        <h3 style={{ color: '#fff', marginBottom: '12px' }}>Week 1 - Low Risk</h3>
        <BurnoutRiskCard
          riskLevel="low"
          riskFactors={['Leggero aumento carico lavoro']}
          recommendedActions={['Monitora stress levels']}
          showAnimation={false}
        />
      </div>
      <div>
        <h3 style={{ color: '#fff', marginBottom: '12px' }}>Week 3 - Medium Risk</h3>
        <BurnoutRiskCard
          riskLevel="medium"
          riskFactors={[
            'Orari prolungati persistenti',
            'Sonno insufficiente',
            'Ridotta attività sociale'
          ]}
          recommendedActions={[
            'Implementa pause obbligatorie',
            'Migliora igiene del sonno'
          ]}
          showAnimation={false}
        />
      </div>
      <div>
        <h3 style={{ color: '#fff', marginBottom: '12px' }}>Week 5 - High Risk</h3>
        <BurnoutRiskCard
          riskLevel="high"
          riskFactors={[
            'Esaurimento fisico e mentale',
            'Insonnia cronica',
            'Perdita di motivazione',
            'Isolamento sociale'
          ]}
          recommendedActions={[
            'Pausa immediata necessaria',
            'Supporto professionale',
            'Riduzione drastica workload'
          ]}
          showAnimation={false}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Risk progression over time showing escalation from low to high risk.',
      },
    },
  },
};

export const EmergencySupport: Story = {
  args: {
    riskLevel: 'high',
    riskFactors: [
      'Sintomi di burnout gravi',
      'Thoughts of hopelessness',
      'Isolamento sociale completo',
      'Performance lavorativa crollata',
      'Insonnia cronica da settimane'
    ],
    recommendedActions: [
      'Contatta immediatamente un professionista',
      'Informa il datore di lavoro della situazione',
      'Attiva rete di supporto familiare/amici'
    ],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'High-risk card with emergency support section and professional help resources.',
      },
    },
  },
};

// Interactive Examples
export const InteractiveAssessment: Story = {
  render: () => {
    const [currentRisk, setCurrentRisk] = React.useState<'low' | 'medium' | 'high'>('low');
    
    const riskData = {
      low: {
        factors: ['Stress lavorativo minimo', 'Sonno adeguato'],
        actions: ['Mantieni routine attuali', 'Continua monitoraggio']
      },
      medium: {
        factors: ['Orari prolungati', 'Sonno ridotto', 'Stress aumentato'],
        actions: ['Implementa pause', 'Migliora sonno', 'Riduci carico']
      },
      high: {
        factors: ['Esaurimento', 'Insonnia', 'Perdita motivazione', 'Isolamento'],
        actions: ['Pausa immediata', 'Supporto professionale', 'Riduzione workload']
      }
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#fff', marginBottom: '12px' }}>Risk Level Simulator</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['low', 'medium', 'high'] as const).map(level => (
              <button
                key={level}
                onClick={() => setCurrentRisk(level)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: currentRisk === level ? '#7c3aed' : '#374151',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <BurnoutRiskCard
          key={currentRisk} // Force re-render for animation
          riskLevel={currentRisk}
          riskFactors={riskData[currentRisk].factors}
          recommendedActions={riskData[currentRisk].actions}
          showAnimation={true}
          compact={false}
          onActionPress={(action) => console.log('Action:', action)}
          onDismiss={() => console.log('Dismissed')}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo allowing you to switch between different risk levels.',
      },
    },
  },
};

// Edge Cases
export const LongFactorsList: Story = {
  args: {
    riskLevel: 'high',
    riskFactors: [
      'Orari di lavoro eccessivamente prolungati oltre le 12 ore giornaliere',
      'Qualità del sonno gravemente compromessa con risvegli frequenti',
      'Diminuzione significativa dell\'attività fisica e movimento',
      'Isolamento sociale progressivo da colleghi e amici',
      'Perdita di interesse nelle attività precedentemente piacevoli',
      'Difficoltà cognitive crescenti nella concentrazione e memoria',
      'Sintomi fisici di stress come mal di testa e tensione muscolare',
      'Aumento dell\'irritabilità e reazioni emotive sproporzione',
      'Riduzione dell\'appetito e irregolarità nei pasti'
    ],
    recommendedActions: [
      'Consultazione medica professionale urgente',
      'Implementazione pause forzate ogni ora',
      'Riduzione immediata del carico lavorativo'
    ],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with extensive list of risk factors (truncated display).',
      },
    },
  },
};

export const MinimalFactors: Story = {
  args: {
    riskLevel: 'medium',
    riskFactors: ['Stress'],
    recommendedActions: ['Pausa'],
    showAnimation: true,
    compact: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with minimal information and single factor/action.',
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
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>High Contrast (High Risk)</h4>
        <BurnoutRiskCard
          riskLevel="high"
          riskFactors={['Burnout symptoms evident']}
          recommendedActions={['Seek immediate support']}
          showAnimation={false}
          style={{ filter: 'contrast(150%)' }}
        />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Focus Indicators</h4>
        <BurnoutRiskCard
          riskLevel="medium"
          riskFactors={['Increased stress levels']}
          recommendedActions={['Take regular breaks']}
          showAnimation={false}
          style={{ outline: '2px solid #3b82f6', outlineOffset: '4px' }}
        />
      </div>
      
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Screen Reader Friendly</h4>
        <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
          <p style={{ color: '#e5e7eb', fontSize: '12px', margin: 0 }}>
            Cards include semantic HTML, ARIA labels, and descriptive text for screen readers.
            Risk levels are announced clearly with context and urgency indicators.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including high contrast, focus indicators, and screen reader support.',
      },
    },
  },
};
