import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { Config } from './Config.js';
import { NBodySystem } from './NBodySystem.js';
import { CelestialBody } from './entities/CelestialBody.js';
import { UIManager } from './UIManager.js';
import { PhysicsWorld } from './PhysicsWorld.js';
import { Player } from './entities/Player.js';
import { MicroObjects } from './entities/MicroObjects.js';

export class Engine {
  constructor({ container, telemetryEl, blockerEl, startBtn, debug }) {
    this.container = container;
    this.telemetryEl = telemetryEl;
    this.blockerEl = blockerEl;
    this.startBtn = startBtn;
    this.debug = debug;

    this.renderer = null;
    this.scene = null;
    this.camera = null;

    this.clock = new THREE.Clock();
    this._accumulator = 0;

    this.nbody = new NBodySystem();
    this.physics = null;
    this.ui = null;

    this.entities = [];
    this.celestials = new Map();

    this.sunLight = null;

    this._raf = 0;
  }

  async init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(70, 1, 0.05, 2000);
    this.camera.position.set(0, 3, 12);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = Config.render.exposure;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => this._onResize());
    this._onResize();

    // Sun-only point light (no ambient)
    this.sunLight = new THREE.PointLight(0xffffff, 1500, 0, 2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.bias = -0.00002;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);

    // Fidelity depends on renderer + light
    this._applyFidelity();

    // Minimal stars backdrop using points (optional)
    if (Config.render.backgroundStars) {
      this.scene.add(this._makeStarField());
    }

    // N-body initialization from Config
    this._initNBodyFromConfig();

    // Physics world for player + micro objects (and colliders for planets)
    this.physics = new PhysicsWorld({ debug: this.debug });
    this.physics.init();

    // Create celestial entities + sync colliders
    this._spawnCelestialEntities();

    // Player
    const player = new Player({
      camera: this.camera,
      domElement: this.renderer.domElement,
      physics: this.physics,
      nbody: this.nbody,
      getCelestial: (id) => this.celestials.get(id) || null,
      debug: this.debug,
    });
    player.init({
      spawnTargetId: Config.player.spawnAbovePlanet,
    });

    this.entities.push(player);

    // UI manager (dev console + telemetry + pointer lock)
    this.ui = new UIManager({
      rendererDom: this.renderer.domElement,
      telemetryEl: this.telemetryEl,
      blockerEl: this.blockerEl,
      startBtn: this.startBtn,
      camera: this.camera,
      debug: this.debug,
      engine: this,
      player,
    });
    await this.ui.init();

    // Micro objects near spawn
    this.physics.spawnMicroObjectsNear(player.getPosition(), Config.micro);

    const micro = new MicroObjects({ scene: this.scene, physics: this.physics });
    micro.init();
    this.entities.push(micro);
  }

  start() {
    this.clock.start();
    const tick = () => {
      this._raf = requestAnimationFrame(tick);
      this._frame();
    };
    tick();
  }

  stop() {
    cancelAnimationFrame(this._raf);
  }

  _frame() {
    const dtReal = Math.min(this.clock.getDelta(), 1 / 30);
    const dt = dtReal * Config.sim.timeScale;

    // Fixed-step simulation for stability
    this._accumulator += dt;
    const fixed = Config.sim.fixedTimeStep;

    let subSteps = 0;
    while (this._accumulator >= fixed && subSteps < Config.sim.maxSubSteps) {
      this._stepFixed(fixed);
      this._accumulator -= fixed;
      subSteps++;
    }

    // Render
    this.renderer.render(this.scene, this.camera);

    // UI
    if (this.ui) this.ui.postRender(dtReal);
  }

  _stepFixed(dt) {
    // 1) N-body
    this.nbody.step(dt);

    // Keep light at the Sun
    const sun = this.nbody.getBody('sun');
    if (sun) this.sunLight.position.copy(sun.position);

    // 2) Sync celestial visuals
    for (const e of this.entities) {
      if (e.enabled) e.update({ dt });
    }
    for (const [, c] of this.celestials) {
      c.update({ dt });
    }

    // 3) Update planet colliders in physics
    this.physics.syncCelestialColliders(this.nbody, Config.bodies);

    // 4) Physics step
    this.physics.step(dt, {
      nbody: this.nbody,
      bodiesConfig: Config.bodies,
    });
  }

  _initNBodyFromConfig() {
    const b = Config.bodies;

    // Sun
    this.nbody.addBody({
      id: 'sun',
      mass: b.sun.mass,
      position: new THREE.Vector3(b.sun.initialPosition.x, b.sun.initialPosition.y, b.sun.initialPosition.z),
      velocity: new THREE.Vector3(b.sun.initialVelocity.x, b.sun.initialVelocity.y, b.sun.initialVelocity.z),
    });

    // Planet A/B
    for (const id of ['planetA', 'planetB']) {
      const cfg = b[id];
      this.nbody.addBody({
        id,
        mass: cfg.mass,
        position: new THREE.Vector3(cfg.initialPosition.x, cfg.initialPosition.y, cfg.initialPosition.z),
        velocity: new THREE.Vector3(cfg.initialVelocity.x, cfg.initialVelocity.y, cfg.initialVelocity.z),
      });
    }

    // Moon relative to planetA
    const moonCfg = b.moon;
    const primary = this.nbody.getBody(moonCfg.initialRelativeTo);
    if (!primary) throw new Error(`Moon primary '${moonCfg.initialRelativeTo}' not found`);

    const moonPos = primary.position.clone().add(new THREE.Vector3(moonCfg.initialOffset.x, moonCfg.initialOffset.y, moonCfg.initialOffset.z));
    const moonVel = primary.velocity.clone().add(new THREE.Vector3(moonCfg.initialRelativeVelocity.x, moonCfg.initialRelativeVelocity.y, moonCfg.initialRelativeVelocity.z));

    this.nbody.addBody({
      id: 'moon',
      mass: moonCfg.mass,
      position: moonPos,
      velocity: moonVel,
    });

    // Center-of-mass correction (keeps system from drifting)
    this._removeNetLinearMomentum();
  }

  _removeNetLinearMomentum() {
    let totalMass = 0;
    const P = new THREE.Vector3();

    for (const b of this.nbody.bodies) {
      totalMass += b.mass;
      P.add(b.velocity.clone().multiplyScalar(b.mass));
    }

    if (totalMass <= 0) return;
    const vcm = P.multiplyScalar(1 / totalMass);
    for (const b of this.nbody.bodies) b.velocity.sub(vcm);
  }

  _spawnCelestialEntities() {
    const makeLodMesh = this._makeLodFactory();

    for (const id of Object.keys(Config.bodies)) {
      const cfg = Config.bodies[id];
      const c = new CelestialBody({ id, config: cfg, nbody: this.nbody, scene: this.scene });
      c.init({ makeLodMesh });
      this.celestials.set(id, c);

      // Create physics collider shells for all bodies (for player/object collisions)
      this.physics.ensureCelestialCollider(id, cfg.radius);
    }
  }

  _makeLodFactory() {
    const getSegments = () => {
      switch (Config.sim.fidelity) {
        case 'Low': return { hi: 20, mid: 12, low: 8 };
        case 'Ultra': return { hi: 64, mid: 32, low: 16 };
        case 'Medium':
        default: return { hi: 36, mid: 20, low: 12 };
      }
    };

    return ({ radius, color }) => {
      const seg = getSegments();
      const lod = new THREE.LOD();

      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 1.0,
        metalness: 0.0,
      });

      const hi = new THREE.Mesh(new THREE.SphereGeometry(radius, seg.hi, seg.hi), mat);
      const mid = new THREE.Mesh(new THREE.SphereGeometry(radius, seg.mid, seg.mid), mat);
      const low = new THREE.Mesh(new THREE.SphereGeometry(radius, seg.low, seg.low), mat);

      lod.addLevel(hi, 0);
      lod.addLevel(mid, radius * 10);
      lod.addLevel(low, radius * 25);

      return lod;
    };
  }

  _makeStarField() {
    const count = 2500;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 800 + Math.random() * 700;
      const theta = Math.random() * Math.PI * 2;
      const u = Math.random() * 2 - 1;
      const phi = Math.acos(u);

      positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.0,
      sizeAttenuation: true,
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    return pts;
  }

  _applyFidelity() {
    const f = Config.sim.fidelity;
    const enableShadows = Config.render.shadows;

    this.renderer.shadowMap.enabled = !!enableShadows;

    if (Config.render.shadowMapType === 'Basic') this.renderer.shadowMap.type = THREE.BasicShadowMap;
    if (Config.render.shadowMapType === 'PCF') this.renderer.shadowMap.type = THREE.PCFShadowMap;
    if (Config.render.shadowMapType === 'PCFSoft') this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Shadow quality by fidelity
    const shadowSize = f === 'Ultra' ? 2048 : f === 'Medium' ? 1024 : 512;
    if (this.sunLight) this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);

    // Resolution scaling by fidelity
    const pixelRatioCap = f === 'Ultra' ? 2.0 : f === 'Medium' ? 1.5 : 1.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
  }

  onConfigChanged() {
    // Called by UI when Config changes
    if (!this.renderer || !this.sunLight) return;
    this.renderer.toneMappingExposure = Config.render.exposure;
    this._applyFidelity();
  }

  _onResize() {
    if (!this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = Math.max(0.001, w / Math.max(1, h));
    this.camera.updateProjectionMatrix();
  }
}
