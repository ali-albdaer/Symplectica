/**
 * Conservation / Drift Monitor
 *
 * Tracks energy, linear momentum, angular momentum, and center-of-mass drift
 * relative to initial values captured at preset load. Displays live values and
 * fractional drift with color-coded thresholds. Integrated into the Simulation
 * Monitor panel (keybind '1').
 */

import { PhysicsClient } from './physics';

/** Snapshot of conserved quantities at a reference point in time. */
interface ConservationSnapshot {
    energy: number;
    kineticEnergy: number;
    potentialEnergy: number;
    momentumMag: number;
    angularMomentumMag: number;
    /** Characteristic momentum scale: sqrt(2 * totalMass * KE). */
    characteristicMomentum: number;
    comX: number;
    comY: number;
    comZ: number;
    tick: number;
}

/** Current drift values (fractional or absolute). */
export interface DriftValues {
    energyDrift: number;        // ΔE / |E₀|
    momentumDrift: number;      // Δ|p| / scale
    angularDrift: number;       // Δ|L| / |L₀|
    comDrift: number;           // |ΔCoM| in meters
    kineticEnergy: number;
    potentialEnergy: number;
    totalEnergy: number;
    momentumMag: number;
    angularMag: number;
    stepsSinceReset: number;
}

function vec3Mag(arr: Float64Array): number {
    return Math.sqrt(arr[0] * arr[0] + arr[1] * arr[1] + arr[2] * arr[2]);
}

export class DriftMonitor {
    private ref: ConservationSnapshot | null = null;

    // DOM element cache
    private els: Record<string, HTMLElement | null> = {};

    constructor() {
        this.cacheElements();
    }

    private cacheElements(): void {
        const ids = [
            'drift-energy', 'drift-momentum', 'drift-angular',
            'drift-com', 'drift-ke', 'drift-pe', 'drift-total-e',
            'drift-momentum-abs', 'drift-angular-abs', 'drift-steps',
        ];
        for (const id of ids) {
            this.els[id] = document.getElementById(id);
        }
    }

    /** Capture reference snapshot from current simulation state. */
    reset(physics: PhysicsClient, tick: number): void {
        const mom = physics.totalMomentum();
        const angMom = physics.angularMomentum();
        const com = physics.centerOfMass();
        const ke = physics.kineticEnergy();

        // Characteristic momentum from system KE and total mass.
        // For a body of mass M with KE = ½Mv², p = Mv = sqrt(2·M·KE).
        // Sum of body masses is approximated from KE + PE via virial theorem,
        // but we can get it directly from the bodies list.
        const bodies = physics.getBodies();
        const totalMass = bodies.reduce((sum, b) => sum + b.mass, 0);

        this.ref = {
            energy: physics.totalEnergy(),
            kineticEnergy: ke,
            potentialEnergy: physics.potentialEnergy(),
            momentumMag: vec3Mag(mom),
            angularMomentumMag: vec3Mag(angMom),
            characteristicMomentum: Math.sqrt(2 * totalMass * Math.abs(ke)),
            comX: com[0],
            comY: com[1],
            comZ: com[2],
            tick,
        };
    }

    /** Compute current drift values without touching the DOM. */
    compute(physics: PhysicsClient, currentTick: number): DriftValues | null {
        if (!this.ref) return null;

        const e = physics.totalEnergy();
        const ke = physics.kineticEnergy();
        const pe = physics.potentialEnergy();
        const mom = physics.totalMomentum();
        const angMom = physics.angularMomentum();
        const com = physics.centerOfMass();

        const momMag = vec3Mag(mom);
        const angMag = vec3Mag(angMom);

        // Energy drift: ΔE / |E₀|
        const energyDrift = this.ref.energy !== 0
            ? (e - this.ref.energy) / Math.abs(this.ref.energy)
            : 0;

        // Momentum drift: absolute change / characteristic momentum of the system.
        // In barycentric frames |p| ≈ 0, so dividing by |p| is meaningless.
        // Instead use sqrt(2·M·KE) which represents a typical body-scale momentum.
        const momScale = Math.max(this.ref.characteristicMomentum, 1e-30);
        const momentumDrift = Math.abs(momMag - this.ref.momentumMag) / momScale;

        // Angular momentum drift: Δ|L| / |L₀|
        const angScale = Math.max(this.ref.angularMomentumMag, 1e-30);
        const angularDrift = Math.abs(angMag - this.ref.angularMomentumMag) / angScale;

        // CoM drift in meters
        const dx = com[0] - this.ref.comX;
        const dy = com[1] - this.ref.comY;
        const dz = com[2] - this.ref.comZ;
        const comDrift = Math.sqrt(dx * dx + dy * dy + dz * dz);

        return {
            energyDrift,
            momentumDrift,
            angularDrift,
            comDrift,
            kineticEnergy: ke,
            potentialEnergy: pe,
            totalEnergy: e,
            momentumMag: momMag,
            angularMag: angMag,
            stepsSinceReset: currentTick - this.ref.tick,
        };
    }

    /** Update the DOM with current drift values. */
    update(physics: PhysicsClient, currentTick: number): void {
        const drift = this.compute(physics, currentTick);
        if (!drift) return;

        this.setDriftCell('drift-energy', drift.energyDrift);
        this.setDriftCell('drift-momentum', drift.momentumDrift);
        this.setDriftCell('drift-angular', drift.angularDrift);

        // CoM drift in AU for readability
        const AU = 1.496e11;
        const comEl = this.els['drift-com'];
        if (comEl) {
            comEl.textContent = drift.comDrift < AU
                ? `${(drift.comDrift / 1e3).toExponential(2)} km`
                : `${(drift.comDrift / AU).toExponential(2)} AU`;
        }

        const keEl = this.els['drift-ke'];
        if (keEl) keEl.textContent = drift.kineticEnergy.toExponential(4) + ' J';

        const peEl = this.els['drift-pe'];
        if (peEl) peEl.textContent = drift.potentialEnergy.toExponential(4) + ' J';

        const teEl = this.els['drift-total-e'];
        if (teEl) teEl.textContent = drift.totalEnergy.toExponential(4) + ' J';

        const momEl = this.els['drift-momentum-abs'];
        if (momEl) momEl.textContent = drift.momentumMag.toExponential(3) + ' kg·m/s';

        const angEl = this.els['drift-angular-abs'];
        if (angEl) angEl.textContent = drift.angularMag.toExponential(3) + ' kg·m²/s';

        const stepsEl = this.els['drift-steps'];
        if (stepsEl) stepsEl.textContent = drift.stepsSinceReset.toLocaleString();
    }

    /** Set a drift cell value with color coding. */
    private setDriftCell(id: string, drift: number): void {
        const el = this.els[id];
        if (!el) return;

        const abs = Math.abs(drift);
        el.textContent = drift.toExponential(2);

        if (abs < 1e-10) {
            el.style.color = '#4caf50'; // green — machine precision
        } else if (abs < 1e-6) {
            el.style.color = '#8bc34a'; // light green — excellent
        } else if (abs < 1e-3) {
            el.style.color = '#ff9800'; // orange — acceptable
        } else {
            el.style.color = '#f44336'; // red — significant drift
        }
    }
}
