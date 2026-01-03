/**
 * Star (Sun) Class
 * Self-luminous celestial body
 */

import * as THREE from 'three';
import { CelestialBody } from './CelestialBody.js';

export class Star extends CelestialBody {
    constructor(config) {
        super(config);
        
        this.isStatic = true; // Sun doesn't move in our simplified model
        this.luminosity = config.luminosity || 3.828e26;
        this.temperature = config.temperature || 5778;
        
        // Light source reference
        this.light = null;
    }

    /**
     * Create star mesh with glowing effect
     */
    createMesh(scene) {
        // Main sphere
        const geometry = new THREE.SphereGeometry(this.renderRadius, 64, 64);
        
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            emissive: this.emissive,
            emissiveIntensity: this.emissiveIntensity,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.mesh);

        // Glow effect (larger transparent sphere)
        const glowGeometry = new THREE.SphereGeometry(this.renderRadius * 1.3, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.emissive,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide,
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glowMesh);

        // Create corona (outer glow)
        const coronaGeometry = new THREE.SphereGeometry(this.renderRadius * 1.5, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: this.emissive,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide,
        });
        
        const coronaMesh = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.mesh.add(coronaMesh);

        return this.mesh;
    }

    /**
     * Create star light source
     */
    createLight(scene) {
        // Point light at star's position
        this.light = new THREE.PointLight(this.color, 2, 0, 2);
        this.light.position.set(this.position.x, this.position.y, this.position.z);
        this.light.castShadow = true;
        
        // Shadow properties
        this.light.shadow.mapSize.width = 2048;
        this.light.shadow.mapSize.height = 2048;
        this.light.shadow.camera.near = 0.5;
        this.light.shadow.camera.far = 5000;
        this.light.shadow.bias = -0.0001;
        
        scene.add(this.light);
        
        return this.light;
    }

    /**
     * Update star
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Update light position
        if (this.light) {
            this.light.position.set(this.position.x, this.position.y, this.position.z);
        }

        // Animate glow/pulsing
        if (this.mesh && this.mesh.children.length > 0) {
            const time = Date.now() * 0.001;
            const pulse = Math.sin(time * 0.5) * 0.05 + 1;
            
            // Subtle pulsing of glow layers
            this.mesh.children.forEach((child, index) => {
                if (index === 0) {
                    child.material.opacity = 0.3 * pulse;
                } else if (index === 1) {
                    child.material.opacity = 0.1 * pulse;
                }
            });
        }
    }
}

export default Star;
