/**
 * CelestialBody.js
 * Base class for all celestial bodies (stars, planets, moons).
 * Handles rendering, physics integration, and procedural generation.
 */

import * as THREE from 'three';
import { RENDER_SCALE, CELESTIAL_BODIES } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('CelestialBody');

export class CelestialBody {
    constructor(config, physicsEngine) {
        this.config = config;
        this.physics = physicsEngine;
        this.name = config.name;
        this.type = config.type;
        
        // Physics properties (real units)
        this.mass = config.mass;
        this.radius = config.radius;
        this.rotationPeriod = config.rotationPeriod;
        
        // Physics state (managed by physics engine)
        this.position = { ...config.position };
        this.velocity = { ...config.velocity };
        
        // Three.js objects
        this.mesh = null;
        this.group = new THREE.Group();
        this.atmosphere = null;
        this.orbitLine = null;
        this.orbitPoints = [];
        
        // Rotation state
        this.rotationAngle = 0;
        this.axialTilt = (config.axialTilt || 0) * Math.PI / 180;
        
        // Visual properties
        this.color = config.color || 0xFFFFFF;
        this.emissive = config.emissive || 0x000000;
        this.emissiveIntensity = config.emissiveIntensity || 0;
        
        logger.info(`Creating celestial body: ${this.name}`);
    }

    /**
     * Initialize the 3D representation
     */
    async init() {
        logger.mark('init');
        
        // Calculate rendered size
        const scaledRadius = this.calculateRenderedRadius();
        
        // Create the main sphere
        const geometry = new THREE.SphereGeometry(scaledRadius, 64, 64);
        const material = this.createMaterial();
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Apply axial tilt
        this.mesh.rotation.z = this.axialTilt;
        
        this.group.add(this.mesh);
        
        // Add atmosphere for planets
        if (this.config.hasAtmosphere) {
            this.createAtmosphere(scaledRadius);
        }
        
        // Add glow for stars
        if (this.type === 'star') {
            this.createStarGlow(scaledRadius);
        }
        
        // Create orbit visualization
        this.createOrbitLine();
        
        // Register with physics engine
        this.physicsBody = this.physics.addBody({
            name: this.name,
            mass: this.mass,
            radius: this.radius,
            position: { ...this.position },
            velocity: { ...this.velocity },
            celestialBody: this, // Reference back
        });
        
        // Update initial position
        this.updatePosition();
        
        logger.measure(`${this.name} init`, 'init');
        return this;
    }

    /**
     * Calculate the rendered radius with scaling
     */
    calculateRenderedRadius() {
        let scaled = this.radius * RENDER_SCALE.bodySize;
        
        // Clamp to min/max for visibility
        scaled = Math.max(RENDER_SCALE.minBodySize, Math.min(RENDER_SCALE.maxBodySize, scaled));
        
        // Stars get extra size boost
        if (this.type === 'star') {
            scaled = Math.max(scaled, 5);
        }
        
        return scaled;
    }

    /**
     * Create appropriate material based on body type
     */
    createMaterial() {
        if (this.type === 'star') {
            return new THREE.MeshBasicMaterial({
                color: this.color,
                emissive: this.emissive,
                emissiveIntensity: this.emissiveIntensity,
            });
        }
        
        // Procedural texture for planets
        const texture = this.generateProceduralTexture();
        
        return new THREE.MeshStandardMaterial({
            map: texture,
            color: this.color,
            roughness: 0.8,
            metalness: 0.1,
        });
    }

    /**
     * Generate a procedural texture for the body
     */
    generateProceduralTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Base color
        const baseColor = new THREE.Color(this.color);
        ctx.fillStyle = `rgb(${baseColor.r * 255}, ${baseColor.g * 255}, ${baseColor.b * 255})`;
        ctx.fillRect(0, 0, size, size);
        
        // Add noise/variation
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 40;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        
        // Add some features based on type
        if (this.type === 'planet') {
            this.addPlanetFeatures(ctx, size, baseColor);
        } else if (this.type === 'moon') {
            this.addMoonCraters(ctx, size);
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        return texture;
    }

