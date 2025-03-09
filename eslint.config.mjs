import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node
            }
        }
    },
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: '.',
                ecmaVersion: 'latest',
                sourceType: 'module'
            },
            globals: {
                ...globals.node,
                process: 'readonly',
                __dirname: 'readonly',
                global: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            'no-console': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['warn'],
            'semi': ['error', 'always'],
            'quotes': ['error', 'single']
        }
    },
    {
        files: ['**/*.test.ts', '**/setup/*.ts', 'jest.config.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: '.',
                ecmaVersion: 'latest',
                sourceType: 'module'
            },
            globals: {
                ...globals.jest,
                ...globals.node
            }
        },
        rules: {
            'no-console': 'off'
        }
    },
    {
        ignores: ['build/**/*', 'coverage/**/*', 'node_modules/**/*']
    }
]; 