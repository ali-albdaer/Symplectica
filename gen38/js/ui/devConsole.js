/**
 * Solar System Simulation - Developer Console
 * ============================================
 * Real-time configuration editor accessible with '/'.
 */

class DevConsole {
    constructor() {
        this.isOpen = false;
        this.container = null;
        this.contentEl = null;
        this.sections = [];
        
        Logger.info('DevConsole created');
    }
    
    /**
     * Initialize the developer console
     */
    init() {
        this.container = document.getElementById('dev-menu');
        this.contentEl = document.getElementById('dev-menu-content');
        
        if (!this.container || !this.contentEl) {
            Logger.error('Dev console elements not found');
            return;
        }
        
        // Build the UI
        this.buildUI();
        
        Logger.success('DevConsole initialized');
    }
    
    /**
     * Build the configuration UI
     */
    buildUI() {
        this.contentEl.innerHTML = '';
        
        // Simulation section
        this.addSection('Simulation', [
            { label: 'Time Scale', key: 'scale.timeScale', type: 'range', min: 0, max: 100, step: 0.1 },
            { label: 'Pause Physics', key: 'debug.physicsPaused', type: 'checkbox' },
            { label: 'Show Orbits', key: 'debug.showOrbits', type: 'checkbox' },
        ]);
        
        // Physics section
        this.addSection('Physics', [
            { label: 'Gravitational Constant (×10⁻¹¹)', key: 'physics.G', type: 'range', min: 1, max: 20, step: 0.1, scale: 1e-11 },
            { label: 'Softening', key: 'physics.softening', type: 'range', min: 0, max: 1, step: 0.01 },
            { label: 'Local Gravity Mult', key: 'physics.localGravityMultiplier', type: 'range', min: 0.1, max: 5, step: 0.1 },
            { label: 'Micro Physics', key: 'physics.microPhysicsEnabled', type: 'checkbox' },
        ]);
        
        // Sun section
        this.addSection('Sun', [
            { label: 'Mass (×10³⁰ kg)', key: 'sun.mass', type: 'range', min: 0.5, max: 5, step: 0.1, scale: 1e30 },
            { label: 'Visual Radius', key: 'sun.visualRadius', type: 'range', min: 5, max: 50, step: 1 },
            { label: 'Luminosity', key: 'sun.luminosity', type: 'range', min: 0.1, max: 5, step: 0.1 },
            { label: 'Emission Intensity', key: 'sun.emissionIntensity', type: 'range', min: 0.5, max: 5, step: 0.1 },
        ]);
        
        // Planet 1 section
        this.addSection('Planet 1 (Terra)', [
            { label: 'Mass (×10²⁴ kg)', key: 'planet1.mass', type: 'range', min: 1, max: 20, step: 0.1, scale: 1e24 },
            { label: 'Visual Radius', key: 'planet1.visualRadius', type: 'range', min: 1, max: 10, step: 0.1 },
            { label: 'Orbital Radius (×10¹¹ m)', key: 'planet1.orbitalRadius', type: 'range', min: 0.5, max: 5, step: 0.1, scale: 1e11 },
            { label: 'Orbital Velocity (m/s)', key: 'planet1.orbitalVelocity', type: 'number', min: 10000, max: 50000 },
        ]);
        
        // Planet 2 section
        this.addSection('Planet 2 (Helios)', [
            { label: 'Mass (×10²³ kg)', key: 'planet2.mass', type: 'range', min: 1, max: 20, step: 0.1, scale: 1e23 },
            { label: 'Visual Radius', key: 'planet2.visualRadius', type: 'range', min: 0.5, max: 5, step: 0.1 },
            { label: 'Orbital Radius (×10¹¹ m)', key: 'planet2.orbitalRadius', type: 'range', min: 1, max: 10, step: 0.1, scale: 1e11 },
            { label: 'Orbital Velocity (m/s)', key: 'planet2.orbitalVelocity', type: 'number', min: 10000, max: 50000 },
        ]);
        
        // Moon section
        this.addSection('Moon (Luna)', [
            { label: 'Mass (×10²² kg)', key: 'moon.mass', type: 'range', min: 1, max: 20, step: 0.1, scale: 1e22 },
            { label: 'Visual Radius', key: 'moon.visualRadius', type: 'range', min: 0.2, max: 2, step: 0.1 },
            { label: 'Orbital Radius (×10⁸ m)', key: 'moon.orbitalRadius', type: 'range', min: 1, max: 10, step: 0.1, scale: 1e8 },
            { label: 'Orbital Velocity (m/s)', key: 'moon.orbitalVelocity', type: 'number', min: 500, max: 3000 },
        ]);
        
        // Player section
        this.addSection('Player', [
            { label: 'Walk Speed', key: 'player.walkSpeed', type: 'range', min: 1, max: 20, step: 0.5 },
            { label: 'Fly Speed', key: 'player.flySpeed', type: 'range', min: 5, max: 100, step: 1 },
            { label: 'Fast Fly Speed', key: 'player.fastFlySpeed', type: 'range', min: 50, max: 500, step: 10 },
            { label: 'Jump Force', key: 'player.jumpForce', type: 'range', min: 1, max: 20, step: 0.5 },
            { label: 'Mouse Sensitivity', key: 'player.mouseSensitivity', type: 'range', min: 0.0005, max: 0.005, step: 0.0001 },
        ]);
        
        // Rendering section
        this.addSection('Rendering', [
            { label: 'Fidelity', key: 'rendering.fidelityLevel', type: 'select', options: ['low', 'medium', 'ultra'] },
            { label: 'Shadows', key: 'rendering.shadows.enabled', type: 'checkbox' },
            { label: 'Shadow Map Size', key: 'rendering.shadows.mapSize', type: 'select', options: [512, 1024, 2048, 4096] },
            { label: 'Bloom', key: 'rendering.bloom.enabled', type: 'checkbox' },
            { label: 'LOD', key: 'rendering.lod.enabled', type: 'checkbox' },
            { label: 'Star Count', key: 'rendering.starField.count', type: 'select', options: [3000, 10000, 25000, 50000] },
            { label: 'Star Brightness', key: 'rendering.starField.brightness', type: 'range', min: 0.1, max: 3, step: 0.1 },
        ]);
        
        // Debug section
        this.addSection('Debug', [
            { label: 'Show Velocity Vectors', key: 'debug.showVelocityVectors', type: 'checkbox' },
            { label: 'Show Force Vectors', key: 'debug.showForceVectors', type: 'checkbox' },
            { label: 'Show Colliders', key: 'debug.showColliders', type: 'checkbox' },
            { label: 'Log Physics', key: 'debug.logPhysics', type: 'checkbox' },
        ]);
        
        // Actions section
        this.addActionsSection();
    }
    
