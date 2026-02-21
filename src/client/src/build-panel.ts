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
    // Body properties
    axialTilt?: number;
    rotationPeriod?: number;
}

interface BodyTypeDefaults {
    mass: number;
    radius: number;
    color: number;
    luminosity?: number;
    effectiveTemperature?: number;
    rotationPeriod?: number;
}

const BODY_TYPE_DEFAULTS: Record<BuildableBodyType, BodyTypeDefaults> = {
    star: {
        mass: M_SUN,
        radius: R_SUN,
        color: 0xffdd44,
        luminosity: 1.0,
        effectiveTemperature: 5778,
        rotationPeriod: 25.4 * 86400, // days to seconds
    },
    planet: {
        mass: M_EARTH,
        radius: R_EARTH,
        color: 0x4488ff,
        rotationPeriod: 86400, // 1 day
    },
    moon: {
        mass: M_MOON,
        radius: R_MOON,
        color: 0x888888,
        rotationPeriod: 27.3 * 86400,
    },
    asteroid: {
        mass: 1e15,
        radius: 1e4,
        color: 0x8c7853,
        rotationPeriod: 5 * 3600,
    },
    comet: {
        mass: 1e13,
        radius: 5e3,
        color: 0xccddff,
        rotationPeriod: 10 * 3600,
    },
    spacecraft: {
        mass: 1e4,
        radius: 10,
        color: 0xffffff,
        rotationPeriod: 0,
    },
};

export interface BodyListEntry {
    id: number;
    name: string;
    type: string;
    mass: number;
    radius: number;
    color: number;
}

export class BuildPanel {
    private container: HTMLElement;
    private isOpen = false;
    private selectedType: BuildableBodyType = 'planet';
    private params: BuildBodyParams;
    private bodyCounter = 0;
    private buildModeEnabled = false;

    private onParamsChange?: (params: BuildBodyParams) => void;
    private onSpawn?: (params: BuildBodyParams) => void;
    private onPanelClose?: () => void;
    private onGetBodies?: () => BodyListEntry[];
    private onDeleteBody?: (id: number) => void;
    private onBuildModeRequired?: () => void;

