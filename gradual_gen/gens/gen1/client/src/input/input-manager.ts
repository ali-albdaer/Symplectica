/**
 * Input Manager
 * 
 * Handles keyboard and mouse input for player controls
 * 
 * @module input
 */

import type { PlayerInput } from '@nbody/shared';

export interface InputState {
  // Movement
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  
  // Actions
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  interact: boolean;
  
  // Mouse
  mouseX: number;
  mouseY: number;
  mouseDeltaX: number;
  mouseDeltaY: number;
  mouseButton: number; // 0 = none, 1 = left, 2 = right, 3 = middle
  
  // Look direction
  pitch: number;
  yaw: number;
}

export class InputManager {
  private state: InputState;
  private pointerLocked: boolean = false;
  private sensitivity: number = 0.002;
  private canvas: HTMLCanvasElement;
  
  // Callbacks
  private onChatOpen: (() => void) | null = null;
  private onEscape: (() => void) | null = null;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    
    this.state = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      sprint: false,
      crouch: false,
      interact: false,
      mouseX: 0,
      mouseY: 0,
      mouseDeltaX: 0,
      mouseDeltaY: 0,
      mouseButton: 0,
      pitch: 0,
      yaw: 0
    };
    
    this.setupEventListeners();
  }
  
  private setupEventListeners(): void {
    // Keyboard
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // Mouse
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Pointer lock
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    this.canvas.addEventListener('click', this.requestPointerLock.bind(this));
  }
  
  private onKeyDown(event: KeyboardEvent): void {
    // Don't capture input if typing in chat
    if (document.activeElement?.tagName === 'INPUT') {
      if (event.key === 'Escape') {
        (document.activeElement as HTMLInputElement).blur();
        event.preventDefault();
      }
      return;
    }
    
    switch (event.code) {
      case 'KeyW': this.state.forward = true; break;
      case 'KeyS': this.state.backward = true; break;
      case 'KeyA': this.state.left = true; break;
      case 'KeyD': this.state.right = true; break;
      case 'Space':
        this.state.jump = true;
        event.preventDefault();
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.state.sprint = true;
        break;
      case 'ControlLeft':
      case 'ControlRight':
        this.state.crouch = true;
        break;
      case 'KeyE': this.state.interact = true; break;
      case 'Enter':
        if (this.onChatOpen) {
          this.onChatOpen();
          event.preventDefault();
        }
        break;
      case 'Escape':
        if (this.onEscape) {
          this.onEscape();
        }
        break;
    }
  }
  
  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case 'KeyW': this.state.forward = false; break;
      case 'KeyS': this.state.backward = false; break;
      case 'KeyA': this.state.left = false; break;
      case 'KeyD': this.state.right = false; break;
      case 'Space': this.state.jump = false; break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.state.sprint = false;
        break;
      case 'ControlLeft':
      case 'ControlRight':
        this.state.crouch = false;
        break;
      case 'KeyE': this.state.interact = false; break;
    }
  }
  
  private onMouseMove(event: MouseEvent): void {
    if (!this.pointerLocked) return;
    
    this.state.mouseDeltaX = event.movementX;
    this.state.mouseDeltaY = event.movementY;
    
    // Update look direction (positive = camera moves right/up relative to view)
    this.state.yaw += event.movementX * this.sensitivity;
    this.state.pitch += event.movementY * this.sensitivity;
    
    // Clamp pitch to prevent flipping
    this.state.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.state.pitch));
  }
  
  private onMouseDown(event: MouseEvent): void {
    this.state.mouseButton = event.button + 1;
  }
  
  private onMouseUp(_event: MouseEvent): void {
    this.state.mouseButton = 0;
  }
  
  private onPointerLockChange(): void {
    this.pointerLocked = document.pointerLockElement === this.canvas;
  }
  
  /**
   * Request pointer lock
   */
  requestPointerLock(): void {
    // Don't lock if clicking on UI elements
    const uiOverlay = document.getElementById('ui-overlay');
    const activeModal = uiOverlay?.querySelector('.modal:not(.hidden)');
    if (activeModal) {
      return; // Don't capture pointer when modal is open
    }
    
    if (!this.pointerLocked) {
      this.canvas.requestPointerLock();
    }
  }
  
  /**
   * Exit pointer lock
   */
  exitPointerLock(): void {
    if (this.pointerLocked) {
      document.exitPointerLock();
    }
  }
  
  /**
   * Check if pointer is locked
   */
  isPointerLocked(): boolean {
    return this.pointerLocked;
  }
  
  /**
   * Get current input state
   */
  getState(): Readonly<InputState> {
    return this.state;
  }
  
  /**
   * Get movement direction as normalized vector
   */
  getMovementDirection(): [number, number, number] {
    let x = 0;
    let y = 0;
    let z = 0;
    
    if (this.state.forward) z -= 1;
    if (this.state.backward) z += 1;
    if (this.state.left) x -= 1;
    if (this.state.right) x += 1;
    if (this.state.up) y += 1;
    if (this.state.down) y -= 1;
    
    // Normalize
    const length = Math.sqrt(x * x + y * y + z * z);
    if (length > 0) {
      x /= length;
      y /= length;
      z /= length;
    }
    
    return [x, y, z];
  }
  
  /**
   * Get look direction
   */
  getLookDirection(): [number, number] {
    return [this.state.pitch, this.state.yaw];
  }
  
  /**
   * Convert to PlayerInput for network
   */
  toPlayerInput(): PlayerInput {
    return {
      moveDirection: this.getMovementDirection(),
      lookDirection: this.getLookDirection(),
      jump: this.state.jump,
      sprint: this.state.sprint,
      crouch: this.state.crouch,
      interact: this.state.interact,
      timestamp: Date.now()
    };
  }
  
  /**
   * Set chat open callback
   */
  setOnChatOpen(callback: () => void): void {
    this.onChatOpen = callback;
  }
  
  /**
   * Set escape callback
   */
  setOnEscape(callback: () => void): void {
    this.onEscape = callback;
  }
  
  /**
   * Enable input handling
   */
  enable(): void {
    this.requestPointerLock();
  }
  
  /**
   * Update input state (call each frame)
   */
  update(_deltaTime: number): void {
    // Reset one-frame actions
    this.state.jump = false;
    this.state.interact = false;
    this.resetDeltas();
  }
  
  /**
   * Get current yaw
   */
  getYaw(): number {
    return this.state.yaw;
  }
  
  /**
   * Get current pitch
   */
  getPitch(): number {
    return this.state.pitch;
  }
  
  /**
   * Reset delta values (call after processing)
   */
  resetDeltas(): void {
    this.state.mouseDeltaX = 0;
    this.state.mouseDeltaY = 0;
  }
  
  /**
   * Dispose event listeners
   */
  dispose(): void {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('mousedown', this.onMouseDown.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }
}
