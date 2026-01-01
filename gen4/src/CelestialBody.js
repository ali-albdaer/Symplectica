/**
 * Celestial Body System
 * Handles creation and rendering of stars, planets, and moons
 */

import { Config, CELESTIAL_BODIES, GRAPHICS } from './config.js';
import { Vector3, degToRad, randomRange } from './Math3D.js';
import { PhysicsBody } from './Physics.js';

export class CelestialBodyManager {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.bodies = new Map();
        this.orbitLines = new Map();
        
        // World scale factor (km to world units)
        this.worldScale = 1e-6;  // 1 unit = 1000 km
        this.distanceScale = 1e-7;  // Compress orbital distances
    }
    
    /**
     * Initialize all celestial bodies from config
     */
    initialize() {
        // Create sun first
        if (CELESTIAL_BODIES.sun) {
            this.createBody('sun', CELESTIAL_BODIES.sun);
        }
        
        // Create planets
        for (const [id, config] of Object.entries(CELESTIAL_BODIES)) {
            if (config.type === 'planet') {
                this.createBody(id, config);
            }
        }
        
        // Create moons
        for (const [id, config] of Object.entries(CELESTIAL_BODIES)) {
            if (config.type === 'moon') {
                this.createBody(id, config);
            }
        }
        
        // Create star field
        this.createStarField();
    }
    
    /**
     * Create a celestial body
     */
    createBody(id, config) {
        const body = new CelestialBody(id, config, this);
        body.createMesh(this.scene);
        
        // Add to physics system
        const physicsBody = new PhysicsBody({
            id: id,
            type: 'celestial',
            position: body.position,
            velocity: body.velocity,
            mass: config.mass,
            radius: config.radius * this.worldScale,
            scaledRadius: config.radius * this.worldScale,
            atmosphereHeight: config.atmosphereHeight ? config.atmosphereHeight * this.worldScale : 0,
            atmosphereRadius: config.atmosphereHeight ? 
                (config.radius + config.atmosphereHeight) * this.worldScale : 0,
            atmosphereDensity: config.atmosphereDensity || 0,
            data: config
        });
        
        body.physicsBody = physicsBody;
        this.physics.addBody(physicsBody);
        
        this.bodies.set(id, body);
        
        // Create orbit visualization
        if (config.parentBody && Config.debug.showOrbits) {
            this.createOrbitLine(id, config);
        }
        
        return body;
    }
    
    /**
     * Create orbit visualization line
     */
    createOrbitLine(id, config) {
        const parent = this.bodies.get(config.parentBody);
        if (!parent) return;
        
        const segments = 128;
        const points = [];
        const a = config.semiMajorAxis * this.distanceScale;
        const e = config.eccentricity || 0;
        const b = a * Math.sqrt(1 - e * e);
        
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);
            points.push(new THREE.Vector3(x, 0, z));
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x444488,
            transparent: true,
            opacity: 0.3
        });
        
        const orbitLine = new THREE.Line(geometry, material);
        orbitLine.position.copy(parent.mesh.position);
        
        // Apply inclination
        if (config.inclination) {
            orbitLine.rotation.x = degToRad(config.inclination);
        }
        
        this.scene.add(orbitLine);
        this.orbitLines.set(id, orbitLine);
    }
    
    /**
     * Create background star field
     */
    createStarField() {
        const preset = GRAPHICS.qualityPresets[GRAPHICS.currentPreset];
        const starCount = preset.starCount;
        
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            // Random position on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 10000;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Star color (white to blue/yellow)
            const temp = Math.random();
            if (temp > 0.95) {
                // Blue hot stars
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.8;
                colors[i * 3 + 2] = 1;
            } else if (temp > 0.9) {
                // Yellow stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0.95;
                colors[i * 3 + 2] = 0.7;
            } else {
                // White stars
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 1;
                colors[i * 3 + 2] = 1;
            }
            
            sizes[i] = randomRange(0.5, 2);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: false
        });
        
        this.starField = new THREE.Points(geometry, material);
        this.scene.add(this.starField);
    }
    
    /**
     * Update all celestial bodies
     */
    update(deltaTime) {
        for (const [id, body] of this.bodies) {
            body.update(deltaTime);
            
            // Sync physics body position to mesh
            if (body.physicsBody && body.physicsBody.renderPosition) {
                body.mesh.position.set(
                    body.physicsBody.renderPosition.x,
                    body.physicsBody.renderPosition.y,
                    body.physicsBody.renderPosition.z
                );
            }
            
            // Update orbit line position
            const orbitLine = this.orbitLines.get(id);
            if (orbitLine && body.config.parentBody) {
                const parent = this.bodies.get(body.config.parentBody);
                if (parent) {
                    orbitLine.position.copy(parent.mesh.position);
                }
            }
        }
    }
    
    /**
     * Get body by ID
     */
    getBody(id) {
        return this.bodies.get(id);
    }
    
    /**
     * Get the spawn planet (planet1)
     */
    getSpawnPlanet() {
        return this.bodies.get('planet1');
    }
    
    /**
     * Get surface position on a body
     */
    getSurfacePosition(bodyId, latitude = 0, longitude = 0) {
        const body = this.bodies.get(bodyId);
        if (!body) return null;
        
        const radius = body.config.radius * this.worldScale;
        const latRad = degToRad(latitude);
        const lonRad = degToRad(longitude);
        
        const position = new Vector3(
            radius * Math.cos(latRad) * Math.cos(lonRad),
            radius * Math.sin(latRad),
            radius * Math.cos(latRad) * Math.sin(lonRad)
        );
        
        // Add body position
        position.add(body.position);
        
        return position;
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        for (const body of this.bodies.values()) {
            body.dispose();
        }
        this.bodies.clear();
        
        for (const line of this.orbitLines.values()) {
            line.geometry.dispose();
            line.material.dispose();
            this.scene.remove(line);
        }
        this.orbitLines.clear();
        
        if (this.starField) {
            this.starField.geometry.dispose();
            this.starField.material.dispose();
            this.scene.remove(this.starField);
        }
    }
}

