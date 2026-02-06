/**
 * Main application class. Orchestrates renderer, physics, networking, and UI.
 */

import {
  type Body,
  type SimulationState,
  type StepResult,
  type Vec3,
  vec3,
  G,
  SOLAR_MASS,
  EARTH_MASS,
  EARTH_RADIUS,
  AU,
  SOLAR_LUMINOSITY,
  BodyType,
  SolverType,
  IntegratorType,
} from '@solar-sim/shared';
import {
  type ServerMessage,
  ServerMessageType,
  ClientMessageType,
  PROTOCOL_VERSION,
  decodePositions,
} from '@solar-sim/shared';
import { Renderer } from './rendering/renderer.js';
import { CameraController } from './camera/camera-controller.js';
import { NetworkClient } from './networking/client.js';
import { initWasm, isWasmReady, WasmSimulation } from './wasm/wasm-bridge.js';
import { WorldBuilder } from './ui/world-builder.js';
import { Onboarding } from './ui/onboarding.js';

export class App {
  private renderer!: Renderer;
  private camera!: CameraController;
  private network!: NetworkClient;

  // Local simulation state (from server snapshots + interpolation)
  private state: SimulationState | null = null;
  private latestPositions: Float64Array | null = null;
  private latestTick = 0;

  // WASM physics engine for offline mode
  private wasmSim: WasmSimulation | null = null;
  private useWasm = false;

  // HUD elements
  private hudTick!: HTMLElement;
  private hudTime!: HTMLElement;
  private hudBodies!: HTMLElement;
  private hudFps!: HTMLElement;
  private hudConnection!: HTMLElement;
  private diagEnergy!: HTMLElement;
  private diagMomentum!: HTMLElement;
  private diagSolver!: HTMLElement;
  private diagDt!: HTMLElement;

  // FPS tracking
  private frameCount = 0;
  private lastFpsUpdate = 0;
  private fps = 0;

  // Local offline physics for standalone mode
  private offlineMode = false;
  private offlineBodies: Body[] = [];

  // Selected body
  private selectedBodyId: number | null = null;

