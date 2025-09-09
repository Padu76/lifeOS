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