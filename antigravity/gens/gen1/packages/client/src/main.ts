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
import { NetworkClient } from './network';
import { PhysicsClient } from './physics';
import { WorldBuilder } from './world-builder';
import { Chat } from './chat';
import { AdminPanel } from './admin-panel';
import { VisualizationPanel, VisualizationOptions } from './visualization-panel';

// Physical constants (SI units)
const AU = 1.495978707e11; // meters

interface SimState {
    tick: number;
    time: number;
    positions: Float64Array;
    energy: number;
    bodyCount: number;
}

// Time warp multipliers
const TIME_WARPS = [1, 10, 100, 1000, 10000, 100000, 1000000];

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

    // Time warp
    private timeWarpIndex = 0; // Start at 1x (was 3 = 1000x which caused instability)
    private paused = false;
    private uiHidden = false;

    // Body following
    private followBodyIndex = -1; // -1 = follow origin, 0+ = body index

    async init(): Promise<void> {
        this.updateLoadingStatus('Initializing renderer...');
        this.initRenderer();

        this.updateLoadingStatus('Loading physics engine...');
        await this.initPhysics();

        this.updateLoadingStatus('Setting up controls...');
        this.initControls();

        // Initialize Chat
        this.chat = new Chat();

        // Initialize Admin Panel
        this.adminPanel = new AdminPanel(this.physics);

        // Initialize Visualization Panel
        this.vizPanel = new VisualizationPanel((options: VisualizationOptions) => {
            this.bodyRenderer.setShowOrbitTrails(options.showOrbitTrails);
            this.bodyRenderer.setShowVelocityVectors(options.showVelocityVectors);
            this.bodyRenderer.setShowLabels(options.showLabels);
            this.bodyRenderer.setVectorScale(options.vectorScale);
            this.bodyRenderer.setMaxTrailPoints(options.orbitTrailLength);
            this.bodyRenderer.setBodyScale(options.bodyScale);
            this.bodyRenderer.setRealScale(options.realScale);
        });

        this.hideLoading();
        this.start();
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

        // Use local simulation for now
        this.physics.createSunEarthMoon();

        // Set physics timestep - use smaller step for stable moon orbit
        // Moon orbit is ~27 days, need many steps per orbit for stability
        // 60s per step = 1440 steps per day = ~39,000 steps per lunar orbit
        this.physics.setTimeStep(60); // 1 minute per physics step (was 3600 = 1 hour)

        this.state.bodyCount = this.physics.bodyCount();
        this.updateUIBodyCount();

        // Initialize body meshes
        this.refreshBodies();

        // Initialize World Builder
        this.worldBuilder = new WorldBuilder(this.physics, () => this.refreshBodies());
    }

    private refreshBodies(): void {
        // Clear existing bodies from renderer
        this.bodyRenderer.dispose();
        this.bodyRenderer = new BodyRenderer(this.scene);

        // Add all bodies from physics
        const bodies = this.physics.getBodies();
        const positions = this.physics.getPositions();

        console.log('🔍 Body positions:');
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            const x = positions[i * 3];
            const y = positions[i * 3 + 1];
            const z = positions[i * 3 + 2];
            console.log(`  ${body.name}: (${(x / 1.496e11).toFixed(4)} AU, ${(y / 1.496e11).toFixed(4)} AU, ${(z / 1.496e11).toFixed(4)} AU)`);
            this.bodyRenderer.addBody(body);
        }

        this.state.bodyCount = this.physics.bodyCount();
        this.updateUIBodyCount();
    }

    private initControls(): void {
        window.addEventListener('keydown', (e) => {
            // Skip if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case ' ':
                    this.paused = !this.paused;
                    this.updateTimeWarpUI();
                    break;
                case '.':
                case '>':
                    if (this.timeWarpIndex < TIME_WARPS.length - 1) {
                        this.timeWarpIndex++;
                        this.updateTimeWarpUI();
                    }
                    break;
                case ',':
                case '<':
                    if (this.timeWarpIndex > 0) {
                        this.timeWarpIndex--;
                        this.updateTimeWarpUI();
                    }
                    break;
                case '1':
                    this.timeWarpIndex = 0;
                    this.updateTimeWarpUI();
                    break;
                case '2':
                    this.timeWarpIndex = 2;
                    this.updateTimeWarpUI();
                    break;
                case '3':
                    this.timeWarpIndex = 4;
                    this.updateTimeWarpUI();
                    break;
                case '4':
                    this.timeWarpIndex = 6;
                    this.updateTimeWarpUI();
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
            }
        });

        this.updateTimeWarpUI();
    }

    private toggleUIVisibility(): void {
        this.uiHidden = !this.uiHidden;
        const uiElements = document.querySelectorAll('#stats-overlay, #chat-panel, #world-builder, #admin-panel, #viz-panel');
        uiElements.forEach(el => {
            (el as HTMLElement).style.display = this.uiHidden ? 'none' : '';
        });
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
        const bodies = this.physics.getBodies();
        let followName = 'Origin';
        if (this.followBodyIndex >= 0 && this.followBodyIndex < bodies.length) {
            followName = bodies[this.followBodyIndex].name;
        }
        const el = document.getElementById('follow-target');
        if (el) el.textContent = followName;
    }

    private updateTimeWarpUI(): void {
        const warp = TIME_WARPS[this.timeWarpIndex];
        const warpEl = document.getElementById('time-warp');
        if (warpEl) {
            if (this.paused) {
                warpEl.textContent = '⏸ PAUSED';
            } else if (warp >= 1000000) {
                warpEl.textContent = `${(warp / 1000000).toFixed(0)}M×`;
            } else if (warp >= 1000) {
                warpEl.textContent = `${(warp / 1000).toFixed(0)}K×`;
            } else {
                warpEl.textContent = `${warp}×`;
            }
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

        // Step local physics simulation with time warp
        if (!this.paused) {
            const warp = TIME_WARPS[this.timeWarpIndex];
            // Step multiple times based on warp
            const stepsPerFrame = Math.min(warp, 100); // Cap at 100 steps per frame
            for (let i = 0; i < stepsPerFrame; i++) {
                this.physics.step();
            }
        }

        // Update state from physics
        this.state.tick = this.physics.tick();
        this.state.time = this.physics.time();
        this.state.positions = this.physics.getPositions();
        this.state.energy = this.physics.totalEnergy();

        // Update camera
        this.camera.update(delta);

        // Calculate camera origin based on followed body
        let cameraOrigin = this.camera.getWorldOrigin();
        if (this.followBodyIndex >= 0 && this.followBodyIndex * 3 + 2 < this.state.positions.length) {
            // Center on followed body
            cameraOrigin = {
                x: this.state.positions[this.followBodyIndex * 3],
                y: this.state.positions[this.followBodyIndex * 3 + 1],
                z: this.state.positions[this.followBodyIndex * 3 + 2],
            };
        }

        // Update body positions with floating origin
        this.bodyRenderer.update(this.state.positions, cameraOrigin);

        // Update velocity vectors (if enabled)
        const velocities = this.physics.getVelocities();
        this.bodyRenderer.updateVelocityVectors(velocities, cameraOrigin);

        // Render
        this.renderer.render(this.scene, this.camera);

        // Update UI
        this.updateUI();
    };

    private updateUI(): void {
        document.getElementById('sim-time')!.textContent = this.formatTime(this.state.time);
        document.getElementById('sim-tick')!.textContent = this.state.tick.toLocaleString();
        document.getElementById('sim-energy')!.textContent = this.formatEnergy(this.state.energy);

        const avgFps = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        document.getElementById('render-fps')!.textContent = avgFps.toFixed(0);

        const cameraDist = this.camera.getDistance();
        document.getElementById('camera-dist')!.textContent = (cameraDist / AU).toFixed(3) + ' AU';
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
}

// Start application
const client = new NBodyClient();
client.init().catch(console.error);
