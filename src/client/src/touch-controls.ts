/**
 * Touch Controls for Mobile Devices
 * 
 * Provides on-screen buttons and touch gestures for mobile devices.
 * Enabled with /mobile command in chat.
 */

import { UI_COLORS } from '../../shared/constants';

export interface TouchControlCallbacks {
    onFollowNext: () => void;
    onFollowPrevious: () => void;
    onToggleUI: () => void;
    onToggleHints: () => void;
    onToggleSim: () => void;
    onToggleFollow: () => void;
    onToggleFreeCamera: () => void;
    onOpenChat: () => void;
    onOpenOptions: () => void;
    onOpenAdmin: () => void;
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

    // Bound event handler references for proper cleanup
    private boundTouchStart = this.handleTouchStart.bind(this);
    private boundTouchMove = this.handleTouchMove.bind(this);
    private boundTouchEnd = this.handleTouchEnd.bind(this);

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
        const svgOptions = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22l-1.92 3.32c-.12.21-.07.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';
        const svgAdmin = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>';
        const svgNext = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>';
        const svgPrev = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z"/></svg>';
        const svgUi = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
        const svgSim = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>';
        const svgTarget = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19.5 11c-.26-3.85-3.32-6.91-7.18-7.18V1h-1.64v2.82C6.82 4.09 3.76 7.15 3.5 11H1v1.64h2.5c.26 3.85 3.32 6.91 7.18 7.18V22h1.64v-2.18c3.86-.27 6.92-3.33 7.18-7.18H22v-1.64h-2.5zm-7.5 7C8.14 18 5 14.86 5 11s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-10c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
        const svgCam = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/></svg>';
        const svgChat = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
        const svgHelp = '<svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>';

        const chatButtonHTML = import.meta.env.VITE_DEMO_MODE ? '' : `<button class="touch-btn" data-action="chat" title="Open Chat (T)">${svgChat}</button>`;

        container.innerHTML = `
            <div class="touch-controls-panel top-right">
                <button class="touch-btn" data-action="options" title="Options (O)">${svgOptions}</button>
            </div>
            <div class="touch-controls-panel bottom-right">
                <button class="touch-btn" data-action="follow-next" title="Follow Next (N)">${svgNext}</button>
                <button class="touch-btn" data-action="follow-prev" title="Follow Previous (P)">${svgPrev}</button>
            </div>
            <div class="touch-controls-panel bottom-left">
                <button class="touch-btn" data-action="toggle-ui" title="Toggle UI (H)">${svgUi}</button>
                <button class="touch-btn" data-action="toggle-sim" title="Toggle Sim Params (1)">${svgSim}</button>
                <button class="touch-btn" data-action="toggle-follow" title="Toggle Follow Section (2)">${svgTarget}</button>
            </div>
            <div class="touch-controls-panel left-center">
                <button class="touch-btn" data-action="free-camera" title="Free Camera (C)">${svgCam}</button>
                ${chatButtonHTML}
                <button class="touch-btn" data-action="admin" title="Admin Panel (\`)">${svgAdmin}</button>
                <button class="touch-btn" data-action="hints" title="Toggle Hints (K)">${svgHelp}</button>
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
                background: linear-gradient(160deg, ${UI_COLORS.touch.btnGradientStart}, ${UI_COLORS.touch.btnGradientEnd});
                backdrop-filter: blur(8px);
                color: ${UI_COLORS.text.primary};
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 12px ${UI_COLORS.touch.btnShadow}, inset 0 1px 0 rgba(255, 255, 255, 0.15);
                border: 1px solid ${UI_COLORS.touch.btnBorder};
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
                background: linear-gradient(160deg, ${UI_COLORS.touch.btnGradientActiveStart}, ${UI_COLORS.touch.btnGradientActiveEnd});
                box-shadow: 0 2px 8px ${UI_COLORS.surface.panelShadow}, inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }

            .touch-btn:hover {
                background: linear-gradient(160deg, ${UI_COLORS.touch.btnGradientHoverStart}, ${UI_COLORS.touch.btnGradientHoverEnd});
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
            case 'options':
                this.callbacks.onOpenOptions();
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
            case 'admin':
                this.callbacks.onOpenAdmin();
                break;
        }
    }

    private setupCameraGestures(): void {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        // Touch start
        canvas.addEventListener('touchstart', this.boundTouchStart, { passive: false });
        canvas.addEventListener('touchmove', this.boundTouchMove, { passive: false });
        canvas.addEventListener('touchend', this.boundTouchEnd, { passive: false });
    }

    private removeCameraGestures(): void {
        const canvas = document.getElementById('canvas-container');
        if (!canvas) return;

        canvas.removeEventListener('touchstart', this.boundTouchStart);
        canvas.removeEventListener('touchmove', this.boundTouchMove);
        canvas.removeEventListener('touchend', this.boundTouchEnd);
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
