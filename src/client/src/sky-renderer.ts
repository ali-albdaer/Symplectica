/**
 * Sky Renderer
 * 
 * Deterministic starfield and sky background for the simulation.
 * Replaces the old Math.random()-based starfield in main.ts with a
 * seeded PRNG for reproducible visuals across sessions.
 * 
 * Features:
 * - Seeded starfield with IMF-weighted star color distribution
 * - Configurable density, size, and opacity
 * - Future: nebula overlays, Milky Way band
 */

import * as THREE from 'three';
import { blackbodyToRGBNorm, sampleStarTemperature } from './blackbody';

// ── Seeded PRNG (SplitMix64) ──
// Produces deterministic f64 values from a 64-bit seed.
// We use a 32-bit variant internally since JS lacks native u64.
// This is "splitmix32" — simple, fast, good distribution.
function splitmix32(seed: number): () => number {
    let state = seed | 0;
    return () => {
        state = (state + 0x9e3779b9) | 0;
        let z = state;
        z = Math.imul(z ^ (z >>> 16), 0x85ebca6b);
        z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35);
        z = (z ^ (z >>> 16)) >>> 0;
        return z / 0x100000000; // [0, 1)
    };
}

export interface SkyRendererOptions {
    /** Number of background stars (default: 10000) */
    starCount?: number;
    /** Visual size of star points in meters (default: 1e12) */
    starSize?: number;
    /** Opacity of the starfield (default: 0.8) */
    opacity?: number;
    /** Seed for deterministic generation (default: 42) */
    seed?: number;
    /** Distance of the sky sphere in meters (default: 5e14 = ~3300 AU) */
    skyRadius?: number;
}

const DEFAULT_OPTIONS: Required<SkyRendererOptions> = {
    starCount: 10000,
    starSize: 1.0e12,
    opacity: 0.8,
    seed: 42,
    skyRadius: 5e14,
};

export class SkyRenderer {
    private scene: THREE.Scene;
    private starfield: THREE.Points | null = null;
    private options: Required<SkyRendererOptions>;

    constructor(scene: THREE.Scene, options?: SkyRendererOptions) {
        this.scene = scene;
        this.options = { ...DEFAULT_OPTIONS, ...options };
    }

    /** Update options and regenerate the starfield */
    setOptions(options: Partial<SkyRendererOptions>): void {
        this.options = { ...this.options, ...options };
        this.generate();
    }

    /** Get the current seed */
    get seed(): number {
        return this.options.seed;
    }

    /** Set a new seed and regenerate */
    set seed(value: number) {
        this.options.seed = value;
        this.generate();
    }

    /**
     * Generate (or regenerate) the starfield.
     * Call this once at init, and again if seed or options change.
     */
    generate(): void {
        this.dispose();

        const { starCount, starSize, opacity, seed, skyRadius } = this.options;
        const count = Math.max(100, Math.round(starCount));
        const rng = splitmix32(seed);

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Uniform distribution on sphere surface
            const theta = rng() * Math.PI * 2;
            const phi = Math.acos(2 * rng() - 1);

            positions[i * 3] = skyRadius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = skyRadius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = skyRadius * Math.cos(phi);

            // IMF-weighted blackbody color
            const tempK = sampleStarTemperature(rng());
            const [r, g, b] = blackbodyToRGBNorm(tempK);
            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;

            // Apparent size: IMF-weighted magnitude variation
            // Brighter (hotter) stars appear larger
            const brightnessFactor = tempK > 6000 ? 1.5 : tempK > 4000 ? 1.0 : 0.6;
            sizes[i] = (rng() * 1.5 + 0.5) * brightnessFactor;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: starSize,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity,
        });

        this.starfield = new THREE.Points(geometry, material);
        this.starfield.name = 'starfield';
        this.scene.add(this.starfield);
    }

    /** Remove and dispose the starfield from the scene */
    dispose(): void {
        if (this.starfield) {
            this.scene.remove(this.starfield);
            this.starfield.geometry.dispose();
            (this.starfield.material as THREE.Material).dispose();
            this.starfield = null;
        }
    }

    /** Returns true if the starfield is currently in the scene */
    get isActive(): boolean {
        return this.starfield !== null;
    }
}
