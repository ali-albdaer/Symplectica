export class PointerLockManager {
  constructor({ canvas, promptId = "pointer-prompt" }) {
    this.canvas = canvas;
    this.prompt = document.getElementById(promptId);
    this.isLocked = false;
    this.listeners = new Set();
    this.setup();
  }

  setup() {
    document.addEventListener("pointerlockchange", () => this.handleChange());
    this.canvas.addEventListener("click", () => {
      if (!this.isLocked) {
        this.canvas.requestPointerLock();
      }
    });
    this.showPrompt();
  }

  onChange(callback) {
    this.listeners.add(callback);
  }

  handleChange() {
    this.isLocked = document.pointerLockElement === this.canvas;
    if (this.isLocked) {
      this.hidePrompt();
    } else {
      this.showPrompt();
    }
    this.listeners.forEach((cb) => cb(this.isLocked));
  }

  release() {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  }

  showPrompt() {
    if (this.prompt) {
      this.prompt.style.display = "block";
    }
  }

  hidePrompt() {
    if (this.prompt) {
      this.prompt.style.display = "none";
    }
  }
}
