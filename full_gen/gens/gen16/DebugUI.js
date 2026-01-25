/**
 * DebugUI.js - Developer Console & Attribute Editor
 * Provides real-time debugging, telemetry, and config editing
 */

class DebugUI {
    constructor(config, inputManager) {
        this.config = config;
        this.input = inputManager;
        
        this.consoleElement = document.getElementById('dev-console');
        this.consoleOutput = document.getElementById('console-output');
        this.consoleInput = document.getElementById('console-input');
        this.consoleButton = document.getElementById('console-button');
        
        this.editorElement = document.getElementById('attribute-editor');
        this.editorContent = document.getElementById('editor-content');
        
        this.telemetryElement = document.getElementById('debug-ui');
        this.isConsoleActive = false;
        this.isEditorActive = false;
        
        this.commandHistory = [];
        this.historyIndex = -1;
        
        this.setupEventListeners();
        this.populateAttributeEditor();
        
        Logger.info('DebugUI initialized');
    }

    /**
     * Setup event listeners for console
     */
    setupEventListeners() {
        // Console input
        this.consoleInput.addEventListener('keydown', (e) => this.onConsoleKeyDown(e));
        this.consoleButton.addEventListener('click', () => this.executeConsoleCommand());
        
        // Toggle console with /
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !this.input.isUIActive()) {
                this.toggleConsole();
            }
        });
        
        // Prevent default when in console
        document.addEventListener('keydown', (e) => {
            if (this.isConsoleActive && e.key === '/') {
                e.preventDefault();
            }
        });
    }

    /**
     * Handle console input keydown
     */
    onConsoleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.executeConsoleCommand();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.historyIndex = Math.max(-1, this.historyIndex - 1);
            this.consoleInput.value = this.historyIndex >= 0 ? this.commandHistory[this.historyIndex] : '';
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.historyIndex = Math.min(this.commandHistory.length - 1, this.historyIndex + 1);
            this.consoleInput.value = this.historyIndex >= 0 ? this.commandHistory[this.historyIndex] : '';
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.toggleConsole();
        }
    }

    /**
     * Toggle console visibility
     */
    toggleConsole() {
        this.isConsoleActive = !this.isConsoleActive;
        
        if (this.isConsoleActive) {
            this.consoleElement.classList.add('active');
            this.editorElement.classList.add('active');
            this.consoleInput.focus();
            this.input.releasePointerLock();
            Logger.info('Developer console opened');
        } else {
            this.consoleElement.classList.remove('active');
            this.editorElement.classList.remove('active');
            this.consoleInput.blur();
            Logger.info('Developer console closed');
        }
    }

    /**
     * Execute a console command
     */
    executeConsoleCommand() {
        const command = this.consoleInput.value.trim();
        
        if (!command) return;
        
        this.addConsoleLine(`> ${command}`, 'info');
        this.commandHistory.push(command);
        this.historyIndex = -1;
        this.consoleInput.value = '';
        
        try {
            // Parse command
            if (command.startsWith('set ')) {
                this.executeSetCommand(command);
            } else if (command.startsWith('get ')) {
                this.executeGetCommand(command);
            } else if (command.startsWith('help')) {
                this.showHelp();
            } else if (command.startsWith('info')) {
                this.showSystemInfo();
            } else if (command.startsWith('reload')) {
                location.reload();
            } else {
                // Try to evaluate as JavaScript
                this.executeJavaScript(command);
            }
        } catch (error) {
            this.addConsoleLine(`ERROR: ${error.message}`, 'error');
        }
    }

    /**
     * Execute SET command to modify config
     */
    executeSetCommand(command) {
        const parts = command.substring(4).trim().split(' ');
        if (parts.length < 2) {
            this.addConsoleLine('Usage: set VARIABLE VALUE', 'warn');
            return;
        }
        
        const varName = parts[0];
        const value = parts.slice(1).join(' ');
        
        // Parse value
        let parsedValue = value;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(value)) parsedValue = parseFloat(value);
        
        // Find and update config variable
        let found = false;
        for (const [section, values] of Object.entries(this.config)) {
            if (typeof values === 'object' && values !== null) {
                if (varName in values) {
                    const oldValue = values[varName];
                    values[varName] = parsedValue;
                    this.addConsoleLine(
                        `${section}.${varName} = ${parsedValue} (was ${oldValue})`,
                        'info'
                    );
                    this.populateAttributeEditor();
                    found = true;
                    break;
                }
            }
        }
        
        if (!found) {
            this.addConsoleLine(`Variable not found: ${varName}`, 'warn');
        }
    }

    /**
     * Execute GET command to read config
     */
    executeGetCommand(command) {
        const varName = command.substring(4).trim();
        
        let found = false;
        for (const [section, values] of Object.entries(this.config)) {
            if (typeof values === 'object' && values !== null) {
                if (varName in values) {
                    const value = values[varName];
                    this.addConsoleLine(`${section}.${varName} = ${JSON.stringify(value)}`, 'info');
                    found = true;
                    break;
                }
            }
        }
        
        if (!found) {
            this.addConsoleLine(`Variable not found: ${varName}`, 'warn');
        }
    }

    /**
     * Execute arbitrary JavaScript
     */
    executeJavaScript(command) {
        try {
            const result = eval(command);
            this.addConsoleLine(`Result: ${JSON.stringify(result)}`, 'info');
        } catch (error) {
            this.addConsoleLine(`ERROR: ${error.message}`, 'error');
        }
    }

    /**
     * Show help text
     */
    showHelp() {
        this.addConsoleLine('=== COMMANDS ===', 'info');
        this.addConsoleLine('set VARIABLE VALUE - Set config variable', 'info');
        this.addConsoleLine('get VARIABLE - Get config variable', 'info');
        this.addConsoleLine('info - Show system info', 'info');
        this.addConsoleLine('help - Show this help', 'info');
        this.addConsoleLine('reload - Reload the page', 'info');
        this.addConsoleLine('Any JavaScript code will be evaluated', 'info');
    }

    /**
     * Show system info
     */
    showSystemInfo() {
        const stats = {
            meshCount: Object.keys(this.config).length,
            timestamp: new Date().toLocaleString(),
            userAgent: navigator.userAgent.substring(0, 50) + '...',
        };
        
        this.addConsoleLine(`=== SYSTEM INFO ===`, 'info');
        for (const [key, value] of Object.entries(stats)) {
            this.addConsoleLine(`${key}: ${value}`, 'info');
        }
    }

    /**
     * Add a line to console output
     */
    addConsoleLine(text, level = 'info') {
        const line = document.createElement('div');
        line.className = `console-log ${level}`;
        line.textContent = text;
        
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    }

    /**
     * Populate attribute editor with config variables
     */
    populateAttributeEditor() {
        this.editorContent.innerHTML = '';
        
        for (const [sectionName, sectionValues] of Object.entries(this.config)) {
            if (typeof sectionValues !== 'object' || sectionValues === null || Array.isArray(sectionValues)) {
                continue;
            }
            
            const groupDiv = document.createElement('div');
            groupDiv.className = 'attr-group';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'attr-group-title';
            titleDiv.textContent = sectionName;
            groupDiv.appendChild(titleDiv);
            
            for (const [varName, value] of Object.entries(sectionValues)) {
                if (typeof value === 'object' && value !== null) {
                    continue; // Skip nested objects
                }
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'attr-item';
                
                const label = document.createElement('div');
                label.className = 'attr-label';
                label.textContent = varName;
                
                const input = document.createElement('input');
                input.className = 'attr-input';
                input.type = 'text';
                input.value = typeof value === 'object' ? JSON.stringify(value) : value;
                
                input.addEventListener('change', (e) => {
                    let newValue = e.target.value;
                    if (newValue === 'true') newValue = true;
                    else if (newValue === 'false') newValue = false;
                    else if (!isNaN(newValue)) newValue = parseFloat(newValue);
                    
                    sectionValues[varName] = newValue;
                    Logger.info(`Updated ${sectionName}.${varName} = ${newValue}`);
                });
                
                itemDiv.appendChild(label);
                itemDiv.appendChild(input);
                groupDiv.appendChild(itemDiv);
            }
            
            this.editorContent.appendChild(groupDiv);
        }
    }

    /**
     * Update telemetry display
     */
    updateTelemetry(fps, frameTime, playerPos, entityCount) {
        document.getElementById('fps').textContent = fps;
        document.getElementById('frame-time').textContent = frameTime.toFixed(2);
        document.getElementById('player-pos').textContent = 
            `${playerPos.x.toFixed(2)}, ${playerPos.y.toFixed(2)}, ${playerPos.z.toFixed(2)}`;
        document.getElementById('entity-count').textContent = entityCount;
    }

    /**
     * Toggle telemetry visibility
     */
    toggleTelemetry() {
        if (this.telemetryElement.style.visibility === 'hidden') {
            this.telemetryElement.style.visibility = 'visible';
        } else {
            this.telemetryElement.style.visibility = 'hidden';
        }
    }

    /**
     * Show error overlay
     */
    showErrorOverlay(errorTitle, errorMessage) {
        const overlay = document.getElementById('error-overlay');
        const messageDiv = document.getElementById('error-message');
        
        messageDiv.textContent = errorMessage;
        overlay.classList.add('active');
        
        Logger.error(`[${errorTitle}] ${errorMessage}`);
    }

    /**
     * Hide error overlay
     */
    hideErrorOverlay() {
        const overlay = document.getElementById('error-overlay');
        overlay.classList.remove('active');
    }

    /**
     * Check if console is active
     */
    getIsConsoleActive() {
        return this.isConsoleActive;
    }
}
