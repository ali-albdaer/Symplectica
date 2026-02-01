/**
 * simulation.js - Main Physics Simulation Controller
 * 
 * Orchestrates the physics simulation, managing:
 * - Simulation time and timestep
 * - Integration of body motions
 * - Conservation law tracking
 * - Error detection and warnings
 * 
 * Designed for:
 * - Deterministic execution (same inputs = same outputs)
 * - State serialization for save/load
 * - Future multiplayer synchronization (lockstep or rollback)
 */

import { Vec3 } from './vector3.js';
import { Body, resetBodyIdCounter } from './body.js';
import { 
    computeAllAccelerations, 
    totalEnergy, 
    totalAngularMomentum, 
    totalMomentum,
    setPhysicsMode,
    getPhysicsMode,
    PhysicsMode
} from './gravity.js';
import { 
    step, 
    initializeAccelerations, 
    setIntegrator, 
    getIntegrator,
    IntegratorType 
} from './integrators.js';
import { SimDefaults, Units } from './constants.js';

/**
 * Simulation state class
 * Contains all state needed to reproduce the simulation
 */
export class Simulation {
    constructor() {
        // ========== Bodies ==========
        /** @type {Body[]} All bodies in the simulation */
        this.bodies = [];
        
        /** @type {Map<number, Body>} Body lookup by ID */
        this.bodyMap = new Map();

        // ========== Time State ==========
        /** @type {number} Current simulation time in seconds */
        this.time = 0;
        
        /** @type {number} Base timestep in seconds */
        this.timestep = SimDefaults.TIMESTEP;
        
        /** @type {number} Time scale multiplier */
        this.timeScale = 1.0;
        
        /** @type {boolean} Whether simulation is running */
        this.isRunning = false;
        
        /** @type {number} Number of substeps per frame */
        this.substeps = 1;

        // ========== Physics Settings ==========
        /** @type {number} Global softening parameter in meters */
        this.softening = SimDefaults.SOFTENING;
        
        /** @type {string} Current physics mode */
        this.physicsMode = PhysicsMode.NEWTONIAN;
        
        /** @type {string} Current integrator type */
        this.integratorType = IntegratorType.VELOCITY_VERLET;

        // ========== Conservation Tracking ==========
        /** @type {number|null} Initial total energy (for error tracking) */
        this.initialEnergy = null;
        
        /** @type {Vec3|null} Initial angular momentum */
        this.initialAngularMomentum = null;
        
        /** @type {number} Current total energy */
        this.currentEnergy = 0;
        
        /** @type {Vec3} Current angular momentum */
        this.currentAngularMomentum = Vec3.zero();
        
        /** @type {number} Relative energy error */
        this.energyError = 0;
        
        /** @type {Object|null} Initial conservation quantities (for diagnostics) */
        this.initialConservation = null;

        // ========== Adaptive Timestep State (for RK45) ==========
        /** @type {number} Suggested next timestep from adaptive integrator */
        this.adaptiveNextDt = this.timestep;
        
        /** @type {number} Tolerance for adaptive integrator */
        this.adaptiveTolerance = 1e-8;

        // ========== Step Counter ==========
        /** @type {number} Total integration steps performed */
        this.stepCount = 0;

        // ========== Callbacks for events ==========
        /** @type {Function|null} Called on warning conditions */
        this.onWarning = null;
        
        /** @type {Function|null} Called on error conditions */
        this.onError = null;
        
        /** @type {Function|null} Called after each step */
        this.onStep = null;
    }

    /**
     * Add a body to the simulation
     * @param {Body} body - Body to add
     * @returns {Body} The added body
     */
    addBody(body) {
        this.bodies.push(body);
        this.bodyMap.set(body.id, body);
        body.createdAt = this.time;
        
        // Reinitialize if we have bodies
        if (this.bodies.length > 0) {
            this._updateInitialConservation();
        }
        
        return body;
    }

    /**
     * Remove a body from the simulation
     * @param {number} bodyId - ID of body to remove
     * @returns {boolean} True if removed
     */
    removeBody(bodyId) {
        const index = this.bodies.findIndex(b => b.id === bodyId);
        if (index === -1) return false;
        
        this.bodies.splice(index, 1);
        this.bodyMap.delete(bodyId);
        
        this._updateInitialConservation();
        return true;
    }

    /**
     * Get a body by ID
     * @param {number} bodyId - Body ID
     * @returns {Body|undefined} Body or undefined
     */
    getBody(bodyId) {
        return this.bodyMap.get(bodyId);
    }

    /**
     * Get all bodies in the simulation
     * @returns {Body[]} Array of all bodies
     */
    getBodies() {
        return this.bodies;
    }

    /**
     * Clear all bodies
     */
    clearBodies() {
        this.bodies = [];
        this.bodyMap.clear();
        this.initialEnergy = null;
        this.initialAngularMomentum = null;
        resetBodyIdCounter(1);
    }

