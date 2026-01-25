/**
 * UI SYSTEM
 * Developer console, performance metrics, debug overlay
 */

class UISystem {
    constructor(config) {
        this.config = config;
        
        // UI state
        this.devConsoleOpen = false;
        this.metricsVisible = false;
        
        // Debug messages
        this.debugMessages = [];
        this.maxDebugMessages = this.config.ui.maxDebugMessages;
        
        // Performance tracking
        this.fps = 60;
        this.frameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        
        // Create UI elements
        this.createDebugOverlay();
        this.createMetricsOverlay();
        this.createDevConsole();
        
        // Setup input
        this.setupInput();
        
        // Hijack console.log for debug overlay
        this.hijackConsole();
        
        console.log('[UI] System initialized');
    }

    createDebugOverlay() {
        this.debugOverlay = document.createElement('div');
        this.debugOverlay.id = 'debug-overlay';
        this.debugOverlay.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            max-width: 400px;
            pointer-events: none;
            z-index: 100;
            display: ${this.config.ui.showDebugLog ? 'block' : 'none'};
        `;
        document.body.appendChild(this.debugOverlay);
    }

    createMetricsOverlay() {
        this.metricsOverlay = document.createElement('div');
        this.metricsOverlay.id = 'metrics-overlay';
        this.metricsOverlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            padding: 10px;
            border-radius: 5px;
            pointer-events: none;
            z-index: 100;
            display: ${this.config.ui.showMetrics ? 'block' : 'none'};
        `;
        document.body.appendChild(this.metricsOverlay);
    }

