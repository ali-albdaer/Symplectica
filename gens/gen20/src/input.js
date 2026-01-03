export class Input {
  constructor(canvas, { onPointerLockChange } = {}) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;
    this.onPointerLockChange = onPointerLockChange;
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.pointerLocked) return;
      this.mouseDelta.x += e.movementX || 0;
      this.mouseDelta.y += e.movementY || 0;
    });

    window.addEventListener("pointerlockchange", () => {
      const locked = document.pointerLockElement === this.canvas;
      this.pointerLocked = locked;
      if (this.onPointerLockChange) this.onPointerLockChange(locked);
    });

    this.canvas.addEventListener("click", () => {
      if (!this.pointerLocked) this.canvas.requestPointerLock();
    });
  }

  consumeMouseDelta() {
    const d = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return d;
  }

  isDown(key) {
    return this.keys.has(key.toLowerCase());
  }
}
