/**
 * PhysicsWorld.js - Physics Simulation Engine
 * 
 * Manages Cannon.js physics world and implements N-body gravitational interactions.
 * Uses a fixed timestep for stability with substeps for accuracy.
 */

import Config from './Config.js';

export class PhysicsWorld {
    constructor() {
        this.world = null;
        this.bodies = new Map(); // Maps Three.js mesh to Cannon.js body
        this.gravitationalBodies = []; // Bodies that exert gravitational force
        
        // Accumulator for fixed timestep
        this.accumulator = 0;
        this.fixedTimeStep = Config.physics.fixedTimeStep;
        
        // Contact materials
        this.materials = {
            default: null,
            ground: null,
            player: null,
        };
        
        this.contactMaterials = [];
    }

    /**
     * Initialize the physics world
     */
    init() {
        // Create Cannon.js world
        this.world = new CANNON.World();
        this.world.gravity.set(0, 0, 0); // No global gravity (we'll use N-body)
        
        // Broad-phase collision detection
        this.world.broadphase = new CANNON.NaiveBroadphase();
        
        // Solver iterations for stability
        this.world.solver.iterations = 10;
        
        // Create materials
        this.setupMaterials();
        
        console.log('PhysicsWorld initialized');
    }

    /**
     * Setup physics materials and contact materials
     */
    setupMaterials() {
        // Default material
        this.materials.default = new CANNON.Material('default');
        
        // Ground material (for planets)
        this.materials.ground = new CANNON.Material('ground');
        
        // Player material
        this.materials.player = new CANNON.Material('player');
        
        // Contact material between player and ground
        const playerGroundContact = new CANNON.ContactMaterial(
            this.materials.player,
            this.materials.ground,
            {
                friction: 0.4,
                restitution: 0.1,
            }
        );
        this.world.addContactMaterial(playerGroundContact);
        
        // Contact material between default objects
        const defaultContact = new CANNON.ContactMaterial(
            this.materials.default,
            this.materials.default,
            {
                friction: 0.3,
                restitution: 0.3,
            }
        );
        this.world.addContactMaterial(defaultContact);
    }

    /**
     * Add a physics body
     * @param {THREE.Object3D} mesh - The Three.js mesh
     * @param {CANNON.Body} body - The Cannon.js body
     * @param {boolean} isGravitational - Whether this body exerts gravitational force
     */
    addBody(mesh, body, isGravitational = false) {
        this.world.addBody(body);
        this.bodies.set(mesh, body);
        
        if (isGravitational) {
            this.gravitationalBodies.push({
                mesh: mesh,
                body: body,
                mass: body.mass,
            });
        }
    }

    /**
     * Remove a physics body
     */
    removeBody(mesh) {
        const body = this.bodies.get(mesh);
        if (body) {
            this.world.removeBody(body);
            this.bodies.delete(mesh);
            
            // Remove from gravitational bodies if present
            const index = this.gravitationalBodies.findIndex(gb => gb.mesh === mesh);
            if (index !== -1) {
                this.gravitationalBodies.splice(index, 1);
            }
        }
    }

