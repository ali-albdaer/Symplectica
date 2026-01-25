import * as THREE from 'three';

export class CelestialBody {
    constructor(config, scene) {
        this.name = config.name;
        this.type = config.type;
        this.mass = config.mass;
        this.radius = config.radius;
        this.position = new THREE.Vector3(config.position?.x || 0, config.position?.y || 0, config.position?.z || 0);
        this.velocity = new THREE.Vector3(config.velocity?.x || 0, config.velocity?.y || 0, config.velocity?.z || 0);
        this.acceleration = new THREE.Vector3();
        this.prevAcceleration = new THREE.Vector3(); // For Verlet

        // Visuals
        const geometry = new THREE.SphereGeometry(this.radius, 64, 64);
        let material;

        if (this.type === 'star') {
            material = new THREE.MeshStandardMaterial({
                color: config.color,
                emissive: config.emissive,
                emissiveIntensity: config.emissiveIntensity
            });
            
            // Light source
            const light = new THREE.PointLight(config.color, config.lightIntensity, 0, 0); // 0 decay for sun-like behavior at scale? No, inverse square law is physical.
            // But PointLight decay in Three.js is specific. Let's stick to default decay=2 (physical).
            // Intensity needs to be huge.
            light.intensity = 3e27; // Rough approximation for sun
            light.castShadow = true;
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            light.shadow.camera.near = this.radius;
            light.shadow.camera.far = 1e12;
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.add(light);
        } else {
            material = new THREE.MeshStandardMaterial({
                color: config.color,
                roughness: config.roughness || 0.5,
                metalness: config.metalness || 0.0
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }

        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
    }

    updatePosition() {
        this.mesh.position.copy(this.position);
    }
}
