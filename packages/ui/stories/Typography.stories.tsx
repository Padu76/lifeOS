import type { Meta, StoryObj } from '@storybook/react';
import { Typography, Card } from '@lifeos/ui';

const meta = {
  title: 'UI Foundation/Typography',
  component: Typography,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Enhanced typography component with semantic variants, flexible sizing, and comprehensive styling options. Foundation element for all text display in LifeOS.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'small', 'strong', 'em'],
      description: 'HTML element to render',
    },
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2', 'subtitle1', 'subtitle2', 'caption', 'overline'],
      description: 'Typography variant for predefined styles',
      defaultValue: 'body1',
    },
    weight: {
      control: 'select',
      options: ['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      description: 'Font weight',
      defaultValue: 'normal',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error', 'white', 'inherit'],
      description: 'Text color variant',
      defaultValue: 'primary',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'],
      description: 'Font size variant (overrides variant size)',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Text alignment',
      defaultValue: 'left',
    },
    transform: {
      control: 'select',
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
      description: 'Text transform',
      defaultValue: 'none',
    },
    lineHeight: {
      control: 'select',
      options: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
      description: 'Line height',
      defaultValue: 'normal',
    },
    decoration: {
      control: 'select',
      options: ['none', 'underline', 'line-through'],
      description: 'Text decoration',
      defaultValue: 'none',
    },
    truncate: {
      control: 'boolean',
      description: 'Truncate text with ellipsis',
      defaultValue: false,
    },
    lineClamp: {
      control: 'number',
      description: 'Maximum number of lines before truncation',
      min: 1,
      max: 10,
    },
    children: {
      control: 'text',
      description: 'Text content to display',
      defaultValue: 'Typography text content',
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== BASIC STORIES =====

export const Default: Story = {
  args: {
    children: 'This is default typography text using body1 variant.',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>
      <Typography variant="subtitle1">Subtitle 1 - Larger subtitle text</Typography>
      <Typography variant="subtitle2">Subtitle 2 - Smaller subtitle text</Typography>
      <Typography variant="body1">Body 1 - Main body text for content</Typography>
      <Typography variant="body2">Body 2 - Smaller body text for secondary content</Typography>
      <Typography variant="caption">Caption - Small text for captions and metadata</Typography>
      <Typography variant="overline">Overline - Uppercase small text</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available typography variants showing the complete type scale.',
      },
    },
  },
};

// ===== HEADING STORIES =====

export const Headings: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Typography variant="h1">Page Title (H1)</Typography>
      <Typography variant="h2">Section Heading (H2)</Typography>
      <Typography variant="h3">Subsection Heading (H3)</Typography>
      <Typography variant="h4">Card Title (H4)</Typography>
      <Typography variant="h5">Small Heading (H5)</Typography>
      <Typography variant="h6">Smallest Heading (H6)</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Heading hierarchy from H1 to H6 for content structure.',
      },
    },
  },
};

export const HeadingWithCustomElement: Story = {
  args: {
    as: 'h2',
    variant: 'h4',
    children: 'Semantic H2 element styled as H4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Using custom HTML element while maintaining visual style - useful for SEO and accessibility.',
      },
    },
  },
};

// ===== BODY TEXT STORIES =====

export const BodyText: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Typography variant="body1" style={{ marginBottom: '16px' }}>
        Body 1 is the main text variant used for most content. It has comfortable reading size and line height 
        that works well for paragraphs, descriptions, and general content throughout the application.
      </Typography>
      <Typography variant="body2">
        Body 2 is smaller and used for secondary information, supporting text, or when you need to fit 
        more content in a constrained space while maintaining readability.
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Body text variants for different content hierarchies.',
      },
    },
  },
};

export const Subtitles: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Typography variant="h3">Section Title</Typography>
      <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
        Subtitle 1 - Introduction to this section
      </Typography>
      <Typography variant="subtitle2" style={{ marginBottom: '16px' }}>
        Subtitle 2 - Additional context or supporting information
      </Typography>
      <Typography variant="body1">
        Main content begins here with body text that provides the detailed information 
        following the established hierarchy.
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Subtitle variants for creating content hierarchy.',
      },
    },
  },
};

