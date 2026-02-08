/**
 * N-Body Simulation Client
 * 
 * Three.js renderer with:
 * - Floating origin for large-scale precision
 * - Logarithmic depth buffer
 * - Orbital camera controls
 * - Time warp for fast-forwarding simulation
 */

import * as THREE from 'three';
import { OrbitCamera } from './camera';
import { BodyRenderer } from './renderer';
import { AdminStatePayload, NetworkClient, VisualizationStatePayload } from './network';
import { PhysicsClient } from './physics';
import { WorldBuilder } from './world-builder';
import { Chat } from './chat';
import { AdminPanel } from './admin-panel';
import { VisualizationPanel, VisualizationOptions } from './visualization-panel';
import { TimeController } from './time-controller';

// Physical constants (SI units)
const AU = 1.495978707e11; // meters

interface SimState {
    tick: number;
    time: number;
    positions: Float64Array;
    energy: number;
    bodyCount: number;
}

interface NetworkStatePayload {
    tick: number;
    time: number;
    positions: number[];
    energy: number;
}



class NBodyClient {
    private scene!: THREE.Scene;
    private renderer!: THREE.WebGLRenderer;
    private camera!: OrbitCamera;
    private bodyRenderer!: BodyRenderer;
    private network!: NetworkClient;
    private physics!: PhysicsClient;
    private worldBuilder!: WorldBuilder;
    private chat!: Chat;
    private adminPanel!: AdminPanel;
    private vizPanel!: VisualizationPanel;

    private state: SimState = {
        tick: 0,
        time: 0,
        positions: new Float64Array(0),
        energy: 0,
        bodyCount: 0,
    };

    private lastFrameTime = 0;
    private fpsHistory: number[] = [];
    private running = false;

    private lastServerState?: NetworkStatePayload;
    private lastServerPositions = new Float64Array(0);
    
    // Track visualization options to restore after body refresh
    private currentVizOptions: VisualizationOptions = {
        showOrbitTrails: true,
        showLabels: false,
        showGridXY: false,
        showGridXZ: false,
        showGridYZ: false,
        gridSpacing: 1.495978707e11,
        gridSize: 40,
        orbitTrailLength: 100,
        realScale: false,
        bodyScale: 25,
    };

    // Time control (centralized)
    private timeController = new TimeController();
    private uiHidden = false;
    private hintsVisible = false;

    // Body following
    private followBodyIndex = -1; // -1 = follow origin, 0+ = body index
    private lastFollowBodyIndex = -1;

    // Free camera mode
    private freeCamera = false;
    private freeCamSpeedAuPerSec = 1;
    private freeCamCrosshair: HTMLElement | null = null;
    private raycaster = new THREE.Raycaster();
    private moveKeys: Record<string, boolean> = {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
        Space: false,
        ShiftLeft: false,
        ShiftRight: false,
    };

    async init(): Promise<void> {
        this.updateLoadingStatus('Initializing renderer...');
        this.initRenderer();

        this.updateLoadingStatus('Loading physics engine...');
        await this.initPhysics();

        this.updateLoadingStatus('Setting up controls...');
        this.initControls();

        this.updateLoadingStatus('Connecting to server...');
        await this.initNetwork();

        // Initialize Chat
        this.chat = new Chat(this.network);
        this.setupNetworkHandlers();

        try {
            await this.network.connect();
        } catch (error) {
            console.warn('⚠️ Multiplayer server unavailable, running in local mode.', error);
        }

        // Initialize World Builder
        this.worldBuilder = new WorldBuilder(this.physics, () => this.refreshBodies(), this.network);

        // Initialize Admin Panel
        this.adminPanel = new AdminPanel(
            this.physics,
            this.timeController,
            this.network,
            (speed) => {
                this.freeCamSpeedAuPerSec = speed;
            },
            (sensitivity) => {
                this.camera.setFreeLookSensitivity(sensitivity);
            }
        );

        // Initialize Visualization Panel
        this.vizPanel = new VisualizationPanel((options: VisualizationOptions) => {
            this.currentVizOptions = { ...options };
            this.applyVisualizationToRenderer(options);

            if (this.network?.isConnected()) {
                this.network.sendVisualizationSettings(options);
            }
        });

        this.hideLoading();
        this.start();
    }

