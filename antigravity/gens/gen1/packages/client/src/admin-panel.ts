/**
 * Admin Panel UI
 * 
 * Server configuration and control panel.
 * Features:
 * - Server status display
 * - Tick rate adjustment
 * - Force calculation method toggle
 * - Simulation reset
 */

import { PhysicsClient } from './physics';
import { TimeController } from './time-controller';
import { AdminStatePayload, NetworkClient } from './network';

interface ServerConfig {
    tickRate: number;
    forceMethod: 'direct' | 'barnes-hut';
    theta: number;
    substeps: number;
    simMode: 'tick' | 'accumulator';
}

export class AdminPanel {
    private container: HTMLElement;
    private physics: PhysicsClient;
    private timeController: TimeController;
    private network?: NetworkClient;
    private onFreeCamSpeedChange?: (speed: number) => void;
    private onFreeCamSensitivityChange?: (sensitivity: number) => void;
    private onPresetChange?: (presetId: string) => void;
    private onSimModeChange?: (mode: 'tick' | 'accumulator') => void;
    private isOpen = false;
    private freeCamSpeed = 1; // AU/s
    private freeCamSensitivity = 1.0;
    private config: ServerConfig = {
        tickRate: 60,
        forceMethod: 'direct',
        theta: 0.5,
        substeps: 4,
        simMode: 'tick',
    };

    constructor(
        physics: PhysicsClient,
        timeController: TimeController,
        network?: NetworkClient,
        onFreeCamSpeedChange?: (speed: number) => void,
        onFreeCamSensitivityChange?: (sensitivity: number) => void,
        onPresetChange?: (presetId: string) => void,
        onSimModeChange?: (mode: 'tick' | 'accumulator') => void
    ) {
        this.physics = physics;
        this.timeController = timeController;
        this.network = network;
        this.onFreeCamSpeedChange = onFreeCamSpeedChange;
        this.onFreeCamSensitivityChange = onFreeCamSensitivityChange;
        this.onPresetChange = onPresetChange;
        this.onSimModeChange = onSimModeChange;
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();
        this.onFreeCamSpeedChange?.(this.freeCamSpeed);
        this.onFreeCamSensitivityChange?.(this.freeCamSensitivity);
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'admin-panel';
        container.innerHTML = `
            <div class="admin-header">
                <h2>Admin</h2>
                <button class="admin-close" title="Close (&#96;)">&times;</button>
            </div>
            
            <div class="admin-content">
                <section class="admin-section">
                    <h3>Presets</h3>
                    <div class="admin-field">
                        <label>Load Preset</label>
                        <select id="admin-preset">
                            <option value="sunEarthMoon">Sun-Earth-Moon</option>
                            <option value="innerSolarSystem">Inner Solar System</option>
                            <option value="fullSolarSystem" selected>Full Solar System</option>
                            <option value="jupiterSystem">Jupiter System</option>
                            <option value="saturnSystem">Saturn System</option>
                            <option value="alphaCentauri">Alpha Centauri</option>
                            <option value="trappist1">TRAPPIST-1</option>
                            <option value="binaryPulsar">Binary Pulsar</option>
                        </select>
                    </div>
                    <button class="admin-btn" id="admin-load-preset">Load Preset</button>
                </section>
                
                <section class="admin-section">
                    <h3>Simulation</h3>
                    
                    <div class="admin-field">
                        <label>Timestep (seconds)</label>
                        <input type="number" id="admin-dt" value="3600" min="1" max="86400" step="60">
                    </div>

                    <div class="admin-field">
                        <label>Simulation Mode</label>
                        <select id="admin-sim-mode">
                            <option value="tick">Tick-Scaled (Lightweight)</option>
                            <option value="accumulator">Fixed-Delta (Accurate)</option>
                        </select>
                    </div>

                    <div class="admin-field">
                        <label>Substeps</label>
                        <input type="number" id="admin-substeps" value="4" min="1" max="16">
                    </div>
                    
                    <div class="admin-field">
                        <label>Force Method</label>
                        <select id="admin-force-method">
                            <option value="direct">Direct Sum O(N²)</option>
                            <option value="barnes-hut">Barnes-Hut O(N log N)</option>
                        </select>
                    </div>
                    
                    <div class="admin-field" id="theta-field">
                        <label>Barnes-Hut θ</label>
                        <input type="number" id="admin-theta" value="0.5" min="0.1" max="2" step="0.1">
                    </div>
                </section>

                <section class="admin-section">
                    <h3>Camera</h3>
                    <div class="admin-field">
                        <label>Free Cam Speed (AU/s)</label>
                        <div class="admin-slider-row">
                            <input type="range" id="admin-freecam-speed" min="0" max="1" step="0.001" value="0.5">
                            <span id="admin-freecam-speed-value">1.000 AU/s</span>
                        </div>
                    </div>

                    <div class="admin-field">
                        <label>Free Cam Sensitivity</label>
                        <div class="admin-slider-row">
                            <input type="range" id="admin-freecam-sensitivity" min="0.1" max="5" step="0.1" value="1">
                            <span id="admin-freecam-sensitivity-value">1.0x</span>
                        </div>
                    </div>
                </section>
                
                <section class="admin-section">
                    <h3>Actions</h3>
                    <button class="admin-btn" id="admin-apply">Apply Settings</button>
                    <button class="admin-btn admin-btn-warning" id="admin-reset">Reset Simulation</button>
                </section>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #admin-panel {
                position: fixed;
                top: 80px;
                right: 40px;
                width: 320px;
                background: rgba(10, 15, 30, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fff;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 300;
                display: none;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            
            #admin-panel.open {
                display: flex;
            }
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
                cursor: move;
                user-select: none;
            }
            
            .admin-header h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                color: #4fc3f7;
            }
            
            .admin-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .admin-close:hover {
                color: #fff;
            }
            
            .admin-content {
                padding: 12px 15px;
            }
            
            .admin-section {
                margin-bottom: 14px;
            }
            
            .admin-section:last-child {
                margin-bottom: 0;
            }
            
            .admin-section h3 {
                font-size: 10px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }
            
            .admin-field {
                margin-bottom: 10px;
            }
            
            .admin-field label {
                display: block;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 6px;
            }
            
            .admin-field input,
            .admin-field select {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                padding: 6px 8px;
                font-size: 12px;
            }

            .admin-field input[type="range"] {
                padding: 0;
                height: 4px;
                accent-color: #4fc3f7;
            }

            .admin-slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 6px;
            }

            .admin-slider-row span {
                min-width: 70px;
                text-align: right;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                font-variant-numeric: tabular-nums;
            }

            .admin-hint {
                margin-top: 6px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                font-variant-numeric: tabular-nums;
            }
            
            .admin-field input:focus,
            .admin-field select:focus {
                outline: none;
                border-color: #4fc3f7;
            }
            
            .admin-btn {
                width: 100%;
                background: rgba(79, 195, 247, 0.2);
                border: 1px solid rgba(79, 195, 247, 0.6);
                border-radius: 6px;
                color: #dff3ff;
                padding: 10px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 8px;
                transition: background 0.2s, border-color 0.2s, color 0.2s;
            }
            
            .admin-btn:hover {
                background: rgba(79, 195, 247, 0.3);
            }
            
            .admin-btn-warning {
                background: rgba(255, 107, 107, 0.2);
                border-color: rgba(255, 107, 107, 0.6);
                color: #ffe6e6;
            }
            
            #theta-field {
                display: none;
            }
            
            #theta-field.visible {
                display: block;
            }
        `;
        document.head.appendChild(style);

        // Setup event listeners
        this.setupEventListeners(container);

        return container;
    }

