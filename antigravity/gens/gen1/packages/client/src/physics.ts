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
            // Load WASM from public folder
            this.module = await import('/physics_core.js') as PhysicsModule;

            // Initialize WASM
            await this.module.default('/physics_core_bg.wasm');
            this.module.init();

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

        // Configure for smooth 60fps rendering
        this.simulation.setDt(1.0 / 60.0);
        this.simulation.setSubsteps(4);

        console.log(`🌍 Created Sun-Earth-Moon system (${this.simulation.bodyCount()} bodies)`);
    }

    createNew(seed?: bigint): void {
        if (!this.initialized) throw new Error('Physics not initialized');

        this.simulation = new this.module.WasmSimulation(seed ?? BigInt(Date.now()));
        this.simulation.setDt(1.0 / 60.0);
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

    dispose(): void {
        if (this.simulation) {
            this.simulation.free();
        }
    }
}
