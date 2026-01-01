/**
 * CelestialBody - Represents Sun, Planets, and Moons with realistic physics
 */

import * as THREE from 'three';
import { PHYSICS, SCALE } from './config.js';

export class CelestialBody {
    constructor(config, parentBody = null) {
        this.config = config;
        this.parentBody = parentBody;
        
        // Physical properties
        this.mass = config.mass;
        this.radius = config.radius;
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.rotation = 0;
        this.rotationSpeed = (2 * Math.PI) / (config.rotationPeriod / SCALE.time);
        
        // Orbital elements
        this.orbitRadius = config.orbitRadius || 0;
        this.orbitPeriod = config.orbitPeriod || 0;
        this.orbitSpeed = this.orbitPeriod ? (2 * Math.PI) / (this.orbitPeriod / SCALE.time) : 0;
        this.orbitAngle = Math.random() * Math.PI * 2; // Random starting position
        this.eccentricity = config.eccentricity || 0;
        this.axialTilt = (config.axialTilt || 0) * (Math.PI / 180);
        
        // Visual properties
        this.mesh = null;
        this.atmosphere = null;
        this.orbitLine = null;
        
        this.createMesh();
        this.initializeOrbit();
    }

    createMesh() {
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        
        let material;
        
        // Sun gets emissive material
        if (this.config.emissive) {
            material = new THREE.MeshStandardMaterial({
                color: this.config.color,
                emissive: this.config.emissive,
                emissiveIntensity: this.config.emissiveIntensity || 1,
                roughness: 1,
                metalness: 0
            });
        } else {
            // Planets and moons get standard material
            material = new THREE.MeshStandardMaterial({
                color: this.config.color,
                roughness: 0.8,
                metalness: 0.2,
                flatShading: false
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = !this.config.emissive;
        this.mesh.receiveShadow = !this.config.emissive;
        this.mesh.userData.celestialBody = this;
        
        // Add some visual detail
        if (!this.config.emissive) {
            this.addSurfaceDetail();
        }
        
        // Add atmosphere if configured
        if (this.config.hasAtmosphere) {
            this.createAtmosphere();
        }
        
        // Tilt the body
        this.mesh.rotation.z = this.axialTilt;
    }

    addSurfaceDetail() {
        // Add subtle noise to make planets look more realistic
        const positions = this.mesh.geometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        for (let i = 0; i < positions.count; i++) {
            vertex.fromBufferAttribute(positions, i);
            const noise = (Math.random() - 0.5) * this.radius * 0.02;
            vertex.normalize().multiplyScalar(this.radius + noise);
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        
        positions.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();
    }

    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(
            this.radius * 1.1,
            32,
            32
        );
        
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: this.config.atmosphereColor,
            transparent: true,
            opacity: this.config.atmosphereOpacity || 0.2,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.mesh.add(this.atmosphere);
    }

    createOrbitLine() {
        if (!this.orbitRadius) return null;
        
        const points = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * this.orbitRadius;
            const z = Math.sin(angle) * this.orbitRadius;
            points.push(new THREE.Vector3(x, 0, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.config.color,
            opacity: 0.3,
            transparent: true
        });
        
        this.orbitLine = new THREE.Line(geometry, material);
        this.orbitLine.visible = false; // Hidden by default
        
        return this.orbitLine;
    }

    initializeOrbit() {
        if (!this.orbitRadius) {
            this.position.set(
                this.config.position?.x || 0,
                this.config.position?.y || 0,
                this.config.position?.z || 0
            );
        } else {
            // Calculate initial orbital position
            this.updateOrbitalPosition(0);
            
            // Set initial velocity perpendicular to position (circular orbit approximation)
            const orbitalSpeed = this.orbitSpeed * this.orbitRadius;
            this.velocity.set(
                -Math.sin(this.orbitAngle) * orbitalSpeed,
                0,
                Math.cos(this.orbitAngle) * orbitalSpeed
            );
        }
        
        this.updateMeshPosition();
    }

    updateOrbitalPosition(deltaTime) {
        // Simplified orbital mechanics (circular orbits with minor eccentricity)
        this.orbitAngle += this.orbitSpeed * deltaTime;
        
        // Apply eccentricity
        const r = this.orbitRadius * (1 - this.eccentricity * Math.cos(this.orbitAngle));
        
        const parentPos = this.parentBody ? this.parentBody.position : new THREE.Vector3();
        
        this.position.x = parentPos.x + Math.cos(this.orbitAngle) * r;
        this.position.y = parentPos.y;
        this.position.z = parentPos.z + Math.sin(this.orbitAngle) * r;
    }

    applyGravity(otherBody, deltaTime) {
        // Calculate gravitational force between this body and another
        const dx = otherBody.position.x - this.position.x;
        const dy = otherBody.position.y - this.position.y;
        const dz = otherBody.position.z - this.position.z;
        
        const distanceSquared = dx * dx + dy * dy + dz * dz;
        const distance = Math.sqrt(distanceSquared);
        
        // Avoid division by zero and unrealistic forces at very small distances
        if (distance < (this.radius + otherBody.radius)) {
            return;
        }
        
        // F = G * (m1 * m2) / r^2
        const force = (PHYSICS.gravitationalConstant * this.mass * otherBody.mass) / distanceSquared;
        const forceMagnitude = force * PHYSICS.gravityMultiplier;
        
        // Calculate acceleration (F = ma, so a = F/m)
        const ax = (dx / distance) * (forceMagnitude / this.mass);
        const ay = (dy / distance) * (forceMagnitude / this.mass);
        const az = (dz / distance) * (forceMagnitude / this.mass);
        
        this.acceleration.x += ax;
        this.acceleration.y += ay;
        this.acceleration.z += az;
    }

    update(deltaTime, usePhysics = true) {
        // Rotate the body
        this.rotation += this.rotationSpeed * deltaTime;
        this.mesh.rotation.y = this.rotation;
        
        if (usePhysics && this.orbitRadius > 0) {
            // Physics-based orbit (for accurate multi-body interactions)
            this.velocity.x += this.acceleration.x * deltaTime;
            this.velocity.y += this.acceleration.y * deltaTime;
            this.velocity.z += this.acceleration.z * deltaTime;
            
            this.position.x += this.velocity.x * deltaTime;
            this.position.y += this.velocity.y * deltaTime;
            this.position.z += this.velocity.z * deltaTime;
            
            // Reset acceleration
            this.acceleration.set(0, 0, 0);
        } else if (this.orbitRadius > 0) {
            // Simplified Kepler orbit (more stable, less computational)
            this.updateOrbitalPosition(deltaTime);
        }
        
        this.updateMeshPosition();
    }

    updateMeshPosition() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }

    getWorldPosition() {
        return this.position.clone();
    }

    getSurfaceGravity() {
        // g = GM / r^2
        const g = (PHYSICS.gravitationalConstant * this.mass) / (this.radius * this.radius);
        return g * PHYSICS.gravityMultiplier;
    }

    getDistanceTo(point) {
        return this.position.distanceTo(point);
    }

    isPointOnSurface(point, tolerance = 0.1) {
        const distance = this.getDistanceTo(point);
        return Math.abs(distance - this.radius) < tolerance;
    }

    getClosestSurfacePoint(point) {
        const direction = point.clone().sub(this.position).normalize();
        return this.position.clone().add(direction.multiplyScalar(this.radius));
    }

    toggleOrbitLine(visible) {
        if (this.orbitLine) {
            this.orbitLine.visible = visible;
        }
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            if (this.atmosphere) {
                this.atmosphere.geometry.dispose();
                this.atmosphere.material.dispose();
            }
        }
        if (this.orbitLine) {
            this.orbitLine.geometry.dispose();
            this.orbitLine.material.dispose();
        }
    }
}
