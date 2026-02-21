/**
 * Build Panel - World Builder Mode
 * 
 * Side panel for dynamically creating celestial bodies.
 * Features:
 * - Body type selection (star, planet, moon, etc.)
 * - Parameter adjustment with reasonable defaults
 * - Ghost preview of body before spawning
 * - Physics contribution toggle
 */

import { BodyInfo } from './physics';

// Physical constants
const AU = 1.495978707e11;
const M_SUN = 1.98892e30;
const M_EARTH = 5.9722e24;
const M_MOON = 7.342e22;
const R_SUN = 6.9634e8;
const R_EARTH = 6.371e6;
const R_MOON = 1.7374e6;

export type BuildableBodyType = 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'spacecraft';

export interface BuildBodyParams {
    type: BuildableBodyType;
    name: string;
    mass: number;
    radius: number;
    color: number;
    // Position (world coordinates)
    x: number;
    y: number;
    z: number;
    // Velocity
    vx: number;
    vy: number;
    vz: number;
    // Physics options
    contributesToPhysics: boolean;
    isMassive: boolean;
    // Star-specific
    luminosity?: number;
    effectiveTemperature?: number;
    // Planet-specific
    axialTilt?: number;
    rotationRate?: number;
}

interface BodyTypeDefaults {
    mass: number;
    radius: number;
    color: number;
    luminosity?: number;
    effectiveTemperature?: number;
}

const BODY_TYPE_DEFAULTS: Record<BuildableBodyType, BodyTypeDefaults> = {
    star: {
        mass: M_SUN,
        radius: R_SUN,
        color: 0xffdd44,
        luminosity: 1.0,
        effectiveTemperature: 5778,
    },
    planet: {
        mass: M_EARTH,
        radius: R_EARTH,
        color: 0x4488ff,
    },
    moon: {
        mass: M_MOON,
        radius: R_MOON,
        color: 0x888888,
    },
    asteroid: {
        mass: 1e15,
        radius: 1e4,
        color: 0x8c7853,
    },
    comet: {
        mass: 1e13,
        radius: 5e3,
        color: 0xccddff,
    },
    spacecraft: {
        mass: 1e4,
        radius: 10,
        color: 0xffffff,
    },
};

export class BuildPanel {
    private container: HTMLElement;
    private isOpen = false;
    private selectedType: BuildableBodyType = 'planet';
    private params: BuildBodyParams;
    private bodyCounter = 0;

    private onParamsChange?: (params: BuildBodyParams) => void;
    private onSpawn?: (params: BuildBodyParams) => void;

    constructor(
        onParamsChange?: (params: BuildBodyParams) => void,
        onSpawn?: (params: BuildBodyParams) => void
    ) {
        this.onParamsChange = onParamsChange;
        this.onSpawn = onSpawn;
        this.params = this.createDefaultParams('planet');
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();
    }

