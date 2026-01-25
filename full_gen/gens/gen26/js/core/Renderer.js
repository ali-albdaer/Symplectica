/**
 * ============================================
 * Renderer System
 * ============================================
 * 
 * Handles Three.js renderer setup, scene management,
 * and rendering pipeline configuration.
 */

class Renderer {
    constructor() {
        this.renderer = null;
        this.scene = null;
        this.canvas = null;
        this.fidelitySettings = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the renderer
     */
    init() {
        console.info('Initializing Renderer...');
        
        try {
            // Get current fidelity settings
            this.fidelitySettings = this.getFidelitySettings();
            
            // Create WebGL renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: this.fidelitySettings.antialias,
                powerPreference: 'high-performance',
                stencil: false,
            });
            
            // Configure renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(this.fidelitySettings.pixelRatio);
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
            
            // Shadow configuration
            if (this.fidelitySettings.shadowsEnabled) {
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            }
            
            // Physically correct lighting
            this.renderer.physicallyCorrectLights = true;
            
            // Add canvas to DOM
            this.canvas = this.renderer.domElement;
            this.canvas.id = 'game-canvas';
            document.body.insertBefore(this.canvas, document.body.firstChild);
            
            // Create main scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(CONFIG.SKY.BACKGROUND_COLOR);
            
            // Handle window resize
            window.addEventListener('resize', () => this.onResize());
            
            this.isInitialized = true;
            console.success('Renderer initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Renderer: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Get current fidelity settings
     */
    getFidelitySettings() {
        const fidelity = CONFIG.RENDERING.FIDELITY || 'medium';
        return CONFIG.RENDERING.FIDELITY_PRESETS[fidelity];
    }
    
    /**
     * Update fidelity level
     */
    setFidelity(level) {
        if (!CONFIG.RENDERING.FIDELITY_PRESETS[level]) {
            console.warn(`Unknown fidelity level: ${level}`);
            return;
        }
        
        CONFIG.RENDERING.FIDELITY = level;
        this.fidelitySettings = this.getFidelitySettings();
        
        // Apply new settings
        this.renderer.setPixelRatio(this.fidelitySettings.pixelRatio);
        this.renderer.shadowMap.enabled = this.fidelitySettings.shadowsEnabled;
        
        console.info(`Fidelity set to: ${level}`);
    }
    
    /**
     * Handle window resize
     */
    onResize() {
        if (!this.renderer) return;
        
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        this.renderer.setSize(width, height);
    }
    
    /**
     * Render a frame
     */
    render(camera) {
        if (!this.isInitialized || !camera) return;
        
        this.renderer.render(this.scene, camera);
    }
    
    /**
     * Add object to scene
     */
    add(object) {
        if (this.scene && object) {
            this.scene.add(object);
        }
    }
    
    /**
     * Remove object from scene
     */
    remove(object) {
        if (this.scene && object) {
            this.scene.remove(object);
        }
    }
    
    /**
     * Get renderer info for debugging
     */
    getInfo() {
        if (!this.renderer) return null;
        
        const info = this.renderer.info;
        return {
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            calls: info.render.calls,
            triangles: info.render.triangles,
            points: info.render.points,
            lines: info.render.lines
        };
    }
    
    /**
     * Dispose of all resources
     */
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}
