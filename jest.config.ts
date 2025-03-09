import type { Config } from '@jest/types';

const baseConfig: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: 'tsconfig.test.json',
            isolatedModules: true
        }]
    },
    moduleNameMapper: {
        '^@configs/(.*)$': '<rootDir>/src/configs/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@models/(.*)$': '<rootDir>/src/models/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@types/(.*)$': '<rootDir>/src/types/$1',
        '^src/(.*)$': '<rootDir>/src/$1'
    },
    setupFiles: ['<rootDir>/src/__tests__/setup/env.ts'],
    setupFilesAfterEnv: [
        '<rootDir>/src/__tests__/setup/setup.ts',
        '<rootDir>/src/__tests__/setup/redis.setup.ts'
    ],
    testPathIgnorePatterns: ['/node_modules/', '/build/']
};

const config: Config.InitialOptions = {
    projects: [
        {
            ...baseConfig,
            displayName: 'unit',
            testMatch: ['<rootDir>/src/__tests__/unit/**/*.test.ts'],
        },
        {
            ...baseConfig,
            displayName: 'integration',
            testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.ts'],
        },
        {
            ...baseConfig,
            displayName: 'e2e',
            testMatch: ['<rootDir>/src/__tests__/e2e/**/*.test.ts'],
        }
    ]
};

export default config; 