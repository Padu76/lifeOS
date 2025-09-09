import type { Meta, StoryObj } from '@storybook/react';
import { Card, Button, Typography } from '@lifeos/ui';

const meta = {
  title: 'UI Foundation/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced card container component with multiple variants, padding options, and interactive features. Foundation element for all content sections in LifeOS.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined', 'glass', 'minimal'],
      description: 'Card variant style',
      defaultValue: 'default',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Padding size',
      defaultValue: 'md',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Border radius variant',
      defaultValue: 'md',
    },
    background: {
      control: 'select',
      options: ['white', 'gray', 'transparent', 'primary', 'success', 'warning', 'error'],
      description: 'Background color variant',
      defaultValue: 'white',
    },
    clickable: {
      control: 'boolean',
      description: 'Make card clickable',
      defaultValue: false,
    },
    hoverable: {
      control: 'boolean',
      description: 'Add hover effects',
      defaultValue: false,
    },
    children: {
      control: 'text',
      description: 'Card content',
      defaultValue: 'Card content goes here',
    },
    header: {
      control: 'text',
      description: 'Header content (use text for demo)',
    },
    footer: {
      control: 'text',
      description: 'Footer content (use text for demo)',
    },
    onCardClick: {
      action: 'card-clicked',
      description: 'Function called when card is clicked (if clickable)',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    children: 'This is a default card with some content inside.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', maxWidth: '800px' }}>
      <Card variant="default">Default Card</Card>
      <Card variant="elevated">Elevated Card</Card>
      <Card variant="outlined">Outlined Card</Card>
      <Card variant="glass">Glass Card</Card>
      <Card variant="minimal">Minimal Card</Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available card variants in LifeOS design system.',
      },
    },
  },
};

export const AllPadding: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', maxWidth: '600px' }}>
      <Card padding="none" variant="outlined">No Padding</Card>
      <Card padding="sm" variant="outlined">Small</Card>
      <Card padding="md" variant="outlined">Medium</Card>
      <Card padding="lg" variant="outlined">Large</Card>
      <Card padding="xl" variant="outlined">Extra Large</Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available padding sizes.',
      },
    },
  },
};

// ===== VARIANT STORIES =====

export const DefaultCard: Story = {
  args: {
    variant: 'default',
    children: (
      <div>
        <Typography variant="h4">Default Card</Typography>
        <Typography variant="body2" color="secondary">
          Standard card with subtle border and white background.
        </Typography>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default card style with subtle border.',
      },
    },
  },
};

export const ElevatedCard: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <Typography variant="h4">Elevated Card</Typography>
        <Typography variant="body2" color="secondary">
          Card with shadow elevation for prominent content.
        </Typography>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Elevated card with shadow for prominence.',
      },
    },
  },
};

export const OutlinedCard: Story = {
  args: {
    variant: 'outlined',
    children: (
      <div>
        <Typography variant="h4">Outlined Card</Typography>
        <Typography variant="body2" color="secondary">
          Card with prominent colored border for emphasis.
        </Typography>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Outlined card with prominent border.',
      },
    },
  },
};

export const GlassCard: Story = {
  args: {
    variant: 'glass',
    children: (
      <div>
        <Typography variant="h4">Glass Card</Typography>
        <Typography variant="body2" color="secondary">
          Modern glass morphism effect with backdrop blur.
        </Typography>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Glass morphism card with backdrop blur effect.',
      },
    },
  },
};

export const MinimalCard: Story = {
  args: {
    variant: 'minimal',
    children: (
      <div>
        <Typography variant="h4">Minimal Card</Typography>
        <Typography variant="body2" color="secondary">
          Clean minimal style with no borders or shadows.
        </Typography>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal card with clean, borderless design.',
      },
    },
  },
};

// ===== INTERACTIVE STORIES =====

export const ClickableCard: Story = {
  args: {
    clickable: true,
    hoverable: true,
    variant: 'elevated',
    children: (
      <div>
        <Typography variant="h4">Clickable Card</Typography>
        <Typography variant="body2" color="secondary">
          Click me! I have hover effects and keyboard support.
        </Typography>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Clickable card with hover effects and keyboard accessibility.',
      },
    },
  },
};

