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
        // Sun directional light (primary)
        this.lights.sunLight = new THREE.DirectionalLight(
            LIGHTING.sunLight.color,
            LIGHTING.sunLight.intensity
        );
        this.lights.sunLight.position.copy(this.sun.position).add(new THREE.Vector3(500, 500, 500));
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
        
        // Sun point glow for close range
        this.lights.sunPoint = new THREE.PointLight(0xFFA500, 3, 2000, 2);
        this.lights.sunPoint.position.copy(this.sun.position);
        this.scene.add(this.lights.sunPoint);
    }

    update(camera) {
        // Keep light anchored to the sun's position
        if (this.lights.sunLight && this.sun) {
            this.lights.sunLight.position.copy(this.sun.position).add(new THREE.Vector3(500, 500, 500));
            this.lights.sunLight.target.position.copy(this.sun.position);
            this.lights.sunLight.target.updateMatrixWorld();
        }
        if (this.lights.sunPoint && this.sun) {
            this.lights.sunPoint.position.copy(this.sun.position);
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