    addPlanetFeatures(ctx, size, baseColor) {
        // Add horizontal bands (like gas giants or weather patterns)
        const bandCount = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < bandCount; i++) {
            const y = Math.random() * size;
            const height = 10 + Math.random() * 30;
            const alpha = 0.1 + Math.random() * 0.2;
            
            ctx.fillStyle = `rgba(${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${Math.random() > 0.5 ? 255 : 0}, ${alpha})`;
            ctx.fillRect(0, y, size, height);
        }
    }

    addMoonCraters(ctx, size) {
        const craterCount = 20 + Math.floor(Math.random() * 30);
        
        for (let i = 0; i < craterCount; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const radius = 5 + Math.random() * 20;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.2})`;
            ctx.fill();
            
            // Crater rim
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.random() * 0.1})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    /**
     * Create atmospheric glow effect
     */
    createAtmosphere(baseRadius) {
        const atmosphereGeometry = new THREE.SphereGeometry(baseRadius * 1.02, 32, 32);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereColor: { value: new THREE.Color(this.config.atmosphereColor || 0x88AAFF) },
                atmosphereDensity: { value: this.config.atmosphereDensity || 1.0 },
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
                uniform vec3 atmosphereColor;
                uniform float atmosphereDensity;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(atmosphereColor, intensity * atmosphereDensity * 0.5);
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
        });
        
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.group.add(this.atmosphere);
    }

    /**
     * Create star glow effect
     */
    createStarGlow(baseRadius) {
        // Inner glow
        const glowGeometry = new THREE.SphereGeometry(baseRadius * 1.2, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(this.color) },
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
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(glowColor, intensity * 0.8);
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.group.add(glow);
        
        // Corona effect
        const coronaGeometry = new THREE.SphereGeometry(baseRadius * 1.5, 32, 32);
        const coronaMaterial = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(this.color) },
                time: { value: 0 },
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec2 vUv;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float time;
                varying vec3 vNormal;
                varying vec2 vUv;
                void main() {
                    float intensity = pow(0.4 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
                    float flicker = 0.9 + 0.1 * sin(time * 2.0 + vUv.x * 10.0);
                    gl_FragColor = vec4(glowColor, intensity * 0.3 * flicker);
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true,
        });
        
        this.corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        this.group.add(this.corona);
    }

    /**
     * Create orbit visualization line
     */
    createOrbitLine() {
        const material = new THREE.LineBasicMaterial({
            color: 0x444466,
            transparent: true,
            opacity: 0.3,
        });
        
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(1000 * 3); // Pre-allocate
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setDrawRange(0, 0);
        
        this.orbitLine = new THREE.Line(geometry, material);
    }

    /**
     * Update from physics simulation
     */
    updateFromPhysics() {
        if (this.physicsBody) {
            this.position = { ...this.physicsBody.position };
            this.velocity = { ...this.physicsBody.velocity };
        }
    }

    /**
     * Update visual position from physics position
     */
    updatePosition() {
        const scaledPos = this.getScaledPosition();
        this.group.position.set(scaledPos.x, scaledPos.y, scaledPos.z);
        
        // Record orbit point
        if (this.type !== 'star') {
            this.recordOrbitPoint();
        }
    }

    /**
     * Get position scaled for rendering
     */
    getScaledPosition() {
        return {
            x: this.position.x * RENDER_SCALE.distance,
            y: this.position.y * RENDER_SCALE.distance,
            z: this.position.z * RENDER_SCALE.distance,
        };
    }

    /**
     * Record current position for orbit trail
     */
    recordOrbitPoint() {
        const pos = this.getScaledPosition();
        this.orbitPoints.push(new THREE.Vector3(pos.x, pos.y, pos.z));
        
        // Limit orbit trail length
        const maxPoints = 500;
        if (this.orbitPoints.length > maxPoints) {
            this.orbitPoints.shift();
        }
        
        // Update orbit line geometry
        if (this.orbitLine && this.orbitPoints.length > 1) {
            const positions = this.orbitLine.geometry.attributes.position.array;
            for (let i = 0; i < this.orbitPoints.length; i++) {
                positions[i * 3] = this.orbitPoints[i].x;
                positions[i * 3 + 1] = this.orbitPoints[i].y;
                positions[i * 3 + 2] = this.orbitPoints[i].z;
            }
            this.orbitLine.geometry.attributes.position.needsUpdate = true;
            this.orbitLine.geometry.setDrawRange(0, this.orbitPoints.length);
        }
    }

    /**
     * Update rotation
     */
    updateRotation(deltaTime, timeScale) {
        if (this.rotationPeriod > 0) {
            const rotationSpeed = (2 * Math.PI) / this.rotationPeriod;
            this.rotationAngle += rotationSpeed * deltaTime * timeScale;
            
            if (this.mesh) {
                this.mesh.rotation.y = this.rotationAngle;
            }
        }
        
        // Update corona time uniform for stars
        if (this.corona) {
            this.corona.material.uniforms.time.value += deltaTime * 0.001;
        }
    }

    /**
     * Main update loop
     */
    update(deltaTime, timeScale) {
        this.updateFromPhysics();
        this.updatePosition();
        this.updateRotation(deltaTime, timeScale);
    }

    /**
     * Get the Three.js group for adding to scene
     */
    getObject3D() {
        return this.group;
    }

    /**
     * Get the orbit line for adding to scene
     */
    getOrbitLine() {
        return this.orbitLine;
    }

    /**
     * Get surface position at lat/long
     */
    getSurfacePosition(latitude, longitude, altitude = 0) {
        const lat = latitude * Math.PI / 180;
        const lon = longitude * Math.PI / 180;
        const r = this.radius + altitude;
        
        // Position relative to body center
        const local = {
            x: r * Math.cos(lat) * Math.cos(lon),
            y: r * Math.sin(lat),
            z: r * Math.cos(lat) * Math.sin(lon),
        };
        
        // Transform to world position
        return {
            x: this.position.x + local.x,
            y: this.position.y + local.y,
            z: this.position.z + local.z,
        };
    }

    /**
     * Get surface gravity magnitude
     */
    getSurfaceGravity() {
        const G = 6.67430e-20; // km³/kg/s²
        return G * this.mass / (this.radius * this.radius);
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            if (this.mesh.material.map) {
                this.mesh.material.map.dispose();
            }
        }
        
        if (this.atmosphere) {
            this.atmosphere.geometry.dispose();
            this.atmosphere.material.dispose();
        }
        
        if (this.orbitLine) {
            this.orbitLine.geometry.dispose();
            this.orbitLine.material.dispose();
        }
        
        logger.info(`Disposed celestial body: ${this.name}`);
    }
}
