/**
 * CelestialBody.js - Celestial Body Module
 * 
 * Base class for all celestial objects (stars, planets, moons).
 * Extensible for special entities like black holes.
 */

import Config from './Config.js';
import Debug from './Debug.js';

class CelestialBody {
    constructor(config) {
        // Identity
        this.id = config.id || `body_${Math.random().toString(36).substr(2, 9)}`;
        this.name = config.name || 'Unknown Body';
        this.type = config.type || 'planet'; // star, planet, moon, blackhole, etc.
        
        // Physical properties
        this.mass = config.mass || 1;
        this.radius = config.radius || 1;
        this.density = config.density || 1;
        
        // Position and velocity (copied to avoid reference issues)
        this.position = {
            x: config.position?.x || 0,
            y: config.position?.y || 0,
            z: config.position?.z || 0
        };
        
        this.velocity = {
            x: config.velocity?.x || 0,
            y: config.velocity?.y || 0,
            z: config.velocity?.z || 0
        };
        
        // Rotation
        this.rotation = { x: 0, y: 0, z: 0 };
        this.rotationSpeed = config.rotationSpeed || 0.01;
        
        // Visual properties
        this.color = config.color || 0xffffff;
        this.emissive = config.emissive || 0x000000;
        this.emissiveIntensity = config.emissiveIntensity || 0;
        this.isLightSource = config.isLightSource || false;
        this.luminosity = config.luminosity || 0;
        
        // Atmosphere
        this.hasAtmosphere = config.hasAtmosphere || false;
        this.atmosphereColor = config.atmosphereColor || 0x88aaff;
        this.atmosphereScale = config.atmosphereScale || 1.1;
        
        // Static flag (sun doesn't move in simplified sim)
        this.isStatic = config.isStatic || false;
        
        // Three.js objects (set by renderer)
        this.mesh = null;
        this.atmosphereMesh = null;
        this.glowMesh = null;
        this.orbitLine = null;
        
        // Parent body (for moons)
        this.parentBody = config.parentBody || null;
        this.orbitalDistance = config.orbitalDistance || 0;
        
        // Track orbit for visualization
        this.orbitHistory = [];
        this.maxOrbitPoints = 200;
    }
    
