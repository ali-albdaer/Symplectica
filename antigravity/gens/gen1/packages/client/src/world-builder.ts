/**
 * World Builder UI
 * 
 * Interactive panel for creating and editing celestial bodies.
 * Features:
 * - Preset selection (Solar System, etc.)
 * - Add custom bodies
 * - Edit existing bodies
 * - Delete bodies
 */

import { PhysicsClient } from './physics';

interface BodyTemplate {
    name: string;
    type: 'star' | 'planet' | 'moon' | 'asteroid';
    mass: number;
    radius: number;
    distance: number; // from origin
    velocity: number; // orbital velocity
    color: number;
}

// Common body templates
const TEMPLATES: Record<string, BodyTemplate> = {
    'earth-like': {
        name: 'Earth-like Planet',
        type: 'planet',
        mass: 5.972e24,
        radius: 6.371e6,
        distance: 1.496e11, // 1 AU
        velocity: 29784,
        color: 0x4488ff,
    },
    'gas-giant': {
        name: 'Gas Giant',
        type: 'planet',
        mass: 1.898e27, // Jupiter mass
        radius: 6.991e7,
        distance: 7.786e11, // Jupiter orbit
        velocity: 13070,
        color: 0xd4a574,
    },
    'moon': {
        name: 'Moon',
        type: 'moon',
        mass: 7.342e22,
        radius: 1.737e6,
        distance: 3.844e8,
        velocity: 1022,
        color: 0x888888,
    },
    'asteroid': {
        name: 'Asteroid',
        type: 'asteroid',
        mass: 1e15,
        radius: 5e3,
        distance: 4e11, // Asteroid belt
        velocity: 18000,
        color: 0x666666,
    },
    'red-dwarf': {
        name: 'Red Dwarf Star',
        type: 'star',
        mass: 1.5e29, // ~0.08 solar masses
        radius: 1e8,
        distance: 0,
        velocity: 0,
        color: 0xff4444,
    },
};

// Preset systems
const PRESETS = [
    { id: 'sun-earth-moon', name: 'Sun-Earth-Moon', bodies: 3 },
    { id: 'inner-solar', name: 'Inner Solar System', bodies: 6 },
    { id: 'full-solar', name: 'Full Solar System', bodies: 13 },
    { id: 'jupiter', name: 'Jupiter System', bodies: 5 },
    { id: 'saturn', name: 'Saturn System', bodies: 8 },
    { id: 'alpha-centauri', name: 'Alpha Centauri', bodies: 2 },
    { id: 'trappist', name: 'TRAPPIST-1', bodies: 8 },
    { id: 'binary-pulsar', name: 'Binary Pulsar', bodies: 2 },
];

export class WorldBuilder {
    private container: HTMLElement;
    private physics: PhysicsClient;
    private isOpen = false;
    private onUpdate: () => void;

