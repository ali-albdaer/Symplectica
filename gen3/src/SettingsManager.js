/**
 * Settings Manager - Handles graphics settings and quality presets
 */

import { GRAPHICS } from './config.js';

export class SettingsManager {
    constructor(input, renderer, lightingSystem) {
        this.input = input;
        this.renderer = renderer;
        this.lightingSystem = lightingSystem;
        
        this.menuElement = document.getElementById('settings-menu');
        this.isOpen = false;
        
        this.setupEventListeners();
        this.loadSettings();
    }

    setupEventListeners() {
        // Toggle settings with ESC key
        this.input.on('keyDown', (event) => {
            if (event.code === 'Escape') {
                event.preventDefault();
                this.toggle();
            }
        });
        
        // Quality preset dropdown
        const qualityPreset = document.getElementById('quality-preset');
        qualityPreset?.addEventListener('change', (e) => {
            this.applyQualityPreset(e.target.value);
        });
        
        // Shadow quality
        const shadowQuality = document.getElementById('shadow-quality');
        shadowQuality?.addEventListener('change', (e) => {
            this.updateShadowQuality(e.target.value);
        });
        
        // View distance slider
        const viewDistance = document.getElementById('view-distance');
        const viewDistanceValue = document.getElementById('view-distance-value');
        viewDistance?.addEventListener('input', (e) => {
            viewDistanceValue.textContent = e.target.value;
        });
        
        // Apply button
        document.getElementById('apply-settings')?.addEventListener('click', () => {
            this.applySettings();
        });
        
        // Close button
        document.getElementById('close-settings')?.addEventListener('click', () => {
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
    }

    close() {
        this.isOpen = false;
        this.menuElement.style.display = 'none';
    }

    applyQualityPreset(preset) {
        const presetConfig = GRAPHICS.presets[preset];
        if (!presetConfig) return;
        
        GRAPHICS.currentPreset = preset;
        GRAPHICS.shadowMapSize = presetConfig.shadowMapSize;
        GRAPHICS.particleCount = presetConfig.particleCount;
        GRAPHICS.renderDistance = presetConfig.renderDistance;
        GRAPHICS.antialiasing = presetConfig.antialiasing;
        GRAPHICS.bloom = presetConfig.bloom;
        GRAPHICS.lensFlare = presetConfig.lensFlare;
        
        // Update UI to match preset
        document.getElementById('shadow-quality').value = 
            presetConfig.shadowMapSize >= 4096 ? 'ultra' :
            presetConfig.shadowMapSize >= 2048 ? 'high' :
            presetConfig.shadowMapSize >= 1024 ? 'medium' :
            presetConfig.shadowMapSize > 0 ? 'low' : 'disabled';
        
        document.getElementById('view-distance').value = presetConfig.renderDistance;
        document.getElementById('view-distance-value').textContent = presetConfig.renderDistance;
        
        console.log(`Applied ${preset} quality preset`);
    }

    updateShadowQuality(quality) {
        if (this.lightingSystem) {
            this.lightingSystem.updateShadowQuality(quality);
        }
    }

    applySettings() {
        const qualityPreset = document.getElementById('quality-preset').value;
        const shadowQuality = document.getElementById('shadow-quality').value;
        const particleQuality = document.getElementById('particle-quality').value;
        const viewDistance = parseInt(document.getElementById('view-distance').value);
        
        // Apply quality preset first
        this.applyQualityPreset(qualityPreset);
        
        // Override with custom settings
        this.updateShadowQuality(shadowQuality);
        GRAPHICS.renderDistance = viewDistance;
        
        // Update particle count based on particle quality
        const particleCounts = {
            'high': 10000,
            'medium': 5000,
            'low': 2000,
            'disabled': 0
        };
        GRAPHICS.particleCount = particleCounts[particleQuality];
        
        // Save settings
        this.saveSettings();
        
        console.log('Settings applied successfully');
        
        // Show notification (optional)
        this.showNotification('Settings applied! Some changes may require reload.');
    }

    saveSettings() {
        const settings = {
            preset: GRAPHICS.currentPreset,
            shadowMapSize: GRAPHICS.shadowMapSize,
            particleCount: GRAPHICS.particleCount,
            renderDistance: GRAPHICS.renderDistance,
            antialiasing: GRAPHICS.antialiasing,
            bloom: GRAPHICS.bloom,
            lensFlare: GRAPHICS.lensFlare
        };
        
        localStorage.setItem('solarSystemSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('solarSystemSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.assign(GRAPHICS, settings);
                
                // Update UI
                if (settings.preset) {
                    document.getElementById('quality-preset').value = settings.preset;
                }
                
                console.log('Loaded saved settings');
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
        }
    }

    showNotification(message) {
        // Simple notification (could be enhanced with better UI)
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(78, 205, 196, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.1em;
            z-index: 10000;
            animation: fadeInOut 3s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
