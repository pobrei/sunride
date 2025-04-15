const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@frontend/(.*)$': '<rootDir>/frontend/$1',
    '^@backend/(.*)$': '<rootDir>/backend/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/out/',
    '/coverage/',
    '/public/',
    '/scripts/',
  ],
  transform: {
    // Use babel-jest to transpile tests with the next/babel preset
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: ['/node_modules/', '^.+\\.module\\.(css|sass|scss)$'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    'frontend/**/*.{js,jsx,ts,tsx}',
    'backend/**/*.{js,jsx,ts,tsx}',
    'shared/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/_*.{js,jsx,ts,tsx}',
    '!**/index.{js,jsx,ts,tsx}',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/pages/_app.tsx',
    '!**/pages/_document.tsx',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
