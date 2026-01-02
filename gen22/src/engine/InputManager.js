export class InputManager {
    constructor({ canvas, onPointerLockChange }) {
        this.canvas = canvas;
        this.onPointerLockChange = onPointerLockChange;
        this.keyStates = new Map();
        this.mouseStates = new Map();
        this.mouseDelta = { x: 0, y: 0 };
        this.pointerLocked = false;
        this.initEvents();
    }

    initEvents() {
        window.addEventListener("keydown", (event) => {
            this.keyStates.set(event.key.toLowerCase(), true);
        });
        window.addEventListener("keyup", (event) => {
            this.keyStates.set(event.key.toLowerCase(), false);
        });
        this.canvas.addEventListener("click", () => {
            if (!this.pointerLocked) {
                this.canvas.requestPointerLock();
            }
        });
        document.addEventListener("pointerlockchange", () => {
            this.pointerLocked = document.pointerLockElement === this.canvas;
            if (!this.pointerLocked) {
                this.mouseDelta.x = 0;
                this.mouseDelta.y = 0;
            }
            if (this.onPointerLockChange) {
                this.onPointerLockChange(this.pointerLocked);
            }
        });
        window.addEventListener("mousedown", (event) => {
            this.mouseStates.set(`mouse${event.button}`, true);
        });
        window.addEventListener("mouseup", (event) => {
            this.mouseStates.set(`mouse${event.button}`, false);
        });
        document.addEventListener("mousemove", (event) => {
            if (!this.pointerLocked) {
                return;
            }
            this.mouseDelta.x += event.movementX;
            this.mouseDelta.y += event.movementY;
        });
    }

    isKeyDown(key) {
        const normalized = key.toLowerCase();
        if (normalized.startsWith("mouse")) {
            return Boolean(this.mouseStates.get(normalized));
        }
        return Boolean(this.keyStates.get(normalized));
    }

    consumeMouseDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        return delta;
    }

    releasePointerLock() {
        if (document.pointerLockElement === this.canvas) {
            document.exitPointerLock();
        }
    }
}
