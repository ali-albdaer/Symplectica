/**
 * Physics Engine - Handles all physics calculations and interactions
 */

import * as THREE from 'three';
import { PHYSICS } from './config.js';

export class PhysicsEngine {
    constructor() {
        this.celestialBodies = [];
        this.physicsObjects = [];
        this.gravity = new THREE.Vector3(0, -9.81, 0);
        this.accumulator = 0;
        this.fixedTimeStep = PHYSICS.timeStep;
    }

    addCelestialBody(body) {
        this.celestialBodies.push(body);
    }

    addPhysicsObject(object) {
        this.physicsObjects.push(object);
    }

    removePhysicsObject(object) {
        const index = this.physicsObjects.indexOf(object);
        if (index > -1) {
            this.physicsObjects.splice(index, 1);
        }
    }

    update(deltaTime) {
        // Use fixed timestep for physics stability
        this.accumulator += Math.min(deltaTime, PHYSICS.maxTimeStep);
        
        while (this.accumulator >= this.fixedTimeStep) {
            this.fixedUpdate(this.fixedTimeStep);
            this.accumulator -= this.fixedTimeStep;
        }
    }

    fixedUpdate(dt) {
        // Update celestial body gravitational interactions
        this.updateCelestialGravity(dt);
        
        // Update physics objects
        this.updatePhysicsObjects(dt);
        
        // Check collisions
        this.checkCollisions();
    }

    updateCelestialGravity(dt) {
        // Calculate gravitational forces between all celestial bodies
        for (let i = 0; i < this.celestialBodies.length; i++) {
            const bodyA = this.celestialBodies[i];
            
            for (let j = i + 1; j < this.celestialBodies.length; j++) {
                const bodyB = this.celestialBodies[j];
                
                // Apply gravitational force between bodies
                bodyA.applyGravity(bodyB, dt);
                bodyB.applyGravity(bodyA, dt);
            }
        }
        
        // Update all celestial bodies
        for (const body of this.celestialBodies) {
            body.update(dt, true);
        }
    }

    updatePhysicsObjects(dt) {
        for (const obj of this.physicsObjects) {
            if (!obj.isKinematic) {
                this.applyPhysicsToObject(obj, dt);
            }
        }
    }

    applyPhysicsToObject(obj, dt) {
        // Find closest celestial body for local gravity
        let closestBody = null;
        let minDistance = Infinity;
        
        for (const body of this.celestialBodies) {
            const distance = body.getDistanceTo(obj.position);
            if (distance < minDistance) {
                minDistance = distance;
                closestBody = body;
            }
        }
        
        if (closestBody) {
            // Calculate gravity direction (toward celestial body center)
            const gravityDir = new THREE.Vector3()
                .subVectors(closestBody.position, obj.position)
                .normalize();
            
            const surfaceGravity = closestBody.getSurfaceGravity();
            const distanceFromSurface = minDistance - closestBody.radius;
            
            // Apply inverse square law for gravity (weaker as you get further)
            const gravityFalloff = Math.max(0, 1 - (distanceFromSurface / (closestBody.radius * 10)));
            const gravityForce = gravityDir.multiplyScalar(surfaceGravity * gravityFalloff);
            
            // Apply gravity to velocity
            obj.velocity.add(gravityForce.multiplyScalar(dt));
            
            // Check if object is on surface
            if (distanceFromSurface < obj.radius * 2) {
                obj.onGround = true;
                
                // Apply ground friction
                obj.velocity.multiplyScalar(PHYSICS.groundFriction);
                
                // Prevent sinking into planet
                const surfacePoint = closestBody.getClosestSurfacePoint(obj.position);
                const correctionDir = new THREE.Vector3()
                    .subVectors(obj.position, closestBody.position)
                    .normalize();
                obj.position.copy(surfacePoint).add(
                    correctionDir.multiplyScalar(obj.radius)
                );
            } else {
                obj.onGround = false;
                // Apply air resistance
                obj.velocity.multiplyScalar(PHYSICS.airResistance);
            }
        }
        
        // Apply damping
        obj.velocity.multiplyScalar(PHYSICS.damping);
        
        // Update position
        obj.position.add(obj.velocity.clone().multiplyScalar(dt));
        
        // Update rotation from angular velocity
        if (obj.angularVelocity) {
            obj.rotation.x += obj.angularVelocity.x * dt;
            obj.rotation.y += obj.angularVelocity.y * dt;
            obj.rotation.z += obj.angularVelocity.z * dt;
        }
    }

