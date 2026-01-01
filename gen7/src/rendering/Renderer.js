/**
 * Main Renderer
 * Handles Three.js rendering, post-processing, and visual quality
 */

import * as THREE from 'three';
import { CONFIG } from '../../config/globals.js';

export class Renderer {
    constructor() {
        this.canvas = document.getElementById('render-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Performance tracking
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 60;
        this.deltaTime = 0;

        // Quality settings
        this.quality = CONFIG.GRAPHICS.quality;
    }

    /**
     * Initialize renderer
     */
    initialize() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000510);
        this.scene.fog = new THREE.FogExp2(0x000510, 0.00001);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.GRAPHICS.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.GRAPHICS.nearClip,
            CONFIG.GRAPHICS.farClip
        );

        // Create WebGL renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: CONFIG.GRAPHICS.antialiasing,
            powerPreference: 'high-performance',
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(CONFIG.GRAPHICS.pixelRatio);

        // Enable shadows
        if (CONFIG.GRAPHICS.shadows.enabled) {
            this.renderer.shadowMap.enabled = true;
            this.setShadowQuality(CONFIG.GRAPHICS.shadows.quality);
        }

        // Tone mapping for better color
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        console.log('✓ Renderer initialized');
        console.log(`   Quality: ${this.quality}`);
        console.log(`   Shadows: ${CONFIG.GRAPHICS.shadows.enabled}`);
        console.log(`   Antialiasing: ${CONFIG.GRAPHICS.antialiasing}`);

        return {
            scene: this.scene,
            camera: this.camera,
            renderer: this.renderer
        };
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Set shadow quality
     */
    setShadowQuality(quality) {
        switch (quality) {
            case 'low':
                this.renderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            case 'medium':
                this.renderer.shadowMap.type = THREE.PCFShadowMap;
                break;
            case 'high':
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
        }
        CONFIG.GRAPHICS.shadows.quality = quality;
    }

    /**
     * Set overall quality preset
     */
    setQuality(quality) {
        this.quality = quality;
        CONFIG.GRAPHICS.quality = quality;

        switch (quality) {
            case 'low':
                CONFIG.GRAPHICS.shadows.enabled = false;
                CONFIG.GRAPHICS.shadows.mapSize = 512;
                CONFIG.GRAPHICS.antialiasing = false;
                CONFIG.GRAPHICS.bloom.enabled = false;
                CONFIG.GRAPHICS.stars.count = 5000;
                this.renderer.setPixelRatio(1);
                break;

            case 'medium':
                CONFIG.GRAPHICS.shadows.enabled = true;
                CONFIG.GRAPHICS.shadows.mapSize = 1024;
                CONFIG.GRAPHICS.antialiasing = true;
                CONFIG.GRAPHICS.bloom.enabled = true;
                CONFIG.GRAPHICS.stars.count = 10000;
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                break;

            case 'high':
                CONFIG.GRAPHICS.shadows.enabled = true;
                CONFIG.GRAPHICS.shadows.mapSize = 2048;
                CONFIG.GRAPHICS.antialiasing = true;
                CONFIG.GRAPHICS.bloom.enabled = true;
                CONFIG.GRAPHICS.stars.count = 15000;
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                break;
        }

        this.renderer.shadowMap.enabled = CONFIG.GRAPHICS.shadows.enabled;
        
        console.log(`🎨 Quality set to: ${quality}`);
    }

    /**
     * Render frame
     */
    render() {
        const currentTime = performance.now();
        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;

        // Calculate FPS
        this.frameCount++;
        if (this.frameCount >= 60) {
            this.fps = Math.round(1 / this.deltaTime);
            this.frameCount = 0;
        }

        // Render scene
        this.renderer.render(this.scene, this.camera);

        return this.deltaTime;
    }

    /**
     * Get render stats
     */
    getStats() {
        const info = this.renderer.info;
        return {
            fps: this.fps,
            frameTime: (this.deltaTime * 1000).toFixed(2),
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            geometries: info.memory.geometries,
            textures: info.memory.textures,
        };
    }

    /**
     * Toggle wireframe mode (debug)
     */
    toggleWireframe(enabled) {
        this.scene.traverse((object) => {
            if (object.isMesh) {
                object.material.wireframe = enabled;
            }
        });
    }

    /**
     * Take screenshot
     */
    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        
        // Download
        const link = document.createElement('a');
        link.download = `solar-system-${Date.now()}.png`;
        link.href = dataURL;
        link.click();

        console.log('📸 Screenshot saved');
    }

    /**
     * Get camera
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get scene
     */
    getScene() {
        return this.scene;
    }

    /**
     * Dispose renderer
     */
    dispose() {
        this.renderer.dispose();
        window.removeEventListener('resize', this.onWindowResize);
    }
}

export default Renderer;
