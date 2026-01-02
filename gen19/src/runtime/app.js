import * as THREE from 'three';
import { Config, resetConfigToDefaults } from '../sim/config.js';
import { createLogger } from '../ui/logger.js';
import { createTelemetry } from '../ui/telemetry.js';
import { createDevMenu } from '../ui/devMenu.js';
import { createInput } from './input.js';
import { createRenderer } from './renderer.js';
import { createWorld } from '../world/world.js';
import { createCameraRig } from '../world/cameraRig.js';
import { createPlayer } from '../world/player.js';
import { createGrabSystem } from '../world/grab.js';
import { clamp } from '../util/math.js';

export function createApp(ui) {
  const logger = createLogger(ui.debugEl);
  const telemetry = createTelemetry(ui.telemetryEl);

  const state = {
    running: false,
    lastTimeMs: 0,
    accumulator: 0,
    fixedDt: 1 / 120,
    pointerLocked: false,
    menusOpen: false
  };

  let renderer;
  let scene;
  let threeCamera;
  let world;
  let input;
  let cameraRig;
  let player;
  let devMenu;
  let grab;

  function setMenusOpen(open) {
    state.menusOpen = open;
    ui.menuBlockerEl.classList.toggle('hidden', !open);

    if (open) {
      releasePointerLock();
    }
  }

  function requestPointerLock() {
    if (state.menusOpen) return;
    if (document.pointerLockElement === ui.canvas) return;
    ui.canvas.requestPointerLock({ unadjustedMovement: true }).catch(() => {
      ui.canvas.requestPointerLock().catch(() => {});
    });
  }

  function releasePointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }

  function syncPointerLockState() {
    state.pointerLocked = document.pointerLockElement === ui.canvas;
    input.setPointerLocked(state.pointerLocked);
  }

  async function init() {
    logger.installGlobalHandlers();

    try {
      renderer = createRenderer(ui.canvas);
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      input = createInput(ui.canvas);

      devMenu = createDevMenu({
        rootEl: ui.devMenuEl,
        contentEl: ui.devContentEl,
        resetBtn: ui.devResetBtn,
        closeBtn: ui.devCloseBtn,
        onOpenChanged: (open) => {
          setMenusOpen(open);
        },
        getConfig: () => Config,
        onReset: () => resetConfigToDefaults()
      });

      world = createWorld({ logger, renderer, scene });

      threeCamera = new THREE.PerspectiveCamera(
        Config.render.camera.fovDeg,
        1,
        Config.render.camera.near,
        Config.render.camera.far
      );

      cameraRig = createCameraRig({
        camera: threeCamera,
        input,
        getConfig: () => Config
      });

      player = createPlayer({
        input,
        cameraRig,
        getConfig: () => Config,
        logger
      });

      grab = createGrabSystem({
        scene,
        camera: threeCamera,
        input,
        player,
        getConfig: () => Config
      });

      world.attachPlayer(player);
      world.attachCameraRig(cameraRig);
      world.attachGrabSystem(grab);

      world.init();
      devMenu.build();

      ui.canvas.addEventListener('click', () => requestPointerLock());

      document.addEventListener('pointerlockchange', () => {
        syncPointerLockState();
      });

      window.addEventListener('resize', () => {
        const w = ui.canvas.clientWidth;
        const h = ui.canvas.clientHeight;
        threeCamera.aspect = w / Math.max(1, h);
        threeCamera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      });

      window.dispatchEvent(new Event('resize'));

      input.onKeyDown((e) => {
        if (e.code === 'Slash') {
          devMenu.toggle();
          return;
        }

        if (e.code === 'KeyT') {
          telemetry.toggle();
          return;
        }

        if (e.code === 'KeyV') {
          cameraRig.toggleThirdPerson();
          return;
        }

        if (e.code === 'KeyF') {
          player.toggleFlight();
          return;
        }
      });

      telemetry.setEnabled(Config.ui.telemetry.enabled);

      return true;
    } catch (err) {
      logger.error('Init failed', err);
      throw err;
    }
  }

  function start() {
    state.running = true;
    state.lastTimeMs = performance.now();
    requestAnimationFrame(loop);
  }

  function loop(nowMs) {
    if (!state.running) return;

    const dtSec = clamp((nowMs - state.lastTimeMs) / 1000, 0, 0.05);
    state.lastTimeMs = nowMs;

    if (!state.menusOpen) {
      state.accumulator += dtSec;
      const maxSubsteps = Config.sim.maxSubsteps;
      let steps = 0;
      while (state.accumulator >= state.fixedDt && steps < maxSubsteps) {
        world.step(state.fixedDt);
        state.accumulator -= state.fixedDt;
        steps++;
      }
    }

    const alpha = clamp(state.accumulator / state.fixedDt, 0, 1);
    world.render(alpha);

    telemetry.update({
      dtSec,
      fps: dtSec > 0 ? 1 / dtSec : 0,
      frameMs: dtSec * 1000,
      playerPos: player.getPosition(),
      playerVel: player.getVelocity(),
      activeBodyName: world.getPlayerPrimaryBodyName()
    });

    requestAnimationFrame(loop);
  }

  return {
    init,
    start
  };
}
