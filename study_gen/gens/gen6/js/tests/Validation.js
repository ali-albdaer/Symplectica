import { Integrator } from '../physics/Integrator.js';
import { Body } from '../state/StateManager.js';
import { Vec3 } from '../utils/MathUtils.js';
import { PHYS } from '../utils/Constants.js';

// Standalone validation script for Physics Engine
// To run: Import this module in main.js or separate test runner
export function validateIntegrator() {
    console.log("Starting Integrator Validation...");

    // Setup Mock Engine
    const mockEngine = {
        computeForces: (bodies) => {
             // 2-Body Kepler Problem only
             const b1 = bodies[0];
             const b2 = bodies[1];
             const dx = b2.pos.x - b1.pos.x;
             const dy = b2.pos.y - b1.pos.y;
             const dz = b2.pos.z - b1.pos.z;
             const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
             const fMag = (PHYS.G * b1.mass * b2.mass) / (dist*dist);
             
             const fx = fMag * (dx/dist);
             const fy = fMag * (dy/dist);
             const fz = fMag * (dz/dist);
             
             b1.acc.set(fx/b1.mass, fy/b1.mass, fz/b1.mass);
             b2.acc.set(-fx/b2.mass, -fy/b2.mass, -fz/b2.mass);
        }
    };

    const integrator = new Integrator(mockEngine);
    integrator.setMethod('p_sym'); // 4th Order Symplectic

    // Setup 2 Bodies (Earth - Sun)
    const sun = new Body({ mass: PHYS.MASS_SUN, pos: {x:0,y:0,z:0}, vel: {x:0,y:0,z:0} });
    const earth = new Body({ mass: PHYS.MASS_EARTH, pos: {x:PHYS.AU,y:0,z:0}, vel: {x:0,y:29780,z:0} });
    const bodies = [sun, earth];

    // Initial Energy
    const getEnergy = () => {
        const v2 = earth.vel.lengthSq();
        const r = earth.pos.distanceTo(sun.pos);
        const KE = 0.5 * earth.mass * v2;
        const PE = -(PHYS.G * sun.mass * earth.mass) / r; // Sun doesn't move really
        return KE + PE;
    };

    const E0 = getEnergy();
    console.log(`Initial Energy: ${E0}`);

    // Run for 1 orbit (approx 1 year)
    const dt = 86400; // 1 day steps
    const steps = 365;
    
    for(let i=0; i<steps; i++) {
        integrator.step(bodies, dt);
    }

    const E_final = getEnergy();
    console.log(`Final Energy (1 year): ${E_final}`);
    console.log(`Energy Error: ${Math.abs((E_final - E0)/E0)}`);
    
    // Assert
    if (Math.abs((E_final - E0)/E0) < 1e-9) {
        console.log("PASS: Energy preserved to high precision.");
    } else {
        console.error("FAIL: Energy drift too high.");
    }
}