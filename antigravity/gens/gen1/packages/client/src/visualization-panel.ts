/**
 * Visualization Options Panel
 * 
 * Toggle various visualization features:
 * - Orbit trails
 * - Velocity vectors
 * - Acceleration vectors
 * - Body labels
 * - Grid
 */

export interface VisualizationOptions {
    showOrbitTrails: boolean;
    showVelocityVectors: boolean;
    showAccelerationVectors: boolean;
    showLabels: boolean;
    showGrid: boolean;
    orbitTrailLength: number;
    vectorScale: number;
}

export class VisualizationPanel {
    private container: HTMLElement;
    private isOpen = false;
    private options: VisualizationOptions = {
        showOrbitTrails: true,
        showVelocityVectors: false,
        showAccelerationVectors: false,
        showLabels: false,
        showGrid: false,
        orbitTrailLength: 50,
        vectorScale: 1e-4,
    };
    private onChange: (options: VisualizationOptions) => void;

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
                        <input type="checkbox" id="viz-velocity">
                        <span class="viz-toggle-label">Velocity Vectors</span>
                    </label>
                    
                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-accel">
                        <span class="viz-toggle-label">Acceleration Vectors</span>
                    </label>
                    
                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-labels">
                        <span class="viz-toggle-label">Body Labels</span>
                    </label>
                    
                    <label class="viz-toggle">
                        <input type="checkbox" id="viz-grid">
                        <span class="viz-toggle-label">Reference Grid</span>
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
                    <h3>Vector Settings</h3>
                    
                    <div class="viz-field">
                        <label>Vector Scale</label>
                        <input type="range" id="viz-vector-scale" min="-8" max="-2" step="0.5" value="-4">
                        <span id="viz-vector-scale-value">10⁻⁴</span>
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
        const velocity = container.querySelector('#viz-velocity') as HTMLInputElement;
        const accel = container.querySelector('#viz-accel') as HTMLInputElement;
        const labels = container.querySelector('#viz-labels') as HTMLInputElement;
        const grid = container.querySelector('#viz-grid') as HTMLInputElement;

        orbits?.addEventListener('change', () => {
            this.options.showOrbitTrails = orbits.checked;
            this.notifyChange();
        });

        velocity?.addEventListener('change', () => {
            this.options.showVelocityVectors = velocity.checked;
            this.notifyChange();
        });

        accel?.addEventListener('change', () => {
            this.options.showAccelerationVectors = accel.checked;
            this.notifyChange();
        });

        labels?.addEventListener('change', () => {
            this.options.showLabels = labels.checked;
            this.notifyChange();
        });

        grid?.addEventListener('change', () => {
            this.options.showGrid = grid.checked;
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

        const vectorScale = container.querySelector('#viz-vector-scale') as HTMLInputElement;
        const vectorScaleValue = container.querySelector('#viz-vector-scale-value') as HTMLElement;

        vectorScale?.addEventListener('input', () => {
            const exp = parseFloat(vectorScale.value);
            this.options.vectorScale = Math.pow(10, exp);
            vectorScaleValue.textContent = `10^${exp}`;
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
}
