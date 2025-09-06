const path = require('path');

module.exports = {
  displayName: 'Unit Tests',
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/packages/**/src/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/apps/**/src/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/apps/**/components/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/apps/**/hooks/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/apps/**/lib/**/*.test.{js,jsx,ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/out/',
    '<rootDir>/storybook-static/',
    '<rootDir>/tests/integration/',
    '<rootDir>/tests/e2e/',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/unit.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    // Path aliases
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@lifeos/ui/(.*)$': '<rootDir>/packages/ui/$1',
    '^@lifeos/ui$': '<rootDir>/packages/ui/index.ts',
    '^@lifeos/shared/(.*)$': '<rootDir>/packages/shared/$1',
    '^@lifeos/shared$': '<rootDir>/packages/shared/index.ts',
    '^@lifeos/dashboard/(.*)$': '<rootDir>/packages/dashboard/$1',
    '^@lifeos/dashboard$': '<rootDir>/packages/dashboard/index.ts',
    '^@lifeos/analytics/(.*)$': '<rootDir>/packages/analytics/$1',
    '^@lifeos/analytics$': '<rootDir>/packages/analytics/index.ts',
    '^@lifeos/screens/(.*)$': '<rootDir>/packages/screens/$1',
    '^@lifeos/screens$': '<rootDir>/packages/screens/index.ts',
    '^@lifeos/core/(.*)$': '<rootDir>/packages/core/$1',
    '^@lifeos/core$': '<rootDir>/packages/core/index.ts',
    '^@lifeos/types$': '<rootDir>/packages/types/index.ts',
    
    // Static file mocks
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/mocks/fileMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@expo|expo|@supabase)/)',
  ],
  collectCoverageFrom: [
    'packages/**/*.{js,jsx,ts,tsx}',
    'apps/**/src/**/*.{js,jsx,ts,tsx}',
    'apps/**/components/**/*.{js,jsx,ts,tsx}',
    'apps/**/hooks/**/*.{js,jsx,ts,tsx}',
    'apps/**/lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/*.test.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
  ],
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage/unit',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './packages/core/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './packages/shared/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  verbose: true,
  errorOnDeprecated: true,
  clearMocks: true,
  restoreMocks: true,
};
