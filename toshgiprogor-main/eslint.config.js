import js from '@eslint/js'

export default [
  js.configs.recommended,
  {
    files: ['assets/js/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        $: 'readonly',
        jQuery: 'readonly',
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
        ScrollSmoother: 'readonly',
        SplitText: 'readonly',
        WOW: 'readonly',
        PureCounter: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'assets/js/*.min.js'],
  },
]
