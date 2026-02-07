/**
 * Body Renderer
 * 
 * Renders celestial bodies as spheres with appropriate materials:
 * - Stars: Emissive with glow
 * - Planets: Phong shading with texture support
 * - Floating origin for large-scale precision
 */

import * as THREE from 'three';

// Body data from physics simulation
interface BodyData {
    id: number;
    name: string;
    type: 'star' | 'planet' | 'moon' | 'asteroid' | 'spacecraft';
    mass: number;
    radius: number;
    color: number;
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

function scaleRadius(realRadius: number, type: string, bodyScale: number, realScale: boolean): number {
    if (realScale) {
        // Use exact real-world radius (will be very small relative to orbits)
        return realRadius;
    }

    // UNIFORM LINEAR SCALING
    // All bodies scaled by the same multiplier, preserving relative size ratios
    // This means: Earth/Moon ratio stays constant at all scales
    // At scale 1000x: Earth=6.37e9m, Moon=1.74e9m (ratio preserved)

    // Stars get a separate treatment for visual balance (not physically accurate)
    // Sun is 109x Earth radius, at high scales it would dominate
    if (type === 'star') {
        // Use logarithmic scaling for stars to keep them visible but not overwhelming
        // At scale 1: star uses real radius
        // At scale 1000: star grows ~3x slower than planets
        const logScale = Math.log10(bodyScale) / 3; // 0 at scale=1, 1 at scale=1000
        return realRadius * (1 + logScale * 10);
    }

    // Planets, moons, asteroids: pure linear scaling
    return realRadius * bodyScale;
}

export class BodyRenderer {
    private scene: THREE.Scene;
    private bodies: Map<number, BodyMesh> = new Map();

    // Scale settings
    private bodyScale = 1000;
    private realScale = false;

    // Orbit trails
    private orbitLines: Map<number, THREE.Line> = new Map();
    private orbitHistory: Map<number, Array<{ x: number; y: number; z: number }>> = new Map();
    private maxTrailPoints = 50; // Configurable via setMaxTrailPoints
    private readonly TRAIL_SAMPLE_INTERVAL = 5; // Sample every N frames
    private frameCount = 0;
    private lastOrigin = { x: 0, y: 0, z: 0 };

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    setBodyScale(scale: number): void {
        this.bodyScale = scale;
        this.updateBodySizes();
    }

    setRealScale(real: boolean): void {
        this.realScale = real;
        this.updateBodySizes();
    }

    private updateBodySizes(): void {
        for (const [_, mesh] of this.bodies) {
            const newRadius = scaleRadius(mesh.realRadius, mesh.type, this.bodyScale, this.realScale);
            mesh.setScale(newRadius);
        }
    }

    addBody(body: BodyData): void {
        const mesh = new BodyMesh(body);
        this.bodies.set(body.id, mesh);
        this.scene.add(mesh.group);

        // Apply current scale settings to new body
        const radius = scaleRadius(body.radius, body.type, this.bodyScale, this.realScale);
        mesh.setScale(radius);

        // Add point light for stars - high intensity, no decay at astronomical distances
        if (body.type === 'star') {
            const light = new THREE.PointLight(0xffffff, 3, 0, 0); // intensity 3, infinite range, no decay
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
    }

    private createLabelSprite(text: string): THREE.Sprite {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 256;
        canvas.height = 64;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(AU * 0.15, AU * 0.0375, 1); // Scale for visibility at AU distances
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

                    // Limit history size to user-configured max
                    if (history.length > this.maxTrailPoints) {
                        history.splice(0, history.length - this.maxTrailPoints);
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
        // Trim existing histories if needed
        for (const [id, history] of this.orbitHistory) {
            if (history.length > capped) {
                history.splice(0, history.length - capped);
                this.updateOrbitLine(id, history, this.lastOrigin);
            }
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
    }
}

class BodyMesh {
    group: THREE.Group;
    private mesh: THREE.Mesh;
    private geometry: THREE.SphereGeometry;
    private material: THREE.Material;

    // Expose for dynamic rescaling
    readonly realRadius: number;
    readonly type: string;

    constructor(body: BodyData) {
        this.realRadius = body.radius;
        this.type = body.type;

        this.group = new THREE.Group();
        this.group.name = body.name;

        // Create sphere geometry - initially at default scale (will be set by renderer)
        const initialRadius = 1; // Placeholder, will be scaled
        this.geometry = new THREE.SphereGeometry(initialRadius, 64, 32);

        // Create material based on body type
        if (body.type === 'star') {
            // MeshBasicMaterial is unlit - perfect for stars
            this.material = new THREE.MeshBasicMaterial({
                color: body.color || 0xffdd44,
            });
        } else {
            this.material = new THREE.MeshStandardMaterial({
                color: body.color || 0x4488ff,
                roughness: 0.8,
                metalness: 0.1,
            });
        }

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.group.add(this.mesh);

        // Add glow effect for stars
        if (body.type === 'star') {
            this.addStarGlow(body.color || 0xffdd44);
        }
    }

    setScale(radius: number): void {
        // Scale the mesh to the desired radius
        // Since geometry is created with radius=1, we scale by the target radius
        this.mesh.scale.setScalar(radius);

        // Also scale glow sprites for stars
        for (const child of this.group.children) {
            if (child instanceof THREE.Sprite) {
                child.scale.set(radius * 8, radius * 8, 1);
            }
        }
    }

    private addStarGlow(color: number): void {
        // Create glow sprite - initial scale will be set by setScale
        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            color: color,
            transparent: true,
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

        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    dispose(): void {
        this.geometry.dispose();
        this.material.dispose();
    }
}
