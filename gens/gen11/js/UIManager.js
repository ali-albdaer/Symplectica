/**
 * UIManager.js - User Interface Manager
 * 
 * Handles all UI elements including telemetry, debug console, and developer console.
 */

import Config, { updateConfig } from './Config.js';

export class UIManager {
    constructor(engine, player) {
        this.engine = engine;
        this.player = player;
        
        // UI Elements
        this.telemetryDiv = document.getElementById('telemetry');
        this.debugLogDiv = document.getElementById('debug-log');
        this.devConsole = document.getElementById('dev-console');
        this.controlsInfo = document.getElementById('controls-info');
        
        // Telemetry elements
        this.fpsElement = document.getElementById('fps');
        this.frameTimeElement = document.getElementById('frame-time');
        this.positionElement = document.getElementById('position');
        this.velocityElement = document.getElementById('velocity');
        this.modeElement = document.getElementById('mode');
        this.bodiesElement = document.getElementById('bodies');
        
        // Debug log
        this.logContent = document.getElementById('log-content');
        this.logMessages = [];
        
        // Update interval
        this.telemetryUpdateInterval = null;
        
        this.init();
    }

    /**
     * Initialize UI Manager
     */
    init() {
        this.setupEventListeners();
        this.setupDevConsole();
        this.startTelemetryUpdates();
        
        console.log('UIManager initialized');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Toggle telemetry (T key)
        document.addEventListener('keydown', (e) => {
            if (e.code === Config.controls.keys.toggleTelemetry && !e.repeat) {
                this.toggleTelemetry();
            }
            
            if (e.code === Config.controls.keys.toggleDebugLog && !e.repeat) {
                this.toggleDebugLog();
            }
            
            if (e.code === Config.controls.keys.toggleDevConsole && !e.repeat) {
                this.toggleDevConsole();
            }
        });
    }

