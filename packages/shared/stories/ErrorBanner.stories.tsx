import type { Meta, StoryObj } from '@storybook/react';
import { ErrorBanner, NetworkErrorBanner, AuthErrorBanner, UnsavedChangesBanner, SuccessBanner, ErrorMessages, WarningMessages, InfoMessages } from '@lifeos/shared';

const meta = {
  title: 'Shared/ErrorBanner',
  component: ErrorBanner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Error Banner component for displaying system notifications, alerts, and user feedback. Supports different severity levels (error, warning, info) with animations, auto-hide functionality, and retry mechanisms. Essential for user communication and error handling.',
      },
    },
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'Error or notification message to display',
      table: {
        type: { summary: 'string' },
      },
    },
    type: {
      control: { type: 'select' },
      options: ['error', 'warning', 'info'],
      description: 'Banner type affecting styling and icon',
      table: {
        type: { summary: 'error | warning | info' },
        defaultValue: { summary: 'error' },
      },
    },
    onRetry: {
      action: 'retryPressed',
      description: 'Callback when retry button is pressed',
      table: {
        type: { summary: '() => void' },
      },
    },
    onDismiss: {
      action: 'dismissed',
      description: 'Callback when banner is dismissed',
      table: {
        type: { summary: '() => void' },
      },
    },
    autoHide: {
      control: 'boolean',
      description: 'Automatically hide banner after delay',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    autoHideDelay: {
      control: { type: 'range', min: 1000, max: 10000, step: 500 },
      description: 'Auto-hide delay in milliseconds',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '5000' },
      },
    },
    retryText: {
      control: 'text',
      description: 'Text for retry button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Riprova' },
      },
    },
    dismissText: {
      control: 'text',
      description: 'Text for dismiss button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '✕' },
      },
    },
    showIcon: {
      control: 'boolean',
      description: 'Show type-specific icon',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    persistent: {
      control: 'boolean',
      description: 'Prevent auto-hide and require manual dismissal',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    style: {
      control: 'object',
      description: 'Additional container styles',
    },
    messageStyle: {
      control: 'object',
      description: 'Additional message text styles',
    },
  },
} satisfies Meta<typeof ErrorBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Type Stories
export const ErrorType: Story = {
  args: {
    message: 'Si è verificato un errore durante il caricamento dei dati.',
    type: 'error',
    showIcon: true,
    persistent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Standard error banner with default red styling and error icon.',
      },
    },
  },
};

export const WarningType: Story = {
  args: {
    message: 'Attenzione: alcune funzionalità potrebbero non essere disponibili.',
    type: 'warning',
    showIcon: true,
    persistent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Warning banner with orange styling for caution messages.',
      },
    },
  },
};

export const InfoType: Story = {
  args: {
    message: 'I tuoi dati sono stati sincronizzati con successo.',
    type: 'info',
    showIcon: true,
    persistent: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Info banner with blue styling for informational messages.',
      },
    },
  },
};

// Action Stories
export const WithRetry: Story = {
  args: {
    message: 'Errore di connessione. Controlla la tua connessione internet.',
    type: 'error',
    showIcon: true,
    retryText: 'Riprova',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error banner with retry button for recoverable errors.',
      },
    },
  },
};

export const WithCustomRetryText: Story = {
  args: {
    message: 'Impossibile caricare i consigli. Tentativo di riconnessione...',
    type: 'error',
    showIcon: true,
    retryText: 'Ricarica',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error banner with custom retry button text.',
      },
    },
  },
};

export const WithDismiss: Story = {
  args: {
    message: 'Nuova versione disponibile. Aggiorna per le ultime funzionalità.',
    type: 'info',
    showIcon: true,
    dismissText: '✕',
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with dismiss button for closeable notifications.',
      },
    },
  },
};

export const WithBothActions: Story = {
  args: {
    message: 'Errore durante il salvataggio. I dati potrebbero essere persi.',
    type: 'error',
    showIcon: true,
    retryText: 'Salva di nuovo',
    dismissText: '✕',
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with both retry and dismiss buttons.',
      },
    },
  },
};

