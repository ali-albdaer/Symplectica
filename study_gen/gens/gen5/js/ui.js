/**
 * ui.js - User Interface Management
 * 
 * Manages all UI panels, updates, and user interactions.
 * Provides a clean interface between the simulation and the DOM.
 */

import { getState, AppMode } from './state.js';
import { getSimulation } from './simulation.js';
import { getRenderer } from './renderer.js';
import { getInputManager } from './input.js';
import { syncBodyVisuals } from './bodyVisuals.js';
import { loadPreset } from './presets.js';
import { exportToFile, importFromFile } from './serialization.js';
import { Body } from './body.js';
import { Units, PerformancePresets } from './constants.js';

/**
 * UI Manager class
 */
export class UIManager {
    constructor() {
        // Panel references
        this.topBar = null;
        this.spawnPanel = null;
        this.inspectorPanel = null;
        this.diagnosticsPanel = null;
        this.settingsPanel = null;
        this.errorPanel = null;
        this.controlsHelp = null;
        this.bodyListPanel = null;
        
        // Display elements
        this.modeLabel = null;
        this.timeState = null;
        this.diagFPS = null;
        this.diagBodies = null;
        this.diagTimestep = null;
        this.diagSimTime = null;
        this.diagEnergy = null;
        this.diagEnergyError = null;
        this.diagAngular = null;
        
        // Inspector content
        this.inspectorContent = null;
        
        // Track which body inspector is showing (to avoid rebuilding when not needed)
        this.inspectorBodyId = null;
        this.inspectorNeedsRefresh = false;
        
        // FPS tracking
        this.fpsFrames = 0;
        this.fpsTime = 0;
        this.currentFPS = 0;
        
        this.initialized = false;
    }

    /**
     * Initialize UI manager
     */
    init() {
        // Get panel references
        this.topBar = document.getElementById('top-bar');
        this.spawnPanel = document.getElementById('spawn-panel');
        this.inspectorPanel = document.getElementById('inspector-panel');
        this.diagnosticsPanel = document.getElementById('diagnostics-panel');
        this.settingsPanel = document.getElementById('settings-panel');
        this.errorPanel = document.getElementById('error-panel');
        this.controlsHelp = document.getElementById('controls-help');
        this.bodyListPanel = document.getElementById('body-list-panel');
        
        // Get display elements
        this.modeLabel = document.getElementById('mode-label');
        this.timeState = document.getElementById('time-state');
        this.diagFPS = document.getElementById('diag-fps');
        this.diagBodies = document.getElementById('diag-bodies');
        this.diagTimestep = document.getElementById('diag-timestep');
        this.diagSimTime = document.getElementById('diag-simtime');
        this.diagEnergy = document.getElementById('diag-energy');
        this.diagEnergyError = document.getElementById('diag-energy-error');
        this.diagAngular = document.getElementById('diag-angular');
        
        this.inspectorContent = document.getElementById('inspector-content');
        
        // Set up event listeners
        this._setupEventListeners();
        
        // Set up hover detection for UI panels
        this._setupUIHoverDetection();
        
        // Initial update
        this.update();
        
        this.initialized = true;
    }

