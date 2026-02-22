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
    closeEncounterIntegrator: 'none' | 'rk45' | 'gauss-radau';
    closeEncounterHillFactor: number;
    closeEncounterTidalRatio: number;
    closeEncounterJerkNorm: number;
    closeEncounterMaxSubsetSize: number;
    closeEncounterMaxTrialSubsteps: number;
    closeEncounterRk45AbsTol: number;
    closeEncounterRk45RelTol: number;
    closeEncounterGaussRadauMaxIters: number;
    closeEncounterGaussRadauTol: number;
}

export class AdminPanel {
    private container: HTMLElement;
    private physics: PhysicsClient;
    private timeController: TimeController;
    private network?: NetworkClient;
    private onPresetChange?: (presetId: string, name: string, barycentric: boolean, bodyCount?: number) => void;
    private onSimModeChange?: (mode: 'tick' | 'accumulator') => void;
    private isOpen = false;
    private config: ServerConfig = {
        tickRate: 60,
        forceMethod: 'direct',
        theta: 0.5,
        substeps: 4,
        simMode: 'tick',
        closeEncounterIntegrator: 'none',
        closeEncounterHillFactor: 3.0,
        closeEncounterTidalRatio: 1.0e-3,
        closeEncounterJerkNorm: 0.1,
        closeEncounterMaxSubsetSize: 8,
        closeEncounterMaxTrialSubsteps: 128,
        closeEncounterRk45AbsTol: 1.0e-2,
        closeEncounterRk45RelTol: 1.0e-6,
        closeEncounterGaussRadauMaxIters: 6,
        closeEncounterGaussRadauTol: 1.0e-9,
    };

    constructor(
        physics: PhysicsClient,
        timeController: TimeController,
        network?: NetworkClient,
        onPresetChange?: (presetId: string, name: string, barycentric: boolean, bodyCount?: number) => void,
        onSimModeChange?: (mode: 'tick' | 'accumulator') => void
    ) {
        this.physics = physics;
        this.timeController = timeController;
        this.network = network;
        this.onPresetChange = onPresetChange;
        this.onSimModeChange = onSimModeChange;
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();
    }

