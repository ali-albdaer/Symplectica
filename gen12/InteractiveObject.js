/**
 * InteractiveObject.js - Physics-enabled interactive objects
 * Small objects that follow physics rules and can be grabbed
 */

import { Config } from './Config.js';
import { Logger } from './Utils.js';

export class InteractiveObject {
    constructor(config, scene, spawnPosition) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = config.type || 'crate';
        this.mass = config.mass || 10;
        this.color = config.color || 0x888888;
        
        // Physics properties
        this.position = spawnPosition.clone();
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.previousPosition = this.position.clone();
        
        // State
        this.isHeld = false;
        this.isStatic = false;
        this.holder = null;
        
        // References
        this.scene = scene;
        this.mesh = null;
        
        // Size
        if (config.type === 'sphere') {
            this.radius = config.radius || 0.5;
            this.size = null;
        } else {
            this.size = config.size || { x: 1, y: 1, z: 1 };
            this.radius = Math.max(this.size.x, this.size.y, this.size.z) / 2;
        }
        
        this.createMesh();
        
        Logger.system(`InteractiveObject created: ${this.type}`, { mass: this.mass });
    }

    createMesh() {
        let geometry;
        
        if (this.type === 'sphere') {
            geometry = new THREE.SphereGeometry(this.radius, 16, 16);
        } else {
            geometry = new THREE.BoxGeometry(
                this.size.x,
                this.size.y,
                this.size.z
            );
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.7,
            metalness: 0.3
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.interactiveObject = this;
        
        this.scene.add(this.mesh);
    }

    /**
     * Pick up the object
     */
    grab(holder) {
        this.isHeld = true;
        this.holder = holder;
        this.velocity.set(0, 0, 0);
        Logger.input(`Object grabbed: ${this.type}`);
    }

    /**
     * Release the object
     */
    release(throwVelocity = null) {
        this.isHeld = false;
        this.holder = null;
        
        if (throwVelocity) {
            this.velocity.copy(throwVelocity);
        }
        
        Logger.input(`Object released: ${this.type}`);
    }

    /**
     * Update object position when held
     */
    updateHeld(holdPosition) {
        if (!this.isHeld) return;
        
        this.previousPosition.copy(this.position);
        this.position.copy(holdPosition);
        
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }

    /**
     * Apply force to the object
     */
    applyForce(force) {
        if (this.isHeld || this.isStatic) return;
        
        const acceleration = force.clone().divideScalar(this.mass);
        this.velocity.add(acceleration);
    }

    /**
     * Apply impulse to the object
     */
    applyImpulse(impulse) {
        if (this.isHeld || this.isStatic) return;
        
        const velocityChange = impulse.clone().divideScalar(this.mass);
        this.velocity.add(velocityChange);
    }

    /**
     * Update mesh position from physics
     */
    syncMesh() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
        }
    }

    /**
     * Get bounding box for collision detection
     */
    getBoundingBox() {
        if (!this.mesh) return null;
        return new THREE.Box3().setFromObject(this.mesh);
    }

    /**
     * Check if point is within object
     */
    containsPoint(point) {
        const distance = this.position.distanceTo(point);
        return distance < this.radius;
    }

    /**
     * Dispose of resources
     */
    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.scene.remove(this.mesh);
        }
        Logger.system(`InteractiveObject disposed: ${this.type}`);
    }
}

/**
 * Factory for creating interactive objects near player spawn
 */
export class InteractiveObjectFactory {
    constructor(scene, physicsWorld) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.objects = [];
    }

    /**
     * Spawn objects near a position
     */
    spawnNearPosition(position, surfaceNormal) {
        const config = Config.interactiveObjects;
        
        config.objects.forEach((objConfig, index) => {
            // Calculate spawn position in a circle around the spawn point
            const angle = (index / config.objects.length) * Math.PI * 2;
            const distance = config.spawnRadius * (0.5 + Math.random() * 0.5);
            
            // Create tangent vectors for positioning on surface
            const up = surfaceNormal.clone();
            const right = new THREE.Vector3(1, 0, 0);
            if (Math.abs(up.dot(right)) > 0.9) {
                right.set(0, 1, 0);
            }
            const forward = new THREE.Vector3().crossVectors(up, right).normalize();
            right.crossVectors(forward, up).normalize();
            
            // Calculate offset position
            const offset = new THREE.Vector3()
                .addScaledVector(right, Math.cos(angle) * distance)
                .addScaledVector(forward, Math.sin(angle) * distance)
                .addScaledVector(up, config.spawnHeightOffset);
            
            const spawnPos = position.clone().add(offset);
            
            // Create object
            const obj = new InteractiveObject(objConfig, this.scene, spawnPos);
            this.objects.push(obj);
            this.physicsWorld.addInteractiveObject(obj);
        });
        
        Logger.system(`Spawned ${config.objects.length} interactive objects`);
    }

    /**
     * Get all objects
     */
    getObjects() {
        return this.objects;
    }

    /**
     * Find object at position
     */
    findAtPosition(position, maxDistance = 2) {
        let closest = null;
        let closestDistance = maxDistance;
        
        this.objects.forEach(obj => {
            const distance = obj.position.distanceTo(position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = obj;
            }
        });
        
        return closest;
    }

    /**
     * Raycast to find object
     */
    raycast(origin, direction, maxDistance = 10) {
        const ray = new THREE.Raycaster(origin, direction.normalize(), 0, maxDistance);
        const meshes = this.objects.map(obj => obj.mesh).filter(m => m);
        
        const intersects = ray.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            return {
                object: hit.object.userData.interactiveObject,
                point: hit.point,
                distance: hit.distance
            };
        }
        
        return null;
    }

    /**
     * Dispose all objects
     */
    dispose() {
        this.objects.forEach(obj => {
            this.physicsWorld.removeInteractiveObject(obj);
            obj.dispose();
        });
        this.objects = [];
    }
}

export default InteractiveObject;
