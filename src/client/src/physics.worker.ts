/// <reference lib="webworker" />

import { APP_DEFAULTS } from './defaults';
import type { SimMode } from './defaults';

// We need to define types for the WASM module
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
    kineticEnergy(): number;
    potentialEnergy(): number;
    totalMomentum(): Float64Array;
    centerOfMass(): Float64Array;
    angularMomentum(): Float64Array;
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
    setCloseEncounterIntegrator(name: string): void;
    setCloseEncounterThresholds(hillFactor: number, tidalRatio: number, jerkNorm: number): void;
    setCloseEncounterLimits(maxSubsetSize: number, maxTrialSubsteps: number): void;
    setCloseEncounterRk45Tolerances(absTol: number, relTol: number): void;
    setCloseEncounterGaussRadau(maxIters: number, tol: number): void;
    takeCloseEncounterEvents(): string;
    random(): number;
    free(): void;
};

interface PhysicsModule {
    default: (input?: RequestInfo | BufferSource | WebAssembly.Module) => Promise<unknown>;
    WasmSimulation: new (seed: bigint) => WasmSimulation;
    createSunEarthMoon: (seed: bigint) => WasmSimulation;
    createInnerSolarSystem: (seed: bigint) => WasmSimulation;
    createFullSolarSystemII: (seed: bigint) => WasmSimulation;
    createFullSolarSystemIIBarycentric: (seed: bigint) => WasmSimulation;
    createFullSolarSystemIII: (seed: bigint) => WasmSimulation;
    createFullSolarSystemIIIBarycentric: (seed: bigint) => WasmSimulation;
    createFullSolarSystemIV: (seed: bigint) => WasmSimulation;
    createFullSolarSystemIVBarycentric: (seed: bigint) => WasmSimulation;
    createSolarCentauriI: (seed: bigint) => WasmSimulation;
    createSolarCentauriIBarycentric: (seed: bigint) => WasmSimulation;
    createPlayableSolarSystem: (seed: bigint) => WasmSimulation;
    createJupiterSystem: (seed: bigint) => WasmSimulation;
    createSaturnSystem: (seed: bigint) => WasmSimulation;
    createAlphaCentauri: (seed: bigint) => WasmSimulation;
    createTrappist1: (seed: bigint) => WasmSimulation;
    createBinaryPulsar: (seed: bigint) => WasmSimulation;
    createAsteroidBelt: (seed: bigint, asteroidCount: number) => WasmSimulation;
    createStarCluster: (seed: bigint, starCount: number) => WasmSimulation;
    createStressTest: (seed: bigint, starCount: number, planetCount: number, asteroidCount: number) => WasmSimulation;
    createIntegratorTest1: (seed: bigint) => WasmSimulation;
    createIntegratorTest2: (seed: bigint) => WasmSimulation;
    createIntegratorTest3: (seed: bigint) => WasmSimulation;
    getG: () => number;
    getAU: () => number;
    getSolarMass: () => number;
    getEarthMass: () => number;
    circularVelocity: (mass: number, distance: number) => number;
    init: () => void;
}

const TICK_RATE = 60; // 60Hz tick loop
const ENERGY_CALC_INTERVAL = 1000; // Recalculate energy once per second

let physics: PhysicsModule | null = null;
let simulation: WasmSimulation | null = null;
let tickInterval: ReturnType<typeof setInterval> | null = null;
let lastTime = 0;
let simAccumulator = 0;
let tickAccumulator = 0;
let lastEnergyCalcTime = 0;
let lastCalculatedEnergy = 0;

let adminState = { ...APP_DEFAULTS.adminDefaults };

// We need an array of state to post back to the main thread
export type WorkerStatePayload = {
    type: 'state';
    tick: bigint;
    time: number;
    positions: Float64Array;
    velocities: Float64Array;
    energy: number;
    kineticEnergy: number;
    potentialEnergy: number;
    totalMomentum: Float64Array;
    angularMomentum: Float64Array;
    centerOfMass: Float64Array;
    bodyCount: number;
};

export type WorkerBodiesPayload = {
    type: 'bodies';
    json: string;
};