export class CelestialBody {
    constructor(id, config, manager) {
        this.id = id;
        this.config = config;
        this.manager = manager;
        
        this.mesh = null;
        this.atmosphereMesh = null;
        this.cloudMesh = null;
        this.glowMesh = null;
        this.physicsBody = null;
        
        // Position and velocity in world space
        this.position = new Vector3();
        this.velocity = new Vector3();
        
        // Calculate initial orbital position and velocity
        this.initializeOrbit();
        
        // Rotation state
        this.rotationAngle = 0;
        this.axialTilt = degToRad(config.axialTilt || 0);
    }
    
    /**
     * Initialize orbital position and velocity
     */
    initializeOrbit() {
        const config = this.config;
        const scale = this.manager.distanceScale;
        
        if (config.parentBody) {
            const parent = this.manager.bodies.get(config.parentBody);
            const parentPos = parent ? parent.position : new Vector3();
            
            // Start at perihelion
            const a = config.semiMajorAxis * scale;
            const e = config.eccentricity || 0;
            const perihelion = a * (1 - e);
            
            // Random starting angle for variety
            const startAngle = Math.random() * Math.PI * 2;
            
            this.position.x = parentPos.x + perihelion * Math.cos(startAngle);
            this.position.y = parentPos.y;
            this.position.z = parentPos.z + perihelion * Math.sin(startAngle);
            
            // Calculate orbital velocity for circular orbit approximation
            // v = sqrt(GM/r) - simplified
            const G = Config.physics.G;
            const parentMass = parent ? parent.config.mass : CELESTIAL_BODIES.sun.mass;
            const r = perihelion / Config.physics.SCALE;
            const orbitalVelocity = Math.sqrt(G * parentMass / r) * Config.physics.SCALE;
            
            // Velocity perpendicular to radius
            this.velocity.x = -orbitalVelocity * Math.sin(startAngle);
            this.velocity.z = orbitalVelocity * Math.cos(startAngle);
        } else {
            // Sun or fixed body
            this.position.set(
                config.position?.x || 0,
                config.position?.y || 0,
                config.position?.z || 0
            );
            this.velocity.set(
                config.velocity?.x || 0,
                config.velocity?.y || 0,
                config.velocity?.z || 0
            );
        }
    }
    
