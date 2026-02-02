/**
 * Universe Schema and Loader
 * Data-driven creation of celestial bodies from JSON.
 * @module shared/universe/schema
 */

import { Vector3D } from '../math/Vector3D.js';
import { G, BodyType } from '../physics/constants.js';
import { NBodySimulation } from '../physics/nbody.js';

/**
 * @typedef {Object} UniverseSchema
 * @property {string} name - Universe preset name
 * @property {string} description - Human-readable description
 * @property {Object} settings - Simulation settings
 * @property {BodySchema[]} bodies - Celestial bodies
 */

/**
 * @typedef {Object} BodySchema
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} type - Body type
 * @property {number} mass - Mass in kg
 * @property {number} radius - Radius in meters
 * @property {PositionSchema} [position] - Initial position (or use orbit)
 * @property {VelocitySchema} [velocity] - Initial velocity (or use orbit)
 * @property {OrbitSchema} [orbit] - Orbital parameters (generates position/velocity)
 * @property {VisualSchema} [visual] - Visual parameters
 */

/**
 * @typedef {Object} OrbitSchema
 * @property {string} parent - Parent body ID
 * @property {number} semiMajorAxis - Semi-major axis in meters
 * @property {number} [eccentricity=0] - Orbital eccentricity
 * @property {number} [inclination=0] - Inclination in radians
 * @property {number} [trueAnomaly=0] - Starting true anomaly in radians
 */

/**
 * @typedef {Object} VisualSchema
 * @property {string} [color] - Hex color
 * @property {Object} [atmosphere] - Atmosphere parameters
 * @property {Object} [rings] - Ring parameters
 * @property {number} [emissive] - Emissive intensity (for stars)
 */

/**
 * Calculate position and velocity from orbital elements
 * @param {OrbitSchema} orbit - Orbital parameters
 * @param {Object} parentBody - Parent body data
 * @returns {{position: Vector3D, velocity: Vector3D}}
 */
export function calculateOrbitalState(orbit, parentBody) {
  const a = orbit.semiMajorAxis;
  const e = orbit.eccentricity || 0;
  const inc = orbit.inclination || 0;
  const theta = orbit.trueAnomaly || 0;
  
  // Calculate distance at current true anomaly
  const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
  
  // Position in orbital plane
  const xOrbit = r * Math.cos(theta);
  const yOrbit = r * Math.sin(theta);
  
  // Rotate by inclination (around X-axis)
  const x = xOrbit;
  const y = yOrbit * Math.cos(inc);
  const z = yOrbit * Math.sin(inc);
  
  // Add parent position
  const position = new Vector3D(
    parentBody.position.x + x,
    parentBody.position.y + y,
    parentBody.position.z + z
  );
  
  // Calculate orbital velocity magnitude
  const mu = G * parentBody.mass;
  const vMag = Math.sqrt(mu * (2/r - 1/a));
  
  // Velocity direction (perpendicular to radius in orbital plane)
  // For circular orbit, velocity is perpendicular to position vector
  const vAngle = theta + Math.PI / 2;
  const vxOrbit = vMag * Math.cos(vAngle);
  const vyOrbit = vMag * Math.sin(vAngle);
  
  // Rotate by inclination
  const vx = vxOrbit;
  const vy = vyOrbit * Math.cos(inc);
  const vz = vyOrbit * Math.sin(inc);
  
  // Add parent velocity
  const velocity = new Vector3D(
    parentBody.velocity.x + vx,
    parentBody.velocity.y + vy,
    parentBody.velocity.z + vz
  );
  
  return { position, velocity };
}

/**
 * Load a universe from schema definition
 * @param {UniverseSchema} schema 
 * @param {NBodySimulation} [simulation] - Existing simulation to populate
 * @returns {NBodySimulation}
 */
export function loadUniverse(schema, simulation = null) {
  const sim = simulation || new NBodySimulation(schema.settings || {});
  sim.reset();
  
  // First pass: add bodies with explicit positions (typically the central star)
  const pending = [];
  
  for (const bodySchema of schema.bodies) {
    if (bodySchema.orbit) {
      // Defer orbital bodies until parent is processed
      pending.push(bodySchema);
    } else {
      // Add directly with explicit position/velocity
      const body = {
        id: bodySchema.id,
        name: bodySchema.name,
        type: bodySchema.type,
        mass: bodySchema.mass,
        radius: bodySchema.radius,
        position: bodySchema.position 
          ? new Vector3D(bodySchema.position.x, bodySchema.position.y, bodySchema.position.z)
          : Vector3D.zero(),
        velocity: bodySchema.velocity
          ? new Vector3D(bodySchema.velocity.x, bodySchema.velocity.y, bodySchema.velocity.z)
          : Vector3D.zero(),
        visual: bodySchema.visual || {},
        parent: null
      };
      sim.addBody(body);
    }
  }
  
  // Second pass: resolve orbital bodies (may need multiple passes for nested orbits)
  let maxIterations = 10;
  while (pending.length > 0 && maxIterations-- > 0) {
    const stillPending = [];
    
    for (const bodySchema of pending) {
      const parentBody = sim.getBody(bodySchema.orbit.parent);
      
      if (!parentBody) {
        // Parent not yet added, defer
        stillPending.push(bodySchema);
        continue;
      }
      
      // Calculate orbital state
      const { position, velocity } = calculateOrbitalState(bodySchema.orbit, parentBody);
      
      const body = {
        id: bodySchema.id,
        name: bodySchema.name,
        type: bodySchema.type,
        mass: bodySchema.mass,
        radius: bodySchema.radius,
        position,
        velocity,
        visual: bodySchema.visual || {},
        parent: bodySchema.orbit.parent
      };
      
      sim.addBody(body);
    }
    
    pending.length = 0;
    pending.push(...stillPending);
  }
  
  if (pending.length > 0) {
    console.warn('[UniverseLoader] Could not resolve all orbital bodies:', pending.map(b => b.id));
  }
  
  return sim;
}

/**
 * Export current simulation state as universe schema
 * @param {NBodySimulation} simulation 
 * @param {string} name - Schema name
 * @param {string} description - Schema description
 * @returns {UniverseSchema}
 */
export function exportUniverse(simulation, name, description) {
  return {
    name,
    description,
    settings: {
      dt: simulation.dt
    },
    bodies: simulation.getAllBodies().map(body => ({
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

export default {
  calculateOrbitalState,
  loadUniverse,
  exportUniverse
};
