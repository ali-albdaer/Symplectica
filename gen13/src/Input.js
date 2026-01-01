export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Map();
    this.mouseDelta = { x: 0, y: 0 };
    this.pointerLocked = false;
    this.rightMouseDown = false;
    this.onLockChange = null;
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
    });

    this.canvas.addEventListener('click', () => {
      if (!this.pointerLocked) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      if (!this.pointerLocked) {
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
      }
      if (this.onLockChange) this.onLockChange(this.pointerLocked);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) this.rightMouseDown = true;
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) this.rightMouseDown = false;
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  consumeMouseDelta() {
    const dx = this.mouseDelta.x;
    const dy = this.mouseDelta.y;
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return { dx, dy };
  }

  isKeyDown(code) {
    return this.keys.get(code) === true;
  }
}
