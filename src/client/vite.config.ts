import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectDir = dirname(fileURLToPath(import.meta.url));
const physicsPkgDir = resolve(projectDir, '../physics-core/pkg');

export default defineConfig({
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        target: 'esnext',
    },
    server: {
        port: 3000,
        fs: {
            allow: [projectDir, physicsPkgDir],
        },
    },
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
        exclude: ['../physics-core/pkg/physics_core.js'],
    },
});
