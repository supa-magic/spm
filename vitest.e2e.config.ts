import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    include: ['tests/e2e/**/*.e2e.test.ts'],
    testTimeout: 120_000,
    sequence: { concurrent: false },
  },
})
