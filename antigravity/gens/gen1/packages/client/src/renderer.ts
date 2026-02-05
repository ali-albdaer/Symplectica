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

// Body render scale factor (bodies are too small to see at real scale)
const BODY_SCALE = 1000;

export class BodyRenderer {
    private scene: THREE.Scene;
    private bodies: Map<number, BodyMesh> = new Map();

    // Circular orbit trails
    private orbitLines: Map<number, THREE.Line> = new Map();

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    addBody(body: BodyData): void {
        const mesh = new BodyMesh(body);
        this.bodies.set(body.id, mesh);
        this.scene.add(mesh.group);

        // Add point light for stars
        if (body.type === 'star') {
            const light = new THREE.PointLight(0xffffff, 2, 0, 2);
            mesh.group.add(light);
        }
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
    }

    /** Update body positions using floating origin */
    update(positions: Float64Array, origin: { x: number; y: number; z: number }): void {
        let i = 0;
        for (const [id, mesh] of this.bodies) {
            if (i * 3 + 2 < positions.length) {
                const worldX = positions[i * 3];
                const worldY = positions[i * 3 + 1];
                const worldZ = positions[i * 3 + 2];

                // Apply floating origin - shift all positions relative to camera origin
                mesh.group.position.set(
                    worldX - origin.x,
                    worldY - origin.y,
                    worldZ - origin.z
                );
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

        // Create sphere geometry
        // Scale bodies up for visibility (real sizes are microscopic at solar system scale)
        const renderRadius = body.radius * BODY_SCALE;
        this.geometry = new THREE.SphereGeometry(renderRadius, 64, 32);

        // Create material based on body type
        if (body.type === 'star') {
            this.material = new THREE.MeshBasicMaterial({
                color: body.color || 0xffdd44,
                emissive: new THREE.Color(body.color || 0xffdd44),
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
