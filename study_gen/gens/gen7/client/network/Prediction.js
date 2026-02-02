/**
 * Client-Side Prediction
 * Runs local physics for responsive feel while waiting for server confirmation.
 * @module client/network/Prediction
 */

import { Vector3D } from '@shared/math/Vector3D.js';
import { NBodySimulation } from '@shared/physics/nbody.js';

/**
 * Manages client-side prediction and server reconciliation
 */
export class ClientPrediction {
  constructor() {
    /** @type {Object[]} Input history for reconciliation */
    this.inputHistory = [];
    
    /** @type {number} Maximum inputs to store */
    this.maxHistoryLength = 60;
    
    /** @type {number} Last acknowledged server tick */
    this.lastAckedTick = 0;
    
    /** @type {Object|null} Last predicted ship state */
    this.predictedState = null;
    
    /** @type {boolean} Whether prediction is enabled */
    this.enabled = true;
    
    /** @type {number} Correction smoothing factor */
    this.smoothingFactor = 0.1;
  }

  /**
   * Record an input for later reconciliation
   * @param {number} tick - Local tick number
   * @param {Object} input - Input state
   * @param {Object} shipState - Ship state after applying input
   */
  recordInput(tick, input, shipState) {
    this.inputHistory.push({
      tick,
      input: { ...input },
      state: {
        position: shipState.position.clone(),
        velocity: shipState.velocity.clone(),
        rotation: { ...shipState.rotation }
      }
    });
    
    // Trim old history
    while (this.inputHistory.length > this.maxHistoryLength) {
      this.inputHistory.shift();
    }
  }

  /**
   * Reconcile local prediction with server state
   * @param {Object} serverState - Server authoritative state for player
   * @param {number} serverTick - Server tick number
   * @param {Object} localShip - Local ship to correct
   * @param {Object[]} massiveBodies - Bodies for re-simulation
   * @param {number} dt - Timestep
   */
  reconcile(serverState, serverTick, localShip, massiveBodies, dt) {
    if (!this.enabled) {
      // Direct snap to server state
      localShip.position = Vector3D.fromJSON(serverState.position);
      localShip.velocity = Vector3D.fromJSON(serverState.velocity);
      return;
    }
    
    // Find the input at server tick
    const serverInputIndex = this.inputHistory.findIndex(
      h => h.tick === serverTick
    );
    
    if (serverInputIndex === -1) {
      // No matching input, just accept server state with smoothing
      this._smoothCorrection(localShip, serverState);
      return;
    }
    
    // Check if prediction was accurate
    const predictedAtTick = this.inputHistory[serverInputIndex].state;
    const posError = this._positionError(predictedAtTick.position, serverState.position);
    
    // Threshold for accepting prediction (1 meter)
    if (posError < 1) {
      // Prediction was good, no correction needed
      this.lastAckedTick = serverTick;
      return;
    }
    
    // Re-simulate from server state
    console.log(`[Prediction] Reconciling from tick ${serverTick}, error: ${posError.toFixed(1)}m`);
    
    // Set ship to server state
    const reconciledShip = {
      position: Vector3D.fromJSON(serverState.position),
      velocity: Vector3D.fromJSON(serverState.velocity),
      rotation: serverState.rotation ? { ...serverState.rotation } : { ...localShip.rotation },
      mass: localShip.mass,
      id: localShip.id
    };
    
    // Re-apply inputs after server tick
    for (let i = serverInputIndex + 1; i < this.inputHistory.length; i++) {
      const historyEntry = this.inputHistory[i];
      this._applyInput(reconciledShip, historyEntry.input, massiveBodies, dt);
    }
    
    // Smooth correction to avoid jerky movement
    this._smoothCorrection(localShip, {
      position: reconciledShip.position.toJSON(),
      velocity: reconciledShip.velocity.toJSON()
    });
    
    this.lastAckedTick = serverTick;
  }

  /**
   * Calculate position error
   * @private
   */
  _positionError(posA, posB) {
    const dx = posA.x - (posB.x || posB._data?.[0] || 0);
    const dy = posA.y - (posB.y || posB._data?.[1] || 0);
    const dz = posA.z - (posB.z || posB._data?.[2] || 0);
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

  /**
   * Apply smooth correction
   * @private
   */
  _smoothCorrection(ship, targetState) {
    const targetPos = targetState.position;
    const targetVel = targetState.velocity;
    
    // Lerp position
    ship.position.x += (targetPos.x - ship.position.x) * this.smoothingFactor;
    ship.position.y += (targetPos.y - ship.position.y) * this.smoothingFactor;
    ship.position.z += (targetPos.z - ship.position.z) * this.smoothingFactor;
    
    // Lerp velocity
    ship.velocity.x += (targetVel.x - ship.velocity.x) * this.smoothingFactor;
    ship.velocity.y += (targetVel.y - ship.velocity.y) * this.smoothingFactor;
    ship.velocity.z += (targetVel.z - ship.velocity.z) * this.smoothingFactor;
  }

  /**
   * Apply input to ship (simplified physics for reconciliation)
   * @private
   */
  _applyInput(ship, input, massiveBodies, dt) {
    const G = 6.67430e-11;
    const thrust = 50000;
    
    // Gravity
    for (const body of massiveBodies) {
      const dx = body.position.x - ship.position.x;
      const dy = body.position.y - ship.position.y;
      const dz = body.position.z - ship.position.z;
      
      const distSq = dx*dx + dy*dy + dz*dz;
      const dist = Math.sqrt(distSq);
      const accel = (G * body.mass) / distSq;
      
      ship.velocity.x += (dx / dist) * accel * dt;
      ship.velocity.y += (dy / dist) * accel * dt;
      ship.velocity.z += (dz / dist) * accel * dt;
    }
    
    // Thrust (simplified)
    if (input.thrust) {
      const accel = input.thrust * thrust / ship.mass;
      ship.velocity.z += accel * dt; // Forward
    }
    
    // Update position
    ship.position.x += ship.velocity.x * dt;
    ship.position.y += ship.velocity.y * dt;
    ship.position.z += ship.velocity.z * dt;
  }

  /**
   * Clear input history
   */
  clear() {
    this.inputHistory = [];
    this.lastAckedTick = 0;
  }
}

export default ClientPrediction;
