import { PHYS, SIM } from '../utils/Constants.js';
import { Integrator } from './Integrator.js';

export class PhysicsEngine {
    constructor() {
        this.integrator = new Integrator(this);
        this.useGRApprox = true; // Use Paczynski-Wiita
    }

    setIntegrator(type) {
        this.integrator.setMethod(type);
    }

    setPhysicsModel(model) {
        this.useGRApprox = (model === 'gr_approx');
    }

    // Step physics forward by dt seconds
    step(stateManager, dt) {
        if (dt <= 0) return;
        this.integrator.step(stateManager.bodies, dt);
        stateManager.time += dt;
        this.checkCollisions(stateManager.bodies);
    }

    computeForces(bodies) {
        const G = PHYS.G;
        const c2 = PHYS.c * PHYS.c;

        // Reset accelerations
        for (const b of bodies) {
            b.acc.set(0, 0, 0);
        }

        // N-Body O(N^2)
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const b1 = bodies[i];
                const b2 = bodies[j];

                const dx = b2.pos.x - b1.pos.x;
                const dy = b2.pos.y - b1.pos.y;
                const dz = b2.pos.z - b1.pos.z;

                const distSq = dx*dx + dy*dy + dz*dz;
                const dist = Math.sqrt(distSq);

                // Basic Softening to prevent div by zero
                const softenedDistSq = distSq + SIM.SOFTENING * SIM.SOFTENING;
                const softenedDist = Math.sqrt(softenedDistSq);

                let fMagnitude = (G * b1.mass * b2.mass) / softenedDistSq;

                // --- Paczynski-Wiita Potential for Compact Objects ---
                // If one of the bodies is a Black Hole or Neutron Star, modify the potential gradient
                // Force F = - dPhi/dr
                // Phi_PW = -GM / (r - rg)
                // F_PW = - GM / (r - rg)^2
                if (this.useGRApprox) {
                    if (b1.type === 'BLACK_HOLE' || b1.type === 'NEUTRON_STAR') {
                         const rg = (2 * G * b1.mass) / c2;
                         const r_eff = softenedDist - rg;
                         if (r_eff > 1000) { // Singularity guard
                             // Replacing the 1/r^2 term with 1/(r-rg)^2
                             fMagnitude = (G * b1.mass * b2.mass) / (r_eff * r_eff);
                         }
                    } 
                    
                    if (b2.type === 'BLACK_HOLE' || b2.type === 'NEUTRON_STAR') {
                        const rg = (2 * G * b2.mass) / c2;
                        const r_eff = softenedDist - rg;
                        if (r_eff > 1000) {
                             fMagnitude = (G * b1.mass * b2.mass) / (r_eff * r_eff);
                        }
                    }
                }

                const fx = fMagnitude * (dx / dist);
                const fy = fMagnitude * (dy / dist);
                const fz = fMagnitude * (dz / dist);

                b1.acc.x += fx / b1.mass;
                b1.acc.y += fy / b1.mass;
                b1.acc.z += fz / b1.mass;

                b2.acc.x -= fx / b2.mass;
                b2.acc.y -= fy / b2.mass;
                b2.acc.z -= fz / b2.mass;
            }
        }
    }

    checkCollisions(bodies) {
        // Naive collision handling: if dist < r1 + r2, elastic bounce or merge?
        // For this sim, we will just log it or allow pass-through to avoid
        // complex momentum conservation logic overtaking the prompt's focus.
        // However, we should at least check for Roche limit disruption in future.
        // For now: no-op, focusing on orbital mechanics.
    }

    getDiagnostics(bodies) {
        let kin = 0;
        let pot = 0;

        for (let i = 0; i < bodies.length; i++) {
            const b = bodies[i];
            kin += 0.5 * b.mass * b.vel.lengthSq();

            for (let j = i + 1; j < bodies.length; j++) {
                const b2 = bodies[j];
                const d = b.pos.distanceTo(b2.pos);
                if (d > 0) {
                    pot -= (PHYS.G * b.mass * b2.mass) / d;
                }
            }
        }

        return {
            totalEnergy: kin + pot,
            kinetic: kin,
            potential: pot,
            count: bodies.length
        };
    }
}