    /**
     * Create 3D mesh for the body
     */
    createMesh(scene) {
        const config = this.config;
        const scale = this.manager.worldScale;
        const preset = GRAPHICS.qualityPresets[GRAPHICS.currentPreset];
        
        // Geometry
        const radius = config.radius * scale;
        const segments = preset.planetSegments;
        const geometry = new THREE.SphereGeometry(radius, segments, segments / 2);
        
        // Create material based on body type
        let material;
        
        if (config.type === 'star') {
            // Emissive material for stars
            material = new THREE.MeshBasicMaterial({
                color: config.color,
                emissive: config.emissiveColor || config.color,
                emissiveIntensity: config.emissiveIntensity || 1
            });
            
            // Add glow effect
            this.createGlow(scene, radius);
            
            // Add corona
            this.createCorona(scene, radius);
        } else {
            // Standard material for planets/moons
            material = new THREE.MeshStandardMaterial({
                color: config.color,
                roughness: 0.8,
                metalness: 0.1,
            });
            
            // Add procedural texture
            this.applyProceduralTexture(geometry, config);
            
            // Add atmosphere if applicable
            if (config.hasAtmosphere && GRAPHICS.atmosphere.enabled) {
                this.createAtmosphere(scene, radius, config);
            }
            
            // Add clouds if applicable
            if (config.cloudCoverage && config.cloudCoverage > 0) {
                this.createClouds(scene, radius, config);
            }
        }
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        
        // Apply axial tilt
        this.mesh.rotation.z = this.axialTilt;
        
        // Enable shadows
        if (config.type !== 'star' && GRAPHICS.shadows.enabled) {
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }
        
        // Store reference
        this.mesh.userData.celestialBody = this;
        
        scene.add(this.mesh);
        
        return this.mesh;
    }
    
    /**
     * Apply procedural texture to geometry
     */
    applyProceduralTexture(geometry, config) {
        const positions = geometry.attributes.position;
        const colors = new Float32Array(positions.count * 3);
        
        const baseColor = new THREE.Color(config.color);
        const variation = config.terrainVariation || 0.02;
        
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            // Simple noise-like variation
            const noise = this.simpleNoise(x * 10, y * 10, z * 10);
            const heightNoise = this.simpleNoise(x * 5, y * 5, z * 5);
            
            // Color variation
            const colorVar = 0.1 + noise * 0.1;
            colors[i * 3] = Math.min(1, baseColor.r * (1 + colorVar));
            colors[i * 3 + 1] = Math.min(1, baseColor.g * (1 + colorVar * 0.5));
            colors[i * 3 + 2] = Math.min(1, baseColor.b * (1 - colorVar * 0.3));
            
            // Height variation
            const len = Math.sqrt(x * x + y * y + z * z);
            const heightOffset = heightNoise * variation * len;
            const factor = (len + heightOffset) / len;
            
            positions.setXYZ(i,
                x * factor,
                y * factor,
                z * factor
            );
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    }
    
