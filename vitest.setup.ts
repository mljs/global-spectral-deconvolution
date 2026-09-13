import { toBeDeepCloseTo, toMatchCloseTo } from 'jest-matcher-deep-close-to';
import { expect } from 'vitest';

type CloseToIterable = Parameters<typeof toBeDeepCloseTo>[0];

declare module 'vitest' {
  interface Matchers<R extends void | Promise<void> = void | Promise<void>> {
    toBeDeepCloseTo: (expected: CloseToIterable, decimals?: number) => R;
    toMatchCloseTo: (expected: CloseToIterable, decimals?: number) => R;
  }
}

expect.extend({ toMatchCloseTo, toBeDeepCloseTo });
