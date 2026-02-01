/**
 * diagnostics.js - Live Diagnostics and Performance Monitoring
 * 
 * Provides real-time monitoring of simulation health, physics accuracy,
 * and performance metrics. Essential for debugging and validation.
 */

import { getSimulation } from './simulation.js';
import { getState } from './state.js';
import { getRenderer } from './renderer.js';
import { computeConservationQuantities } from './gravity.js';
import { Units, C, AU } from './constants.js';

/**
 * Diagnostics system for monitoring simulation health
 */
export class DiagnosticsManager {
    constructor() {
        // Performance metrics
        this.frameTimeHistory = [];
        this.physicsTimeHistory = [];
        this.renderTimeHistory = [];
        this.historyLength = 60;
        
        // Conservation tracking
        this.energyHistory = [];
        this.momentumHistory = [];
        this.angularMomentumHistory = [];
        this.conservationHistoryLength = 300;
        
        // Warning thresholds
        this.energyErrorWarning = 0.01;   // 1%
        this.energyErrorError = 0.1;       // 10%
        this.momentumErrorWarning = 0.01;
        this.velocityWarning = 0.1;        // 10% of c
        
        // Collision detection
        this.collisionWarnings = [];
        this.lastCollisionCheck = 0;
        this.collisionCheckInterval = 1000; // ms
        
        // Status flags
        this.hasWarnings = false;
        this.hasErrors = false;
        this.warningMessages = [];
        this.errorMessages = [];
        
        // Timing
        this.physicsStartTime = 0;
        this.renderStartTime = 0;
        this.lastUpdateTime = 0;
    }

    /**
     * Mark start of physics computation
     */
    startPhysicsTimer() {
        this.physicsStartTime = performance.now();
    }

    /**
     * Mark end of physics computation
     */
    endPhysicsTimer() {
        const elapsed = performance.now() - this.physicsStartTime;
        this.physicsTimeHistory.push(elapsed);
        if (this.physicsTimeHistory.length > this.historyLength) {
            this.physicsTimeHistory.shift();
        }
    }

    /**
     * Mark start of render
     */
    startRenderTimer() {
        this.renderStartTime = performance.now();
    }

    /**
     * Mark end of render
     */
    endRenderTimer() {
        const elapsed = performance.now() - this.renderStartTime;
        this.renderTimeHistory.push(elapsed);
        if (this.renderTimeHistory.length > this.historyLength) {
            this.renderTimeHistory.shift();
        }
    }

    /**
     * Record frame time
     * @param {number} deltaTime - Frame delta in seconds
     */
    recordFrame(deltaTime) {
        this.frameTimeHistory.push(deltaTime * 1000);
        if (this.frameTimeHistory.length > this.historyLength) {
            this.frameTimeHistory.shift();
        }
    }

    /**
     * Update diagnostics (called each frame)
     */
    update() {
        const now = performance.now();
        const simulation = getSimulation();
        const bodies = simulation.bodies;
        
        this.warningMessages = [];
        this.errorMessages = [];
        this.hasWarnings = false;
        this.hasErrors = false;
        
        // Track conservation quantities
        if (bodies.length > 0) {
            const conservation = computeConservationQuantities(bodies);
            
            this.energyHistory.push(conservation.totalEnergy);
            this.momentumHistory.push(conservation.totalMomentum.magnitude());
            this.angularMomentumHistory.push(conservation.angularMomentum.magnitude());
            
            // Trim histories
            while (this.energyHistory.length > this.conservationHistoryLength) {
                this.energyHistory.shift();
            }
            while (this.momentumHistory.length > this.conservationHistoryLength) {
                this.momentumHistory.shift();
            }
            while (this.angularMomentumHistory.length > this.conservationHistoryLength) {
                this.angularMomentumHistory.shift();
            }
        }
        
        // Check for issues
        this._checkEnergyConservation();
        this._checkMomentumConservation();
        this._checkRelativisticVelocities();
        this._checkBodyProximity(now);
        this._checkNumericalStability();
        
        this.lastUpdateTime = now;
    }

    /**
     * Check energy conservation
     * @private
     */
    _checkEnergyConservation() {
        const simulation = getSimulation();
        const errorPercent = simulation.energyError * 100;
        
        if (errorPercent > this.energyErrorError * 100) {
            this.errorMessages.push(`Energy drift: ${errorPercent.toFixed(2)}%`);
            this.hasErrors = true;
        } else if (errorPercent > this.energyErrorWarning * 100) {
            this.warningMessages.push(`Energy drift: ${errorPercent.toFixed(2)}%`);
            this.hasWarnings = true;
        }
    }

