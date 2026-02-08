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
    realScale: boolean;
    bodyScale: number;
}

const AU = 1.495978707e11;
const SCALE_MIN = 1;
const SCALE_MAX = 5000;
const RECOMMENDED_SCALE = 25;

const DEFAULTS: VisualizationOptions = {
    showOrbitTrails: true,
    showLabels: false,
    showGridXY: false,
    showGridXZ: false,
    showGridYZ: false,
    gridSpacing: AU,
    gridSize: 40 * AU,
    orbitTrailLength: 100,
    realScale: false,
    bodyScale: RECOMMENDED_SCALE,
};

export class VisualizationPanel {
    private container: HTMLElement;
    private isOpen = false;
    private options: VisualizationOptions;
    private onChange: (options: VisualizationOptions) => void;
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
    private realScaleCheckbox!: HTMLInputElement;
    private recommendedCheckbox!: HTMLInputElement;
    private scaleSlider!: HTMLInputElement;
    private scaleValue!: HTMLElement;
    private scaleField!: HTMLElement;

    constructor(onChange: (options: VisualizationOptions) => void) {
        this.onChange = onChange;
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

                <section class="viz-section">
                    <h3>Body Scale</h3>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-real-scale">
                        <span>Real Scale (1:1)</span>
                    </label>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-recommended">
                        <span>Recommended (25x)</span>
                    </label>

                    <div class="viz-slider-row" id="viz-scale-field">
                        <input type="range" id="viz-scale" min="0" max="1" step="0.001">
                        <span id="viz-scale-value">25x</span>
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
        this.realScaleCheckbox = this.container.querySelector('#viz-real-scale')!;
        this.recommendedCheckbox = this.container.querySelector('#viz-recommended')!;
        this.scaleSlider = this.container.querySelector('#viz-scale')!;
        this.scaleValue = this.container.querySelector('#viz-scale-value')!;
        this.scaleField = this.container.querySelector('#viz-scale-field')!;
    }

    private bindEvents(): void {
        this.container.querySelector('.viz-close')?.addEventListener('click', () => this.close());

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
            this.emitChange();
        });

        this.gridSizeInput.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const sizeAu = parseFloat(this.gridSizeInput.value);
            this.options.gridSize = sizeAu * AU;
            this.gridSizeValue.textContent = `${sizeAu.toFixed(0)} AU`;
            this.emitChange();
        });

        this.trailSlider.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            this.options.orbitTrailLength = parseInt(this.trailSlider.value);
            this.trailValue.textContent = this.trailSlider.value;
            this.emitChange();
        });

        this.realScaleCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            this.options.realScale = this.realScaleCheckbox.checked;
            if (this.options.realScale) {
                this.recommendedCheckbox.checked = false;
            }
            this.updateScaleFieldState();
            this.emitChange();
        });

        this.recommendedCheckbox.addEventListener('change', () => {
            if (this.ignoreEvents) return;
            if (this.recommendedCheckbox.checked) {
                this.options.realScale = false;
                this.options.bodyScale = RECOMMENDED_SCALE;
                this.realScaleCheckbox.checked = false;
                this.updateScaleUI();
            }
            this.updateScaleFieldState();
            this.emitChange();
        });

        this.scaleSlider.addEventListener('input', () => {
            if (this.ignoreEvents) return;
            const t = parseFloat(this.scaleSlider.value);
            this.options.bodyScale = this.sliderToScale(t);
            this.scaleValue.textContent = `${Math.round(this.options.bodyScale)}x`;
            this.recommendedCheckbox.checked = this.isRecommended(this.options.bodyScale);
            this.emitChange();
        });
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'v' || e.key === 'V') this.toggle();
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
        this.gridSizeInput.value = String(this.options.gridSize / AU);
        this.gridSizeValue.textContent = `${(this.options.gridSize / AU).toFixed(0)} AU`;
        this.trailSlider.value = String(this.options.orbitTrailLength);
        this.trailValue.textContent = String(this.options.orbitTrailLength);
        this.realScaleCheckbox.checked = this.options.realScale;
        this.recommendedCheckbox.checked = this.isRecommended(this.options.bodyScale) && !this.options.realScale;
        this.updateScaleUI();
        this.updateScaleFieldState();

        this.ignoreEvents = false;
    }

    private updateScaleUI(): void {
        this.scaleSlider.value = String(this.scaleToSlider(this.options.bodyScale));
        this.scaleValue.textContent = `${Math.round(this.options.bodyScale)}x`;
    }

    private updateScaleFieldState(): void {
        if (this.options.realScale) {
            this.scaleField.classList.add('disabled');
            this.scaleSlider.disabled = true;
            this.recommendedCheckbox.disabled = true;
        } else {
            this.scaleField.classList.remove('disabled');
            this.scaleSlider.disabled = false;
            this.recommendedCheckbox.disabled = false;
        }
    }

    private sliderToScale(t: number): number {
        const minLog = Math.log(SCALE_MIN);
        const maxLog = Math.log(SCALE_MAX);
        return Math.exp(minLog + (maxLog - minLog) * Math.max(0, Math.min(1, t)));
    }

    private scaleToSlider(scale: number): number {
        const minLog = Math.log(SCALE_MIN);
        const maxLog = Math.log(SCALE_MAX);
        const clamped = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale));
        return (Math.log(clamped) - minLog) / (maxLog - minLog);
    }

    private isRecommended(scale: number): boolean {
        return Math.abs(scale - RECOMMENDED_SCALE) < 1;
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
}
