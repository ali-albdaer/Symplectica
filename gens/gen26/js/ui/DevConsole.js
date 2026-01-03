/**
 * ============================================
 * Developer Console
 * ============================================
 * 
 * In-game developer console for tweaking parameters.
 * Toggle with "/" key.
 */

class DevConsole {
    constructor() {
        this.container = null;
        this.isOpen = false;
        
        // References
        this.engine = null;
        this.entityManager = null;
        this.physics = null;
        this.renderer = null;
        this.lighting = null;
        
        this.isInitialized = false;
    }
    
    /**
     * Initialize the dev console
     */
    init(engine) {
        console.info('Initializing Dev Console...');
        
        try {
            this.engine = engine;
            this.container = document.getElementById('dev-console');
            
            // Set up close button
            const closeBtn = document.getElementById('console-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
            
            // Set up settings handlers
            this.setupSettingsHandlers();
            
            this.isInitialized = true;
            console.success('Dev Console initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize Dev Console: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Set references to game systems
     */
    setReferences(entityManager, physics, renderer, lighting) {
        this.entityManager = entityManager;
        this.physics = physics;
        this.renderer = renderer;
        this.lighting = lighting;
        
        // Build body editors
        this.buildBodyEditors();
    }
    
    /**
     * Set up event handlers for settings inputs
     */
    setupSettingsHandlers() {
        // Fidelity level
        const fidelitySelect = document.getElementById('fidelity-level');
        if (fidelitySelect) {
            fidelitySelect.value = CONFIG.RENDERING.FIDELITY;
            fidelitySelect.addEventListener('change', (e) => {
                CONFIG.RENDERING.FIDELITY = e.target.value;
                if (this.renderer) {
                    this.renderer.setFidelity(e.target.value);
                }
            });
        }
        
        // LOD enabled
        const lodCheckbox = document.getElementById('lod-enabled');
        if (lodCheckbox) {
            lodCheckbox.checked = CONFIG.RENDERING.LOD_ENABLED;
            lodCheckbox.addEventListener('change', (e) => {
                CONFIG.RENDERING.LOD_ENABLED = e.target.checked;
            });
        }
        
        // Shadow quality
        const shadowSelect = document.getElementById('shadow-quality');
        if (shadowSelect) {
            shadowSelect.addEventListener('change', (e) => {
                if (this.lighting) {
                    this.lighting.setShadowQuality(e.target.value);
                }
            });
        }
        
        // Time scale
        const timeScaleSlider = document.getElementById('time-scale');
        const timeScaleValue = document.getElementById('time-scale-value');
        if (timeScaleSlider) {
            timeScaleSlider.value = CONFIG.PHYSICS.TIME_SCALE;
            if (timeScaleValue) {
                timeScaleValue.textContent = CONFIG.PHYSICS.TIME_SCALE;
            }
            
            timeScaleSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                CONFIG.PHYSICS.TIME_SCALE = value;
                if (timeScaleValue) {
                    timeScaleValue.textContent = value.toFixed(1);
                }
                if (this.physics) {
                    this.physics.updateConfig();
                }
            });
        }
        
        // G constant
        const gConstantInput = document.getElementById('g-constant');
        if (gConstantInput) {
            gConstantInput.value = CONFIG.PHYSICS.G * 1e11;
            gConstantInput.addEventListener('change', (e) => {
                CONFIG.PHYSICS.G = parseFloat(e.target.value) * 1e-11;
                if (this.physics) {
                    this.physics.updateConfig();
                }
            });
        }
        
        // Player speed
        const playerSpeedInput = document.getElementById('player-speed');
        if (playerSpeedInput) {
            playerSpeedInput.value = CONFIG.PLAYER.WALK_SPEED;
            playerSpeedInput.addEventListener('change', (e) => {
                CONFIG.PLAYER.WALK_SPEED = parseFloat(e.target.value);
                if (this.entityManager && this.entityManager.player) {
                    this.entityManager.player.walkSpeed = CONFIG.PLAYER.WALK_SPEED;
                }
            });
        }
        
        // Jump force
        const jumpForceInput = document.getElementById('jump-force');
        if (jumpForceInput) {
            jumpForceInput.value = CONFIG.PLAYER.JUMP_FORCE;
            jumpForceInput.addEventListener('change', (e) => {
                CONFIG.PLAYER.JUMP_FORCE = parseFloat(e.target.value);
                if (this.entityManager && this.entityManager.player) {
                    this.entityManager.player.jumpForce = CONFIG.PLAYER.JUMP_FORCE;
                }
            });
        }
        
        // Flight speed
        const flightSpeedInput = document.getElementById('flight-speed');
        if (flightSpeedInput) {
            flightSpeedInput.value = CONFIG.PLAYER.FLIGHT_SPEED;
            flightSpeedInput.addEventListener('change', (e) => {
                CONFIG.PLAYER.FLIGHT_SPEED = parseFloat(e.target.value);
                if (this.entityManager && this.entityManager.player) {
                    this.entityManager.player.flightSpeed = CONFIG.PLAYER.FLIGHT_SPEED;
                }
            });
        }
    }
    
    /**
     * Build celestial body editors
     */
    buildBodyEditors() {
        const section = document.getElementById('celestial-bodies-section');
        if (!section || !this.entityManager) return;
        
        // Clear existing content (except header)
        const h3 = section.querySelector('h3');
        section.innerHTML = '';
        if (h3) section.appendChild(h3);
        
        // Add editor for each body
        for (const [id, body] of this.entityManager.celestialBodies) {
            const editor = this.createBodyEditor(id, body);
            section.appendChild(editor);
        }
    }
    
    /**
     * Create editor UI for a celestial body
     */
    createBodyEditor(id, body) {
        const container = document.createElement('div');
        container.className = 'body-editor';
        
        // Header
        const header = document.createElement('div');
        header.className = 'body-editor-header';
        header.innerHTML = `
            <h4>${body.name} (${body.bodyType})</h4>
            <span>▼</span>
        `;
        
        // Content
        const content = document.createElement('div');
        content.className = 'body-editor-content';
        
        // Get editable properties
        const props = body.getEditableProperties();
        
        for (const [propName, propInfo] of Object.entries(props)) {
            const row = document.createElement('div');
            row.className = 'setting-row';
            
            const label = document.createElement('label');
            label.textContent = propInfo.label;
            
            const input = document.createElement('input');
            input.type = propInfo.type;
            input.value = propInfo.value;
            input.step = 'any';
            
            input.addEventListener('change', (e) => {
                body.setProperty(propName, e.target.value);
            });
            
            row.appendChild(label);
            row.appendChild(input);
            content.appendChild(row);
        }
        
        // Toggle expand/collapse
        header.addEventListener('click', () => {
            content.classList.toggle('expanded');
            header.querySelector('span').textContent = 
                content.classList.contains('expanded') ? '▲' : '▼';
        });
        
        container.appendChild(header);
        container.appendChild(content);
        
        return container;
    }
    
    /**
     * Update console (call each frame to handle input)
     */
    update(inputManager) {
        if (!this.isInitialized) return;
        
        // Toggle with "/" key
        if (inputManager && inputManager.isKeyJustPressed('/')) {
            this.toggle();
        }
        
        // Close with Escape when open
        if (this.isOpen && inputManager && inputManager.isKeyJustPressed('escape')) {
            this.close();
        }
    }
    
    /**
     * Toggle console visibility
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Open the console
     */
    open() {
        this.isOpen = true;
        
        if (this.container) {
            this.container.classList.remove('hidden');
        }
        
        // Release pointer lock and show cursor
        if (document.pointerLockElement) {
            document.exitPointerLock();
        }
        
        document.body.style.cursor = 'auto';
        
        console.info('Dev Console opened');
    }
    
    /**
     * Close the console
     */
    close() {
        this.isOpen = false;
        
        if (this.container) {
            this.container.classList.add('hidden');
        }
        
        console.info('Dev Console closed');
    }
    
    /**
     * Check if console is open
     */
    isVisible() {
        return this.isOpen;
    }
}