    /**
     * Create a sphere physics body
     */
    createSphereBody(radius, mass, position, velocity, material = null) {
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: mass,
            position: new CANNON.Vec3(position[0], position[1], position[2]),
            velocity: new CANNON.Vec3(velocity[0], velocity[1], velocity[2]),
            shape: shape,
            material: material || this.materials.default,
            linearDamping: Config.physics.linearDamping,
            angularDamping: Config.physics.angularDamping,
        });
        
        return body;
    }

    /**
     * Create a box physics body
     */
    createBoxBody(dimensions, mass, position, velocity, material = null) {
        const halfExtents = new CANNON.Vec3(
            dimensions[0] / 2,
            dimensions[1] / 2,
            dimensions[2] / 2
        );
        const shape = new CANNON.Box(halfExtents);
        const body = new CANNON.Body({
            mass: mass,
            position: new CANNON.Vec3(position[0], position[1], position[2]),
            velocity: new CANNON.Vec3(velocity[0], velocity[1], velocity[2]),
            shape: shape,
            material: material || this.materials.default,
            linearDamping: Config.physics.linearDamping,
            angularDamping: Config.physics.angularDamping,
        });
        
        return body;
    }

    /**
     * Create a capsule physics body (for player)
     */
    createCapsuleBody(radius, height, mass, position, velocity) {
        // Cannon.js doesn't have a capsule, so we use a cylinder
        // For better collision, you can compose sphere + cylinder
        const shape = new CANNON.Cylinder(radius, radius, height, 8);
        const body = new CANNON.Body({
            mass: mass,
            position: new CANNON.Vec3(position[0], position[1], position[2]),
            velocity: new CANNON.Vec3(velocity[0], velocity[1], velocity[2]),
            material: this.materials.player,
            linearDamping: 0.3,
            angularDamping: 0.9,
            fixedRotation: false, // Allow rotation for proper physics
        });
        
        // Rotate the cylinder to be upright
        const quaternion = new CANNON.Quaternion();
        quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        body.addShape(shape, new CANNON.Vec3(0, 0, 0), quaternion);
        
        return body;
    }

    /**
     * Update physics simulation with fixed timestep
     */
    update(deltaTime) {
        // Clamp deltaTime to prevent spiral of death
        const clampedDelta = Math.min(deltaTime, 0.1);
        
        // Accumulator approach for fixed timestep
        this.accumulator += clampedDelta;
        
        while (this.accumulator >= this.fixedTimeStep) {
            // Apply N-body gravitational forces
            this.applyGravitationalForces();
            
            // Step the physics world
            this.world.step(this.fixedTimeStep);
            
            this.accumulator -= this.fixedTimeStep;
        }
        
        // Sync Three.js meshes with Cannon.js bodies
        this.syncMeshes();
    }

    /**
     * Apply N-body gravitational forces between all gravitational bodies
     * F = G * (m1 * m2) / r^2
     */
    applyGravitationalForces() {
        const G = Config.physics.G;
        const bodies = this.gravitationalBodies;
        
        // Reset forces (Cannon.js accumulates forces each step)
        // We only reset gravitational bodies' forces here
        for (const bodyData of bodies) {
            // Don't reset forces - let Cannon handle it
            // We'll just add gravitational forces
        }
        
        // Calculate pairwise gravitational attraction
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const body1 = bodies[i].body;
                const body2 = bodies[j].body;
                
                // Skip if either has zero mass (stars often are kinematic)
                if (body1.mass === 0 || body2.mass === 0) continue;
                
                // Calculate distance vector
                const dx = body2.position.x - body1.position.x;
                const dy = body2.position.y - body1.position.y;
                const dz = body2.position.z - body1.position.z;
                
                const distanceSquared = dx * dx + dy * dy + dz * dz;
                const distance = Math.sqrt(distanceSquared);
                
                // Avoid division by zero and too-close singularities
                if (distance < 1) continue;
                
                // Calculate gravitational force magnitude
                const forceMagnitude = (G * body1.mass * body2.mass) / distanceSquared;
                
                // Calculate force direction (normalized)
                const forceX = (dx / distance) * forceMagnitude;
                const forceY = (dy / distance) * forceMagnitude;
                const forceZ = (dz / distance) * forceMagnitude;
                
                // Apply forces (opposite directions)
                body1.force.x += forceX;
                body1.force.y += forceY;
                body1.force.z += forceZ;
                
                body2.force.x -= forceX;
                body2.force.y -= forceY;
                body2.force.z -= forceZ;
            }
        }
    }

    /**
     * Apply gravitational force from all bodies to a specific body
     * (Used for player and interactive objects)
     */
    applyGravityToBody(targetBody) {
        const G = Config.physics.G;
        
        for (const bodyData of this.gravitationalBodies) {
            const sourceBody = bodyData.body;
            
            // Skip if source has zero mass
            if (sourceBody.mass === 0) continue;
            
            // Calculate distance vector
            const dx = sourceBody.position.x - targetBody.position.x;
            const dy = sourceBody.position.y - targetBody.position.y;
            const dz = sourceBody.position.z - targetBody.position.z;
            
            const distanceSquared = dx * dx + dy * dy + dz * dz;
            const distance = Math.sqrt(distanceSquared);
            
            // Avoid singularities
            if (distance < 1) continue;
            
            // Calculate gravitational force magnitude
            // For massive bodies like planets, use their mass even if kinematic
            const sourceMass = bodyData.mass; // Use original mass from config
            const forceMagnitude = (G * sourceMass * targetBody.mass) / distanceSquared;
            
            // Calculate force direction (normalized)
            const forceX = (dx / distance) * forceMagnitude;
            const forceY = (dy / distance) * forceMagnitude;
            const forceZ = (dz / distance) * forceMagnitude;
            
            // Apply force to target
            targetBody.force.x += forceX;
            targetBody.force.y += forceY;
            targetBody.force.z += forceZ;
        }
    }

    /**
     * Sync Three.js meshes with Cannon.js physics bodies
     */
    syncMeshes() {
        for (const [mesh, body] of this.bodies) {
            mesh.position.copy(body.position);
            mesh.quaternion.copy(body.quaternion);
        }
    }

    /**
     * Get the physics body for a mesh
     */
    getBody(mesh) {
        return this.bodies.get(mesh);
    }

    /**
     * Apply impulse to a body
     */
    applyImpulse(mesh, impulse, worldPoint = null) {
        const body = this.bodies.get(mesh);
        if (body) {
            const impulseVec = new CANNON.Vec3(impulse[0], impulse[1], impulse[2]);
            if (worldPoint) {
                const point = new CANNON.Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);
                body.applyImpulse(impulseVec, point);
            } else {
                body.applyImpulse(impulseVec, body.position);
            }
        }
    }

    /**
     * Apply force to a body
     */
    applyForce(mesh, force, worldPoint = null) {
        const body = this.bodies.get(mesh);
        if (body) {
            const forceVec = new CANNON.Vec3(force[0], force[1], force[2]);
            if (worldPoint) {
                const point = new CANNON.Vec3(worldPoint[0], worldPoint[1], worldPoint[2]);
                body.applyForce(forceVec, point);
            } else {
                body.applyForce(forceVec, body.position);
            }
        }
    }

    /**
     * Raycast from a point in a direction
     */
    raycast(from, to) {
        const rayFrom = new CANNON.Vec3(from[0], from[1], from[2]);
        const rayTo = new CANNON.Vec3(to[0], to[1], to[2]);
        
        const result = new CANNON.RaycastResult();
        this.world.rayTest(rayFrom, rayTo, result);
        
        if (result.hasHit) {
            return {
                hasHit: true,
                body: result.body,
                hitPoint: [result.hitPointWorld.x, result.hitPointWorld.y, result.hitPointWorld.z],
                hitNormal: [result.hitNormalWorld.x, result.hitNormalWorld.y, result.hitNormalWorld.z],
                distance: result.distance,
            };
        }
        
        return { hasHit: false };
    }

    /**
     * Get all bodies within a radius of a point
     */
    getBodiesInRadius(position, radius) {
        const results = [];
        const pos = new CANNON.Vec3(position[0], position[1], position[2]);
        
        for (const [mesh, body] of this.bodies) {
            const distance = body.position.distanceTo(pos);
            if (distance <= radius) {
                results.push({ mesh, body, distance });
            }
        }
        
        return results;
    }

    /**
     * Update physics settings at runtime
     */
    updateSettings(settings) {
        if (settings.gravity !== undefined) {
            // Note: We're using N-body gravity, so this won't be used
            // But keep it for potential debugging
        }
        
        if (settings.substeps !== undefined) {
            Config.physics.substeps = settings.substeps;
        }
        
        if (settings.timeScale !== undefined) {
            Config.physics.timeScale = settings.timeScale;
        }
    }

    /**
     * Debug: Draw physics bodies
     */
    debugDraw(scene) {
        // Remove old debug meshes
        scene.children = scene.children.filter(child => !child.userData.isPhysicsDebug);
        
        // Draw new debug meshes
        for (const [mesh, body] of this.bodies) {
            // Create wireframe for physics body
            let debugGeometry;
            
            if (body.shapes[0] instanceof CANNON.Sphere) {
                debugGeometry = new THREE.SphereGeometry(body.shapes[0].radius, 8, 8);
            } else if (body.shapes[0] instanceof CANNON.Box) {
                const halfExtents = body.shapes[0].halfExtents;
                debugGeometry = new THREE.BoxGeometry(
                    halfExtents.x * 2,
                    halfExtents.y * 2,
                    halfExtents.z * 2
                );
            }
            
            if (debugGeometry) {
                const debugMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff00,
                    wireframe: true,
                });
                const debugMesh = new THREE.Mesh(debugGeometry, debugMaterial);
                debugMesh.position.copy(body.position);
                debugMesh.quaternion.copy(body.quaternion);
                debugMesh.userData.isPhysicsDebug = true;
                scene.add(debugMesh);
            }
        }
    }

    /**
     * Cleanup
     */
    dispose() {
        this.bodies.clear();
        this.gravitationalBodies = [];
        // Cannon.js doesn't have explicit cleanup, but we clear references
    }
}

export default PhysicsWorld;
