import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { CONFIG } from "./Config.js";
import { EventBus } from "./core/EventBus.js";
import { Logger } from "./core/Logger.js";
import { FidelityManager } from "./core/FidelityManager.js";
import { PhysicsEngine } from "./physics/PhysicsEngine.js";
import { CelestialBody } from "./entities/CelestialBody.js";
import { InteractiveObject } from "./entities/InteractiveObject.js";
import { SpecialEntityRegistry } from "./entities/SpecialEntityRegistry.js";
import { PlayerController } from "./player/PlayerController.js";
import { CameraRig } from "./player/CameraRig.js";
import { PointerLockManager } from "./ui/PointerLockManager.js";
import { DevConsole } from "./ui/DevConsole.js";
import { TelemetryOverlay } from "./ui/TelemetryOverlay.js";

const eventBus = new EventBus();
const logger = new Logger();
const telemetry = new TelemetryOverlay({});
const clock = new THREE.Clock();
let fidelityManager;
let playerController;
let cameraRig;
let celestialEntities = [];
let interactiveObjects = [];
let specialEntities = [];
let physicsEngine;
let scene;
let renderer;
let camera;
let pointerLockManager;
let frustumCullingEnabled = CONFIG.optimization?.frustumCulling ?? false;
let playerAvatar;

async function bootstrap() {
  try {
    setupScene();
    setupPhysics();
    setupEntities();
    setupPlayer();
    setupUI();
    bindGlobalHotkeys();
    bindConfigReloads();
    animate();
  } catch (error) {
    logger.show();
    logger.log(`Bootstrap failure: ${error.message}`, "error");
  }
}

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020817);

  camera = new THREE.PerspectiveCamera(74, window.innerWidth / window.innerHeight, 0.1, 6000);
  camera.position.set(0, 25, 180);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.physicallyCorrectLights = true;
  document.getElementById("app-root").appendChild(renderer.domElement);

  pointerLockManager = new PointerLockManager({ canvas: renderer.domElement });
  fidelityManager = new FidelityManager({ renderer, config: CONFIG, eventBus, THREE });
  fidelityManager.apply(CONFIG.defaultFidelity);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function setupPhysics() {
  physicsEngine = new PhysicsEngine({ config: CONFIG, logger, eventBus });
  physicsEngine.init();
}

function setupEntities() {
  specialEntities = [];
  celestialEntities = physicsEngine.celestialBodies
    .filter((entry) => {
      if (!entry) {
        logger.log("Physics engine returned an empty celestial entry; skipping.", "error");
        return false;
      }
      return true;
    })
    .map((entry) => {
      const definition = entry.def || CONFIG.celestialBodies.find((body) => body.id === entry.id);
      if (!entry.def && definition) {
        logger.log(`Rebinding config definition for ${entry.id}`, "error");
      }
      if (!definition) {
        throw new Error(`Missing definition for celestial body ${entry.id ?? "unknown"}`);
      }
      return new CelestialBody({ THREE, definition, physicsEntry: entry, scene });
    });
  celestialEntities.forEach((entity) => {
    entity.mesh.frustumCulled = frustumCullingEnabled;
  });
  interactiveObjects = physicsEngine.microObjects.map(
    (entry) => new InteractiveObject({ THREE, definition: entry.def, physicsEntry: entry, scene })
  );

  const sunEntity = celestialEntities.find((entity) => entity.definition.type === "star");
  if (sunEntity) {
    const sunLight = new THREE.PointLight(0xfff4d8, 4.5, 0, 2);
    sunLight.castShadow = true;
    const fidelitySettings =
      CONFIG.fidelityLevels[fidelityManager.level] || CONFIG.fidelityLevels[CONFIG.defaultFidelity];
    sunLight.shadow.mapSize.set(fidelitySettings.shadowMapSize, fidelitySettings.shadowMapSize);
    const luminosity = sunEntity.definition.luminosity ?? 1;
    sunLight.intensity = 1400 * luminosity;
    sunLight.power = 5200 * luminosity;
    sunLight.decay = 1.3;
    sunLight.distance = 0;
    sunLight.shadow.bias = -0.00015;
    sunLight.position.copy(sunEntity.mesh.position);
    scene.add(sunLight);
  }

  const registry = new SpecialEntityRegistry();
  registry.register("blackhole", ({ definition }) => {
    const shader = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x0d1b2a) },
        time: { value: 0 },
      },
      vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `varying vec3 vPos; uniform vec3 color; uniform float time; void main(){ float ripple = sin(length(vPos)*4.0 - time*2.0); float alpha = smoothstep(1.0,0.0,length(vPos)); gl_FragColor = vec4(color * (1.0 + 0.2*ripple), alpha); }`,
      transparent: true,
    });
    const geometry = new THREE.SphereGeometry(definition.radius, 48, 48);
    const mesh = new THREE.Mesh(geometry, shader);
    mesh.position.set(definition.position.x, definition.position.y, definition.position.z);
    scene.add(mesh);
    const entry = physicsEngine.addSpecialBody({
      ...definition,
      initialPosition: definition.position,
      initialVelocity: definition.initialVelocity || { x: 0, y: 0, z: 0 },
    });
    return { mesh, entry, shader };
  });

  CONFIG.specialEntities.forEach((definition) => {
    try {
      const created = registry.create(definition.type, { THREE, scene, definition });
      specialEntities.push(created);
    } catch (error) {
      logger.log(`Special entity failed: ${definition.id} (${error.message})`, "error");
    }
  });
}

