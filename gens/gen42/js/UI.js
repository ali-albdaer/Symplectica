/**
 * UI.js - User Interface Module
 * 
 * Handles all UI elements including telemetry, developer console,
 * and HUD components.
 */

import Config from './Config.js';
import Debug from './Debug.js';
import player from './Player.js';
import renderer from './Renderer.js';
import physics from './Physics.js';

class UI {
    constructor() {
        // Element references
        this.elements = {};
        
        // State
        this.isDevConsoleOpen = false;
        this.isTelemetryVisible = false;
        this.isUIHidden = false;
        this.currentTab = 'physics';
        
        // Celestial bodies reference (set during init)
        this.celestialBodies = [];
        this.selectedBodyId = 'sun';
        
        // Update interval
        this.telemetryInterval = null;
    }
    
    /**
     * Initialize UI
     */
    init(celestialBodies) {
        this.celestialBodies = celestialBodies;
        
        // Cache element references
        this.elements = {
            telemetry: document.getElementById('telemetry'),
            fps: document.getElementById('fps-value'),
            frameTime: document.getElementById('frametime-value'),
            position: document.getElementById('position-value'),
            mode: document.getElementById('mode-value'),
            devConsole: document.getElementById('dev-console'),
            consoleContent: document.getElementById('console-content'),
            loadingScreen: document.getElementById('loading-screen'),
            startPrompt: document.getElementById('start-prompt'),
            qualitySelect: document.getElementById('quality-select'),
            controlsHelp: document.getElementById('controls-help'),
            closeConsole: document.getElementById('close-console')
        };
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start telemetry updates
        this.startTelemetryUpdates();
        
        // Set initial visibility
        if (Config.ui.showTelemetry) {
            this.showTelemetry();
        }
        
        Debug.info('UI initialized');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Quality selector
        if (this.elements.qualitySelect) {
            this.elements.qualitySelect.addEventListener('change', (e) => {
                renderer.setQuality(e.target.value);
            });
        }
        
        // Close console button
        if (this.elements.closeConsole) {
            this.elements.closeConsole.addEventListener('click', () => {
                this.hideDevConsole();
            });
        }
        
        // Tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });
    }
    
    /**
     * Start telemetry update loop
     */
    startTelemetryUpdates() {
        this.telemetryInterval = setInterval(() => {
            this.updateTelemetry();
        }, Config.ui.telemetryUpdateRate);
    }
    
    /**
     * Update telemetry display
     */
    updateTelemetry() {
        if (!this.isTelemetryVisible) return;
        
        if (this.elements.fps) {
            this.elements.fps.textContent = renderer.fps;
        }
        
        if (this.elements.frameTime) {
            this.elements.frameTime.textContent = renderer.frameTime.toFixed(2);
        }
        
        if (this.elements.position) {
            this.elements.position.textContent = player.getPositionString();
        }
        
        if (this.elements.mode) {
            this.elements.mode.textContent = player.isFlying ? 'Flying' : 'Walking';
        }
    }
    
    /**
     * Show telemetry overlay
     */
    showTelemetry() {
        this.isTelemetryVisible = true;
        if (this.elements.telemetry) {
            this.elements.telemetry.classList.remove('hidden');
        }
    }
    
    /**
     * Hide telemetry overlay
     */
    hideTelemetry() {
        this.isTelemetryVisible = false;
        if (this.elements.telemetry) {
            this.elements.telemetry.classList.add('hidden');
        }
    }
    
    /**
     * Toggle telemetry visibility
     */
    toggleTelemetry() {
        if (this.isTelemetryVisible) {
            this.hideTelemetry();
        } else {
            this.showTelemetry();
        }
    }
    
    /**
     * Toggle all UI visibility
     */
    toggleUI() {
        this.isUIHidden = !this.isUIHidden;
        document.body.classList.toggle('ui-hidden', this.isUIHidden);
        Debug.info(`UI ${this.isUIHidden ? 'hidden' : 'visible'}`);
    }
    
    /**
     * Show developer console
     */
    showDevConsole() {
        this.isDevConsoleOpen = true;
        if (this.elements.devConsole) {
            this.elements.devConsole.classList.remove('hidden');
        }
        this.renderConsoleContent();
        return true;
    }
    
    /**
     * Hide developer console
     */
    hideDevConsole() {
        this.isDevConsoleOpen = false;
        if (this.elements.devConsole) {
            this.elements.devConsole.classList.add('hidden');
        }
        return false;
    }
    
