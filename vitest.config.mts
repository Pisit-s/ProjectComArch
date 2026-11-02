import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    testTimeout: 120_000,
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/fp/**/*.ts',
        'src/lib/int/**/*.ts',
        'src/lib/sci/**/*.ts',
        'src/lib/lesson/**/*.ts',
      ],
      thresholds: {
        'src/lib/**/*.ts': { statements: 95, lines: 95, functions: 95, branches: 90 },
      },
    },
  },
});
