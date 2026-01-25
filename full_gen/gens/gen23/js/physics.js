class PhysicsEngine {
    constructor() {
        this.bodies = [];
        this.G = window.Config.physics.G;
        this.softening = window.Config.physics.softening;
    }

    addBody(body) {
        this.bodies.push(body);
    }

    removeBody(body) {
        const index = this.bodies.indexOf(body);
        if (index > -1) {
            this.bodies.splice(index, 1);
        }
    }

    update(dt) {
        const substeps = window.Config.physics.substeps;
        const subDt = dt / substeps;

        for (let s = 0; s < substeps; s++) {
            this.step(subDt);
        }
    }

    step(dt) {
        // Reset forces
        for (const body of this.bodies) {
            body.acceleration.set(0, 0, 0);
        }

        // Calculate N-Body Gravity
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                if (bodyA.isStatic && bodyB.isStatic) continue;

                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const dz = bodyB.position.z - bodyA.position.z;

                const distSq = dx * dx + dy * dy + dz * dz;
                const dist = Math.sqrt(distSq);

                // F = G * m1 * m2 / r^2
                // a = F / m
                // a = G * m_other / r^2
                
                // Softening to avoid singularity
                const f = (this.G * bodyA.mass * bodyB.mass) / (distSq * dist + this.softening);

                const fx = f * dx;
                const fy = f * dy;
                const fz = f * dz;

                if (!bodyA.isStatic) {
                    bodyA.acceleration.x += fx / bodyA.mass;
                    bodyA.acceleration.y += fy / bodyA.mass;
                    bodyA.acceleration.z += fz / bodyA.mass;
                }

                if (!bodyB.isStatic) {
                    bodyB.acceleration.x -= fx / bodyB.mass;
                    bodyB.acceleration.y -= fy / bodyB.mass;
                    bodyB.acceleration.z -= fz / bodyB.mass;
                }
            }
        }

        // Integrate (Semi-implicit Euler)
        for (const body of this.bodies) {
            if (body.isStatic) continue;

            body.velocity.x += body.acceleration.x * dt;
            body.velocity.y += body.acceleration.y * dt;
            body.velocity.z += body.acceleration.z * dt;

            body.position.x += body.velocity.x * dt;
            body.position.y += body.velocity.y * dt;
            body.position.z += body.velocity.z * dt;
            
            // Update visual representation if it exists
            if (body.mesh) {
                body.mesh.position.copy(body.position);
            }
        }
    }
    
    // Helper to calculate orbital velocity for a circular orbit
    calculateOrbitalVelocity(body, centerBody) {
        const dx = body.position.x - centerBody.position.x;
        const dy = body.position.y - centerBody.position.y;
        const dz = body.position.z - centerBody.position.z;
        const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        // v = sqrt(GM / r)
        const v = Math.sqrt((this.G * centerBody.mass) / r);
        
        // Direction is cross product of radius and up vector (approx)
        // Or just tangent on the plane. Assuming planar orbits for simplicity initially.
        // Tangent vector (-z, 0, x) for orbit in XZ plane
        
        // More robust: Cross product of r and an arbitrary up vector (0,1,0)
        const rVec = new THREE.Vector3(dx, dy, dz);
        const up = new THREE.Vector3(0, 1, 0);
        const tan = new THREE.Vector3().crossVectors(rVec, up).normalize();
        
        return tan.multiplyScalar(v).add(centerBody.velocity);
    }
}

window.PhysicsEngine = PhysicsEngine;
