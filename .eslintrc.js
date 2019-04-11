module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/airbnb',
    '@vue/typescript'
  ],
  rules: {
    'new-cap': 'off',
    'eslint-import-resolver-typescript': {
      'extensions': ['.ts', '.tsx', '.d.ts']
    },
    'space-infix-ops': 'off',
    'no-restricted-syntax': 0,
    'no-restricted-globals': 'off',
    'global-require': 'off',
    'import/no-dynamic-require': 'off',
    'no-param-reassign': 'off',
    'class-methods-use-this': 'off',
    'linebreak-style': 'off',
    'import/no-unresolved': [
      2,
      {
        caseSensitive: false
      }
    ],
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/attribute-hyphenation': [
      'error',
      'always'
    ],
    'vue/html-end-tags': 'error',
    'vue/html-indent': [
      'error',
      2
    ],
    'vue/html-self-closing': 'error',
    'vue/require-default-prop': 'error',
    'vue/require-prop-types': 'error',
    'vue/attributes-order': 'error',
    'vue/order-in-components': 'error',
    "prettier.singleQuote": true,
    "prefer-destructuring": 0,
    "no-unused-expressions": 0,
  }
}