    // Public method to update pause state from outside (e.g. keybind or server)
    setPaused(paused: boolean): void {
        const btn = document.getElementById('admin-pause-btn');
        if (btn) {
            btn.textContent = paused ? 'Resume Simulation' : 'Pause Simulation';
            btn.classList.toggle('admin-btn-warning', paused);
        }
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'admin-panel';
        container.innerHTML = `
            <div class="admin-header">
                <h2>Admin</h2>
                <button class="admin-close" title="Close (&#96;)">&times;</button>
            </div>
            
            <div class="opt-tabs admin-tabs">
                <button class="opt-tab active" data-tab="admin-general">General</button>
                <button class="opt-tab" data-tab="admin-close">Close Encounters</button>
            </div>

            <div class="opt-content admin-content active" id="tab-admin-general">
                <section class="admin-section">
                    <h3>Presets</h3>
                    <div class="admin-field">
                        <label>Load Preset</label>
                        <select id="admin-preset">
                            <option value="sunEarthMoon">Sun-Earth-Moon</option>
                            <option value="innerSolarSystem">Inner Solar System</option>
                            <option value="fullSolarSystem">Full Solar System</option>
                            <option value="fullSolarSystemII" selected>Full Solar System II (J2000)</option>
                            <option value="playableSolarSystem">Playable Solar System</option>
                            <option value="jupiterSystem">Jupiter System</option>
                            <option value="saturnSystem">Saturn System</option>
                            <option value="alphaCentauri">Alpha Centauri</option>
                            <option value="trappist1">TRAPPIST-1</option>
                            <option value="binaryPulsar">Binary Pulsar</option>
                            <option value="asteroidBelt">Asteroid Belt (5000+ bodies)</option>
                            <option value="starCluster">Star Cluster (2000 stars)</option>
                            <option value="worldBuilder">+ World Builder</option>
                        </select>
                    </div>
                    <div class="admin-field" id="barycentric-field">
                        <label>
                            <input type="checkbox" id="admin-barycentric" checked>
                            Barycentric Mode
                        </label>
                        <div class="admin-hint">Shift to center-of-mass frame (zero system momentum)</div>
                    </div>
                    <div class="admin-field" id="body-count-field" style="display: none;">
                        <label>Number of Bodies</label>
                        <input type="number" id="admin-body-count" min="0" step="1" value="5000">
                        <div class="admin-hint" id="body-count-hint">More bodies = slower simulation</div>
                    </div>
                    <button class="admin-btn" id="admin-load-preset">Load Preset</button>
                </section>
                
                <section class="admin-section">
                    <h3>Simulation</h3>
                    
                    <div class="admin-field">
                        <label>Time Warp</label>
                        <select id="admin-time-warp">
                            <!-- Populated by JS -->
                        </select>
                    </div>

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
                    <h3>Actions</h3>
                    <button class="admin-btn" id="admin-apply">Apply Settings</button>
                    <button class="admin-btn" id="admin-pause-btn">Pause Simulation</button>
                    <button class="admin-btn admin-btn-warning" id="admin-reset">Reset Simulation</button>
                </section>
            </div>

            <div class="opt-content admin-content" id="tab-admin-close" style="display: none;">
                <section class="admin-section">
                    <h3>Switching</h3>
                    <div class="admin-grid-two">
                        <div class="admin-field">
                            <label>Close-Encounter Integrator</label>
                            <select id="admin-close-encounter">
                                <option value="none" selected>None (Verlet only)</option>
                                <option value="gauss-radau">Gauss-Radau 5th</option>
                                <option value="rk45">Adaptive RK45</option>
                            </select>
                            <div class="admin-hint">Applies only to close-encounter subsets</div>
                        </div>
                        <div class="admin-field">
                            <label>Hill Radius Factor</label>
                            <input type="number" id="admin-close-hill" value="3" min="0.1" step="0.1">
                        </div>
                        <div class="admin-field">
                            <label>Tidal Ratio Threshold</label>
                            <input type="number" id="admin-close-tidal" value="0.001" min="0" step="0.0001">
                            <div class="admin-hint">|a_perturber| / |a_primary|</div>
                        </div>
                        <div class="admin-field">
                            <label>Normalized Jerk Threshold</label>
                            <input type="number" id="admin-close-jerk" value="0.1" min="0" step="0.01">
                            <div class="admin-hint">|jerk| × dt / |accel|</div>
                        </div>
                        <div class="admin-field">
                            <label>Max Subset Size</label>
                            <input type="number" id="admin-close-max-subset" value="8" min="1" step="1">
                        </div>
                        <div class="admin-field">
                            <label>Max Trial Substeps</label>
                            <input type="number" id="admin-close-max-substeps" value="128" min="1" step="1">
                        </div>
                    </div>
                </section>

                <section class="admin-section">
                    <h3>RK45</h3>
                    <div class="admin-grid-two">
                        <div class="admin-field">
                            <label>Absolute Tolerance</label>
                            <input type="number" id="admin-close-rk45-abs" value="0.01" min="0" step="0.0001">
                        </div>
                        <div class="admin-field">
                            <label>Relative Tolerance</label>
                            <input type="number" id="admin-close-rk45-rel" value="0.000001" min="0" step="0.000001">
                        </div>
                    </div>
                </section>

                <section class="admin-section">
                    <h3>Gauss-Radau</h3>
                    <div class="admin-grid-two">
                        <div class="admin-field">
                            <label>Max Iterations</label>
                            <input type="number" id="admin-close-gr-iters" value="6" min="1" step="1">
                        </div>
                        <div class="admin-field">
                            <label>Convergence Tolerance</label>
                            <input type="number" id="admin-close-gr-tol" value="0.000000001" min="0" step="0.000000001">
                        </div>
                    </div>
                    <button class="admin-btn" id="admin-apply-close">Apply Close-Encounter Settings</button>
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
                width: 248px;
                background: rgba(10, 15, 30, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fff;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 12px;
                z-index: 300;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            #admin-panel.open {
                display: flex;
            }
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
                cursor: move;
                user-select: none;
            }
            
            .admin-header h2 {
                font-size: 13px;
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
                padding: 10px 12px;
            }

            .opt-tabs {
                display: flex;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .opt-tab {
                flex: 1;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                padding: 8px 0;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                border-bottom: 2px solid transparent;
                transition: color 0.2s, border-color 0.2s;
            }

            .opt-tab:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.05);
            }

            .opt-tab.active {
                color: #4fc3f7;
                border-bottom-color: #4fc3f7;
            }

            .opt-content { padding: 10px 12px; }
            .opt-content.active { display: block; }
            
            .admin-section {
                margin-bottom: 10px;
            }
            
            .admin-section:last-child {
                margin-bottom: 0;
            }
            
            .admin-section h3 {
                font-size: 9px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 8px 0;
            }
            
            .admin-field {
                margin: 6px 0 4px 0;
            }
            
            .admin-field label {
                display: block;
                font-size: 10px;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 4px;
            }
            
            .admin-field input,
            .admin-field select {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                padding: 5px 6px;
                font-size: 11px;
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
                margin-top: 4px;
            }

            .admin-slider-row span {
                min-width: 70px;
                text-align: right;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.7);
                font-variant-numeric: tabular-nums;
            }

            .admin-hint {
                margin-top: 4px;
                font-size: 11px;
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
                padding: 8px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 6px;
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

            .admin-grid-two {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 6px 8px;
            }
            
            #theta-field {
                display: none;
            }
            
            #theta-field.visible {
                display: block;
            }
        `;
        document.head.appendChild(style);

        // Populate Time Warp dropdown
        const warpSelect = container.querySelector('#admin-time-warp') as HTMLSelectElement;
        const levels = this.timeController.getSpeedLevels();
        levels.forEach((level, index) => {
            const option = document.createElement('option');
            option.value = level.sim.toString();
            option.textContent = level.label;
            if (index === this.timeController.getSpeedIndex()) {
                option.selected = true;
            }
            warpSelect.appendChild(option);
        });

        // Setup event listeners
        this.setupEventListeners(container);
        this.setupTabs(container);

        return container;
    }

