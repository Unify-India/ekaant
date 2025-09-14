import parser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import perfectionist from 'eslint-plugin-perfectionist';
import jasmine from 'eslint-plugin-jasmine';
import prettier from 'eslint-config-prettier';
import jsonc from 'eslint-plugin-jsonc';
import html from 'eslint-plugin-html';
import css from 'eslint-plugin-css';

export default [
  // TypeScript (application code)
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      perfectionist,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettier.rules,

      // Angular-style interface and import sorting
      'perfectionist/sort-interfaces': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          groups: [['angular'], ['rxjs'], ['external'], ['internal'], ['parent', 'sibling'], ['index']],
          customGroups: {
            value: {
              angular: ['^@angular'],
              rxjs: ['^rxjs'],
            },
          },
          newlinesBetween: 'always',
        },
      ],
    },
  },

  // Jasmine for test specs
  {
    files: ['src/**/*.spec.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: { jasmine },
    rules: {
      ...jasmine.configs.recommended.rules,
    },
  },

  // JSON configs
  {
    files: ['*.json', 'src/**/*.json'],
    languageOptions: {
      parser: jsonc.parsers.json,
    },
    plugins: { jsonc },
    rules: {
      'jsonc/sort-keys': ['error', { order: { type: 'asc' }, pathPattern: '^$' }],
    },
  },

  // HTML templates
  {
    files: ['src/**/*.html'],
    plugins: { html },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // CSS and SCSS styles
  {
    files: ['src/**/*.{css,scss}'],
    plugins: { css },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