    checkCollisions() {
        // Simple sphere-sphere collision detection for physics objects
        for (let i = 0; i < this.physicsObjects.length; i++) {
            for (let j = i + 1; j < this.physicsObjects.length; j++) {
                this.resolveCollision(this.physicsObjects[i], this.physicsObjects[j]);
            }
        }
    }

    resolveCollision(objA, objB) {
        const delta = new THREE.Vector3().subVectors(objB.position, objA.position);
        const distance = delta.length();
        const minDistance = objA.radius + objB.radius;
        
        if (distance < minDistance) {
            // Collision detected
            const normal = delta.normalize();
            const overlap = minDistance - distance;
            
            // Separate objects
            const separation = normal.clone().multiplyScalar(overlap * 0.5);
            objA.position.sub(separation);
            objB.position.add(separation);
            
            // Calculate relative velocity
            const relativeVelocity = new THREE.Vector3().subVectors(objB.velocity, objA.velocity);
            const velocityAlongNormal = relativeVelocity.dot(normal);
            
            // Don't resolve if objects are separating
            if (velocityAlongNormal > 0) return;
            
            // Calculate impulse
            const restitution = 0.4; // Bounciness
            const impulseScalar = -(1 + restitution) * velocityAlongNormal;
            const totalMass = objA.mass + objB.mass;
            
            const impulse = normal.multiplyScalar(impulseScalar / totalMass);
            
            // Apply impulse
            objA.velocity.sub(impulse.clone().multiplyScalar(objB.mass));
            objB.velocity.add(impulse.clone().multiplyScalar(objA.mass));
        }
    }

    getClosestCelestialBody(position) {
        let closest = null;
        let minDistance = Infinity;
        
        for (const body of this.celestialBodies) {
            const distance = body.getDistanceTo(position);
            if (distance < minDistance) {
                minDistance = distance;
                closest = body;
            }
        }
        
        return closest;
    }

    getGravityAtPoint(position) {
        const closestBody = this.getClosestCelestialBody(position);
        if (!closestBody) return new THREE.Vector3(0, 0, 0);
        
        const gravityDir = new THREE.Vector3()
            .subVectors(closestBody.position, position)
            .normalize();
        
        const surfaceGravity = closestBody.getSurfaceGravity();
        return gravityDir.multiplyScalar(surfaceGravity);
    }

    raycast(origin, direction, maxDistance = 1000) {
        // Simple raycast for interaction detection
        const results = [];
        
        // Check against celestial bodies
        for (const body of this.celestialBodies) {
            const intersection = this.raySphereIntersect(
                origin,
                direction,
                body.position,
                body.radius
            );
            
            if (intersection && intersection.distance <= maxDistance) {
                results.push({
                    object: body,
                    point: intersection.point,
                    distance: intersection.distance
                });
            }
        }
        
        // Check against physics objects
        for (const obj of this.physicsObjects) {
            const intersection = this.raySphereIntersect(
                origin,
                direction,
                obj.position,
                obj.radius
            );
            
            if (intersection && intersection.distance <= maxDistance) {
                results.push({
                    object: obj,
                    point: intersection.point,
                    distance: intersection.distance
                });
            }
        }
        
        // Sort by distance
        results.sort((a, b) => a.distance - b.distance);
        
        return results;
    }

    raySphereIntersect(rayOrigin, rayDirection, sphereCenter, sphereRadius) {
        const oc = rayOrigin.clone().sub(sphereCenter);
        const a = rayDirection.dot(rayDirection);
        const b = 2.0 * oc.dot(rayDirection);
        const c = oc.dot(oc) - sphereRadius * sphereRadius;
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) {
            return null;
        }
        
        const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);
        
        if (t < 0) return null;
        
        const point = rayOrigin.clone().add(rayDirection.clone().multiplyScalar(t));
        
        return {
            point: point,
            distance: t
        };
    }

    clear() {
        this.celestialBodies = [];
        this.physicsObjects = [];
    }
}
