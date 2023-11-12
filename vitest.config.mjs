import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    threads: false,
    clearMocks: true,
    coverage: {
      enabled: true,
      provider: 'istanbul',
      include: [
        './**/*.{js,ts,tsx}',
        '!**/node_modules/**',
        '!vitest.config.js',
        '!**/*.d.ts',
        '!mockWindowAPI.ts',
      ],
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    typecheck: {
      tsconfig: './tsconfig.json',
    }
  },
});
