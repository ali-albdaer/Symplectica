export class Input {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.canvas = canvas;

    this.keys = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.mouseButtons = new Set();

    this.pointerLocked = false;

    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    canvas.addEventListener('mousedown', (e) => {
      this.mouseButtons.add(e.button);
    });

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.delete(e.button);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
    });

    // Prevent context menu for RMB interaction.
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  consumeMouseDelta() {
    const d = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return d;
  }

  isDown(code) {
    return this.keys.has(code);
  }

  isMouseDown(button) {
    return this.mouseButtons.has(button);
  }

  async lockPointer() {
    if (this.pointerLocked) return;
    await this.canvas.requestPointerLock();
  }

  async unlockPointer() {
    if (!this.pointerLocked) return;
    document.exitPointerLock();
  }
}
