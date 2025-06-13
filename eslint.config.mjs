import { defineConfig, globalIgnores } from 'eslint/config';
import ts from 'eslint-config-cheminfo-typescript/base';

export default defineConfig(
  globalIgnores(['coverage', 'lib', 'examples']),
  ts,
  {
    rules: {
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
    },
  },
);
