/**
 * Visualization Options Panel
 * 
 * Toggle various visualization features:
 * - Orbit trails
 * - Body labels
 * - Body scale
 */

export interface VisualizationOptions {
    showOrbitTrails: boolean;
    showLabels: boolean;
    orbitTrailLength: number;
    realScale: boolean;
    bodyScale: number; // multiplier for body sizes (1 = real scale)
}

export class VisualizationPanel {
    private container: HTMLElement;
    private isOpen = false;
    private readonly BODY_SCALE_MIN = 1;
    private readonly BODY_SCALE_MAX = 5000;
    private readonly RECOMMENDED_SCALE = 25;
    private options: VisualizationOptions = {
        showOrbitTrails: true,
        showLabels: false,
        orbitTrailLength: 50,
        realScale: false,
        bodyScale: 1000, // default 1000x for visibility
    };
    private onChange: (options: VisualizationOptions) => void;
    private suppressNotify = false;

    constructor(onChange: (options: VisualizationOptions) => void) {
        this.onChange = onChange;
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();

        // Notify initial state
        this.onChange(this.options);
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'viz-panel';
        container.innerHTML = `
            <div class="viz-header">
                <h2>👁 Visualization</h2>
                <button class="viz-close" title="Close (V)">&times;</button>
            </div>
            
            <div class="viz-content">
                <section class="viz-section">
                    <h3>Display Options</h3>
                    
                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-orbits" checked>
                        <span class="viz-toggle-label">Orbit Trails</span>
                    </label>
                    
                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-labels">
                        <span class="viz-toggle-label">Body Labels</span>
                    </label>
                </section>
                
                <section class="viz-section">
                    <h3>Trail Settings</h3>
                    
                    <div class="viz-field">
                        <label>Trail Length</label>
                        <input type="range" id="viz-trail-length" min="10" max="2000" value="50">
                        <span id="viz-trail-length-value">50 points</span>
                    </div>
                </section>
                
                <section class="viz-section">
                    <h3>Body Scale</h3>
                    
                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-real-scale">
                        <span class="viz-toggle-label">Real Scale (1:1)</span>
                    </label>

                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-recommended-scale">
                        <span class="viz-toggle-label">Recommended Scale (25×)</span>
                    </label>
                    
                    <div class="viz-field" id="viz-body-scale-field">
                        <label>Size Multiplier</label>
                        <input type="range" id="viz-body-scale" min="0" max="1" step="0.001" value="0.8">
                        <span id="viz-body-scale-value">1000×</span>
                    </div>
                    
                </section>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #viz-panel {
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
            
            #viz-panel.open {
                display: flex;
            }
            
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
            
            .viz-close:hover {
                color: #fff;
            }
            
            .viz-content {
                padding: 15px;
            }
            
            .viz-section {
                margin-bottom: 15px;
            }
            
            .viz-section h3 {
                font-size: 11px;
                font-weight: 600;
                color: #4fc3f7;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
            }
            
            .viz-toggle {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 0;
                cursor: pointer;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .viz-toggle:last-child {
                border-bottom: none;
            }
            
            .viz-toggle input[type="checkbox"] {
                width: 18px;
                height: 18px;
                accent-color: #4fc3f7;
            }
            
            .viz-toggle-label {
                flex: 1;
                font-size: 13px;
            }
            
            .viz-field {
                margin-bottom: 12px;
            }
            
            .viz-field label {
                display: block;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 6px;
            }
            
            .viz-field input[type="range"] {
                width: 100%;
                margin-bottom: 4px;
                accent-color: #4fc3f7;
            }
            
            .viz-field span {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.5);
            }
            
        `;
        document.head.appendChild(style);

        // Setup event listeners
        this.setupEventListeners(container);

        return container;
    }