export type WorkerMessage = 
    | { type: 'init'; seed: bigint }
    | { type: 'createEmpty'; seed: bigint }
    | { type: 'loadPreset'; preset: string; seed: bigint; barycentric?: boolean; bodyCount?: number; stressTestCounts?: { stars: number; planets: number; asteroids: number } }
    | { type: 'updateAdminState'; state: Partial<typeof adminState> }
    | { type: 'addBody'; name: string; bodyType: number; mass: number; radius: number; x: number; y: number; z: number; vx: number; vy: number; vz: number }
    | { type: 'addBodyFromJson'; json: string }
    | { type: 'removeBody'; id: number }
    | { type: 'getBodies' };


async function initWasm() {
    try {
        const physicsModule = await import('../../physics-core/pkg/physics_core.js');
        await physicsModule.default();
        physicsModule.init();
        physics = physicsModule as unknown as PhysicsModule;
        self.postMessage({ type: 'ready' });
    } catch (e) {
        console.error("Failed to load WASM in worker", e);
        self.postMessage({ type: 'error', error: String(e) });
    }
}

function startTickLoop() {
    if (tickInterval) clearInterval(tickInterval);
    lastTime = performance.now();
    
    // Force initial energy calculation
    if (simulation) {
        lastCalculatedEnergy = simulation.totalEnergy();
    }
    lastEnergyCalcTime = lastTime;

    tickInterval = setInterval(() => {
        if (!simulation) return;

        const now = performance.now();
        const delta = now - lastTime;
        lastTime = now;

        let stepsTaken = 0;

        if (!adminState.paused) {
            if (adminState.simMode === 'accumulator') {
                simAccumulator += (delta / 1000) * adminState.timeScale;
                const maxSteps = 100;
                let steps = Math.floor(simAccumulator / adminState.dt);
                
                if (steps > maxSteps) {
                    steps = maxSteps;
                    simAccumulator = Math.min(simAccumulator, maxSteps * adminState.dt);
                }
                
                if (steps > 0) {
                    simulation.stepN(BigInt(steps));
                    simAccumulator -= steps * adminState.dt;
                    stepsTaken = steps;
                }
            } else if (adminState.simMode === 'hybrid') {
                simAccumulator += (delta / 1000) * adminState.timeScale;
                const maxSteps = adminState.hybridMaxSteps || 50;
                let currentDt = adminState.dt;
                
                if (adminState.hybridBudgeted) {
                    const budgetMs = 10;
                    const start = performance.now();
                    
                    simulation.setDt(currentDt);
                    // Batch in 10s to minimize boundary crossing overhead
                    while (simAccumulator >= currentDt * 10 && performance.now() - start < budgetMs) {
                        simulation.stepN(10n);
                        simAccumulator -= currentDt * 10;
                        stepsTaken += 10;
                    }
                    // Clean up remaining steps
                    while (simAccumulator >= currentDt && performance.now() - start < budgetMs) {
                        simulation.stepN(1n);
                        simAccumulator -= currentDt;
                        stepsTaken += 1;
                    }
                    
                    // If budget was exceeded and we STILL have accumulated time, we must scale dt 
                    // and take one massive step to stay in sync with real-time warp speed.
                    if (simAccumulator >= currentDt) {
                        const scaledDt = simAccumulator;
                        simulation.setDt(scaledDt);
                        simulation.stepN(1n);
                        simAccumulator = 0;
                        stepsTaken += 1;
                        
                        // Restore base timestep
                        simulation.setDt(adminState.dt);
                    }
                } else {
                    let steps = Math.floor(simAccumulator / adminState.dt);
                    if (steps > maxSteps) {
                        currentDt = simAccumulator / maxSteps;
                        steps = maxSteps;
                        simAccumulator = 0; // Consume everything
                    } else {
                        simAccumulator -= steps * adminState.dt;
                    }
                    
                    if (steps > 0) {
                        simulation.setDt(currentDt);
                        simulation.stepN(BigInt(steps));
                        stepsTaken = steps;
                        // Restore base timestep
                        simulation.setDt(adminState.dt);
                    }
                }
            } else {
                // Tick-Scaled mode
                const tickIntervalSec = 1 / TICK_RATE;
                tickAccumulator += (delta / 1000);
                
                const maxSteps = 10;
                let steps = Math.floor(tickAccumulator / tickIntervalSec);
                
                if (steps > maxSteps) {
                    steps = maxSteps;
                    tickAccumulator = Math.min(tickAccumulator, maxSteps * tickIntervalSec);
                }
                
                if (steps > 0) {
                    const tickDt = adminState.timeScale / TICK_RATE;
                    simulation.setDt(tickDt);
                    simulation.stepN(BigInt(steps));
                    tickAccumulator -= steps * tickIntervalSec;
                    stepsTaken = steps;
                    // Restore base timestep
                    simulation.setDt(adminState.dt);
                }
            }
        }

        broadcastState();
    }, 1000 / TICK_RATE);
}

