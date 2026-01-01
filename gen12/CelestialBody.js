/**
 * CelestialBody.js - Base class for all celestial objects
 * Handles stars, planets, moons, and special entities
 */

import { Config } from './Config.js';
import { Logger } from './Utils.js';

export class CelestialBody {
    constructor(config, scene, fidelitySettings) {
        this.name = config.name;
        this.type = config.type;
        this.mass = config.mass;
        this.radius = config.radius;
        this.isStatic = config.isStatic || false;
        this.density = config.density || 1;
        this.luminosity = config.luminosity || 0;
        
        // Physics properties
        this.position = new THREE.Vector3(
            config.position?.x || 0,
            config.position?.y || 0,
            config.position?.z || 0
        );
        this.velocity = new THREE.Vector3(
            config.velocity?.x || 0,
            config.velocity?.y || 0,
            config.velocity?.z || 0
        );
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.previousPosition = this.position.clone();
        
        // Store initial state for reset
        this.initialState = {
            position: this.position.clone(),
            velocity: this.velocity.clone()
        };
        
        // Rotation
        this.rotationSpeed = new THREE.Vector3(
            config.rotation?.x || 0,
            config.rotation?.y || 0,
            config.rotation?.z || 0
        );
        
        // Visual properties
        this.color = config.color || 0xFFFFFF;
        this.emissive = config.emissive || 0x000000;
        this.emissiveIntensity = config.emissiveIntensity || 0;
        
        // Atmosphere
        this.hasAtmosphere = config.hasAtmosphere || false;
        this.atmosphereColor = config.atmosphereColor || 0x88AAFF;
        this.atmosphereScale = config.atmosphereScale || 1.15;
        
        // Light properties (for stars)
        this.lightIntensity = config.lightIntensity || 0;
        this.lightRange = config.lightRange || 0;
        
        // References
        this.scene = scene;
        this.fidelitySettings = fidelitySettings;
        this.mesh = null;
        this.atmosphere = null;
        this.light = null;
        this.lodMeshes = [];
        
        // Create the visual representation
        this.createMesh();
        
        Logger.system(`CelestialBody created: ${this.name}`, { type: this.type, mass: this.mass });
    }

    /**
     * Create the 3D mesh for this body
     */
    createMesh() {
        const segments = this.fidelitySettings.planetSegments;
        
        // Create geometry
        const geometry = new THREE.SphereGeometry(this.radius, segments, segments);
        
        // Create material based on type
        let material;
        
        if (this.type === 'star') {
            material = this.createStarMaterial();
        } else {
            material = this.createPlanetMaterial();
        }
        
        // Create mesh
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = this.type !== 'star';
        this.mesh.receiveShadow = this.type !== 'star';
        this.mesh.userData.celestialBody = this;
        
        this.scene.add(this.mesh);
        
        // Create atmosphere if applicable
        if (this.hasAtmosphere && this.fidelitySettings.atmosphereEnabled) {
            this.createAtmosphere();
        }
        
        // Create light source if this is a star
        if (this.type === 'star' && this.lightIntensity > 0) {
            this.createLight();
        }
        
        // Create LOD meshes
        this.createLOD();
    }

    /**
     * Create material for stars (emissive)
     */
    createStarMaterial() {
        return new THREE.MeshBasicMaterial({
            color: this.color,
            emissive: this.emissive,
            emissiveIntensity: this.emissiveIntensity
        });
    }