    constructor(
        onParamsChange?: (params: BuildBodyParams) => void,
        onSpawn?: (params: BuildBodyParams) => void,
        onPanelClose?: () => void,
        onGetBodies?: () => BodyListEntry[],
        onDeleteBody?: (id: number) => void,
        onBuildModeRequired?: () => void
    ) {
        this.onParamsChange = onParamsChange;
        this.onSpawn = onSpawn;
        this.onPanelClose = onPanelClose;
        this.onGetBodies = onGetBodies;
        this.onDeleteBody = onDeleteBody;
        this.onBuildModeRequired = onBuildModeRequired;
        this.params = this.createDefaultParams('planet');
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();
        this.setupDrag();
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
            rotationPeriod: defaults.rotationPeriod ?? 86400,
        };
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'build-panel';
        container.innerHTML = `
            <div class="build-header">
                <h2>Build</h2>
                <button class="build-close" title="Close (B)">&times;</button>
            </div>

            <div class="build-tabs">
                <button class="build-tab active" data-tab="basic">Basic</button>
                <button class="build-tab" data-tab="orbit">Orbit</button>
                <button class="build-tab" data-tab="props">Props</button>
                <button class="build-tab" data-tab="bodies">Bodies</button>
            </div>

            <div class="build-content active" id="tab-basic">
                <section class="build-section">
                    <h3>Type</h3>
                    <div class="build-type-grid">
                        <button class="build-type-btn" data-type="star">Star</button>
                        <button class="build-type-btn active" data-type="planet">Planet</button>
                        <button class="build-type-btn" data-type="moon">Moon</button>
                        <button class="build-type-btn" data-type="asteroid">Asteroid</button>
                        <button class="build-type-btn" data-type="comet">Comet</button>
                        <button class="build-type-btn" data-type="spacecraft">Craft</button>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Identity</h3>
                    <div class="build-field">
                        <label>Name</label>
                        <input type="text" id="build-name" value="Planet 1">
                    </div>
                    <div class="build-row">
                        <div class="build-field-sm">
                            <label>Color</label>
                            <input type="color" id="build-color" value="#4488ff">
                        </div>
                    </div>
                </section>

                <section class="build-section">
                    <h3>Physical</h3>
                    <div class="build-field">
                        <label>Mass (kg)</label>
                        <input type="text" id="build-mass" value="${M_EARTH.toExponential(3)}">
                    </div>
                    <div class="build-field">
                        <label>Radius (m)</label>
                        <input type="text" id="build-radius" value="${R_EARTH.toExponential(3)}">
                    </div>
                </section>

                <section class="build-section">
                    <h3>Physics</h3>
                    <div class="build-row">
                        <label class="build-toggle">
                            <input type="checkbox" id="build-physics" checked>
                            <span>Simulated</span>
                        </label>
                        <label class="build-toggle">
                            <input type="checkbox" id="build-massive" checked>
                            <span>Massive</span>
                        </label>
                    </div>
                </section>
            </div>

            <div class="build-content" id="tab-orbit" style="display: none;">
                <section class="build-section">
                    <h3>Position (AU)</h3>
                    <div class="build-row-3">
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
                    <div class="build-row-3">
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
                    <button class="build-btn-small" id="build-calc-orbital">Calc Circular Orbit</button>
                </section>
            </div>

            <div class="build-content" id="tab-props" style="display: none;">
                <section class="build-section" id="build-star-section">
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
                    <h3>Rotation</h3>
                    <div class="build-field">
                        <label>Axial Tilt (deg)</label>
                        <input type="number" id="build-tilt" value="0" step="1" min="-180" max="180">
                    </div>
                    <div class="build-field">
                        <label>Rotation Period (hours)</label>
                        <input type="number" id="build-rotation" value="24" step="0.1" min="0">
                    </div>
                </section>
            </div>

            <div class="build-content" id="tab-bodies" style="display: none;">
                <div class="build-body-list" id="build-body-list">
                    <p class="build-body-empty">No bodies yet</p>
                </div>
            </div>

            <div class="build-footer">
                <button class="build-btn-spawn" id="build-spawn">Spawn Body</button>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #build-panel {
                position: fixed;
                top: 20px;
                left: 20px;
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
            
            #build-panel.open { display: flex; }
            
            .build-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
                cursor: move;
                user-select: none;
            }
            
            .build-header h2 {
                font-size: 14px;
                font-weight: 600;
                margin: 0;
                color: #4fc3f7;
            }
            
            .build-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 20px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .build-close:hover { color: #fff; }

            .build-tabs {
                display: flex;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .build-tab {
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

            .build-tab:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.05);
            }

            .build-tab.active {
                color: #4fc3f7;
                border-bottom-color: #4fc3f7;
            }
            
            .build-content { 
                padding: 10px 12px; 
                display: none;
            }
            .build-content.active { display: block; }
            
            .build-section {
                margin-bottom: 10px;
            }
            
            .build-section:last-child { margin-bottom: 0; }
            
            .build-section h3 {
                font-size: 10px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0 0 6px 0;
            }
            
            .build-type-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 4px;
            }
            
            .build-type-btn {
                padding: 5px 2px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #ccc;
                font-size: 10px;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .build-type-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.2);
            }
            
            .build-type-btn.active {
                background: rgba(79, 195, 247, 0.2);
                border-color: rgba(79, 195, 247, 0.6);
                color: #4fc3f7;
            }

            .build-row {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
            }

            .build-row-3 {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
            }

            .build-toggle {
                display: flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
            }

            .build-toggle input[type="checkbox"] {
                width: 14px;
                height: 14px;
                accent-color: #4fc3f7;
                margin: 0;
            }

            .build-toggle span {
                font-size: 11px;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .build-field {
                margin-bottom: 6px;
            }

            .build-field-sm {
                flex: 1;
            }

            .build-field-col {
                display: flex;
                flex-direction: column;
            }
            
            .build-field label,
            .build-field-sm label,
            .build-field-col label {
                display: block;
                font-size: 10px;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 3px;
            }
            
            .build-field input[type="text"],
            .build-field input[type="number"],
            .build-field-col input {
                width: 100%;
                padding: 5px 6px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                font-size: 11px;
                box-sizing: border-box;
            }
            
            .build-field input[type="color"],
            .build-field-sm input[type="color"] {
                width: 100%;
                height: 26px;
                padding: 2px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                cursor: pointer;
            }
            
            .build-field input:focus,
            .build-field-col input:focus {
                outline: none;
                border-color: rgba(79, 195, 247, 0.5);
            }

            .build-btn-small {
                width: 100%;
                padding: 6px;
                margin-top: 6px;
                background: rgba(79, 195, 247, 0.1);
                border: 1px solid rgba(79, 195, 247, 0.3);
                border-radius: 4px;
                color: #4fc3f7;
                font-size: 10px;
                cursor: pointer;
                transition: all 0.15s;
            }

            .build-btn-small:hover {
                background: rgba(79, 195, 247, 0.2);
            }

            .build-footer {
                padding: 10px 12px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.2);
            }
            
            .build-btn-spawn {
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, rgba(79, 195, 247, 0.3), rgba(79, 195, 247, 0.1));
                border: 1px solid rgba(79, 195, 247, 0.5);
                border-radius: 6px;
                color: #4fc3f7;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s;
            }
            
            .build-btn-spawn:hover {
                background: linear-gradient(135deg, rgba(79, 195, 247, 0.4), rgba(79, 195, 247, 0.2));
                border-color: rgba(79, 195, 247, 0.8);
            }

            #build-star-section.hidden { display: none; }

            .build-body-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .build-body-empty {
                color: rgba(255, 255, 255, 0.4);
                text-align: center;
                padding: 20px;
                margin: 0;
                font-size: 12px;
            }

            .build-body-item {
                display: flex;
                align-items: center;
                padding: 6px 8px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 4px;
                margin-bottom: 4px;
                gap: 8px;
            }

            .build-body-item:last-child {
                margin-bottom: 0;
            }

            .build-body-color {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .build-body-info {
                flex: 1;
                min-width: 0;
            }

            .build-body-name {
                font-size: 11px;
                font-weight: 500;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .build-body-type {
                font-size: 9px;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
            }

            .build-body-actions {
                display: flex;
                gap: 4px;
                flex-shrink: 0;
            }

            .build-body-btn {
                padding: 3px 6px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 9px;
                cursor: pointer;
                transition: all 0.15s;
            }

            .build-body-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }

            .build-body-btn.delete {
                color: #ff6b6b;
                border-color: rgba(255, 107, 107, 0.3);
            }

            .build-body-btn.delete:hover {
                background: rgba(255, 107, 107, 0.2);
                border-color: rgba(255, 107, 107, 0.5);
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

        // Tab switching
        container.querySelectorAll('.build-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = (e.target as HTMLElement).dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
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
                        'build-luminosity', 'build-temperature', 'build-physics', 'build-massive',
                        'build-tilt', 'build-rotation'];
        
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

    private switchTab(tabName: string): void {
        // Update tab buttons
        this.container.querySelectorAll('.build-tab').forEach(tab => {
            tab.classList.toggle('active', (tab as HTMLElement).dataset.tab === tabName);
        });

        // Update content visibility
        this.container.querySelectorAll('.build-content').forEach(content => {
            const isActive = content.id === `tab-${tabName}`;
            content.classList.toggle('active', isActive);
            (content as HTMLElement).style.display = isActive ? 'block' : 'none';
        });

        // Refresh body list when switching to bodies tab
        if (tabName === 'bodies') {
            this.refreshBodyList();
        }
    }

    private refreshBodyList(): void {
        const listEl = this.container.querySelector('#build-body-list');
        if (!listEl) return;

        const bodies = this.onGetBodies?.() ?? [];
        
        if (bodies.length === 0) {
            listEl.innerHTML = '<p class="build-body-empty">No bodies yet</p>';
            return;
        }

        listEl.innerHTML = bodies.map(body => `
            <div class="build-body-item" data-body-id="${body.id}">
                <div class="build-body-color" style="background: #${body.color.toString(16).padStart(6, '0')};"></div>
                <div class="build-body-info">
                    <div class="build-body-name">${body.name}</div>
                    <div class="build-body-type">${body.type}</div>
                </div>
                <div class="build-body-actions">
                    <button class="build-body-btn delete" data-action="delete" data-id="${body.id}" title="Delete">✕</button>
                </div>
            </div>
        `).join('');

        // Add click handlers for delete buttons
        listEl.querySelectorAll('.build-body-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt((btn as HTMLElement).dataset.id ?? '0');
                if (id > 0) {
                    this.onDeleteBody?.(id);
                    this.refreshBodyList();
                }
            });
        });
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'b' || e.key === 'B') {
                if (this.buildModeEnabled) {
                    this.toggle();
                } else {
                    this.onBuildModeRequired?.();
                }
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
        const rotationInput = this.container.querySelector('#build-rotation') as HTMLInputElement;

        nameInput.value = `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.bodyCounter + 1}`;
        massInput.value = defaults.mass.toExponential(3);
        radiusInput.value = defaults.radius.toExponential(3);
        colorInput.value = '#' + defaults.color.toString(16).padStart(6, '0');
        massiveCheckbox.checked = type !== 'spacecraft';
        rotationInput.value = ((defaults.rotationPeriod ?? 86400) / 3600).toFixed(1);

        // Show/hide star-specific options
        starSection.classList.toggle('hidden', type !== 'star');

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
        const tiltInput = this.container.querySelector('#build-tilt') as HTMLInputElement;
        const rotationInput = this.container.querySelector('#build-rotation') as HTMLInputElement;

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
            axialTilt: (parseFloat(tiltInput.value) || 0) * Math.PI / 180, // deg to rad
            rotationPeriod: (parseFloat(rotationInput.value) || 24) * 3600, // hours to seconds
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

    private setupDrag(): void {
        const header = this.container.querySelector('.build-header') as HTMLElement | null;
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
        this.onPanelClose?.();
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
        // Reset position/velocity
        (this.container.querySelector('#build-x') as HTMLInputElement).value = '0';
        (this.container.querySelector('#build-y') as HTMLInputElement).value = '0';
        (this.container.querySelector('#build-z') as HTMLInputElement).value = '0';
        (this.container.querySelector('#build-vx') as HTMLInputElement).value = '0';
        (this.container.querySelector('#build-vy') as HTMLInputElement).value = '0';
        (this.container.querySelector('#build-vz') as HTMLInputElement).value = '0';
        this.switchTab('basic');
    }

    /** Set build mode state (controls whether B key opens panel) */
    setBuildMode(enabled: boolean): void {
        this.buildModeEnabled = enabled;
    }

    /** Hide the panel (for H key toggle UI) */
    hide(): void {
        this.container.style.display = 'none';
    }

    /** Show the panel (restore visibility after hide) */
    show(): void {
        this.container.style.display = '';
    }
}
