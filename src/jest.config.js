module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.js'],
  modulePathIgnorePatterns: ['ui'],
  clearMocks: true,
};