    /**
     * Check momentum conservation
     * @private
     */
    _checkMomentumConservation() {
        const simulation = getSimulation();
        const bodies = simulation.bodies;
        
        if (bodies.length < 2 || !simulation.initialConservation) return;
        
        const current = computeConservationQuantities(bodies);
        const initial = simulation.initialConservation;
        
        // Skip if initial momentum is near zero (makes relative error meaningless)
        const initialMag = initial.totalMomentum.magnitude();
        if (initialMag < 1e-10) return;
        
        const currentMag = current.totalMomentum.magnitude();
        const drift = Math.abs(currentMag - initialMag) / initialMag;
        
        if (drift > this.momentumErrorWarning) {
            this.warningMessages.push(`Momentum drift: ${(drift * 100).toFixed(2)}%`);
            this.hasWarnings = true;
        }
    }

    /**
     * Check for relativistic velocities
     * @private
     */
    _checkRelativisticVelocities() {
        const simulation = getSimulation();
        
        for (const body of simulation.bodies) {
            const speed = body.velocity.magnitude();
            const fraction = speed / C;
            
            if (fraction > this.velocityWarning) {
                this.warningMessages.push(`${body.name} at ${(fraction * 100).toFixed(1)}% speed of light`);
                this.hasWarnings = true;
                
                if (fraction > 0.5) {
                    this.errorMessages.push(`${body.name} exceeds 50% c - physics inaccurate`);
                    this.hasErrors = true;
                }
            }
        }
    }