    constructor(physics: PhysicsClient, onUpdate: () => void) {
        this.physics = physics;
        this.onUpdate = onUpdate;
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'world-builder';
        container.innerHTML = `
            <div class="wb-header">
                <h2>🔧 World Builder</h2>
                <button class="wb-close" title="Close (B)">&times;</button>
            </div>
            
            <div class="wb-content">
                <section class="wb-section">
                    <h3>Load Preset</h3>
                    <div class="wb-presets">
                        ${PRESETS.map(p => `
                            <button class="wb-preset" data-preset="${p.id}">
                                ${p.name}
                                <span class="wb-preset-count">${p.bodies} bodies</span>
                            </button>
                        `).join('')}
                    </div>
                </section>
                
                <section class="wb-section">
                    <h3>Add Body</h3>
                    <div class="wb-templates">
                        ${Object.entries(TEMPLATES).map(([id, t]) => `
                            <button class="wb-template" data-template="${id}">
                                + ${t.name}
                            </button>
                        `).join('')}
                    </div>
                </section>
                
                <section class="wb-section">
                    <h3>Custom Body</h3>
                    <form id="wb-custom-form">
                        <div class="wb-field">
                            <label>Name</label>
                            <input type="text" name="name" value="Custom Body" required>
                        </div>
                        <div class="wb-field">
                            <label>Type</label>
                            <select name="type">
                                <option value="planet">Planet</option>
                                <option value="moon">Moon</option>
                                <option value="asteroid">Asteroid</option>
                                <option value="star">Star</option>
                            </select>
                        </div>
                        <div class="wb-field">
                            <label>Mass (kg)</label>
                            <input type="text" name="mass" value="5.972e24" required>
                        </div>
                        <div class="wb-field">
                            <label>Radius (m)</label>
                            <input type="text" name="radius" value="6.371e6" required>
                        </div>
                        <div class="wb-field">
                            <label>Distance (m)</label>
                            <input type="text" name="distance" value="1.496e11" required>
                        </div>
                        <div class="wb-field">
                            <label>Orbital Velocity (m/s)</label>
                            <input type="text" name="velocity" value="29784" required>
                        </div>
                        <button type="submit" class="wb-submit">Add Body</button>
                    </form>
                </section>
                
                <section class="wb-section">
                    <h3>Current Bodies</h3>
                    <div id="wb-body-list" class="wb-body-list">
                        <!-- Populated dynamically -->
                    </div>
                </section>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #world-builder {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                max-height: calc(100vh - 40px);
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
            
            #world-builder.open {
                display: flex;
            }
            
            .wb-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
            }
            
            .wb-header h2 {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
            }
            
            .wb-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 24px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .wb-close:hover {
                color: #fff;
            }
            
            .wb-content {
                overflow-y: auto;
                padding: 15px;
                flex: 1;
            }
            
            .wb-section {
                margin-bottom: 20px;
            }
            
            .wb-section h3 {
                font-size: 12px;
                font-weight: 600;
                color: #4fc3f7;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
            }
            
            .wb-presets, .wb-templates {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
            }
            
            .wb-preset, .wb-template {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #fff;
                padding: 10px;
                cursor: pointer;
                text-align: left;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .wb-preset:hover, .wb-template:hover {
                background: rgba(79, 195, 247, 0.2);
                border-color: #4fc3f7;
            }
            
            .wb-preset-count {
                display: block;
                font-size: 10px;
                color: rgba(255, 255, 255, 0.5);
                margin-top: 3px;
            }
            
            .wb-field {
                margin-bottom: 10px;
            }
            
            .wb-field label {
                display: block;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.6);
                margin-bottom: 4px;
            }
            
            .wb-field input, .wb-field select {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                color: #fff;
                padding: 8px 10px;
                font-size: 13px;
            }
            
            .wb-field input:focus, .wb-field select:focus {
                outline: none;
                border-color: #4fc3f7;
            }
            
            .wb-submit {
                width: 100%;
                background: linear-gradient(135deg, #4fc3f7 0%, #ab47bc 100%);
                border: none;
                border-radius: 6px;
                color: #fff;
                padding: 12px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s;
            }
            
            .wb-submit:hover {
                opacity: 0.9;
            }
            
            .wb-body-list {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .wb-body-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 10px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 4px;
                margin-bottom: 4px;
            }
            
            .wb-body-item:hover {
                background: rgba(255, 255, 255, 0.08);
            }
            
            .wb-body-name {
                font-weight: 500;
            }
            
            .wb-body-type {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.5);
                margin-left: 8px;
            }
            
            .wb-body-delete {
                background: rgba(255, 100, 100, 0.2);
                border: none;
                border-radius: 3px;
                color: #ff6b6b;
                padding: 4px 8px;
                font-size: 11px;
                cursor: pointer;
            }
            
            .wb-body-delete:hover {
                background: rgba(255, 100, 100, 0.4);
            }
        `;
        document.head.appendChild(style);

        // Setup event listeners
        this.setupEventListeners(container);

        return container;
    }

