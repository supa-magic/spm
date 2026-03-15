import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { version } from './package.json'

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(version),
  },
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
      external: ['commander', 'yaml'],
    },
    ssr: true,
    emptyOutDir: true,
  },
})
