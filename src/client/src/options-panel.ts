/**
 * Options Panel
 *
 * Consolidated settings for Visualization, Camera and Experimental features.
 */

import { APP_DEFAULTS } from './defaults';
import { RingProfile, RingStop } from './renderer';

export interface VisualizationOptions {
    showOrbitTrails: boolean;
    showStarLabels: boolean;
    showPlanetLabels: boolean;
    showMoonLabels: boolean;
    showAxisLines: boolean;
    showRefPlane: boolean;
    showRefLine: boolean;
    showRefPoint: boolean;
    showGridXY: boolean;
    showGridXZ: boolean;
    showGridYZ: boolean;
    gridSpacing: number;
    gridSize: number;
    orbitTrailLength: number;
}

export interface ExperimentalOptions {
    flaresVisible: boolean;
    flareFrequencyMode: 'fixed' | 'scaled';
    fixedFlareRate: number;
    flareBrightness: number;
    ringQuality: 'Performance' | 'HighQualityClose' | 'HighQualityAlways';
    
    // Ring Generator Events (these don't store state, they just fire actions)
    onRingGeneratorLoadRequest?: () => void;
    onRingGeneratorApply?: (profile: RingProfile) => void;
    onRingGeneratorExport?: (profile: RingProfile) => void;
}

export type VisualizationPresetName = 'Low' | 'High' | 'Ultra';

import { AU } from '../../shared/constants';
const DEFAULTS: VisualizationOptions = { ...APP_DEFAULTS.optionsDefaults };

export class OptionsPanel {
    private container: HTMLElement;
    private isOpen = false;
    private options: VisualizationOptions;

    // Callbacks
    private onChange: (options: VisualizationOptions) => void;
    private onPresetChange?: (preset: VisualizationPresetName) => void;
    private onPresetEdit?: (preset: VisualizationPresetName, patch: { renderScale?: number }) => void;
    private onFreeCamSpeedChange?: (speed: number) => void;
    private onFreeCamSensitivityChange?: (sensitivity: number) => void;
    private onFreeCamRotationDampingChange?: (damping: number) => void;
    private onSurfaceSpeedChange?: (speed: number) => void;
    private onSurfaceSensitivityChange?: (sensitivity: number) => void;
    private onSurfaceRotationDampingChange?: (damping: number) => void;
    private onSurfaceEyeHeightChange?: (height: number) => void;
    private onOrbitalRotationDampingChange?: (damping: number) => void;
    private onOrbitalZoomDampingChange?: (damping: number) => void;
    private onFovChange?: (fov: number) => void;
    private onExperimentalChange?: (options: ExperimentalOptions) => void;
    private onRingGeneratorLoadRequest?: () => void;
    private onRingGeneratorApply?: (profile: RingProfile) => void;
    private onRingGeneratorExport?: (profile: RingProfile) => void;

    // Ring Generator internal state
    private currentRingProfile: RingProfile = { stops: [], baseOpacity: 1.0, scatteringG: 0.3 };

    // State
    private presetName: VisualizationPresetName;
    private presetRenderScale = 1;
    private cameraFov = APP_DEFAULTS.cameraDefaults.cameraFov;
    private freeCamSpeed = APP_DEFAULTS.cameraDefaults.freeCamSpeedAuPerSec;
    private freeCamSensitivity = APP_DEFAULTS.cameraDefaults.freeCamSensitivity;
    private freeCamRotationDamping = APP_DEFAULTS.cameraDefaults.freeCamRotationDamping;
    private surfaceSpeed = APP_DEFAULTS.cameraDefaults.surfaceSpeedMps;
    private surfaceSensitivity = APP_DEFAULTS.cameraDefaults.surfaceSensitivity;
    private surfaceRotationDamping = APP_DEFAULTS.cameraDefaults.surfaceRotationDamping;
    private surfaceEyeHeight = APP_DEFAULTS.cameraDefaults.surfaceEyeHeightM;
    private orbitalRotationDamping = APP_DEFAULTS.cameraDefaults.orbitalRotationDamping;
    private orbitalZoomDamping = APP_DEFAULTS.cameraDefaults.orbitalZoomDamping;
    private ignoreEvents = false;
    private experimentalOptions: ExperimentalOptions = {
        flareFrequencyMode: 'scaled',
        flareBrightness: 1.0,
        flaresVisible: true,
        fixedFlareRate: 2.0,
        ringQuality: 'Performance',
    };

    // UI Elements
    private orbitsCheckbox!: HTMLInputElement;
    private starLabelsCheckbox!: HTMLInputElement;
    private planetLabelsCheckbox!: HTMLInputElement;
    private moonLabelsCheckbox!: HTMLInputElement;
    private gridXYCheckbox!: HTMLInputElement;
    private gridXZCheckbox!: HTMLInputElement;
    private gridYZCheckbox!: HTMLInputElement;
    private gridSpacingInput!: HTMLInputElement;
    private gridSpacingValue!: HTMLElement;
    private gridSizeInput!: HTMLInputElement;
    private gridSizeValue!: HTMLElement;
    private gridExtent = 200;
    private trailSlider!: HTMLInputElement;
    private trailValue!: HTMLElement;
    private presetSelect!: HTMLSelectElement;
    private presetRenderScaleInput!: HTMLInputElement;
    private presetRenderScaleValue!: HTMLElement;
    private axisLinesCheckbox!: HTMLInputElement;
    private refPlaneCheckbox!: HTMLInputElement;
    private refLineCheckbox!: HTMLInputElement;
    private refPointCheckbox!: HTMLInputElement;
    private flareFrequencySelect!: HTMLSelectElement;
    private flareBrightnessInput!: HTMLInputElement;
    private flareBrightnessValue!: HTMLElement;
    private flaresVisibleCheckbox!: HTMLInputElement;
    private fixedFlareRateInput!: HTMLInputElement;
    private fixedFlareRateValue!: HTMLElement;
    private fixedFlareRateField!: HTMLElement;
    private ringQualitySelect!: HTMLSelectElement;

