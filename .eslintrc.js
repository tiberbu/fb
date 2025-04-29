module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'vue/no-unused-components': 'warn',
        'vue/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'warn',
        'no-debugger': 'warn',
    },
};