/**
 * Main Scene - Solar System Simulation Entry Point
 * Integrates all systems and manages the game loop
 */

import * as THREE from 'three';
import { 
    SUN, PLANET_1, PLANET_2, MOON, 
    GRAPHICS, SCALE, PHYSICS 
} from './config.js';
import { CelestialBody } from './CelestialBody.js';
import { PhysicsEngine } from './Physics.js';
import { Input } from './Input.js';
import { Player } from './Player.js';
import { CameraController } from './Camera.js';
import { LightingSystem } from './LightingSystem.js';
import { InteractableObject, spawnInteractables } from './InteractableObject.js';
import { PerformanceMonitor } from './PerformanceMonitor.js';
import { DeveloperMenu } from './DeveloperMenu.js';
import { SettingsManager } from './SettingsManager.js';

class SolarSystemSimulation {
    constructor() {
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.clock = new THREE.Clock();
        
        // Core systems
        this.input = null;
        this.physics = null;
        this.player = null;
        this.cameraController = null;
        this.lighting = null;
        this.performanceMonitor = null;
        this.developerMenu = null;
        this.settingsManager = null;
        
        // Game objects
        this.celestialBodies = {};
        this.interactables = [];
        
        // State
        this.isLoading = true;
        this.isPaused = false;
        
        this.init();
    }

    async init() {
        this.updateLoadingScreen('Creating universe...');
        
        // Initialize Three.js
        await this.initRenderer();
        this.initScene();
        
        this.updateLoadingScreen('Initializing physics engine...');
        
        // Initialize core systems
        this.input = new Input();
        this.physics = new PhysicsEngine();
        
        this.updateLoadingScreen('Creating celestial bodies...');
        
        // Create celestial bodies
        this.createCelestialBodies();
        
        this.updateLoadingScreen('Setting up lighting...');
        
        // Initialize lighting
        this.lighting = new LightingSystem(this.scene, this.celestialBodies.sun);
        
        this.updateLoadingScreen('Spawning player...');
        
        // Initialize player
        this.player = new Player(this.input, this.physics);
        this.player.spawn(this.celestialBodies.planet1);
        this.scene.add(this.player.mesh);
        
        this.updateLoadingScreen('Configuring camera...');
        
        // Initialize camera
        this.cameraController = new CameraController(this.player, this.input);
        this.camera = this.cameraController.getCamera();
        
        this.updateLoadingScreen('Spawning interactive objects...');
        
        // Spawn interactable objects
        this.createInteractables();
        
        this.updateLoadingScreen('Setting up UI systems...');
        
        // Initialize UI systems
        this.performanceMonitor = new PerformanceMonitor(this.renderer, this.input);
        this.developerMenu = new DeveloperMenu(this.input);
        this.settingsManager = new SettingsManager(this.input, this.renderer, this.lighting);
        
        // Add starfield background
        this.createStarfield();
        
        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
        
        this.updateLoadingScreen('Finalizing...');
        
        // Hide loading screen
        setTimeout(() => {
            this.hideLoadingScreen();
            this.isLoading = false;
            this.animate();
        }, 500);
    }

    initRenderer() {
        return new Promise((resolve) => {
            this.renderer = new THREE.WebGLRenderer({
                antialias: GRAPHICS.antialiasing,
                powerPreference: 'high-performance',
                alpha: false
            });
            
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(GRAPHICS.pixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;
            
            document.body.appendChild(this.renderer.domElement);
            resolve();
        });
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x000000, 0.00001);
    }

    createCelestialBodies() {
        // Create Sun
        this.celestialBodies.sun = new CelestialBody(SUN);
        this.scene.add(this.celestialBodies.sun.mesh);
        this.physics.addCelestialBody(this.celestialBodies.sun);
        
        // Create Planet 1
        this.celestialBodies.planet1 = new CelestialBody(PLANET_1);
        this.scene.add(this.celestialBodies.planet1.mesh);
        this.physics.addCelestialBody(this.celestialBodies.planet1);
        
        // Create orbit line
        const orbit1 = this.celestialBodies.planet1.createOrbitLine();
        if (orbit1) this.scene.add(orbit1);
        
        // Create Planet 2
        this.celestialBodies.planet2 = new CelestialBody(PLANET_2);
        this.scene.add(this.celestialBodies.planet2.mesh);
        this.physics.addCelestialBody(this.celestialBodies.planet2);
        
        // Create orbit line
        const orbit2 = this.celestialBodies.planet2.createOrbitLine();
        if (orbit2) this.scene.add(orbit2);
        
        // Create Moon (orbiting Planet 1)
        this.celestialBodies.moon = new CelestialBody(MOON, this.celestialBodies.planet1);
        this.scene.add(this.celestialBodies.moon.mesh);
        this.physics.addCelestialBody(this.celestialBodies.moon);
        
        // Create orbit line
        const orbitMoon = this.celestialBodies.moon.createOrbitLine();
        if (orbitMoon) {
            // Position moon orbit around planet 1
            orbitMoon.position.copy(this.celestialBodies.planet1.position);
            this.scene.add(orbitMoon);
        }
    }

    createInteractables() {
        const objects = spawnInteractables(this.player.position);
        
        objects.forEach(obj => {
            this.interactables.push(obj);
            this.scene.add(obj.mesh);
            this.physics.addPhysicsObject(obj);
        });
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 2,
            sizeAttenuation: false
        });
        
        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 20000;
            const y = (Math.random() - 0.5) * 20000;
            const z = (Math.random() - 0.5) * 20000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(starsVertices, 3));
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    animate() {
        if (this.isPaused) return;
        
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = Math.min(this.clock.getDelta(), PHYSICS.maxTimeStep);
        
        // Update physics
        this.physics.update(deltaTime);
        
        // Update player
        this.player.update(deltaTime);
        
        // Update camera
        this.cameraController.update(deltaTime);
        
        // Update interactable objects
        this.interactables.forEach(obj => obj.update(deltaTime));
        
        // Update lighting (follow camera for shadows)
        this.lighting.update(this.camera);
        
        // Update performance monitor
        this.performanceMonitor.update(this.scene);
        
        // Update UI
        this.updateUI();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    updateUI() {
        // Update player position
        const posElement = document.getElementById('player-position');
        if (posElement) {
            const pos = this.player.position;
            posElement.textContent = `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
        }
        
        // Update player mode
        const modeElement = document.getElementById('player-mode');
        if (modeElement) {
            modeElement.textContent = this.player.isFlying ? 'Flight' : 
                                     (this.player.onGround ? 'Ground' : 'Airborne');
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateLoadingScreen(text) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
        
        // Update progress bar (simulate progress)
        const progress = document.querySelector('.loading-progress');
        if (progress) {
            const currentWidth = parseFloat(progress.style.width) || 0;
            progress.style.width = Math.min(currentWidth + 15, 100) + '%';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    pause() {
        this.isPaused = true;
        this.clock.stop();
    }

    resume() {
        this.isPaused = false;
        this.clock.start();
        this.animate();
    }
}

// Start the simulation when the page loads
window.addEventListener('load', () => {
    window.simulation = new SolarSystemSimulation();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.simulation) {
        window.simulation.pause();
    }
});