    /**
     * Set up event listeners for UI elements
     * @private
     */
    _setupEventListeners() {
        // Spawn buttons
        document.querySelectorAll('.spawn-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                getState().startSpawning(type);
                this.update();
            });
        });
        
        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetId = e.currentTarget.dataset.preset;
                loadPreset(presetId);
                syncBodyVisuals();
                this.update();
            });
        });
        
        // Quick controls
        document.getElementById('btn-play-pause')?.addEventListener('click', () => {
            const simulation = getSimulation();
            simulation.toggle();
            this.update();
        });
        
        document.getElementById('btn-step')?.addEventListener('click', () => {
            const simulation = getSimulation();
            if (!simulation.isRunning) {
                simulation.singleStep();
                syncBodyVisuals();
                this.update();
            }
        });
        
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            const simulation = getSimulation();
            simulation.reset();
            syncBodyVisuals();
            this.update();
        });
        
        // Scene controls
        document.getElementById('btn-export')?.addEventListener('click', () => {
            exportToFile('celestial_scene');
        });
        
        document.getElementById('btn-import')?.addEventListener('click', () => {
            document.getElementById('import-file')?.click();
        });
        
        document.getElementById('import-file')?.addEventListener('change', async (e) => {
            const file = e.target.files?.[0];
            if (file) {
                try {
                    await importFromFile(file);
                    syncBodyVisuals();
                    this.update();
                } catch (err) {
                    this.showError(err.message);
                }
                e.target.value = ''; // Reset for next import
            }
        });
        
        document.getElementById('btn-clear')?.addEventListener('click', () => {
            if (confirm('Clear all bodies?')) {
                const simulation = getSimulation();
                simulation.clearBodies();
                syncBodyVisuals();
                this.update();
            }
        });
        
        // Settings controls
        document.getElementById('perf-preset')?.addEventListener('change', (e) => {
            const preset = e.target.value;
            const state = getState();
            state.performancePreset = preset;
            const settings = PerformancePresets[preset];
            if (settings) {
                state.maxTrailPoints = settings.maxTrailPoints;
                state.effectsEnabled = settings.effectsEnabled;
                getSimulation().substeps = settings.substeps;
            }
        });
        
        document.getElementById('integrator-select')?.addEventListener('change', (e) => {
            const simulation = getSimulation();
            simulation.setIntegrator(e.target.value);
        });
        
        document.getElementById('physics-mode')?.addEventListener('change', (e) => {
            const simulation = getSimulation();
            simulation.setPhysicsMode(e.target.value);
        });
        
        document.getElementById('timestep-input')?.addEventListener('change', (e) => {
            const simulation = getSimulation();
            simulation.timestep = parseFloat(e.target.value) || 3600;
        });
        
        document.getElementById('timescale-slider')?.addEventListener('input', (e) => {
            const simulation = getSimulation();
            simulation.timeScale = parseFloat(e.target.value);
            document.getElementById('timescale-value').textContent = `${simulation.timeScale.toFixed(1)}x`;
        });
        
        document.getElementById('softening-input')?.addEventListener('change', (e) => {
            const simulation = getSimulation();
            simulation.softening = parseFloat(e.target.value) || 0;
        });
        
        document.getElementById('show-trails')?.addEventListener('change', (e) => {
            getState().showTrails = e.target.checked;
            getRenderer().updateVisibility();
        });
        
        document.getElementById('trail-length-slider')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            getState().maxTrailPoints = value;
            document.getElementById('trail-length-value').textContent = `${value} points`;
        });
        
        document.getElementById('trail-width-slider')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            getState().trailWidth = value;
            document.getElementById('trail-width-value').textContent = `${value}px`;
        });
        
        document.getElementById('show-vectors')?.addEventListener('change', (e) => {
            getState().showVelocityVectors = e.target.checked;
            getRenderer().updateVisibility();
        });
        
        document.getElementById('vector-scale-slider')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            getState().vectorScale = value;
            document.getElementById('vector-scale-value').textContent = `${value}x`;
        });
        
        document.getElementById('show-grid')?.addEventListener('change', (e) => {
            getState().showGrid = e.target.checked;
            getRenderer().updateVisibility();
        });
        
        document.getElementById('show-labels')?.addEventListener('change', (e) => {
            getState().showLabels = e.target.checked;
            getRenderer().updateVisibility();
        });
        
        document.getElementById('body-scale-slider')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            getState().bodyScale = value;
            document.getElementById('body-scale-value').textContent = `${value}x`;
        });
        
        // Error panel dismiss
        document.getElementById('error-dismiss')?.addEventListener('click', () => {
            this.hideError();
        });
        
        // Help close
        document.getElementById('close-help')?.addEventListener('click', () => {
            getState().helpVisible = false;
            this.update();
        });
    }

    /**
     * Set up hover detection for UI elements
     * @private
     */
    _setupUIHoverDetection() {
        const inputManager = getInputManager();
        const uiElements = document.querySelectorAll('.ui-panel, button, input, select');
        
        uiElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                inputManager.setMouseOverUI(true);
            });
            el.addEventListener('mouseleave', () => {
                inputManager.setMouseOverUI(false);
            });
        });
    }

    /**
     * Update all UI elements
     */
    update() {
        const state = getState();
        const simulation = getSimulation();
        
        this._updateVisibility();
        this._updateModeIndicator();
        this._updateDiagnostics();
        this._updateInspector();
        this._updateBodyList();
        this._updateCursor();
    }
    
    /**
     * Force refresh of inspector (call when selection changes)
     */
    refreshInspector() {
        this.inspectorNeedsRefresh = true;
        this._updateInspector();
    }

    /**
     * Update UI visibility based on state
     * @private
     */
    _updateVisibility() {
        const state = getState();
        
        // Main panels
        const panels = [
            this.topBar,
            this.spawnPanel,
            this.inspectorPanel,
            this.diagnosticsPanel,
        ];
        
        panels.forEach(panel => {
            if (panel) {
                panel.classList.toggle('hidden', !state.uiVisible);
            }
        });
        
        // Settings panel
        if (this.settingsPanel) {
            this.settingsPanel.style.display = state.settingsVisible && state.uiVisible ? 'block' : 'none';
        }
        
        // Help overlay
        if (this.controlsHelp) {
            this.controlsHelp.style.display = state.helpVisible ? 'block' : 'none';
        }
    }

    /**
     * Update mode indicator
     * @private
     */
    _updateModeIndicator() {
        const state = getState();
        const simulation = getSimulation();
        
        if (this.modeLabel) {
            this.modeLabel.textContent = state.mode === AppMode.EDIT ? 'EDIT MODE' : 'FREE VIEW';
        }
        
        if (this.timeState) {
            this.timeState.textContent = simulation.isRunning ? '[RUNNING]' : '[PAUSED]';
            this.timeState.classList.toggle('running', simulation.isRunning);
        }
        
        // Update play button
        const playBtn = document.getElementById('btn-play-pause');
        if (playBtn) {
            playBtn.textContent = simulation.isRunning ? '⏸ Pause' : '▶ Play';
        }
    }

    /**
     * Update diagnostics display
     * @private
     */
    _updateDiagnostics() {
        const simulation = getSimulation();
        const stats = simulation.getStats();
        
        if (this.diagFPS) {
            this.diagFPS.textContent = this.currentFPS.toFixed(0);
        }
        
        if (this.diagBodies) {
            this.diagBodies.textContent = stats.bodyCount;
        }
        
        if (this.diagTimestep) {
            this.diagTimestep.textContent = Units.toScientific(stats.timestep, 2);
        }
        
        if (this.diagSimTime) {
            this.diagSimTime.textContent = stats.timeDays.toFixed(2);
        }
        
        if (this.diagEnergy) {
            this.diagEnergy.textContent = Units.toScientific(stats.totalEnergy, 3);
        }
        
        if (this.diagEnergyError) {
            const errorPercent = (stats.energyError * 100);
            this.diagEnergyError.textContent = errorPercent.toFixed(6);
            
            // Color code by severity
            this.diagEnergyError.classList.remove('warning', 'error');
            if (errorPercent > 10) {
                this.diagEnergyError.classList.add('error');
            } else if (errorPercent > 1) {
                this.diagEnergyError.classList.add('warning');
            }
        }
        
        if (this.diagAngular) {
            this.diagAngular.textContent = Units.toScientific(stats.angularMomentum, 3);
        }
    }

    /**
     * Update inspector panel
     * @private
     */
    _updateInspector() {
        const state = getState();
        const simulation = getSimulation();
        
        if (!this.inspectorContent) return;
        
        const body = state.getSelectedBody();
        const currentBodyId = body ? body.id : null;
        
        // Only rebuild inspector HTML if selection changed or refresh requested
        if (currentBodyId === this.inspectorBodyId && !this.inspectorNeedsRefresh) {
            return;
        }
        
        this.inspectorBodyId = currentBodyId;
        this.inspectorNeedsRefresh = false;
        
        if (!body) {
            this.inspectorContent.innerHTML = '<p class="hint">Select a body to inspect</p>';
            return;
        }
        
        // Build inspector HTML
        const html = `
            <div class="inspector-field">
                <label>Name</label>
                <input type="text" id="insp-name" value="${body.name}">
            </div>
            <div class="inspector-field">
                <label>Type</label>
                <input type="text" value="${body.type}" disabled>
            </div>
            <div class="inspector-field">
                <label>Mass (kg)</label>
                <input type="text" id="insp-mass" value="${Units.toScientific(body.mass, 4)}">
            </div>
            <div class="inspector-field">
                <label>Radius (m)</label>
                <input type="text" id="insp-radius" value="${Units.toScientific(body.radius, 4)}">
            </div>
            
            <div class="inspector-section">
                <h4>Position (m)</h4>
                <div class="inspector-row">
                    <div class="inspector-field">
                        <label>X</label>
                        <input type="text" id="insp-px" value="${Units.toScientific(body.position.x, 4)}">
                    </div>
                    <div class="inspector-field">
                        <label>Y</label>
                        <input type="text" id="insp-py" value="${Units.toScientific(body.position.y, 4)}">
                    </div>
                    <div class="inspector-field">
                        <label>Z</label>
                        <input type="text" id="insp-pz" value="${Units.toScientific(body.position.z, 4)}">
                    </div>
                </div>
            </div>
            
            <div class="inspector-section">
                <h4>Velocity (m/s)</h4>
                <div class="inspector-row">
                    <div class="inspector-field">
                        <label>VX</label>
                        <input type="text" id="insp-vx" value="${Units.toScientific(body.velocity.x, 4)}">
                    </div>
                    <div class="inspector-field">
                        <label>VY</label>
                        <input type="text" id="insp-vy" value="${Units.toScientific(body.velocity.y, 4)}">
                    </div>
                    <div class="inspector-field">
                        <label>VZ</label>
                        <input type="text" id="insp-vz" value="${Units.toScientific(body.velocity.z, 4)}">
                    </div>
                </div>
            </div>
            
            <div class="inspector-section">
                <h4>Computed</h4>
                <div class="inspector-field">
                    <label>Speed</label>
                    <input type="text" value="${Units.formatDistance(body.velocity.magnitude())}/s" disabled>
                </div>
                <div class="inspector-field">
                    <label>Kinetic Energy</label>
                    <input type="text" value="${Units.toScientific(body.kineticEnergy(), 3)} J" disabled>
                </div>
                <div class="inspector-field">
                    <label>Distance from Origin</label>
                    <input type="text" value="${Units.formatDistance(body.position.magnitude())}" disabled>
                </div>
            </div>
            
            <button id="insp-apply" style="width:100%; margin-top:10px;">Apply Changes</button>
            <button id="insp-refresh" style="width:100%; margin-top:5px; background: rgba(80,80,150,0.6);">Refresh Values</button>
            <button id="insp-delete" style="width:100%; margin-top:5px; background: rgba(150,50,50,0.6);">Delete Body</button>
        `;
        
        this.inspectorContent.innerHTML = html;
        
        // Add event listeners
        document.getElementById('insp-apply')?.addEventListener('click', () => {
            this._applyInspectorChanges(body);
        });
        
        document.getElementById('insp-refresh')?.addEventListener('click', () => {
            this.refreshInspector();
        });
        
        document.getElementById('insp-delete')?.addEventListener('click', () => {
            simulation.removeBody(body.id);
            state.selectBody(null);
            syncBodyVisuals();
            this.inspectorBodyId = null;
            this.update();
        });
        
        // Set up hover detection for new input elements
        const inputManager = getInputManager();
        this.inspectorContent.querySelectorAll('input, button').forEach(el => {
            el.addEventListener('mouseenter', () => {
                inputManager.setMouseOverUI(true);
            });
            el.addEventListener('mouseleave', () => {
                inputManager.setMouseOverUI(false);
            });
        });
    }

    /**
     * Update body list panel
     * @private
     */
    _updateBodyList() {
        const bodyListContent = document.getElementById('body-list-content');
        if (!bodyListContent) return;
        
        const simulation = getSimulation();
        const state = getState();
        const bodies = simulation.getBodies();
        
        if (bodies.length === 0) {
            bodyListContent.innerHTML = '<p class="hint">No bodies in simulation</p>';
            return;
        }
        
        let html = '<ul class="body-list">';
        bodies.forEach((body, index) => {
            const isSelected = state.selectedBodyId === body.id;
            html += `<li class="body-list-item ${isSelected ? 'selected' : ''}" data-body-id="${body.id}">
                <span class="body-index">${index + 1}.</span>
                <span class="body-name">${body.name}</span>
                <span class="body-type">${body.type}</span>
            </li>`;
        });
        html += '</ul>';
        
        bodyListContent.innerHTML = html;
        
        // Add click handlers
        bodyListContent.querySelectorAll('.body-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const bodyId = item.dataset.bodyId;
                state.selectBody(bodyId);
                this.refreshInspector();
            });
        });
    }

    /**
     * Cycle to next/previous body in the list
     * @param {number} direction - 1 for next, -1 for previous
     */
    cycleBody(direction = 1) {
        const simulation = getSimulation();
        const state = getState();
        const bodies = simulation.getBodies();
        
        if (bodies.length === 0) return;
        
        let currentIndex = bodies.findIndex(b => b.id === state.selectedBodyId);
        if (currentIndex === -1) {
            currentIndex = direction > 0 ? -1 : bodies.length;
        }
        
        const nextIndex = (currentIndex + direction + bodies.length) % bodies.length;
        const nextBody = bodies[nextIndex];
        
        state.selectBody(nextBody.id);
        this.refreshInspector();
        
        // Focus camera on selected body
        const renderer = getRenderer();
        renderer.focusOnBody(nextBody);
    }

    /**
     * Apply changes from inspector inputs to body
     * @param {Body} body - The body to update
     * @private
     */
    _applyInspectorChanges(body) {
        const getValue = (id) => {
            const el = document.getElementById(id);
            return el ? parseFloat(el.value) : NaN;
        };
        
        const getStringValue = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        
        // Track what changed for debugging
        const changes = [];
        
        // Update name
        const name = getStringValue('insp-name');
        if (name && name !== body.name) {
            body.name = name;
            changes.push(`name=${name}`);
        }
        
        // Update mass
        const mass = getValue('insp-mass');
        if (!isNaN(mass) && mass > 0 && mass !== body.mass) {
            body.mass = mass;
            changes.push(`mass=${mass.toExponential(2)}`);
        }
        
        // Update radius - always force mesh rebuild for radius changes
        const radius = getValue('insp-radius');
        const oldRadius = body.radius;
        if (!isNaN(radius) && radius > 0 && radius !== oldRadius) {
            body.radius = radius;
            changes.push(`radius=${radius.toExponential(2)}`);
        }
        
        // Update position
        const px = getValue('insp-px');
        const py = getValue('insp-py');
        const pz = getValue('insp-pz');
        if (!isNaN(px) && px !== body.position.x) { body.position.x = px; changes.push(`px=${px.toExponential(2)}`); }
        if (!isNaN(py) && py !== body.position.y) { body.position.y = py; changes.push(`py=${py.toExponential(2)}`); }
        if (!isNaN(pz) && pz !== body.position.z) { body.position.z = pz; changes.push(`pz=${pz.toExponential(2)}`); }
        
        // Update velocity
        const vx = getValue('insp-vx');
        const vy = getValue('insp-vy');
        const vz = getValue('insp-vz');
        if (!isNaN(vx) && vx !== body.velocity.x) { body.velocity.x = vx; changes.push(`vx=${vx.toExponential(2)}`); }
        if (!isNaN(vy) && vy !== body.velocity.y) { body.velocity.y = vy; changes.push(`vy=${vy.toExponential(2)}`); }
        if (!isNaN(vz) && vz !== body.velocity.z) { body.velocity.z = vz; changes.push(`vz=${vz.toExponential(2)}`); }
        
        if (changes.length === 0) {
            console.log(`No changes detected for ${body.name}`);
            return;
        }
        
        // Clear trail after changes
        body.clearTrail();
        
        // Update simulation (recompute conservation baseline)
        const simulation = getSimulation();
        simulation._updateInitialConservation();
        
        // Always force mesh rebuild when ANY property changes to ensure visual update
        const renderer = getRenderer();
        const mesh = renderer.bodyMeshes.get(body.id);
        if (mesh) {
            renderer.bodiesGroup.remove(mesh);
            // Dispose geometry
            if (mesh.geometry) mesh.geometry.dispose();
            // Dispose materials (handle groups and single meshes)
            mesh.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            renderer.bodyMeshes.delete(body.id);
            console.log(`Removed old mesh for ${body.name}, will recreate`);
        }
        
        syncBodyVisuals();
        this.update();
        
        console.log(`Applied changes to ${body.name}: ${changes.join(', ')}`);
    }

    /**
     * Update cursor based on state
     * @private
     */
    _updateCursor() {
        const state = getState();
        const body = document.body;
        
        // Remove all cursor classes
        body.classList.remove('cursor-grab', 'cursor-grabbing', 'cursor-pointer', 'cursor-crosshair');
        
        switch (state.cursorState) {
            case 'grab':
                body.classList.add('cursor-grab');
                break;
            case 'grabbing':
                body.classList.add('cursor-grabbing');
                break;
            case 'pointer':
                body.classList.add('cursor-pointer');
                break;
            case 'crosshair':
                body.classList.add('cursor-crosshair');
                break;
        }
    }

    /**
     * Update FPS counter
     * @param {number} deltaTime - Time since last frame
     */
    updateFPS(deltaTime) {
        this.fpsFrames++;
        this.fpsTime += deltaTime;
        
        if (this.fpsTime >= 1) {
            this.currentFPS = this.fpsFrames / this.fpsTime;
            this.fpsFrames = 0;
            this.fpsTime = 0;
            
            // Update display
            if (this.diagFPS) {
                this.diagFPS.textContent = this.currentFPS.toFixed(0);
            }
        }
    }

    /**
     * Show an error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.errorPanel) {
            document.getElementById('error-message').textContent = message;
            this.errorPanel.style.display = 'flex';
        }
        console.error('[UI Error]', message);
    }

    /**
     * Hide error message
     */
    hideError() {
        if (this.errorPanel) {
            this.errorPanel.style.display = 'none';
        }
    }

    /**
     * Show a warning message
     * @param {string} message - Warning message
     */
    showWarning(message) {
        // For now, show as error with different styling could be added
        this.showError('⚠️ ' + message);
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideError(), 5000);
    }
}

// Singleton instance
let uiManagerInstance = null;

/**
 * Get the global UI manager
 * @returns {UIManager}
 */
export function getUIManager() {
    if (!uiManagerInstance) {
        uiManagerInstance = new UIManager();
    }
    return uiManagerInstance;
}

/**
 * Initialize UI manager
 * @returns {UIManager}
 */
export function initUIManager() {
    const manager = getUIManager();
    manager.init();
    return manager;
}

export default {
    UIManager,
    getUIManager,
    initUIManager,
};
