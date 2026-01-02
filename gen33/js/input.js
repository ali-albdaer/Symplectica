export class InputHandler {
    constructor() {
        this.keys = {};
        this.prevKeys = {};
        this.mouseDelta = { x: 0, y: 0 };
        this.isPointerLocked = false;

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('pointerlockchange', () => this.onPointerLockChange());
        
        document.addEventListener('click', () => {
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
            this.mouseDelta.x += e.movementX;
            this.mouseDelta.y += e.movementY;
        }
    }

    onPointerLockChange() {
        this.isPointerLocked = document.pointerLockElement === document.body;
    }

    update() {
        // Copy current keys to prevKeys for edge detection
        this.prevKeys = { ...this.keys };
    }
    
    // Call this at the END of the frame to clear one-frame states if needed
    // But for prevKeys we do it at start of update usually.
    // Actually, let's just rely on the main loop calling update() BEFORE processing logic
    // Wait, if I copy keys to prevKeys in update(), then in the game loop:
    // 1. Input.update() -> prev = current
    // 2. Game Logic -> checks keys vs prevKeys (they are same!) -> FAIL
    // Correct way:
    // 1. Game Logic -> checks keys vs prevKeys
    // 2. Input.postUpdate() -> prev = current
    
    postUpdate() {
        this.prevKeys = { ...this.keys };
        // Mouse delta is accumulated, so we reset it after it's consumed by Player
        // But Player consumes it directly. So we don't reset here?
        // Player resets it.
    }
}
