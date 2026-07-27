import { logger } from './logger';
import { AdminStatePayload } from './network';
import { APP_DEFAULTS } from './defaults';
import type { WorkerMessage, WorkerStatePayload, WorkerBodiesPayload } from './physics.worker';
import { BodyInfo } from './physics'; // Just to reuse type if needed

export class WorkerBridge {
    private worker!: Worker;
    private initialized = false;
    
    // Latest state received from worker
    private _tick: bigint = 0n;
    private _time: number = 0;
    private _positions: Float64Array = new Float64Array(0);
    private _velocities: Float64Array = new Float64Array(0);
    private _energy: number = 0;
    private _bodyCount: number = 0;

    // We maintain a similar body cache structure to PhysicsClient
    private _cachedBodies: BodyInfo[] | null = null;
    private _cachedBodyCount = -1;
    private _pendingBodiesJson: string | null = null;

    // Callbacks
    public onReady?: () => void;
    public onError?: (err: string) => void;
    public onBodiesUpdate?: () => void;

    // Body colors mapping (copied from physics.ts for parsing)
    private BODY_COLORS: Record<string, number> = {
        'Sun': 0xffdd44,
        'Mercury': 0x8c7853,
        'Venus': 0xe6c229,
        'Earth': 0x4488ff,
        'Moon': 0x888888,
        'Mars': 0xc1440e,
        'Jupiter': 0xd4a574,
        'Saturn': 0xead6a7,
        'Uranus': 0x72b4c4,
        'Neptune': 0x3d5ef5,
        'Pluto': 0xdbd3c9,
    };

    async init(): Promise<void> {
        logger.info('Initializing Physics WebWorker Bridge...');
        return new Promise((resolve, reject) => {
            try {
                this.worker = new Worker(new URL('./physics.worker.ts', import.meta.url), {
                    type: 'module'
                });

                this.worker.onmessage = (e: MessageEvent) => {
                    const data = e.data;
                    
                    if (data.type === 'ready') {
                        this.initialized = true;
                        logger.info('Physics WebWorker ready');
                        if (this.onReady) this.onReady();
                        resolve();
                    } else if (data.type === 'error') {
                        logger.error('Physics WebWorker error:', data.error);
                        if (this.onError) this.onError(data.error);
                        reject(data.error);
                    } else if (data.type === 'state') {
                        const state = data as WorkerStatePayload;
                        this._tick = state.tick;
                        this._time = state.time;
                        this._positions = state.positions;
                        this._velocities = state.velocities;
                        this._energy = state.energy;
                        this._bodyCount = state.bodyCount;
                    } else if (data.type === 'bodies') {
                        const bodiesData = data as WorkerBodiesPayload;
                        this._pendingBodiesJson = bodiesData.json;
                        if (this.onBodiesUpdate) this.onBodiesUpdate();
                    }
                };

                this.worker.onerror = (e) => {
                    logger.error('Physics WebWorker raw error:', e);
                    reject(e);
                };

                this.worker.postMessage({ type: 'init', seed: BigInt(Date.now()) } as WorkerMessage);

            } catch (err) {
                logger.error('Failed to create WebWorker:', err);
                reject(err);
            }
        });
    }

    // --- State Accessors mirroring PhysicsClient ---

    tick(): number {
        return Number(this._tick);
    }

    time(): number {
        return this._time;
    }

    getPositions(): Float64Array {
        return this._positions;
    }

    getVelocities(): Float64Array {
        return this._velocities;
    }

    totalEnergy(): number {
        return this._energy;
    }

    kineticEnergy(): number { return 0; } // We don't really need this for worker right now, drift monitor gets disabled in demo mode or we pass it
    potentialEnergy(): number { return 0; }
    totalMomentum(): Float64Array { return new Float64Array(3); }
    centerOfMass(): Float64Array { return new Float64Array(3); }
    angularMomentum(): Float64Array { return new Float64Array(3); }