    private setupEventListeners(container: HTMLElement): void {
        // Close button
        container.querySelector('.admin-close')?.addEventListener('click', () => {
            this.close();
        });

        this.setupDrag(container);

        const freeCamSpeedInput = container.querySelector('#admin-freecam-speed') as HTMLInputElement;
        const freeCamSpeedValue = container.querySelector('#admin-freecam-speed-value') as HTMLElement;
        const freeCamSensitivityInput = container.querySelector('#admin-freecam-sensitivity') as HTMLInputElement;
        const freeCamSensitivityValue = container.querySelector('#admin-freecam-sensitivity-value') as HTMLElement;

        const updateFreeCamSpeed = () => {
            const t = parseFloat(freeCamSpeedInput.value);
            const speed = this.sliderToSpeed(t);
            this.freeCamSpeed = speed;
            freeCamSpeedValue.textContent = `${this.freeCamSpeed.toFixed(3)} AU/s`;
            this.onFreeCamSpeedChange?.(this.freeCamSpeed);
        };

        const updateFreeCamSensitivity = () => {
            const value = parseFloat(freeCamSensitivityInput.value);
            if (!Number.isFinite(value)) return;
            this.freeCamSensitivity = value;
            freeCamSensitivityValue.textContent = `${this.freeCamSensitivity.toFixed(1)}x`;
            this.onFreeCamSensitivityChange?.(this.freeCamSensitivity);
        };

        freeCamSpeedInput?.addEventListener('input', updateFreeCamSpeed);
        freeCamSensitivityInput?.addEventListener('input', updateFreeCamSensitivity);
        updateFreeCamSpeed();
        updateFreeCamSensitivity();

        // Force method change
        const forceMethodSelect = container.querySelector('#admin-force-method') as HTMLSelectElement;
        const thetaField = container.querySelector('#theta-field') as HTMLElement;

        forceMethodSelect?.addEventListener('change', () => {
            thetaField.classList.toggle('visible', forceMethodSelect.value === 'barnes-hut');
        });

        // Apply button
        container.querySelector('#admin-apply')?.addEventListener('click', () => {
            this.applySettings();
        });

        // Load preset
        container.querySelector('#admin-load-preset')?.addEventListener('click', () => {
            const presetSelect = container.querySelector('#admin-preset') as HTMLSelectElement | null;
            if (!presetSelect) return;
            this.onPresetChange?.(presetSelect.value);
        });

        // Reset button
        container.querySelector('#admin-reset')?.addEventListener('click', () => {
            if (confirm('Reset simulation to default state?')) {
                this.resetSimulation();
            }
        });
    }