// ===== WEIGHT STORIES =====

export const FontWeights: Story = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <Typography weight="thin">Thin weight (100)</Typography>
      <Typography weight="light">Light weight (300)</Typography>
      <Typography weight="normal">Normal weight (400)</Typography>
      <Typography weight="medium">Medium weight (500)</Typography>
      <Typography weight="semibold">Semibold weight (600)</Typography>
      <Typography weight="bold">Bold weight (700)</Typography>
      <Typography weight="extrabold">Extrabold weight (800)</Typography>
      <Typography weight="black">Black weight (900)</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available font weights from thin to black.',
      },
    },
  },
};

export const WeightEmphasis: Story = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <Typography variant="body1">
        This is a paragraph with <Typography as="span" weight="medium">medium weight emphasis</Typography> and 
        <Typography as="span" weight="bold"> bold emphasis</Typography> for important information.
      </Typography>
      <Typography variant="body1">
        You can also use <Typography as="span" weight="semibold" color="accent">semibold accent text</Typography> for 
        links and <Typography as="span" weight="light" color="secondary">light secondary text</Typography> for less important details.
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using different font weights for emphasis within text.',
      },
    },
  },
};

// ===== COLOR STORIES =====

export const TextColors: Story = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <Typography color="primary">Primary text color for main content</Typography>
      <Typography color="secondary">Secondary text color for supporting content</Typography>
      <Typography color="muted">Muted text color for less important information</Typography>
      <Typography color="accent">Accent text color for links and highlights</Typography>
      <Typography color="success">Success text color for positive messages</Typography>
      <Typography color="warning">Warning text color for caution messages</Typography>
      <Typography color="error">Error text color for error messages</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available text colors for different semantic meanings.',
      },
    },
  },
};

export const ColorInContext: Story = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <Typography variant="h4" style={{ marginBottom: '16px' }}>Status Messages</Typography>
      
      <div style={{ marginBottom: '12px' }}>
        <Typography color="success" weight="medium">✓ Profile updated successfully</Typography>
        <Typography variant="body2" color="secondary">Your changes have been saved automatically.</Typography>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <Typography color="warning" weight="medium">⚠ Storage almost full</Typography>
        <Typography variant="body2" color="secondary">You have 2GB remaining. Consider upgrading your plan.</Typography>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <Typography color="error" weight="medium">✕ Connection failed</Typography>
        <Typography variant="body2" color="secondary">Please check your internet connection and try again.</Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text colors used in context for status messages and feedback.',
      },
    },
  },
};

// ===== SIZE STORIES =====

export const CustomSizes: Story = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <Typography size="xs">Extra small text (xs)</Typography>
      <Typography size="sm">Small text (sm)</Typography>
      <Typography size="base">Base text (base)</Typography>
      <Typography size="lg">Large text (lg)</Typography>
      <Typography size="xl">Extra large text (xl)</Typography>
      <Typography size="2xl">2X large text (2xl)</Typography>
      <Typography size="3xl">3X large text (3xl)</Typography>
      <Typography size="4xl">4X large text (4xl)</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Custom font sizes that override variant defaults.',
      },
    },
  },
};

// ===== UTILITY STORIES =====

export const TextAlignment: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Typography align="left" style={{ marginBottom: '8px', border: '1px solid #eee', padding: '8px' }}>
        Left aligned text (default)
      </Typography>
      <Typography align="center" style={{ marginBottom: '8px', border: '1px solid #eee', padding: '8px' }}>
        Center aligned text
      </Typography>
      <Typography align="right" style={{ marginBottom: '8px', border: '1px solid #eee', padding: '8px' }}>
        Right aligned text
      </Typography>
      <Typography align="justify" style={{ border: '1px solid #eee', padding: '8px' }}>
        Justified text that spreads content evenly across the full width of the container for even spacing.
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text alignment options for different layout needs.',
      },
    },
  },
};

