// @ts-check
/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      'tsconfig.json',
      'packages/*/tsconfig.json',
      'examples/*/tsconfig.json'
    ],
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    'no-unused-vars': 'off',
    'no-extra-boolean-cast': 'off',
    'simple-import-sort/imports': 'warn',
    'simple-import-sort/exports': 'warn'
  }
};
