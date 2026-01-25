import * as THREE from 'three';

export class InteractiveObject {
    constructor(scene, position, color, isLuminous = false) {
        this.mass = 10;
        this.radius = 0.5;
        this.position = position.clone();
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.prevAcceleration = new THREE.Vector3(0, 0, 0);

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            emissive: isLuminous ? color : 0x000000,
            emissiveIntensity: isLuminous ? 1 : 0
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        if (isLuminous) {
            const light = new THREE.PointLight(color, 1, 10);
            this.mesh.add(light);
        }

        scene.add(this.mesh);
    }

    updatePosition() {
        this.mesh.position.copy(this.position);
        // Add some rotation for visual flair
        this.mesh.rotation.x += 0.01;
        this.mesh.rotation.y += 0.01;
    }
}
