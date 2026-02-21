/**
 * Body Renderer
 * 
 * Renders celestial bodies as spheres with appropriate materials:
 * - Stars: Emissive with glow
 * - Planets: Phong shading with texture support
 * - Floating origin for large-scale precision
 */

import * as THREE from 'three';
import { blackbodyToRGBNorm } from './blackbody';

// ── Star surface shader ────────────────────────────────────────────────
// Implements blackbody coloring + quadratic limb-darkening:
//   I(μ) = 1 − a·(1−μ) − b·(1−μ)²    where μ = dot(N, V)

const STAR_VERTEX = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjNormal;
void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    vObjNormal = normalize(normal);
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
}
`;

const STAR_FRAGMENT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 u_color;   // blackbody RGB [0,1]
uniform float u_limbA;
uniform float u_limbB;
uniform sampler2D u_granulationMap;
uniform float u_granulationStrength;
uniform float u_time;
uniform float u_spotFraction;
uniform float u_spotEnabled;
uniform float u_spotSeed;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vObjNormal;

float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

vec3 randomOnSphere(float idx, float seed) {
    float u = hash11(idx * 17.13 + seed * 3.7) * 2.0 - 1.0;
    float a = 6.28318530718 * hash11(idx * 29.73 + seed * 5.1);
    float s = sqrt(max(0.0, 1.0 - u * u));
    return vec3(cos(a) * s, sin(a) * s, u);
}

vec3 rotateY(vec3 v, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(v.x * c - v.z * s, v.y, v.x * s + v.z * c);
}

float sampleGranulation(vec3 n, float scale, vec2 drift) {
    vec3 an = abs(n);
    vec3 w = pow(an, vec3(5.0));
    float sum = w.x + w.y + w.z + 1e-6;
    w /= sum;

    vec2 uvX = fract(n.yz * scale + drift);
    vec2 uvY = fract(n.zx * scale + drift * vec2(0.73, 1.21));
    vec2 uvZ = fract(n.xy * scale + drift * vec2(1.37, 0.59));

    float sx = texture2D(u_granulationMap, uvX).r;
    float sy = texture2D(u_granulationMap, uvY).r;
    float sz = texture2D(u_granulationMap, uvZ).r;
    return sx * w.x + sy * w.y + sz * w.z;
}

void main() {
    float mu = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
    float limb = 1.0 - u_limbA * (1.0 - mu) - u_limbB * (1.0 - mu) * (1.0 - mu);
    vec3 objN = normalize(vObjNormal);
    vec2 drift = vec2(u_time * 0.0016, u_time * 0.0011);
    float granTex = sampleGranulation(objN, 5.8, drift);
    float granulation = mix(1.0, 0.84 + 0.34 * granTex, u_granulationStrength);

    // D6: Seeded starspots (Ultra) with slow drift
    float spotCoverage = clamp(u_spotFraction / 0.3, 0.0, 1.0) * u_spotEnabled;
    float spotCount = floor(clamp(u_spotFraction * 80.0, 0.0, 24.0) + 0.5);
    float spotDarkening = 0.0;
    for (int i = 0; i < 24; i++) {
        float fi = float(i);
        if (fi >= spotCount) {
            continue;
        }

        vec3 center = randomOnSphere(fi + 1.0, u_spotSeed);

        // Keep most spots away from poles for a more solar-like pattern
        center.y *= 0.75;
        center = normalize(center);

        // Slow longitudinal drift (seeded)
        float driftAngle = 0.07 * sin(u_time * 0.00001 + fi * 1.7 + u_spotSeed * 0.01);
        center = normalize(rotateY(center, driftAngle));

        float radius = mix(0.035, 0.095, hash11(fi * 11.3 + u_spotSeed * 0.7));
        float d = dot(objN, center);
        float core = smoothstep(cos(radius), cos(radius * 0.55), d);

        // Darkness corresponds to cooler spot regions (ΔT-like visual approximation)
        float darkness = mix(0.18, 0.38, hash11(fi * 23.7 + u_spotSeed * 1.9));
        spotDarkening = max(spotDarkening, core * darkness);
    }

    vec3 finalColor = u_color * limb * granulation;
    finalColor *= (1.0 - spotCoverage * spotDarkening);

    gl_FragColor = vec4(finalColor, 1.0);
    #include <logdepthbuf_fragment>
}
`;

// ── Atmosphere shell shader ─────────────────────────────────────────────
// Fresnel-edge glow: bright at limb, transparent at center, tinted by
// Rayleigh scattering coefficients.