    /**
     * Reset simulation time and conservation tracking
     */
    reset() {
        this.time = 0;
        this.stepCount = 0;
        this.adaptiveNextDt = this.timestep;
        
        // Clear trails
        for (const body of this.bodies) {
            body.clearTrail();
        }
        
        // Reinitialize accelerations and conservation baseline
        if (this.bodies.length > 0) {
            initializeAccelerations(this.bodies, this.softening);
            this._updateInitialConservation();
        }
    }

    /**
     * Initialize accelerations and set conservation baselines
     * @private
     */
    _updateInitialConservation() {
        if (this.bodies.length === 0) {
            this.initialEnergy = null;
            this.initialAngularMomentum = null;
            this.initialConservation = null;
            return;
        }
        
        initializeAccelerations(this.bodies, this.softening);
        this.initialEnergy = totalEnergy(this.bodies, this.softening);
        this.initialAngularMomentum = totalAngularMomentum(this.bodies);
        this.currentEnergy = this.initialEnergy;
        this.currentAngularMomentum = this.initialAngularMomentum.clone();
        this.energyError = 0;
        
        // Store full conservation quantities for diagnostics
        this.initialConservation = {
            totalEnergy: this.initialEnergy,
            totalMomentum: totalMomentum(this.bodies),
            angularMomentum: this.initialAngularMomentum.clone(),
        };
    }

    /**
     * Set the physics mode
     * @param {string} mode - Physics mode from PhysicsMode enum
     */
    setPhysicsMode(mode) {
        this.physicsMode = mode;
        setPhysicsMode(mode);
        
        // Reinitialize after physics change
        if (this.bodies.length > 0) {
            this._updateInitialConservation();
        }
    }

    /**
     * Set the integrator type
     * @param {string} type - Integrator type from IntegratorType enum
     */
    setIntegrator(type) {
        this.integratorType = type;
        setIntegrator(type);
    }

    /**
     * Perform a single simulation step
     * @returns {Object} Step result with timing info
     */
    singleStep() {
        if (this.bodies.length === 0) {
            return { dt: 0, time: this.time };
        }

        const dt = this.timestep * this.timeScale;
        
        try {
            // For adaptive integrator, use suggested timestep
            let actualDt = dt;
            if (this.integratorType === IntegratorType.RK45) {
                const result = step(this.bodies, this.adaptiveNextDt, this.softening, {
                    tolerance: this.adaptiveTolerance
                });
                actualDt = result.dt;
                this.adaptiveNextDt = result.nextDt || dt;
            } else {
                step(this.bodies, dt, this.softening);
            }
            
            // Update time
            this.time += actualDt;
            this.stepCount++;
            
            // Update trails (for visualization)
            for (const body of this.bodies) {
                body.updateTrail();
            }
            
            // Update conservation quantities
            this._updateConservation();
            
            // Check for issues
            this._checkForProblems();
            
            // Callback
            if (this.onStep) {
                this.onStep({
                    dt: actualDt,
                    time: this.time,
                    stepCount: this.stepCount,
                    energyError: this.energyError
                });
            }
            
            return { 
                dt: actualDt, 
                time: this.time, 
                stepCount: this.stepCount,
                energyError: this.energyError
            };
            
        } catch (error) {
            this._handleError('Integration step failed: ' + error.message);
            return { dt: 0, time: this.time, error: error.message };
        }
    }

    /**
     * Perform simulation step(s) for a given time delta
     * This is the main update method called from the render loop
     * @param {number} deltaTime - Frame delta time in seconds
     * @returns {Object} Step result
     */
    step(deltaTime) {
        // Use multiStep if we have multiple substeps configured
        return this.multiStep(this.substeps);
    }

    /**
     * Perform multiple substeps (for finer integration)
     * @param {number} substeps - Number of substeps (default: this.substeps)
     * @returns {Object} Combined step result
     */
    multiStep(substeps = this.substeps) {
        let totalDt = 0;
        
        for (let i = 0; i < substeps; i++) {
            const result = this.singleStep();
            totalDt += result.dt;
            
            if (result.error) {
                return result;
            }
        }
        
        return {
            dt: totalDt,
            time: this.time,
            stepCount: this.stepCount,
            energyError: this.energyError
        };
    }

    /**
     * Update conservation quantities
     * @private
     */
    _updateConservation() {
        if (this.bodies.length === 0 || this.initialEnergy === null) {
            return;
        }
        
        this.currentEnergy = totalEnergy(this.bodies, this.softening);
        this.currentAngularMomentum = totalAngularMomentum(this.bodies);
        
        // Compute relative energy error
        if (Math.abs(this.initialEnergy) > 1e-20) {
            this.energyError = Math.abs(
                (this.currentEnergy - this.initialEnergy) / this.initialEnergy
            );
        } else {
            this.energyError = Math.abs(this.currentEnergy - this.initialEnergy);
        }
    }

