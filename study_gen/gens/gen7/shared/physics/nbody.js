/**
 * N-Body Physics Simulation Core
 * Shared library that runs on both Client and Server.
 * @module shared/physics/nbody
 */

import { Vector3D } from '../math/Vector3D.js';
import { G, DT, PHYSICS_HZ, BodyType, isMassive } from './constants.js';
import { VelocityVerlet, AdaptiveRK45, createIntegrator, IntegratorType } from './integrators.js';
import { assertValidState, validateBody } from './validation.js';

/**
 * @typedef {Object} CelestialBody
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} type - Body type from BodyType enum
 * @property {number} mass - Mass in kg
 * @property {number} radius - Radius in meters
 * @property {Vector3D} position - Position in meters (SI)
 * @property {Vector3D} velocity - Velocity in m/s
 * @property {Object} [visual] - Visual parameters (color, atmosphere, etc.)
 * @property {string} [parent] - Parent body ID for moons
 */

/**
 * @typedef {Object} SimulationState
 * @property {number} time - Simulation time in seconds
 * @property {number} tick - Current tick number
 * @property {CelestialBody[]} bodies - All bodies in simulation
 */

/**
 * N-Body Physics Simulation Engine
 */
export class NBodySimulation {
  /**
   * @param {Object} options
   * @param {string} [options.integrator='velocity-verlet'] - Integrator type
   * @param {number} [options.dt] - Timestep override
   */
  constructor(options = {}) {
    /** @type {Map<string, CelestialBody>} All bodies by ID */
    this.bodies = new Map();
    
    /** @type {CelestialBody[]} Cached array of massive bodies */
    this.massiveBodies = [];
    
    /** @type {CelestialBody[]} Cached array of passive bodies */
    this.passiveBodies = [];
    
    /** @type {number} Current simulation time in seconds */
    this.time = 0;
    
    /** @type {number} Current tick number */
    this.tick = 0;
    
    /** @type {number} Timestep in seconds */
    this.dt = options.dt || DT;
    
    /** @type {VelocityVerlet|AdaptiveRK45} Physics integrator */
    this.integrator = createIntegrator(
      options.integrator || IntegratorType.VELOCITY_VERLET
    );
    
    /** @type {boolean} Whether body cache needs rebuild */
    this._cacheInvalid = true;
  }

  /**
   * Rebuild the cached body arrays
   * @private
   */
  _rebuildCache() {
    this.massiveBodies = [];
    this.passiveBodies = [];
    
    for (const body of this.bodies.values()) {
      if (isMassive(body.type)) {
        this.massiveBodies.push(body);
      } else {
        this.passiveBodies.push(body);
      }
    }
    
    this._cacheInvalid = false;
  }

  /**
   * Add a body to the simulation
   * @param {CelestialBody} bodyData 
   * @returns {CelestialBody}
   */
  addBody(bodyData) {
    // Ensure position and velocity are Vector3D instances
    const body = {
      ...bodyData,
      position: bodyData.position instanceof Vector3D 
        ? bodyData.position 
        : Vector3D.fromJSON(bodyData.position || { x: 0, y: 0, z: 0 }),
      velocity: bodyData.velocity instanceof Vector3D
        ? bodyData.velocity
        : Vector3D.fromJSON(bodyData.velocity || { x: 0, y: 0, z: 0 })
    };
    
    // Validate
    const result = validateBody(body);
    if (!result.valid) {
      throw new Error(`Invalid body: ${result.errors.join(', ')}`);
    }
    
    this.bodies.set(body.id, body);
    this._cacheInvalid = true;
    this.integrator.reset();
    
    return body;
  }

  /**
   * Remove a body from the simulation
   * @param {string} id 
   * @returns {boolean} Whether body was found and removed
   */
  removeBody(id) {
    const removed = this.bodies.delete(id);
    if (removed) {
      this._cacheInvalid = true;
      this.integrator.reset();
    }
    return removed;
  }

  /**
   * Get a body by ID
   * @param {string} id 
   * @returns {CelestialBody|undefined}
   */
  getBody(id) {
    return this.bodies.get(id);
  }