export const TextTransform: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Typography transform="none">No transformation applied</Typography>
      <Typography transform="uppercase">uppercase transformation</Typography>
      <Typography transform="lowercase">LOWERCASE TRANSFORMATION</Typography>
      <Typography transform="capitalize">capitalize each word transformation</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text transformation options for different styling needs.',
      },
    },
  },
};

export const LineHeight: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="caption" color="secondary">Tight line height:</Typography>
        <Typography lineHeight="tight" style={{ border: '1px solid #eee', padding: '8px' }}>
          This text has tight line height which brings lines closer together for a more compact appearance.
        </Typography>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="caption" color="secondary">Normal line height:</Typography>
        <Typography lineHeight="normal" style={{ border: '1px solid #eee', padding: '8px' }}>
          This text has normal line height which provides balanced spacing for comfortable reading.
        </Typography>
      </div>
      
      <div>
        <Typography variant="caption" color="secondary">Relaxed line height:</Typography>
        <Typography lineHeight="relaxed" style={{ border: '1px solid #eee', padding: '8px' }}>
          This text has relaxed line height which gives more breathing room between lines for easier reading.
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Line height options for different reading experiences.',
      },
    },
  },
};

export const TextDecoration: Story = {
  render: () => (
    <div style={{ maxWidth: '400px' }}>
      <Typography decoration="none">No text decoration</Typography>
      <Typography decoration="underline" color="accent">Underlined text (often used for links)</Typography>
      <Typography decoration="line-through" color="muted">Strikethrough text</Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text decoration options for different purposes.',
      },
    },
  },
};

// ===== TRUNCATION STORIES =====

export const TextTruncation: Story = {
  render: () => (
    <div style={{ maxWidth: '300px' }}>
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="caption" color="secondary">Normal text (wraps):</Typography>
        <Typography style={{ border: '1px solid #eee', padding: '8px' }}>
          This is a long line of text that will wrap to multiple lines when it exceeds the container width.
        </Typography>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="caption" color="secondary">Truncated text:</Typography>
        <Typography truncate style={{ border: '1px solid #eee', padding: '8px' }}>
          This is a long line of text that will be truncated with ellipsis when it exceeds the container width.
        </Typography>
      </div>
      
      <div>
        <Typography variant="caption" color="secondary">Line clamped (2 lines):</Typography>
        <Typography lineClamp={2} style={{ border: '1px solid #eee', padding: '8px' }}>
          This is a longer paragraph of text that will be clamped to exactly two lines with an ellipsis at the end when it exceeds the specified number of lines, which is useful for maintaining consistent layouts.
        </Typography>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text truncation options for handling overflow in constrained layouts.',
      },
    },
  },
};

// ===== LIFEOS USAGE EXAMPLES =====

export const LifeOSTypographyScale: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <Typography variant="h1" style={{ marginBottom: '8px' }}>
        Your LifeOS Dashboard
      </Typography>
      <Typography variant="subtitle1" color="secondary" style={{ marginBottom: '24px' }}>
        Welcome back! Here's how you're doing today.
      </Typography>
      
      <Typography variant="h3" style={{ marginBottom: '12px' }}>
        Today's Insights
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '16px' }}>
        Your stress levels have improved by 15% compared to last week. The mindfulness exercises 
        you've been practicing are showing positive results.
      </Typography>
      
      <Typography variant="h4" style={{ marginBottom: '8px' }}>
        Recommended Actions
      </Typography>
      <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
        Based on your recent patterns, here are some suggestions:
      </Typography>
      
      <Typography variant="caption" color="muted">
        Last updated 5 minutes ago • Data from 7 days
      </Typography>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS dashboard content hierarchy using typography scale.',
      },
    },
  },
};

