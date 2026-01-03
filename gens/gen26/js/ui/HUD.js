/**
 * ============================================
 * HUD System
 * ============================================
 * 
 * Heads-up display showing performance metrics,
 * coordinates, and control hints.
 */

class HUD {
    constructor() {
        this.container = null;
        this.fpsElement = null;
        this.frameTimeElement = null;
        this.physicsTimeElement = null;
        this.positionElement = null;
        this.velocityElement = null;
        this.bodyElement = null;
        
        // Performance tracking
        this.frames = 0;
        this.lastFpsUpdate = 0;
        this.fps = 0;
        
        this.isVisible = true;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the HUD
     */
    init() {
        console.info('Initializing HUD...');
        
        try {
            this.container = document.getElementById('hud');
            this.fpsElement = document.getElementById('fps');
            this.frameTimeElement = document.getElementById('frame-time');
            this.physicsTimeElement = document.getElementById('physics-time');
            this.positionElement = document.getElementById('player-pos');
            this.velocityElement = document.getElementById('player-vel');
            this.bodyElement = document.getElementById('current-body');
            
            // Show HUD
            if (this.container) {
                this.container.classList.remove('hidden');
            }
            
            this.isInitialized = true;
            console.success('HUD initialized');
            
            return this;
            
        } catch (error) {
            console.error('Failed to initialize HUD: ' + error.message);
            throw error;
        }
    }
    
    /**
     * Update HUD display
     */
    update(deltaTime, player, physics, inputManager) {
        if (!this.isInitialized) return;
        
        // Handle toggle
        if (inputManager && inputManager.isKeyJustPressed('t')) {
            this.toggle();
        }
        
        if (!this.isVisible) return;
        
        // Update FPS counter
        this.frames++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastFpsUpdate = now;
            
            if (this.fpsElement) {
                this.fpsElement.textContent = this.fps;
            }
        }
        
        // Frame time
        if (this.frameTimeElement) {
            this.frameTimeElement.textContent = (deltaTime * 1000).toFixed(1);
        }
        
        // Physics time
        if (this.physicsTimeElement && physics) {
            this.physicsTimeElement.textContent = physics.lastUpdateTime.toFixed(1);
        }
        
        // Player info
        if (player) {
            if (this.positionElement) {
                this.positionElement.textContent = player.getFormattedPosition();
            }
            
            if (this.velocityElement) {
                this.velocityElement.textContent = player.getFormattedVelocity();
            }
            
            if (this.bodyElement) {
                const bodyName = player.currentBody ? player.currentBody.name : 'None';
                const mode = player.isFlying ? ' (Flying)' : (player.isGrounded ? ' (Grounded)' : ' (Falling)');
                this.bodyElement.textContent = bodyName + mode;
            }
        }
    }
    
    /**
     * Toggle HUD visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.container) {
            this.container.classList.toggle('hidden', !this.isVisible);
        }
    }
    
    /**
     * Show HUD
     */
    show() {
        this.isVisible = true;
        if (this.container) {
            this.container.classList.remove('hidden');
        }
    }
    
    /**
     * Hide HUD
     */
    hide() {
        this.isVisible = false;
        if (this.container) {
            this.container.classList.add('hidden');
        }
    }
}
