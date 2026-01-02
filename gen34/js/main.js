import * as THREE from 'three';
import { Config, calculateOrbitalVelocity } from './config.js';
import { GraphicsEngine } from './engine/Graphics.js';
import { PhysicsEngine } from './engine/Physics.js';
import { InputManager } from './engine/Input.js';
import { CelestialBody } from './entities/CelestialBody.js';
import { Player } from './entities/Player.js';
import { InteractiveObject } from './entities/InteractiveObject.js';
import { DebugUI } from './ui/DebugUI.js';

class Game {
    constructor() {
        try {
            this.init();
            this.animate();
        } catch (e) {
            console.error(e);
            const errDiv = document.getElementById('error-log');
            errDiv.style.display = 'block';
            errDiv.innerText = `CRITICAL ERROR:\n${e.stack}`;
        }
    }

    init() {
        // 1. Engine Setup
        this.graphics = new GraphicsEngine();
        this.physics = new PhysicsEngine();
        this.input = new InputManager();

        // 2. Create Celestial Bodies
        this.bodies = {};
        
        // Create Sun
        const sunConfig = Config.initialState.bodies.find(b => b.name === "Sun");
        const sun = new CelestialBody(sunConfig, this.graphics.scene);
        this.physics.addBody(sun);
        this.bodies["Sun"] = sun;

        // Create Planets
        Config.initialState.bodies.filter(b => b.type === 'planet').forEach(pConfig => {
            // Calculate initial position (on X axis for simplicity)
            pConfig.position = { x: pConfig.distanceFromSun, y: 0, z: 0 };
            
            // Calculate orbital velocity (on Z axis)
            const v = calculateOrbitalVelocity(sun.mass, pConfig.distanceFromSun);
            pConfig.velocity = { x: 0, y: 0, z: v };

            const planet = new CelestialBody(pConfig, this.graphics.scene);
            this.physics.addBody(planet);
            this.bodies[pConfig.name] = planet;
        });

        // Create Moons
        Config.initialState.bodies.filter(b => b.type === 'moon').forEach(mConfig => {
            const parent = this.bodies[mConfig.parent];
            if (!parent) return;

            // Position relative to parent
            mConfig.position = { 
                x: parent.position.x + mConfig.distanceFromParent, 
                y: 0, 
                z: 0 
            };

            // Velocity: Parent Velocity + Orbital Velocity around Parent
            const vOrbit = calculateOrbitalVelocity(parent.mass, mConfig.distanceFromParent);
            mConfig.velocity = { 
                x: parent.velocity.x, 
                y: 0, 
                z: parent.velocity.z + vOrbit 
            };

            const moon = new CelestialBody(mConfig, this.graphics.scene);
            this.physics.addBody(moon);
            this.bodies[mConfig.name] = moon;
        });

        // 3. Player Setup
        // Spawn on Planet 1
        const spawnPlanet = this.bodies["Planet 1"];
        this.player = new Player(this.graphics.scene, this.graphics.camera, this.input);
        
        // Place player on surface
        // Planet is at (D, 0, 0). Player at (D, Radius + Height, 0)
        this.player.position.set(
            spawnPlanet.position.x, 
            spawnPlanet.radius + 2, // +2 meters
            0
        );
        // Match planet velocity initially so we don't fly off
        this.player.velocity.copy(spawnPlanet.velocity);
        
        this.physics.setPlayer(this.player);

        // 4. Interactive Objects
        for (let i = 0; i < 5; i++) {
            const pos = this.player.position.clone().add(new THREE.Vector3(Math.random()*5 - 2.5, 5, Math.random()*5 - 2.5));
            const obj = new InteractiveObject(
                this.graphics.scene, 
                pos, 
                Math.random() * 0xffffff, 
                Math.random() > 0.7
            );
            // Match velocity
            obj.velocity.copy(spawnPlanet.velocity);
            this.physics.addInteractable(obj);
        }

        // 5. UI
        this.ui = new DebugUI(this.player, this.physics);

        this.clock = new THREE.Clock();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const dt = this.clock.getDelta();
        const timeScale = Config.physics.timeScale;

        // Physics Step
        // We might want to clamp dt to avoid explosion on lag spikes
        const safeDt = Math.min(dt, 0.1);
        this.physics.update(safeDt * timeScale);

        // Update Visuals
        this.physics.bodies.forEach(b => b.updatePosition());
        this.physics.interactables.forEach(i => i.updatePosition());
        this.player.update(safeDt); // Player input is real-time, not time-scaled usually? 
        // Actually, if time is sped up, player movement relative to planets should probably stay normal, 
        // but orbital mechanics speed up. This is tricky. 
        // For now, everything scales. If you speed up time, you move faster too? 
        // No, usually "Time Scale" applies to celestial mechanics.
        // But if I scale physics dt, everything scales.
        // Let's keep it simple: Time Scale affects everything.

        this.ui.update();
        this.graphics.render();
    }
}

window.onload = () => {
    new Game();
};
