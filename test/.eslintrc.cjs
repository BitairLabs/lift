module.exports = {
    env: {
        es2024: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: true,
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: '.',
    },
    plugins: ['@typescript-eslint'],
}