    private setupEventListeners(container: HTMLElement): void {
        // Close button
        container.querySelector('.admin-close')?.addEventListener('click', () => {
            this.close();
        });

        this.setupDrag(container);

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

        container.querySelector('#admin-apply-close')?.addEventListener('click', () => {
            this.applySettings();
        });

        // Load preset
        container.querySelector('#admin-load-preset')?.addEventListener('click', () => {
            const presetSelect = container.querySelector('#admin-preset') as HTMLSelectElement | null;
            const barycentricCheckbox = container.querySelector('#admin-barycentric') as HTMLInputElement | null;
            const bodyCountInput = container.querySelector('#admin-body-count') as HTMLInputElement | null;
            if (!presetSelect) return;
            const name = presetSelect.options[presetSelect.selectedIndex].text;
            const barycentric = barycentricCheckbox?.checked ?? false;
            const presetId = presetSelect.value;
            
            // Get body count for presets that support it
            let bodyCount: number | undefined;
            if (presetId === 'asteroidBelt' || presetId === 'starCluster') {
                const parsed = bodyCountInput ? parseInt(bodyCountInput.value, 10) : NaN;
                bodyCount = Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
            }
            
            this.onPresetChange?.(presetId, name, barycentric, bodyCount);
        });

        // Show/hide barycentric option and body count based on preset selection
        const presetSelect = container.querySelector('#admin-preset') as HTMLSelectElement | null;
        const barycentricField = container.querySelector('#barycentric-field') as HTMLElement | null;
        const bodyCountField = container.querySelector('#body-count-field') as HTMLElement | null;
        const bodyCountInput = container.querySelector('#admin-body-count') as HTMLInputElement | null;
        const bodyCountHint = container.querySelector('#body-count-hint') as HTMLElement | null;
        
        const updatePresetOptions = () => {
            if (!presetSelect) return;
            const presetId = presetSelect.value;
            
            // Show barycentric for Full Solar System II and World Builder
            if (barycentricField) {
                barycentricField.style.display = (presetId === 'fullSolarSystemII' || presetId === 'worldBuilder') ? 'block' : 'none';
            }
            
            // Show body count input for asteroid belt and star cluster
            if (bodyCountField && bodyCountInput && bodyCountHint) {
                if (presetId === 'asteroidBelt') {
                    bodyCountField.style.display = 'block';
                    bodyCountInput.value = '5000';
                    bodyCountInput.placeholder = '5000';
                    bodyCountHint.textContent = 'Asteroids in main belt (plus ~15 planets/dwarf planets)';
                } else if (presetId === 'starCluster') {
                    bodyCountField.style.display = 'block';
                    bodyCountInput.value = '2000';
                    bodyCountInput.placeholder = '2000';
                    bodyCountHint.textContent = 'Stars in Plummer sphere cluster';
                } else {
                    bodyCountField.style.display = 'none';
                }
            }
        };
        
        presetSelect?.addEventListener('change', updatePresetOptions);
        updatePresetOptions();

        // Pause button
        container.querySelector('#admin-pause-btn')?.addEventListener('click', () => {
            this.timeController.togglePause();
            if (this.network?.isConnected()) {
                this.network.sendPause(this.timeController.isPaused());
            }
            this.setPaused(this.timeController.isPaused());
        });

        // Reset button
        container.querySelector('#admin-reset')?.addEventListener('click', () => {
            if (confirm('Reset simulation to default state?')) {
                this.resetSimulation();
            }
        });
    }

