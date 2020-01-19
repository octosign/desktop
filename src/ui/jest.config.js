module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.*\\.svg$': '<rootDir>../../__mocks__/statics.ts',
  },
  setupFiles: ['./jest.setup.js'],
  clearMocks: true,
};
