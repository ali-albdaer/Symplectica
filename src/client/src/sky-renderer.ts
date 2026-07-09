/**
 * Sky Renderer
 * 
 * Deterministic starfield and sky background for the simulation.
 * 
 * Features:
 * - Seeded starfield with IMF-weighted star color distribution
 * - Power-law brightness distribution (few bright, many dim)
 * - Fixed-pixel-size rendering (no sizeAttenuation) to prevent flicker
 * - Configurable density and seed
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

// ── Starfield shaders ──
// Fixed-pixel-size points with per-vertex color and brightness.
// Uses gl_PointCoord for circular anti-aliased point rendering.

const STARFIELD_VERTEX = /* glsl */ `
attribute float a_brightness;
varying vec3 vColor;
varying float vBrightness;
uniform float u_pixelRatio;
uniform float u_baseSize;

void main() {
    vColor = color;
    vBrightness = a_brightness;

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Fixed pixel size — does not attenuate with distance.
    // Bright stars get larger points; dim stars get smaller.
    // a_brightness is in [0, 1] where 1 = brightest.
    float size = u_baseSize * u_pixelRatio * (0.6 + 2.4 * a_brightness);
    gl_PointSize = max(size, 0.8 * u_pixelRatio);
}
`;

const STARFIELD_FRAGMENT = /* glsl */ `
varying vec3 vColor;
varying float vBrightness;

void main() {
    // Circular point with soft anti-aliased edge
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center) * 2.0;

    // Smooth circular falloff — core is bright, edge fades
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);

    // Brightness modulates both alpha and color intensity
    // Dim stars appear more neutral; bright stars show vivid color
    float intensity = 0.3 + 0.7 * vBrightness;
    vec3 col = vColor * intensity;

    // Overall alpha based on brightness and circular shape
    float finalAlpha = alpha * (0.25 + 0.75 * vBrightness);

    gl_FragColor = vec4(col, finalAlpha);
}
`;

export interface SkyRendererOptions {
    /** Number of background stars (default: 3000) */
    starCount?: number;
    /** Base pixel size of star points (default: 1.8) */
    starSize?: number;
    /** Seed for deterministic generation (default: 42) */
    seed?: number;
    /** Distance of the sky sphere in meters (default: 5e14 = ~3300 AU) */
    skyRadius?: number;
}

const DEFAULT_OPTIONS: Required<SkyRendererOptions> = {
    starCount: 3600,
    starSize: 1.8,
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

        const { starCount, starSize, seed, skyRadius } = this.options;
        const count = Math.max(100, Math.round(starCount));
        const rng = splitmix32(seed);

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const brightness = new Float32Array(count);

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

            // Power-law brightness distribution:
            // Most stars are dim (apparent mag 5-6), few are bright (mag 1-2).
            // Using cube of uniform gives a realistic long tail.
            const rawBright = rng();
            const bright = rawBright * rawBright * rawBright; // cube → heavy dim tail

            // Modulate color by brightness:
            // Dim stars appear more neutral (desaturated), bright stars are vivid
            const saturation = 0.3 + 0.7 * bright;
            const gray = (r + g + b) / 3.0;
            colors[i * 3] = gray + (r - gray) * saturation;
            colors[i * 3 + 1] = gray + (g - gray) * saturation;
            colors[i * 3 + 2] = gray + (b - gray) * saturation;

            brightness[i] = bright;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('a_brightness', new THREE.BufferAttribute(brightness, 1));

        const material = new THREE.ShaderMaterial({
            vertexShader: STARFIELD_VERTEX,
            fragmentShader: STARFIELD_FRAGMENT,
            uniforms: {
                u_pixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                u_baseSize: { value: starSize },
            },
            vertexColors: true,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.starfield = new THREE.Points(geometry, material);
        this.starfield.name = 'starfield';
        this.starfield.frustumCulled = false;
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