    private async initNetwork(): Promise<void> {
        const host = window.location.hostname || 'localhost';
        const url = `ws://${host}:8080`;
        this.network = new NetworkClient(url);
    }

    private setupNetworkHandlers(): void {
        this.network.on('welcome', (message) => {
            const payload = message.payload as { snapshot: string; config?: { adminState?: AdminStatePayload; visualizationState?: VisualizationStatePayload } };
            if (payload?.snapshot) {
                this.applySnapshot(payload.snapshot);
            }
            if (payload?.config?.adminState) {
                this.applyAdminState(payload.config.adminState);
            }
            if (payload?.config?.visualizationState) {
                this.applyVisualizationState(payload.config.visualizationState);
            }
        });

        this.network.on('snapshot', (message) => {
            const snapshot = message.payload as string;
            if (snapshot) {
                this.applySnapshot(snapshot);
            }
        });

        this.network.on('state', (message) => {
            const state = message.payload as NetworkStatePayload;
            if (state?.positions) {
                this.applyServerState(state);
            }
        });

        this.network.on('chat', (message) => {
            const payload = message.payload as { sender: string; text: string };
            if (payload?.sender && payload?.text) {
                this.chat.onServerMessage(payload.sender, payload.text);
            }
        });

        this.network.on('admin_state', (message) => {
            const payload = message.payload as AdminStatePayload;
            if (payload) {
                this.applyAdminState(payload);
            }
        });

        this.network.on('visualization_state', (message) => {
            const payload = message.payload as VisualizationStatePayload;
            if (payload) {
                this.applyVisualizationState(payload);
            }
        });
    }

    private applyAdminState(settings: AdminStatePayload): void {
        this.physics.setTimeStep(settings.dt);
        this.timeController.setPhysicsTimestep(settings.dt);
        this.timeController.setSpeedBySimRate(settings.timeScale);
        this.timeController.setPaused(settings.paused);
        this.updateTimeScaleUI();
        this.adminPanel?.applyServerSettings(settings);
    }

    private applyVisualizationState(settings: VisualizationStatePayload): void {
        this.currentVizOptions = { ...settings };
        this.applyVisualizationToRenderer(settings);
        this.vizPanel?.applyOptions(settings);
    }
    
    private applyVisualizationToRenderer(options: VisualizationOptions): void {
        this.bodyRenderer.setShowOrbitTrails(options.showOrbitTrails);
        this.bodyRenderer.setShowLabels(options.showLabels);
        this.bodyRenderer.setMaxTrailPoints(options.orbitTrailLength);
        this.bodyRenderer.setRealScale(options.realScale);
        this.bodyRenderer.setBodyScale(options.bodyScale);
        this.bodyRenderer.setGridOptions(
            options.showGridXY,
            options.showGridXZ,
            options.showGridYZ,
            options.gridSpacing,
            options.gridSize
        );
    }

    private applySnapshot(snapshot: string): void {
        const oldBodyCount = this.physics.bodyCount();
        const restored = this.physics.restoreSnapshot(snapshot);
        if (!restored) {
            console.warn('⚠️ Failed to apply server snapshot');
            return;
        }

        // Only refresh bodies if count changed (preserves orbit trails)
        const newBodyCount = this.physics.bodyCount();
        if (newBodyCount !== oldBodyCount) {
            this.refreshBodies();
        }
        
        this.state.bodyCount = newBodyCount;
        this.updateUIBodyCount();
        this.timeController.resetAccumulator();
    }

    private applyServerState(state: NetworkStatePayload): void {
        this.lastServerState = state;
        this.lastServerPositions = new Float64Array(state.positions);
    }

    private initRenderer(): void {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000005);

