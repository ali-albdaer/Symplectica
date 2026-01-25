/**
 * DebugOverlay.js
 * On-screen debug information display.
 * Shows FPS, coordinates, physics info, and more.
 */

import { DEBUG, PHYSICS, configManager } from '../config/GlobalConfig.js';
import { loggerSystem, LogLevel } from '../utils/DebugLogger.js';

export class DebugOverlay {
    constructor(game) {
        this.game = game;
        this.isVisible = DEBUG.showFPS || DEBUG.showCoordinates;
        this.showFPS = DEBUG.showFPS;
        this.showCoordinates = DEBUG.showCoordinates;
        this.showPhysics = DEBUG.showPhysicsDebug;
        this.showLogs = false;
        
        // FPS calculation
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.currentFPS = 0;
        this.frameTimes = [];
        
        this.createUI();
        this.setupInput();
    }

    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'debug-overlay';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 4px;
            z-index: 9999;
            pointer-events: none;
            min-width: 200px;
        `;
        
        // FPS display
        this.fpsElement = document.createElement('div');
        this.fpsElement.style.color = '#4aff4a';
        this.container.appendChild(this.fpsElement);
        
        // Coordinates display
        this.coordsElement = document.createElement('div');
        this.coordsElement.style.marginTop = '5px';
        this.container.appendChild(this.coordsElement);
        
        // Physics display
        this.physicsElement = document.createElement('div');
        this.physicsElement.style.cssText = `
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #333;
        `;
        this.container.appendChild(this.physicsElement);
        
        // Player info display
        this.playerElement = document.createElement('div');
        this.playerElement.style.cssText = `
            margin-top: 5px;
            padding-top: 5px;
            border-top: 1px solid #333;
        `;
        this.container.appendChild(this.playerElement);
        
        document.body.appendChild(this.container);
        
        // Log display (separate container)
        this.logContainer = document.createElement('div');
        this.logContainer.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            width: 500px;
            max-height: 200px;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            font-family: 'Consolas', monospace;
            font-size: 11px;
            padding: 10px;
            border-radius: 4px;
            z-index: 9999;
            overflow-y: auto;
            display: none;
        `;
        document.body.appendChild(this.logContainer);
        
        // Listen for log updates
        loggerSystem.addListener((entry) => this.addLogEntry(entry));
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'F3') {
                e.preventDefault();
                this.toggle();
            }
            if (e.code === 'F4') {
                e.preventDefault();
                this.toggleLogs();
            }
        });
        
        // Subscribe to config changes
        configManager.subscribe('DEBUG.*', (path, value) => {
            if (path.includes('showFPS')) this.showFPS = value;
            if (path.includes('showCoordinates')) this.showCoordinates = value;
            if (path.includes('showPhysicsDebug')) this.showPhysics = value;
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
    }

    toggleLogs() {
        this.showLogs = !this.showLogs;
        this.logContainer.style.display = this.showLogs ? 'block' : 'none';
    }

    addLogEntry(entry) {
        if (!this.showLogs) return;
        
        const line = document.createElement('div');
        const time = (entry.timestamp / 1000).toFixed(2);
        
        let color = '#888';
        switch (entry.level) {
            case LogLevel.INFO: color = '#4a9eff'; break;
            case LogLevel.WARN: color = '#ffaa00'; break;
            case LogLevel.ERROR: color = '#ff4444'; break;
        }
        
        line.innerHTML = `<span style="color: #666">[${time}s]</span> <span style="color: ${color}">[${entry.category}]</span> ${entry.message}`;
        this.logContainer.appendChild(line);
        
        // Auto-scroll
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        
        // Limit displayed logs
        while (this.logContainer.children.length > 50) {
            this.logContainer.removeChild(this.logContainer.firstChild);
        }
    }

    update(deltaTime) {
        if (!this.isVisible) return;
        
        // Update FPS
        this.frameCount++;
        this.frameTimes.push(deltaTime);
        if (this.frameTimes.length > 60) this.frameTimes.shift();
        
        const now = performance.now();
        if (now - this.lastFPSUpdate > 250) {
            const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
            this.currentFPS = Math.round(1000 / avgFrameTime);
            this.lastFPSUpdate = now;
        }
        
        // Update FPS display
        if (this.showFPS) {
            const fpsColor = this.currentFPS >= 55 ? '#4aff4a' : 
                           this.currentFPS >= 30 ? '#ffaa00' : '#ff4444';
            this.fpsElement.innerHTML = `<span style="color: ${fpsColor}">FPS: ${this.currentFPS}</span>`;
            this.fpsElement.style.display = 'block';
        } else {
            this.fpsElement.style.display = 'none';
        }
        
        // Update coordinates
        if (this.showCoordinates && this.game.player) {
            const pos = this.game.player.position;
            this.coordsElement.innerHTML = `
                <div style="color: #aaa">Position (km):</div>
                <div>X: ${pos.x.toFixed(2)}</div>
                <div>Y: ${pos.y.toFixed(2)}</div>
                <div>Z: ${pos.z.toFixed(2)}</div>
            `;
            this.coordsElement.style.display = 'block';
        } else {
            this.coordsElement.style.display = 'none';
        }
        
        // Update physics info
        if (this.showPhysics && this.game.physics) {
            const metrics = this.game.physics.getMetrics();
            const energy = this.game.physics.getTotalEnergy();
            
            this.physicsElement.innerHTML = `
                <div style="color: #aaa">Physics:</div>
                <div>Time Scale: ${metrics.timeScale.toFixed(2)}x</div>
                <div>Simulated: ${metrics.formattedTime}</div>
                <div>Bodies: ${metrics.bodyCount}</div>
                <div>Physics: ${metrics.physicsTimeMs.toFixed(2)}ms</div>
                <div style="color: #666">Energy: ${energy.total.toExponential(2)} J</div>
            `;
            this.physicsElement.style.display = 'block';
        } else {
            this.physicsElement.style.display = 'none';
        }
        
        // Update player info
        if (this.game.player) {
            const info = this.game.player.getDebugInfo();
            this.playerElement.innerHTML = `
                <div style="color: #aaa">Player:</div>
                <div>Mode: ${info.isFreeFlightMode ? 'Flying' : (info.isGrounded ? 'Grounded' : 'Falling')}</div>
                <div>Speed: ${info.speed.toFixed(4)} km/s</div>
                <div>Near: ${info.nearestBody}</div>
                <div>Alt: ${info.altitude.toFixed(4)} km</div>
            `;
            this.playerElement.style.display = 'block';
        } else {
            this.playerElement.style.display = 'none';
        }
    }
}
