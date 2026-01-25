/**
 * Interactive Object
 * Physics-enabled objects that player can interact with
 */

import * as THREE from 'three';
import { PhysicsObject } from '../physics/PhysicsObject.js';
import { CONFIG } from '../../config/globals.js';

export class InteractiveObject extends PhysicsObject {
    constructor(config) {
        super(config);
        
        this.type = config.type || 'cube';
        this.size = config.size || 1;
        this.color = config.color || 0xFFFFFF;
        this.isInteractable = true;
        this.isPickedUp = false;
    }

    /**
     * Create mesh based on type
     */
    createMesh(scene) {
        let geometry;

        switch (this.type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(this.size / 2, 32, 32);
                this.radius = this.size / 2;
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(this.size / 3, this.size / 3, this.size, 32);
                break;
            default:
                geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
        }

        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.6,
            metalness: 0.4,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Store reference to this object
        this.mesh.userData.physicsObject = this;
        
        scene.add(this.mesh);
        return this.mesh;
    }

    /**
     * Create a random object
     */
    static createRandom(position, scene) {
        const types = CONFIG.OBJECTS.types;
        const typeConfig = types[Math.floor(Math.random() * types.length)];

        const config = {
            type: typeConfig.name.toLowerCase(),
            mass: typeConfig.mass,
            size: typeConfig.size,
            color: typeConfig.color,
            friction: typeConfig.friction,
            restitution: typeConfig.restitution,
            position: position,
            velocity: {
                x: (Math.random() - 0.5) * 2,
                y: Math.random() * 3,
                z: (Math.random() - 0.5) * 2
            },
            affectedByGravity: true,
        };

        const obj = new InteractiveObject(config);
        obj.createMesh(scene);
        
        return obj;
    }

    /**
     * Spawn multiple objects around a position
     */
    static spawnMultiple(centerPos, count, radius, scene) {
        const objects = [];

        for (let i = 0; i < count; i++) {
            // Random position in circle around center
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = radius * 0.5 + Math.random() * radius * 0.5;
            
            const position = {
                x: centerPos.x + Math.cos(angle) * distance,
                y: centerPos.y + 2,  // Spawn slightly above ground
                z: centerPos.z + Math.sin(angle) * distance
            };

            const obj = InteractiveObject.createRandom(position, scene);
            objects.push(obj);
        }

        console.log(`✓ Spawned ${objects.length} interactive objects`);
        return objects;
    }

    /**
     * Apply impulse when hit
     */
    applyHit(direction, force) {
        const impulse = {
            x: direction.x * force,
            y: direction.y * force + 5,  // Add upward component
            z: direction.z * force
        };
        this.applyImpulse(impulse);
        
        // Add random spin
        this.angularVelocity.x = (Math.random() - 0.5) * 10;
        this.angularVelocity.y = (Math.random() - 0.5) * 10;
        this.angularVelocity.z = (Math.random() - 0.5) * 10;
    }

    /**
     * Check if object is on a planet surface
     */
    snapToPlanetSurface(planet) {
        const altitude = planet.getAltitude(this.position);
        
        if (altitude < this.size / 2) {
            planet.snapToSurface(this, this.size / 2);
            
            // Reduce velocity on impact
            if (this.velocity.y < 0) {
                this.velocity.y *= -this.restitution;
                
                // Apply friction
                this.velocity.x *= this.friction;
                this.velocity.z *= this.friction;
            }
        }
    }
}

export default InteractiveObject;
