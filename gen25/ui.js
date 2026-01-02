/**
 * UI SYSTEM
 * HUD, performance metrics, developer console, and debug overlays.
 */

class UIManager {
    constructor(config) {
        this.config = config;
        
        // UI Elements
        this.container = null;
        this.performancePanel = null;
        this.coordinatesPanel = null;
        this.debugLog = null;
        this.crosshair = null;
        this.devConsole = null;
        
        // State
        this.showPerformance = config.ui.showPerformanceMetrics;
        this.showCoordinates = config.ui.showCoordinates;
        this.showDebug = config.ui.showDebugLog;
        this.devConsoleOpen = false;
        
        // Debug log buffer
        this.logMessages = [];
        this.maxLogMessages = config.ui.debugLogMaxLines;
        
        this.initialize();
        this.setupControls();
        this.captureConsole();
    }

    /**
     * Initialize UI elements
     */
    initialize() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'ui-container';
        document.body.appendChild(this.container);
        
        // Performance metrics
        this.createPerformancePanel();
        
        // Coordinates display
        this.createCoordinatesPanel();
        
        // Debug log
        this.createDebugLog();
        
        // Crosshair
        this.createCrosshair();
        
        // Developer console
        this.createDevConsole();
        
        // Help text
        this.createHelpText();
    }

    /**
     * Create performance metrics panel
     */
    createPerformancePanel() {
        this.performancePanel = document.createElement('div');
        this.performancePanel.id = 'performance-panel';
        this.performancePanel.className = 'ui-panel';
        this.performancePanel.style.display = this.showPerformance ? 'block' : 'none';
        this.performancePanel.innerHTML = `
            <div class="panel-title">Performance</div>
            <div id="fps">FPS: --</div>
            <div id="frame-time">Frame: -- ms</div>
            <div id="physics-time">Physics: -- ms</div>
            <div id="render-time">Render: -- ms</div>
        `;
        this.container.appendChild(this.performancePanel);
    }

    /**
     * Create coordinates panel
     */
    createCoordinatesPanel() {
        this.coordinatesPanel = document.createElement('div');
        this.coordinatesPanel.id = 'coordinates-panel';
        this.coordinatesPanel.className = 'ui-panel';
        this.coordinatesPanel.style.display = this.showCoordinates ? 'block' : 'none';
        this.coordinatesPanel.innerHTML = `
            <div class="panel-title">Position</div>
            <div id="pos-x">X: --</div>
            <div id="pos-y">Y: --</div>
            <div id="pos-z">Z: --</div>
            <div id="velocity">Speed: -- m/s</div>
            <div id="nearest-body">Near: --</div>
        `;
        this.container.appendChild(this.coordinatesPanel);
    }

    /**
     * Create debug log
     */
    createDebugLog() {
        this.debugLog = document.createElement('div');
        this.debugLog.id = 'debug-log';
        this.debugLog.className = 'ui-panel';
        this.debugLog.style.display = this.showDebug ? 'block' : 'none';
        this.debugLog.innerHTML = `
            <div class="panel-title">Debug Log</div>
            <div id="log-content"></div>
        `;
        this.container.appendChild(this.debugLog);
    }

    /**
     * Create crosshair
     */
    createCrosshair() {
        this.crosshair = document.createElement('div');
        this.crosshair.id = 'crosshair';
        this.crosshair.innerHTML = `
            <div class="crosshair-line crosshair-h"></div>
            <div class="crosshair-line crosshair-v"></div>
        `;
        this.container.appendChild(this.crosshair);
    }

    /**
     * Create developer console
     */
    createDevConsole() {
        this.devConsole = document.createElement('div');
        this.devConsole.id = 'dev-console';
        this.devConsole.style.display = 'none';
        this.devConsole.innerHTML = `
            <div class="console-header">
                <h2>Developer Console</h2>
                <button id="close-console">Close (Press /)</button>
            </div>
            <div class="console-content" id="console-content"></div>
        `;
        document.body.appendChild(this.devConsole);
        
        // Close button
        document.getElementById('close-console').addEventListener('click', () => {
            this.toggleDevConsole();
        });
        
        // Populate console with config
        this.populateDevConsole();
    }

    /**
     * Create help text
     */
    createHelpText() {
        const helpText = document.createElement('div');
        helpText.id = 'help-text';
        helpText.className = 'ui-panel';
        helpText.innerHTML = `
            <div class="panel-title">Controls</div>
            <div>WASD - Move | Space - Jump/Up | Shift - Sprint/Down</div>
            <div>F - Toggle Flight | V - Toggle Camera | RMB - Grab Object</div>
            <div>/ - Dev Console | F3 - Metrics | F4 - Coordinates</div>
            <div style="margin-top: 10px; opacity: 0.7;">Click to lock cursor</div>
        `;
        this.container.appendChild(helpText);
        
        // Hide after a few seconds
        setTimeout(() => {
            helpText.style.opacity = '0';
            setTimeout(() => helpText.remove(), 1000);
        }, 8000);
    }

    /**
     * Populate developer console with editable config
     */
    populateDevConsole() {
        const content = document.getElementById('console-content');
        content.innerHTML = '';
        
        // Create sections for different config categories
        this.createConfigSection(content, 'Simulation', CONFIG.simulation);
        this.createConfigSection(content, 'Rendering', CONFIG.rendering);
        this.createConfigSection(content, 'Player', CONFIG.player);
        this.createConfigSection(content, 'Camera', CONFIG.camera);
        
        // Celestial bodies
        const celestialSection = document.createElement('div');
        celestialSection.className = 'config-section';
        celestialSection.innerHTML = '<h3>Celestial Bodies</h3>';
        
        for (let bodyName of ['sun', 'planet1', 'planet2', 'moon1']) {
            this.createConfigSection(celestialSection, bodyName, CONFIG[bodyName]);
        }
        
        content.appendChild(celestialSection);
    }

    /**
     * Create a config section with editable fields
     */
    createConfigSection(parent, title, configObj) {
        const section = document.createElement('div');
        section.className = 'config-section';
        
        const header = document.createElement('h3');
        header.textContent = title;
        section.appendChild(header);
        
        for (let key in configObj) {
            const value = configObj[key];
            
            // Skip complex objects and functions
            if (typeof value === 'object' && !Array.isArray(value)) continue;
            if (typeof value === 'function') continue;
            
            const field = document.createElement('div');
            field.className = 'config-field';
            
            const label = document.createElement('label');
            label.textContent = key;
            field.appendChild(label);
            
            if (typeof value === 'boolean') {
                // Checkbox for booleans
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = value;
                input.addEventListener('change', () => {
                    configObj[key] = input.checked;
                    this.log(`${title}.${key} = ${input.checked}`);
                });
                field.appendChild(input);
            } else if (typeof value === 'number') {
                // Number input
                const input = document.createElement('input');
                input.type = 'number';
                input.value = value;
                input.step = 'any';
                input.addEventListener('change', () => {
                    configObj[key] = parseFloat(input.value);
                    this.log(`${title}.${key} = ${input.value}`);
                });
                field.appendChild(input);
            } else if (typeof value === 'string') {
                // Text input
                const input = document.createElement('input');
                input.type = 'text';
                input.value = value;
                input.addEventListener('change', () => {
                    configObj[key] = input.value;
                    this.log(`${title}.${key} = ${input.value}`);
                });
                field.appendChild(input);
            } else if (Array.isArray(value)) {
                // Array display (read-only for now)
                const display = document.createElement('span');
                display.textContent = `[${value.join(', ')}]`;
                display.className = 'array-display';
                field.appendChild(display);
            }
            
            section.appendChild(field);
        }
        
        parent.appendChild(section);
    }

    /**
     * Setup keyboard controls
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            // Toggle dev console
            if (e.code === 'Slash') {
                e.preventDefault();
                this.toggleDevConsole();
            }
            
            // Toggle performance metrics
            if (e.code === 'F3') {
                e.preventDefault();
                this.togglePerformance();
            }
            
            // Toggle coordinates
            if (e.code === 'F4') {
                e.preventDefault();
                this.toggleCoordinates();
            }
        });
    }

    /**
     * Capture console.log and console.error
     */
    captureConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.log(args.join(' '), 'log');
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.log(args.join(' '), 'error');
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.log(args.join(' '), 'warn');
        };
    }

    /**
     * Add message to debug log
     */
    log(message, type = 'log') {
        const timestamp = new Date().toLocaleTimeString();
        this.logMessages.push({ timestamp, message, type });
        
        // Trim log
        if (this.logMessages.length > this.maxLogMessages) {
            this.logMessages.shift();
        }
        
        // Update display
        this.updateDebugLog();
    }

    /**
     * Update debug log display
     */
    updateDebugLog() {
        const logContent = document.getElementById('log-content');
        if (!logContent) return;
        
        logContent.innerHTML = '';
        
        for (let entry of this.logMessages) {
            const line = document.createElement('div');
            line.className = `log-line log-${entry.type}`;
            line.innerHTML = `<span class="log-time">[${entry.timestamp}]</span> ${entry.message}`;
            logContent.appendChild(line);
        }
        
        // Auto scroll to bottom
        logContent.scrollTop = logContent.scrollHeight;
    }

    /**
     * Toggle developer console
     */
    toggleDevConsole() {
        this.devConsoleOpen = !this.devConsoleOpen;
        this.devConsole.style.display = this.devConsoleOpen ? 'block' : 'none';
        
        // Show/hide cursor
        if (this.devConsoleOpen) {
            document.exitPointerLock();
        }
    }

    /**
     * Toggle performance metrics
     */
    togglePerformance() {
        this.showPerformance = !this.showPerformance;
        this.performancePanel.style.display = this.showPerformance ? 'block' : 'none';
    }

    /**
     * Toggle coordinates
     */
    toggleCoordinates() {
        this.showCoordinates = !this.showCoordinates;
        this.coordinatesPanel.style.display = this.showCoordinates ? 'block' : 'none';
    }

    /**
     * Update performance metrics
     */
    updatePerformance(metrics) {
        if (!this.showPerformance) return;
        
        document.getElementById('fps').textContent = `FPS: ${metrics.fps}`;
        document.getElementById('frame-time').textContent = `Frame: ${metrics.frameTime.toFixed(2)} ms`;
        document.getElementById('physics-time').textContent = `Physics: ${metrics.physicsTime.toFixed(2)} ms`;
        document.getElementById('render-time').textContent = `Render: ${metrics.renderTime.toFixed(2)} ms`;
    }

    /**
     * Update coordinates display
     */
    updateCoordinates(player, physics) {
        if (!this.showCoordinates) return;
        
        const pos = player.position;
        document.getElementById('pos-x').textContent = `X: ${pos.x.toExponential(2)}`;
        document.getElementById('pos-y').textContent = `Y: ${pos.y.toExponential(2)}`;
        document.getElementById('pos-z').textContent = `Z: ${pos.z.toExponential(2)}`;
        
        const speed = player.velocity.length();
        document.getElementById('velocity').textContent = `Speed: ${speed.toFixed(2)} m/s`;
        
        const nearest = physics.getNearestBody(pos);
        if (nearest.body) {
            const dist = (nearest.distance - nearest.body.radius) / 1000;
            document.getElementById('nearest-body').textContent = 
                `Near: ${nearest.body.name} (${dist.toFixed(2)} km)`;
        }
    }

    /**
     * Show error overlay
     */
    showError(title, message) {
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'error-overlay';
        errorOverlay.innerHTML = `
            <div class="error-box">
                <h2>⚠️ ${title}</h2>
                <p>${message}</p>
                <p class="error-help">Check the browser console (F12) for more details.</p>
            </div>
        `;
        document.body.appendChild(errorOverlay);
    }

    /**
     * Update UI (called each frame)
     */
    update(gameState) {
        // Update various UI elements as needed
    }
}
