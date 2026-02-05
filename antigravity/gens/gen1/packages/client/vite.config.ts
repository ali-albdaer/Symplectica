import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        target: 'esnext',
    },
    server: {
        port: 3000,
    },
    optimizeDeps: {
        exclude: ['physics-core'],
    },
});
