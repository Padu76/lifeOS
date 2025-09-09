import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@lifeos/ui';

const meta = {
  title: 'UI Foundation/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced button component with multiple variants, sizes, states, and accessibility features. Foundation element for all interactive actions in LifeOS.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success', 'ghost', 'outline'],
      description: 'Button variant style',
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
      defaultValue: 'md',
    },
    children: {
      control: 'text',
      description: 'Button content - text, icons, or other elements',
      defaultValue: 'Button',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
      defaultValue: false,
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make button full width',
      defaultValue: false,
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius variant',
      defaultValue: 'md',
    },
    leftIcon: {
      control: 'text',
      description: 'Icon to display on the left (use emoji for demo)',
    },
    rightIcon: {
      control: 'text',
      description: 'Icon to display on the right (use emoji for demo)',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when button is clicked',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="success">Success</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants in LifeOS design system.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes.',
      },
    },
  },
};

// ===== VARIANT STORIES =====

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Start Check-in',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary button style for main actions like "Start Check-in" or "Save Changes".',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'View Details',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button style for supporting actions.',
      },
    },
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete Account',
  },
  parameters: {
    docs: {
      description: {
        story: 'Danger button style for destructive actions.',
      },
    },
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Complete Task ✓',
  },
  parameters: {
    docs: {
      description: {
        story: 'Success button style for completion actions.',
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Learn More',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ghost button style for subtle actions.',
      },
    },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancel',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline button style for secondary actions.',
      },
    },
  },
};

// ===== SIZE STORIES =====

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small button size for compact interfaces.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Action Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large button size for primary CTAs.',
      },
    },
  },
};

// ===== STATE STORIES =====

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Saving Changes...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state with spinner.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in disabled state.',
      },
    },
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Button loading variant="primary">Saving...</Button>
      <Button loading variant="secondary">Loading...</Button>
      <Button loading variant="success">Processing...</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button variants in loading state.',
      },
    },
  },
};

// ===== ICON STORIES =====

export const WithLeftIcon: Story = {
  args: {
    leftIcon: '📊',
    children: 'View Analytics',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with left icon.',
      },
    },
  },
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: '→',
    children: 'Continue',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with right icon.',
      },
    },
  },
};

export const WithBothIcons: Story = {
  args: {
    leftIcon: '💾',
    rightIcon: '✓',
    children: 'Save',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with both left and right icons.',
      },
    },
  },
};

export const IconOnly: Story = {
  args: {
    leftIcon: '❤️',
    children: '',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Icon-only button for compact actions.',
      },
    },
  },
};

// ===== LAYOUT STORIES =====

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button that takes full width of container.',
      },
    },
  },
};

export const RoundedVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Button rounded="none">No Radius</Button>
      <Button rounded="sm">Small Radius</Button>
      <Button rounded="md">Medium Radius</Button>
      <Button rounded="lg">Large Radius</Button>
      <Button rounded="full">Full Radius</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different border radius variants.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    children: 'Customize Me!',
    variant: 'primary',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use controls panel to customize all button properties.',
      },
    },
  },
};

// ===== LIFEOS USAGE EXAMPLES =====

export const LifeOSCheckInFlow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
      <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>Check-in Flow</h3>
      
      <Button variant="primary" size="lg" fullWidth leftIcon="🎯">
        Start Daily Check-in
      </Button>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="outline" size="md" style={{ flex: 1 }}>
          Skip Today
        </Button>
        <Button variant="secondary" size="md" style={{ flex: 1 }}>
          Remind Later
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS daily check-in flow buttons.',
      },
    },
  },
};

export const LifeOSTaskActions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '280px' }}>
      <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: '600' }}>Task Actions</h3>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="success" size="sm" leftIcon="✓" style={{ flex: 1 }}>
          Complete
        </Button>
        <Button variant="ghost" size="sm" leftIcon="⏰" style={{ flex: 1 }}>
          Postpone
        </Button>
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="secondary" size="sm" leftIcon="📝" style={{ flex: 1 }}>
          Add Note
        </Button>
        <Button variant="danger" size="sm" leftIcon="🗑️" style={{ flex: 1 }}>
          Delete
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS task management actions.',
      },
    },
  },
};

export const LifeOSAnalyticsCTA: Story = {
  render: () => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px', 
      padding: '24px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      maxWidth: '350px'
    }}>
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
          Your Weekly Progress
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          You've improved your life score by 15% this week!
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <Button variant="primary" leftIcon="📊" style={{ flex: 1 }}>
          View Details
        </Button>
        <Button variant="outline" leftIcon="📤">
          Share
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS analytics card with CTA buttons.',
      },
    },
  },
};

// ===== ACCESSIBILITY EXAMPLES =====

export const AccessibilityDemo: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
      <h3>Accessibility Features</h3>
      
      <div>
        <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Keyboard Navigation</h4>
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
          Try tabbing through these buttons and pressing Enter/Space
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm">First</Button>
          <Button size="sm">Second</Button>
          <Button size="sm">Third</Button>
        </div>
      </div>
      
      <div>
        <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Loading State</h4>
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
          Loading buttons are properly disabled and announce their state
        </p>
        <Button loading aria-label="Saving your preferences">
          Save Preferences
        </Button>
      </div>
      
      <div>
        <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Focus Indicators</h4>
        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px 0' }}>
          All buttons have visible focus indicators for accessibility
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary">Focus me</Button>
          <Button variant="outline">And me</Button>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility features including keyboard navigation, ARIA labels, and focus indicators.',
      },
    },
  },
};
