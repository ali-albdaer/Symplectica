/**
 * Options Panel
 *
 * Consolidated settings for Visualization and Camera.
 */

export interface VisualizationOptions {
    showOrbitTrails: boolean;
    showLabels: boolean;
    showGridXY: boolean;
    showGridXZ: boolean;
    showGridYZ: boolean;
    gridSpacing: number;
    gridSize: number;
    orbitTrailLength: number;
}

export type VisualizationPresetName = 'Low' | 'High' | 'Ultra';

const AU = 1.495978707e11;
const DEFAULTS: VisualizationOptions = {
    showOrbitTrails: true,
    showLabels: false,
    showGridXY: false,
    showGridXZ: false,
    showGridYZ: false,
    gridSpacing: AU,
    gridSize: 40,
    orbitTrailLength: 100,
};

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

    // State
    private presetName: VisualizationPresetName;
    private presetRenderScale = 1;
    private freeCamSpeed = 0.1; // AU/s
    private freeCamSensitivity = 0.3;
    private ignoreEvents = false;

    // UI Elements
    private orbitsCheckbox!: HTMLInputElement;
    private labelsCheckbox!: HTMLInputElement;
    private gridXYCheckbox!: HTMLInputElement;
    private gridXZCheckbox!: HTMLInputElement;
    private gridYZCheckbox!: HTMLInputElement;
    private gridSpacingInput!: HTMLInputElement;
    private gridSpacingValue!: HTMLElement;
    private gridSizeInput!: HTMLInputElement;
    private gridSizeValue!: HTMLElement;
    private trailSlider!: HTMLInputElement;
    private trailValue!: HTMLElement;
    private presetSelect!: HTMLSelectElement;
    private presetRenderScaleInput!: HTMLInputElement;
    private presetRenderScaleValue!: HTMLElement;

    // Camera Elements
    private freeCamSpeedInput!: HTMLInputElement;
    private freeCamSpeedValue!: HTMLElement;
    private freeCamSensitivityInput!: HTMLInputElement;
    private freeCamSensitivityValue!: HTMLElement;

    constructor(
        onChange: (options: VisualizationOptions) => void,
        onPresetChange?: (preset: VisualizationPresetName) => void,
        onPresetEdit?: (preset: VisualizationPresetName, patch: { renderScale?: number }) => void,
        onFreeCamSpeedChange?: (speed: number) => void,
        onFreeCamSensitivityChange?: (sensitivity: number) => void,
        initialPreset: VisualizationPresetName = 'Low'
    ) {
        this.onChange = onChange;
        this.onPresetChange = onPresetChange;
        this.onPresetEdit = onPresetEdit;
        this.onFreeCamSpeedChange = onFreeCamSpeedChange;
        this.onFreeCamSensitivityChange = onFreeCamSensitivityChange;
        this.presetName = initialPreset;
        this.options = { ...DEFAULTS };
        this.container = this.createUI();
        this.cacheElements();
        this.bindEvents();
        this.syncUIFromOptions();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();

        // Don't auto-emit change on init to avoid double-firing, unless needed.
        // this.onChange({ ...this.options }); // Removed to avoid overriding persisted settings if any
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'opt-panel';
        container.innerHTML = `
            <div class="opt-header">
                <h2>Options</h2>
                <button class="opt-close" title="Close (V)">&times;</button>
            </div>

            <div class="opt-tabs">
                <button class="opt-tab active" data-tab="graphics">Graphics</button>
                <button class="opt-tab" data-tab="camera">Camera</button>
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
                        <input type="range" id="opt-render-scale" min="0.1" max="5" step="0.05" value="1">
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
                        <label class="opt-toggle">
                            <input type="checkbox" id="opt-labels">
                            <span>Labels</span>
                        </label>
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
                        <input type="range" id="opt-grid-spacing" min="0.1" max="10" step="0.1" value="1">
                        <span id="opt-grid-spacing-value">1.0 AU</span>
                    </div>

                    <div class="opt-field">
                        <label>Grid Size (AU)</label>
                        <input type="range" id="opt-grid-size" min="1" max="5000" step="1" value="40">
                        <span id="opt-grid-size-value">40 AU</span>
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
                    <h3>Free Camera Settings</h3>
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
        `;
        document.head.appendChild(style);
        return container;
    }

    private cacheElements(): void {
        this.orbitsCheckbox = this.container.querySelector('#opt-orbits')!;
        this.labelsCheckbox = this.container.querySelector('#opt-labels')!;
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

        this.freeCamSpeedInput = this.container.querySelector('#opt-freecam-speed')!;
        this.freeCamSpeedValue = this.container.querySelector('#opt-freecam-speed-value')!;
        this.freeCamSensitivityInput = this.container.querySelector('#opt-freecam-sensitivity')!;
        this.freeCamSensitivityValue = this.container.querySelector('#opt-freecam-sensitivity-value')!;
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

        this.labelsCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.showLabels = this.labelsCheckbox.checked;
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
            const spacingAu = parseFloat(this.gridSpacingInput.value);
            this.options.gridSpacing = spacingAu * AU;
            this.gridSpacingValue.textContent = `${spacingAu.toFixed(1)} AU`;
            this.updateGridSizeValue();
            this.emitChange();
        });

        this.gridSizeInput.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const sizeAu = parseFloat(this.gridSizeInput.value);
            this.options.gridSize = sizeAu;
            this.updateGridSizeValue();
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
            if (e.key === 'v' || e.key === 'V') this.toggle();
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

    private syncUIFromOptions(): void {
        this.ignoreEvents = true;

        this.orbitsCheckbox.checked = this.options.showOrbitTrails;
        this.labelsCheckbox.checked = this.options.showLabels;
        this.gridXYCheckbox.checked = this.options.showGridXY;
        this.gridXZCheckbox.checked = this.options.showGridXZ;
        this.gridYZCheckbox.checked = this.options.showGridYZ;
        this.gridSpacingInput.value = String(this.options.gridSpacing / AU);
        this.gridSpacingValue.textContent = `${(this.options.gridSpacing / AU).toFixed(1)} AU`;
        this.gridSizeInput.value = String(this.options.gridSize);
        this.updateGridSizeValue();
        this.trailSlider.value = String(this.options.orbitTrailLength);
        this.trailValue.textContent = String(this.options.orbitTrailLength);
        this.presetSelect.value = this.presetName;
        this.presetRenderScaleInput.value = String(this.presetRenderScale);
        this.presetRenderScaleValue.textContent = `${this.presetRenderScale.toFixed(2)}x`;

        // Syn camera sliders too if needed?
        // Default to set values..

        this.ignoreEvents = false;
    }

    private updateGridSizeValue(): void {
        const spacingAu = this.options.gridSpacing / AU;
        const distanceAu = this.options.gridSize * spacingAu;
        this.gridSizeValue.textContent = `${distanceAu.toFixed(0)} AU`;
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
}
