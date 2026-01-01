/**
 * InteractableObject - Physics-enabled objects that player can interact with
 */

import * as THREE from 'three';
import { INTERACTABLES } from './config.js';

export class InteractableObject {
    constructor(type, position) {
        this.type = type;
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.angularVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        );
        this.rotation = new THREE.Euler();
        
        this.mass = type.mass;
        this.radius = type.size;
        this.color = type.color;
        this.onGround = false;
        this.isKinematic = false;
        
        this.createMesh();
    }

    createMesh() {
        let geometry;
        
        switch (this.type.name) {
            case 'Cube':
                geometry = new THREE.BoxGeometry(
                    this.radius * 2,
                    this.radius * 2,
                    this.radius * 2
                );
                break;
            case 'Sphere':
                geometry = new THREE.SphereGeometry(this.radius, 32, 32);
                break;
            case 'Cylinder':
                geometry = new THREE.CylinderGeometry(
                    this.radius,
                    this.radius,
                    this.radius * 2,
                    32
                );
                break;
            case 'Cone':
                geometry = new THREE.ConeGeometry(this.radius, this.radius * 2, 32);
                break;
            default:
                geometry = new THREE.BoxGeometry(
                    this.radius * 2,
                    this.radius * 2,
                    this.radius * 2
                );
        }
        
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.6,
            metalness: 0.2,
            flatShading: false,
            emissive: this.type.luminous ? this.color : 0x000000,
            emissiveIntensity: this.type.luminous ? 1.5 : 0
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData.interactable = this;

        // Optional glow light
        if (this.type.luminous) {
            const light = new THREE.PointLight(this.color, 2, 12, 2);
            light.castShadow = false;
            this.mesh.add(light);
        }
        
        this.updateMeshTransform();
    }

    update(deltaTime) {
        // Physics is handled by PhysicsEngine
        // This just updates the mesh transform
        this.updateMeshTransform();
    }

    updateMeshTransform() {
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
        }
    }

    applyForce(force) {
        const acceleration = force.clone().divideScalar(this.mass);
        this.velocity.add(acceleration);
    }

    applyImpulse(impulse) {
        this.velocity.add(impulse.clone().divideScalar(this.mass));
    }

    dispose() {
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
    }
}

export function spawnInteractables(playerPosition, count = INTERACTABLES.count) {
    const objects = [];
    const types = INTERACTABLES.types;
    const spawnRadius = INTERACTABLES.spawnRadius;
    
    for (let i = 0; i < count; i++) {
        // Random position around player
        const angle = (i / count) * Math.PI * 2;
        const distance = Math.random() * spawnRadius + 2;
        
        const position = new THREE.Vector3(
            playerPosition.x + Math.cos(angle) * distance,
            playerPosition.y + 1 + Math.random() * 2,
            playerPosition.z + Math.sin(angle) * distance
        );
        
        // Random type
        const type = types[Math.floor(Math.random() * types.length)];
        
        const obj = new InteractableObject(type, position);
        objects.push(obj);
    }
    
    return objects;
}