    /**
     * Create material for planets/moons
     */
    createPlanetMaterial() {
        return new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.8,
            metalness: 0.2,
            emissive: this.emissive,
            emissiveIntensity: this.emissiveIntensity
        });
    }

    /**
     * Create atmospheric glow effect
     */
    createAtmosphere() {
        const atmosphereRadius = this.radius * this.atmosphereScale;
        const segments = Math.max(16, this.fidelitySettings.planetSegments / 2);
        
        const geometry = new THREE.SphereGeometry(atmosphereRadius, segments, segments);
        
        // Custom atmosphere shader
        const material = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: new THREE.Color(this.atmosphereColor) },
                intensity: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 atmosphereColor;
                uniform float intensity;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vec3 viewDir = normalize(-vPosition);
                    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
                    gl_FragColor = vec4(atmosphereColor, fresnel * intensity);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.atmosphere = new THREE.Mesh(geometry, material);
        this.atmosphere.position.copy(this.position);
        this.scene.add(this.atmosphere);
    }

    /**
     * Create point light for stars
     */
    createLight() {
        this.light = new THREE.PointLight(
            this.color,
            this.lightIntensity,
            this.lightRange,
            2 // decay
        );
        this.light.position.copy(this.position);
        
        // Setup shadows
        if (this.fidelitySettings.shadowsEnabled) {
            this.light.castShadow = true;
            this.light.shadow.mapSize.width = this.fidelitySettings.shadowMapSize;
            this.light.shadow.mapSize.height = this.fidelitySettings.shadowMapSize;
            this.light.shadow.camera.near = 1;
            this.light.shadow.camera.far = this.lightRange;
            this.light.shadow.bias = -0.001;
        }
        
        this.scene.add(this.light);
        
        // Add lens flare effect for ultra settings
        if (this.fidelitySettings === Config.rendering.fidelitySettings.ultra) {
            this.createLensFlare();
        }
    }

    /**
     * Create lens flare effect for stars
     */
    createLensFlare() {
        // Simple glow sprite for the star
        const spriteMaterial = new THREE.SpriteMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(this.radius * 3, this.radius * 3, 1);
        this.mesh.add(sprite);
    }

    /**
     * Create Level of Detail meshes
     */
    createLOD() {
        const lodDistances = this.fidelitySettings.lodDistances;
        
        // LOD levels with decreasing detail
        const lodLevels = [
            { segments: this.fidelitySettings.planetSegments, distance: 0 },
            { segments: Math.max(8, this.fidelitySettings.planetSegments / 2), distance: lodDistances[0] },
            { segments: Math.max(6, this.fidelitySettings.planetSegments / 4), distance: lodDistances[1] },
            { segments: 4, distance: lodDistances[2] }
        ];
        
        // Store LOD info for manual switching
        this.lodLevels = lodLevels;
        this.currentLOD = 0;
    }

    /**
     * Update LOD based on camera distance
     */
    updateLOD(cameraPosition) {
        const distance = this.position.distanceTo(cameraPosition);
        
        let targetLOD = 0;
        for (let i = this.lodLevels.length - 1; i >= 0; i--) {
            if (distance >= this.lodLevels[i].distance) {
                targetLOD = i;
                break;
            }
        }
        
        if (targetLOD !== this.currentLOD) {
            this.currentLOD = targetLOD;
            this.updateMeshDetail(this.lodLevels[targetLOD].segments);
        }
    }

    /**
     * Update mesh geometry detail
     */
    updateMeshDetail(segments) {
        const newGeometry = new THREE.SphereGeometry(this.radius, segments, segments);
        this.mesh.geometry.dispose();
        this.mesh.geometry = newGeometry;
    }

    /**
     * Update the celestial body (called each frame)
     */
    update(deltaTime, cameraPosition) {
        // Sync mesh position with physics position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        
        // Sync atmosphere position
        if (this.atmosphere) {
            this.atmosphere.position.copy(this.position);
        }
        
        // Sync light position
        if (this.light) {
            this.light.position.copy(this.position);
        }
        
        // Update LOD
        if (cameraPosition) {
            this.updateLOD(cameraPosition);
        }
    }

    /**
     * Get the surface position at a given direction from center
     */
    getSurfacePosition(direction) {
        const normalized = direction.clone().normalize();
        return this.position.clone().add(normalized.multiplyScalar(this.radius));
    }

    /**
     * Get distance from surface to a point
     */
    getDistanceFromSurface(point) {
        return this.position.distanceTo(point) - this.radius;
    }

    /**
     * Check if a point is within the body's sphere of influence
     */
    isInSphereOfInfluence(point, soiRadius = null) {
        const soi = soiRadius || this.radius * 10;
        return this.position.distanceTo(point) < soi;
    }

    /**
     * Get orbital velocity for a circular orbit at given radius
     */
    getOrbitalVelocity(orbitalRadius) {
        const G = Config.physics.G_SCALED;
        return Math.sqrt(G * this.mass / orbitalRadius);
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.scene.remove(this.mesh);
        }
        
        if (this.atmosphere) {
            this.atmosphere.geometry.dispose();
            this.atmosphere.material.dispose();
            this.scene.remove(this.atmosphere);
        }
        
        if (this.light) {
            this.scene.remove(this.light);
        }
        
        Logger.system(`CelestialBody disposed: ${this.name}`);
    }
}

/**
 * Star - Special celestial body that emits light
 */
export class Star extends CelestialBody {
    constructor(config, scene, fidelitySettings) {
        super({ ...config, type: 'star' }, scene, fidelitySettings);
        
        this.coronaSize = config.coronaSize || this.radius * 1.5;
        this.createCorona();
    }

    createCorona() {
        // Corona effect using custom shader
        const geometry = new THREE.SphereGeometry(this.coronaSize, 32, 32);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(this.color) }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color;
                
