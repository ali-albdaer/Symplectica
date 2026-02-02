/**
 * Fixed Timestep Game Loop
 * Decouples physics (60Hz) from rendering (variable FPS).
 * @module client/core/GameLoop
 */

import { PHYSICS_HZ, DT } from '@shared/physics/constants.js';

/**
 * @typedef {Object} LoopCallbacks
 * @property {Function} update - Called at fixed rate for physics (dt in seconds)
 * @property {Function} render - Called every frame with interpolation alpha
 * @property {Function} [onSlowDown] - Called when physics can't keep up
 */

/**
 * Fixed timestep game loop with interpolation support
 */
export class GameLoop {
  /**
   * @param {LoopCallbacks} callbacks 
   */
  constructor(callbacks) {
    /** @type {Function} */
    this.update = callbacks.update;
    
    /** @type {Function} */
    this.render = callbacks.render;
    
    /** @type {Function|null} */
    this.onSlowDown = callbacks.onSlowDown || null;
    
    /** @type {number} Fixed timestep in seconds */
    this.dt = DT;
    
    /** @type {number} Fixed timestep in milliseconds */
    this.dtMs = 1000 / PHYSICS_HZ;
    
    /** @type {number} Accumulated time for physics */
    this.accumulator = 0;
    
    /** @type {number} Last frame timestamp */
    this.lastTime = 0;
    
    /** @type {boolean} Whether loop is running */
    this.running = false;
    
    /** @type {number} Request animation frame ID */
    this.rafId = null;
    
    /** @type {number} Maximum accumulated time (prevents spiral of death) */
    this.maxAccumulator = this.dtMs * 5;
    
    /** @type {number} Frame counter */
    this.frameCount = 0;
    
    /** @type {number} Physics tick counter */
    this.tickCount = 0;
    
    /** @type {number} FPS calculation */
    this.fps = 0;
    this._fpsFrames = 0;
    this._fpsTime = 0;
    
    /** @type {number} Time scale (1.0 = real-time) */
    this.timeScale = 1.0;
    
    /** @type {boolean} Whether simulation is paused */
    this.paused = false;
    
    // Bind the loop function
    this._loop = this._loop.bind(this);
  }

  /**
   * Start the game loop
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this._fpsTime = this.lastTime;
    this._fpsFrames = 0;
    
    this.rafId = requestAnimationFrame(this._loop);
  }

  /**
   * Stop the game loop
   */
  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Pause physics simulation (rendering continues)
   */
  pause() {
    this.paused = true;
  }

  /**
   * Resume physics simulation
   */
  resume() {
    this.paused = false;
  }

  /**
   * Toggle pause state
   * @returns {boolean} New pause state
   */
  togglePause() {
    this.paused = !this.paused;
    return this.paused;
  }

  /**
   * Set time scale
   * @param {number} scale - Time multiplier (1.0 = real-time)
   */
  setTimeScale(scale) {
    this.timeScale = Math.max(0, Math.min(100, scale));
  }

  /**
   * Main loop function
   * @private
   */
  _loop(currentTime) {
    if (!this.running) return;
    
    // Calculate frame delta
    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // FPS calculation
    this._fpsFrames++;
    if (currentTime - this._fpsTime >= 1000) {
      this.fps = this._fpsFrames;
      this._fpsFrames = 0;
      this._fpsTime = currentTime;
    }
    
    // Apply time scale
    if (!this.paused) {
      frameTime *= this.timeScale;
      
      // Add to accumulator (capped to prevent spiral of death)
      this.accumulator += frameTime;
      
      if (this.accumulator > this.maxAccumulator) {
        if (this.onSlowDown) {
          this.onSlowDown(this.accumulator / this.dtMs);
        }
        this.accumulator = this.maxAccumulator;
      }
      
      // Fixed timestep physics updates
      while (this.accumulator >= this.dtMs) {
        this.update(this.dt);
        this.accumulator -= this.dtMs;
        this.tickCount++;
      }
    }
    
    // Calculate interpolation alpha for smooth rendering
    const alpha = this.paused ? 0 : this.accumulator / this.dtMs;
    
    // Render with interpolation
    this.render(alpha);
    this.frameCount++;
    
    // Schedule next frame
    this.rafId = requestAnimationFrame(this._loop);
  }

  /**
   * Get loop statistics
   * @returns {Object}
   */
  getStats() {
    return {
      fps: this.fps,
      frameCount: this.frameCount,
      tickCount: this.tickCount,
      timeScale: this.timeScale,
      paused: this.paused,
      running: this.running
    };
  }
}

export default GameLoop;
