/**
 * Menu Manager - Handles cursor lock/unlock and menu states
 */

const MenuManager = (function() {
    'use strict';
    
    let isPointerLocked = false;
    let isAnyMenuOpen = false;
    let gameContainer = null;
    let crosshair = null;
    let controlsHelp = null;
    let helpVisible = false;
    
    // Track open menus
    const openMenus = new Set();
    
    /**
     * Handle pointer lock change
     */
    function onPointerLockChange() {
        isPointerLocked = document.pointerLockElement === gameContainer;
        
        Logger.debug('MenuManager', `Pointer lock: ${isPointerLocked}`);
        
        // Update crosshair visibility
        if (crosshair) {
            crosshair.classList.toggle('hidden', !isPointerLocked || isAnyMenuOpen);
        }
    }
    
    /**
     * Handle pointer lock error
     */
    function onPointerLockError() {
        Logger.error('MenuManager', 'Pointer lock failed');
    }
    
    return {
        /**
         * Initialize menu manager
         */
        init: function() {
            gameContainer = document.getElementById('game-container');
            crosshair = document.getElementById('crosshair');
            controlsHelp = document.getElementById('controls-help');
            
            // Setup pointer lock events
            document.addEventListener('pointerlockchange', onPointerLockChange);
            document.addEventListener('pointerlockerror', onPointerLockError);
            
            // Click to lock
            gameContainer.addEventListener('click', () => {
                if (!isPointerLocked && !isAnyMenuOpen) {
                    this.lockPointer();
                }
            });
            
            Logger.info('MenuManager', 'Menu manager initialized');
        },
        
        /**
         * Lock pointer for gameplay
         */
        lockPointer: function() {
            if (!isAnyMenuOpen && gameContainer) {
                gameContainer.requestPointerLock();
            }
        },
        
        /**
         * Unlock pointer for menus
         */
        unlockPointer: function() {
            document.exitPointerLock();
        },
        
        /**
         * Check if pointer is locked
         */
        isLocked: function() {
            return isPointerLocked;
        },
        
        /**
         * Register a menu as open
         */
        openMenu: function(menuId) {
            openMenus.add(menuId);
            isAnyMenuOpen = openMenus.size > 0;
            
            if (isAnyMenuOpen) {
                this.unlockPointer();
                if (crosshair) crosshair.classList.add('hidden');
            }
            
            Logger.debug('MenuManager', `Menu opened: ${menuId}`);
        },
        
        /**
         * Register a menu as closed
         */
        closeMenu: function(menuId) {
            openMenus.delete(menuId);
            isAnyMenuOpen = openMenus.size > 0;
            
            if (!isAnyMenuOpen) {
                this.lockPointer();
                if (crosshair) crosshair.classList.remove('hidden');
            }
            
            Logger.debug('MenuManager', `Menu closed: ${menuId}`);
        },
        
        /**
         * Close all menus
         */
        closeAllMenus: function() {
            openMenus.clear();
            isAnyMenuOpen = false;
            
            // Close developer console
            if (DeveloperConsole.isOpen()) {
                DeveloperConsole.close();
            }
            
            // Hide controls help
            if (controlsHelp) {
                controlsHelp.classList.add('hidden');
                helpVisible = false;
            }
            
            this.lockPointer();
            if (crosshair) crosshair.classList.remove('hidden');
        },
        
        /**
         * Toggle controls help
         */
        toggleControlsHelp: function() {
            helpVisible = !helpVisible;
            
            if (controlsHelp) {
                controlsHelp.classList.toggle('hidden', !helpVisible);
            }
            
            return helpVisible;
        },
        
        /**
         * Check if any menu is open
         */
        isMenuOpen: function() {
            return isAnyMenuOpen;
        },
        
        /**
         * Update crosshair state
         */
        setCrosshairInteract: function(isInteracting) {
            if (crosshair) {
                crosshair.classList.toggle('interact', isInteracting);
            }
        },
        
        /**
         * Show interaction prompt
         */
        showInteractionPrompt: function(show) {
            const prompt = document.getElementById('interaction-prompt');
            if (prompt) {
                prompt.classList.toggle('hidden', !show);
            }
        }
    };
})();

window.MenuManager = MenuManager;