export const LifeOSMetricLabels: Story = {
  render: () => (
    <Card variant="elevated" padding="lg" style={{ maxWidth: '280px' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Typography variant="overline" color="secondary" style={{ marginBottom: '4px' }}>
          Life Score
        </Typography>
        <Typography size="4xl" weight="bold" color="accent">
          8.2
        </Typography>
        <Typography variant="body2" color="success" style={{ marginBottom: '8px' }}>
          ↑ +0.5 from yesterday
        </Typography>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary">7.8</Typography>
          <Typography variant="caption" color="secondary">Energy</Typography>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h4" color="warning">4.2</Typography>
          <Typography variant="caption" color="secondary">Stress</Typography>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Typography variant="h4" color="success">8.5</Typography>
          <Typography variant="caption" color="secondary">Sleep</Typography>
        </div>
      </div>
      
      <Typography variant="caption" color="muted" align="center">
        Based on today's check-ins and activities
      </Typography>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS metric card with various typography variants.',
      },
    },
  },
};

export const LifeOSAdviceText: Story = {
  render: () => (
    <Card variant="outlined" padding="lg" style={{ maxWidth: '320px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>🧘</span>
        <Typography variant="subtitle1" weight="medium">
          Mindful Moment
        </Typography>
      </div>
      
      <Typography variant="body1" style={{ marginBottom: '8px' }}>
        Your stress levels are elevated. Take a moment for three deep breaths.
      </Typography>
      
      <Typography variant="body2" color="secondary" style={{ marginBottom: '12px' }}>
        Studies show this simple practice can reduce cortisol by up to 23% within minutes.
      </Typography>
      
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
        <Typography variant="caption" color="muted">
          2 min • 89% effective
        </Typography>
        <div style={{ marginLeft: 'auto' }}>
          <Typography variant="caption" color="accent" decoration="underline" style={{ cursor: 'pointer' }}>
            Learn more
          </Typography>
        </div>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Real-world example: LifeOS advice card with hierarchical typography.',
      },
    },
  },
};

// ===== INTERACTIVE PLAYGROUND =====

export const InteractivePlayground: Story = {
  args: {
    children: 'Customize this typography using the controls panel!',
    variant: 'body1',
    weight: 'normal',
    color: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground - use controls panel to customize all typography properties.',
      },
    },
  },
};

// ===== ACCESSIBILITY EXAMPLES =====

export const AccessibilityDemo: Story = {
  render: () => (
    <div style={{ maxWidth: '500px' }}>
      <Typography variant="h3" style={{ marginBottom: '16px' }}>
        Accessibility Best Practices
      </Typography>
      
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
          Proper Heading Hierarchy
        </Typography>
        <Typography variant="body2" color="secondary">
          Use semantic HTML elements (h1, h2, h3) with visual styling for screen readers.
        </Typography>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
          Color Contrast
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
          All text colors meet WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text).
        </Typography>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div>
            <Typography variant="caption" color="secondary">Good contrast:</Typography>
            <Typography color="primary">Primary text</Typography>
          </div>
          <div>
            <Typography variant="caption" color="secondary">Accessible accent:</Typography>
            <Typography color="accent">Accent text</Typography>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
          Line Height for Readability
        </Typography>
        <Typography variant="body2" color="secondary" lineHeight="relaxed">
          This text uses relaxed line height (1.625) which improves readability for users with 
          dyslexia and other reading difficulties. The extra spacing makes it easier to track 
          lines and reduces visual stress.
        </Typography>
      </div>
      
      <div>
        <Typography variant="subtitle1" style={{ marginBottom: '8px' }}>
          Semantic Markup Examples
        </Typography>
        <Typography variant="body2" color="secondary" style={{ marginBottom: '8px' }}>
          Use appropriate HTML elements for semantic meaning:
        </Typography>
        <div style={{ backgroundColor: '#f8f9fa', padding: '12px', borderRadius: '6px' }}>
          <Typography as="strong" variant="body2">Strong importance (strong element)</Typography><br />
          <Typography as="em" variant="body2">Emphasized text (em element)</Typography><br />
          <Typography as="small" variant="caption" color="secondary">Fine print (small element)</Typography>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of accessibility best practices including proper semantics, contrast, and readability.',
      },
    },
  },
};
