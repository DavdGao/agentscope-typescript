import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';

export default [
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/*.js',
            '!eslint.config.js',
        ],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: [
                    './packages/*/tsconfig.json',
                    './apps/*/tsconfig.node.json',
                    './apps/*/tsconfig.web.json',
                ],
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            prettier: prettierPlugin,
            import: importPlugin,
            jsdoc: jsdocPlugin,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...prettierConfig.rules,
            'prettier/prettier': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'import/order': [
                'error',
                {
                    groups: [
                        'builtin', // Node.js built-in modules
                        'external', // npm modules
                        'internal', // Internal modules
                        'index', // Index file
                    ],
                    'newlines-between': 'always', // New line between groups
                    alphabetize: {
                        order: 'asc', // Order alphabetically
                        caseInsensitive: true, // Ignore case when ordering
                    },
                },
            ],
            'jsdoc/require-jsdoc': [
                'error',
                {
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                        ArrowFunctionExpression: false, // 箭头函数可选
                        FunctionExpression: false,
                    },
                },
            ],
            'jsdoc/require-description': 'warn',
            'jsdoc/require-param': 'warn',
            'jsdoc/require-returns': 'warn',
        },
    },
    {
        files: ['**/components/ui/**/*.{ts,tsx}'],
        rules: {
            'jsdoc/require-description': 'off',
            'jsdoc/require-returns': 'off',
        },
    },
];
