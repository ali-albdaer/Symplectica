/**
 * Telemetry - FPS, frame time, and coordinate display
 */

const Telemetry = (function() {
    'use strict';
    
    let isVisible = false;
    let overlayElement = null;
    let fpsElement = null;
    let frameTimeElement = null;
    let coordsElement = null;
    let velocityElement = null;
    let modeElement = null;
    
    // FPS calculation
    let frameCount = 0;
    let lastFpsTime = 0;
    let currentFps = 0;
    let frameTimes = [];
    const MAX_FRAME_SAMPLES = 60;
    
    return {
        /**
         * Initialize telemetry
         */
        init: function() {
            overlayElement = document.getElementById('telemetry-overlay');
            fpsElement = document.getElementById('fps-counter');
            frameTimeElement = document.getElementById('frame-time');
            coordsElement = document.getElementById('coordinates');
            velocityElement = document.getElementById('velocity-display');
            modeElement = document.getElementById('mode-display');
            
            Logger.info('Telemetry', 'Telemetry display initialized');
        },
        
        /**
         * Update telemetry data
         */
        update: function(deltaTime, playerController) {
            if (!isVisible) return;
            
            frameCount++;
            frameTimes.push(deltaTime * 1000);
            
            if (frameTimes.length > MAX_FRAME_SAMPLES) {
                frameTimes.shift();
            }
            
            const now = performance.now();
            if (now - lastFpsTime >= 500) {
                currentFps = Math.round(frameCount * 1000 / (now - lastFpsTime));
                frameCount = 0;
                lastFpsTime = now;
                
                // Average frame time
                const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
                
                // Update display
                this.updateDisplay(avgFrameTime, playerController);
            }
        },
        
        /**
         * Update the display elements
         */
        updateDisplay: function(avgFrameTime, playerController) {
            // FPS with color coding
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${currentFps}`;
                if (currentFps >= 55) {
                    fpsElement.style.color = 'var(--accent-green)';
                } else if (currentFps >= 30) {
                    fpsElement.style.color = 'var(--accent-yellow)';
                } else {
                    fpsElement.style.color = 'var(--accent-red)';
                }
            }
            
            // Frame time
            if (frameTimeElement) {
                frameTimeElement.textContent = `Frame: ${avgFrameTime.toFixed(2)} ms`;
            }
            
            // Player coordinates and velocity
            if (playerController && playerController.physicsBody) {
                const pos = playerController.physicsBody.position;
                const vel = playerController.getRelativeSpeed();
                
                if (coordsElement) {
                    // Show scaled position for readability
                    const scaledPos = Config.scalePosition({ x: pos.x, y: pos.y, z: pos.z });
                    coordsElement.textContent = `Pos: (${scaledPos.x.toFixed(2)}, ${scaledPos.y.toFixed(2)}, ${scaledPos.z.toFixed(2)})`;
                }
                
                if (velocityElement) {
                    velocityElement.textContent = `Vel: ${vel.toFixed(1)} m/s`;
                }
                
                if (modeElement) {
                    const mode = playerController.isFlying ? 'Flying' : 'Walking';
                    const grounded = playerController.isGrounded ? ' (Grounded)' : '';
                    modeElement.textContent = `Mode: ${mode}${grounded}`;
                }
            }
        },
        
        /**
         * Toggle visibility
         */
        toggle: function() {
            isVisible = !isVisible;
            
            if (overlayElement) {
                overlayElement.classList.toggle('hidden', !isVisible);
            }
            
            Logger.debug('Telemetry', `Telemetry display: ${isVisible ? 'ON' : 'OFF'}`);
            return isVisible;
        },
        
        /**
         * Show telemetry
         */
        show: function() {
            isVisible = true;
            if (overlayElement) {
                overlayElement.classList.remove('hidden');
            }
        },
        
        /**
         * Hide telemetry
         */
        hide: function() {
            isVisible = false;
            if (overlayElement) {
                overlayElement.classList.add('hidden');
            }
        },
        
        /**
         * Check if visible
         */
        isVisible: function() {
            return isVisible;
        },
        
        /**
         * Get current FPS
         */
        getFPS: function() {
            return currentFps;
        }
    };
})();

window.Telemetry = Telemetry;
