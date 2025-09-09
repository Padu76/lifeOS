// apps/web/components/MicroAdviceWidget.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import MicroAdviceWidget from './MicroAdviceWidget'

const meta: Meta<typeof MicroAdviceWidget> = {
  title: 'Components/MicroAdviceWidget',
  component: MicroAdviceWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AI-powered micro advice widget that provides personalized wellness suggestions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    maxAdvices: {
      control: { type: 'number', min: 1, max: 5 },
      description: 'Maximum number of advice cards to show',
    },
    autoRefresh: {
      control: 'boolean',
      description: 'Automatically refresh advice periodically',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    maxAdvices: 2,
    autoRefresh: false,
  },
}

export const SingleAdvice: Story = {
  args: {
    maxAdvices: 1,
    autoRefresh: false,
  },
}

export const MultipleAdvices: Story = {
  args: {
    maxAdvices: 3,
    autoRefresh: false,
  },
}

export const WithAutoRefresh: Story = {
  args: {
    maxAdvices: 2,
    autoRefresh: true,
  },
}

export const CustomStyling: Story = {
  args: {
    className: 'bg-blue-500/20 border-blue-400/30',
    maxAdvices: 2,
    autoRefresh: false,
  },
}

// apps/web/components/ui/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'

// Button component for stories
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick 
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}) => {
  const baseClasses = 'font-semibold transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-2 border-white/30 text-white hover:bg-white/10 focus:ring-white',
    ghost: 'text-white hover:bg-white/10 focus:ring-white',
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile button component with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
  args: {
    onClick: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

// apps/web/components/ui/Card.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Brain, Heart, Zap } from 'lucide-react'

// Card component for stories
const Card = ({ 
  title, 
  description, 
  icon, 
  gradient = 'from-blue-500 to-purple-600',
  className = '' 
}: {
  title: string
  description: string
  icon?: React.ReactNode
  gradient?: string
  className?: string
}) => {
  return (
    <div className={`group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-700 hover:scale-105 ${className}`}>
      {icon && (
        <div className={`flex items-center justify-center w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl group-hover:rotate-12 transition-transform duration-300 mb-4`}>
          {icon}
        </div>
      )}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  )
}

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Glassmorphism card component with hover effects and customizable gradients.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    gradient: {
      control: { type: 'select' },
      options: [
        'from-blue-500 to-purple-600',
        'from-green-500 to-blue-600',
        'from-orange-500 to-red-600',
        'from-indigo-500 to-purple-600',
      ],
    },
    className: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Wellness Card',
    description: 'This is a sample wellness card with glassmorphism design.',
    icon: <Brain className="w-6 h-6 text-white" />,
  },
}

export const WithoutIcon: Story = {
  args: {
    title: 'Simple Card',
    description: 'A card without an icon, just text content.',
  },
}

export const HeartCard: Story = {
  args: {
    title: 'Heart Health',
    description: 'Monitor your cardiovascular wellness with daily insights.',
    icon: <Heart className="w-6 h-6 text-white" />,
    gradient: 'from-green-500 to-blue-600',
  },
}

export const EnergyCard: Story = {
  args: {
    title: 'Energy Boost',
    description: 'Quick exercises to boost your energy levels throughout the day.',
    icon: <Zap className="w-6 h-6 text-white" />,
    gradient: 'from-orange-500 to-red-600',
  },
}

// stories/Design-System.stories.mdx
export const DesignSystemStory = `
# LifeOS Design System

This is the comprehensive design system for LifeOS, showcasing all UI components, patterns, and guidelines.

## Colors

### Primary Gradients
- **Blue to Purple**: \`from-blue-500 to-purple-600\`
- **Green to Blue**: \`from-green-500 to-blue-600\`
- **Orange to Red**: \`from-orange-500 to-red-600\`
- **Indigo to Purple**: \`from-indigo-500 to-purple-600\`

### Background
- **Main Gradient**: \`from-slate-900 via-purple-900 to-slate-900\`

## Typography

### Headings
- **H1**: \`text-4xl sm:text-5xl lg:text-6xl font-bold\`
- **H2**: \`text-2xl sm:text-3xl font-bold\`
- **H3**: \`text-xl font-bold\`

### Body Text
- **Large**: \`text-lg text-white/70\`
- **Regular**: \`text-base text-white/70\`
- **Small**: \`text-sm text-white/60\`

## Spacing

### Padding
- **Small**: \`p-4\`
- **Medium**: \`p-6\`
- **Large**: \`p-8\`

### Margins
- **Small**: \`mb-4\`
- **Medium**: \`mb-6\`
- **Large**: \`mb-8\`

## Components

All components follow the glassmorphism design pattern with:
- Semi-transparent backgrounds (\`bg-white/10\`)
- Backdrop blur effects (\`backdrop-blur-lg\`)
- Subtle borders (\`border border-white/20\`)
- Smooth hover transitions
`