    /**
     * Simple pseudo-random noise function
     */
    simpleNoise(x, y, z) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return n - Math.floor(n);
    }
    
    /**
     * Create glow effect for stars
     */
    createGlow(scene, radius) {
        const glowGeometry = new THREE.SphereGeometry(radius * 1.2, 32, 16);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(this.config.color) },
                intensity: { value: 0.5 }
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
                    float glow = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(glowColor, glow * intensity);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh?.add(this.glowMesh);
    }
    
    /**
     * Create corona effect for stars
     */
    createCorona(scene, radius) {
        const coronaSize = this.config.coronaSize || 1.5;
        const coronaGeometry = new THREE.SphereGeometry(radius * coronaSize, 32, 16);
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                coronaColor: { value: new THREE.Color(this.config.coronaColor || 0xFFDDAA) },
                time: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 coronaColor;
                uniform float time;
                varying vec2 vUv;
                varying vec3 vNormal;
                
                void main() {
                    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    float flicker = 0.9 + 0.1 * sin(time * 3.0 + vUv.x * 10.0);
                    gl_FragColor = vec4(coronaColor * flicker, intensity * 0.3);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.coronaMesh = new THREE.Mesh(coronaGeometry, coronaMaterial);
        scene.add(this.coronaMesh);
    }
    
    /**
     * Create atmosphere effect
     */
    createAtmosphere(scene, radius, config) {
        const atmosphereHeight = (config.atmosphereHeight || 50) * this.manager.worldScale;
        const atmosphereGeometry = new THREE.SphereGeometry(
            radius + atmosphereHeight,
            64, 32
        );
        
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: new THREE.Color(config.atmosphereColor || 0x88AAFF) },
                sunPosition: { value: new THREE.Vector3(0, 0, 0) },
                planetRadius: { value: radius },
                atmosphereRadius: { value: radius + atmosphereHeight }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                varying vec3 vNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * viewMatrix * worldPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 atmosphereColor;
                uniform vec3 sunPosition;
                uniform float planetRadius;
                uniform float atmosphereRadius;
                
                varying vec3 vWorldPosition;
                varying vec3 vNormal;
                
                void main() {
                    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                    float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
                    rim = pow(rim, 2.0);
                    
                    // Atmospheric scattering approximation
                    vec3 sunDir = normalize(sunPosition - vWorldPosition);
                    float sunDot = max(0.0, dot(vNormal, sunDir));
                    
                    vec3 finalColor = atmosphereColor * (0.5 + 0.5 * sunDot);
                    float alpha = rim * 0.6;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.mesh?.add(this.atmosphereMesh);
    }
    
    /**
     * Create cloud layer
     */
    createClouds(scene, radius, config) {
        const cloudHeight = radius * 1.02;
        const cloudGeometry = new THREE.SphereGeometry(cloudHeight, 64, 32);
        
        const cloudMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: config.cloudCoverage * 0.5,
            alphaMap: this.generateCloudTexture(config.cloudCoverage),
            side: THREE.DoubleSide
        });
        
        this.cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
        this.mesh?.add(this.cloudMesh);
    }
    
    /**
     * Generate procedural cloud texture
     */
    generateCloudTexture(coverage) {
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(size, size);
        
        for (let i = 0; i < size * size; i++) {
            const x = i % size;
            const y = Math.floor(i / size);
            
            // Simple cloud noise
            const noise = this.simpleNoise(x * 0.02, y * 0.02, 0);
            const alpha = noise > (1 - coverage) ? 255 : 0;
            
            imageData.data[i * 4] = 255;
            imageData.data[i * 4 + 1] = 255;
            imageData.data[i * 4 + 2] = 255;
            imageData.data[i * 4 + 3] = alpha;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }
    
    /**
     * Update body state
     */
    update(deltaTime) {
        // Update rotation
        if (this.config.rotationPeriod) {
            const rotationSpeed = (2 * Math.PI) / (this.config.rotationPeriod * 86400); // radians per second
            this.rotationAngle += rotationSpeed * deltaTime * Config.physics.TIME_SCALE;
            
            if (this.mesh) {
                this.mesh.rotation.y = this.rotationAngle;
            }
        }
        
        // Update cloud rotation (slightly faster)
        if (this.cloudMesh) {
            this.cloudMesh.rotation.y = this.rotationAngle * 1.1;
        }
        
        // Update corona/glow animation
        if (this.coronaMesh) {
            this.coronaMesh.material.uniforms.time.value += deltaTime;
            this.coronaMesh.position.copy(this.mesh.position);
        }
        
        // Sync position from physics
        if (this.physicsBody) {
            this.position.copy(this.physicsBody.position);
        }
        
        // Update atmosphere sun position
        if (this.atmosphereMesh) {
            const sun = this.manager.getBody('sun');
            if (sun) {
                this.atmosphereMesh.material.uniforms.sunPosition.value.copy(sun.mesh.position);
            }
        }
    }
    
    /**
     * Get surface gravity at this body
     */
    getSurfaceGravity() {
        return this.config.surfaceGravity || 9.81;
    }
    
    /**
     * Get up vector at a world position
     */
    getUpVector(worldPosition) {
        const dx = worldPosition.x - this.position.x;
        const dy = worldPosition.y - this.position.y;
        const dz = worldPosition.z - this.position.z;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return new Vector3(dx / len, dy / len, dz / len);
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            if (Array.isArray(this.mesh.material)) {
                this.mesh.material.forEach(m => m.dispose());
            } else {
                this.mesh.material.dispose();
            }
            this.manager.scene.remove(this.mesh);
        }
        
        if (this.atmosphereMesh) {
            this.atmosphereMesh.geometry.dispose();
            this.atmosphereMesh.material.dispose();
        }
        
        if (this.cloudMesh) {
            this.cloudMesh.geometry.dispose();
            this.cloudMesh.material.dispose();
        }
        
        if (this.glowMesh) {
            this.glowMesh.geometry.dispose();
            this.glowMesh.material.dispose();
        }
        
        if (this.coronaMesh) {
            this.coronaMesh.geometry.dispose();
            this.coronaMesh.material.dispose();
            this.manager.scene.remove(this.coronaMesh);
        }
    }
}

export default CelestialBodyManager;
