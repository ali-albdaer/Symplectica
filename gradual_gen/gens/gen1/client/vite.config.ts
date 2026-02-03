import { defineConfig } from 'vite';

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
      '@nbody/shared': '../packages/shared/src'
    }
  }
});
