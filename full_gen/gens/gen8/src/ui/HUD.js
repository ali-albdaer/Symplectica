/**
 * HUD.js
 * Main game HUD showing crosshair, info panels, and controls.
 */

import { UI, PHYSICS } from '../config/GlobalConfig.js';

export class HUD {
    constructor(game) {
        this.game = game;
        this.isVisible = true;
        
        this.createUI();
        this.setupInput();
    }

    createUI() {
        // Crosshair
        this.crosshair = document.createElement('div');
        this.crosshair.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            pointer-events: none;
            z-index: 9998;
        `;
        this.crosshair.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="3" stroke="white" stroke-width="1" fill="none" opacity="0.8"/>
                <line x1="10" y1="0" x2="10" y2="6" stroke="white" stroke-width="1" opacity="0.6"/>
                <line x1="10" y1="14" x2="10" y2="20" stroke="white" stroke-width="1" opacity="0.6"/>
                <line x1="0" y1="10" x2="6" y2="10" stroke="white" stroke-width="1" opacity="0.6"/>
                <line x1="14" y1="10" x2="20" y2="10" stroke="white" stroke-width="1" opacity="0.6"/>
            </svg>
        `;
        document.body.appendChild(this.crosshair);
        
        // Info panel (bottom right)
        this.infoPanel = document.createElement('div');
        this.infoPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-family: 'Segoe UI', sans-serif;
            font-size: 13px;
            padding: 15px;
            border-radius: 8px;
            z-index: 9997;
            min-width: 180px;
        `;
        document.body.appendChild(this.infoPanel);
        
        // Time control panel (top center)
        this.timePanel = document.createElement('div');
        this.timePanel.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.6);
            color: #fff;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 9997;
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        document.body.appendChild(this.timePanel);
        
        // Controls help (bottom left)
        this.controlsPanel = document.createElement('div');
        this.controlsPanel.id = 'controls-help';
        this.controlsPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.6);
            color: #888;
            font-family: 'Segoe UI', sans-serif;
            font-size: 11px;
            padding: 10px 15px;
            border-radius: 8px;
            z-index: 9997;
            line-height: 1.6;
        `;
        this.controlsPanel.innerHTML = `
            <div style="color: #fff; margin-bottom: 5px; font-weight: bold;">Controls</div>
            <div><span style="color: #4a9eff">WASD</span> Move</div>
            <div><span style="color: #4a9eff">Mouse</span> Look</div>
            <div><span style="color: #4a9eff">Space</span> Jump / Up</div>
            <div><span style="color: #4a9eff">Shift</span> Run / Down</div>
            <div><span style="color: #4a9eff">INS</span> Toggle Flight</div>
            <div><span style="color: #4a9eff">V</span> Camera View</div>
            <div><span style="color: #4a9eff">[ ]</span> Time Speed</div>
            <div><span style="color: #4a9eff">P</span> Pause</div>
            <div><span style="color: #4a9eff">/</span> Dev Menu</div>
            <div><span style="color: #4a9eff">F3</span> Debug</div>
        `;
        document.body.appendChild(this.controlsPanel);
        
        // Notification area
        this.notificationArea = document.createElement('div');
        this.notificationArea.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9996;
        `;
        document.body.appendChild(this.notificationArea);
    }

    setupInput() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyH') {
                this.toggleVisibility();
            }
        });
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        const display = this.isVisible ? 'block' : 'none';
        this.infoPanel.style.display = display;
        this.timePanel.style.display = this.isVisible ? 'flex' : 'none';
        this.controlsPanel.style.display = display;
    }

    showNotification(message, duration = 3000, type = 'info') {
        const notification = document.createElement('div');
        
        let bgColor = 'rgba(0, 100, 200, 0.8)';
        if (type === 'warning') bgColor = 'rgba(200, 150, 0, 0.8)';
        if (type === 'error') bgColor = 'rgba(200, 50, 50, 0.8)';
        if (type === 'success') bgColor = 'rgba(50, 180, 50, 0.8)';
        
        notification.style.cssText = `
            background: ${bgColor};
            color: #fff;
            padding: 10px 20px;
            border-radius: 4px;
            margin-bottom: 5px;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            animation: fadeIn 0.3s ease;
        `;
        notification.textContent = message;
        
        this.notificationArea.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    update(deltaTime) {
        if (!this.isVisible) return;
        
        // Update info panel
        if (this.game.player && this.game.solarSystem) {
            const playerInfo = this.game.player.getDebugInfo();
            const nearestBody = this.game.solarSystem.getNearestBody(this.game.player.position);
            
            this.infoPanel.innerHTML = `
                <div style="color: #4a9eff; font-weight: bold; margin-bottom: 8px;">
                    📍 ${nearestBody.body?.name || 'Space'}
                </div>
                <div>Altitude: ${this.formatDistance(playerInfo.altitude)}</div>
                <div>Speed: ${this.formatSpeed(playerInfo.speed)}</div>
                <div style="margin-top: 5px; color: #888; font-size: 11px;">
                    ${playerInfo.isFreeFlightMode ? '🚀 Free Flight' : 
                      playerInfo.isGrounded ? '🚶 Walking' : '⬇️ Falling'}
                </div>
            `;
        }
        
        // Update time panel
        if (this.game.physics) {
            const metrics = this.game.physics.getMetrics();
            const isPaused = metrics.isPaused;
            
            this.timePanel.innerHTML = `
                <span style="color: ${isPaused ? '#ff4444' : '#4aff4a'}">
                    ${isPaused ? '⏸ PAUSED' : '▶'}
                </span>
                <span>Time: ${metrics.timeScale.toFixed(1)}x</span>
                <span style="color: #888">|</span>
                <span>${metrics.formattedTime}</span>
            `;
        }
    }

    formatDistance(km) {
        if (km < 1) {
            return `${(km * 1000).toFixed(0)} m`;
        } else if (km < 1000) {
            return `${km.toFixed(2)} km`;
        } else if (km < 1000000) {
            return `${(km / 1000).toFixed(2)} thousand km`;
        } else {
            return `${(km / 1000000).toFixed(2)} million km`;
        }
    }

    formatSpeed(kmPerSec) {
        if (kmPerSec < 0.001) {
            return `${(kmPerSec * 1000000).toFixed(0)} m/s`;
        } else if (kmPerSec < 1) {
            return `${(kmPerSec * 1000).toFixed(1)} m/s`;
        } else {
            return `${kmPerSec.toFixed(2)} km/s`;
        }
    }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);
