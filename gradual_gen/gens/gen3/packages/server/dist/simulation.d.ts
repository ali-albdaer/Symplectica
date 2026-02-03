/**
 * Server-side Simulation Wrapper
 *
 * This provides a JavaScript-native simulation for the server.
 * In production, this would load the native Rust binary or WASM.
 * For Phase I, we implement a pure TypeScript version.
 */
interface Vec3 {
    x: number;
    y: number;
    z: number;
}
export interface Body {
    id: string;
    name: string;
    bodyType: string;
    mass: number;
    radius: number;
    position: Vec3;
    velocity: Vec3;
    acceleration: Vec3;
    prevAcceleration: Vec3;
    fixed: boolean;
    active: boolean;
    ownerId?: string;
}
interface SimConfig {
    tickRate: number;
    dt: number;
    softening: number;
    maxSubsteps: number;
    collisionMode: string;
}
export declare class Simulation {
    private bodies;
    private config;
    private _tick;
    private _simTime;
    private _sequence;
    private initialized;
    constructor(options?: {
        tickRate?: number;
    });
    initialize(): Promise<void>;
    get tick(): bigint;
    get simTime(): number;
    get bodyCount(): number;
    getConfig(): SimConfig;
    addBody(bodyData: Partial<Body> & {
        id: string;
        name: string;
        mass: number;
        radius: number;
    }): void;
    removeBody(id: string): void;
    getBody(id: string): Body | undefined;
    getBodies(): Body[];
    getBodyIds(): string[];
    applyThrust(bodyId: string, thrust: Vec3): void;
    private initializeAccelerations;
    private computeAllAccelerations;
    private velocityVerletStep;
    private handleCollisions;
    private mergeBody;
    step(): void;
    reset(): void;
    createCheckpoint(): object;
    createSnapshot(): object;
    restoreCheckpoint(checkpoint: any): void;
    private computeMetrics;
}
export {};
//# sourceMappingURL=simulation.d.ts.map