const ATMO_VERTEX = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_vertex>
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
}
`;

const ATMO_FRAGMENT = /* glsl */ `
#include <common>
#include <logdepthbuf_pars_fragment>
uniform vec3 u_rayleighColor;
uniform vec3 u_mieColor;
uniform float u_mieWeight;   // 0 = pure Rayleigh, 1 = pure Mie
uniform float u_intensity;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
    float mu = dot(normalize(vNormal), normalize(vViewDir));
    // Fresnel-like: bright at edges (mu→0), transparent at center (mu→1)
    float rim = pow(1.0 - max(mu, 0.0), 3.0);
    // Blend Rayleigh (molecular) and Mie (aerosol/dust) scattering colors
    vec3 color = mix(u_rayleighColor, u_mieColor, u_mieWeight);
    gl_FragColor = vec4(color, rim * u_intensity);
    #include <logdepthbuf_fragment>
}
`;

// Body data from physics simulation
interface BodyData {
    id: number;
    name: string;
    type: 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'spacecraft' | 'test_particle' | 'player';
    mass: number;
    radius: number;
    color: number;
    axialTilt?: number; // radians, obliquity — used for rotation axis overlay
    // Extended physics fields — populated from derive modules
    luminosity?: number;
    effectiveTemperature?: number;
    rotationRate?: number;
    seed?: number;
    oblateness?: number;
    scaleHeight?: number;
    equilibriumTemperature?: number;
    metallicity?: number;
    age?: number;
    spectralType?: string;
    limbDarkeningCoeffs?: [number, number];
    flareRate?: number;
    spotFraction?: number;
    composition?: string;
    albedo?: number;
    atmosphere?: {
        scaleHeight: number;
        rayleighCoefficients: [number, number, number];
        mieCoefficient: number;
        mieDirection: number;
        height: number;
        mieColor: [number, number, number];
    };
    semiMajorAxis?: number;
    eccentricity?: number;
    meanSurfaceTemperature?: number;
}

type FlareQuality = 'Off' | 'Low' | 'High' | 'Ultra';

interface StarRenderOptions {
    granulationEnabled: boolean;
    starspotsEnabled: boolean;
    flareQuality: FlareQuality;
}

// Body scaling for visualization
// Real world: Sun radius = 6.96e8m, Earth = 6.37e6m, Moon = 1.74e6m
// Moon-Earth distance = 3.84e8m, Earth-Sun distance = 1.496e11m (1 AU)
// 
// Standard approaches for large-scale visualization:
// 1. Linear: preserves relative sizes exactly (used here)
// 2. Logarithmic: compresses huge range, loses proportions
// 3. Power-law: compromise between linear and log
const AU = 1.495978707e11;

function scaleRadius(realRadius: number): number {
    return realRadius;
}

function mulberry32(seed: number): () => number {
    let t = seed >>> 0;
    return () => {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), t | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function hash01(ix: number, iy: number, seed: number): number {
    let h = (ix * 374761393) ^ (iy * 668265263) ^ (seed * 1442695041);
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967296;
}

function convectiveField(u: number, v: number, density: number, seed: number): number {
    const gx = u * density;
    const gy = v * density;
    const cx = Math.floor(gx);
    const cy = Math.floor(gy);

    let nearest = Number.POSITIVE_INFINITY;
    let secondNearest = Number.POSITIVE_INFINITY;

    for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
            const cellX = cx + ox;
            const cellY = cy + oy;

            const jitterX = (hash01(cellX, cellY, seed) - 0.5) * 0.75;
            const jitterY = (hash01(cellX, cellY, seed + 97) - 0.5) * 0.75;

            const px = cellX + 0.5 + jitterX;
            const py = cellY + 0.5 + jitterY;

            const dx = gx - px;
            const dy = gy - py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearest) {
                secondNearest = nearest;
                nearest = dist;
            } else if (dist < secondNearest) {
                secondNearest = dist;
            }
        }
    }

    const center = Math.exp(-nearest * 2.1);
    const laneProximity = Math.max(0, 1 - (secondNearest - nearest) * 4.2);
    const laneDarkening = laneProximity * laneProximity;

    return 0.35 + 0.75 * center - 0.42 * laneDarkening;
}

function valueNoise2D(u: number, v: number, frequency: number, seed: number): number {
    const x = u * frequency;
    const y = v * frequency;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;

    const fx = x - x0;
    const fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const n00 = hash01(x0, y0, seed);
    const n10 = hash01(x1, y0, seed);
    const n01 = hash01(x0, y1, seed);
    const n11 = hash01(x1, y1, seed);

    const nx0 = n00 * (1 - sx) + n10 * sx;
    const nx1 = n01 * (1 - sx) + n11 * sx;
    return nx0 * (1 - sy) + nx1 * sy;
}

function createGranulationTexture(seed: number, size = 256): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const image = ctx.createImageData(size, size);
    const data = image.data;

    const random = mulberry32(seed);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            const gx = x / size;
            const gy = y / size;

            const layerA = convectiveField(gx, gy, 34.0, seed);
            const layerB = convectiveField(gx, gy, 51.0, seed + 173);
            const macro = valueNoise2D(gx, gy, 5.5, seed + 911);
            const microNoise = (random() * 2.0 - 1.0) * 0.06;

            const field = 0.62 * layerA + 0.38 * layerB;
            const modulated = field * (0.9 + 0.18 * macro) + microNoise;
            const v = Math.max(0, Math.min(255, Math.round(modulated * 255)));

            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
            data[i + 3] = 255;
        }
    }

    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    return texture;
}

function hashUnit(seed: number, id: number, channel: number): number {
    let h = (seed | 0) ^ ((id * 374761393) | 0) ^ ((channel * 668265263) | 0);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
}

function latLonToNormal(lat: number, lon: number): THREE.Vector3 {
    const cl = Math.cos(lat);
    return new THREE.Vector3(
        cl * Math.cos(lon),
        Math.sin(lat),
        cl * Math.sin(lon),
    );
}

type FlareEvent = {
    id: number;
    start: number;
    duration: number;
    energy: number;
    lat: number;
    lon: number;
    size: number;
    phase: number;
};

class StarFlareSystem {
    readonly group = new THREE.Group();

    private readonly maxFlares = 12;
    private readonly sparksPerFlare = 6;

    private flareQuality: FlareQuality;
    private flareRate: number;
    private seed: number;

    private events: FlareEvent[] = [];
    private nextEventId = 1;
    private nextEventTime = 0;

    private readonly arcGeometry: THREE.InstancedBufferGeometry;
    private readonly glowGeometry: THREE.InstancedBufferGeometry;
    private readonly sparkGeometry: THREE.InstancedBufferGeometry;

    private readonly arcMaterial: THREE.ShaderMaterial;
    private readonly glowMaterial: THREE.ShaderMaterial;
    private readonly sparkMaterial: THREE.ShaderMaterial;

    private readonly arcMesh: THREE.Mesh;
    private readonly glowMesh: THREE.Mesh;
    private readonly sparkMesh: THREE.Mesh;

    private readonly arcAnchor: Float32Array;
    private readonly arcTiming: Float32Array;
    private readonly arcShape: Float32Array;
    private readonly arcPhase: Float32Array;

    private readonly glowAnchor: Float32Array;
    private readonly glowTiming: Float32Array;
    private readonly glowShape: Float32Array;
    private readonly glowPhase: Float32Array;

    private readonly sparkAnchor: Float32Array;
    private readonly sparkTiming: Float32Array;
    private readonly sparkVelocity: Float32Array;
    private readonly sparkSize: Float32Array;

    constructor(seed: number, flareRate: number, effectiveTemperature: number, flareQuality: FlareQuality) {
        this.seed = seed === 0 ? 1 : seed;
        this.flareRate = Math.max(0, flareRate);
        this.flareQuality = flareQuality;

        this.group.name = 'star-flares';

        const [r, g, b] = blackbodyToRGBNorm(effectiveTemperature > 0 ? effectiveTemperature : 5778);
        const baseColor = new THREE.Color(r, g, b);
        const coreColor = baseColor.clone().lerp(new THREE.Color(1.0, 0.98, 0.9), 0.55);
        const glowColor = baseColor.clone().lerp(new THREE.Color(1.0, 0.62, 0.32), 0.35);

        const arcBase = new THREE.PlaneGeometry(1, 1, 20, 2);
        this.arcGeometry = new THREE.InstancedBufferGeometry();
        this.arcGeometry.index = arcBase.index;
        this.arcGeometry.setAttribute('position', arcBase.getAttribute('position'));
        this.arcGeometry.setAttribute('uv', arcBase.getAttribute('uv'));

        this.arcAnchor = new Float32Array(this.maxFlares * 3);
        this.arcTiming = new Float32Array(this.maxFlares * 4);
        this.arcShape = new Float32Array(this.maxFlares * 4);
        this.arcPhase = new Float32Array(this.maxFlares);

        this.arcGeometry.setAttribute('a_anchor', new THREE.InstancedBufferAttribute(this.arcAnchor, 3));
        this.arcGeometry.setAttribute('a_timing', new THREE.InstancedBufferAttribute(this.arcTiming, 4));
        this.arcGeometry.setAttribute('a_shape', new THREE.InstancedBufferAttribute(this.arcShape, 4));
        this.arcGeometry.setAttribute('a_phase', new THREE.InstancedBufferAttribute(this.arcPhase, 1));
        this.arcGeometry.instanceCount = 0;

        this.arcMaterial = new THREE.ShaderMaterial({
            vertexShader: `
attribute vec3 a_anchor;
attribute vec4 a_timing;
attribute vec4 a_shape;
attribute float a_phase;
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;

float flareLife(float t, float start, float duration) {
    float p = clamp((t - start) / max(duration, 1e-6), 0.0, 1.0);
    float riseEnd = 0.15;
    float peakEnd = 0.25;
    float rise = exp(-6.0 * (1.0 - p / riseEnd));
    float peak = 1.0;
    float decay = exp(-4.2 * ((p - peakEnd) / max(1.0 - peakEnd, 1e-5)));
    if (p < riseEnd) return rise;
    if (p < peakEnd) return peak;
    return decay;
}

void main() {
    float life = flareLife(u_time, a_timing.x, a_timing.y);
    vec3 n = normalize(a_anchor);
    vec3 ref = abs(n.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 t = normalize(cross(ref, n));
    vec3 b = normalize(cross(n, t));

    float rot = a_phase * 6.28318530718;
    vec3 tR = normalize(t * cos(rot) + b * sin(rot));
    vec3 bR = normalize(cross(n, tR));

    float x = position.x;
    float y = position.y;
    float arcLen = a_shape.x;
    float arcHeight = a_shape.y * (0.35 + 0.95 * life);
    float thickness = a_shape.z * (0.55 + 0.7 * life);
    float curve = max(0.0, 1.0 - 4.0 * x * x);

    vec3 center = n * (1.015 + 0.01 * life);
    vec3 p = center + tR * (x * arcLen) + bR * (y * thickness) + n * (curve * arcHeight);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);
    vec3 viewN = normalize(mat3(modelViewMatrix) * n);
    vec3 viewDir = normalize(-mvCenter.xyz);
    vFacing = dot(viewN, viewDir);

    vUv = uv;
    vLife = life;
    vEnergy = a_timing.z;
    vSeed = a_timing.w;
}
`,
            fragmentShader: `
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;
uniform vec3 u_coreColor;
uniform vec3 u_glowColor;
uniform float u_animStrength;

