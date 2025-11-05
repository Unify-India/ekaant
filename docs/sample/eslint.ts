import tseslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-config-prettier';

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
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      perfectionist,
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
    },
  },
  prettier,
];