    // Grid Spacing Helpers (Logarithmic)
    private sliderToSpacing(t: number): number {
        const min = 0.001;
        const max = 10;
        const minLog = Math.log10(min);
        const maxLog = Math.log10(max);
        const clamped = Math.max(0, Math.min(1, t));
        return Math.pow(10, minLog + (maxLog - minLog) * clamped);
    }

    private spacingToSlider(spacing: number): number {
        const min = 0.001;
        const max = 10;
        const minLog = Math.log10(min);
        const maxLog = Math.log10(max);
        const clamped = Math.max(min, Math.min(max, spacing));
        return (Math.log10(clamped) - minLog) / (maxLog - minLog);
    }

    // Camera Elements
    private freeCamSpeedInput!: HTMLInputElement;
    private freeCamSpeedValue!: HTMLElement;
    private freeCamSensitivityInput!: HTMLInputElement;
    private freeCamSensitivityValue!: HTMLElement;
    private freeCamRotationDampingInput!: HTMLInputElement;
    private freeCamRotationDampingValue!: HTMLElement;
    private surfaceSpeedInput!: HTMLInputElement;
    private surfaceSpeedValue!: HTMLElement;
    private surfaceSensitivityInput!: HTMLInputElement;
    private surfaceSensitivityValue!: HTMLElement;
    private surfaceRotationDampingInput!: HTMLInputElement;
    private surfaceRotationDampingValue!: HTMLElement;
    private surfaceEyeHeightInput!: HTMLInputElement;
    private surfaceEyeHeightValue!: HTMLElement;
    private orbitalRotationDampingInput!: HTMLInputElement;
    private orbitalRotationDampingValue!: HTMLElement;
    private orbitalZoomDampingInput!: HTMLInputElement;
    private orbitalZoomDampingValue!: HTMLElement;
    private fovInput!: HTMLInputElement;
    private fovValue!: HTMLElement;

