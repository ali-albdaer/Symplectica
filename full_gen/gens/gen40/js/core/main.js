import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { Config, setFidelity } from './config.js';
import { State } from './state.js';
import { initRenderer } from '../rendering/renderer.js';
import { initLighting } from '../rendering/lighting.js';
import { initSky } from '../rendering/sky.js';
import { updateLOD } from '../rendering/lod.js';
import { initPhysicsWorld, stepPhysics } from '../physics/physicsWorld.js';
import { createSolarSystem } from '../entities/solarSystemFactory.js';
import { createPlayer } from '../entities/player.js';
import { spawnMicroObjectsAroundPlayer } from '../entities/microObjects.js';
import { initInput } from '../input/inputManager.js';
import { initTelemetry } from '../ui/telemetry.js';
import { initDebugLog, logError } from '../ui/debugLog.js';
import { initDevConsole } from '../ui/devConsole.js';
import { initSettingsMenu } from '../ui/settingsMenu.js';

let lastFrameTime = performance.now();
let accumulator = 0;

async function bootstrap() {
  const loading = document.getElementById('loading-screen');
  try {
    initDebugLog();
    appendDebug('[main] Bootstrapping application...');

    setFidelity(Config.rendering.fidelity);

    const canvas = document.getElementById('webgl-canvas');

    await initRenderer(canvas);
    await initPhysicsWorld();

    createSolarSystem();
    createPlayer();
    spawnMicroObjectsAroundPlayer();

    initLighting();
    initSky();

    initTelemetry();
    initSettingsMenu(setFidelity);
    initDevConsole();

    initInput(canvas);

    window.addEventListener('resize', onWindowResize);

    State.clock = new THREE.Clock();

    loading.style.display = 'none';
    appendDebug('[main] Initialization complete. Starting loop.');

    requestAnimationFrame(loop);
  } catch (e) {
    console.error(e);
    logError('[main] Fatal error during bootstrap', e);
    loading.textContent = 'Failed to initialize. Check debug log.';
  }
}

function appendDebug(msg) {
  if (!window.__DEBUG_OVERLAY__) return;
  window.__DEBUG_OVERLAY__.addLine(msg);
}

function loop(now) {
  requestAnimationFrame(loop);

  const dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;

  const { fixedTimeStep, substeps, timeScale } = Config.physics;
  let stepDt = fixedTimeStep;
  accumulator += dt * timeScale;

  const maxSubsteps = substeps * 4;
  let steps = 0;
  while (accumulator >= fixedTimeStep && steps < maxSubsteps) {
    stepPhysics(stepDt);
    if (State.player && State.player.updatePhysics) {
      State.player.updatePhysics(stepDt);
    }
    accumulator -= fixedTimeStep;
    steps++;
  }

  if (State.input && State.input.update) {
    State.input.update(dt);
  }
  if (State.player && State.player.updateRender) {
    State.player.updateRender(dt);
  }
  if (State.sky && State.sky.update) {
    State.sky.update(dt);
  }
  if (State.ui.telemetry && State.ui.telemetry.update) {
    State.ui.telemetry.update(dt);
  }

  updateLOD();

  if (State.renderer && State.scene && State.camera) {
    State.renderer.render(State.scene, State.camera);
  }
}

function onWindowResize() {
  if (!State.renderer || !State.camera) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  State.renderer.setSize(width, height);
  State.camera.aspect = width / height;
  State.camera.updateProjectionMatrix();
}

window.addEventListener('error', (event) => {
  logError('[window.onerror]', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  logError('[window.unhandledrejection]', event.reason);
});

bootstrap();