    /**
     * Toggle developer console
     */
    toggleDevConsole() {
        if (this.isDevConsoleOpen) {
            return this.hideDevConsole();
        } else {
            return this.showDevConsole();
        }
    }
    
    /**
     * Switch console tab
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        this.renderConsoleContent();
    }
    
    /**
     * Render console content based on current tab
     */
    renderConsoleContent() {
        if (!this.elements.consoleContent) return;
        
        let html = '';
        
        switch (this.currentTab) {
            case 'physics':
                html = this.renderPhysicsTab();
                break;
            case 'bodies':
                html = this.renderBodiesTab();
                break;
            case 'graphics':
                html = this.renderGraphicsTab();
                break;
            case 'player':
                html = this.renderPlayerTab();
                break;
        }
        
        this.elements.consoleContent.innerHTML = html;
        this.attachConsoleListeners();
    }
    
    /**
     * Render physics tab content
     */
    renderPhysicsTab() {
        const p = Config.physics;
        
        return `
            <div class="config-section">
                <div class="config-section-title">Constants</div>
                <div class="config-row">
                    <span class="config-label">Gravitational Constant (G)</span>
                    <input type="number" class="config-input" data-path="physics.G" value="${p.G}" step="0.1">
                </div>
                <div class="config-row">
                    <span class="config-label">Time Scale</span>
                    <input type="number" class="config-input" data-path="physics.timeScale" value="${p.timeScale}" step="0.1" min="0">
                </div>
                <div class="config-row">
                    <span class="config-label">Substeps</span>
                    <input type="number" class="config-input" data-path="physics.substeps" value="${p.substeps}" step="1" min="1" max="16">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Integration</div>
                <div class="config-row">
                    <span class="config-label">Method</span>
                    <select class="config-select" data-path="physics.integrationMethod">
                        <option value="euler" ${p.integrationMethod === 'euler' ? 'selected' : ''}>Euler</option>
                        <option value="verlet" ${p.integrationMethod === 'verlet' ? 'selected' : ''}>Verlet</option>
                        <option value="rk4" ${p.integrationMethod === 'rk4' ? 'selected' : ''}>RK4</option>
                    </select>
                </div>
                <div class="config-row">
                    <span class="config-label">Max Velocity</span>
                    <input type="number" class="config-input" data-path="physics.maxVelocity" value="${p.maxVelocity}" step="10">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Collisions</div>
                <div class="config-row">
                    <span class="config-label">Enabled</span>
                    <input type="checkbox" class="config-input" data-path="physics.collisionEnabled" ${p.collisionEnabled ? 'checked' : ''}>
                </div>
                <div class="config-row">
                    <span class="config-label">Elasticity</span>
                    <input type="number" class="config-input" data-path="physics.collisionElasticity" value="${p.collisionElasticity}" step="0.1" min="0" max="1">
                </div>
            </div>
        `;
    }
    
