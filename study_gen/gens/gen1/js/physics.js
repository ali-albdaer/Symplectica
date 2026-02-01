// physics.js
// Accurate n-body physics engine for celestial mechanics

export class CelestialBody {
    constructor({name, type, mass, radius, luminosity, position, velocity, texture, color}) {
        this.name = name;
        this.type = type; // star, planet, etc.
        this.mass = mass;
        this.radius = radius;
        this.luminosity = luminosity || 0;
        this.position = position.clone(); // THREE.Vector3
        this.velocity = velocity.clone(); // THREE.Vector3
        this.texture = texture || null;
        this.color = color || 0xffffff;
        this.force = new THREE.Vector3();
    }
}

export class NBodySystem {
    constructor() {
        this.bodies = [];
        this.G = 6.67430e-11; // m^3 kg^-1 s^-2
        this.timeScale = 1; // simulation time scale
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        this.bodies = this.bodies.filter(b => b !== body);
    }

    // Symplectic Euler integrator for accuracy
    step(dt) {
        // Reset forces
        for (const body of this.bodies) {
            body.force.set(0, 0, 0);
        }
        // Calculate forces
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const a = this.bodies[i];
                const b = this.bodies[j];
                const r = new THREE.Vector3().subVectors(b.position, a.position);
                const distSq = Math.max(r.lengthSq(), (a.radius + b.radius) ** 2 * 1e-6); // avoid singularity
                const dist = Math.sqrt(distSq);
                const F = this.G * a.mass * b.mass / distSq;
                const forceVec = r.clone().normalize().multiplyScalar(F);
                a.force.add(forceVec);
                b.force.sub(forceVec);
            }
        }
        // Integrate velocities and positions
        for (const body of this.bodies) {
            const acc = body.force.clone().divideScalar(body.mass);
            body.velocity.add(acc.multiplyScalar(dt * this.timeScale));
            body.position.add(body.velocity.clone().multiplyScalar(dt * this.timeScale));
        }
    }
}