void main() {
    float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
    float y = abs(vUv.y - 0.5) * 2.0;
    float core = exp(-6.0 * y * y);
    float outer = exp(-1.5 * y * y);
    float turb = 0.5 + 0.5 * sin(vUv.x * 34.0 + u_time * (0.02 + 0.07 * u_animStrength) + vSeed * 5.3)
                      * cos(vUv.y * 19.0 - u_time * (0.02 + 0.05 * u_animStrength) + vSeed * 2.1);
    float intensity = (3.0 + 14.0 * vEnergy) * vLife * (0.72 + 0.28 * turb);
    vec3 col = mix(u_glowColor, u_coreColor, core);
    float front = smoothstep(-0.18, 0.06, vFacing);
    float alpha = edge * vLife * (0.25 * outer + 0.85 * core) * front;
    gl_FragColor = vec4(col * intensity, alpha);
}
`,
            uniforms: {
                u_time: { value: 0.0 },
                u_coreColor: { value: coreColor },
                u_glowColor: { value: glowColor },
                u_animStrength: { value: 0.75 },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            toneMapped: false,
        });

        this.arcMesh = new THREE.Mesh(this.arcGeometry, this.arcMaterial);
        this.arcMesh.frustumCulled = false;
        this.group.add(this.arcMesh);

        const glowBase = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.glowGeometry = new THREE.InstancedBufferGeometry();
        this.glowGeometry.index = glowBase.index;
        this.glowGeometry.setAttribute('position', glowBase.getAttribute('position'));
        this.glowGeometry.setAttribute('uv', glowBase.getAttribute('uv'));

        this.glowAnchor = new Float32Array(this.maxFlares * 3);
        this.glowTiming = new Float32Array(this.maxFlares * 4);
        this.glowShape = new Float32Array(this.maxFlares * 4);
        this.glowPhase = new Float32Array(this.maxFlares);

        this.glowGeometry.setAttribute('a_anchor', new THREE.InstancedBufferAttribute(this.glowAnchor, 3));
        this.glowGeometry.setAttribute('a_timing', new THREE.InstancedBufferAttribute(this.glowTiming, 4));
        this.glowGeometry.setAttribute('a_shape', new THREE.InstancedBufferAttribute(this.glowShape, 4));
        this.glowGeometry.setAttribute('a_phase', new THREE.InstancedBufferAttribute(this.glowPhase, 1));
        this.glowGeometry.instanceCount = 0;

        this.glowMaterial = new THREE.ShaderMaterial({
            vertexShader: `
attribute vec3 a_anchor;
attribute vec4 a_timing;
attribute vec4 a_shape;
attribute float a_phase;
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;

float flareLife(float t, float start, float duration) {
    float p = clamp((t - start) / max(duration, 1e-6), 0.0, 1.0);
    float riseEnd = 0.15;
    float peakEnd = 0.25;
    float rise = exp(-6.0 * (1.0 - p / riseEnd));
    float peak = 1.0;
    float decay = exp(-4.2 * ((p - peakEnd) / max(1.0 - peakEnd, 1e-5)));
    if (p < riseEnd) return rise;
    if (p < peakEnd) return peak;
    return decay;
}

void main() {
    float life = flareLife(u_time, a_timing.x, a_timing.y);
    vec3 n = normalize(a_anchor);
    vec3 center = n * (1.02 + 0.025 * life);
    vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);

    float size = a_shape.x * (2.4 + 1.8 * a_timing.z) * (0.55 + 0.55 * life);
    vec2 wobble = vec2(
        sin(u_time * 0.08 + a_phase * 10.0),
        cos(u_time * 0.06 + a_phase * 7.0)
    ) * 0.05 * size;
    mvCenter.xy += position.xy * size + wobble;
    gl_Position = projectionMatrix * mvCenter;

    vec3 viewN = normalize(mat3(modelViewMatrix) * n);
    vec3 viewDir = normalize(-mvCenter.xyz);
    vFacing = dot(viewN, viewDir);

    vUv = uv;
    vLife = life;
    vEnergy = a_timing.z;
    vSeed = a_timing.w;
}
`,
            fragmentShader: `
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vSeed;
varying float vFacing;
uniform float u_time;
uniform vec3 u_coreColor;
uniform vec3 u_glowColor;
uniform float u_animStrength;

void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float core = exp(-8.0 * r * r);
    float halo = exp(-2.0 * r * r);
    float plasma = 0.5 + 0.5 * sin(24.0 * p.x + u_time * (0.02 + 0.09 * u_animStrength) + vSeed * 1.7)
                        * cos(18.0 * p.y - u_time * (0.02 + 0.07 * u_animStrength) + vSeed * 2.3);
    float intensity = (1.8 + 8.0 * vEnergy) * vLife * (0.8 + 0.2 * plasma);
    vec3 col = mix(u_glowColor, u_coreColor, core);
    float front = smoothstep(-0.18, 0.06, vFacing);
    float alpha = vLife * (0.4 * halo + 0.8 * core) * (1.0 - smoothstep(0.85, 1.0, r)) * front;
    gl_FragColor = vec4(col * intensity, alpha);
}
`,
            uniforms: {
                u_time: { value: 0.0 },
                u_coreColor: { value: coreColor },
                u_glowColor: { value: glowColor },
                u_animStrength: { value: 0.75 },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            toneMapped: false,
        });

        this.glowMesh = new THREE.Mesh(this.glowGeometry, this.glowMaterial);
        this.glowMesh.frustumCulled = false;
        this.group.add(this.glowMesh);

        const sparkBase = new THREE.PlaneGeometry(1, 1, 1, 1);
        this.sparkGeometry = new THREE.InstancedBufferGeometry();
        this.sparkGeometry.index = sparkBase.index;
        this.sparkGeometry.setAttribute('position', sparkBase.getAttribute('position'));
        this.sparkGeometry.setAttribute('uv', sparkBase.getAttribute('uv'));

        const maxSparks = this.maxFlares * this.sparksPerFlare;
        this.sparkAnchor = new Float32Array(maxSparks * 3);
        this.sparkTiming = new Float32Array(maxSparks * 4);
        this.sparkVelocity = new Float32Array(maxSparks * 3);
        this.sparkSize = new Float32Array(maxSparks);

        this.sparkGeometry.setAttribute('a_anchor', new THREE.InstancedBufferAttribute(this.sparkAnchor, 3));
        this.sparkGeometry.setAttribute('a_timing', new THREE.InstancedBufferAttribute(this.sparkTiming, 4));
        this.sparkGeometry.setAttribute('a_velocity', new THREE.InstancedBufferAttribute(this.sparkVelocity, 3));
        this.sparkGeometry.setAttribute('a_size', new THREE.InstancedBufferAttribute(this.sparkSize, 1));
        this.sparkGeometry.instanceCount = 0;

        this.sparkMaterial = new THREE.ShaderMaterial({
            vertexShader: `
attribute vec3 a_anchor;
attribute vec4 a_timing;
attribute vec3 a_velocity;
attribute float a_size;
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vFacing;
uniform float u_time;

float flareLife(float t, float start, float duration) {
    float p = clamp((t - start) / max(duration, 1e-6), 0.0, 1.0);
    float riseEnd = 0.15;
    float peakEnd = 0.25;
    float rise = exp(-6.0 * (1.0 - p / riseEnd));
    float peak = 1.0;
    float decay = exp(-4.2 * ((p - peakEnd) / max(1.0 - peakEnd, 1e-5)));
    if (p < riseEnd) return rise;
    if (p < peakEnd) return peak;
    return decay;
}

void main() {
    float life = flareLife(u_time, a_timing.x, a_timing.y);
    float age = clamp((u_time - a_timing.x) / max(a_timing.y, 1e-6), 0.0, 1.0);
    vec3 n = normalize(a_anchor);
    vec3 center = n * (1.025 + 0.09 * age) + a_velocity * (0.35 * age);

    vec4 mvCenter = modelViewMatrix * vec4(center, 1.0);
    float size = a_size * (1.0 - age) * (0.4 + 0.8 * a_timing.z);
    mvCenter.xy += position.xy * size;
    gl_Position = projectionMatrix * mvCenter;

    vec3 viewN = normalize(mat3(modelViewMatrix) * n);
    vec3 viewDir = normalize(-mvCenter.xyz);
    vFacing = dot(viewN, viewDir);

    vUv = uv;
    vLife = life;
    vEnergy = a_timing.z;
}
`,
            fragmentShader: `
varying vec2 vUv;
varying float vLife;
varying float vEnergy;
varying float vFacing;
uniform vec3 u_coreColor;