    /**
     * Render celestial bodies tab content
     */
    renderBodiesTab() {
        // Body selector
        let bodyButtons = '<div class="body-selector">';
        for (const body of this.celestialBodies) {
            const isActive = body.id === this.selectedBodyId;
            bodyButtons += `<button class="body-btn ${isActive ? 'active' : ''}" data-body-id="${body.id}">${body.name}</button>`;
        }
        bodyButtons += '</div>';
        
        // Find selected body
        const selectedBody = this.celestialBodies.find(b => b.id === this.selectedBodyId);
        if (!selectedBody) return bodyButtons + '<p>Select a body</p>';
        
        return `
            ${bodyButtons}
            
            <div class="config-section">
                <div class="config-section-title">${selectedBody.name} - Physical Properties</div>
                <div class="config-row">
                    <span class="config-label">Mass</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="mass" value="${selectedBody.mass}" step="100">
                </div>
                <div class="config-row">
                    <span class="config-label">Radius</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="radius" value="${selectedBody.radius}" step="1">
                </div>
                <div class="config-row">
                    <span class="config-label">Rotation Speed</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="rotationSpeed" value="${selectedBody.rotationSpeed}" step="0.001">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Current State</div>
                <div class="config-row">
                    <span class="config-label">Position X</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="position.x" value="${selectedBody.position.x.toFixed(2)}" step="10">
                </div>
                <div class="config-row">
                    <span class="config-label">Position Y</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="position.y" value="${selectedBody.position.y.toFixed(2)}" step="10">
                </div>
                <div class="config-row">
                    <span class="config-label">Position Z</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="position.z" value="${selectedBody.position.z.toFixed(2)}" step="10">
                </div>
                <div class="config-row">
                    <span class="config-label">Velocity X</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="velocity.x" value="${selectedBody.velocity.x.toFixed(2)}" step="1">
                </div>
                <div class="config-row">
                    <span class="config-label">Velocity Y</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="velocity.y" value="${selectedBody.velocity.y.toFixed(2)}" step="1">
                </div>
                <div class="config-row">
                    <span class="config-label">Velocity Z</span>
                    <input type="number" class="config-input" data-body="${selectedBody.id}" data-prop="velocity.z" value="${selectedBody.velocity.z.toFixed(2)}" step="1">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Info</div>
                <div class="config-row">
                    <span class="config-label">Speed</span>
                    <span class="config-label">${selectedBody.getSpeed().toFixed(2)}</span>
                </div>
                <div class="config-row">
                    <span class="config-label">Distance from Sun</span>
                    <span class="config-label">${selectedBody.getDistanceFromOrigin().toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Render graphics tab content
     */
    renderGraphicsTab() {
        const g = Config.graphics;
        const q = Config.getQualitySettings();
        
        return `
            <div class="config-section">
                <div class="config-section-title">Quality</div>
                <div class="config-row">
                    <span class="config-label">Preset</span>
                    <select class="config-select" data-action="quality">
                        <option value="low" ${g.currentQuality === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${g.currentQuality === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="ultra" ${g.currentQuality === 'ultra' ? 'selected' : ''}>Ultra</option>
                    </select>
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Lighting</div>
                <div class="config-row">
                    <span class="config-label">Sun Light Intensity</span>
                    <input type="number" class="config-input" data-path="graphics.sunLightIntensity" value="${g.sunLightIntensity}" step="0.1" min="0">
                </div>
                <div class="config-row">
                    <span class="config-label">Ambient Intensity</span>
                    <input type="number" class="config-input" data-path="graphics.ambientLightIntensity" value="${g.ambientLightIntensity}" step="0.01" min="0" max="1">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Shadows</div>
                <div class="config-row">
                    <span class="config-label">Enabled</span>
                    <input type="checkbox" class="config-input" data-path="graphics.presets.${g.currentQuality}.shadowsEnabled" ${q.shadowsEnabled ? 'checked' : ''}>
                </div>
                <div class="config-row">
                    <span class="config-label">Shadow Bias</span>
                    <input type="number" class="config-input" data-path="graphics.shadowBias" value="${g.shadowBias}" step="0.0001">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Debug</div>
                <div class="config-row">
                    <span class="config-label">Show Orbits</span>
                    <input type="checkbox" class="config-input" data-path="debug.showOrbits" ${Config.debug.showOrbits ? 'checked' : ''}>
                </div>
                <div class="config-row">
                    <span class="config-label">Show Debug Log</span>
                    <input type="checkbox" class="config-input" data-path="debug.showDebugLog" ${Config.debug.showDebugLog ? 'checked' : ''}>
                </div>
            </div>
        `;
    }
    
    /**
     * Render player tab content
     */
    renderPlayerTab() {
        const p = Config.player;
        
        return `
            <div class="config-section">
                <div class="config-section-title">Movement - Walking</div>
                <div class="config-row">
                    <span class="config-label">Walk Speed</span>
                    <input type="number" class="config-input" data-path="player.walkSpeed" value="${p.walkSpeed}" step="5">
                </div>
                <div class="config-row">
                    <span class="config-label">Run Speed</span>
                    <input type="number" class="config-input" data-path="player.runSpeed" value="${p.runSpeed}" step="5">
                </div>
                <div class="config-row">
                    <span class="config-label">Jump Force</span>
                    <input type="number" class="config-input" data-path="player.jumpForce" value="${p.jumpForce}" step="1">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Movement - Flight</div>
                <div class="config-row">
                    <span class="config-label">Flight Speed</span>
                    <input type="number" class="config-input" data-path="player.flightSpeed" value="${p.flightSpeed}" step="10">
                </div>
                <div class="config-row">
                    <span class="config-label">Sprint Multiplier</span>
                    <input type="number" class="config-input" data-path="player.flightSprintMultiplier" value="${p.flightSprintMultiplier}" step="0.5">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Camera</div>
                <div class="config-row">
                    <span class="config-label">Mouse Sensitivity</span>
                    <input type="number" class="config-input" data-path="player.mouseSensitivity" value="${p.mouseSensitivity}" step="0.0005">
                </div>
                <div class="config-row">
                    <span class="config-label">FOV</span>
                    <input type="number" class="config-input" data-path="player.fov" value="${p.fov}" step="5" min="30" max="120">
                </div>
                <div class="config-row">
                    <span class="config-label">3rd Person Distance</span>
                    <input type="number" class="config-input" data-path="player.thirdPersonDistance" value="${p.thirdPersonDistance}" step="1">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Interaction</div>
                <div class="config-row">
                    <span class="config-label">Grab Distance</span>
                    <input type="number" class="config-input" data-path="player.grabDistance" value="${p.grabDistance}" step="5">
                </div>
                <div class="config-row">
                    <span class="config-label">Hold Distance</span>
                    <input type="number" class="config-input" data-path="player.grabHoldDistance" value="${p.grabHoldDistance}" step="1">
                </div>
            </div>
            
            <div class="config-section">
                <div class="config-section-title">Teleport</div>
                <div class="config-row">
                    <button class="btn-small" data-action="teleport-sun">To Sun</button>
                    <button class="btn-small" data-action="teleport-planet1">To Terra</button>
                    <button class="btn-small" data-action="teleport-planet2">To Pyrrus</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Attach event listeners to console elements
     */
    attachConsoleListeners() {
        // Config inputs
        this.elements.consoleContent.querySelectorAll('.config-input').forEach(input => {
            input.addEventListener('change', (e) => this.handleConfigChange(e));
        });
        
        // Config selects
        this.elements.consoleContent.querySelectorAll('.config-select').forEach(select => {
            select.addEventListener('change', (e) => this.handleSelectChange(e));
        });
        
        // Body selector buttons
        this.elements.consoleContent.querySelectorAll('.body-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectedBodyId = btn.dataset.bodyId;
                this.renderConsoleContent();
            });
        });
        
        // Action buttons
        this.elements.consoleContent.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAction(e));
        });
    }
    
    /**
     * Handle config input change
     */
    handleConfigChange(event) {
        const input = event.target;
        const path = input.dataset.path;
        const bodyId = input.dataset.body;
        const prop = input.dataset.prop;
        
        let value;
        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (input.type === 'number') {
            value = parseFloat(input.value);
        } else {
            value = input.value;
        }
        
        if (path) {
            // Update Config object
            this.setNestedValue(Config, path, value);
            Debug.info(`Config: ${path} = ${value}`);
        } else if (bodyId && prop) {
            // Update celestial body
            const body = this.celestialBodies.find(b => b.id === bodyId);
            if (body) {
                this.setNestedValue(body, prop, value);
                Debug.info(`${body.name}: ${prop} = ${value}`);
            }
        }
    }
    
    /**
     * Handle select change
     */
    handleSelectChange(event) {
        const select = event.target;
        const action = select.dataset.action;
        const path = select.dataset.path;
        const value = select.value;
        
        if (action === 'quality') {
            renderer.setQuality(value);
        } else if (path) {
            this.setNestedValue(Config, path, value);
            Debug.info(`Config: ${path} = ${value}`);
        }
    }
    
    /**
     * Handle action button click
     */
    handleAction(event) {
        const action = event.target.dataset.action;
        
        switch (action) {
            case 'teleport-sun':
                player.teleport(60, 0, 0);
                break;
            case 'teleport-planet1':
                player.teleport(
                    Config.celestialBodies.planet1.position.x + 20,
                    Config.celestialBodies.planet1.position.y,
                    Config.celestialBodies.planet1.position.z
                );
                break;
            case 'teleport-planet2':
                player.teleport(
                    Config.celestialBodies.planet2.position.x + 15,
                    Config.celestialBodies.planet2.position.y,
                    Config.celestialBodies.planet2.position.z
                );
                break;
        }
    }
    
    /**
     * Set nested object value by path string
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }
    
    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.elements.loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    /**
     * Show start prompt
     */
    showStartPrompt() {
        if (this.elements.startPrompt) {
            this.elements.startPrompt.classList.remove('hidden');
        }
    }
    
    /**
     * Hide start prompt
     */
    hideStartPrompt() {
        if (this.elements.startPrompt) {
            this.elements.startPrompt.classList.add('hidden');
        }
    }
    
    /**
     * Dispose UI
     */
    dispose() {
        if (this.telemetryInterval) {
            clearInterval(this.telemetryInterval);
        }
    }
}

// Export singleton
const ui = new UI();
export default ui;
