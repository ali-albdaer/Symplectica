// js/physics.js
import * as THREE from 'three';
// Highly accurate n-body physics engine
export class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.G = 6.67430e-11; // Gravitational constant (m^3 kg^-1 s^-2)
        this.timeStep = 1; // seconds per simulation step (can be changed)
        this.running = true;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        this.bodies = this.bodies.filter(b => b !== body);
    }

    step() {
        if (!this.running) return;
        // Deep copy positions and velocities for accurate integration
        const positions = this.bodies.map(b => b.position.clone());
        const velocities = this.bodies.map(b => b.velocity.clone());
        const accelerations = this.bodies.map(() => new THREE.Vector3());
        // Calculate forces
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = 0; j < this.bodies.length; j++) {
                if (i === j) continue;
                const bi = this.bodies[i];
                const bj = this.bodies[j];
                const r = new THREE.Vector3().subVectors(positions[j], positions[i]);
                const distSq = Math.max(r.lengthSq(), (bi.radius + bj.radius) ** 2 * 1e-6); // avoid singularity
                const forceMag = this.G * bi.mass * bj.mass / distSq;
                const force = r.clone().normalize().multiplyScalar(forceMag / bi.mass);
                accelerations[i].add(force);
            }
        }
        // Update velocities and positions (simple symplectic Euler)
        for (let i = 0; i < this.bodies.length; i++) {
            velocities[i].add(accelerations[i].multiplyScalar(this.timeStep));
            positions[i].add(velocities[i].clone().multiplyScalar(this.timeStep));
        }
        // Commit updates
        for (let i = 0; i < this.bodies.length; i++) {
            this.bodies[i].velocity.copy(velocities[i]);
            this.bodies[i].position.copy(positions[i]);
        }
    }

    toggleRun() {
        this.running = !this.running;
    }

    reset() {
        this.bodies = [];
    }
}

// Celestial body template
export function createBody({
    name = 'Body',
    mass = 1e24,
    radius = 1e6,
    luminosity = 0,
    position = new THREE.Vector3(),
    velocity = new THREE.Vector3(),
    type = 'planet',
    texture = null
} = {}) {
    return {
        name,
        mass,
        radius,
        luminosity,
        position,
        velocity,
        type,
        texture
    };
}
