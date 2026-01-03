/**
 * Performance Monitor - Tracks and displays performance metrics
 */

import { PERFORMANCE } from './config.js';

export class PerformanceMonitor {
    constructor(renderer, input) {
        this.renderer = renderer;
        this.input = input;
        
        this.enabled = PERFORMANCE.enabled;
        this.lastUpdateTime = 0;
        this.updateInterval = PERFORMANCE.updateInterval;
        
        // Frame tracking
        this.frameCount = 0;
        this.fps = 0;
        this.frameTime = 0;
        this.lastFrameTime = performance.now();
        
        // UI elements
        this.panel = document.getElementById('performance-panel');
        this.fpsElement = document.getElementById('fps');
        this.frameTimeElement = document.getElementById('frame-time');
        this.objectCountElement = document.getElementById('object-count');
        this.drawCallsElement = document.getElementById('draw-calls');
        
        this.setupInputHandlers();
        this.updateVisibility();
    }

    setupInputHandlers() {
        // Toggle performance panel with F key
        this.input.on('keyDown', (event) => {
            if (event.code === 'KeyF') {
                this.toggle();
            }
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        this.updateVisibility();
    }

    updateVisibility() {
        if (this.panel) {
            this.panel.style.display = this.enabled ? 'block' : 'none';
        }
    }

    update(scene) {
        const now = performance.now();
        
        // Calculate frame time
        this.frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        
        // Increment frame count
        this.frameCount++;
        
        // Update UI at interval
        if (now - this.lastUpdateTime >= this.updateInterval) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastUpdateTime));
            this.frameCount = 0;
            this.lastUpdateTime = now;
            
            if (this.enabled) {
                this.updateUI(scene);
            }
        }
    }

    updateUI(scene) {
        // Update FPS
        if (this.fpsElement) {
            this.fpsElement.textContent = this.fps;
            
            // Color code based on performance
            if (this.fps >= PERFORMANCE.targetFPS) {
                this.fpsElement.style.color = '#4ecdc4';
            } else if (this.fps >= PERFORMANCE.warningThreshold) {
                this.fpsElement.style.color = '#ffa500';
            } else {
                this.fpsElement.style.color = '#ff6b6b';
            }
        }
        
        // Update frame time
        if (this.frameTimeElement) {
            this.frameTimeElement.textContent = this.frameTime.toFixed(2);
        }
        
        // Update object count
        if (this.objectCountElement && scene) {
            let objectCount = 0;
            scene.traverse(() => objectCount++);
            this.objectCountElement.textContent = objectCount;
        }
        
        // Update draw calls
        if (this.drawCallsElement && this.renderer) {
            this.drawCallsElement.textContent = this.renderer.info.render.calls;
        }
    }

    getStats() {
        return {
            fps: this.fps,
            frameTime: this.frameTime,
            renderCalls: this.renderer ? this.renderer.info.render.calls : 0,
            triangles: this.renderer ? this.renderer.info.render.triangles : 0
        };
    }

    reset() {
        this.frameCount = 0;
        this.fps = 0;
        this.frameTime = 0;
        this.lastFrameTime = performance.now();
        this.lastUpdateTime = performance.now();
    }
}
