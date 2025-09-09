// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'

const config: StorybookConfig = {
  stories: [
    '../apps/web/components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../apps/web/app/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../packages/**/*.stories.@(js|jsx|ts|tsx|mdx)',
    '../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'
  ],
  
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-styling',
      options: {
        implementation: require('tailwindcss'),
      },
    },
  ],
  
  framework: {
    name: '@storybook/nextjs',
    options: {
      nextConfigPath: path.resolve(__dirname, '../apps/web/next.config.js'),
    },
  },
  
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  
  features: {
    buildStoriesJson: true,
    storyStoreV7: true,
  },
  
  core: {
    disableTelemetry: true,
  },
  
  webpackFinal: async (config) => {
    // Alias support for LifeOS packages
    config.resolve!.alias = {
      ...config.resolve!.alias,
      '@lifeos/packages': path.resolve(__dirname, '../packages'),
      '@lifeos/types': path.resolve(__dirname, '../packages/types'),
    }
    
    // Handle CSS
    const cssRule = config.module!.rules!.find(
      (rule) => rule && typeof rule === 'object' && rule.test && rule.test.toString().includes('css')
    )
    
    if (cssRule && typeof cssRule === 'object') {
      cssRule.exclude = /\.module\.css$/
    }
    
    return config
  },
  
  env: (config) => ({
    ...config,
    // Mock Supabase for Storybook
    NEXT_PUBLIC_SUPABASE_URL: 'https://storybook.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'storybook-key',
  }),
  
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
}

export default config