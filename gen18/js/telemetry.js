/**
 * Telemetry System
 * Real-time performance and diagnostic overlay
 */
class Telemetry {
    constructor() {
        this.fps = 0;
        this.frameTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = 0.5; // seconds
        this.fpsUpdateCounter = 0;
        
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        
        this.isVisible = false;
        
        // Data tracking
        this.data = {
            fps: 0,
            frameTime: 0,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            bodyCount: 0,
            drawCalls: 0,
            memory: 0,
            uptime: 0
        };
    }

    /**
     * Update telemetry
     */
    update(player, renderer, entityCount) {
        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        
        // Update frame time
        this.frameTime = deltaTime * 1000; // Convert to ms
        this.frameCount++;
        
        // Update FPS
        this.fpsUpdateCounter += deltaTime;
        if (this.fpsUpdateCounter >= this.fpsUpdateInterval) {
            this.fps = Math.round(this.frameCount / this.fpsUpdateCounter);
            this.frameCount = 0;
            this.fpsUpdateCounter = 0;
        }
        
        // Update data
        this.data.fps = this.fps;
        this.data.frameTime = this.frameTime.toFixed(2);
        
        if (player) {
            this.data.position = {
                x: player.position.x.toFixed(1),
                y: player.position.y.toFixed(1),
                z: player.position.z.toFixed(1)
            };
            this.data.velocity = {
                x: player.velocity.x.toFixed(2),
                y: player.velocity.y.toFixed(2),
                z: player.velocity.z.toFixed(2)
            };
        }
        
        this.data.bodyCount = entityCount;
        
        if (renderer) {
            const renderInfo = renderer.getRenderInfo();
            this.data.drawCalls = renderInfo.calls;
        }
        
        // Memory usage
        if (performance.memory) {
            this.data.memory = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
        }
        
        // Uptime
        this.data.uptime = ((now - this.startTime) / 1000).toFixed(1);
    }

    /**
     * Toggle visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        this.updateUI();
    }

    /**
     * Show telemetry
     */
    show() {
        this.isVisible = true;
        this.updateUI();
    }

    /**
     * Hide telemetry
     */
    hide() {
        this.isVisible = false;
        this.updateUI();
    }

    /**
     * Update UI display
     */
    updateUI() {
        const telemetryEl = document.getElementById('telemetry');
        
        if (this.isVisible) {
            telemetryEl.classList.add('active');
            
            // Update values
            document.getElementById('fps').textContent = this.data.fps;
            document.getElementById('frame-time').textContent = this.data.frameTime + 'ms';
            document.getElementById('pos').textContent = 
                `${this.data.position.x},${this.data.position.y},${this.data.position.z}`;
            document.getElementById('bodies').textContent = this.data.bodyCount;
            document.getElementById('draw-calls').textContent = this.data.drawCalls;
            document.getElementById('memory').textContent = this.data.memory + 'MB';
        } else {
            telemetryEl.classList.remove('active');
        }
    }

    /**
     * Get data
     */
    getData() {
        return { ...this.data };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Telemetry;
}
