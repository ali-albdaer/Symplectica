/**
 * Touch Controls for Mobile Devices
 * 
 * Provides on-screen buttons and touch gestures for mobile devices.
 * Enabled with /mobile command in chat.
 */

export interface TouchControlCallbacks {
    onSpeedIncrease: () => void;
    onSpeedDecrease: () => void;
    onPauseToggle: () => void;
    onFollowNext: () => void;
    onFollowPrevious: () => void;
    onToggleUI: () => void;
    onToggleHints: () => void;
    onToggleSim: () => void;
    onToggleFollow: () => void;
    onToggleFreeCamera: () => void;
    onOpenChat: () => void;
}

export class TouchControls {
    private container?: HTMLElement;
    private enabled = false;
    private callbacks: TouchControlCallbacks;

    // Touch gesture state for camera controls
    private touchStartDistance = 0;
    private lastTouchX = 0;
    private lastTouchY = 0;
    private isTouching = false;

    constructor(callbacks: TouchControlCallbacks) {
        this.callbacks = callbacks;
    }

    enable(): void {
        if (this.enabled) return;
        this.enabled = true;
        this.createUI();
        this.setupCameraGestures();
    }

    disable(): void {
        if (!this.enabled) return;
        this.enabled = false;
        this.removeUI();
        this.removeCameraGestures();
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    toggle(): void {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    private createUI(): void {
        const container = document.createElement('div');
        container.id = 'touch-controls';
        container.innerHTML = `
            <div class="touch-controls-panel top-right">
                <button class="touch-btn" data-action="pause" title="Pause/Resume">⏯</button>
                <button class="touch-btn" data-action="speed-up" title="Speed Up">&gt;</button>
                <button class="touch-btn" data-action="speed-down" title="Speed Down">&lt;</button>
            </div>
            <div class="touch-controls-panel bottom-right">
                <button class="touch-btn" data-action="follow-next" title="Follow Next (N)">⏭</button>
                <button class="touch-btn" data-action="follow-prev" title="Follow Previous (P)">⏮</button>
            </div>
            <div class="touch-controls-panel bottom-left">
                <button class="touch-btn" data-action="toggle-ui" title="Toggle UI (H)">👁</button>
                <button class="touch-btn" data-action="toggle-sim" title="Toggle Sim Params (1)">📊</button>
                <button class="touch-btn" data-action="toggle-follow" title="Toggle Follow Section (2)">🎯</button>
            </div>
            <div class="touch-controls-panel left-center">
                <button class="touch-btn" data-action="free-camera" title="Free Camera (C)">🎥</button>
                <button class="touch-btn" data-action="chat" title="Open Chat (T)">💬</button>
                <button class="touch-btn" data-action="hints" title="Toggle Hints (K)">❓</button>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #touch-controls {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 200;
            }

            .touch-controls-panel {
                position: absolute;
                display: flex;
                gap: 8px;
                pointer-events: auto;
            }

            .touch-controls-panel.top-right {
                top: 12px;
                right: 12px;
                flex-direction: column;
            }

            .touch-controls-panel.bottom-right {
                bottom: 12px;
                right: 12px;
                flex-direction: column;
            }

            .touch-controls-panel.bottom-left {
                bottom: 12px;
                left: 12px;
                flex-direction: column;
            }

            .touch-controls-panel.left-center {
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                flex-direction: column;
            }

            .touch-btn {
                width: 48px;
                height: 48px;
                border: none;
                border-radius: 50%;
                background: linear-gradient(160deg, rgba(20, 40, 80, 0.85), rgba(30, 60, 100, 0.85));
                backdrop-filter: blur(8px);
                color: #fff;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(120, 160, 240, 0.3);
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                -webkit-tap-highlight-color: transparent;
                user-select: none;
                -webkit-user-select: none;
            }

            .touch-btn:active {
                transform: scale(0.95);
                background: linear-gradient(160deg, rgba(40, 80, 140, 0.9), rgba(50, 100, 160, 0.9));
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }

            .touch-btn:hover {
                background: linear-gradient(160deg, rgba(30, 60, 120, 0.9), rgba(40, 80, 140, 0.9));
            }

            @media (max-width: 768px) {
                .touch-btn {
                    width: 44px;
                    height: 44px;
                    font-size: 18px;
                }
                
                .touch-controls-panel {
                    gap: 6px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(container);
        this.container = container;

        // Setup button listeners
        this.setupButtonListeners();
    }

    private removeUI(): void {
        if (this.container) {
            this.container.remove();
            this.container = undefined;
        }
    }

    private setupButtonListeners(): void {
        if (!this.container) return;

        const buttons = this.container.querySelectorAll('.touch-btn');
        buttons.forEach(btn => {
            const action = btn.getAttribute('data-action');
            if (!action) return;

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleAction(action);
            });

            // Prevent context menu on long press
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });
    }

    private handleAction(action: string): void {
        switch (action) {
            case 'pause':
                this.callbacks.onPauseToggle();
                break;
            case 'speed-up':
                this.callbacks.onSpeedIncrease();
                break;
            case 'speed-down':
                this.callbacks.onSpeedDecrease();
                break;
            case 'follow-next':
                this.callbacks.onFollowNext();
                break;
            case 'follow-prev':
                this.callbacks.onFollowPrevious();
                break;
            case 'toggle-ui':
                this.callbacks.onToggleUI();
                break;
            case 'hints':
                this.callbacks.onToggleHints();
                break;
            case 'toggle-sim':
                this.callbacks.onToggleSim();
                break;
            case 'toggle-follow':
                this.callbacks.onToggleFollow();
                break;
            case 'free-camera':
                this.callbacks.onToggleFreeCamera();
                break;
            case 'chat':
                this.callbacks.onOpenChat();
                break;
        }
    }

    private setupCameraGestures(): void {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        // Touch start
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }

    private removeCameraGestures(): void {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    }

    private handleTouchStart(e: TouchEvent): void {
        if (e.touches.length === 1) {
            // Single touch - prepare for camera rotation
            this.isTouching = true;
            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Two touches - prepare for pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            this.touchStartDistance = Math.sqrt(dx * dx + dy * dy);
        }
        e.preventDefault();
    }

    private handleTouchMove(e: TouchEvent): void {
        if (e.touches.length === 1 && this.isTouching) {
            // Single touch - rotate camera
            const deltaX = e.touches[0].clientX - this.lastTouchX;
            const deltaY = e.touches[0].clientY - this.lastTouchY;
            
            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;

            // Dispatch mouse-like events for existing camera controls
            this.simulateMouseDrag(deltaX, deltaY);
        } else if (e.touches.length === 2) {
            // Two touches - pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (this.touchStartDistance > 0) {
                const delta = distance - this.touchStartDistance;
                this.simulateMouseWheel(-delta * 2); // Negative because zoom out when fingers move apart
            }
            
            this.touchStartDistance = distance;
        }
        e.preventDefault();
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (e.touches.length === 0) {
            this.isTouching = false;
            this.touchStartDistance = 0;
        } else if (e.touches.length === 1) {
            // Reset for remaining touch
            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;
            this.touchStartDistance = 0;
        }
        e.preventDefault();
    }

    private simulateMouseDrag(deltaX: number, deltaY: number): void {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        // Create and dispatch synthetic mouse events
        const startEvent = new MouseEvent('mousedown', {
            button: 0,
            clientX: this.lastTouchX - deltaX,
            clientY: this.lastTouchY - deltaY,
            bubbles: true
        });
        canvas.dispatchEvent(startEvent);

        const moveEvent = new MouseEvent('mousemove', {
            clientX: this.lastTouchX,
            clientY: this.lastTouchY,
            bubbles: true
        });
        canvas.dispatchEvent(moveEvent);
    }

    private simulateMouseWheel(delta: number): void {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        const wheelEvent = new WheelEvent('wheel', {
            deltaY: delta,
            bubbles: true
        });
        canvas.dispatchEvent(wheelEvent);
    }
}
