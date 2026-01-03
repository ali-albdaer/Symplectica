/**
 * Developer Menu
 * Real-time configuration interface for all game parameters
 */

import { CONFIG, SCALE } from '../../config/globals.js';

export class DevMenu {
    constructor(gravityEngine, lightingSystem, renderer) {
        this.gravityEngine = gravityEngine;
        this.lightingSystem = lightingSystem;
        this.renderer = renderer;
        
        // DOM elements
        this.menu = document.getElementById('dev-menu');
        this.menuBody = document.getElementById('dev-menu-body');
        this.closeButton = document.getElementById('dev-menu-close');
        
        // State
        this.isOpen = false;
        this.currentTab = 'celestial';
        
        // Initialize
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Close button
        this.closeButton.addEventListener('click', () => this.close());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            } else if (e.key === '/' && !this.isOpen) {
                e.preventDefault();
                this.open();
            }
        });

        // Tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
    }

    /**
     * Open menu
     */
    open() {
        this.isOpen = true;
        this.menu.classList.remove('hidden');
        this.renderTab(this.currentTab);
        
        // Release pointer lock
        document.exitPointerLock();
    }

    /**
     * Close menu
     */
    close() {
        this.isOpen = false;
        this.menu.classList.add('hidden');
    }

    /**
     * Switch tab
     */
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update button states
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            }
        });
        
        this.renderTab(tab);
    }

    /**
     * Render tab content
     */
    renderTab(tab) {
        this.menuBody.innerHTML = '';
        
        switch (tab) {
            case 'celestial':
                this.renderCelestialTab();
                break;
            case 'physics':
                this.renderPhysicsTab();
                break;
            case 'graphics':
                this.renderGraphicsTab();
                break;
            case 'debug':
                this.renderDebugTab();
                break;
        }
    }

    /**
     * Render celestial bodies tab
     */
    renderCelestialTab() {
        const celestial = CONFIG.CELESTIAL;
        
        for (const [key, body] of Object.entries(celestial)) {
            const section = this.createSection(body.name);
            
            // Mass
            section.appendChild(this.createNumberInput(
                `Mass (kg)`,
                body.mass,
                (value) => { body.mass = parseFloat(value); },
                { step: 1e20, format: 'scientific' }
            ));
            
            // Radius
            section.appendChild(this.createNumberInput(
                `Radius (m)`,
                body.radius,
                (value) => { body.radius = parseFloat(value); },
                { step: 1000000 }
            ));
            
            // Render Radius
            section.appendChild(this.createNumberInput(
                `Visual Radius`,
                body.renderRadius,
                (value) => { body.renderRadius = parseFloat(value); },
                { step: 0.1 }
            ));
            
            // Rotation Period
            section.appendChild(this.createNumberInput(
                `Rotation Period (s)`,
                body.rotationPeriod,
                (value) => { body.rotationPeriod = parseFloat(value); },
                { step: 3600 }
            ));
            
            // Color
            section.appendChild(this.createColorInput(
                `Color`,
                `#${body.color.toString(16).padStart(6, '0')}`,
                (value) => { body.color = parseInt(value.substring(1), 16); }
            ));
            
            this.menuBody.appendChild(section);
        }
    }

    /**
     * Render physics tab
     */
    renderPhysicsTab() {
        const physics = CONFIG.PHYSICS;
        
        const section = this.createSection('Physics Settings');
        
        // Time Scale
        section.appendChild(this.createNumberInput(
            `Time Scale`,
            physics.timeScale,
            (value) => {
                physics.timeScale = parseFloat(value);
                this.gravityEngine.setTimeScale(parseFloat(value));
            },
            { step: 0.1, min: 0, max: 100 }
        ));
        
        // Gravitational Constant
        section.appendChild(this.createNumberInput(
            `G (Gravitational Constant)`,
            physics.G,
            (value) => { physics.G = parseFloat(value); },
            { step: 1e-12, format: 'scientific' }
        ));
        
        // Physics Tick Rate
        section.appendChild(this.createNumberInput(
            `Physics Tick Rate (Hz)`,
            physics.physicsTickRate,
            (value) => { physics.physicsTickRate = parseInt(value); },
            { step: 10, min: 10, max: 240 }
        ));
        
        // Atmospheric Drag
        section.appendChild(this.createNumberInput(
            `Atmospheric Drag`,
            physics.atmosphericDrag,
            (value) => { physics.atmosphericDrag = parseFloat(value); },
            { step: 0.01, min: 0, max: 1 }
        ));
        
        // Ground Friction
        section.appendChild(this.createNumberInput(
            `Ground Friction`,
            physics.groundFriction,
            (value) => { physics.groundFriction = parseFloat(value); },
            { step: 0.05, min: 0, max: 1 }
        ));
        
        // Enable Collisions
        section.appendChild(this.createToggleInput(
            `Enable Collisions`,
            physics.enableCollisions,
            (value) => { physics.enableCollisions = value; }
        ));
        
        this.menuBody.appendChild(section);
    }

    /**
     * Render graphics tab
     */
    renderGraphicsTab() {
        const graphics = CONFIG.GRAPHICS;
        
        const section = this.createSection('Graphics Settings');
        
        // Quality Preset
        section.appendChild(this.createSelectInput(
            `Quality Preset`,
            graphics.quality,
            ['low', 'medium', 'high'],
            (value) => {
                graphics.quality = value;
                this.renderer.setQuality(value);
            }
        ));
        
        // Shadows
        section.appendChild(this.createToggleInput(
            `Enable Shadows`,
            graphics.shadows.enabled,
            (value) => {
                graphics.shadows.enabled = value;
                this.lightingSystem.toggleShadows(value);
            }
        ));
        
        // Shadow Quality
        section.appendChild(this.createSelectInput(
            `Shadow Quality`,
            graphics.shadows.quality,
            ['low', 'medium', 'high'],
            (value) => {
                graphics.shadows.quality = value;
                this.lightingSystem.setShadowQuality(value);
            }
        ));
        
        // Antialiasing
        section.appendChild(this.createToggleInput(
            `Antialiasing`,
            graphics.antialiasing,
            (value) => { graphics.antialiasing = value; }
        ));
        
        // Star Count
        section.appendChild(this.createNumberInput(
            `Star Count`,
            graphics.stars.count,
            (value) => { graphics.stars.count = parseInt(value); },
            { step: 1000, min: 0, max: 50000 }
        ));
        
        // FOV
        section.appendChild(this.createNumberInput(
            `Field of View`,
            graphics.fov,
            (value) => {
                graphics.fov = parseFloat(value);
                this.renderer.camera.fov = parseFloat(value);
                this.renderer.camera.updateProjectionMatrix();
            },
            { step: 5, min: 30, max: 120 }
        ));
        
        this.menuBody.appendChild(section);
    }

    /**
     * Render debug tab
     */
    renderDebugTab() {
        const debug = CONFIG.DEBUG;
        
        const section = this.createSection('Debug Tools');
        
        // Show Orbits
        section.appendChild(this.createToggleInput(
            `Show Orbits`,
            debug.showOrbits,
            (value) => {
                debug.showOrbits = value;
                this.gravityEngine.bodies.forEach(body => {
                    if (body.toggleOrbitLine) {
                        body.toggleOrbitLine(value);
                    }
                });
            }
        ));
        
        // Show Vectors
        section.appendChild(this.createToggleInput(
            `Show Velocity Vectors`,
            debug.showVectors,
            (value) => { debug.showVectors = value; }
        ));
        
        // Log Physics
        section.appendChild(this.createToggleInput(
            `Log Physics Data`,
            debug.logPhysics,
            (value) => { debug.logPhysics = value; }
        ));
        
        // Button: Print Physics State
        section.appendChild(this.createButton(
            `Print Physics State`,
            () => {
                this.gravityEngine.logBodyStates();
            }
        ));
        
        // Button: Print Config
        section.appendChild(this.createButton(
            `Print Current Config`,
            () => {
                console.log('=== Current Configuration ===');
                console.log(JSON.stringify(CONFIG, null, 2));
            }
        ));
        
        this.menuBody.appendChild(section);
    }

    /**
     * Create section
     */
    createSection(title) {
        const section = document.createElement('div');
        section.className = 'config-section';
        
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);
        
        return section;
    }

    /**
     * Create number input
     */
    createNumberInput(label, value, onChange, options = {}) {
        const row = document.createElement('div');
        row.className = 'config-row';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'config-label';
        labelEl.textContent = label;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'config-input';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.value = options.format === 'scientific' ? value.toExponential(2) : value;
        input.step = options.step || 'any';
        if (options.min !== undefined) input.min = options.min;
        if (options.max !== undefined) input.max = options.max;
        
        input.addEventListener('change', (e) => {
            onChange(e.target.value);
        });
        
        inputContainer.appendChild(input);
        row.appendChild(labelEl);
        row.appendChild(inputContainer);
        
        return row;
    }

    /**
     * Create toggle input
     */
    createToggleInput(label, value, onChange) {
        const row = document.createElement('div');
        row.className = 'config-row';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'config-label';
        labelEl.textContent = label;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'config-input';
        
        const select = document.createElement('select');
        select.innerHTML = `
            <option value="true" ${value ? 'selected' : ''}>Enabled</option>
            <option value="false" ${!value ? 'selected' : ''}>Disabled</option>
        `;
        
        select.addEventListener('change', (e) => {
            onChange(e.target.value === 'true');
        });
        
        inputContainer.appendChild(select);
        row.appendChild(labelEl);
        row.appendChild(inputContainer);
        
        return row;
    }

    /**
     * Create select input
     */
    createSelectInput(label, value, options, onChange) {
        const row = document.createElement('div');
        row.className = 'config-row';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'config-label';
        labelEl.textContent = label;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'config-input';
        
        const select = document.createElement('select');
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            option.selected = opt === value;
            select.appendChild(option);
        });
        
        select.addEventListener('change', (e) => {
            onChange(e.target.value);
        });
        
        inputContainer.appendChild(select);
        row.appendChild(labelEl);
        row.appendChild(inputContainer);
        
        return row;
    }

    /**
     * Create color input
     */
    createColorInput(label, value, onChange) {
        const row = document.createElement('div');
        row.className = 'config-row';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'config-label';
        labelEl.textContent = label;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'config-input';
        
        const input = document.createElement('input');
        input.type = 'color';
        input.value = value;
        
        input.addEventListener('change', (e) => {
            onChange(e.target.value);
        });
        
        inputContainer.appendChild(input);
        row.appendChild(labelEl);
        row.appendChild(inputContainer);
        
        return row;
    }

    /**
     * Create button
     */
    createButton(label, onClick) {
        const row = document.createElement('div');
        row.className = 'config-row';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'config-label';
        labelEl.textContent = label;
        
        const inputContainer = document.createElement('div');
        inputContainer.className = 'config-input';
        
        const button = document.createElement('button');
        button.textContent = 'Execute';
        button.addEventListener('click', onClick);
        
        inputContainer.appendChild(button);
        row.appendChild(labelEl);
        row.appendChild(inputContainer);
        
        return row;
    }
}

export default DevMenu;
