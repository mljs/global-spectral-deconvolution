import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**'],
      exclude: ['**/__tests__/data/**', '**/.npmignore'],
    },
    setupFiles: ['vitest.setup.ts'],
  },
});