    /**
     * Check for very close body approaches
     * @param {number} now - Current timestamp
     * @private
     */
    _checkBodyProximity(now) {
        if (now - this.lastCollisionCheck < this.collisionCheckInterval) return;
        this.lastCollisionCheck = now;
        
        const simulation = getSimulation();
        const bodies = simulation.bodies;
        this.collisionWarnings = [];
        
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const bi = bodies[i];
                const bj = bodies[j];
                
                const separation = bi.position.distanceTo(bj.position);
                const combinedRadius = bi.radius + bj.radius;
                
                // Warn if within 5 radii
                if (separation < combinedRadius * 5) {
                    const ratio = separation / combinedRadius;
                    
                    if (separation < combinedRadius) {
                        // Collision!
                        this.collisionWarnings.push({
                            body1: bi.name,
                            body2: bj.name,
                            type: 'collision',
                            separation: ratio,
                        });
                        this.errorMessages.push(`Collision: ${bi.name} and ${bj.name}`);
                        this.hasErrors = true;
                    } else if (separation < combinedRadius * 2) {
                        // Very close
                        this.collisionWarnings.push({
                            body1: bi.name,
                            body2: bj.name,
                            type: 'close',
                            separation: ratio,
                        });
                        this.warningMessages.push(`Near collision: ${bi.name} / ${bj.name}`);
                        this.hasWarnings = true;
                    }
                }
            }
        }
    }

    /**
     * Check for numerical instability indicators
     * @private
     */
    _checkNumericalStability() {
        const simulation = getSimulation();
        
        for (const body of simulation.bodies) {
            // Check for NaN or Infinity
            if (!body.position.isFinite()) {
                this.errorMessages.push(`${body.name} position is NaN/Infinity`);
                this.hasErrors = true;
            }
            
            if (!body.velocity.isFinite()) {
                this.errorMessages.push(`${body.name} velocity is NaN/Infinity`);
                this.hasErrors = true;
            }
            
            if (!body.acceleration.isFinite()) {
                this.errorMessages.push(`${body.name} acceleration is NaN/Infinity`);
                this.hasErrors = true;
            }
            
            // Check for extreme values
            const pos = body.position.magnitude();
            if (pos > 1e20) {
                this.warningMessages.push(`${body.name} very far (${Units.formatDistance(pos)})`);
                this.hasWarnings = true;
            }
        }
    }

    /**
     * Get average physics time
     * @returns {number} Average physics time in ms
     */
    getAveragePhysicsTime() {
        if (this.physicsTimeHistory.length === 0) return 0;
        const sum = this.physicsTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.physicsTimeHistory.length;
    }

    /**
     * Get average render time
     * @returns {number} Average render time in ms
     */
    getAverageRenderTime() {
        if (this.renderTimeHistory.length === 0) return 0;
        const sum = this.renderTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.renderTimeHistory.length;
    }

    /**
     * Get average frame time
     * @returns {number} Average frame time in ms
     */
    getAverageFrameTime() {
        if (this.frameTimeHistory.length === 0) return 0;
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.frameTimeHistory.length;
    }

    /**
     * Get current FPS
     * @returns {number}
     */
    getCurrentFPS() {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > 0 ? 1000 / avgFrameTime : 0;
    }

    /**
     * Get energy trend
     * @returns {string} 'stable', 'increasing', 'decreasing', or 'unstable'
     */
    getEnergyTrend() {
        if (this.energyHistory.length < 10) return 'stable';
        
        const recent = this.energyHistory.slice(-10);
        const first = recent[0];
        const last = recent[recent.length - 1];
        
        if (!isFinite(first) || !isFinite(last)) return 'unstable';
        
        const change = (last - first) / Math.abs(first);
        
        if (Math.abs(change) < 0.001) return 'stable';
        if (change > 0.01) return 'increasing';
        if (change < -0.01) return 'decreasing';
        return 'stable';
    }

    /**
     * Get full diagnostic report
     * @returns {Object} Diagnostic report
     */
    getReport() {
        const simulation = getSimulation();
        const stats = simulation.getStats();
        
        return {
            // Performance
            fps: this.getCurrentFPS(),
            frameTime: this.getAverageFrameTime(),
            physicsTime: this.getAveragePhysicsTime(),
            renderTime: this.getAverageRenderTime(),
            
            // Simulation
            bodyCount: stats.bodyCount,
            simulationTime: stats.simulatedSeconds,
            simulatedDays: stats.timeDays,
            timestep: stats.timestep,
            integrator: stats.integrator,
            physicsMode: stats.physicsMode,
            
            // Conservation
            totalEnergy: stats.totalEnergy,
            energyError: stats.energyError,
            energyTrend: this.getEnergyTrend(),
            
            // Health
            hasWarnings: this.hasWarnings,
            hasErrors: this.hasErrors,
            warnings: [...this.warningMessages],
            errors: [...this.errorMessages],
            collisions: [...this.collisionWarnings],
        };
    }

    /**
     * Generate a diagnostic summary string
     * @returns {string}
     */
    getSummaryString() {
        const report = this.getReport();
        const lines = [
            `FPS: ${report.fps.toFixed(0)} (${report.frameTime.toFixed(1)}ms)`,
            `Physics: ${report.physicsTime.toFixed(2)}ms | Render: ${report.renderTime.toFixed(2)}ms`,
            `Bodies: ${report.bodyCount}`,
            `Time: ${report.simulatedDays.toFixed(2)} days`,
            `Energy Error: ${(report.energyError * 100).toFixed(6)}% (${report.energyTrend})`,
        ];
        
        if (report.hasErrors) {
            lines.push(`ERRORS: ${report.errors.length}`);
        }
        if (report.hasWarnings) {
            lines.push(`Warnings: ${report.warnings.length}`);
        }
        
        return lines.join('\n');
    }

    /**
     * Reset all diagnostic histories
     */
    reset() {
        this.frameTimeHistory = [];
        this.physicsTimeHistory = [];
        this.renderTimeHistory = [];
        this.energyHistory = [];
        this.momentumHistory = [];
        this.angularMomentumHistory = [];
        this.collisionWarnings = [];
        this.warningMessages = [];
        this.errorMessages = [];
        this.hasWarnings = false;
        this.hasErrors = false;
    }
}

// Singleton instance
let diagnosticsInstance = null;

/**
 * Get the diagnostics manager
 * @returns {DiagnosticsManager}
 */
export function getDiagnostics() {
    if (!diagnosticsInstance) {
        diagnosticsInstance = new DiagnosticsManager();
    }
    return diagnosticsInstance;
}

/**
 * Convenience function for performance profiling
 * @param {string} name - Profile name
 * @param {Function} fn - Function to profile
 * @returns {*} Function result
 */
export function profile(name, fn) {
    const start = performance.now();
    const result = fn();
    const elapsed = performance.now() - start;
    console.debug(`[Profile] ${name}: ${elapsed.toFixed(2)}ms`);
    return result;
}

export default {
    DiagnosticsManager,
    getDiagnostics,
    profile,
};