// Auto-hide Stories
export const AutoHide: Story = {
  args: {
    message: 'Operazione completata con successo!',
    type: 'info',
    autoHide: true,
    autoHideDelay: 3000,
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner that automatically disappears after 3 seconds.',
      },
    },
  },
};

export const AutoHideLongDelay: Story = {
  args: {
    message: 'File di grandi dimensioni in caricamento. Potrebbero essere necessari alcuni minuti.',
    type: 'warning',
    autoHide: true,
    autoHideDelay: 8000,
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with longer auto-hide delay for important messages.',
      },
    },
  },
};

// Persistent Stories
export const Persistent: Story = {
  args: {
    message: 'Sessione scaduta. Effettua nuovamente il login per continuare.',
    type: 'error',
    persistent: true,
    showIcon: true,
    retryText: 'Login',
  },
  parameters: {
    docs: {
      description: {
        story: 'Persistent banner that requires manual dismissal for critical errors.',
      },
    },
  },
};

export const PersistentWarning: Story = {
  args: {
    message: 'Modalità offline attiva. Alcune funzionalità non sono disponibili.',
    type: 'warning',
    persistent: true,
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Persistent warning for ongoing conditions.',
      },
    },
  },
};

// Icon Variants
export const WithoutIcon: Story = {
  args: {
    message: 'Messaggio di sistema senza icona per design minimale.',
    type: 'info',
    showIcon: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner without icon for cleaner, minimal appearance.',
      },
    },
  },
};

// Message Length Stories
export const ShortMessage: Story = {
  args: {
    message: 'Errore.',
    type: 'error',
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with very short message.',
      },
    },
  },
};

export const LongMessage: Story = {
  args: {
    message: 'Si è verificato un errore imprevisto durante il tentativo di sincronizzazione dei dati con il server. Il sistema ha rilevato un timeout nella connessione che potrebbe essere causato da problemi di rete temporanei o da sovraccarico del server. Riprova tra qualche minuto.',
    type: 'error',
    showIcon: true,
    retryText: 'Riprova',
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with long message text (truncated display).',
      },
    },
  },
};

// Preset Components Stories
export const NetworkError: Story = {
  render: () => (
    <NetworkErrorBanner onRetry={() => console.log('Network retry')} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset network error banner with standard message.',
      },
    },
  },
};

export const AuthError: Story = {
  render: () => (
    <AuthErrorBanner onRetry={() => console.log('Auth retry')} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset authentication error banner (persistent).',
      },
    },
  },
};

export const UnsavedChanges: Story = {
  render: () => (
    <UnsavedChangesBanner onDismiss={() => console.log('Changes dismissed')} />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset unsaved changes warning with auto-hide.',
      },
    },
  },
};

export const Success: Story = {
  render: () => (
    <SuccessBanner message="Profilo aggiornato con successo!" />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Preset success banner with auto-hide.',
      },
    },
  },
};

// Real LifeOS Usage Examples
export const DashboardErrors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', backgroundColor: '#0f172a', borderRadius: '12px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Dashboard Error States</h3>
      
      <ErrorBanner
        message={ErrorMessages.network}
        type="error"
        onRetry={() => console.log('Reload dashboard')}
        showIcon={true}
      />
      
      <ErrorBanner
        message="Alcuni widget potrebbero non essere aggiornati."
        type="warning"
        autoHide={true}
        autoHideDelay={5000}
        showIcon={true}
      />
      
      <ErrorBanner
        message="Dashboard caricata. Tutti i sistemi operativi."
        type="info"
        autoHide={true}
        autoHideDelay={3000}
        showIcon={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple banners showing different dashboard states.',
      },
    },
  },
};

export const OnboardingFlow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '16px' }}>Onboarding Messages</h3>
      
      <ErrorBanner
        message="Benvenuto in LifeOS! Iniziamo configurando il tuo profilo."
        type="info"
        showIcon={true}
        dismissText="Inizia"
      />
      
      <ErrorBanner
        message="Alcuni campi richiesti sono vuoti. Completa per continuare."
        type="warning"
        showIcon={true}
        retryText="Rivedi"
      />
      
      <ErrorBanner
        message="Configurazione completata! Il tuo viaggio verso il benessere inizia ora."
        type="info"
        autoHide={true}
        autoHideDelay={4000}
        showIcon={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Banner sequence for onboarding flow guidance.',
      },
    },
  },
};

