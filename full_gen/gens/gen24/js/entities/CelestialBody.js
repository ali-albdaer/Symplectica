import * as THREE from 'three';
import { Body } from '../physics/Body.js';

export class CelestialBody extends Body {
    constructor(config, scene) {
        super(config);
        this.radius = config.radius;
        this.color = config.color;
        this.type = config.type;

        // Visuals
        const geometry = new THREE.SphereGeometry(this.radius, 32, 32);
        let material;

        if (this.type === 'star') {
            material = new THREE.MeshBasicMaterial({ color: this.color });
            // Add light
            const light = new THREE.PointLight(0xffffff, config.lightIntensity || 1, 0, 0);
            light.castShadow = true;
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 5000;
            light.shadow.bias = -0.0001;
            
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.add(light);
            
            // Glow effect (simple sprite)
            const spriteMaterial = new THREE.SpriteMaterial({ 
                color: config.emissive || 0xffaa00,
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(this.radius * 3, this.radius * 3, 1);
            this.mesh.add(sprite);

        } else {
            material = new THREE.MeshStandardMaterial({ 
                color: this.color,
                roughness: 0.8,
                metalness: 0.1
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }

        this.mesh.position.copy(this.position);
        this.mesh.userData = { entity: this }; // Link back to physics body
        scene.add(this.mesh);
    }
}
