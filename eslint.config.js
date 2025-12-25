import tseslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierPlugin from 'eslint-plugin-prettier';
import jasmine from 'eslint-plugin-jasmine';
import html from 'eslint-plugin-html';
import css from 'eslint-plugin-css';

export default [
  {
    ignores: [
      'www/**',
      '.angular/**',
      'dist/**',
      'node_modules/**',
      'android/**',
      'ios/**',
      'coverage/**',
      'firebase.json',
    ],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      perfectionist,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked.rules,
      'perfectionist/sort-interfaces': ['error', { type: 'alphabetical', order: 'asc', ignoreCase: true }],
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          groups: [['builtin'], ['external'], ['internal'], ['parent', 'sibling'], ['index']],
          newlinesBetween: 'always',
        },
      ],
      'prettier/prettier': 'warn',
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { jasmine, prettier: prettierPlugin },
    rules: {
      ...jasmine.configs.recommended.rules,
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['src/**/*.html'],
    plugins: { html, prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
    },
  },
];
