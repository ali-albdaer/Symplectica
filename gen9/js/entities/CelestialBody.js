import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js';
import { Config } from '../Config.js';

export class CelestialBody {
    constructor(config, scene, physicsWorld, parentBody = null) {
        this.config = config;
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.parentBody = parentBody;

        this.mesh = null;
        this.body = null;

        this.init();
    }

    init() {
        // 1. Visuals
        const geometry = new THREE.SphereGeometry(this.config.radius, 32, 32);
        let material;

        if (this.config.type === 'star') {
            material = new THREE.MeshBasicMaterial({ color: this.config.color });
            // Add Light
            const light = new THREE.PointLight(this.config.color, 2, 0, 0.5); // decay 0.5 for long reach
            light.castShadow = true;
            light.shadow.mapSize.width = Config.rendering.shadowMapSize[Config.rendering.fidelity];
            light.shadow.mapSize.height = Config.rendering.shadowMapSize[Config.rendering.fidelity];
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.add(light);
            
            // Glow effect (simple sprite)
            const spriteMat = new THREE.SpriteMaterial({ 
                color: this.config.color, 
                blending: THREE.AdditiveBlending
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(this.config.radius * 3, this.config.radius * 3, 1);
            this.mesh.add(sprite);

        } else {
            material = new THREE.MeshStandardMaterial({ 
                color: this.config.color,
                roughness: 0.8,
                metalness: 0.2
            });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
        }

        this.scene.add(this.mesh);

        // 2. Physics
        this.body = new CANNON.Body({
            mass: this.config.mass,
            shape: new CANNON.Sphere(this.config.radius),
            position: new CANNON.Vec3(0, 0, 0)
        });

        // 3. Initial Position & Velocity
        this.calculateOrbit();

        this.physicsWorld.addBody(this.body);
    }

    calculateOrbit() {
        if (this.config.type === 'star') {
            this.body.position.set(0, 0, 0);
            return;
        }

        let parentPos = new CANNON.Vec3(0, 0, 0);
        let parentMass = 10000; // Default Sun mass if no parent specified
        let parentVel = new CANNON.Vec3(0, 0, 0);

        if (this.parentBody) {
            parentPos.copy(this.parentBody.body.position);
            parentMass = this.parentBody.config.mass;
            parentVel.copy(this.parentBody.body.velocity);
        } else {
            // Assume orbiting the first body (Sun) if not specified
            // In Config.js, Sun is at 0,0,0
        }

        const r = this.config.distance;
        const angle = this.config.startAngle || 0;

        // Position
        const x = parentPos.x + r * Math.cos(angle);
        const z = parentPos.z + r * Math.sin(angle);
        this.body.position.set(x, 0, z);

        // Velocity for circular orbit: v = sqrt(GM/r)
        // Direction is tangent (-sin, cos)
        const vMag = Math.sqrt((Config.physics.G * parentMass) / r);
        
        const vx = -Math.sin(angle) * vMag;
        const vz = Math.cos(angle) * vMag;

        this.body.velocity.set(vx, 0, vz);
        
        // Add parent's velocity to keep relative orbit
        this.body.velocity.vadd(parentVel, this.body.velocity);
    }

    update() {
        // Sync visual mesh with physics body
        this.mesh.position.copy(this.body.position);
        this.mesh.quaternion.copy(this.body.quaternion);
    }
}
