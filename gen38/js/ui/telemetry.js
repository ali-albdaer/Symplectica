/**
 * Solar System Simulation - Telemetry Display
 * ============================================
 * FPS, frame time, and coordinate overlay.
 */

class TelemetryDisplay {
    constructor() {
        this.container = null;
        this.fpsEl = null;
        this.frameTimeEl = null;
        this.coordsEl = null;
        this.physicsEl = null;
        
        this.isVisible = false;
        
        // FPS calculation
        this.frames = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;
        this.frameTimes = [];
        this.maxFrameTimes = 60;
        
        Logger.info('TelemetryDisplay created');
    }
    
    /**
     * Initialize telemetry display
     */
    init() {
        this.container = document.getElementById('telemetry');
        this.fpsEl = document.getElementById('fps-counter');
        this.frameTimeEl = document.getElementById('frame-time');
        this.coordsEl = document.getElementById('coordinates');
        this.physicsEl = document.getElementById('physics-stats');
        
        this.isVisible = Config.ui.telemetryVisible;
        this.updateVisibility();
        
        Logger.success('TelemetryDisplay initialized');
    }
    
    /**
     * Update telemetry each frame
     */
    update(deltaTime, player) {
        if (!this.isVisible) return;
        
        // Track frame time
        this.frameTimes.push(deltaTime * 1000);
        if (this.frameTimes.length > this.maxFrameTimes) {
            this.frameTimes.shift();
        }
        
        // Calculate FPS
        this.frames++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 500) {
            this.fps = Math.round(this.frames * 1000 / (now - this.lastFpsUpdate));
            this.frames = 0;
            this.lastFpsUpdate = now;
            
            // Update display
            this.updateDisplay(player);
        }
    }
    
    /**
     * Update the display elements
     */
    updateDisplay(player) {
        // FPS
        if (this.fpsEl) {
            const fpsColor = this.fps >= 55 ? '#81c784' : 
                            this.fps >= 30 ? '#ffb74d' : '#f44336';
            this.fpsEl.innerHTML = `FPS: <span style="color:${fpsColor}">${this.fps}</span>`;
        }
        
        // Frame time (average)
        if (this.frameTimeEl) {
            const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
            this.frameTimeEl.textContent = `Frame: ${avgFrameTime.toFixed(2)} ms`;
        }
        
        // Coordinates
        if (this.coordsEl && player) {
            const pos = player.position;
            this.coordsEl.textContent = `Pos: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`;
        }
        
        // Physics stats
        if (this.physicsEl && typeof Physics !== 'undefined') {
            const stats = Physics.getStats();
            this.physicsEl.textContent = `Bodies: ${stats.bodyCount} | Objects: ${stats.objectCount}`;
        }
    }
    
    /**
     * Toggle visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        Config.ui.telemetryVisible = this.isVisible;
        this.updateVisibility();
    }
    
    /**
     * Update container visibility
     */
    updateVisibility() {
        if (this.container) {
            this.container.classList.toggle('hidden', !this.isVisible);
        }
    }
    
    /**
     * Show telemetry
     */
    show() {
        this.isVisible = true;
        this.updateVisibility();
    }
    
    /**
     * Hide telemetry
     */
    hide() {
        this.isVisible = false;
        this.updateVisibility();
    }
    
    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }
    
    /**
     * Get average frame time
     */
    getAverageFrameTime() {
        if (this.frameTimes.length === 0) return 0;
        return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    }
}

// Global instance
const Telemetry = new TelemetryDisplay();