  async init(): Promise<void> {
    // Grab HUD elements
    this.hudTick = document.getElementById('hud-tick')!;
    this.hudTime = document.getElementById('hud-time')!;
    this.hudBodies = document.getElementById('hud-bodies')!;
    this.hudFps = document.getElementById('hud-fps')!;
    this.hudConnection = document.getElementById('hud-connection')!;
    this.diagEnergy = document.getElementById('diag-energy')!;
    this.diagMomentum = document.getElementById('diag-momentum')!;
    this.diagSolver = document.getElementById('diag-solver')!;
    this.diagDt = document.getElementById('diag-dt')!;

    // Try loading WASM physics engine
    this.useWasm = await initWasm();
    console.log(`[App] WASM physics: ${this.useWasm ? 'available' : 'unavailable (TS fallback)'}`);

    // Initialize renderer
    const container = document.getElementById('canvas-container')!;
    this.renderer = new Renderer(container);

    // Initialize camera
    this.camera = new CameraController(this.renderer.camera, container);

    // Try to connect to server
    this.network = new NetworkClient();
    this.network.onSnapshot = (snapshot) => this.handleSnapshot(snapshot);
    this.network.onPositionUpdate = (tick, positions) => this.handlePositionUpdate(tick, positions);
    this.network.onStepResult = (result) => this.handleStepResult(result);
    this.network.onDelta = (delta) => this.handleDelta(delta);
    this.network.onReconcile = (serverState, pending) => {
      // Server correction: set authoritative state and replay unacked inputs
      this.state = serverState;
      this.offlineBodies = serverState.bodies;
      this.renderer.updateBodies(serverState.bodies);

      // Replay unacknowledged inputs on top of server state
      for (const input of pending) {
        this.applyInputLocally(input.action);
      }
      console.log(`[Reconcile] Server tick ${serverState.config.tick}, replayed ${pending.length} inputs`);
    };
    this.network.onEvent = (event) => {
      // Handle simulation events (body added/removed, collision, etc.)
      if (event.type === 'body_added' && event.data?.body) {
        if (this.state && !this.state.bodies.find((b: Body) => b.id === event.data.body.id)) {
          this.state.bodies.push(event.data.body as Body);
          this.renderer.updateBodies(this.state.bodies);
          this.updateBodyList(this.state.bodies);
        }
        this.showToast(`Body added: ${(event.data.body as Body).name}`);
      } else if (event.type === 'body_removed' && event.data?.body_id != null) {
        if (this.state) {
          this.state.bodies = this.state.bodies.filter((b: Body) => b.id !== event.data.body_id);
          this.renderer.updateBodies(this.state.bodies);
          this.updateBodyList(this.state.bodies);
        }
        this.showToast(`Body removed: #${event.data.body_id}`);
      } else if (event.type === 'collision') {
        this.showToast(`Collision detected at tick ${event.tick}`, 'warn');
      }
    };
    this.network.onError = (code, message) => {
      this.showToast(`Server error: ${message}`, 'error');
    };
    this.network.onConnectionChange = (connected) => {
      this.hudConnection.textContent = connected ? 'Online' : 'Offline';
      this.hudConnection.style.color = connected ? '#4CAF50' : '';
      if (!connected) {
        this.startOfflineMode();
      }
    };

    // try connecting
    try {
      await this.network.connect(`ws://${location.hostname}:8080`, 'Player');
    } catch {
      console.log('Server not available, starting offline mode');
      this.startOfflineMode();
    }

    // Setup UI
    this.setupControls();
    this.setupWorldBuilder();

    // Hide loading screen
    const loading = document.getElementById('loading')!;
    loading.classList.add('hidden');
    setTimeout(() => {
      loading.remove();
      // Show onboarding flow on first visit
      const onboarding = new Onboarding();
      onboarding.show();
    }, 500);

    // Start render loop
    this.lastFpsUpdate = performance.now();
    this.animate();
  }

  private startOfflineMode(): void {
    this.offlineMode = true;
    this.hudConnection.style.color = '#FFA500';

    if (this.useWasm) {
      // Use WASM physics engine with built-in preset
      this.wasmSim = WasmSimulation.fromPreset('solar_system', 42);
      if (this.wasmSim) {
        this.hudConnection.textContent = 'Offline (WASM)';
        this.state = this.wasmSim.getState();
        this.offlineBodies = this.state!.bodies;
      } else {
        // WASM preset failed — fall back to TS
        this.useWasm = false;
        this.hudConnection.textContent = 'Offline (Local)';
        this.offlineBodies = this.buildSolarSystem();
        this.state = this.buildDefaultState(this.offlineBodies);
      }
    } else {
      this.hudConnection.textContent = 'Offline (Local)';
      this.offlineBodies = this.buildSolarSystem();
      this.state = this.buildDefaultState(this.offlineBodies);
    }

    this.renderer.updateBodies(this.offlineBodies);
    this.updateBodyList(this.offlineBodies);
  }

  private buildDefaultState(bodies: Body[]): SimulationState {
    return {
      config: {
        dt: 86400,
        time: 0,
        tick: 0,
        solver_type: SolverType.Direct,
        integrator_type: IntegratorType.VelocityVerlet,
        bh_theta: 0.5,
        fmm_order: 6,
        softening_length: 1e3,
        enable_atmosphere: true,
        enable_drag: true,
        enable_radiation_pressure: true,
        enable_tidal_forces: true,
        enable_spherical_harmonics: true,
        adaptive_tolerance: 1e-12,
        max_substeps: 64,
        conservation_warn_threshold: 1e-6,
        conservation_error_threshold: 1e-3,
        time_scale: 1.0,
        paused: false,
        seed: 42,
      },
      bodies,
      conserved: {
        tick: 0, total_energy: 0, kinetic_energy: 0, potential_energy: 0,
        linear_momentum: vec3(), angular_momentum: vec3(), total_mass: 0,
        linear_momentum_magnitude: 0, angular_momentum_magnitude: 0,
      },
      integrator_switches: [],
      ticks_since_integrator_switch: 0,
      integrator_switch_cooldown: 100,
    };
  }

