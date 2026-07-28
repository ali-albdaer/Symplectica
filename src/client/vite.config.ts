import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectDir = dirname(fileURLToPath(import.meta.url));
const physicsPkgDir = resolve(projectDir, '../physics-core/pkg');
const sharedDefaultsDir = resolve(projectDir, '../shared');

export default defineConfig(({ mode }) => {
    let outDir = 'dist';
    if (mode === 'demo') {
        outDir = 'dist-demo';
    } else if (mode === 'ghpages') {
        outDir = 'dist-ghpages';
    }

    return {
        root: '.',
        publicDir: 'public',
        build: {
            outDir,
            target: 'esnext',
            sourcemap: false,
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
        worker: {
            format: 'es',
        }
    };
});