function broadcastState() {
    if (!simulation) return;

    const now = performance.now();
    if (now - lastEnergyCalcTime > ENERGY_CALC_INTERVAL) {
        lastCalculatedEnergy = simulation.totalEnergy();
        lastEnergyCalcTime = now;
    }

    const positions = simulation.getPositions();
    const velocities = simulation.getVelocities();
    
    // We need to copy positions and velocities into new arrays that we can transfer
    const posCopy = new Float64Array(positions);
    const velCopy = new Float64Array(velocities);

    // Always compute ke, pe, mom, angMom, com
    // They are relatively cheap compared to energy O(N^2)
    const ke = simulation.kineticEnergy();
    const pe = simulation.potentialEnergy();
    const mom = simulation.totalMomentum();
    const angMom = simulation.angularMomentum();
    const com = simulation.centerOfMass();

    const payload: WorkerStatePayload = {
        type: 'state',
        tick: simulation.tick(),
        time: simulation.time(),
        positions: posCopy,
        velocities: velCopy,
        energy: lastCalculatedEnergy,
        kineticEnergy: ke,
        potentialEnergy: pe,
        totalMomentum: new Float64Array(mom),
        angularMomentum: new Float64Array(angMom),
        centerOfMass: new Float64Array(com),
        bodyCount: simulation.bodyCount()
    };

    self.postMessage(payload, [
        posCopy.buffer, 
        velCopy.buffer,
        payload.totalMomentum.buffer,
        payload.angularMomentum.buffer,
        payload.centerOfMass.buffer
    ]);
}

function broadcastBodies() {
    if (!simulation) return;
    const payload: WorkerBodiesPayload = {
        type: 'bodies',
        json: simulation.getBodiesJson()
    };
    self.postMessage(payload);
}

