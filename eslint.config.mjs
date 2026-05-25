import eslint from '@eslint/js';
import { configs as litConfigs } from 'eslint-plugin-lit';
import { configs as wcConfigs } from 'eslint-plugin-wc';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const tsFiles = ['src/**/*.ts', 'test/**/*.ts'];
const cardFiles = ['src/cards/**/*.ts', 'src/index.ts', 'src/html/**/*.ts'];

export default defineConfig(
  globalIgnores([
    'coverage/**',
    'dist/**',
    'node_modules/**',
    '.nyc_output/**',
    'eslint.config.mjs',
    'test/**/*.cjs',
    // Vendored Home Assistant frontend surface — keep aligned with upstream, not our lint bar.
    'src/hass/**',
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: tsFiles,
    rules: {
      // Prettier owns formatting; avoid fighting import sort plugins.
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // Lit/HA often pass methods as listeners; strict unbound-method is noisy here.
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-duplicate-imports': 'error',
      'no-throw-literal': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/delegates/**/*.ts', 'src/common/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@cards/*', '@/cards/*'],
              message:
                'Delegates and common must not import from cards (see CLAUDE.md architecture).',
            },
          ],
        },
      ],
    },
  },
  {
    files: cardFiles,
    ...wcConfigs['flat/best-practice'],
    ...litConfigs['flat/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      lit: {
        elementBaseClasses: ['LitElement'],
      },
    },
    rules: {
      // HA cards register elements in src/index.ts, not @customElement on the class.
      'wc/define-tag-after-class-definition': 'off',
      'wc/file-name-matches-element': 'off',
      'wc/guard-define-call': 'off',
      'wc/no-exports-with-element': 'off',
      'wc/tag-name-matches-class': 'off',
    },
  },
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.test.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha,
      },
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  {
    files: ['src/index.ts'],
    rules: {
      'no-console': 'off',
    },
  },
);
