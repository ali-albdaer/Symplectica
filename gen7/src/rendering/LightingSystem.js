/**
 * Lighting System
 * Manages all lighting in the scene including sun, ambient, and dynamic lights
 */

import * as THREE from 'three';
import { CONFIG } from '../../config/globals.js';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.lights = [];
        this.sunLight = null;
        this.ambientLight = null;
        
        this.quality = CONFIG.GRAPHICS.shadows.quality;
        this.shadowsEnabled = CONFIG.GRAPHICS.shadows.enabled;
    }

    /**
     * Initialize lighting
     */
    initialize() {
        this.createAmbientLight();
        this.createStarfield();
        
        console.log('✓ Lighting system initialized');
    }

    /**
     * Create ambient light
     */
    createAmbientLight() {
        if (CONFIG.LIGHTING.ambient.enabled) {
            this.ambientLight = new THREE.AmbientLight(
                CONFIG.LIGHTING.ambient.color,
                CONFIG.LIGHTING.ambient.intensity
            );
            this.scene.add(this.ambientLight);
        }
    }

    /**
     * Create sun light (from star object)
     */
    createSunLight(star) {
        if (!CONFIG.LIGHTING.sunLight.enabled) return;

        // Main directional light from sun
        this.sunLight = new THREE.DirectionalLight(star.color, CONFIG.LIGHTING.sunLight.intensity);
        this.sunLight.position.copy(star.mesh.position);
        
        // Shadow settings
        if (this.shadowsEnabled && CONFIG.LIGHTING.sunLight.castShadows) {
            this.sunLight.castShadow = true;
            this.setupShadows(this.sunLight);
        }

        this.scene.add(this.sunLight);
        this.lights.push(this.sunLight);

        // Helper for debugging (hidden by default)
        // const helper = new THREE.DirectionalLightHelper(this.sunLight, 5);
        // this.scene.add(helper);

        return this.sunLight;
    }

    /**
     * Setup shadow properties based on quality
     */
    setupShadows(light) {
        const shadowConfig = CONFIG.GRAPHICS.shadows;
        
        // Shadow map size based on quality
        let mapSize;
        switch (this.quality) {
            case 'low':
                mapSize = 512;
                break;
            case 'medium':
                mapSize = 1024;
                break;
            case 'high':
                mapSize = 2048;
                break;
            default:
                mapSize = shadowConfig.mapSize;
        }

        light.shadow.mapSize.width = mapSize;
        light.shadow.mapSize.height = mapSize;
        light.shadow.bias = shadowConfig.bias;
        light.shadow.radius = shadowConfig.radius;

        // Shadow camera frustum
        const d = 200;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 1000;
    }

    /**
     * Create starfield background
     */
    createStarfield() {
        if (!CONFIG.GRAPHICS.stars.enabled) return;

        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        const starCount = CONFIG.GRAPHICS.stars.count;

        for (let i = 0; i < starCount; i++) {
            // Random position on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 5000;

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);

        console.log(`✓ Created starfield with ${starCount} stars`);
    }

    /**
     * Create planet surface light
     */
    createPlanetLight(planet) {
        if (!CONFIG.LIGHTING.surfaceLight.enabled) return;

        const light = new THREE.PointLight(0xFFFFFF, CONFIG.LIGHTING.surfaceLight.intensity, planet.renderRadius * 3);
        light.position.copy(planet.mesh.position);
        
        planet.mesh.add(light);
        this.lights.push(light);

        return light;
    }

    /**
     * Update lighting (move sun light, etc.)
     */
    update(deltaTime) {
        // Update sun light position if star has moved
        if (this.sunLight && this.sunLight.target) {
            // Could update target to follow player or main planet
        }
    }

    /**
     * Set shadow quality
     */
    setShadowQuality(quality) {
        this.quality = quality;
        
        // Update all shadow-casting lights
        this.lights.forEach(light => {
            if (light.castShadow) {
                this.setupShadows(light);
            }
        });

        console.log(`🔦 Shadow quality set to: ${quality}`);
    }

    /**
     * Toggle shadows
     */
    toggleShadows(enabled) {
        this.shadowsEnabled = enabled;
        CONFIG.GRAPHICS.shadows.enabled = enabled;

        this.lights.forEach(light => {
            if (light.castShadow !== undefined) {
                light.castShadow = enabled;
            }
        });

        console.log(`🔦 Shadows ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Update ambient light
     */
    setAmbientIntensity(intensity) {
        if (this.ambientLight) {
            this.ambientLight.intensity = intensity;
            CONFIG.LIGHTING.ambient.intensity = intensity;
        }
    }

    /**
     * Add custom light
     */
    addLight(light) {
        this.scene.add(light);
        this.lights.push(light);
    }

    /**
     * Remove light
     */
    removeLight(light) {
        const index = this.lights.indexOf(light);
        if (index !== -1) {
            this.lights.splice(index, 1);
            this.scene.remove(light);
        }
    }

    /**
     * Get lighting info
     */
    getInfo() {
        return {
            lightCount: this.lights.length,
            shadowsEnabled: this.shadowsEnabled,
            quality: this.quality,
            ambientIntensity: this.ambientLight ? this.ambientLight.intensity : 0,
        };
    }
}

export default LightingSystem;