                varying vec3 vNormal;
                varying vec3 vPosition;
                
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    float pulse = sin(time * 2.0) * 0.1 + 0.9;
                    gl_FragColor = vec4(color, intensity * 0.5 * pulse);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.corona = new THREE.Mesh(geometry, material);
        this.mesh.add(this.corona);
    }

    update(deltaTime, cameraPosition) {
        super.update(deltaTime, cameraPosition);
        
        // Animate corona
        if (this.corona && this.corona.material.uniforms) {
            this.corona.material.uniforms.time.value += deltaTime;
        }
    }
}

/**
 * Planet - Standard orbiting body
 */
export class Planet extends CelestialBody {
    constructor(config, scene, fidelitySettings) {
        super({ ...config, type: 'planet' }, scene, fidelitySettings);
        
        this.parentBody = config.parentBody || null;
        this.moons = [];
    }

    addMoon(moon) {
        this.moons.push(moon);
    }
}

/**
 * Moon - Orbits a planet
 */
export class Moon extends CelestialBody {
    constructor(config, scene, fidelitySettings, parentBody) {
        // Calculate absolute position from parent
        const absolutePosition = {
            x: parentBody.position.x + (config.positionOffset?.x || 0),
            y: parentBody.position.y + (config.positionOffset?.y || 0),
            z: parentBody.position.z + (config.positionOffset?.z || 0)
        };
        
        // Calculate absolute velocity (parent velocity + orbital velocity)
        const absoluteVelocity = {
            x: parentBody.velocity.x + (config.velocityOffset?.x || 0),
            y: parentBody.velocity.y + (config.velocityOffset?.y || 0),
            z: parentBody.velocity.z + (config.velocityOffset?.z || 0)
        };
        
        super({
            ...config,
            type: 'moon',
            position: absolutePosition,
            velocity: absoluteVelocity
        }, scene, fidelitySettings);
        
        this.parentPlanet = parentBody;
    }
}

/**
 * BlackHole - Special entity with Schwarzschild radius logic
 */
export class BlackHole extends CelestialBody {
    constructor(config, scene, fidelitySettings) {
        super({ ...config, type: 'blackhole' }, scene, fidelitySettings);
        
        // Calculate Schwarzschild radius
        const G = 6.674e-11;
        const c = 299792458;
        this.schwarzschildRadius = (2 * G * config.mass) / (c * c);
        this.scaledSchwarzschildRadius = config.radius * 0.5; // Visual representation
        
        this.eventHorizon = null;
        this.accretionDisk = null;
        
        this.createEventHorizon();
        this.createAccretionDisk();
    }

    createEventHorizon() {
        const geometry = new THREE.SphereGeometry(this.scaledSchwarzschildRadius, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        this.eventHorizon = new THREE.Mesh(geometry, material);
        this.mesh.add(this.eventHorizon);
    }

    createAccretionDisk() {
        const innerRadius = this.scaledSchwarzschildRadius * 1.5;
        const outerRadius = this.radius * 2;
        
        const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                innerColor: { value: new THREE.Color(0xFF8800) },
                outerColor: { value: new THREE.Color(0xFF0000) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 innerColor;
                uniform vec3 outerColor;
                varying vec2 vUv;
                
                void main() {
                    float dist = length(vUv - vec2(0.5));
                    vec3 color = mix(innerColor, outerColor, dist);
                    float alpha = (1.0 - dist) * 0.8;
                    float rotation = sin(vUv.x * 20.0 + time * 5.0) * 0.2 + 0.8;
                    gl_FragColor = vec4(color * rotation, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        this.accretionDisk = new THREE.Mesh(geometry, material);
        this.accretionDisk.rotation.x = Math.PI / 2;
        this.mesh.add(this.accretionDisk);
    }

    update(deltaTime, cameraPosition) {
        super.update(deltaTime, cameraPosition);
        
        // Animate accretion disk
        if (this.accretionDisk && this.accretionDisk.material.uniforms) {
            this.accretionDisk.material.uniforms.time.value += deltaTime;
            this.accretionDisk.rotation.z += deltaTime * 0.5;
        }
    }

    /**
     * Check if a point is within the event horizon
     */
    isWithinEventHorizon(point) {
        return this.position.distanceTo(point) < this.scaledSchwarzschildRadius;
    }

    /**
     * Get gravitational time dilation factor at a point
     */
    getTimeDilation(point) {
        const r = this.position.distanceTo(point);
        const rs = this.scaledSchwarzschildRadius;
        
        if (r <= rs) return 0; // Time stops at event horizon
        
        return Math.sqrt(1 - rs / r);
    }
}

export default CelestialBody;
