const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  rules: {
    'no-console': 'warn',
    'node/prefer-global/buffer': 'off',
    'node/prefer-global/process': 'off',
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  },
  ignores: [
    'out',
    'dist',
  ],
})
