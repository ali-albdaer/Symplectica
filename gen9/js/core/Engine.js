import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import * as CANNON from 'https://unpkg.com/cannon-es@0.20.0/dist/cannon-es.js';
import { Config } from '../Config.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { CelestialBody } from '../entities/CelestialBody.js';
import { Player } from '../entities/Player.js';
import { UIManager } from '../ui/UIManager.js';

export class Engine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physicsWorld = null;
        this.player = null;
        this.uiManager = null;
        this.bodies = [];
        this.clock = new THREE.Clock();

        this.init();
    }

    init() {
        // 1. Setup Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // 2. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // 3. Physics
        this.physicsWorld = new PhysicsWorld();

        // 4. UI
        this.uiManager = new UIManager(this);

        // 5. Entities
        this.createCelestialBodies();
        
        // 6. Player
        this.player = new Player(this.scene, this.physicsWorld, this.renderer.domElement);
        
        // Spawn player on the first planet (Terra)
        const terra = this.bodies.find(b => b.config.name === 'Terra');
        if (terra) {
            // Place slightly above surface
            const spawnPos = terra.body.position.clone();
            spawnPos.y += terra.config.radius + 5; 
            this.player.body.position.copy(spawnPos);

            // Spawn Micro-Physics Objects
            this.spawnInteractiveObjects(spawnPos);
        }

        // 7. Events
        window.addEventListener('resize', () => this.onResize());

        // 8. Start Loop
        this.animate();
    }

    createCelestialBodies() {
        const bodyMap = new Map();

        // First pass: Create bodies
        Config.world.bodies.forEach(config => {
            const body = new CelestialBody(config, this.scene, this.physicsWorld);
            this.bodies.push(body);
            bodyMap.set(config.name, body);
        });

        // Second pass: Link parents (if needed for orbit calculation updates, though we did it in init)
        // Actually, we need to re-calculate orbits if parents were not ready.
        // But in Config, we can assume order or just handle it.
        // My CelestialBody logic tried to find parent immediately. 
        // Let's fix the parent linkage for the Moon.
        
        this.bodies.forEach(body => {
            if (body.config.parent) {
                body.parentBody = bodyMap.get(body.config.parent);
                // Re-calculate orbit now that parent is known
                body.calculateOrbit();
            }
        });
    }

    spawnInteractiveObjects(pos) {
        for (let i = 0; i < 5; i++) {
            const size = 0.5;
            const boxGeo = new THREE.BoxGeometry(size, size, size);
            const boxMat = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const mesh = new THREE.Mesh(boxGeo, boxMat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            const shape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
            const body = new CANNON.Body({
                mass: 1,
                shape: shape,
                position: new CANNON.Vec3(pos.x + (Math.random() - 0.5) * 5, pos.y + 5 + i * 2, pos.z + (Math.random() - 0.5) * 5)
            });
            
            // Add to physics world
            this.physicsWorld.addInteractiveObject(body);

            // Sync loop (simple hack, better to have a class)
            const update = () => {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
                requestAnimationFrame(update);
            };
            update();
        }
    }

    onResize() {
        if (this.player && this.player.camera) {
            this.player.camera.aspect = window.innerWidth / window.innerHeight;
            this.player.camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Math.min(this.clock.getDelta(), 0.1); // Cap dt

        // Physics
        this.physicsWorld.step(dt);

        // Entities
        this.bodies.forEach(b => b.update());
        this.player.update(dt);

        // UI
        this.uiManager.update(dt);

        // Render
        if (this.player.camera) {
            this.renderer.render(this.scene, this.player.camera);
        }
    }
}