    private createDefaultParams(type: BuildableBodyType): BuildBodyParams {
        const defaults = BODY_TYPE_DEFAULTS[type];
        return {
            type,
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${++this.bodyCounter}`,
            mass: defaults.mass,
            radius: defaults.radius,
            color: defaults.color,
            x: 0,
            y: 0,
            z: 0,
            vx: 0,
            vy: 0,
            vz: 0,
            contributesToPhysics: true,
            isMassive: type !== 'spacecraft',
            luminosity: defaults.luminosity,
            effectiveTemperature: defaults.effectiveTemperature,
            axialTilt: 0,
            rotationRate: 0,
        };
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'build-panel';
        container.innerHTML = `
            <div class="build-header">
                <h2>🔧 Build</h2>
                <button class="build-close" title="Close (B)">&times;</button>
            </div>
            
            <div class="build-content">
                <section class="build-section">
                    <h3>Object Type</h3>
                    <div class="build-type-grid">
                        <button class="build-type-btn" data-type="star">⭐ Star</button>
                        <button class="build-type-btn active" data-type="planet">🌍 Planet</button>
                        <button class="build-type-btn" data-type="moon">🌙 Moon</button>
                        <button class="build-type-btn" data-type="asteroid">🪨 Asteroid</button>
                        <button class="build-type-btn" data-type="comet">☄️ Comet</button>
                        <button class="build-type-btn" data-type="spacecraft">🚀 Spacecraft</button>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Properties</h3>
                    <div class="build-field">
                        <label>Name</label>
                        <input type="text" id="build-name" value="Planet 1">
                    </div>
                    <div class="build-field">
                        <label>Mass (kg)</label>
                        <input type="number" id="build-mass" value="${M_EARTH.toExponential(3)}" step="any">
                    </div>
                    <div class="build-field">
                        <label>Radius (m)</label>
                        <input type="number" id="build-radius" value="${R_EARTH.toExponential(3)}" step="any">
                    </div>
                    <div class="build-field">
                        <label>Color</label>
                        <input type="color" id="build-color" value="#4488ff">
                    </div>
                </section>

                <section class="build-section" id="build-star-section" style="display: none;">
                    <h3>Star Properties</h3>
                    <div class="build-field">
                        <label>Luminosity (L☉)</label>
                        <input type="number" id="build-luminosity" value="1.0" step="0.01" min="0">
                    </div>
                    <div class="build-field">
                        <label>Temperature (K)</label>
                        <input type="number" id="build-temperature" value="5778" step="100" min="1000">
                    </div>
                </section>

                <section class="build-section">
                    <h3>Position (AU)</h3>
                    <div class="build-field-row">
                        <div class="build-field-col">
                            <label>X</label>
                            <input type="number" id="build-x" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Y</label>
                            <input type="number" id="build-y" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Z</label>
                            <input type="number" id="build-z" value="0" step="0.1">
                        </div>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Velocity (km/s)</h3>
                    <div class="build-field-row">
                        <div class="build-field-col">
                            <label>Vx</label>
                            <input type="number" id="build-vx" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Vy</label>
                            <input type="number" id="build-vy" value="0" step="0.1">
                        </div>
                        <div class="build-field-col">
                            <label>Vz</label>
                            <input type="number" id="build-vz" value="0" step="0.1">
                        </div>
                    </div>
                    <div class="build-field">
                        <button class="build-btn-secondary" id="build-calc-orbital">Calculate Circular Orbit</button>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Physics</h3>
                    <div class="build-field">
                        <label>
                            <input type="checkbox" id="build-physics" checked>
                            Contributes to Physics
                        </label>
                        <div class="build-hint">Body participates in gravitational simulation</div>
                    </div>
                    <div class="build-field">
                        <label>
                            <input type="checkbox" id="build-massive" checked>
                            Massive Body
                        </label>
                        <div class="build-hint">Body exerts gravitational force on others</div>
                    </div>
                </section>

                <section class="build-section">
                    <button class="build-btn-spawn" id="build-spawn">✨ Spawn Body</button>
                </section>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #build-panel {
                position: fixed;
                top: 80px;
                left: 20px;
                width: 280px;
                max-height: calc(100vh - 120px);
                background: rgba(10, 15, 30, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fff;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 250;
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            #build-panel.open {
                display: flex;
            }
            
            .build-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
            }
            
            .build-header h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                color: #4caf50;
            }
            
            .build-close {
                background: none;
                border: none;
                color: #888;
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
            }
            
            .build-close:hover {
                color: #fff;
            }
            
            .build-content {
                padding: 10px 15px;
                overflow-y: auto;
                flex: 1;
            }
            
            .build-section {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .build-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .build-section h3 {
                font-size: 11px;
                font-weight: 600;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 10px 0;
            }
            
            .build-type-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 6px;
            }
            
            .build-type-btn {
                padding: 8px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #ccc;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .build-type-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
            }
            
            .build-type-btn.active {
                background: rgba(76, 175, 80, 0.2);
                border-color: rgba(76, 175, 80, 0.6);
                color: #4caf50;
            }
            
            .build-field {
                margin-bottom: 10px;
            }
            
            .build-field label {
                display: block;
                font-size: 12px;
                color: #aaa;
                margin-bottom: 4px;
            }
            
            .build-field input[type="text"],
            .build-field input[type="number"] {
                width: 100%;
                padding: 6px 10px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                font-size: 12px;
                box-sizing: border-box;
            }
            
            .build-field input[type="color"] {
                width: 100%;
                height: 32px;
                padding: 2px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                cursor: pointer;
            }
            
            .build-field input:focus {
                outline: none;
                border-color: rgba(76, 175, 80, 0.5);
            }
            
            .build-field-row {
                display: flex;
                gap: 8px;
            }
            
            .build-field-col {
                flex: 1;
            }
            
            .build-field-col label {
                font-size: 11px;
            }
            
