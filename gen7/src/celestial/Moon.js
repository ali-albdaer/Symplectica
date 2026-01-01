/**
 * Moon Class
 * Natural satellite orbiting a planet
 */

import { CelestialBody } from './CelestialBody.js';

export class Moon extends CelestialBody {
    constructor(config) {
        super(config);
        
        // Moon-specific properties
        this.isTidallyLocked = config.isTidallyLocked !== undefined ? config.isTidallyLocked : true;
    }

    /**
     * Create moon mesh
     */
    createMesh(scene) {
        const geometry = new THREE.SphereGeometry(this.renderRadius, 32, 32);
        
        const material = new THREE.MeshStandardMaterial({
            color: this.color,
            roughness: 0.9,
            metalness: 0.1,
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        scene.add(this.mesh);

        // Add some surface detail with bump mapping simulation
        // (In a full implementation, would use actual normal maps)
        
        return this.mesh;
    }

    /**
     * Update moon - handle tidal locking
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // If tidally locked, keep same face toward parent
        if (this.isTidallyLocked && this.parentBody) {
            // Calculate angle to parent
            const dx = this.parentBody.position.x - this.position.x;
            const dz = this.parentBody.position.z - this.position.z;
            const angle = Math.atan2(dz, dx);
            
            // Set rotation to face parent
            this.rotation.y = angle + Math.PI / 2;
            
            if (this.mesh) {
                this.mesh.rotation.y = this.rotation.y;
            }
        }
    }
}

export default Moon;