void main() {
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;
    float core = exp(-10.0 * r * r);
    float front = smoothstep(-0.18, 0.06, vFacing);
    float alpha = vLife * core * (1.0 - smoothstep(0.85, 1.0, r)) * front;
    vec3 col = u_coreColor * (2.2 + 4.5 * vEnergy);
    gl_FragColor = vec4(col, alpha);
}
`,
            uniforms: {
                u_time: { value: 0.0 },
                u_coreColor: { value: coreColor },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthTest: false,
            depthWrite: false,
            toneMapped: false,
        });

        this.sparkMesh = new THREE.Mesh(this.sparkGeometry, this.sparkMaterial);
        this.sparkMesh.frustumCulled = false;
        this.group.add(this.sparkMesh);

        this.setQuality(flareQuality);
        this.scheduleNextEvent(0);
    }

    setQuality(quality: FlareQuality): void {
        this.flareQuality = quality;
        this.arcMesh.visible = quality === 'High' || quality === 'Ultra';
        this.glowMesh.visible = quality !== 'Off';
        this.sparkMesh.visible = quality === 'Ultra';
        const animStrength = quality === 'Low' ? 0.3 : quality === 'High' ? 0.75 : quality === 'Ultra' ? 1.0 : 0.0;
        this.arcMaterial.uniforms.u_animStrength.value = animStrength;
        this.glowMaterial.uniforms.u_animStrength.value = animStrength;
        const cap = this.maxActiveForQuality();
        if (this.events.length > cap) {
            this.events.splice(0, this.events.length - cap);
            this.syncBuffers();
        }
    }

    setFlareRate(rate: number): void {
        this.flareRate = Math.max(0, rate);
    }

    update(simTime: number): void {
        this.arcMaterial.uniforms.u_time.value = simTime;
        this.glowMaterial.uniforms.u_time.value = simTime;
        this.sparkMaterial.uniforms.u_time.value = simTime;

        if (this.flareQuality === 'Off') {
            return;
        }

        let guard = 0;
        while (simTime >= this.nextEventTime && guard < 6) {
            this.spawnEvent(this.nextEventTime);
            guard++;
        }

        const before = this.events.length;
        this.events = this.events.filter((e) => simTime <= e.start + e.duration);
        if (this.events.length !== before) {
            this.syncBuffers();
        }
    }

    dispose(): void {
        this.arcGeometry.dispose();
        this.glowGeometry.dispose();
        this.sparkGeometry.dispose();
        this.arcMaterial.dispose();
        this.glowMaterial.dispose();
        this.sparkMaterial.dispose();
    }

    private maxActiveForQuality(): number {
        if (this.flareQuality === 'Off') return 0;
        if (this.flareQuality === 'Low') return 2;
        if (this.flareQuality === 'High') return 5;
        if (this.flareQuality === 'Ultra') return 8;
        return 0;
    }

    private effectiveRate(): number {
        if (this.flareQuality === 'Off') return 0;
        const baseline = this.flareQuality === 'Low'
            ? 1 / 260
            : this.flareQuality === 'High'
                ? 1 / 150
                : 1 / 95;
        // TEMP TEST TUNING: 10x flare frequency for quick visual validation
        return Math.min(0.8, (baseline + this.flareRate * 90.0) * 10.0);
    }

    private spawnEvent(startTime: number): void {
        const cap = this.maxActiveForQuality();
        if (cap <= 0) {
            this.scheduleNextEvent(startTime);
            return;
        }

        const eventId = this.nextEventId++;
        const energy = 0.45 + 1.85 * Math.pow(hashUnit(this.seed, eventId, 1), 1.35);
        const durationBase = this.flareQuality === 'Low' ? 42 : this.flareQuality === 'High' ? 34 : 28;
        const duration = durationBase * (0.65 + 0.9 * hashUnit(this.seed, eventId, 2));

        const lat = (hashUnit(this.seed, eventId, 3) * 2 - 1) * 0.9;
        const lon = hashUnit(this.seed, eventId, 4) * Math.PI * 2;
        const size = 0.16 + 0.46 * energy;
        const phase = hashUnit(this.seed, eventId, 5);

        const event: FlareEvent = {
            id: eventId,
            start: startTime,
            duration,
            energy,
            lat,
            lon,
            size,
            phase,
        };

        if (this.events.length >= cap) {
            this.events.shift();
        }
        this.events.push(event);
        this.syncBuffers();
        this.scheduleNextEvent(startTime);
    }

    private scheduleNextEvent(fromTime: number): void {
        const rate = this.effectiveRate();
        if (rate <= 0) {
            this.nextEventTime = Number.POSITIVE_INFINITY;
            return;
        }
        const u = Math.max(1e-6, 1 - hashUnit(this.seed, this.nextEventId, 9));
        const dt = -Math.log(u) / rate;
        this.nextEventTime = fromTime + dt;
    }

    private syncBuffers(): void {
        const cap = this.maxActiveForQuality();
        const count = Math.min(this.events.length, cap);

        for (let i = 0; i < count; i++) {
            const ev = this.events[this.events.length - count + i];
            const n = latLonToNormal(ev.lat, ev.lon);

            this.arcAnchor[i * 3] = n.x;
            this.arcAnchor[i * 3 + 1] = n.y;
            this.arcAnchor[i * 3 + 2] = n.z;
            this.arcTiming[i * 4] = ev.start;
            this.arcTiming[i * 4 + 1] = ev.duration;
            this.arcTiming[i * 4 + 2] = ev.energy;
            this.arcTiming[i * 4 + 3] = ev.id;
            this.arcShape[i * 4] = ev.size;
            this.arcShape[i * 4 + 1] = ev.size * 0.55;
            this.arcShape[i * 4 + 2] = ev.size * 0.18;
            this.arcShape[i * 4 + 3] = 0;
            this.arcPhase[i] = ev.phase;

            this.glowAnchor[i * 3] = n.x;
            this.glowAnchor[i * 3 + 1] = n.y;
            this.glowAnchor[i * 3 + 2] = n.z;
            this.glowTiming[i * 4] = ev.start;
            this.glowTiming[i * 4 + 1] = ev.duration;
            this.glowTiming[i * 4 + 2] = ev.energy;
            this.glowTiming[i * 4 + 3] = ev.id;
            this.glowShape[i * 4] = ev.size;
            this.glowShape[i * 4 + 1] = ev.size;
            this.glowShape[i * 4 + 2] = ev.size;
            this.glowShape[i * 4 + 3] = 0;
            this.glowPhase[i] = ev.phase;
        }

        const arcAnchorAttr = this.arcGeometry.getAttribute('a_anchor') as THREE.InstancedBufferAttribute;
        const arcTimingAttr = this.arcGeometry.getAttribute('a_timing') as THREE.InstancedBufferAttribute;
        const arcShapeAttr = this.arcGeometry.getAttribute('a_shape') as THREE.InstancedBufferAttribute;
        const arcPhaseAttr = this.arcGeometry.getAttribute('a_phase') as THREE.InstancedBufferAttribute;
        arcAnchorAttr.needsUpdate = true;
        arcTimingAttr.needsUpdate = true;
        arcShapeAttr.needsUpdate = true;
        arcPhaseAttr.needsUpdate = true;
        this.arcGeometry.instanceCount = count;

        const glowAnchorAttr = this.glowGeometry.getAttribute('a_anchor') as THREE.InstancedBufferAttribute;
        const glowTimingAttr = this.glowGeometry.getAttribute('a_timing') as THREE.InstancedBufferAttribute;
        const glowShapeAttr = this.glowGeometry.getAttribute('a_shape') as THREE.InstancedBufferAttribute;
        const glowPhaseAttr = this.glowGeometry.getAttribute('a_phase') as THREE.InstancedBufferAttribute;
        glowAnchorAttr.needsUpdate = true;
        glowTimingAttr.needsUpdate = true;
        glowShapeAttr.needsUpdate = true;
        glowPhaseAttr.needsUpdate = true;
        this.glowGeometry.instanceCount = count;

        if (this.flareQuality === 'Ultra') {
            let sparkIndex = 0;
            for (let i = 0; i < count; i++) {
                const ev = this.events[this.events.length - count + i];
                const n = latLonToNormal(ev.lat, ev.lon);
                for (let s = 0; s < this.sparksPerFlare; s++) {
                    const idx = sparkIndex;
                    const r1 = hashUnit(this.seed, ev.id, 20 + s * 3);
                    const r2 = hashUnit(this.seed, ev.id, 21 + s * 3);
                    const r3 = hashUnit(this.seed, ev.id, 22 + s * 3);

                    const ref = Math.abs(n.y) < 0.95 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
                    const t = ref.clone().cross(n).normalize();
                    const b = n.clone().cross(t).normalize();
                    const ang = r1 * Math.PI * 2;
                    const spread = 0.25 + 0.6 * r2;
                    const vel = n.clone().multiplyScalar(0.8 + 0.8 * r3)
                        .add(t.clone().multiplyScalar(Math.cos(ang) * spread))
                        .add(b.clone().multiplyScalar(Math.sin(ang) * spread))
                        .normalize();

                    this.sparkAnchor[idx * 3] = n.x;
                    this.sparkAnchor[idx * 3 + 1] = n.y;
                    this.sparkAnchor[idx * 3 + 2] = n.z;
                    this.sparkTiming[idx * 4] = ev.start;
                    this.sparkTiming[idx * 4 + 1] = ev.duration;
                    this.sparkTiming[idx * 4 + 2] = ev.energy;
                    this.sparkTiming[idx * 4 + 3] = ev.id;
                    this.sparkVelocity[idx * 3] = vel.x;
                    this.sparkVelocity[idx * 3 + 1] = vel.y;
                    this.sparkVelocity[idx * 3 + 2] = vel.z;
                    this.sparkSize[idx] = 0.06 + 0.08 * hashUnit(this.seed, ev.id, 50 + s);
                    sparkIndex++;
                }
            }

            const sparkAnchorAttr = this.sparkGeometry.getAttribute('a_anchor') as THREE.InstancedBufferAttribute;
            const sparkTimingAttr = this.sparkGeometry.getAttribute('a_timing') as THREE.InstancedBufferAttribute;
            const sparkVelAttr = this.sparkGeometry.getAttribute('a_velocity') as THREE.InstancedBufferAttribute;
            const sparkSizeAttr = this.sparkGeometry.getAttribute('a_size') as THREE.InstancedBufferAttribute;
            sparkAnchorAttr.needsUpdate = true;
            sparkTimingAttr.needsUpdate = true;
            sparkVelAttr.needsUpdate = true;
            sparkSizeAttr.needsUpdate = true;
            this.sparkGeometry.instanceCount = sparkIndex;
        } else {
            this.sparkGeometry.instanceCount = 0;
        }
    }
}



export class BodyRenderer {
    private scene: THREE.Scene;
    private bodies: Map<number, BodyMesh> = new Map();

    // Grid
    private gridGroup: THREE.Group | null = null;
    private gridSpacing = AU;
    private gridSize = 40;
    private gridXYVisible = false;
    private gridXZVisible = false;
    private gridYZVisible = false;

    // Scale settings
    private renderScale = 1;
    private sphereSegments = { width: 64, height: 32 };
    private starRenderOptions: StarRenderOptions = {
        granulationEnabled: true,
        starspotsEnabled: false,
        flareQuality: 'Low',
    };

    // Orbit trails
    private orbitLines: Map<number, THREE.Line> = new Map();
    private orbitHistory: Map<number, Array<{ x: number; y: number; z: number }>> = new Map();
    private maxTrailPoints = 100; // Default 100 points, configurable via setMaxTrailPoints
    private readonly TRAIL_SAMPLE_INTERVAL = 5; // Sample every N frames
    private frameCount = 0;
    private lastOrigin = { x: 0, y: 0, z: 0 };

    // Debug overlays
    private axisLines: Map<number, THREE.ArrowHelper> = new Map();
    private showAxisLinesFlag = false;
    private refPlanes: Map<number, THREE.Mesh> = new Map();
    private showRefPlaneFlag = false;
    private refLines: Map<number, THREE.Line> = new Map();
    private showRefLineFlag = false;
    private refPoints: Map<number, THREE.Mesh> = new Map();
    private showRefPointFlag = false;

    // Ghost preview for world builder
    private ghostMesh: THREE.Mesh | null = null;
    private ghostVisible = false;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    setRenderScale(scale: number): void {
        if (!Number.isFinite(scale) || scale <= 0) return;
        this.renderScale = scale;
        this.updateBodySizes();
    }

    setStarRenderOptions(options: Partial<StarRenderOptions>): void {
        const nextGranulationEnabled =
            typeof options.granulationEnabled === 'boolean'
                ? options.granulationEnabled
                : this.starRenderOptions.granulationEnabled;

        const nextStarspotsEnabled =
            typeof options.starspotsEnabled === 'boolean'
                ? options.starspotsEnabled
                : this.starRenderOptions.starspotsEnabled;

        const nextFlareQuality =
            options.flareQuality === 'Off' || options.flareQuality === 'Low' || options.flareQuality === 'High' || options.flareQuality === 'Ultra'
                ? options.flareQuality
                : this.starRenderOptions.flareQuality;

        if (
            nextGranulationEnabled === this.starRenderOptions.granulationEnabled &&
            nextStarspotsEnabled === this.starRenderOptions.starspotsEnabled &&
            nextFlareQuality === this.starRenderOptions.flareQuality
        ) {
            return;
        }

        this.starRenderOptions.granulationEnabled = nextGranulationEnabled;
        this.starRenderOptions.starspotsEnabled = nextStarspotsEnabled;
        this.starRenderOptions.flareQuality = nextFlareQuality;
        for (const mesh of this.bodies.values()) {
            mesh.setGranulationEnabled(nextGranulationEnabled);
            mesh.setStarspotsEnabled(nextStarspotsEnabled);
            mesh.setFlareQuality(nextFlareQuality);
        }
    }

    private updateBodySizes(): void {
        for (const [_, mesh] of this.bodies) {
            const newRadius = scaleRadius(mesh.realRadius * this.renderScale);
            mesh.setScale(newRadius);
        }
    }

    addBody(body: BodyData): void {
        const mesh = new BodyMesh(
            body,
            this.sphereSegments.width,
            this.sphereSegments.height,
            this.starRenderOptions,
        );
        this.bodies.set(body.id, mesh);
        this.scene.add(mesh.group);

        // Apply current scale settings to new body
        const radius = scaleRadius(body.radius * this.renderScale);
        mesh.setScale(radius);

        // F5: Physically-based point light for stars — tinted to blackbody, intensity from luminosity
        if (body.type === 'star') {
            const teff = body.effectiveTemperature ?? 5778;
            const [lr, lg, lb] = blackbodyToRGBNorm(teff > 0 ? teff : 5778);
            const lightColor = new THREE.Color(lr, lg, lb);
            // Intensity proportional to luminosity (log scale, clamped)
            const lum = body.luminosity ?? 1;
            const intensity = Math.min(10, Math.max(0.5, 1.5 + Math.log10(Math.max(lum, 0.001))));
            const light = new THREE.PointLight(lightColor, intensity, 0, 0);
            mesh.group.add(light);
        }

        // Initialize orbit trail for non-stars
        if (body.type !== 'star') {
            this.orbitHistory.set(body.id, []);

            // Create orbit line
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(2000 * 3); // Max allocation for trail buffer
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setDrawRange(0, 0);

            const material = new THREE.LineBasicMaterial({
                color: body.color || 0x4488ff,
                transparent: true,
                opacity: 0.4,
            });

            const line = new THREE.Line(geometry, material);
            this.orbitLines.set(body.id, line);
            this.scene.add(line);
        }

        // Create text label sprite
        const label = this.createLabelSprite(body.name);
        label.visible = this.showLabels;
        this.bodyLabels.set(body.id, label);
        this.scene.add(label);

        // Create rotation axis arrow overlay
        const tilt = body.axialTilt ?? 0;
        const axisDir = new THREE.Vector3(
            -Math.sin(tilt),
            Math.cos(tilt),
            0
        ).normalize();
        const bodyVisRadius = scaleRadius(body.radius * this.renderScale);
        const axisLength = bodyVisRadius * 3;
        const axisColor = body.type === 'star' ? 0xffaa00 : 0x44ddff;
        const arrow = new THREE.ArrowHelper(
            axisDir,
            new THREE.Vector3(0, 0, 0),
            axisLength,
            axisColor,
            axisLength * 0.2,
            axisLength * 0.1
        );
        arrow.visible = this.showAxisLinesFlag;
        mesh.group.add(arrow);
        this.axisLines.set(body.id, arrow);

        // Create per-body equatorial reference plane (disc perpendicular to tilt axis)
        const planeRadius = bodyVisRadius * 2;
        const planeGeo = new THREE.RingGeometry(bodyVisRadius * 0.1, planeRadius, 48);
        const planeMat = new THREE.MeshBasicMaterial({
            color: 0x4488cc,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        const planeMesh = new THREE.Mesh(planeGeo, planeMat);
        // Orient disc perpendicular to the tilt axis:
        // Default RingGeometry is in XY plane (normal = +Z).
        // We want the normal to be the axis direction.
        const upZ = new THREE.Vector3(0, 0, 1);
        const quat = new THREE.Quaternion().setFromUnitVectors(upZ, axisDir);
        planeMesh.quaternion.copy(quat);
        planeMesh.visible = this.showRefPlaneFlag;
        mesh.group.add(planeMesh);
        this.refPlanes.set(body.id, planeMesh);

        // Create per-body pole-to-pole meridian arc (on surface)
        // We need an equator direction first (reused for ref point below)
        const equatorDir = new THREE.Vector3(0, 0, 1).cross(axisDir);
        if (equatorDir.lengthSq() < 0.001) {
            equatorDir.set(1, 0, 0).cross(axisDir);
        }
        equatorDir.normalize();
        const surfaceR = bodyVisRadius;
        const meridianSegments = 32;
        const meridianPoints: THREE.Vector3[] = [];
        for (let s = 0; s <= meridianSegments; s++) {
            // Sweep from south pole (θ=π) to north pole (θ=0)
            const theta = Math.PI * (1 - s / meridianSegments);
            const sinT = Math.sin(theta);
            const cosT = Math.cos(theta);
            // Point on sphere: cosT * axis + sinT * equatorDir
            meridianPoints.push(
                axisDir.clone().multiplyScalar(cosT * surfaceR)
                    .add(equatorDir.clone().multiplyScalar(sinT * surfaceR))
            );
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(meridianPoints);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xff6644 });
        const refLine = new THREE.Line(lineGeo, lineMat);
        refLine.visible = this.showRefLineFlag;
        mesh.group.add(refLine);
        this.refLines.set(body.id, refLine);

        // Create per-body equator reference point (reuses equatorDir from meridian arc)
        const dotRadius = bodyVisRadius * 0.08;
        const dotGeo = new THREE.SphereGeometry(dotRadius, 8, 6);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        const dot = new THREE.Mesh(dotGeo, dotMat);
        // equatorDir was normalized then mutated by multiplyScalar above, so re-normalize
        equatorDir.normalize();
        dot.position.copy(equatorDir.clone().multiplyScalar(surfaceR));
        dot.visible = this.showRefPointFlag;
        mesh.group.add(dot);
        this.refPoints.set(body.id, dot);
    }

    setSphereSegments(width: number, height: number): void {
        const clampedWidth = Math.max(8, Math.round(width));
        const clampedHeight = Math.max(6, Math.round(height));
        if (clampedWidth === this.sphereSegments.width && clampedHeight === this.sphereSegments.height) {
            return;
        }
        this.sphereSegments = { width: clampedWidth, height: clampedHeight };
        for (const mesh of this.bodies.values()) {
            mesh.setSegments(clampedWidth, clampedHeight);
        }
    }

    private createLabelSprite(text: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 512;
        canvas.height = 128;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Measure text first
        ctx.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;

        // Draw pill-shaped background
        const padding = 24;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = 56;
        const x = (canvas.width - bgWidth) / 2;
        const y = (canvas.height - bgHeight) / 2;
        const radius = bgHeight / 2;

        ctx.beginPath();
        ctx.roundRect(x, y, bgWidth, bgHeight, radius);
        ctx.fillStyle = 'rgba(10, 20, 40, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text with subtle shadow
        ctx.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillText(text, canvas.width / 2 + 1, canvas.height / 2 + 1);

        // Main text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            sizeAttenuation: true,
        });
        const sprite = new THREE.Sprite(material);
        // Store default scale to be adjusted per body later
        sprite.scale.set(AU * 0.12, AU * 0.03, 1);
        return sprite;
    }

    removeBody(id: number): void {
        const mesh = this.bodies.get(id);
        if (mesh) {
            this.scene.remove(mesh.group);
            mesh.dispose();
            this.bodies.delete(id);
        }

        const orbit = this.orbitLines.get(id);
        if (orbit) {
            this.scene.remove(orbit);
            orbit.geometry.dispose();
            (orbit.material as THREE.Material).dispose();
            this.orbitLines.delete(id);
        }

        this.orbitHistory.delete(id);

        const label = this.bodyLabels.get(id);
        if (label) {
            this.scene.remove(label);
            (label.material as THREE.SpriteMaterial).map?.dispose();
            label.material.dispose();
            this.bodyLabels.delete(id);
        }
    }

    /** Update body positions using floating origin */
    update(positions: Float64Array, origin: { x: number; y: number; z: number }): void {
        this.frameCount++;
        const shouldSample = this.frameCount % this.TRAIL_SAMPLE_INTERVAL === 0;
        this.lastOrigin = origin;

        if (this.gridGroup) {
            this.gridGroup.position.set(-origin.x, -origin.y, -origin.z);
        }

        let i = 0;
        for (const [id, mesh] of this.bodies) {
            if (i * 3 + 2 < positions.length) {
                const worldX = positions[i * 3];
                const worldY = positions[i * 3 + 1];
                const worldZ = positions[i * 3 + 2];

                // Apply floating origin - shift all positions relative to camera origin
                const localX = worldX - origin.x;
                const localY = worldY - origin.y;
                const localZ = worldZ - origin.z;

                mesh.group.position.set(localX, localY, localZ);

                // Update label position (offset above body)
                const label = this.bodyLabels.get(id);
                if (label) {
                    // Scale label based on body visual radius for better proportions
                    const bodyMesh = this.bodies.get(id);
                    const bodyVisRadius = bodyMesh ? scaleRadius(bodyMesh.realRadius * this.renderScale) : AU * 0.01;
                    const labelOffset = Math.max(bodyVisRadius * 1.5, AU * 0.002);
                    const labelScale = Math.max(bodyVisRadius * 0.5, AU * 0.01);
                    label.scale.set(labelScale, labelScale * 0.25, 1);
                    label.position.set(localX, localY + labelOffset, localZ);
                }

                // Update orbit trail
                if (shouldSample && this.orbitHistory.has(id)) {
                    const history = this.orbitHistory.get(id)!;
                    history.push({ x: worldX, y: worldY, z: worldZ });

                    // Remove oldest points when exceeding limit (one at a time)
                    while (history.length > this.maxTrailPoints) {
                        history.shift();
                    }

                    // Update orbit line geometry
                    this.updateOrbitLine(id, history, origin);
                }
            }
            i++;
        }
    }

    private updateOrbitLine(id: number, history: Array<{ x: number; y: number; z: number }>, origin: { x: number; y: number; z: number }): void {
        const line = this.orbitLines.get(id);
        if (!line) return;

        const positions = line.geometry.attributes.position as THREE.BufferAttribute;
        const arr = positions.array as Float32Array;
        const count = Math.min(history.length, this.maxTrailPoints);

        if (count < 2) {
            line.geometry.setDrawRange(0, 0);
            return;
        }

        for (let i = 0; i < count; i++) {
            arr[i * 3] = history[i].x - origin.x;
            arr[i * 3 + 1] = history[i].y - origin.y;
            arr[i * 3 + 2] = history[i].z - origin.z;
        }

        positions.needsUpdate = true;
        line.geometry.setDrawRange(0, count);
        line.geometry.computeBoundingSphere();
    }

    // Visualization options
    private showOrbitTrails = true;
    private showLabels = false;
    private bodyLabels: Map<number, THREE.Sprite> = new Map();

    setShowAxisLines(show: boolean): void {
        this.showAxisLinesFlag = show;
        for (const arrow of this.axisLines.values()) {
            arrow.visible = show;
        }
    }

    setShowRefPlane(show: boolean): void {
        this.showRefPlaneFlag = show;
        for (const plane of this.refPlanes.values()) {
            plane.visible = show;
        }
    }

    setShowRefLine(show: boolean): void {
        this.showRefLineFlag = show;
        for (const line of this.refLines.values()) {
            line.visible = show;
        }
    }

    setShowRefPoint(show: boolean): void {
        this.showRefPointFlag = show;
        for (const dot of this.refPoints.values()) {
            dot.visible = show;
        }
    }

    setShowOrbitTrails(show: boolean): void {
        this.showOrbitTrails = show;
        for (const line of this.orbitLines.values()) {
            line.visible = show;
        }
    }

    setShowLabels(show: boolean): void {
        this.showLabels = show;
        for (const label of this.bodyLabels.values()) {
            label.visible = show;
        }
    }

    setMaxTrailPoints(points: number): void {
        const capped = Math.max(2, Math.min(points, 2000));
        this.maxTrailPoints = capped;
        // Trim existing histories if needed (keep newest points)
        for (const [id, history] of this.orbitHistory) {
            if (history.length > capped) {
                // Replace with only the newest points
                const trimmed = history.slice(-capped);
                history.length = 0;
                history.push(...trimmed);
            }
            this.updateOrbitLine(id, history, this.lastOrigin);
        }
    }

    setGridOptions(showXY: boolean, showXZ: boolean, showYZ: boolean, spacing: number, size: number): void {
        this.gridXYVisible = showXY;
        this.gridXZVisible = showXZ;
        this.gridYZVisible = showYZ;
        this.gridSpacing = Math.max(spacing, 1.0);
        this.gridSize = Math.max(1, Math.round(size));
        this.rebuildGrid();
    }

    pickBodyId(raycaster: THREE.Raycaster): number | null {
        const meshes: THREE.Object3D[] = [];
        for (const mesh of this.bodies.values()) {
            meshes.push(mesh.getPickMesh());
        }
        if (meshes.length === 0) return null;
        const hits = raycaster.intersectObjects(meshes, false);
        if (hits.length === 0) return null;
        const hit = hits[0].object as THREE.Mesh;
        const id = hit.userData.bodyId;
        return typeof id === 'number' ? id : null;
    }

    /** Update body rotations based on simulation time */
    updateBodies(simTime: number): void {
        for (const mesh of this.bodies.values()) {
            mesh.updateRotation(simTime);
        }
    }

    // ===== Ghost Preview Methods (World Builder) =====

    /**
     * Create or update the ghost preview body.
     * @param radius Physical radius in meters
     * @param color Hex color
     * @param type Body type string for material selection
     */
    setGhostPreview(radius: number, color: number, type: string): void {
        // Scale radius using same function as real bodies
        const visualRadius = scaleRadius(radius * this.renderScale);

        if (!this.ghostMesh) {
            // Create ghost mesh
            const geometry = new THREE.SphereGeometry(1, 32, 16);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                wireframe: type === 'spacecraft',
            });
            this.ghostMesh = new THREE.Mesh(geometry, material);
            this.ghostMesh.visible = false;
            this.scene.add(this.ghostMesh);
        }

        // Update ghost appearance
        const material = this.ghostMesh.material as THREE.MeshBasicMaterial;
        material.color.setHex(color);
        material.wireframe = type === 'spacecraft';
        this.ghostMesh.scale.setScalar(visualRadius);
    }

    /**
     * Update ghost preview position (world coordinates).
     * Position is camera-relative for floating origin.
     */
    updateGhostPosition(localX: number, localY: number, localZ: number): void {
        if (this.ghostMesh) {
            this.ghostMesh.position.set(localX, localY, localZ);
        }
    }

    /**
     * Show or hide the ghost preview.
     */
    setGhostVisible(visible: boolean): void {
        this.ghostVisible = visible;
        if (this.ghostMesh) {
            this.ghostMesh.visible = visible;
        }
    }

    /**
     * Get current ghost visibility state.
     */
    isGhostVisible(): boolean {
        return this.ghostVisible;
    }

    /**
     * Remove ghost preview.
     */
    removeGhost(): void {
        if (this.ghostMesh) {
            this.scene.remove(this.ghostMesh);
            this.ghostMesh.geometry.dispose();
            (this.ghostMesh.material as THREE.Material).dispose();
            this.ghostMesh = null;
        }
        this.ghostVisible = false;
    }

    dispose(): void {
        for (const mesh of this.bodies.values()) {
            this.scene.remove(mesh.group);
            mesh.dispose();
        }
        this.bodies.clear();

        for (const orbit of this.orbitLines.values()) {
            this.scene.remove(orbit);
            orbit.geometry.dispose();
            (orbit.material as THREE.Material).dispose();
        }
        this.orbitLines.clear();
        this.orbitHistory.clear();

        for (const label of this.bodyLabels.values()) {
            this.scene.remove(label);
            (label.material as THREE.SpriteMaterial).map?.dispose();
            label.material.dispose();
        }
        this.bodyLabels.clear();
        this.axisLines.clear();
        this.refPlanes.clear();
        this.refLines.clear();
        this.refPoints.clear();

        // Clean up ghost preview
        this.removeGhost();

        if (this.gridGroup) {
            this.scene.remove(this.gridGroup);
            this.disposeGrid(this.gridGroup);
            this.gridGroup = null;
        }
    }

    private rebuildGrid(): void {
        if (this.gridGroup) {
            this.scene.remove(this.gridGroup);
            this.disposeGrid(this.gridGroup);
            this.gridGroup = null;
        }

        if (!this.gridXYVisible && !this.gridXZVisible && !this.gridYZVisible) {
            return;
        }

        this.gridGroup = new THREE.Group();
        const material = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
        });

        const divisions = Math.max(2, this.gridSize * 2);
        const size = divisions * this.gridSpacing;

        if (this.gridXZVisible) {
            const gridXZ = new THREE.GridHelper(size, divisions, 0xffffff, 0xffffff);
            gridXZ.material = material;
            this.gridGroup.add(gridXZ);
        }

        if (this.gridXYVisible) {
            const gridXY = new THREE.GridHelper(size, divisions, 0xffffff, 0xffffff);
            gridXY.material = material;
            gridXY.rotation.x = Math.PI / 2;
            this.gridGroup.add(gridXY);
        }

        if (this.gridYZVisible) {
            const gridYZ = new THREE.GridHelper(size, divisions, 0xffffff, 0xffffff);
            gridYZ.material = material;
            gridYZ.rotation.z = Math.PI / 2;
            this.gridGroup.add(gridYZ);
        }

        this.scene.add(this.gridGroup);
    }

    private disposeGrid(group: THREE.Group): void {
        for (const child of group.children) {
            if (child instanceof THREE.LineSegments || child instanceof THREE.Line) {
                child.geometry.dispose();
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        }
    }
}

class BodyMesh {
    group: THREE.Group;
    private mesh: THREE.Mesh;
    private geometry: THREE.SphereGeometry;
    private material: THREE.Material;
    private atmosphereMesh: THREE.Mesh | null = null;
    private starMaterial: THREE.ShaderMaterial | null = null;
    private granulationTexture: THREE.Texture | null = null;
    private flareSystem: StarFlareSystem | null = null;

    // Expose for dynamic rescaling
    readonly realRadius: number;
    readonly type: string;
    private oblateness = 0;

    // Body rotation
    private rotationRate = 0;
    private spinAxis: THREE.Vector3 | null = null;

    constructor(
        body: BodyData,
        segmentsWidth: number,
        segmentsHeight: number,
        starOptions: StarRenderOptions,
    ) {
        this.realRadius = body.radius;
        this.type = body.type;
        this.oblateness = body.oblateness ?? 0;

        this.group = new THREE.Group();
        this.group.name = body.name;

        // Store rotation data for all body types
        this.rotationRate = body.rotationRate ?? 0;
        const tilt = body.axialTilt ?? 0;
        if (this.rotationRate !== 0) {
            this.spinAxis = new THREE.Vector3(
                -Math.sin(tilt),
                Math.cos(tilt),
                0,
            ).normalize();
        }

        // Create sphere geometry - initially at default scale (will be set by renderer)
        const initialRadius = 1; // Placeholder, will be scaled
        this.geometry = new THREE.SphereGeometry(initialRadius, segmentsWidth, segmentsHeight);

        // Create material based on body type
        if (body.type === 'star') {
            const teff = body.effectiveTemperature ?? 5778;
            const [r, g, b] = blackbodyToRGBNorm(teff > 0 ? teff : 5778);
            const [limbA, limbB] = body.limbDarkeningCoeffs ?? [0.6, 0.0];
            const seed = (body.seed ?? body.id) | 0;
            this.granulationTexture = createGranulationTexture(seed === 0 ? 1 : seed);
            const spotFraction = Math.max(0, Math.min(0.3, body.spotFraction ?? 0));

            this.material = new THREE.ShaderMaterial({
                vertexShader: STAR_VERTEX,
                fragmentShader: STAR_FRAGMENT,
                uniforms: {
                    u_color: { value: new THREE.Vector3(r, g, b) },
                    u_limbA: { value: limbA },
                    u_limbB: { value: limbB },
                    u_granulationMap: { value: this.granulationTexture },
                    u_granulationStrength: { value: starOptions.granulationEnabled ? 1.0 : 0.0 },
                    u_time: { value: 0.0 },
                    u_spotFraction: { value: spotFraction },
                    u_spotEnabled: { value: starOptions.starspotsEnabled ? 1.0 : 0.0 },
                    u_spotSeed: { value: seed === 0 ? 1 : seed },
                },
            });
            this.starMaterial = this.material as THREE.ShaderMaterial;

            // D7: Visual-only deterministic flare system (quality-driven)
            this.flareSystem = new StarFlareSystem(
                seed,
                body.flareRate ?? 0,
                teff,
                starOptions.flareQuality,
            );
        } else {
            // F4: Physics-derived planet surface color as fallback
            const color = body.color || this.deriveColorFromPhysics(body);
            this.material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.8,
                metalness: 0.1,
            });
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.userData.bodyId = body.id;
        this.group.add(this.mesh);

        if (this.flareSystem) {
            // Attach to the scaled star mesh so flare placement tracks stellar radius
            this.mesh.add(this.flareSystem.group);
        }

        // Add glow effect for stars — tinted to blackbody color (D3)
        if (body.type === 'star') {
            const teff = body.effectiveTemperature ?? 5778;
            const [cr, cg, cb] = blackbodyToRGBNorm(teff > 0 ? teff : 5778);
            const bbHex = ((Math.round(cr * 255) & 0xff) << 16) |
                          ((Math.round(cg * 255) & 0xff) << 8)  |
                           (Math.round(cb * 255) & 0xff);
            const luminosity = body.luminosity ?? 1;
            this.addStarGlow(bbHex, luminosity);
        }

        // F3: Atmosphere shell for bodies with atmosphere data
        if (body.atmosphere && body.atmosphere.height > 0) {
            this.addAtmosphereShell(body, segmentsWidth, segmentsHeight);
        }
    }

    /** F3: Add atmosphere glow shell */
    private addAtmosphereShell(body: BodyData, segW: number, segH: number): void {
        const atm = body.atmosphere!;

        // Rayleigh coefficients → normalized visible color [0,1]
        const rc = atm.rayleighCoefficients;
        const maxR = Math.max(rc[0], rc[1], rc[2], 1e-10);
        const rayleighColor = new THREE.Vector3(rc[0] / maxR, rc[1] / maxR, rc[2] / maxR);

        // Mie scattering color from dust/haze composition
        const mc = atm.mieColor ?? [1, 1, 1];
        const mieColor = new THREE.Vector3(mc[0], mc[1], mc[2]);

        // Weight: how much Mie dominates vs Rayleigh
        // Uses ratio of mie coefficient to average Rayleigh coefficient
        const avgRayleigh = (rc[0] + rc[1] + rc[2]) / 3;
        const mieWeight = atm.mieCoefficient / (atm.mieCoefficient + avgRayleigh + 1e-15);

        // Intensity based on atmosphere thickness relative to body size
        const relHeight = atm.height / body.radius;
        const intensity = Math.min(1.0, 0.4 + relHeight * 2.0);

        const atmoGeo = new THREE.SphereGeometry(1, segW, segH);
        const atmoMat = new THREE.ShaderMaterial({
            vertexShader: ATMO_VERTEX,
            fragmentShader: ATMO_FRAGMENT,
            uniforms: {
                u_rayleighColor: { value: rayleighColor },
                u_mieColor:      { value: mieColor },
                u_mieWeight:     { value: mieWeight },
                u_intensity:     { value: intensity },
            },
            transparent: true,
            side: THREE.BackSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
        // Scale will be set in setScale — atmosphere is slightly larger than body
        this.atmosphereMesh.userData.atmosphereScale = 1 + relHeight;
        this.group.add(this.atmosphereMesh);
    }

    /** F4: Derive a reasonable surface color from physics when no named color exists */
    private deriveColorFromPhysics(body: BodyData): number {
        const comp = body.composition ?? 'Rocky';
        const albedo = body.albedo ?? 0.3;
        const a = Math.max(0.15, Math.min(0.95, albedo));
        switch (comp) {
            case 'GasGiant': {
                const r = Math.round(180 * a + 40);
                const g = Math.round(140 * a + 30);
                const b = Math.round(80 * a + 20);
                return (r << 16) | (g << 8) | b;
            }
            case 'IceGiant': {
                const r = Math.round(80 * a + 30);
                const g = Math.round(160 * a + 40);
                const b = Math.round(200 * a + 40);
                return (r << 16) | (g << 8) | b;
            }
            case 'Dwarf': {
                const v = Math.round(180 * a + 40);
                return (v << 16) | (v << 8) | v;
            }
            default: {
                const r = Math.round(140 * a + 40);
                const g = Math.round(120 * a + 35);
                const b = Math.round(100 * a + 30);
                return (r << 16) | (g << 8) | b;
            }
        }
    }

    /** Rotate entire body group (mesh + overlays) based on cumulative simulation time (D4) */
    updateRotation(simTime: number): void {
        if (this.starMaterial?.uniforms.u_time) {
            this.starMaterial.uniforms.u_time.value = simTime;
        }

        this.flareSystem?.update(simTime);

        if (!this.spinAxis || this.rotationRate === 0) return;
        const angle = this.rotationRate * simTime;
        const q = new THREE.Quaternion().setFromAxisAngle(this.spinAxis, angle);
        this.group.quaternion.copy(q);
    }

    setGranulationEnabled(enabled: boolean): void {
        if (this.starMaterial?.uniforms.u_granulationStrength) {
            this.starMaterial.uniforms.u_granulationStrength.value = enabled ? 1.0 : 0.0;
        }
    }

    setStarspotsEnabled(enabled: boolean): void {
        if (this.starMaterial?.uniforms.u_spotEnabled) {
            this.starMaterial.uniforms.u_spotEnabled.value = enabled ? 1.0 : 0.0;
        }
    }

    setFlareQuality(quality: FlareQuality): void {
        this.flareSystem?.setQuality(quality);
    }

    setScale(radius: number): void {
        // F2: Apply oblateness — compress along local Y (pole axis)
        if (this.oblateness > 0.001) {
            this.mesh.scale.set(radius, radius * (1 - this.oblateness), radius);
        } else {
            this.mesh.scale.setScalar(radius);
        }

        // Scale atmosphere shell if present
        if (this.atmosphereMesh) {
            const atmoRatio = this.atmosphereMesh.userData.atmosphereScale as number;
            const atmoR = radius * atmoRatio;
            if (this.oblateness > 0.001) {
                this.atmosphereMesh.scale.set(atmoR, atmoR * (1 - this.oblateness), atmoR);
            } else {
                this.atmosphereMesh.scale.setScalar(atmoR);
            }
        }

        // Also scale glow sprites for stars
        for (const child of this.group.children) {
            if (child instanceof THREE.Sprite) {
                child.scale.set(radius * 8, radius * 8, 1);
            }
        }
    }

    setSegments(segmentsWidth: number, segmentsHeight: number): void {
        this.geometry.dispose();
        this.geometry = new THREE.SphereGeometry(1, segmentsWidth, segmentsHeight);
        this.mesh.geometry = this.geometry;
    }

    private addStarGlow(color: number, luminosity: number): void {
        // Glow intensity scales with luminosity (log, clamped)
        const glowOpacity = Math.min(1.0, 0.3 + 0.15 * Math.log10(Math.max(luminosity, 0.01)));

        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            color: color,
            transparent: true,
            opacity: glowOpacity,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1, 1, 1); // Will be scaled by setScale
        this.group.add(sprite);
    }

    private createGlowTexture(): THREE.Texture {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2
        );

        // Neutral white gradient — colour is applied via SpriteMaterial.color
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.85)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    dispose(): void {
        this.geometry.dispose();
        this.material.dispose();
        this.granulationTexture?.dispose();
        this.flareSystem?.dispose();
        if (this.atmosphereMesh) {
            this.atmosphereMesh.geometry.dispose();
            (this.atmosphereMesh.material as THREE.Material).dispose();
        }
    }

    getPickMesh(): THREE.Mesh {
        return this.mesh;
    }
}