    constructor(
        onChange: (options: VisualizationOptions) => void,
        onPresetChange?: (preset: VisualizationPresetName) => void,
        onPresetEdit?: (preset: VisualizationPresetName, patch: { renderScale?: number }) => void,
        onFreeCamSpeedChange?: (speed: number) => void,
        onFreeCamSensitivityChange?: (sensitivity: number) => void,
        onFreeCamRotationDampingChange?: (damping: number) => void,
        onSurfaceSpeedChange?: (speed: number) => void,
        onSurfaceSensitivityChange?: (sensitivity: number) => void,
        onSurfaceRotationDampingChange?: (damping: number) => void,
        onSurfaceEyeHeightChange?: (height: number) => void,
        onOrbitalRotationDampingChange?: (damping: number) => void,
        onOrbitalZoomDampingChange?: (damping: number) => void,
        onFovChange?: (fov: number) => void,
        initialPreset: VisualizationPresetName = APP_DEFAULTS.visualPresetDefault,
        onExperimentalChange?: (options: ExperimentalOptions) => void,
        onRingGeneratorLoadRequest?: () => void,
        onRingGeneratorApply?: (profile: RingProfile) => void,
        onRingGeneratorExport?: (profile: RingProfile) => void,
    ) {
        this.onChange = onChange;
        this.onPresetChange = onPresetChange;
        this.onPresetEdit = onPresetEdit;
        this.onFreeCamSpeedChange = onFreeCamSpeedChange;
        this.onFreeCamSensitivityChange = onFreeCamSensitivityChange;
        this.onFreeCamRotationDampingChange = onFreeCamRotationDampingChange;
        this.onSurfaceSpeedChange = onSurfaceSpeedChange;
        this.onSurfaceSensitivityChange = onSurfaceSensitivityChange;
        this.onSurfaceRotationDampingChange = onSurfaceRotationDampingChange;
        this.onSurfaceEyeHeightChange = onSurfaceEyeHeightChange;
        this.onOrbitalRotationDampingChange = onOrbitalRotationDampingChange;
        this.onOrbitalZoomDampingChange = onOrbitalZoomDampingChange;
        this.onFovChange = onFovChange;
        this.onExperimentalChange = onExperimentalChange;
        this.onRingGeneratorLoadRequest = onRingGeneratorLoadRequest;
        this.onRingGeneratorApply = onRingGeneratorApply;
        this.onRingGeneratorExport = onRingGeneratorExport;
        this.presetName = initialPreset;
        this.options = { ...DEFAULTS };
        this.container = this.createUI();
        this.cacheElements();
        this.bindEvents();
        this.syncUIFromOptions();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'opt-panel';
        container.innerHTML = `
            <div class="opt-header">
                <h2>Options</h2>
                <button class="opt-close" title="Close (O)">&times;</button>
            </div>

            <div class="opt-tabs">
                <button class="opt-tab active" data-tab="graphics">Graphics</button>
                <button class="opt-tab" data-tab="camera">Camera</button>
                <button class="opt-tab" data-tab="experimental">Experimental</button>
            </div>

            <div class="opt-content active" id="tab-graphics">
                <section class="opt-section">
                    <h3>Preset</h3>
                    <div class="opt-field">
                        <label>Visual Quality</label>
                        <select id="opt-preset">
                            <option value="Low">Low</option>
                            <option value="High">High</option>
                            <option value="Ultra">Ultra</option>
                        </select>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Preset Tuning</h3>
                    <div class="opt-field">
                        <label>Render Scale</label>
                        <input type="range" id="opt-render-scale" min="0.1" max="100" step="0.05" value="1">
                        <span id="opt-render-scale-value">1.00x</span>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Display</h3>

                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-orbits">
                            <span>Trails</span>
                        </label>
                        <div style="display: flex; gap: 8px;">
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-star-labels">
                                <span>Star</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-planet-labels">
                                <span>Planet</span>
                            </label>
                            <label class="opt-toggle">
                                <input type="checkbox" id="opt-moon-labels">
                                <span>Moon</span>
                            </label>
                        </div>
                    </div>

                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-grid-xy">
                            <span>XY</span>
                        </label>
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-grid-xz">
                            <span>XZ</span>
                        </label>
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-grid-yz">
                            <span>YZ</span>
                        </label>
                    </div>

                    <div class="opt-field">
                        <label>Grid Spacing (AU)</label>
                        <input type="range" id="opt-grid-spacing" min="0" max="1" step="0.001" value="0.5">
                        <span id="opt-grid-spacing-value">0.1 AU</span>
                    </div>

                    <div class="opt-field">
                        <label>Grid Extent (AU)</label>
                        <input type="range" id="opt-grid-size" min="1" max="5000" step="1" value="200">
                        <span id="opt-grid-size-value">200 AU</span>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Body Overlays</h3>
                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-axis-lines">
                            <span>Axis</span>
                        </label>
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-ref-plane">
                            <span>Ecliptic</span>
                        </label>
                    </div>
                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-ref-line">
                            <span>Ref Line</span>
                        </label>
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-ref-point">
                            <span>Ref Point</span>
                        </label>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Trail Length</h3>
                    <div class="opt-slider-row">
                        <input type="range" id="opt-trail-length" min="10" max="2000" step="10">
                        <span id="opt-trail-value">100</span>
                    </div>
                </section>
            </div>

            <div class="opt-content" id="tab-camera" style="display: none;">
                <section class="opt-section">
                    <h3>Global Camera Settings</h3>
                    <div class="opt-field">
                        <label>Field of View</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-camera-fov" min="10" max="120" step="1" value="75">
                            <span id="opt-camera-fov-value">75°</span>
                        </div>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Orbital Camera Settings</h3>
                    <div class="opt-field">
                        <label>Rotation Smoothing</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-orbital-rotation-damping" min="0.5" max="0.99" step="0.01" value="0.92">
                            <span id="opt-orbital-rotation-damping-value">92%</span>
                        </div>
                    </div>

                    <div class="opt-field">
                        <label>Zoom Smoothing</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-orbital-zoom-damping" min="0.5" max="0.99" step="0.01" value="0.9">
                            <span id="opt-orbital-zoom-damping-value">90%</span>
                        </div>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Free Camera Settings</h3>
                    <div class="opt-field">
                        <label>Rotation Smoothing</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-freecam-rotation-damping" min="0" max="0.99" step="0.01" value="0">
                            <span id="opt-freecam-rotation-damping-value">0%</span>
                        </div>
                    </div>

                    <div class="opt-field">
                        <label>Speed (AU/s)</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-freecam-speed" min="0" max="100" step="0.1" value="0.1">
                            <span id="opt-freecam-speed-value">0.100 AU/s</span>
                        </div>
                    </div>

                    <div class="opt-field">
                        <label>Sensitivity</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-freecam-sensitivity" min="0.1" max="2" step="0.1" value="0.3">
                            <span id="opt-freecam-sensitivity-value">0.3x</span>
                        </div>
                    </div>
                </section>

                <section class="opt-section">
                    <h3>Surface Camera Settings</h3>
                    <div class="opt-field">
                        <label>Rotation Smoothing</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-surface-rotation-damping" min="0" max="0.99" step="0.01" value="0">
                            <span id="opt-surface-rotation-damping-value">0%</span>
                        </div>
                    </div>

                    <div class="opt-field">
                        <label>Speed (m/s)</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-surface-speed" min="0" max="50" step="0.5" value="5">
                            <span id="opt-surface-speed-value">5.0 m/s</span>
                        </div>
                    </div>

                    <div class="opt-field">
                        <label>Sensitivity</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-surface-sensitivity" min="0.1" max="2" step="0.1" value="0.3">
                            <span id="opt-surface-sensitivity-value">0.3x</span>
                        </div>
                    </div>

                    <div class="opt-field">
                        <label>Eye Height (m)</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-surface-eye-height" min="0.5" max="5" step="0.1" value="1.7">
                            <span id="opt-surface-eye-height-value">1.7 m</span>
                        </div>
                    </div>
                </section>
            </div>

            <div class="opt-content" id="tab-experimental" style="display: none;">
                <section class="opt-section">
                    <h3>Solar Flares</h3>
                    <div class="opt-row">
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-flares-visible" checked>
                            <span>Visible</span>
                        </label>
                    </div>
                    <div class="opt-field">
                        <label>Frequency Mode</label>
                        <select id="opt-flare-frequency">
                            <option value="scaled">Scale with Time</option>
                            <option value="fixed">Fixed Rate</option>
                        </select>
                    </div>
                    <div class="opt-field" id="opt-fixed-rate-field" style="display: none;">
                        <label>Fixed Rate (per 100s)</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-fixed-flare-rate" min="0.2" max="10" step="0.1" value="2">
                            <span id="opt-fixed-flare-rate-value">2.0</span>
                        </div>
                    </div>
                    <div class="opt-field">
                        <label>Brightness</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-flare-brightness" min="0" max="3" step="0.05" value="1">
                            <span id="opt-flare-brightness-value">1.00x</span>
                        </div>
                    </div>
                </section>
                <section class="opt-section">
                    <h3>Planetary Rings</h3>
                    <div class="opt-field">
                        <label>Render Quality</label>
                        <select id="opt-ring-quality">
                            <option value="Performance">Performance (Default)</option>
                            <option value="HighQualityClose">High Quality (Close Range)</option>
                            <option value="HighQualityAlways">High Quality (Always)</option>
                        </select>
                    </div>
                </section>
                <section class="opt-section">
                    <h3>Ring Generator (Followed Body)</h3>
                    <div class="opt-row">
                        <button id="opt-ring-gen-load" class="opt-btn">Load Current Body</button>
                    </div>
                    <div class="opt-field">
                        <label>Base Opacity</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-ring-gen-opacity" min="0" max="2" step="0.05" value="1.0">
                            <span id="opt-ring-gen-opacity-val">1.0</span>
                        </div>
                    </div>
                    <div class="opt-field">
                        <label>Scattering (g)</label>
                        <div class="opt-slider-row">
                            <input type="range" id="opt-ring-gen-g" min="-0.99" max="0.99" step="0.01" value="0.3">
                            <span id="opt-ring-gen-g-val">0.3</span>
                        </div>
                    </div>
                    <div class="opt-field" style="margin-top:10px;">
                        <label style="display:flex;justify-content:space-between;align-items:center;">
                            <span>Gradient Stops</span>
                            <button id="opt-ring-gen-add-stop" class="opt-btn" style="padding:2px 6px; font-size:12px;">+ Add Stop</button>
                        </label>
                        <div id="opt-ring-gen-stops" style="display:flex;flex-direction:column;gap:5px;max-height:200px;overflow-y:auto;border:1px solid #444;padding:5px;background:#222;">
                            <!-- Stops injected here -->
                        </div>
                    </div>
                    <div class="opt-row" style="margin-top:10px;gap:5px;">
                        <button id="opt-ring-gen-apply" class="opt-btn" style="flex:1;">Apply (Preview)</button>
                        <button id="opt-ring-gen-export" class="opt-btn" style="flex:1;">Export Code</button>
                    </div>
                </section>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #opt-panel {
                position: fixed;
                top: 20px;
                right: 360px;
                width: 260px;
                background: rgba(10, 15, 30, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fff;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 200;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            #opt-panel.open { display: flex; }

            .opt-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
                cursor: move;
                user-select: none;
            }

            .opt-header h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                color: #4fc3f7;
            }

            .opt-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }

            .opt-close:hover { color: #fff; }

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
                padding: 10px 0;
                font-size: 12px;
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

            .opt-content { padding: 12px 15px; }
            .opt-content.active { display: block; }

            .opt-section {
                margin-bottom: 14px;
            }

            .opt-section:last-child { margin-bottom: 0; }

            .opt-section h3 {
                font-size: 10px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 8px 0;
            }

            .opt-row {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 6px;
            }

            .opt-toggle {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 0;
                cursor: pointer;
            }

            .opt-toggle input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: #4fc3f7;
                margin: 0;
            }

            .opt-toggle span {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.9);
            }

            .opt-field {
                margin: 8px 0 6px 0;
            }

            .opt-field label {
                display: block;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 6px;
            }

            .opt-field select {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                padding: 6px 8px;
                font-size: 12px;
            }

            .opt-field input[type="range"] {
                width: 100%;
                accent-color: #4fc3f7;
                height: 4px;
            }

            .opt-field span {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
            }

            .opt-slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 6px;
            }

            .opt-slider-row input[type="range"] {
                flex: 1;
                accent-color: #4fc3f7;
                height: 4px;
            }

            .opt-slider-row span {
                min-width: 60px;
                text-align: right;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                font-variant-numeric: tabular-nums;
            }

            .opt-slider-row.disabled {
                opacity: 0.4;
                pointer-events: none;
            }
            .opt-btn {
                background: #4fc3f7;
                color: #000;
                border: none;
                padding: 6px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
            }
            .opt-btn:hover { background: #81d4fa; }
        `;
        document.head.appendChild(style);
        return container;
    }

