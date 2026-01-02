/**
 * Developer Console - In-game configuration editor
 * Allows real-time modification of all Config variables
 */

const DeveloperConsole = (function() {
    'use strict';
    
    let isOpen = false;
    let consoleElement = null;
    let currentTab = 'physics';
    
    /**
     * Create a control row with label and input
     */
    function createControl(label, type, value, onChange, options = {}) {
        const row = document.createElement('div');
        row.className = 'control-row';
        
        const labelEl = document.createElement('span');
        labelEl.className = 'control-label';
        labelEl.textContent = label;
        row.appendChild(labelEl);
        
        let input;
        
        switch (type) {
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.className = 'control-input';
                input.value = value;
                if (options.min !== undefined) input.min = options.min;
                if (options.max !== undefined) input.max = options.max;
                if (options.step !== undefined) input.step = options.step;
                input.addEventListener('change', () => onChange(parseFloat(input.value)));
                break;
                
            case 'slider':
                const sliderContainer = document.createElement('div');
                sliderContainer.style.display = 'flex';
                sliderContainer.style.alignItems = 'center';
                sliderContainer.style.gap = '10px';
                
                input = document.createElement('input');
                input.type = 'range';
                input.className = 'control-slider';
                input.value = value;
                input.min = options.min || 0;
                input.max = options.max || 100;
                input.step = options.step || 1;
                
                const valueDisplay = document.createElement('span');
                valueDisplay.className = 'control-value';
                valueDisplay.textContent = value;
                
                input.addEventListener('input', () => {
                    const val = parseFloat(input.value);
                    valueDisplay.textContent = val.toFixed(options.decimals || 0);
                    onChange(val);
                });
                
                sliderContainer.appendChild(input);
                sliderContainer.appendChild(valueDisplay);
                row.appendChild(sliderContainer);
                return row;
                
            case 'checkbox':
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'control-checkbox';
                input.checked = value;
                input.addEventListener('change', () => onChange(input.checked));
                break;
                
            case 'select':
                input = document.createElement('select');
                input.className = 'control-select';
                options.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    if (opt === value) option.selected = true;
                    input.appendChild(option);
                });
                input.addEventListener('change', () => onChange(input.value));
                break;
                
            case 'color':
                input = document.createElement('input');
                input.type = 'color';
                input.className = 'control-input';
                input.value = '#' + value.toString(16).padStart(6, '0');
                input.addEventListener('change', () => {
                    onChange(parseInt(input.value.substring(1), 16));
                });
                break;
                
            case 'button':
                input = document.createElement('button');
                input.className = 'control-button';
                if (options.danger) input.classList.add('danger');
                input.textContent = options.buttonText || 'Action';
                input.addEventListener('click', onChange);
                break;
                
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'control-input';
                input.value = value;
                input.addEventListener('change', () => onChange(input.value));
        }
        
        row.appendChild(input);
        return row;
    }
    
    /**
     * Create a control group with title
     */
    function createControlGroup(title) {
        const group = document.createElement('div');
        group.className = 'control-group';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'control-group-title';
        titleEl.textContent = title;
        group.appendChild(titleEl);
        
        return group;
    }
    
    /**
     * Build the physics tab
     */
    function buildPhysicsTab() {
        const container = document.getElementById('tab-physics');
        container.innerHTML = '';
        
        // Time settings
        const timeGroup = createControlGroup('Time');
        timeGroup.appendChild(createControl('Time Scale', 'slider', Config.PHYSICS.timeScale, 
            (v) => Config.set('PHYSICS', 'timeScale', v),
            { min: 0, max: 10000, step: 100, decimals: 0 }
        ));
        timeGroup.appendChild(createControl('Physics Rate (Hz)', 'number', Config.PHYSICS.physicsRate,
            (v) => Config.set('PHYSICS', 'physicsRate', v),
            { min: 10, max: 120, step: 10 }
        ));
        container.appendChild(timeGroup);
        
        // Gravity settings
        const gravityGroup = createControlGroup('Gravity');
        gravityGroup.appendChild(createControl('G (×10⁻¹¹)', 'number', Config.PHYSICS.G * 1e11,
            (v) => Config.set('PHYSICS', 'G', v * 1e-11),
            { step: 0.001 }
        ));
        gravityGroup.appendChild(createControl('Softening (×10⁶)', 'number', Config.PHYSICS.softeningParameter / 1e6,
            (v) => Config.set('PHYSICS', 'softeningParameter', v * 1e6),
            { min: 0.1, max: 100, step: 0.1 }
        ));
        container.appendChild(gravityGroup);
        
        // Integration
        const integrationGroup = createControlGroup('Integration');
        integrationGroup.appendChild(createControl('Method', 'select', Config.PHYSICS.integrationMethod,
            (v) => Config.set('PHYSICS', 'integrationMethod', v),
            { options: ['euler', 'verlet', 'rk4'] }
        ));
        container.appendChild(integrationGroup);
        
        // Debug
        const debugGroup = createControlGroup('Debug');
        debugGroup.appendChild(createControl('Pause Physics', 'checkbox', Config.DEBUG.pausePhysics,
            (v) => Config.set('DEBUG', 'pausePhysics', v)
        ));
        debugGroup.appendChild(createControl('Show Orbits', 'checkbox', Config.DEBUG.showOrbits,
            (v) => Config.set('DEBUG', 'showOrbits', v)
        ));
        debugGroup.appendChild(createControl('Show Velocity Vectors', 'checkbox', Config.DEBUG.showVelocityVectors,
            (v) => Config.set('DEBUG', 'showVelocityVectors', v)
        ));
        container.appendChild(debugGroup);
    }
    
    /**
     * Build the celestial bodies tab
     */
    function buildCelestialTab() {
        const container = document.getElementById('tab-celestial');
        container.innerHTML = '';
        
        // Sun
        const sunGroup = createControlGroup('Sun - ' + Config.SUN.name);
        sunGroup.appendChild(createControl('Light Intensity', 'slider', Config.SUN.lightIntensity,
            (v) => {
                Config.SUN.lightIntensity = v;
                // Update would require accessing sun entity
            },
            { min: 0, max: 5, step: 0.1, decimals: 1 }
        ));
        sunGroup.appendChild(createControl('Corona Opacity', 'slider', Config.SUN.coronaOpacity,
            (v) => Config.SUN.coronaOpacity = v,
            { min: 0, max: 1, step: 0.05, decimals: 2 }
        ));
        container.appendChild(sunGroup);
        
        // Planets
        Object.keys(Config.PLANETS).forEach(key => {
            const planet = Config.PLANETS[key];
            const group = createControlGroup('Planet - ' + planet.name);
            
            group.appendChild(createControl('Orbital Radius (AU)', 'number', 
                (planet.orbitalRadius / 1.496e11).toFixed(3),
                (v) => planet.orbitalRadius = v * 1.496e11,
                { step: 0.1 }
            ));
            group.appendChild(createControl('Mass (×10²⁴ kg)', 'number',
                (planet.mass / 1e24).toFixed(3),
                (v) => planet.mass = v * 1e24,
                { step: 0.1 }
            ));
            group.appendChild(createControl('Rotation Period (hours)', 'number',
                (planet.rotationPeriod / 3600).toFixed(1),
                (v) => planet.rotationPeriod = v * 3600,
                { step: 1 }
            ));
            group.appendChild(createControl('Color', 'color', planet.color,
                (v) => planet.color = v
            ));
            
            container.appendChild(group);
        });
        
        // Moons
        Object.keys(Config.MOONS).forEach(key => {
            const moon = Config.MOONS[key];
            const group = createControlGroup('Moon - ' + moon.name);
            
            group.appendChild(createControl('Orbital Radius (×10⁶ km)', 'number',
                (moon.orbitalRadius / 1e9).toFixed(3),
                (v) => moon.orbitalRadius = v * 1e9,
                { step: 0.1 }
            ));
            group.appendChild(createControl('Mass (×10²² kg)', 'number',
                (moon.mass / 1e22).toFixed(3),
                (v) => moon.mass = v * 1e22,
                { step: 0.1 }
            ));
            
            container.appendChild(group);
        });
    }
    
    /**
     * Build the player tab
     */
    function buildPlayerTab() {
        const container = document.getElementById('tab-player');
        container.innerHTML = '';
        
        // Movement
        const movementGroup = createControlGroup('Movement');
        movementGroup.appendChild(createControl('Walk Speed', 'slider', Config.PLAYER.walkSpeed,
            (v) => Config.set('PLAYER', 'walkSpeed', v),
            { min: 1, max: 50, step: 1, decimals: 0 }
        ));
        movementGroup.appendChild(createControl('Run Speed', 'slider', Config.PLAYER.runSpeed,
            (v) => Config.set('PLAYER', 'runSpeed', v),
            { min: 5, max: 100, step: 5, decimals: 0 }
        ));
        movementGroup.appendChild(createControl('Jump Force', 'slider', Config.PLAYER.jumpForce,
            (v) => Config.set('PLAYER', 'jumpForce', v),
            { min: 1, max: 30, step: 1, decimals: 0 }
        ));
        container.appendChild(movementGroup);
        
        // Flight
        const flightGroup = createControlGroup('Flight');
        flightGroup.appendChild(createControl('Fly Speed', 'slider', Config.PLAYER.flySpeed,
            (v) => Config.set('PLAYER', 'flySpeed', v),
            { min: 5, max: 200, step: 5, decimals: 0 }
        ));
        flightGroup.appendChild(createControl('Sprint Speed', 'slider', Config.PLAYER.flySprintSpeed,
            (v) => Config.set('PLAYER', 'flySprintSpeed', v),
            { min: 10, max: 500, step: 10, decimals: 0 }
        ));
        flightGroup.appendChild(createControl('Acceleration', 'slider', Config.PLAYER.flyAcceleration,
            (v) => Config.set('PLAYER', 'flyAcceleration', v),
            { min: 5, max: 100, step: 5, decimals: 0 }
        ));
        container.appendChild(flightGroup);
        
        // Camera
        const cameraGroup = createControlGroup('Camera');
        cameraGroup.appendChild(createControl('Mouse Sensitivity', 'slider', Config.PLAYER.mouseSensitivity * 1000,
            (v) => Config.set('PLAYER', 'mouseSensitivity', v / 1000),
            { min: 0.5, max: 5, step: 0.1, decimals: 1 }
        ));
        cameraGroup.appendChild(createControl('3rd Person Distance', 'slider', Config.PLAYER.thirdPersonDistance,
            (v) => Config.set('PLAYER', 'thirdPersonDistance', v),
            { min: 2, max: 20, step: 1, decimals: 0 }
        ));
        container.appendChild(cameraGroup);
        
        // Interaction
        const interactionGroup = createControlGroup('Interaction');
        interactionGroup.appendChild(createControl('Grab Distance', 'slider', Config.PLAYER.grabDistance,
            (v) => Config.set('PLAYER', 'grabDistance', v),
            { min: 2, max: 20, step: 1, decimals: 0 }
        ));
        interactionGroup.appendChild(createControl('Throw Force', 'slider', Config.PLAYER.throwForce,
            (v) => Config.set('PLAYER', 'throwForce', v),
            { min: 5, max: 50, step: 5, decimals: 0 }
        ));
        container.appendChild(interactionGroup);
    }
    
    /**
     * Build the rendering tab
     */
    function buildRenderingTab() {
        const container = document.getElementById('tab-rendering');
        container.innerHTML = '';
        
        // Quality
        const qualityGroup = createControlGroup('Quality');
        qualityGroup.appendChild(createControl('Fidelity', 'select', Config.RENDERING.fidelityLevel,
            (v) => {
                Config.set('RENDERING', 'fidelityLevel', v);
                Renderer.setFidelity(v);
            },
            { options: ['low', 'medium', 'ultra'] }
        ));
        qualityGroup.appendChild(createControl('Pixel Ratio', 'slider', Config.RENDERING.pixelRatio,
            (v) => {
                Config.set('RENDERING', 'pixelRatio', v);
                Renderer.setPixelRatio(v);
            },
            { min: 0.5, max: 2, step: 0.25, decimals: 2 }
        ));
        container.appendChild(qualityGroup);
        
        // Shadows
        const shadowGroup = createControlGroup('Shadows');
        const currentShadowConfig = Config.RENDERING.shadows[Config.RENDERING.fidelityLevel];
        shadowGroup.appendChild(createControl('Enabled', 'checkbox', currentShadowConfig.enabled,
            (v) => {
                Config.RENDERING.shadows[Config.RENDERING.fidelityLevel].enabled = v;
                Renderer.configureShadows();
            }
        ));
        container.appendChild(shadowGroup);
        
        // Stars
        const starsGroup = createControlGroup('Star Field');
        starsGroup.appendChild(createControl('Star Count', 'slider', Config.RENDERING.stars.count,
            (v) => {
                Config.RENDERING.stars.count = Math.floor(v);
            },
            { min: 1000, max: 20000, step: 1000, decimals: 0 }
        ));
        starsGroup.appendChild(createControl('Star Size', 'slider', Config.RENDERING.stars.size,
            (v) => Config.RENDERING.stars.size = v,
            { min: 0.5, max: 3, step: 0.1, decimals: 1 }
        ));
        starsGroup.appendChild(createControl('Opacity', 'slider', Config.RENDERING.stars.opacity,
            (v) => Config.RENDERING.stars.opacity = v,
            { min: 0, max: 1, step: 0.1, decimals: 1 }
        ));
        container.appendChild(starsGroup);
        
        // LOD
        const lodGroup = createControlGroup('Level of Detail');
        lodGroup.appendChild(createControl('LOD Enabled', 'checkbox', Config.RENDERING.lod.enabled,
            (v) => Config.RENDERING.lod.enabled = v
        ));
        container.appendChild(lodGroup);
        
        // Performance info
        const perfGroup = createControlGroup('Performance Info');
        const info = Renderer.getRenderInfo();
        if (info) {
            const infoText = document.createElement('div');
            infoText.style.fontSize = '0.85rem';
            infoText.style.color = 'var(--text-secondary)';
            infoText.innerHTML = `
                Triangles: ${info.triangles}<br>
                Draw Calls: ${info.calls}<br>
                Geometries: ${info.geometries}<br>
                Textures: ${info.textures}
            `;
            perfGroup.appendChild(infoText);
        }
        container.appendChild(perfGroup);
    }
    
    /**
     * Build the debug log tab
     */
    function buildDebugTab() {
        const container = document.getElementById('debug-log-content');
        container.innerHTML = '';
        
        const logs = Logger.getLogs();
        logs.slice(-100).forEach(entry => {
            const div = document.createElement('div');
            div.className = `log-entry ${entry.level}`;
            
            const timestamp = document.createElement('span');
            timestamp.className = 'log-timestamp';
            const t = entry.timestamp;
            timestamp.textContent = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
            
            const module = document.createElement('span');
            module.className = 'log-module';
            module.textContent = `[${entry.module}]`;
            
            const message = document.createElement('span');
            message.className = 'log-message';
            message.textContent = entry.message;
            
            div.appendChild(timestamp);
            div.appendChild(module);
            div.appendChild(message);
            container.appendChild(div);
        });
        
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * Switch tabs
     */
    function switchTab(tabName) {
        currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `tab-${tabName}`);
        });
        
        // Rebuild tab content
        switch (tabName) {
            case 'physics': buildPhysicsTab(); break;
            case 'celestial': buildCelestialTab(); break;
            case 'player': buildPlayerTab(); break;
            case 'rendering': buildRenderingTab(); break;
            case 'debug': buildDebugTab(); break;
        }
    }
    
    return {
        /**
         * Initialize the developer console
         */
        init: function() {
            consoleElement = document.getElementById('developer-console');
            
            // Setup tab switching
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => switchTab(btn.dataset.tab));
            });
            
            // Add log listener for live updates
            Logger.addListener(() => {
                if (isOpen && currentTab === 'debug') {
                    buildDebugTab();
                }
            });
            
            Logger.info('DeveloperConsole', 'Developer console initialized');
        },
        
        /**
         * Toggle console visibility
         */
        toggle: function() {
            isOpen = !isOpen;
            
            if (isOpen) {
                consoleElement.classList.remove('hidden');
                switchTab(currentTab);  // Rebuild current tab
            } else {
                consoleElement.classList.add('hidden');
            }
            
            return isOpen;
        },
        
        /**
         * Check if open
         */
        isOpen: function() {
            return isOpen;
        },
        
        /**
         * Close console
         */
        close: function() {
            if (isOpen) {
                isOpen = false;
                consoleElement.classList.add('hidden');
            }
        },
        
        /**
         * Open console
         */
        open: function() {
            if (!isOpen) {
                isOpen = true;
                consoleElement.classList.remove('hidden');
                switchTab(currentTab);
            }
        },
        
        /**
         * Refresh current tab
         */
        refresh: function() {
            if (isOpen) {
                switchTab(currentTab);
            }
        }
    };
})();

window.DeveloperConsole = DeveloperConsole;
