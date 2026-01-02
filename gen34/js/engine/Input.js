export class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = { x: 0, y: 0, dx: 0, dy: 0, leftDown: false, rightDown: false };
        this.isPointerLocked = false;

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        
        document.getElementById('game-container').addEventListener('click', () => {
            if (!this.isPointerLocked) {
                document.body.requestPointerLock();
            }
        });
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
        if (e.button === 0) this.mouse.leftDown = true;
        if (e.button === 2) this.mouse.rightDown = true;
    }

    onMouseUp(e) {
        if (e.button === 0) this.mouse.leftDown = false;
        if (e.button === 2) this.mouse.rightDown = false;
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    getMouseDelta() {
        const delta = { x: this.mouse.dx, y: this.mouse.dy };
        this.mouse.dx = 0;
        this.mouse.dy = 0;
        return delta;
    }
}