    bodyCount(): number {
        return this._bodyCount;
    }

    getBodies(): BodyInfo[] {
        if (!this.initialized) return [];

        if (this._cachedBodies && this._bodyCount === this._cachedBodyCount && !this._pendingBodiesJson) {
            return this._cachedBodies;
        }

        if (this._pendingBodiesJson) {
            try {
                const bodies = JSON.parse(this._pendingBodiesJson) as any[];
                this._cachedBodies = bodies.map(b => ({
                    id: b.id,
                    name: b.name,
                    type: this.parseBodyType(b.body_type),
                    mass: b.mass,
                    radius: b.radius,
                    color: this.BODY_COLORS[b.name] ?? this.rgbToHex(b.color),
                    axialTilt: b.axial_tilt ?? 0,
                    poleRa: b.pole_ra,
                    poleDec: b.pole_dec,
                    luminosity: b.luminosity ?? 0,
                    effectiveTemperature: b.effective_temperature ?? 0,
                    rotationRate: b.rotation_rate ?? 0,
                    seed: b.seed ?? 0,
                    oblateness: b.oblateness ?? 0,
                    scaleHeight: b.scale_height ?? 0,
                    equilibriumTemperature: b.equilibrium_temperature ?? 0,
                    metallicity: b.metallicity ?? 0,
                    age: b.age ?? 0,
                    spectralType: b.spectral_type ?? '',
                    limbDarkeningCoeffs: b.limb_darkening_coeffs ?? [0, 0],
                    flareRate: b.flare_rate ?? 0,
                    spotFraction: b.spot_fraction ?? 0,
                    composition: b.composition ?? 'Rocky',
                    albedo: b.albedo ?? 0,
                    atmosphere: b.atmosphere ? {
                        scaleHeight: b.atmosphere.scale_height,
                        rayleighCoefficients: b.atmosphere.rayleigh_coefficients,
                        mieCoefficient: b.atmosphere.mie_coefficient,
                        mieDirection: b.atmosphere.mie_direction,
                        height: b.atmosphere.height,
                        mieColor: b.atmosphere.mie_color ?? [1, 1, 1],
                    } : undefined,
                    rings: b.rings ? {
                        innerRadiusMult: b.rings.inner_radius_mult,
                        outerRadiusMult: b.rings.outer_radius_mult,
                        texturePreset: b.rings.texture_preset,
                        baseOpacity: b.rings.base_opacity,
                    } : undefined,
                    semiMajorAxis: b.semi_major_axis ?? 0,
                    eccentricity: b.eccentricity ?? 0,
                    meanSurfaceTemperature: b.mean_surface_temperature ?? 0,
                }));
                this._cachedBodyCount = this._bodyCount;
                this._pendingBodiesJson = null;
            } catch (e) {
                logger.error('WorkerBridge: Failed to parse bodies:', e);
            }
        }
        
        return this._cachedBodies || [];
    }

    private parseBodyType(type: string): BodyInfo['type'] {
        const t = type.toLowerCase();
        if (t.includes('star')) return 'star';
        if (t.includes('moon')) return 'moon';
        if (t.includes('asteroid')) return 'asteroid';
        if (t.includes('comet')) return 'comet';
        if (t.includes('spacecraft')) return 'spacecraft';
        if (t.includes('testparticle') || t.includes('test_particle')) return 'test_particle';
        if (t.includes('player')) return 'player';
        return 'planet';
    }

    private rgbToHex(rgb: [number, number, number]): number {
        const r = Math.round(Math.max(0, Math.min(1, rgb[0])) * 255);
        const g = Math.round(Math.max(0, Math.min(1, rgb[1])) * 255);
        const b = Math.round(Math.max(0, Math.min(1, rgb[2])) * 255);
        return (r << 16) | (g << 8) | b;
    }

    // --- Admin Commands ---

