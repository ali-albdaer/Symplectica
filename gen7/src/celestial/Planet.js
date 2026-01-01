/**
 * Planet Class
 * Rocky or gas giant planets with optional atmosphere
 */

import { CelestialBody } from './CelestialBody.js';
import { CONFIG } from '../../config/globals.js';

export class Planet extends CelestialBody {
    constructor(config) {
        super(config);
        
        this.hasAtmosphere = this.atmosphereHeight > 0;
        this.hasClouds = config.hasClouds !== undefined ? config.hasClouds : true;
    }

    /**
     * Create planet mesh
     */
    createMesh(scene) {
        // Main planet sphere
        const geometry = new THREE.SphereGeometry(this.renderRadius, 64, 64);
        
        // Create material with texture or color
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.8,
            metalness: 0.2,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        // Create atmosphere if enabled
        if (this.hasAtmosphere && CONFIG.GRAPHICS.planetDetails.atmosphereEnabled) {
            this.createAtmosphere(scene);
        }

        // Create clouds if enabled
        if (this.hasClouds && CONFIG.GRAPHICS.planetDetails.cloudsEnabled) {
            this.createClouds(scene);
        }

        return this.mesh;
    }

    /**
     * Create atmospheric glow
     */
    createAtmosphere(scene) {
        const atmosphereScale = 1 + (this.atmosphereHeight / (this.radius));
        const atmosphereRadius = this.renderRadius * atmosphereScale;
        
        const geometry = new THREE.SphereGeometry(atmosphereRadius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: this.atmosphereColor,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide,
        });

        this.atmosphereMesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.atmosphereMesh);

        // Add outer atmosphere layer
        const outerAtmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius * 1.05, 32, 32);
        const outerAtmosphereMaterial = new THREE.MeshBasicMaterial({
            color: this.atmosphereColor,
            transparent: true,
            opacity: 0.08,
            side: THREE.BackSide,
        });

        const outerAtmosphere = new THREE.Mesh(outerAtmosphereGeometry, outerAtmosphereMaterial);
        this.mesh.add(outerAtmosphere);
    }

    /**
     * Create cloud layer
     */
    createClouds(scene) {
        const cloudRadius = this.renderRadius * 1.01;
        const geometry = new THREE.SphereGeometry(cloudRadius, 32, 32);
        
        const material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.3,
            roughness: 1.0,
        });

        this.cloudsMesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.cloudsMesh);
    }

    /**
     * Update planet
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Rotate clouds slightly faster than planet
        if (this.cloudsMesh) {
            this.cloudsMesh.rotation.y += this.rotationSpeed * deltaTime * 1.2;
        }

        // Subtle atmosphere pulsing
        if (this.atmosphereMesh) {
            const time = Date.now() * 0.0005;
            const pulse = Math.sin(time) * 0.02 + 1;
            this.atmosphereMesh.scale.setScalar(pulse);
        }
    }

    /**
     * Get terrain height at position (for player standing)
     * This is a simplified version - can be expanded with noise-based terrain
     */
    getTerrainHeight(localX, localZ) {
        // For now, return sphere surface
        // In future, add procedural terrain with noise
        return this.renderRadius;
    }

    /**
     * Snap object to surface
     */
    snapToSurface(object, height = 0) {
        // Calculate direction from planet center to object
        const dx = object.position.x - this.position.x;
        const dy = object.position.y - this.position.y;
        const dz = object.position.z - this.position.z;
        
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance === 0) {
            // Place at default position
            object.position.y = this.position.y + this.renderRadius + height;
            return;
        }
        
        // Normalize and place at surface + height
        const targetDistance = this.renderRadius + height;
        const scale = targetDistance / distance;
        
        object.position.x = this.position.x + dx * scale;
        object.position.y = this.position.y + dy * scale;
        object.position.z = this.position.z + dz * scale;
    }

    /**
     * Get surface velocity at position (due to rotation)
     */
    getSurfaceVelocity(position) {
        // Calculate tangential velocity due to planet rotation
        const dx = position.x - this.position.x;
        const dz = position.z - this.position.z;
        const radius = Math.sqrt(dx * dx + dz * dz);
        
        if (radius === 0) return { x: 0, y: 0, z: 0 };
        
        // Tangential velocity = ω × r
        const tangentialSpeed = this.rotationSpeed * radius;
        
        return {
            x: -dz / radius * tangentialSpeed,
            y: 0,
            z: dx / radius * tangentialSpeed
        };
    }
}

export default Planet;
