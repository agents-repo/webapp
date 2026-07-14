import js from '@eslint/js'
import globals from 'globals'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import security from 'eslint-plugin-security'
import sonarjs from 'eslint-plugin-sonarjs'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  {
    files: ['playwright.config.ts', 'e2e/**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      sonarjs.configs.recommended,
    ],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
    },
    rules: {
      complexity: ['warn', 12],
      'max-depth': ['warn', 4],
      'no-empty-pattern': 'off',
      'sonarjs/cognitive-complexity': ['warn', 12],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended, sonarjs.configs.recommended],
    plugins: {
      security,
    },
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      complexity: ['warn', 12],
      'max-depth': ['warn', 4],
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 12],
    },
  },
  // Tests use dynamic paths from temp dirs; scripts keep the rule unless explicitly
  // disabled with a documented reason (user-derived paths need validation, not silence).
  {
    files: ['test/**/*.{js,mjs,cjs}'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['e2e/**', 'playwright.config.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      sonarjs.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    plugins: {
      security,
    },
    settings: {
      'jsx-a11y': {
        components: {
          NavLink: 'a',
        },
      },
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      complexity: ['warn', 12],
      'max-depth': ['warn', 4],
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['NavLink', 'Link'],
          specialLink: ['to'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'warn',
      'sonarjs/cognitive-complexity': ['warn', 12],
    },
  },
])
