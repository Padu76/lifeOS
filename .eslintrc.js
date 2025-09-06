module.exports = {
  root: true,
  extends: [
    '@typescript-eslint/recommended',
    'next/core-web-vitals',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.js', '.next/', 'out/']
};