function setupPlayer() {
  playerController = new PlayerController({
    camera,
    physicsEngine,
    config: CONFIG,
    eventBus,
    pointerLockManager,
    logger,
  });
  playerController.setInteractiveObjects(interactiveObjects);
  cameraRig = new CameraRig({ camera, eventBus });

  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f4ff, metalness: 0.1, roughness: 0.6 });
  playerAvatar = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 1.8, 8, 16), bodyMaterial);
  playerAvatar.castShadow = true;
  playerAvatar.receiveShadow = true;
  scene.add(playerAvatar);
}

function setupUI() {
  new DevConsole({ config: CONFIG, eventBus, pointerLockManager });
}

function bindGlobalHotkeys() {
  window.addEventListener("keydown", (event) => {
    if (event.code === "KeyT") {
      telemetry.toggle();
    }
    if (event.code === "Digit1") {
      fidelityManager.apply("low");
    }
    if (event.code === "Digit2") {
      fidelityManager.apply("medium");
    }
    if (event.code === "Digit3") {
      fidelityManager.apply("ultra");
    }
    if (event.code === "KeyO") {
      frustumCullingEnabled = !frustumCullingEnabled;
      celestialEntities.forEach((entity) => (entity.mesh.frustumCulled = frustumCullingEnabled));
      logger.log(`Frustum culling => ${frustumCullingEnabled ? "ON" : "OFF"}`);
    }
  });
}

function bindConfigReloads() {
  eventBus.on("config:celestial:updated", () => {
    logger.log("Rebuilding celestial system with new parameters...");
    reloadCelestialSystem();
  });
}

function reloadCelestialSystem() {
  celestialEntities.forEach((entity) => scene.remove(entity.mesh));
  interactiveObjects.forEach((obj) => scene.remove(obj.mesh));
  specialEntities.forEach((entity) => entity?.mesh && scene.remove(entity.mesh));
  celestialEntities = [];
  interactiveObjects = [];
  specialEntities = [];
  physicsEngine.init();
  if (playerController?.body) {
    physicsEngine.registerPlayerBody(playerController.body);
  }
  setupEntities();
  playerController?.setInteractiveObjects(interactiveObjects);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta() * CONFIG.timeScale;
  physicsEngine.step(delta);
  playerController.update(delta);
  const pose = playerController.getPose();
  cameraRig.update(delta, pose);
  const fidelitySettings = CONFIG.fidelityLevels[fidelityManager.level];
  celestialEntities.forEach((entity) => entity.update(delta, { camera, lodEnabled: fidelitySettings.lodEnabled }));
  interactiveObjects.forEach((object) => object.update(delta));
  if (playerAvatar) {
    playerAvatar.position.copy(pose.position);
    playerAvatar.quaternion.copy(pose.quaternion);
    playerAvatar.visible = cameraRig.mode !== "first";
  }
  specialEntities.forEach((entity) => {
    if (entity.shader?.uniforms?.time) {
      entity.shader.uniforms.time.value += delta;
    }
    if (entity.entry?.body) {
      entity.mesh.position.copy(entity.entry.body.position);
    }
  });
  telemetry.update({ delta, position: pose.position });
  renderer.render(scene, camera);
}

bootstrap();
