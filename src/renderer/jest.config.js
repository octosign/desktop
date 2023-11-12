module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^.*\\.svg$': '<rootDir>../../__mocks__/statics.ts',
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-vitest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-vitest`
    '^.+\\.tsx?$': [
      'ts-vitest',
      {
        tsconfig: './tsconfig.web.json',
      },
    ],
  },
  setupFiles: ['./vitest.setup.js'],
  clearMocks: true,
};
