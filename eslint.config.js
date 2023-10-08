const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  rules: {
    'curly': ['error', 'all'],
    'no-console': 'off',
    'node/prefer-global/buffer': 'off',
    'node/prefer-global/process': 'off',
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  },
  ignores: [
    'out',
    'dist',
  ],
})
