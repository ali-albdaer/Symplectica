/**
 * Renderer
 * Manages Three.js rendering, post-processing, and visual effects
 */

import { Config, GRAPHICS, CAMERA } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        
        // Post-processing
        this.composer = null;
        this.bloomPass = null;
        this.fxaaPass = null;
        
        // Performance
        this.renderTime = 0;
        this.lastRenderStart = 0;
        
        this.initialize();
    }
    
    /**
     * Initialize Three.js renderer
     */
    initialize() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: GRAPHICS.currentPreset === 'high',
            powerPreference: 'high-performance',
            stencil: false
        });
        
        // Configure renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = GRAPHICS.postProcessing.toneMappingExposure;
        
        // Shadow settings
        if (GRAPHICS.shadows.enabled) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CAMERA.FOV,
            window.innerWidth / window.innerHeight,
            CAMERA.NEAR,
            CAMERA.FAR
        );
        
        // Enable logarithmic depth buffer for large scale differences
        this.camera.near = 0.1;
        this.camera.far = 1e12;
        
        // Setup resize handler
        window.addEventListener('resize', this.onResize.bind(this));
        
        // Initialize post-processing
        this.initPostProcessing();
    }
    
    /**
     * Initialize post-processing effects
     */
    initPostProcessing() {
        // For a basic setup without EffectComposer, we'll use built-in features
        // Full post-processing would require importing Three.js examples
        
        // This is a simplified version - full implementation would use:
        // - EffectComposer
        // - RenderPass
        // - UnrealBloomPass
        // - ShaderPass with FXAA
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
    }
    
    /**
     * Render frame
     */
    render() {
        this.lastRenderStart = performance.now();
        
        if (this.composer && GRAPHICS.postProcessing.enabled) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        
        this.renderTime = performance.now() - this.lastRenderStart;
    }
    
    /**
     * Update quality settings
     */
    updateQuality(preset) {
        const settings = GRAPHICS.qualityPresets[preset];
        if (!settings) return;
        
        // Update shadow map
        if (settings.shadowMapSize && GRAPHICS.shadows.enabled) {
            // Would need to recreate shadow maps
        }
        
        // Update anti-aliasing
        // This would require renderer recreation for MSAA
        
        // Update bloom
        if (this.bloomPass) {
            this.bloomPass.enabled = settings.bloomEnabled;
            this.bloomPass.strength = settings.bloomStrength;
        }
        
        // Update pixel ratio based on quality
        const pixelRatio = preset === 'low' ? 1 : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(pixelRatio);
    }
    
    /**
     * Toggle shadows
     */
    setShadowsEnabled(enabled) {
        this.renderer.shadowMap.enabled = enabled;
        
        // Need to update all meshes
        this.scene.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = enabled;
                obj.receiveShadow = enabled;
            }
        });
    }
    
    /**
     * Set tone mapping exposure
     */
    setExposure(value) {
        this.renderer.toneMappingExposure = value;
    }
    
    /**
     * Get render info for metrics
     */
    getInfo() {
        const info = this.renderer.info;
        return {
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            points: info.render.points,
            lines: info.render.lines,
            memory: info.memory.geometries + info.memory.textures,
            renderTime: this.renderTime
        };
    }
    
    /**
     * Get memory usage estimate
     */
    getMemoryUsage() {
        const info = this.renderer.info;
        // Rough estimate in MB
        return (info.memory.geometries * 0.1 + info.memory.textures * 2);
    }
    
    /**
     * Create a render target for effects
     */
    createRenderTarget(width, height) {
        return new THREE.WebGLRenderTarget(width, height, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            encoding: THREE.sRGBEncoding
        });
    }
    
    /**
     * Cleanup
     */
    dispose() {
        this.renderer.dispose();
        
        if (this.composer) {
            this.composer.dispose();
        }
        
        window.removeEventListener('resize', this.onResize);
    }
}

export default Renderer;
