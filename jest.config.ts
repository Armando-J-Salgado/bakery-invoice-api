import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/../test/setup.ts'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^test/(.*)$': '<rootDir>/../test/$1',
  },
  testTimeout: 30000,
  maxWorkers: 1,
};

export default config;