    private setupEventListeners(container: HTMLElement): void {
        // Close button
        container.querySelector('.wb-close')?.addEventListener('click', () => {
            this.close();
        });

        // Preset buttons
        container.querySelectorAll('.wb-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = (e.currentTarget as HTMLElement).dataset.preset;
                if (preset) this.loadPreset(preset);
            });
        });

        // Template buttons
        container.querySelectorAll('.wb-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = (e.currentTarget as HTMLElement).dataset.template;
                if (template) this.addFromTemplate(template);
            });
        });

        // Custom form
        const form = container.querySelector('#wb-custom-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCustomBody(new FormData(form));
        });
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'b' || e.key === 'B') {
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                    return; // Don't trigger when typing in input
                }
                this.toggle();
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
        this.updateBodyList();
    }

    close(): void {
        this.isOpen = false;
        this.container.classList.remove('open');
    }

    private loadPreset(presetId: string): void {
        const seed = BigInt(Date.now());

        switch (presetId) {
            case 'sun-earth-moon':
                this.physics.createSunEarthMoon();
                break;
            case 'inner-solar':
                this.physics.createPreset('innerSolarSystem', seed);
                break;
            case 'full-solar':
                this.physics.createPreset('fullSolarSystem', seed);
                break;
            case 'jupiter':
                this.physics.createPreset('jupiterSystem', seed);
                break;
            case 'saturn':
                this.physics.createPreset('saturnSystem', seed);
                break;
            case 'alpha-centauri':
                this.physics.createPreset('alphaCentauri', seed);
                break;
            case 'trappist':
                this.physics.createPreset('trappist1', seed);
                break;
            case 'binary-pulsar':
                this.physics.createPreset('binaryPulsar', seed);
                break;
        }

        this.updateBodyList();
        this.onUpdate();
    }

    private addFromTemplate(templateId: string): void {
        const template = TEMPLATES[templateId];
        if (!template) return;

        // Add some randomness to position
        const angle = Math.random() * Math.PI * 2;

        this.physics.addBody({
            name: template.name,
            type: template.type,
            mass: template.mass,
            radius: template.radius,
            x: template.distance * Math.cos(angle),
            y: 0,
            z: template.distance * Math.sin(angle),
            vx: -template.velocity * Math.sin(angle),
            vy: 0,
            vz: template.velocity * Math.cos(angle),
        });

        this.updateBodyList();
        this.onUpdate();
    }

    private addCustomBody(formData: FormData): void {
        const name = formData.get('name') as string;
        const type = formData.get('type') as 'star' | 'planet' | 'moon' | 'asteroid';
        const mass = parseFloat(formData.get('mass') as string);
        const radius = parseFloat(formData.get('radius') as string);
        const distance = parseFloat(formData.get('distance') as string);
        const velocity = parseFloat(formData.get('velocity') as string);

        const angle = Math.random() * Math.PI * 2;

        this.physics.addBody({
            name,
            type,
            mass,
            radius,
            x: distance * Math.cos(angle),
            y: 0,
            z: distance * Math.sin(angle),
            vx: -velocity * Math.sin(angle),
            vy: 0,
            vz: velocity * Math.cos(angle),
        });

        this.updateBodyList();
        this.onUpdate();
    }

    private updateBodyList(): void {
        const list = document.getElementById('wb-body-list');
        if (!list) return;

        const bodies = this.physics.getBodies();

        list.innerHTML = bodies.map((body, index) => `
            <div class="wb-body-item">
                <div>
                    <span class="wb-body-name">${body.name}</span>
                    <span class="wb-body-type">${body.type}</span>
                </div>
                ${index > 0 ? `<button class="wb-body-delete" data-id="${body.id}">Delete</button>` : ''}
            </div>
        `).join('');

        // Setup delete buttons
        list.querySelectorAll('.wb-body-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt((e.currentTarget as HTMLElement).dataset.id || '0');
                this.physics.removeBody(id);
                this.updateBodyList();
                this.onUpdate();
            });
        });
    }
}