    /**
     * Check for numerical or physical problems
     * @private
     */
    _checkForProblems() {
        // Check for NaN or Infinite values
        for (const body of this.bodies) {
            if (!body.position.isFinite() || !body.velocity.isFinite()) {
                this._handleError(
                    `Body "${body.name}" has invalid state (NaN/Infinity). ` +
                    `Consider reducing timestep or increasing softening.`
                );
                // Attempt recovery: stop the body
                body.velocity.set(0, 0, 0);
                body.position.set(0, 0, 0);
                return;
            }
        }
        
        // Check energy error threshold
        if (this.energyError > SimDefaults.CRITICAL_ENERGY_ERROR) {
            this._handleWarning(
                `Critical energy error: ${(this.energyError * 100).toFixed(2)}%. ` +
                `Reduce timestep or switch to symplectic integrator.`
            );
        } else if (this.energyError > SimDefaults.MAX_ENERGY_ERROR) {
            this._handleWarning(
                `Energy error: ${(this.energyError * 100).toFixed(4)}% exceeds threshold.`
            );
        }
    }

    /**
     * Handle warning condition
     * @param {string} message - Warning message
     * @private
     */
    _handleWarning(message) {
        console.warn('[Simulation Warning]', message);
        if (this.onWarning) {
            this.onWarning(message);
        }
    }

    /**
     * Handle error condition
     * @param {string} message - Error message
     * @private
     */
    _handleError(message) {
        console.error('[Simulation Error]', message);
        if (this.onError) {
            this.onError(message);
        }
    }

    /**
     * Start the simulation
     */
    start() {
        if (this.bodies.length === 0) {
            this._handleWarning('No bodies in simulation');
            return;
        }
        
        if (this.initialEnergy === null) {
            this._updateInitialConservation();
        }
        
        this.isRunning = true;
    }

    /**
     * Stop (pause) the simulation
     */
    stop() {
        this.isRunning = false;
    }

    /**
     * Toggle running state
     * @returns {boolean} New running state
     */
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
        return this.isRunning;
    }

    /**
     * Get simulation statistics
     * @returns {Object} Current statistics
     */
    getStats() {
        return {
            time: this.time,
            timeDays: Units.secondsToDays(this.time),
            timeYears: Units.secondsToYears(this.time),
            stepCount: this.stepCount,
            bodyCount: this.bodies.length,
            timestep: this.timestep * this.timeScale,
            totalEnergy: this.currentEnergy,
            energyError: this.energyError,
            angularMomentum: this.currentAngularMomentum.magnitude(),
            isRunning: this.isRunning,
            physicsMode: this.physicsMode,
            integrator: this.integratorType,
        };
    }

    /**
     * Serialize the simulation state
     * @returns {Object} Serializable state object
     */
    serialize() {
        return {
            version: 1,
            time: this.time,
            timestep: this.timestep,
            timeScale: this.timeScale,
            softening: this.softening,
            physicsMode: this.physicsMode,
            integratorType: this.integratorType,
            substeps: this.substeps,
            adaptiveTolerance: this.adaptiveTolerance,
            bodies: this.bodies.map(b => b.serialize()),
        };
    }

    /**
     * Deserialize and load simulation state
     * @param {Object} data - Serialized state
     */
    deserialize(data) {
        this.clearBodies();
        
        this.time = data.time ?? 0;
        this.timestep = data.timestep ?? SimDefaults.TIMESTEP;
        this.timeScale = data.timeScale ?? 1.0;
        this.softening = data.softening ?? SimDefaults.SOFTENING;
        this.physicsMode = data.physicsMode ?? PhysicsMode.NEWTONIAN;
        this.integratorType = data.integratorType ?? IntegratorType.VELOCITY_VERLET;
        this.substeps = data.substeps ?? 1;
        this.adaptiveTolerance = data.adaptiveTolerance ?? 1e-8;
        
        // Set physics mode and integrator
        setPhysicsMode(this.physicsMode);
        setIntegrator(this.integratorType);
        
        // Load bodies
        if (data.bodies && Array.isArray(data.bodies)) {
            // Find max ID to set counter correctly
            let maxId = 0;
            for (const bodyData of data.bodies) {
                if (bodyData.id > maxId) maxId = bodyData.id;
            }
            resetBodyIdCounter(maxId + 1);
            
            for (const bodyData of data.bodies) {
                const body = Body.deserialize(bodyData);
                this.addBody(body);
            }
        }
        
        // Initialize physics
        if (this.bodies.length > 0) {
            this._updateInitialConservation();
        }
    }

    /**
     * Clone the current simulation state
     * @returns {Simulation} New simulation with copied state
     */
    clone() {
        const sim = new Simulation();
        sim.deserialize(this.serialize());
        return sim;
    }
}

// Singleton simulation instance
let simulationInstance = null;

/**
 * Get the global simulation instance
 * @returns {Simulation} Global simulation
 */
export function getSimulation() {
    if (!simulationInstance) {
        simulationInstance = new Simulation();
    }
    return simulationInstance;
}

/**
 * Initialize the global simulation (alias for getSimulation for consistency)
 * @returns {Simulation} Global simulation
 */
export function initSimulation() {
    return getSimulation();
}

/**
 * Reset the global simulation instance
 * @returns {Simulation} New simulation instance
 */
export function resetSimulation() {
    simulationInstance = new Simulation();
    return simulationInstance;
}

export default {
    Simulation,
    getSimulation,
    initSimulation,
    resetSimulation,
};
