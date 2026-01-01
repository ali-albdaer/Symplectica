import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164/build/three.module.js';
import { Config } from './Config.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { CelestialBody } from './CelestialBody.js';
import { Player } from './Player.js';
import { Input } from './Input.js';
import { UIManager } from './UIManager.js';
import { vec3FromArray, formatVector } from './Utils.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

export class Engine {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010104);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.camera.position.set(0, 2, 10);

    this.clock = new THREE.Clock();
    this.ui = new UIManager();
    this.input = new Input(this.renderer.domElement);
    this.physics = new PhysicsWorld();
    this.celestials = [];
    this.microMeshes = [];

    this._bindEvents();
    this._initScene();

    this.frameCount = 0;
    this.accumTime = 0;
    this.fps = 0;
  }

  _bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Slash') {
        this.ui.toggleConsole();
        this._maybeReleasePointer();
      }
      if (e.code === 'Backslash') this.ui.toggleDebug();
      if (e.code === 'KeyM') this._toggleMenu();
      if (e.code === 'KeyF') this.player.toggleMode();
      if (e.code === 'KeyV') this.player.toggleCamera();
      if (e.code === 'Digit1') this._setFidelity('low');
      if (e.code === 'Digit2') this._setFidelity('medium');
      if (e.code === 'Digit3') this._setFidelity('ultra');
    });

    this.ui.resumeBtn.onclick = () => this._toggleMenu();
    this.ui.fidelityBtn.onclick = () => {
      const next = this._cycleFidelity();
      this.ui.fidelityBtn.textContent = `Fidelity: ${next}`;
    };

    this.input.onLockChange = (locked) => {
      if (!locked && this.ui.menuVisible === false && this.ui.consoleVisible === false) {
        // Leave pointer unlocked if menu/console not visible
      }
    };
  }

  _toggleMenu() {
    const visible = this.ui.toggleMenu(Config.fidelity);
    if (visible) {
      document.exitPointerLock();
    } else {
      this.renderer.domElement.requestPointerLock();
    }
  }

  _maybeReleasePointer() {
    if (this.ui.consoleVisible) {
      document.exitPointerLock();
    }
  }

  _cycleFidelity() {
    const order = ['auto', 'low', 'medium', 'ultra'];
    const idx = order.indexOf(Config.fidelity);
    const next = order[(idx + 1) % order.length];
    this._setFidelity(next);
    return next;
  }

  _setFidelity(level) {
    Config.fidelity = level;
    const pixelRatio = level === 'low' ? 0.7 : level === 'medium' ? 1 : level === 'ultra' ? 1.25 : window.devicePixelRatio;
    this.renderer.setPixelRatio(pixelRatio);
    const shadowMap = level === 'low' ? 512 : level === 'medium' ? 1024 : 2048;
    this.renderer.shadowMap.enabled = level !== 'low';
    this.renderer.shadowMap.needsUpdate = true;
    for (const light of this.scene.children.filter((c) => c.isLight)) {
      light.shadow.mapSize.set(shadowMap, shadowMap);
    }
  }

  _initScene() {
    try {
      const { sun, planetA, planetB, moon } = Config.bodies;
      const sunBody = new CelestialBody(sun, this.scene, this.physics);
      const planetABody = new CelestialBody(planetA, this.scene, this.physics);
      const planetBBody = new CelestialBody(planetB, this.scene, this.physics);
      const moonBody = new CelestialBody(moon, this.scene, this.physics);

      // Moon inherits parent planet's orbital velocity for stability
      moonBody.body.velocity.vadd(planetABody.body.velocity, moonBody.body.velocity);

      this.celestials.push(sunBody, planetABody, planetBBody, moonBody);
      this.celestials.forEach((c) => this.physics.addBody(c));

      this._buildMicro();

      this.player = new Player(this.scene, this.camera, this.physics, this.input);
      this._setFidelity(Config.fidelity);
    } catch (err) {
      this.ui.toggleDebug();
      this.ui.log(`Scene init failed: ${err.message}`);
      throw err;
    }
  }

  _buildMicro() {
    const material = new THREE.MeshStandardMaterial({ color: 0xa0a6b3, roughness: 0.8, metalness: 0.1 });
    for (const obj of Config.microObjects) {
      const geo = new THREE.BoxGeometry(obj.size, obj.size, obj.size);
      const mesh = new THREE.Mesh(geo, material.clone());
      mesh.material.color.set(obj.color);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.fromArray(obj.position);
      this.scene.add(mesh);
      this.microMeshes.push(mesh);

      const shape = new CANNON.Box(new CANNON.Vec3(obj.size * 0.5, obj.size * 0.5, obj.size * 0.5));
      const body = new CANNON.Body({ mass: obj.mass, shape, position: new CANNON.Vec3(...obj.position) });
      body.velocity = new CANNON.Vec3(...obj.velocity);
      this.physics.world.addBody(body);
      this.physics.addMicro(body);
      mesh.userData.body = body;
    }
  }

  start() {
    this.renderer.setAnimationLoop(() => this._tick());
  }

  _tick() {
    const dt = this.clock.getDelta() * Config.timeScale;
    const fixed = 1 / 60;
    const subSteps = Config.physicsSteps;
    for (let i = 0; i < subSteps; i++) {
      this.physics.step(fixed / subSteps);
    }

    for (const celestial of this.celestials) celestial.syncGraphics();
    for (let i = 0; i < this.microMeshes.length; i++) {
      const mesh = this.microMeshes[i];
      const body = mesh.userData.body;
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);
    }

    this.player.update(dt, this.celestials, this.physics.microBodies);

    this.renderer.render(this.scene, this.camera);

    this.frameCount++;
    this.accumTime += dt;
    if (this.accumTime >= 0.25) {
      this.fps = this.frameCount / this.accumTime;
      this.frameCount = 0;
      this.accumTime = 0;
    }

    this.ui.updateTelemetry({
      fps: this.fps,
      frameTime: dt * 1000,
      worldPos: formatVector(this.camera.position),
      playerText: this.player.telemetry(),
    });
  }
}
