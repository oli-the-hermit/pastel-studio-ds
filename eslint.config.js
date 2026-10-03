// ESLint flat config for the whole monorepo.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'documentation/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': 'error'
    }
  },
  {
    files: ['packages/*/src/**/*.{ts,tsx}', 'apps/*/src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error'
    }
  },
  {
    // Library components stay app-agnostic: text arrives through props (a labels prop with
    // defaults), data through the caller. Nothing in packages/ may import from an app.
    files: ['packages/*/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/apps/**'], message: 'Packages must not import from an app.' }
        ]
      }]
    }
  },
  {
    files: ['scripts/**/*.{js,ts}', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node }
  }
);