        // Create renderer with logarithmic depth buffer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            logarithmicDepthBuffer: true,
            powerPreference: 'high-performance',
        });

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        const container = document.getElementById('canvas-container')!;
        container.appendChild(this.renderer.domElement);
        this.freeCamCrosshair = document.getElementById('freecam-crosshair');

        // Create camera - start further out and elevated
        this.camera = new OrbitCamera(
            75,
            window.innerWidth / window.innerHeight,
            1e3,     // 1 km near plane
            1e15     // ~1000 AU far plane
        );
        this.camera.setDistance(2.5 * AU); // Start at 2.5 AU distance
        this.camera.setElevation(0.5); // Look down at system

        // Create body renderer
        this.bodyRenderer = new BodyRenderer(this.scene);

        // Add starfield
        this.createStarfield();

        // Add ambient light (space is dark but we need some fill)
        const ambient = new THREE.AmbientLight(0x111122, 0.3);
        this.scene.add(ambient);

        // Handle resize
        window.addEventListener('resize', () => this.onResize());
    }

    private async initPhysics(): Promise<void> {
        this.physics = new PhysicsClient();
        await this.physics.init();

        // Use local simulation for now - default to full solar system
        this.physics.createPreset('fullSolarSystem', BigInt(Date.now()));

        // TimeController manages simulation speed; physics dt is set by createPreset

        this.state.bodyCount = this.physics.bodyCount();
        this.updateUIBodyCount();

        // Initialize body meshes
        this.refreshBodies();

    }

    private refreshBodies(): void {
        // Clear existing bodies from renderer
        this.bodyRenderer.dispose();
        this.bodyRenderer = new BodyRenderer(this.scene);

        // Add all bodies from physics
        const bodies = this.physics.getBodies();
        const positions = this.physics.getPositions();

        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            this.bodyRenderer.addBody(body);
        }

        // Reapply visualization settings to the new renderer
        this.applyVisualizationToRenderer(this.currentVizOptions);

        this.state.bodyCount = this.physics.bodyCount();
        this.updateUIBodyCount();
    }

    private initControls(): void {
        window.addEventListener('keydown', (e) => {
            // Escape blurs any focused element to restore keyboard control
            if (e.key === 'Escape') {
                (document.activeElement as HTMLElement)?.blur();
                return;
            }

            // Skip if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Movement keys for free camera
            if (this.setMoveKey(e.code, true)) {
                if (this.freeCamera) {
                    e.preventDefault();
                    return;
                }
            }

            switch (e.key) {
                case ' ':
                    if (this.network?.isConnected()) {
                        const nextPaused = !this.timeController.isPaused();
                        this.timeController.setPaused(nextPaused);
                        this.updateTimeScaleUI();
                        this.network.sendPause(nextPaused);
                    } else {
                        this.timeController.togglePause();
                        this.updateTimeScaleUI();
                    }
                    break;
                case '.':
                case '>':
                    this.timeController.increaseSpeed();
                    this.updateTimeScaleUI();
                    this.syncTimeScaleToServer();
                    break;
                case ',':
                case '<':
                    this.timeController.decreaseSpeed();
                    this.updateTimeScaleUI();
                    this.syncTimeScaleToServer();
                    break;
                case '1':
                    this.timeController.setSpeedIndex(0); // 1s/s
                    this.updateTimeScaleUI();
                    this.syncTimeScaleToServer();
                    break;
                case '2':
                    this.timeController.setSpeedIndex(2); // 1hr/s
                    this.updateTimeScaleUI();
                    this.syncTimeScaleToServer();
                    break;
                case '3':
                    this.timeController.setSpeedIndex(4); // 1wk/s
                    this.updateTimeScaleUI();
                    this.syncTimeScaleToServer();
                    break;
                case '4':
                    this.timeController.setSpeedIndex(6); // 1yr/s
                    this.updateTimeScaleUI();
                    this.syncTimeScaleToServer();
                    break;
                case 'c':
                case 'C':
                    this.toggleFreeCamera();
                    break;
                case 'n':
                case 'N':
                    this.followNextBody();
                    break;
                case 'p':
                case 'P':
                    // Only handle P for previous if not pausing (space handles pause)
                    if (!e.shiftKey) {
                        this.followPreviousBody();
                    }
                    break;
                case 'h':
                case 'H':
                    this.toggleUIVisibility();
                    break;
                case 'i':
                case 'I':
                    this.toggleHints();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (this.setMoveKey(e.code, false)) {
                e.preventDefault();
            }
        });

        // Clicking on the canvas blurs any focused UI element
        document.getElementById('canvas-container')?.addEventListener('click', () => {
            (document.activeElement as HTMLElement)?.blur();
        });

        document.getElementById('canvas-container')?.addEventListener('mousedown', (e) => {
            if (!this.freeCamera || e.button !== 0) return;
            const id = this.pickBodyFromCenter();
            if (id === null) return;
            const index = this.findBodyIndexById(id);
            if (index === null) return;
            this.switchToFollowBody(index);
        });

        this.updateTimeScaleUI();
    }

    private toggleUIVisibility(): void {
        this.uiHidden = !this.uiHidden;
        // Include ALL UI elements including stats-overlay (Simulation panel)
        const uiElements = document.querySelectorAll('#ui-overlay, #chat-panel, #world-builder, #admin-panel, #viz-panel');
        uiElements.forEach(el => {
            (el as HTMLElement).style.display = this.uiHidden ? 'none' : '';
        });
    }

    private toggleFreeCamera(): void {
        this.freeCamera = !this.freeCamera;
        if (this.freeCamera) {
            this.lastFollowBodyIndex = this.followBodyIndex;
            this.followBodyIndex = -1;
            const origin = this.resolveCameraOrigin(true);
            const seedWorld = this.camera.getCameraWorldPosition();
            const forward = new THREE.Vector3();
            this.camera.getWorldDirection(forward);
            this.camera.setFreeMode(
                true,
                seedWorld,
                { x: forward.x, y: forward.y, z: forward.z },
                origin
            );
            this.setFreeCamUI(true);
        } else {
            const cameraWorld = this.camera.getCameraWorldPosition();
            const target = this.getFollowTargetPosition(this.lastFollowBodyIndex);
            const offset = {
                x: cameraWorld.x - target.x,
                y: cameraWorld.y - target.y,
                z: cameraWorld.z - target.z,
            };
            this.camera.setFreeMode(false);
            this.camera.setOrbitFromOffset(offset);
            this.followBodyIndex = this.lastFollowBodyIndex;
            this.setFreeCamUI(false);
        }
        this.updateFollowUI();
    }

    private setFreeCamUI(active: boolean): void {
        if (this.freeCamCrosshair) {
            this.freeCamCrosshair.style.display = active ? 'block' : 'none';
        }
    }

    private resolveCameraOrigin(useFollowTarget: boolean): { x: number; y: number; z: number } {
        let origin = this.camera.getWorldOrigin();
        if (useFollowTarget && this.followBodyIndex >= 0 && this.followBodyIndex * 3 + 2 < this.state.positions.length) {
            origin = {
                x: this.state.positions[this.followBodyIndex * 3],
                y: this.state.positions[this.followBodyIndex * 3 + 1],
                z: this.state.positions[this.followBodyIndex * 3 + 2],
            };
        }
        return origin;
    }

    private getFollowTargetPosition(index: number): { x: number; y: number; z: number } {
        if (index >= 0 && index * 3 + 2 < this.state.positions.length) {
            return {
                x: this.state.positions[index * 3],
                y: this.state.positions[index * 3 + 1],
                z: this.state.positions[index * 3 + 2],
            };
        }
        return { x: 0, y: 0, z: 0 };
    }

    private pickBodyFromCenter(): number | null {
        const mouse = new THREE.Vector2(0, 0);
        this.raycaster.setFromCamera(mouse, this.camera);
        return this.bodyRenderer.pickBodyId(this.raycaster);
    }

    private findBodyIndexById(id: number): number | null {
        const bodies = this.physics.getBodies();
        const index = bodies.findIndex((body) => body.id === id);
        return index >= 0 ? index : null;
    }

    private switchToFollowBody(index: number): void {
        const cameraWorld = this.camera.getCameraWorldPosition();
        const target = this.getFollowTargetPosition(index);
        const offset = {
            x: cameraWorld.x - target.x,
            y: cameraWorld.y - target.y,
            z: cameraWorld.z - target.z,
        };

        this.freeCamera = false;
        this.camera.setFreeMode(false);
        this.camera.setOrbitFromOffset(offset);
        this.followBodyIndex = index;
        this.lastFollowBodyIndex = index;
        this.setFreeCamUI(false);
        this.updateFollowUI();
    }

    private setMoveKey(code: string, pressed: boolean): boolean {
        if (code in this.moveKeys) {
            this.moveKeys[code] = pressed;
            return true;
        }
        return false;
    }

    private toggleHints(): void {
        this.hintsVisible = !this.hintsVisible;
        const panel = document.getElementById('hints-panel');
        if (panel) {
            panel.style.display = this.hintsVisible ? 'block' : 'none';
        }
    }

    private syncTimeScaleToServer(): void {
        if (!this.network?.isConnected()) return;
        const simRate = this.timeController.getCurrentSpeed().sim;
        this.network.sendTimeScale(simRate);
    }

    private followNextBody(): void {
        const bodyCount = this.physics.bodyCount();
        if (bodyCount === 0) return;

        this.followBodyIndex++;
        if (this.followBodyIndex >= bodyCount) {
            this.followBodyIndex = -1; // Back to origin
        }
        this.updateFollowUI();
    }

    private followPreviousBody(): void {
        const bodyCount = this.physics.bodyCount();
        if (bodyCount === 0) return;

        this.followBodyIndex--;
        if (this.followBodyIndex < -1) {
            this.followBodyIndex = bodyCount - 1; // Wrap to last body
        }
        this.updateFollowUI();
    }

    private updateFollowUI(): void {
        if (this.freeCamera) {
            const el = document.getElementById('follow-target');
            if (el) el.textContent = 'Free';
            return;
        }
        const bodies = this.physics.getBodies();
        let followName = 'Origin';
        if (this.followBodyIndex >= 0 && this.followBodyIndex < bodies.length) {
            followName = bodies[this.followBodyIndex].name;
        }
        const el = document.getElementById('follow-target');
        if (el) el.textContent = followName;
    }

    private updateTimeScaleUI(): void {
        const scaleEl = document.getElementById('time-warp');
        if (scaleEl) {
            scaleEl.textContent = this.timeController.getDisplayLabel();
        }
    }

    private createStarfield(): void {
        const starsGeometry = new THREE.BufferGeometry();
        const starCount = 10000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            // Random position on sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 5e14; // 500 AU

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Random color (slightly blue-shifted for realism)
            const temp = Math.random();
            if (temp > 0.9) {
                // Hot blue star
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.8;
                colors[i * 3 + 2] = 1.0;
            } else if (temp > 0.7) {
                // White star
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 1.0;
                colors[i * 3 + 2] = 1.0;
            } else {
                // Yellow/orange star
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.9;
                colors[i * 3 + 2] = 0.7;
            }

            sizes[i] = Math.random() * 2 + 0.5;
        }

        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const starsMaterial = new THREE.PointsMaterial({
            size: 1e12,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    private onResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    private start(): void {
        this.running = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    private animate = (): void => {
        if (!this.running) return;

        requestAnimationFrame(this.animate);

        const now = performance.now();
        const delta = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        // Update FPS counter
        const fps = 1 / delta;
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > 60) this.fpsHistory.shift();

        const useServerState = this.network?.isConnected() && this.lastServerState;

        if (useServerState) {
            this.state.tick = this.lastServerState!.tick;
            this.state.time = this.lastServerState!.time;
            this.state.positions = this.lastServerPositions;
            this.state.energy = this.lastServerState!.energy;
            this.state.bodyCount = Math.floor(this.lastServerPositions.length / 3);
        } else {
            // Step physics using TimeController's accumulator pattern
            // This ensures deterministic simulation at any framerate
            const steps = this.timeController.update(delta);
            for (let i = 0; i < steps; i++) {
                this.physics.step();
            }

            // Update state from physics
            this.state.tick = this.physics.tick();
            this.state.time = this.physics.time();
            this.state.positions = this.physics.getPositions();
            this.state.energy = this.physics.totalEnergy();
        }

        // Update camera
        this.camera.update(delta);

        // Free camera movement (WASD + Space/Shift)
        if (this.freeCamera) {
            const direction = new THREE.Vector3();
            this.camera.getWorldDirection(direction);

            // Project forward to orbital plane (XZ)
            const forward = new THREE.Vector3(direction.x, 0, direction.z);
            if (forward.lengthSq() < 1e-6) {
                forward.set(0, 0, 1);
            } else {
                forward.normalize();
            }

            const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

            const speed = this.freeCamSpeedAuPerSec * AU;
            const step = speed * delta;

            const move = new THREE.Vector3(0, 0, 0);
            if (this.moveKeys.KeyW) move.add(forward);
            if (this.moveKeys.KeyS) move.sub(forward);
            if (this.moveKeys.KeyD) move.add(right);
            if (this.moveKeys.KeyA) move.sub(right);
            if (this.moveKeys.Space) move.y += 1;
            if (this.moveKeys.ShiftLeft || this.moveKeys.ShiftRight) move.y -= 1;

            if (move.lengthSq() > 0) {
                move.normalize().multiplyScalar(step);
                this.camera.moveFree(move.x, move.y, move.z);
            }
        }

        // Calculate camera origin based on followed body
        const cameraOrigin = this.resolveCameraOrigin(!this.freeCamera);

        // Update body positions with floating origin
        this.bodyRenderer.update(this.state.positions, cameraOrigin);

        // Render
        this.renderer.render(this.scene, this.camera);

        // Update UI
        this.updateUI();
    };

    private updateUI(): void {
        document.getElementById('sim-time')!.textContent = this.formatTime(this.state.time);
        document.getElementById('sim-tick')!.textContent = this.state.tick.toLocaleString();
        document.getElementById('sim-energy')!.textContent = this.formatEnergy(this.state.energy);
        document.getElementById('sim-bodies')!.textContent = this.state.bodyCount.toString();

        const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        document.getElementById('render-fps')!.textContent = avgFps.toFixed(0);

        const cameraDist = this.camera.getDistance();
        document.getElementById('camera-dist')!.textContent = (cameraDist / AU).toFixed(3) + ' AU';

        const coord = this.getReferenceCoords();
        document.getElementById('sim-x')!.textContent = (coord.x / AU).toFixed(3) + ' AU';
        document.getElementById('sim-y')!.textContent = (coord.y / AU).toFixed(3) + ' AU';
        document.getElementById('sim-z')!.textContent = (coord.z / AU).toFixed(3) + ' AU';
    }

    private getReferenceCoords(): { x: number; y: number; z: number } {
        if (this.freeCamera) {
            return this.camera.getCameraWorldPosition();
        }
        if (this.followBodyIndex >= 0 && this.followBodyIndex * 3 + 2 < this.state.positions.length) {
            return {
                x: this.state.positions[this.followBodyIndex * 3],
                y: this.state.positions[this.followBodyIndex * 3 + 1],
                z: this.state.positions[this.followBodyIndex * 3 + 2],
            };
        }
        return { x: 0, y: 0, z: 0 };
    }

    private updateUIBodyCount(): void {
        document.getElementById('sim-bodies')!.textContent = this.state.bodyCount.toString();
    }

    private formatTime(seconds: number): string {
        if (seconds < 60) return seconds.toFixed(2) + ' s';
        if (seconds < 3600) return (seconds / 60).toFixed(2) + ' min';
        if (seconds < 86400) return (seconds / 3600).toFixed(2) + ' hr';
        if (seconds < 31536000) return (seconds / 86400).toFixed(2) + ' days';
        return (seconds / 31536000).toFixed(4) + ' years';
    }

    private formatEnergy(joules: number): string {
        const abs = Math.abs(joules);
        if (abs < 1e3) return joules.toFixed(2) + ' J';
        if (abs < 1e6) return (joules / 1e3).toFixed(2) + ' kJ';
        if (abs < 1e9) return (joules / 1e6).toFixed(2) + ' MJ';
        if (abs < 1e12) return (joules / 1e9).toFixed(2) + ' GJ';
        return joules.toExponential(3) + ' J';
    }

    private updateLoadingStatus(status: string): void {
        const el = document.getElementById('loading-status');
        if (el) el.textContent = status;
    }

    private hideLoading(): void {
        const loading = document.getElementById('loading');
        if (loading) loading.classList.add('hidden');
    }

    /** Expose for testing */
    getPhysics() { return this.physics; }
    getTimeController() { return this.timeController; }
}

// Start application
const client = new NBodyClient();
client.init().then(() => {
    // Expose for browser console testing
    (window as any).physics = client.getPhysics();
    (window as any).timeController = client.getTimeController();
    console.log('🧪 Test mode: window.physics and window.timeController available');
    console.log('   Run: import("./src/time-tests.ts").then(t => t.runAllTests(physics, timeController))');
}).catch(console.error);
