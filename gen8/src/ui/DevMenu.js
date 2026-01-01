/**
 * DevMenu.js
 * Developer menu for real-time configuration changes.
 * Press "/" to toggle the menu.
 */

import { 
    configManager, 
    PHYSICS, 
    PLAYER, 
    CAMERA, 
    DEBUG,
    QUALITY_PRESETS,
    CELESTIAL_BODIES 
} from '../config/GlobalConfig.js';
import { DebugLogger, loggerSystem, LogLevel } from '../utils/DebugLogger.js';

const logger = new DebugLogger('DevMenu');

export class DevMenu {
    constructor(game) {
        this.game = game;
        this.isVisible = false;
        this.activeSection = 'physics';
        
        this.sections = {
            physics: { name: 'Physics', config: PHYSICS },
            player: { name: 'Player', config: PLAYER },
            camera: { name: 'Camera', config: CAMERA },
            debug: { name: 'Debug', config: DEBUG },
            bodies: { name: 'Celestial Bodies', config: null },
            quality: { name: 'Quality', config: null },
        };
        
        this.createUI();
        this.setupInput();
        
        logger.info('Developer menu initialized');
    }

    createUI() {
        // Main container
        this.container = document.createElement('div');
        this.container.id = 'dev-menu';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 90vh;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #444;
            border-radius: 8px;
            color: #fff;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 12px;
            z-index: 10000;
            display: none;
            overflow: hidden;
        `;
        
        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px;
            background: #222;
            border-bottom: 1px solid #444;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <span style="font-weight: bold; color: #4a9eff;">⚙️ Developer Menu</span>
            <span style="color: #666;">Press / to close</span>
        `;
        this.container.appendChild(header);
        
        // Tab navigation
        this.tabContainer = document.createElement('div');
        this.tabContainer.style.cssText = `
            display: flex;
            background: #1a1a1a;
            border-bottom: 1px solid #444;
            overflow-x: auto;
        `;
        this.container.appendChild(this.tabContainer);
        
        // Content area
        this.contentArea = document.createElement('div');
        this.contentArea.style.cssText = `
            padding: 10px;
            max-height: 70vh;
            overflow-y: auto;
        `;
        this.container.appendChild(this.contentArea);
        
        // Create tabs
        for (const [key, section] of Object.entries(this.sections)) {
            const tab = document.createElement('button');
            tab.textContent = section.name;
            tab.dataset.section = key;
            tab.style.cssText = `
                padding: 8px 12px;
                background: transparent;
                border: none;
                color: #888;
                cursor: pointer;
                white-space: nowrap;
            `;
            tab.addEventListener('click', () => this.switchSection(key));
            this.tabContainer.appendChild(tab);
        }
        
        document.body.appendChild(this.container);
        
        // Initial render
        this.switchSection('physics');
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
        logger.info(`Dev menu ${this.isVisible ? 'opened' : 'closed'}`);
    }

    switchSection(sectionKey) {
        this.activeSection = sectionKey;
        
        // Update tab styles
        const tabs = this.tabContainer.querySelectorAll('button');
        tabs.forEach(tab => {
            const isActive = tab.dataset.section === sectionKey;
            tab.style.background = isActive ? '#333' : 'transparent';
            tab.style.color = isActive ? '#4a9eff' : '#888';
            tab.style.borderBottom = isActive ? '2px solid #4a9eff' : 'none';
        });
        
        // Render section content
        this.renderSection(sectionKey);
    }

    renderSection(sectionKey) {
        this.contentArea.innerHTML = '';
        
        switch (sectionKey) {
            case 'physics':
            case 'player':
            case 'camera':
            case 'debug':
                this.renderConfigSection(sectionKey);
                break;
            case 'bodies':
                this.renderBodiesSection();
                break;
            case 'quality':
                this.renderQualitySection();
                break;
        }
    }

    renderConfigSection(sectionKey) {
        const section = this.sections[sectionKey];
        const config = section.config;
        
        for (const [key, value] of Object.entries(config)) {
            const row = this.createConfigRow(sectionKey.toUpperCase(), key, value);
            this.contentArea.appendChild(row);
        }
    }

