import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'apps/api/src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['apps/api/src/**/*.ts'],
      exclude: ['**/*.d.ts', '**/*.test.ts', '**/types/**'],
    },
  },
});
