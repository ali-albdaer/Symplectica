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
}

export class AdminPanel {
    private container: HTMLElement;
    private physics: PhysicsClient;
    private timeController: TimeController;
    private network?: NetworkClient;
    private onFreeCamSpeedChange?: (speed: number) => void;
    private onFreeCamSensitivityChange?: (sensitivity: number) => void;
    private onPresetChange?: (presetId: string) => void;
    private isOpen = false;
    private freeCamSpeed = 1; // AU/s
    private freeCamSensitivity = 1.0;
    private config: ServerConfig = {
        tickRate: 60,
        forceMethod: 'direct',
        theta: 0.5,
        substeps: 4,
    };

    constructor(
        physics: PhysicsClient,
        timeController: TimeController,
        network?: NetworkClient,
        onFreeCamSpeedChange?: (speed: number) => void,
        onFreeCamSensitivityChange?: (sensitivity: number) => void,
        onPresetChange?: (presetId: string) => void
    ) {
        this.physics = physics;
        this.timeController = timeController;
        this.network = network;
        this.onFreeCamSpeedChange = onFreeCamSpeedChange;
        this.onFreeCamSensitivityChange = onFreeCamSensitivityChange;
        this.onPresetChange = onPresetChange;
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
                <h2>⚙️ Admin Panel</h2>
                <button class="admin-close" title="Close (/)">&times;</button>
            </div>
            
            <div class="admin-content">
                <section class="admin-section">
                    <h3>Simulation Settings</h3>
                    
                    <div class="admin-field">
                        <label>Timestep (seconds)</label>
                        <input type="number" id="admin-dt" value="3600" min="1" max="86400" step="60">
                    </div>

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
                    <h3>Actions</h3>
                    <button class="admin-btn" id="admin-apply">Apply Settings</button>
                    <button class="admin-btn admin-btn-warning" id="admin-reset">Reset Simulation</button>
                    <div class="admin-field" style="margin-top: 10px;">
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
                    <h3>Debug Info</h3>
                    <div class="admin-debug">
                        <div>Bodies: <span id="admin-body-count">0</span></div>
                        <div>Tick: <span id="admin-tick">0</span></div>
                        <div>dt: <span id="admin-current-dt">0</span>s</div>
                    </div>
                </section>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #admin-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 380px;
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
                font-size: 24px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .admin-close:hover {
                color: #fff;
            }
            
            .admin-content {
                padding: 20px;
            }
            
            .admin-section {
                margin-bottom: 20px;
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
                margin-bottom: 12px;
            }
            
            .admin-field label {
                display: block;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 5px;
            }
            
            .admin-field input,
            .admin-field select {
                width: 100%;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 6px;
                color: #fff;
                padding: 10px 12px;
                font-size: 13px;
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
                min-width: 90px;
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
                background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
                border: none;
                border-radius: 6px;
                color: #fff;
                padding: 12px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 8px;
                transition: opacity 0.2s;
            }
            
            .admin-btn:hover {
                opacity: 0.9;
            }
            
            .admin-btn-warning {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
            }
            
            .admin-debug {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                padding: 12px;
                font-family: 'Consolas', monospace;
                font-size: 12px;
            }
            
            .admin-debug div {
                margin-bottom: 4px;
            }
            
            .admin-debug span {
                color: #4fc3f7;
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

            if (e.key === '/') {
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
        this.updateDebugInfo();

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

        if (this.network?.isConnected()) {
            this.network.sendAdminSettings({
                dt,
                substeps,
                forceMethod: forceMethod === 'barnes-hut' ? 'barnes-hut' : 'direct',
                theta,
                timeScale: dt * 60,
            } as AdminStatePayload);
        }

        // Apply timestep to both physics and TimeController
        this.physics.setTimeStep(dt);
        this.timeController.setPhysicsTimestep(dt);

        // Note: substeps/forceMethod/theta would need WASM methods
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

        if (dtInput) dtInput.value = settings.dt.toString();
        if (substepsInput) substepsInput.value = settings.substeps.toString();
        if (forceMethodSelect) forceMethodSelect.value = settings.forceMethod;
        if (thetaInput) thetaInput.value = settings.theta.toString();
        if (thetaField) thetaField.classList.toggle('visible', settings.forceMethod === 'barnes-hut');
    }

    updateDebugInfo(): void {
        const bodyCount = document.getElementById('admin-body-count');
        const tick = document.getElementById('admin-tick');
        const currentDt = document.getElementById('admin-current-dt');

        if (bodyCount) bodyCount.textContent = this.physics.bodyCount().toString();
        if (tick) tick.textContent = this.physics.tick().toLocaleString();
        if (currentDt) currentDt.textContent = this.timeController.getPhysicsTimestep().toString();
    }
}
