/**
 * Renderer.js - Three.js Rendering Module
 * 
 * Handles all rendering, lighting, shadows, and visual effects.
 * GPU-accelerated with quality presets.
 */

import Config from './Config.js';
import Debug from './Debug.js';

class Renderer {
    constructor() {
        this.THREE = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Lighting
        this.sunLight = null;
        this.ambientLight = null;
        
        // Objects
        this.celestialBodies = [];
        this.interactiveObjects = [];
        
        // Performance
        this.frameTime = 0;
        this.fps = 0;
        this.fpsHistory = [];
        this.lastFpsUpdate = 0;
        
        // Quality settings
        this.currentQuality = 'medium';
    }
    
    /**
     * Initialize the renderer
     */
    init() {
        try {
            // Get Three.js from global scope (loaded via CDN)
            this.THREE = window.THREE;
            
            if (!this.THREE) {
                throw new Error('Three.js not loaded. Check CDN link.');
            }
            
            Debug.setLoadingStatus('Creating scene...');
            
            // Create scene
            this.scene = new this.THREE.Scene();
            this.scene.background = new this.THREE.Color(0x000005);
            
            // Create camera
            this.camera = new this.THREE.PerspectiveCamera(
                Config.player.fov,
                window.innerWidth / window.innerHeight,
                Config.player.nearClip,
                Config.player.farClip
            );
            
            // Create renderer
            const qualitySettings = Config.getQualitySettings();
            
            this.renderer = new this.THREE.WebGLRenderer({
                antialias: qualitySettings.antialias,
                powerPreference: 'high-performance',
                stencil: false
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(qualitySettings.pixelRatio);
            
            // Shadow configuration
            if (qualitySettings.shadowsEnabled) {
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = this.THREE.PCFSoftShadowMap;
            }
            
            // Tone mapping for HDR-like effects
            this.renderer.toneMapping = this.THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
            
            // Add canvas to DOM
            const container = document.getElementById('canvas-container');
            container.appendChild(this.renderer.domElement);
            
            // Setup lighting
            this.setupLighting();
            
            // Handle window resize
            window.addEventListener('resize', () => this.onResize());
            
            Debug.success('Renderer initialized');
            return true;
            
        } catch (error) {
            Debug.error(`Renderer initialization failed: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Setup scene lighting
     */
    setupLighting() {
        Debug.setLoadingStatus('Setting up lighting...');
        
        const qualitySettings = Config.getQualitySettings();
        
        // Sun as the sole light source (point light)
        this.sunLight = new this.THREE.PointLight(
            0xffffff,
            Config.graphics.sunLightIntensity,
            0, // Infinite range
            2  // Quadratic decay for realism
        );
        this.sunLight.position.set(0, 0, 0);
        
        // Shadow configuration for sun
        if (qualitySettings.shadowsEnabled) {
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = qualitySettings.shadowMapSize;
            this.sunLight.shadow.mapSize.height = qualitySettings.shadowMapSize;
            this.sunLight.shadow.camera.near = 1;
            this.sunLight.shadow.camera.far = 2000;
            this.sunLight.shadow.bias = Config.graphics.shadowBias;
            this.sunLight.shadow.normalBias = Config.graphics.shadowNormalBias;
        }
        
        this.scene.add(this.sunLight);
        
        // Very minimal ambient light (almost none as specified)
        this.ambientLight = new this.THREE.AmbientLight(
            0x111122,
            Config.graphics.ambientLightIntensity
        );
        this.scene.add(this.ambientLight);
        
        Debug.info('Lighting setup complete');
    }
    
    /**
     * Add celestial body to scene
     */
    addCelestialBody(body) {
        const qualitySettings = Config.getQualitySettings();
        const mesh = body.createMesh(this.THREE, { 
            currentQuality: this.currentQuality,
            atmosphereEnabled: qualitySettings.atmosphereEnabled
        });
        
        this.scene.add(mesh);
        this.celestialBodies.push(body);
        
        // Create orbit line if debug enabled
        if (Config.debug.showOrbits && body.type !== 'star') {
            const orbitLine = body.createOrbitLine(this.THREE);
            this.scene.add(orbitLine);
        }
        
        Debug.info(`Added ${body.name} to scene`);
    }
    
    /**
     * Add interactive object to scene
     */
    addInteractiveObject(obj) {
        this.scene.add(obj.mesh);
        this.interactiveObjects.push(obj);
    }
    
    /**
     * Remove interactive object from scene
     */
    removeInteractiveObject(obj) {
        this.scene.remove(obj.mesh);
        const index = this.interactiveObjects.indexOf(obj);
        if (index > -1) {
            this.interactiveObjects.splice(index, 1);
        }
    }
    
    /**
     * Set quality preset
     */
    setQuality(quality) {
        if (!Config.graphics.presets[quality]) {
            Debug.warn(`Unknown quality preset: ${quality}`);
            return;
        }
        
        this.currentQuality = quality;
        Config.graphics.currentQuality = quality;
        const settings = Config.graphics.presets[quality];
        
        // Update renderer
        this.renderer.setPixelRatio(settings.pixelRatio);
        this.renderer.shadowMap.enabled = settings.shadowsEnabled;
        
        // Update shadow quality
        if (this.sunLight && this.sunLight.shadow) {
            this.sunLight.shadow.mapSize.width = settings.shadowMapSize;
            this.sunLight.shadow.mapSize.height = settings.shadowMapSize;
            this.sunLight.shadow.map?.dispose();
            this.sunLight.shadow.map = null;
        }
        
        Debug.info(`Quality set to: ${quality}`);
    }
    
    /**
     * Main render loop
     */
    render() {
        const startTime = performance.now();
        
        this.renderer.render(this.scene, this.camera);
        
        this.frameTime = performance.now() - startTime;
        this.updateFPS();
    }
    
    /**
     * Update FPS counter
     */
    updateFPS() {
        const now = performance.now();
        this.fpsHistory.push(now);
        
        // Keep last second of timestamps
        while (this.fpsHistory.length > 0 && this.fpsHistory[0] < now - 1000) {
            this.fpsHistory.shift();
        }
        
        // Update FPS display every 100ms
        if (now - this.lastFpsUpdate > 100) {
            this.fps = this.fpsHistory.length;
            this.lastFpsUpdate = now;
        }
    }
    
    /**
     * Handle window resize
     */
    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    /**
     * Get scene for external access
     */
    getScene() {
        return this.scene;
    }
    
    /**
     * Get camera for external access
     */
    getCamera() {
        return this.camera;
    }
    
    /**
     * Get Three.js instance
     */
    getTHREE() {
        return this.THREE;
    }
    
    /**
     * Get renderer instance
     */
    getRenderer() {
        return this.renderer;
    }
    
    /**
     * Create a helper arrow for velocity visualization
     */
    createVelocityArrow(body) {
        const dir = new this.THREE.Vector3(
            body.velocity.x,
            body.velocity.y,
            body.velocity.z
        ).normalize();
        
        const origin = new this.THREE.Vector3(
            body.position.x,
            body.position.y,
            body.position.z
        );
        
        const length = body.getSpeed() * 0.1;
        const color = 0x00ff00;
        
        const arrow = new this.THREE.ArrowHelper(dir, origin, length, color);
        return arrow;
    }
    
    /**
     * Dispose of all resources
     */
    dispose() {
        // Dispose celestial bodies
        for (const body of this.celestialBodies) {
            body.dispose();
        }
        
        // Dispose interactive objects
        for (const obj of this.interactiveObjects) {
            if (obj.dispose) obj.dispose();
        }
        
        // Dispose renderer
        this.renderer.dispose();
        
        Debug.info('Renderer disposed');
    }
}

// Export singleton instance
const renderer = new Renderer();
export default renderer;
