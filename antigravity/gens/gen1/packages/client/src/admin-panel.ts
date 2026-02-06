/**
 * Admin Panel UI
 * 
 * Server configuration and control panel.
 * Features:
 * - Server status display
 * - Tick rate adjustment
 * - Force calculation method toggle
 * - Simulation reset
 */

import { PhysicsClient } from './physics';
import { TimeController } from './time-controller';

interface ServerConfig {
    tickRate: number;
    forceMethod: 'direct' | 'barnes-hut';
    theta: number;
    substeps: number;
}

export class AdminPanel {
    private container: HTMLElement;
    private physics: PhysicsClient;
    private timeController: TimeController;
    private isOpen = false;
    private config: ServerConfig = {
        tickRate: 60,
        forceMethod: 'direct',
        theta: 0.5,
        substeps: 4,
    };

    constructor(physics: PhysicsClient, timeController: TimeController) {
        this.physics = physics;
        this.timeController = timeController;
        this.container = this.createUI();
        document.body.appendChild(this.container);
        this.setupKeyboardShortcut();
    }

    private createUI(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'admin-panel';
        container.innerHTML = `
            <div class="admin-header">
                <h2>⚙️ Admin Panel</h2>
                <button class="admin-close" title="Close (A)">&times;</button>
            </div>
            
            <div class="admin-content">
                <section class="admin-section">
                    <h3>Simulation Settings</h3>
                    
                    <div class="admin-field">
                        <label>Timestep (seconds)</label>
                        <input type="number" id="admin-dt" value="3600" min="1" max="86400" step="60">
                    </div>
                    
                    <div class="admin-field">
                        <label>Substeps</label>
                        <input type="number" id="admin-substeps" value="4" min="1" max="16">
                    </div>
                    
                    <div class="admin-field">
                        <label>Force Method</label>
                        <select id="admin-force-method">
                            <option value="direct">Direct Sum O(N²)</option>
                            <option value="barnes-hut">Barnes-Hut O(N log N)</option>
                        </select>
                    </div>
                    
                    <div class="admin-field" id="theta-field">
                        <label>Barnes-Hut θ</label>
                        <input type="number" id="admin-theta" value="0.5" min="0.1" max="2" step="0.1">
                    </div>
                </section>
                
                <section class="admin-section">
                    <h3>Actions</h3>
                    <button class="admin-btn" id="admin-apply">Apply Settings</button>
                    <button class="admin-btn admin-btn-warning" id="admin-reset">Reset Simulation</button>
                </section>
                
                <section class="admin-section">
                    <h3>Debug Info</h3>
                    <div class="admin-debug">
                        <div>Bodies: <span id="admin-body-count">0</span></div>
                        <div>Tick: <span id="admin-tick">0</span></div>
                        <div>dt: <span id="admin-current-dt">0</span>s</div>
                    </div>
                </section>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #admin-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 380px;
                background: rgba(10, 15, 30, 0.98);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                color: #fff;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 13px;
                z-index: 300;
                display: none;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }
            
            #admin-panel.open {
                display: flex;
            }
            
            .admin-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(0, 0, 0, 0.3);
            }
            
            .admin-header h2 {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
            }
            
            .admin-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 24px;
                cursor: pointer;
                padding: 0 5px;
                line-height: 1;
            }
            
            .admin-close:hover {
                color: #fff;
            }
            
            .admin-content {
                padding: 20px;
            }
            
            .admin-section {
                margin-bottom: 20px;
            }
            
            .admin-section:last-child {
                margin-bottom: 0;
            }
            
            .admin-section h3 {
                font-size: 11px;
                font-weight: 600;
                color: #4fc3f7;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 12px;
            }
            
            .admin-field {
                margin-bottom: 12px;
            }
            
            .admin-field label {
                display: block;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 5px;
            }
            
            .admin-field input,
            .admin-field select {
                width: 100%;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 6px;
                color: #fff;
                padding: 10px 12px;
                font-size: 13px;
            }
            
            .admin-field input:focus,
            .admin-field select:focus {
                outline: none;
                border-color: #4fc3f7;
            }
            
            .admin-btn {
                width: 100%;
                background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
                border: none;
                border-radius: 6px;
                color: #fff;
                padding: 12px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 8px;
                transition: opacity 0.2s;
            }
            
            .admin-btn:hover {
                opacity: 0.9;
            }
            
            .admin-btn-warning {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
            }
            
            .admin-debug {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 6px;
                padding: 12px;
                font-family: 'Consolas', monospace;
                font-size: 12px;
            }
            
            .admin-debug div {
                margin-bottom: 4px;
            }
            
            .admin-debug span {
                color: #4fc3f7;
            }
            
            #theta-field {
                display: none;
            }
            
            #theta-field.visible {
                display: block;
            }
        `;
        document.head.appendChild(style);

        // Setup event listeners
        this.setupEventListeners(container);

        return container;
    }

    private setupEventListeners(container: HTMLElement): void {
        // Close button
        container.querySelector('.admin-close')?.addEventListener('click', () => {
            this.close();
        });

        // Force method change
        const forceMethodSelect = container.querySelector('#admin-force-method') as HTMLSelectElement;
        const thetaField = container.querySelector('#theta-field') as HTMLElement;

        forceMethodSelect?.addEventListener('change', () => {
            thetaField.classList.toggle('visible', forceMethodSelect.value === 'barnes-hut');
        });

        // Apply button
        container.querySelector('#admin-apply')?.addEventListener('click', () => {
            this.applySettings();
        });

        // Reset button
        container.querySelector('#admin-reset')?.addEventListener('click', () => {
            if (confirm('Reset simulation to default state?')) {
                this.resetSimulation();
            }
        });
    }

    private setupKeyboardShortcut(): void {
        window.addEventListener('keydown', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.key === 'a' || e.key === 'A') {
                this.toggle();
            }

            if (e.key === 'Escape' && this.isOpen) {
                this.close();
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
        this.updateDebugInfo();
    }

    close(): void {
        this.isOpen = false;
        this.container.classList.remove('open');
    }

    private applySettings(): void {
        const dt = parseFloat((document.getElementById('admin-dt') as HTMLInputElement).value);
        const substeps = parseInt((document.getElementById('admin-substeps') as HTMLInputElement).value);
        const forceMethod = (document.getElementById('admin-force-method') as HTMLSelectElement).value;
        const theta = parseFloat((document.getElementById('admin-theta') as HTMLInputElement).value);

        // Apply timestep to both physics and TimeController
        this.physics.setTimeStep(dt);
        this.timeController.setPhysicsTimestep(dt);

        // Note: substeps/forceMethod/theta would need WASM methods
        console.log(`⚙️ Applied settings: dt=${dt}s, substeps=${substeps}, method=${forceMethod}, θ=${theta}`);

        this.close();
    }

    private resetSimulation(): void {
        this.physics.createSunEarthMoon();
        console.log('🔄 Simulation reset to Sun-Earth-Moon');
        this.close();
    }

    updateDebugInfo(): void {
        const bodyCount = document.getElementById('admin-body-count');
        const tick = document.getElementById('admin-tick');
        const currentDt = document.getElementById('admin-current-dt');

        if (bodyCount) bodyCount.textContent = this.physics.bodyCount().toString();
        if (tick) tick.textContent = this.physics.tick().toLocaleString();
        if (currentDt) currentDt.textContent = this.timeController.getPhysicsTimestep().toString();
    }
}
