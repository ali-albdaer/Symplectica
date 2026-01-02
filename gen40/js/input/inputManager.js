import { State } from '../core/state.js';
import { pickObject } from '../entities/interaction.js';

export function initInput(canvas) {
  const input = {
    keys: {},
    keysPressed: {},
    mouseDelta: { x: 0, y: 0 },
    pointerLocked: false,
    update: updateInput
  };

  State.input = input;

  const onKeyDown = (e) => {
    input.keys[e.code] = true;
    if (e.code === 'Space') input.keysPressed['Space'] = true;

    if (e.code === 'KeyF' && State.player) {
      State.player.toggleMode();
    }
    if (e.code === 'KeyV' && State.player) {
      State.player.toggleView();
    }
    if (e.code === 'Slash') {
      toggleDevConsole();
    }
  };

  const onKeyUp = (e) => {
    input.keys[e.code] = false;
  };

  const onMouseMove = (e) => {
    if (!input.pointerLocked) return;
    const cam = State.camera;
    if (!cam) return;
    const sensitivity = 0.0025;
    cam.rotation.y -= e.movementX * sensitivity;
    cam.rotation.x -= e.movementY * sensitivity;
    cam.rotation.x = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, cam.rotation.x));
  };

  const raycaster = new THREE.Raycaster();

  const onMouseDown = (e) => {
    if (e.button === 2) {
      e.preventDefault();
      if (!State.player) return;
      if (State.player._heldObject) {
        State.player.releaseGrab();
        return;
      }
      const cam = State.camera;
      if (!cam) return;
      raycaster.setFromCamera({ x: 0, y: 0 }, cam);
      const target = pickObject(raycaster, State.rigidBodies || []);
      if (target) {
        State.player.tryGrab(target.body || target);
      }
    }
  };

  canvas.addEventListener('click', () => {
    if (!input.pointerLocked && !isAnyOverlayActive()) {
      canvas.requestPointerLock();
    }
  });

  document.addEventListener('pointerlockchange', () => {
    input.pointerLocked = document.pointerLockElement === canvas;
  });

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
}

function updateInput(dt) {
  if (State.player && State.input) {
    State.player.updateFromInput(State.input, dt);
  }
}

function isAnyOverlayActive() {
  const dev = document.getElementById('dev-console');
  const settings = document.getElementById('settings-menu');
  return !dev.classList.contains('hidden') || !settings.classList.contains('hidden');
}

function toggleDevConsole() {
  const dev = document.getElementById('dev-console');
  const wasHidden = dev.classList.contains('hidden');
  if (wasHidden) {
    dev.classList.remove('hidden');
    if (document.pointerLockElement) document.exitPointerLock();
  } else {
    dev.classList.add('hidden');
  }
}

// Expose a simple toggle for telemetry and settings via keys handled here.
window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyT') {
    const root = document.getElementById('telemetry');
    const visible = !root.classList.contains('hidden');
    if (visible) root.classList.add('hidden');
    else root.classList.remove('hidden');
  }
  if (e.code === 'KeyP') {
    const settings = document.getElementById('settings-menu');
    const wasHidden = settings.classList.contains('hidden');
    if (wasHidden) {
      settings.classList.remove('hidden');
      if (document.pointerLockElement) document.exitPointerLock();
    } else {
      settings.classList.add('hidden');
    }
  }
});
