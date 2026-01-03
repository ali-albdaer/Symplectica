/**
 * UIManager.js - User Interface Management
 * Handles HUD, Developer Console, Telemetry, and Debug Overlays
 */

import { Config } from './Config.js';
import { Logger, EventBus, Utils } from './Utils.js';

export class UIManager {
    constructor() {
        this.container = null;
        this.elements = {};
        
        // State
        this.showTelemetry = Config.ui.showTelemetry;
        this.showConsole = Config.ui.showDebugConsole;
        this.consoleHistory = [];
        this.consoleInput = '';
        
        // Performance tracking
        this.fps = 0;
        this.frameTime = 0;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        
        // Create UI elements
        this.createUI();
        this.setupEvents();
        
        Logger.system('UIManager initialized');
    }

    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'game-ui';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            font-family: 'Consolas', 'Monaco', monospace;
            z-index: 1000;
        `;
        document.body.appendChild(this.container);
        
        // Create all UI components
        this.createCrosshair();
        this.createTelemetry();
        this.createConsole();
        this.createErrorOverlay();
        this.createHelpOverlay();
        this.createModeIndicator();
    }

    createCrosshair() {
        const crosshair = document.createElement('div');
        crosshair.id = 'crosshair';
        crosshair.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${Config.ui.crosshairSize}px;
            height: ${Config.ui.crosshairSize}px;
            pointer-events: none;
        `;
        
        crosshair.innerHTML = `
            <svg width="${Config.ui.crosshairSize}" height="${Config.ui.crosshairSize}" viewBox="0 0 20 20">
                <line x1="10" y1="0" x2="10" y2="8" stroke="${Config.ui.crosshairColor}" stroke-width="2" opacity="${Config.ui.crosshairOpacity}"/>
                <line x1="10" y1="12" x2="10" y2="20" stroke="${Config.ui.crosshairColor}" stroke-width="2" opacity="${Config.ui.crosshairOpacity}"/>
                <line x1="0" y1="10" x2="8" y2="10" stroke="${Config.ui.crosshairColor}" stroke-width="2" opacity="${Config.ui.crosshairOpacity}"/>
                <line x1="12" y1="10" x2="20" y2="10" stroke="${Config.ui.crosshairColor}" stroke-width="2" opacity="${Config.ui.crosshairOpacity}"/>
                <circle cx="10" cy="10" r="2" fill="none" stroke="${Config.ui.crosshairColor}" stroke-width="1" opacity="${Config.ui.crosshairOpacity}"/>
            </svg>
        `;
        
