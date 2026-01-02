/**
 * ============================================
 * Main Entry Point
 * ============================================
 * 
 * Initializes and starts the Solar System Simulation.
 */

// Global engine reference
let engine = null;

/**
 * Initialize and start the application
 */
async function main() {
    try {
        // Check for WebGL support
        if (!checkWebGLSupport()) {
            showError('WebGL is not supported in your browser. Please use a modern browser with WebGL enabled.');
            return;
        }
        
        // Check for Three.js
        if (typeof THREE === 'undefined') {
            showError('Three.js failed to load. Please check your internet connection and refresh.');
            return;
        }
        
        console.info('Three.js version: ' + THREE.REVISION);
        
        // Create and initialize engine
        engine = new Engine();
        await engine.init();
        
        // Start the game loop
        engine.start();
        
    } catch (error) {
        console.error('Fatal error during initialization:', error);
        showError('Failed to initialize: ' + error.message);
    }
}

/**
 * Check for WebGL support
 */
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    } catch (e) {
        return false;
    }
}

/**
 * Show error message on screen
 */
function showError(message) {
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
        loadingStatus.textContent = 'ERROR: ' + message;
        loadingStatus.style.color = '#ff6b6b';
    }
    
    // Also show in debug log
    const debugContent = document.getElementById('debug-content');
    if (debugContent) {
        const entry = document.createElement('div');
        entry.className = 'debug-entry error';
        entry.textContent = `[ERROR] ${message}`;
        debugContent.appendChild(entry);
    }
}

/**
 * Handle page unload
 */
window.addEventListener('beforeunload', () => {
    if (engine) {
        engine.dispose();
    }
});

/**
 * Handle visibility change (pause when tab is hidden)
 */
document.addEventListener('visibilitychange', () => {
    if (engine && engine.isInitialized) {
        if (document.hidden) {
            // Tab is hidden - we keep running but could pause here
            // engine.togglePause();
        }
    }
});

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
