import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['tests/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' }
  },
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        self: 'readonly', caches: 'readonly', fetch: 'readonly', location: 'readonly', URL: 'readonly'
      }
    }
  },
  {
    files: ['public/boot-fallback.js'],
    languageOptions: { globals: { document: 'readonly', setTimeout: 'readonly' } }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly', fetch: 'readonly', setTimeout: 'readonly', document: 'readonly', navigator: 'readonly', MessageEvent: 'readonly'
      }
    }
  }
);