  private buildSolarSystem(): Body[] {
    const makeBody = (id: number, name: string, type: BodyType, mass: number, radius: number,
      dist: number, color: [number, number, number], luminosity = 0): Body => {
      const v = dist > 0 ? Math.sqrt(G * SOLAR_MASS / dist) : 0;
      return {
        id, name, body_type: type, mass, radius,
        position: vec3(dist, 0, 0),
        velocity: vec3(0, v, 0),
        acceleration: vec3(),
        rotation_period: 86400, axial_tilt: 0, rotation_angle: 0,
        collision_shape: { Sphere: { radius } }, restitution: 0.5,
        parent_id: dist > 0 ? 1 : null, soi_radius: 0,
        color, luminosity, albedo: 0.3,
        atmosphere: null, gravity_harmonics: null,
        has_rings: id === 7, ring_inner_radius: id === 7 ? 6.63e7 : 0, ring_outer_radius: id === 7 ? 1.4e8 : 0,
        substep_factor: 1, required_dt: 1, is_active: true, is_massless: false,
      };
    };

    return [
      makeBody(1, 'Sun', BodyType.Star, SOLAR_MASS, 6.957e8, 0, [1, 0.95, 0.8], SOLAR_LUMINOSITY),
      makeBody(2, 'Mercury', BodyType.Planet, 3.301e23, 2.44e6, 5.791e10, [0.7, 0.6, 0.5]),
      makeBody(3, 'Venus', BodyType.Planet, 4.867e24, 6.052e6, 1.082e11, [0.9, 0.7, 0.3]),
      makeBody(4, 'Earth', BodyType.Planet, EARTH_MASS, EARTH_RADIUS, AU, [0.2, 0.4, 0.8]),
      makeBody(5, 'Mars', BodyType.Planet, 6.417e23, 3.39e6, 2.279e11, [0.8, 0.3, 0.1]),
      makeBody(6, 'Jupiter', BodyType.Planet, 1.898e27, 6.991e7, 7.786e11, [0.8, 0.7, 0.5]),
      makeBody(7, 'Saturn', BodyType.Planet, 5.683e26, 5.823e7, 1.434e12, [0.9, 0.8, 0.5]),
      makeBody(8, 'Uranus', BodyType.Planet, 8.681e25, 2.536e7, 2.871e12, [0.5, 0.7, 0.9]),
      makeBody(9, 'Neptune', BodyType.Planet, 1.024e26, 2.462e7, 4.495e12, [0.2, 0.3, 0.9]),
    ];
  }

