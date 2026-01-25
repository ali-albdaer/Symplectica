/**
 * UI Manager
 * Handles HUD, developer menu, and all UI interactions
 */

import { Config, CELESTIAL_BODIES, GRAPHICS, PHYSICS, PLAYER, PERFORMANCE } from './config.js';

export class UIManager {
    constructor() {
        // UI Elements
        this.elements = {
            hud: null,
            devMenu: null,
            performanceMetrics: null,
            loadingScreen: null,
            startScreen: null,
            crosshair: null
        };
        
        this.devMenuOpen = false;
        this.metricsVisible = false;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.fps = 0;
    }
    
    /**
     * Initialize UI
     */
    initialize() {
        this.cacheElements();
        this.setupDevMenu();
        this.setupEventListeners();
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            hud: document.getElementById('hud'),
            devMenu: document.getElementById('dev-menu'),
            performanceMetrics: document.getElementById('performance-metrics'),
            loadingScreen: document.getElementById('loading-screen'),
            startScreen: document.getElementById('start-screen'),
            crosshair: document.getElementById('crosshair'),
            
            // HUD elements
            position: document.getElementById('position'),
            velocity: document.getElementById('velocity'),
            currentBody: document.getElementById('current-body'),
            flightMode: document.getElementById('flight-mode'),
            
            // Performance
            fps: document.getElementById('fps'),
            frameTime: document.getElementById('frame-time'),
            physicsTime: document.getElementById('physics-time'),
            renderTime: document.getElementById('render-time'),
            gpuMemory: document.getElementById('gpu-memory'),
            drawCalls: document.getElementById('draw-calls'),
            
            // Loading
            loadingBar: document.getElementById('loading-bar'),
            loadingStatus: document.getElementById('loading-status'),
            
            // Dev menu elements
            bodiesList: document.getElementById('bodies-list'),
            timeScale: document.getElementById('time-scale'),
            timeScaleValue: document.getElementById('time-scale-value'),
            gConstant: document.getElementById('g-constant'),
            physicsSteps: document.getElementById('physics-steps'),
            physicsStepsValue: document.getElementById('physics-steps-value'),
            qualityPreset: document.getElementById('quality-preset'),
            shadowQuality: document.getElementById('shadow-quality'),
            atmosphereQuality: document.getElementById('atmosphere-quality'),
            bloomEnabled: document.getElementById('bloom-enabled'),
            aaQuality: document.getElementById('aa-quality'),
            starDensity: document.getElementById('star-density'),
            starDensityValue: document.getElementById('star-density-value'),
            walkSpeed: document.getElementById('walk-speed'),
            runSpeed: document.getElementById('run-speed'),
            jumpForce: document.getElementById('jump-force'),
            flightSpeed: document.getElementById('flight-speed'),
            mouseSensitivity: document.getElementById('mouse-sensitivity'),
            mouseSensitivityValue: document.getElementById('mouse-sensitivity-value'),
            tpDistance: document.getElementById('tp-distance'),
            tpDistanceValue: document.getElementById('tp-distance-value')
        };
    }
    
    /**
     * Setup developer menu
     */
    setupDevMenu() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Close button
        const closeBtn = document.getElementById('dev-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleDevMenu());
        }
        
        // Populate celestial bodies list
        this.populateBodiesList();
        
        // Setup all controls
        this.setupDevControls();
    }
    
    /**
     * Switch dev menu tab
     */
    switchTab(tabId) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
    }
    
    /**
     * Populate celestial bodies list in dev menu
     */
    populateBodiesList() {
        const container = this.elements.bodiesList;
        if (!container) return;
        
        container.innerHTML = '';
        
        for (const [id, body] of Object.entries(CELESTIAL_BODIES)) {
            const section = document.createElement('div');
            section.className = 'body-section';
            section.innerHTML = `
                <h3>${body.name} (${body.type})</h3>
                <div class="body-controls">
                    <div class="control-row">
                        <label>Mass (kg)</label>
                        <input type="number" data-body="${id}" data-prop="mass" value="${body.mass}" step="1e20">
                    </div>
                    <div class="control-row">
                        <label>Radius (km)</label>
                        <input type="number" data-body="${id}" data-prop="radius" value="${body.radius}" step="100">
                    </div>
                    <div class="control-row">
                        <label>Rotation Period (days)</label>
                        <input type="number" data-body="${id}" data-prop="rotationPeriod" value="${body.rotationPeriod}" step="0.1">
                    </div>
                    ${body.orbitalPeriod ? `
                    <div class="control-row">
                        <label>Orbital Period (days)</label>
                        <input type="number" data-body="${id}" data-prop="orbitalPeriod" value="${body.orbitalPeriod}" step="1">
                    </div>
                    ` : ''}
                    ${body.hasAtmosphere ? `
                    <div class="control-row">
                        <label>Atmosphere Height (km)</label>
                        <input type="number" data-body="${id}" data-prop="atmosphereHeight" value="${body.atmosphereHeight || 0}" step="10">
                    </div>
                    ` : ''}
                </div>
            `;
            container.appendChild(section);
        }
        
        // Add event listeners to body controls
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', (e) => {
                const bodyId = e.target.dataset.body;
                const prop = e.target.dataset.prop;
                const value = parseFloat(e.target.value);
                Config.updateCelestialBody(bodyId, prop, value);
            });
        });
    }
    
    /**
     * Setup dev menu control bindings
     */
    setupDevControls() {
        // Time scale
        this.bindRangeControl('time-scale', 'time-scale-value', (v) => {
            PHYSICS.TIME_SCALE = v;
            return `${v}x`;
        });
        
        // G constant
        if (this.elements.gConstant) {
            this.elements.gConstant.addEventListener('change', (e) => {
                PHYSICS.G = parseFloat(e.target.value) * 1e-11;
            });
        }
        
        // Physics steps
        this.bindRangeControl('physics-steps', 'physics-steps-value', (v) => {
            PHYSICS.PHYSICS_STEPS = v;
            return v;
        });
        
        // Quality preset
        if (this.elements.qualityPreset) {
            this.elements.qualityPreset.addEventListener('change', (e) => {
                Config.applyQualityPreset(e.target.value);
            });
        }
        
        // Shadow quality
        if (this.elements.shadowQuality) {
            this.elements.shadowQuality.addEventListener('change', (e) => {
                GRAPHICS.shadows.quality = e.target.value;
                GRAPHICS.shadows.enabled = e.target.value !== 'off';
            });
        }
        
        // Atmosphere quality
        if (this.elements.atmosphereQuality) {
            this.elements.atmosphereQuality.addEventListener('change', (e) => {
                GRAPHICS.atmosphere.quality = e.target.value;
                GRAPHICS.atmosphere.enabled = e.target.value !== 'off';
            });
        }
        
        // Bloom
        if (this.elements.bloomEnabled) {
            this.elements.bloomEnabled.addEventListener('change', (e) => {
                GRAPHICS.bloom.enabled = e.target.checked;
            });
        }
        
        // Star density
        this.bindRangeControl('star-density', 'star-density-value', (v) => {
            return v;
        });
        
        // Player controls
        if (this.elements.walkSpeed) {
            this.elements.walkSpeed.addEventListener('change', (e) => {
                PLAYER.WALK_SPEED = parseFloat(e.target.value);
            });
        }
        
        if (this.elements.runSpeed) {
            this.elements.runSpeed.addEventListener('change', (e) => {
                PLAYER.RUN_SPEED = parseFloat(e.target.value);
            });
        }
        
        if (this.elements.jumpForce) {
            this.elements.jumpForce.addEventListener('change', (e) => {
                PLAYER.JUMP_FORCE = parseFloat(e.target.value);
            });
        }
        
        if (this.elements.flightSpeed) {
            this.elements.flightSpeed.addEventListener('change', (e) => {
                PLAYER.FLIGHT_SPEED = parseFloat(e.target.value);
            });
        }
        
        // Mouse sensitivity
        this.bindRangeControl('mouse-sensitivity', 'mouse-sensitivity-value', (v) => {
            PLAYER.MOUSE_SENSITIVITY = v * 0.004;
            return v;
        });
        
        // Third person distance
        this.bindRangeControl('tp-distance', 'tp-distance-value', (v) => {
            return v;
        });
    }
    
    /**
     * Bind a range control to a value display
     */
    bindRangeControl(inputId, valueId, callback) {
        const input = document.getElementById(inputId);
        const valueDisplay = document.getElementById(valueId);
        
        if (input && valueDisplay) {
            input.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const displayValue = callback(value);
                valueDisplay.textContent = displayValue;
            });
        }
    }
    
    /**
     * Setup keyboard event listeners
     */
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            // Toggle dev menu with /
            if (e.key === '/') {
                e.preventDefault();
                this.toggleDevMenu();
            }
            
            // Toggle performance metrics with F3
            if (e.key === 'F3') {
                e.preventDefault();
                this.togglePerformanceMetrics();
            }
        });
    }
    
    /**
     * Toggle developer menu
     */
    toggleDevMenu() {
        this.devMenuOpen = !this.devMenuOpen;
        
        if (this.elements.devMenu) {
            this.elements.devMenu.classList.toggle('hidden', !this.devMenuOpen);
        }
        
        // Unlock pointer when menu is open
        if (this.devMenuOpen) {
            document.exitPointerLock();
        }
    }
    
    /**
     * Toggle performance metrics display
     */
    togglePerformanceMetrics() {
        this.metricsVisible = !this.metricsVisible;
        PERFORMANCE.showMetrics = this.metricsVisible;
        
        if (this.elements.performanceMetrics) {
            this.elements.performanceMetrics.classList.toggle('hidden', !this.metricsVisible);
        }
    }
    
    /**
     * Update HUD with player state
     */
    updateHUD(playerState) {
        if (!playerState) return;
        
        if (this.elements.position) {
            const pos = playerState.position;
            this.elements.position.textContent = 
                `Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})`;
        }
        
        if (this.elements.velocity) {
            this.elements.velocity.textContent = 
                `Velocity: ${playerState.speed.toFixed(1)} m/s`;
        }
        
        if (this.elements.currentBody) {
            this.elements.currentBody.textContent = 
                `On: ${playerState.currentPlanet}`;
        }
        
        if (this.elements.flightMode) {
            const mode = playerState.isFlying ? 'Free Flight' : 
                        (playerState.isGrounded ? 'Walking' : 'Falling');
            this.elements.flightMode.textContent = `Mode: ${mode}`;
        }
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(metrics) {
        if (!this.metricsVisible) return;
        
        // Update FPS counter
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFPSUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = now;
        }
        
        if (this.elements.fps) {
            this.elements.fps.textContent = `FPS: ${this.fps}`;
        }
        
        if (this.elements.frameTime && metrics.frameTime !== undefined) {
            this.elements.frameTime.textContent = `Frame: ${metrics.frameTime.toFixed(2)}ms`;
        }
        
        if (this.elements.physicsTime && metrics.physicsTime !== undefined) {
            this.elements.physicsTime.textContent = `Physics: ${metrics.physicsTime}ms`;
        }
        
        if (this.elements.renderTime && metrics.renderTime !== undefined) {
            this.elements.renderTime.textContent = `Render: ${metrics.renderTime.toFixed(2)}ms`;
        }
        
        if (this.elements.drawCalls && metrics.drawCalls !== undefined) {
            this.elements.drawCalls.textContent = `Draw Calls: ${metrics.drawCalls}`;
        }
        
        if (this.elements.gpuMemory && metrics.memory !== undefined) {
            this.elements.gpuMemory.textContent = `GPU Mem: ${metrics.memory.toFixed(1)}MB`;
        }
    }
    
    /**
     * Update loading progress
     */
    updateLoadingProgress(progress, status) {
        if (this.elements.loadingBar) {
            this.elements.loadingBar.style.width = `${progress * 100}%`;
        }
        
        if (this.elements.loadingStatus) {
            this.elements.loadingStatus.textContent = status;
        }
    }
    
    /**
     * Hide loading screen and show start screen
     */
    showStartScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
        
        if (this.elements.startScreen) {
            this.elements.startScreen.classList.remove('hidden');
        }
    }
    
    /**
     * Hide start screen and show game
     */
    startGame(callback) {
        const startBtn = document.getElementById('start-button');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.elements.startScreen) {
                    this.elements.startScreen.classList.add('hidden');
                }
                
                if (this.elements.hud) {
                    this.elements.hud.classList.remove('hidden');
                }
                
                if (callback) callback();
            });
        }
    }
    
    /**
     * Show notification message
     */
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }
    
    /**
     * Check if dev menu is open
     */
    isDevMenuOpen() {
        return this.devMenuOpen;
    }
    
    /**
     * Cleanup
     */
    dispose() {
        // Remove event listeners if needed
    }
}

export default UIManager;