    createDevConsole() {
        // Container
        this.devConsole = document.createElement('div');
        this.devConsole.id = 'dev-console';
        this.devConsole.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(20, 20, 40, 0.95);
            color: #ffffff;
            font-family: Arial, sans-serif;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #4444ff;
            width: 80%;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Developer Console';
        title.style.cssText = 'margin: 0 0 20px 0; color: #4444ff;';
        this.devConsole.appendChild(title);
        
        // Controls container
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;';
        this.devConsole.appendChild(this.controlsContainer);
        
        // Build controls
        this.buildDevConsoleControls();
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close (/)';
        closeBtn.style.cssText = `
            margin-top: 20px;
            padding: 10px 20px;
            background: #4444ff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        closeBtn.onclick = () => this.toggleDevConsole();
        this.devConsole.appendChild(closeBtn);
        
        document.body.appendChild(this.devConsole);
    }

    buildDevConsoleControls() {
        this.controlsContainer.innerHTML = '';
        
        // Helper to create control
        const createControl = (label, value, onChange, type = 'number', step = null) => {
            const container = document.createElement('div');
            container.style.cssText = 'margin-bottom: 10px;';
            
            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            labelEl.style.cssText = 'display: block; margin-bottom: 5px; font-size: 12px; color: #aaaaff;';
            
            const input = document.createElement('input');
            input.type = type;
            if (step) input.step = step;
            input.value = value;
            input.style.cssText = `
                width: 100%;
                padding: 5px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #4444ff;
                border-radius: 3px;
                color: white;
            `;
            input.onchange = (e) => onChange(e.target.value);
            
            container.appendChild(labelEl);
            container.appendChild(input);
            return container;
        };
        
        const createSelect = (label, value, options, onChange) => {
            const container = document.createElement('div');
            container.style.cssText = 'margin-bottom: 10px;';
            
            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            labelEl.style.cssText = 'display: block; margin-bottom: 5px; font-size: 12px; color: #aaaaff;';
            
            const select = document.createElement('select');
            select.style.cssText = `
                width: 100%;
                padding: 5px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid #4444ff;
                border-radius: 3px;
                color: white;
            `;
            
            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                if (opt === value) option.selected = true;
                select.appendChild(option);
            });
            
            select.onchange = (e) => onChange(e.target.value);
            
            container.appendChild(labelEl);
            container.appendChild(select);
            return container;
        };
        
        // === PHYSICS ===
        this.controlsContainer.appendChild(this.createSection('Physics'));
        this.controlsContainer.appendChild(createControl(
            'Time Scale',
            this.config.physics.timeScale,
            (v) => { this.config.physics.timeScale = parseFloat(v); window.physicsEngine?.setTimeScale(parseFloat(v)); },
            'number',
            '0.1'
        ));
        
        // === RENDERING ===
        this.controlsContainer.appendChild(this.createSection('Rendering'));
        this.controlsContainer.appendChild(createSelect(
            'Fidelity',
            this.config.rendering.fidelity,
            ['Low', 'Medium', 'Ultra'],
            (v) => { applyFidelitySettings(v); }
        ));
        
        // === SUN ===
        this.controlsContainer.appendChild(this.createSection('Sun'));
        this.controlsContainer.appendChild(createControl(
            'Light Intensity',
            this.config.sun.lightIntensity,
            (v) => { 
                this.config.sun.lightIntensity = parseFloat(v);
                if (window.solarSystem?.sun?.light) {
                    window.solarSystem.sun.light.intensity = parseFloat(v);
                }
            },
            'number',
            '0.1'
        ));
        
        // === PLAYER ===
        this.controlsContainer.appendChild(this.createSection('Player'));
        this.controlsContainer.appendChild(createControl(
            'Walk Speed (m/s)',
            this.config.player.walkSpeed,
            (v) => { this.config.player.walkSpeed = parseFloat(v); },
            'number',
            '0.5'
        ));
        this.controlsContainer.appendChild(createControl(
            'Flight Speed (m/s)',
            this.config.player.flightSpeed,
            (v) => { this.config.player.flightSpeed = parseFloat(v); },
            'number',
            '1'
        ));
        
        // === PLANET 1 ===
        this.controlsContainer.appendChild(this.createSection('Planet 1'));
        this.controlsContainer.appendChild(createControl(
            'Mass (kg)',
            this.config.planet1.mass,
            (v) => { 
                this.config.planet1.mass = parseFloat(v);
                if (window.solarSystem?.planet1) {
                    window.solarSystem.planet1.mass = parseFloat(v);
                }
            },
            'number',
            '1e23'
        ));
        
        // === CAMERA ===
        this.controlsContainer.appendChild(this.createSection('Camera'));
        this.controlsContainer.appendChild(createControl(
            'Mouse Sensitivity',
            this.config.player.mouseSensitivity,
            (v) => { this.config.player.mouseSensitivity = parseFloat(v); },
            'number',
            '0.0001'
        ));
    }

    createSection(title) {
        const section = document.createElement('div');
        section.style.cssText = 'grid-column: 1 / -1; margin-top: 15px;';
        
        const heading = document.createElement('h3');
        heading.textContent = title;
        heading.style.cssText = 'margin: 0; color: #6666ff; font-size: 14px; border-bottom: 1px solid #4444ff; padding-bottom: 5px;';
        
        section.appendChild(heading);
        return section;
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            // Toggle dev console
            if (e.key === this.config.ui.devConsoleKey) {
                e.preventDefault();
                this.toggleDevConsole();
            }
            
            // Toggle metrics (F3)
            if (e.key === 'F3') {
                e.preventDefault();
                this.toggleMetrics();
            }
        });
    }

    toggleDevConsole() {
        this.devConsoleOpen = !this.devConsoleOpen;
        this.devConsole.style.display = this.devConsoleOpen ? 'block' : 'none';
        window.isMenuOpen = this.devConsoleOpen;
        
        // Release pointer lock when console is open
        if (this.devConsoleOpen && window.cameraController) {
            window.cameraController.releasePointerLock();
        }
        
        console.log(`[UI] Dev console: ${this.devConsoleOpen ? 'OPEN' : 'CLOSED'}`);
    }

    toggleMetrics() {
        this.metricsVisible = !this.metricsVisible;
        this.metricsOverlay.style.display = this.metricsVisible ? 'block' : 'none';
    }

    hijackConsole() {
        const originalLog = console.log;
        console.log = (...args) => {
            originalLog.apply(console, args);
            
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            
            this.addDebugMessage(message);
        };
    }

    addDebugMessage(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.debugMessages.push(`[${timestamp}] ${message}`);
        
        // Limit messages
        if (this.debugMessages.length > this.maxDebugMessages) {
            this.debugMessages.shift();
        }
        
        this.updateDebugOverlay();
    }

    updateDebugOverlay() {
        if (!this.config.ui.showDebugLog) return;
        
        this.debugOverlay.innerHTML = this.debugMessages
            .map(msg => `<div>${msg}</div>`)
            .join('');
    }

    updateMetrics(player, physicsEngine) {
        if (!this.metricsVisible) return;
        
        // Calculate FPS
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastFpsUpdate;
        
        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount / elapsed) * 1000);
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }
        
        // Build metrics display
        let html = '<div style="margin-bottom: 5px;"><strong>PERFORMANCE</strong></div>';
        html += `<div>FPS: ${this.fps}</div>`;
        html += `<div>Frame Time: ${this.frameTime.toFixed(2)} ms</div>`;
        html += '<div style="margin: 10px 0;"><strong>POSITION</strong></div>';
        html += `<div>X: ${player.position.x.toFixed(2)}</div>`;
        html += `<div>Y: ${player.position.y.toFixed(2)}</div>`;
        html += `<div>Z: ${player.position.z.toFixed(2)}</div>`;
        html += '<div style="margin: 10px 0;"><strong>PHYSICS</strong></div>';
        html += `<div>Bodies: ${physicsEngine.bodies.length}</div>`;
        html += `<div>Grounded: ${player.isGrounded ? 'Yes' : 'No'}</div>`;
        html += `<div>Flight: ${player.freeFlightMode ? 'On' : 'Off'}</div>`;
        
        // Energy (for debugging orbital stability)
        const energy = physicsEngine.getTotalEnergy();
        html += '<div style="margin: 10px 0;"><strong>SYSTEM ENERGY</strong></div>';
        html += `<div>Total: ${energy.total.toExponential(2)} J</div>`;
        
        this.metricsOverlay.innerHTML = html;
    }

    update(frameTime, player, physicsEngine) {
        this.frameTime = frameTime;
        this.updateMetrics(player, physicsEngine);
    }

    showError(error) {
        const errorOverlay = document.createElement('div');
        errorOverlay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 0, 0, 0.9);
            color: white;
            font-family: 'Courier New', monospace;
            padding: 30px;
            border-radius: 10px;
            border: 3px solid darkred;
            max-width: 80%;
            z-index: 10000;
        `;
        
        errorOverlay.innerHTML = `
            <h2 style="margin: 0 0 10px 0;">❌ ERROR</h2>
            <div style="margin-bottom: 10px;"><strong>${error.message}</strong></div>
            <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow: auto; max-height: 300px;">${error.stack || 'No stack trace available'}</pre>
            <div style="margin-top: 10px; font-size: 12px;">Check the browser console for more details.</div>
        `;
        
        document.body.appendChild(errorOverlay);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UISystem };
}