  /** Run one offline physics step — WASM if available, TS Velocity Verlet fallback */
  private offlineStep(): void {
    if (!this.state || this.state.config.paused) return;

    if (this.wasmSim) {
      // WASM physics path
      const result = this.wasmSim.step();
      if (result) {
        this.diagEnergy.textContent = result.energy_error.toExponential(2);
        this.diagMomentum.textContent = result.momentum_error.toExponential(2);
        this.diagSolver.textContent = result.solver;
        this.diagDt.textContent = result.dt.toFixed(1) + 's';
      }

      // Pull positions from WASM (zero-copy Float64Array)
      const positions = this.wasmSim.getPositions();
      for (let i = 0; i < this.offlineBodies.length && i * 3 + 2 < positions.length; i++) {
        this.offlineBodies[i].position.x = positions[i * 3];
        this.offlineBodies[i].position.y = positions[i * 3 + 1];
        this.offlineBodies[i].position.z = positions[i * 3 + 2];
      }

      // Sync tick/time from WASM state
      this.state.config.tick = this.wasmSim.tick;
      this.state.config.time = this.wasmSim.time;
      return;
    }

    // TS fallback: Velocity Verlet O(N²)

    const dt = this.state.config.dt * this.state.config.time_scale;
    const bodies = this.offlineBodies;
    const n = bodies.length;
    const softening2 = this.state.config.softening_length ** 2;

    // Half-kick
    for (const b of bodies) {
      b.velocity.x += 0.5 * b.acceleration.x * dt;
      b.velocity.y += 0.5 * b.acceleration.y * dt;
      b.velocity.z += 0.5 * b.acceleration.z * dt;
    }

    // Drift
    for (const b of bodies) {
      b.position.x += b.velocity.x * dt;
      b.position.y += b.velocity.y * dt;
      b.position.z += b.velocity.z * dt;
    }

    // Compute accelerations
    for (const b of bodies) {
      b.acceleration = vec3();
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const bi = bodies[i], bj = bodies[j];
        const dx = bj.position.x - bi.position.x;
        const dy = bj.position.y - bi.position.y;
        const dz = bj.position.z - bi.position.z;
        const r2 = dx * dx + dy * dy + dz * dz + softening2;
        const r = Math.sqrt(r2);
        const r3 = r * r2;
        if (r3 > 0) {
          const fi = G * bj.mass / r3;
          const fj = G * bi.mass / r3;
          bi.acceleration.x += fi * dx;
          bi.acceleration.y += fi * dy;
          bi.acceleration.z += fi * dz;
          bj.acceleration.x -= fj * dx;
          bj.acceleration.y -= fj * dy;
          bj.acceleration.z -= fj * dz;
        }
      }
    }

    // Second half-kick
    for (const b of bodies) {
      b.velocity.x += 0.5 * b.acceleration.x * dt;
      b.velocity.y += 0.5 * b.acceleration.y * dt;
      b.velocity.z += 0.5 * b.acceleration.z * dt;
    }

