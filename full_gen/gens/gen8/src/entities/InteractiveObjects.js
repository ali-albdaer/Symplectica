/**
 * InteractiveObjects.js
 * Spawns and manages interactive objects near the player.
 * These objects have physics and can be interacted with.
 */

import * as THREE from 'three';
import { INTERACTIVE_OBJECTS, RENDER_SCALE, PLAYER } from '../config/GlobalConfig.js';
import { DebugLogger } from '../utils/DebugLogger.js';

const logger = new DebugLogger('Objects');

export class InteractiveObject {
    constructor(config, position, physicsEngine) {
        this.config = config;
        this.name = config.name;
        this.type = config.type;
        this.mass = config.mass;
        this.size = config.size;
        this.physics = physicsEngine;
        
        // Physics state
        this.position = { ...position };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.angularVelocity = { x: 0, y: 0, z: 0 };
        
        // Create mesh
        this.mesh = null;
        this.group = new THREE.Group();
        
        this.createMesh();
        
        // Register with physics
        this.physicsBody = this.physics.addSmallObject({
            name: this.name,
            mass: this.mass,
            size: this.size,
            position: { ...this.position },
            velocity: { ...this.velocity },
            object: this,
        });
    }

    createMesh() {
        const scaledSize = this.size * RENDER_SCALE.distance;
        let geometry;
        
        switch (this.type) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(scaledSize, 16, 16);
                break;
            case 'crate':
                geometry = new THREE.BoxGeometry(scaledSize, scaledSize, scaledSize);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(scaledSize * 0.5, scaledSize * 0.5, scaledSize, 16);
                break;
            case 'rock':
            default:
                // Irregular rock shape using icosahedron with noise
                geometry = new THREE.IcosahedronGeometry(scaledSize, 1);
                this.deformGeometry(geometry, 0.3);
                break;
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: this.config.color,
            roughness: 0.8,
            metalness: 0.1,
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Store reference for raycasting
        this.mesh.userData.interactiveObject = this;
        
        this.group.add(this.mesh);
    }

    deformGeometry(geometry, intensity) {
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            const noise = 1 + (Math.random() - 0.5) * intensity;
            positions.setXYZ(i, x * noise, y * noise, z * noise);
        }
        geometry.computeVertexNormals();
    }

    update(deltaTime) {
        if (this.physicsBody) {
            this.position = { ...this.physicsBody.position };
            this.velocity = { ...this.physicsBody.velocity };
        }
        
        // Update mesh position
        const scaled = this.getScaledPosition();
        this.group.position.set(scaled.x, scaled.y, scaled.z);
        
        // Slowly rotate for visual interest
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.005;
    }

    getScaledPosition() {
        return {
            x: this.position.x * RENDER_SCALE.distance,
            y: this.position.y * RENDER_SCALE.distance,
            z: this.position.z * RENDER_SCALE.distance,
        };
    }

    applyForce(force) {
        if (this.physicsBody) {
            this.physicsBody.velocity.x += force.x / this.mass;
            this.physicsBody.velocity.y += force.y / this.mass;
            this.physicsBody.velocity.z += force.z / this.mass;
        }
    }

    getObject3D() {
        return this.group;
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

export class InteractiveObjectManager {
    constructor(physicsEngine, scene) {
        this.physics = physicsEngine;
        this.scene = scene;
        this.objects = [];
        
        logger.info('Interactive object manager initialized');
    }

    /**
     * Spawn objects near the player's spawn position
     */
    spawnNearPlayer(playerPosition, groundedBody) {
        logger.info('Spawning interactive objects near player');
        
        const configs = INTERACTIVE_OBJECTS.objects;
        const spawnRadius = INTERACTIVE_OBJECTS.spawnRadius;
        
        // Calculate surface normal (up direction)
        let upVector = { x: 0, y: 1, z: 0 };
        if (groundedBody) {
            const dx = playerPosition.x - groundedBody.position.x;
            const dy = playerPosition.y - groundedBody.position.y;
            const dz = playerPosition.z - groundedBody.position.z;
            const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
            upVector = { x: dx / len, y: dy / len, z: dz / len };
        }
        
        // Calculate tangent vectors for surface placement
        const tangent1 = this.calculateTangent(upVector);
        const tangent2 = {
            x: upVector.y * tangent1.z - upVector.z * tangent1.y,
            y: upVector.z * tangent1.x - upVector.x * tangent1.z,
            z: upVector.x * tangent1.y - upVector.y * tangent1.x,
        };
        
        for (let i = 0; i < configs.length; i++) {
            const config = configs[i];
            
            // Random position on surface around player
            const angle = (i / configs.length) * Math.PI * 2 + Math.random() * 0.5;
            const distance = spawnRadius * (0.3 + Math.random() * 0.7);
            
            const offsetX = Math.cos(angle) * distance;
            const offsetZ = Math.sin(angle) * distance;
            
            // Position in world space on the surface
            const position = {
                x: playerPosition.x + tangent1.x * offsetX + tangent2.x * offsetZ + upVector.x * config.size,
                y: playerPosition.y + tangent1.y * offsetX + tangent2.y * offsetZ + upVector.y * config.size,
                z: playerPosition.z + tangent1.z * offsetX + tangent2.z * offsetZ + upVector.z * config.size,
            };
            
            // If grounded on a body, inherit its velocity
            const velocity = groundedBody?.physicsBody?.velocity || { x: 0, y: 0, z: 0 };
            
            const obj = new InteractiveObject(config, position, this.physics);
            obj.physicsBody.velocity = { ...velocity };
            
            this.scene.add(obj.getObject3D());
            this.objects.push(obj);
            
            logger.debug(`Spawned ${config.name} at distance ${distance.toFixed(4)} km`);
        }
        
        logger.info(`Spawned ${this.objects.length} interactive objects`);
    }

    calculateTangent(normal) {
        // Find a vector not parallel to normal
        let ref = { x: 1, y: 0, z: 0 };
        if (Math.abs(normal.x) > 0.9) {
            ref = { x: 0, y: 1, z: 0 };
        }
        
        // Cross product to get tangent
        return {
            x: normal.y * ref.z - normal.z * ref.y,
            y: normal.z * ref.x - normal.x * ref.z,
            z: normal.x * ref.y - normal.y * ref.x,
        };
    }

    update(deltaTime) {
        for (const obj of this.objects) {
            obj.update(deltaTime);
        }
    }

    /**
     * Find object at screen position (for interaction)
     */
    raycast(raycaster) {
        const meshes = this.objects.map(obj => obj.mesh);
        const intersects = raycaster.intersectObjects(meshes);
        
        if (intersects.length > 0) {
            return intersects[0].object.userData.interactiveObject;
        }
        
        return null;
    }

    /**
     * Apply force to nearby objects (e.g., from explosion)
     */
    applyRadialForce(center, force, radius) {
        for (const obj of this.objects) {
            const dx = obj.position.x - center.x;
            const dy = obj.position.y - center.y;
            const dz = obj.position.z - center.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < radius && dist > 0) {
                const falloff = 1 - (dist / radius);
                const magnitude = force * falloff;
                
                obj.applyForce({
                    x: (dx / dist) * magnitude,
                    y: (dy / dist) * magnitude,
                    z: (dz / dist) * magnitude,
                });
            }
        }
    }

    dispose() {
        for (const obj of this.objects) {
            this.scene.remove(obj.getObject3D());
            obj.dispose();
        }
        this.objects = [];
        
        logger.info('Interactive objects disposed');
    }
}
