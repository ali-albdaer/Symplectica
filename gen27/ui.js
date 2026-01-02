/**
 * UI System
 * Developer console, telemetry overlay, and main menu
 */

window.gameUI = {
    state: {
        showDevConsole: false,
        showHelp: false,
        lastTelemetryUpdate: 0,
    },

    init() {
        this.setupDevConsole();
        this.setupHelpPanel();
        this.setupTelemetry();
        DebugSystem.info('UI system initialized');
    },

    /**
     * Setup developer console
     */
    setupDevConsole() {
        const console = document.getElementById('devConsole');
        const content = document.getElementById('devConsoleContent');

        this.renderDevConsole();
    },

    /**
     * Render dev console content
     */
    renderDevConsole() {
        const content = document.getElementById('devConsoleContent');
        let html = '';

        // Sun parameters
        const sun = PhysicsEngine.getBody('Sun');
        if (sun) {
            html += this.createConsoleGroup('SUN', this.getBodyParams(sun));
        }

        // Planet 1 parameters
        const planet1 = PhysicsEngine.getBody('Planet 1');
        if (planet1) {
            html += this.createConsoleGroup('PLANET 1', this.getBodyParams(planet1));
        }

        // Moon 1 parameters
        const moon1 = PhysicsEngine.getBody('Moon 1');
        if (moon1) {
            html += this.createConsoleGroup('MOON 1', this.getBodyParams(moon1));
        }

        // Planet 2 parameters
        const planet2 = PhysicsEngine.getBody('Planet 2');
        if (planet2) {
            html += this.createConsoleGroup('PLANET 2', this.getBodyParams(planet2));
        }

        // Physics settings
        html += this.createConsoleGroup('PHYSICS', this.getPhysicsParams());

        // Rendering settings
        html += this.createConsoleGroup('RENDERING', this.getRenderingParams());

        // Player settings
        html += this.createConsoleGroup('PLAYER', this.getPlayerParams());

        content.innerHTML = html;

        // Attach event listeners to all inputs
        this.attachInputListeners();
    },

    /**
     * Create a console group (collapsible section)
     */
    createConsoleGroup(title, params) {
        let html = `<div class="console-group">
            <div class="console-group-title">${title}</div>`;

        for (let [key, value] of Object.entries(params)) {
            const inputId = `${title}_${key}`.replace(/\s+/g, '_');
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
            
            html += `<div class="param-input">
                <label class="param-label" for="${inputId}">${key}:</label>
                <input 
                    type="text" 
                    id="${inputId}"
                    data-path="${title}_${key}"
                    value="${displayValue}"
                />
                <button class="param-reset" onclick="window.gameUI.resetParam('${title}_${key}')">R</button>
            </div>`;
        }

        html += '</div>';
        return html;
    },

    /**
     * Get body parameters for console
     */
    getBodyParams(body) {
        return {
            'Position X': body.position.x.toExponential(2),
            'Position Y': body.position.y.toExponential(2),
            'Position Z': body.position.z.toExponential(2),
            'Velocity X': body.velocity.x.toFixed(2),
            'Velocity Y': body.velocity.y.toFixed(2),
            'Velocity Z': body.velocity.z.toFixed(2),
            'Mass': body.mass.toExponential(2),
            'Radius': body.radius.toExponential(2),
            'Rotation Period': body.rotationPeriod,
        };
    },

    /**
     * Get physics parameters
     */
    getPhysicsParams() {
        return {
            'G': Config.physics.G.toExponential(2),
            'dt': Config.physics.dt.toFixed(4),
            'Substeps': Config.physics.substeps,
            'Force Calculations': PhysicsEngine.metrics.forceCalculations,
            'Physics Time': PhysicsEngine.metrics.lastFrameTime.toFixed(2) + ' ms',
        };
    },

    /**
     * Get rendering parameters
     */
    getRenderingParams() {
        return {
            'Fidelity': Config.rendering.fidelity,
            'LOD Enabled': Config.rendering.lodEnabled,
            'Stars': Config.rendering.starCount,
            'Ambient Light': Config.rendering.ambientLightIntensity,
            'Shadow Bias': Config.rendering.sunShadowBias,
        };
    },

    /**
     * Get player parameters
     */
    getPlayerParams() {
        return {
            'Mass': Config.player.mass,
            'Walk Speed': Config.player.walkSpeed,
            'Sprint Speed': Config.player.sprintSpeed,
            'Jump Force': Config.player.jumpForce,
            'Free Fly Speed': Config.player.freeFlySpeed,
        };
    },

    /**
     * Attach input change listeners
     */
    attachInputListeners() {
        const inputs = document.querySelectorAll('#devConsoleContent input[type="text"]');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleParamChange(e.target);
            });
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleParamChange(e.target);
                }
            });
        });
    },

    /**
     * Handle parameter change
     */
    handleParamChange(input) {
        const path = input.dataset.path;
        const value = input.value;

        try {
            // Try to parse as number
            let parsedValue = isNaN(value) ? value : parseFloat(value);
            if (value.includes('e')) {
                parsedValue = parseFloat(value);
            }

            // Update config
            Utils.setObjectPath(Config, path.replace(/_/g, '.').toLowerCase(), parsedValue);
            
            DebugSystem.info(`Config updated: ${path} = ${parsedValue}`);
            input.style.background = 'rgba(0, 255, 0, 0.3)';
            setTimeout(() => input.style.background = 'rgba(0, 255, 0, 0.1)', 500);
        } catch (e) {
            DebugSystem.error('Failed to parse parameter', e);
            input.style.background = 'rgba(255, 0, 0, 0.3)';
        }
    },

    /**
     * Reset parameter to default
     */
    resetParam(path) {
        const defaults = Config._defaults;
        const value = Utils.getObjectPath(defaults, path.replace(/_/g, '.').toLowerCase());
        Utils.setObjectPath(Config, path.replace(/_/g, '.').toLowerCase(), value);
        this.renderDevConsole();
        DebugSystem.info(`Parameter reset: ${path}`);
    },

    /**
     * Setup help panel
     */
    setupHelpPanel() {
        const content = document.getElementById('helpContent');
        
        let html = `
            <div class="help-section">
                <div class="help-title">CONTROLS</div>
                <div class="key-binding">
                    <span class="key-name">W</span>
                    <span class="key-desc">Forward</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">A/D</span>
                    <span class="key-desc">Strafe Left/Right</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">S</span>
                    <span class="key-desc">Backward</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">SPACE</span>
                    <span class="key-desc">Jump (or Up in Free Flight)</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">SHIFT</span>
                    <span class="key-desc">Down in Free Flight</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">MOUSE</span>
                    <span class="key-desc">Look Around</span>
                </div>
            </div>

            <div class="help-section">
                <div class="help-title">INTERACTION</div>
                <div class="key-binding">
                    <span class="key-name">R</span>
                    <span class="key-desc">Grab/Release Object</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">RIGHT-CLICK</span>
                    <span class="key-desc">Grab/Release Object</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">F</span>
                    <span class="key-desc">Toggle Free Flight</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">V</span>
                    <span class="key-desc">Toggle First/Third Person</span>
                </div>
            </div>

            <div class="help-section">
                <div class="help-title">DEBUG</div>
                <div class="key-binding">
                    <span class="key-name">/</span>
                    <span class="key-desc">Toggle Developer Console</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">G</span>
                    <span class="key-desc">Toggle Telemetry Display</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">L</span>
                    <span class="key-desc">Toggle Debug Log</span>
                </div>
                <div class="key-binding">
                    <span class="key-name">H</span>
                    <span class="key-desc">Toggle Help</span>
                </div>
            </div>

            <div class="help-section">
                <div class="help-title">GAME INFO</div>
                <div class="help-text">
                    You are a traveler in a 3D solar system with accurate physics.
                    All celestial bodies interact gravitationally. Explore the worlds,
                    interact with objects, and discover the physics that govern this universe.
                </div>
            </div>
        `;

        content.innerHTML = html;
    },

    /**
     * Setup telemetry display
     */
    setupTelemetry() {
        this.updateTelemetry();
    },

    /**
     * Update telemetry display
     */
    updateTelemetry() {
        if (!Config.ui.showTelemetry) {
            document.getElementById('telemetry').style.display = 'none';
            return;
        }

        document.getElementById('telemetry').style.display = 'block';

        const now = performance.now() / 1000;
        if (now - this.state.lastTelemetryUpdate < Config.ui.telemetryUpdateInterval) {
            return;
        }

        this.state.lastTelemetryUpdate = now;

        const stats = Renderer.getStats();
        const playerInfo = PlayerController.getDebugInfo();
        const cameraInfo = CameraSystem.getDebugInfo();

        let html = `
            <div><strong>FPS:</strong> ${stats.fps}</div>
            <div><strong>Avg FPS:</strong> ${stats.avgFps}</div>
            <div><strong>Frame Time:</strong> ${stats.frameTime}ms</div>
            <div><strong>Bodies:</strong> ${stats.bodies}</div>
            <hr style="border: 1px dashed rgba(0,255,0,0.3); margin: 5px 0;">
            <div><strong>Position:</strong> ${playerInfo.position}</div>
            <div><strong>Speed:</strong> ${playerInfo.speed} m/s</div>
            <div><strong>Mode:</strong> ${playerInfo.mode}</div>
            <div><strong>Grounded:</strong> ${playerInfo.grounded ? 'YES' : 'NO'}</div>
            <hr style="border: 1px dashed rgba(0,255,0,0.3); margin: 5px 0;">
            <div><strong>Camera:</strong> ${cameraInfo.mode}</div>
            <div><strong>Yaw:</strong> ${cameraInfo.yaw}°</div>
            <div><strong>Pitch:</strong> ${cameraInfo.pitch}°</div>
        `;

        document.getElementById('telemetryContent').innerHTML = html;
    },

    /**
     * Toggle developer console
     */
    toggleDevConsole() {
        this.state.showDevConsole = !this.state.showDevConsole;
        const console = document.getElementById('devConsole');
        
        if (this.state.showDevConsole) {
            console.classList.remove('hidden');
            InputHandler.exitPointerLock();
        } else {
            console.classList.add('hidden');
        }
    },

    /**
     * Toggle help panel
     */
    toggleHelp() {
        this.state.showHelp = !this.state.showHelp;
        const help = document.getElementById('helpPanel');
        
        if (this.state.showHelp) {
            help.classList.remove('hidden');
            InputHandler.exitPointerLock();
        } else {
            help.classList.add('hidden');
        }
    },

    /**
     * Update debug log display
     */
    updateDebugLog() {
        if (!Config.ui.showDebugLog) {
            document.getElementById('debugLog').style.display = 'none';
            return;
        }

        document.getElementById('debugLog').style.display = 'block';

        const logs = DebugSystem.getLogs(null, 20).reverse();
        let html = '<strong>DEBUG LOG</strong><hr style="margin: 5px 0;">';
        
        for (let log of logs) {
            const className = log.level === 'error' ? 'error' : log.level === 'warning' ? 'warning' : 'success';
            html += `<div class="${className}">[${log.timestamp}] ${log.message}</div>`;
        }

        document.getElementById('debugLog').innerHTML = html;
    },

    /**
     * Main UI loop
     */
    update(deltaTime) {
        this.updateTelemetry();
        this.updateDebugLog();
    },
};

DebugSystem.info('UI system loaded');