    private setupTabs(container: HTMLElement): void {
        const tabs = container.querySelectorAll('.opt-tab');
        const contents = container.querySelectorAll('.opt-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = (tab as HTMLElement).dataset.tab;

                tabs.forEach(t => t.classList.toggle('active', t === tab));

                contents.forEach(content => {
                    const id = content.id.replace('tab-', '');
                    (content as HTMLElement).style.display = id === targetId ? 'block' : 'none';
                });
            });
        });
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
        const closeIntegrator = (document.getElementById('admin-close-encounter') as HTMLSelectElement).value as 'none' | 'rk45' | 'gauss-radau';
        const closeHill = parseFloat((document.getElementById('admin-close-hill') as HTMLInputElement).value);
        const closeTidal = parseFloat((document.getElementById('admin-close-tidal') as HTMLInputElement).value);
        const closeJerk = parseFloat((document.getElementById('admin-close-jerk') as HTMLInputElement).value);
        const closeMaxSubset = parseInt((document.getElementById('admin-close-max-subset') as HTMLInputElement).value, 10);
        const closeMaxSubsteps = parseInt((document.getElementById('admin-close-max-substeps') as HTMLInputElement).value, 10);
        const closeRk45Abs = parseFloat((document.getElementById('admin-close-rk45-abs') as HTMLInputElement).value);
        const closeRk45Rel = parseFloat((document.getElementById('admin-close-rk45-rel') as HTMLInputElement).value);
        const closeGrIters = parseInt((document.getElementById('admin-close-gr-iters') as HTMLInputElement).value, 10);
        const closeGrTol = parseFloat((document.getElementById('admin-close-gr-tol') as HTMLInputElement).value);

        const warpSelect = document.getElementById('admin-time-warp') as HTMLSelectElement;
        const timeScale = parseFloat(warpSelect.value);

        if (this.network?.isConnected()) {
            this.network.sendAdminSettings({
                dt,
                substeps,
                forceMethod: forceMethod === 'barnes-hut' ? 'barnes-hut' : 'direct',
                theta,
                timeScale,
                simMode,
                closeEncounterIntegrator: closeIntegrator,
                closeEncounterHillFactor: closeHill,
                closeEncounterTidalRatio: closeTidal,
                closeEncounterJerkNorm: closeJerk,
                closeEncounterMaxSubsetSize: closeMaxSubset,
                closeEncounterMaxTrialSubsteps: closeMaxSubsteps,
                closeEncounterRk45AbsTol: closeRk45Abs,
                closeEncounterRk45RelTol: closeRk45Rel,
                closeEncounterGaussRadauMaxIters: closeGrIters,
                closeEncounterGaussRadauTol: closeGrTol,
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
        this.physics.setCloseEncounterIntegrator(closeIntegrator);
        this.physics.setCloseEncounterThresholds(closeHill, closeTidal, closeJerk);
        this.physics.setCloseEncounterLimits(closeMaxSubset, closeMaxSubsteps);
        this.physics.setCloseEncounterRk45Tolerances(closeRk45Abs, closeRk45Rel);
        this.physics.setCloseEncounterGaussRadau(closeGrIters, closeGrTol);
        this.timeController.setPhysicsTimestep(dt);
        this.timeController.setSpeedBySimRate(timeScale);
        this.onSimModeChange?.(simMode);

        console.log(`⚙️ Applied settings: dt=${dt}s, substeps=${substeps}, method=${forceMethod}, θ=${theta}`);

        // this.close();
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
        const warpSelect = document.getElementById('admin-time-warp') as HTMLSelectElement | null;
        const closeIntegratorSelect = document.getElementById('admin-close-encounter') as HTMLSelectElement | null;
        const closeHillInput = document.getElementById('admin-close-hill') as HTMLInputElement | null;
        const closeTidalInput = document.getElementById('admin-close-tidal') as HTMLInputElement | null;
        const closeJerkInput = document.getElementById('admin-close-jerk') as HTMLInputElement | null;
        const closeMaxSubsetInput = document.getElementById('admin-close-max-subset') as HTMLInputElement | null;
        const closeMaxSubstepsInput = document.getElementById('admin-close-max-substeps') as HTMLInputElement | null;
        const closeRk45AbsInput = document.getElementById('admin-close-rk45-abs') as HTMLInputElement | null;
        const closeRk45RelInput = document.getElementById('admin-close-rk45-rel') as HTMLInputElement | null;
        const closeGrItersInput = document.getElementById('admin-close-gr-iters') as HTMLInputElement | null;
        const closeGrTolInput = document.getElementById('admin-close-gr-tol') as HTMLInputElement | null;

        if (dtInput) dtInput.value = settings.dt.toString();
        if (substepsInput) substepsInput.value = settings.substeps.toString();
        if (forceMethodSelect) forceMethodSelect.value = settings.forceMethod;
        if (thetaInput) thetaInput.value = settings.theta.toString();
        if (thetaField) thetaField.classList.toggle('visible', settings.forceMethod === 'barnes-hut');
        if (simModeSelect) simModeSelect.value = settings.simMode;
        if (warpSelect) {
            warpSelect.value = settings.timeScale.toString();
        }
        if (closeIntegratorSelect) closeIntegratorSelect.value = settings.closeEncounterIntegrator;
        if (closeHillInput) closeHillInput.value = settings.closeEncounterHillFactor.toString();
        if (closeTidalInput) closeTidalInput.value = settings.closeEncounterTidalRatio.toString();
        if (closeJerkInput) closeJerkInput.value = settings.closeEncounterJerkNorm.toString();
        if (closeMaxSubsetInput) closeMaxSubsetInput.value = settings.closeEncounterMaxSubsetSize.toString();
        if (closeMaxSubstepsInput) closeMaxSubstepsInput.value = settings.closeEncounterMaxTrialSubsteps.toString();
        if (closeRk45AbsInput) closeRk45AbsInput.value = settings.closeEncounterRk45AbsTol.toString();
        if (closeRk45RelInput) closeRk45RelInput.value = settings.closeEncounterRk45RelTol.toString();
        if (closeGrItersInput) closeGrItersInput.value = settings.closeEncounterGaussRadauMaxIters.toString();
        if (closeGrTolInput) closeGrTolInput.value = settings.closeEncounterGaussRadauTol.toString();
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