    /**
     * Add a configuration section
     */
    addSection(title, controls) {
        const section = document.createElement('div');
        section.className = 'dev-section';
        
        const header = document.createElement('h3');
        header.textContent = title;
        section.appendChild(header);
        
        for (const control of controls) {
            const row = this.createControl(control);
            section.appendChild(row);
        }
        
        this.contentEl.appendChild(section);
        this.sections.push({ title, controls, element: section });
    }
    
    /**
     * Create a control element
     */
    createControl(config) {
        const row = document.createElement('div');
        row.className = 'dev-row';
        
        const label = document.createElement('label');
        label.textContent = config.label;
        row.appendChild(label);
        
        const currentValue = this.getConfigValue(config.key);
        const displayValue = config.scale ? currentValue / config.scale : currentValue;
        
        let input;
        
        switch (config.type) {
            case 'range':
                input = document.createElement('input');
                input.type = 'range';
                input.min = config.min;
                input.max = config.max;
                input.step = config.step;
                input.value = displayValue;
                
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'value-display';
                valueDisplay.textContent = displayValue.toFixed(3);
                
                input.addEventListener('input', () => {
                    const value = config.scale ? 
                        parseFloat(input.value) * config.scale : 
                        parseFloat(input.value);
                    this.setConfigValue(config.key, value);
                    valueDisplay.textContent = parseFloat(input.value).toFixed(3);
                });
                
                row.appendChild(input);
                row.appendChild(valueDisplay);
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.min = config.min;
                input.max = config.max;
                input.value = displayValue;
                
                input.addEventListener('change', () => {
                    const value = config.scale ? 
                        parseFloat(input.value) * config.scale : 
                        parseFloat(input.value);
                    this.setConfigValue(config.key, value);
                });
                
                row.appendChild(input);
                break;
                
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = currentValue;
                
                input.addEventListener('change', () => {
                    this.setConfigValue(config.key, input.checked);
                });
                
                row.appendChild(input);
                break;
                
            case 'select':
                input = document.createElement('select');
                
                for (const option of config.options) {
                    const opt = document.createElement('option');
                    opt.value = option;
                    opt.textContent = option;
                    opt.selected = currentValue == option;
                    input.appendChild(opt);
                }
                
                input.addEventListener('change', () => {
                    let value = input.value;
                    // Try to parse as number if it looks like one
                    if (!isNaN(parseFloat(value)) && isFinite(value)) {
                        value = parseFloat(value);
                    }
                    this.setConfigValue(config.key, value);
                });
                
                row.appendChild(input);
                break;
        }
        
        return row;
    }
    