    private cacheElements(): void {
        this.orbitsCheckbox = this.container.querySelector('#opt-orbits')!;
        this.starLabelsCheckbox = this.container.querySelector('#opt-star-labels')!;
        this.planetLabelsCheckbox = this.container.querySelector('#opt-planet-labels')!;
        this.moonLabelsCheckbox = this.container.querySelector('#opt-moon-labels')!;
        this.gridXYCheckbox = this.container.querySelector('#opt-grid-xy')!;
        this.gridXZCheckbox = this.container.querySelector('#opt-grid-xz')!;
        this.gridYZCheckbox = this.container.querySelector('#opt-grid-yz')!;
        this.gridSpacingInput = this.container.querySelector('#opt-grid-spacing')!;
        this.gridSpacingValue = this.container.querySelector('#opt-grid-spacing-value')!;
        this.gridSizeInput = this.container.querySelector('#opt-grid-size')!;
        this.gridSizeValue = this.container.querySelector('#opt-grid-size-value')!;
        this.trailSlider = this.container.querySelector('#opt-trail-length')!;
        this.trailValue = this.container.querySelector('#opt-trail-value')!;
        this.presetSelect = this.container.querySelector('#opt-preset')!;
        this.presetRenderScaleInput = this.container.querySelector('#opt-render-scale')!;
        this.presetRenderScaleValue = this.container.querySelector('#opt-render-scale-value')!;

        this.axisLinesCheckbox = this.container.querySelector('#opt-axis-lines')!;
        this.refPlaneCheckbox = this.container.querySelector('#opt-ref-plane')!;
        this.refLineCheckbox = this.container.querySelector('#opt-ref-line')!;
        this.refPointCheckbox = this.container.querySelector('#opt-ref-point')!;

        this.freeCamSpeedInput = this.container.querySelector('#opt-freecam-speed')!;
        this.freeCamSpeedValue = this.container.querySelector('#opt-freecam-speed-value')!;
        this.freeCamSensitivityInput = this.container.querySelector('#opt-freecam-sensitivity')!;
        this.freeCamSensitivityValue = this.container.querySelector('#opt-freecam-sensitivity-value')!;
        this.freeCamRotationDampingInput = this.container.querySelector('#opt-freecam-rotation-damping')!;
        this.freeCamRotationDampingValue = this.container.querySelector('#opt-freecam-rotation-damping-value')!;
        this.surfaceSpeedInput = this.container.querySelector('#opt-surface-speed')!;
        this.surfaceSpeedValue = this.container.querySelector('#opt-surface-speed-value')!;
        this.surfaceSensitivityInput = this.container.querySelector('#opt-surface-sensitivity')!;
        this.surfaceSensitivityValue = this.container.querySelector('#opt-surface-sensitivity-value')!;
        this.surfaceRotationDampingInput = this.container.querySelector('#opt-surface-rotation-damping')!;
        this.surfaceRotationDampingValue = this.container.querySelector('#opt-surface-rotation-damping-value')!;
        this.surfaceEyeHeightInput = this.container.querySelector('#opt-surface-eye-height')!;
        this.surfaceEyeHeightValue = this.container.querySelector('#opt-surface-eye-height-value')!;
        this.orbitalRotationDampingInput = this.container.querySelector('#opt-orbital-rotation-damping')!;
        this.orbitalRotationDampingValue = this.container.querySelector('#opt-orbital-rotation-damping-value')!;
        this.orbitalZoomDampingInput = this.container.querySelector('#opt-orbital-zoom-damping')!;
        this.orbitalZoomDampingValue = this.container.querySelector('#opt-orbital-zoom-damping-value')!;
        this.fovInput = this.container.querySelector('#opt-camera-fov')!;
        this.fovValue = this.container.querySelector('#opt-camera-fov-value')!;
        this.flareFrequencySelect = this.container.querySelector('#opt-flare-frequency')!;
        this.flareBrightnessInput = this.container.querySelector('#opt-flare-brightness')!;
        this.flareBrightnessValue = this.container.querySelector('#opt-flare-brightness-value')!;
        this.flaresVisibleCheckbox = this.container.querySelector('#opt-flares-visible')!;
        this.fixedFlareRateInput = this.container.querySelector('#opt-fixed-flare-rate')!;
        this.fixedFlareRateValue = this.container.querySelector('#opt-fixed-flare-rate-value')!;
        this.fixedFlareRateField = this.container.querySelector('#opt-fixed-rate-field')!;
        this.ringQualitySelect = this.container.querySelector('#opt-ring-quality')!;
    }