    /**
     * Setup developer console controls
     */
    setupDevConsole() {
        // Fidelity selector
        const fidelitySelect = document.getElementById('fidelity');
        fidelitySelect.value = Config.rendering.currentFidelity;
        fidelitySelect.addEventListener('change', (e) => {
            this.applySettings();
        });
        
        // Shadow settings
        const enableShadows = document.getElementById('enable-shadows');
        enableShadows.checked = Config.rendering.enableShadows;
        
        const shadowQuality = document.getElementById('shadow-quality');
        const currentFidelity = Config.rendering.fidelity[Config.rendering.currentFidelity];
        shadowQuality.value = currentFidelity.shadowMapSize;
        
        // Physics settings
        document.getElementById('time-scale').value = Config.physics.timeScale;
        document.getElementById('gravity-g').value = Config.physics.G;
        document.getElementById('substeps').value = Config.physics.substeps;
        
        // Player settings
        document.getElementById('move-speed').value = Config.player.walkSpeed;
        document.getElementById('flight-speed').value = Config.player.flightSpeed;
        document.getElementById('jump-force').value = Config.player.jumpForce;
        
        // Camera settings
        document.getElementById('fov').value = Config.rendering.fov;
        document.getElementById('mouse-sens').value = Config.controls.mouseSensitivity;
        document.getElementById('mouse-sens-value').textContent = Config.controls.mouseSensitivity;
        
        // Mouse sensitivity display
        document.getElementById('mouse-sens').addEventListener('input', (e) => {
            document.getElementById('mouse-sens-value').textContent = e.target.value;
        });
        
        // Buttons
        document.getElementById('apply-settings').addEventListener('click', () => {
            this.applySettings();
        });
        
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });
        
        document.getElementById('close-console').addEventListener('click', () => {
            this.toggleDevConsole();
        });
    }

    /**
     * Apply settings from developer console
     */
    applySettings() {
        try {
            // Graphics settings
            const fidelity = document.getElementById('fidelity').value;
            const enableShadows = document.getElementById('enable-shadows').checked;
            const shadowQuality = parseInt(document.getElementById('shadow-quality').value);
            
            this.engine.updateGraphicsSettings({
                fidelity: fidelity,
                enableShadows: enableShadows,
                shadowMapSize: shadowQuality,
                fov: parseFloat(document.getElementById('fov').value),
            });
            
            // Physics settings
            updateConfig('physics.timeScale', parseFloat(document.getElementById('time-scale').value));
            updateConfig('physics.G', parseFloat(document.getElementById('gravity-g').value));
            updateConfig('physics.substeps', parseInt(document.getElementById('substeps').value));
            
            // Player settings
            updateConfig('player.walkSpeed', parseFloat(document.getElementById('move-speed').value));
            updateConfig('player.flightSpeed', parseFloat(document.getElementById('flight-speed').value));
            updateConfig('player.jumpForce', parseFloat(document.getElementById('jump-force').value));
            
            // Camera settings
            updateConfig('controls.mouseSensitivity', parseFloat(document.getElementById('mouse-sens').value));
            
            this.addLog('Settings applied successfully', 'success');
        } catch (error) {
            this.addLog(`Error applying settings: ${error.message}`, 'error');
        }
    }

    /**
     * Reset settings to default
     */
    resetSettings() {
        // This would require storing default values
        // For now, just reload the page
        if (confirm('Reset all settings to default? This will reload the page.')) {
            location.reload();
        }
    }

    /**
     * Toggle telemetry display
     */
    toggleTelemetry() {
        Config.ui.showTelemetry = !Config.ui.showTelemetry;
        
        if (Config.ui.showTelemetry) {
            this.telemetryDiv.classList.add('visible');
        } else {
            this.telemetryDiv.classList.remove('visible');
        }
    }

    /**
     * Toggle debug log display
     */
    toggleDebugLog() {
        Config.ui.showDebugLog = !Config.ui.showDebugLog;
        
        if (Config.ui.showDebugLog) {
            this.debugLogDiv.classList.add('visible');
        } else {
            this.debugLogDiv.classList.remove('visible');
        }
    }

    /**
     * Toggle developer console
     */
    toggleDevConsole() {
        const isVisible = this.devConsole.classList.contains('visible');
        
        if (isVisible) {
            this.devConsole.classList.remove('visible');
            // Re-enable pointer lock
            if (this.player && !this.player.isPointerLocked) {
                setTimeout(() => {
                    this.player.requestPointerLock();
                }, 100);
            }
        } else {
            this.devConsole.classList.add('visible');
            // Release pointer lock
            if (this.player && this.player.isPointerLocked) {
                this.player.exitPointerLock();
            }
        }
    }

    /**
     * Start telemetry updates
     */
    startTelemetryUpdates() {
        this.telemetryUpdateInterval = setInterval(() => {
            if (Config.ui.showTelemetry) {
                this.updateTelemetry();
            }
        }, Config.ui.telemetryUpdateRate);
    }

    /**
     * Update telemetry display
     */
    updateTelemetry() {
        if (!this.player) return;
        
        const stats = this.engine.getStats();
        const position = this.player.getPosition();
        const velocity = this.player.getVelocity();
        
        this.fpsElement.textContent = `FPS: ${stats.fps}`;
        this.frameTimeElement.textContent = `Frame Time: ${stats.frameTime}ms`;
        this.positionElement.textContent = `Position: [${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)}]`;
        this.velocityElement.textContent = `Velocity: [${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)}, ${velocity.z.toFixed(2)}]`;
        this.modeElement.textContent = `Mode: ${this.player.mode === 'walking' ? 'Walking' : 'Flight'}`;
        this.bodiesElement.textContent = `Bodies: ${stats.bodies}`;
    }

    /**
     * Update the current mode display in controls info
     */
    updateControlsInfo() {
        if (!this.player) return;
        
        const modeElement = document.getElementById('current-mode');
        if (modeElement) {
            modeElement.textContent = this.player.mode === 'walking' ? 'WALKING MODE' : 'FLIGHT MODE';
        }
    }

    /**
     * Add a log message
     */
    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const color = Config.ui.colors[type] || Config.ui.colors.info;
        
        const logEntry = {
            message: message,
            type: type,
            timestamp: timestamp,
            color: color,
        };
        
        this.logMessages.push(logEntry);
        
        // Limit log size
        if (this.logMessages.length > Config.ui.debugLogMaxLines) {
            this.logMessages.shift();
        }
        
        // Update display
        this.updateLogDisplay();
    }

    /**
     * Update debug log display
     */
    updateLogDisplay() {
        if (!this.logContent) return;
        
        const html = this.logMessages.map(entry => {
            return `<div style="color: ${entry.color};">[${entry.timestamp}] ${entry.message}</div>`;
        }).join('');
        
        this.logContent.innerHTML = html;
        
        // Auto-scroll to bottom
        this.logContent.scrollTop = this.logContent.scrollHeight;
    }

    /**
     * Clear debug log
     */
    clearLog() {
        this.logMessages = [];
        this.updateLogDisplay();
    }

    /**
     * Show loading screen
     */
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <h1>ERROR</h1>
                <p style="color: #f00; max-width: 600px; padding: 20px;">${message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                    Reload Page
                </button>
            `;
            loading.classList.remove('hidden');
        }
    }

    /**
     * Update UI (called every frame)
     */
    update() {
        // Update controls info
        this.updateControlsInfo();
        
        // Any per-frame UI updates
    }

    /**
     * Create a notification
     */
    notify(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 255, 0.9);
            color: #000;
            padding: 20px 40px;
            font-size: 18px;
            font-weight: bold;
            border: 2px solid #000;
            z-index: 1000;
            pointer-events: none;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.telemetryUpdateInterval) {
            clearInterval(this.telemetryUpdateInterval);
        }
    }
}

export default UIManager;
