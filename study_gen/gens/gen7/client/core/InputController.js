/**
 * Input Controller
 * Handles keyboard and mouse input for ship control.
 * @module client/core/InputController
 */

/**
 * @typedef {Object} InputState
 * @property {number} thrust - Forward/backward thrust (-1 to 1)
 * @property {number} strafeX - Left/right strafe (-1 to 1)
 * @property {number} strafeY - Up/down strafe (-1 to 1)
 * @property {number} pitch - Pitch rotation (-1 to 1)
 * @property {number} yaw - Yaw rotation (-1 to 1)
 * @property {number} roll - Roll rotation (-1 to 1)
 * @property {boolean} boost - Boost modifier
 */

/**
 * Input controller for ship movement
 */
export class InputController {
  /**
   * @param {HTMLElement} element - Element to attach listeners to
   */
  constructor(element) {
    this.element = element;
    
    /** @type {Set<string>} Currently pressed keys */
    this.keysDown = new Set();
    
    /** @type {boolean} Whether mouse is captured */
    this.mouseCaptured = false;
    
    /** @type {{x: number, y: number}} Mouse movement delta */
    this.mouseDelta = { x: 0, y: 0 };
    
    /** @type {number} Mouse sensitivity */
    this.mouseSensitivity = 0.002;
    
    /** @type {number} Keyboard input smoothing */
    this.inputSmoothing = 0.2;
    
    /** @type {InputState} Current smoothed input state */
    this.state = {
      thrust: 0,
      strafeX: 0,
      strafeY: 0,
      pitch: 0,
      yaw: 0,
      roll: 0,
      boost: false
    };
    
    /** @type {InputState} Target input state (raw) */
    this._targetState = { ...this.state };
    
    // Callbacks
    this.onToggleSAS = null;
    this.onTogglePause = null;
    this.onZoom = null;
    
    // Bind handlers
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    
    this._attachListeners();
  }

  /**
   * Attach event listeners
   * @private
   */
  _attachListeners() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('keyup', this._onKeyUp);
    this.element.addEventListener('mousedown', this._onMouseDown);
    this.element.addEventListener('mousemove', this._onMouseMove);
    this.element.addEventListener('wheel', this._onWheel);
    document.addEventListener('pointerlockchange', this._onPointerLockChange);
  }

  /**
   * Handle key down
   * @private
   */
  _onKeyDown(event) {
    // Ignore if typing in input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
      return;
    }
    
    this.keysDown.add(event.code);
    
    // Toggle SAS
    if (event.code === 'Tab') {
      event.preventDefault();
      if (this.onToggleSAS) this.onToggleSAS();
    }
    
    // Pause
    if (event.code === 'KeyP' || event.code === 'Escape') {
      if (this.onTogglePause) this.onTogglePause();
    }
  }

  /**
   * Handle key up
   * @private
   */
  _onKeyUp(event) {
    this.keysDown.delete(event.code);
  }

  /**
   * Handle mouse down (capture pointer)
   * @private
   */
  _onMouseDown(event) {
    if (!this.mouseCaptured) {
      this.element.requestPointerLock();
    }
  }

  /**
   * Handle mouse move
   * @private
   */
  _onMouseMove(event) {
    if (this.mouseCaptured) {
      this.mouseDelta.x += event.movementX;
      this.mouseDelta.y += event.movementY;
    }
  }

  /**
   * Handle mouse wheel (zoom)
   * @private
   */
  _onWheel(event) {
    event.preventDefault();
    if (this.onZoom) {
      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      this.onZoom(zoomFactor);
    }
  }

  /**
   * Handle pointer lock change
   * @private
   */
  _onPointerLockChange() {
    this.mouseCaptured = document.pointerLockElement === this.element;
  }

  /**
   * Update input state (call each frame)
   * @param {number} dt - Delta time in seconds
   * @returns {InputState}
   */
  update(dt) {
    // Read keyboard state
    this._targetState.thrust = 0;
    this._targetState.strafeX = 0;
    this._targetState.strafeY = 0;
    this._targetState.roll = 0;
    
    // Forward/backward (W/S or Up/Down)
    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) {
      this._targetState.thrust = 1;
    }
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) {
      this._targetState.thrust = -1;
    }
    
    // Strafe left/right (A/D or Left/Right)
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) {
      this._targetState.strafeX = -1;
    }
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) {
      this._targetState.strafeX = 1;
    }
    
    // Strafe up/down (Space/Ctrl)
    if (this.keysDown.has('Space')) {
      this._targetState.strafeY = 1;
    }
    if (this.keysDown.has('ControlLeft') || this.keysDown.has('ControlRight')) {
      this._targetState.strafeY = -1;
    }
    
    // Roll (Q/E)
    if (this.keysDown.has('KeyQ')) {
      this._targetState.roll = -1;
    }
    if (this.keysDown.has('KeyE')) {
      this._targetState.roll = 1;
    }
    
    // Boost (Shift)
    this._targetState.boost = this.keysDown.has('ShiftLeft') || this.keysDown.has('ShiftRight');
    
    // Mouse for pitch/yaw
    this._targetState.pitch = -this.mouseDelta.y * this.mouseSensitivity;
    this._targetState.yaw = -this.mouseDelta.x * this.mouseSensitivity;
    
    // Clamp mouse input
    this._targetState.pitch = Math.max(-1, Math.min(1, this._targetState.pitch));
    this._targetState.yaw = Math.max(-1, Math.min(1, this._targetState.yaw));
    
    // Reset mouse delta
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    
    // Smooth interpolation
    const smoothFactor = 1 - Math.exp(-this.inputSmoothing / dt);
    
    this.state.thrust += (this._targetState.thrust - this.state.thrust) * smoothFactor;
    this.state.strafeX += (this._targetState.strafeX - this.state.strafeX) * smoothFactor;
    this.state.strafeY += (this._targetState.strafeY - this.state.strafeY) * smoothFactor;
    this.state.roll += (this._targetState.roll - this.state.roll) * smoothFactor;
    this.state.boost = this._targetState.boost;
    
    // Mouse input is already frame-based, don't smooth
    this.state.pitch = this._targetState.pitch;
    this.state.yaw = this._targetState.yaw;
    
    return this.state;
  }

  /**
   * Check if a key is currently pressed
   * @param {string} code - Key code
   * @returns {boolean}
   */
  isKeyDown(code) {
    return this.keysDown.has(code);
  }

  /**
   * Dispose and remove listeners
   */
  dispose() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('keyup', this._onKeyUp);
    this.element.removeEventListener('mousedown', this._onMouseDown);
    this.element.removeEventListener('mousemove', this._onMouseMove);
    this.element.removeEventListener('wheel', this._onWheel);
    document.removeEventListener('pointerlockchange', this._onPointerLockChange);
    
    if (document.pointerLockElement === this.element) {
      document.exitPointerLock();
    }
  }
}

export default InputController;