    this.state.config.time += dt;
    this.state.config.tick += 1;
  }

  private handleSnapshot(snapshot: any): void {
    this.state = snapshot.state;
    if (this.state) {
      this.renderer.updateBodies(this.state.bodies);
      this.updateBodyList(this.state.bodies);
    }
  }

  private handlePositionUpdate(tick: number, positions: Float64Array): void {
    this.latestPositions = positions;
    this.latestTick = tick;
    if (this.state) {
      // Update positions in place
      for (let i = 0; i < this.state.bodies.length && i * 3 + 2 < positions.length; i++) {
        this.state.bodies[i].position.x = positions[i * 3];
        this.state.bodies[i].position.y = positions[i * 3 + 1];
        this.state.bodies[i].position.z = positions[i * 3 + 2];
      }
    }
  }

  private handleStepResult(result: StepResult): void {
    this.diagEnergy.textContent = result.energy_error.toExponential(2);
    this.diagMomentum.textContent = result.momentum_error.toExponential(2);
    this.diagSolver.textContent = result.solver;
    this.diagDt.textContent = result.dt.toFixed(1) + 's';
  }

  /** Handle delta compression updates from server */
  private handleDelta(delta: any): void {
    if (!this.state) return;

    for (const d of delta.deltas || []) {
      const body = this.state.bodies.find((b) => b.id === d.bodyId);
      if (body) {
        if (d.position) {
          body.position.x = d.position.x;
          body.position.y = d.position.y;
          body.position.z = d.position.z;
        }
        if (d.velocity) {
          body.velocity.x = d.velocity.x;
          body.velocity.y = d.velocity.y;
          body.velocity.z = d.velocity.z;
        }
        if (d.removed) {
          this.state.bodies = this.state.bodies.filter((b) => b.id !== d.bodyId);
        }
      }
    }

    // Handle newly added bodies
    if (delta.newBodies) {
      for (const body of delta.newBodies) {
        if (!this.state.bodies.find((b) => b.id === body.id)) {
          this.state.bodies.push(body);
        }
      }
      this.renderer.updateBodies(this.state.bodies);
      this.updateBodyList(this.state.bodies);
    }

    // Sync tick/time
    if (delta.tick !== undefined) this.state.config.tick = delta.tick;
    if (delta.time !== undefined) this.state.config.time = delta.time;
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    // If offline, run a physics step
    if (this.offlineMode) {
      this.offlineStep();
    }

    // Update camera
    this.camera.update();

    // Set camera focus
    if (this.selectedBodyId != null && this.state) {
      const body = this.state.bodies.find((b) => b.id === this.selectedBodyId);
      if (body) {
        this.camera.setTarget(body.position);
      }
    }

    // Update renderer
    if (this.state) {
      this.renderer.updatePositions(this.state.bodies);
      this.renderer.setFloatingOrigin(this.camera.getPosition());
    }

    this.renderer.render();

    // Update HUD
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 500) {
      this.fps = Math.round(this.frameCount / ((now - this.lastFpsUpdate) / 1000));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      this.hudFps.textContent = String(this.fps);
    }

    if (this.state) {
      this.hudTick.textContent = String(this.state.config.tick);
      this.hudTime.textContent = this.formatTime(this.state.config.time);
      this.hudBodies.textContent = String(this.state.bodies.length);
    }
  };

  private formatTime(seconds: number): string {
    const abs = Math.abs(seconds);
    if (abs < 60) return `${seconds.toFixed(0)}s`;
    if (abs < 3600) return `${(seconds / 60).toFixed(1)}m`;
    if (abs < 86400) return `${(seconds / 3600).toFixed(1)}h`;
    if (abs < 86400 * 365.25) return `${(seconds / 86400).toFixed(1)}d`;
    return `${(seconds / (86400 * 365.25)).toFixed(2)}y`;
  }

  private updateBodyList(bodies: Body[]): void {
    const container = document.getElementById('body-list-items')!;
    container.innerHTML = '';
    for (const body of bodies) {
      const item = document.createElement('div');
      item.className = 'body-item' + (body.id === this.selectedBodyId ? ' selected' : '');
      item.innerHTML = `
        <div class="dot" style="background: rgb(${body.color.map((c) => Math.round(c * 255)).join(',')})"></div>
        <span class="name">${body.name}</span>
        <span class="type">${body.body_type}</span>
      `;
      item.addEventListener('click', () => {
        this.selectedBodyId = body.id;
        this.camera.focusOnBody(body);
        this.updateBodyList(bodies);
      });
      container.appendChild(item);
    }
  }

  private setupControls(): void {
    // Pause/Resume
    const btnPause = document.getElementById('btn-pause')!;
    btnPause.addEventListener('click', () => {
      if (this.state) {
        this.state.config.paused = !this.state.config.paused;
        btnPause.textContent = this.state.config.paused ? '▶ Play' : '⏸ Pause';
        if (this.wasmSim) {
          this.wasmSim.setPaused(this.state.config.paused);
        }
      }
    });

    // Step
    document.getElementById('btn-step')!.addEventListener('click', () => {
      if (this.state && this.offlineMode) {
        const wasPaused = this.state.config.paused;
        this.state.config.paused = false;
        if (this.wasmSim) this.wasmSim.setPaused(false);
        this.offlineStep();
        this.state.config.paused = wasPaused;
        if (this.wasmSim) this.wasmSim.setPaused(wasPaused);
      }
    });

    // Time scale
    const timeScale = document.getElementById('time-scale') as HTMLInputElement;
    const timeScaleLabel = document.getElementById('time-scale-label')!;
    timeScale.addEventListener('input', () => {
      const power = parseFloat(timeScale.value);
      const scale = Math.pow(10, power);
      if (this.state) {
        this.state.config.time_scale = scale;
        if (this.wasmSim) this.wasmSim.setTimeScale(scale);
      }
      timeScaleLabel.textContent = scale >= 1 ? `${scale.toFixed(0)}x` : `${scale.toFixed(2)}x`;
    });

    // Camera mode
    document.getElementById('camera-mode')!.addEventListener('change', (e) => {
      this.camera.setMode((e.target as HTMLSelectElement).value as any);
    });

    // Solver
    document.getElementById('solver-select')!.addEventListener('change', (e) => {
      if (this.state) {
        this.state.config.solver_type = (e.target as HTMLSelectElement).value as SolverType;
        if (this.wasmSim) {
          const solverMap: Record<string, string> = {
            'Direct': 'direct', 'BarnesHut': 'barnes_hut', 'FMM': 'fmm'
          };
          this.wasmSim.setSolver(solverMap[this.state.config.solver_type] || 'direct');
        }
      }
    });

    // Integrator
    document.getElementById('integrator-select')!.addEventListener('change', (e) => {
      if (this.state) {
        this.state.config.integrator_type = (e.target as HTMLSelectElement).value as IntegratorType;
        if (this.wasmSim) {
          const intMap: Record<string, string> = {
            'VelocityVerlet': 'verlet', 'RK45': 'rk45', 'GaussRadau15': 'gauss_radau'
          };
          this.wasmSim.setIntegrator(intMap[this.state.config.integrator_type] || 'verlet');
        }
      }
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = (btn as HTMLElement).dataset.preset!;
        if (this.offlineMode) {
          if (this.wasmSim) {
            // Dispose old WASM sim and create new one from preset
            this.wasmSim.dispose();
            this.wasmSim = WasmSimulation.fromPreset(preset, 42);
            if (this.wasmSim) {
              this.state = this.wasmSim.getState();
              this.offlineBodies = this.state!.bodies;
            } else {
              // Fallback
              this.offlineBodies = this.buildSolarSystem();
              if (this.state) {
                this.state.bodies = this.offlineBodies;
                this.state.config.tick = 0;
                this.state.config.time = 0;
              }
            }
          } else {
            // TS fallback — only supports solar system
            this.offlineBodies = this.buildSolarSystem();
            if (this.state) {
              this.state.bodies = this.offlineBodies;
              this.state.config.tick = 0;
              this.state.config.time = 0;
            }
          }
          this.renderer.updateBodies(this.offlineBodies);
          this.updateBodyList(this.offlineBodies);
        } else {
          // Tell server to load preset
          this.network.send({
            type: ClientMessageType.AdminCommand,
            command: 'load_preset',
            args: { preset },
          });
        }
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          btnPause.click();
          break;
        case '.':
          document.getElementById('btn-step')!.click();
          break;
        case 'h':
          document.getElementById('hud')!.style.display =
            document.getElementById('hud')!.style.display === 'none' ? '' : 'none';
          break;
      }
    });
  }

  private setupWorldBuilder(): void {
    new WorldBuilder({
      getState: () => this.state,
      addBody: (body) => {
        if (this.wasmSim) {
          this.wasmSim.addBody(body);
          this.state = this.wasmSim.getState();
          this.offlineBodies = this.state!.bodies;
        } else if (this.offlineMode && this.state) {
          this.offlineBodies.push(body);
          this.state.bodies = this.offlineBodies;
        } else {
          // Online: send via prediction-tracked input
          const action = {
            SpawnBody: {
              name: body.name,
              mass: body.mass,
              radius: body.radius,
              position: [body.position.x, body.position.y, body.position.z] as [number, number, number],
              velocity: [body.velocity.x, body.velocity.y, body.velocity.z] as [number, number, number],
            },
          };
          this.network.sendInput(action, this.state?.config.tick || 0);
          // Optimistic local add (will be reconciled on next snapshot)
          if (this.state) {
            this.state.bodies.push(body);
          }
        }
        this.renderer.updateBodies(this.state?.bodies || []);
        this.updateBodyList(this.state?.bodies || []);
      },
      deleteBody: (id) => {
        if (this.wasmSim) {
          this.wasmSim.removeBody(id);
          this.state = this.wasmSim.getState();
          this.offlineBodies = this.state!.bodies;
        } else if (this.offlineMode && this.state) {
          this.offlineBodies = this.offlineBodies.filter((b) => b.id !== id);
          this.state.bodies = this.offlineBodies;
        } else {
          this.network.sendInput({ DeleteBody: { body_id: id } }, this.state?.config.tick || 0);
          // Optimistic local remove
          if (this.state) {
            this.state.bodies = this.state.bodies.filter((b) => b.id !== id);
          }
        }
        this.renderer.updateBodies(this.state?.bodies || []);
        this.updateBodyList(this.state?.bodies || []);
        if (this.selectedBodyId === id) this.selectedBodyId = null;
      },
      getSelectedBodyId: () => this.selectedBodyId,
      getNextBodyId: () => {
        if (this.wasmSim) return this.wasmSim.nextBodyId();
        const ids = this.state?.bodies.map((b) => b.id) || [0];
        return Math.max(...ids) + 1;
      },
    });
  }

  /** Apply an InputAction locally (for prediction/reconciliation replay) */
  private applyInputLocally(action: any): void {
    if (!this.state) return;

    if ('SpawnBody' in action) {
      const d = action.SpawnBody;
      const id = Math.max(0, ...this.state.bodies.map((b) => b.id)) + 1;
      const body: Body = {
        id,
        name: d.name,
        body_type: BodyType.Asteroid,
        position: vec3(d.position[0], d.position[1], d.position[2]),
        velocity: vec3(d.velocity[0], d.velocity[1], d.velocity[2]),
        acceleration: vec3(),
        mass: d.mass,
        radius: d.radius,
        rotation_period: 86400,
        axial_tilt: 0,
        rotation_angle: 0,
        collision_shape: { Sphere: { radius: d.radius } },
        restitution: 0.5,
        parent_id: null,
        soi_radius: 0,
        color: [0.5, 0.5, 0.5],
        luminosity: 0,
        albedo: 0.3,
        atmosphere: null,
        gravity_harmonics: null,
        has_rings: false,
        ring_inner_radius: 0,
        ring_outer_radius: 0,
        substep_factor: 1,
        required_dt: 1,
        is_active: true,
        is_massless: false,
      };
      this.state.bodies.push(body);
    } else if ('DeleteBody' in action) {
      this.state.bodies = this.state.bodies.filter((b) => b.id !== action.DeleteBody.body_id);
    } else if ('ApplyThrust' in action) {
      const d = action.ApplyThrust;
      const body = this.state.bodies.find((b) => b.id === d.body_id);
      if (body && body.mass > 0) {
        body.acceleration.x += d.force[0] / body.mass;
        body.acceleration.y += d.force[1] / body.mass;
        body.acceleration.z += d.force[2] / body.mass;
      }
    } else if ('SetPaused' in action) {
      this.state.config.paused = action.SetPaused.paused;
    } else if ('SetTimeScale' in action) {
      this.state.config.time_scale = action.SetTimeScale.scale;
    }
  }

  /** Show a toast notification */
  private showToast(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed; bottom: 16px; right: 16px; z-index: 9999;
        display: flex; flex-direction: column; gap: 8px; pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const colors = { info: '#4fc3f7', warn: '#ffa726', error: '#ef5350' };
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(20,20,30,0.92); border: 1px solid ${colors[level]};
      color: #eee; padding: 8px 16px; border-radius: 6px; font-size: 13px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      box-shadow: 0 4px 16px rgba(0,0,0,0.4); pointer-events: auto;
      animation: toastIn 0.3s ease-out;
      max-width: 360px;
    `;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}
