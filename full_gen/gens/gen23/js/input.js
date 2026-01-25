class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, dx: 0, dy: 0, left: false, right: false };
        this.isPointerLocked = false;

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    onMouseMove(e) {
        if (this.isPointerLocked) {
            this.mouse.dx = e.movementX;
            this.mouse.dy = e.movementY;
        }
    }

    onMouseDown(e) {
        if (e.button === 0) this.mouse.left = true;
        if (e.button === 2) this.mouse.right = true;
    }

    onMouseUp(e) {
        if (e.button === 0) this.mouse.left = false;
        if (e.button === 2) this.mouse.right = false;
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    exitPointerLock() {
        document.exitPointerLock();
    }

    update() {
        // Reset deltas after frame
        this.mouse.dx = 0;
        this.mouse.dy = 0;
    }
}

window.InputManager = InputManager;