    private sliderToSpeed(t: number): number {
        const min = 0.001;
        const max = 1000;
        const minLog = Math.log10(min);
        const maxLog = Math.log10(max);
        const clamped = Math.max(0, Math.min(1, t));
        return Math.pow(10, minLog + (maxLog - minLog) * clamped);
    }

    private speedToSlider(speed: number): number {
        const min = 0.001;
        const max = 1000;
        const clampedSpeed = Math.max(min, Math.min(max, speed));
        const minLog = Math.log10(min);
        const maxLog = Math.log10(max);
        return (Math.log10(clampedSpeed) - minLog) / (maxLog - minLog);
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === '`' || e.code === 'Backquote') {
                this.toggle();
            }

            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle(): void {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open(): void {
        this.isOpen = true;
        this.container.classList.add('open');

        const freeCamSpeedInput = document.getElementById('admin-freecam-speed') as HTMLInputElement | null;
        const freeCamSpeedValue = document.getElementById('admin-freecam-speed-value') as HTMLElement | null;
        if (freeCamSpeedInput) {
            freeCamSpeedInput.value = this.speedToSlider(this.freeCamSpeed).toString();
        }
        if (freeCamSpeedValue) {
            freeCamSpeedValue.textContent = `${this.freeCamSpeed.toFixed(3)} AU/s`;
        }
    }

    close(): void {
        this.isOpen = false;
        this.container.classList.remove('open');
    }

    private applySettings(): void {
        const dt = parseFloat((document.getElementById('admin-dt') as HTMLInputElement).value);
        const substeps = parseInt((document.getElementById('admin-substeps') as HTMLInputElement).value);
        const forceMethod = (document.getElementById('admin-force-method') as HTMLSelectElement).value;
        const theta = parseFloat((document.getElementById('admin-theta') as HTMLInputElement).value);
        const simMode = (document.getElementById('admin-sim-mode') as HTMLSelectElement).value as 'tick' | 'accumulator';
        const timeScale = this.timeController.getCurrentSpeed().sim;

        if (this.network?.isConnected()) {
            this.network.sendAdminSettings({
                dt,
                substeps,
                forceMethod: forceMethod === 'barnes-hut' ? 'barnes-hut' : 'direct',
                theta,
                timeScale,
                simMode,
            } as AdminStatePayload);
        }

        // Apply timestep to both physics and TimeController
        this.physics.setTimeStep(dt);
        this.physics.setSubsteps(substeps);
        if (forceMethod === 'barnes-hut') {
            this.physics.setTheta(theta);
            this.physics.useBarnesHut();
        } else {
            this.physics.useDirectForce();
        }
        this.timeController.setPhysicsTimestep(dt);
        this.onSimModeChange?.(simMode);

        console.log(`⚙️ Applied settings: dt=${dt}s, substeps=${substeps}, method=${forceMethod}, θ=${theta}`);

        this.close();
    }

    private resetSimulation(): void {
        if (this.network?.isConnected()) {
            this.network.resetSimulation();
        } else {
            this.physics.createPreset('fullSolarSystem', BigInt(Date.now()));
            console.log('🔄 Simulation reset to Full Solar System');
        }
        this.close();
    }

    applyServerSettings(settings: AdminStatePayload): void {
        const dtInput = document.getElementById('admin-dt') as HTMLInputElement | null;
        const substepsInput = document.getElementById('admin-substeps') as HTMLInputElement | null;
        const forceMethodSelect = document.getElementById('admin-force-method') as HTMLSelectElement | null;
        const thetaInput = document.getElementById('admin-theta') as HTMLInputElement | null;
        const thetaField = document.getElementById('theta-field') as HTMLElement | null;
        const simModeSelect = document.getElementById('admin-sim-mode') as HTMLSelectElement | null;

        if (dtInput) dtInput.value = settings.dt.toString();
        if (substepsInput) substepsInput.value = settings.substeps.toString();
        if (forceMethodSelect) forceMethodSelect.value = settings.forceMethod;
        if (thetaInput) thetaInput.value = settings.theta.toString();
        if (thetaField) thetaField.classList.toggle('visible', settings.forceMethod === 'barnes-hut');
        if (simModeSelect) simModeSelect.value = settings.simMode;
    }

    private setupDrag(container: HTMLElement): void {
        const header = container.querySelector('.admin-header') as HTMLElement | null;
        if (!header) return;

        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;
        let dragging = false;

        const onMouseMove = (event: MouseEvent) => {
            if (!dragging) return;
            const deltaX = event.clientX - startX;
            const deltaY = event.clientY - startY;
            container.style.left = `${startLeft + deltaX}px`;
            container.style.top = `${startTop + deltaY}px`;
        };

        const onMouseUp = () => {
            dragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', (event) => {
            if ((event.target as HTMLElement).closest('button')) return;
            const rect = container.getBoundingClientRect();
            startX = event.clientX;
            startY = event.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            container.style.left = `${rect.left}px`;
            container.style.top = `${rect.top}px`;
            container.style.right = 'auto';
            container.style.transform = 'none';
            dragging = true;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }
}
