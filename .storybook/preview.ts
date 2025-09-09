// .storybook/preview.ts
import type { Preview } from '@storybook/react'
import '../apps/web/app/globals.css'
import '../apps/web/styles/performance.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'lifeos-dark',
      values: [
        {
          name: 'lifeos-dark',
          value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)',
        },
        {
          name: 'lifeos-light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'light',
          value: '#f5f5f5',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
    docs: {
      theme: {
        base: 'dark',
        brandTitle: 'LifeOS Components',
        brandImage: null,
        brandTarget: '_self',
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'LifeOS Theme',
      defaultValue: 'dark',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    responsive: {
      description: 'Responsive Design Mode',
      defaultValue: 'desktop',
      toolbar: {
        title: 'Device',
        icon: 'mobile',
        items: [
          { value: 'mobile', title: 'Mobile' },
          { value: 'tablet', title: 'Tablet' },
          { value: 'desktop', title: 'Desktop' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'dark'
      
      return (
        <div 
          className={`min-h-screen p-4 transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white' 
              : 'bg-white text-gray-900'
          }`}
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)'
              : '#ffffff'
          }}
        >
          <Story />
        </div>
      )
    },
  ],
}

export default preview