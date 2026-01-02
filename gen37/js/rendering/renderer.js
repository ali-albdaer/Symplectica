/**
 * Renderer - Main rendering system
 * Handles Three.js rendering, shadows, and visual quality settings
 */

const Renderer = (function() {
    'use strict';
    
    let renderer = null;
    let scene = null;
    let currentFidelity = 'medium';
    
    // Render stats
    let frameCount = 0;
    let lastFpsUpdate = 0;
    let fps = 0;
    let frameTime = 0;
    
    return {
        /**
         * Initialize the renderer
         */
        init: function() {
            Logger.info('Renderer', 'Initializing WebGL renderer');
            
            const canvas = document.getElementById('game-canvas');
            
            if (!canvas) {
                throw new Error('Canvas element not found');
            }
            
            // Check WebGL support
            if (!window.THREE) {
                throw new Error('Three.js not loaded');
            }
            
            // Create renderer
            renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: Config.RENDERING.postProcessing.antialiasing,
                powerPreference: 'high-performance',
                logarithmicDepthBuffer: true  // Important for large scale scenes
            });
            
            // Configure renderer
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, Config.RENDERING.pixelRatio));
            
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0;
            
            // Shadow settings
            this.configureShadows();
            
            // Create scene
            scene = new THREE.Scene();
            scene.background = new THREE.Color(Config.RENDERING.backgroundColor);
            
            // Handle resize
            window.addEventListener('resize', () => this.onResize());
            
            Logger.info('Renderer', 'Renderer initialized successfully');
            Logger.info('Renderer', `WebGL: ${renderer.capabilities.isWebGL2 ? 'WebGL2' : 'WebGL1'}`);
            Logger.info('Renderer', `Max Textures: ${renderer.capabilities.maxTextures}`);
            
            return { renderer, scene };
        },
        
        /**
         * Configure shadow settings based on fidelity
         */
        configureShadows: function() {
            const fidelity = Config.RENDERING.fidelityLevel;
            const shadowConfig = Config.RENDERING.shadows[fidelity];
            
            renderer.shadowMap.enabled = shadowConfig.enabled;
            
            if (shadowConfig.enabled) {
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                
                if (fidelity === 'ultra') {
                    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                } else if (fidelity === 'low') {
                    renderer.shadowMap.type = THREE.BasicShadowMap;
                }
            }
            
            currentFidelity = fidelity;
            Logger.debug('Renderer', `Shadows configured: ${fidelity}`);
        },
        
        /**
         * Update fidelity level
         */
        setFidelity: function(level) {
            if (!['low', 'medium', 'ultra'].includes(level)) {
                Logger.warn('Renderer', `Invalid fidelity level: ${level}`);
                return;
            }
            
            Config.RENDERING.fidelityLevel = level;
            this.configureShadows();
            
            // Note: Geometry detail changes require recreating meshes
            Logger.info('Renderer', `Fidelity set to: ${level}`);
        },
        
        /**
         * Render a frame
         */
        render: function(camera) {
            if (!renderer || !scene || !camera) return;
            
            const startTime = performance.now();
            
            renderer.render(scene, camera);
            
            // Update stats
            frameTime = performance.now() - startTime;
            frameCount++;
            
            const now = performance.now();
            if (now - lastFpsUpdate >= 1000) {
                fps = frameCount;
                frameCount = 0;
                lastFpsUpdate = now;
            }
        },
        
        /**
         * Handle window resize
         */
        onResize: function() {
            if (!renderer) return;
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            Logger.debug('Renderer', `Resized to ${window.innerWidth}x${window.innerHeight}`);
        },
        
        /**
         * Get the scene
         */
        getScene: function() {
            return scene;
        },
        
        /**
         * Get the renderer
         */
        getRenderer: function() {
            return renderer;
        },
        
        /**
         * Get FPS
         */
        getFPS: function() {
            return fps;
        },
        
        /**
         * Get frame time in milliseconds
         */
        getFrameTime: function() {
            return frameTime;
        },
        
        /**
         * Get render info for debugging
         */
        getRenderInfo: function() {
            if (!renderer) return null;
            
            const info = renderer.info;
            return {
                triangles: info.render.triangles,
                calls: info.render.calls,
                points: info.render.points,
                lines: info.render.lines,
                geometries: info.memory.geometries,
                textures: info.memory.textures
            };
        },
        
        /**
         * Set pixel ratio
         */
        setPixelRatio: function(ratio) {
            if (!renderer) return;
            
            Config.RENDERING.pixelRatio = ratio;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, ratio));
        },
        
        /**
         * Enable/disable tone mapping
         */
        setToneMapping: function(enabled, exposure = 1.0) {
            if (!renderer) return;
            
            renderer.toneMapping = enabled ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
            renderer.toneMappingExposure = exposure;
        },
        
        /**
         * Clean up
         */
        dispose: function() {
            if (renderer) {
                renderer.dispose();
                renderer = null;
            }
            scene = null;
        }
    };
})();

window.Renderer = Renderer;
