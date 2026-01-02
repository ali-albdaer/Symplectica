export class InputManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Set();
    this.mouse = { dx: 0, dy: 0, buttons: new Set() };
    this.pointerLocked = false;
    this.onToggleMenu = null;
    this.onToggleConsole = null;
    this.onToggleCamera = null;
    this.onToggleFlight = null;
    this.onGrab = null;
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        if (this.onToggleMenu) this.onToggleMenu();
      }
      if (e.key === "/") {
        e.preventDefault();
        if (this.onToggleConsole) this.onToggleConsole();
        return;
      }
      if (e.code === "KeyV" && this.onToggleCamera) this.onToggleCamera();
      if (e.code === "KeyF" && this.onToggleFlight) this.onToggleFlight();
      this.keys.add(e.code);
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.code);
    });
    window.addEventListener("mousedown", (e) => {
      this.mouse.buttons.add(e.button);
      if (!this.pointerLocked && e.button === 0) {
        this.requestPointerLock();
      }
      if (e.button === 2 && this.onGrab) {
        e.preventDefault();
        this.onGrab();
      }
    });
    window.addEventListener("mouseup", (e) => {
      this.mouse.buttons.delete(e.button);
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.pointerLocked) return;
      this.mouse.dx += e.movementX || 0;
      this.mouse.dy += e.movementY || 0;
    });
    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.domElement;
    });
    window.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  requestPointerLock() {
    if (document.pointerLockElement !== this.domElement) {
      this.domElement.requestPointerLock();
    }
  }

  releasePointer() {
    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }
  }

  consumeMouseDelta() {
    const dx = this.mouse.dx;
    const dy = this.mouse.dy;
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    return { dx, dy };
  }

  isDown(code) {
    return this.keys.has(code);
  }
}
