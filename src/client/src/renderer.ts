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
varying vec2 vUv;
void main() {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPos.xyz);
    vUv = uv;
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
uniform float u_spotCoverage;
uniform float u_spotStrengthScale;
uniform float u_spotSeed;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

vec3 hashToUnitVec(float p) {
    float u = hash11(p * 1.37) * 2.0 - 1.0;
    float a = hash11(p * 2.11) * 6.28318530718;
    float s = sqrt(max(0.0, 1.0 - u * u));
    return normalize(vec3(cos(a) * s, u, sin(a) * s));
}

vec3 rotateY(vec3 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

void main() {
    float mu = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
    float limb = 1.0 - u_limbA * (1.0 - mu) - u_limbB * (1.0 - mu) * (1.0 - mu);
    vec2 uv = fract(vUv * 6.0 + vec2(u_time * 0.002, u_time * 0.001));
    float granTex = texture2D(u_granulationMap, uv).r;
    float granulation = mix(1.0, 0.9 + 0.2 * granTex, u_granulationStrength);

    vec3 p = normalize(vNormal);
    float drift = u_time * (0.00012 + 0.00008 * hash11(u_spotSeed + 9.0));
    p = rotateY(p, drift);

    float spotMask = 0.0;
    for (int i = 0; i < 9; i++) {
        float fi = float(i);
        vec3 center = hashToUnitVec(u_spotSeed + fi * 17.0 + 3.0);
        float radius = 0.10 + 0.16 * hash11(u_spotSeed + fi * 23.0 + 11.0);
        float d = distance(p, center);
        float spot = 1.0 - smoothstep(radius * 0.55, radius, d);
        spotMask = max(spotMask, spot);
    }

    // Response curve tuned so Sun-like spot_fraction (~0.01) is visible in Ultra.
    float coverage = clamp(sqrt(max(u_spotCoverage, 0.0) / 0.03), 0.0, 1.0);
    float spotStrength = coverage * u_spotStrengthScale;
    float spotDarkening = mix(1.0, 0.38, spotMask * spotStrength);

    gl_FragColor = vec4(u_color * limb * granulation * spotDarkening, 1.0);
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

interface StarRenderOptions {
    granulationEnabled: boolean;
    spotStrengthScale: number;
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

            const cell = Math.sin(gx * 80.0) * Math.sin(gy * 80.0);
            const swirl = Math.sin((gx * 27.0 + gy * 19.0) * 6.28318 + random() * 3.14159);
            const noise = random() * 2.0 - 1.0;
            const v = Math.max(0, Math.min(255, Math.round(128 + 50 * cell + 36 * swirl + 22 * noise)));

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
    private starRenderOptions: StarRenderOptions = { granulationEnabled: true, spotStrengthScale: 1 };

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

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    setRenderScale(scale: number): void {
        if (!Number.isFinite(scale) || scale <= 0) return;
        this.renderScale = scale;
        this.updateBodySizes();
    }

    setStarRenderOptions(options: Partial<StarRenderOptions>): void {
        const nextEnabled =
            typeof options.granulationEnabled === 'boolean'
                ? options.granulationEnabled
                : this.starRenderOptions.granulationEnabled;
        const nextSpotScale =
            typeof options.spotStrengthScale === 'number' && Number.isFinite(options.spotStrengthScale)
                ? Math.max(0, Math.min(1, options.spotStrengthScale))
                : this.starRenderOptions.spotStrengthScale;

        if (
            nextEnabled === this.starRenderOptions.granulationEnabled &&
            nextSpotScale === this.starRenderOptions.spotStrengthScale
        ) {
            return;
        }

        this.starRenderOptions.granulationEnabled = nextEnabled;
        this.starRenderOptions.spotStrengthScale = nextSpotScale;
        for (const mesh of this.bodies.values()) {
            mesh.setGranulationEnabled(nextEnabled);
            mesh.setSpotStrengthScale(nextSpotScale);
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
            Math.max(axisLength, AU * 0.002),
            axisColor,
            Math.max(axisLength * 0.2, AU * 0.0004),
            Math.max(axisLength * 0.1, AU * 0.0002)
        );
        arrow.visible = this.showAxisLinesFlag;
        mesh.group.add(arrow);
        this.axisLines.set(body.id, arrow);

        // Create per-body equatorial reference plane (disc perpendicular to tilt axis)
        const planeRadius = bodyVisRadius * 2;
        const planeGeo = new THREE.RingGeometry(bodyVisRadius * 0.1, Math.max(planeRadius, AU * 0.001), 48);
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
        const surfaceR = Math.max(bodyVisRadius, AU * 0.0005);
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
        const dotRadius = Math.max(bodyVisRadius * 0.08, AU * 0.0001);
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
                    label.position.set(localX, localY + AU * 0.05, localZ);
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
            const spotCoverage = Math.max(0, Math.min(0.3, body.spotFraction ?? 0));
            this.granulationTexture = createGranulationTexture(seed === 0 ? 1 : seed);

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
                    u_spotCoverage: { value: spotCoverage },
                    u_spotStrengthScale: { value: starOptions.spotStrengthScale },
                    u_spotSeed: { value: seed === 0 ? 1 : seed },
                },
            });
            this.starMaterial = this.material as THREE.ShaderMaterial;
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

    setSpotStrengthScale(scale: number): void {
        if (this.starMaterial?.uniforms.u_spotStrengthScale) {
            this.starMaterial.uniforms.u_spotStrengthScale.value = Math.max(0, Math.min(1, scale));
        }
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
        if (this.atmosphereMesh) {
            this.atmosphereMesh.geometry.dispose();
            (this.atmosphereMesh.material as THREE.Material).dispose();
        }
    }

    getPickMesh(): THREE.Mesh {
        return this.mesh;
    }
}
