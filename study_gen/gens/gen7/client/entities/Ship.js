/**
 * Player Ship with 6-DOF Physics-Aware Controller
 * Thruster-based movement with flight computer modes.
 * @module client/entities/Ship
 */

import * as THREE from 'three';
import { Vector3D } from '@shared/math/Vector3D.js';
import { BodyType, G } from '@shared/physics/constants.js';

/**
 * Flight computer modes
 */
export const FlightMode = {
  FREE: 'free',           // No assistance
  SAS: 'sas',             // Stability Assist (kill rotation)
  PROGRADE: 'prograde',   // Hold prograde direction
  RETROGRADE: 'retrograde' // Hold retrograde direction
};

/**
 * Player ship entity
 */
export class Ship {
  /**
   * @param {string} id - Unique ship ID
   * @param {Object} [options]
   */
  constructor(id, options = {}) {
    this.id = id;
    this.type = BodyType.SHIP;
    this.name = options.name || 'Ship';
    
    // Physical properties
    this.mass = options.mass || 10000; // 10 tons
    this.radius = options.radius || 10; // 10 meters
    
    // State (SI units)
    this.position = new Vector3D();
    this.velocity = new Vector3D();
    
    // Rotation (Euler angles in radians)
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.quaternion = new THREE.Quaternion();
    
    // Angular velocity (radians/s)
    this.angularVelocity = new Vector3D();
    
    // Thrust capabilities (Newtons)
    this.mainThrust = options.mainThrust || 50000; // 50 kN
    this.rcsThrust = options.rcsThrust || 5000;    // 5 kN
    this.rotThrust = options.rotThrust || 1000;    // Torque for rotation
    
    // Current thrust input (-1 to 1 for each axis)
    this.thrustInput = { x: 0, y: 0, z: 0 };
    this.rotationInput = { pitch: 0, yaw: 0, roll: 0 };
    
    // Flight computer
    this.flightMode = FlightMode.FREE;
    this.sasStrength = 2.0; // SAS angular correction strength
    
    // Visual properties
    this.color = options.color || 0x00ff88;
    
    // Current SOI body
    this.soiBody = null;
    
    // Helper vectors for calculations
    this._tempVec = new THREE.Vector3();
    this._forward = new THREE.Vector3();
    this._right = new THREE.Vector3();
    this._up = new THREE.Vector3();
  }

  /**
   * Spawn ship in orbit around a body
   * @param {Object} parentBody - Body to orbit
   * @param {number} altitude - Altitude above surface in meters
   * @param {number} [angle=0] - Initial orbital position angle
   */
  spawnInOrbit(parentBody, altitude, angle = 0) {
    const orbitRadius = parentBody.radius + altitude;
    
    // Position in orbit
    this.position.x = parentBody.position.x + orbitRadius * Math.cos(angle);
    this.position.y = parentBody.position.y;
    this.position.z = parentBody.position.z + orbitRadius * Math.sin(angle);
    
    // Orbital velocity: v = sqrt(GM/r)
    const orbitalSpeed = Math.sqrt((G * parentBody.mass) / orbitRadius);
    
    // Velocity perpendicular to radius (prograde)
    this.velocity.x = parentBody.velocity.x - orbitalSpeed * Math.sin(angle);
    this.velocity.y = parentBody.velocity.y;
    this.velocity.z = parentBody.velocity.z + orbitalSpeed * Math.cos(angle);
    
    this.soiBody = parentBody;
    
    console.log(`[Ship] Spawned in orbit at ${altitude/1000}km, v=${orbitalSpeed.toFixed(0)}m/s`);
  }

  /**
   * Update orientation vectors from quaternion
   * @private
   */
  _updateOrientationVectors() {
    this.quaternion.setFromEuler(this.rotation);
    
    this._forward.set(0, 0, -1).applyQuaternion(this.quaternion);
    this._right.set(1, 0, 0).applyQuaternion(this.quaternion);
    this._up.set(0, 1, 0).applyQuaternion(this.quaternion);
  }

  /**
   * Apply control inputs
   * @param {Object} input - Control input state
   */
  setInput(input) {
    this.thrustInput.x = input.strafeX || 0;
    this.thrustInput.y = input.strafeY || 0;
    this.thrustInput.z = input.thrust || 0;
    
    this.rotationInput.pitch = input.pitch || 0;
    this.rotationInput.yaw = input.yaw || 0;
    this.rotationInput.roll = input.roll || 0;
  }