    updateAdminState(state: Partial<AdminStatePayload>): void {
        if (!this.initialized) return;
        this.worker.postMessage({ type: 'updateAdminState', state } as WorkerMessage);
    }

    createPreset(preset: string, seed: bigint, barycentric: boolean = false, bodyCount?: number, stressTestCounts?: { stars: number; planets: number; asteroids: number }): void {
        if (!this.initialized) return;
        this.worker.postMessage({
            type: 'loadPreset', preset, seed, barycentric, bodyCount, stressTestCounts
        } as WorkerMessage);
    }

    addBodyDirect(body: {
        name: string;
        bodyType: number;
        mass: number;
        radius: number;
        x: number;
        y: number;
        z: number;
        vx: number;
        vy: number;
        vz: number;
    }): void {
        if (!this.initialized) return;
        this.worker.postMessage({
            type: 'addBody',
            name: body.name, bodyType: body.bodyType, mass: body.mass, radius: body.radius,
            x: body.x, y: body.y, z: body.z, vx: body.vx, vy: body.vy, vz: body.vz
        } as WorkerMessage);
    }

    addBodyFromJson(json: string): void {
        if (!this.initialized) return;
        this.worker.postMessage({ type: 'addBodyFromJson', json } as WorkerMessage);
    }

    removeBody(id: number): void {
        if (!this.initialized) return;
        this.worker.postMessage({ type: 'removeBody', id } as WorkerMessage);
    }

    requestBodies(): void {
        if (!this.initialized) return;
        this.worker.postMessage({ type: 'getBodies' } as WorkerMessage);
    }

    // Proxy methods that were mutating state directly on the WASM sim in the old model:
    setTimeStep(dt: number): void { this.updateAdminState({ dt }); }
    setSubsteps(substeps: number): void { this.updateAdminState({ substeps }); }
    setTheta(theta: number): void { this.updateAdminState({ theta }); }
    useDirectForce(): void { this.updateAdminState({ forceMethod: 'direct' }); }
    useBarnesHut(): void { this.updateAdminState({ forceMethod: 'barnes-hut' }); }
    setCloseEncounterIntegrator(name: string): void { this.updateAdminState({ closeEncounterIntegrator: name as any }); }
    setCloseEncounterThresholds(hillFactor: number, tidalRatio: number, jerkNorm: number): void {
        this.updateAdminState({
            closeEncounterHillFactor: hillFactor,
            closeEncounterTidalRatio: tidalRatio,
            closeEncounterJerkNorm: jerkNorm
        });
    }
    setCloseEncounterLimits(maxSubsetSize: number, maxTrialSubsteps: number): void {
        this.updateAdminState({
            closeEncounterMaxSubsetSize: maxSubsetSize,
            closeEncounterMaxTrialSubsteps: maxTrialSubsteps
        });
    }
    setCloseEncounterRk45Tolerances(absTol: number, relTol: number): void {
        this.updateAdminState({
            closeEncounterRk45AbsTol: absTol,
            closeEncounterRk45RelTol: relTol
        });
    }
    setCloseEncounterGaussRadau(maxIters: number, tol: number): void {
        this.updateAdminState({
            closeEncounterGaussRadauMaxIters: maxIters,
            closeEncounterGaussRadauTol: tol
        });
    }
    
    // Stubs for methods main.ts might call but we don't support/need in demo mode worker
    stepN(n: number): void { /* handled by worker */ }
    takeCloseEncounterEvents(): any[] { return []; }
    restoreSnapshot(json: string): boolean { return false; }
    getSnapshot(): string { return ''; }
    createNew(seed?: bigint): void {
        if (!this.initialized) return;
        this.worker.postMessage({ type: 'createEmpty', seed: seed ?? BigInt(Date.now()) } as WorkerMessage);
    }
    createSunEarthMoon(): void { this.createPreset('sunEarthMoon', BigInt(Date.now())); }

    dispose(): void {
        if (this.worker) {
            this.worker.terminate();
        }
    }
}