        this.container.appendChild(crosshair);
        this.elements.crosshair = crosshair;
    }

    createTelemetry() {
        const telemetry = document.createElement('div');
        telemetry.id = 'telemetry';
        telemetry.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #00FF00;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            line-height: 1.6;
            min-width: 200px;
            display: ${this.showTelemetry ? 'block' : 'none'};
        `;
        
        telemetry.innerHTML = `
            <div style="color: #FFFF00; margin-bottom: 5px; font-weight: bold;">TELEMETRY [T]</div>
            <div id="tel-fps">FPS: --</div>
            <div id="tel-frametime">Frame Time: -- ms</div>
            <div id="tel-position">Position: (0, 0, 0)</div>
            <div id="tel-velocity">Velocity: 0 m/s</div>
            <div id="tel-altitude">Altitude: -- m</div>
            <div id="tel-mode">Mode: Walking</div>
            <div id="tel-planet">Planet: --</div>
            <div id="tel-grounded">Grounded: --</div>
        `;
        
        this.container.appendChild(telemetry);
        this.elements.telemetry = telemetry;
    }

    createConsole() {
        const consolePanel = document.createElement('div');
        consolePanel.id = 'dev-console';
        consolePanel.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            max-height: 500px;
            background: rgba(0, 0, 0, 0.9);
            color: #00FF00;
            border: 1px solid #00FF00;
            border-radius: 5px;
            font-size: 12px;
            display: ${this.showConsole ? 'flex' : 'none'};
            flex-direction: column;
            pointer-events: auto;
        `;
        
        consolePanel.innerHTML = `
            <div style="padding: 10px; border-bottom: 1px solid #00FF00; color: #FFFF00; font-weight: bold;">
                DEVELOPER CONSOLE [/] - Press ESC to close
            </div>
            <div id="console-output" style="flex: 1; overflow-y: auto; padding: 10px; max-height: 350px;"></div>
            <div style="padding: 10px; border-top: 1px solid #00FF00; display: flex;">
                <span style="color: #FFFF00;">></span>
                <input type="text" id="console-input" style="
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #00FF00;
                    outline: none;
                    margin-left: 10px;
                    font-family: inherit;
                    font-size: inherit;
                " placeholder="Enter command or Config.property = value">
            </div>
        `;
        
        this.container.appendChild(consolePanel);
        this.elements.console = consolePanel;
        this.elements.consoleOutput = consolePanel.querySelector('#console-output');
        this.elements.consoleInput = consolePanel.querySelector('#console-input');
        
        // Setup console input
        this.elements.consoleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeConsoleCommand(this.elements.consoleInput.value);
                this.elements.consoleInput.value = '';
            } else if (e.key === 'Escape') {
                this.toggleConsole(false);
            }
        });
    }

    createErrorOverlay() {
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'error-overlay';
        errorOverlay.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            max-width: 400px;
            max-height: 200px;
            overflow-y: auto;
            background: rgba(80, 0, 0, 0.9);
            color: #FF4444;
            padding: 10px;
            border-radius: 5px;
            font-size: 11px;
            display: none;
            pointer-events: auto;
        `;
        
        errorOverlay.innerHTML = `
            <div style="color: #FF8888; margin-bottom: 5px; font-weight: bold;">ERRORS</div>
            <div id="error-list"></div>
        `;
        
        this.container.appendChild(errorOverlay);
        this.elements.errorOverlay = errorOverlay;
        this.elements.errorList = errorOverlay.querySelector('#error-list');
        
        // Listen for errors
        Logger.addListener((entry) => {
            if (entry.category === 'error') {
                this.showError(entry.message);
            }
        });
    }

    createHelpOverlay() {
        const help = document.createElement('div');
        help.id = 'help-overlay';
        help.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #AAAAAA;
            padding: 10px;
            border-radius: 5px;
            font-size: 11px;
            line-height: 1.5;
        `;
        
        help.innerHTML = `
            <div style="color: #FFFF00; margin-bottom: 5px;">CONTROLS</div>
            <div>WASD - Move | SPACE - Jump/Up</div>
            <div>SHIFT - Sprint/Down | F - Toggle Flight</div>
            <div>C - Toggle Camera | T - Telemetry</div>
            <div>/ - Dev Console | RMB - Grab</div>
            <div>Click to capture mouse</div>
        `;
        
        this.container.appendChild(help);
        this.elements.help = help;
    }

    createModeIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'mode-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 100, 200, 0.7);
            color: white;
            padding: 8px 15px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: bold;
        `;
        indicator.textContent = 'WALKING MODE';
        
        this.container.appendChild(indicator);
        this.elements.modeIndicator = indicator;
    }

    setupEvents() {
        EventBus.on('toggleConsole', (data) => this.toggleConsole(data.active));
        EventBus.on('toggleTelemetry', () => this.toggleTelemetry());
        EventBus.on('flightModeChange', (data) => this.updateModeIndicator(data.flying));
        EventBus.on('pointerLockChange', (data) => this.updateCrosshair(data.locked));
    }

    /**
     * Toggle telemetry display
     */
    toggleTelemetry() {
        this.showTelemetry = !this.showTelemetry;
        this.elements.telemetry.style.display = this.showTelemetry ? 'block' : 'none';
    }

    /**
     * Toggle console display
     */
    toggleConsole(show = null) {
        this.showConsole = show !== null ? show : !this.showConsole;
        this.elements.console.style.display = this.showConsole ? 'flex' : 'none';
        
        if (this.showConsole) {
            this.elements.consoleInput.focus();
        }
    }

    /**
     * Execute a console command
     */
    executeConsoleCommand(command) {
        if (!command.trim()) return;
        
        // Log the command
        this.logToConsole(`> ${command}`, '#FFFF00');
        
        try {
            // Check for special commands
            if (command.toLowerCase() === 'help') {
                this.showConsoleHelp();
                return;
            }
            
            if (command.toLowerCase() === 'clear') {
                this.elements.consoleOutput.innerHTML = '';
                return;
            }
            
            if (command.toLowerCase().startsWith('config')) {
                // Direct config access
                const result = eval(command.replace('config', 'window.GameConfig'));
                this.logToConsole(JSON.stringify(result, null, 2), '#00FF00');
                return;
            }
            
            // Try to evaluate as JavaScript
            const result = eval(command);
            if (result !== undefined) {
                this.logToConsole(String(result), '#00FF00');
            }
        } catch (error) {
            this.logToConsole(`Error: ${error.message}`, '#FF4444');
        }
    }

    /**
     * Log message to console
     */
    logToConsole(message, color = '#00FF00') {
        const line = document.createElement('div');
        line.style.color = color;
        line.style.whiteSpace = 'pre-wrap';
        line.textContent = message;
        
        this.elements.consoleOutput.appendChild(line);
        this.elements.consoleOutput.scrollTop = this.elements.consoleOutput.scrollHeight;
        
        // Limit console lines
        while (this.elements.consoleOutput.children.length > Config.ui.consoleMaxLines) {
            this.elements.consoleOutput.removeChild(this.elements.consoleOutput.firstChild);
        }
    }

    /**
     * Show console help
     */
    showConsoleHelp() {
        const help = `
Available Commands:
  help          - Show this help
  clear         - Clear console
  
Config Access:
  config.physics.G_SCALED = 150    - Change gravity constant
  config.physics.TIME_SCALE = 2    - Change time scale
  config.player.walkSpeed = 20     - Change walk speed
  config.debug.showOrbits = true   - Show orbit lines
  
