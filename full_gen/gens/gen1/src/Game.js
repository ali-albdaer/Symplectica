import * as THREE from 'three';
import { Config } from './config.js';
import { World } from './World.js';
import { Physics } from './Physics.js';
import { Player } from './Player.js';
import { Input } from './Input.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'dat.gui';

export class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.clock = new THREE.Clock();
        this.stats = new Stats();
        this.gui = new GUI();
        
        this.init();
    }

    init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = Config.graphics.enableShadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        this.container.appendChild(this.stats.dom);

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

        // Physics
        this.physics = new Physics();

        // Input
        this.input = new Input();

        // World
        this.world = new World(this.scene, this.physics);

        // Player
        this.player = new Player(this.scene, this.physics, this.input, this.camera);

        // Resize Handler
        window.addEventListener('resize', () => this.onWindowResize(), false);

        // Setup UI
        this.setupUI();
    }

    setupUI() {
        const physicsFolder = this.gui.addFolder('Physics');
        physicsFolder.add(Config.physics, 'G', 0.00001, 0.001);
        physicsFolder.add(Config.physics, 'dt', 0.001, 0.1);
        
        const graphicsFolder = this.gui.addFolder('Graphics');
        graphicsFolder.add(Config.graphics, 'enableShadows').onChange(v => {
            this.renderer.shadowMap.enabled = v;
            this.scene.traverse(child => {
                if (child.isLight) child.castShadow = v;
            });
        });

        const playerFolder = this.gui.addFolder('Player');
        playerFolder.add(Config.player, 'speed', 1, 100);
        playerFolder.add(Config.player, 'flightSpeed', 10, 500);
        playerFolder.add(this.player, 'cameraMode', ['first', 'third']);

        this.gui.close();
        
        // Toggle Dev Menu
        document.addEventListener('keydown', (e) => {
            if (e.key === '/') {
                this.gui.closed ? this.gui.open() : this.gui.close();
            }
            if (e.code === 'KeyV') {
                 this.player.cameraMode = this.player.cameraMode === 'first' ? 'third' : 'first';
            }
            if (e.code === 'Insert') {
                this.player.isFlying = !this.player.isFlying;
            }
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    start() {
        this.renderer.setAnimationLoop(() => this.update());
    }

    update() {
        const dt = Math.min(this.clock.getDelta(), 0.1); // Cap dt

        this.physics.update(dt);
        this.player.update(dt);
        
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
    }
}