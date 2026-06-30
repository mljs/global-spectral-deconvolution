import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/**'],
      exclude: ['**/__tests__/data/**', '**/.npmignore'],
      provider: 'v8',
    },
    setupFiles: ['vitest.setup.ts'],
    snapshotFormat: {
      maxOutputLength: Number.MAX_SAFE_INTEGER,
    },
  },
});
