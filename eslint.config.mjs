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
  }
);
