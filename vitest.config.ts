// Unit tests for the whole repository: npm test
import { defineConfig } from 'vitest/config';
import { componentsPlugin } from './apps/docs/components-plugin.ts';
import { tokensPlugin } from './apps/docs/tokens-plugin.ts';

export default defineConfig({
  // The docs read the tokens and the components as data, so their tests need the same plugins.
  plugins: [tokensPlugin(), componentsPlugin()],
  test: {
    environment: 'jsdom',
    include: ['packages/**/*.test.{ts,tsx}', 'apps/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
    // The docs find components and demos by folder (import.meta.glob, the plugins). Vitest's
    // cache of transformed modules doesn't see a new folder, so it would hide it from the tests.
    fsModuleCache: false,
  },
});
