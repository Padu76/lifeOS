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
    'eslint:recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prefer-const': 'off',
    'no-var': 'off',
    'no-console': 'off',
    'no-unused-vars': 'off',
    'no-undef': 'off'
  },
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  ignorePatterns: [
    '**/*',
  ],
};
