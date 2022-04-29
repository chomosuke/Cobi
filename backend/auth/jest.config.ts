import { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testRegex: './tests/.*test\\.ts$',
    coveragePathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/prisma/',
    ],
};

// eslint-disable-next-line import/no-default-export
export default config;
