import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectDir = dirname(fileURLToPath(import.meta.url));
const physicsPkgDir = resolve(projectDir, '../physics-core/pkg');
const sharedDefaultsDir = resolve(projectDir, '../shared');

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
            allow: [projectDir, physicsPkgDir, sharedDefaultsDir],
        },
    },
    assetsInclude: ['**/*.wasm'],
    optimizeDeps: {
        exclude: ['../physics-core/pkg/physics_core.js'],
    },
});