export const SystemNotifications: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
      <h3 style={{ color: '#fff', marginBottom: '12px' }}>System Notifications</h3>
      
      <ErrorBanner
        message={InfoMessages.synced}
        type="info"
        autoHide={true}
        autoHideDelay={2000}
        showIcon={true}
      />
      
      <ErrorBanner
        message={WarningMessages.lowBattery}
        type="warning"
        persistent={true}
        showIcon={true}
        dismissText="OK"
      />
      
      <ErrorBanner
        message={ErrorMessages.offline}
        type="error"
        persistent={true}
        showIcon={true}
        retryText="Riconnetti"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'System-level notifications and status messages.',
      },
    },
  },
};

// Interactive Examples
export const InteractiveDemo: Story = {
  render: () => {
    const [bannerType, setBannerType] = React.useState<'error' | 'warning' | 'info'>('error');
    const [showRetry, setShowRetry] = React.useState(true);
    const [autoHide, setAutoHide] = React.useState(false);
    
    const messages = {
      error: 'Errore durante il caricamento. Riprova.',
      warning: 'Attenzione: connessione instabile rilevata.',
      info: 'Sincronizzazione completata con successo.',
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>Banner Customizer</h3>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#9ca3af', minWidth: '60px' }}>Type:</span>
            {(['error', 'warning', 'info'] as const).map(type => (
              <button
                key={type}
                onClick={() => setBannerType(type)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: bannerType === type ? '#7c3aed' : '#374151',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {type}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input 
                type="checkbox"
                checked={showRetry}
                onChange={(e) => setShowRetry(e.target.checked)}
              />
              Show Retry
            </label>
            <label style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input 
                type="checkbox"
                checked={autoHide}
                onChange={(e) => setAutoHide(e.target.checked)}
              />
              Auto Hide
            </label>
          </div>
        </div>
        
        <ErrorBanner
          key={`${bannerType}-${showRetry}-${autoHide}`} // Force re-render
          message={messages[bannerType]}
          type={bannerType}
          onRetry={showRetry ? () => console.log('Retry clicked') : undefined}
          onDismiss={() => console.log('Dismissed')}
          autoHide={autoHide}
          autoHideDelay={3000}
          showIcon={true}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with controls for type, retry, and auto-hide options.',
      },
    },
  },
};

// Edge Cases
export const EmptyMessage: Story = {
  args: {
    message: '',
    type: 'error',
    showIcon: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with empty message (edge case).',
      },
    },
  },
};

export const SpecialCharacters: Story = {
  args: {
    message: 'Errore con caratteri speciali: àèéìòù & <>"\'/\\',
    type: 'error',
    showIcon: true,
    retryText: 'Riprova con àccènti',
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner handling special characters and accents.',
      },
    },
  },
};

// Animation Examples
export const AnimationShowcase: Story = {
  render: () => {
    const [showBanner, setShowBanner] = React.useState(true);
    
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowBanner(!showBanner)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#7c3aed',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            {showBanner ? 'Hide Banner' : 'Show Banner'}
          </button>
        </div>
        
        {showBanner && (
          <ErrorBanner
            message="Banner con animazioni di entrata slide e shake."
            type="error"
            onRetry={() => console.log('Retry')}
            showIcon={true}
          />
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of banner entry animations including slide and shake effects.',
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
        <ErrorBanner
          message="Banner con contrasto elevato per accessibilità."
          type="error"
          showIcon={true}
          style={{ filter: 'contrast(150%)' }}
        />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Large Text</h4>
        <ErrorBanner
          message="Banner con testo ingrandito per visibilità."
          type="warning"
          showIcon={true}
          messageStyle={{ fontSize: 16, fontWeight: 'bold' }}
        />
      </div>
      
      <div>
        <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Screen Reader Friendly</h4>
        <div style={{ backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px' }}>
          <p style={{ color: '#e5e7eb', fontSize: '12px', margin: 0 }}>
            Banners include semantic markup, ARIA labels, and descriptive text for screen readers.
            Severity levels are communicated through color, icons, and text context.
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including high contrast, large text, and screen reader support.',
      },
    },
  },
};