    /**
     * Add actions section
     */
    addActionsSection() {
        const section = document.createElement('div');
        section.className = 'dev-section';
        
        const header = document.createElement('h3');
        header.textContent = 'Actions';
        section.appendChild(header);
        
        const row = document.createElement('div');
        row.className = 'dev-row';
        row.style.gap = '10px';
        
        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.className = 'dev-button danger';
        resetBtn.textContent = 'Reset to Defaults';
        resetBtn.addEventListener('click', () => this.resetToDefaults());
        row.appendChild(resetBtn);
        
        // Recalculate orbits button
        const recalcBtn = document.createElement('button');
        recalcBtn.className = 'dev-button';
        recalcBtn.textContent = 'Recalculate Stable Orbits';
        recalcBtn.addEventListener('click', () => this.recalculateOrbits());
        row.appendChild(recalcBtn);
        
        // Regenerate stars button
        const starsBtn = document.createElement('button');
        starsBtn.className = 'dev-button';
        starsBtn.textContent = 'Regenerate Stars';
        starsBtn.addEventListener('click', () => {
            if (typeof Sky !== 'undefined' && Renderer?.scene) {
                Sky.regenerate(Renderer.scene);
            }
        });
        row.appendChild(starsBtn);
        
        section.appendChild(row);
        this.contentEl.appendChild(section);
    }
    
    /**
     * Get a config value by dot-notation key
     */
    getConfigValue(key) {
        const parts = key.split('.');
        let obj = Config;
        
        for (const part of parts) {
            if (obj === undefined) return undefined;
            obj = obj[part];
        }
        
        return obj;
    }
    
    /**
     * Set a config value by dot-notation key
     */
    setConfigValue(key, value) {
        const parts = key.split('.');
        let obj = Config;
        
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }
        
        obj[parts[parts.length - 1]] = value;
        
        Logger.debug(`Config changed: ${key} = ${value}`);
        
        // Trigger any necessary updates
        this.onConfigChange(key, value);
    }
    
    /**
     * Handle config changes that need immediate effect
     */
    onConfigChange(key, value) {
        // Handle fidelity preset change
        if (key === 'rendering.fidelityLevel') {
            Config.applyFidelityPreset(value);
            if (Renderer) {
                Renderer.applyFidelityPreset(value);
            }
        }
        
        // Handle shadow toggle
        if (key === 'rendering.shadows.enabled') {
            if (Renderer) {
                Renderer.setShadowsEnabled(value);
            }
        }
        
        // Handle star brightness
        if (key.startsWith('rendering.starField')) {
            if (typeof Sky !== 'undefined') {
                Sky.updateSettings();
            }
        }
        
        // Handle orbit visibility
        if (key === 'debug.showOrbits') {
            // Would update orbit line visibility
        }
    }
    
    /**
     * Reset all values to defaults (would need stored defaults)
     */
    resetToDefaults() {
        Logger.warn('Reset to defaults - would reload page');
        if (confirm('This will reload the page. Continue?')) {
            location.reload();
        }
    }
    
    /**
     * Recalculate orbital velocities for stable orbits
     */
    recalculateOrbits() {
        const G = Config.physics.G;
        const sunMass = Config.sun.mass;
        
        // Planet 1
        Config.planet1.orbitalVelocity = Config.calculateOrbitalVelocity(sunMass, Config.planet1.orbitalRadius);
        
        // Planet 2
        Config.planet2.orbitalVelocity = Config.calculateOrbitalVelocity(sunMass, Config.planet2.orbitalRadius);
        
        // Moon (orbits Planet 1)
        Config.moon.orbitalVelocity = Config.calculateOrbitalVelocity(Config.planet1.mass, Config.moon.orbitalRadius);
        
        Logger.success('Orbital velocities recalculated for stable orbits');
        Logger.info(`Planet 1: ${Config.planet1.orbitalVelocity.toFixed(0)} m/s`);
        Logger.info(`Planet 2: ${Config.planet2.orbitalVelocity.toFixed(0)} m/s`);
        Logger.info(`Moon: ${Config.moon.orbitalVelocity.toFixed(0)} m/s`);
        
        // Rebuild UI to show new values
        this.buildUI();
    }
    
    /**
     * Toggle dev console visibility
     */
    toggle() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.container.classList.remove('hidden');
            Input.exitPointerLock();
        } else {
            this.container.classList.add('hidden');
        }
        
        Logger.debug(`Dev console: ${this.isOpen ? 'opened' : 'closed'}`);
    }
    
    /**
     * Open console
     */
    open() {
        if (!this.isOpen) this.toggle();
    }
    
    /**
     * Close console
     */
    close() {
        if (this.isOpen) this.toggle();
    }
}

// Global instance
const DevMenu = new DevConsole();
