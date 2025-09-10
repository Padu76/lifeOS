module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // Disable problematic rules for development
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prefer-const': 'warn',
    'no-console': 'warn',
    'no-unused-vars': 'off', // Use TypeScript version instead
    'no-undef': 'off', // TypeScript handles this
    
    // Allow common patterns
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  env: {
    browser: true,
    node: true,
    es2020: true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    // Only ignore specific directories/files
    'node_modules/',
    '.next/',
    'out/',
    'dist/',
    'build/',
    'coverage/',
    'storybook-static/',
    '*.min.js',
    '*.bundle.js',
    
    // Config files that don't need linting
    'next.config.js',
    'jest.config.js',
    'jest.setup.js',
    'jest.unit.config.js',
    'jest.integration.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    
    // Generated files
    '*.d.ts',
    'database.types.ts',
  ],
  overrides: [
    // Specific rules for test files
    {
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
    // Specific rules for config files
    {
      files: ['*.config.{js,ts}', '.eslintrc.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-undef': 'off',
      },
    },
    // Specific rules for API routes
    {
      files: ['apps/web/app/api/**/*.{js,ts}', '**/api/**/*.{js,ts}'],
      rules: {
        'no-console': 'off', // Allow console in API routes for logging
      },
    },
  ],
};