function applyAdminState() {
    if (!simulation) return;
    simulation.setDt(adminState.dt);
    simulation.setSubsteps(adminState.substeps);
    if (adminState.forceMethod === 'barnes-hut') {
        simulation.setTheta(adminState.theta);
        simulation.useBarnesHut();
    } else {
        simulation.useDirectForce();
    }
    simulation.setCloseEncounterIntegrator(adminState.closeEncounterIntegrator as any);
    simulation.setCloseEncounterThresholds(
        adminState.closeEncounterHillFactor,
        adminState.closeEncounterTidalRatio,
        adminState.closeEncounterJerkNorm
    );
    simulation.setCloseEncounterLimits(
        adminState.closeEncounterMaxSubsetSize,
        adminState.closeEncounterMaxTrialSubsteps
    );
    simulation.setCloseEncounterRk45Tolerances(
        adminState.closeEncounterRk45AbsTol,
        adminState.closeEncounterRk45RelTol
    );
    simulation.setCloseEncounterGaussRadau(
        adminState.closeEncounterGaussRadauMaxIters,
        adminState.closeEncounterGaussRadauTol
    );
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
    const msg = e.data;
    if (msg.type === 'init') {
        if (!physics) return;
        if (simulation) simulation.free();
        simulation = new physics.WasmSimulation(msg.seed);
        applyAdminState();
        broadcastState();
        startTickLoop();
    } else if (msg.type === 'loadPreset') {
        if (!physics) return;
        if (simulation) simulation.free();
        
        const preset = msg.preset;
        const seed = msg.seed;
        const barycentric = msg.barycentric ?? false;

        switch (preset) {
            case 'integratorTest1': simulation = physics.createIntegratorTest1(seed); break;
            case 'integratorTest2': simulation = physics.createIntegratorTest2(seed); break;
            case 'integratorTest3': simulation = physics.createIntegratorTest3(seed); break;
            case 'innerSolarSystem': simulation = physics.createInnerSolarSystem(seed); break;
            case 'fullSolarSystemII':
                if (barycentric && typeof physics.createFullSolarSystemIIBarycentric === 'function') simulation = physics.createFullSolarSystemIIBarycentric(seed);
                else if (typeof physics.createFullSolarSystemII === 'function') simulation = physics.createFullSolarSystemII(seed);
                else simulation = physics.createSunEarthMoon(seed);
                break;
            case 'fullSolarSystemIII':
                if (barycentric && typeof physics.createFullSolarSystemIIIBarycentric === 'function') simulation = physics.createFullSolarSystemIIIBarycentric(seed);
                else if (typeof physics.createFullSolarSystemIII === 'function') simulation = physics.createFullSolarSystemIII(seed);
                else simulation = physics.createSunEarthMoon(seed);
                break;
            case 'fullSolarSystemIV':
                if (barycentric && typeof physics.createFullSolarSystemIVBarycentric === 'function') simulation = physics.createFullSolarSystemIVBarycentric(seed);
                else if (typeof physics.createFullSolarSystemIV === 'function') simulation = physics.createFullSolarSystemIV(seed);
                else simulation = physics.createSunEarthMoon(seed);
                break;
            case 'solarCentauriI':
                if (barycentric && typeof physics.createSolarCentauriIBarycentric === 'function') simulation = physics.createSolarCentauriIBarycentric(seed);
                else if (typeof physics.createSolarCentauriI === 'function') simulation = physics.createSolarCentauriI(seed);
                else simulation = physics.createSunEarthMoon(seed);
                break;
            case 'playableSolarSystem':
                if (typeof physics.createPlayableSolarSystem === 'function') simulation = physics.createPlayableSolarSystem(seed);
                else simulation = physics.createSunEarthMoon(seed);
                break;
            case 'jupiterSystem': simulation = physics.createJupiterSystem(seed); break;
            case 'saturnSystem': simulation = physics.createSaturnSystem(seed); break;
            case 'alphaCentauri': simulation = physics.createAlphaCentauri(seed); break;
            case 'trappist1': simulation = physics.createTrappist1(seed); break;
            case 'binaryPulsar': simulation = physics.createBinaryPulsar(seed); break;
            case 'asteroidBelt': 
                if (typeof physics.createAsteroidBelt === 'function') simulation = physics.createAsteroidBelt(seed, msg.bodyCount ?? 5000);
                else simulation = physics.createSunEarthMoon(seed);
                break;
            case 'starCluster':
                if (typeof physics.createStarCluster === 'function') simulation = physics.createStarCluster(seed, msg.bodyCount ?? 2000);
                else simulation = physics.createSunEarthMoon(seed);
                break;
            case 'stressTest':
                if (typeof physics.createStressTest === 'function') {
                    const counts = msg.stressTestCounts || { stars: 30, planets: 100, asteroids: 0 };
                    simulation = physics.createStressTest(seed, counts.stars, counts.planets, counts.asteroids);
                }
                else simulation = physics.createSunEarthMoon(seed);
                break;
            default:
                simulation = physics.createSunEarthMoon(seed);
        }

        applyAdminState();
        broadcastState();
        startTickLoop();
        broadcastBodies();
    } else if (msg.type === 'createEmpty') {
        if (!physics) return;
        if (simulation) simulation.free();
        simulation = new physics.WasmSimulation(msg.seed);
        applyAdminState();
        broadcastState();
        startTickLoop();
        broadcastBodies();
    } else if (msg.type === 'updateAdminState') {
        adminState = { ...adminState, ...msg.state };
        applyAdminState();
    } else if (msg.type === 'addBody') {
        if (!simulation) return;
        simulation.addBody(msg.name, msg.bodyType, msg.mass, msg.radius, msg.x, msg.y, msg.z, msg.vx, msg.vy, msg.vz);
        broadcastBodies();
    } else if (msg.type === 'addBodyFromJson') {
        if (!simulation) return;
        simulation.addBodyFromJson(msg.json);
        broadcastBodies();
    } else if (msg.type === 'removeBody') {
        if (!simulation) return;
        simulation.removeBody(msg.id);
        broadcastBodies();
    } else if (msg.type === 'getBodies') {
        broadcastBodies();
    }
};

initWasm();
