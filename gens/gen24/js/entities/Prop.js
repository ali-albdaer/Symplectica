import * as THREE from 'three';
import { Body } from '../physics/Body.js';
import { getGravityVector } from '../utils/MathUtils.js';
import { Config } from '../config.js';

export class Prop extends Body {
    constructor(config, scene) {
        super(config);
        this.scene = scene;
        
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshStandardMaterial({ 
            color: config.color || 0xffffff,
            emissive: config.emissive || 0x000000
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.position.copy(this.position);
        this.scene.add(this.mesh);
        
        this.isHeld = false;
    }

    update(dt, bodies) {
        if (this.isHeld) {
            this.velocity.set(0, 0, 0);
            this.acceleration.set(0, 0, 0);
            return; 
        }

        // Apply Gravity from celestial bodies
        const gravityInfo = getGravityVector(this.position, bodies, Config.physics.G);
        this.applyForce(gravityInfo.vector.multiplyScalar(this.mass)); // F = ma, applyForce takes Force

        // Simple Ground Collision
        const dominantBody = gravityInfo.dominantBody;
        if (dominantBody) {
            const dist = this.position.distanceTo(dominantBody.position);
            const surfaceDist = dominantBody.radius + 0.25; // Box half-size
            
            if (dist < surfaceDist) {
                const normal = new THREE.Vector3().subVectors(this.position, dominantBody.position).normalize();
                this.position.copy(dominantBody.position).add(normal.multiplyScalar(surfaceDist));
                
                const velDotNormal = this.velocity.dot(normal);
                if (velDotNormal < 0) {
                    this.velocity.sub(normal.multiplyScalar(velDotNormal));
                }
                
                // Friction
                this.velocity.multiplyScalar(0.95);
            }
        }

        super.update(dt);
    }
}
