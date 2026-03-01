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
 * - Two-tier rendering: bright stars as instanced billboard quads with
 *   smooth radial falloff, faint stars as standard GL points.
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

/**
 * Create a small circular-falloff DataTexture for PointsMaterial.
 * Replaces the default square GL_POINTS rasterization with a soft circle.
 * Uses a quadratic falloff: alpha = max(0, 1 − r²).
 */
function createCirclePointTexture(size: number = 32): THREE.DataTexture {
    const data = new Uint8Array(size * size * 4);
    const half = size / 2;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = (x + 0.5 - half) / half;
            const dy = (y + 0.5 - half) / half;
            const r2 = dx * dx + dy * dy;
            const alpha = Math.max(0, 1 - r2);
            const idx = (y * size + x) * 4;
            data[idx]     = 255; // R
            data[idx + 1] = 255; // G
            data[idx + 2] = 255; // B
            data[idx + 3] = Math.round(alpha * 255); // A
        }
    }
    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

// ── Bright-star billboard quad shaders ──
// Instanced billboard quad — always faces camera, smooth circular glow.
const BRIGHT_STAR_VERTEX = /* glsl */ `
attribute vec3 a_starPos;
attribute vec3 a_starColor;
attribute float a_starSize;

varying vec2 vUv;
varying vec3 vColor;

void main() {
    vUv = uv;
    vColor = a_starColor;

    // Billboard: compute star center in view space, then offset quad corners
    vec4 mvCenter = viewMatrix * vec4(a_starPos, 1.0);
    // position.xy is the local quad corner (±0.5), scaled by star size in world units
    mvCenter.xy += position.xy * a_starSize;
    gl_Position = projectionMatrix * mvCenter;
}
`;

const BRIGHT_STAR_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying vec3 vColor;

