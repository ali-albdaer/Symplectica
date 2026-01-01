/**
 * Developer Menu - Real-time configuration editor
 */

import { DEV_MENU } from './config.js';

export class DeveloperMenu {
    constructor(input) {
        this.input = input;
        this.isOpen = false;
        this.currentTab = 'celestial';
        
        this.menuElement = document.getElementById('developer-menu');
        this.contentArea = document.getElementById('menu-content-area');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle menu with / key
        this.input.on('keyDown', (event) => {
            if (event.code === 'Slash') {
                event.preventDefault();
                this.toggle();
            }
        });
        
        // Tab buttons
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
        
        // Close button
        document.getElementById('close-dev-menu')?.addEventListener('click', () => {
            this.close();
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.menuElement.style.display = 'flex';
        this.input.exitPointerLock();
        this.renderCurrentTab();
    }

    close() {
        this.isOpen = false;
        this.menuElement.style.display = 'none';
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });
        
        this.renderCurrentTab();
    }

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'celestial':
                this.renderCelestialTab();
                break;
            case 'physics':
                this.renderPhysicsTab();
                break;
            case 'player':
                this.renderPlayerTab();
                break;
            case 'graphics':
                this.renderGraphicsTab();
                break;
        }
    }

    renderCelestialTab() {
        const config = window.CONFIG;
        
        this.contentArea.innerHTML = `
            ${this.createConfigGroup('Sun', config.SUN, [
                'mass', 'radius', 'rotationPeriod', 'luminosity', 'temperature'
            ])}
            ${this.createConfigGroup('Planet 1 (Terra)', config.PLANET_1, [
                'mass', 'radius', 'orbitRadius', 'orbitPeriod', 'rotationPeriod', 'axialTilt', 'surfaceGravity'
            ])}
            ${this.createConfigGroup('Planet 2 (Ares)', config.PLANET_2, [
                'mass', 'radius', 'orbitRadius', 'orbitPeriod', 'rotationPeriod', 'axialTilt', 'surfaceGravity'
            ])}
            ${this.createConfigGroup('Moon (Luna)', config.MOON, [
                'mass', 'radius', 'orbitRadius', 'orbitPeriod', 'rotationPeriod', 'surfaceGravity'
            ])}
        `;
        
        this.attachInputListeners();
    }

    renderPhysicsTab() {
        const config = window.CONFIG;
        
        this.contentArea.innerHTML = `
            ${this.createConfigGroup('Physics Constants', config.PHYSICS, [
                'gravitationalConstant', 'timeStep', 'gravityMultiplier', 'damping', 'airResistance', 'groundFriction'
            ])}
            ${this.createConfigGroup('Scale Factors', config.SCALE, [
                'distance', 'size', 'time', 'gravity'
            ])}
        `;
        
        this.attachInputListeners();
    }

    renderPlayerTab() {
        const config = window.CONFIG;
        
        this.contentArea.innerHTML = `
            ${this.createConfigGroup('Movement', config.PLAYER, [
                'walkSpeed', 'runSpeed', 'jumpForce', 'mouseSensitivity'
            ])}
            ${this.createConfigGroup('Flight Mode', config.PLAYER, [
                'flightSpeed', 'flightAcceleration', 'flightMaxSpeed'
            ])}
            ${this.createConfigGroup('Camera', config.PLAYER, [
                'thirdPersonDistance', 'thirdPersonHeight', 'cameraSmoothing', 'cameraLookAhead'
            ])}
        `;
        
        this.attachInputListeners();
    }

    renderGraphicsTab() {
        const config = window.CONFIG;
        
        this.contentArea.innerHTML = `
            ${this.createConfigGroup('Rendering', config.GRAPHICS, [
                'shadowMapSize', 'particleCount', 'renderDistance', 'maxFPS'
            ])}
            ${this.createConfigGroup('Shadow Settings', config.GRAPHICS, [
                'shadowBias', 'shadowRadius', 'shadowCameraNear', 'shadowCameraFar'
            ])}
            ${this.createConfigGroup('Lighting', config.LIGHTING.ambient, [
                'intensity'
            ], 'Ambient Light')}
        `;
        
        this.attachInputListeners();
    }

    createConfigGroup(title, configObject, properties, customTitle = null) {
        const items = properties.map(prop => {
            const value = configObject[prop];
            const displayValue = typeof value === 'number' ? value.toExponential ? value : value : value;
            
            return `
                <div class="config-item">
                    <label>${this.formatPropertyName(prop)}</label>
                    <input type="text" 
                           data-config="${title}" 
                           data-property="${prop}" 
                           value="${displayValue}"
                           placeholder="${displayValue}">
                </div>
            `;
        }).join('');
        
        return `
            <div class="config-group">
                <h3>${customTitle || title}</h3>
                ${items}
            </div>
        `;
    }

    formatPropertyName(name) {
        return name
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    attachInputListeners() {
        const inputs = this.contentArea.querySelectorAll('input');
        
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateConfig(
                    e.target.dataset.config,
                    e.target.dataset.property,
                    e.target.value
                );
            });
        });
    }

    updateConfig(configName, property, value) {
        try {
            // Parse value
            let parsedValue;
            if (!isNaN(value)) {
                parsedValue = parseFloat(value);
            } else {
                parsedValue = value;
            }
            
            // Find and update the config
            const config = window.CONFIG;
            
            // Search through all config objects
            for (const key in config) {
                if (config[key].name === configName || key === configName) {
                    config[key][property] = parsedValue;
                    console.log(`Updated ${configName}.${property} = ${parsedValue}`);
                    break;
                }
            }
            
            // Save to localStorage if enabled
            if (DEV_MENU.saveToLocalStorage) {
                localStorage.setItem('solarSystemConfig', JSON.stringify(config));
            }
        } catch (error) {
            console.error('Failed to update config:', error);
        }
    }

    loadSavedConfig() {
        if (DEV_MENU.saveToLocalStorage) {
            const saved = localStorage.getItem('solarSystemConfig');
            if (saved) {
                try {
                    const config = JSON.parse(saved);
                    Object.assign(window.CONFIG, config);
                    console.log('Loaded saved configuration');
                } catch (error) {
                    console.error('Failed to load saved config:', error);
                }
            }
        }
    }
}
