import type { Meta, StoryObj } from '@storybook/react';
import { LoadingSpinner, DashboardLoader, AdviceLoader, SavingLoader, AnalyticsLoader, SetupLoader, LoadingSpinnerPresets } from '@lifeos/shared';

const meta = {
  title: 'Shared/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading Spinner component provides visual feedback during async operations. Features multiple sizes, customizable colors, animated messages, and loading dots. Essential for maintaining user engagement during data loading, API calls, and processing operations.',
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Spinner size variant',
      table: {
        type: { summary: 'small | medium | large' },
        defaultValue: { summary: 'medium' },
      },
    },
    color: {
      control: 'color',
      description: 'Primary spinner color',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '#7c3aed' },
      },
    },
    message: {
      control: 'text',
      description: 'Loading message text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Caricamento...' },
      },
    },
    showMessage: {
      control: 'boolean',
      description: 'Show loading message',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    style: {
      control: 'object',
      description: 'Additional container styles',
    },
    textStyle: {
      control: 'object',
      description: 'Additional text styles',
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Size Variants
export const Small: Story = {
  args: {
    size: 'small',
    color: '#7c3aed',
    message: 'Caricamento...',
    showMessage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Small spinner suitable for inline loading states and buttons.',
      },
    },
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    color: '#7c3aed',
    message: 'Caricamento...',
    showMessage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium spinner for general loading states and modals.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    color: '#7c3aed',
    message: 'Caricamento...',
    showMessage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large spinner for full-page loading and initial app loading.',
      },
    },
  },
};

// Color Variants
export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#fff', marginBottom: '16px' }}>Purple (Default)</h4>
        <LoadingSpinner size="medium" color="#7c3aed" message="Loading..." />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#fff', marginBottom: '16px' }}>Blue</h4>
        <LoadingSpinner size="medium" color="#3b82f6" message="Processing..." />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#fff', marginBottom: '16px' }}>Green</h4>
        <LoadingSpinner size="medium" color="#10b981" message="Saving..." />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#fff', marginBottom: '16px' }}>Orange</h4>
        <LoadingSpinner size="medium" color="#f97316" message="Uploading..." />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#fff', marginBottom: '16px' }}>Red</h4>
        <LoadingSpinner size="medium" color="#ef4444" message="Deleting..." />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#fff', marginBottom: '16px' }}>Yellow</h4>
        <LoadingSpinner size="medium" color="#eab308" message="Analyzing..." />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different color variants for various loading contexts.',
      },
    },
  },
};

// Message Variants
export const WithMessage: Story = {
  args: {
    size: 'medium',
    color: '#7c3aed',
    message: 'Caricamento dei tuoi dati...',
    showMessage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Spinner with custom loading message for context.',
      },
    },
  },
};

export const WithoutMessage: Story = {
  args: {
    size: 'medium',
    color: '#7c3aed',
    showMessage: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Spinner without message for minimal loading indicator.',
      },
    },
  },
};

export const LongMessage: Story = {
  args: {
    size: 'large',
    color: '#3b82f6',
    message: 'Elaborazione complessa in corso. Potrebbe richiedere alcuni minuti...',
    showMessage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Spinner with longer descriptive message for complex operations.',
      },
    },
  },
};

// Size Comparison
export const SizeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', padding: '40px' }}>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>Small</h4>
        <LoadingSpinner size="small" color="#7c3aed" message="Small" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>Medium</h4>
        <LoadingSpinner size="medium" color="#7c3aed" message="Medium" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '20px', fontSize: '14px' }}>Large</h4>
        <LoadingSpinner size="large" color="#7c3aed" message="Large" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of all size variants.',
      },
    },
  },
};

// Preset Components
export const DashboardLoading: Story = {
  render: () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Dashboard Loader</h3>
      <DashboardLoader />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset dashboard loader with large size and specific message.',
      },
    },
  },
};

export const AdviceLoading: Story = {
  render: () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Advice Loader</h3>
      <AdviceLoader />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset advice generation loader with blue color.',
      },
    },
  },
};

export const SavingLoading: Story = {
  render: () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Saving Loader</h3>
      <SavingLoader />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset saving loader with small size and green color.',
      },
    },
  },
};

export const AnalyticsLoading: Story = {
  render: () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Analytics Loader</h3>
      <AnalyticsLoader />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset analytics data processing loader with orange color.',
      },
    },
  },
};

export const SetupLoading: Story = {
  render: () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3 style={{ color: '#fff', marginBottom: '20px' }}>Setup Loader</h3>
      <SetupLoader />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset onboarding setup loader with large size.',
      },
    },
  },
};

