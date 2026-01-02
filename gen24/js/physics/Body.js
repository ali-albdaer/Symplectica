import * as THREE from 'three';

export class Body {
    constructor(config) {
        this.mass = config.mass || 1;
        this.position = new THREE.Vector3(config.position.x, config.position.y, config.position.z);
        this.velocity = new THREE.Vector3(config.velocity.x, config.velocity.y, config.velocity.z);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.isFixed = config.fixed || false;
        this.name = config.name || "Unknown";
        this.mesh = null; // To be assigned by the renderer/entity system
    }

    update(dt) {
        if (this.isFixed) return;

        // Symplectic Euler / Semi-implicit Euler
        // v = v + a * dt
        // x = x + v * dt
        this.velocity.add(this.acceleration.clone().multiplyScalar(dt));
        this.position.add(this.velocity.clone().multiplyScalar(dt));
        
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
        
        // Reset acceleration for next step
        this.acceleration.set(0, 0, 0);
    }

    applyForce(force) {
        if (this.isFixed) return;
        // F = ma => a = F/m
        this.acceleration.add(force.clone().divideScalar(this.mass));
    }
}
