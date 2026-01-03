/**
 * Performance Monitor
 * Displays real-time performance metrics and system information
 */

export class PerformanceMonitor {
    constructor(renderer, physicsEngine) {
        this.renderer = renderer;
        this.physicsEngine = physicsEngine;
        
        // DOM elements
        this.panel = document.getElementById('performance-monitor');
        this.fpsCounter = document.getElementById('fps-counter');
        this.frameTime = document.getElementById('frame-time');
        this.drawCalls = document.getElementById('draw-calls');
        this.triangles = document.getElementById('triangles');
        this.gpuMemory = document.getElementById('gpu-memory');
        
        // State
        this.isVisible = false;
        this.updateInterval = 500; // ms
        this.lastUpdate = 0;
        
        // Initialize hidden
        this.panel.classList.add('hidden');
    }

    /**
     * Toggle visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.panel.classList.remove('hidden');
        } else {
            this.panel.classList.add('hidden');
        }
    }

    /**
     * Update performance metrics
     */
    update(currentTime) {
        if (!this.isVisible) return;
        
        // Throttle updates
        if (currentTime - this.lastUpdate < this.updateInterval) return;
        this.lastUpdate = currentTime;

        const stats = this.renderer.getStats();
        
        // Update FPS
        this.fpsCounter.textContent = `FPS: ${stats.fps}`;
        
        // Color code FPS
        if (stats.fps >= 55) {
            this.fpsCounter.style.color = '#4ade80'; // green
        } else if (stats.fps >= 30) {
            this.fpsCounter.style.color = '#fbbf24'; // yellow
        } else {
            this.fpsCounter.style.color = '#f87171'; // red
        }

        // Update frame time
        this.frameTime.textContent = `Frame Time: ${stats.frameTime}ms`;

        // Update draw calls
        this.drawCalls.textContent = `Draw Calls: ${stats.drawCalls}`;

        // Update triangles
        this.triangles.textContent = `Triangles: ${this.formatNumber(stats.triangles)}`;

        // Update GPU memory (if available)
        const memoryInfo = this.getGPUMemory();
        if (memoryInfo) {
            this.gpuMemory.textContent = `GPU Memory: ${memoryInfo}`;
        } else {
            this.gpuMemory.textContent = `GPU Memory: N/A`;
        }
    }

    /**
     * Get GPU memory info (if available)
     */
    getGPUMemory() {
        if (performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
            const totalMB = (performance.memory.totalJSHeapSize / 1048576).toFixed(1);
            return `${usedMB}/${totalMB} MB`;
        }
        return null;
    }

    /**
     * Format large numbers
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

export default PerformanceMonitor;