    private bindEvents(): void {
        this.container.querySelector('.opt-close')?.addEventListener('click', () => this.close());

        this.setupDrag();
        this.setupTabs();

        this.orbitsCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showOrbitTrails = this.orbitsCheckbox.checked;
            this.emitChange();
        });

        this.starLabelsCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showStarLabels = this.starLabelsCheckbox.checked;
            this.emitChange();
        });

        this.planetLabelsCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showPlanetLabels = this.planetLabelsCheckbox.checked;
            this.emitChange();
        });

        this.moonLabelsCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showMoonLabels = this.moonLabelsCheckbox.checked;
            this.emitChange();
        });

        this.gridXYCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showGridXY = this.gridXYCheckbox.checked;
            this.emitChange();
        });

        this.gridXZCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showGridXZ = this.gridXZCheckbox.checked;
            this.emitChange();
        });

        this.gridYZCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showGridYZ = this.gridYZCheckbox.checked;
            this.emitChange();
        });

        this.gridSpacingInput.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const t = parseFloat(this.gridSpacingInput.value);
            const spacingAu = this.sliderToSpacing(t);
            this.options.gridSpacing = spacingAu * AU;
            this.gridSpacingValue.textContent = `${spacingAu.toFixed(3)} AU`;

            // Adjust grid size (divisions) to keep extent constant
            // extent = gridSize * 2 * spacing
            // gridSize = extent / (2 * spacing)
            // Clamp to avoid crashing rendering if spacing is tiny
            const rawSize = this.gridExtent / (2 * spacingAu);
            this.options.gridSize = Math.max(1, Math.min(5000, Math.round(rawSize)));

            this.emitChange();
        });

        this.gridSizeInput.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const extentAu = parseFloat(this.gridSizeInput.value);
            this.gridExtent = extentAu;
            this.gridSizeValue.textContent = `${extentAu.toFixed(0)} AU`;

            const spacingAu = this.options.gridSpacing / AU;
            const rawSize = this.gridExtent / (2 * spacingAu);
            this.options.gridSize = Math.max(1, Math.min(5000, Math.round(rawSize)));

            this.emitChange();
        });

        this.axisLinesCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showAxisLines = this.axisLinesCheckbox.checked;
            this.emitChange();
        });

        this.refPlaneCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showRefPlane = this.refPlaneCheckbox.checked;
            this.emitChange();
        });

        this.refLineCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showRefLine = this.refLineCheckbox.checked;
            this.emitChange();
        });

        this.refPointCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showRefPoint = this.refPointCheckbox.checked;
            this.emitChange();
        });

        this.trailSlider.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            this.options.orbitTrailLength = parseInt(this.trailSlider.value);
            this.trailValue.textContent = this.trailSlider.value;
            this.emitChange();
        });

        this.presetSelect.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            const value = this.presetSelect.value as VisualizationPresetName;
            this.presetName = value;
            this.onPresetChange?.(value);
        });

        this.presetRenderScaleInput.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const value = parseFloat(this.presetRenderScaleInput.value);
            this.presetRenderScale = value;
            this.presetRenderScaleValue.textContent = `${value.toFixed(2)}x`;
            this.onPresetEdit?.(this.presetName, { renderScale: value });
        });

        // Camera events
        this.freeCamSpeedInput.addEventListener('input', () => {
            const speed = parseFloat(this.freeCamSpeedInput.value);
            this.freeCamSpeed = speed;
            this.freeCamSpeedValue.textContent = `${speed.toFixed(3)} AU/s`;
            this.onFreeCamSpeedChange?.(speed);
        });

        this.freeCamSensitivityInput.addEventListener('input', () => {
            const sensitivity = parseFloat(this.freeCamSensitivityInput.value);
            this.freeCamSensitivity = sensitivity;
            this.freeCamSensitivityValue.textContent = `${sensitivity.toFixed(1)}x`;
            this.onFreeCamSensitivityChange?.(sensitivity);
        });

        this.freeCamRotationDampingInput.addEventListener('input', () => {
            const damping = parseFloat(this.freeCamRotationDampingInput.value);
            this.freeCamRotationDamping = damping;
            this.freeCamRotationDampingValue.textContent = `${Math.round(damping * 100)}%`;
            this.onFreeCamRotationDampingChange?.(damping);
        });

        this.surfaceSpeedInput.addEventListener('input', () => {
            const speed = parseFloat(this.surfaceSpeedInput.value);
            this.surfaceSpeed = speed;
            this.surfaceSpeedValue.textContent = `${speed.toFixed(1)} m/s`;
            this.onSurfaceSpeedChange?.(speed);
        });

        this.surfaceSensitivityInput.addEventListener('input', () => {
            const sensitivity = parseFloat(this.surfaceSensitivityInput.value);
            this.surfaceSensitivity = sensitivity;
            this.surfaceSensitivityValue.textContent = `${sensitivity.toFixed(1)}x`;
            this.onSurfaceSensitivityChange?.(sensitivity);
        });

        this.surfaceRotationDampingInput.addEventListener('input', () => {
            const damping = parseFloat(this.surfaceRotationDampingInput.value);
            this.surfaceRotationDamping = damping;
            this.surfaceRotationDampingValue.textContent = `${Math.round(damping * 100)}%`;
            this.onSurfaceRotationDampingChange?.(damping);
        });

        this.surfaceEyeHeightInput.addEventListener('input', () => {
            const height = parseFloat(this.surfaceEyeHeightInput.value);
            this.surfaceEyeHeight = height;
            this.surfaceEyeHeightValue.textContent = `${height.toFixed(1)} m`;
            this.onSurfaceEyeHeightChange?.(height);
        });

        this.orbitalRotationDampingInput.addEventListener('input', () => {
            const damping = parseFloat(this.orbitalRotationDampingInput.value);
            this.orbitalRotationDamping = damping;
            this.orbitalRotationDampingValue.textContent = `${Math.round(damping * 100)}%`;
            this.onOrbitalRotationDampingChange?.(damping);
        });

        this.orbitalZoomDampingInput.addEventListener('input', () => {
            const damping = parseFloat(this.orbitalZoomDampingInput.value);
            this.orbitalZoomDamping = damping;
            this.orbitalZoomDampingValue.textContent = `${Math.round(damping * 100)}%`;
            this.onOrbitalZoomDampingChange?.(damping);
        });

        this.fovInput.addEventListener('input', () => {
            const fov = parseFloat(this.fovInput.value);
            this.cameraFov = fov;
            this.fovValue.textContent = `${fov}°`;
            this.onFovChange?.(fov);
        });

        // Experimental events
        this.flaresVisibleCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.experimentalOptions.flaresVisible = this.flaresVisibleCheckbox.checked;
            this.emitExperimentalChange();
        });

        this.flareFrequencySelect.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.experimentalOptions.flareFrequencyMode = this.flareFrequencySelect.value as 'fixed' | 'scaled';
            // Show/hide fixed rate slider based on mode
            this.fixedFlareRateField.style.display = this.experimentalOptions.flareFrequencyMode === 'fixed' ? '' : 'none';
            this.emitExperimentalChange();
        });

        this.flareBrightnessInput.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const brightness = parseFloat(this.flareBrightnessInput.value);
            this.experimentalOptions.flareBrightness = brightness;
            this.flareBrightnessValue.textContent = `${brightness.toFixed(2)}x`;
            this.emitExperimentalChange();
        });

        this.fixedFlareRateInput.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const rate = parseFloat(this.fixedFlareRateInput.value);
            this.experimentalOptions.fixedFlareRate = rate;
            this.fixedFlareRateValue.textContent = `${rate.toFixed(1)}`;
            this.emitExperimentalChange();
        });

        this.ringQualitySelect.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.experimentalOptions.ringQuality = this.ringQualitySelect.value as 'Performance' | 'HighQualityClose' | 'HighQualityAlways';
            this.emitExperimentalChange();
        });

        this.setupRingGeneratorEvents();
    }

    private syncRingGeneratorProfileFromUI(): void {
        const rgOpacityInput = this.container.querySelector('#opt-ring-gen-opacity') as HTMLInputElement;
        const rgGInput = this.container.querySelector('#opt-ring-gen-g') as HTMLInputElement;
        
        this.currentRingProfile.baseOpacity = parseFloat(rgOpacityInput.value);
        this.currentRingProfile.scatteringG = parseFloat(rgGInput.value);
        
        // Stops are synced continuously in their own inputs
        this.currentRingProfile.stops.sort((a, b) => a.pos - b.pos);
    }

    private renderRingGeneratorStops(): void {
        const stopsContainer = this.container.querySelector('#opt-ring-gen-stops') as HTMLDivElement;
        if (!stopsContainer) return;
        stopsContainer.innerHTML = '';
        
        this.currentRingProfile.stops.forEach((stop, index) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '5px';
            row.style.background = '#333';
            row.style.padding = '2px';
            row.style.borderRadius = '3px';

            const posInput = document.createElement('input');
            posInput.type = 'number';
            posInput.min = '0';
            posInput.max = '1';
            posInput.step = '0.01';
            posInput.value = stop.pos.toString();
            posInput.style.width = '50px';
            posInput.addEventListener('change', () => { stop.pos = parseFloat(posInput.value) || 0; });

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = stop.color.length === 7 ? stop.color : '#ffffff';
            colorInput.style.width = '30px';
            colorInput.style.padding = '0';
            colorInput.style.border = 'none';
            colorInput.addEventListener('input', () => { stop.color = colorInput.value; });

            const alphaInput = document.createElement('input');
            alphaInput.type = 'range';
            alphaInput.min = '0';
            alphaInput.max = '1';
            alphaInput.step = '0.01';
            alphaInput.value = stop.alpha.toString();
            alphaInput.style.flex = '1';
            alphaInput.style.width = '50px';
            alphaInput.addEventListener('input', () => { stop.alpha = parseFloat(alphaInput.value); });

            const delBtn = document.createElement('button');
            delBtn.textContent = 'x';
            delBtn.className = 'opt-btn';
            delBtn.style.padding = '1px 5px';
            delBtn.addEventListener('click', () => {
                this.currentRingProfile.stops.splice(index, 1);
                this.renderRingGeneratorStops();
            });

            row.appendChild(posInput);
            row.appendChild(colorInput);
            row.appendChild(alphaInput);
            row.appendChild(delBtn);
            stopsContainer.appendChild(row);
        });
    }

    private setupRingGeneratorEvents(): void {
        const rgLoadBtn = this.container.querySelector('#opt-ring-gen-load') as HTMLButtonElement;
        const rgApplyBtn = this.container.querySelector('#opt-ring-gen-apply') as HTMLButtonElement;
        const rgExportBtn = this.container.querySelector('#opt-ring-gen-export') as HTMLButtonElement;
        const rgAddStopBtn = this.container.querySelector('#opt-ring-gen-add-stop') as HTMLButtonElement;
        const rgOpacityInput = this.container.querySelector('#opt-ring-gen-opacity') as HTMLInputElement;
        const rgOpacityVal = this.container.querySelector('#opt-ring-gen-opacity-val') as HTMLSpanElement;
        const rgGInput = this.container.querySelector('#opt-ring-gen-g') as HTMLInputElement;
        const rgGVal = this.container.querySelector('#opt-ring-gen-g-val') as HTMLSpanElement;

        rgLoadBtn?.addEventListener('click', () => {
            if (this.onRingGeneratorLoadRequest) this.onRingGeneratorLoadRequest();
        });

        rgApplyBtn?.addEventListener('click', () => {
            this.syncRingGeneratorProfileFromUI();
            if (this.onRingGeneratorApply) this.onRingGeneratorApply(this.currentRingProfile);
        });

        rgExportBtn?.addEventListener('click', () => {
            this.syncRingGeneratorProfileFromUI();
            if (this.onRingGeneratorExport) this.onRingGeneratorExport(this.currentRingProfile);
        });

        rgAddStopBtn?.addEventListener('click', () => {
            this.currentRingProfile.stops.push({ pos: 0.5, color: '#ffffff', alpha: 1.0 });
            this.currentRingProfile.stops.sort((a, b) => a.pos - b.pos);
            this.renderRingGeneratorStops();
        });

        rgOpacityInput?.addEventListener('input', () => {
            rgOpacityVal.textContent = parseFloat(rgOpacityInput.value).toFixed(2);
        });

        rgGInput?.addEventListener('input', () => {
            rgGVal.textContent = parseFloat(rgGInput.value).toFixed(2);
        });
    }

    // Call this from main.ts when load request is fulfilled
    setRingGeneratorProfile(profile: RingProfile): void {
        // Deep copy
        this.currentRingProfile = {
            baseOpacity: profile.baseOpacity,
            scatteringG: profile.scatteringG,
            stops: profile.stops.map(s => ({ ...s }))
        };

        const rgOpacityInput = this.container.querySelector('#opt-ring-gen-opacity') as HTMLInputElement;
        const rgOpacityVal = this.container.querySelector('#opt-ring-gen-opacity-val') as HTMLSpanElement;
        const rgGInput = this.container.querySelector('#opt-ring-gen-g') as HTMLInputElement;
        const rgGVal = this.container.querySelector('#opt-ring-gen-g-val') as HTMLSpanElement;

        if (rgOpacityInput) {
            rgOpacityInput.value = this.currentRingProfile.baseOpacity.toString();
            rgOpacityVal.textContent = this.currentRingProfile.baseOpacity.toFixed(2);
        }
        if (rgGInput) {
            rgGInput.value = this.currentRingProfile.scatteringG.toString();
            rgGVal.textContent = this.currentRingProfile.scatteringG.toFixed(2);
        }

        this.renderRingGeneratorStops();
    }


    private setupTabs(): void {
        const tabs = this.container.querySelectorAll('.opt-tab');
        const contents = this.container.querySelectorAll('.opt-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetId = (tab as HTMLElement).dataset.tab;

                // Update tabs
                tabs.forEach(t => t.classList.toggle('active', t === tab));

                // Update content
                contents.forEach(content => {
                    const id = content.id.replace('tab-', '');
                    (content as HTMLElement).style.display = id === targetId ? 'block' : 'none';
                });
            });
        });
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'o' || e.key === 'O') this.toggle();
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    private setupDrag(): void {
        const header = this.container.querySelector('.opt-header') as HTMLElement | null;
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
            this.container.style.left = `${startLeft + deltaX}px`;
            this.container.style.top = `${startTop + deltaY}px`;
        };

        const onMouseUp = () => {
            dragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        header.addEventListener('mousedown', (event) => {
            if ((event.target as HTMLElement).closest('button')) return;
            const rect = this.container.getBoundingClientRect();
            startX = event.clientX;
            startY = event.clientY;
            startLeft = rect.left;
            startTop = rect.top;
            this.container.style.left = `${rect.left}px`;
            this.container.style.top = `${rect.top}px`;
            this.container.style.right = 'auto';
            dragging = true;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    private emitChange(): void {
        this.onChange({ ...this.options });
    }

    private emitExperimentalChange(): void {
        this.onExperimentalChange?.({ ...this.experimentalOptions });
    }

    private syncUIFromOptions(): void {
        this.ignoreEvents = true;

        this.orbitsCheckbox.checked = this.options.showOrbitTrails;
        this.starLabelsCheckbox.checked = this.options.showStarLabels;
        this.planetLabelsCheckbox.checked = this.options.showPlanetLabels;
        this.moonLabelsCheckbox.checked = this.options.showMoonLabels;
        this.gridXYCheckbox.checked = this.options.showGridXY;
        this.gridXZCheckbox.checked = this.options.showGridXZ;
        this.gridYZCheckbox.checked = this.options.showGridYZ;
        this.axisLinesCheckbox.checked = this.options.showAxisLines;
        this.refPlaneCheckbox.checked = this.options.showRefPlane;
        this.refLineCheckbox.checked = this.options.showRefLine;
        this.refPointCheckbox.checked = this.options.showRefPoint;
        this.gridSpacingInput.value = String(this.spacingToSlider(this.options.gridSpacing / AU));
        this.gridSpacingValue.textContent = `${(this.options.gridSpacing / AU).toFixed(3)} AU`;

        // Calculate extent
        const currentExtent = this.options.gridSize * 2 * (this.options.gridSpacing / AU);
        this.gridExtent = currentExtent;
        this.gridSizeInput.value = String(currentExtent);
        this.gridSizeValue.textContent = `${currentExtent.toFixed(0)} AU`;
        this.trailSlider.value = String(this.options.orbitTrailLength);
        this.trailValue.textContent = String(this.options.orbitTrailLength);
        this.presetSelect.value = this.presetName;
        this.presetRenderScaleInput.value = String(this.presetRenderScale);
        this.presetRenderScaleValue.textContent = `${this.presetRenderScale.toFixed(2)}x`;
        this.freeCamSpeedInput.value = this.freeCamSpeed.toString();
        this.freeCamSpeedValue.textContent = `${this.freeCamSpeed.toFixed(3)} AU/s`;
        this.freeCamSensitivityInput.value = this.freeCamSensitivity.toString();
        this.freeCamSensitivityValue.textContent = `${this.freeCamSensitivity.toFixed(1)}x`;
        this.freeCamRotationDampingInput.value = this.freeCamRotationDamping.toString();
        this.freeCamRotationDampingValue.textContent = `${Math.round(this.freeCamRotationDamping * 100)}%`;
        this.surfaceSpeedInput.value = this.surfaceSpeed.toString();
        this.surfaceSpeedValue.textContent = `${this.surfaceSpeed.toFixed(1)} m/s`;
        this.surfaceSensitivityInput.value = this.surfaceSensitivity.toString();
        this.surfaceSensitivityValue.textContent = `${this.surfaceSensitivity.toFixed(1)}x`;
        this.surfaceRotationDampingInput.value = this.surfaceRotationDamping.toString();
        this.surfaceRotationDampingValue.textContent = `${Math.round(this.surfaceRotationDamping * 100)}%`;
        this.surfaceEyeHeightInput.value = this.surfaceEyeHeight.toString();
        this.surfaceEyeHeightValue.textContent = `${this.surfaceEyeHeight.toFixed(1)} m`;
        this.orbitalRotationDampingInput.value = this.orbitalRotationDamping.toString();
        this.orbitalRotationDampingValue.textContent = `${Math.round(this.orbitalRotationDamping * 100)}%`;
        this.orbitalZoomDampingInput.value = this.orbitalZoomDamping.toString();
        this.orbitalZoomDampingValue.textContent = `${Math.round(this.orbitalZoomDamping * 100)}%`;
        
        this.fovInput.value = this.cameraFov.toString();
        this.fovValue.textContent = `${this.cameraFov}°`;

        this.flaresVisibleCheckbox.checked = this.experimentalOptions.flaresVisible;
        this.flareFrequencySelect.value = this.experimentalOptions.flareFrequencyMode;
        this.flareBrightnessInput.value = this.experimentalOptions.flareBrightness.toString();
        this.flareBrightnessValue.textContent = `${this.experimentalOptions.flareBrightness.toFixed(2)}x`;
        this.fixedFlareRateInput.value = this.experimentalOptions.fixedFlareRate.toString();
        this.fixedFlareRateValue.textContent = `${this.experimentalOptions.fixedFlareRate.toFixed(1)}`;
        this.fixedFlareRateField.style.display = this.experimentalOptions.flareFrequencyMode === 'fixed' ? '' : 'none';
        this.ringQualitySelect.value = this.experimentalOptions.ringQuality;
        
        this.ignoreEvents = false;
    }

    toggle(): void {
        if (this.isOpen) this.close();
        else this.open();
    }

    open(): void {
        this.isOpen = true;
        this.container.classList.add('open');
    }

    close(): void {
        this.isOpen = false;
        this.container.classList.remove('open');
    }

    getOptions(): VisualizationOptions {
        return { ...this.options };
    }

    applyOptions(options: VisualizationOptions): void {
        this.options = { ...options };
        this.syncUIFromOptions();
    }

    setPreset(preset: VisualizationPresetName): void {
        this.ignoreEvents = true;
        this.presetName = preset;
        this.presetSelect.value = preset;
        this.ignoreEvents = false;
    }

    setPresetRenderScale(scale: number): void {
        this.ignoreEvents = true;
        this.presetRenderScale = scale;
        this.presetRenderScaleInput.value = String(scale);
        this.presetRenderScaleValue.textContent = `${scale.toFixed(2)}x`;
        this.ignoreEvents = false;
    }

    // Can add setFreeCamSpeed/Sensitivity external control if needed
    setFreeCamSpeed(speed: number): void {
        this.freeCamSpeed = speed;
        this.freeCamSpeedInput.value = speed.toString();
        this.freeCamSpeedValue.textContent = `${speed.toFixed(3)} AU/s`;
    }

    setFreeCamSensitivity(sensitivity: number): void {
        this.freeCamSensitivity = sensitivity;
        this.freeCamSensitivityInput.value = sensitivity.toString();
        this.freeCamSensitivityValue.textContent = `${sensitivity.toFixed(1)}x`;
    }

    setFreeCamRotationDamping(damping: number): void {
        this.freeCamRotationDamping = damping;
        this.freeCamRotationDampingInput.value = damping.toString();
        this.freeCamRotationDampingValue.textContent = `${Math.round(damping * 100)}%`;
    }

    setSurfaceSpeed(speed: number): void {
        this.surfaceSpeed = speed;
        this.surfaceSpeedInput.value = speed.toString();
        this.surfaceSpeedValue.textContent = `${speed.toFixed(1)} m/s`;
    }

    setSurfaceSensitivity(sensitivity: number): void {
        this.surfaceSensitivity = sensitivity;
        this.surfaceSensitivityInput.value = sensitivity.toString();
        this.surfaceSensitivityValue.textContent = `${sensitivity.toFixed(1)}x`;
    }

    setSurfaceRotationDamping(damping: number): void {
        this.surfaceRotationDamping = damping;
        this.surfaceRotationDampingInput.value = damping.toString();
        this.surfaceRotationDampingValue.textContent = `${Math.round(damping * 100)}%`;
    }

    setSurfaceEyeHeight(height: number): void {
        this.surfaceEyeHeight = height;
        this.surfaceEyeHeightInput.value = height.toString();
        this.surfaceEyeHeightValue.textContent = `${height.toFixed(1)} m`;
    }

    setOrbitalRotationDamping(damping: number): void {
        this.orbitalRotationDamping = damping;
        this.orbitalRotationDampingInput.value = damping.toString();
        this.orbitalRotationDampingValue.textContent = `${Math.round(damping * 100)}%`;
    }

    setOrbitalZoomDamping(damping: number): void {
        this.orbitalZoomDamping = damping;
        this.orbitalZoomDampingInput.value = damping.toString();
        this.orbitalZoomDampingValue.textContent = `${Math.round(damping * 100)}%`;
    }
}
