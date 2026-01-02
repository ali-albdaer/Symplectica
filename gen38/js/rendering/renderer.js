/**
 * Solar System Simulation - Renderer
 * ===================================
 * Main Three.js renderer setup and management.
 */

class RenderManager {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        
        // Post-processing
        this.composer = null;
        this.bloomPass = null;
        
        // Render stats
        this.renderTime = 0;
        
        Logger.info('RenderManager created');
    }
    
    /**
     * Initialize the renderer
     */
    init() {
        Logger.time('Renderer initialization');
        
        try {
            // Create scene
            this.scene = new THREE.Scene();
            
            // Create camera
            this.camera = new THREE.PerspectiveCamera(
                Config.player.firstPersonFOV,
                window.innerWidth / window.innerHeight,
                Config.rendering.nearPlane,
                Config.rendering.farPlane
            );
            
            // Create renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: Config.rendering.antialias,
                powerPreference: 'high-performance',
                logarithmicDepthBuffer: true, // Important for space-scale rendering
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            
            // Enable shadows
            if (Config.rendering.shadows.enabled) {
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            }
            
            // Tone mapping for HDR-like rendering
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
            
            // Output encoding
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            
            // Add to DOM
            document.body.appendChild(this.renderer.domElement);
            
            // Handle resize
            window.addEventListener('resize', () => this.onResize());
            
            Logger.timeEnd('Renderer initialization');
            Logger.success('Renderer initialized');
            
            return true;
        } catch (error) {
            Logger.error('Failed to initialize renderer', { error: error.message });
            throw error;
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
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        
        Logger.debug(`Resized to ${width}x${height}`);
    }
    
    /**
     * Add object to scene
     */
    add(object) {
        if (object) {
            this.scene.add(object);
        }
    }
    
    /**
     * Remove object from scene
     */
    remove(object) {
        if (object) {
            this.scene.remove(object);
        }
    }
    
    /**
     * Render frame
     */
    render() {
        const startTime = performance.now();
        
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        this.renderTime = performance.now() - startTime;
    }
    
    /**
     * Update shadow map size
     */
    updateShadowQuality(size) {
        Config.rendering.shadows.mapSize = size;
        // Shadow maps will be updated on next render
    }
    
    /**
     * Toggle shadows
     */
    setShadowsEnabled(enabled) {
        this.renderer.shadowMap.enabled = enabled;
        Config.rendering.shadows.enabled = enabled;
        
        // Update all lights
        this.scene.traverse((obj) => {
            if (obj.isLight) {
                obj.castShadow = enabled;
            }
        });
    }
    
    /**
     * Apply fidelity preset
     */
    applyFidelityPreset(level) {
        Config.applyFidelityPreset(level);
        
        // Apply renderer changes
        this.renderer.setPixelRatio(
            level === 'low' ? 1 : Math.min(window.devicePixelRatio, 2)
        );
        
        this.setShadowsEnabled(level !== 'low');
    }
    
    /**
     * Get render stats
     */
    getStats() {
        const info = this.renderer.info;
        return {
            renderTime: this.renderTime.toFixed(2),
            triangles: info.render.triangles,
            calls: info.render.calls,
            textures: info.memory.textures,
            geometries: info.memory.geometries,
        };
    }
    
    /**
     * Dispose resources
     */
    dispose() {
        this.renderer.dispose();
        
        // Dispose all scene objects
        this.scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        
        Logger.info('Renderer disposed');
    }
}

// Global renderer instance
const Renderer = new RenderManager();
