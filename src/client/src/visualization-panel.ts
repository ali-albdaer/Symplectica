/**
 * Visualization Options Panel
 *
 * Controls display settings for the renderer.
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

export class VisualizationPanel {
    private container: HTMLElement;
    private isOpen = false;
    private options: VisualizationOptions;
    private onChange: (options: VisualizationOptions) => void;
    private onPresetChange?: (preset: VisualizationPresetName) => void;
    private onPresetEdit?: (preset: VisualizationPresetName, patch: { renderScale?: number }) => void;
    private presetName: VisualizationPresetName;
    private presetRenderScale = 1;
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

    constructor(
        onChange: (options: VisualizationOptions) => void,
        onPresetChange?: (preset: VisualizationPresetName) => void,
        onPresetEdit?: (preset: VisualizationPresetName, patch: { renderScale?: number }) => void,
        initialPreset: VisualizationPresetName = 'Low'
    ) {
        this.onChange = onChange;
        this.onPresetChange = onPresetChange;
        this.onPresetEdit = onPresetEdit;
        this.presetName = initialPreset;
        this.options = { ...DEFAULTS };
        this.container = this.createUI();
        this.cacheElements();
        this.bindEvents();
        this.syncUIFromOptions();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();

        this.onChange({ ...this.options });
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'viz-panel';
        container.innerHTML = `
            <div class="viz-header">
                <h2>Visualization</h2>
                <button class="viz-close" title="Close (V)">&times;</button>
            </div>

            <div class="viz-content">
                <section class="viz-section">
                    <h3>Preset</h3>
                    <div class="viz-field">
                        <label>Visual Quality</label>
                        <select id="viz-preset">
                            <option value="Low">Low</option>
                            <option value="High">High</option>
                            <option value="Ultra">Ultra</option>
                        </select>
                    </div>
                </section>

                <section class="viz-section">
                    <h3>Preset Tuning</h3>
                    <div class="viz-field">
                        <label>Render Scale</label>
                        <input type="range" id="viz-render-scale" min="0.1" max="5" step="0.05" value="1">
                        <span id="viz-render-scale-value">1.00x</span>
                    </div>
                </section>

                <section class="viz-section">
                    <h3>Display</h3>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-orbits">
                        <span>Orbit Trails</span>
                    </label>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-labels">
                        <span>Body Labels</span>
                    </label>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-grid-xy">
                        <span>Grid XY</span>
                    </label>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-grid-xz">
                        <span>Grid XZ</span>
                    </label>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-grid-yz">
                        <span>Grid YZ</span>
                    </label>

                    <div class="viz-field">
                        <label>Grid Spacing (AU)</label>
                        <input type="range" id="viz-grid-spacing" min="0.1" max="10" step="0.1" value="1">
                        <span id="viz-grid-spacing-value">1.0 AU</span>
                    </div>

                    <div class="viz-field">
                        <label>Grid Size (AU)</label>
                        <input type="range" id="viz-grid-size" min="1" max="100" step="1" value="40">
                        <span id="viz-grid-size-value">40 AU</span>
                    </div>
                </section>

                <section class="viz-section">
                    <h3>Trail Length</h3>
                    <div class="viz-slider-row">
                        <input type="range" id="viz-trail-length" min="10" max="2000" step="10">
                        <span id="viz-trail-value">100</span>
                    </div>
                </section>

            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #viz-panel {
                position: fixed;
                top: 20px;
                right: 360px;
                width: 240px;
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

            #viz-panel.open { display: flex; }

            .viz-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
                cursor: move;
                user-select: none;
            }

            .viz-header h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                color: #4fc3f7;
            }

            .viz-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }

            .viz-close:hover { color: #fff; }

            .viz-content { padding: 12px 15px; }

            .viz-section {
                margin-bottom: 14px;
            }

            .viz-section:last-child { margin-bottom: 0; }

            .viz-section h3 {
                font-size: 10px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 8px 0;
            }

            .viz-toggle {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 0;
                cursor: pointer;
            }

            .viz-toggle input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: #4fc3f7;
                margin: 0;
            }

            .viz-toggle span {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.9);
            }

            .viz-field {
                margin: 8px 0 6px 0;
            }

            .viz-field label {
                display: block;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 6px;
            }

            .viz-field select {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                padding: 6px 8px;
                font-size: 12px;
            }

            .viz-field input[type="range"] {
                width: 100%;
                accent-color: #4fc3f7;
                height: 4px;
            }

            .viz-field span {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
            }

            .viz-slider-row {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 6px;
            }

            .viz-slider-row input[type="range"] {
                flex: 1;
                accent-color: #4fc3f7;
                height: 4px;
            }

            .viz-slider-row span {
                min-width: 50px;
                text-align: right;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                font-variant-numeric: tabular-nums;
            }

            .viz-slider-row.disabled {
                opacity: 0.4;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
        return container;
    }

    private cacheElements(): void {
        this.orbitsCheckbox = this.container.querySelector('#viz-orbits')!;
        this.labelsCheckbox = this.container.querySelector('#viz-labels')!;
        this.gridXYCheckbox = this.container.querySelector('#viz-grid-xy')!;
        this.gridXZCheckbox = this.container.querySelector('#viz-grid-xz')!;
        this.gridYZCheckbox = this.container.querySelector('#viz-grid-yz')!;
        this.gridSpacingInput = this.container.querySelector('#viz-grid-spacing')!;
        this.gridSpacingValue = this.container.querySelector('#viz-grid-spacing-value')!;
        this.gridSizeInput = this.container.querySelector('#viz-grid-size')!;
        this.gridSizeValue = this.container.querySelector('#viz-grid-size-value')!;
        this.trailSlider = this.container.querySelector('#viz-trail-length')!;
        this.trailValue = this.container.querySelector('#viz-trail-value')!;
        this.presetSelect = this.container.querySelector('#viz-preset')!;
        this.presetRenderScaleInput = this.container.querySelector('#viz-render-scale')!;
        this.presetRenderScaleValue = this.container.querySelector('#viz-render-scale-value')!;
    }

    private bindEvents(): void {
        this.container.querySelector('.viz-close')?.addEventListener('click', () => this.close());

        this.setupDrag();

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

    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'v' || e.key === 'V') this.toggle();
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    }

    private setupDrag(): void {
        const header = this.container.querySelector('.viz-header') as HTMLElement | null;
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
}