    createConfigRow(prefix, key, value) {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 0;
            border-bottom: 1px solid #333;
        `;
        
        const label = document.createElement('span');
        label.textContent = key;
        label.style.color = '#aaa';
        row.appendChild(label);
        
        const path = `${prefix}.${key}`;
        
        if (typeof value === 'boolean') {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = value;
            checkbox.addEventListener('change', () => {
                configManager.set(path, checkbox.checked);
            });
            row.appendChild(checkbox);
        } else if (typeof value === 'number') {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = value;
            input.style.cssText = `
                width: 120px;
                background: #333;
                border: 1px solid #555;
                color: #fff;
                padding: 4px;
                border-radius: 3px;
            `;
            input.addEventListener('change', () => {
                const newValue = parseFloat(input.value);
                if (!isNaN(newValue)) {
                    configManager.set(path, newValue);
                }
            });
            row.appendChild(input);
        } else if (typeof value === 'string') {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.style.cssText = `
                width: 120px;
                background: #333;
                border: 1px solid #555;
                color: #fff;
                padding: 4px;
                border-radius: 3px;
            `;
            input.addEventListener('change', () => {
                configManager.set(path, input.value);
            });
            row.appendChild(input);
        } else if (typeof value === 'object' && value !== null) {
            const display = document.createElement('span');
            display.textContent = JSON.stringify(value).substring(0, 30) + '...';
            display.style.color = '#666';
            row.appendChild(display);
        }
        
        return row;
    }

    renderBodiesSection() {
        for (const [key, body] of Object.entries(CELESTIAL_BODIES)) {
            const section = document.createElement('div');
            section.style.cssText = `
                margin-bottom: 15px;
                padding: 10px;
                background: #222;
                border-radius: 4px;
            `;
            
            const header = document.createElement('div');
            header.style.cssText = `
                font-weight: bold;
                color: #4a9eff;
                margin-bottom: 8px;
            `;
            header.textContent = `${body.name} (${body.type})`;
            section.appendChild(header);
            
            const info = document.createElement('div');
            info.style.color = '#888';
            info.innerHTML = `
                <div>Mass: ${body.mass.toExponential(2)} kg</div>
                <div>Radius: ${body.radius.toLocaleString()} km</div>
                <div>Rotation: ${(body.rotationPeriod / 3600).toFixed(1)} hours</div>
            `;
            section.appendChild(info);
            
            // Add edit buttons for key parameters
            if (body.type !== 'star') {
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit Orbit';
                editBtn.style.cssText = `
                    margin-top: 8px;
                    padding: 4px 8px;
                    background: #444;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    border-radius: 3px;
                `;
                editBtn.addEventListener('click', () => this.showOrbitEditor(key, body));
                section.appendChild(editBtn);
            }
            
            this.contentArea.appendChild(section);
        }
    }

    renderQualitySection() {
        const presets = ['low', 'medium', 'high'];
        
        const presetContainer = document.createElement('div');
        presetContainer.style.cssText = `
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        `;
        
        presets.forEach(preset => {
            const btn = document.createElement('button');
            btn.textContent = preset.charAt(0).toUpperCase() + preset.slice(1);
            btn.style.cssText = `
                flex: 1;
                padding: 10px;
                background: #333;
                border: 1px solid #555;
                color: #fff;
                cursor: pointer;
                border-radius: 4px;
            `;
            btn.addEventListener('click', () => {
                if (this.game.setQualityPreset) {
                    this.game.setQualityPreset(preset);
                }
                logger.info(`Quality preset set to: ${preset}`);
            });
            presetContainer.appendChild(btn);
        });
        
        this.contentArea.appendChild(presetContainer);
        
        // Show current settings
        const currentSettings = QUALITY_PRESETS.medium; // Default
        for (const [key, value] of Object.entries(currentSettings)) {
            const row = document.createElement('div');
            row.style.cssText = `
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                border-bottom: 1px solid #333;
            `;
            row.innerHTML = `
                <span style="color: #aaa">${key}</span>
                <span style="color: #fff">${value}</span>
            `;
            this.contentArea.appendChild(row);
        }
    }

    showOrbitEditor(key, body) {
        // Simple modal for editing orbital parameters
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a1a;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #555;
            z-index: 10001;
        `;
        
        modal.innerHTML = `
            <h3 style="color: #4a9eff; margin: 0 0 15px 0;">Edit ${body.name} Orbit</h3>
            <div style="margin-bottom: 10px">
                <label style="display: block; color: #aaa; margin-bottom: 5px">Orbital Radius (km)</label>
                <input type="number" id="orbit-radius" value="${body.orbitalRadius || 0}" style="width: 100%; padding: 5px; background: #333; border: 1px solid #555; color: #fff">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px">
                <button id="orbit-save" style="flex: 1; padding: 8px; background: #4a9eff; border: none; color: #fff; cursor: pointer; border-radius: 4px">Apply</button>
                <button id="orbit-cancel" style="flex: 1; padding: 8px; background: #444; border: none; color: #fff; cursor: pointer; border-radius: 4px">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#orbit-cancel').addEventListener('click', () => modal.remove());
        modal.querySelector('#orbit-save').addEventListener('click', () => {
            const newRadius = parseFloat(modal.querySelector('#orbit-radius').value);
            if (!isNaN(newRadius)) {
                // This would require recalculating the orbit - simplified for now
                logger.info(`Orbit radius change requested: ${newRadius} km`);
            }
            modal.remove();
        });
    }

    update() {
        // Could update live values if needed
    }
}
