/**
 * Lighting System - Manages all lights and shadows in the scene
 */

import * as THREE from 'three';
import { LIGHTING, GRAPHICS } from './config.js';

export class LightingSystem {
    constructor(scene, sun) {
        this.scene = scene;
        this.sun = sun;
        this.lights = {};
        
        this.createLights();
    }

    createLights() {
        // Ambient light for base illumination
        this.lights.ambient = new THREE.AmbientLight(
            LIGHTING.ambient.color,
            LIGHTING.ambient.intensity
        );
        this.scene.add(this.lights.ambient);
        
        // Sun directional light (main light source)
        this.lights.sunLight = new THREE.DirectionalLight(
            LIGHTING.sunLight.color,
            LIGHTING.sunLight.intensity
        );
        this.lights.sunLight.position.copy(this.sun.position);
        this.lights.sunLight.castShadow = LIGHTING.sunLight.castShadow;
        
        // Configure shadows
        if (GRAPHICS.shadowMapSize > 0) {
            this.lights.sunLight.shadow.mapSize.width = GRAPHICS.shadowMapSize;
            this.lights.sunLight.shadow.mapSize.height = GRAPHICS.shadowMapSize;
            this.lights.sunLight.shadow.camera.near = GRAPHICS.shadowCameraNear;
            this.lights.sunLight.shadow.camera.far = GRAPHICS.shadowCameraFar;
            this.lights.sunLight.shadow.camera.left = -50;
            this.lights.sunLight.shadow.camera.right = 50;
            this.lights.sunLight.shadow.camera.top = 50;
            this.lights.sunLight.shadow.camera.bottom = -50;
            this.lights.sunLight.shadow.bias = GRAPHICS.shadowBias;
            this.lights.sunLight.shadow.radius = GRAPHICS.shadowRadius;
        }
        
        this.scene.add(this.lights.sunLight);
        
        // Sun point light for close-range illumination
        this.lights.sunPoint = new THREE.PointLight(
            0xFFA500,
            2,
            1000,
            2
        );
        this.lights.sunPoint.position.copy(this.sun.position);
        this.scene.add(this.lights.sunPoint);
        
        // Hemisphere light for atmospheric scattering effect
        this.lights.hemisphere = new THREE.HemisphereLight(
            0x87CEEB, // Sky color
            0x332211, // Ground color
            0.3
        );
        this.scene.add(this.lights.hemisphere);
    }

    update(camera) {
        // Update sun light to follow camera for optimal shadow coverage
        if (this.lights.sunLight && camera) {
            const offset = new THREE.Vector3(50, 100, 50);
            this.lights.sunLight.position.copy(camera.position).add(offset);
            this.lights.sunLight.target.position.copy(camera.position);
            this.lights.sunLight.target.updateMatrixWorld();
        }
    }

    updateShadowQuality(quality) {
        if (!this.lights.sunLight) return;
        
        const sizes = {
            'ultra': 4096,
            'high': 2048,
            'medium': 1024,
            'low': 512,
            'disabled': 0
        };
        
        const size = sizes[quality] || 2048;
        
        if (size === 0) {
            this.lights.sunLight.castShadow = false;
        } else {
            this.lights.sunLight.castShadow = true;
            this.lights.sunLight.shadow.mapSize.width = size;
            this.lights.sunLight.shadow.mapSize.height = size;
            this.lights.sunLight.shadow.map?.dispose();
            this.lights.sunLight.shadow.map = null;
        }
    }

    setIntensity(lightName, intensity) {
        if (this.lights[lightName]) {
            this.lights[lightName].intensity = intensity;
        }
    }

    dispose() {
        Object.values(this.lights).forEach(light => {
            if (light.dispose) light.dispose();
            this.scene.remove(light);
        });
    }
}
