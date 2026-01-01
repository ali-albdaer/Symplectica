/**
 * Interactive Objects
 * Physics-enabled objects the player can interact with
 */

import { Config, INTERACTIVE_OBJECTS } from './config.js';
import { Vector3, randomRange } from './Math3D.js';
import { PhysicsBody } from './Physics.js';

export class InteractiveObjectManager {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.objects = new Map();
    }
    
    /**
     * Spawn initial objects near player
     */
    spawnNearPlayer(playerPosition, upVector, count) {
        const spawnCount = count || INTERACTIVE_OBJECTS.spawnCount;
        const types = Object.keys(INTERACTIVE_OBJECTS.types);
        
        for (let i = 0; i < spawnCount; i++) {
            // Random type
            const typeId = types[Math.floor(Math.random() * types.length)];
            const config = INTERACTIVE_OBJECTS.types[typeId];
            
            // Random position around player
            const angle = Math.random() * Math.PI * 2;
            const distance = randomRange(3, 10);
            const height = randomRange(1, 3);
            
            // Calculate position on surface
            const right = new Vector3(-upVector.z, 0, upVector.x).normalize();
            const forward = Vector3.cross(upVector, right);
            
            const position = new Vector3(
                playerPosition.x + right.x * Math.cos(angle) * distance + forward.x * Math.sin(angle) * distance + upVector.x * height,
                playerPosition.y + right.y * Math.cos(angle) * distance + forward.y * Math.sin(angle) * distance + upVector.y * height,
                playerPosition.z + right.z * Math.cos(angle) * distance + forward.z * Math.sin(angle) * distance + upVector.z * height
            );
            
            this.createObject(typeId, position);
        }
    }
    
    /**
     * Create an interactive object
     */
    createObject(typeId, position, velocity = null) {
        const config = INTERACTIVE_OBJECTS.types[typeId];
        if (!config) {
            console.error(`Unknown object type: ${typeId}`);
            return null;
        }
        
        const id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create mesh based on type
        let geometry, mesh;
        
        switch (typeId) {
            case 'crate':
                geometry = new THREE.BoxGeometry(
                    config.size.x,
                    config.size.y,
                    config.size.z
                );
                break;
                
            case 'barrel':
                geometry = new THREE.CylinderGeometry(
                    config.radius,
                    config.radius,
                    config.height,
                    16
                );
                break;
                
            case 'sphere':
                geometry = new THREE.SphereGeometry(config.radius, 16, 16);
                break;
                
            case 'rock':
                geometry = this.createRockGeometry(config);
                break;
                
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        // Material with slight variation
        const colorVariation = 0.9 + Math.random() * 0.2;
        const baseColor = new THREE.Color(config.color);
        const material = new THREE.MeshStandardMaterial({
            color: baseColor.multiplyScalar(colorVariation),
            roughness: 0.7 + Math.random() * 0.3,
            metalness: 0.1
        });
        
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Random initial rotation
        mesh.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        this.scene.add(mesh);
        
        // Create physics body
        const radius = config.radius || Math.max(config.size?.x || 1, config.size?.y || 1, config.size?.z || 1) / 2;
        
        const physicsBody = new PhysicsBody({
            id: id,
            type: 'dynamic',
            position: position,
            velocity: velocity || new Vector3(),
            mass: config.mass,
            radius: radius,
            restitution: config.restitution || 0.5,
            friction: config.friction || 0.5,
            data: { typeId, config }
        });
        
        physicsBody.mesh = mesh;
        this.physics.addBody(physicsBody);
        
        // Store reference
        const obj = {
            id,
            typeId,
            config,
            mesh,
            physicsBody,
            isHeld: false
        };
        
        this.objects.set(id, obj);
        mesh.userData.interactiveObject = obj;
        
        return obj;
    }
    
    /**
     * Create irregular rock geometry
     */
    createRockGeometry(config) {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const positions = geometry.attributes.position;
        
        // Deform vertices for rock-like appearance
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
            
            const noise = 0.7 + Math.random() * 0.6;
            
            positions.setXYZ(i,
                x * noise * (config.size?.x || 1) / 2,
                y * noise * (config.size?.y || 1) / 2,
                z * noise * (config.size?.z || 1) / 2
            );
        }
        
        geometry.computeVertexNormals();
        return geometry;
    }
    
    /**
     * Update all objects
     */
    update(deltaTime) {
        for (const [id, obj] of this.objects) {
            // Sync mesh with physics body
            if (obj.physicsBody.renderPosition) {
                obj.mesh.position.set(
                    obj.physicsBody.renderPosition.x,
                    obj.physicsBody.renderPosition.y,
                    obj.physicsBody.renderPosition.z
                );
            } else {
                obj.mesh.position.set(
                    obj.physicsBody.position.x,
                    obj.physicsBody.position.y,
                    obj.physicsBody.position.z
                );
            }
            
            // Simple rotation based on velocity (visual only)
            if (!obj.isHeld) {
                const speed = obj.physicsBody.velocity.length();
                if (speed > 0.1) {
                    obj.mesh.rotation.x += speed * deltaTime * 0.5;
                    obj.mesh.rotation.z += speed * deltaTime * 0.3;
                }
            }
        }
    }
    
    /**
     * Remove an object
     */
    removeObject(id) {
        const obj = this.objects.get(id);
        if (!obj) return;
        
        // Remove mesh
        this.scene.remove(obj.mesh);
        obj.mesh.geometry.dispose();
        obj.mesh.material.dispose();
        
        // Remove physics body
        this.physics.removeBody(obj.physicsBody);
        
        this.objects.delete(id);
    }
    
    /**
     * Get object by ID
     */
    getObject(id) {
        return this.objects.get(id);
    }
    
    /**
     * Get nearest object to position
     */
    getNearestObject(position, maxDistance = Infinity) {
        let nearest = null;
        let nearestDist = maxDistance;
        
        for (const [id, obj] of this.objects) {
            const dx = obj.physicsBody.position.x - position.x;
            const dy = obj.physicsBody.position.y - position.y;
            const dz = obj.physicsBody.position.z - position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < nearestDist) {
                nearest = obj;
                nearestDist = dist;
            }
        }
        
        return nearest;
    }
    
    /**
     * Apply explosion force to all objects
     */
    applyExplosion(center, force, radius) {
        for (const [id, obj] of this.objects) {
            const dx = obj.physicsBody.position.x - center.x;
            const dy = obj.physicsBody.position.y - center.y;
            const dz = obj.physicsBody.position.z - center.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (dist < radius && dist > 0.001) {
                const falloff = 1 - (dist / radius);
                const impulse = force * falloff / obj.physicsBody.mass;
                
                obj.physicsBody.velocity.x += (dx / dist) * impulse;
                obj.physicsBody.velocity.y += (dy / dist) * impulse;
                obj.physicsBody.velocity.z += (dz / dist) * impulse;
            }
        }
    }
    
    /**
     * Get all objects
     */
    getAllObjects() {
        return Array.from(this.objects.values());
    }
    
    /**
     * Clear all objects
     */
    clear() {
        for (const id of this.objects.keys()) {
            this.removeObject(id);
        }
    }
    
    /**
     * Cleanup
     */
    dispose() {
        this.clear();
    }
}

export default InteractiveObjectManager;
