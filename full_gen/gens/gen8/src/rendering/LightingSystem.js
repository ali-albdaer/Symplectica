/**
 * LightingSystem.js
 * Manages all lighting in the solar system including sun light, shadows, and ambient lighting.
 * Optimized for performance while maintaining visual quality.
 */

import * as THREE from 'three';
import { QUALITY_PRESETS, RENDER_SCALE } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('Lighting');

export class LightingSystem {
    constructor(scene, qualityLevel = 'medium') {
        this.scene = scene;
        this.qualityLevel = qualityLevel;
        this.quality = QUALITY_PRESETS[qualityLevel];
        
        this.sunLight = null;
        this.ambientLight = null;
        this.hemisphereLight = null;
        this.lights = [];
        
        this.init();
        
        logger.info(`Lighting system initialized at ${qualityLevel} quality`);
    }

    init() {
        // Ambient light for base illumination
        this.ambientLight = new THREE.AmbientLight(0x111122, 0.1);
        this.scene.add(this.ambientLight);
        this.lights.push(this.ambientLight);
        
        // Hemisphere light for sky/ground ambient
        this.hemisphereLight = new THREE.HemisphereLight(0x444466, 0x222233, 0.2);
        this.scene.add(this.hemisphereLight);
        this.lights.push(this.hemisphereLight);
        
        // Main sun light (directional for parallel rays)
        this.sunLight = new THREE.DirectionalLight(0xffffee, 2.0);
        this.sunLight.position.set(0, 0, 0);
        
        // Shadow configuration based on quality
        if (this.quality.shadowsEnabled) {
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = this.quality.shadowMapSize;
            this.sunLight.shadow.mapSize.height = this.quality.shadowMapSize;
            this.sunLight.shadow.camera.near = 0.001;
            this.sunLight.shadow.camera.far = 1000;
            this.sunLight.shadow.camera.left = -50;
            this.sunLight.shadow.camera.right = 50;
            this.sunLight.shadow.camera.top = 50;
            this.sunLight.shadow.camera.bottom = -50;
            this.sunLight.shadow.bias = -0.0001;
            this.sunLight.shadow.normalBias = 0.02;
        }
        
        this.scene.add(this.sunLight);
        this.lights.push(this.sunLight);
        
        // Point light at sun position for close-range lighting
        this.sunPointLight = new THREE.PointLight(0xffdd88, 1.5, 0, 2);
        this.sunPointLight.position.set(0, 0, 0);
        this.scene.add(this.sunPointLight);
        this.lights.push(this.sunPointLight);
        
        logger.info('Created main lights');
    }

    /**
     * Update lighting based on sun position
     */
    update(sunPosition, playerPosition) {
        if (!sunPosition) return;
        
        // Update sun point light position
        const scaledSunPos = {
            x: sunPosition.x * RENDER_SCALE.distance,
            y: sunPosition.y * RENDER_SCALE.distance,
            z: sunPosition.z * RENDER_SCALE.distance,
        };
        
        this.sunPointLight.position.set(scaledSunPos.x, scaledSunPos.y, scaledSunPos.z);
        
        // Update directional light to point from sun to player
        if (playerPosition) {
            const scaledPlayerPos = {
                x: playerPosition.x * RENDER_SCALE.distance,
                y: playerPosition.y * RENDER_SCALE.distance,
                z: playerPosition.z * RENDER_SCALE.distance,
            };
            
            // Direction from sun to player
            const direction = new THREE.Vector3(
                scaledPlayerPos.x - scaledSunPos.x,
                scaledPlayerPos.y - scaledSunPos.y,
                scaledPlayerPos.z - scaledSunPos.z
            ).normalize();
            
            // Position directional light to simulate sun rays
            // The light needs to be positioned such that shadows are cast correctly
            this.sunLight.position.copy(direction.clone().multiplyScalar(-100));
            this.sunLight.target.position.set(scaledPlayerPos.x, scaledPlayerPos.y, scaledPlayerPos.z);
            
            // Update shadow camera to follow player
            if (this.quality.shadowsEnabled) {
                this.sunLight.shadow.camera.updateProjectionMatrix();
            }
        }
    }

    /**
     * Set quality level
     */
    setQuality(qualityLevel) {
        this.qualityLevel = qualityLevel;
        this.quality = QUALITY_PRESETS[qualityLevel];
        
        // Update shadow settings
        if (this.quality.shadowsEnabled) {
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = this.quality.shadowMapSize;
            this.sunLight.shadow.mapSize.height = this.quality.shadowMapSize;
            this.sunLight.shadow.map?.dispose();
            this.sunLight.shadow.map = null;
        } else {
            this.sunLight.castShadow = false;
        }
        
        logger.info(`Quality set to ${qualityLevel}`);
    }

    /**
     * Create a local light source
     */
    createLocalLight(position, color = 0xffffff, intensity = 1, distance = 10) {
        if (this.lights.length >= this.quality.maxLights) {
            logger.warn('Maximum lights reached');
            return null;
        }
        
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.set(position.x, position.y, position.z);
        this.scene.add(light);
        this.lights.push(light);
        
        return light;
    }

    /**
     * Remove a light
     */
    removeLight(light) {
        const idx = this.lights.indexOf(light);
        if (idx !== -1) {
            this.scene.remove(light);
            this.lights.splice(idx, 1);
            light.dispose?.();
        }
    }

    /**
     * Dispose all lights
     */
    dispose() {
        for (const light of this.lights) {
            this.scene.remove(light);
            light.dispose?.();
        }
        this.lights = [];
        logger.info('Lighting system disposed');
    }
}
