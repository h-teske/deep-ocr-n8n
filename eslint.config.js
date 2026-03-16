const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const { FlatCompat } = require('@eslint/eslintrc');
const eslintConfigPrettier = require('eslint-config-prettier');
const path = require('path');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  // Apply @typescript-eslint flat configs
  ...tsPlugin.configs['flat/recommended'],
  ...tsPlugin.configs['flat/recommended-type-checked'],
  // Apply n8n-nodes-base via FlatCompat (legacy plugin without flat config support)
  ...compat.extends('plugin:n8n-nodes-base/nodes', 'plugin:n8n-nodes-base/credentials'),
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      // n8n specific rules
      'n8n-nodes-base/node-class-description-credentials-name-unsuffixed': 'error',
      'n8n-nodes-base/node-class-description-display-name-unsuffixed-trigger-node': 'off',
      'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
      // General code quality
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  eslintConfigPrettier,
];
