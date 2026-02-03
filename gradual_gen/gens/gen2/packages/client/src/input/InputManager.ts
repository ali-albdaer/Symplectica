/**
 * Input Manager
 * =============
 * Handles keyboard and mouse input for player control.
 * Generates PlayerInputState for server/client physics.
 */

import { PlayerInputState } from '@space-sim/shared';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  boost: boolean;
  jump: boolean;
  interact: boolean;
  toggleCamera: boolean;
  pause: boolean;
  chat: boolean;
  mouseX: number;
  mouseY: number;
  mouseDeltaX: number;
  mouseDeltaY: number;
  mouseButtons: [boolean, boolean, boolean];
  scroll: number;
}

export class InputManager {
  private state: InputState;
  private prevState: InputState;
  private canvas: HTMLCanvasElement;
  private isPointerLocked: boolean = false;

  // Key bindings
  private keyBindings: Map<string, keyof InputState> = new Map([
    ['KeyW', 'forward'],
    ['KeyS', 'backward'],
    ['KeyA', 'left'],
    ['KeyD', 'right'],
    ['Space', 'up'],
    ['ShiftLeft', 'down'],
    ['ControlLeft', 'boost'],
    ['KeyE', 'jump'],
    ['KeyF', 'interact'],
    ['KeyC', 'toggleCamera'],
    ['Escape', 'pause'],
    ['Enter', 'chat'],
    ['KeyT', 'chat'],
  ]);

  // Mouse sensitivity
  public mouseSensitivity: number = 0.002;

  // Callbacks
  public onPointerLock?: (locked: boolean) => void;
  public onPauseToggle?: () => void;
  public onChatToggle?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.state = this.createEmptyState();
    this.prevState = this.createEmptyState();

    this.setupEventListeners();
  }

  private createEmptyState(): InputState {
    return {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      boost: false,
      jump: false,
      interact: false,
      toggleCamera: false,
      pause: false,
      chat: false,
      mouseX: 0,
      mouseY: 0,
      mouseDeltaX: 0,
      mouseDeltaY: 0,
      mouseButtons: [false, false, false],
      scroll: 0,
    };
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse events
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

    // Pointer lock
    this.canvas.addEventListener('click', () => {
      if (!this.isPointerLocked && document.activeElement !== document.querySelector('#chat-input')) {
        this.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', this.handlePointerLockChange.bind(this));
    document.addEventListener('pointerlockerror', () => {
      console.error('Pointer lock error');
    });

    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Don't capture input when typing in chat
    if (document.activeElement?.id === 'chat-input') {
      if (event.code === 'Escape') {
        (document.activeElement as HTMLElement).blur();
        this.requestPointerLock();
      }
      return;
    }

    const binding = this.keyBindings.get(event.code);
    if (binding && typeof this.state[binding] === 'boolean') {
      (this.state[binding] as boolean) = true;

      // Handle special keys
      if (binding === 'pause' && !this.prevState.pause) {
        this.onPauseToggle?.();
        this.exitPointerLock();
      }
      if (binding === 'chat' && !this.prevState.chat) {
        this.onChatToggle?.();
        this.exitPointerLock();
      }

      event.preventDefault();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (document.activeElement?.id === 'chat-input') {
      return;
    }

    const binding = this.keyBindings.get(event.code);
    if (binding && typeof this.state[binding] === 'boolean') {
      (this.state[binding] as boolean) = false;
      event.preventDefault();
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button < 3) {
      this.state.mouseButtons[event.button] = true;
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (event.button < 3) {
      this.state.mouseButtons[event.button] = false;
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (this.isPointerLocked) {
      this.state.mouseDeltaX += event.movementX * this.mouseSensitivity;
      this.state.mouseDeltaY += event.movementY * this.mouseSensitivity;
    }

    this.state.mouseX = event.clientX;
    this.state.mouseY = event.clientY;
  }

  private handleWheel(event: WheelEvent): void {
    this.state.scroll += event.deltaY > 0 ? 1 : -1;
    event.preventDefault();
  }

  private handlePointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.canvas;
    this.onPointerLock?.(this.isPointerLocked);
  }

  /**
   * Request pointer lock on the canvas
   */
  requestPointerLock(): void {
    this.canvas.requestPointerLock();
  }

  /**
   * Exit pointer lock
   */
  exitPointerLock(): void {
    document.exitPointerLock();
  }

  /**
   * Get current input state
   */
  getState(): InputState {
    return { ...this.state };
  }

  /**
   * Get mouse delta and reset
   */
  getMouseDelta(): { x: number; y: number } {
    const delta = {
      x: this.state.mouseDeltaX,
      y: this.state.mouseDeltaY,
    };

    // Reset deltas
    this.state.mouseDeltaX = 0;
    this.state.mouseDeltaY = 0;

    return delta;
  }

  /**
   * Get scroll and reset
   */
  getScroll(): number {
    const scroll = this.state.scroll;
    this.state.scroll = 0;
    return scroll;
  }

  /**
   * Convert to PlayerInputState for network/physics
   */
  toPlayerInputState(sequence: number): PlayerInputState {
    return {
      sequence,
      forward: this.state.forward,
      backward: this.state.backward,
      left: this.state.left,
      right: this.state.right,
      up: this.state.up,
      down: this.state.down,
      jump: this.state.jump,
      sprint: this.state.boost,
      pitchUp: this.state.mouseDeltaY > 0,
      pitchDown: this.state.mouseDeltaY < 0,
      yawLeft: this.state.mouseDeltaX < 0,
      yawRight: this.state.mouseDeltaX > 0,
      rollLeft: false,
      rollRight: false,
      thrustX: 0,
      thrustY: 0,
      thrustZ: 0,
      primaryAction: false,
      secondaryAction: false,
      cameraYaw: this.state.mouseDeltaX,
      cameraYitch: this.state.mouseDeltaY,
    };
  }

  /**
   * Update (call each frame at end)
   */
  endFrame(): void {
    // Store previous state for edge detection
    this.prevState = { ...this.state };

    // Reset one-shot inputs
    this.state.toggleCamera = false;
    this.state.jump = false;
    this.state.interact = false;
  }

  /**
   * Check if a key was just pressed (rising edge)
   */
  wasJustPressed(key: keyof InputState): boolean {
    return this.state[key] === true && this.prevState[key] === false;
  }

  /**
   * Check if a key was just released (falling edge)
   */
  wasJustReleased(key: keyof InputState): boolean {
    return this.state[key] === false && this.prevState[key] === true;
  }

  /**
   * Is pointer locked?
   */
  isLocked(): boolean {
    return this.isPointerLocked;
  }

  /**
   * Dispose
   */
  dispose(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    // Note: Other listeners are on canvas which will be cleaned up when canvas is removed
  }
}
