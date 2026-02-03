/**
 * TypeScript type definitions for the physics simulation
 */

/** 3D Vector */
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

/** Body type enumeration */
export type BodyType = 
    | 'Star'
    | 'Planet'
    | 'Moon'
    | 'Asteroid'
    | 'Comet'
    | 'Spacecraft'
    | 'TestParticle';

/** Collision handling mode */
export type CollisionMode = 'None' | 'InelasticMerge' | 'Elastic';

/** Integrator type */
export type IntegratorType = 
    | 'VelocityVerlet'
    | 'RK4'
    | 'RK45Adaptive'
    | 'GaussRadau';

/** Solver type */
export type SolverType = 'DirectSum' | 'BarnesHut' | 'FMM';

/** Body physical properties */
export interface BodyProperties {
    density: number;
    albedo: number;
    temperature?: number;
    rotationPeriod?: number;
    axialTilt?: number;
}

/** Body visual properties */
export interface BodyVisuals {
    color: number;
    texture?: string;
    emission: number;
    hasAtmosphere: boolean;
    atmosphereHeight: number;
    atmosphereColor: number;
    rings?: [number, number];
}

/** Full body definition */
export interface Body {
    id: string;
    name: string;
    bodyType: BodyType;
    mass: number;
    radius: number;
    position: Vec3;
    velocity: Vec3;
    fixed: boolean;
    active: boolean;
    properties: BodyProperties;
    visuals: BodyVisuals;
    parentId?: string;
    soiRadius: number;
    ownerId?: string;
}

/** Compact body state for network */
export interface BodyState {
    id: string;
    position: [number, number, number];
    velocity: [number, number, number];
    mass: number;
    radius: number;
    active: boolean;
}

/** Accuracy tolerance configuration */
export interface AccuracyTolerances {
    earthOrbitalPeriodPct: number;
    positionalErrorMetersAfter1Orbit: number;
    energyDriftPercentAfter100Orbits: number;
}

/** Simulation configuration */
export interface SimConfig {
    dt: number;
    maxSubsteps: number;
    tickRate: number;
    softening: number;
    maxMassiveBodies: number;
    maxTotalObjects: number;
    recenterThreshold: number;
    collisionMode: CollisionMode;
    integrator: IntegratorType;
    solver: SolverType;
    tolerances: AccuracyTolerances;
    monitorEnergy: boolean;
    monitorMomentum: boolean;
    barnesHutTheta: number;
    closeEncounterThreshold: number;
    integratorSwitchThreshold: number;
}

/** PRNG state for serialization */
export interface PrngState {
    state: bigint;
    inc: bigint;
}

/** Checkpoint metrics */
export interface CheckpointMetrics {
    kineticEnergy: number;
    potentialEnergy: number;
    totalEnergy: number;
    energyDriftPercent: number;
    totalMomentum: number;
    centerOfMass: [number, number, number];
    activeBodyCount: number;
    collisionCount: number;
}

/** Full checkpoint */
export interface Checkpoint {
    version: string;
    timestamp: number;
    sequence: number;
    tick: number;
    simTime: number;
    prngState: PrngState;
    bodies: Body[];
    config: SimConfig;
    originOffset: [number, number, number];
    metrics?: CheckpointMetrics;
    metadata?: Record<string, unknown>;
}

/** Network snapshot (compact) */
export interface NetworkSnapshot {
    seq: number;
    tick: number;
    time: number;
    timestamp: number;
    bodies: BodyState[];
    origin: [number, number, number];
}

/** Collision event */
export interface CollisionEvent {
    body1Id: string;
    body2Id: string;
    position: Vec3;
    relativeVelocity: number;
    mergedMass: number;
    tick: number;
    merged: boolean;
}

/** Simulation step result */
export interface StepResult {
    tick: number;
    simTime: number;
    substeps: number;
    recentered: boolean;
    energyDriftPercent?: number;
    collisionCount: number;
}

/** Energy monitor data */
export interface EnergyMetrics {
    initialEnergy: number;
    currentEnergy: number;
    drift: number;
    driftPercent: number;
    kinetic: number;
    potential: number;
}

/** Momentum monitor data */
export interface MomentumMetrics {
    initialMomentum: [number, number, number];
    currentMomentum: [number, number, number];
    drift: number;
}

/** Server message types */
export type ServerMessageType = 
    | 'snapshot'
    | 'fullState'
    | 'collision'
    | 'chat'
    | 'playerJoin'
    | 'playerLeave'
    | 'error'
    | 'config';

/** Client message types */
export type ClientMessageType =
    | 'join'
    | 'input'
    | 'chat'
    | 'spawn'
    | 'command';

/** Base server message */
export interface ServerMessage {
    type: ServerMessageType;
    seq: number;
    timestamp: number;
}

/** Snapshot message */
export interface SnapshotMessage extends ServerMessage {
    type: 'snapshot';
    snapshot: NetworkSnapshot;
}

/** Full state message */
export interface FullStateMessage extends ServerMessage {
    type: 'fullState';
    checkpoint: Checkpoint;
}

/** Base client message */
export interface ClientMessage {
    type: ClientMessageType;
    seq: number;
}

/** Join message */
export interface JoinMessage extends ClientMessage {
    type: 'join';
    playerName: string;
}

/** Input message */
export interface InputMessage extends ClientMessage {
    type: 'input';
    thrust: Vec3;
    rotation?: Vec3;
}

/** Chat message */
export interface ChatMessage {
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
}

/** World preset metadata */
export interface WorldPreset {
    id: string;
    name: string;
    description: string;
    bodies: Body[];
    config?: Partial<SimConfig>;
    metadata?: Record<string, unknown>;
}

/** Player info */
export interface Player {
    id: string;
    name: string;
    spacecraftId?: string;
    joinedAt: number;
    ping: number;
}

/** Helper functions for creating vectors */
export function vec3(x: number, y: number, z: number): Vec3 {
    return { x, y, z };
}

export function vec3Zero(): Vec3 {
    return { x: 0, y: 0, z: 0 };
}

export function vec3FromArray(arr: [number, number, number]): Vec3 {
    return { x: arr[0], y: arr[1], z: arr[2] };
}

export function vec3ToArray(v: Vec3): [number, number, number] {
    return [v.x, v.y, v.z];
}

export function vec3Add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function vec3Scale(v: Vec3, s: number): Vec3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function vec3Magnitude(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function vec3Normalize(v: Vec3): Vec3 {
    const mag = vec3Magnitude(v);
    if (mag < Number.EPSILON) return vec3Zero();
    return vec3Scale(v, 1 / mag);
}

export function vec3Distance(a: Vec3, b: Vec3): number {
    return vec3Magnitude(vec3Sub(a, b));
}

export function vec3Lerp(a: Vec3, b: Vec3, t: number): Vec3 {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t
    };
}
