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
    addBody(name: string, mass: number, radius: number, px: number, py: number, pz: number, vx: number, vy: number, vz: number): number;
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
    createPlayableSolarSystem: (seed: bigint) => WasmSimulation;
    createJupiterSystem: (seed: bigint) => WasmSimulation;
    createSaturnSystem: (seed: bigint) => WasmSimulation;
    createAlphaCentauri: (seed: bigint) => WasmSimulation;
    createTrappist1: (seed: bigint) => WasmSimulation;
    createBinaryPulsar: (seed: bigint) => WasmSimulation;
    getG: () => number;
    getAU: () => number;
    getSolarMass: () => number;
    getEarthMass: () => number;
    circularVelocity: (mass: number, distance: number) => number;
    init: () => void;
}

interface BodyInfo {
    id: number;
    name: string;
    type: 'star' | 'planet' | 'moon' | 'asteroid' | 'spacecraft';
    mass: number;
    radius: number;
    color: number;
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
        console.log('📦 Loading WASM physics...');

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
            console.log('✅ WASM physics loaded');
            console.log(`   G = ${this.G} m³/(kg·s²)`);
            console.log(`   AU = ${this.AU} m`);
        } catch (error) {
            console.error('❌ Failed to load WASM:', error);
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

        console.log(`🌍 Created Sun-Earth-Moon system (${this.simulation.bodyCount()} bodies)`);
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
            }>;

            return bodies.map(b => ({
                id: b.id,
                name: b.name,
                type: this.parseBodyType(b.body_type),
                mass: b.mass,
                radius: b.radius,
                color: BODY_COLORS[b.name] ?? 0x888888,
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
        if (t.includes('spacecraft')) return 'spacecraft';
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
    createPreset(preset: string, seed: bigint): void {
        if (!this.initialized || !this.module) throw new Error('Physics not initialized');

        let loadedPreset = preset;

        switch (preset) {
            case 'innerSolarSystem':
                this.simulation = this.module.createInnerSolarSystem(seed);
                break;
            case 'fullSolarSystem':
                this.simulation = this.module.createFullSolarSystem(seed);
                break;
            case 'playableSolarSystem':
                if (typeof this.module.createPlayableSolarSystem === 'function') {
                    this.simulation = this.module.createPlayableSolarSystem(seed);
                } else {
                    console.warn('⚠️ Playable Solar System preset unavailable in WASM build. Falling back to Full Solar System.');
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
            default:
                this.simulation = this.module.createSunEarthMoon(seed);
        }

        // Set proper orbital mechanics timestep for all presets
        this.simulation.setDt(3600); // 1 hour per step
        this.simulation.setSubsteps(4);

        console.log(`🌍 Loaded preset: ${loadedPreset} (${this.simulation.bodyCount()} bodies, dt=3600s)`);
    }

    /** Add a custom body */
    addBody(body: {
        name: string;
        type: 'star' | 'planet' | 'moon' | 'asteroid';
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

        console.log(`➕ Added body: ${body.name} (id: ${id})`);
        return id;
    }

    /** Remove a body by ID */
    removeBody(id: number): void {
        if (!this.simulation) return;

        // Note: WASM doesn't have remove yet, would need to rebuild
        console.log(`➖ Remove body ${id} - not implemented in WASM yet`);
    }

    dispose(): void {
        if (this.simulation) {
            this.simulation.free();
        }
    }
}
