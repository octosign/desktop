module.exports = {
  projects: ['<rootDir>/src/', '<rootDir>/src/ui'],
  collectCoverageFrom: [
    './**/*.{js,ts,tsx}',
    '!**/node_modules/**',
    '!jest.config.js',
    '!**/*.d.ts',
    '!mockWindowAPI.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
