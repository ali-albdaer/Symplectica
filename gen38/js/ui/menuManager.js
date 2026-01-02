/**
 * Solar System Simulation - Menu Manager
 * =======================================
 * Handles cursor locking/unlocking and menu state.
 */

class MenuManagerClass {
    constructor() {
        this.menus = {
            devMenu: false,
            debugConsole: false,
            controlsHelp: false,
        };
        
        Logger.info('MenuManager created');
    }
    
    /**
     * Initialize menu manager
     */
    init() {
        // Set up debug console clear button
        const clearBtn = document.getElementById('clear-debug');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => Logger.clear());
        }
        
        // Initialize controls help visibility
        const controlsHelp = document.getElementById('controls-help');
        if (controlsHelp) {
            controlsHelp.classList.toggle('hidden', !Config.ui.controlsHelpVisible);
            this.menus.controlsHelp = Config.ui.controlsHelpVisible;
        }
        
        // Initialize mode indicator
        const modeIndicator = document.getElementById('mode-indicator');
        if (modeIndicator) {
            modeIndicator.classList.toggle('hidden', !Config.ui.modeIndicatorVisible);
        }
        
        Logger.success('MenuManager initialized');
    }
    
    /**
     * Handle key presses for menu toggling
     */
    handleKeyPress(key) {
        switch (key) {
            case 'Slash':
                // Developer menu toggle
                this.toggleDevMenu();
                break;
                
            case 'Backquote':
                // Debug console toggle
                this.toggleDebugConsole();
                break;
                
            case 'KeyP':
                // Performance/telemetry toggle
                this.toggleTelemetry();
                break;
                
            case 'KeyH':
                // Controls help toggle
                this.toggleControlsHelp();
                break;
                
            case 'Escape':
                // Close any open menu
                this.closeAllMenus();
                break;
        }
    }
    
    /**
     * Toggle developer menu
     */
    toggleDevMenu() {
        this.menus.devMenu = !this.menus.devMenu;
        
        if (typeof DevMenu !== 'undefined') {
            DevMenu.toggle();
        }
        
        this.updateCursorState();
    }
    
    /**
     * Toggle debug console
     */
    toggleDebugConsole() {
        this.menus.debugConsole = !this.menus.debugConsole;
        
        const debugConsole = document.getElementById('debug-console');
        if (debugConsole) {
            debugConsole.classList.toggle('hidden', !this.menus.debugConsole);
        }
        
        Config.ui.debugConsoleVisible = this.menus.debugConsole;
    }
    
    /**
     * Toggle telemetry display
     */
    toggleTelemetry() {
        if (typeof Telemetry !== 'undefined') {
            Telemetry.toggle();
        }
    }
    
    /**
     * Toggle controls help
     */
    toggleControlsHelp() {
        this.menus.controlsHelp = !this.menus.controlsHelp;
        
        const controlsHelp = document.getElementById('controls-help');
        if (controlsHelp) {
            controlsHelp.classList.toggle('hidden', !this.menus.controlsHelp);
        }
        
        Config.ui.controlsHelpVisible = this.menus.controlsHelp;
    }
    
    /**
     * Close all menus
     */
    closeAllMenus() {
        // Close dev menu
        if (this.menus.devMenu && typeof DevMenu !== 'undefined') {
            DevMenu.close();
            this.menus.devMenu = false;
        }
        
        // Close debug console
        if (this.menus.debugConsole) {
            const debugConsole = document.getElementById('debug-console');
            if (debugConsole) {
                debugConsole.classList.add('hidden');
            }
            this.menus.debugConsole = false;
        }
        
        this.updateCursorState();
    }
    
    /**
     * Check if any menu is open
     */
    isAnyMenuOpen() {
        return this.menus.devMenu || this.menus.debugConsole;
    }
    
    /**
     * Update cursor visibility based on menu state
     */
    updateCursorState() {
        const shouldShowCursor = this.isAnyMenuOpen();
        
        if (shouldShowCursor) {
            // Release pointer lock when menus are open
            if (typeof Input !== 'undefined') {
                Input.exitPointerLock();
            }
        }
    }
    
    /**
     * Show loading complete and hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        // Show game UI elements
        const crosshair = document.getElementById('crosshair');
        const modeIndicator = document.getElementById('mode-indicator');
        
        if (crosshair && Config.ui.crosshairVisible) {
            crosshair.classList.remove('hidden');
        }
        
        if (modeIndicator && Config.ui.modeIndicatorVisible) {
            modeIndicator.classList.remove('hidden');
        }
    }
    
    /**
     * Update loading progress
     */
    setLoadingProgress(progress, status) {
        Logger.setLoadingProgress(progress, status);
    }
}

// Global instance
const MenuManager = new MenuManagerClass();