  /**
   * Get all bodies as array
   * @returns {CelestialBody[]}
   */
  getAllBodies() {
    return Array.from(this.bodies.values());
  }

  /**
   * Perform one physics tick
   * @returns {SimulationState}
   */
  step() {
    if (this._cacheInvalid) {
      this._rebuildCache();
    }
    
    // O(N²) for massive bodies (they affect each other)
    if (this.massiveBodies.length > 0) {
      this.integrator.step(this.massiveBodies, this.massiveBodies, this.dt);
    }
    
    // O(N) for passive bodies (affected by massive, don't affect others)
    if (this.passiveBodies.length > 0) {
      this.integrator.step(this.passiveBodies, this.massiveBodies, this.dt);
    }
    
    this.time += this.dt;
    this.tick++;
    
    return this.getState();
  }

  /**
   * Run multiple physics ticks
   * @param {number} count - Number of ticks to run
   * @returns {SimulationState}
   */
  stepMultiple(count) {
    for (let i = 0; i < count; i++) {
      this.step();
    }
    return this.getState();
  }

  /**
   * Get current simulation state (for networking/serialization)
   * @returns {SimulationState}
   */
  getState() {
    return {
      time: this.time,
      tick: this.tick,
      bodies: this.getAllBodies().map(body => ({
        id: body.id,
        name: body.name,
        type: body.type,
        mass: body.mass,
        radius: body.radius,
        position: body.position.toJSON(),
        velocity: body.velocity.toJSON(),
        visual: body.visual,
        parent: body.parent
      }))
    };
  }

  /**
   * Load state from serialized data
   * @param {SimulationState} state 
   */
  loadState(state) {
    this.bodies.clear();
    this.time = state.time;
    this.tick = state.tick;
    
    for (const bodyData of state.bodies) {
      this.addBody(bodyData);
    }
    
    assertValidState(this.getState(), 'NBodySimulation.loadState');
  }

  /**
   * Calculate orbital velocity for circular orbit
   * @param {number} parentMass - Mass of parent body (kg)
   * @param {number} distance - Orbital distance (m)
   * @returns {number} Orbital velocity (m/s)
   */
  static calculateOrbitalVelocity(parentMass, distance) {
    // v = sqrt(GM/r)
    return Math.sqrt((G * parentMass) / distance);
  }

  /**
   * Calculate Sphere of Influence radius
   * @param {number} bodyMass - Mass of orbiting body
   * @param {number} parentMass - Mass of parent body
   * @param {number} semiMajorAxis - Orbital semi-major axis
   * @returns {number} SOI radius in meters
   */
  static calculateSOI(bodyMass, parentMass, semiMajorAxis) {
    // r_SOI = a * (m/M)^(2/5)
    return semiMajorAxis * Math.pow(bodyMass / parentMass, 0.4);
  }

  /**
   * Find the dominant gravitational body for a position
   * @param {Vector3D} position 
   * @returns {CelestialBody|null}
   */
  findSOI(position) {
    if (this._cacheInvalid) {
      this._rebuildCache();
    }
    
    let dominant = null;
    let maxInfluence = 0;
    
    for (const body of this.massiveBodies) {
      const distance = position.distanceTo(body.position);
      // Influence = GM/r² (gravitational acceleration magnitude)
      const influence = (G * body.mass) / (distance * distance);
      
      if (influence > maxInfluence) {
        maxInfluence = influence;
        dominant = body;
      }
    }
    
    return dominant;
  }

  /**
   * Reset simulation to initial state
   */
  reset() {
    this.bodies.clear();
    this.massiveBodies = [];
    this.passiveBodies = [];
    this.time = 0;
    this.tick = 0;
    this._cacheInvalid = true;
    this.integrator.reset();
  }

  /**
   * Get simulation statistics
   * @returns {Object}
   */
  getStats() {
    if (this._cacheInvalid) {
      this._rebuildCache();
    }
    
    return {
      totalBodies: this.bodies.size,
      massiveBodies: this.massiveBodies.length,
      passiveBodies: this.passiveBodies.length,
      simulationTime: this.time,
      tick: this.tick,
      dt: this.dt,
      physicsHz: PHYSICS_HZ
    };
  }
}

export default NBodySimulation;
