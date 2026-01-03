export class Input {
    constructor() {
        this.keys = {};
        this.isLocked = false;
        this.mouseX = 0;
        this.mouseY = 0;

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', () => {
            if (!this.isLocked) document.body.requestPointerLock();
        });
    }

    onKeyDown(e) {
        this.keys[e.code] = true;
    }

    onKeyUp(e) {
        this.keys[e.code] = false;
    }

    onPointerLockChange() {
        this.isLocked = document.pointerLockElement === document.body;
    }

    onMouseMove(e) {
        if (this.isLocked) {
            this.mouseX = e.movementX;
            this.mouseY = e.movementY;
        }
    }

    isPressed(code) {
        return !!this.keys[code];
    }

    getMouseDelta() {
        const delta = { x: this.mouseX, y: this.mouseY };
        this.mouseX = 0;
        this.mouseY = 0;
        return delta;
    }
}