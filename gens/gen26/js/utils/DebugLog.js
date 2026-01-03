/**
 * ============================================
 * Debug Log System
 * ============================================
 * 
 * Provides on-screen logging for debugging.
 * Captures console.log, console.warn, console.error
 * and displays them in an overlay.
 */

const DebugLog = {
    container: null,
    content: null,
    entries: [],
    maxEntries: 50,
    isMinimized: false,
    isHidden: false,
    
    /**
     * Initialize the debug log system
     */
    init() {
        this.container = document.getElementById('debug-log');
        this.content = document.getElementById('debug-content');
        this.maxEntries = CONFIG.UI.MAX_DEBUG_ENTRIES || 50;
        
        // Set up buttons
        const clearBtn = document.getElementById('debug-clear');
        const minimizeBtn = document.getElementById('debug-toggle-minimize');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }
        
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        }
        
        // Override console methods to capture logs
        this.overrideConsole();
        
        // Capture unhandled errors
        window.addEventListener('error', (e) => {
            this.error(`Uncaught Error: ${e.message} at ${e.filename}:${e.lineno}`);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.error(`Unhandled Promise Rejection: ${e.reason}`);
        });
        
        this.info('Debug Log initialized');
        return this;
    },
    
    /**
     * Override console methods
     */
    overrideConsole() {
        const originalLog = console.log.bind(console);
        const originalWarn = console.warn.bind(console);
        const originalError = console.error.bind(console);
        const originalInfo = console.info.bind(console);
        
        const self = this;
        
        console.log = (...args) => {
            originalLog(...args);
            self.log(args.map(a => self.stringify(a)).join(' '));
        };
        
        console.warn = (...args) => {
            originalWarn(...args);
            self.warn(args.map(a => self.stringify(a)).join(' '));
        };
        
        console.error = (...args) => {
            originalError(...args);
            self.error(args.map(a => self.stringify(a)).join(' '));
        };
        
        console.info = (...args) => {
            originalInfo(...args);
            self.info(args.map(a => self.stringify(a)).join(' '));
        };
        
        // Add custom success method (not standard, but useful)
        console.success = (...args) => {
            originalLog('✓', ...args);
            self.success(args.map(a => self.stringify(a)).join(' '));
        };
    },
    
    /**
     * Convert value to string for display
     */
    stringify(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 0).substring(0, 200);
            } catch (e) {
                return '[Object]';
            }
        }
        return String(value);
    },
    
    /**
     * Add a log entry
     */
    addEntry(message, type = 'log') {
        if (!this.content) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const entry = {
            time: timestamp,
            message: message,
            type: type
        };
        
        this.entries.push(entry);
        
        // Trim old entries
        while (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }
        
        // Create DOM element
        const div = document.createElement('div');
        div.className = `debug-entry ${type}`;
        div.textContent = `[${timestamp}] ${message}`;
        
        this.content.appendChild(div);
        
        // Auto-scroll to bottom
        this.content.scrollTop = this.content.scrollHeight;
        
        // Remove old DOM elements
        while (this.content.children.length > this.maxEntries) {
            this.content.removeChild(this.content.firstChild);
        }
    },
    
    /**
     * Log methods
     */
    log(message) {
        this.addEntry(message, 'log');
    },
    
    info(message) {
        this.addEntry(message, 'info');
    },
    
    warn(message) {
        this.addEntry(message, 'warn');
    },
    
    error(message) {
        this.addEntry(message, 'error');
        // Always show on error
        this.show();
        if (this.isMinimized) {
            this.toggleMinimize();
        }
    },
    
    success(message) {
        this.addEntry(message, 'success');
    },
    
    /**
     * Clear all entries
     */
    clear() {
        this.entries = [];
        if (this.content) {
            this.content.innerHTML = '';
        }
    },
    
    /**
     * Toggle minimized state
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        if (this.container) {
            this.container.classList.toggle('minimized', this.isMinimized);
        }
    },
    
    /**
     * Show/hide the debug log
     */
    show() {
        this.isHidden = false;
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    },
    
    hide() {
        this.isHidden = true;
        if (this.container) {
            this.container.classList.add('hidden');
        }
    },
    
    toggle() {
        if (this.isHidden) {
            this.show();
        } else {
            this.hide();
        }
    }
};
