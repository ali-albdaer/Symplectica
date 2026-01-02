export class Input {
    constructor() {
        this.keys = {};
        this.mouseDelta = { x: 0, y: 0 };
        this.isLocked = false;

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('pointerlockchange', () => this.onLockChange());
        
        // Click to lock
        document.getElementById('game-container').addEventListener('click', () => {
            if (!this.isLocked) {
                document.body.requestPointerLock();
            }
        });
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        if (e.key.toLowerCase() === 'f') this.keys['f_pressed'] = true;
        if (e.key.toLowerCase() === 'v') this.keys['v_pressed'] = true;
    }

    onKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    onMouseMove(e) {
        if (this.isLocked) {
            this.mouseDelta.x += e.movementX;
            this.mouseDelta.y += e.movementY;
        }
    }

    onMouseDown(e) {
        if (e.button === 2) this.keys['right_click'] = true;
        if (e.button === 0) this.keys['left_click'] = true;
    }

    onMouseUp(e) {
        if (e.button === 2) this.keys['right_click'] = false;
        if (e.button === 0) this.keys['left_click'] = false;
    }

    onLockChange() {
        this.isLocked = document.pointerLockElement === document.body;
        const instructions = document.getElementById('instructions');
        if (this.isLocked) {
            instructions.style.opacity = '0.2';
        } else {
            instructions.style.opacity = '0.8';
        }
    }
}
