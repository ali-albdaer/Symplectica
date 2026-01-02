import * as THREE from 'three';
import { Config } from './config.js';
import { Input } from './core/Input.js';
import { PhysicsWorld } from './physics/PhysicsWorld.js';
import { CelestialBody } from './entities/CelestialBody.js';
import { Player } from './entities/Player.js';
import { Prop } from './entities/Prop.js';
import { DebugUI } from './ui/DebugUI.js';

class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        this.input = new Input();
        this.physicsWorld = new PhysicsWorld();
        
        this.props = []; // Store props

        this.initScene();
        this.initEntities();
        
        this.debugUI = new DebugUI(this.player, this.physicsWorld);
        
        window.addEventListener('resize', () => this.onWindowResize(), false);
        
        document.getElementById('loading-screen').style.display = 'none';
        
        this.animate();
    }

    initScene() {
        // Stars
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
        const starVertices = [];
        for(let i=0; i<10000; i++) {
            const x = (Math.random() - 0.5) * 20000;
            const y = (Math.random() - 0.5) * 20000;
            const z = (Math.random() - 0.5) * 20000;
            starVertices.push(x,y,z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);

        // Ambient light (very weak, space is dark)
        const ambientLight = new THREE.AmbientLight(0x111111);
        this.scene.add(ambientLight);
    }

    initEntities() {
        // Create Celestial Bodies
        this.celestialBodies = [];
        const bodyMap = {};

        Config.bodies.forEach(bodyConfig => {
            const body = new CelestialBody(bodyConfig, this.scene);
            this.physicsWorld.addBody(body);
            this.celestialBodies.push(body);
            bodyMap[bodyConfig.name] = body;
        });

        // Create Player
        this.player = new Player(this.scene, this.camera, this.physicsWorld);
        // Note: Player is updated manually to handle input and collision, 
        // and to avoid double-gravity if PhysicsWorld also updated it.
        // this.physicsWorld.addBody(this.player); 
        
        // Spawn Player
        const spawnBody = bodyMap[Config.player.spawnBody];
        if (spawnBody) {
            this.player.spawnOn(spawnBody);
        }

        // Create Props (Small interactive objects)
        this.createProps(spawnBody);
    }

    createProps(planet) {
        if (!planet) return;
        
        for (let i = 0; i < 5; i++) {
            // Place near player spawn
            const offset = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(2 + Math.random() * 2);
            const pos = planet.position.clone().add(new THREE.Vector3(0, planet.radius + 2, 0)).add(offset);
            
            const isLuminous = Math.random() > 0.7;
            
            const prop = new Prop({
                mass: 5,
                position: pos,
                velocity: planet.velocity.clone(), // Match planet velocity
                color: isLuminous ? 0x00ff00 : 0xff0000,
                emissive: isLuminous ? 0x00ff00 : 0x000000
            }, this.scene);

            if (isLuminous) {
                const light = new THREE.PointLight(0x00ff00, 1, 5);
                prop.mesh.add(light);
            }

            this.props.push(prop);
            // Note: Props are updated manually to handle collision with planets
            // this.physicsWorld.addBody(prop);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Config.physics.dt;
        const substeps = Config.physics.substeps;

        // Physics Substepping
        for(let i=0; i<substeps; i++) {
            this.physicsWorld.step(dt / substeps);
            this.player.handleInput(this.input, dt / substeps, this.props);
            this.player.update(dt / substeps, this.celestialBodies);
            
            // Update Props
            this.props.forEach(prop => prop.update(dt / substeps, this.celestialBodies));
        }

        this.debugUI.update();
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
