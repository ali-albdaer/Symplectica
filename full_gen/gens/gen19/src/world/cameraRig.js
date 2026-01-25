import * as THREE from 'three';
import { clamp, smoothDamp } from '../util/math.js';

export function createCameraRig({ camera, input, getConfig }) {
  const state = {
    focusBody: null,
    up: new THREE.Vector3(0, 1, 0),
    yaw: 0,
    pitch: 0,
    thirdPerson: false,
    thirdDistance: 6.5,
    thirdHeight: 2.2,
    thirdVelX: { value: 0 },
    thirdVelY: { value: 0 },
    thirdVelZ: { value: 0 }
  };

  function setFocus(body) {
    state.focusBody = body;
  }

  function setUpVector(up) {
    state.up.copy(up).normalize();
  }

  function toggleThirdPerson() {
    state.thirdPerson = !state.thirdPerson;
  }

  function applyLookDeltaFromInput(dt) {
    const cfg = getConfig();
    const { dx, dy } = input.consumeMouseDelta();

    const sx = cfg.input.mouseSensitivity;
    const sy = cfg.input.mouseSensitivity * (cfg.input.invertY ? -1 : 1);

    state.yaw -= dx * sx;
    state.pitch -= dy * sy;
    state.pitch = clamp(state.pitch, -1.48, 1.48);
  }

  function getForward() {
    const q = getLookQuaternion();
    return new THREE.Vector3(0, 0, -1).applyQuaternion(q).normalize();
  }

  function getRight() {
    const q = getLookQuaternion();
    return new THREE.Vector3(1, 0, 0).applyQuaternion(q).normalize();
  }

  function getForwardOnPlane(up) {
    const f = getForward();
    const p = f.clone().sub(up.clone().multiplyScalar(f.dot(up)));
    if (p.lengthSq() < 1e-8) return new THREE.Vector3(0, 0, -1);
    return p.normalize();
  }

  function update(alpha, system) {
    if (!state.focusBody) return;

    const focusPos = state.focusBody.pos;
    const q = getLookQuaternion();

    if (!state.thirdPerson) {
      camera.position.copy(focusPos).addScaledVector(state.up, getConfig().player.radiusMeters * 0.9);
      camera.quaternion.copy(q);
      camera.up.copy(state.up);
      return;
    }

    // Cinematic 3rd-person: damped spring toward desired shoulder cam.
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q).normalize();

    const desired = focusPos
      .clone()
      .addScaledVector(state.up, state.thirdHeight)
      .addScaledVector(forward, -state.thirdDistance);

    const dt = 1 / 60; // render smoothing timestep
    camera.position.x = smoothDamp(camera.position.x, desired.x, state.thirdVelX, 0.10, dt);
    camera.position.y = smoothDamp(camera.position.y, desired.y, state.thirdVelY, 0.12, dt);
    camera.position.z = smoothDamp(camera.position.z, desired.z, state.thirdVelZ, 0.10, dt);

    camera.up.copy(state.up);
    camera.lookAt(focusPos.clone().addScaledVector(state.up, state.thirdHeight * 0.65));
  }

  function getLookQuaternion() {
    // Build a local frame where "up" is the planet-up.
    const up = state.up.clone().normalize();

    // Build a basis from yaw around up.
    const yawQ = new THREE.Quaternion().setFromAxisAngle(up, state.yaw);

    // Choose a right axis from yawed forward.
    const f0 = new THREE.Vector3(0, 0, -1).applyQuaternion(yawQ);
    const right = new THREE.Vector3().crossVectors(f0, up).normalize();

    const pitchQ = new THREE.Quaternion().setFromAxisAngle(right, state.pitch);

    const q = new THREE.Quaternion().multiplyQuaternions(pitchQ, yawQ);
    return q.normalize();
  }

  return {
    camera,
    setFocus,
    setUpVector,
    toggleThirdPerson,
    applyLookDeltaFromInput,
    getForward,
    getRight,
    getForwardOnPlane,
    update
  };
}
