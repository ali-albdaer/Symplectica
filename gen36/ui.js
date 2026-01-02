/**
 * UI System
 * Handles all user interface elements, menus, and developer console
 */

class UISystem {
    constructor(game) {
        this.game = game;
        
        // UI Elements
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.loadingText = document.getElementById('loadingText');
        this.debugLog = document.getElementById('debugLog');
        this.debugLogContent = document.getElementById('debugLogContent');
        this.telemetry = document.getElementById('telemetry');
        this.settingsMenu = document.getElementById('settingsMenu');
        this.devConsole = document.getElementById('devConsole');
        this.devConsoleContent = document.getElementById('devConsoleContent');
        this.controlsHelp = document.getElementById('controlsHelp');
        
        // Telemetry update timers
        this.lastFPSUpdate = 0;
        this.lastTelemetryUpdate = 0;
        this.frameCount = 0;
        this.fps = 0;
        
        // Setup UI listeners
        this.setupUIListeners();
        
        // Initialize debug log
        if (CONFIG.DEBUG.showDebugLog) {
            this.debugLog.style.display = 'block';
        }
        
        // Redirect console to debug log
        this.setupConsoleRedirect();
    }

    setupUIListeners() {
        // Settings menu
        document.getElementById('closeSettings').addEventListener('click', () => {
            this.closeSettings();
        });
        
        document.getElementById('applySettings').addEventListener('click', () => {
            this.applySettings();
            this.closeSettings();
        });
        
        // Developer console
        document.getElementById('closeDevConsole').addEventListener('click', () => {
            this.closeDevConsole();
        });
        
        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            // Settings menu (Escape)
            if (e.code === 'Escape') {
                if (this.settingsMenu.style.display !== 'none') {
                    this.closeSettings();
                } else if (this.devConsole.style.display !== 'none') {
                    this.closeDevConsole();
                } else {
                    this.openSettings();
                }
            }
            
            // Developer console (/)
            if (e.code === 'Slash') {
                this.toggleDevConsole();
                e.preventDefault();
            }
            
            // Telemetry (T)
            if (e.code === 'KeyT') {
                this.toggleTelemetry();
            }
        });
    }

    setupConsoleRedirect() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.addDebugMessage(args.join(' '), 'info');
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.addDebugMessage(args.join(' '), 'error');
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.addDebugMessage(args.join(' '), 'warning');
        };
    }

    addDebugMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `debug-${type}`;
        messageDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.debugLogContent.appendChild(messageDiv);
        
        // Auto-scroll
        this.debugLogContent.scrollTop = this.debugLogContent.scrollHeight;
        
        // Limit messages
        while (this.debugLogContent.children.length > 100) {
            this.debugLogContent.removeChild(this.debugLogContent.firstChild);
        }
    }

    updateLoadingProgress(progress, text) {
        this.loadingProgress.style.width = `${progress * 100}%`;
        this.loadingText.textContent = text;
    }

    hideLoadingScreen() {
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 500);
    }

    openSettings() {
        this.settingsMenu.style.display = 'flex';
        if (this.game.cameraController) {
            this.game.cameraController.releasePointerLock();
        }
        document.body.style.cursor = 'default';
    }

    closeSettings() {
        this.settingsMenu.style.display = 'none';
        document.body.style.cursor = 'none';
        if (this.game.cameraController) {
            this.game.cameraController.requestPointerLock();
        }
    }

    applySettings() {
        // Get settings
        const quality = document.getElementById('qualitySelect').value;
        const shadowQuality = document.getElementById('shadowQuality').value;
        const enableLOD = document.getElementById('enableLOD').checked;
        const enableAntialiasing = document.getElementById('enableAntialiasing').checked;
        
        console.log(`Applying settings: Quality=${quality}, Shadows=${shadowQuality}, LOD=${enableLOD}`);
        
        // Update config
        CONFIG.RENDERING.defaultQuality = quality;
        CONFIG.RENDERING.enableLOD = enableLOD;
        
        // Apply graphics settings
        if (this.game.renderer) {
            const qualitySettings = CONFIG.RENDERING.qualities[quality];
            
            // Update renderer
            this.game.renderer.setPixelRatio(qualitySettings.pixelRatio);
            this.game.renderer.shadowMap.enabled = qualitySettings.shadows && shadowQuality !== 'disabled';
            
            // Update shadow quality
            if (this.game.sunLight) {
                switch(shadowQuality) {
                    case 'disabled':
                        this.game.sunLight.castShadow = false;
                        break;
                    case 'low':
                        this.game.sunLight.castShadow = true;
                        this.game.sunLight.shadow.mapSize.width = 512;
                        this.game.sunLight.shadow.mapSize.height = 512;
                        break;
                    case 'medium':
                        this.game.sunLight.castShadow = true;
                        this.game.sunLight.shadow.mapSize.width = 1024;
                        this.game.sunLight.shadow.mapSize.height = 1024;
                        break;
                    case 'high':
                        this.game.sunLight.castShadow = true;
                        this.game.sunLight.shadow.mapSize.width = 2048;
                        this.game.sunLight.shadow.mapSize.height = 2048;
                        break;
                }
                
                if (this.game.sunLight.castShadow) {
                    this.game.sunLight.shadow.needsUpdate = true;
                }
            }
        }
    }

    toggleDevConsole() {
        if (this.devConsole.style.display === 'none') {
            this.openDevConsole();
        } else {
            this.closeDevConsole();
        }
    }

    openDevConsole() {
        this.devConsole.style.display = 'flex';
        this.buildDevConsole();
        if (this.game.cameraController) {
            this.game.cameraController.releasePointerLock();
        }
        document.body.style.cursor = 'default';
    }

    closeDevConsole() {
        this.devConsole.style.display = 'none';
        document.body.style.cursor = 'none';
        if (this.game.cameraController) {
            this.game.cameraController.requestPointerLock();
        }
    }

    buildDevConsole() {
        this.devConsoleContent.innerHTML = '';
        
        // Create sections for each config category
        this.createConfigSection('Physics', CONFIG.PHYSICS);
        this.createConfigSection('Sun', CONFIG.SUN);
        this.createConfigSection('Planet 1', CONFIG.PLANET1);
        this.createConfigSection('Planet 2', CONFIG.PLANET2);
        this.createConfigSection('Moon 1', CONFIG.MOON1);
        this.createConfigSection('Player', CONFIG.PLAYER);
        this.createConfigSection('Camera', CONFIG.CAMERA);
        this.createConfigSection('Lighting', CONFIG.LIGHTING);
    }

    createConfigSection(title, configObj) {
        const section = document.createElement('div');
        section.className = 'config-section';
        
        const header = document.createElement('h4');
        header.textContent = title;
        section.appendChild(header);
        
        for (const [key, value] of Object.entries(configObj)) {
            // Skip complex objects
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) continue;
            if (typeof value === 'function') continue;
            
            const item = document.createElement('div');
            item.className = 'config-item';
            
            const label = document.createElement('label');
            label.textContent = key;
            item.appendChild(label);
            
            const input = document.createElement('input');
            input.type = 'number';
            input.value = value;
            input.step = 'any';
            input.dataset.configPath = title;
            input.dataset.configKey = key;
            
            input.addEventListener('change', (e) => {
                this.updateConfigValue(title, key, parseFloat(e.target.value));
            });
            
            item.appendChild(input);
            
            const unit = document.createElement('span');
            unit.className = 'unit';
            unit.textContent = this.getUnit(key);
            item.appendChild(unit);
            
            section.appendChild(item);
        }
        
        this.devConsoleContent.appendChild(section);
    }

    getUnit(key) {
        const units = {
            'mass': 'kg',
            'radius': 'm',
            'rotationPeriod': 's',
            'orbitalRadius': 'm',
            'luminosity': 'W',
            'temperature': 'K',
            'density': 'kg/m³',
            'walkSpeed': 'm/s',
            'flySpeed': 'm/s',
            'jumpForce': 'N',
            'GRAVITATIONAL_CONSTANT': 'm³/kg·s²',
            'TIME_SCALE': 'x',
            'height': 'm',
            'distance': 'm',
        };
        return units[key] || '';
    }

    updateConfigValue(section, key, value) {
        // Update config
        let configObj;
        switch(section) {
            case 'Physics': configObj = CONFIG.PHYSICS; break;
            case 'Sun': configObj = CONFIG.SUN; break;
            case 'Planet 1': configObj = CONFIG.PLANET1; break;
            case 'Planet 2': configObj = CONFIG.PLANET2; break;
            case 'Moon 1': configObj = CONFIG.MOON1; break;
            case 'Player': configObj = CONFIG.PLAYER; break;
            case 'Camera': configObj = CONFIG.CAMERA; break;
            case 'Lighting': configObj = CONFIG.LIGHTING; break;
            default: return;
        }
        
        if (configObj) {
            configObj[key] = value;
            console.log(`Updated ${section}.${key} = ${value}`);
            
            // Update physics if needed
            if (section === 'Physics') {
                if (this.game.physicsEngine) {
                    this.game.physicsEngine[key.charAt(0).toLowerCase() + key.slice(1)] = value;
                }
            }
        }
    }

    toggleTelemetry() {
        if (this.telemetry.style.display === 'none') {
            this.telemetry.style.display = 'block';
            CONFIG.UI.showTelemetry = true;
        } else {
            this.telemetry.style.display = 'none';
            CONFIG.UI.showTelemetry = false;
        }
    }

    update(dt, currentTime) {
        // Update FPS
        this.frameCount++;
        if (currentTime - this.lastFPSUpdate > CONFIG.UI.fpsUpdateRate) {
            this.fps = Math.round(this.frameCount / ((currentTime - this.lastFPSUpdate) / 1000));
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
            
            if (CONFIG.UI.showTelemetry) {
                document.getElementById('fps').textContent = this.fps;
            }
        }
        
        // Update telemetry
        if (CONFIG.UI.showTelemetry && currentTime - this.lastTelemetryUpdate > CONFIG.UI.telemetryUpdateRate) {
            this.updateTelemetryDisplay();
            this.lastTelemetryUpdate = currentTime;
        }
    }

    updateTelemetryDisplay() {
        if (!this.game.player) return;
        
        const pos = this.game.player.getPosition();
        const vel = this.game.player.getVelocity();
        
        document.getElementById('frameTime').textContent = 
            (1000 / Math.max(this.fps, 1)).toFixed(1);
        
        document.getElementById('position').textContent = 
            `${(pos.x / 1e6).toFixed(1)}, ${(pos.y / 1e6).toFixed(1)}, ${(pos.z / 1e6).toFixed(1)}`;
        
        const velMag = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        document.getElementById('velocity').textContent = 
            `${velMag.toFixed(1)} m/s`;
        
        const onSurface = this.game.player.currentPlanet 
            ? this.game.player.currentPlanet.name 
            : 'None';
        document.getElementById('onSurface').textContent = onSurface;
    }
}
