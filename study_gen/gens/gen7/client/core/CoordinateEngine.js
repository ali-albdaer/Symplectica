/**
 * Floating Origin Coordinate Engine
 * Camera is always at origin; universe shifts around it.
 * Maintains Float64 precision for physics, Float32 for rendering.
 * @module client/core/CoordinateEngine
 */

import { Vector3D } from '@shared/math/Vector3D.js';
import { RENDER_SCALE } from '@shared/physics/constants.js';

/**
 * Manages the floating origin coordinate system
 */
export class CoordinateEngine {
  constructor() {
    /**
     * Absolute position of the camera/player in SI units (meters)
     * Stored in Float64 for precision
     * @type {Vector3D}
     */
    this.absoluteOrigin = new Vector3D(0, 0, 0);
    
    /**
     * The body that the camera is tracking/following
     * @type {string|null}
     */
    this.focusBodyId = null;
    
    /**
     * Offset from focused body (for camera orbit)
     * @type {Vector3D}
     */
    this.focusOffset = new Vector3D(0, 0, 0);
    
    /**
     * Scale factor for rendering (meters per render unit)
     * @type {number}
     */
    this.renderScale = RENDER_SCALE;
    
    /**
     * Whether to auto-adjust scale based on nearest body
     * @type {boolean}
     */
    this.autoScale = true;
    
    /**
     * Minimum render scale (for close-up views)
     * @type {number}
     */
    this.minScale = 1e3; // 1 km per unit
    
    /**
     * Maximum render scale (for system-wide views)
     * @type {number}
     */
    this.maxScale = 1e10; // 10 million km per unit
  }

  /**
   * Set the absolute origin (camera's real position in space)
   * @param {Vector3D} position - Position in meters
   */
  setOrigin(position) {
    this.absoluteOrigin.copy(position);
  }

  /**
   * Set focus to track a specific body
   * @param {string} bodyId - ID of body to track
   * @param {Vector3D} [offset] - Offset from body center
   */
  setFocus(bodyId, offset = null) {
    this.focusBodyId = bodyId;
    if (offset) {
      this.focusOffset.copy(offset);
    }
  }

  /**
   * Update origin to track focused body
   * @param {Map<string, Object>} bodies - Body map from simulation
   */
  updateFromFocus(bodies) {
    if (!this.focusBodyId) return;
    
    const body = bodies.get(this.focusBodyId);
    if (!body) return;
    
    // Set origin to body position + offset
    this.absoluteOrigin.x = body.position.x + this.focusOffset.x;
    this.absoluteOrigin.y = body.position.y + this.focusOffset.y;
    this.absoluteOrigin.z = body.position.z + this.focusOffset.z;
    
    // Auto-scale based on body radius
    if (this.autoScale) {
      this.renderScale = Math.max(this.minScale, body.radius * 0.01);
      this.renderScale = Math.min(this.maxScale, this.renderScale);
    }
  }

  /**
   * Convert absolute SI position to render-space coordinates
   * Result is relative to the floating origin, scaled for rendering
   * @param {Vector3D} absolutePos - Absolute position in meters
   * @param {Object} [output] - Optional Three.js Vector3 to write to
   * @returns {{x: number, y: number, z: number}}
   */
  toRenderSpace(absolutePos, output = null) {
    // Calculate position relative to origin
    const relX = absolutePos.x - this.absoluteOrigin.x;
    const relY = absolutePos.y - this.absoluteOrigin.y;
    const relZ = absolutePos.z - this.absoluteOrigin.z;
    
    // Scale to render units
    const x = relX / this.renderScale;
    const y = relY / this.renderScale;
    const z = relZ / this.renderScale;
    
    if (output) {
      output.x = x;
      output.y = y;
      output.z = z;
      return output;
    }
    
    return { x, y, z };
  }

  /**
   * Convert render-space coordinates to absolute SI position
   * @param {{x: number, y: number, z: number}} renderPos 
   * @returns {Vector3D}
   */
  toAbsoluteSpace(renderPos) {
    return new Vector3D(
      renderPos.x * this.renderScale + this.absoluteOrigin.x,
      renderPos.y * this.renderScale + this.absoluteOrigin.y,
      renderPos.z * this.renderScale + this.absoluteOrigin.z
    );
  }

  /**
   * Get distance from origin to a position (in meters)
   * @param {Vector3D} absolutePos 
   * @returns {number}
   */
  distanceFromOrigin(absolutePos) {
    return this.absoluteOrigin.distanceTo(absolutePos);
  }

  /**
   * Calculate render-space radius for a body
   * @param {number} radiusMeters - Radius in meters
   * @returns {number} Radius in render units
   */
  scaleRadius(radiusMeters) {
    return radiusMeters / this.renderScale;
  }

  /**
   * Calculate SI radius from render-space
   * @param {number} renderRadius 
   * @returns {number}
   */
  unscaleRadius(renderRadius) {
    return renderRadius * this.renderScale;
  }

  /**
   * Set render scale manually (disables auto-scale)
   * @param {number} scale - Meters per render unit
   */
  setRenderScale(scale) {
    this.renderScale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    this.autoScale = false;
  }

  /**
   * Zoom in/out by factor
   * @param {number} factor - Zoom factor (>1 zooms in, <1 zooms out)
   */
  zoom(factor) {
    this.renderScale /= factor;
    this.renderScale = Math.max(this.minScale, Math.min(this.maxScale, this.renderScale));
    this.autoScale = false;
  }

  /**
   * Get current state for debugging
   * @returns {Object}
   */
  getDebugInfo() {
    return {
      origin: this.absoluteOrigin.toString(),
      renderScale: this.renderScale.toExponential(2),
      focusBody: this.focusBodyId,
      autoScale: this.autoScale
    };
  }
}

export default CoordinateEngine;
