/* eslint-env node */
const i18next = require('eslint-plugin-i18next');
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  i18next.configs['flat/recommended'],
]);
