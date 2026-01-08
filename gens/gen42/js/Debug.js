/**
 * Debug.js - Debug and Error Handling Module
 * 
 * Provides robust error handling with on-screen debug log overlay.
 * Captures and displays errors to prevent silent failures.
 */

class Debug {
    constructor() {
        this.messages = [];
        this.maxMessages = 50;
        this.isInitialized = false;
        this.logElement = null;
        this.messagesElement = null;
        this.loadingStatus = null;
        
        // Bind error handlers early
        this.setupGlobalErrorHandlers();
    }
    
    /**
     * Initialize debug system with DOM elements
     */
    init() {
        try {
            this.logElement = document.getElementById('debug-log');
            this.messagesElement = document.getElementById('debug-messages');
            this.loadingStatus = document.getElementById('loading-status');
            
            // Setup clear button
            const clearBtn = document.getElementById('clear-debug');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clear());
            }
            
            this.isInitialized = true;
            this.info('Debug system initialized');
            
            // Display any queued messages
            this.messages.forEach(msg => this.renderMessage(msg));
            
        } catch (error) {
            console.error('Failed to initialize debug system:', error);
        }
    }
    
    /**
     * Setup global error handlers
     */
    setupGlobalErrorHandlers() {
        // Catch unhandled errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.error(`${message} at ${source}:${lineno}:${colno}`);
            return false; // Allow default handling too
        };
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.error(`Unhandled Promise Rejection: ${event.reason}`);
        });
        
        // Catch resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                const element = event.target;
                const src = element.src || element.href || 'unknown';
                this.error(`Failed to load resource: ${src}`);
            }
        }, true);
    }
    
    /**
     * Update loading status
     */
    setLoadingStatus(status) {
        if (this.loadingStatus) {
            this.loadingStatus.textContent = status;
        }
        this.info(`Loading: ${status}`);
    }
    
    /**
     * Log an info message
     */
    info(message) {
        this.log(message, 'info');
    }
    
    /**
     * Log a success message
     */
    success(message) {
        this.log(message, 'success');
    }
    
    /**
     * Log a warning message
     */
    warn(message) {
        this.log(message, 'warn');
        console.warn(message);
    }
    
    /**
     * Log an error message
     */
    error(message) {
        this.log(message, 'error');
        console.error(message);
    }
    
    /**
     * Core logging function
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            message,
            type,
            timestamp
        };
        
        this.messages.push(logEntry);
        
        // Trim old messages
        while (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        
        // Render if initialized
        if (this.isInitialized) {
            this.renderMessage(logEntry);
        }
        
        // Also log to console
        if (type !== 'error' && type !== 'warn') {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    /**
     * Render a message to the DOM
     */
    renderMessage(logEntry) {
        if (!this.messagesElement) return;
        
        const msgElement = document.createElement('div');
        msgElement.className = `debug-message ${logEntry.type}`;
        msgElement.innerHTML = `<span class="time">[${logEntry.timestamp}]</span> ${this.escapeHtml(logEntry.message)}`;
        
        this.messagesElement.appendChild(msgElement);
        
        // Auto-scroll to bottom
        this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
        
        // Remove oldest if too many
        while (this.messagesElement.children.length > this.maxMessages) {
            this.messagesElement.removeChild(this.messagesElement.firstChild);
        }
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Clear all messages
     */
    clear() {
        this.messages = [];
        if (this.messagesElement) {
            this.messagesElement.innerHTML = '';
        }
        this.info('Debug log cleared');
    }
    
    /**
     * Show the debug panel
     */
    show() {
        if (this.logElement) {
            this.logElement.classList.remove('hidden');
        }
    }
    
    /**
     * Hide the debug panel
     */
    hide() {
        if (this.logElement) {
            this.logElement.classList.add('hidden');
        }
    }
    
    /**
     * Toggle visibility
     */
    toggle() {
        if (this.logElement) {
            this.logElement.classList.toggle('hidden');
        }
    }
    
    /**
     * Assert a condition and log if false
     */
    assert(condition, message) {
        if (!condition) {
            this.error(`Assertion failed: ${message}`);
        }
    }
    
    /**
     * Time a function execution
     */
    time(label) {
        console.time(label);
    }
    
    /**
     * End timing and log result
     */
    timeEnd(label) {
        console.timeEnd(label);
    }
    
    /**
     * Create a try-catch wrapper for async functions
     */
    async wrapAsync(asyncFn, errorMessage = 'Async operation failed') {
        try {
            return await asyncFn();
        } catch (error) {
            this.error(`${errorMessage}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Module loading wrapper
     */
    async loadModule(moduleName, importFn) {
        try {
            this.setLoadingStatus(`Loading ${moduleName}...`);
            const module = await importFn();
            this.success(`${moduleName} loaded successfully`);
            return module;
        } catch (error) {
            this.error(`Failed to load ${moduleName}: ${error.message}`);
            throw error;
        }
    }
}

// Create and export singleton instance
const debug = new Debug();
export default debug;
