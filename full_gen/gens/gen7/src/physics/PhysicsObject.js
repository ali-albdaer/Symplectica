/**
 * Physics Object Base Class
 * All objects with physics properties extend this class
 */

import { Vector3D } from '../utils/Vector3D.js';

export class PhysicsObject {
    constructor(config = {}) {
        // Physical properties
        this.mass = config.mass || 1;
        this.position = Vector3D.from(config.position || { x: 0, y: 0, z: 0 });
        this.velocity = Vector3D.from(config.velocity || { x: 0, y: 0, z: 0 });
        this.acceleration = new Vector3D();
        
        // Force accumulator
        this.force = new Vector3D();
        
        // Properties
        this.radius = config.radius || 1;
        this.isStatic = config.isStatic || false;
        this.affectedByGravity = config.affectedByGravity !== undefined ? config.affectedByGravity : true;
        this.friction = config.friction || 0.5;
        this.restitution = config.restitution || 0.5; // bounciness
        
        // Rotation
        this.angularVelocity = new Vector3D();
        this.rotation = new Vector3D(); // Euler angles
        
        // Identifier
        this.id = config.id || Math.random().toString(36).substr(2, 9);
        this.name = config.name || 'PhysicsObject';
        
        // Three.js mesh reference (set later)
        this.mesh = null;
    }

    /**
     * Apply force to the object
     */
    applyForce(force) {
        if (!this.isStatic) {
            this.force.add(force);
        }
    }

    /**
     * Apply impulse (instant velocity change)
     */
    applyImpulse(impulse) {
        if (!this.isStatic) {
            const deltaV = Vector3D.multiply(impulse, 1 / this.mass);
            this.velocity.add(deltaV);
        }
    }

    /**
     * Update physics (called by physics engine)
     */
    update(deltaTime) {
        if (this.isStatic) return;

        // Calculate acceleration from forces (F = ma -> a = F/m)
        this.acceleration.copy(this.force).divideScalar(this.mass);

        // Update velocity: v = v + a * dt
        const deltaV = Vector3D.multiply(this.acceleration, deltaTime);
        this.velocity.add(deltaV);

        // Update position: p = p + v * dt
        const deltaP = Vector3D.multiply(this.velocity, deltaTime);
        this.position.add(deltaP);

        // Update rotation
        const deltaR = Vector3D.multiply(this.angularVelocity, deltaTime);
        this.rotation.add(deltaR);

        // Clear forces for next frame
        this.force.set(0, 0, 0);

        // Update Three.js mesh if it exists
        this.updateMesh();
    }

    /**
     * Update Three.js mesh transform
     */
    updateMesh() {
        if (this.mesh) {
            this.mesh.position.set(this.position.x, this.position.y, this.position.z);
            this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        }
    }

    /**
     * Get kinetic energy
     */
    getKineticEnergy() {
        return 0.5 * this.mass * this.velocity.magnitudeSquared();
    }

    /**
     * Get momentum
     */
    getMomentum() {
        return Vector3D.multiply(this.velocity, this.mass);
    }

    /**
     * Check collision with another object (sphere collision)
     */
    checkCollision(other) {
        const distance = this.position.distanceTo(other.position);
        const minDistance = this.radius + other.radius;
        return distance < minDistance;
    }

    /**
     * Resolve collision with another object
     */
    resolveCollision(other) {
        // Vector from this to other
        const normal = Vector3D.sub(other.position, this.position);
        const distance = normal.magnitude();
        
        if (distance === 0) return; // Objects are at same position
        
        normal.normalize();

        // Relative velocity
        const relativeVelocity = Vector3D.sub(this.velocity, other.velocity);
        const velocityAlongNormal = relativeVelocity.dot(normal);

        // Don't resolve if velocities are separating
        if (velocityAlongNormal > 0) return;

        // Calculate restitution (average of both objects)
        const restitution = (this.restitution + other.restitution) / 2;

        // Calculate impulse scalar
        const impulseScalar = -(1 + restitution) * velocityAlongNormal;
        const totalInvMass = (this.isStatic ? 0 : 1 / this.mass) + 
                            (other.isStatic ? 0 : 1 / other.mass);
        
        if (totalInvMass === 0) return; // Both static
        
        const j = impulseScalar / totalInvMass;

        // Apply impulse
        const impulse = Vector3D.multiply(normal, j);
        
        if (!this.isStatic) {
            this.velocity.add(Vector3D.multiply(impulse, 1 / this.mass));
        }
        
        if (!other.isStatic) {
            other.velocity.sub(Vector3D.multiply(impulse, 1 / other.mass));
        }

        // Positional correction to prevent sinking
        const overlap = (this.radius + other.radius) - distance;
        const correction = Vector3D.multiply(normal, overlap / 2);
        
        if (!this.isStatic) {
            this.position.sub(correction);
        }
        if (!other.isStatic) {
            other.position.add(correction);
        }
    }

    /**
     * Set position
     */
    setPosition(x, y, z) {
        this.position.set(x, y, z);
        this.updateMesh();
    }

    /**
     * Set velocity
     */
    setVelocity(x, y, z) {
        this.velocity.set(x, y, z);
    }

    /**
     * Reset forces
     */
    resetForces() {
        this.force.set(0, 0, 0);
    }

    /**
     * Get object state for debugging
     */
    getState() {
        return {
            id: this.id,
            name: this.name,
            position: this.position.toArray(),
            velocity: this.velocity.toArray(),
            mass: this.mass,
            kineticEnergy: this.getKineticEnergy(),
        };
    }
}

export default PhysicsObject;
