import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'esnext'
  },
  server: {
    port: 5173,
    open: true
  },
  resolve: {
    alias: {
      '@nbody/shared': resolve(__dirname, '../packages/shared/src/index.ts')
    }
  }
});
