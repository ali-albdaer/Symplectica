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

// Logarithmic body scale: makes bodies visible without engulfing orbits
// Real scale: Sun radius = 6.96e8m, Earth orbit = 1.5e11m (215 Sun radii)
// We use a logarithmic scaling to make bodies visible while preserving relative spacing
const AU = 1.495978707e11;

function scaleRadius(realRadius: number, type: string): number {
    // Stars get scaled to about 0.03 AU for visibility
    // Planets get scaled proportionally larger for visibility
    if (type === 'star') {
        return AU * 0.03; // ~4.5e9 m - visible but not engulfing planets
    }
    // For planets/moons, scale up significantly for visibility
    // Earth's real radius is 6.4e6m, we scale to about 0.005 AU
    return Math.max(AU * 0.002, realRadius * 500);
}

export class BodyRenderer {
    private scene: THREE.Scene;
    private bodies: Map<number, BodyMesh> = new Map();

    // Orbit trails
    private orbitLines: Map<number, THREE.Line> = new Map();
    private orbitHistory: Map<number, Array<{ x: number; y: number; z: number }>> = new Map();
    private readonly MAX_TRAIL_POINTS = 500;
    private readonly TRAIL_SAMPLE_INTERVAL = 10; // Sample every N frames
    private frameCount = 0;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    addBody(body: BodyData): void {
        const mesh = new BodyMesh(body);
        this.bodies.set(body.id, mesh);
        this.scene.add(mesh.group);

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
            const positions = new Float32Array(this.MAX_TRAIL_POINTS * 3);
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

                    // Limit history size
                    if (history.length > this.MAX_TRAIL_POINTS) {
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
        if (!line || history.length < 2) return;

        const positions = line.geometry.attributes.position as THREE.BufferAttribute;
        const arr = positions.array as Float32Array;

        for (let i = 0; i < history.length; i++) {
            arr[i * 3] = history[i].x - origin.x;
            arr[i * 3 + 1] = history[i].y - origin.y;
            arr[i * 3 + 2] = history[i].z - origin.z;
        }

        positions.needsUpdate = true;
        line.geometry.setDrawRange(0, history.length);
    }

    // Visualization options
    private showOrbitTrails = true;
    private showVelocityVectors = false;
    private showLabels = false;
    private velocityVectors: Map<number, THREE.ArrowHelper> = new Map();
    private bodyLabels: Map<number, THREE.Sprite> = new Map();
    private vectorScale = 1e6; // Scale velocity (m/s) to render units
    private maxTrailPoints = 500;

    setShowOrbitTrails(show: boolean): void {
        this.showOrbitTrails = show;
        for (const line of this.orbitLines.values()) {
            line.visible = show;
        }
    }

    setShowVelocityVectors(show: boolean): void {
        this.showVelocityVectors = show;
        for (const arrow of this.velocityVectors.values()) {
            arrow.visible = show;
        }
    }

    setShowLabels(show: boolean): void {
        this.showLabels = show;
        for (const label of this.bodyLabels.values()) {
            label.visible = show;
        }
    }

    setVectorScale(scale: number): void {
        this.vectorScale = scale;
    }

    setMaxTrailPoints(points: number): void {
        this.maxTrailPoints = points;
    }

    /** Update velocity vectors (call with velocities array) */
    updateVelocityVectors(velocities: Float64Array, origin: { x: number; y: number; z: number }): void {
        if (!this.showVelocityVectors) return;

        let i = 0;
        for (const [id, mesh] of this.bodies) {
            if (i * 3 + 2 < velocities.length) {
                const vx = velocities[i * 3];
                const vy = velocities[i * 3 + 1];
                const vz = velocities[i * 3 + 2];

                const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
                if (speed > 0) {
                    let arrow = this.velocityVectors.get(id);

                    // Vector length: scale so typical orbital velocity ~30km/s shows as ~0.1 AU
                    const arrowLength = speed * this.vectorScale;
                    const headLength = arrowLength * 0.2;
                    const headWidth = headLength * 0.5;

                    if (!arrow) {
                        const dir = new THREE.Vector3(vx, vy, vz).normalize();
                        arrow = new THREE.ArrowHelper(dir, mesh.group.position, arrowLength, 0x00ff00, headLength, headWidth);
                        this.velocityVectors.set(id, arrow);
                        this.scene.add(arrow);
                    }

                    // Update arrow
                    arrow.position.copy(mesh.group.position);
                    arrow.setDirection(new THREE.Vector3(vx, vy, vz).normalize());
                    arrow.setLength(arrowLength, headLength, headWidth);
                    arrow.visible = this.showVelocityVectors;
                }
            }
            i++;
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

        for (const arrow of this.velocityVectors.values()) {
            this.scene.remove(arrow);
        }
        this.velocityVectors.clear();

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

    constructor(body: BodyData) {
        this.group = new THREE.Group();
        this.group.name = body.name;

        // Create sphere geometry with logarithmic scaling
        const renderRadius = scaleRadius(body.radius, body.type);
        this.geometry = new THREE.SphereGeometry(renderRadius, 64, 32);

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
            this.addStarGlow(renderRadius, body.color || 0xffdd44);
        }
    }

    private addStarGlow(radius: number, color: number): void {
        // Create glow sprite
        const spriteMaterial = new THREE.SpriteMaterial({
            map: this.createGlowTexture(),
            color: color,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(radius * 8, radius * 8, 1);
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