            .build-field-col input {
                width: 100%;
                padding: 6px 8px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                font-size: 12px;
                box-sizing: border-box;
            }
            
            .build-hint {
                font-size: 10px;
                color: #666;
                margin-top: 2px;
            }
            
            .build-btn-secondary {
                width: 100%;
                padding: 8px;
                background: rgba(79, 195, 247, 0.1);
                border: 1px solid rgba(79, 195, 247, 0.3);
                border-radius: 6px;
                color: #4fc3f7;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .build-btn-secondary:hover {
                background: rgba(79, 195, 247, 0.2);
            }
            
            .build-btn-spawn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1));
                border: 1px solid rgba(76, 175, 80, 0.5);
                border-radius: 8px;
                color: #4caf50;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .build-btn-spawn:hover {
                background: linear-gradient(135deg, rgba(76, 175, 80, 0.4), rgba(76, 175, 80, 0.2));
                border-color: rgba(76, 175, 80, 0.8);
            }
        `;
        document.head.appendChild(style);

        this.setupEventListeners(container);

        return container;
    }

    private setupEventListeners(container: HTMLElement): void {
        // Close button
        container.querySelector('.build-close')?.addEventListener('click', () => {
            this.close();
        });

        // Type selection
        container.querySelectorAll('.build-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = (e.target as HTMLElement).dataset.type as BuildableBodyType;
                if (type) {
                    this.selectType(type);
                }
            });
        });

        // Parameter inputs - update on change
        const inputs = ['build-name', 'build-mass', 'build-radius', 'build-color',
                        'build-x', 'build-y', 'build-z', 'build-vx', 'build-vy', 'build-vz',
                        'build-luminosity', 'build-temperature', 'build-physics', 'build-massive'];
        
        inputs.forEach(id => {
            const el = container.querySelector(`#${id}`);
            el?.addEventListener('input', () => this.updateParamsFromUI());
            el?.addEventListener('change', () => this.updateParamsFromUI());
        });

        // Spawn button
        container.querySelector('#build-spawn')?.addEventListener('click', () => {
            this.spawn();
        });

        // Calculate orbital velocity button
        container.querySelector('#build-calc-orbital')?.addEventListener('click', () => {
            this.calculateOrbitalVelocity();
        });
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'b' || e.key === 'B') {
                this.toggle();
            }

            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    private selectType(type: BuildableBodyType): void {
        this.selectedType = type;
        
        // Update button states
        this.container.querySelectorAll('.build-type-btn').forEach(btn => {
            btn.classList.toggle('active', (btn as HTMLElement).dataset.type === type);
        });

        // Apply defaults for new type
        const defaults = BODY_TYPE_DEFAULTS[type];
        const nameInput = this.container.querySelector('#build-name') as HTMLInputElement;
        const massInput = this.container.querySelector('#build-mass') as HTMLInputElement;
        const radiusInput = this.container.querySelector('#build-radius') as HTMLInputElement;
        const colorInput = this.container.querySelector('#build-color') as HTMLInputElement;
        const massiveCheckbox = this.container.querySelector('#build-massive') as HTMLInputElement;
        const starSection = this.container.querySelector('#build-star-section') as HTMLElement;

        nameInput.value = `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.bodyCounter + 1}`;
        massInput.value = defaults.mass.toExponential(3);
        radiusInput.value = defaults.radius.toExponential(3);
        colorInput.value = '#' + defaults.color.toString(16).padStart(6, '0');
        massiveCheckbox.checked = type !== 'spacecraft';

        // Show/hide star-specific options
        starSection.style.display = type === 'star' ? 'block' : 'none';

        if (type === 'star' && defaults.luminosity !== undefined) {
            (this.container.querySelector('#build-luminosity') as HTMLInputElement).value = defaults.luminosity.toString();
            (this.container.querySelector('#build-temperature') as HTMLInputElement).value = (defaults.effectiveTemperature ?? 5778).toString();
        }

        this.updateParamsFromUI();
    }

    private updateParamsFromUI(): void {
        const nameInput = this.container.querySelector('#build-name') as HTMLInputElement;
        const massInput = this.container.querySelector('#build-mass') as HTMLInputElement;
        const radiusInput = this.container.querySelector('#build-radius') as HTMLInputElement;
        const colorInput = this.container.querySelector('#build-color') as HTMLInputElement;
        const xInput = this.container.querySelector('#build-x') as HTMLInputElement;
        const yInput = this.container.querySelector('#build-y') as HTMLInputElement;
        const zInput = this.container.querySelector('#build-z') as HTMLInputElement;
        const vxInput = this.container.querySelector('#build-vx') as HTMLInputElement;
        const vyInput = this.container.querySelector('#build-vy') as HTMLInputElement;
        const vzInput = this.container.querySelector('#build-vz') as HTMLInputElement;
        const physicsCheckbox = this.container.querySelector('#build-physics') as HTMLInputElement;
        const massiveCheckbox = this.container.querySelector('#build-massive') as HTMLInputElement;
        const luminosityInput = this.container.querySelector('#build-luminosity') as HTMLInputElement;
        const temperatureInput = this.container.querySelector('#build-temperature') as HTMLInputElement;

        this.params = {
            type: this.selectedType,
            name: nameInput.value,
            mass: parseFloat(massInput.value) || 0,
            radius: parseFloat(radiusInput.value) || 1,
            color: parseInt(colorInput.value.slice(1), 16),
            x: (parseFloat(xInput.value) || 0) * AU,
            y: (parseFloat(yInput.value) || 0) * AU,
            z: (parseFloat(zInput.value) || 0) * AU,
            vx: (parseFloat(vxInput.value) || 0) * 1000, // km/s to m/s
            vy: (parseFloat(vyInput.value) || 0) * 1000,
            vz: (parseFloat(vzInput.value) || 0) * 1000,
            contributesToPhysics: physicsCheckbox.checked,
            isMassive: massiveCheckbox.checked,
            luminosity: this.selectedType === 'star' ? parseFloat(luminosityInput.value) || 1 : undefined,
            effectiveTemperature: this.selectedType === 'star' ? parseFloat(temperatureInput.value) || 5778 : undefined,
        };

        this.onParamsChange?.(this.params);
    }

    private calculateOrbitalVelocity(): void {
        // Calculate circular orbital velocity around central mass at current position
        // v = sqrt(G * M / r)
        const G = 6.6743e-11;
        const r = Math.sqrt(this.params.x ** 2 + this.params.y ** 2 + this.params.z ** 2);
        
        if (r < 1e6) {
            console.warn('Position too close to origin for orbital calculation');
            return;
        }

        // Assume orbiting around a solar-mass object at origin
        const centralMass = M_SUN;
        const v = Math.sqrt(G * centralMass / r);

        // Direction perpendicular to position vector (in XZ plane by default)
        const dx = this.params.x;
        const dz = this.params.z;
        const dist2D = Math.sqrt(dx * dx + dz * dz);
        
        if (dist2D > 0) {
            // Counter-clockwise orbit
            const vx = (-dz / dist2D) * v;
            const vz = (dx / dist2D) * v;
            
            (this.container.querySelector('#build-vx') as HTMLInputElement).value = (vx / 1000).toFixed(3);
            (this.container.querySelector('#build-vy') as HTMLInputElement).value = '0';
            (this.container.querySelector('#build-vz') as HTMLInputElement).value = (vz / 1000).toFixed(3);
            
            this.updateParamsFromUI();
        }
    }

    private spawn(): void {
        this.bodyCounter++;
        this.onSpawn?.(this.params);
        
        // Update name for next body
        const nameInput = this.container.querySelector('#build-name') as HTMLInputElement;
        nameInput.value = `${this.selectedType.charAt(0).toUpperCase() + this.selectedType.slice(1)} ${this.bodyCounter + 1}`;
        
        this.updateParamsFromUI();
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
        this.updateParamsFromUI();
    }

    close(): void {
        this.isOpen = false;
        this.container.classList.remove('open');
    }

    isVisible(): boolean {
        return this.isOpen;
    }

    getParams(): BuildBodyParams {
        return { ...this.params };
    }

    /** Set position from external source (e.g., camera) */
    setPosition(x: number, y: number, z: number): void {
        (this.container.querySelector('#build-x') as HTMLInputElement).value = (x / AU).toFixed(4);
        (this.container.querySelector('#build-y') as HTMLInputElement).value = (y / AU).toFixed(4);
        (this.container.querySelector('#build-z') as HTMLInputElement).value = (z / AU).toFixed(4);
        this.updateParamsFromUI();
    }

    /** Reset for a new world */
    reset(): void {
        this.bodyCounter = 0;
        this.selectType('planet');
    }
}
