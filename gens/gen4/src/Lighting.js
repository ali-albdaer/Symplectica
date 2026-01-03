/**
 * Lighting System
 * Handles sun light, shadows, and ambient lighting
 */

import { Config, GRAPHICS, CELESTIAL_BODIES } from './config.js';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        
        this.sunLight = null;
        this.ambientLight = null;
        this.hemisphereLight = null;
        
        this.shadowCascades = [];
        this.lightHelpers = [];
        
        this.sunPosition = new THREE.Vector3(0, 0, 0);
    }
    
    /**
     * Initialize lighting system
     */
    initialize() {
        this.createAmbientLight();
        this.createHemisphereLight();
        this.createSunLight();
        
        // Configure shadows
        this.configureShadows();
    }
    
    /**
     * Create ambient light for base illumination
     */
    createAmbientLight() {
        const intensity = 0.1;
        this.ambientLight = new THREE.AmbientLight(0x404060, intensity);
        this.scene.add(this.ambientLight);
    }
    
    /**
     * Create hemisphere light for sky/ground color
     */
    createHemisphereLight() {
        // Sky color, ground color, intensity
        this.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362D26, 0.3);
        this.scene.add(this.hemisphereLight);
    }
    
    /**
     * Create main sun directional light
     */
    createSunLight() {
        const sunConfig = CELESTIAL_BODIES.sun;
        const intensity = 2;
        
        this.sunLight = new THREE.DirectionalLight(0xFFFFEE, intensity);
        this.sunLight.position.set(0, 0, 0);
        
        // Configure shadows
        if (GRAPHICS.shadows.enabled) {
            this.sunLight.castShadow = true;
            
            const shadowQuality = GRAPHICS.qualityPresets[GRAPHICS.currentPreset];
            const mapSize = shadowQuality.shadowMapSize;
            
            this.sunLight.shadow.mapSize.width = mapSize;
            this.sunLight.shadow.mapSize.height = mapSize;
            this.sunLight.shadow.camera.near = 0.1;
            this.sunLight.shadow.camera.far = 1000;
            
            // Shadow camera frustum (will be updated based on player position)
            const frustumSize = 50;
            this.sunLight.shadow.camera.left = -frustumSize;
            this.sunLight.shadow.camera.right = frustumSize;
            this.sunLight.shadow.camera.top = frustumSize;
            this.sunLight.shadow.camera.bottom = -frustumSize;
            
            this.sunLight.shadow.bias = GRAPHICS.shadows.bias;
            this.sunLight.shadow.normalBias = GRAPHICS.shadows.normalBias;
            
            // Use PCF soft shadows
            this.sunLight.shadow.radius = 2;
        }
        
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);
    }
    
    /**
     * Configure shadow settings based on quality
     */
    configureShadows() {
        const quality = GRAPHICS.shadows.quality;
        
        if (quality === 'off') {
            this.sunLight.castShadow = false;
            return;
        }
        
        let mapSize, bias, normalBias;
        
        switch (quality) {
            case 'low':
                mapSize = 512;
                bias = -0.001;
                normalBias = 0.05;
                break;
            case 'medium':
                mapSize = 1024;
                bias = -0.0005;
                normalBias = 0.03;
                break;
            case 'high':
            default:
                mapSize = 2048;
                bias = -0.0001;
                normalBias = 0.02;
                break;
        }
        
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = mapSize;
        this.sunLight.shadow.mapSize.height = mapSize;
        this.sunLight.shadow.bias = bias;
        this.sunLight.shadow.normalBias = normalBias;
        
        // Need to update shadow map
        if (this.sunLight.shadow.map) {
            this.sunLight.shadow.map.dispose();
            this.sunLight.shadow.map = null;
        }
    }
    
    /**
     * Update lighting based on player position
     */
    update(playerPosition, sunWorldPosition) {
        // Update sun light direction
        if (sunWorldPosition) {
            this.sunPosition.copy(sunWorldPosition);
            
            // Point light away from sun towards player area
            if (playerPosition) {
                const dx = playerPosition.x - sunWorldPosition.x;
                const dy = playerPosition.y - sunWorldPosition.y;
                const dz = playerPosition.z - sunWorldPosition.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (dist > 0.001) {
                    // Position light to shine from sun direction
                    const lightDist = 100;
                    this.sunLight.position.set(
                        playerPosition.x - (dx / dist) * lightDist,
                        playerPosition.y - (dy / dist) * lightDist,
                        playerPosition.z - (dz / dist) * lightDist
                    );
                    
                    // Target is player position
                    this.sunLight.target.position.copy(playerPosition);
                }
            }
        }
        
        // Update shadow camera to follow player
        if (GRAPHICS.shadows.enabled && playerPosition) {
            this.updateShadowCamera(playerPosition);
        }
    }
    
    /**
     * Update shadow camera frustum to follow player
     */
    updateShadowCamera(playerPosition) {
        // Move shadow camera to center on player
        const shadowCam = this.sunLight.shadow.camera;
        
        // Calculate frustum size based on distance from sun
        // Closer = smaller frustum = better quality
        const frustumSize = 50;
        
        shadowCam.left = -frustumSize;
        shadowCam.right = frustumSize;
        shadowCam.top = frustumSize;
        shadowCam.bottom = -frustumSize;
        shadowCam.updateProjectionMatrix();
    }
    
    /**
     * Set shadow quality
     */
    setShadowQuality(quality) {
        GRAPHICS.shadows.quality = quality;
        this.configureShadows();
    }
    
    /**
     * Toggle shadows
     */
    setShadowsEnabled(enabled) {
        GRAPHICS.shadows.enabled = enabled;
        this.sunLight.castShadow = enabled;
    }
    
    /**
     * Get light at a world position (for debugging)
     */
    getLightIntensityAt(position) {
        // Simple distance-based falloff from sun
        const dx = position.x - this.sunPosition.x;
        const dy = position.y - this.sunPosition.y;
        const dz = position.z - this.sunPosition.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        
        // Inverse square law
        const intensity = CELESTIAL_BODIES.sun.luminosity / (4 * Math.PI * distSq);
        
        return intensity;
    }
    
    /**
     * Create point light for local illumination
     */
    createPointLight(position, color, intensity, distance) {
        const light = new THREE.PointLight(color, intensity, distance);
        light.position.copy(position);
        this.scene.add(light);
        return light;
    }
    
    /**
     * Create spot light
     */
    createSpotLight(position, target, color, intensity, angle) {
        const light = new THREE.SpotLight(color, intensity);
        light.position.copy(position);
        light.target.position.copy(target);
        light.angle = angle || Math.PI / 6;
        light.penumbra = 0.2;
        
        if (GRAPHICS.shadows.enabled) {
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
        }
        
        this.scene.add(light);
        this.scene.add(light.target);
        
        return light;
    }
    
    /**
     * Update lighting quality
     */
    updateQuality(preset) {
        const settings = GRAPHICS.qualityPresets[preset];
        if (!settings) return;
        
        // Update shadow quality
        const quality = preset === 'low' ? 'low' : (preset === 'medium' ? 'medium' : 'high');
        this.setShadowQuality(quality);
        
        // Update light count
        // In a full implementation, this would manage dynamic lights
    }
    
    /**
     * Toggle debug helpers
     */
    toggleHelpers(show) {
        if (show) {
            if (this.lightHelpers.length === 0) {
                const sunHelper = new THREE.DirectionalLightHelper(this.sunLight, 5);
                this.scene.add(sunHelper);
                this.lightHelpers.push(sunHelper);
                
                const shadowHelper = new THREE.CameraHelper(this.sunLight.shadow.camera);
                this.scene.add(shadowHelper);
                this.lightHelpers.push(shadowHelper);
            }
        } else {
            this.lightHelpers.forEach(helper => {
                this.scene.remove(helper);
                helper.dispose();
            });
            this.lightHelpers = [];
        }
    }
    
    /**
     * Cleanup
     */
    dispose() {
        if (this.sunLight) {
            this.sunLight.dispose();
            if (this.sunLight.shadow.map) {
                this.sunLight.shadow.map.dispose();
            }
        }
        
        this.lightHelpers.forEach(helper => {
            this.scene.remove(helper);
            helper.dispose();
        });
    }
}

export default LightingSystem;