export const HoverableCard: Story = {
  args: {
    hoverable: true,
    variant: 'default',
    children: (
      <div>
        <Typography variant="h4">Hoverable Card</Typography>
        <Typography variant="body2" color="secondary">
          Hover over me to see the elevation effect!
        </Typography>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with hover effects but not clickable.',
      },
    },
  },
};

// ===== HEADER AND FOOTER STORIES =====

export const WithHeader: Story = {
  args: {
    header: (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Card Title</Typography>
        <Button size="sm" variant="ghost">⋯</Button>
      </div>
    ),
    children: (
      <Typography variant="body1">
        This card has a header section with title and action button.
      </Typography>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with header section containing title and actions.',
      },
    },
  },
};

export const WithFooter: Story = {
  args: {
    children: (
      <div>
        <Typography variant="h4">Card Content</Typography>
        <Typography variant="body2" color="secondary">
          This card has a footer section below with actions.
        </Typography>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Button size="sm" variant="ghost">Cancel</Button>
        <Button size="sm" variant="primary">Save</Button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with footer section containing action buttons.',
      },
    },
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    variant: 'elevated',
    header: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>⚙️</span>
        <Typography variant="h4">Settings</Typography>
      </div>
    ),
    children: (
      <div>
        <Typography variant="body1" style={{ marginBottom: '12px' }}>
          Configure your preferences and notification settings.
        </Typography>
        <Typography variant="body2" color="secondary">
          Changes will be saved automatically.
        </Typography>
      </div>
    ),
    footer: (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button size="sm" variant="outline" fullWidth>Reset to Defaults</Button>
        <Button size="sm" variant="primary" fullWidth>Apply Changes</Button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete card with both header and footer sections.',
      },
    },
  },
};

// ===== BACKGROUND VARIANTS =====

export const BackgroundVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', maxWidth: '800px' }}>
      <Card background="white" variant="outlined">
        <Typography variant="subtitle1">White</Typography>
        <Typography variant="caption" color="secondary">Default background</Typography>
      </Card>
      <Card background="gray" variant="outlined">
        <Typography variant="subtitle1">Gray</Typography>
        <Typography variant="caption" color="secondary">Subtle gray background</Typography>
      </Card>
      <Card background="primary" variant="outlined">
        <Typography variant="subtitle1" color="white">Primary</Typography>
        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>Brand color background</Typography>
      </Card>
      <Card background="success" variant="outlined">
        <Typography variant="subtitle1" color="white">Success</Typography>
        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>Success state</Typography>
      </Card>
      <Card background="warning" variant="outlined">
        <Typography variant="subtitle1" color="white">Warning</Typography>
        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>Warning state</Typography>
      </Card>
      <Card background="error" variant="outlined">
        <Typography variant="subtitle1" color="white">Error</Typography>
        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>Error state</Typography>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available background color variants.',
      },
    },
  },
};

// ===== LIFEOS USAGE EXAMPLES =====

export const LifeOSMetricCard: Story = {
  render: () => (
    <Card variant="elevated" padding="lg" style={{ maxWidth: '280px' }}>
      <div style={{ textAlign: 'center' }}>
        <Typography variant="h1" color="accent" style={{ marginBottom: '8px' }}>
          8.2
        </Typography>
        <Typography variant="subtitle1" style={{ marginBottom: '4px' }}>
          Life Score
        </Typography>
        <Typography variant="caption" color="success" style={{ marginBottom: '16px' }}>
          ↑ +0.5 from yesterday
        </Typography>
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          borderRadius: '8px', 
          height: '8px', 
          marginBottom: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            backgroundColor: '#34C759', 
            borderRadius: '8px', 
            height: '100%', 
            width: '82%',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <Typography variant="caption" color="secondary">
          Excellent progress today! 🌟
        </Typography>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS metric card showing life score with progress.',
      },
    },
  },
};