    private setupEventListeners(container: HTMLElement): void {
        // Close button
        container.querySelector('.viz-close')?.addEventListener('click', () => {
            this.close();
        });

        // Checkboxes
        const orbits = container.querySelector('#viz-orbits') as HTMLInputElement;
        const labels = container.querySelector('#viz-labels') as HTMLInputElement;

        orbits?.addEventListener('change', () => {
            this.options.showOrbitTrails = orbits.checked;
            this.notifyChange();
        });

        labels?.addEventListener('change', () => {
            this.options.showLabels = labels.checked;
            this.notifyChange();
        });

        // Sliders
        const trailLength = container.querySelector('#viz-trail-length') as HTMLInputElement;
        const trailLengthValue = container.querySelector('#viz-trail-length-value') as HTMLElement;

        trailLength?.addEventListener('input', () => {
            this.options.orbitTrailLength = parseInt(trailLength.value);
            trailLengthValue.textContent = `${trailLength.value} points`;
            this.notifyChange();
        });

        // Body Scale controls
        const realScale = container.querySelector('#viz-real-scale') as HTMLInputElement;
        const recommendedScale = container.querySelector('#viz-recommended-scale') as HTMLInputElement;
        const bodyScaleField = container.querySelector('#viz-body-scale-field') as HTMLElement;
        const bodyScale = container.querySelector('#viz-body-scale') as HTMLInputElement;
        const bodyScaleValue = container.querySelector('#viz-body-scale-value') as HTMLElement;

        this.updateBodyScaleUI(bodyScale, bodyScaleValue, this.options.bodyScale);
        this.updateRecommendedUI(recommendedScale, this.options);

        realScale?.addEventListener('change', () => {
            this.options.realScale = realScale.checked;
            // Hide/show body scale slider when real scale is toggled
            if (bodyScaleField) {
                bodyScaleField.style.opacity = realScale.checked ? '0.3' : '1';
                bodyScale.disabled = realScale.checked;
            }
            if (recommendedScale) {
                recommendedScale.checked = false;
                recommendedScale.disabled = realScale.checked;
            }
            this.notifyChange();
        });

        recommendedScale?.addEventListener('change', () => {
            if (recommendedScale.checked) {
                this.options.realScale = false;
                this.options.bodyScale = this.RECOMMENDED_SCALE;
                if (realScale) realScale.checked = false;
                if (bodyScaleField) bodyScaleField.style.opacity = '1';
                bodyScale.disabled = false;
                this.updateBodyScaleUI(bodyScale, bodyScaleValue, this.options.bodyScale);
            }
            this.notifyChange();
        });

        bodyScale?.addEventListener('input', () => {
            const sliderValue = parseFloat(bodyScale.value);
            this.options.bodyScale = this.scaleFromSlider(sliderValue);
            bodyScaleValue.textContent = `${Math.round(this.options.bodyScale)}×`;
            if (recommendedScale) {
                recommendedScale.checked = this.isRecommendedScale(this.options.bodyScale) && !this.options.realScale;
            }
            this.notifyChange();
        });
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'v' || e.key === 'V') {
                this.toggle();
            }
        });
    }

    private notifyChange(): void {
        if (this.suppressNotify) return;
        this.onChange({ ...this.options });
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

    getOptions(): VisualizationOptions {
        return { ...this.options };
    }

    applyOptions(options: VisualizationOptions): void {
        this.suppressNotify = true;
        this.options = { ...options };

        const orbits = this.container.querySelector('#viz-orbits') as HTMLInputElement | null;
        const labels = this.container.querySelector('#viz-labels') as HTMLInputElement | null;
        const trailLength = this.container.querySelector('#viz-trail-length') as HTMLInputElement | null;
        const trailLengthValue = this.container.querySelector('#viz-trail-length-value') as HTMLElement | null;
        const realScale = this.container.querySelector('#viz-real-scale') as HTMLInputElement | null;
        const recommendedScale = this.container.querySelector('#viz-recommended-scale') as HTMLInputElement | null;
        const bodyScaleField = this.container.querySelector('#viz-body-scale-field') as HTMLElement | null;
        const bodyScale = this.container.querySelector('#viz-body-scale') as HTMLInputElement | null;
        const bodyScaleValue = this.container.querySelector('#viz-body-scale-value') as HTMLElement | null;

        if (orbits) orbits.checked = options.showOrbitTrails;
        if (labels) labels.checked = options.showLabels;
        if (trailLength) trailLength.value = options.orbitTrailLength.toString();
        if (trailLengthValue) trailLengthValue.textContent = `${options.orbitTrailLength} points`;
        if (realScale) realScale.checked = options.realScale;
        if (recommendedScale) {
            recommendedScale.checked = this.isRecommendedScale(options.bodyScale) && !options.realScale;
            recommendedScale.disabled = options.realScale;
        }

        if (bodyScaleField && bodyScale && bodyScaleValue) {
            bodyScaleField.style.opacity = options.realScale ? '0.3' : '1';
            bodyScale.disabled = options.realScale;
            this.updateBodyScaleUI(bodyScale, bodyScaleValue, options.bodyScale);
        }

        this.suppressNotify = false;
    }

    private scaleFromSlider(value: number): number {
        const min = Math.log(this.BODY_SCALE_MIN);
        const max = Math.log(this.BODY_SCALE_MAX);
        const t = Math.min(Math.max(value, 0), 1);
        return Math.exp(min + (max - min) * t);
    }

    private sliderFromScale(scale: number): number {
        const min = Math.log(this.BODY_SCALE_MIN);
        const max = Math.log(this.BODY_SCALE_MAX);
        const safe = Math.min(Math.max(scale, this.BODY_SCALE_MIN), this.BODY_SCALE_MAX);
        return (Math.log(safe) - min) / (max - min);
    }

    private updateBodyScaleUI(
        slider: HTMLInputElement,
        label: HTMLElement,
        scale: number
    ): void {
        slider.value = this.sliderFromScale(scale).toFixed(3);
        label.textContent = `${Math.round(scale)}×`;
    }

    private updateRecommendedUI(
        checkbox: HTMLInputElement | null,
        options: VisualizationOptions
    ): void {
        if (!checkbox) return;
        checkbox.checked = this.isRecommendedScale(options.bodyScale) && !options.realScale;
        checkbox.disabled = options.realScale;
    }

    private isRecommendedScale(scale: number): boolean {
        return Math.abs(scale - this.RECOMMENDED_SCALE) < 0.5;
    }
}
