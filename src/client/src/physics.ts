/**
 * Client-side Physics
 * 
 * Loads WASM physics module for:
 * - Client-side prediction
 * - Standalone mode (no server)
 */

// Type definitions for WASM module
type WasmSimulation = {
    step(): void;
    stepN(n: bigint): void;
    time(): number;
    tick(): bigint;
    bodyCount(): number;
    getPositions(): Float64Array;
    getVelocities(): Float64Array;
    getBodiesJson(): string;
    toJson(): string;
    fromJson(json: string): boolean;
    totalEnergy(): number;
    addStar(name: string, mass: number, radius: number): number;
    addPlanet(name: string, mass: number, radius: number, distance: number, velocity: number): number;
    addBody(name: string, bodyType: number, mass: number, radius: number, px: number, py: number, pz: number, vx: number, vy: number, vz: number): number;
    addBodyFromJson(json: string): number;
    removeBody(id: number): boolean;
    setDt(dt: number): void;
    setSubsteps(substeps: number): void;
    setTheta(theta: number): void;
    useDirectForce(): void;
    useBarnesHut(): void;
    random(): number;
    free(): void;
};

interface PhysicsModule {
    default: (input?: RequestInfo | BufferSource | WebAssembly.Module) => Promise<unknown>;
    WasmSimulation: new (seed: bigint) => WasmSimulation;
    createSunEarthMoon: (seed: bigint) => WasmSimulation;
    createInnerSolarSystem: (seed: bigint) => WasmSimulation;
    createFullSolarSystem: (seed: bigint) => WasmSimulation;
    createFullSolarSystemII: (seed: bigint) => WasmSimulation;
    createFullSolarSystemIIBarycentric: (seed: bigint) => WasmSimulation;
    createPlayableSolarSystem: (seed: bigint) => WasmSimulation;
    createJupiterSystem: (seed: bigint) => WasmSimulation;
    createSaturnSystem: (seed: bigint) => WasmSimulation;
    createAlphaCentauri: (seed: bigint) => WasmSimulation;
    createTrappist1: (seed: bigint) => WasmSimulation;
    createBinaryPulsar: (seed: bigint) => WasmSimulation;
    createAsteroidBelt: (seed: bigint, asteroidCount: number) => WasmSimulation;
    createStarCluster: (seed: bigint, starCount: number) => WasmSimulation;
    getG: () => number;
    getAU: () => number;
    getSolarMass: () => number;
    getEarthMass: () => number;
    circularVelocity: (mass: number, distance: number) => number;
    init: () => void;
}

export interface BodyInfo {
    id: number;
    name: string;
    type: 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'spacecraft' | 'test_particle' | 'player';
    mass: number;
    radius: number;
    color: number;
    axialTilt: number;
    // Extended physics fields (from derive modules)
    luminosity: number;
    effectiveTemperature: number;
    rotationRate: number;
    seed: number;
    oblateness: number;
    scaleHeight: number;
    equilibriumTemperature: number;
    metallicity: number;
    age: number;
    spectralType: string;
    limbDarkeningCoeffs: [number, number];
    flareRate: number;
    spotFraction: number;
    composition: string;
    albedo: number;
    atmosphere?: {
        scaleHeight: number;
        rayleighCoefficients: [number, number, number];
        mieCoefficient: number;
        mieDirection: number;
        height: number;
        mieColor: [number, number, number];
    };
    semiMajorAxis: number;
    eccentricity: number;
    meanSurfaceTemperature: number;
}

// Convert RGB [0-1, 0-1, 0-1] to hex integer
function rgbToHex(rgb: [number, number, number]): number {
    const r = Math.round(Math.max(0, Math.min(1, rgb[0])) * 255);
    const g = Math.round(Math.max(0, Math.min(1, rgb[1])) * 255);
    const b = Math.round(Math.max(0, Math.min(1, rgb[2])) * 255);
    return (r << 16) | (g << 8) | b;
}