export const LifeOSAdviceCard: Story = {
  render: () => (
    <Card 
      variant="outlined" 
      clickable 
      hoverable 
      padding="lg" 
      style={{ maxWidth: '320px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>🧘</span>
        <div style={{ flex: 1 }}>
          <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
            Mindful Breathing
          </Typography>
          <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
            Your stress level is a bit high. Take 3 deep breaths to help your nervous system reset.
          </Typography>
          <Typography variant="caption" color="muted">
            2 minutes • 89% of users find this helpful
          </Typography>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button size="sm" variant="primary" style={{ flex: 1 }}>
          Try Now
        </Button>
        <Button size="sm" variant="ghost" style={{ flex: 1 }}>
          Later
        </Button>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS advice card with micro-intervention suggestion.',
      },
    },
  },
};

export const LifeOSStatusCard: Story = {
  render: () => (
    <Card variant="default" padding="lg" style={{ maxWidth: '300px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <Typography variant="subtitle1">Today's Progress</Typography>
        <span style={{ 
          backgroundColor: '#34C759', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px',
          fontWeight: '500'
        }}>
          On Track
        </span>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <Typography variant="caption" color="secondary">Daily Goals</Typography>
          <Typography variant="caption" color="secondary">7/10</Typography>
        </div>
        <div style={{ backgroundColor: '#f0f0f0', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
          <div style={{ 
            backgroundColor: '#34C759', 
            borderRadius: '8px', 
            height: '100%', 
            width: '70%',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h3" color="accent">4</Typography>
          <Typography variant="caption" color="secondary">Check-ins</Typography>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h3" color="success">12</Typography>
          <Typography variant="caption" color="secondary">Tasks Done</Typography>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <Typography variant="h3" color="warning">2</Typography>
          <Typography variant="caption" color="secondary">Postponed</Typography>
        </div>
      </div>

      <Button variant="outline" size="sm" fullWidth leftIcon="📊">
        View Detailed Report
      </Button>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS daily progress status card with metrics.',
      },
    },
  },
};

export const LifeOSInsightCard: Story = {
  render: () => (
    <Card variant="elevated" background="primary" padding="lg" style={{ maxWidth: '340px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <Typography variant="subtitle1" color="white">Weekly Insight</Typography>
        </div>
        <Typography variant="body1" color="white" style={{ marginBottom: '12px' }}>
          You're most productive on Tuesday mornings around 10 AM. Consider scheduling important tasks during this time.
        </Typography>
        <Typography variant="caption" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Based on 4 weeks of data • 94% accuracy
        </Typography>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="ghost" size="sm" style={{ 
          flex: 1, 
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none'
        }}>
          Schedule Tasks
        </Button>
        <Button variant="ghost" size="sm" style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          Learn More
        </Button>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS insight card with AI-generated recommendations.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    children: 'Customize this card using the controls panel!',
    variant: 'default',
    padding: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use controls panel to customize all card properties.',
      },
    },
  },
};

// ===== ACCESSIBILITY EXAMPLES =====

export const AccessibilityDemo: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <Typography variant="h3">Accessibility Features</Typography>
      
      <Card variant="outlined">
        <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
          Clickable Cards
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
          Try tabbing to this card and pressing Enter or Space
        </Typography>
        <Card 
          clickable 
          variant="elevated" 
          padding="sm"
          style={{ cursor: 'pointer' }}
          onCardClick={() => alert('Card clicked!')}
        >
          <Typography variant="body2" style={{ textAlign: 'center' }}>
            Click me or use keyboard! 🎯
          </Typography>
        </Card>
      </Card>
      
      <Card variant="outlined">
        <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
          Focus Indicators
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
          Interactive cards have visible focus indicators for screen readers
        </Typography>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Card clickable variant="default" padding="sm" style={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption">Focusable 1</Typography>
          </Card>
          <Card clickable variant="default" padding="sm" style={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption">Focusable 2</Typography>
          </Card>
        </div>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features including keyboard navigation and focus indicators.',
      },
    },
  },
};
