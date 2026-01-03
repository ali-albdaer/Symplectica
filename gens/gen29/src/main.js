import { THREE, GUI } from './vendor.js';
import { CONFIG } from './config.js';
import { ConfigStore } from './core/configStore.js';
import { DebugOverlay } from './ui/debugOverlay.js';
import { TelemetryOverlay } from './ui/telemetry.js';
import { DevMenu } from './ui/devMenu.js';
import { Input } from './core/input.js';
import { createRenderer } from './core/renderer.js';
import { World } from './physics/world.js';
import { createSolarSystem } from './entities/solarSystemFactory.js';
import { Player } from './entities/player.js';
import { createPropsNearPlayer } from './entities/propsFactory.js';
import { Cameras } from './core/cameras.js';

const canvas = document.getElementById('gfx');
const blockingOverlay = document.getElementById('blockingOverlay');
const blockingStatus = document.getElementById('blockingStatus');

const debugOverlay = new DebugOverlay(document.getElementById('debugLog'));
const telemetry = new TelemetryOverlay(document.getElementById('telemetry'));

function setBlockingStatus(text) {
  blockingStatus.textContent = text;
}

function hideBlockingOverlay() {
  blockingOverlay.classList.add('hidden');
}

function showBlockingOverlay() {
  blockingOverlay.classList.remove('hidden');
}

async function main() {
  debugOverlay.installGlobalHandlers();

  setBlockingStatus('Loading renderer…');
  const configStore = new ConfigStore(CONFIG);

  const rendererBundle = createRenderer(canvas, configStore, debugOverlay);
  const { renderer, scene, camera, clock } = rendererBundle;

  setBlockingStatus('Building world…');
  const input = new Input();
  const world = new World(configStore, debugOverlay);

  setBlockingStatus('Creating solar system…');
  const system = createSolarSystem({ THREE, configStore, scene, world, debugOverlay });

  setBlockingStatus('Spawning player…');
  const player = new Player({ THREE, configStore, scene, world, input, debugOverlay, planetAnchor: system.planet1 });

  setBlockingStatus('Spawning props…');
  createPropsNearPlayer({ THREE, configStore, scene, world, player });

  setBlockingStatus('Setting up cameras…');
  const cameras = new Cameras({ THREE, configStore, renderer, scene, baseCamera: camera, player, input });

  setBlockingStatus('Setting up UI…');
  const devMenu = new DevMenu({ GUI, configStore, world, system, player, input, debugOverlay });
  telemetry.bind({ configStore, world, player });

  // Cursor / pointer lock logic.
  const pointerLock = {
    wantsLock: false,
    get locked() {
      return document.pointerLockElement === canvas;
    },
    lock() {
      if (!devMenu.isOpen && !debugOverlay.isOverlayInteractive) {
        canvas.requestPointerLock();
      }
    },
    unlock() {
      if (document.pointerLockElement) document.exitPointerLock();
    },
  };

  blockingOverlay.addEventListener('click', () => {
    pointerLock.lock();
  });

  document.addEventListener('pointerlockchange', () => {
    if (pointerLock.locked) hideBlockingOverlay();
    else showBlockingOverlay();
  });

  input.onKeyPressed('/', () => {
    devMenu.toggle();
    if (devMenu.isOpen) pointerLock.unlock();
  });

  input.onKeyPressed('t', () => {
    configStore.patch('debug.showTelemetry', !configStore.get('debug.showTelemetry'));
  });

  input.onKeyPressed('l', () => {
    configStore.patch('debug.showDebugLog', !configStore.get('debug.showDebugLog'));
  });

  input.onKeyPressed('v', () => {
    cameras.toggleMode();
  });

  input.onKeyPressed('f', () => {
    player.toggleFlight();
  });

  input.attach();

  // Render loop: fixed-step simulation + interpolated render.
  let accumulator = 0;
  const fixedDt = configStore.get('sim.fixedDt');

  setBlockingStatus('Ready. Click to start.');

  function frame() {
    requestAnimationFrame(frame);

    const realDt = Math.min(clock.getDelta(), 0.05);
    const timeScale = configStore.get('sim.timeScale');
    const simDt = realDt * timeScale;
    accumulator += simDt;

    // Keep UI updated even when paused.
    debugOverlay.setVisible(configStore.get('debug.showDebugLog'));
    telemetry.setVisible(configStore.get('debug.showTelemetry'));

    // If pointer lock not active, freeze simulation (safe debugging).
    if (document.pointerLockElement !== canvas) {
      cameras.update(0);
      renderer.render(scene, cameras.activeCamera);
      telemetry.update(0, 0);
      return;
    }

    let steps = 0;
    const maxSteps = 6;
    while (accumulator >= fixedDt && steps < maxSteps) {
      world.step(fixedDt);
      player.fixedUpdate(fixedDt);
      cameras.fixedUpdate(fixedDt);
      accumulator -= fixedDt;
      steps++;
    }

    const alpha = fixedDt > 0 ? accumulator / fixedDt : 0;
    world.syncVisuals(alpha);
    player.syncVisuals(alpha);
    cameras.update(realDt);

    renderer.render(scene, cameras.activeCamera);

    telemetry.update(realDt, steps);
  }

  frame();
}

main().catch((err) => {
  // Last-resort: never hang silently.
  const el = document.getElementById('debugLog');
  el.classList.remove('hidden');
  el.textContent = `Fatal init error:\n${err?.stack || err}`;
});