// Body color mapping
const BODY_COLORS: Record<string, number> = {
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

export class PhysicsClient {
    private module!: PhysicsModule;
    private simulation!: WasmSimulation;
    private initialized = false;

    // Physical constants
    G = 0;
    AU = 0;
    M_SUN = 0;
    M_EARTH = 0;

    async init(): Promise<void> {
        console.log('[INFO] Loading WASM physics...');

        try {
            // Import WASM module built in physics-core/pkg
            const physicsModule = await import('../../physics-core/pkg/physics_core.js');

            // Initialize WASM using module-local URL resolution
            await physicsModule.default();
            physicsModule.init();

            this.module = physicsModule as PhysicsModule;

            // Cache constants
            this.G = this.module.getG();
            this.AU = this.module.getAU();
            this.M_SUN = this.module.getSolarMass();
            this.M_EARTH = this.module.getEarthMass();

            this.initialized = true;
            console.log('[OK] WASM physics loaded');
            console.log(`   G = ${this.G} m³/(kg·s²)`);
            console.log(`   AU = ${this.AU} m`);
        } catch (error) {
            console.error('[ERROR] Failed to load WASM:', error);
            throw error;
        }
    }

    createSunEarthMoon(): void {
        if (!this.initialized) throw new Error('Physics not initialized');

        this.simulation = this.module.createSunEarthMoon(BigInt(Date.now()));

        // Use proper orbital mechanics timestep (1 hour = 3600s)
        // This is set by the TimeController, but we need a default here
        this.simulation.setDt(3600);
        this.simulation.setSubsteps(4);

        console.log(`[INFO] Created Sun-Earth-Moon system (${this.simulation.bodyCount()} bodies)`);
    }

    createNew(seed?: bigint): void {
        if (!this.initialized) throw new Error('Physics not initialized');

        this.simulation = new this.module.WasmSimulation(seed ?? BigInt(Date.now()));
        this.simulation.setDt(3600); // 1 hour timestep for orbital mechanics
        this.simulation.setSubsteps(4);
    }

    step(): void {
        if (this.simulation) {
            this.simulation.step();
        }
    }

    stepN(n: number): void {
        if (this.simulation) {
            this.simulation.stepN(BigInt(n));
        }
    }

    setTimeStep(dt: number): void {
        if (this.simulation) {
            this.simulation.setDt(dt);
        }
    }

    setSubsteps(substeps: number): void {
        if (this.simulation && substeps > 0) {
            this.simulation.setSubsteps(substeps);
        }
    }

    setTheta(theta: number): void {
        if (this.simulation && theta > 0) {
            this.simulation.setTheta(theta);
        }
    }

    useDirectForce(): void {
        if (this.simulation) {
            this.simulation.useDirectForce();
        }
    }

    useBarnesHut(): void {
        if (this.simulation) {
            this.simulation.useBarnesHut();
        }
    }

    time(): number {
        return this.simulation?.time() ?? 0;
    }

    tick(): number {
        return Number(this.simulation?.tick() ?? 0n);
    }

    bodyCount(): number {
        return this.simulation?.bodyCount() ?? 0;
    }

    getPositions(): Float64Array {
        return this.simulation?.getPositions() ?? new Float64Array(0);
    }

    getVelocities(): Float64Array {
        return this.simulation?.getVelocities() ?? new Float64Array(0);
    }

    totalEnergy(): number {
        return this.simulation?.totalEnergy() ?? 0;
    }

    /** Get body info for rendering */
    getBodies(): BodyInfo[] {
        if (!this.simulation) return [];

        try {
            const json = this.simulation.getBodiesJson();
            const bodies = JSON.parse(json) as Array<{
                id: number;
                name: string;
                body_type: string;
                mass: number;
                radius: number;
                color: [number, number, number];
                luminosity?: number;
                effective_temperature?: number;
                rotation_rate?: number;
                axial_tilt?: number;
                seed?: number;
                oblateness?: number;
                scale_height?: number;
                equilibrium_temperature?: number;
                metallicity?: number;
                age?: number;
                spectral_type?: string;
                limb_darkening_coeffs?: [number, number];
                flare_rate?: number;
                spot_fraction?: number;
                composition?: string;
                albedo?: number;
                atmosphere?: {
                    scale_height: number;
                    rayleigh_coefficients: [number, number, number];
                    mie_coefficient: number;
                    mie_direction: number;
                    height: number;
                    mie_color?: [number, number, number];
                };
                semi_major_axis?: number;
                eccentricity?: number;
                mean_surface_temperature?: number;
            }>;

            return bodies.map(b => ({
                id: b.id,
                name: b.name,
                type: this.parseBodyType(b.body_type),
                mass: b.mass,
                radius: b.radius,
                // Use named color lookup first, then body struct color (RGB 0-1 → hex)
                color: BODY_COLORS[b.name] ?? rgbToHex(b.color),
                axialTilt: b.axial_tilt ?? 0,
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
                semiMajorAxis: b.semi_major_axis ?? 0,
                eccentricity: b.eccentricity ?? 0,
                meanSurfaceTemperature: b.mean_surface_temperature ?? 0,
            }));
        } catch (e) {
            console.error('Failed to parse bodies:', e);
            return [];
        }
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

    /** Restore from snapshot JSON */
    restoreSnapshot(json: string): boolean {
        return this.simulation?.fromJson(json) ?? false;
    }

    /** Export snapshot to JSON */
    getSnapshot(): string {
        return this.simulation?.toJson() ?? '{}';
    }

    /** Create a preset simulation */
    createPreset(preset: string, seed: bigint, barycentric: boolean = false, bodyCount?: number): void {
        if (!this.initialized || !this.module) throw new Error('Physics not initialized');

        let loadedPreset = preset;

        switch (preset) {
            case 'innerSolarSystem':
                this.simulation = this.module.createInnerSolarSystem(seed);
                break;
            case 'fullSolarSystem':
                this.simulation = this.module.createFullSolarSystem(seed);
                break;
            case 'fullSolarSystemII':
                if (barycentric && typeof this.module.createFullSolarSystemIIBarycentric === 'function') {
                    this.simulation = this.module.createFullSolarSystemIIBarycentric(seed);
                } else if (typeof this.module.createFullSolarSystemII === 'function') {
                    this.simulation = this.module.createFullSolarSystemII(seed);
                } else {
                    console.warn('[WARN] Full Solar System II preset unavailable. Falling back to Full Solar System.');
                    this.simulation = this.module.createFullSolarSystem(seed);
                    loadedPreset = 'fullSolarSystem';
                }
                break;
            case 'playableSolarSystem':
                if (typeof this.module.createPlayableSolarSystem === 'function') {
                    this.simulation = this.module.createPlayableSolarSystem(seed);
                } else {
                    console.warn('[WARN] Playable Solar System preset unavailable in WASM build. Falling back to Full Solar System.');
                    this.simulation = this.module.createFullSolarSystem(seed);
                    loadedPreset = 'fullSolarSystem';
                }
                break;
            case 'jupiterSystem':
                this.simulation = this.module.createJupiterSystem(seed);
                break;
            case 'saturnSystem':
                this.simulation = this.module.createSaturnSystem(seed);
                break;
            case 'alphaCentauri':
                this.simulation = this.module.createAlphaCentauri(seed);
                break;
            case 'trappist1':
                this.simulation = this.module.createTrappist1(seed);
                break;
            case 'binaryPulsar':
                this.simulation = this.module.createBinaryPulsar(seed);
                break;
            case 'asteroidBelt': {
                // Use provided bodyCount or default to 5000 asteroids
                const asteroidCount = bodyCount ?? 5000;
                if (typeof this.module.createAsteroidBelt === 'function') {
                    this.simulation = this.module.createAsteroidBelt(seed, asteroidCount);
                } else {
                    console.warn('[WARN] Asteroid Belt preset unavailable. Falling back to Full Solar System II.');
                    this.simulation = this.module.createFullSolarSystemII(seed);
                    loadedPreset = 'fullSolarSystemII';
                }
                break;
            }
            case 'starCluster': {
                // Use provided bodyCount or default to 2000 stars
                const starCount = bodyCount ?? 2000;
                if (typeof this.module.createStarCluster === 'function') {
                    this.simulation = this.module.createStarCluster(seed, starCount);
                } else {
                    console.warn('[WARN] Star Cluster preset unavailable. Falling back to Sun-Earth-Moon.');
                    this.simulation = this.module.createSunEarthMoon(seed);
                    loadedPreset = 'sunEarthMoon';
                }
                break;
            }
            default:
                this.simulation = this.module.createSunEarthMoon(seed);
        }

        // Set proper orbital mechanics timestep for all presets
        this.simulation.setDt(3600); // 1 hour per step
        this.simulation.setSubsteps(4);

        console.log(`[INFO] Loaded preset: ${loadedPreset} (${this.simulation.bodyCount()} bodies, dt=3600s)`);
    }

    /** Add a custom body */
    addBody(body: {
        name: string;
        type: 'star' | 'planet' | 'moon' | 'asteroid' | 'comet' | 'spacecraft' | 'test_particle' | 'player';
        mass: number;
        radius: number;
        x: number;
        y: number;
        z: number;
        vx: number;
        vy: number;
        vz: number;
    }): number {
        if (!this.simulation) throw new Error('No simulation');

        let id: number;
        if (body.type === 'star') {
            id = this.simulation.addStar(body.name, body.mass, body.radius);
        } else {
            // Calculate orbital velocity from position for simple cases
            id = this.simulation.addPlanet(
                body.name,
                body.mass,
                body.radius,
                Math.sqrt(body.x * body.x + body.z * body.z), // distance
                Math.sqrt(body.vx * body.vx + body.vz * body.vz)  // velocity magnitude
            );
        }

        console.log(`[INFO] Added body: ${body.name} (id: ${id})`);
        return id;
    }

    /** Remove a body by ID */
    removeBody(id: number): void {
        if (!this.simulation) return;

        // Note: WASM doesn't have remove yet, would need to rebuild
        console.log(`[WARN] Remove body ${id} - not implemented in WASM yet`);
    }

    dispose(): void {
        if (this.simulation) {
            this.simulation.free();
        }
    }
}
