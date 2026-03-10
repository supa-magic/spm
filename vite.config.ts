import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'node20',
    outDir: 'dist',
    lib: {
      entry: { 'bin/spm': resolve(__dirname, 'src/bin/spm.ts') },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['commander'],
    },
    ssr: true,
    emptyOutDir: true,
  },
})