// Real LifeOS Usage Examples
export const ButtonLoading: Story = {
  render: () => (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <h3 style={{ color: '#fff', marginBottom: '8px' }}>Button Loading States</h3>
      
      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '12px 20px', 
            backgroundColor: '#7c3aed', 
            border: 'none', 
            borderRadius: '6px',
            color: '#fff',
            cursor: 'not-allowed',
            opacity: 0.7
          }}
          disabled
        >
          <LoadingSpinner size="small" color="#fff" showMessage={false} />
          Saving...
        </button>
        
        <button 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '12px 20px', 
            backgroundColor: '#3b82f6', 
            border: 'none', 
            borderRadius: '6px',
            color: '#fff',
            cursor: 'not-allowed',
            opacity: 0.7
          }}
          disabled
        >
          <LoadingSpinner size="small" color="#fff" showMessage={false} />
          Loading
        </button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading spinners integrated into button components.',
      },
    },
  },
};

export const CardLoading: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Card Loading States</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div style={{ 
          backgroundColor: '#16213e', 
          borderRadius: '12px', 
          padding: '24px',
          minHeight: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <LoadingSpinner size="medium" color="#7c3aed" message="Loading metrics..." />
        </div>
        
        <div style={{ 
          backgroundColor: '#16213e', 
          borderRadius: '12px', 
          padding: '24px',
          minHeight: '120px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <LoadingSpinner size="small" color="#10b981" message="Updating..." />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading spinners within card components for content loading.',
      },
    },
  },
};

export const FullPageLoading: Story = {
  render: () => (
    <div style={{ 
      backgroundColor: '#0f172a',
      minHeight: '400px',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#9ca3af',
        fontSize: '14px'
      }}>
        Full Page Loading
      </div>
      <LoadingSpinner 
        size="large" 
        color="#7c3aed" 
        message="Inizializzazione applicazione..."
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-page loading state for app initialization.',
      },
    },
  },
};

export const ModalLoading: Story = {
  render: () => (
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Modal Loading</h3>
      <div style={{
        backgroundColor: '#16213e',
        borderRadius: '8px',
        padding: '32px',
        border: '1px solid #374151',
        maxWidth: '320px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#fff', marginBottom: '24px', fontSize: '18px' }}>Processing Request</h4>
        <LoadingSpinner 
          size="medium" 
          color="#3b82f6" 
          message="Please wait while we process your request..."
        />
        <div style={{ 
          marginTop: '24px',
          padding: '12px',
          backgroundColor: '#1f2937',
          borderRadius: '6px'
        }}>
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
            This may take a few moments
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading spinner in modal dialog for processing operations.',
      },
    },
  },
};

// Interactive Examples
export const InteractiveDemo: Story = {
  render: () => {
    const [size, setSize] = React.useState<'small' | 'medium' | 'large'>('medium');
    const [color, setColor] = React.useState('#7c3aed');
    const [showMessage, setShowMessage] = React.useState(true);
    const [message, setMessage] = React.useState('Caricamento...');
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>Spinner Customizer</h3>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', minWidth: '60px' }}>Size:</span>
            {(['small', 'medium', 'large'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSize(s)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: size === s ? '#7c3aed' : '#374151',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {s}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', minWidth: '60px' }}>Color:</span>
            {['#7c3aed', '#3b82f6', '#10b981', '#f97316', '#ef4444', '#eab308'].map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: color === c ? '2px solid #fff' : '1px solid #374151',
                  backgroundColor: c,
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox"
                checked={showMessage}
                onChange={(e) => setShowMessage(e.target.checked)}
              />
              Show Message
            </label>
            {showMessage && (
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  fontSize: '12px'
                }}
                placeholder="Loading message..."
              />
            )}
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '200px',
          backgroundColor: '#16213e',
          borderRadius: '8px'
        }}>
          <LoadingSpinner
            size={size}
            color={color}
            message={message}
            showMessage={showMessage}
          />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with controls for size, color, and message customization.',
      },
    },
  },
};

// Edge Cases
export const EmptyMessage: Story = {
  args: {
    size: 'medium',
    color: '#7c3aed',
    message: '',
    showMessage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Spinner with empty message (edge case).',
      },
    },
  },
};

export const VeryLongMessage: Story = {
  args: {
    size: 'large',
    color: '#3b82f6',
    message: 'Elaborazione estremamente complessa dei dati in corso. Questo processo potrebbe richiedere diversi minuti per completarsi a causa della grande quantità di informazioni da analizzare.',
    showMessage: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Spinner with very long message text.',
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
        <div style={{ backgroundColor: '#000', padding: '20px', borderRadius: '8px' }}>
          <LoadingSpinner
            size="medium"
            color="#ffffff"
            message="High contrast loading..."
          />
        </div>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Large Size for Visibility</h4>
        <LoadingSpinner
          size="large"
          color="#eab308"
          message="Large, highly visible spinner"
          textStyle={{ fontSize: 18, fontWeight: 'bold' }}
        />
      </div>
      
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Screen Reader Considerations</h4>
        <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
          <p style={{ color: '#e5e7eb', fontSize: '12px', margin: 0 }}>
            Loading spinners include descriptive text and ARIA labels for screen readers.
            The spinning animation provides visual feedback while text conveys status to assistive technologies.
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