  /**
   * Physics update (called at fixed timestep)
   * @param {number} dt - Timestep in seconds
   * @param {Object[]} massiveBodies - For gravity calculation
   */
  update(dt, massiveBodies) {
    this._updateOrientationVectors();
    
    // Calculate gravitational acceleration
    const gravAccel = new Vector3D();
    for (const body of massiveBodies) {
      const dx = body.position.x - this.position.x;
      const dy = body.position.y - this.position.y;
      const dz = body.position.z - this.position.z;
      
      const distSq = dx*dx + dy*dy + dz*dz;
      const dist = Math.sqrt(distSq);
      const accelMag = (G * body.mass) / distSq;
      
      gravAccel.x += (dx / dist) * accelMag;
      gravAccel.y += (dy / dist) * accelMag;
      gravAccel.z += (dz / dist) * accelMag;
    }
    
    // Calculate thrust acceleration
    const thrustAccel = new Vector3D();
    
    // Forward/backward thrust (main engines)
    if (this.thrustInput.z !== 0) {
      const force = this.thrustInput.z * this.mainThrust;
      thrustAccel.x += this._forward.x * force / this.mass;
      thrustAccel.y += this._forward.y * force / this.mass;
      thrustAccel.z += this._forward.z * force / this.mass;
    }
    
    // Strafe thrust (RCS)
    if (this.thrustInput.x !== 0) {
      const force = this.thrustInput.x * this.rcsThrust;
      thrustAccel.x += this._right.x * force / this.mass;
      thrustAccel.y += this._right.y * force / this.mass;
      thrustAccel.z += this._right.z * force / this.mass;
    }
    
    if (this.thrustInput.y !== 0) {
      const force = this.thrustInput.y * this.rcsThrust;
      thrustAccel.x += this._up.x * force / this.mass;
      thrustAccel.y += this._up.y * force / this.mass;
      thrustAccel.z += this._up.z * force / this.mass;
    }
    
    // Total acceleration
    const totalAccel = new Vector3D(
      gravAccel.x + thrustAccel.x,
      gravAccel.y + thrustAccel.y,
      gravAccel.z + thrustAccel.z
    );
    
    // Update velocity
    this.velocity.x += totalAccel.x * dt;
    this.velocity.y += totalAccel.y * dt;
    this.velocity.z += totalAccel.z * dt;
    
    // Update position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
    this.position.z += this.velocity.z * dt;
    
    // Handle rotation
    this._updateRotation(dt);
    
    // Validate state
    this.position.validate('Ship.position');
    this.velocity.validate('Ship.velocity');
  }

  /**
   * Update rotation based on flight mode
   * @private
   */
  _updateRotation(dt) {
    // Apply rotation input as angular velocity change
    const rotAccel = this.rotThrust / this.mass;
    
    if (this.flightMode === FlightMode.FREE) {
      // Direct control
      this.angularVelocity.x += this.rotationInput.pitch * rotAccel * dt;
      this.angularVelocity.y += this.rotationInput.yaw * rotAccel * dt;
      this.angularVelocity.z += this.rotationInput.roll * rotAccel * dt;
    } else if (this.flightMode === FlightMode.SAS) {
      // Kill rotation when no input
      if (this.rotationInput.pitch === 0) {
        this.angularVelocity.x *= (1 - this.sasStrength * dt);
      } else {
        this.angularVelocity.x += this.rotationInput.pitch * rotAccel * dt;
      }
      
      if (this.rotationInput.yaw === 0) {
        this.angularVelocity.y *= (1 - this.sasStrength * dt);
      } else {
        this.angularVelocity.y += this.rotationInput.yaw * rotAccel * dt;
      }
      
      if (this.rotationInput.roll === 0) {
        this.angularVelocity.z *= (1 - this.sasStrength * dt);
      } else {
        this.angularVelocity.z += this.rotationInput.roll * rotAccel * dt;
      }
    }
    
    // Apply angular velocity to rotation
    this.rotation.x += this.angularVelocity.x * dt;
    this.rotation.y += this.angularVelocity.y * dt;
    this.rotation.z += this.angularVelocity.z * dt;
  }

  /**
   * Toggle flight mode
   * @returns {string} New flight mode
   */
  toggleFlightMode() {
    const modes = Object.values(FlightMode);
    const currentIndex = modes.indexOf(this.flightMode);
    this.flightMode = modes[(currentIndex + 1) % modes.length];
    return this.flightMode;
  }

  /**
   * Set flight mode directly
   * @param {string} mode 
   */
  setFlightMode(mode) {
    if (Object.values(FlightMode).includes(mode)) {
      this.flightMode = mode;
    }
  }

  /**
   * Get velocity relative to current SOI body
   * @returns {Vector3D}
   */
  getRelativeVelocity() {
    if (!this.soiBody) {
      return this.velocity.clone();
    }
    return Vector3D.sub(this.velocity, this.soiBody.velocity);
  }

  /**
   * Get orbital speed relative to SOI body
   * @returns {number}
   */
  getOrbitalSpeed() {
    return this.getRelativeVelocity().length();
  }

  /**
   * Serialize for networking
   * @returns {Object}
   */
  serialize() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      mass: this.mass,
      radius: this.radius,
      position: this.position.toJSON(),
      velocity: this.velocity.toJSON(),
      rotation: {
        x: this.rotation.x,
        y: this.rotation.y,
        z: this.rotation.z
      },
      angularVelocity: this.angularVelocity.toJSON(),
      flightMode: this.flightMode,
      color: this.color
    };
  }

  /**
   * Deserialize from network data
   * @param {Object} data 
   */
  deserialize(data) {
    this.position = Vector3D.fromJSON(data.position);
    this.velocity = Vector3D.fromJSON(data.velocity);
    if (data.rotation) {
      this.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
    }
    if (data.angularVelocity) {
      this.angularVelocity = Vector3D.fromJSON(data.angularVelocity);
    }
    if (data.flightMode) {
      this.flightMode = data.flightMode;
    }
  }
}

export default Ship;
