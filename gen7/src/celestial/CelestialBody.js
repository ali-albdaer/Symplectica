/**
 * Celestial Body Base Class
 * Base for all celestial objects (stars, planets, moons)
 */

import { PhysicsObject } from '../physics/PhysicsObject.js';
import { SCALE } from '../../config/globals.js';

export class CelestialBody extends PhysicsObject {
    constructor(config) {
        super(config);

        // Celestial properties
        this.renderRadius = config.renderRadius || this.radius / SCALE.SIZE;
        this.color = config.color || 0xFFFFFF;
        this.emissive = config.emissive || 0x000000;
        this.emissiveIntensity = config.emissiveIntensity || 0;
        
        // Rotation
        this.rotationPeriod = config.rotationPeriod || 86400; // seconds
        this.rotationSpeed = (2 * Math.PI) / this.rotationPeriod;
        
        // Orbital parameters
        this.orbitalPeriod = config.orbitalPeriod || 0;
        this.semiMajorAxis = config.semiMajorAxis || 0;
        this.eccentricity = config.eccentricity || 0;
        this.inclination = config.inclination || 0;
        
        // Atmosphere
        this.atmosphereHeight = config.atmosphereHeight || 0;
        this.atmosphereColor = config.atmosphereColor || 0x4488FF;
        this.surfaceGravity = config.surfaceGravity || 0;
        
        // Parent body (for moons)
        this.parentBody = config.parentBody || null;
        
        // Visual elements (Three.js objects)
        this.atmosphereMesh = null;
        this.cloudsMesh = null;
        this.orbitLine = null;
        
        // Surface features
        this.temperature = config.temperature || 0;
        this.luminosity = config.luminosity || 0;
    }

    /**
     * Update celestial body
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // Self-rotation
        this.rotation.y += this.rotationSpeed * deltaTime;
        
        // Update mesh rotation separately from orbit
        if (this.mesh) {
            this.mesh.rotation.y = this.rotation.y;
        }
    }

    /**
     * Get surface point at given lat/long
     */
    getSurfacePoint(latitude, longitude) {
        const lat = latitude * Math.PI / 180;
        const lon = longitude * Math.PI / 180;
        
        const x = this.renderRadius * Math.cos(lat) * Math.cos(lon);
        const y = this.renderRadius * Math.sin(lat);
        const z = this.renderRadius * Math.cos(lat) * Math.sin(lon);
        
        return {
            x: this.position.x + x,
            y: this.position.y + y,
            z: this.position.z + z
        };
    }

    /**
     * Get surface normal at position
     */
    getSurfaceNormal(surfacePoint) {
        const normal = {
            x: surfacePoint.x - this.position.x,
            y: surfacePoint.y - this.position.y,
            z: surfacePoint.z - this.position.z
        };
        
        const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
        return {
            x: normal.x / length,
            y: normal.y / length,
            z: normal.z / length
        };
    }

    /**
     * Check if point is above surface
     */
    isAboveSurface(point, margin = 0) {
        const distance = Math.sqrt(
            (point.x - this.position.x) ** 2 +
            (point.y - this.position.y) ** 2 +
            (point.z - this.position.z) ** 2
        );
        return distance > (this.renderRadius + margin);
    }

    /**
     * Get altitude of point above surface
     */
    getAltitude(point) {
        const distance = Math.sqrt(
            (point.x - this.position.x) ** 2 +
            (point.y - this.position.y) ** 2 +
            (point.z - this.position.z) ** 2
        );
        return distance - this.renderRadius;
    }

    /**
     * Get gravitational acceleration at distance
     */
    getGravityAt(distance) {
        if (distance <= 0) return 0;
        return (6.674e-11 * this.mass) / (distance * distance);
    }

    /**
     * Get escape velocity
     */
    getEscapeVelocity() {
        return Math.sqrt(2 * 6.674e-11 * this.mass / this.radius);
    }

    /**
     * Get orbital velocity at distance
     */
    getOrbitalVelocityAt(distance) {
        if (distance <= 0) return 0;
        return Math.sqrt(6.674e-11 * this.mass / distance);
    }

    /**
     * Create orbit visualization
     */
    createOrbitLine(scene) {
        if (!this.semiMajorAxis || this.semiMajorAxis === 0) return;

        const points = [];
        const segments = 128;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = this.semiMajorAxis / SCALE.DISTANCE * Math.cos(angle);
            const z = this.semiMajorAxis / SCALE.DISTANCE * Math.sin(angle);
            points.push(new THREE.Vector3(x, 0, z));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: this.color,
            opacity: 0.3,
            transparent: true
        });

        this.orbitLine = new THREE.Line(geometry, material);
        this.orbitLine.visible = false;
        scene.add(this.orbitLine);
    }

    /**
     * Toggle orbit line visibility
     */
    toggleOrbitLine(visible) {
        if (this.orbitLine) {
            this.orbitLine.visible = visible;
        }
    }

    /**
     * Get body info for display
     */
    getInfo() {
        return {
            name: this.name,
            mass: this.mass,
            radius: this.radius,
            position: this.position.toArray(),
            velocity: this.velocity.toArray(),
            rotationPeriod: this.rotationPeriod,
            orbitalPeriod: this.orbitalPeriod,
            surfaceGravity: this.surfaceGravity,
            temperature: this.temperature,
        };
    }
}

export default CelestialBody;