Examples:
  GameConfig.physics.G_SCALED      - Read current value
  GameConfig.player.flySpeed = 100 - Set new value
        `.trim();
        
        this.logToConsole(help, '#88AAFF');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.elements.errorOverlay.style.display = 'block';
        
        const errorLine = document.createElement('div');
        errorLine.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        errorLine.style.marginBottom = '5px';
        
        this.elements.errorList.appendChild(errorLine);
        
        // Limit error lines
        while (this.elements.errorList.children.length > 10) {
            this.elements.errorList.removeChild(this.elements.errorList.firstChild);
        }
        
        // Auto-hide after 10 seconds if no new errors
        clearTimeout(this.errorHideTimeout);
        this.errorHideTimeout = setTimeout(() => {
            this.elements.errorOverlay.style.display = 'none';
        }, 10000);
    }

    /**
     * Update mode indicator
     */
    updateModeIndicator(isFlying) {
        const indicator = this.elements.modeIndicator;
        
        if (isFlying) {
            indicator.textContent = 'FLIGHT MODE';
            indicator.style.background = 'rgba(200, 100, 0, 0.7)';
        } else {
            indicator.textContent = 'WALKING MODE';
            indicator.style.background = 'rgba(0, 100, 200, 0.7)';
        }
    }

    /**
     * Update crosshair visibility
     */
    updateCrosshair(locked) {
        this.elements.crosshair.style.display = locked ? 'block' : 'none';
    }

    /**
     * Update telemetry data
     */
    updateTelemetry(data) {
        if (!this.showTelemetry) return;
        
        // Calculate FPS
        const now = performance.now();
        this.frameCount++;
        
        if (now - this.fpsUpdateTime >= Config.ui.telemetryUpdateRate) {
            this.fps = Math.round(this.frameCount / ((now - this.fpsUpdateTime) / 1000));
            this.frameTime = ((now - this.lastFrameTime)).toFixed(2);
            this.frameCount = 0;
            this.fpsUpdateTime = now;
        }
        this.lastFrameTime = now;
        
        // Update display
        const pos = data.position;
        const vel = data.velocity?.length() || 0;
        
        document.getElementById('tel-fps').textContent = `FPS: ${this.fps}`;
        document.getElementById('tel-frametime').textContent = `Frame Time: ${this.frameTime} ms`;
        document.getElementById('tel-position').textContent = 
            `Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
        document.getElementById('tel-velocity').textContent = `Velocity: ${vel.toFixed(2)} m/s`;
        document.getElementById('tel-altitude').textContent = `Altitude: ${(data.altitude || 0).toFixed(1)} m`;
        document.getElementById('tel-mode').textContent = `Mode: ${data.isFlying ? 'Flying' : 'Walking'}`;
        document.getElementById('tel-planet').textContent = `Planet: ${data.currentPlanet || '--'}`;
        document.getElementById('tel-grounded').textContent = `Grounded: ${data.isGrounded ? 'Yes' : 'No'}`;
    }

    /**
     * Show loading screen
     */
    showLoading(message = 'Loading...') {
        let loading = document.getElementById('loading-screen');
        
        if (!loading) {
            loading = document.createElement('div');
            loading.id = 'loading-screen';
            loading.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                font-size: 24px;
                z-index: 9999;
            `;
            document.body.appendChild(loading);
        }
        
        loading.innerHTML = `
            <div style="margin-bottom: 20px;">${message}</div>
            <div style="width: 200px; height: 4px; background: #333; border-radius: 2px;">
                <div id="loading-bar" style="width: 0%; height: 100%; background: #00FF00; border-radius: 2px; transition: width 0.3s;"></div>
            </div>
        `;
        
        loading.style.display = 'flex';
        this.elements.loading = loading;
    }

    /**
     * Update loading progress
     */
    updateLoading(progress, message = null) {
        const bar = document.getElementById('loading-bar');
        if (bar) {
            bar.style.width = `${progress * 100}%`;
        }
        
        if (message && this.elements.loading) {
            this.elements.loading.querySelector('div').textContent = message;
        }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.style.display = 'none';
        }
    }

    /**
     * Display fatal error
     */
    showFatalError(title, message, stack = null) {
        let errorScreen = document.getElementById('fatal-error');
        
        if (!errorScreen) {
            errorScreen = document.createElement('div');
            errorScreen.id = 'fatal-error';
            errorScreen.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(80, 0, 0, 0.95);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: white;
                z-index: 99999;
                padding: 40px;
                box-sizing: border-box;
            `;
            document.body.appendChild(errorScreen);
        }
        
        errorScreen.innerHTML = `
            <div style="font-size: 32px; color: #FF4444; margin-bottom: 20px;">⚠ ${title}</div>
            <div style="font-size: 18px; margin-bottom: 20px; text-align: center;">${message}</div>
            ${stack ? `<pre style="background: rgba(0,0,0,0.5); padding: 20px; border-radius: 5px; max-width: 800px; overflow: auto; font-size: 12px;">${stack}</pre>` : ''}
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; font-size: 16px; cursor: pointer;">Reload</button>
        `;
        
        errorScreen.style.display = 'flex';
    }

    /**
     * Clean up
     */
    dispose() {
        if (this.container) {
            this.container.remove();
        }
        Logger.system('UIManager disposed');
    }
}

export default UIManager;
