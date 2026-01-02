import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { PhysicsWorld } from './physics.js';
import { createSolarSystem } from '../game/solarSystem.js';
import { createPlayerController } from '../game/playerController.js';
import { setupTelemetry } from '../ui/telemetry.js';
import { setupDevConsole } from '../ui/devConsole.js';

export class Engine {
  constructor({ canvas, logger, config }) {
    this.canvas = canvas;
    this.logger = logger;
    this.config = config;
    this.clock = new THREE.Clock();
    this.accumulator = 0;
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.camera = null;
    this.physics = null;
    this.entities = [];
    this.running = false;
    this.telemetry = null;
    this.playerController = null;
  }

  async init() {
    this.logger.info('Initializing engine...');

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1e9);

    this.physics = new PhysicsWorld(this.config, this.logger);

    const { entities, playerStart } = createSolarSystem({
      scene: this.scene,
      physics: this.physics,
      config: this.config,
    });
    this.entities.push(...entities);

    this.playerController = createPlayerController({
      scene: this.scene,
      camera: this.camera,
      physics: this.physics,
      config: this.config,
      logger: this.logger,
      playerStart,
    });
    this.entities.push(this.playerController.entity);

    this.telemetry = setupTelemetry({
      element: document.getElementById('telemetry'),
      engine: this,
    });

    setupDevConsole({
      element: document.getElementById('dev-console'),
      config: this.config,
      engine: this,
    });

    window.addEventListener('resize', () => this.onResize());
    this.onResize();

    this.logger.info('Engine initialized');
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  run() {
    this.running = true;
    this.clock.start();
    const loop = () => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      const frameTime = this.clock.getDelta() * this.config.time.timeScale;
      const fixedDt = this.config.time.fixedTimeStep;
      this.accumulator += Math.min(frameTime, fixedDt * this.config.time.maxSubSteps);

      while (this.accumulator >= fixedDt) {
        this.physics.step(fixedDt);
        for (const e of this.entities) {
          if (typeof e.fixedUpdate === 'function') e.fixedUpdate(fixedDt);
        }
        this.accumulator -= fixedDt;
      }

      const alpha = this.accumulator / fixedDt;
      for (const e of this.entities) {
        if (typeof e.update === 'function') e.update(frameTime, alpha);
      }

      this.renderer.render(this.scene, this.camera);
      if (this.telemetry) this.telemetry.update(frameTime);
    };
    loop();
  }
}
