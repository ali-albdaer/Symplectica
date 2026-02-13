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
import { AdminStatePayload, NetworkClient } from './network';
import { PhysicsClient } from './physics';
import { Chat } from './chat';
import { AdminPanel } from './admin-panel';
import { OptionsPanel, VisualizationOptions, VisualizationPresetName } from './options-panel';
import { TimeController } from './time-controller';
import { getWebSocketUrl } from './config';
import { VisualPresetRegistry, VisualPresetsFile } from './visual-preset-registry';
import visualPresets from './visualPresets.json';
import { registerVisualPresetFeatures } from './visual-preset-features';
import { SkyRenderer } from './sky-renderer';

// Physical constants (SI units)
const AU = 1.495978707e11; // meters
const LOCAL_TICK_RATE = 60;
const LOCAL_PRESET_PLAYER = 'local';

type SimMode = 'tick' | 'accumulator';

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
    private chat!: Chat;
    private adminPanel!: AdminPanel;
    private optionsPanel!: OptionsPanel;

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
    private localTickAccumulator = 0;
    private localSimMode: SimMode = 'tick';

    private lastServerState?: NetworkStatePayload;
    private lastServerPositions = new Float64Array(0);

    // Track visualization options to restore after body refresh
    private currentVizOptions: VisualizationOptions = {
        showOrbitTrails: true,
        showLabels: false,
        showAxisLines: false,
        showRefPlane: false,
        showRefLine: false,
        showRefPoint: false,
        showGridXY: false,
        showGridXZ: false,
        showGridYZ: false,
        gridSpacing: 1.495978707e11,
        gridSize: 40,
        orbitTrailLength: 100,
    };

    // Time control (centralized)
    private timeController = new TimeController();
    private uiHidden = false;
    private hintsVisible = true;
    private showSimulationParams = false;
    private showFollowingDetails = true;

    // Body following
    private followBodyIndex = -1; // -1 = follow origin, 0+ = body index
    private lastFollowBodyIndex = -1;

    // Free camera mode
    private freeCamera = false;
    private freeCamSpeedAuPerSec = 0.1;
    private freeCamCrosshair: HTMLElement | null = null;
    private raycaster = new THREE.Raycaster();
    private skyRenderer!: SkyRenderer;
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
        VisualPresetRegistry.loadPresets(visualPresets as VisualPresetsFile);
        VisualPresetRegistry.setDefaultPreset('Ultra');
        registerVisualPresetFeatures();
        VisualPresetRegistry.registerFeature('bodyRenderer', {});
        VisualPresetRegistry.registerFeatureHooks('bodyRenderer', {
            defaultParams: { renderScale: 1 },
            applyPreset: (featureParams, presetParams) => ({
                ...featureParams,
                renderScale: presetParams.renderScale,
            }),
        });
        VisualPresetRegistry.subscribe(LOCAL_PRESET_PLAYER, () => {
            this.applyPresetToRenderer();
        });

        this.updateLoadingStatus('Initializing renderer...');
        this.initRenderer();
        this.applyPresetToRenderer();

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
            this.ensureLocalPreset('Ultra');
        }

        // Initialize Admin Panel
        this.adminPanel = new AdminPanel(
            this.physics,
            this.timeController,
            this.network,
            (presetId, name) => {
                this.loadPresetFromAdmin(presetId, name);
            },
            (mode) => {
                this.setLocalSimMode(mode);
            }
        );

        // Initialize Options Panel
        this.optionsPanel = new OptionsPanel(
            (options: VisualizationOptions) => {
                this.currentVizOptions = { ...options };
                this.applyVisualizationToRenderer(options);
            },
            (preset: VisualizationPresetName) => {
                VisualPresetRegistry.setPlayerPreset(LOCAL_PRESET_PLAYER, preset);
                const current = VisualPresetRegistry.getPresetForPlayer(LOCAL_PRESET_PLAYER);
                this.optionsPanel?.setPresetRenderScale(current.renderScale);
            },
            (preset: VisualizationPresetName, patch: { renderScale?: number }) => {
                VisualPresetRegistry.updatePreset(preset, patch);
            },
            (speed) => {
                this.freeCamSpeedAuPerSec = speed;
                // Save preference?
            },
            (sensitivity) => {
                this.camera.setFreeLookSensitivity(sensitivity);
            },
            VisualPresetRegistry.getPresetNameForPlayer(LOCAL_PRESET_PLAYER)
        );
        this.optionsPanel.setPresetRenderScale(
            VisualPresetRegistry.getPresetForPlayer(LOCAL_PRESET_PLAYER).renderScale
        );

        this.hideLoading();
        this.start();
    }

    private async initNetwork(): Promise<void> {
        this.network = new NetworkClient(getWebSocketUrl());
    }

    private setupNetworkHandlers(): void {
        this.network.on('welcome', (message) => {
            const payload = message.payload as { snapshot: string; players?: string[]; displayName?: string; config?: { adminState?: AdminStatePayload; visualPresetDefault?: VisualizationPresetName } };
            if (payload?.snapshot) {
                this.applySnapshot(payload.snapshot);
            }
            if (payload?.displayName) {
                this.chat.setLocalName(payload.displayName);
            }
            if (payload?.players) {
                this.chat.setPlayersList(payload.players);
            }
            if (payload?.config?.adminState) {
                this.applyAdminState(payload.config.adminState);
            }
            if (payload?.config?.visualPresetDefault) {
                this.ensureLocalPreset(payload.config.visualPresetDefault);
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

    }

    private applyAdminState(settings: AdminStatePayload): void {
        this.physics.setTimeStep(settings.dt);
        this.timeController.setPhysicsTimestep(settings.dt);
        this.timeController.setSpeedBySimRate(settings.timeScale);
        this.timeController.setPaused(settings.paused);
        this.setLocalSimMode(settings.simMode);
        this.updateTimeScaleUI();
        this.adminPanel?.applyServerSettings(settings);
    }

    private applyVisualizationToRenderer(options: VisualizationOptions): void {
        this.bodyRenderer.setShowOrbitTrails(options.showOrbitTrails);
        this.bodyRenderer.setShowLabels(options.showLabels);
        this.bodyRenderer.setShowAxisLines(options.showAxisLines);
        this.bodyRenderer.setShowRefPlane(options.showRefPlane);
        this.bodyRenderer.setShowRefLine(options.showRefLine);
        this.bodyRenderer.setShowRefPoint(options.showRefPoint);
        this.bodyRenderer.setMaxTrailPoints(options.orbitTrailLength);
        this.bodyRenderer.setGridOptions(
            options.showGridXY,
            options.showGridXZ,
            options.showGridYZ,
            options.gridSpacing,
            options.gridSize
        );
    }

    private applyPresetToRenderer(): void {
        const params = VisualPresetRegistry.resolveFeatureParams(LOCAL_PRESET_PLAYER, 'bodyRenderer') as {
            renderScale?: number;
        };
        if (typeof params.renderScale === 'number') {
            this.bodyRenderer.setRenderScale(params.renderScale);
        }

        const planetParams = VisualPresetRegistry.resolveFeatureParams(LOCAL_PRESET_PLAYER, 'planetRenderer') as {
            lodBias?: number;
        };
        const lodBias = typeof planetParams.lodBias === 'number' ? planetParams.lodBias : 0;
        const segmentScale = Math.max(0.5, Math.min(2, 1 - lodBias));
        this.bodyRenderer.setSphereSegments(64 * segmentScale, 32 * segmentScale);

        const starParams = VisualPresetRegistry.resolveFeatureParams(LOCAL_PRESET_PLAYER, 'starRenderer') as {
            starCount?: number;
            starSize?: number;
            starOpacity?: number;
            granulationEnabled?: boolean;
            flareQuality?: 'Off' | 'Low' | 'High';
        };
        this.skyRenderer.setOptions({
            starCount: starParams.starCount,
            starSize: starParams.starSize,
            opacity: starParams.starOpacity,
        });

        const spotStrengthScale = starParams.flareQuality === 'High'
            ? 1.0
            : starParams.flareQuality === 'Low'
                ? 0.45
                : 0.0;

        this.bodyRenderer.setStarRenderOptions({
            granulationEnabled: typeof starParams.granulationEnabled === 'boolean'
                ? starParams.granulationEnabled
                : true,
            spotStrengthScale,
        });
    }

    private ensureLocalPreset(preset: VisualizationPresetName): void {
        if (VisualPresetRegistry.hasPlayerPreset(LOCAL_PRESET_PLAYER)) return;
        VisualPresetRegistry.setDefaultPreset(preset);
        VisualPresetRegistry.setPlayerPreset(LOCAL_PRESET_PLAYER, preset);
        this.optionsPanel?.setPreset(preset);
        this.optionsPanel?.setPresetRenderScale(
            VisualPresetRegistry.getPresetForPlayer(LOCAL_PRESET_PLAYER).renderScale
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
        this.camera.setDistance(0.020 * AU); // Start at 0.020 AU distance
        this.camera.setElevation(0.5); // Look down at system

        // Create body renderer
        this.bodyRenderer = new BodyRenderer(this.scene);

        // Add seeded starfield
        this.skyRenderer = new SkyRenderer(this.scene, { seed: 42 });
        this.skyRenderer.generate();

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
        this.applyPresetToRenderer();

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
        this.updateFollowUI();
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
                // Space keybind removed (moved to Pause button in Admin Panel)
                case '1':
                    this.toggleSimulationSection('sim');
                    break;
                case '2':
                    this.toggleSimulationSection('follow');
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
                    this.followPreviousBody();
                    break;
                case 'h':
                case 'H':
                    this.toggleUIVisibility();
                    break;
                case 'k':
                case 'K':
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

        this.updateSimulationSections();
        this.updateTimeScaleUI();
    }

    private toggleUIVisibility(): void {
        this.uiHidden = !this.uiHidden;
        // Include ALL UI elements including stats-overlay (Simulation panel)
        const uiElements = document.querySelectorAll('#ui-overlay, #chat-panel, #admin-panel, #opt-panel');
        uiElements.forEach(el => {
            (el as HTMLElement).style.display = this.uiHidden ? 'none' : '';
        });
    }

    private toggleSimulationSection(section: 'sim' | 'follow'): void {
        if (section === 'sim') {
            this.showSimulationParams = !this.showSimulationParams;
        } else {
            this.showFollowingDetails = !this.showFollowingDetails;
        }
        this.updateSimulationSections();
    }

    private updateSimulationSections(): void {
        const simSection = document.getElementById('sim-params-section');
        const followSection = document.getElementById('follow-section');
        if (simSection) {
            simSection.style.display = this.showSimulationParams ? 'block' : 'none';
        }
        if (followSection) {
            followSection.style.display = this.showFollowingDetails ? 'block' : 'none';
        }
    }

    private loadPresetFromAdmin(presetId: string, name: string): void {
        if (presetId === 'sunEarthMoon') {
            this.physics.createSunEarthMoon();
        } else {
            this.physics.createPreset(presetId, BigInt(Date.now()));
        }

        this.refreshBodies();
        this.timeController.resetAccumulator();

        if (this.network?.isConnected()) {
            const snapshot = this.physics.getSnapshot();
            this.network.sendSnapshot(snapshot, name);
        }
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
        const setText = (id: string, text: string) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        };
        const showRow = (id: string, visible: boolean) => {
            const el = document.getElementById(id);
            if (el) el.style.display = visible ? 'flex' : 'none';
        };
        const showGroup = (id: string, visible: boolean) => {
            const el = document.getElementById(id);
            if (el) el.style.display = visible ? 'block' : 'none';
        };

        // Helper: clear all detail rows
        const clearDetails = () => {
            for (const id of [
                'follow-type', 'follow-mass', 'follow-radius', 'follow-density',
                'follow-gravity', 'follow-vesc', 'follow-rotation', 'follow-tilt',
                'follow-oblateness', 'follow-spectral', 'follow-composition',
                'follow-sma', 'follow-ecc', 'follow-albedo',
                'follow-teff', 'follow-tsurf', 'follow-teq',
                'follow-luminosity', 'follow-metallicity', 'follow-age', 'follow-lifetime',
                'follow-flare', 'follow-spot', 'follow-scaleheight', 'follow-atmheight',
            ]) {
                setText(id, '—');
            }
            // Hide conditional rows/groups
            for (const id of [
                'follow-row-spectral', 'follow-row-composition',
                'follow-row-rotation', 'follow-row-tilt', 'follow-row-oblateness',
                'follow-row-tsurf', 'follow-row-teq', 'follow-row-atm',
            ]) {
                showRow(id, false);
            }
            for (const id of ['follow-grp-orbital', 'follow-grp-thermal', 'follow-grp-star', 'follow-grp-planet']) {
                showGroup(id, false);
            }
        };

        if (this.freeCamera) {
            setText('follow-target', 'Free');
            setText('follow-type', 'Camera');
            clearDetails();
            return;
        }

        const bodies = this.physics.getBodies();
        if (this.followBodyIndex < 0 || this.followBodyIndex >= bodies.length) {
            setText('follow-target', 'Origin');
            clearDetails();
            return;
        }

        const body = bodies[this.followBodyIndex];
        const isStar = body.type === 'star';
        const isPlanetOrMoon = body.type === 'planet' || body.type === 'moon';
        const AU = 1.495978707e11;
        const L_SUN = 3.828e26;
        const M_SUN = 1.98892e30;

        setText('follow-target', body.name);
        setText('follow-type', this.formatBodyType(body.type));
        setText('follow-mass', this.formatMass(body.mass));
        setText('follow-radius', this.formatRadius(body.radius));

        // Density
        if (body.mass > 0 && body.radius > 0) {
            const vol = (4 / 3) * Math.PI * body.radius ** 3;
            const density = body.mass / vol;
            setText('follow-density', density.toFixed(0) + ' kg/m³');
        }

        // Surface gravity
        const G = 6.6743e-11;
        if (body.mass > 0 && body.radius > 0) {
            const g = G * body.mass / (body.radius * body.radius);
            setText('follow-gravity', g < 100 ? g.toFixed(2) + ' m/s²' : g.toExponential(2) + ' m/s²');
        }

        // Escape velocity
        if (body.mass > 0 && body.radius > 0) {
            const vesc = Math.sqrt(2 * G * body.mass / body.radius);
            setText('follow-vesc', vesc < 1e5 ? (vesc / 1e3).toFixed(1) + ' km/s' : vesc.toExponential(2) + ' m/s');
        }

        // Rotation period
        if (body.rotationRate !== 0) {
            showRow('follow-row-rotation', true);
            const period = Math.abs(2 * Math.PI / body.rotationRate);
            setText('follow-rotation', this.formatDuration(period) + (body.rotationRate < 0 ? ' (retro)' : ''));
        }

        // Axial tilt
        if (body.axialTilt !== 0) {
            showRow('follow-row-tilt', true);
            setText('follow-tilt', (body.axialTilt * 180 / Math.PI).toFixed(2) + '°');
        }

        // Oblateness
        if (body.oblateness > 0.0001) {
            showRow('follow-row-oblateness', true);
            setText('follow-oblateness', body.oblateness.toFixed(4));
        }

        // Spectral type (stars only)
        if (isStar && body.spectralType) {
            showRow('follow-row-spectral', true);
            setText('follow-spectral', body.spectralType);
        }

        // Composition (planets)
        if (isPlanetOrMoon && body.composition) {
            showRow('follow-row-composition', true);
            const compLabels: Record<string, string> = {
                'Rocky': 'Rocky', 'GasGiant': 'Gas Giant',
                'IceGiant': 'Ice Giant', 'Dwarf': 'Dwarf',
            };
            setText('follow-composition', compLabels[body.composition] || body.composition);
        }

        // Orbital group
        if (body.semiMajorAxis > 0) {
            showGroup('follow-grp-orbital', true);
            const smaAU = body.semiMajorAxis / AU;
            setText('follow-sma', smaAU >= 0.01 ? smaAU.toFixed(4) + ' AU' : this.formatRadius(body.semiMajorAxis));
            setText('follow-ecc', body.eccentricity.toFixed(4));
            setText('follow-albedo', body.albedo > 0 ? body.albedo.toFixed(3) : '—');
        }

        // Thermal group
        const hasThermal = body.effectiveTemperature > 0 || body.meanSurfaceTemperature > 0 || body.equilibriumTemperature > 0;
        if (hasThermal) {
            showGroup('follow-grp-thermal', true);
            setText('follow-teff', body.effectiveTemperature > 0 ? Math.round(body.effectiveTemperature) + ' K' : '—');
            if (body.meanSurfaceTemperature > 0) {
                showRow('follow-row-tsurf', true);
                setText('follow-tsurf', Math.round(body.meanSurfaceTemperature) + ' K');
            }
            if (body.equilibriumTemperature > 0) {
                showRow('follow-row-teq', true);
                setText('follow-teq', Math.round(body.equilibriumTemperature) + ' K');
            }
        }

        // Star-specific group
        if (isStar) {
            showGroup('follow-grp-star', true);
            setText('follow-luminosity', body.luminosity > 0
                ? (body.luminosity / L_SUN).toFixed(4) + ' L☉'
                : '—');
            setText('follow-metallicity', '[Fe/H] = ' + (body.metallicity >= 0 ? '+' : '') + body.metallicity.toFixed(2));
            setText('follow-age', body.age > 0 ? this.formatAge(body.age) : '—');

            // Lifetime from BodyInfo — compute from mass/luminosity
            if (body.mass > 0 && body.luminosity > 0) {
                const lifetimeSec = 1e10 * 365.25 * 86400 * (M_SUN / body.mass) * (L_SUN / body.luminosity);
                setText('follow-lifetime', this.formatAge(lifetimeSec));
            }

            setText('follow-flare', body.flareRate > 0 ? body.flareRate.toExponential(1) + ' /s' : 'None');
            setText('follow-spot', (body.spotFraction * 100).toFixed(1) + '%');
        }

        // Planet/Moon atmosphere group
        if (isPlanetOrMoon) {
            showGroup('follow-grp-planet', true);
            setText('follow-scaleheight', body.scaleHeight > 0
                ? (body.scaleHeight / 1e3).toFixed(1) + ' km'
                : '—');
            if (body.atmosphere) {
                showRow('follow-row-atm', true);
                setText('follow-atmheight', (body.atmosphere.height / 1e3).toFixed(0) + ' km');
            }
        }
    }

    /** Format seconds as human-readable age (Myr/Gyr) */
    private formatAge(seconds: number): string {
        const years = seconds / (365.25 * 86400);
        if (years >= 1e9) return (years / 1e9).toFixed(2) + ' Gyr';
        if (years >= 1e6) return (years / 1e6).toFixed(0) + ' Myr';
        if (years >= 1e3) return (years / 1e3).toFixed(0) + ' kyr';
        return years.toFixed(0) + ' yr';
    }

    /** Format seconds as human-readable duration (hours/days) */
    private formatDuration(seconds: number): string {
        if (seconds < 3600) return seconds.toFixed(0) + ' s';
        if (seconds < 86400) return (seconds / 3600).toFixed(2) + ' hr';
        if (seconds < 86400 * 365.25) return (seconds / 86400).toFixed(2) + ' d';
        return (seconds / (86400 * 365.25)).toFixed(2) + ' yr';
    }

    private updateTimeScaleUI(): void {
        const scaleEl = document.getElementById('time-warp');
        if (scaleEl) {
            scaleEl.textContent = this.timeController.getDisplayLabel();
        }
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
            if (!this.timeController.isPaused()) {
                if (this.localSimMode === 'accumulator') {
                    const steps = this.timeController.update(delta);
                    for (let i = 0; i < steps; i++) {
                        this.physics.step();
                    }
                } else {
                    const tickInterval = 1 / LOCAL_TICK_RATE;
                    this.localTickAccumulator += delta;

                    let steps = 0;
                    const maxSteps = 1000;
                    while (this.localTickAccumulator >= tickInterval && steps < maxSteps) {
                        const simRate = this.timeController.getCurrentSpeed().sim;
                        const dt = simRate / LOCAL_TICK_RATE;
                        this.physics.setTimeStep(dt);
                        this.physics.step();
                        this.localTickAccumulator -= tickInterval;
                        steps++;
                    }

                    if (steps >= maxSteps) {
                        this.localTickAccumulator = 0;
                    }
                }
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

        // Update star rotations from simulation time
        this.bodyRenderer.updateBodies(this.state.time);

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

        const totals = this.computeSystemTotals();
        if (totals) {
            document.getElementById('sim-mass')!.textContent = this.formatMass(totals.mass);
            document.getElementById('sim-linear-momentum')!.textContent = this.formatMomentum(totals.linearMagnitude, 'kg·m/s');
            document.getElementById('sim-angular-momentum')!.textContent = this.formatMomentum(totals.angularMagnitude, 'kg·m²/s');
        }

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

    private formatMomentum(value: number, unit: string): string {
        if (!Number.isFinite(value)) return `0 ${unit}`;
        const abs = Math.abs(value);
        if (abs === 0) return `0 ${unit}`;
        if (abs < 1e6) return `${value.toFixed(2)} ${unit}`;
        return `${value.toExponential(3)} ${unit}`;
    }

    private computeSystemTotals(): { mass: number; linearMagnitude: number; angularMagnitude: number } | null {
        const bodies = this.physics.getBodies();
        const velocities = this.physics.getVelocities();
        const positions = this.state.positions;

        if (bodies.length === 0) return null;
        if (velocities.length < bodies.length * 3) return null;
        if (positions.length < bodies.length * 3) return null;

        let mass = 0;
        let px = 0;
        let py = 0;
        let pz = 0;
        let lx = 0;
        let ly = 0;
        let lz = 0;

        for (let i = 0; i < bodies.length; i++) {
            const bodyMass = bodies[i].mass;
            const vx = velocities[i * 3];
            const vy = velocities[i * 3 + 1];
            const vz = velocities[i * 3 + 2];
            const rx = positions[i * 3];
            const ry = positions[i * 3 + 1];
            const rz = positions[i * 3 + 2];

            const pxi = bodyMass * vx;
            const pyi = bodyMass * vy;
            const pzi = bodyMass * vz;

            px += pxi;
            py += pyi;
            pz += pzi;
            mass += bodyMass;

            lx += ry * pzi - rz * pyi;
            ly += rz * pxi - rx * pzi;
            lz += rx * pyi - ry * pxi;
        }

        const linearMagnitude = Math.sqrt(px * px + py * py + pz * pz);
        const angularMagnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);

        return { mass, linearMagnitude, angularMagnitude };
    }

    private setLocalSimMode(mode: SimMode): void {
        this.localSimMode = mode;
        this.localTickAccumulator = 0;
        this.timeController.resetAccumulator();
    }

    private formatMass(kg: number): string {
        const abs = Math.abs(kg);
        if (abs === 0) return '0 kg';
        if (abs < 1e6) return kg.toFixed(2) + ' kg';
        if (abs < 1e9) return (kg / 1e6).toFixed(2) + ' t';
        if (abs < 1e12) return (kg / 1e9).toFixed(2) + ' Mt';
        if (abs < 1e15) return (kg / 1e12).toFixed(2) + ' Gt';
        return kg.toExponential(3) + ' kg';
    }

    private formatRadius(meters: number): string {
        const abs = Math.abs(meters);
        if (abs < 1e3) return meters.toFixed(0) + ' m';
        if (abs < 1e6) return (meters / 1e3).toFixed(1) + ' km';
        if (abs < 1e9) return (meters / 1e6).toFixed(1) + ' Mm';
        return (meters / 1e9).toFixed(2) + ' Gm';
    }

    private formatBodyType(type: string): string {
        return type.charAt(0).toUpperCase() + type.slice(1);
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

    showError(message: string): void {
        const el = document.getElementById('loading-status');
        const spinner = document.querySelector('.spinner');
        if (el) {
            el.textContent = message;
            el.classList.add('error');
        }
        if (spinner) {
            (spinner as HTMLElement).style.display = 'none';
        }
    }
}

// Start application
const client = new NBodyClient();
client.init().then(() => {
    // Expose for browser console testing
    (window as any).physics = client.getPhysics();
    (window as any).timeController = client.getTimeController();
    console.log('Space Simulator client initialized');
}).catch((error) => {
    console.error('Fatal initialization error:', error);
    client.showError(`Failed to initialize: ${error.message || 'Unknown error'}`);
});
