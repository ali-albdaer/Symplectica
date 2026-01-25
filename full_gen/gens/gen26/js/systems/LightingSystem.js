/**
 * ============================================
 * Lighting System
 * ============================================
 * 
 * Manages all lighting in the scene.
 * The sun is the sole light source - no ambient lighting.
 */

class LightingSystem {
    constructor() {
        this.sunLight = null;
        this.sunBody = null;
        
        // Shadow camera settings (for directional light)
        this.shadowCameraSize = 100;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the lighting system
     */
    init(scene, fidelitySettings) {
        console.info('Initializing Lighting System...');
        
        try {
            // Create the main sun light (point light at sun position)
            this.createSunLight(scene, fidelitySettings);
            
            // Very dim ambient for gameplay visibility (optional, can be removed for realism)
            // Keeping it very low so it's barely noticeable but prevents pure black
            const ambient = new THREE.AmbientLight(0x111122, 0.02);
            scene.add(ambient);
            
            this.isInitialized = true;
            console.success('Lighting System initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Lighting System: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Create the sun light
     */
    createSunLight(scene, fidelitySettings) {
        // Use a point light at sun's position for realistic omni-directional lighting
        this.sunLight = new THREE.PointLight(0xFFFFEE, 2, 0, 2);
        this.sunLight.name = 'SunLight';
        
        // Shadow configuration
        if (fidelitySettings.shadowsEnabled) {
            this.sunLight.castShadow = true;
            
            const shadowMapSize = fidelitySettings.shadowMapSize || 1024;
            this.sunLight.shadow.mapSize.width = shadowMapSize;
            this.sunLight.shadow.mapSize.height = shadowMapSize;
            
            this.sunLight.shadow.camera.near = 0.001;
            this.sunLight.shadow.camera.far = 1000;
            
            // Improve shadow quality
            this.sunLight.shadow.bias = -0.001;
            this.sunLight.shadow.normalBias = 0.02;
        }
        
        scene.add(this.sunLight);
        
        // Also add a helper directional light for better shadow casting on planets
        // This follows the camera and points toward the sun
        this.directionalHelper = new THREE.DirectionalLight(0xFFFFEE, 0.5);
        this.directionalHelper.name = 'SunDirectional';
        
        if (fidelitySettings.shadowsEnabled) {
            this.directionalHelper.castShadow = true;
            this.directionalHelper.shadow.mapSize.width = fidelitySettings.shadowMapSize;
            this.directionalHelper.shadow.mapSize.height = fidelitySettings.shadowMapSize;
            this.directionalHelper.shadow.camera.near = 0.01;
            this.directionalHelper.shadow.camera.far = 500;
            this.directionalHelper.shadow.camera.left = -50;
            this.directionalHelper.shadow.camera.right = 50;
            this.directionalHelper.shadow.camera.top = 50;
            this.directionalHelper.shadow.camera.bottom = -50;
        }
        
        scene.add(this.directionalHelper);
        scene.add(this.directionalHelper.target);
    }
    
    /**
     * Set the sun body reference
     */
    setSunBody(sun) {
        this.sunBody = sun;
    }
    
    /**
     * Update lighting each frame
     */
    update(camera) {
        if (!this.isInitialized) return;
        
        // Update sun light position to match sun body
        if (this.sunBody && this.sunLight) {
            const sunPos = this.sunBody.group.position;
            this.sunLight.position.copy(sunPos);
        }
        
        // Update directional light to provide shadows from sun direction
        if (this.directionalHelper && camera) {
            // Position the directional light near the camera, pointing toward sun
            const sunPos = this.sunLight.position.clone();
            const camPos = camera.position.clone();
            
            // Direction from camera to sun
            const toSun = sunPos.clone().sub(camPos).normalize();
            
            // Position light behind the camera relative to sun
            this.directionalHelper.position.copy(camPos).add(toSun.clone().multiplyScalar(100));
            this.directionalHelper.target.position.copy(camPos);
        }
    }
    
    /**
     * Update shadow quality settings
     */
    setShadowQuality(quality) {
        if (!this.sunLight) return;
        
        switch (quality) {
            case 'off':
                this.sunLight.castShadow = false;
                if (this.directionalHelper) {
                    this.directionalHelper.castShadow = false;
                }
                break;
                
            case 'low':
                this.sunLight.castShadow = true;
                this.sunLight.shadow.mapSize.width = 512;
                this.sunLight.shadow.mapSize.height = 512;
                if (this.directionalHelper) {
                    this.directionalHelper.castShadow = true;
                    this.directionalHelper.shadow.mapSize.width = 512;
                    this.directionalHelper.shadow.mapSize.height = 512;
                }
                break;
                
            case 'medium':
                this.sunLight.castShadow = true;
                this.sunLight.shadow.mapSize.width = 1024;
                this.sunLight.shadow.mapSize.height = 1024;
                if (this.directionalHelper) {
                    this.directionalHelper.castShadow = true;
                    this.directionalHelper.shadow.mapSize.width = 1024;
                    this.directionalHelper.shadow.mapSize.height = 1024;
                }
                break;
                
            case 'high':
                this.sunLight.castShadow = true;
                this.sunLight.shadow.mapSize.width = 2048;
                this.sunLight.shadow.mapSize.height = 2048;
                if (this.directionalHelper) {
                    this.directionalHelper.castShadow = true;
                    this.directionalHelper.shadow.mapSize.width = 2048;
                    this.directionalHelper.shadow.mapSize.height = 2048;
                }
                break;
        }
        
        // Need to update shadow map
        if (this.sunLight.shadow.map) {
            this.sunLight.shadow.map.dispose();
            this.sunLight.shadow.map = null;
        }
        if (this.directionalHelper && this.directionalHelper.shadow.map) {
            this.directionalHelper.shadow.map.dispose();
            this.directionalHelper.shadow.map = null;
        }
    }
}
