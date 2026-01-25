import * as THREE from 'three';
import { CONFIG } from './config.js';
import { PhysicsWorld } from './physics.js';
import { BodyManager } from './bodies.js';
import { PlayerController } from './player.js';
import { UIManager } from './ui.js';

class Game {
    constructor() {
        this.init();
    }

    init() {
        // 1. Setup Three.js Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Stars background
        this.createStars();

        this.camera = new THREE.PerspectiveCamera(
            CONFIG.graphics.fov, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            10000000 // Far clipping plane for space
        );
        
        // Logarithmic depth buffer for huge scale differences
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            logarithmicDepthBuffer: CONFIG.graphics.logarithmicDepthBuffer 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = CONFIG.graphics.enableShadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        // 2. Setup Physics
        this.physicsWorld = new PhysicsWorld();

        // 3. Setup Bodies
        this.bodyManager = new BodyManager(this.scene, this.physicsWorld);
        this.bodyManager.init();

        // 4. Setup Player
        this.player = new PlayerController(this.camera, this.renderer.domElement, this.physicsWorld, this.bodyManager);

        // 5. Setup UI
        this.ui = new UIManager(this.renderer, this.scene, this.physicsWorld);

        // 6. Add some random objects near spawn
        this.spawnRandomObjects();

        // 7. Start Loop
        this.clock = new THREE.Clock();
        
        // Remove loading screen
        document.getElementById('loading').style.display = 'none';
        
        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize(), false);

        this.animate();
    }

    createStars() {
        const r = 5000000;
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 200, sizeAttenuation: true });

        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = THREE.MathUtils.randFloatSpread(r);
            const y = THREE.MathUtils.randFloatSpread(r);
            const z = THREE.MathUtils.randFloatSpread(r);
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
    }

    spawnRandomObjects() {
        // Spawn some crates near the player
        const planet = this.bodyManager.getBody(CONFIG.player.startBody);
        const spawnPos = this.player.position.clone();
        
        // Create a few boxes
        for (let i = 0; i < 5; i++) {
            const size = 1 + Math.random();
            const geometry = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            // Random position near player
            const offset = new THREE.Vector3(Math.random() * 10 - 5, 5 + Math.random() * 5, Math.random() * 10 - 5);
            const pos = spawnPos.clone().add(offset);
            
            const rb = {
                radius: size * 0.7, // Approx collider
                position: pos,
                velocity: new THREE.Vector3(0, 0, 0), // Start still relative to planet? No, let gravity take them.
                mesh: mesh,
                mass: 10
            };
            
            // Inherit planet velocity roughly
            rb.velocity.copy(planet.velocity);
            
            this.physicsWorld.addRigidBody(rb);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Math.min(this.clock.getDelta(), 0.1); // Cap dt to prevent explosions on lag

        // Physics Step
        this.physicsWorld.step(CONFIG.physics.dt); 
        
        // Bodies Update (Rotation)
        this.bodyManager.update(dt);

        // Player Update
        this.player.update(dt);

        // UI Update
        this.ui.update(dt, this.player);

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
