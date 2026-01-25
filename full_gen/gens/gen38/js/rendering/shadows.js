/**
 * Solar System Simulation - Shadow Manager
 * =========================================
 * Manages shadow rendering for optimal performance.
 */

class ShadowManager {
    constructor() {
        this.shadowLights = [];
        this.enabled = true;
        
        Logger.info('ShadowManager created');
    }
    
    /**
     * Initialize shadow system
     */
    init(renderer) {
        if (!Config.rendering.shadows.enabled) {
            this.enabled = false;
            Logger.info('Shadows disabled in config');
            return;
        }
        
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        Logger.success('Shadow system initialized');
    }
    
    /**
     * Register a light that casts shadows
     */
    registerLight(light) {
        if (!light.castShadow) return;
        
        this.shadowLights.push(light);
        this.configureShadowMap(light);
        
        Logger.debug(`Registered shadow light: ${light.type}`);
    }
    
    /**
     * Configure shadow map for a light
     */
    configureShadowMap(light) {
        const mapSize = Config.rendering.shadows.mapSize;
        
        light.shadow.mapSize.width = mapSize;
        light.shadow.mapSize.height = mapSize;
        light.shadow.bias = Config.rendering.shadows.bias;
        
        // For point lights (sun)
        if (light.isPointLight) {
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 500;
        }
        
        // For directional lights
        if (light.isDirectionalLight) {
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 500;
            light.shadow.camera.left = -100;
            light.shadow.camera.right = 100;
            light.shadow.camera.top = 100;
            light.shadow.camera.bottom = -100;
        }
    }
    
    /**
     * Update shadow quality
     */
    setQuality(mapSize) {
        Config.rendering.shadows.mapSize = mapSize;
        
        for (const light of this.shadowLights) {
            light.shadow.mapSize.width = mapSize;
            light.shadow.mapSize.height = mapSize;
            
            // Force shadow map regeneration
            if (light.shadow.map) {
                light.shadow.map.dispose();
                light.shadow.map = null;
            }
        }
        
        Logger.info(`Shadow quality set to ${mapSize}x${mapSize}`);
    }
    
    /**
     * Enable/disable shadows
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        Config.rendering.shadows.enabled = enabled;
        
        for (const light of this.shadowLights) {
            light.castShadow = enabled;
        }
        
        Logger.info(`Shadows ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Update shadows (called each frame if needed)
     */
    update(camera, playerPosition) {
        // For cascaded shadow maps or dynamic shadow updates
        // Currently using simple shadow mapping
    }
    
    /**
     * Dispose shadow resources
     */
    dispose() {
        for (const light of this.shadowLights) {
            if (light.shadow && light.shadow.map) {
                light.shadow.map.dispose();
            }
        }
        
        this.shadowLights = [];
        Logger.info('ShadowManager disposed');
    }
}

// Global instance
const Shadows = new ShadowManager();
