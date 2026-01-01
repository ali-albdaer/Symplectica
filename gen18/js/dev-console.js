/**
 * Developer Console
 * Real-time config editor and debugging interface
 */
class DevConsole {
    constructor() {
        this.isOpen = false;
        this.logs = [];
        this.maxLogs = 100;
        
        this.controlValues = {}; // Track current values
        this.setupUI();
        
        // Subscribe to debug log
        DebugLog.subscribe((entry) => {
            this.addLog(entry);
        });
        
        DebugLog.info('DevConsole: Initialized');
    }

    /**
     * Setup UI elements
     */
    setupUI() {
        this.consoleEl = document.getElementById('dev-console');
        this.outputEl = document.getElementById('dev-console-output');
        this.controlsEl = document.getElementById('dev-console-controls');
        
        // Prevent closing when interacting with console
        this.consoleEl.addEventListener('mousedown', (e) => e.stopPropagation());
        this.consoleEl.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Add log entry
     */
    addLog(entry) {
        this.logs.push(entry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        if (this.isOpen) {
            this.updateLogDisplay();
        }
    }

    /**
     * Update log display
     */
    updateLogDisplay() {
        this.outputEl.innerHTML = '';
        
        for (const entry of this.logs) {
            const logDiv = document.createElement('div');
            logDiv.className = entry.level;
            logDiv.textContent = `[${entry.timestamp}] ${entry.message}`;
            this.outputEl.appendChild(logDiv);
        }
        
        // Scroll to bottom
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    /**
     * Build controls from config
     */
    buildControls() {
        this.controlsEl.innerHTML = '';
        
        // Physics controls
        const physicsGroup = document.createElement('div');
        physicsGroup.className = 'control-group';
        physicsGroup.innerHTML = `
            <label>Physics Gravity:</label>
            <input type="number" id="ctrl-gravity" value="${Config.physics.gravity}" step="0.1">
            <button id="btn-apply-gravity">Apply</button>
        `;
        this.controlsEl.appendChild(physicsGroup);
        
        document.getElementById('btn-apply-gravity').addEventListener('click', () => {
            Config.physics.gravity = parseFloat(document.getElementById('ctrl-gravity').value);
            DebugLog.info(`Gravity set to ${Config.physics.gravity}`);
        });
        
        // Time scale
        const timeGroup = document.createElement('div');
        timeGroup.className = 'control-group';
        timeGroup.innerHTML = `
            <label>Time Scale:</label>
            <input type="number" id="ctrl-timescale" value="${Config.physics.timeScale}" step="0.1" min="0">
            <button id="btn-apply-timescale">Apply</button>
        `;
        this.controlsEl.appendChild(timeGroup);
        
        document.getElementById('btn-apply-timescale').addEventListener('click', () => {
            Config.physics.timeScale = parseFloat(document.getElementById('ctrl-timescale').value);
            DebugLog.info(`Time scale set to ${Config.physics.timeScale}`);
        });
        
        // Fidelity
        const fidelityGroup = document.createElement('div');
        fidelityGroup.className = 'control-group';
        fidelityGroup.innerHTML = `
            <label>Fidelity:</label>
            <select id="ctrl-fidelity">
                <option value="low" ${Config.render.fidelity === 'low' ? 'selected' : ''}>Low</option>
                <option value="medium" ${Config.render.fidelity === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="ultra" ${Config.render.fidelity === 'ultra' ? 'selected' : ''}>Ultra</option>
            </select>
            <button id="btn-apply-fidelity">Apply</button>
        `;
        this.controlsEl.appendChild(fidelityGroup);
        
        document.getElementById('btn-apply-fidelity').addEventListener('click', () => {
            const fidelity = document.getElementById('ctrl-fidelity').value;
            Config.render.fidelity = fidelity;
            DebugLog.info(`Fidelity set to ${fidelity}`);
        });
        
        // LOD
        const lodGroup = document.createElement('div');
        lodGroup.className = 'control-group';
        lodGroup.innerHTML = `
            <label>LOD Enabled:</label>
            <input type="checkbox" id="ctrl-lod" ${Config.render.enableLOD ? 'checked' : ''}>
            <button id="btn-apply-lod">Apply</button>
        `;
        this.controlsEl.appendChild(lodGroup);
        
        document.getElementById('btn-apply-lod').addEventListener('click', () => {
            Config.render.enableLOD = document.getElementById('ctrl-lod').checked;
            DebugLog.info(`LOD ${Config.render.enableLOD ? 'enabled' : 'disabled'}`);
        });
        
        // Frustum culling
        const fcGroup = document.createElement('div');
        fcGroup.className = 'control-group';
        fcGroup.innerHTML = `
            <label>Frustum Culling:</label>
            <input type="checkbox" id="ctrl-fc" ${Config.render.enableFrustumCulling ? 'checked' : ''}>
            <button id="btn-apply-fc">Apply</button>
        `;
        this.controlsEl.appendChild(fcGroup);
        
        document.getElementById('btn-apply-fc').addEventListener('click', () => {
            Config.render.enableFrustumCulling = document.getElementById('ctrl-fc').checked;
            DebugLog.info(`Frustum culling ${Config.render.enableFrustumCulling ? 'enabled' : 'disabled'}`);
        });
        
        // Camera sensitivity
        const sensGroup = document.createElement('div');
        sensGroup.className = 'control-group';
        sensGroup.innerHTML = `
            <label>Camera Sensitivity:</label>
            <input type="number" id="ctrl-sensitivity" value="${Config.controls.sensitivity}" step="0.001" min="0.001">
            <button id="btn-apply-sensitivity">Apply</button>
        `;
        this.controlsEl.appendChild(sensGroup);
        
        document.getElementById('btn-apply-sensitivity').addEventListener('click', () => {
            Config.controls.sensitivity = parseFloat(document.getElementById('ctrl-sensitivity').value);
            DebugLog.info(`Sensitivity set to ${Config.controls.sensitivity}`);
        });
    }

    /**
     * Toggle console
     */
    toggle() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.open();
        } else {
            this.close();
        }
    }

    /**
     * Open console
     */
    open() {
        this.isOpen = true;
        this.consoleEl.classList.add('active');
        this.buildControls();
        this.updateLogDisplay();
        
        // Lock controls
        if (window.InputHandler) {
            window.InputHandler.releasePointerLock();
        }
        
        DebugLog.info('Dev Console: Opened');
    }

    /**
     * Close console
     */
    close() {
        this.isOpen = false;
        this.consoleEl.classList.remove('active');
        
        // Unlock controls
        if (window.InputHandler) {
            window.InputHandler.requestPointerLock();
        }
        
        DebugLog.info('Dev Console: Closed');
    }

    /**
     * Execute command
     */
    executeCommand(command) {
        DebugLog.info(`> ${command}`);
        
        try {
            const result = eval(command);
            if (result !== undefined) {
                DebugLog.info(`Result: ${result}`);
            }
        } catch (error) {
            DebugLog.error(`Command Error: ${error.message}`);
        }
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
        this.updateLogDisplay();
        DebugLog.info('Logs cleared');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DevConsole;
}
