/**
 * Input manager for keyboard and mouse
 */

export class InputManager {
    private keysDown: Set<string> = new Set();
    private keysPressed: Set<string> = new Set();

    private mouseButtons: Set<number> = new Set();
    private mouseDeltaX = 0;
    private mouseDeltaY = 0;
    private scrollDelta = 0;

    private pointerLocked = false;

    constructor() {
        this.setupKeyboard();
        this.setupMouse();
    }

    private setupKeyboard(): void {
        window.addEventListener('keydown', (e) => {
            // Don't capture input when typing in chat
            if ((e.target as HTMLElement).tagName === 'INPUT') {
                return;
            }

            if (!this.keysDown.has(e.code)) {
                this.keysPressed.add(e.code);
            }
            this.keysDown.add(e.code);

            // Prevent default for game keys
            if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keysDown.delete(e.code);
        });

        // Clear keys on window blur
        window.addEventListener('blur', () => {
            this.keysDown.clear();
            this.keysPressed.clear();
            this.mouseButtons.clear();
        });
    }

    private setupMouse(): void {
        const canvas = document.getElementById('canvas-container')!;

        canvas.addEventListener('mousedown', (e) => {
            this.mouseButtons.add(e.button);

            // Request pointer lock on click for smoother camera control
            if (e.button === 0) {
                canvas.requestPointerLock?.();
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            this.mouseButtons.delete(e.button);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === canvas || this.mouseButtons.has(0)) {
                this.mouseDeltaX += e.movementX;
                this.mouseDeltaY += e.movementY;
            }
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.scrollDelta += e.deltaY;
        }, { passive: false });

        document.addEventListener('pointerlockchange', () => {
            this.pointerLocked = document.pointerLockElement === canvas;
        });

        // Exit pointer lock on Escape
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.pointerLocked) {
                document.exitPointerLock?.();
            }
        });
    }

    isKeyDown(code: string): boolean {
        return this.keysDown.has(code);
    }

    isKeyPressed(code: string): boolean {
        return this.keysPressed.has(code);
    }

    isMouseDown(button: number): boolean {
        return this.mouseButtons.has(button);
    }

    getMouseDelta(): { x: number; y: number } {
        return { x: this.mouseDeltaX, y: this.mouseDeltaY };
    }

    getScrollDelta(): number {
        return this.scrollDelta;
    }

    isPointerLocked(): boolean {
        return this.pointerLocked;
    }

    /**
     * Call at end of frame to reset per-frame state
     */
    update(): void {
        this.keysPressed.clear();
        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;
        this.scrollDelta = 0;
    }

    dispose(): void {
        this.keysDown.clear();
        this.keysPressed.clear();
        this.mouseButtons.clear();
    }
}