    /**
     * Create the Three.js mesh for this body
     */
    createMesh(THREE, qualitySettings) {
        // Geometry detail based on quality
        const segments = qualitySettings.currentQuality === 'ultra' ? 64 : 
                        qualitySettings.currentQuality === 'medium' ? 32 : 16;
        
        const geometry = new THREE.SphereGeometry(this.radius, segments, segments);
        
        // Material based on type
        let material;
        
        if (this.type === 'star') {
            // Emissive material for stars
            material = new THREE.MeshBasicMaterial({
                color: this.color,
                // Basic material is always "lit" - perfect for stars
            });
        } else {
            // Standard material for planets/moons with lighting
            material = new THREE.MeshStandardMaterial({
                color: this.color,
                emissive: this.emissive,
                emissiveIntensity: this.emissiveIntensity,
                roughness: 0.8,
                metalness: 0.1
            });
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = this.type !== 'star';
        this.mesh.receiveShadow = this.type !== 'star';
        this.mesh.userData.bodyId = this.id;
        this.mesh.userData.bodyRef = this;
        
        // Create atmosphere if applicable
        if (this.hasAtmosphere && qualitySettings.atmosphereEnabled !== false) {
            this.createAtmosphere(THREE);
        }
        
        // Add glow effect for stars (after mesh is created)
        if (this.type === 'star') {
            this.createGlow(THREE);
        }
        
        return this.mesh;
    }
    
    /**
     * Create atmospheric glow for planets
     */
    createAtmosphere(THREE) {
        const atmosRadius = this.radius * this.atmosphereScale;
        const geometry = new THREE.SphereGeometry(atmosRadius, 32, 32);
        
        // Custom shader for atmospheric scattering effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: new THREE.Color(this.atmosphereColor) },
                intensity: { value: 0.8 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 atmosphereColor;
                uniform float intensity;
                varying vec3 vNormal;
                void main() {
                    float rim = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    rim = pow(rim, 3.0);
                    gl_FragColor = vec4(atmosphereColor, rim * intensity);
                }
            `,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.atmosphereMesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.atmosphereMesh);
    }
    
    /**
     * Create glow effect for stars
     */
    createGlow(THREE) {
        const glowRadius = this.radius * 1.5;
        const geometry = new THREE.SphereGeometry(glowRadius, 32, 32);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(this.color) },
                intensity: { value: this.luminosity || 1.0 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float intensity;
                varying vec3 vNormal;
                void main() {
                    float rim = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    rim = pow(rim, 2.0) * intensity;
                    gl_FragColor = vec4(glowColor, rim * 0.6);
                }
            `,
            side: THREE.BackSide,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.glowMesh = new THREE.Mesh(geometry, material);
        this.mesh.add(this.glowMesh);
    }
    
    /**
     * Create orbit visualization line
     */
    createOrbitLine(THREE, color = 0x444466) {
        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.maxOrbitPoints * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setDrawRange(0, 0);
        
        this.orbitLine = new THREE.Line(geometry, material);
        return this.orbitLine;
    }
    
    /**
     * Update orbit history for visualization
     */
    updateOrbitHistory() {
        this.orbitHistory.push({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z
        });
        
        if (this.orbitHistory.length > this.maxOrbitPoints) {
            this.orbitHistory.shift();
        }
        
        // Update orbit line geometry
        if (this.orbitLine) {
            const positions = this.orbitLine.geometry.attributes.position.array;
            for (let i = 0; i < this.orbitHistory.length; i++) {
                positions[i * 3] = this.orbitHistory[i].x;
                positions[i * 3 + 1] = this.orbitHistory[i].y;
                positions[i * 3 + 2] = this.orbitHistory[i].z;
            }
            this.orbitLine.geometry.attributes.position.needsUpdate = true;
            this.orbitLine.geometry.setDrawRange(0, this.orbitHistory.length);
        }
    }
    
    /**
     * Update mesh position and rotation
     */
    update(deltaTime) {
        // Update rotation
        this.rotation.y += this.rotationSpeed * deltaTime;
        
        // Sync mesh with physics
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            this.mesh.rotation.y = this.rotation.y;
        }
        
        // Update orbit visualization if enabled
        if (Config.debug.showOrbits && this.type !== 'star') {
            this.updateOrbitHistory();
        }
    }
    
    /**
     * Get current speed
     */
    getSpeed() {
        return Math.sqrt(
            this.velocity.x ** 2 +
            this.velocity.y ** 2 +
            this.velocity.z ** 2
        );
    }
    
    /**
     * Get distance from origin (useful for orbital calculations)
     */
    getDistanceFromOrigin() {
        return Math.sqrt(
            this.position.x ** 2 +
            this.position.y ** 2 +
            this.position.z ** 2
        );
    }
    
    /**
     * Get distance from another body
     */
    getDistanceFrom(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const dz = this.position.z - other.position.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    /**
     * Set config values (for live editing)
     */
    setConfig(key, value) {
        if (key in this) {
            this[key] = value;
            Debug.info(`${this.name}: Set ${key} = ${value}`);
            
            // Update mesh material if needed
            if (this.mesh && (key === 'color' || key === 'emissive')) {
                if (this.mesh.material.color) {
                    this.mesh.material.color.setHex(this.color);
                }
                if (this.mesh.material.emissive) {
                    this.mesh.material.emissive.setHex(this.emissive);
                }
            }
        }
    }
    
    /**
     * Dispose of Three.js resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        if (this.atmosphereMesh) {
            this.atmosphereMesh.geometry.dispose();
            this.atmosphereMesh.material.dispose();
        }
        if (this.glowMesh) {
            this.glowMesh.geometry.dispose();
            this.glowMesh.material.dispose();
        }
        if (this.orbitLine) {
            this.orbitLine.geometry.dispose();
            this.orbitLine.material.dispose();
        }
    }
}

/**
 * Factory function to create celestial bodies from config
 */
export function createCelestialBodies() {
    const bodies = [];
    const bodyConfigs = Config.celestialBodies;
    
    for (const [key, config] of Object.entries(bodyConfigs)) {
        const body = new CelestialBody({
            id: key,
            ...config,
            isStatic: config.type === 'star' // Sun is static in our simplified model
        });
        bodies.push(body);
        Debug.info(`Created celestial body: ${config.name}`);
    }
    
    return bodies;
}

export default CelestialBody;
