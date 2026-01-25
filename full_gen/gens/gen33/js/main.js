import * as THREE from 'three';
import { Config, calculateOrbitalVelocity } from './config.js';
import { PhysicsEngine } from './physics.js';
import { Renderer } from './renderer.js';
import { CelestialBody, Player, InteractiveObject } from './entities.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';
import { Logger } from './utils.js';

class Game {
    constructor() {
        this.physics = new PhysicsEngine();
        this.renderer = new Renderer();
        this.input = new InputHandler();
        this.ui = new UI(this.physics, this.renderer);
        
        this.entities = [];
        this.player = null;
        
        this.init();
        this.animate();
    }

    init() {
        try {
            // Create Sun
            const sunConfig = Config.bodies.sun;
            const sun = new CelestialBody(sunConfig);
            this.addEntity(sun);

            // Create Planet 1
            const p1Config = Config.bodies.planet1;
            const p1Pos = new THREE.Vector3(p1Config.distance, 0, 0);
            const p1Vel = new THREE.Vector3(0, 0, calculateOrbitalVelocity(sunConfig, p1Config.distance));
            const planet1 = new CelestialBody({ ...p1Config, position: p1Pos, velocity: p1Vel });
            this.addEntity(planet1);

            // Create Moon 1 (Orbiting Planet 1)
            const m1Config = Config.bodies.moon1;
            const m1Pos = p1Pos.clone().add(new THREE.Vector3(m1Config.distance, 0, 0));
            // Velocity = Planet Velocity + Moon Orbital Velocity relative to Planet
            const m1OrbitalVel = calculateOrbitalVelocity(p1Config, m1Config.distance);
            const m1Vel = p1Vel.clone().add(new THREE.Vector3(0, 0, m1OrbitalVel));
            const moon1 = new CelestialBody({ ...m1Config, position: m1Pos, velocity: m1Vel });
            this.addEntity(moon1);

            // Create Planet 2
            const p2Config = Config.bodies.planet2;
            const p2Pos = new THREE.Vector3(-p2Config.distance, 0, 0); // Opposite side
            const p2Vel = new THREE.Vector3(0, 0, -calculateOrbitalVelocity(sunConfig, p2Config.distance));
            const planet2 = new CelestialBody({ ...p2Config, position: p2Pos, velocity: p2Vel });
            this.addEntity(planet2);

            // Create Player
            // Spawn on Planet 1 surface
            const spawnPos = planet1.position.clone().add(new THREE.Vector3(0, planet1.radius + 2, 0));
            this.player = new Player(spawnPos, this.physics);
            // Give player same velocity as planet so they don't fly off instantly
            this.player.velocity.copy(planet1.velocity);
            this.addEntity(this.player);
            
            // Create Interactive Objects
            for(let i=0; i<5; i++) {
                const offset = new THREE.Vector3((Math.random()-0.5)*2, 2 + i, (Math.random()-0.5)*2);
                const objPos = spawnPos.clone().add(offset);
                const obj = new InteractiveObject(objPos, this.physics);
                obj.velocity.copy(planet1.velocity);
                this.addEntity(obj);
            }

            document.getElementById('loading').style.display = 'none';
            
            // Dev Menu Toggle
            document.addEventListener('keydown', (e) => {
                if (e.key === '/') {
                    this.ui.toggle();
                }
            });

        } catch (e) {
            Logger.error(e.message + "\n" + e.stack);
        }
    }

    addEntity(entity) {
        this.entities.push(entity);
        this.physics.addBody(entity);
        if (entity.mesh) {
            this.renderer.add(entity.mesh);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = Config.physics.dt;

        // Update Physics
        this.physics.update(dt);

        // Update Entities (Visuals, Input)
        for (const entity of this.entities) {
            if (entity === this.player) {
                entity.update(dt, this.input);
            } else {
                entity.update(dt);
            }
        }
        
        // Update Camera Aspect Ratio
        if (this.player.camera.aspect !== window.innerWidth / window.innerHeight) {
            this.player.camera.aspect = window.innerWidth / window.innerHeight;
            this.player.camera.updateProjectionMatrix();
        }

        // Update UI
        this.ui.update(this.player);
        
        // Post-Update Input
        this.input.postUpdate();

        // Render
        this.renderer.render(this.player.camera);
    }
}

new Game();
