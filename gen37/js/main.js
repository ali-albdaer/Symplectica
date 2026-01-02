/**
 * Main Entry Point - Solar System Simulation
 * 
 * This file bootstraps the application and handles initial loading
 */

(function() {
    'use strict';
    
    Logger.info('Main', '=================================');
    Logger.info('Main', 'Solar System Simulation v1.0');
    Logger.info('Main', '=================================');
    
    /**
     * Check browser compatibility
     */
    function checkCompatibility() {
        const issues = [];
        
        // Check WebGL
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (!gl) {
            issues.push('WebGL is not supported');
        }
        
        // Check Pointer Lock API
        if (!document.body.requestPointerLock) {
            issues.push('Pointer Lock API not supported');
        }
        
        // Check requestAnimationFrame
        if (!window.requestAnimationFrame) {
            issues.push('requestAnimationFrame not supported');
        }
        
        // Check Three.js
        if (!window.THREE) {
            issues.push('Three.js failed to load');
        }
        
        return issues;
    }
    
    /**
     * Display compatibility error
     */
    function showCompatibilityError(issues) {
        const loadingStatus = document.getElementById('loading-status');
        const loadingDebug = document.getElementById('loading-debug-log');
        
        if (loadingStatus) {
            loadingStatus.textContent = 'Browser Compatibility Error';
            loadingStatus.style.color = '#e84118';
        }
        
        if (loadingDebug) {
            issues.forEach(issue => {
                const div = document.createElement('div');
                div.className = 'log-error';
                div.textContent = `[ERROR] ${issue}`;
                loadingDebug.appendChild(div);
            });
        }
    }
    
    /**
     * Initialize and start the application
     */
    function init() {
        Logger.info('Main', 'Checking browser compatibility...');
        
        const issues = checkCompatibility();
        
        if (issues.length > 0) {
            Logger.error('Main', 'Compatibility issues detected', issues);
            showCompatibilityError(issues);
            return;
        }
        
        Logger.info('Main', 'Browser compatibility OK');
        Logger.info('Main', 'Starting game...');
        
        // Start the game
        Game.start().catch(error => {
            Logger.error('Main', 'Failed to start game', error);
        });
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose for debugging
    window.SolarSystem = {
        Game: Game,
        Config: Config,
        PhysicsEngine: PhysicsEngine,
        EntityManager: EntityManager,
        Logger: Logger,
        
        // Convenience methods
        pause: () => Game.togglePause(),
        
        getPlayer: () => Game.getPlayer(),
        
        teleportToSun: function() {
            const player = Game.getPlayer();
            const sun = EntityManager.getSun();
            if (player && sun) {
                const pos = sun.physicsBody.position.clone();
                pos.x += sun.radius * 2;
                player.physicsBody.position.copy(pos);
                player.velocity.set(0, 0, sun.physicsBody.velocity.z);
                Logger.info('Debug', 'Teleported to Sun');
            }
        },
        
        teleportToPlanet: function(index = 0) {
            const player = Game.getPlayer();
            const planets = EntityManager.getPlanets();
            if (player && planets[index]) {
                const planet = planets[index];
                const pos = planet.getSpawnPosition(0, 0, 100);
                const vel = planet.getSurfaceVelocityAtPoint(pos);
                player.physicsBody.position.copy(pos);
                player.velocity.copy(vel);
                Logger.info('Debug', `Teleported to ${planet.name}`);
            }
        },
        
        setTimeScale: function(scale) {
            Config.PHYSICS.timeScale = scale;
            Logger.info('Debug', `Time scale set to ${scale}`);
        },
        
        logEnergy: function() {
            PhysicsEngine.logSystemState();
        }
    };
    
    Logger.info('Main', 'Debug interface available as window.SolarSystem');
})();
