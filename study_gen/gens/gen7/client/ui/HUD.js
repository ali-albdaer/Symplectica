/**
 * HUD Manager
 * Updates UI elements with simulation data.
 * @module client/ui/HUD
 */

import { AU } from '@shared/physics/constants.js';

/**
 * HUD element manager
 */
export class HUD {
  constructor() {
    // Cache DOM elements
    this.elements = {
      position: document.getElementById('stat-position'),
      velocity: document.getElementById('stat-velocity'),
      soi: document.getElementById('stat-soi'),
      time: document.getElementById('stat-time'),
      bodies: document.getElementById('stat-bodies'),
      netStatus: document.getElementById('net-status'),
      netPing: document.getElementById('net-ping'),
      netPlayers: document.getElementById('net-players'),
      universeSelect: document.getElementById('universe-select')
    };
    
    // Callbacks
    this.onUniverseChange = null;
    
    // Setup event listeners
    if (this.elements.universeSelect) {
      this.elements.universeSelect.addEventListener('change', (e) => {
        if (this.onUniverseChange) {
          this.onUniverseChange(e.target.value);
        }
      });
    }
  }

  /**
   * Format a large number with SI prefixes
   * @param {number} value 
   * @param {number} decimals 
   * @returns {string}
   */
  formatSI(value, decimals = 2) {
    const abs = Math.abs(value);
    
    if (abs >= 1e12) return (value / 1e12).toFixed(decimals) + ' T';
    if (abs >= 1e9) return (value / 1e9).toFixed(decimals) + ' G';
    if (abs >= 1e6) return (value / 1e6).toFixed(decimals) + ' M';
    if (abs >= 1e3) return (value / 1e3).toFixed(decimals) + ' k';
    if (abs >= 1) return value.toFixed(decimals);
    if (abs >= 1e-3) return (value * 1e3).toFixed(decimals) + ' m';
    if (abs >= 1e-6) return (value * 1e6).toFixed(decimals) + ' μ';
    
    return value.toExponential(decimals);
  }

  /**
   * Format position for display
   * @param {Object} position - Position vector
   * @returns {string}
   */
  formatPosition(position) {
    // Convert to km
    const xKm = position.x / 1000;
    const yKm = position.y / 1000;
    const zKm = position.z / 1000;
    
    // Use appropriate format based on magnitude
    const format = (v) => {
      const abs = Math.abs(v);
      if (abs >= 1e9) return (v / 1e9).toFixed(1) + 'M';
      if (abs >= 1e6) return (v / 1e6).toFixed(1) + 'k';
      if (abs >= 1e3) return (v / 1e3).toFixed(1) + 'k';
      return v.toFixed(0);
    };
    
    return `${format(xKm)}, ${format(yKm)}, ${format(zKm)}`;
  }

  /**
   * Format simulation time
   * @param {number} seconds 
   * @returns {string}
   */
  formatTime(seconds) {
    if (seconds < 60) return seconds.toFixed(2) + 's';
    if (seconds < 3600) return (seconds / 60).toFixed(1) + 'm';
    if (seconds < 86400) return (seconds / 3600).toFixed(2) + 'h';
    return (seconds / 86400).toFixed(2) + 'd';
  }

  /**
   * Update ship stats
   * @param {Object} ship - Ship object
   */
  updateShipStats(ship) {
    if (!ship) return;
    
    if (this.elements.position) {
      this.elements.position.textContent = this.formatPosition(ship.position);
    }
    
    if (this.elements.velocity) {
      const speed = ship.getOrbitalSpeed ? ship.getOrbitalSpeed() : 
                    Math.sqrt(ship.velocity.x**2 + ship.velocity.y**2 + ship.velocity.z**2);
      this.elements.velocity.textContent = this.formatSI(speed, 1) + 'm/s';
    }
  }

  /**
   * Update SOI display
   * @param {string} soiName 
   */
  updateSOI(soiName) {
    if (this.elements.soi) {
      this.elements.soi.textContent = soiName || 'None';
    }
  }

  /**
   * Update simulation stats
   * @param {Object} stats 
   */
  updateSimStats(stats) {
    if (this.elements.time) {
      this.elements.time.textContent = this.formatTime(stats.time || 0);
    }
    
    if (this.elements.bodies) {
      this.elements.bodies.textContent = stats.bodyCount || 0;
    }
  }

  /**
   * Update network stats
   * @param {Object} netStats 
   */
  updateNetworkStats(netStats) {
    if (this.elements.netStatus) {
      this.elements.netStatus.textContent = netStats.connected ? 'Online' : 'Offline';
      this.elements.netStatus.className = `stat-value status-${netStats.connected ? 'connected' : 'disconnected'}`;
    }
    
    if (this.elements.netPing) {
      this.elements.netPing.textContent = netStats.ping ? `${netStats.ping}ms` : '--ms';
    }
    
    if (this.elements.netPlayers) {
      this.elements.netPlayers.textContent = netStats.playerCount || 0;
    }
  }

  /**
   * Set selected universe in dropdown
   * @param {string} universeId 
   */
  setSelectedUniverse(universeId) {
    if (this.elements.universeSelect) {
      this.elements.universeSelect.value = universeId;
    }
  }

  /**
   * Show a notification message
   * @param {string} message 
   * @param {string} type - 'info', 'warning', 'error'
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 20, 40, 0.9);
      border: 1px solid ${type === 'error' ? '#f00' : type === 'warning' ? '#ff0' : '#0ff'};
      color: ${type === 'error' ? '#f88' : type === 'warning' ? '#ff8' : '#0ff'};
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      animation: fadeInOut 3s forwards;
    `;
    notification.textContent = message;
    
    // Add animation styles if not present
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          90% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

export default HUD;