void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0; // 0 at center, 1 at quad edge

    // Smooth circular glow with tight core + soft halo
    float core = exp(-r * r * 12.0);   // tight bright center
    float glow = exp(-r * r * 3.0);    // soft glow halo

    // Composite: bright core + dim halo, clipped to circle
    float circle = smoothstep(1.0, 0.75, r);
    float intensity = (core * 1.5 + glow * 0.3) * circle;
    float alpha = (core * 0.9 + glow * 0.15) * circle;

    gl_FragColor = vec4(vColor * intensity, alpha);
}
`;

// ── Internal star data for sorting/partitioning ──
interface StarDatum {
    x: number; y: number; z: number;
    r: number; g: number; b: number;
    tempK: number;
    size: number;
    intensity: number; // spectral-class luminosity scaling
    brightness: number; // composite metric for tier assignment
}

export interface SkyRendererOptions {
    /** Number of background stars (default: 10000) */
    starCount?: number;
    /** Visual size of star points in meters (default: 3e12) */
    starSize?: number;
    /** Opacity of the faint-star points (default: 0.8) */
    opacity?: number;
    /** Seed for deterministic generation (default: 42) */
    seed?: number;
    /** Distance of the sky sphere in meters (default: 5e14 = ~3300 AU) */
    skyRadius?: number;
    /** Number of brightest stars rendered as instanced quads (default: 200) */
    brightStarCount?: number;
}

const DEFAULT_OPTIONS: Required<SkyRendererOptions> = {
    starCount: 10000,
    starSize: 3.0e12,
    opacity: 0.8,
    seed: 42,
    skyRadius: 5e14,
    brightStarCount: 200,
};

export class SkyRenderer {
    private scene: THREE.Scene;
    private starfield: THREE.Points | null = null;
    /** Instanced billboard quads for the brightest sky stars */
    private brightStars: THREE.Mesh | null = null;
    private options: Required<SkyRendererOptions>;
    /** Circular falloff texture for faint-star GL points (shared across regenerations) */
    private pointTexture: THREE.DataTexture;

    constructor(scene: THREE.Scene, options?: SkyRendererOptions) {
        this.scene = scene;
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.pointTexture = createCirclePointTexture();
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
     * Two-tier rendering: bright stars as instanced billboard quads,
     * faint stars as standard GL points.
     */
    generate(): void {
        this.dispose();

        const { starCount, starSize, opacity, seed, skyRadius, brightStarCount } = this.options;
        const count = Math.max(100, Math.round(starCount));
        const rng = splitmix32(seed);

        // First pass: generate all star data
        const stars: StarDatum[] = [];
        for (let i = 0; i < count; i++) {
            const theta = rng() * Math.PI * 2;
            const phi = Math.acos(2 * rng() - 1);

            const tempK = sampleStarTemperature(rng());
            const [r, g, b] = blackbodyToRGBNorm(tempK);

            // Size and intensity tuned by spectral class for HDR bloom response
            let sizeScale: number;
            let intensityScale: number;
            if (tempK >= 30000) {
                // O-type: hot, massive, very luminous
                sizeScale = 2.0; intensityScale = 6.0;
            } else if (tempK >= 10000) {
                // B-type: blue-white
                sizeScale = 1.8; intensityScale = 4.0;
            } else if (tempK >= 7500) {
                // A-type: white
                sizeScale = 1.5; intensityScale = 2.5;
            } else if (tempK >= 6000) {
                // F-type: yellow-white
                sizeScale = 1.2; intensityScale = 2.0;
            } else if (tempK >= 5200) {
                // G-type: yellow (Sun-like)
                sizeScale = 1.0; intensityScale = 1.0;
            } else if (tempK >= 3700) {
                // K-type: orange
                sizeScale = 0.7; intensityScale = 0.5;
            } else {
                // M-type: red dwarf
                sizeScale = 0.5; intensityScale = 0.3;
            }

            const size = (rng() * 1.5 + 0.5) * sizeScale;
            // Composite brightness = peak channel × size × intensity — used for tier sorting
            const brightness = Math.max(r, g, b) * size * intensityScale;

            stars.push({
                x: skyRadius * Math.sin(phi) * Math.cos(theta),
                y: skyRadius * Math.sin(phi) * Math.sin(theta),
                z: skyRadius * Math.cos(phi),
                r, g, b,
                tempK, size, intensity: intensityScale, brightness,
            });
        }

        // Sort by brightness descending — brightest stars get instanced quads
        stars.sort((a, b) => b.brightness - a.brightness);

        const nBright = Math.min(Math.max(0, brightStarCount), count);
        const brightSlice = stars.slice(0, nBright);
        const faintSlice = stars.slice(nBright);

        // Tier 1: Bright stars → instanced billboard quads (smooth, no flicker)
        if (nBright > 0) {
            this.createBrightStars(brightSlice, starSize);
        }

        // Tier 2: Faint stars → GL Points (unchanged behavior)
        if (faintSlice.length > 0) {
            this.createFaintStars(faintSlice, starSize, opacity);
        }
    }

    /**
     * Render the top-N brightest sky stars as instanced billboard quads
     * with a custom shader that draws a smooth circular glow.
     * Eliminates square-point artifacts and subpixel flicker.
     */
    private createBrightStars(stars: StarDatum[], baseSize: number): void {
        const quadGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
        const instGeo = new THREE.InstancedBufferGeometry();
        instGeo.index = quadGeo.index;
        instGeo.setAttribute('position', quadGeo.getAttribute('position'));
        instGeo.setAttribute('uv', quadGeo.getAttribute('uv'));
        quadGeo.dispose(); // Free the temporary PlaneGeometry wrapper

        const n = stars.length;
        const starPos = new Float32Array(n * 3);
        const starColor = new Float32Array(n * 3);
        const starSizes = new Float32Array(n);

        for (let i = 0; i < n; i++) {
            const s = stars[i];
            starPos[i * 3]     = s.x;
            starPos[i * 3 + 1] = s.y;
            starPos[i * 3 + 2] = s.z;

            // Scale vertex colors by spectral-class intensity for HDR bloom
            const skyDim = 0.7 * s.intensity;
            starColor[i * 3]     = s.r * skyDim;
            starColor[i * 3 + 1] = s.g * skyDim;
            starColor[i * 3 + 2] = s.b * skyDim;

            // Bright stars rendered ~1.8× larger than point-based size
            starSizes[i] = s.size * baseSize * 1.8;
        }

        instGeo.setAttribute('a_starPos',   new THREE.InstancedBufferAttribute(starPos, 3));
        instGeo.setAttribute('a_starColor', new THREE.InstancedBufferAttribute(starColor, 3));
        instGeo.setAttribute('a_starSize',  new THREE.InstancedBufferAttribute(starSizes, 1));
        instGeo.instanceCount = n;

        const material = new THREE.ShaderMaterial({
            vertexShader: BRIGHT_STAR_VERTEX,
            fragmentShader: BRIGHT_STAR_FRAGMENT,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            toneMapped: false,
        });

        const mesh = new THREE.Mesh(instGeo, material);
        mesh.frustumCulled = false;
        mesh.name = 'bright-stars';
        this.brightStars = mesh;
        this.scene.add(mesh);
    }

    /** Render faint stars as standard GL Points (existing behavior) */
    private createFaintStars(stars: StarDatum[], starSize: number, opacity: number): void {
        const n = stars.length;
        const positions = new Float32Array(n * 3);
        const colors = new Float32Array(n * 3);
        const sizes = new Float32Array(n);

        for (let i = 0; i < n; i++) {
            const s = stars[i];
            positions[i * 3]     = s.x;
            positions[i * 3 + 1] = s.y;
            positions[i * 3 + 2] = s.z;

            // Scale by spectral-class intensity but keep faint below bloom threshold
            const skyDim = 0.65 * Math.min(s.intensity, 1.5);
            colors[i * 3]     = s.r * skyDim;
            colors[i * 3 + 1] = s.g * skyDim;
            colors[i * 3 + 2] = s.b * skyDim;

            sizes[i] = s.size;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 1.5,                    // Fixed pixel size — stars at infinity have no distance-based scaling
            sizeAttenuation: false,       // Screen-space sizing eliminates sub-pixel aliasing/twinkle
            vertexColors: true,
            transparent: true,
            opacity,
            toneMapped: false,            // Keep sky stars in LDR — prevent bloom pickup
            map: this.pointTexture,       // Circular falloff — eliminates square GL_POINTS artifact
            alphaTest: 0.01,              // Discard fully transparent fragments
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
        if (this.brightStars) {
            this.scene.remove(this.brightStars);
            this.brightStars.geometry.dispose();
            (this.brightStars.material as THREE.Material).dispose();
            this.brightStars = null;
        }
    }

    /** Returns true if the starfield is currently in the scene */
    get isActive(): boolean {
        return this.starfield !== null || this.brightStars !== null;
    }
}
