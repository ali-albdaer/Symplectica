/**
 * Blackbody Color Utility
 * 
 * Converts a blackbody temperature (in Kelvin) to an sRGB color.
 * Uses the CIE 1931 2° observer → sRGB analytic approximation
 * from Tanner Helland (2012), covering 1000 K – 40000 K.
 * 
 * Reference: http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
 */

import * as THREE from 'three';

/**
 * Convert a blackbody temperature to a THREE.js-compatible hex color.
 * @param tempK Temperature in Kelvin (clamped to 1000–40000)
 * @returns Hex integer 0xRRGGBB
 */
export function blackbodyToHex(tempK: number): number {
    const [r, g, b] = blackbodyToRGB(tempK);
    return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
}

/**
 * Convert a blackbody temperature to normalised [0,1] RGB.
 * Suitable for use as THREE.Color components.
 * @param tempK Temperature in Kelvin
 * @returns [r, g, b] each in [0, 1]
 */
export function blackbodyToRGBNorm(tempK: number): [number, number, number] {
    const [r, g, b] = blackbodyToRGB(tempK);
    return [r / 255, g / 255, b / 255];
}

/**
 * Convert blackbody temperature → sRGB [0–255].
 * Helland approximation based on Mitchell Charity's CIE data.
 */
export function blackbodyToRGB(tempK: number): [number, number, number] {
    // Clamp temperature
    const temp = Math.max(1000, Math.min(40000, tempK)) / 100;

    let r: number;
    let g: number;
    let b: number;

    // ── Red channel ──
    if (temp <= 66) {
        r = 255;
    } else {
        r = 329.698727446 * Math.pow(temp - 60, -0.1332047592);
    }

    // ── Green channel ──
    if (temp <= 66) {
        g = 99.4708025861 * Math.log(temp) - 161.1195681661;
    } else {
        g = 288.1221695283 * Math.pow(temp - 60, -0.0755148492);
    }

    // ── Blue channel ──
    if (temp >= 66) {
        b = 255;
    } else if (temp <= 19) {
        b = 0;
    } else {
        b = 138.5177312231 * Math.log(temp - 10) - 305.0447927307;
    }

    return [
        Math.round(Math.max(0, Math.min(255, r))),
        Math.round(Math.max(0, Math.min(255, g))),
        Math.round(Math.max(0, Math.min(255, b))),
    ];
}

/**
 * Create a GPU-side blackbody lookup table as a DataTexture.
 * Samples blackbodyToRGBNorm from 1000K to 40000K across `width` texels.
 * Enables per-pixel temperature-dependent color in the star shader
 * (granulation color variation, starspot umbral color shift).
 *
 * @param width Number of samples (default 512 — more than sufficient
 *              given the Helland curve has no sub-100K features)
 * @returns THREE.DataTexture with LinearFilter, ClampToEdge wrapping
 */
export function createBlackbodyLUT(width: number = 512): THREE.DataTexture {
    const data = new Float32Array(width * 4);
    const minT = 1000;
    const maxT = 40000;
    const range = maxT - minT;

    for (let i = 0; i < width; i++) {
        const t = minT + (i / (width - 1)) * range;
        const [r, g, b] = blackbodyToRGBNorm(t);
        data[i * 4]     = r;
        data[i * 4 + 1] = g;
        data[i * 4 + 2] = b;
        data[i * 4 + 3] = 1.0;
    }

    const texture = new THREE.DataTexture(
        data, width, 1,
        THREE.RGBAFormat,
        THREE.FloatType,
    );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}

/**
 * Look up a random star temperature from the IMF-weighted distribution.
 * Used by the starfield generator for realistic color distribution.
 * Returns a temperature in Kelvin, weighted towards K/M dwarfs.
 * @param t Random value in [0, 1]
 */
export function sampleStarTemperature(t: number): number {
    // IMF-weighted CDF approximation (Kroupa IMF):
    // ~76% M-dwarfs (2400-3700K), ~12% K (3700-5200K), ~7.6% G (5200-6000K),
    // ~3% F (6000-7500K), ~1% A (7500-10000K), 0.3% B (10000-30000K), 0.003% O (>30000K)
    if (t < 0.76) {
        // M-dwarf: 2400–3700 K
        return 2400 + (t / 0.76) * 1300;
    } else if (t < 0.88) {
        // K-dwarf: 3700–5200 K
        return 3700 + ((t - 0.76) / 0.12) * 1500;
    } else if (t < 0.956) {
        // G-star: 5200–6000 K
        return 5200 + ((t - 0.88) / 0.076) * 800;
    } else if (t < 0.986) {
        // F-star: 6000–7500 K
        return 6000 + ((t - 0.956) / 0.03) * 1500;
    } else if (t < 0.996) {
        // A-star: 7500–10000 K
        return 7500 + ((t - 0.986) / 0.01) * 2500;
    } else if (t < 0.999) {
        // B-star: 10000–30000 K
        return 10000 + ((t - 0.996) / 0.003) * 20000;
    } else {
        // O-star: 30000–50000 K
        return 30000 + ((t - 0.999) / 0.001) * 20000;
    }
}
