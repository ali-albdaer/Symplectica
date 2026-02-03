import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 3001,
        proxy: {
            '/ws': {
                target: 'ws://localhost:3000',
                ws: true,
            },
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    optimizeDeps: {
        exclude: ['@space-sim/physics'],
    },
});
